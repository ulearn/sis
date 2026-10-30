import { PrismaClient, DocumentStatus } from '../generated/prisma/client';
import crypto from 'crypto';
import QRCode from 'qrcode';
import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { sendEmail } from './email';
import { deriveIlepCode } from './ilep-deriver';
import { irishPublicHolidays } from './irish-holidays';
import { emailTemplateWhere } from './email-templates';

const BASE_URL = process.env.BASE_URL || 'https://sis.ulearnschool.com';
const PUBLIC_DIR = path.resolve(__dirname, '../../public');

// Cover-email signature, appended to the body before the Gmail send. Same file
// the route used to read; lives here now so sendDocument() is self-contained
// (callable straight from node on the box, not just via the HTTP route).
const DOC_SIGNATURE_PATH = path.join(__dirname, '..', '..', '.claude', 'docs', 'Email Templates', 'signature.html');
const DOC_SIGNATURE_HTML = fs.existsSync(DOC_SIGNATURE_PATH) ? fs.readFileSync(DOC_SIGNATURE_PATH, 'utf-8') : '';

// ── GROSS RECEIPT renderer (shared, on-demand) ──────────────────────────────
// Pure display layer over the HubSpot invoice — NO maths here. Reads gross
// (hs_subtotal), line items and number verbatim from the invoice and fills the
// "Net-to-Gross-Invoice" template. The invoice billed NET; this re-presents it
// at GROSS (commission left in, never shown). Receipt → paid invoices only.
// Generated on demand each call; nothing is stored. Used by BOTH the SIS route
// (/documents/net-to-gross) and the agency-scoped partner endpoint.
export async function buildGrossReceiptHtml(
  prisma: PrismaClient, bookingId: number, opts: { requirePayment?: boolean } = {},
): Promise<{ ok: true; html: string; number: string; gross: number } | { ok: false; code: number; error: string }> {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { student: true, agency: true, payments: { select: { amount: true, type: true, method: true } } },
  });
  if (!booking) return { ok: false, code: 404, error: 'Booking not found' };
  if (!booking.hubspotInvoiceId) return { ok: false, code: 400, error: 'No HubSpot invoice on this booking — the gross receipt is generated from the invoice.' };

  const TOKEN = process.env.ACCESS_TOKEN;
  const base = 'https://api.hubapi.com';
  const H = { Authorization: 'Bearer ' + TOKEN, 'Content-Type': 'application/json' };
  const esc = (s: any) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const eur = (n: number) => `€${(Number(n) || 0).toFixed(2)}`;

  const inv: any = await fetch(`${base}/crm/v3/objects/invoices/${booking.hubspotInvoiceId}?properties=hs_number,hs_subtotal,hs_amount_billed,hs_balance_due,hs_invoice_status,hs_invoice_date,hs_payment_date`, { headers: H }).then(r => r.json());
  const ip = inv?.properties;
  if (!ip) return { ok: false, code: 404, error: 'HubSpot invoice not found' };
  const gross = parseFloat(ip.hs_subtotal || '0');

  // Receipt gate = ANY money received (settled OR held in escrow). A receipt is
  // meaningful the moment funds arrive: a deposit, a partial payment, or a
  // visa-required (VBD) student's full fee paid into TransferMate escrow (held
  // until the immigration decision — which is why HubSpot still shows a balance
  // due but the student HAS paid and needs the receipt for the embassy). Escrow
  // funds count as received-into-escrow. Only a genuinely unpaid invoice (€0
  // received) has no receipt to produce. Finer role/permission granularity is a
  // later concern (Neil, 2026-08-26).
  const settled = Number(booking.amountPaid || 0);
  const escrowHeld = (booking.payments || [])
    .filter(p => p.type === 'Escrow' || /escrow/i.test(p.method || ''))
    .reduce((sum, p) => sum + Number(p.amount || 0), 0);
  const received = settled + escrowHeld;
  // Staff-ISSUED receipt (opts.requirePayment) keeps the payment gate — an issued,
  // sendable receipt document implies money was received. The partner DISPLAY doc
  // (default, un-gated) renders the pre-payment invoice too.
  if (opts.requirePayment && received <= 0.01) {
    return { ok: false, code: 400, error: 'No payment received on this booking yet — there is nothing to receipt.' };
  }
  // NO payment gate for the display doc (Neil, 2026-08-31): this is ONE living document that mirrors
  // HubSpot — a GROSS INVOICE the partner can show the student BEFORE they pay,
  // which then gets a "PAID" stamp and becomes the receipt once payment is
  // assigned. So it renders at every state: unpaid gross invoice (Balance Due =
  // gross); part-paid; escrow-held; paid-in-full = PAID receipt.
  //
  // "Paid in full" is read from the INVOICE'S OWN settlement (HubSpot status /
  // balance-due), NOT from received-vs-gross: an agency booking is billed NET
  // (after commission), so the student can fully settle the invoice while the
  // GROSS retail figure shown here is higher — received would never reach gross.
  const invStatus = String(ip.hs_invoice_status || '').toLowerCase();
  const hsBalanceDue = ip.hs_balance_due != null ? parseFloat(ip.hs_balance_due) : NaN;
  const invoicePaid = invStatus === 'paid' || (!isNaN(hsBalanceDue) && hsBalanceDue <= 0.01 && received > 0.01);
  const unpaid = !invoicePaid && received <= 0.01 && escrowHeld <= 0.01;
  // Internal consistency: reference the amount SHOWN as Total (gross) so
  // Received + Balance always reconcile on the face of the document.
  const fullyCovered = invoicePaid || (gross > 0 && received >= gross - 1.00);
  const balance = Math.max(0, Math.round((gross - received) * 100) / 100);

  const la: any = await fetch(`${base}/crm/v4/objects/invoices/${booking.hubspotInvoiceId}/associations/line_items`, { headers: H }).then(r => r.json());
  const liIds: string[] = (la.results || []).map((r: any) => String(r.toObjectId));
  let lineItems: any[] = [];
  if (liIds.length) {
    const liData: any = await fetch(`${base}/crm/v3/objects/line_items/batch/read`, {
      method: 'POST', headers: H,
      body: JSON.stringify({ inputs: liIds.map(id => ({ id })), properties: ['name', 'quantity', 'price', 'amount'] }),
    }).then(r => r.json());
    lineItems = liData.results || [];
  }
  const rowsHtml = lineItems.map(li => {
    const p = li.properties || {};
    const qty = parseFloat(p.quantity || '1');
    return `<tr><td style="padding:8px 0;border-bottom:1px solid #e5e4e0">${esc(p.name)}${qty > 1 ? ` <span style="color:#6b7280">× ${qty}</span>` : ''}</td><td style="padding:8px 0;border-bottom:1px solid #e5e4e0;text-align:right;white-space:nowrap">${eur(parseFloat(p.amount || '0'))}</td></tr>`;
  }).join('') || `<tr><td style="padding:8px 0;border-bottom:1px solid #e5e4e0">Course fees</td><td style="padding:8px 0;border-bottom:1px solid #e5e4e0;text-align:right">${eur(gross)}</td></tr>`;

  // Status badge + settlement rows are computed here (not hard-coded in the
  // template) so the document tells the truth for every state. This receipt
  // channel exists ONLY for escrow (HubSpot handles standard paid invoices), so
  // the escrow case gets the exact split: what's actually SETTLED (a card/bank
  // deposit received by the school — non-refundable) vs what's HELD in escrow
  // pending the visa decision.
  const greenBadge = '<span style="background:#d1fae5;color:#065f46;padding:2px 10px;border-radius:999px;font-weight:700;font-size:11px;letter-spacing:.04em">PAID</span>';
  const amberBadge = '<span style="background:#fef3c7;color:#92600a;padding:2px 10px;border-radius:999px;font-weight:700;font-size:11px;letter-spacing:.04em">PART&#8209;PAID</span>';
  const dueBadge   = '<span style="background:#fee2e2;color:#991b1b;padding:2px 10px;border-radius:999px;font-weight:700;font-size:11px;letter-spacing:.04em">DUE</span>';
  const GREEN = '#065f46', GREY = '#6b7280';
  const row = (label: string, amt: string, color: string) =>
    `<tr><td style="padding:2px 0;color:${color};font-size:12px">${label}</td><td style="padding:2px 0;text-align:right;color:${color};font-weight:600">${amt}</td></tr>`;
  let settlementRows: string;
  let statusBadge: string;
  if (unpaid) {
    // Gross invoice, not yet paid — what the partner shows the student to pay.
    statusBadge = dueBadge;
    settlementRows = row('Balance Due', eur(gross), GREY);
  } else if (escrowHeld > 0.01) {
    statusBadge = fullyCovered ? greenBadge : amberBadge;
    let r = '';
    if (settled > 0.01) r += row('Deposit Paid', eur(settled), GREEN);
    if (!fullyCovered) r += row('Balance Due', eur(balance), GREY);
    r += `<tr><td colspan="2" style="padding:6px 0 0;color:#9a6a00;font-size:11px;line-height:1.4">${eur(escrowHeld)} held in TransferMate Escrow. Visa application pending.</td></tr>`;
    settlementRows = r;
  } else if (fullyCovered) {
    statusBadge = greenBadge;
    settlementRows = row('Paid in full', eur(gross), GREEN);
  } else {
    statusBadge = amberBadge;
    settlementRows = row('Amount Received', eur(received), GREEN) + row('Balance Due', eur(balance), GREY);
  }

  // A receipt is dated at PAYMENT, not invoice issue. Fall back to the invoice
  // date only if HubSpot has no payment date recorded.
  const invDate = new Date(ip.hs_payment_date || ip.hs_invoice_date || Date.now());
  const tokens: Record<string, string> = {
    'student.first_name': booking.student.firstName || '',
    'student.last_name': booking.student.lastName || '',
    'student.nationality': (booking.student as any).nationality || '',
    'agency.name': (booking as any).agency?.name || '',
    // We always bill the STUDENT — even when an agency is involved (Neil). So
    // "Billed to" resolves to the student name, never the agency.
    'invoice.billed_to': `${booking.student.firstName || ''} ${booking.student.lastName || ''}`.trim(),
    'invoice.number': ip.hs_number || '',
    'invoice.date': invDate.toLocaleDateString('en-IE', { day: '2-digit', month: 'long', year: 'numeric' }),
    'invoice.gross': eur(gross),
    'invoice.line_items': rowsHtml,
    'invoice.status_badge': statusBadge,
    'invoice.settlement_rows': settlementRows,
  };
  const tpl = await prisma.documentTemplate.findUnique({ where: { slug: 'ULearn-Receipt' } });
  if (!tpl) return { ok: false, code: 500, error: 'Receipt template not found — restart to seed' };
  let html = tpl.htmlTemplate.replace(/\{\{([^}]+)\}\}/g, (_m: string, key: string) => {
    const k = key.trim();
    if (k === 'document.number') return tokens['invoice.number'];
    if (k === 'document.issue_date') return tokens['invoice.date'];
    return tokens[k] ?? '';
  });
  // Mirror HubSpot's one-doc lifecycle: it reads INVOICE while unpaid (the copy
  // the partner shows the student to pay), flips to RECEIPT once any money is
  // received, and gets a big diagonal PAID stamp when settled in full.
  if (unpaid) html = html.replace('letter-spacing:.02em">RECEIPT', 'letter-spacing:.02em">INVOICE');
  if (fullyCovered) {
    const stamp = '<div style="position:absolute;top:40%;left:0;right:0;text-align:center;transform:rotate(-22deg);font-size:110px;font-weight:900;color:rgba(6,95,70,.12);letter-spacing:.10em;pointer-events:none">PAID</div>';
    html = `<div style="position:relative">${stamp}<div style="position:relative;z-index:1">${html}</div></div>`;
  }
  return { ok: true, html, number: ip.hs_number || '', gross };
}

// Wrap a receipt/document HTML fragment in a full, A4-sized screen page: a white
// 210mm "sheet" on a grey backdrop (matching how the PDF renders edge-to-edge),
// plus a sticky toolbar with Download-PDF + Print. The toolbar is .no-print so it
// is absent from both the browser print dialog AND the puppeteer PDF (which uses
// print media). pdfUrl is the same endpoint with ?format=pdf.
export function receiptPage(innerHtml: string, pdfUrl: string, title = 'Receipt'): string {
  const esc = (s: string) => s.replace(/"/g, '&quot;');
  return `<!DOCTYPE html><html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title.replace(/</g, '&lt;')}</title>
<style>
  *{box-sizing:border-box}
  body{margin:0;background:#525659;font-family:Verdana,Arial,sans-serif}
  .rcpt-bar{position:sticky;top:0;z-index:10;display:flex;gap:10px;justify-content:flex-end;align-items:center;
    background:#323639;padding:10px 16px;box-shadow:0 1px 4px rgba(0,0,0,.4)}
  .rcpt-bar a,.rcpt-bar button{font:600 13px Verdana,Arial,sans-serif;text-decoration:none;cursor:pointer;
    border-radius:6px;padding:8px 14px;border:0;line-height:1}
  .rcpt-dl{background:#16a34a;color:#fff}
  .rcpt-print{background:#4b5563;color:#fff}
  .rcpt-sheet{width:210mm;min-height:297mm;margin:20px auto;background:#fff;
    box-shadow:0 2px 16px rgba(0,0,0,.55);overflow:hidden}
  @media print{
    body{background:#fff}
    .rcpt-bar{display:none}
    .rcpt-sheet{width:auto;min-height:0;margin:0;box-shadow:none}
  }
  @page{size:A4;margin:0}
</style></head>
<body>
  <div class="rcpt-bar no-print">
    <a class="rcpt-dl" href="${esc(pdfUrl)}" download>&#11015; Download PDF</a>
    <button class="rcpt-print" onclick="window.print()">Print</button>
  </div>
  <div class="rcpt-sheet">${innerHtml}</div>
</body></html>`;
}

// ISO-2 nationality codes → English country name ("Brazil", not "BR") for
// documents. Leaves already-spelled-out names untouched; falls back to the raw
// value if it isn't a recognised region code.
const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });
function countryName(v: string | null | undefined): string {
  const s = (v || '').trim();
  if (!s) return '';
  if (/^[A-Za-z]{2}$/.test(s)) {
    try { return regionNames.of(s.toUpperCase()) || s; } catch { return s; }
  }
  return s;
}

// Academic Year programmes are sold as 25 weeks of tuition but the student's
// permission-to-stay (and therefore the visa Letter of Acceptance) must cover
// the FULL stay including the holiday weeks — 35 weeks total. The course
// end_date only reflects tuition, so for visa documents we stretch the window.
const AY_STAY_WEEKS = 35;

function isAcademicYearCourse(name: string | null | undefined): boolean {
  const n = (name || '').toLowerCase();
  // LifePass is a programme of Academic Year courses — treat any legacy "Life Pass"
  // name as AY too (35-week visa window), belt-and-braces alongside the ingestion
  // canonicalisation that now names these courses "Academic Year …".
  return n.includes('academic year') || n.includes('renewal') || n.includes('life pass') || n.includes('lifepass');
}

function addWeeks(d: Date, weeks: number): Date {
  const out = new Date(d);
  out.setDate(out.getDate() + weeks * 7);
  return out;
}

/**
 * Visa window for a Letter of Acceptance (Non-EU). ALWAYS derived from the
 * COURSE — never the student's visaFrom/visaUntil:
 *   - start: course start
 *   - end:   AY ? course start + 35 weeks (run to that week's Sunday) : course end
 *   - weeks: AY ? 35 (the fixed entitlement) : derived from start→end
 * Why ignore visaFrom/visaUntil (2026-06-29): the LoA is issued BEFORE any visa
 * exists; those fields only mirror the visa AFTER it's granted, so letting them
 * drive the letter is backwards — and broke renewals, which carry stale visa
 * dates from the prior AY (e.g. an 18-May window printed on a 29-Jun course).
 * Shared by the LoA PDF + the QR verification page so both always agree.
 */
