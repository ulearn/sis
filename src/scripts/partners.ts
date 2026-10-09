/**
 * Partner portal — business logic layer
 * All queries are scoped by agencyId (never trust the client).
 */
import { PrismaClient, Prisma } from '../generated/prisma/client';
import bcrypt from 'bcryptjs';
import { TERRITORY_MAP, buildBaseDealProps } from './booking-deal';
import { studentSearchSql } from '../lib/student-search';
import { sendEmail } from './email';
import { INSURANCE_META, type InsuranceType } from './insurance-classifier';

// Free / public email providers. Partner registration's domain-match gate must NEVER accept
// these: a HubSpot company sloppily created with domain "gmail.com" (European Education Center)
// or "yahoo.com" / "msn.com" would otherwise let EVERY address on that provider pass the gate
// and inherit the agency's portal — the bot flood cleaned up 2026-07. A free-provider address
// can still register, but ONLY via an exact HubSpot contact (whole-email) match, never by domain.
const FREE_EMAIL_PROVIDERS = new Set<string>([
  'gmail.com', 'googlemail.com',
  'yahoo.com', 'yahoo.co.uk', 'yahoo.co.jp', 'yahoo.fr', 'yahoo.es', 'ymail.com', 'rocketmail.com',
  'hotmail.com', 'hotmail.co.uk', 'hotmail.fr', 'hotmail.es', 'hotmail.it',
  'outlook.com', 'outlook.fr', 'outlook.es', 'live.com', 'live.co.uk', 'msn.com',
  'icloud.com', 'me.com', 'mac.com', 'aol.com',
  'gmx.com', 'gmx.net', 'gmx.de', 'mail.com', 'mail.ru',
  'proton.me', 'protonmail.com', 'tutanota.com',
  'yandex.com', 'yandex.ru', 'zoho.com',
  'qq.com', '163.com', '126.com', 'sina.com', 'foxmail.com',
  'naver.com', 'hanmail.net', 'daum.net',
]);

// ── Challenge registry ──
// PRIMARY source = the hub JSON utility (single source of truth, no drift):
//   GET https://hub.ulearnschool.com/hubapp/challenges/current  → { challenge: {...} | null }
// The hub's challenges/registry.js is authoritative; SIS just reads it. The table
// below is a FALLBACK only, used if the hub is briefly unreachable so the form/enrol
// never breaks. The checkbox stamps the active challenge's NAME onto the Deal's
// `challenge` property; HubSpot autoQuote reads it and applies the % — SIS never
// computes the discount.
type Challenge = { type: string; month?: string; percent: number; starts?: string | null; ends?: string | null; appliesTo?: string | null };
const HUB_CHALLENGE_URL = process.env.HUB_CHALLENGE_URL || 'https://hub.ulearnschool.com/hubapp/challenges/current';
const MONTHLY_CHALLENGES_FALLBACK: Record<string, Record<string, { percent: number; starts: string; ends: string; appliesTo: string }>> = {
  '2026-03': { KickStart: { percent: 33, starts: '2026-03-01', ends: '2026-03-31', appliesTo: 'Course and Accommodation Fees' } },
  '2026-05': { KickStart: { percent: 25, starts: '2026-05-01', ends: '2026-05-31', appliesTo: 'Course Fees' } },
  '2026-06': { KickStart: { percent: 22, starts: '2026-06-01', ends: '2026-06-30', appliesTo: 'Course Fees' } },
};
function challengeMonthKey(d = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}
function activeChallengeLocal(d = new Date()): Challenge | null {
  const entry = MONTHLY_CHALLENGES_FALLBACK[challengeMonthKey(d)];
  if (!entry) return null;
  const [type, info] = Object.entries(entry)[0];
  return { type, month: challengeMonthKey(d), percent: info.percent, starts: info.starts, ends: info.ends, appliesTo: info.appliesTo };
}
// Cached hub fetch (10 min TTL) with local fallback — never let a hub blip break enrol.
let _challengeCache: { at: number; value: Challenge | null } | null = null;
async function getActiveChallenge(): Promise<Challenge | null> {
  const now = Date.now();
  if (_challengeCache && now - _challengeCache.at < 600_000) return _challengeCache.value;
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 4000);
    const r = await fetch(HUB_CHALLENGE_URL, { signal: ctrl.signal });
    clearTimeout(t);
    const j: any = await r.json();
    const value: Challenge | null = (j && j.success) ? (j.challenge || null) : activeChallengeLocal();
    _challengeCache = { at: now, value };
    return value;
  } catch {
    return activeChallengeLocal();
  }
}

// NEXT month's challenge — read from the hub's full-months endpoint (same single
// source as /current). Powers the greyed "what's coming" preview pill in the
// partner portal so partners see the taper (e.g. 22% now → 20% next) and close
// deals this month. null when next month isn't defined yet (hide the pill).
const HUB_CHALLENGES_ALL_URL = process.env.HUB_CHALLENGES_ALL_URL || 'https://hub.ulearnschool.com/hubapp/challenges';
function nextMonthKey(d = new Date()): string {
  const nd = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1));
  return `${nd.getUTCFullYear()}-${String(nd.getUTCMonth() + 1).padStart(2, '0')}`;
}
let _nextChallengeCache: { at: number; value: Challenge | null } | null = null;
async function getNextChallenge(): Promise<Challenge | null> {
  const now = Date.now();
  if (_nextChallengeCache && now - _nextChallengeCache.at < 600_000) return _nextChallengeCache.value;
  let value: Challenge | null = null;
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 4000);
    const r = await fetch(HUB_CHALLENGES_ALL_URL, { signal: ctrl.signal });
    clearTimeout(t);
    const j: any = await r.json();
    const months = (j && j.success) ? (j.months || {}) : {};
    const key = nextMonthKey();
    const entry = months[key];
    if (entry && Object.keys(entry).length) {
      const [type, info]: any = Object.entries(entry)[0];
      value = { type, month: key, percent: info.percent, starts: info.starts || null, ends: info.ends || null, appliesTo: info.appliesTo || null };
    }
  } catch { value = null; }
  _nextChallengeCache = { at: now, value };
  return value;
}

