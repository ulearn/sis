import { PrismaClient, DocumentStatus } from '../generated/prisma/client';
import crypto from 'crypto';
import QRCode from 'qrcode';
import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const BASE_URL = process.env.BASE_URL || 'https://sis.ulearnschool.com';
const PUBLIC_DIR = path.resolve(__dirname, '../../public');

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
    name: string; slug: string; category?: string; documentType: string;
    htmlTemplate: string; tokenSchema?: string;
  }) {
    return prisma.documentTemplate.create({ data });
  }

  async function updateTemplate(id: number, data: {
    name?: string; category?: string; htmlTemplate?: string; tokenSchema?: string; active?: boolean;
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

  // ── TOKEN RESOLUTION ──────────────────────

  async function resolveTokens(studentId: number, bookingId?: number | null) {
    const student = await prisma.student.findUnique({ where: { id: studentId } });
    if (!student) throw new Error('Student not found');

    const booking = bookingId
      ? await prisma.booking.findUnique({
          where: { id: bookingId },
          include: { courses: true, accommodations: true, agency: true },
        })
      : null;

    // Commission rate (HubSpot-authoritative — see CLAUDE.md agency rule)
    const hsCompanyId = (booking as any)?.agency?.hubspotCompanyId;
    const hsCommissionRate: number | null = hsCompanyId ? await fetchHubspotCommissionRate(hsCompanyId) : null;

    const course = booking?.courses?.[0];

    // Gender-based pronouns (replaces Fidelo's {if gender =="Male"} conditionals)
    const isMale = student.gender === 1;
    const salutation = isMale ? 'Mr.' : 'Ms.';

    // Accommodation (first placement if exists)
    const accomm = booking?.accommodations?.[0];
    let accommProvider: any = null;
    if (accomm?.bedId) {
      const bed = await prisma.accommodationBed.findUnique({
        where: { id: accomm.bedId },
        include: { room: { include: { property: { include: { provider: true } } } } },
      });
      accommProvider = bed?.room?.property?.provider;
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
      const { fetchStudentHolidays, filterOutHolidayDates } = await import('./attendance-pct');
      const attRowsAll = await prisma.attendance.findMany({
        where: { studentId },
        select: { status: true, occurrence: { select: { date: true } } },
      });
      // Holiday-overlap days are excluded from the rate calculation entirely
      // (they aren't supposed to be at school, so they shouldn't drag the
      // percentage down). Same row set then drives the absences list below.
      const studentHolidays = await fetchStudentHolidays(prisma, studentId);
      const attRows = filterOutHolidayDates(attRowsAll, studentHolidays);
      const total = attRows.length;
      if (total > 0) {
        const presentLike = attRows.filter(r => r.status === 'PRESENT' || r.status === 'LATE').length;
        const pct = Math.round((presentLike / total) * 100);
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

    const tokens: Record<string, string> = {
      // Student
      'student.full_name': `${student.firstName} ${student.lastName || ''}`,
      'student.first_name': student.firstName,
      'student.last_name': student.lastName || '',
      'student.email': student.email || '',
      'student.dob': fmtDate(student.birthday),
      'student.nationality': student.nationality || '',
      'student.passport_number': student.passportNumber || '',
      'student.passport_number_masked': student.passportNumber ? student.passportNumber.slice(0, -4).replace(/./g, '*') + student.passportNumber.slice(-4) : '',
      'student.student_type': student.studentType || '',
      'student.current_level': student.currentLevel || '',
      'student.photo': student.profilePicture || '',
      'student.id': String(student.id),
      'student.salutation': salutation,
      'student.gender': isMale ? 'Male' : 'Female',
      'student.allergies': student.allergies || '',
      'student.address': [student.address, student.addressAddon, student.city, student.zip].filter(Boolean).join(', '),
      'student.phone': student.phoneMobile || student.phone || '',
      'student.emergency_phone': student.emergencyPhone || '',
      'student.age': student.birthday ? String(Math.floor((Date.now() - new Date(student.birthday).getTime()) / (365.25 * 24 * 60 * 60 * 1000))) : '',
      'student.language': (student as any).language || (student as any).contactLanguage || '',
      'student.attendance_rate': attendanceRateStr,
      'absences_list': absencesListHtml, // populated only when attendance < 85% — drives {if absences_list}

      // Gender pronouns (replaces Fidelo {if gender} blocks)
      'student.pronoun_subject': isMale ? 'he' : 'she',
      'student.pronoun_object': isMale ? 'him' : 'her',
      'student.pronoun_possessive': isMale ? 'his' : 'her',
      'student.pronoun_possessive_cap': isMale ? 'His' : 'Her',
      'student.pronoun_subject_cap': isMale ? 'He' : 'She',

      // Booking
      'booking.reference': booking ? `BK-${new Date().getFullYear()}-${String(booking.id).padStart(6, '0')}` : '',
      'booking.status': booking?.status || '',
      'booking.start_date': fmtDate(course?.startDate),
      'booking.end_date': fmtDate(course?.endDate),
      'booking.course_name': course?.name || '',
      'booking.course_level': course?.level || '',
      'booking.hours_per_week': course?.hoursPerWeek ? String(course.hoursPerWeek) : '',
      'booking.weeks': course?.weeks ? String(course.weeks) : '',
      'booking.amount_total': booking?.amountTotal ? `€${booking.amountTotal}` : '',
      'booking.agency': (booking as any)?.agency?.name || '',
      'booking.amount_paid': booking?.amountPaid ? `€${Number(booking.amountPaid).toFixed(2)}` : '',
      'booking.amount_open': booking?.amountOpen ? `€${Number(booking.amountOpen).toFixed(2)}` : '',
      'booking.currency': booking?.currency || 'EUR',

      // Agency / Commission
      'agency.name': (booking as any)?.agency?.name || '',
      'agency.contact': (booking as any)?.agency?.contactPerson || '',
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

      // Visa
      'student.visa_from':  fmtDate(student.visaFrom),
      'student.visa_until': fmtDate(student.visaUntil),
      // Visa-aware course-window dates for letters that need the embassy/INIS
      // to see the full Stamp-2 window (LoA, ISD). Falls back to course dates
      // when visa dates haven't been entered yet, so the doc never renders an
      // empty cell. NonEU LoA template uses these in place of booking.start/end.
      'booking.visa_start_date': fmtDate((student as any).visaFrom || course?.startDate),
      'booking.visa_end_date':   fmtDate((student as any).visaUntil || course?.endDate),
      'booking.ilep_code': (course as any)?.ilepCode || '',
      'ilep_course_code': (course as any)?.ilepCode || '',  // legacy Fidelo placeholder name

      // Accommodation
      'accommodation.contact_name': accommProvider?.contactPerson || '',
      'accommodation.provider_name': accommProvider?.name || '',
      'accommodation.address': accommProvider ? [accommProvider.address, accommProvider.addressAddon, accommProvider.city, accommProvider.zip].filter(Boolean).join(', ') : '',
      'accommodation.phone': accommProvider?.phone || accommProvider?.mobile || '',
      'accommodation.email': accommProvider?.email || '',
      'accommodation.start_date': fmtDate(accomm?.startDate),
      'accommodation.end_date': fmtDate(accomm?.endDate),
      'accommodation.weeks': accomm?.weeks ? String(accomm.weeks) : '',
      'accommodation.room_type': accomm?.roomType || '',
      'accommodation.board': accomm?.board || '',
      'accommodation.type': accomm?.accommodationType || '',

      // Institution
      'institution.name': 'ULearn English Language School',
      'institution.address': 'Dublin, Ireland',

      // Document (placeholders — replaced at issue time)
      'document.issue_date': new Date().toLocaleDateString('en-IE', { day: '2-digit', month: 'long', year: 'numeric' }),
    };

    return { tokens, student, booking };
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
  async function assertLoaPaymentGate(templateSlug: string | null, bookingId: number | null | undefined, callerRole?: string) {
    if (!templateSlug || !/^lo?a[-_]/i.test(templateSlug)) return;
    if (callerRole === 'admin') return;
    if (!bookingId) {
      throw new Error('Cannot create LoA: document is not linked to a booking');
    }
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      select: { amountPaid: true, amountTotal: true },
    });
    const paid  = Number(booking?.amountPaid  || 0);
    const total = Number(booking?.amountTotal || 0);
    const EPS = 0.01;
    if (total <= 0 || (total - paid) > EPS) {
      const balance = Math.max(0, total - paid);
      throw new Error(
        `LoA blocked: full payment required first ` +
        `(paid €${paid.toFixed(2)} of €${total.toFixed(2)}, balance €${balance.toFixed(2)}). ` +
        `Admin override available.`
      );
    }
  }

  async function generateDraft(templateId: number, studentId: number, bookingId?: number | null, callerRole?: string) {
    const template = await prisma.documentTemplate.findUnique({ where: { id: templateId } });
    if (!template) throw new Error('Template not found');

    await assertLoaPaymentGate(template.slug, bookingId ?? null, callerRole);

    const { tokens } = await resolveTokens(studentId, bookingId);
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
    let bookingPayment: { amountPaid: number; amountTotal: number; balance: number } | null = null;
    if (doc.bookingId) {
      const b = await prisma.booking.findUnique({
        where: { id: doc.bookingId },
        select: { amountPaid: true, amountTotal: true },
      });
      if (b) {
        const paid  = Number(b.amountPaid  || 0);
        const total = Number(b.amountTotal || 0);
        bookingPayment = { amountPaid: paid, amountTotal: total, balance: Math.max(0, total - paid) };
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

    return prisma.documentRecord.update({
      where: { id },
      data: {
        contentHtml: data.contentHtml,
        editableFields: data.editableFields,
      },
    });
  }

  async function issueDocument(id: number, issuedBy: string, callerRole?: string) {
    const doc = await prisma.documentRecord.findUnique({ where: { id } });
    if (!doc) throw new Error('Document not found');
    if (doc.status !== 'DRAFT') throw new Error('Only drafts can be issued');

    // LoA payment gate (same rule as draft creation). Admin override applies.
    const tpl = await prisma.documentTemplate.findUnique({
      where: { id: doc.templateId },
      select: { slug: true },
    });
    await assertLoaPaymentGate(tpl?.slug || null, doc.bookingId, callerRole);

    const token = crypto.randomBytes(16).toString('base64url');
    const verificationUrl = `${BASE_URL}/sis/verify/${token}`;

    // Generate QR as data URI SVG
    const qrDataUri = await QRCode.toDataURL(verificationUrl, { type: 'image/png', width: 150, margin: 1 });

    // Inject QR into content
    let finalHtml = doc.contentHtml || '';
    finalHtml = finalHtml.replace(/\{\{document\.qr\}\}/g, `<img src="${qrDataUri}" alt="QR Verification" style="width:120px;height:120px">`);
    finalHtml = finalHtml.replace(/\{\{document\.verification_url\}\}/g, verificationUrl);
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
      },
    });

    return newDoc;
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
    const course = booking?.courses?.[0];

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
      booking: booking ? {
        reference: `BK-${new Date(booking.createdAt).getFullYear()}-${String(booking.id).padStart(6, '0')}`,
        courseName: course?.name,
        startDate: course?.startDate,
        endDate: course?.endDate,
      } : null,
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
      const fullHtml = `<!DOCTYPE html><html><head>
        <meta charset="UTF-8">
        <style>body{margin:0;padding:40px;font-family:Verdana,sans-serif;font-size:14px;line-height:1.7;color:#1a1d23}img{max-width:100%}</style>
      </head><body>${inlinedHtml}</body></html>`;
      await page.setContent(fullHtml, { waitUntil: 'networkidle0' });
      const pdf = await page.pdf({
        format: 'A4',
        margin: { top: '20mm', bottom: '20mm', left: '15mm', right: '15mm' },
        printBackground: true,
      });
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

  return {
    listTemplates, getTemplate, createTemplate, updateTemplate,
    resolveTokens, renderTemplate,
    generateDraft, getDocument, listDocuments, updateDraft,
    issueDocument, createNewVersion, revokeDocument,
    verify,
    generatePdf, getDocumentPdf,
    logDispatch,
  };
}