function computeVisaWindow(opts: {
  visaFrom?: Date | string | null;   // accepted for call-site compatibility; IGNORED
  visaUntil?: Date | string | null;  // accepted for call-site compatibility; IGNORED
  courseName?: string | null;
  courseStart?: Date | string | null;
  courseEnd?: Date | string | null;
}): { start: Date | null; end: Date | null; weeks: number | null } {
  const start = opts.courseStart ? new Date(opts.courseStart) : null;
  const isAY = isAcademicYearCourse(opts.courseName) && !!start;
  let end: Date | null;
  if (isAY) {
    // Fixed 35-week entitlement: the permission runs to the 35-week anniversary
    // of the (Monday) start — e.g. Mon 6 Jul 2026 → Mon 8 Mar 2027. addWeeks()
    // already lands on the Monday that *begins* week 36, so the previous
    // "round forward to the next Sunday" pushed it a whole week too far (→ 14 Mar,
    // i.e. 36 weeks). The anniversary date is the finish — no rounding.
    end = addWeeks(start!, AY_STAY_WEEKS);
  } else {
    end = opts.courseEnd ? new Date(opts.courseEnd) : null;
  }
  // AY = a fixed 35-week entitlement — report that, not the rolled calendar span
  // (20 Jul → 28 Mar is ~36 calendar weeks but the entitlement is 35).
  const weeks = isAY ? AY_STAY_WEEKS
    : (start && end ? Math.max(0, Math.round((end.getTime() - start.getTime()) / (7 * 24 * 60 * 60 * 1000))) : null);
  return { start, end, weeks };
}