export function partnerScripts(prisma: PrismaClient) {

  // ── Dashboard ────────────────────────────────
  async function dashboard(agencyId: number) {
    const now = new Date();
    const weekAhead = new Date(now);
    weekAhead.setDate(now.getDate() + 7);
    const todayStr = now.toISOString().split('T')[0];
    const weekStr = weekAhead.toISOString().split('T')[0];

    const [activeStudents, arrivingThisWeek, departingThisWeek, financials] = await Promise.all([
      // Active students: have a booking with this agency that hasn't ended yet
      prisma.booking.count({
        where: {
          agencyId,
          status: { notIn: ['CANCELLED', 'ESCROW'] },
          student: { is: { OR: [
            { visaStatus: null },
            { visaStatus: { notIn: ['Pending', 'Appeal'] } },
          ]}},
          serviceEnd: { gte: now },
          serviceStart: { lte: now },
        },
      }),
      // Arriving this week
      prisma.booking.count({
        where: {
          agencyId,
          serviceStart: { gte: new Date(todayStr), lte: new Date(weekStr) },
          status: { notIn: ['CANCELLED', 'ESCROW'] },
          student: { is: { OR: [
            { visaStatus: null },
            { visaStatus: { notIn: ['Pending', 'Appeal'] } },
          ]}},
        },
      }),
      // Departing this week
      prisma.booking.count({
        where: {
          agencyId,
          serviceEnd: { gte: new Date(todayStr), lte: new Date(weekStr) },
          status: { notIn: ['CANCELLED', 'ESCROW'] },
          student: { is: { OR: [
            { visaStatus: null },
            { visaStatus: { notIn: ['Pending', 'Appeal'] } },
          ]}},
        },
      }),
      // Financial summary
      prisma.booking.aggregate({
        where: { agencyId, status: { notIn: ['CANCELLED', 'ESCROW'] },
          student: { is: { OR: [
            { visaStatus: null },
            { visaStatus: { notIn: ['Pending', 'Appeal'] } },
          ]}} },
        _sum: { amountTotal: true, amountPaid: true, amountOpen: true },
      }),
    ]);

    return {
      activeStudents,
      arrivingThisWeek,
      departingThisWeek,
      totalBilled: financials._sum.amountTotal || 0,
      totalPaid: financials._sum.amountPaid || 0,
      balanceOpen: financials._sum.amountOpen || 0,
    };
  }

  // ── Students ─────────────────────────────────
  async function students(agencyId: number, query?: { search?: string; page?: number; limit?: number }) {
    const page = query?.page || 1;
    const limit = query?.limit || 50;
    const skip = (page - 1) * limit;

    // Students are those who have at least one booking with this agency
    const where: any = {
      bookings: { some: { agencyId } },
    };
    if (query?.search && query.search.trim()) {
      // Use the SAME search engine as the SIS student list (tokenised,
      // accent-insensitive, matches name/email/fidelo/id) — see studentSearchSql.
      // It's raw SQL, so resolve matching student ids first (scoped to THIS
      // agency via the bookings join), then feed them into the Prisma query
      // below so the rich nested booking/course data still loads.
      const frag = studentSearchSql(query.search);
      const idRows = await prisma.$queryRaw<{ id: number }[]>(Prisma.sql`
        SELECT DISTINCT s.id
        FROM students s
        JOIN bookings b ON b.student_id = s.id AND b.agency_id = ${agencyId}
        WHERE ${frag}
      `);
      const ids = idRows.map((r) => Number(r.id));
      if (ids.length === 0) return { rows: [], total: 0, page, limit };
      where.id = { in: ids };
    }

    const [rows, total] = await Promise.all([
      prisma.student.findMany({
        where,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          birthday: true,
          nationality: true,
          currentLevel: true,
          bookings: {
            where: { agencyId },
            select: {
              id: true,
              status: true,
              serviceStart: true,
              serviceEnd: true,
              amountTotal: true,
              amountPaid: true,
              amountOpen: true,
              courses: {
                select: { name: true, level: true, startDate: true, endDate: true },
              },
              // LifePass drawdowns — drives the portal's live recurring-commission
              // projection (bars light up per ALLOCATED sub, not months elapsed).
              // Empty for non-LifePass bookings, so this is cheap.
              paymentInstalments: {
                where: { cancelledAt: null },
                select: { sequence: true, allocationStatus: true },
              },
            },
            orderBy: { serviceStart: 'desc' },
          },
        },
        skip,
        take: limit,
        orderBy: { lastName: 'asc' },
      }),
      prisma.student.count({ where }),
    ]);

    return { rows, total, page, limit };
  }

  // ── Bookings ─────────────────────────────────
  async function bookings(agencyId: number, query?: { status?: string; page?: number; limit?: number }) {
    const page = query?.page || 1;
    const limit = query?.limit || 50;
    const skip = (page - 1) * limit;

    const where: any = { agencyId };
    if (query?.status) where.status = query.status;

    const [rows, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        select: {
          id: true,
          status: true,
          serviceStart: true,
          serviceEnd: true,
          amountTotal: true,
          amountPaid: true,
          amountOpen: true,
          currency: true,
          student: {
            select: { id: true, firstName: true, lastName: true, nationality: true },
          },
          courses: {
            select: { name: true, level: true, startDate: true, endDate: true, weeks: true },
          },
          accommodations: {
            select: { accommodationType: true, roomType: true, startDate: true, endDate: true },
          },
        },
        skip,
        take: limit,
        orderBy: { serviceStart: 'desc' },
      }),
      prisma.booking.count({ where }),
    ]);

    return { rows, total, page, limit };
  }

  // ── Finance summary ──────────────────────────
  async function finance(agencyId: number) {
    const [summary, recentPayments, invoices] = await Promise.all([
      prisma.booking.aggregate({
        where: { agencyId, status: { notIn: ['CANCELLED', 'ESCROW'] },
          student: { is: { OR: [
            { visaStatus: null },
            { visaStatus: { notIn: ['Pending', 'Appeal'] } },
          ]}} },
        _sum: { amountTotal: true, amountPaid: true, amountOpen: true },
        _count: true,
      }),
      prisma.payment.findMany({
        where: { booking: { agencyId } },
        select: {
          id: true,
          amount: true,
          method: true,
          paymentDate: true,
          paidBy: true,
          booking: {
            select: {
              id: true,
              student: { select: { firstName: true, lastName: true } },
            },
          },
        },
        orderBy: { paymentDate: 'desc' },
        take: 20,
      }),
      prisma.invoice.findMany({
        where: { booking: { agencyId } },
        select: {
          id: true,
          invoiceNumber: true,
          type: true,
          date: true,
          status: true,
          pdfUrl: true,
          booking: {
            select: {
              id: true,
              student: { select: { firstName: true, lastName: true } },
            },
          },
        },
        orderBy: { date: 'desc' },
        take: 30,
      }),
    ]);

    // Estimate commissions: pull agency commission rate
    const agency = await prisma.agency.findUnique({
      where: { id: agencyId },
      select: { commissionRate: true },
    });
    const rate = agency?.commissionRate ? Number(agency.commissionRate) / 100 : 0;
    const totalBilled = Number(summary._sum.amountTotal || 0);
    const commissionsEarned = totalBilled * rate;

    return {
      totalBilled,
      totalPaid: Number(summary._sum.amountPaid || 0),
      balanceOpen: Number(summary._sum.amountOpen || 0),
      bookingCount: summary._count,
      commissionRate: agency?.commissionRate || 0,
      commissionsEarned,
      recentPayments,
      invoices,
    };
  }

  // ── Enroll (HubSpot) ──────────────────────────
  // Creates a HubSpot contact (Student-B2B) + deal in Agent/Partner pipeline,
  // associates both with the partner's company.
  const HUBSPOT_PAT = process.env.HUBSPOT_WRITE_TOKEN || process.env.ACCESS_TOKEN;
  const HS = 'https://api.hubapi.com';
  const B2B_PIPELINE = '35765201';
  const ENROLMENT_STAGE = '109570243';
  // All partner-portal enrolments are owned by Partners (partners@ulearnschool.com).
  // Set on the deal at creation — HubSpot leaves new API-created deals unowned
  // otherwise, which drops them out of the Partners team's views/automation.
  const PARTNERS_OWNER = '514760653';

  async function hsRequest(method: string, path: string, body?: any): Promise<any> {
    const opts: any = {
      method,
      headers: { 'Authorization': `Bearer ${HUBSPOT_PAT}`, 'Content-Type': 'application/json' },
    };
    if (body && method !== 'GET') opts.body = JSON.stringify(body);
    const res = await fetch(HS + path, opts);
    return res.json().catch(() => ({}));
  }

  // Course / territory / week-band / accom / extras mappers now live in
  // ./booking-deal (shared with the student-app booking surface, imported at
  // top of file as { TERRITORY_MAP, buildBaseDealProps }). TERRITORY_MAP is
  // still referenced below for partner LifePass eligibility.

  // LifePass tab eligibility — hidden for partners whose company territory is Visa-Before-Departure
  // (China/Russia/Turkey etc.) or Unsupported; LifePass isn't offered to those markets. Territory is
  // derived from the HubSpot company `country` (HubSpot is authoritative for agencies). NB: this gates
  // on the PARTNER's own territory, not the student's — an EU-registered reseller recruiting Non-EU
  // (No Visa) students keeps the tab. Cached 1h; fails OPEN (show) on any error.
  const _lpEligibleCache: Record<number, { at: number; eligible: boolean }> = {};
  async function agencyLifePassEligible(agencyId: number): Promise<boolean> {
    const hit = _lpEligibleCache[agencyId];
    if (hit && Date.now() - hit.at < 3600_000) return hit.eligible;
    let eligible = true;
    try {
      const agency = await prisma.agency.findUnique({ where: { id: agencyId }, select: { hubspotCompanyId: true } });
      if (agency?.hubspotCompanyId && HUBSPOT_PAT) {
        const c = await hsRequest('GET', `/crm/v3/objects/companies/${agency.hubspotCompanyId}?properties=country`);
        const country = c?.properties?.country;
        const territory = country ? (TERRITORY_MAP[country] || 'Unsupported Territory') : null;
        if (territory === 'Non-EU (VBD)' || territory === 'Unsupported Territory') eligible = false;
      }
    } catch { eligible = true; } // fail open — never hide LifePass from an eligible partner over a transient error
    _lpEligibleCache[agencyId] = { at: Date.now(), eligible };
    return eligible;
  }

  // ── Live HubSpot pull — quotes, invoices, payments, totals ──
  // Single round-trip source for the dashboard. Polled on dashboard load (refresh button).
  async function liveFinance(agencyId: number) {
    if (!HUBSPOT_PAT) return { quotes: [], invoices: [], totals: { billed: 0, paid: 0, balance: 0 }, dealCount: 0, commissionRate: 0, commissionsEarned: 0 };

    // Get the agency's HubSpot company ID + commission.
    // NOTE: commissionRate is a cached mirror of HubSpot's value, refreshed weekly
    // by scripts/sync-commissions.ts. Authoritative source is the HubSpot company
    // `commission` property. We keep a copy here for low-latency reads (incentive
    // projections, dashboard). Do not WRITE to it from the portal code.
    const agency = await prisma.agency.findUnique({
      where: { id: agencyId },
      select: { hubspotCompanyId: true, commissionRate: true, name: true },
    });
    if (!agency?.hubspotCompanyId) {
      return { quotes: [], invoices: [], totals: { billed: 0, paid: 0, balance: 0 }, dealCount: 0, commissionRate: 0, commissionsEarned: 0 };
    }

    // 1. All deals for the company
    const dealsRes = await hsRequest('GET', `/crm/v4/objects/companies/${agency.hubspotCompanyId}/associations/deals`);
    const dealIds: string[] = (dealsRes.results || []).map((r: any) => String(r.toObjectId));
    if (dealIds.length === 0) {
      return { quotes: [], invoices: [], totals: { billed: 0, paid: 0, balance: 0 }, dealCount: 0, commissionRate: Number(agency.commissionRate) || 0, commissionsEarned: 0 };
    }

    // Resolve student names for these deals (for the invoice/quote tables) via
    // SIS bookings — "INV-1309" is meaningless to a partner without the name.
    const nameRows = await prisma.booking.findMany({
      where: { hubspotDealId: { in: dealIds } },
      select: { id: true, hubspotDealId: true, hubspotInvoiceId: true, student: { select: { firstName: true, lastName: true } } },
    });
    const nameByDeal: Record<string, string> = {};
    // Map the HubSpot invoice id → SIS booking id so the gross-receipt link
    // (/partners/api/gross-receipt/:bookingId) can be built per invoice row.
    const bookingIdByInvoice: Record<string, number> = {};
    // Also map by DEAL: a booking stores only ONE hubspotInvoiceId (the webhook
    // self-heals it to the LATEST invoice), so an earlier invoice on the same
    // deal — e.g. INV-1409 alongside a later INV-1464 — would otherwise have no
    // booking id and thus no gross-receipt link. Every invoice on the deal maps
    // to the deal's booking. The per-invoice map still wins when present.
    const bookingIdByDeal: Record<string, number> = {};
    for (const b of nameRows) {
      if (b.hubspotDealId && b.student && !nameByDeal[b.hubspotDealId]) {
        nameByDeal[b.hubspotDealId] = `${b.student.firstName || ''} ${b.student.lastName || ''}`.trim();
      }
      if (b.hubspotInvoiceId && bookingIdByInvoice[b.hubspotInvoiceId] == null) {
        bookingIdByInvoice[b.hubspotInvoiceId] = b.id;
      }
      if (b.hubspotDealId && bookingIdByDeal[b.hubspotDealId] == null) {
        bookingIdByDeal[b.hubspotDealId] = b.id;
      }
    }

    // 2. Resolve deal→quote and deal→invoice associations in BATCH (not per-deal).
    // The old N+1 (one /associations GET per deal) blew HubSpot's ~190 req/10s rate
    // limit for agencies with many deals — Blue (94 deals) ≈ 190 calls, so the 2nd
    // dashboard load 429'd on its first request and zeroed the whole dashboard out.
    // The v4 batch association read collapses 2×N calls into a couple of chunked POSTs.
    async function assocByDeal(toType: string): Promise<Record<string, string[]>> {
      const map: Record<string, string[]> = {};
      for (let i = 0; i < dealIds.length; i += 100) {
        const chunk = dealIds.slice(i, i + 100);
        const res = await hsRequest('POST', `/crm/v4/associations/deals/${toType}/batch/read`, { inputs: chunk.map(id => ({ id })) });
        for (const r of (res.results || [])) {
          map[String(r.from?.id)] = (r.to || []).map((t: any) => String(t.toObjectId ?? t.id));
        }
      }
      return map;
    }
    const [quoteByDeal, invoiceByDeal] = await Promise.all([assocByDeal('quotes'), assocByDeal('invoices')]);

    const quoteIds = new Set<string>();
    const dealByQuote: Record<string, string> = {};
    for (const [dealId, qids] of Object.entries(quoteByDeal)) {
      for (const qId of qids) { quoteIds.add(qId); dealByQuote[qId] = dealId; }
    }

    const invoiceIds = new Set<string>();
    const dealByInvoice: Record<string, string> = {};
    for (const [dealId, iids] of Object.entries(invoiceByDeal)) {
      for (const iId of iids) { invoiceIds.add(iId); dealByInvoice[iId] = dealId; }
    }

    // 3. Batch-read quote + invoice details in parallel
    const [quoteBatch, invoiceBatch] = await Promise.all([
      quoteIds.size ? hsRequest('POST', '/crm/v3/objects/quotes/batch/read', {
        properties: ['hs_status', 'hs_title', 'hs_quote_amount', 'hs_quote_number', 'hs_expiration_date', 'hs_createdate', 'hs_quote_link', 'hs_pdf_download_link'],
        inputs: Array.from(quoteIds).map(id => ({ id })),
      }) : Promise.resolve({ results: [] }),
      invoiceIds.size ? hsRequest('POST', '/crm/v3/objects/invoices/batch/read', {
        properties: ['hs_number', 'hs_invoice_status', 'hs_amount_billed', 'hs_subtotal', 'hs_amount_paid', 'hs_balance_due', 'hs_invoice_date', 'hs_due_date', 'hs_pdf_download_link', 'hs_invoice_link', 'hs_title'],
        inputs: Array.from(invoiceIds).map(id => ({ id })),
      }) : Promise.resolve({ results: [] }),
    ]);

    // 4. Filter + shape quotes — only approved/pending (hide drafts), join with partner action state
    const rawPublished = (quoteBatch.results || [])
      .filter((q: any) => q.properties?.hs_status && q.properties.hs_status !== 'DRAFT');

    // Look up partner actions for these quotes
    const actionRows = rawPublished.length ? await prisma.partnerQuoteAction.findMany({
      where: { quoteId: { in: rawPublished.map((q: any) => q.id) } },
      select: { quoteId: true, action: true, comments: true, createdAt: true, hubspotTaskId: true },
    }) : [];
    const actionByQuote: Record<string, any> = {};
    for (const a of actionRows) actionByQuote[a.quoteId] = a;

    // Two-way: reflect when staff have COMPLETED the HubSpot task raised by a
    // QUERIED action → the portal shows "Resolved". One batched read (never a
    // per-quote loop — HubSpot rate limit). Failure here must not break finance.
    const taskStatusById: Record<string, string> = {};
    const queriedTaskIds = actionRows
      .filter(a => a.action === 'QUERIED' && a.hubspotTaskId)
      .map(a => a.hubspotTaskId as string);
    if (queriedTaskIds.length) {
      try {
        const tr = await hsRequest('POST', '/crm/v3/objects/tasks/batch/read', {
          properties: ['hs_task_status'],
          inputs: queriedTaskIds.map(id => ({ id })),
        });
        for (const t of (tr.results || [])) taskStatusById[t.id] = t.properties?.hs_task_status || '';
      } catch (e) { console.warn('[liveFinance] task status read failed:', (e as any)?.message); }
    }

    const publishedQuotes = rawPublished
      .map((q: any) => ({
        id: q.id,
        dealId: dealByQuote[q.id],
        studentName: nameByDeal[dealByQuote[q.id]] || null,
        status: q.properties.hs_status,
        title: q.properties.hs_title,
        amount: Number(q.properties.hs_quote_amount || 0),
        quoteNumber: q.properties.hs_quote_number,
        createdAt: q.properties.hs_createdate,
        expiresAt: q.properties.hs_expiration_date,
        publicUrl: q.properties.hs_quote_link || null,
        pdfUrl: q.properties.hs_pdf_download_link || null,
        partnerAction: actionByQuote[q.id]?.action || null,     // 'ACCEPTED' | 'QUERIED' | null
        partnerActionAt: actionByQuote[q.id]?.createdAt || null,
        partnerComments: actionByQuote[q.id]?.comments || null,
        // QUERIED + the staff HubSpot task is COMPLETED → the query is resolved.
        resolved: actionByQuote[q.id]?.action === 'QUERIED'
          && !!actionByQuote[q.id]?.hubspotTaskId
          && taskStatusById[actionByQuote[q.id].hubspotTaskId] === 'COMPLETED',
      }))
      .sort((a: any, b: any) => (b.createdAt || '').localeCompare(a.createdAt || ''));

    // 5. Filter + shape invoices — exclude drafts
    const invoices = (invoiceBatch.results || [])
      .filter((inv: any) => inv.properties?.hs_invoice_status && inv.properties.hs_invoice_status !== 'draft')
      .map((inv: any) => ({
        id: inv.id,
        dealId: dealByInvoice[inv.id],
        bookingId: bookingIdByInvoice[inv.id] ?? bookingIdByDeal[dealByInvoice[inv.id]] ?? null,
        studentName: nameByDeal[dealByInvoice[inv.id]] || null,
        number: inv.properties.hs_number,
        status: inv.properties.hs_invoice_status,
        billed: Number(inv.properties.hs_amount_billed || 0),
        subtotal: Number(inv.properties.hs_subtotal || 0),
        paid: Number(inv.properties.hs_amount_paid || 0),
        balance: Number(inv.properties.hs_balance_due || 0),
        invoiceDate: inv.properties.hs_invoice_date,
        dueDate: inv.properties.hs_due_date,
        pdfUrl: inv.properties.hs_pdf_download_link,
        invoiceUrl: inv.properties.hs_invoice_link,
      }))
      .sort((a: any, b: any) => (b.invoiceDate || '').localeCompare(a.invoiceDate || ''));

    // 6. Totals from live invoices (source of truth for partner's financial view)
    const billed = invoices.reduce((s: number, i: any) => s + i.billed, 0);
    const paid = invoices.reduce((s: number, i: any) => s + i.paid, 0);
    const balance = invoices.reduce((s: number, i: any) => s + i.balance, 0);

    const commissionRate = Number(agency.commissionRate) || 0;
    // ACTUAL commission earned — read straight off the invoices, not estimated.
    // HubSpot records the agency commission as the one-time discount between
    // subtotal and total, so per invoice: commission = hs_subtotal − hs_amount_billed.
    // Summed across all (non-draft) invoices = the real recorded commission.
    const commissionsEarned = invoices.reduce((s: number, i: any) => s + Math.max(0, (i.subtotal || 0) - (i.billed || 0)), 0);

    return {
      quotes: publishedQuotes,
      invoices,
      totals: { billed, paid, balance },
      dealCount: dealIds.length,
      commissionRate,
      commissionsEarned,
    };
  }

  // ── Record a partner quote action (ACCEPT or QUERY) ──
  //    Writes to SIS partner_quote_actions + creates a HubSpot Task on the deal.
  async function recordQuoteAction(
    agencyId: number,
    agencyName: string,
    data: { quoteId: string; dealId: string; action: 'ACCEPTED' | 'QUERIED'; comments?: string }
  ) {
    if (!HUBSPOT_PAT) throw new Error('HubSpot not configured');
    if (!data.quoteId || !data.dealId || !data.action) {
      return { success: false, error: 'Missing quoteId, dealId, or action' };
    }
    if (data.action !== 'ACCEPTED' && data.action !== 'QUERIED') {
      return { success: false, error: 'Invalid action' };
    }

    // 1. Upsert the action record in SIS (idempotent by quoteId)
    await prisma.partnerQuoteAction.upsert({
      where: { quoteId: data.quoteId },
      create: {
        quoteId: data.quoteId,
        dealId: data.dealId,
        agencyId,
        action: data.action,
        comments: data.comments || null,
      },
      update: {
        action: data.action,
        comments: data.comments || null,
      },
    });

    // 2. Create a HubSpot Task on the deal for staff to action
    const subject = data.action === 'ACCEPTED'
      ? `Quote Accepted — Convert to Invoice (${agencyName})`
      : `Quote Queried by Partner (${agencyName})`;

    const body = data.action === 'ACCEPTED'
      ? `${agencyName}: Accepted — please convert to invoice.`
      : `${agencyName}: "${data.comments || '(no reason provided)'}"`;

    const taskRes = await hsRequest('POST', '/crm/v3/objects/tasks', {
      properties: {
        hs_task_subject: subject,
        hs_task_body: body,
        hs_task_status: 'NOT_STARTED',
        hs_task_priority: data.action === 'QUERIED' ? 'HIGH' : 'MEDIUM',
        hs_timestamp: Date.now().toString(),
      },
    });

    if (taskRes.id) {
      // Associate task with the deal (associationTypeId 216 = task_to_deal)
      await hsRequest('PUT',
        `/crm/v4/objects/tasks/${taskRes.id}/associations/deals/${data.dealId}`,
        [{ associationCategory: 'HUBSPOT_DEFINED', associationTypeId: 216 }]
      );
      // Remember the task so the portal can later reflect its completion
      // (QUERIED → "Resolved") — the two-way signal.
      await prisma.partnerQuoteAction.update({
        where: { quoteId: data.quoteId },
        data: { hubspotTaskId: String(taskRes.id) },
      });
    }

    return { success: true, taskId: taskRes.id || null };
  }

  // Current month's challenge promotion — drives the enrolment-form label (from the hub utility).
  async function currentChallenge() {
    return { success: true, challenge: await getActiveChallenge() };
  }

  // Blanket "apply this month's Challenge to all my enrolments" toggle (per agency).
  // ON only when the stored month matches the live challenge month — so it auto-expires
  // each month and the partner must re-flip it (the monthly cadence).
  async function getChallengeOptIn(agencyId: number) {
    const [ch, next] = await Promise.all([getActiveChallenge(), getNextChallenge()]);
    const month = ch?.month || challengeMonthKey();
    const row = await prisma.challengeOptIn.findUnique({ where: { agencyId } });
    return { success: true, on: !!row && row.month === month, challenge: ch, next };
  }
  async function setChallengeOptIn(agencyId: number, on: boolean) {
    const ch = await getActiveChallenge();
    const month = ch?.month || challengeMonthKey();
    if (on) {
      await prisma.challengeOptIn.upsert({ where: { agencyId }, create: { agencyId, month }, update: { month } });
    } else {
      await prisma.challengeOptIn.deleteMany({ where: { agencyId } });
    }
    return { success: true, on, challenge: ch };
  }

  async function enroll(agencyId: number, agencyName: string, data: any, partnerHubspotContactId?: string) {
    if (!HUBSPOT_PAT) throw new Error('HubSpot not configured');
    if (!data.firstName || !data.lastName || !data.nationality) {
      return { success: false, error: 'First name, last name, and nationality are required' };
    }
    // Challenge opt-in requires a social handle (Progress Posts) — mirrors the
    // enrolment form's client-side rule so a direct API call can't bypass it.
    if (data.challenge && !String(data.instagram || '').trim()) {
      return { success: false, error: 'Instagram handle is required to join the Challenge.' };
    }

    // GUARD (Housam→Ahmed incident, 2026-06-05): a partner must NEVER submit a
    // student under their OWN email. HubSpot dedupes by email, so it collides with
    // the partner's own contact and the PATCH below would overwrite it with the
    // student's data. Student email is optional — blank is fine; their own is not.
    if (data.email && partnerHubspotContactId) {
      try {
        const me = await hsRequest('GET', `/crm/v3/objects/contacts/${partnerHubspotContactId}?properties=email`);
        const partnerEmail = (me?.properties?.email || '').toLowerCase().trim();
        if (partnerEmail && partnerEmail === String(data.email).toLowerCase().trim()) {
          return { success: false, error: 'You cannot use your own email address for a student. Leave the student email blank if they do not have one.' };
        }
      } catch { /* lookup failed — the conflict guard below still protects us */ }
    }

    // 1. Create or update contact.
    //    Email is optional for partner-submitted enrollments — some partners don't
    //    share student emails with us. We only include it if provided.
    const contactProps: Record<string, string> = {
      firstname: data.firstName,
      lastname: data.lastName,
      phone: data.phone || '',
      date_of_birth: data.dateOfBirth || '',
      nationality: data.nationality,
      type: 'Student-B2B',
      agent: agencyName,
    };
    if (data.email) contactProps.email = data.email;
    // Instagram handle → contact `instagram` property (same target as the website
    // booking form, just wired via the CRM API here). Strip any leading "@".
    const ig = String(data.instagram || '').trim().replace(/^@+/, '').trim();
    if (ig) contactProps.instagram = ig;

    let contactId: string;
    const contactRes = await hsRequest('POST', '/crm/v3/objects/contacts', { properties: contactProps });

    if (contactRes.id) {
      contactId = contactRes.id;
    } else if (contactRes.status === 'error' && contactRes.category === 'CONFLICT') {
      // Contact exists — extract ID from error message
      const match = contactRes.message?.match(/Existing ID: (\d+)/);
      if (!match) return { success: false, error: 'Contact already exists but could not resolve ID' };
      contactId = match[1];
      // GUARD: the student email collided with an EXISTING contact. Never let the
      // PATCH overwrite the submitting partner's own contact, or any non-student
      // (Employee/agent) contact, with student form data.
      if (partnerHubspotContactId && contactId === partnerHubspotContactId) {
        return { success: false, error: 'That email belongs to your own partner account — leave the student email blank.' };
      }
      const existing = await hsRequest('GET', `/crm/v3/objects/contacts/${contactId}?properties=type`);
      if (/employee/i.test(existing?.properties?.type || '')) {
        return { success: false, error: 'That email already belongs to an agent/employee contact — use a different email or leave it blank.' };
      }
      await hsRequest('PATCH', '/crm/v3/objects/contacts/' + contactId, { properties: contactProps });
    } else {
      return { success: false, error: contactRes.message || 'Failed to create contact in HubSpot' };
    }

    // 2. Build deal properties — course/territory/dates/accom/extras come from
    //    the shared builder (identical mapping across all booking surfaces).
    const dealProps: Record<string, any> = {
      dealname: `${data.firstName} ${data.lastName} | ${data.nationality} | ${agencyName}`,
      pipeline: B2B_PIPELINE,
      dealstage: ENROLMENT_STAGE,
      hubspot_owner_id: PARTNERS_OWNER,
      ...buildBaseDealProps(data),
    };

    // Academic Year renewal — maps the form checkbox to the HubSpot deal
    // `renewal` boolean (Yes/No). Only AY shows the checkbox, so it's false
    // for everything else.
    dealProps.renewal = data.isRenewal ? 'true' : 'false';

    // Challenge promotion — when the partner opts in, stamp THIS MONTH's active
    // challenge name onto the deal so HubSpot autoQuote applies the discount.
    // The value is taken from the server registry (authoritative), never the
    // client — the client only sends the on/off toggle. No active challenge → no-op.
    // KickStart/Challenge and LifePass are mutually exclusive programmes — never stamp a
    // challenge on a LifePass deal, even if the box arrived ticked (course switched late).
    if (data.challenge && data.courseType !== 'lifepass') {
      const ch = await getActiveChallenge();
      if (ch) dealProps.challenge = ch.type;
    }

    // 3. Create deal
    const dealRes = await hsRequest('POST', '/crm/v3/objects/deals', { properties: dealProps });
    if (!dealRes.id) return { success: false, error: dealRes.message || 'Failed to create deal in HubSpot' };
    const dealId = dealRes.id;

    // 4. Associate deal ↔ student contact: default Deal↔Contact (3) PLUS the
    //    "Student-B2B" association label (USER_DEFINED 11) — so the student is
    //    labelled on the deal association, distinct from the Agent's "Partner".
    await hsRequest('PUT', `/crm/v4/objects/deals/${dealId}/associations/contacts/${contactId}`,
      [{ associationCategory: 'HUBSPOT_DEFINED', associationTypeId: 3 },
       { associationCategory: 'USER_DEFINED', associationTypeId: 11 }]);

    // 5. Associate deal with the Partner's Primary Entity (Company OR Agent Employee Contact).
    //    This is authoritative: stored on the agency record at onboarding, not inferred at login.
    const agency = await prisma.agency.findUnique({
      where: { id: agencyId },
      select: { primaryEntityId: true, primaryEntityType: true, hubspotCompanyId: true },
    });

    if (agency?.primaryEntityId) {
      if (agency.primaryEntityType === 'company') {
        // Deal ↔ Company ONLY. The student contact is an ENROLMENT, not an
        // employee — so it must NOT get a contact↔primary-company association
        // (that link is reserved for Agent-Employee contacts in our model).
        // The student is tied to the agency via the deal, not the company.
        await hsRequest('PUT', `/crm/v4/objects/deals/${dealId}/associations/companies/${agency.primaryEntityId}`,
          [{ associationCategory: 'HUBSPOT_DEFINED', associationTypeId: 5 }]);
      } else if (agency.primaryEntityType === 'contact') {
        // Sole trader — deal ↔ Agent Employee contact, labelled "Partner" (13)
        if (agency.primaryEntityId !== contactId) {
          await hsRequest('PUT', `/crm/v4/objects/deals/${dealId}/associations/contacts/${agency.primaryEntityId}`,
            [{ associationCategory: 'HUBSPOT_DEFINED', associationTypeId: 3 },
             { associationCategory: 'USER_DEFINED', associationTypeId: 13 }]);
        }
      }
    }

    // 6. Attach the submitting partner's own HubSpot Contact (for email routing).
    //    Whoever logged in and submitted this enrollment is the person whose email
    //    the ULearn team will reply to. This is the SisUser's stored hubspotContactId
    //    (captured at registration), not an agency-wide "primary" contact — partners
    //    self-select by logging in with the right account (admissions vs accounts, etc).
    if (partnerHubspotContactId && partnerHubspotContactId !== contactId) {
      try {
        await hsRequest('PUT', `/crm/v4/objects/deals/${dealId}/associations/contacts/${partnerHubspotContactId}`,
          [{ associationCategory: 'HUBSPOT_DEFINED', associationTypeId: 3 },
           { associationCategory: 'USER_DEFINED', associationTypeId: 13 }]); // + "Partner" label
      } catch { /* non-fatal */ }
    }

    // 7. Notify staff. A partner enrolment otherwise lands a deal in the
    //    pipeline silently (Neil 2026-06-25). Email the team the headline
    //    details + deal link, AND log a note on the deal timeline so it's also
    //    visible on the record. Best-effort — never fail the enrolment on this.
    try {
      const E = (s: any) => String(s ?? '').replace(/[<>&]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]!));
      const dealUrl = `https://app-eu1.hubspot.com/contacts/26488591/record/0-3/${dealId}`;
      const course = dealProps.course_type || '—';
      const start  = dealProps.course_start || '—';
      const weeks  = dealProps.course_weeks || (data.courseType === 'private' ? '(private)' : '—');
      const rows = [
        `Student Name: ${E(data.firstName)} ${E(data.lastName)}`,
        `Nation: ${E(data.nationality || '—')}`,
        `Course: ${E(course)}`,
        `Start: ${E(start)}`,
        `Weeks: ${E(weeks)}`,
      ];
      const html = `<strong>New Enrollment from ${E(agencyName)}</strong><br>${rows.join('<br>')}`
        + `<br><br><a href="${dealUrl}">Open the deal in HubSpot &rarr;</a>`;
      // Reply-To = the submitting partner's own email, so a staff reply (or the AI
      // responder) goes to the PARTNER, not back into the info@/partners@ inbox.
      // Without this, replying to our own notification never reaches the agent —
      // the reply just loops to ourselves. (Neil 2026-09-24)
      let partnerReplyTo: string | undefined;
      if (partnerHubspotContactId) {
        const p = await prisma.sisUser.findFirst({ where: { hubspotContactId: partnerHubspotContactId }, select: { email: true } });
        partnerReplyTo = p?.email || undefined;
      }
      sendEmail({
        // From info@ (not partners@): the notify lands in the partners@ TEAM inbox,
        // and HubSpot treats partners@→partners@ self-sends as spam, so enrolment
        // alerts were being buried for days. info@ is an allowed sender and surfaces
        // normally in the shared inbox (Neil, 2026-07-24).
        from: 'info@ulearnschool.com',
        to: process.env.PARTNER_ENROLL_NOTIFY || 'partners@ulearnschool.com',
        replyTo: partnerReplyTo,
        subject: `New Enrollment from ${agencyName} — ${data.firstName} ${data.lastName}`,
        html,
        houseStyle: false,
      }).catch(e => console.error('[enroll notify] email failed:', e?.message || e));

      // Deal-timeline note (note → deal association typeId 214).
      const note = await hsRequest('POST', '/crm/v3/objects/notes', {
        properties: { hs_timestamp: Date.now(), hs_note_body: `New Enrollment from ${agencyName}\n${rows.join('\n')}` },
      });
      if (note?.id) {
        await hsRequest('PUT', `/crm/v4/objects/notes/${note.id}/associations/deals/${dealId}`,
          [{ associationCategory: 'HUBSPOT_DEFINED', associationTypeId: 214 }]);
      }
    } catch (e) { console.error('[enroll notify] failed:', (e as any)?.message || e); }

    // Trigger AutoQuote after a 60s settle window — lets the deal fully land and
    // any other HubSpot workflows / enrichment run first, so autoQuote drafts off
    // a COMPLETE deal rather than racing them (Neil, 2026-09-30). Deal field
    // `autoquote='true'` (label "Yes") fires the HubSpot workflow → hub autoQuote.js.
    // Fire-and-forget: we've already returned to the partner; a server restart
    // inside the window would skip it (rare, and staff still see the deal to quote).
    setTimeout(() => {
      hsRequest('PATCH', `/crm/v3/objects/deals/${dealId}`, { properties: { autoquote: 'true' } })
        .then(() => console.log(`[enroll] AutoQuote triggered on deal ${dealId} (60s after enrolment)`))
        .catch(e => console.error(`[enroll] AutoQuote trigger FAILED on deal ${dealId}:`, e?.message || e));
    }, 60000);

    return { success: true, dealId, contactId };
  }

  // ── Student detail (agency-scoped single-student drilldown) ──
  async function studentDetail(agencyId: number, studentId: number) {
    // Agency-scope check baked in: student must have at least one booking with this agency
    const student = await prisma.student.findFirst({
      where: {
        id: studentId,
        bookings: { some: { agencyId } },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        phoneMobile: true,
        birthday: true,
        nationality: true,
        currentLevel: true,
        profilePicture: true,
        studentType: true,
        // Passport fields — the LOA-required trio, partner-editable in the portal.
        passportNumber: true,
        passportValidFrom: true,
        passportValidUntil: true,
        // Flights (read-only display in the portal) — inbound arrival + outbound return.
        flightNumber: true,
        flightDate: true,
        flightTime: true,
        outboundFlightNumber: true,
        outboundFlightDate: true,
        outboundFlightTime: true,
        // Only bookings belonging to the partner's agency
        bookings: {
          where: { agencyId },
          select: {
            id: true,
            status: true,
            serviceStart: true,
            serviceEnd: true,
            amountTotal: true,
            amountPaid: true,
            amountOpen: true,
            currency: true,
            courses: {
              select: { name: true, level: true, startDate: true, endDate: true, weeks: true, hoursPerWeek: true, category: true },
              orderBy: { startDate: 'asc' },
            },
            accommodations: {
              select: { accommodationType: true, roomType: true, startDate: true, endDate: true, weeks: true },
              orderBy: { startDate: 'asc' },
            },
            payments: {
              select: { amount: true, method: true, paymentDate: true, type: true },
              orderBy: { paymentDate: 'desc' },
              take: 10,
            },
          },
          orderBy: { serviceStart: 'desc' },
        },
      },
    });
    if (!student) return { success: false, error: 'Student not found' };
    // Issued documents (LOAs/certs etc.) for this student, scoped to this
    // agency's bookings (+ any not tied to a booking). Only ISSUED — drafts stay internal.
    const agencyBookingIds = student.bookings.map(b => b.id);
    const [issuedDocuments, allUploads] = await Promise.all([
      prisma.documentRecord.findMany({
        where: { studentId, status: 'ISSUED' as any, OR: [{ bookingId: { in: agencyBookingIds } }, { bookingId: null }] },
        select: { id: true, documentType: true, issuedAt: true, template: { select: { name: true } } },
        orderBy: { issuedAt: 'desc' },
      }),
      prisma.studentDocument.findMany({
        where: { studentId },
        select: { id: true, originalName: true, mimeType: true, size: true, createdAt: true, category: true, uploadedBy: true },
        orderBy: { createdAt: 'desc' },
      }),
    ]);
    // Passport stays in its own block (it drives the passport-fields panel);
    // everything else the student/staff uploaded — incl. student self-uploads —
    // surfaces as studentUploads so the agent sees them without an email.
    const passportUploads = allUploads.filter(d => d.category === 'passport');
    const studentUploads = allUploads.filter(d => d.category !== 'passport');
    return { success: true, student, issuedDocuments, passportUploads, studentUploads };
  }

  // ── Documents ──
  //    Surfaces both Zoho-imported historicals (partner_documents) and
  //    internally-signed agreements (agency_signatures), merged + sorted
  //    by signedAt desc. The frontend uses `source` to pick the right
  //    PDF URL: 'zoho' → /documents/:id/pdf, 'internal' → /contract/signed.pdf
  //    (only the latest internal signature is served from there for now;
  //    historical internal sigs are kept in the table as audit trail).
  async function documents(agencyId: number) {
    const [zohoDocs, sigDocs] = await Promise.all([
      prisma.partnerDocument.findMany({
        where: { agencyId },
        select: { id: true, requestName: true, requestStatus: true, signedAt: true, signerEmail: true, signerName: true, pdfCachedPath: true },
        orderBy: { signedAt: 'desc' },
      }),
      prisma.agencySignature.findMany({
        where: { agencyId },
        select: { id: true, contractVersion: true, mode: true, signedAt: true, signerEmail: true, signerName: true, pdfPath: true },
        orderBy: { signedAt: 'desc' },
      }),
    ]);

    const fromZoho = zohoDocs.map(d => ({
      source: 'zoho' as const,
      id: d.id,
      requestName: d.requestName || 'Partner contract',
      status: d.requestStatus || null,
      signedAt: d.signedAt,
      signerEmail: d.signerEmail,
      signerName: d.signerName,
      hasPdf: !!d.pdfCachedPath,
    }));

    const fromInternal = sigDocs.map(s => ({
      source: 'internal' as const,
      id: s.id,
      requestName: s.mode === 'grandfathered'
        ? 'Partnership Agreement (grandfathered)'
        : s.mode === 'legacy-zoho'
          ? 'Partnership Agreement (Zoho legacy import)'
          : s.mode === 'legacy-paper'
            ? 'Partnership Agreement (pre-Zoho, signed on paper)'
            : `Partnership Agreement (${s.contractVersion})`,
      status: 'completed',
      signedAt: s.signedAt,
      signerEmail: s.signerEmail,
      signerName: s.signerName,
      hasPdf: !!s.pdfPath,
    }));

    const merged = [...fromInternal, ...fromZoho].sort((a, b) => {
      const at = a.signedAt ? a.signedAt.getTime() : 0;
      const bt = b.signedAt ? b.signedAt.getTime() : 0;
      return bt - at;
    });

    return { documents: merged };
  }

  // ── Self-service registration ────────────────
  //    Validates the email against HubSpot: must belong to a Contact whose company
  //    has a linked SIS agency (primary_entity_type = 'company'), OR the Contact is
  //    itself the primary_entity for a sole-trader agency. If valid, creates a
  //    SisUser with user_type='partner' and links it to the agency.
  async function registerPartner(data: {
    email?: string; username?: string; password?: string;
  }) {
    if (!HUBSPOT_PAT) {
      console.warn(`[registerPartner] REJECT service-unavailable email="${data.email}"`);
      return { success: false, error: 'Service not available' };
    }

    const email = String(data.email || '').toLowerCase().trim();
    const username = String(data.username || '').trim();
    const password = String(data.password || '');

    // Basic validation
    if (!email || !username || !password) {
      console.warn(`[registerPartner] REJECT missing-fields email="${email}" username="${username}" pwLen=${password.length}`);
      return { success: false, error: 'All fields are required' };
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      console.warn(`[registerPartner] REJECT invalid-email "${email}"`);
      return { success: false, error: 'Invalid email address' };
    }
    if (username.length < 3 || /\s/.test(username)) {
      console.warn(`[registerPartner] REJECT invalid-username "${username}" for ${email}`);
      return { success: false, error: 'Username must be at least 3 characters and contain no spaces' };
    }
    if (password.length < 8) {
      console.warn(`[registerPartner] REJECT short-password email="${email}" len=${password.length}`);
      return { success: false, error: 'Password must be at least 8 characters' };
    }

    // Uniqueness checks
    const existingUser = await prisma.sisUser.findUnique({ where: { username } });
    if (existingUser) {
      console.warn(`[registerPartner] REJECT username-taken "${username}" attempted by ${email}`);
      return { success: false, error: 'Username already taken — choose another' };
    }

    const existingEmail = await prisma.sisUser.findFirst({ where: { email } });
    if (existingEmail) {
      console.warn(`[registerPartner] REJECT email-taken ${email} (existing user #${existingEmail.id})`);
      return { success: false, error: 'An account already exists for this email — use Forgot Password to reset' };
    }

    // ── Gate: are you an agent employee in HubSpot? ───────────────────
    // ALLOW-LIST: pass ONLY if a Contact with this exact email exists AND its
    // `type` is "Employee" (our agent-employee value). Everything else —
    // student, any other type, and crucially BLANK/unclassified — is rejected,
    // and a domain-matched Company no longer grants access on its own.
    // (The old reject-list of "student*" leaked: Micael Goulart, a Student-B2C,
    // registered 2026-08-01 because his contact's `type` was still blank 27 min
    // after contact-create. Being an Employee contact is now required. Neil, 2026-08.)
    const searchRes = await hsRequest('POST', '/crm/v3/objects/contacts/search', {
      filterGroups: [{ filters: [{ propertyName: 'email', operator: 'EQ', value: email }] }],
      properties: ['email', 'firstname', 'lastname', 'type'],
      limit: 1,
    });
    let contact = searchRes.results?.[0] || null;
    let contactId: string | null = null;
    let domainCompanyId: string | null = null;
    let domainCompanyName: string | null = null;

    if (contact) {
      const ctype = String(contact.properties?.type || '').toLowerCase();
      // ALLOW-LIST: only "Employee" (agent-employee) contacts may register. Reject
      // students, any other type, and blank/unclassified — the blank case is the
      // hole that leaked before (type gets classified minutes after contact-create).
      if (ctype !== 'employee') {
        console.warn(`[registerPartner] REJECT non-employee-contact ${email} (HS contact ${contact.id}, type="${ctype || 'unset'}")`);
        const msg = ctype.startsWith('student')
          ? 'This email belongs to a student account. Partner registration is for agent employees only.'
          : 'This email is not registered as an agent employee. Please contact partners@ulearnschool.com.';
        return { success: false, error: msg };
      }
      contactId = contact.id;
    }

    // Domain check — matches a company by the email's domain (covers: contact missing; also
    // validates Employees whose type field isn't yet set). SKIPPED for free/public providers:
    // a company mis-configured with a "gmail.com"/"yahoo.com"/"msn.com" domain would otherwise
    // let every bot on that provider through and inherit its portal (the 2026-07 flood). A
    // free-provider address only passes via the exact contact match above — the whole email,
    // not the domain.
    const domain = (email.split('@')[1] || '').toLowerCase();
    const isFreeProvider = FREE_EMAIL_PROVIDERS.has(domain);
    if (domain && !isFreeProvider) {
      const dcSearch = await hsRequest('POST', '/crm/v3/objects/companies/search', {
        filterGroups: [{ filters: [{ propertyName: 'domain', operator: 'EQ', value: domain }] }],
        properties: ['name', 'domain'],
        limit: 1,
      });
      const dc = dcSearch.results?.[0];
      if (dc) {
        domainCompanyId = dc.id;
        domainCompanyName = dc.properties?.name || null;
      }
    }

    // If neither a contact nor a domain-matched company — reject. For a free-provider address
    // this means "no exact HubSpot contact" → rejected (the durable fix for the bot flood).
    // Require an Employee contact. A domain-matched Company no longer grants access
    // on its own — that path let non-Employee people in without a typed contact.
    // domainCompanyId is still derived above, but now ONLY for downstream company LINKING.
    if (!contactId) {
      console.warn(`[registerPartner] REJECT gate-miss ${email} — no Employee-typed HS contact (domainCompany=${domainCompanyId || 'none'})`);
      return { success: false, error: 'Email not recognised as an agent employee. Please contact us at partners@ulearnschool.com.' };
    }

    // Derive display name from HubSpot contact if available — fall back to email local-part
    const cfn = (contact?.properties?.firstname || '').trim();
    const cln = (contact?.properties?.lastname || '').trim();
    const displayName = `${cfn} ${cln}`.trim() || email.split('@')[0];

    // ── Resolve SIS agency ──────────────────────────────────────────
    // Gate passed. Now find-or-create an SIS agency row to tie this user to.
    // Preference order:
    //   1. HubSpot company linked to this contact → find-or-create in SIS
    //   2. Domain-matched HubSpot company → find-or-create in SIS
    //   3. Contact with no company (sole trader) → find-or-create contact-primary agency
    // Any Fidelo-era orphan rows with corrupted names are ignored — they're legacy.
    let agencyId: number | null = null;

    // Gather candidate company IDs: first from contact's associations, then from domain match
    const candidateCompanyIds: string[] = [];
    if (contactId) {
      const compAssoc = await hsRequest('GET', `/crm/v4/objects/contacts/${contactId}/associations/companies`);
      for (const r of compAssoc.results || []) candidateCompanyIds.push(String(r.toObjectId));
    }
    if (domainCompanyId && !candidateCompanyIds.includes(domainCompanyId)) {
      candidateCompanyIds.push(domainCompanyId);
    }

    // Step 1: find-or-create SIS agency per candidate company
    for (const cid of candidateCompanyIds) {
      const existing = await prisma.agency.findFirst({ where: { hubspotCompanyId: cid } });
      if (existing) { agencyId = existing.id; break; }

      try {
        const company = await hsRequest('GET', `/crm/v3/objects/companies/${cid}?properties=name`);
        const companyName = company?.properties?.name || domainCompanyName || `HubSpot Company ${cid}`;
        // Dup guard: adopt an existing unlinked (Fidelo-legacy) same-name row
        // rather than minting a second row for this partner.
        const legacy = await prisma.agency.findFirst({ where: { hubspotCompanyId: null, name: { equals: companyName, mode: 'insensitive' } } });
        if (legacy) {
          const adopted = await prisma.agency.update({
            where: { id: legacy.id },
            data: { hubspotCompanyId: cid, primaryEntityId: cid, primaryEntityType: 'company' } as any,
          });
          agencyId = adopted.id;
          console.log(`[registerPartner] Dup-guard: adopted legacy agency #${adopted.id} "${legacy.name}" → HS company ${cid} (no new row)`);
          break;
        }
        const newAgency = await prisma.agency.create({
          data: {
            name: companyName,
            hubspotCompanyId: cid,
            primaryEntityId: cid,
            primaryEntityType: 'company',
          } as any,
        });
        agencyId = newAgency.id;
        console.log(`[registerPartner] Auto-created SIS agency #${agencyId} "${companyName}" linked to HubSpot company ${cid}`);
        break;
      } catch (e: any) {
        console.warn(`[registerPartner] Auto-create agency failed for company ${cid}: ${e.message}`);
      }
    }

    // Step 2: sole-trader path — contact exists but no company anywhere
    if (!agencyId && contactId) {
      const existing = await prisma.agency.findFirst({
        where: { primaryEntityId: contactId, primaryEntityType: 'contact' },
      });
      if (existing) {
        agencyId = existing.id;
      } else {
        try {
          const contactFullName = displayName;
          const newAgency = await prisma.agency.create({
            data: {
              name: contactFullName,
              primaryEntityId: contactId,
              primaryEntityType: 'contact',
            } as any,
          });
          agencyId = newAgency.id;
          console.log(`[registerPartner] Auto-created sole-trader agency #${agencyId} "${contactFullName}" for contact ${contactId}`);
        } catch (e: any) {
          console.warn(`[registerPartner] Sole-trader auto-create failed for contact ${contactId}: ${e.message}`);
        }
      }
    }

    if (!agencyId) {
      // Unreachable in practice (gate passed so we have either contact or company),
      // but leave a safety net.
      console.warn(`[registerPartner] REJECT agency-link-failed ${email} contactId=${contactId} companies=${JSON.stringify(candidateCompanyIds)}`);
      return { success: false, error: 'Could not link your agency. Please contact us at partners@ulearnschool.com.' };
    }

    // Create the user — cache their HubSpot Contact ID now (used later when they
    // submit enrollments — the Deal gets associated with this specific person).
    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = await prisma.sisUser.create({
      data: {
        username,
        email,
        passwordHash,
        displayName,
        role: 'partner',
        userType: 'partner',
        agencyId,
        hubspotContactId: contactId,
        active: true,
      },
    });
    console.log(`[registerPartner] SUCCESS user #${newUser.id} ${email} → agency #${agencyId}`);

    // Mirror the partner's email onto the Agency record. Fidelo-imported agencies carried an
    // Agency.email, but portal-registered ones didn't — so post-Fidelo partners (e.g. StudyZone)
    // had a blank Agency.email and the LoA/transport AGENT notify silently skipped them
    // ("no valid agency email"). Stamp it here. `updateMany` + empty-guard so we NEVER overwrite
    // an existing (Fidelo-correct) email — only fill the gap.
    if (agencyId && email) {
      await prisma.agency.updateMany({
        where: { id: agencyId, OR: [{ email: null }, { email: '' }] },
        data: { email } as any,
      }).catch((e: any) => console.warn(`[registerPartner] Agency.email mirror failed for #${agencyId}: ${e.message}`));
    }

    // Stamp the SIS ids back onto HubSpot (durable SIS↔HubSpot link + the
    // "registered on portal" signal) AND email the team a basic registration
    // notification that doubles as a field-stamp receipt. All fire-and-forget —
    // registration returns immediately and never fails on any of this.
    //   • Contact `sis_portal` ← full impersonate URL (?partner=<SisUser.id>)
    //   • Company `sis_portal` ← full impersonate URL (?agency=<Agency.id>)  (1 company ↔ 1 agency)
    //   A HubSpot Company→Contact workflow fans the company's link out to any
    //   other employees who later join threads/deals, so we only need to stamp
    //   the registering contact + its company here.
    (async () => {
      const E = (s: any) => String(s ?? '').replace(/[<>&]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]!));
      const IMPERSONATE_BASE = 'https://sis.ulearnschool.com/sis/partners/impersonate';
      const agency = await prisma.agency.findUnique({ where: { id: agencyId }, select: { name: true, hubspotCompanyId: true } }).catch(() => null);
      const companyId = agency?.hubspotCompanyId || null;
      const contactPortalUrl = `${IMPERSONATE_BASE}?partner=${newUser.id}`;
      const companyPortalUrl = `${IMPERSONATE_BASE}?agency=${agencyId}`;

      // Contact stamp — clickable portal link
      let contactStamp = 'no HubSpot contact';
      if (contactId) {
        contactStamp = await hsRequest('PATCH', `/crm/v3/objects/contacts/${contactId}`, { properties: { sis_portal: contactPortalUrl } })
          .then(() => { console.log(`[registerPartner] stamped sis_portal on contact ${contactId} → ${contactPortalUrl}`); return `stamped ✓ (${contactPortalUrl})`; })
          .catch((e: any) => { console.error(`[registerPartner] sis_portal push failed (contact ${contactId}):`, e?.message || e); return 'FAILED ✗'; });
      }
      // Company stamp — clickable portal link
      let companyStamp = 'no HubSpot company';
      if (companyId) {
        companyStamp = await hsRequest('PATCH', `/crm/v3/objects/companies/${companyId}`, { properties: { sis_portal: companyPortalUrl } })
          .then(() => { console.log(`[registerPartner] stamped sis_portal on company ${companyId} → ${companyPortalUrl}`); return `stamped ✓ (${companyPortalUrl})`; })
          .catch((e: any) => { console.error(`[registerPartner] sis_portal push failed (company ${companyId}):`, e?.message || e); return 'FAILED ✗'; });
      }

      // Basic registration notification — from partners@ to partners@ so the
      // thread is visible in the partners mailbox (Neil).
      try {
        const contactUrl = contactId ? `https://app-eu1.hubspot.com/contacts/26488591/record/0-1/${contactId}` : null;
        const rows = [
          `Name: ${E(displayName || username)}`,
          `Email: ${E(email)}`,
          `Username: ${E(username)}`,
          `Agency: ${E(agency?.name || '—')} (SIS #${agencyId})`,
          `SIS User ID: ${newUser.id}`,
          `HubSpot contact ${E(contactId || '—')} — sis_portal: ${E(contactStamp)}`,
          `HubSpot company ${E(companyId || '—')} — sis_portal: ${E(companyStamp)}`,
        ];
        const html = `<strong>New Partner Registration</strong><br>${rows.join('<br>')}`
          + (contactUrl ? `<br><br><a href="${contactUrl}">Open the contact in HubSpot &rarr;</a>` : '');
        sendEmail({
          // From info@ (not partners@): avoids HubSpot flagging partners@→partners@
          // self-sends as spam in the shared inbox, which was burying onboarding
          // alerts (Neil, 2026-07-24).
          from: 'info@ulearnschool.com',
          to: process.env.PARTNER_REGISTER_NOTIFY || 'partners@ulearnschool.com',
          // Reply-To = the new partner's own email so a reply reaches them, not us.
          replyTo: email || undefined,
          subject: `New Partner Registration — ${displayName || username} (${agency?.name || 'agency #' + agencyId})`,
          html,
          houseStyle: false,
        }).catch(e => console.error('[register notify] email failed:', e?.message || e));
      } catch (e: any) { console.error('[register notify] failed:', e?.message || e); }
    })();

    // Fire-and-forget Zoho contract sync so any historical docs for this
    // partner's domain/agency get mapped + cached locally before they log in.
    // We don't await — the registration response returns immediately.
    (async () => {
      try {
        const { syncContracts } = await import('./sync-contracts');
        await syncContracts(prisma);
      } catch (e: any) {
        console.warn(`[registerPartner] Background doc sync failed: ${e?.message || e}`);
      }
    })();

    return { success: true, userId: newUser.id };
  }

  // ── Student passport + uploads (partner-facing) ──
  async function assertStudentInAgency(agencyId: number, studentId: number) {
    const s = await prisma.student.findFirst({ where: { id: studentId, bookings: { some: { agencyId } } }, select: { id: true } });
    return !!s;
  }

  // UTC-safe @db.Date construction — bare new Date('YYYY-MM-DD') is local-tz and
  // saves a day early in summer (Dublin DST). Always pin to UTC midnight.
  const toUtcDate = (v: string | null | undefined) => (v && /^\d{4}-\d{2}-\d{2}$/.test(v)) ? new Date(`${v}T00:00:00Z`) : null;

  async function updateStudentPassport(agencyId: number, studentId: number, data: any) {
    if (!(await assertStudentInAgency(agencyId, studentId))) return { success: false, error: 'Student not found' };
    await prisma.student.update({ where: { id: studentId }, data: {
      passportNumber: (typeof data.passportNumber === 'string' && data.passportNumber.trim()) ? data.passportNumber.trim() : null,
      passportValidFrom: toUtcDate(data.passportValidFrom),
      passportValidUntil: toUtcDate(data.passportValidUntil),
    } as any });
    return { success: true };
  }

  async function addPassportUpload(agencyId: number, studentId: number, file: any, uploadedBy: string) {
    if (!(await assertStudentInAgency(agencyId, studentId))) return { success: false, error: 'Student not found' };
    const rec = await prisma.studentDocument.create({ data: {
      studentId, filename: file.filename, originalName: file.originalname, mimeType: file.mimetype, size: file.size,
      category: 'passport', uploadedBy,
    } });
    return { success: true, id: rec.id, originalName: rec.originalName, mimeType: rec.mimeType, size: rec.size, createdAt: rec.createdAt };
  }

  async function getPassportUpload(agencyId: number, studentId: number, docId: number) {
    if (!(await assertStudentInAgency(agencyId, studentId))) return null;
    // Passport AND partner "other" uploads both live in the student-docs dir and
    // are served by this route.
    return prisma.studentDocument.findFirst({ where: { id: docId, studentId, category: { in: ['passport', 'other'] } }, select: { filename: true, originalName: true, mimeType: true } });
  }

  // ── Inbound + outbound flight details (partner-editable in the portal) ──
  async function updateStudentFlights(agencyId: number, studentId: number, data: any) {
    if (!(await assertStudentInAgency(agencyId, studentId))) return { success: false, error: 'Student not found' };
    const t = (v: any) => (typeof v === 'string' && v.trim()) ? v.trim() : null;
    await prisma.student.update({ where: { id: studentId }, data: {
      flightNumber: t(data.flightNumber),
      flightDate: toUtcDate(data.flightDate),
      flightTime: t(data.flightTime),
      outboundFlightNumber: t(data.outboundFlightNumber),
      outboundFlightDate: toUtcDate(data.outboundFlightDate),
      outboundFlightTime: t(data.outboundFlightTime),
    } as any });
    return { success: true };
  }

  // ── Student email (partner-editable) — the key unblock for group juniors, who
  //    are created with a synthetic placeholder (…@grp-<deal>.ulearnstudent.com)
  //    and can't create an account / sit the level test until the organiser puts
  //    the real address in. Updates SIS + the HubSpot contact.
  async function updateStudentEmail(agencyId: number, studentId: number, data: any) {
    if (!(await assertStudentInAgency(agencyId, studentId))) return { success: false, error: 'Student not found' };
    const email = (typeof data.email === 'string' ? data.email.trim().toLowerCase() : '');
    if (!email) return { success: false, error: 'Email is required' };
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return { success: false, error: 'Enter a valid email address' };
    const clash = await prisma.student.findFirst({ where: { email, id: { not: studentId } }, select: { id: true } });
    if (clash) return { success: false, error: 'That email is already used by another student' };
    await prisma.student.update({ where: { id: studentId }, data: { email } });
    // Mirror to the HubSpot contact (best-effort, non-fatal).
    try {
      const s = await prisma.student.findUnique({ where: { id: studentId }, select: { hubspotContactId: true } });
      const tok = process.env.ACCESS_TOKEN;
      if (s?.hubspotContactId && tok) {
        await fetch(`https://api.hubapi.com/crm/v3/objects/contacts/${s.hubspotContactId}`, {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${tok}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ properties: { email } }),
        });
      }
    } catch (e: any) { console.warn('[updateStudentEmail] HubSpot push failed:', e?.message || e); }
    return { success: true, email };
  }

  // ── "Other uploads" — partner-uploaded general docs (category 'other').
  //    Stored alongside passport uploads (student-docs dir), served via /uploads.
  async function addStudentDoc(agencyId: number, studentId: number, file: any, uploadedBy: string) {
    if (!(await assertStudentInAgency(agencyId, studentId))) return { success: false, error: 'Student not found' };
    const rec = await prisma.studentDocument.create({ data: {
      studentId, filename: file.filename, originalName: file.originalname, mimeType: file.mimetype, size: file.size,
      category: 'other', uploadedBy,
    } });
    return { success: true, id: rec.id, originalName: rec.originalName, createdAt: rec.createdAt };
  }

  // File an uploaded insurance PDF as an ISSUED "ULearn Document" (Medical /
  // Learner Protection) so it surfaces in the partner portal + student app +
  // admin. The file is already on disk (partnerUpload → uploads/student-docs).
  async function attachInsurance(agencyId: number, studentId: number, file: any, subtype: InsuranceType, uploadedBy: string) {
    if (!(await assertStudentInAgency(agencyId, studentId))) return { success: false, error: 'Student not found' };
    const meta = INSURANCE_META[subtype];
    if (!meta) return { success: false, error: 'Unknown insurance type' };
    const bk = await prisma.booking.findFirst({ where: { studentId, agencyId }, orderBy: { id: 'desc' }, select: { id: true } });
    const { documentScripts } = await import('./documents');
    const rec = await documentScripts(prisma).attachExternalPdf({
      studentId, bookingId: bk?.id ?? null,
      templateSlug: meta.slug, templateName: meta.name, documentType: meta.documentType,
      attachedRelPath: `student-docs/${file.filename}`, originalName: file.originalname, uploadedBy,
    });
    return { success: true, recordId: rec.id, classifiedAs: subtype, name: meta.name };
  }

  // Partners may remove an "other" doc they uploaded (not passports, not staff
  // docs). Scoped to category 'other' + a partner uploadedBy stamp.
  async function deleteStudentDoc(agencyId: number, studentId: number, docId: number) {
    if (!(await assertStudentInAgency(agencyId, studentId))) return { success: false, error: 'Student not found' };
    const doc = await prisma.studentDocument.findFirst({ where: { id: docId, studentId, category: 'other' }, select: { id: true, uploadedBy: true } });
    if (!doc || !String(doc.uploadedBy || '').startsWith('partner:')) return { success: false, error: 'Not found' };
    await prisma.studentDocument.delete({ where: { id: docId } });
    return { success: true };
  }

  // Agency-scoped serve of ANY of the student's uploaded docs (student
  // self-uploads + staff uploads). File lives in uploads/students/<id>/.
  async function getStudentUpload(agencyId: number, studentId: number, docId: number) {
    if (!(await assertStudentInAgency(agencyId, studentId))) return null;
    return prisma.studentDocument.findFirst({ where: { id: docId, studentId }, select: { filename: true, originalName: true, mimeType: true } });
  }

  async function deletePassportUpload(agencyId: number, studentId: number, docId: number) {
    if (!(await assertStudentInAgency(agencyId, studentId))) return { success: false, error: 'Student not found' };
    const doc = await prisma.studentDocument.findFirst({ where: { id: docId, studentId, category: 'passport' }, select: { id: true } });
    if (!doc) return { success: false, error: 'Not found' };
    await prisma.studentDocument.delete({ where: { id: docId } });
    return { success: true };
  }

  async function assertIssuedDoc(agencyId: number, studentId: number, recordId: number) {
    if (!(await assertStudentInAgency(agencyId, studentId))) return false;
    const d = await prisma.documentRecord.findFirst({ where: { id: recordId, studentId, status: 'ISSUED' as any }, select: { id: true } });
    return !!d;
  }

  // ── Partner credit ledger (holding area) ──────────────────
  // SIS is the system of record. Staff record credits (overpayments, goodwill,
  // services-in-lieu); the partner sees the balance in their Finance tab. Only
  // OPEN credits count toward the available balance.
  // Signed ledger: CREDIT rows (+) are granted; DEBIT rows (−) are used.
  // Balance = sum of amounts over active (non-VOID) rows.
  async function listCredits(agencyId: number) {
    const rows = await prisma.agencyCredit.findMany({
      where: { agencyId },
      orderBy: [{ issueDate: 'desc' }, { id: 'desc' }],
      select: {
        id: true, amount: true, entryType: true, reason: true, issueDate: true, status: true, createdBy: true, createdAt: true,
        sourceRef: true, appliedToBookingId: true, appliedInvoice: true, appliedAt: true, paymentId: true,
        xeroCreditNoteNumber: true, hubspotTaskId: true, pushedAt: true, autoFromInvoiceCredit: true,
      },
    });
    const balance = rows
      .filter(r => r.status !== 'VOID')
      .reduce((s, r) => s + Number(r.amount || 0), 0);
    return {
      credits: rows.map(r => ({
        id: r.id,
        amount: Number(r.amount || 0),        // signed
        entryType: r.entryType,               // CREDIT | DEBIT
        reason: r.reason,
        issueDate: r.issueDate,
        status: r.status,
        createdBy: r.createdBy,
        sourceRef: r.sourceRef,
        appliedToBookingId: r.appliedToBookingId,
        appliedInvoice: r.appliedInvoice,
        appliedAt: r.appliedAt,
        fromPayment: r.paymentId != null,
        auto: r.autoFromInvoiceCredit,
        xeroCreditNoteNumber: r.xeroCreditNoteNumber,
        hubspotTaskId: r.hubspotTaskId,
        pushed: r.pushedAt != null,
      })),
      balance,
    };
  }

  // Grant credit (+) — standalone (goodwill / services) or from an overpayment
  // (pass sourceRef = the origin invoice). Amount is coerced positive.
  async function addCredit(agencyId: number, input: { amount: number; reason?: string | null; issueDate?: string | null; sourceRef?: string | null; createdBy?: string | null }) {
    const amount = Math.abs(Number(input.amount));
    if (!Number.isFinite(amount) || amount === 0) throw new Error('A non-zero amount is required');
    const issue = input.issueDate && /^\d{4}-\d{2}-\d{2}/.test(input.issueDate)
      ? new Date(input.issueDate.slice(0, 10) + 'T00:00:00.000Z')
      : new Date();
    const c = await prisma.agencyCredit.create({
      data: {
        agencyId, amount, entryType: 'CREDIT',
        reason: input.reason?.trim() || null,
        sourceRef: input.sourceRef?.trim() || null,
        issueDate: issue,
        createdBy: input.createdBy || null,
      },
      select: { id: true },
    });
    return { success: true, id: c.id };
  }

  // Use credit (−) — posts a DEBIT drawing the balance down, linked to the
  // booking/invoice it went to. This is a ledger record of consumption; the
  // money side (HubSpot credit memo, or a SIS ULearn-Credit Payment) is separate.
  // Pool-level: not tied to a specific grant (FIFO/net — partials work naturally).
  async function useCredit(agencyId: number, input: { amount: number; bookingId?: number | null; invoice?: string | null; reason?: string | null; createdBy?: string | null; paymentId?: number | null }) {
    const amount = Math.abs(Number(input.amount));
    if (!Number.isFinite(amount) || amount === 0) throw new Error('A positive amount is required');
    if (!input.bookingId && !input.invoice) throw new Error('Provide the booking or invoice the credit was applied to');
    let dealId: string | null = null;
    let bookingId: number | null = null;
    if (input.bookingId) {
      const bk = await prisma.booking.findFirst({ where: { id: Number(input.bookingId), agencyId }, select: { id: true, hubspotDealId: true } });
      if (!bk) throw new Error(`Booking #${input.bookingId} not found for this partner`);
      bookingId = bk.id;
      dealId = bk.hubspotDealId || null;
    }
    const reason = input.reason?.trim()
      || (bookingId ? `Applied to booking #${bookingId}` : `Applied to ${input.invoice}`);
    const c = await prisma.agencyCredit.create({
      data: {
        agencyId, amount: -amount, entryType: 'DEBIT', reason,
        appliedToBookingId: bookingId,
        appliedInvoice: input.invoice?.trim() || null,
        appliedToDealId: dealId,
        appliedAt: new Date(),
        paymentId: input.paymentId ?? null,
        createdBy: input.createdBy || null,
      },
      select: { id: true },
    });
    return { success: true, id: c.id };
  }

  return { dashboard, students, studentDetail, bookings, finance, enroll, currentChallenge, getChallengeOptIn, setChallengeOptIn, agencyLifePassEligible, liveFinance, recordQuoteAction, registerPartner, documents,
    updateStudentPassport, addPassportUpload, getPassportUpload, getStudentUpload, deletePassportUpload, assertIssuedDoc,
    updateStudentFlights, updateStudentEmail, addStudentDoc, deleteStudentDoc, attachInsurance, listCredits, addCredit, useCredit };
}