// Inline local /sis/public/* and /public/* image refs as data URIs so puppeteer's
// setContent() (which has no base URL) can render them. Without this, header,
// signature, and footer images silently drop from PDFs.
const _imageCache = new Map<string, string>();
function inlineLocalImages(html: string): string {
  return html.replace(/<img\b([^>]*?)\bsrc=(["'])([^"']+)\2([^>]*)>/gi, (full, before, _q, src, after) => {
    const m = src.match(/^(?:https?:\/\/[^/]*)?\/(?:sis\/)?public\/(.+)$/);
    if (!m) return full;
    const rel = m[1].split('?')[0].split('#')[0];
    const cached = _imageCache.get(rel);
    if (cached) return `<img${before} src="${cached}"${after}>`;
    try {
      const abs = path.resolve(PUBLIC_DIR, rel);
      if (!abs.startsWith(PUBLIC_DIR)) return full;
      const buf = fs.readFileSync(abs);
      const ext = path.extname(rel).slice(1).toLowerCase();
      const mime = ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg'
        : ext === 'png' ? 'image/png'
        : ext === 'gif' ? 'image/gif'
        : ext === 'svg' ? 'image/svg+xml'
        : ext === 'webp' ? 'image/webp'
        : 'application/octet-stream';
      const dataUri = `data:${mime};base64,${buf.toString('base64')}`;
      _imageCache.set(rel, dataUri);
      return `<img${before} src="${dataUri}"${after}>`;
    } catch {
      return full;
    }
  });
}

export function documentScripts(prisma: PrismaClient) {

  // ── TEMPLATES ──────────────────────────────

  async function listTemplates(activeOnly = true, templateType?: string) {
    const where: any = {};
    if (activeOnly) where.active = true;
    if (templateType) where.templateType = templateType;
    return prisma.documentTemplate.findMany({
      where,
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
      include: { _count: { select: { records: true } } },
    });
  }

  async function getTemplate(id: number) {
    return prisma.documentTemplate.findUnique({ where: { id } });
  }

  async function createTemplate(data: {
    name: string; slug: string; category?: string; documentType: string; templateType?: string;
    subject?: string | null; defaultTo?: string | null;
    htmlTemplate: string; tokenSchema?: string; requiresFullPayment?: boolean;
  }) {
    return prisma.documentTemplate.create({ data });
  }

  async function updateTemplate(id: number, data: {
    name?: string; category?: string; templateType?: string; subject?: string | null; defaultTo?: string | null; htmlTemplate?: string; tokenSchema?: string; active?: boolean; requiresFullPayment?: boolean;
  }) {
    // Bump version when template content changes
    const current = await prisma.documentTemplate.findUnique({ where: { id } });
    if (!current) throw new Error('Template not found');
    const bump = data.htmlTemplate && data.htmlTemplate !== current.htmlTemplate;
    return prisma.documentTemplate.update({
      where: { id },
      data: { ...data, ...(bump ? { version: current.version + 1 } : {}) },
    });
  }

  async function deleteTemplate(id: number) {
    const tpl = await prisma.documentTemplate.findUnique({ where: { id } });
    if (!tpl) throw new Error('Template not found');
    // Refuse if any issued/draft document was generated from this template —
    // those DocumentRecords FK to it (and we never orphan an issued doc).
    const inUse = await prisma.documentRecord.count({ where: { templateId: id } });
    if (inUse > 0) throw new Error(`Cannot delete: ${inUse} document(s) were generated from this template. Set it inactive instead.`);
    await prisma.documentTemplate.delete({ where: { id } });
    return { deleted: true, id };
  }

  // ── HUBSPOT COMMISSION FETCH ──────────────────
  // Per the CLAUDE.md agency-data rule: commission rates must come from HubSpot,
  // not from the local `agencies.commission_rate` column (which is Fidelo-era stale
  // data kept only for FK joins). This helper fetches the live rate.
  // The exact HubSpot Company property name may need adjustment — override with
  // HUBSPOT_COMMISSION_PROPERTY env var if the internal name differs.
  const HS_COMMISSION_PROP = process.env.HUBSPOT_COMMISSION_PROPERTY || 'commission';

  async function fetchHubspotCommissionRate(hubspotCompanyId: string): Promise<number | null> {
    const token = process.env.ACCESS_TOKEN;
    if (!token) return null;
    try {
      const https = await import('https');
      const data = await new Promise<any>((resolve, reject) => {
        https.get({
          hostname: 'api.hubapi.com',
          path: `/crm/v3/objects/companies/${encodeURIComponent(hubspotCompanyId)}?properties=${HS_COMMISSION_PROP}`,
          headers: { Authorization: `Bearer ${token}` },
        }, (res) => {
          let body = '';
          res.on('data', (c: string) => body += c);
          res.on('end', () => { try { resolve(JSON.parse(body)); } catch (e) { reject(e); } });
        }).on('error', reject);
      });
      const raw = data?.properties?.[HS_COMMISSION_PROP];
      if (raw == null || raw === '') return null;
      const n = Number(raw);
      if (isNaN(n) || n <= 0) return null;
      // HubSpot stores commission as a decimal (0.3 = 30%). Accept both formats
      // and clamp the ×100 typo range so a mis-entered 2500 doesn't flow through
      // as a real rate.
      if (n < 1)   return n * 100;           // expected: 0.3 → 30
      if (n >= 50) return n / 100;           // typo: 2500 → 25, 3000 → 30
      return n;                              // legacy integer: 30 → 30
    } catch {
      return null;
    }
  }

  // Partner LoAs show the GROSS the student committed to — the invoice subtotal,
  // the SAME figure the partner-portal financial-display doc (getGrossReceiptHtml)
  // reads. This is the source of truth for gross; we NEVER reverse-engineer it from
  // net + commission (that gives a wrong number when the stored rate is stale).
  async function fetchInvoiceGross(invoiceId: string): Promise<number | null> {
    const token = process.env.ACCESS_TOKEN;
    if (!token) return null;
    try {
      const inv: any = await fetch(
        `https://api.hubapi.com/crm/v3/objects/invoices/${encodeURIComponent(invoiceId)}?properties=hs_subtotal,hs_number`,
        { headers: { Authorization: `Bearer ${token}` } },
      ).then(r => r.json());
      // A LifePass "-Sub" master invoice (€7,425 subscription receivable) is NOT a per-booking
      // gross — its subtotal is the whole subscription. Never let it stand in as the reserved
      // figure; a booking mislinked to it should read blank (→ fix the link) not €7,425.
      if (/-sub$/i.test(String(inv?.properties?.hs_number || ''))) return null;
      const v = parseFloat(inv?.properties?.hs_subtotal ?? '');
      return isNaN(v) || v <= 0 ? null : v;
    } catch {
      return null;
    }
  }

  // ── TOKEN RESOLUTION ──────────────────────

  // Pick the accommodation a student is progressing toward, in the order they
  // actually experience them: UPCOMING (arrival) → PRESENT (in-stay) → PAST
  // (departed). A student can legitimately hold several bookings (e.g. two
  // consecutive courses), and the booking carrying the live room is NOT
  // necessarily the newest by id — so selecting by booking id alone left
  // arrival docs blank when the latest booking had no room attached. The
  // date-of-stay is the correct signal.
  function pickAccommByArrival<T extends { startDate?: Date | null; endDate?: Date | null }>(accoms: T[]): T | null {
    if (!accoms || !accoms.length) return null;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const t = today.getTime();
    const ms = (d: any) => (d ? new Date(d).getTime() : null);
    const rank = (a: T) => {
      const s = ms(a.startDate); const e = ms(a.endDate) ?? s;
      if (s != null && s > t) return 0;                            // upcoming
      if (s != null && s <= t && (e == null || e >= t)) return 1;  // present
      return 2;                                                    // past
    };
    return [...accoms].sort((a, b) => {
      const ra = rank(a), rb = rank(b);
      if (ra !== rb) return ra - rb;
      const sa = ms(a.startDate) ?? 0, sb = ms(b.startDate) ?? 0;
      const ea = ms(a.endDate) ?? sa, eb = ms(b.endDate) ?? sb;
      if (ra === 0) return sa - sb;   // soonest upcoming first (next arrival)
      return eb - ea;                 // present/past: most recent end first
    })[0];
  }

  // When the caller doesn't name a booking, resolve the one the student is most
  // arrival-relevant to: UPCOMING → PRESENT → PAST (pickAccommByArrival order).
  // Rank ALL non-cancelled bookings — each by its accommodation span when it has
  // a room, else its own service window. Ranking across the whole set (not just
  // the bookings that happen to carry a room) is the 2026-10-14 fix: a returning
  // student with an OLD completed booking that still has a room and a CURRENT
  // upcoming booking with no room yet (e.g. Ralph #31: Feb booking w/ accom vs
  // an Oct re-enrolment w/o accom) was resolving to the stale past booking — so
  // the Day-1 email read that booking's Monday start (02 Feb = St Brigid's, a
  // bank holiday) and wrongly told him the school was closed on day one.
  // The incremental id is unreliable (deal-splitting / legacy migration can give
  // an older stay a higher id), so id is only the last-resort tiebreak.
  async function bestBookingIdForStudent(studentId: number): Promise<number | null> {
    const bookings = await prisma.booking.findMany({
      where: { studentId, NOT: { status: 'CANCELLED' as any } },
      select: {
        id: true, serviceStart: true, serviceEnd: true,
        accommodations: { select: { startDate: true, endDate: true } },
      },
    });
    if (!bookings.length) return null;
    const ms = (d: any) => (d ? new Date(d).getTime() : null);
    const windows = bookings.map(b => {
      // A booking with a room ranks by the room span (the arrival signal that
      // matters for accommodation docs); otherwise by its own service window.
      const accs = b.accommodations || [];
      let start: Date | null = b.serviceStart;
      let end: Date | null = b.serviceEnd;
      if (accs.length) {
        const starts = accs.map(a => ms(a.startDate)).filter((n): n is number => n != null);
        const ends = accs.map(a => ms(a.endDate)).filter((n): n is number => n != null);
        if (starts.length) start = new Date(Math.min(...starts));
        if (ends.length) end = new Date(Math.max(...ends));
      }
      return { id: b.id, startDate: start, endDate: end };
    });
    const best = pickAccommByArrival(windows);
    return best?.id ?? [...bookings].sort((a, b) => b.id - a.id)[0].id;
  }

  async function resolveTokens(studentId: number, bookingId?: number | null, opts: { certAggregate?: boolean; slug?: string | null } = {}) {
    const student = await prisma.student.findUnique({ where: { id: studentId } });
    if (!student) throw new Error('Student not found');

    const resolvedBookingId = bookingId ?? await bestBookingIdForStudent(studentId);
    const booking = resolvedBookingId
      ? await prisma.booking.findUnique({
          where: { id: resolvedBookingId },
          include: { courses: true, accommodations: true, agency: true, extras: true },
        })
      : null;

    // Commission rate (HubSpot-authoritative — see CLAUDE.md agency rule)
    const hsCompanyId = (booking as any)?.agency?.hubspotCompanyId;
    const hsCommissionRate: number | null = hsCompanyId ? await fetchHubspotCommissionRate(hsCompanyId) : null;

    // Single condition = is there a B2B partner on this booking. If so, partner-facing
    // docs (the LoA) show GROSS so the agency's commission is never exposed; direct/B2C
    // bookings have no agency and keep showing the net they actually paid us.
    const invoiceGross: number | null =
      (booking as any)?.agency && booking?.hubspotInvoiceId
        ? await fetchInvoiceGross(booking.hubspotInvoiceId)
        : null;

    // Pick the course that should drive Day-1 / session-block copy and the
    // headline booking fields. Many afternoon bookings carry a placeholder
    // "Unknown Course" (category=OTHER) at courses[0] for an arrival /
    // placement session, with the real AFTERNOON course at courses[1+] — so
    // naive `courses[0]` was selecting the OTHER row and Day-1 emails fell
    // through to the morning default. Skip OTHER first, then prefer the
    // earliest start_date among the real categories. Falls back to courses[0]
    // when only OTHER rows exist (legacy / inactive bookings).
    const REAL_CATEGORIES = new Set(['MORNING','MORNING_PLUS','AFTERNOON','AFTERNOON_PLUS','INTENSIVE','PRIVATE']);
    const realCourses = (booking?.courses || []).filter(c => REAL_CATEGORIES.has(String(c.category)));
    const ordered = [...realCourses].sort((a, b) => {
      const ta = a.startDate ? new Date(a.startDate).getTime() : Infinity;
      const tb = b.startDate ? new Date(b.startDate).getTime() : Infinity;
      return ta - tb;
    });
    let course = ordered[0] || booking?.courses?.[0];

    // Booking-level aggregates across all real courses. Many historical
    // bookings have multiple booking_courses split around Christmas (an old
    // Fidelo workaround for the holiday gap before the system had a proper
    // shunt-forward mechanism). The headline `course` above picks one — but
    // documents like the Exit Letter ("He completed his 25-week course")
    // need the whole-stay totals: earliest start, latest end, and the SUM of
    // weeks across the splits. Falls back to the picked course when there
    // are no real-category rows (legacy / inactive bookings).
    const aggSource = realCourses.length ? realCourses : (booking?.courses || []);
    let bookingStartDate = aggSource.reduce<Date | null>((earliest, c) => {
      if (!c.startDate) return earliest;
      const d = new Date(c.startDate);
      return !earliest || d < earliest ? d : earliest;
    }, null);
    let bookingEndDate = aggSource.reduce<Date | null>((latest, c) => {
      if (!c.endDate) return latest;
      const d = new Date(c.endDate);
      return !latest || d > latest ? d : latest;
    }, null);
    let bookingTotalWeeks = aggSource.reduce((sum, c) => sum + Number(c.weeks || 0), 0);

    // CERTIFICATE mode (Neil 2026-06-05): a certificate is issued at the END and
    // must reflect the student's TOTAL study — SUM weeks across ALL their
    // non-cancelled bookings (not just this one), with the date range spanning
    // first start → last end. 24-month lookback so a student returning years
    // later starts a fresh tally. LoA/visa keep the per-booking window above.
    if (opts.certAggregate) {
      const lookback = new Date(); lookback.setMonth(lookback.getMonth() - 24);
      const allBks = await prisma.booking.findMany({
        where: { studentId, NOT: { status: 'CANCELLED' as any } },
        include: { courses: true },
      });
      const allCourses = allBks.flatMap(b => b.courses).filter(c =>
        REAL_CATEGORIES.has(String(c.category)) && c.endDate && new Date(c.endDate) >= lookback);
      if (allCourses.length) {
        bookingTotalWeeks = allCourses.reduce((s, c) => s + Number(c.weeks || 0), 0);
        bookingStartDate = allCourses.reduce<Date | null>((e, c) => {
          const d = c.startDate ? new Date(c.startDate) : null;
          return d && (!e || d < e) ? d : e;
        }, null);
        bookingEndDate = allCourses.reduce<Date | null>((l, c) => {
          const d = c.endDate ? new Date(c.endDate) : null;
          return d && (!l || d > l) ? d : l;
        }, null);
      }
    }

    // LifePass / nested multi-year programmes: the booking holds several FULL
    // academic-year courses (each ~25–35 taught weeks, with month-long gaps
    // between years) rather than Christmas-split segments of ONE year. A single
    // academic year is at most ~35 taught weeks, so when the real courses sum to
    // MORE than that (>36) the booking spans multiple years. For a "currently
    // enrolled" letter the student is in ONE academic year right now — reporting
    // the summed span (e.g. 95 weeks over 2026→2028) is wrong and alarming for
    // immigration. So collapse the headline course + booking dates/weeks onto the
    // CURRENT course (active today → else next upcoming → else most recent). This
    // is skipped for the whole-stay FINAL documents (the attendance certificate /
    // exit letter), which legitimately report the entire programme: certAggregate
    // sums across all bookings, and any slug carrying "final"/"exit"/"absence"
    // keeps the per-booking span computed above. Single-year bookings (incl.
    // legacy Christmas splits, which sum to ≤35) are untouched.
    const _isFinalWholeStay = !!opts.certAggregate || /(?:^|[-_ ])(final|exit|absence)/i.test(String(opts.slug || ''));
    if (!_isFinalWholeStay && realCourses.length > 1) {
      const totalRealWeeks = realCourses.reduce((s, c) => s + Number(c.weeks || 0), 0);
      if (totalRealWeeks > 36) {
        const nowMs = Date.now();
        const dated = realCourses.filter(c => c.startDate && c.endDate);
        const active = dated.find(c => +new Date(c.startDate!) <= nowMs && nowMs <= +new Date(c.endDate!) + 86400000);
        const upcoming = dated.filter(c => +new Date(c.startDate!) > nowMs).sort((a, b) => +new Date(a.startDate!) - +new Date(b.startDate!))[0];
        const recent = [...dated].sort((a, b) => +new Date(b.endDate!) - +new Date(a.endDate!))[0];
        const currentCourse = active || upcoming || recent;
        if (currentCourse) {
          course = currentCourse;
          bookingStartDate = currentCourse.startDate ? new Date(currentCourse.startDate) : bookingStartDate;
          bookingEndDate = currentCourse.endDate ? new Date(currentCourse.endDate) : bookingEndDate;
          bookingTotalWeeks = Number(currentCourse.weeks || 0) || bookingTotalWeeks;
        }
      }
    }

    // Visa LoA window (shared with the QR verification payload so the printed
    // letter and the scanned page can never disagree). AY → 35-week stay.
    const _visaWindow = computeVisaWindow({
      visaFrom: (student as any).visaFrom,
      visaUntil: (student as any).visaUntil,
      courseName: course?.name,
      courseStart: course?.startDate,
      courseEnd: course?.endDate,
    });

    // Gender-aware pronouns & salutation. Stored gender is the legacy Fidelo
    // integer: 1=Male, 2=Female, null/anything-else=unknown. NEVER guess from
    // the name — unknown renders neutral singular "they/their" and drops the
    // Mr./Ms. title, so the ~14k students with no gender on file can't be
    // misgendered (only ~460 have it set). Known gender still renders exactly.
    // Unknown gender renders the neutral, SINGULAR noun "the student" (not
    // "they") on purpose: the letter bodies hard-code singular verbs ("… is
    // enrolled", "… remains on holidays"), so "they is enrolled" would be
    // ungrammatical. "The student is enrolled" stays correct and gender-free.
    const _gender = student.gender;
    const isMale = _gender === 1;
    const isFemale = _gender === 2;
    const salutation = isMale ? 'Mr.' : isFemale ? 'Ms.' : '';
    const pronounSubject = isMale ? 'he' : isFemale ? 'she' : 'the student';
    const pronounSubjectCap = isMale ? 'He' : isFemale ? 'She' : 'The student';
    const pronounObject = isMale ? 'him' : isFemale ? 'her' : 'the student';
    const pronounPossessive = isMale ? 'his' : isFemale ? 'her' : "the student's";
    const pronounPossessiveCap = isMale ? 'His' : isFemale ? 'Her' : "The student's";

    // Accommodation — the arrival-relevant placement (upcoming → present →
    // past), not blindly the first row, so multi-booking students render the
    // room they're actually arriving into.
    const accomm = pickAccommByArrival(booking?.accommodations || []) || booking?.accommodations?.[0];
    let accommProvider: any = null;
    if (accomm?.bedId) {
      const bed = await prisma.accommodationBed.findUnique({
        where: { id: accomm.bedId },
        include: { room: { include: { property: { include: { provider: true } } } } },
      });
      accommProvider = bed?.room?.property?.provider;
    }
    // The placement host's magic-link portal URL (empty if no host / no token).
    let accommPortalLink = '';
    if (accommProvider?.id) {
      const _ht = await prisma.hostPortalToken.findUnique({ where: { providerId: accommProvider.id }, select: { token: true } });
      if (_ht?.token) accommPortalLink = `${BASE_URL}/host-portal/${_ht.token}`;
    }

    const fmtDate = (d: any) => d ? new Date(d).toLocaleDateString('en-IE', { day: '2-digit', month: 'long', year: 'numeric' }) : '';

    // ── Attendance rate + absences list ──────────────────
    // The Exit Letter (and Holiday Letter) cite an attendance percentage. Until
    // now the token was an empty string with a TODO comment. We compute it from
    // the Attendance table — PRESENT/LATE count as attended, anything else as
    // absent. When < 85% (the ILEP threshold) we additionally render an
    // `absences_list` block: a bulleted list of every absence with its date,
    // any student-recorded reason, optional note, and a "(medical cert on file)"
    // tag. This is what gets pulled into the {if absences_list} block in the
    // Exit Letter so IRP renewal interviewers have the paper trail.
    const ABSENT_STATUSES = new Set(['ABSENT_CERTIFIED', 'ABSENT_UNCERTIFIED', 'EXCUSED']);
    const REASON_LABELS: Record<string, string> = {
      SICK: 'Sick',
      IRP_APPT: 'IRP / visa appointment',
      PPS_APPT: 'PPS appointment',
      EXAM: 'Exam / academic',
      TRANSPORT: 'Public transport disruption',
      WEATHER: 'Weather warning',
      OTHER: 'Other',
    };
    let attendanceRateStr = '';
    let absencesListHtml = '';
    try {
      const { fetchStudentHolidays, filterOutHolidayDates, legacyAttendanceCounts, courseTuitionRate, presentCredit } = await import('./attendance-pct');
      const attRowsAll = await prisma.attendance.findMany({
        where: { studentId },
        select: { status: true, occurrence: { select: { date: true } } },
      });
      // Holiday-overlap days are excluded from the rate calculation entirely
      // (they aren't supposed to be at school, so they shouldn't drag the
      // percentage down). Same row set then drives the absences list below.
      const studentHolidays = await fetchStudentHolidays(prisma, studentId);
      const attRows = filterOutHolidayDates(attRowsAll, studentHolidays);

      // Compliance course: the AY course the letter is about — the one running
      // today, else the operable `course`. An AY (LifePass) booking nests 3
      // sequential 35-week courses; the rate must be scoped to ONE course's
      // 25-tuition-week window, not blended across all three. Non-AY courses
      // (no holidayWks) keep the lifetime all-rows figure below.
      const _nowMs = Date.now();
      const complianceCourse = (realCourses.find(c =>
        c.startDate && c.endDate && +new Date(c.startDate) <= _nowMs && _nowMs <= +new Date(c.endDate) + 86400000
      ) || course) as any;
      let total: number;
      let presentLike: number;
      if (complianceCourse?.holidayWks != null && complianceCourse?.startDate) {
        const hRanges = studentHolidays.map(h => {
          const s = new Date(h.startDate); s.setHours(0, 0, 0, 0);
          const e = new Date(h.endDate); e.setHours(0, 0, 0, 0);
          return [s.getTime(), e.getTime()] as const;
        });
        const isHoliday = (d: Date | null) => {
          if (!d) return false;
          const x = new Date(d); x.setHours(0, 0, 0, 0);
          const t = x.getTime();
          return hRanges.some(([s, e]) => t >= s && t <= e);
        };
        const cr = courseTuitionRate(
          attRowsAll,
          new Date(complianceCourse.startDate).toISOString().slice(0, 10),
          complianceCourse.endDate ? new Date(complianceCourse.endDate).toISOString().slice(0, 10) : null,
          complianceCourse.holidayWks,
          isHoliday,
          studentId,
        );
        total = cr.total;
        presentLike = cr.present;
      } else {
        total = attRows.length;
        presentLike = presentCredit(attRows, studentId);   // LATE = 0.5 (retroactive; #913 grandfathered)
      }
      // Fold in the pre-migration Fidelo figure carried on this booking
      // (weighted by its pre-04/05 weeks), so the letter cites the student's
      // TRUE overall attendance — not just the short SIS-tracked window since
      // migration. SIS-only when there's no legacy figure.
      const leg = legacyAttendanceCounts(
        (booking as any)?.legacyAttendancePct != null ? Number((booking as any).legacyAttendancePct) : null,
        booking?.serviceStart || null,
      );
      const combPresent = presentLike + leg.present;
      const combTotal = total + leg.total;
      if (combTotal > 0) {
        const pct = Math.round((combPresent / combTotal) * 100);
        attendanceRateStr = `${pct}%`;

        if (pct < 85) {
          // Pull absences with any reason+cert metadata. Order chronologically
          // for readability in the letter.
          const absentRows = attRows
            .filter(r => ABSENT_STATUSES.has(r.status))
            .sort((a, b) => (a.occurrence.date.getTime() - b.occurrence.date.getTime()));

          if (absentRows.length) {
            const dates = absentRows.map(r => r.occurrence.date);
            const reasons = await prisma.absenceReason.findMany({
              where: { studentId, date: { in: dates } },
              select: {
                date: true, reason: true, noteText: true,
                _count: { select: { certFiles: true } },
              },
            });
            const reasonByIso = new Map(
              reasons.map(r => [r.date.toISOString().slice(0, 10), r])
            );
            const items = absentRows.map(r => {
              const iso = r.occurrence.date.toISOString().slice(0, 10);
              const rsn = reasonByIso.get(iso);
              const dateLabel = fmtDate(r.occurrence.date);
              const label = rsn?.reason ? REASON_LABELS[rsn.reason] || rsn.reason : 'No reason recorded';
              const note = rsn?.noteText ? ` — ${rsn.noteText}` : '';
              const cert = rsn?._count?.certFiles ? ' (medical cert on file)' : '';
              return `<li><strong>${dateLabel}</strong>: ${label}${note}${cert}</li>`;
            }).join('');
            absencesListHtml = `<ul style="margin:8px 0 16px 20px;padding:0">${items}</ul>`;
          }
        }
      }
    } catch {
      // If the attendance query blows up for any reason, leave the tokens empty
      // — the letter still renders, just without the % and the absences block.
    }

    // Day-1 email variant axes (drive the four {if day1_*} blocks in the
    // "Day1 Orient" email — exactly one is truthy per booking):
    //   · ILEP  — operable course is an Academic Year (work-study) course, so
    //             its Induction is MANDATORY. Non-ILEP → Orientation (encouraged).
    //             Per Neil (2026-08-13): DON'T use the ILEP code — infer purely
    //             from the operable course name containing "Academic Year"
    //             (covers AM / PM / AM Plus / PM Plus).
    //   · PM    — course session: AFTERNOON / AFTERNOON_PLUS → PM; all else → AM
    //             (mirrors course_session_block's morning-default).
    const _day1Ilep = /academic\s*year/i.test(course?.name || '');
    const _day1Pm = course?.category === 'AFTERNOON' || course?.category === 'AFTERNOON_PLUS';

    // Day-1 bank-holiday shift — is the operable course's start day one the
    // school is closed? True for an Irish bank holiday (computed) OR any logged
    // school closure (Christmas / Good Friday / ad-hoc). When closed, the first
    // lesson moves to the next day and the email says "Tuesday". Courses always
    // start Mondays, so the closed day is a Monday and the next open day Tuesday.
    let _day1BankHol = false;
    if (course?.startDate) {
      const startIso = new Date(course.startDate).toISOString().slice(0, 10);
      if (irishPublicHolidays(Number(startIso.slice(0, 4))).has(startIso)) {
        _day1BankHol = true;
      } else {
        const sd = new Date(course.startDate);
        const closure = await prisma.schoolClosure.findFirst({
          where: { startDate: { lte: sd }, endDate: { gte: sd } },
          select: { id: true },
        });
        if (closure) _day1BankHol = true;
      }
    }

    const tokens: Record<string, string> = {
      // Student
      'student.full_name': `${student.firstName} ${student.lastName || ''}`,
      'student.first_name': student.firstName,
      'student.last_name': student.lastName || '',
      'student.email': student.email || '',
      'student.dob': fmtDate(student.birthday),
      'student.nationality': countryName(student.nationality),
      'student.passport_number': student.passportNumber || '',
      'student.passport_number_masked': student.passportNumber ? student.passportNumber.slice(0, -4).replace(/./g, '*') + student.passportNumber.slice(-4) : '',
      'student.student_type': student.studentType || '',
      'student.current_level': student.currentLevel || '',
      'student.photo': student.profilePicture || '',
      'student.id': String(student.id),
      'student.salutation': salutation,
      'student.gender': isMale ? 'Male' : isFemale ? 'Female' : '',
      'student.allergies': student.allergies || '',
      'student.address': [student.address, student.addressAddon, student.city, student.zip].filter(Boolean).join(', '),
      // Irish (in-Ireland) address — where the student lives while studying here.
      // Distinct from student.address (native/home-country). Used by the Attendance
      // Letter (template 83) and any doc that must show the Irish residence.
      'student.irish_address': [student.irishAddress, student.irishAddressAddon, student.irishCity, student.irishZip].filter(Boolean).join(', '),
      // Residence in Ireland for ISD/immigration docs: the student's own Irish
      // address if on file, else fall back to their placement address — host
      // family OR one of our apartments (e.g. 32 Capel Street). Empty only when
      // neither is known. accommodation.host_address already covers all placement
      // types (the "host" name is legacy; apartment providers carry a full address).
      'student.address_ireland': (() => {
        const irish = [student.irishAddress, student.irishAddressAddon, student.irishCity, student.irishZip].filter(Boolean).join(', ');
        const accom = accommProvider ? [accommProvider.address, accommProvider.addressAddon, accommProvider.city, accommProvider.zip].filter(Boolean).join(', ') : '';
        return irish || accom;
      })(),
      'student.phone': student.phoneMobile || student.phone || '',
      'student.emergency_phone': student.emergencyPhone || '',
      'student.age': student.birthday ? String(Math.floor((Date.now() - new Date(student.birthday).getTime()) / (365.25 * 24 * 60 * 60 * 1000))) : '',
      'student.language': (student as any).language || (student as any).contactLanguage || '',
      'student.attendance_rate': attendanceRateStr,
      'absences_list': absencesListHtml, // populated only when attendance < 85% — drives {if absences_list}

      // Gender pronouns (replaces Fidelo {if gender} blocks)
      'student.pronoun_subject': pronounSubject,
      'student.pronoun_object': pronounObject,
      'student.pronoun_possessive': pronounPossessive,
      'student.pronoun_possessive_cap': pronounPossessiveCap,
      'student.pronoun_subject_cap': pronounSubjectCap,

      // Day-1 session block — picks the correct first-day-of-school copy
      // based on the booked course's CourseCategory. Replaces the Fidelo
      // {if course_category == "..."} equality blocks (the SIS render
      // engine only handles {if token} truthy checks, so the equality form
      // was leaking the literal {if …} tags AND rendering all four variants
      // simultaneously). One token, one substitution, one source of truth.
      'course_session_block': (() => {
        const cat = course?.category;
        const morning   = 'The school will open at <span style="text-decoration:underline"><strong>8:30am</strong></span> on Monday morning. Lessons will start at <span style="text-decoration:underline"><strong>9:00am</strong></span>. Please arrive <strong>15 minutes early</strong> on your first day to meet the Director of Studies and to complete a spoken assessment.';
        const aftPlus   = 'The school will open at <span style="text-decoration:underline"><strong>8:30am</strong></span> on Monday morning. Your first lesson will be at <span style="text-decoration:underline"><strong>12:45pm</strong></span>, so please come at <span style="text-decoration:underline"><strong>12:30pm</strong></span> on your first day to meet the Director of Studies and to complete a spoken assessment.';
        const afternoon = 'The school will open at <span style="text-decoration:underline"><strong>8:30am</strong></span> on Monday morning. Your first lesson will start at <span style="text-decoration:underline"><strong>1:45pm</strong></span>, so please come at <span style="text-decoration:underline"><strong>1:30pm</strong></span> on your first day to meet the Director of Studies and to complete a spoken assessment.';
        if (cat === 'AFTERNOON_PLUS') return aftPlus;
        if (cat === 'AFTERNOON')      return afternoon;
        // MORNING, MORNING_PLUS, INTENSIVE, PRIVATE, OTHER, or unknown → morning copy
        return morning;
      })(),

      // Day-1 email variant flags — exactly one truthy (see _day1Ilep/_day1Pm above).
      'day1_ilep_am':   (_day1Ilep && !_day1Pm) ? '1' : '',
      'day1_ilep_pm':   (_day1Ilep &&  _day1Pm) ? '1' : '',
      'day1_noilep_am': (!_day1Ilep && !_day1Pm) ? '1' : '',
      'day1_noilep_pm': (!_day1Ilep &&  _day1Pm) ? '1' : '',
      // Bank-holiday shift: drives the {if day1_bank_holiday} note and swaps the
      // schedule's day label (Monday → Tuesday) via {{day1_weekday}}.
      'day1_bank_holiday': _day1BankHol ? '1' : '',
      'day1_weekday': _day1BankHol ? 'Tuesday' : 'Monday',

      // Booking — start/end/weeks use the BOOKING-LEVEL aggregate, not the
      // single picked course, so Exit Letters and similar reflect the
      // whole-stay totals across pre/post-Christmas course splits. course_name
      // and course_level stay on the headline (single) course since they're
      // intrinsically per-row.
      'booking.reference': booking ? `BK-${new Date().getFullYear()}-${String(booking.id).padStart(6, '0')}` : '',
      'booking.status': booking?.status || '',
      'booking.start_date': fmtDate(bookingStartDate || course?.startDate),
      'booking.end_date':   fmtDate(bookingEndDate   || course?.endDate),
      'booking.course_name': course?.name || '',
      // Fall back to the student's level so the LoA isn't blank on older/edge
      // bookings whose course.level was never set (new bookings now set it).
      'booking.course_level': course?.level || student.currentLevel || '',
      'booking.hours_per_week': course?.hoursPerWeek ? String(course.hoursPerWeek) : '',
      'booking.weeks': bookingTotalWeeks > 0 ? String(bookingTotalWeeks) : (course?.weeks ? String(course.weeks) : ''),
      'booking.amount_total': booking?.amountTotal ? `€${booking.amountTotal}` : '',
      // LoA "has paid … to reserve" figure.
      //   • Partner booking → GROSS ONLY (invoice subtotal = what the student paid the partner).
      //     NEVER net — net exposes the commission the partner took. If the gross is unavailable
      //     (invoice unlinked / a LifePass -Sub master), render BLANK so the gap is spotted and
      //     the invoice link fixed, rather than silently leaking the net figure.
      //   • Direct/B2C (no agency) → net = the amount they actually paid us.
      'booking.amount_reserved': (booking as any)?.agency
        ? (invoiceGross != null ? `€${invoiceGross.toFixed(2)}` : '')
        : (booking?.amountTotal ? `€${booking.amountTotal}` : ''),
      // Academic Year / LifePass? Gates the LoA insurance block — only AY/LifePass
      // students carry the school Arachas cover + Learner Protection; short-stay
      // non-EU students don't (same population as holiday eligibility). Same signal
      // as bookings.ts holiday check: AY/renewal/LifePass course name or isRenewal.
      'booking.is_academic_year': (booking?.courses || []).some(
        (c: any) => /academic year|life ?pass|renewal/i.test(c.name || '') || c.isRenewal,
      ) ? '1' : '',
      // Did the student actually BUY the health/MediCover half of the insurance
      // bundle? Drives the LoA's conditional "Medical Insurance" line — Learner
      // Protection is mandatory (always shown for AY), but MediCover is optional,
      // so the letter must not claim cover that wasn't purchased. Signal = the
      // INSURANCE BookingExtra's `details` ('PEL;Health' = both, 'PEL' = LP-only).
      // Requires AY so the block never renders orphaned on a short-course letter;
      // null/absent details → hidden (we don't assert cover we can't evidence).
      'booking.has_medical_insurance': (() => {
        const isAy = (booking?.courses || []).some(
          (c: any) => /academic year|life ?pass|renewal/i.test(c.name || '') || c.isRenewal,
        );
        if (!isAy) return '';
        const extras = (booking as any)?.extras || [];
        const hasHealth = extras.some(
          (e: any) => e.active && e.extraType === 'INSURANCE' && /health|medical/i.test(e.details || ''),
        );
        return hasHealth ? '1' : '';
      })(),
      'booking.agency': (booking as any)?.agency?.name || '',
      'booking.amount_paid': booking?.amountPaid ? `€${Number(booking.amountPaid).toFixed(2)}` : '',
      'booking.amount_open': booking?.amountOpen ? `€${Number(booking.amountOpen).toFixed(2)}` : '',
      // Truthy ('1') while a balance is still payable → drives the host-booking
      // email's "Confirmation Pending" notice ({if confirmation_pending}). Blank
      // once paid in full, so the notice vanishes. (Host-family bookings only.)
      'booking.confirmation_pending': (Number(booking?.amountOpen || 0) > 0.5) ? '1' : '',
      'booking.currency': booking?.currency || 'EUR',

      // Agency / Commission
      'agency.name': (booking as any)?.agency?.name || '',
      'agency.contact': (booking as any)?.agency?.contactPerson || '',
      // Agent FIRST name (first word of the contact person), and a smart greeting
      // token that prefers the agent's first name and falls back to the agency
      // name — so "Dear {{agency.contact_or_name}}" reads naturally either way.
      'agency.contact_first_name': ((booking as any)?.agency?.contactPerson || '').trim().split(/\s+/)[0] || '',
      'agency.contact_or_name': (((booking as any)?.agency?.contactPerson || '').trim().split(/\s+/)[0]) || (booking as any)?.agency?.name || '',
      'agency.email': (booking as any)?.agency?.email || '',
      'agency.commission_rate': (booking as any)?.agency?.commissionRate ? String((booking as any).agency.commissionRate) + '%' : '',
      'agency.commission_amount': (() => {
        const rate = Number((booking as any)?.agency?.commissionRate || 0);
        const total = Number(booking?.amountTotal || 0);
        return rate > 0 ? `€${(total * rate / 100).toFixed(2)}` : '';
      })(),
      'agency.net_amount': (() => {
        const rate = Number((booking as any)?.agency?.commissionRate || 0);
        const total = Number(booking?.amountTotal || 0);
        return rate > 0 ? `€${(total - (total * rate / 100)).toFixed(2)}` : booking?.amountTotal ? `€${Number(booking.amountTotal).toFixed(2)}` : '';
      })(),

      // Course fee breakdown
      'booking.course_fee': course?.fee ? `€${Number(course.fee).toFixed(2)}` : booking?.amountTotal ? `€${Number(booking.amountTotal).toFixed(2)}` : '',
      'booking.course_commission': (() => {
        const rate = Number((booking as any)?.agency?.commissionRate || 0);
        const fee = Number(course?.fee || booking?.amountTotal || 0);
        return rate > 0 ? `€${(fee * rate / 100).toFixed(2)}` : '';
      })(),
      'booking.course_net': (() => {
        const rate = Number((booking as any)?.agency?.commissionRate || 0);
        const fee = Number(course?.fee || booking?.amountTotal || 0);
        return rate > 0 ? `€${(fee - (fee * rate / 100)).toFixed(2)}` : `€${fee.toFixed(2)}`;
      })(),
      // Net-to-Gross transformation for the Net-to-Gross Invoice document.
      // booking.amountTotal is the NET amount (post Xero-sync flip). Gross is
      // derived via the complement of the commission rate:
      //   Gross = Net ÷ (1 − rate/100)      // 22% → Gross = Net ÷ 0.78
      // Commission rate is fetched from HubSpot (never local) per the
      // agency-data rule in CLAUDE.md.
      'booking.gross_from_net': (() => {
        const rate = hsCommissionRate;
        const net = Number(course?.fee || booking?.amountTotal || 0);
        if (rate == null || rate <= 0 || rate >= 100) {
          // No live HubSpot rate — can't derive gross. Return net as a safe fallback
          // so the template still renders without blowing up.
          return net ? `€${net.toFixed(2)}` : '';
        }
        const gross = net / (1 - rate / 100);
        return `€${gross.toFixed(2)}`;
      })(),

      // Flight (inbound / outbound — used by transfer emails)
      'student.flight_number':           (student as any).flightNumber || '',
      'student.flight_date':             fmtDate((student as any).flightDate),
      'student.flight_time':             (student as any).flightTime || '',
      'student.outbound_flight_number':  (student as any).outboundFlightNumber || '',
      'student.outbound_flight_date':    fmtDate((student as any).outboundFlightDate),
      'student.outbound_flight_time':    (student as any).outboundFlightTime || '',

      // Visa
      'student.visa_from':  fmtDate(student.visaFrom),
      'student.visa_until': fmtDate(student.visaUntil),
      // Visa-aware course-window dates for letters that need the embassy/INIS
      // to see the full Stamp-2 window (LoA, ISD). For Academic Year bookings
      // the window is stretched to the full 35-week stay (tuition + holidays);
      // manually-entered visa dates always win. Falls back to course dates for
      // short courses. NonEU LoA template uses these in place of booking.start/end.
      'booking.visa_start_date': fmtDate(_visaWindow.start),
      'booking.visa_end_date':   fmtDate(_visaWindow.end),
      'booking.visa_weeks':      _visaWindow.weeks != null ? String(_visaWindow.weeks) : (bookingTotalWeeks > 0 ? String(bookingTotalWeeks) : ''),
      // Manual/stored code wins; otherwise derive it. Before a placement test sets
      // a level, an Academic Year booking has none — default the derivation level to
      // A2 (the same default the booking's start level takes) so the ILEP code is
      // present and the LoA isn't blocked. Re-derived every render off the CURRENT
      // course level, so it self-corrects once the test lands (no frozen A2 on a
      // later letter). Non-AY / EU resolve to '' (deriveIlepCode returns null).
      'booking.ilep_code': (course as any)?.ilepCode || deriveIlepCode((course as any)?.name || null, ((course as any)?.level || 'A2'), (student as any)?.nationality || null) || '',
      'ilep_course_code': (course as any)?.ilepCode || deriveIlepCode((course as any)?.name || null, ((course as any)?.level || 'A2'), (student as any)?.nationality || null) || '',  // legacy Fidelo placeholder name

      // Exam / IRP sentences used in academic letters. Both render empty
      // when the underlying data is missing, so {{token}} is safe to drop
      // into a template — no orphan punctuation, no "TBD" placeholder.
      // The sentences ARE the full sentence (including the trailing full
      // stop and gendered pronoun) so the template author just adds them
      // as a paragraph: <p>{{student.irp_holiday_sentence}}</p>.
      'student.exam':            (student as any).exam || '',
      'student.exam_date':       fmtDate((student as any).examDate),
      'student.exam_sentence': (() => {
        const d = (student as any).examDate;
        if (!d) return '';
        const fullName = `${salutation} ${student.firstName} ${student.lastName || ''}`.trim();
        const possessive = pronounPossessive;
        return `${fullName} is scheduled to sit ${possessive} end-of-course exam on ${fmtDate(d)}.`;
      })(),
      'student.visa_id':                (student as any).visaId || '',  // IRP number
      'student.irp_holiday_sentence': (() => {
        const exp = (student as any).visaUntil;
        if (!exp) return '';
        const fullName = `${salutation} ${student.firstName} ${student.lastName || ''}`.trim();
        const subject = pronounSubjectCap;
        return `${fullName}'s IRP is due to expire on ${fmtDate(exp)}. ${subject} remains on course holidays until this date.`;
      })(),

      // Accommodation
      'accommodation.contact_name': [accommProvider?.contactFirstName, accommProvider?.contactLastName].filter(Boolean).join(' '),
      'accommodation.contact_first_name': accommProvider?.contactFirstName || '',
      'accommodation.provider_name': accommProvider?.name || '',
      'accommodation.address': accommProvider ? [accommProvider.address, accommProvider.addressAddon, accommProvider.city, accommProvider.zip].filter(Boolean).join(', ') : '',
      // Host name + address for document tables (LOA etc.): real values once a
      // bed is placed; "To be confirmed" while accommodation is booked but
      // unplaced; empty only when no accommodation is booked at all. Keeps the
      // LOA accommodation table populated (and unflagged by the validator)
      // pre-placement instead of showing blanks.
      'accommodation.host_name': accommProvider?.name || (accomm ? 'To be confirmed' : ''),
      'accommodation.host_address': accommProvider
        ? [accommProvider.address, accommProvider.addressAddon, accommProvider.city, accommProvider.zip].filter(Boolean).join(', ')
        : (accomm ? 'To be confirmed' : ''),
      'accommodation.phone': accommProvider?.phone || accommProvider?.mobile || '',
      'accommodation.email': accommProvider?.email || '',
      'accommodation.portal_link': accommPortalLink,
      'accommodation.start_date': fmtDate(accomm?.startDate),
      'accommodation.end_date': fmtDate(accomm?.endDate),
      'accommodation.weeks': accomm?.weeks ? String(accomm.weeks) : '',
      'accommodation.room_type': accomm?.roomType || '',
      'accommodation.board': accomm?.board || '',
      'accommodation.type': accomm?.accommodationType || '',
      // Google Maps link for the host address — used by arrival emails so
      // students can tap straight into navigation. Empty when no provider
      // is placed (i.e. the address string is empty).
      'accommodation.googlemaps': (() => {
        if (!accommProvider) return '';
        const addr = [accommProvider.address, accommProvider.addressAddon, accommProvider.city, accommProvider.zip].filter(Boolean).join(', ');
        return addr ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addr)}` : '';
      })(),

      // Insurance (Learner Protection Policy column + new from/until dates).
      // Single product in-house (8-month Arachas/Chubb) so we just surface
      // the policy reference + coverage window; provider isn't a token.
      'insurance.policy_number': (student as any).learnerProtectionPolicy || '',
      'insurance.from':          fmtDate((student as any).insuranceFrom),
      'insurance.until':         fmtDate((student as any).insuranceUntil),

      // Transfer flag — truthy when the student has an active airport
      // pickup OR dropoff BookingExtra. Rendered as the human label
      // ("Airport pickup booked" / "Airport dropoff booked" / both) so the
      // recipient sees something meaningful, while {if booked_transfer}
      // blocks still work because the string is truthy.
      'booked_transfer': (() => {
        const extras = (booking as any)?.extras || [];
        const types = new Set(extras.filter((e: any) => e.active).map((e: any) => e.extraType));
        const pickup  = types.has('AIRPORT_PICKUP');
        const dropoff = types.has('AIRPORT_DROPOFF');
        if (pickup && dropoff) return 'Airport pickup and dropoff booked';
        if (pickup)            return 'Airport pickup booked';
        if (dropoff)           return 'Airport dropoff booked';
        return '';
      })(),

      // Institution
      'institution.name': 'ULearn English Language School',
      'institution.address': 'Dublin, Ireland',

      // Document (placeholders — replaced at issue time)
      'document.issue_date': new Date().toLocaleDateString('en-IE', { day: '2-digit', month: 'long', year: 'numeric' }),
      'document.issue_date_short': new Date().toLocaleDateString('en-IE', { day: '2-digit', month: '2-digit', year: 'numeric' }),
    };

    return { tokens, student, booking, course };
  }

  function renderTemplate(htmlTemplate: string, tokens: Record<string, string>): string {
    let html = htmlTemplate;
    // 1. Resolve Fidelo-style {if token}...{/if} blocks. Render the inner content if
    //    the token has a truthy value, otherwise drop the entire block.
    //    Tries the bare key first, then booking.* and student.* prefixes — covers both
    //    legacy Fidelo placeholders ({if ilep_course_code}) and SIS dotted forms.
    html = html.replace(/\{if\s+([a-z0-9_.]+)\}([\s\S]*?)\{\/if\}/gi, (_m, key, content) => {
      const k = key.trim();
      // Try the bare key, then namespaced fallbacks. accommodation.* added so
      // legacy Fidelo conditionals like {if accommodation_phone} still resolve.
      const v = tokens[k]
        || tokens['booking.' + k]
        || tokens['student.' + k]
        || tokens['accommodation.' + k]
        || tokens[k.replace(/^accommodation_/, 'accommodation.')]
        || '';
      return v ? content : '';
    });
    // 2. Resolve {{token.name}} (SIS dotted) — empty string if missing.
    //    `document.*` placeholders are preserved as literals so issueDocument()
    //    can fill them in at issue time (qr, version, number, verification_url).
    //    `custom.*` placeholders used to be preserved too, but that left visible
    //    {{custom.x}} text in drafts when staff didn't fill in the editable
    //    block (e.g. accommodation_details for a student with no accommodation).
    //    We now render them empty by default; the editor can still inject
    //    content via editableFields, which is merged in at edit time.
    html = html.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
      const trimmed = key.trim();
      if (trimmed.startsWith('document.')) {
        return tokens[trimmed] !== undefined ? tokens[trimmed] : match;
      }
      return tokens[trimmed] || '';
    });
    return html;
  }

  // ── DOCUMENT RECORDS ──────────────────────

  // Helper: enforce the LoA payment gate. Returns silently when the caller
  // is allowed to proceed; throws a human-readable error otherwise. Admin
  // role bypasses the gate entirely. Used by both generateDraft (block
  // creation) and issueDocument (block issuance) so a sales user can never
  // round-trip an LoA out to a student with an outstanding balance.
  async function assertLoaPaymentGate(
    template: { slug?: string | null; requiresFullPayment?: boolean | null } | null,
    bookingId: number | null | undefined,
    callerRole?: string,
  ) {
    // Gate applies when the template is explicitly flagged requiresFullPayment.
    // Legacy fallback: any slug matching ^lo?a[-_] is still gated even if the
    // flag wasn't backfilled (belt-and-braces — the seed sets the flag too).
    const slug = template?.slug || null;
    const gated = !!template?.requiresFullPayment || (!!slug && /^lo?a[-_]/i.test(slug));
    if (!gated) return;
    if (callerRole === 'admin') return;
    if (!bookingId) {
      throw new Error('Cannot generate this document: it is not linked to a booking');
    }
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      select: {
        amountPaid: true, amountTotal: true, amountOpen: true, status: true,
        student: { select: { visaStatus: true } },
        payments: { select: { amount: true, type: true, method: true } },
      },
    });
    // ESCROW is the GREEN LIGHT for a visa-required (VBD) LoA, not a block: the
    // student needs the LoA to lodge their embassy application, and TM escrow
    // secures the fees (refunded if the visa is refused). So once the escrow-held
    // funds (plus any settled payment) cover the full course fee, issue the LoA.
    // We only block when the booking is in ESCROW but the fees aren't fully
    // secured yet — that's a genuinely unfunded booking. (Bypassing here also
    // skips the visa-status + balance checks below, which is correct: at LoA-
    // issue time the visa is inherently still pending, and escrow funds don't
    // land in amountPaid.)
    if (booking?.status === 'ESCROW') {
      const escrowTotal = Number(booking?.amountTotal || 0);
      const escrowHeld = (booking?.payments || [])
        .filter(p => p.type === 'Escrow' || /escrow/i.test(p.method || ''))
        .reduce((sum, p) => sum + Number(p.amount || 0), 0);
      const secured = Number(booking?.amountPaid || 0) + escrowHeld;
      if (escrowTotal > 0 && secured >= escrowTotal - 1.00) return; // fees fully secured in escrow → allow
      throw new Error(
        `Document blocked: booking is in ESCROW but the fees aren't fully secured yet ` +
        `(secured €${secured.toFixed(2)} of €${escrowTotal.toFixed(2)} — escrow €${escrowHeld.toFixed(2)} + settled €${Number(booking?.amountPaid || 0).toFixed(2)}). ` +
        `Admin override available.`
      );
    }
    const visa = booking?.student?.visaStatus;
    if (visa === 'Pending' || visa === 'Appeal') {
      throw new Error(
        `Document blocked: student visa status is "${visa}". Wait for visa decision ` +
        `before issuing. Admin override available.`
      );
    }
    const paid  = Number(booking?.amountPaid  || 0);
    const total = Number(booking?.amountTotal || 0);
    // amountOpen is the booking's reconciled balance (computed upstream
    // when payments / reg-fee waivers / currency rounding settle). Prefer
    // it over (total - paid), which can drift by a few euros due to those
    // adjustments — e.g. a comped €50 reg fee leaves total/paid out of
    // sync but amountOpen at 0. Fall back to (total - paid) only when
    // amountOpen is missing. €1 tolerance to absorb pure rounding noise.
    // Empty booking (total <= 0) is still blocked — that's a data-integrity
    // signal, not a fully-paid one.
    const openExplicit = booking?.amountOpen != null ? Number(booking.amountOpen) : null;
    const balance = openExplicit != null ? openExplicit : (total - paid);
    const BALANCE_TOLERANCE = 1.00;
    if (total <= 0 || balance > BALANCE_TOLERANCE) {
      const shown = Math.max(0, balance);
      throw new Error(
        `Document blocked: full payment required first ` +
        `(paid €${paid.toFixed(2)} of €${total.toFixed(2)}, balance €${shown.toFixed(2)}). ` +
        `Admin override available.`
      );
    }
  }

  async function generateDraft(templateId: number, studentId: number, bookingId?: number | null, callerRole?: string) {
    const template = await prisma.documentTemplate.findUnique({ where: { id: templateId } });
    if (!template) throw new Error('Template not found');

    await assertLoaPaymentGate(template, bookingId ?? null, callerRole);

    // Static-PDF templates (e.g. SLA, legal/policy attachments) don't go
    // through token resolution or HTML render — the PDF on disk is the
    // document. We still create a DocumentRecord so the issuance is tracked
    // per-student exactly like a regular generated doc; getDocumentPdf
    // detects the staticPdfPath and serves the file directly.
    if ((template as any).staticPdfPath) {
      const record = await prisma.documentRecord.create({
        data: {
          studentId,
          bookingId: bookingId || null,
          templateId: template.id,
          documentType: template.documentType,
          sourceJson: '{}',
          contentHtml: '',  // intentionally empty — staticPdfPath wins at PDF-fetch time
          templateVersion: template.version,
          status: 'DRAFT',
        },
      });
      return { record, missing: [], tokens: {} };
    }

    const { tokens } = await resolveTokens(studentId, bookingId, { certAggregate: template.slug === 'Attendance-Final', slug: template.slug });
    const rendered = renderTemplate(template.htmlTemplate, tokens);

    // Find missing tokens (exclude custom blocks and document.* tokens resolved at issue time)
    const missing = (rendered.match(/\{\{[^}]+\}\}/g) || [])
      .filter(t => !t.includes('custom.') && !t.includes('document.'));

    const record = await prisma.documentRecord.create({
      data: {
        studentId,
        bookingId: bookingId || null,
        templateId: template.id,
        documentType: template.documentType,
        sourceJson: JSON.stringify(tokens),
        contentHtml: rendered,
        templateVersion: template.version,
        status: 'DRAFT',
      },
    });

    return { record, missing, tokens };
  }

  async function getDocument(id: number) {
    const doc = await prisma.documentRecord.findUnique({
      where: { id },
      include: { template: true, dispatches: true, supersededBy: true },
    });
    if (!doc) return null;
    // Surface booking payment state on the doc payload so the UI can render
    // the LoA payment gate (red warning + disabled Issue button for non-admin)
    // without an extra round-trip. Cheap join — single Booking row.
    let bookingPayment: { amountPaid: number; amountTotal: number; balance: number; escrowSecured: boolean } | null = null;
    if (doc.bookingId) {
      const b = await prisma.booking.findUnique({
        where: { id: doc.bookingId },
        select: {
          amountPaid: true, amountTotal: true, status: true,
          payments: { select: { amount: true, type: true, method: true } },
        },
      });
      if (b) {
        const paid  = Number(b.amountPaid  || 0);
        const total = Number(b.amountTotal || 0);
        // Escrow-secured: booking in ESCROW with escrow-held funds (+ settled)
        // covering the full fee. The LoA gate treats this as paid — a VBD student
        // needs the LoA to lodge the visa, and the fees are secured in escrow.
        const escrowHeld = (b.payments || [])
          .filter(p => p.type === 'Escrow' || /escrow/i.test(p.method || ''))
          .reduce((sum, p) => sum + Number(p.amount || 0), 0);
        const escrowSecured = b.status === 'ESCROW' && total > 0 && (paid + escrowHeld) >= total - 1.00;
        bookingPayment = { amountPaid: paid, amountTotal: total, balance: Math.max(0, total - paid), escrowSecured };
      }
    }
    return { ...doc, bookingPayment };
  }

  async function listDocuments(filters: { studentId?: number; bookingId?: number; status?: DocumentStatus } = {}) {
    const where: any = {};
    if (filters.studentId) where.studentId = filters.studentId;
    if (filters.bookingId) where.bookingId = filters.bookingId;
    if (filters.status) where.status = filters.status;
    const docs = await prisma.documentRecord.findMany({
      where,
      include: { template: { select: { name: true, slug: true } } },
      orderBy: { createdAt: 'desc' },
    });
    // Hydrate student names in a single query
    const studentIds = Array.from(new Set(docs.map(d => d.studentId)));
    const students = studentIds.length
      ? await prisma.student.findMany({
          where: { id: { in: studentIds } },
          select: { id: true, firstName: true, lastName: true },
        })
      : [];
    const byId = new Map(students.map(s => [s.id, s]));
    return docs.map(d => ({ ...d, student: byId.get(d.studentId) || null }));
  }

  async function updateDraft(id: number, data: { contentHtml?: string; editableFields?: string }) {
    const doc = await prisma.documentRecord.findUnique({ where: { id } });
    if (!doc) throw new Error('Document not found');
    if (doc.status !== 'DRAFT') throw new Error('Cannot edit: document is locked (status: ' + doc.status + ')');

    // A human editing the letter is a deliberate deviation — pin it so the
    // living-document booking sync never silently overwrites their change
    // (e.g. the manual "24 weeks" override). From here it's version-controlled.
    return prisma.documentRecord.update({
      where: { id },
      data: {
        contentHtml: data.contentHtml,
        editableFields: data.editableFields,
        autoSync: false,
      },
    });
  }

  // In-place correction of an ISSUED living document. Unlike New Version (which
  // supersedes + spawns a draft) this keeps the SAME record, versionNo, status and
  // verification token — so the portal / student app / QR-scan surface the fix
  // immediately with no reissue and (usually) the recipient none the wiser. Pins
  // the doc (autoSync=false) so booking-date sync can't clobber the manual edit,
  // and appends a who/when entry to the internal audit log (autoSyncLog).
  async function liveEditDocument(id: number, contentHtml: string, editedBy?: string) {
    const doc = await prisma.documentRecord.findUnique({ where: { id } });
    if (!doc) throw new Error('Document not found');
    if (doc.status !== 'ISSUED') throw new Error('Live Edit is only for issued documents (drafts use Edit Content)');
    if (typeof contentHtml !== 'string' || !contentHtml.trim()) throw new Error('Empty content');
    const prevLog = Array.isArray(doc.autoSyncLog) ? (doc.autoSyncLog as any[]) : [];
    const entry = { at: new Date().toISOString(), action: 'live-edit', by: editedBy || 'unknown' };
    return prisma.documentRecord.update({
      where: { id },
      data: {
        contentHtml,
        autoSync: false,
        lastAutoSyncAt: new Date(),
        autoSyncLog: [...prevLog, entry] as any,
      },
    });
  }

  // ── Living-document sync (LoA / visa letters) ──────────────────────────────
  // The booking course date is the single source of truth. When it changes,
  // re-render every ISSUED, still-auto-tracking LoA for that booking IN PLACE —
  // same record, same versionNo, SAME verification token — so the student's
  // portal copy and the scanned QR both follow the booking with no reissue and
  // no resend. Pinned docs (autoSync=false, i.e. hand-edited or versioned) are
  // skipped. Each silent update is timestamped + appended to autoSyncLog and
  // logged. Best-effort: never throw into the booking-save path.
  // ── Shared in-place re-render ──────────────────────────────────────────────
  // Re-derive an ISSUED document's HTML from CURRENT field data, in place —
  // same record, same versionNo, SAME verification token. This is the one true
  // render path shared by the LoA booking-date auto-sync and the on-demand
  // "refresh from source". It re-bakes the existing token's QR (never mints a
  // new one) and only writes when the content actually changed (or a dataPatch
  // is supplied). `makeLogEntry(tokens)` lets each caller stamp its own audit
  // entry shape into autoSyncLog. Returns { record, changed }.
  async function renderIssuedDocInPlace(
    doc: any,
    opts: { makeLogEntry?: (tokens: Record<string, string>) => any; dataPatch?: Record<string, any> } = {},
  ): Promise<{ record: any; changed: boolean }> {
    const tpl = doc.template || await prisma.documentTemplate.findUnique({ where: { id: doc.templateId } });
    if (!tpl?.htmlTemplate || (tpl as any).staticPdfPath) {
      throw new Error('This document is a static/uploaded PDF — there is no template to re-render from source.');
    }
    const { tokens } = await resolveTokens(doc.studentId, doc.bookingId, { certAggregate: tpl.slug === 'Attendance-Final', slug: tpl.slug });
    // Freeze document.issue_date to the doc's ACTUAL issue date. resolveTokens is
    // doc-agnostic and returns "today" for issue_date, so without this override
    // every re-render (this repair path AND booking auto-sync) would silently
    // drift an issued letter's issue date forward to the day it was re-rendered.
    if (doc.issuedAt) {
      tokens['document.issue_date'] = new Date(doc.issuedAt).toLocaleDateString('en-IE', { day: '2-digit', month: 'long', year: 'numeric' });
      tokens['document.issue_date_short'] = new Date(doc.issuedAt).toLocaleDateString('en-IE', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }
    let html = renderTemplate(tpl.htmlTemplate, tokens);

    // Re-bake the EXISTING verification token's QR / URL — never mint a new
    // token, so the link/QR the student already holds keeps working.
    const token = doc.verificationToken;
    if (token) {
      const verificationUrl = `${BASE_URL}/sis/verify/${token}`;
      const qrDataUri = await QRCode.toDataURL(verificationUrl, { type: 'image/png', width: 150, margin: 1 });
      const qrImg = `<img src="${qrDataUri}" alt="QR Verification" style="width:86px;height:86px">`;
      html = html.includes('{{document.qr}}')
        ? html.replace(/\{\{document\.qr\}\}/g, qrImg)
        : html.replace(/<img[^>]*alt="QR Verification"[^>]*>/g, qrImg);
      html = html.includes('{{document.verification_url}}')
        ? html.replace(/\{\{document\.verification_url\}\}/g, verificationUrl)
        : html.replace(/https?:\/\/[^\s"'<]*\/sis\/verify\/[A-Za-z0-9_-]+/g, verificationUrl);
    }
    const stampYear = (doc.issuedAt ? new Date(doc.issuedAt) : new Date()).getFullYear();
    html = html.replace(/\{\{document\.version\}\}/g, `v${doc.versionNo}.0`);
    html = html.replace(/\{\{document\.number\}\}/g, `DOC-${stampYear}-${String(doc.id).padStart(6, '0')}`);

    const changed = html !== doc.contentHtml;
    const dataPatch = opts.dataPatch || {};
    if (!changed && Object.keys(dataPatch).length === 0) return { record: doc, changed: false };

    const prevLog = Array.isArray(doc.autoSyncLog) ? (doc.autoSyncLog as any[]) : [];
    const entry = { at: new Date().toISOString(), ...(opts.makeLogEntry ? opts.makeLogEntry(tokens) : {}) };
    const record = await prisma.documentRecord.update({
      where: { id: doc.id },
      data: {
        contentHtml: html,
        sourceJson: JSON.stringify(tokens),
        lastAutoSyncAt: new Date(),
        autoSyncLog: [...prevLog, entry] as any,
        ...dataPatch,
      },
    });
    return { record, changed };
  }

  // Reset an ISSUED document fully to source — a clean whole-document re-render
  // from the template + current field data. Unlike surgical Refresh, this
  // DISCARDS any manual Live Edit (static text included) and realigns the entire
  // letter to source truth — the fix for a doc whose field text was hand-edited
  // and diverged from the source. Same record / versionNo / verification token.
  // Clears the pin (autoSync=true): there are no manual edits left to protect.
  async function resetDocumentFromSource(docId: number, opts: { by?: string } = {}) {
    const { by = 'unknown' } = opts;
    const doc = await prisma.documentRecord.findUnique({ where: { id: docId }, include: { template: true } });
    if (!doc) throw new Error('Document not found');
    if (doc.status !== 'ISSUED') throw new Error('Reset is only for issued documents (drafts use Edit Content).');
    const { record } = await renderIssuedDocInPlace(doc, {
      makeLogEntry: () => ({ action: 'reset-from-source', by, reason: 'full re-render — realigned entire document to source (manual edits discarded)' }),
      dataPatch: { autoSync: true },
    });
    console.log(`[reset-from-source] doc #${docId} by ${by} — full re-render from source`);
    return record;
  }

  // ── Living-document sync (LoA / visa letters) ──────────────────────────────
  // The booking course date is the single source of truth. When it changes,
  // re-render every ISSUED, still-auto-tracking LoA for that booking IN PLACE.
  // Pinned docs (autoSync=false) are skipped. Best-effort: never throw into the
  // booking-save path. Routes through the shared renderIssuedDocInPlace helper.
  const LOA_DOC_TYPE = 'success/visa';
  async function syncLoaToBooking(bookingId: number, reason = 'booking course dates changed'): Promise<number[]> {
    const docs = await prisma.documentRecord.findMany({
      where: { bookingId, status: 'ISSUED', autoSync: true, documentType: LOA_DOC_TYPE },
      include: { template: true },
    });
    const synced: number[] = [];
    for (const doc of docs) {
      try {
        const tpl = doc.template;
        if (!tpl?.htmlTemplate || (tpl as any).staticPdfPath) continue;
        const { changed } = await renderIssuedDocInPlace(doc, {
          makeLogEntry: (tokens) => ({
            reason,
            start: tokens['booking.visa_start_date'] || '',
            end: tokens['booking.visa_end_date'] || '',
            weeks: tokens['booking.visa_weeks'] || '',
          }),
        });
        if (!changed) continue;   // dates unchanged → nothing to do
        console.log(`[LoA auto-sync] doc #${doc.id} (booking ${bookingId}, ${reason})`);
        synced.push(doc.id);
      } catch (e: any) {
        console.error(`[LoA auto-sync] doc #${doc.id} failed:`, e?.message || e);
      }
    }
    return synced;
  }

  // ── On-demand "refresh from source" (SURGICAL — field values only) ─────────
  // Update ONLY the dynamic field values that changed, in place — NOT a whole-
  // document re-render. We start from the CURRENT contentHtml (so any Live Edit
  // to static text is preserved untouched) and swap each changed field's OLD
  // value → NEW value, anchored on the old value stored in sourceJson (the exact
  // token map used at last render). Same record / versionNo / verification token
  // / QR — a field correction (e.g. a wrong DOB) flows into the letter without a
  // manual HTML edit, a reissue, OR clobbering bespoke wording. Non-destructive
  // by construction, so no pin/force gymnastics: it works on any ISSUED doc,
  // Live-Edited or not, and never removes a manual edit.
  // Inject a value for a field that was BLANK at issue time (so there's no old
  // value to find-and-replace). Anchors on the static template text sitting
  // immediately BEFORE the field's token — the stretch between the previous
  // token and this one, which is pure static markup and typically carries the
  // field's label (e.g. "<strong>Date of Birth</strong></td><td …>"), making it
  // unique in the rendered doc. Returns the patched html, or null if no unique
  // anchor was found (caller then leaves the field for a New Version).
  function injectBlankField(field: string, newV: string, html: string, templateHtml: string): string | null {
    const tokRe = new RegExp('\\{\\{\\s*' + field.replace(/[.]/g, '\\.') + '\\s*\\}\\}');
    const m = tokRe.exec(templateHtml);
    if (!m) return null;
    const tokenPos = m.index;
    const prevEnd = templateHtml.lastIndexOf('}}', tokenPos - 1);
    let prefix = templateHtml.slice(prevEnd < 0 ? 0 : prevEnd + 2, tokenPos);
    // The rendered doc has conditional/loop tags and any stray tokens removed —
    // strip them from the anchor so it matches the baked HTML.
    prefix = prefix
      .replace(/\{if\s+[^}]+\}/gi, '').replace(/\{\/if\}/gi, '').replace(/\{else\}/gi, '')
      .replace(/\{\{[^}]+\}\}/g, '').replace(/\{[a-z_]+\}/gi, '');
    if (!prefix.trim()) return null;
    // Nearest-to-token slice is the most label-bearing + least likely to overlap
    // an unrelated hand-edit further up the doc.
    const anchor = prefix.length > 220 ? prefix.slice(-220) : prefix;
    const idx = html.indexOf(anchor);
    if (idx < 0) return null;
    if (html.indexOf(anchor, idx + 1) >= 0) return null;   // not unique — bail
    const at = idx + anchor.length;
    return html.slice(0, at) + newV + html.slice(at);
  }

  async function refreshDocumentFromSource(docId: number, opts: { by?: string } = {}) {
    const { by = 'unknown' } = opts;
    const doc = await prisma.documentRecord.findUnique({ where: { id: docId }, include: { template: true } });
    if (!doc) throw new Error('Document not found');
    if (doc.status !== 'ISSUED') throw new Error('Refresh from source is only for issued documents (drafts use Edit Content).');
    const tpl = doc.template;
    if (!tpl?.htmlTemplate || (tpl as any).staticPdfPath) {
      throw new Error('This document is a static/uploaded PDF — there are no source fields to refresh.');
    }

    const oldTokens: Record<string, any> = (() => {
      try { return JSON.parse(doc.sourceJson || '{}') || {}; } catch { return {}; }
    })();
    const { tokens: newTokens } = await resolveTokens(doc.studentId, doc.bookingId, { certAggregate: tpl.slug === 'Attendance-Final', slug: tpl.slug });

    let html = doc.contentHtml || '';
    const changed: { field: string; from: string; to: string }[] = [];
    const skipped: { field: string; reason: string }[] = [];

    // Replace longer OLD values first — a longer, more specific string is less
    // likely to collide with an unrelated substring (e.g. replace a full name
    // before a bare first name).
    const keys = Object.keys(oldTokens).sort((a, b) => String(oldTokens[b] ?? '').length - String(oldTokens[a] ?? '').length);
    for (const field of keys) {
      // Skip document.* meta-tokens (issue_date, version, number, qr, verification_url):
      // these are STAMPS frozen at issue time, not source fields — issue_date must
      // never drift to "today" on a refresh, and the QR/token are re-baked elsewhere.
      if (field.startsWith('document.')) continue;
      const oldV = oldTokens[field];
      const newV = newTokens[field];
      if (oldV == null || newV == null) continue;
      if (String(oldV) === String(newV)) continue;                 // unchanged field
      if (String(oldV).trim() === '') {
        // Blank at issue → nothing to find-and-replace. Try to INJECT the new
        // value at the field's slot by anchoring on the surrounding template
        // markup (e.g. a DOB added after the LOA was issued).
        if (String(newV).trim() !== '') {
          const patched = injectBlankField(field, String(newV), html, tpl.htmlTemplate);
          if (patched) { html = patched; changed.push({ field, from: '', to: String(newV) }); continue; }
        }
        skipped.push({ field, reason: 'was blank at issue and no unique anchor found — use New Version to introduce it' });
        continue;
      }
      if (html.includes(String(oldV))) {
        html = html.split(String(oldV)).join(String(newV));
        changed.push({ field, from: String(oldV), to: String(newV) });
      } else {
        skipped.push({ field, reason: 'old value not found in the document (it may have been hand-edited via Live Edit — left as-is)' });
      }
    }

    // Second pass: fields present in the CURRENT source but absent from the
    // issue-time snapshot entirely (token added to the template after issue, or
    // never captured). Inject any that now carry a value.
    for (const field of Object.keys(newTokens)) {
      if (field.startsWith('document.')) continue;
      if (Object.prototype.hasOwnProperty.call(oldTokens, field)) continue;   // handled above
      const newV = newTokens[field];
      if (newV == null || String(newV).trim() === '') continue;
      const patched = injectBlankField(field, String(newV), html, tpl.htmlTemplate);
      if (patched) { html = patched; changed.push({ field, from: '', to: String(newV) }); }
    }

    if (changed.length === 0) {
      console.log(`[refresh-from-source] doc #${docId} by ${by} — no field values changed`);
      return { document: doc, changed, skipped };
    }

    const prevLog = Array.isArray(doc.autoSyncLog) ? (doc.autoSyncLog as any[]) : [];
    const entry = { at: new Date().toISOString(), action: 'refresh-from-source', by, fields: changed.map(c => c.field), skipped: skipped.map(s => s.field) };
    const record = await prisma.documentRecord.update({
      where: { id: docId },
      data: {
        contentHtml: html,
        // Advance the baseline so a subsequent refresh diffs against these values.
        sourceJson: JSON.stringify(newTokens),
        lastAutoSyncAt: new Date(),
        autoSyncLog: [...prevLog, entry] as any,
        // NB: autoSync is deliberately left untouched — refresh preserves any
        // Live Edit, so a pinned doc stays pinned (booking auto-sync still won't
        // whole-doc re-render it).
      },
    });
    console.log(`[refresh-from-source] doc #${docId} by ${by} — updated ${changed.map(c => c.field).join(', ')}${skipped.length ? ` (skipped ${skipped.length})` : ''}`);
    return { document: record, changed, skipped };
  }

  async function issueDocument(id: number, issuedBy: string, callerRole?: string) {
    const doc = await prisma.documentRecord.findUnique({ where: { id } });
    if (!doc) throw new Error('Document not found');
    if (doc.status !== 'DRAFT') throw new Error('Only drafts can be issued');

    // LoA payment gate (same rule as draft creation). Admin override applies.
    const tpl = await prisma.documentTemplate.findUnique({
      where: { id: doc.templateId },
      select: { slug: true, requiresFullPayment: true },
    });
    await assertLoaPaymentGate(tpl, doc.bookingId, callerRole);

    const token = crypto.randomBytes(16).toString('base64url');
    const verificationUrl = `${BASE_URL}/sis/verify/${token}`;

    // Generate QR as data URI SVG
    const qrDataUri = await QRCode.toDataURL(verificationUrl, { type: 'image/png', width: 150, margin: 1 });

    // Inject QR into content
    let finalHtml = doc.contentHtml || '';
    const qrImg = `<img src="${qrDataUri}" alt="QR Verification" style="width:86px;height:86px">`;
    // Idempotent injection. First issue swaps the {{document.qr}} token. A
    // re-issued copy (createNewVersion clones the already-issued HTML) has the
    // token already consumed and an OLD baked QR/URL from the superseded
    // version — swap THOSE so the barcode always matches the live token.
    finalHtml = finalHtml.includes('{{document.qr}}')
      ? finalHtml.replace(/\{\{document\.qr\}\}/g, qrImg)
      : finalHtml.replace(/<img[^>]*alt="QR Verification"[^>]*>/g, qrImg);
    finalHtml = finalHtml.includes('{{document.verification_url}}')
      ? finalHtml.replace(/\{\{document\.verification_url\}\}/g, verificationUrl)
      : finalHtml.replace(/https?:\/\/[^\s"'<]*\/sis\/verify\/[A-Za-z0-9_-]+/g, verificationUrl);
    finalHtml = finalHtml.replace(/\{\{document\.version\}\}/g, `v${doc.versionNo}.0`);
    finalHtml = finalHtml.replace(/\{\{document\.number\}\}/g, `DOC-${new Date().getFullYear()}-${String(id).padStart(6, '0')}`);

    const now = new Date();

    // Look up student photo for snapshot
    const student = await prisma.student.findUnique({ where: { id: doc.studentId }, select: { profilePicture: true } });

    return prisma.documentRecord.update({
      where: { id },
      data: {
        contentHtml: finalHtml,
        verificationToken: token,
        status: 'ISSUED',
        issuedAt: now,
        issuedBy,
        lockedAt: now,
        photoAssetUsed: student?.profilePicture || null,
      },
    });
  }

  // Mint the gross receipt as a FIRST-CLASS document record so it rides the
  // exact same pipeline as the LoA: it lands in the student's document list,
  // surfaces in the portal + app, and supports Send / Notify with zero new
  // plumbing. The hard part — pulling the itemised figures live from the linked
  // HubSpot invoice (SIS only holds top-level totals) — is done by
  // buildGrossReceiptHtml, which already renders the escrow / partial / paid-in-
  // full states correctly. We just persist its output and issue it.
  async function generateReceiptDocument(bookingId: number, issuedBy: string) {
    // An ISSUED receipt requires a payment (unlike the on-demand partner display doc).
    const r = await buildGrossReceiptHtml(prisma, bookingId, { requirePayment: true });
    if (!r.ok) throw new Error(r.error);
    const booking = await prisma.booking.findUnique({ where: { id: bookingId }, select: { studentId: true } });
    if (!booking) throw new Error('Booking not found');
    const tpl = await prisma.documentTemplate.findUnique({ where: { slug: 'ULearn-Receipt' } });
    if (!tpl) throw new Error('Receipt template not found — restart to seed');
    const draft = await prisma.documentRecord.create({
      data: {
        studentId: booking.studentId,
        bookingId,
        templateId: tpl.id,
        documentType: tpl.documentType,
        sourceJson: JSON.stringify({ invoiceNumber: r.number, gross: r.gross }),
        contentHtml: r.html,          // fully rendered — tokens already resolved
        templateVersion: tpl.version,
        status: 'DRAFT',
      },
    });
    // Issue immediately — the content is final and the receipt template is not
    // payment-gated (assertLoaPaymentGate no-ops for it). 'admin' role keeps the
    // issue path clean regardless of caller.
    return issueDocument(draft.id, issuedBy, 'admin');
  }

  async function createNewVersion(originalId: number) {
    const original = await prisma.documentRecord.findUnique({ where: { id: originalId } });
    if (!original) throw new Error('Document not found');

    // Supersede the original
    await prisma.documentRecord.update({
      where: { id: originalId },
      data: { status: 'SUPERSEDED' },
    });

    // Create new version as draft
    const newDoc = await prisma.documentRecord.create({
      data: {
        studentId: original.studentId,
        bookingId: original.bookingId,
        templateId: original.templateId,
        documentType: original.documentType,
        sourceJson: original.sourceJson,
        contentHtml: original.contentHtml,
        editableFields: original.editableFields,
        templateVersion: original.templateVersion,
        versionNo: original.versionNo + 1,
        supersedesId: originalId,
        status: 'DRAFT',
        // A new version is a deliberate human intervention → pinned (no living
        // sync). It clones the original's HTML, which auto-sync has been keeping
        // current, so it starts from the latest dates.
        autoSync: false,
      },
    });

    return newDoc;
  }

  // ── Attached (uploaded) external documents — e.g. Arachas insurance policies.
  //    These are NOT generated: the uploaded PDF IS the document. We record them
  //    as ISSUED DocumentRecords so they ride the existing issued-docs rails
  //    (partner portal + student app "ULearn Documents" + admin) with zero
  //    per-surface wiring. No QR, no payment gate (we bypass issueDocument).

  // Find-or-create a lightweight template to categorise/name an attached doc.
  async function ensureAttachTemplate(slug: string, name: string, documentType: string) {
    const existing = await prisma.documentTemplate.findUnique({ where: { slug } });
    if (existing) return existing;
    return prisma.documentTemplate.create({
      data: {
        slug, name, documentType,
        category: 'attachments',
        // htmlTemplate is required by the schema but never rendered — the
        // attachedFilePath on each record wins at PDF-fetch time.
        htmlTemplate: `<!-- attached document: ${name}; the uploaded PDF is served directly -->`,
        active: true,
      },
    });
  }

  // attachedRelPath is relative to uploads/ (e.g. "student-docs/171234.pdf").
  async function attachExternalPdf(opts: {
    studentId: number; bookingId?: number | null;
    templateSlug: string; templateName: string; documentType: string;
    attachedRelPath: string; originalName?: string; uploadedBy: string;
  }) {
    const tpl = await ensureAttachTemplate(opts.templateSlug, opts.templateName, opts.documentType);
    const now = new Date();
    const rec = await prisma.documentRecord.create({
      data: {
        studentId: opts.studentId,
        bookingId: opts.bookingId ?? null,
        templateId: tpl.id,
        documentType: opts.documentType,
        sourceJson: JSON.stringify({ uploadedBy: opts.uploadedBy, originalName: opts.originalName || null, attached: true }),
        contentHtml: null,
        attachedFilePath: opts.attachedRelPath,
        templateVersion: tpl.version,
        status: 'ISSUED',
        issuedAt: now,
        issuedBy: opts.uploadedBy,
        lockedAt: now,
        autoSync: false,
      } as any,
      select: { id: true, documentType: true, issuedAt: true },
    });
    return { id: rec.id, documentType: rec.documentType };
  }

  // Read an uploaded Arachas policy: parse its fields onto the student, and
  // surface it as a ULearn Document — WITHOUT removing the original upload (it
  // stays in the bucket too). Idempotent: re-reading the same file updates the
  // fields but won't create a duplicate ULearn doc. `text` = the pdftotext.
  async function fileInsurancePolicy(opts: {
    studentId: number; bookingId?: number | null; subtype: 'medical' | 'learner_protection';
    attachedRelPath: string; originalName?: string; uploadedBy: string; text: string;
  }) {
    const { INSURANCE_META, extractInsuranceFields } = await import('./insurance-classifier');
    const meta = INSURANCE_META[opts.subtype];
    const f = extractInsuranceFields(opts.text, opts.subtype);

    const data: any = {};
    if (opts.subtype === 'medical') {
      if (f.policyNumber) data.medicalPolicy = f.policyNumber;
      if (f.from) data.medicalFrom = f.from;
      if (f.until) data.medicalUntil = f.until;
    } else {
      if (f.policyNumber) data.learnerProtectionPolicy = f.policyNumber;
      if (f.from) data.insuranceFrom = f.from;
      if (f.until) data.insuranceUntil = f.until;
    }
    if (Object.keys(data).length) await prisma.student.update({ where: { id: opts.studentId }, data });

    let recordId: number;
    const existing = await prisma.documentRecord.findFirst({ where: { studentId: opts.studentId, attachedFilePath: opts.attachedRelPath } as any, select: { id: true } });
    if (existing) recordId = existing.id;
    else {
      const rec = await attachExternalPdf({
        studentId: opts.studentId, bookingId: opts.bookingId ?? null,
        templateSlug: meta.slug, templateName: meta.name, documentType: meta.documentType,
        attachedRelPath: opts.attachedRelPath, originalName: opts.originalName, uploadedBy: opts.uploadedBy,
      });
      recordId = rec.id;
    }
    const iso = (d: Date | null) => d ? d.toISOString().slice(0, 10) : null;
    return { subtype: opts.subtype, name: meta.name, recordId, fields: { policyNumber: f.policyNumber, from: iso(f.from), until: iso(f.until), premium: f.premium } };
  }

  // Save CONFIRMED insurance fields (from the read dialog) onto the student and
  // surface the policy as a ULearn Document — the upload stays in the bucket.
  // Idempotent on the doc (dedup by attachedFilePath).
  async function saveInsurancePolicy(opts: {
    studentId: number; bookingId?: number | null; subtype: 'medical' | 'learner_protection';
    fields: { policyNumber?: string | null; from?: string | null; until?: string | null };
    attachedRelPath: string; originalName?: string; uploadedBy: string;
  }) {
    const { INSURANCE_META } = await import('./insurance-classifier');
    const meta = INSURANCE_META[opts.subtype];
    const toUtc = (s?: string | null) => (s && /^\d{4}-\d{2}-\d{2}/.test(s)) ? new Date(s.slice(0, 10) + 'T00:00:00.000Z') : null;
    const data: any = {};
    if (opts.subtype === 'medical') {
      data.medicalPolicy = opts.fields.policyNumber || null;
      data.medicalFrom = toUtc(opts.fields.from);
      data.medicalUntil = toUtc(opts.fields.until);
    } else {
      data.learnerProtectionPolicy = opts.fields.policyNumber || null;
      data.insuranceFrom = toUtc(opts.fields.from);
      data.insuranceUntil = toUtc(opts.fields.until);
    }
    await prisma.student.update({ where: { id: opts.studentId }, data });

    let recordId: number;
    const existing = await prisma.documentRecord.findFirst({ where: { studentId: opts.studentId, attachedFilePath: opts.attachedRelPath } as any, select: { id: true } });
    if (existing) recordId = existing.id;
    else {
      const rec = await attachExternalPdf({
        studentId: opts.studentId, bookingId: opts.bookingId ?? null,
        templateSlug: meta.slug, templateName: meta.name, documentType: meta.documentType,
        attachedRelPath: opts.attachedRelPath, originalName: opts.originalName, uploadedBy: opts.uploadedBy,
      });
      recordId = rec.id;
    }
    return { recordId, name: meta.name };
  }

  async function revokeDocument(id: number) {
    const doc = await prisma.documentRecord.findUnique({ where: { id } });
    if (!doc) throw new Error('Document not found');
    if (doc.status !== 'ISSUED') throw new Error('Only issued documents can be revoked');

    return prisma.documentRecord.update({
      where: { id },
      data: { status: 'REVOKED' },
    });
  }

  // ── VERIFICATION ──────────────────────────

  async function verify(token: string) {
    const doc = await prisma.documentRecord.findUnique({
      where: { verificationToken: token },
    });
    if (!doc) return null;

    const student = await prisma.student.findUnique({ where: { id: doc.studentId } });
    const booking = doc.bookingId
      ? await prisma.booking.findUnique({ where: { id: doc.bookingId }, include: { courses: true } })
      : null;
    // Same headline-course pick as resolveTokens — skip OTHER placeholders so
    // a verifier doesn't see "Unknown Course" for afternoon students whose
    // booking has an OTHER row at courses[0]. See note in resolveTokens.
    const REAL_CATEGORIES = new Set(['MORNING','MORNING_PLUS','AFTERNOON','AFTERNOON_PLUS','INTENSIVE','PRIVATE']);
    const realCourses = (booking?.courses || []).filter(c => REAL_CATEGORIES.has(String(c.category)));
    const ordered = [...realCourses].sort((a, b) => {
      const ta = a.startDate ? new Date(a.startDate).getTime() : Infinity;
      const tb = b.startDate ? new Date(b.startDate).getTime() : Infinity;
      return ta - tb;
    });
    const course = ordered[0] || booking?.courses?.[0];

    return {
      status: doc.status,
      documentType: doc.documentType,
      versionNo: doc.versionNo,
      issuedAt: doc.issuedAt,
      student: student ? {
        fullName: `${student.firstName} ${student.lastName || ''}`,
        dob: student.birthday,
        nationality: student.nationality,
      } : null,
      booking: booking ? (() => {
        // Visa window = course start + 35-week AY entitlement, computed live so
        // the QR always reflects the CURRENT booking (the source of truth). When
        // the course start moves, the QR follows it; the printed LoA must be
        // regenerated to match (it does not auto-follow once issued). AY →
        // 35-week stay; manual visa dates win; short courses fall back to the
        // course window.
        const vw = computeVisaWindow({
          visaFrom: (student as any)?.visaFrom,
          visaUntil: (student as any)?.visaUntil,
          courseName: course?.name,
          courseStart: course?.startDate,
          courseEnd: course?.endDate,
        });
        return {
          reference: `BK-${new Date(booking.createdAt).getFullYear()}-${String(booking.id).padStart(6, '0')}`,
          courseName: course?.name,
          startDate: vw.start,
          endDate:   vw.end,
          weeks:     vw.weeks,
        };
      })() : null,
    };
  }

  // ── PDF GENERATION ─────────────────────────

  async function generatePdf(contentHtml: string): Promise<Buffer> {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    });
    try {
      const page = await browser.newPage();
      const inlinedHtml = inlineLocalImages(contentHtml);
      // body padding:0 + page margin:0 = wrapper template controls all
      // spacing. The template's HEADER constant is 210mm wide with internal
      // padding for content; this lets the header/footer banners bleed
      // edge-to-edge on the printed page as Neil asked (and stops the
      // page-2 footer overflow that Paul flagged).
      // Sticky footer: if the content carries the ULearn footer banner, lift it
      // OUT of the flow and render it via puppeteer's repeating page-footer,
      // pinned into a reserved bottom margin. This keeps the banner glued to the
      // bottom edge of EVERY page (never floats up onto a near-empty page 2 when
      // the letter runs long) — the recurring LoA "footer on page 2" bug. Docs
      // without the banner are unaffected (margins stay 0).
      const footerMatch = inlinedHtml.match(/<img[^>]*alt="ULearn Footer"[^>]*>/i);
      let bodyHtml = inlinedHtml;
      const pdfOpts: any = {
        format: 'A4',
        margin: { top: '0', bottom: '0', left: '0', right: '0' },
        printBackground: true,
      };
      if (footerMatch) {
        bodyHtml = inlinedHtml.replace(footerMatch[0], '');
        // doc-footer.png is 794×66 → at 210mm wide it renders ~17.5mm tall.
        const footerImg = footerMatch[0].replace(/width:[^;"']*/i, 'width:100%');
        pdfOpts.displayHeaderFooter = true;
        pdfOpts.headerTemplate = '<span></span>';
        pdfOpts.footerTemplate = `<div style="width:100%;margin:0;padding:0;line-height:0">${footerImg}</div>`;
        pdfOpts.margin = { top: '0', bottom: '17.5mm', left: '0', right: '0' };
      }
      const fullHtml = `<!DOCTYPE html><html><head>
        <meta charset="UTF-8">
        <style>body{margin:0;padding:0;font-family:Verdana,sans-serif;font-size:14px;line-height:1.7;color:#1a1d23}img{max-width:100%}</style>
      </head><body>${bodyHtml}</body></html>`;
      await page.setContent(fullHtml, { waitUntil: 'networkidle0' });
      const pdf = await page.pdf(pdfOpts);
      return Buffer.from(pdf);
    } finally {
      await browser.close();
    }
  }

  async function getDocumentPdf(id: number): Promise<{ pdf: Buffer; filename: string }> {
    const doc = await prisma.documentRecord.findUnique({
      where: { id },
      include: { template: true },
    });
    if (!doc) throw new Error('Document not found');

    // Static PDF template — read straight from disk, no render. Used for legal
    // attachments (SLA etc.) that are byte-identical for every student.
    const staticPath = (doc.template as any)?.staticPdfPath as string | null | undefined;
    if (staticPath) {
      if (!fs.existsSync(staticPath)) throw new Error(`Static PDF missing at ${staticPath}`);
      const tplSlug = doc.template?.slug || doc.documentType || 'document';
      return { pdf: fs.readFileSync(staticPath), filename: `${tplSlug}-${doc.id}.pdf` };
    }

    // PER-RECORD attached PDF (e.g. an uploaded Arachas insurance policy) — the
    // record IS the uploaded file, not a generated/rendered doc. Path is stored
    // relative to uploads/.
    const attached = (doc as any).attachedFilePath as string | null | undefined;
    if (attached) {
      const abs = path.join(__dirname, '..', '..', 'uploads', attached);
      if (!abs.startsWith(path.join(__dirname, '..', '..', 'uploads')) || !fs.existsSync(abs)) throw new Error('Attached document file missing');
      const tplSlug = doc.template?.slug || doc.documentType || 'document';
      return { pdf: fs.readFileSync(abs), filename: `${tplSlug}-${doc.id}.pdf` };
    }

    if (!doc.contentHtml) throw new Error('Document has no content');

    const pdf = await generatePdf(doc.contentHtml);
    const tplSlug = doc.template?.slug || doc.documentType || 'document';
    const filename = `${tplSlug}-${doc.id}-v${doc.versionNo}.pdf`;
    return { pdf, filename };
  }

  // ── DISPATCH LOGGING ──────────────────────

  async function logDispatch(documentId: number, sentToEmail: string, deliveryMethod: string, sentBy?: string) {
    const doc = await prisma.documentRecord.findUnique({ where: { id: documentId } });
    if (!doc || doc.status !== 'ISSUED') throw new Error('Can only dispatch issued documents');

    return prisma.documentDispatch.create({
      data: { documentId, sentToEmail, deliveryMethod, sentBy },
    });
  }

  // ── SEND (document as Gmail attachment) ──────────────────
  // The full send orchestration, extracted from the POST /:id/send route so it
  // can be invoked directly (node on the box) OR via the HTTP route — both share
  // this one path. Regenerates the issued PDF, sends via the Gmail service
  // account with the PDF attached, logs the dispatch + an EmailLog row.
  //   opts.body = the (already token-rendered) cover-email HTML. The ULearn
  //   signature + house style are appended/applied automatically — do NOT
  //   include them in body. Throws on a missing / non-ISSUED document.
  async function sendDocument(opts: {
    docId: number;
    to: string;
    from: string;          // must be in email.ts ALLOWED_SENDERS
    fromName?: string;
    subject?: string;      // defaults to the template/document name
    body?: string;         // cover-email HTML (rendered); signature auto-appended
    sentBy?: string;
    attach?: boolean;      // default TRUE. false = notify-only (see below)
  }): Promise<{ status: 'sent'; messageId: string; threadId: string; filename: string }> {
    if (!opts.to || !opts.from) throw new Error('to and from are required');
    const doc = await getDocument(opts.docId);
    if (!doc) throw new Error('Document not found');
    if (doc.status !== 'ISSUED') throw new Error('Only issued documents can be sent');

    // attach=false → "notify-only": the email just tells them the document is
    // waiting in their ULearn account / Partner Portal, driving them to the
    // portal instead of shipping the PDF around (mirrors /notify-insurance).
    // Still logs the dispatch + EmailLog so the audit trail is identical.
    // We skip the PDF render entirely — nothing consumes it when not attaching.
    const attach = opts.attach !== false;
    let pdf: Buffer | null = null;
    let filename = '';
    if (attach) {
      const generated = await getDocumentPdf(opts.docId);
      pdf = generated.pdf;
      filename = generated.filename;
    }

    const fallbackBody = attach
      ? '<p>Please find the attached document.</p>'
      : '<p>A new document is available in your ULearn account.</p>';
    const htmlBody = (opts.body || fallbackBody) + '<br>' + DOC_SIGNATURE_HTML;
    const emailSubject = opts.subject || (doc as any).template?.name || doc.documentType || 'Document';

    const result = await sendEmail({
      from: opts.from,
      fromName: opts.fromName || 'ULearn',
      to: opts.to,
      subject: emailSubject,
      html: htmlBody,
      ...(attach && pdf ? { attachments: [{ filename, content: pdf, contentType: 'application/pdf' }] } : {}),
    });

    await logDispatch(opts.docId, opts.to, 'email', opts.sentBy || opts.from);
    await prisma.emailLog.create({
      data: {
        studentId: doc.studentId,
        bookingId: doc.bookingId,
        fromEmail: opts.from,
        toEmail: opts.to,
        subject: emailSubject,
        bodyHtml: htmlBody,
        gmailMessageId: result.messageId,
        gmailThreadId: result.threadId,
        sentBy: opts.sentBy || opts.from,
      },
    });

    return { status: 'sent', messageId: result.messageId, threadId: result.threadId, filename };
  }

  // ── TEMPLATE VALIDATION ──────────────────────
  // Walk a template + a specific (student, booking) pair and report which
  // referenced tokens would resolve to empty strings. This catches the
  // "resolved-but-blank" case that the existing generateDraft `missing`
  // check doesn't surface (it only flags literally unresolved {{tokens}},
  // which the resolver replaces with '' before that check runs).
  //
  // Returned `emptyTokens` includes a UI hint pointing staff at the form
  // field they should populate before issuing — e.g. token
  // `student.passport_number` maps to "Passport Number on Personal".
  async function validateTemplate(templateId: number, studentId: number, bookingId?: number | null) {
    const template = await prisma.documentTemplate.findUnique({ where: { id: templateId } });
    if (!template) throw new Error('Template not found');

    const { tokens, student, course } = await resolveTokens(studentId, bookingId ?? null, { certAggregate: template.slug === 'Attendance-Final', slug: template.slug });

    // Resolve {if ...} conditionals FIRST so tokens that live inside a block
    // which drops out for this student (e.g. the whole accommodation table when
    // no accommodation is booked) are never reported as "missing" — they never
    // render. Mirrors renderTemplate's {if} pass exactly.
    const visible = template.htmlTemplate.replace(/\{if\s+([a-z0-9_.]+)\}([\s\S]*?)\{\/if\}/gi, (_m, key, content) => {
      const k = String(key).trim();
      const v = tokens[k] || tokens['booking.' + k] || tokens['student.' + k]
        || tokens['accommodation.' + k] || tokens[k.replace(/^accommodation_/, 'accommodation.')] || '';
      return v ? content : '';
    });

    const referenced = new Set<string>();
    for (const m of visible.matchAll(/\{\{\s*([^{}]+?)\s*\}\}/g)) {
      const k = m[1].trim();
      if (!k) continue;
      // custom.* are intentional editable regions; document.* are filled at
      // issue time. Neither is a "missing data" condition for the staff to
      // fix on the student record.
      if (k.startsWith('custom.') || k.startsWith('document.')) continue;
      referenced.add(k);
    }

    const emptyTokens = [];
    for (const tok of referenced) {
      // ILEP is NO LONGER a blocker (Neil 2026-10-12): it A2-defaults in token
      // resolution, and for a non-AY/EU course it's legitimately blank. So a blank
      // ILEP code must never block or warn on issuance — skip it here. (Passport
      // stays a blocker: `student.passport_number` is still flagged when blank.)
      if (tok === 'booking.ilep_code' || tok === 'ilep_course_code') continue;
      const val = tokens[tok];
      if (val == null || String(val).trim() === '') {
        emptyTokens.push({ token: tok, hint: TOKEN_FIELD_HINTS[tok] || null });
      }
    }

    return {
      templateId: template.id,
      templateSlug: template.slug,
      templateName: template.name,
      referencedCount: referenced.size,
      emptyTokens,
    };
  }

  // Shared document-notify — the dual student+agent notify behind the admin
  // "Notify Agent / Student?" button AND the fully-paid LOA automation, so the
  // two paths can never drift. Per doc type: a Receipt is student-only and
  // ATTACHES its PDF (arm's-length escrow customer); an LoA goes to student
  // (success@) + agent (partners@), both notify-only (the doc lives in the
  // ULearn account / Partner Portal); any other doc uses the generic student
  // notify. Recipients that are missing/invalid are skipped gracefully.
  async function notifyDocument(docId: number, opts: { agent?: boolean; student?: boolean; sentBy?: string } = {}) {
    const notifyAgent = opts.agent !== false;
    const notifyStudent = opts.student !== false;
    const sentBy = opts.sentBy || 'admin';
    const validEmail = (e?: string | null) => !!e && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e);

    const doc = await getDocument(docId);
    if (!doc) throw new Error('Document not found');
    if (doc.status !== 'ISSUED') throw new Error('Only issued documents can be sent');

    const student = await prisma.student.findUnique({ where: { id: doc.studentId }, select: { email: true } });
    const { tokens } = await resolveTokens(doc.studentId, doc.bookingId ?? null);
    (tokens as any)['document.name'] = (doc as any).template?.name || (doc as any).documentType || 'document';
    const results: Record<string, { status: string; to?: string | null; reason?: string }> = {};

    const isReceipt = (doc as any).documentType === 'accounts' || (doc as any).template?.slug === 'ULearn-Receipt';
    const isLoA = /visa/i.test((doc as any).documentType || '') || /^lo?a[-_]/i.test((doc as any).template?.slug || '');
    const studentSlug = isReceipt ? 'Receipt-Notify-Student' : (isLoA ? 'LoA-Attach-Student' : 'Doc-Notify-Student');

    // ── Student ──
    if (notifyStudent) {
      const tpl = await prisma.documentTemplate.findFirst({ where: emailTemplateWhere(studentSlug, { templateType: 'email' }) });
      if (!tpl) results.student = { status: 'failed', reason: `${studentSlug} template missing` };
      else if (!validEmail(student?.email)) results.student = { status: 'skipped', to: student?.email, reason: 'no valid student email' };
      else {
        await sendDocument({
          docId, to: student!.email!, from: 'success@ulearnschool.com', fromName: 'ULearn',
          subject: renderTemplate(tpl.subject || tpl.name, tokens),
          body: renderTemplate(tpl.htmlTemplate, tokens), sentBy,
          attach: isReceipt,   // LoA/other = notify-only; receipt attaches
        });
        results.student = { status: 'sent', to: student!.email };
      }
    }

    // ── Agent (agency on the booking) — LoA only, never for receipts ──
    if (notifyAgent && isLoA) {
      const tpl = await prisma.documentTemplate.findFirst({ where: emailTemplateWhere('LoA-Attach-Agent', { templateType: 'email' }) });
      const agentEmail = tokens['agency.email'];
      if (!tpl) results.agent = { status: 'failed', reason: 'LoA-Attach-Agent template missing' };
      else if (!validEmail(agentEmail)) results.agent = { status: 'skipped', to: agentEmail || null, reason: 'no valid agency email' };
      else {
        await sendDocument({
          docId, to: agentEmail, from: 'partners@ulearnschool.com', fromName: 'ULearn',
          subject: renderTemplate(tpl.subject || tpl.name, tokens),
          body: renderTemplate(tpl.htmlTemplate, tokens), sentBy,
          attach: false,   // notify-only — the LoA lives in their Partner Portal
        });
        results.agent = { status: 'sent', to: agentEmail };
      }
    }

    return { results };
  }

  // Fully-paid → auto-issue the LOA. Called from the invoice-paid webhook the
  // moment an Academic-Year / LifePass booking is fully paid. For LifePass that
  // is the course-1 €997 onboarding, because the webhook excludes the -Sub
  // subscription master from the balance — so "fully paid" there means course 1,
  // and courses 2 & 3 are untouched. The AY COURSE is the sole filter (AY is a
  // visa product → no nationality gate). IDEMPOTENT: skips if an ISSUED LOA
  // already exists for this student+booking, so a re-fired payment webhook never
  // double-issues. Staff can still re-issue by hand (Generate→Issue→Notify) — this
  // guard governs only the automation. Reuses generateDraft→issueDocument→
  // notifyDocument so the payment gate, QR and email copy match the manual path.
  // Is a booking's course fee fully covered — by settled payment OR escrow-held
  // funds? (Escrow is a shadow payment excluded from amountPaid; see the TM
  // escrow path.) Mirrors the LoA payment gate's "secured" test.
  function bookingFullyFunded(b: { amountTotal: any; amountPaid: any; status: string | null; payments: { amount: any; type: string | null; method: string | null }[] }): boolean {
    const total = Number(b.amountTotal || 0);
    if (total <= 0) return false;
    const escrow = (b.payments || []).filter(p => p.type === 'Escrow' || /escrow/i.test(p.method || '')).reduce((s, p) => s + Number(p.amount || 0), 0);
    return Number(b.amountPaid || 0) >= total - 0.01 || escrow >= total - 1.00 || b.status === 'ESCROW';
  }

  // Email student + agent that the LoA is ready EXCEPT we still need the passport
  // (the one hard content requirement — the letter carries the passport number
  // for airport / QR interoperability). ONE template, conditional link: student →
  // student app, agent → partner portal. Deduped (≤1 round per booking / 14 days)
  // so a re-firing payment webhook doesn't nag; naturally stops once the passport
  // lands and the LoA issues. `sentBy` = the trigger tag.
  async function requestPassportForLoa(bookingId: number, sentBy = 'auto-loa') {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      select: { id: true, studentId: true, student: { select: { firstName: true, email: true, passportNumber: true } }, agency: { select: { email: true } } },
    });
    if (!booking) return { status: 'skipped', reason: 'booking-not-found' };
    if (booking.student?.passportNumber) return { status: 'skipped', reason: 'has-passport' };

    const tpl = await prisma.documentTemplate.findFirst({ where: emailTemplateWhere('LoA-Passport-Request', { templateType: 'email' }) });
    if (!tpl) return { status: 'skipped', reason: 'passport-request-template-missing' };

    const since = new Date(); since.setDate(since.getDate() - 14);
    const already = await prisma.emailLog.count({ where: { bookingId, templateId: tpl.id, createdAt: { gte: since } } });
    if (already) return { status: 'skipped', reason: 'already-requested' };

    const { tokens } = await resolveTokens(booking.studentId, booking.id);
    (tokens as any)['booking.ref'] = '#' + booking.id;
    const validEmail = (e?: string | null) => !!e && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e);
    const results: Record<string, any> = {};

    // Student copy — "student app" link.
    if (validEmail(booking.student?.email)) {
      const t = { ...tokens, recipient_student: '1', recipient_agent: '' } as Record<string, string>;
      const subject = renderTemplate(tpl.subject || tpl.name, t);
      const html = renderTemplate(tpl.htmlTemplate, t);
      try {
        await sendEmail({ from: 'success@ulearnschool.com', fromName: 'ULearn', to: booking.student!.email!, subject, html });
        await prisma.emailLog.create({ data: { studentId: booking.studentId, bookingId, fromEmail: 'success@ulearnschool.com', toEmail: booking.student!.email!, subject, bodyHtml: html, templateId: tpl.id, sentBy } as any });
        results.student = { status: 'sent', to: booking.student!.email };
      } catch (e: any) { results.student = { status: 'failed', reason: e?.message }; }
    } else results.student = { status: 'skipped', reason: 'no valid student email' };

    // Agent copy — "portal" link (only when there's an agency with an email).
    const agentEmail = booking.agency?.email || null;
    if (validEmail(agentEmail)) {
      const t = { ...tokens, recipient_student: '', recipient_agent: '1' } as Record<string, string>;
      const subject = renderTemplate(tpl.subject || tpl.name, t);
      const html = renderTemplate(tpl.htmlTemplate, t);
      try {
        await sendEmail({ from: 'partners@ulearnschool.com', fromName: 'ULearn', to: agentEmail!, subject, html });
        await prisma.emailLog.create({ data: { studentId: booking.studentId, bookingId, fromEmail: 'partners@ulearnschool.com', toEmail: agentEmail!, subject, bodyHtml: html, templateId: tpl.id, sentBy } as any });
        results.agent = { status: 'sent', to: agentEmail };
      } catch (e: any) { results.agent = { status: 'failed', reason: e?.message }; }
    } else results.agent = { status: 'skipped', reason: 'no agency email' };

    return { status: 'requested', results };
  }

  async function autoIssueLoaForBooking(bookingId: number, trigger = 'auto-loa') {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      select: {
        id: true, studentId: true, status: true, amountTotal: true, amountPaid: true,
        courses: { select: { name: true, holidayWks: true, isRenewal: true } },
        payments: { select: { amount: true, type: true, method: true } },
        student: { select: { passportNumber: true } },
      },
    });
    if (!booking) return { status: 'skipped', reason: 'booking-not-found' };

    // AY / LifePass gate — the course is the filter (holidayWks set, an AY /
    // renewal / LifePass name, or the renewal-SKU flag). Mirrors scripts/student.ts.
    const isAY = booking.courses.some((c: any) =>
      c.holidayWks != null || /academic year|life ?pass|renewal/i.test(c.name || '') || c.isRenewal);
    if (!isAY) return { status: 'skipped', reason: 'not-academic-year' };

    const tpl = await prisma.documentTemplate.findFirst({
      where: { slug: 'LOA-NonEU-QR', templateType: 'document' },
      select: { id: true },
    });
    if (!tpl) return { status: 'skipped', reason: 'loa-template-missing' };

    // Idempotency — an ISSUED LOA already on file means the automation has run.
    const existing = await prisma.documentRecord.count({
      where: { studentId: booking.studentId, bookingId: booking.id, templateId: tpl.id, status: 'ISSUED' },
    });
    if (existing) return { status: 'skipped', reason: 'already-issued' };

    // Real blockers (Neil 2026-10-12) = (1) full payment and (2) passport. ILEP is
    // NO LONGER a blocker — it A2-defaults in token resolution. Self-gates on
    // funding so this is safe to call from the invoice-paid webhook, the escrow
    // receiver AND the passport-upload hook.
    if (!bookingFullyFunded(booking as any)) return { status: 'skipped', reason: 'not-funded' };
    if (!booking.student?.passportNumber) {
      // Fully paid but no passport → don't issue a letter with a blank passport
      // number; email student+agent to upload it (LoA then issues automatically).
      const request = await requestPassportForLoa(bookingId, trigger);
      return { status: 'passport-requested', request };
    }

    // generateDraft renders + persists a DRAFT, issueDocument locks + mints the QR,
    // notifyDocument emails both. callerRole 'admin' so the gate doesn't re-block on
    // the inherent visa-pending state — we've done our own funded+passport gating.
    const { record } = await generateDraft(tpl.id, booking.studentId, booking.id, 'admin');
    await issueDocument(record.id, trigger, 'admin');
    const { results } = await notifyDocument(record.id, { agent: true, student: true, sentBy: trigger });
    return { status: 'issued', documentId: record.id, notify: results };
  }

  // Passport just arrived (upload / AI-read) → close the loop: issue the LoA for
  // any of this student's AY bookings now fully funded + passport-complete + LoA-
  // less. autoIssueLoaForBooking self-gates, so this just fans out over bookings.
  async function issueLoaForStudentIfReady(studentId: number, trigger = 'auto-loa-passport') {
    const bookings = await prisma.booking.findMany({ where: { studentId }, select: { id: true } });
    const out: any[] = [];
    for (const b of bookings) {
      try { out.push({ bookingId: b.id, ...(await autoIssueLoaForBooking(b.id, trigger)) }); }
      catch (e: any) { out.push({ bookingId: b.id, status: 'error', reason: e?.message }); }
    }
    return out;
  }

  return {
    listTemplates, getTemplate, createTemplate, updateTemplate, deleteTemplate,
    resolveTokens, renderTemplate,
    generateDraft, generateReceiptDocument, getDocument, listDocuments, updateDraft,
    issueDocument, createNewVersion, revokeDocument, liveEditDocument, refreshDocumentFromSource, resetDocumentFromSource, renderIssuedDocInPlace, syncLoaToBooking, attachExternalPdf, fileInsurancePolicy, saveInsurancePolicy,
    verify,
    generatePdf, getDocumentPdf,
    logDispatch, sendDocument, notifyDocument, autoIssueLoaForBooking, requestPassportForLoa, issueLoaForStudentIfReady,
    validateTemplate,
  };
}

// Token → UI-field hint, surfaced in the pre-generate validation modal so
// staff know where to fix the missing data rather than guess. Keep this
// flat and human-phrased; not every token needs an entry (only the ones
// staff are likely to be looking for).
const TOKEN_FIELD_HINTS: Record<string, string> = {
  // Student — Personal card on Overview
  'student.first_name':       'First Name (Student → Personal)',
  'student.last_name':        'Last Name (Student → Personal)',
  'student.email':            'Email (Student → Personal)',
  'student.dob':              'Date of Birth (Student → Personal)',
  'student.nationality':      'Nationality (Student → Personal)',
  'student.address':          'Native Address (Student → Address → Home Country)',
  'student.irish_address':    'Irish Address (Student → Address → Ireland)',
  'student.address_ireland':  'Irish Address — falls back to placement (host/apartment) address if unset',
  'student.phone':            'Phone (Student → Personal)',
  'student.emergency_phone':  'Emergency Phone (Student → Personal)',
  'student.current_level':    'Level (Student → Overview → Learning)',
  'student.passport_number':  'Passport Number (Student → Visa & Flight)',
  'student.allergies':        'Allergies (Student → Other)',
  'student.gender':           'Gender (Student → Personal)',
  'student.attendance_rate':  'Attendance records — none on file yet for this student',
  'student.flight_number':    'Inbound Flight Number (Student → Visa & Flight)',
  'student.flight_date':      'Inbound Flight Date (Student → Visa & Flight)',
  'student.flight_time':      'Inbound Flight Time (Student → Visa & Flight)',
  'student.outbound_flight_number': 'Outbound Flight Number (Student → Visa & Flight)',
  'student.outbound_flight_date':   'Outbound Flight Date (Student → Visa & Flight)',
  'student.outbound_flight_time':   'Outbound Flight Time (Student → Visa & Flight)',
  'student.visa_from':        'Visa From date (Student → Visa & Flight)',
  'student.visa_until':       'Visa Until date (Student → Visa & Flight)',
  // Booking
  'booking.start_date':       'Course Start Date — no booking linked, or booking has no course',
  'booking.end_date':         'Course End Date — no booking linked, or booking has no course',
  'booking.course_name':      'Course — no booking linked',
  'booking.course_level':     'Course Level — set on Booking → Course',
  'booking.hours_per_week':   'Hours per Week — set on Booking → Course',
  'booking.weeks':            'Weeks — set on Booking → Course',
  'booking.amount_total':     'Booking total — set on Booking → Financial',
  'booking.amount_paid':      'Amount Paid — payments synced from Xero',
  'booking.amount_open':      'Balance — derived from total minus paid',
  'booking.confirmation_pending': "'1' while a balance is payable (else blank) — for {if confirmation_pending} notices",
  'booking.ilep_code':        'ILEP code — only set on AY programmes (Booking → Course)',
  'booking.gross_from_net':   'Falls back to net if HubSpot commission rate is unavailable',
  'booking.course_fee':       'Course Fee — set on Booking → Course',
  'booking.visa_start_date':  'Falls back to course start when visa dates are blank',
  'booking.visa_end_date':    'Falls back to course end when visa dates are blank',
  // Agency
  'agency.name':              'Agency — not set on booking',
  'agency.contact':           'Agency Contact — set on Agency record',
  'agency.email':             'Agency Email — set on Agency record',
  'agency.commission_rate':   'Commission Rate — sourced live from HubSpot, may be null',
  'agency.commission_amount': 'Derived from commission rate (null when rate is null)',
  'agency.net_amount':        'Derived from commission rate (falls back to gross when rate is null)',
  // Accommodation
  'accommodation.contact_name': 'Host contact name — student not yet placed (no bed assigned)',
  'accommodation.provider_name':'Host name — student not yet placed',
  'accommodation.address':      'Host address — student not yet placed',
  'accommodation.phone':        'Host phone — student not yet placed',
  'accommodation.email':        'Host email — student not yet placed',
  'accommodation.start_date':   'Accommodation start — no accommodation booked',
  'accommodation.end_date':     'Accommodation end — no accommodation booked',
  'accommodation.weeks':        'Accommodation weeks — no accommodation booked',
  'accommodation.room_type':    'Room type — set on Booking → Accommodation',
  'accommodation.board':        'Board — set on Booking → Accommodation',
  'accommodation.type':         'Accommodation type — set on Booking → Accommodation',
  // Misc
  'absences_list':            'Built only when attendance rate < 85% AND there are absences on file',
};
