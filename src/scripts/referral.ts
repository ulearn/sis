/**
 * Referral programmes — SIS side.
 *
 * A partner issues a fixed referral code (e.g. AMICI). Students who book with it
 * get a discount; the partner earns a reward. See .claude/projects/referral-setup.md.
 *
 * AUTHORITY: the config lives on the HubSpot Company AND the Agent-Employee Contact
 * (props referral_code / referral_student_discount / referral_reward_model /
 * referral_reward_pct / referral_settlement_mode / referral_active), mirrored on
 * both exactly like `commission` and `accel_*` — so sole traders (no company) and
 * the Ambassador programme (individual contact) reuse the same shape. This file
 * owns only: push config → HubSpot, mirror a read-cache into `referral_programs`,
 * and resolve a code → partner terms at booking time. The cache is NEVER
 * authoritative (CLAUDE.md: HubSpot wins for agencies).
 */
import type { PrismaClient } from '../generated/prisma/client';
import { getAuthedXero } from './xero';
import { validateIBAN } from './iban-validator';

const HUBSPOT_TOKEN = process.env.ACCESS_TOKEN;

// Xero expense account for partner reward payouts — B114 "Referral Payments"
// (formerly "Happy Plan Payments"; Neil 2026-11-03). Overridable via env.
const REFERRAL_PAYOUT_ACCOUNT = process.env.REFERRAL_PAYOUT_ACCOUNT || 'B114';

// HubSpot property names (identical on company + contact).
const P = {
  code: 'referral_code',
  discount: 'referral_student_discount',
  model: 'referral_reward_model',
  rewardPct: 'referral_reward_pct',
  settlement: 'referral_settlement_mode',
  active: 'referral_active',
} as const;
const HS_PROP_LIST = Object.values(P);

// Partner payout bank details. Onboarded by Sales DIRECTLY on the HubSpot
// company/contact (or, as we scale, a vetted application form) — never a direct
// line from an applicant into Xero, so a wrong IBAN can't reach the ledger. The
// SIS pulls these into the partner's Xero contact at bill time (IBAN-validated).
// Same props on company + contact, mirroring the config shape above.
const BANK_P = {
  iban: 'referral_payout_iban',
  bic: 'referral_payout_bic',
  accountName: 'referral_payout_account_name',
} as const;

const REWARD_MODELS = ['AMBASSADOR_FLAT', 'ACCELERATOR_TIER'] as const;
const SETTLEMENT_MODES = ['PAYOUT', 'INVOICE_MARKDOWN'] as const;

type HubTarget = { kind: 'company' | 'contact'; id: string };

// Every HubSpot entity this agency maps to. Config is written to BOTH the Company
// and the Agent-Employee Contact when present (Neil 2026-10-21: "add those props to
// both Company and Contact — have all employees inherit as usual"). Sole traders
// have only the contact.
function hubTargets(a: { hubspotCompanyId: string | null; primaryContactId: string | null }): HubTarget[] {
  const t: HubTarget[] = [];
  if (a.hubspotCompanyId) t.push({ kind: 'company', id: a.hubspotCompanyId });
  if (a.primaryContactId) t.push({ kind: 'contact', id: a.primaryContactId });
  return t;
}
// Which single entity to READ config back from (Company first, else the contact) —
// mirrors resolveCommissionRate priority.
function readEntity(a: { hubspotCompanyId: string | null; primaryContactId: string | null; primaryEntityType: string | null }): HubTarget | null {
  if (a.hubspotCompanyId && a.primaryEntityType !== 'contact') return { kind: 'company', id: a.hubspotCompanyId };
  if (a.primaryContactId) return { kind: 'contact', id: a.primaryContactId };
  if (a.hubspotCompanyId) return { kind: 'company', id: a.hubspotCompanyId };
  return null;
}

async function hsPatch(kind: 'company' | 'contact', id: string, properties: Record<string, string>) {
  if (!HUBSPOT_TOKEN) throw new Error('ACCESS_TOKEN not set');
  const path = kind === 'company' ? 'companies' : 'contacts';
  const res = await fetch(`https://api.hubapi.com/crm/v3/objects/${path}/${id}`, {
    method: 'PATCH',
    headers: { 'Authorization': `Bearer ${HUBSPOT_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ properties }),
  });
  if (!res.ok) throw new Error(`HubSpot ${kind} PATCH ${id} failed (${res.status}): ${await res.text()}`);
  return res.json();
}

async function hsGet(kind: 'company' | 'contact', id: string, props: string[]): Promise<Record<string, string | null>> {
  if (!HUBSPOT_TOKEN) throw new Error('ACCESS_TOKEN not set');
  const path = kind === 'company' ? 'companies' : 'contacts';
  const url = `https://api.hubapi.com/crm/v3/objects/${path}/${id}?properties=${encodeURIComponent(props.join(','))}`;
  const res = await fetch(url, { headers: { 'Authorization': `Bearer ${HUBSPOT_TOKEN}` } });
  if (!res.ok) throw new Error(`HubSpot ${kind} GET ${id} failed (${res.status}): ${await res.text()}`);
  const j: any = await res.json();
  return j.properties || {};
}

// Read the partner's payout bank details from HubSpot (Company first, else the
// Agent-Employee Contact — same priority as config). Normalises the IBAN/BIC
// (strip spaces, upper-case). Never throws: a HubSpot hiccup just yields blanks,
// which the Xero sync treats as "nothing to push".
async function readPartnerBank(
  a: { hubspotCompanyId: string | null; primaryContactId: string | null; primaryEntityType: string | null } | null,
): Promise<{ iban: string | null; bic: string | null; accountName: string | null }> {
  const empty = { iban: null, bic: null, accountName: null };
  if (!a) return empty;
  const ent = readEntity(a);
  if (!ent) return empty;
  try {
    const p = await hsGet(ent.kind, ent.id, Object.values(BANK_P));
    return {
      iban: (p[BANK_P.iban] || '').replace(/\s+/g, '').toUpperCase() || null,
      bic: (p[BANK_P.bic] || '').replace(/\s+/g, '').toUpperCase() || null,
      accountName: (p[BANK_P.accountName] || '').trim() || null,
    };
  } catch { return empty; }
}

// ── Referral PIPELINE: pull HubSpot deals carrying a programme code ──────────
// These power the partner's Referrals tab BEFORE a deal wins (quote stage), so a
// referred student is visible the moment the code is stamped — not only after the
// deal wins and a SIS booking exists.
async function hsSearchDealsByCode(code: string): Promise<any[]> {
  if (!HUBSPOT_TOKEN) throw new Error('ACCESS_TOKEN not set');
  const out: any[] = [];
  let after: string | undefined;
  do {
    const body: any = {
      filterGroups: [{ filters: [{ propertyName: 'referral_code', operator: 'EQ', value: code }] }],
      properties: ['dealname', 'dealstage', 'pipeline', 'amount', 'referral_code', 'referral_partner_id', 'referral_partner_name', 'createdate'],
      limit: 100,
    };
    if (after) body.after = after;
    const res = await fetch('https://api.hubapi.com/crm/v3/objects/deals/search', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${HUBSPOT_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`HubSpot deal search failed (${res.status}): ${await res.text()}`);
    const j: any = await res.json();
    out.push(...(j.results || []));
    after = j.paging?.next?.after;
  } while (after);
  return out;
}

// stageId → { label, isWon, isClosed, pipeline } across all deal pipelines.
async function hsDealStageMap(): Promise<Record<string, { label: string; isWon: boolean; isClosed: boolean; pipeline: string }>> {
  const map: Record<string, { label: string; isWon: boolean; isClosed: boolean; pipeline: string }> = {};
  if (!HUBSPOT_TOKEN) return map;
  const res = await fetch('https://api.hubapi.com/crm/v3/pipelines/deals', { headers: { 'Authorization': `Bearer ${HUBSPOT_TOKEN}` } });
  if (!res.ok) return map;
  const j: any = await res.json();
  for (const pl of j.results || []) {
    for (const st of pl.stages || []) {
      const prob = st.metadata?.probability;
      const isClosed = st.metadata?.isClosed === 'true' || st.metadata?.isClosed === true;
      map[st.id] = { label: st.label, isWon: isClosed && (prob === '1.0' || Number(prob) === 1), isClosed, pipeline: pl.id };
    }
  }
  return map;
}

// deal → associated contacts (v4 batch), each with its association labels so we
// can tell the student_customer apart from the partner.
async function hsDealContacts(dealIds: string[]): Promise<Record<string, Array<{ id: string; labels: string[] }>>> {
  const map: Record<string, Array<{ id: string; labels: string[] }>> = {};
  if (!HUBSPOT_TOKEN || !dealIds.length) return map;
  const res = await fetch('https://api.hubapi.com/crm/v4/associations/deals/contacts/batch/read', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${HUBSPOT_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ inputs: dealIds.map(id => ({ id })) }),
  });
  if (!res.ok) return map;
  const j: any = await res.json();
  for (const row of j.results || []) {
    const from = String(row.from?.id);
    map[from] = (row.to || []).map((t: any) => ({
      id: String(t.toObjectId),
      labels: (t.associationTypes || []).map((a: any) => String(a.label || '')).filter(Boolean),
    }));
  }
  return map;
}

async function hsBatchContacts(ids: string[]): Promise<Record<string, Record<string, string>>> {
  const map: Record<string, Record<string, string>> = {};
  if (!HUBSPOT_TOKEN || !ids.length) return map;
  const res = await fetch('https://api.hubapi.com/crm/v3/objects/contacts/batch/read', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${HUBSPOT_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ properties: ['firstname', 'lastname', 'nationality', 'country'], inputs: ids.map(id => ({ id })) }),
  });
  if (!res.ok) return map;
  const j: any = await res.json();
  for (const r of j.results || []) map[String(r.id)] = r.properties || {};
  return map;
}

// deal → associated quotes (v4 batch) → map dealId → [quoteId].
async function hsDealQuotes(dealIds: string[]): Promise<Record<string, string[]>> {
  const map: Record<string, string[]> = {};
  if (!HUBSPOT_TOKEN || !dealIds.length) return map;
  const res = await fetch('https://api.hubapi.com/crm/v4/associations/deals/quotes/batch/read', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${HUBSPOT_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ inputs: dealIds.map(id => ({ id })) }),
  });
  if (!res.ok) return map;
  const j: any = await res.json();
  for (const row of j.results || []) map[String(row.from?.id)] = (row.to || []).map((t: any) => String(t.toObjectId));
  return map;
}

// quoteId → { link, amount } (public hs_quote_link + hs_quote_amount).
async function hsBatchQuotes(ids: string[]): Promise<Record<string, { link: string | null; amount: number | null; created: string | null }>> {
  const map: Record<string, { link: string | null; amount: number | null; created: string | null }> = {};
  if (!HUBSPOT_TOKEN || !ids.length) return map;
  const res = await fetch('https://api.hubapi.com/crm/v3/objects/quotes/batch/read', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${HUBSPOT_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ properties: ['hs_quote_link', 'hs_quote_amount', 'hs_createdate'], inputs: ids.map(id => ({ id })) }),
  });
  if (!res.ok) return map;
  const j: any = await res.json();
  for (const r of j.results || []) {
    const p = r.properties || {};
    map[String(r.id)] = { link: p.hs_quote_link || null, amount: toNum(p.hs_quote_amount), created: p.hs_createdate || null };
  }
  return map;
}

// Is this SKU a COURSE line? (reward is 10% of the NET course total only — never
// registration, accommodation, exam, insurance or transfers.) Mirrors
// skuToCourseCategory in backfill-hubspot-fees.ts / webhooks.ts — keep in sync.
function skuIsCourse(sku: string | null | undefined): boolean {
  const s = String(sku || '').toUpperCase();
  if (!s) return false;
  return s.startsWith('GEM') || s === 'AYMORN'
    || s.startsWith('GIM') || s === 'AYMORN+'
    || s.startsWith('GEA') || s === 'AYAFT'
    || s.startsWith('GIA') || s === 'AYAFT+'
    || s.startsWith('GE3') || s.startsWith('INT')
    || s.startsWith('PVT') || s.startsWith('PRIV')
    || s.startsWith('LP');
}

// quote → associated line items (v4 batch) → map quoteId → [lineItemId].
async function hsQuoteLineItems(quoteIds: string[]): Promise<Record<string, string[]>> {
  const map: Record<string, string[]> = {};
  if (!HUBSPOT_TOKEN || !quoteIds.length) return map;
  const res = await fetch('https://api.hubapi.com/crm/v4/associations/quotes/line_items/batch/read', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${HUBSPOT_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ inputs: quoteIds.map(id => ({ id })) }),
  });
  if (!res.ok) return map;
  const j: any = await res.json();
  for (const row of j.results || []) map[String(row.from?.id)] = (row.to || []).map((t: any) => String(t.toObjectId));
  return map;
}

// lineItemId → { sku, netAmount } (amount = post-discount net).
async function hsBatchLineItems(ids: string[]): Promise<Record<string, { sku: string; net: number }>> {
  const map: Record<string, { sku: string; net: number }> = {};
  if (!HUBSPOT_TOKEN || !ids.length) return map;
  const res = await fetch('https://api.hubapi.com/crm/v3/objects/line_items/batch/read', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${HUBSPOT_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ properties: ['hs_sku', 'amount', 'name'], inputs: ids.map(id => ({ id })) }),
  });
  if (!res.ok) return map;
  const j: any = await res.json();
  for (const r of j.results || []) {
    const p = r.properties || {};
    map[String(r.id)] = { sku: p.hs_sku || '', net: toNum(p.amount) ?? 0 };
  }
  return map;
}

// Referral and KickStart are SEPARATE (Neil 2026-11-03): the referral gives the
// student the partner's flat discount (e.g. 10%); KickStart is its own
// compliance-based promo the student earns independently. We do NOT stack them.

// Normalise hard: drop everything non-alphanumeric (so "#Amici", "amici ",
// "A-M-I-C-I" all collapse) and uppercase. This alone handles the hashtag + case
// variants Neil asked for; typos are handled by the fuzzy fallback in
// resolveReferralCode.
export function normCode(code: string | null | undefined): string {
  return String(code ?? '').replace(/[^a-z0-9]/gi, '').toUpperCase();
}

// Plain Levenshtein edit distance — used for typo-tolerant code resolution
// (e.g. AMICHI / AMICCI / AMISHI → AMICI).
export function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  if (!m) return n;
  if (!n) return m;
  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  let cur = new Array(n + 1).fill(0);
  for (let i = 1; i <= m; i++) {
    cur[0] = i;
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost);
    }
    [prev, cur] = [cur, prev];
  }
  return prev[n];
}
function toNum(v: any): number | null {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export function referralScripts(prisma: PrismaClient) {
  async function loadAgency(agencyId: number) {
    return prisma.agency.findUnique({
      where: { id: agencyId },
      select: { id: true, name: true, hubspotCompanyId: true, primaryContactId: true, primaryEntityType: true },
    });
  }

  // A code is free if no OTHER agency's program holds it and it is not a student
  // ambassador code (HubSpot can't police cross-object uniqueness, so we do).
  async function assertCodeFree(code: string, exceptAgencyId?: number, ownStudentId?: number) {
    const existing = await prisma.referralProgram.findUnique({ where: { code }, select: { agencyId: true } });
    if (existing && existing.agencyId !== exceptAgencyId) {
      throw new Error(`Referral code "${code}" is already assigned to another partner.`);
    }
    const stu = await prisma.student.findFirst({ where: { ambassadorCode: code }, select: { id: true } });
    // A student ambassador's own agency (ambassador.ts) carries the SAME code as the student — that is the point, not a clash.
    if (stu && stu.id !== ownStudentId) throw new Error(`Referral code "${code}" is already a student ambassador code.`);
  }

  type ProgramInput = {
    code: string;
    label?: string | null;
    studentDiscountPct?: number | string | null;
    rewardModel?: string | null;
    rewardFlatPct?: number | string | null;
    settlementMode?: string | null;
    active?: boolean;
    ownStudentId?: number;   // student ambassador: the student holding this same code (ambassador.ts)
  };

  // Create/update a partner's program: validate → PATCH HubSpot (company + contact)
  // → mirror the read-cache. HubSpot is the source of truth; the cache is refreshed
  // from exactly what we just wrote.
  async function upsertProgram(agencyId: number, input: ProgramInput) {
    const a = await loadAgency(agencyId);
    if (!a) throw new Error('Agency not found');

    const code = normCode(input.code);
    if (!code) throw new Error('A referral code is required.');
    if (!/^[A-Z0-9][A-Z0-9_-]{1,31}$/.test(code)) throw new Error('Code must be 2–32 chars: letters, numbers, hyphen or underscore.');
    await assertCodeFree(code, agencyId, input.ownStudentId);

    const rewardModel = REWARD_MODELS.includes(input.rewardModel as any) ? (input.rewardModel as string) : 'AMBASSADOR_FLAT';
    const settlementMode = SETTLEMENT_MODES.includes(input.settlementMode as any) ? (input.settlementMode as string) : 'PAYOUT';
    const studentDiscountPct = toNum(input.studentDiscountPct) ?? 0;
    const rewardFlatPct = toNum(input.rewardFlatPct);
    const active = input.active !== false;
    const label = (input.label && String(input.label).trim()) || a.name;

    const targets = hubTargets(a);
    if (!targets.length) throw new Error('No HubSpot Company or Contact on file for this partner — cannot store the referral config.');

    const props: Record<string, string> = {
      [P.code]: code,
      [P.discount]: String(studentDiscountPct),
      [P.model]: rewardModel,
      [P.rewardPct]: rewardFlatPct == null ? '' : String(rewardFlatPct),
      [P.settlement]: settlementMode,
      [P.active]: active ? 'true' : 'false',
    };

    const pushed: HubTarget[] = [];
    const errors: { target: HubTarget; error: string }[] = [];
    for (const t of targets) {
      try { await hsPatch(t.kind, t.id, props); pushed.push(t); }
      catch (e: any) { errors.push({ target: t, error: String(e?.message || e) }); }
    }

    const program = await prisma.referralProgram.upsert({
      where: { agencyId },
      create: {
        agencyId, hubspotCompanyId: a.hubspotCompanyId, code, label,
        studentDiscountPct, rewardModel, rewardFlatPct, settlementMode, active, syncedAt: new Date(),
      },
      update: {
        code, label, hubspotCompanyId: a.hubspotCompanyId,
        studentDiscountPct, rewardModel, rewardFlatPct, settlementMode, active, syncedAt: new Date(),
      },
    });
    console.log(`[referral] agency ${agencyId} program "${code}" upserted — hubspot pushed ${pushed.length}/${targets.length}${errors.length ? ` (errors: ${errors.map(e => e.target.kind).join(',')})` : ''}`);
    return { program: serialize(program), pushed, errors };
  }

  // Refresh the cache from HubSpot (the authoritative side) — clone of the weekly
  // commission mirror. Reads the resolved entity's referral_* props.
  async function syncFromHubSpot(agencyId: number) {
    const a = await loadAgency(agencyId);
    if (!a) throw new Error('Agency not found');
    const ent = readEntity(a);
    if (!ent) return { synced: false, reason: 'no-hubspot-entity' };
    const p = await hsGet(ent.kind, ent.id, HS_PROP_LIST);
    const code = normCode(p[P.code]);
    if (!code) {
      // HubSpot has no code → deactivate any stale cache row rather than delete it.
      const existing = await prisma.referralProgram.findUnique({ where: { agencyId } });
      if (existing) await prisma.referralProgram.update({ where: { agencyId }, data: { active: false, syncedAt: new Date() } });
      return { synced: true, program: null };
    }
    const program = await prisma.referralProgram.upsert({
      where: { agencyId },
      create: {
        agencyId, hubspotCompanyId: a.hubspotCompanyId, code, label: a.name,
        studentDiscountPct: toNum(p[P.discount]) ?? 0,
        rewardModel: REWARD_MODELS.includes(p[P.model] as any) ? (p[P.model] as string) : 'AMBASSADOR_FLAT',
        rewardFlatPct: toNum(p[P.rewardPct]),
        settlementMode: SETTLEMENT_MODES.includes(p[P.settlement] as any) ? (p[P.settlement] as string) : 'PAYOUT',
        active: p[P.active] !== 'false',
        syncedAt: new Date(),
      },
      update: {
        code, hubspotCompanyId: a.hubspotCompanyId,
        studentDiscountPct: toNum(p[P.discount]) ?? 0,
        rewardModel: REWARD_MODELS.includes(p[P.model] as any) ? (p[P.model] as string) : 'AMBASSADOR_FLAT',
        rewardFlatPct: toNum(p[P.rewardPct]),
        settlementMode: SETTLEMENT_MODES.includes(p[P.settlement] as any) ? (p[P.settlement] as string) : 'PAYOUT',
        active: p[P.active] !== 'false',
        syncedAt: new Date(),
      },
    });
    return { synced: true, program: serialize(program) };
  }

  async function getProgram(agencyId: number) {
    const row = await prisma.referralProgram.findUnique({ where: { agencyId } });
    return row ? serialize(row) : null;
  }

  async function listPrograms() {
    const rows = await prisma.referralProgram.findMany({
      orderBy: { code: 'asc' },
      include: { agency: { select: { id: true, name: true } } },
    });
    return rows.map((r: any) => ({ ...serialize(r), agencyName: r.agency?.name ?? null }));
  }

  // Resolve a code → partner terms (active only). Full terms for internal use.
  // Tolerant: (1) hard-normalise (#/case/punctuation), (2) exact match, (3) a
  // typo-tolerant fallback — the UNIQUE nearest active code within edit distance
  // 2 (guarded: both strings ≥4 chars, distance ≤ half the code length, and no
  // tie with the runner-up). Returns `fuzzy:true` when matched by the fallback.
  async function resolveReferralCode(code: string) {
    const c = normCode(code);
    if (!c) return null;
    let row: any = await prisma.referralProgram.findUnique({ where: { code: c }, include: { agency: { select: { id: true, name: true } } } });
    let fuzzy = false;
    if (!row || !row.active) {
      row = null;
      if (c.length >= 4) {
        const actives = await prisma.referralProgram.findMany({ where: { active: true }, include: { agency: { select: { id: true, name: true } } } });
        const scored = actives
          .filter((p: any) => p.code.length >= 4)
          .map((p: any) => ({ p, d: levenshtein(c, p.code) }))
          .sort((a: any, b: any) => a.d - b.d);
        const best = scored[0];
        const second = scored[1];
        if (best && best.d <= 2 && best.d <= Math.floor(best.p.code.length / 2) && (!second || second.d > best.d)) {
          row = best.p;
          fuzzy = true;
        }
      }
    }
    if (!row || !row.active) return null;
    return {
      agencyId: row.agencyId,
      agencyName: (row as any).agency?.name ?? null,
      code: row.code,
      label: row.label,
      studentDiscountPct: Number(row.studentDiscountPct),
      rewardModel: row.rewardModel,
      rewardFlatPct: row.rewardFlatPct == null ? null : Number(row.rewardFlatPct),
      settlementMode: row.settlementMode,
      fuzzy,
    };
  }

  // Student-facing validation (public booking form). Leaks ONLY the discount —
  // never the partner reward/commission. Returns the canonical `code` so the
  // front-end can confirm what we accepted ("we read that as AMICI ✓"), and
  // `corrected` when a typo was auto-fixed.
  async function validateForStudent(code: string) {
    const r = await resolveReferralCode(code);
    if (!r) return { valid: false };
    return { valid: true, code: r.code, label: r.label, studentDiscountPct: r.studentDiscountPct, corrected: !!r.fuzzy };
  }

  // Partner-portal view: the agency's own referral program + the bookings
  // attributed to its code (Booking.discountCode), with the student discount and
  // the partner reward computed per booking. Reward is INDICATIVE here (flat % of
  // booking value) — the authoritative, payment-accrued ReferralReward ledger is
  // Phase 2. Scoped by agencyId (caller passes the session's agency).
  // Pull every HubSpot deal carrying this programme's code into `referral_deals`.
  // Keyed PURELY on referral_code — the deal is student-sourced (B2C website
  // booking), tied back to the partner by the code, NOT by any partner/agency
  // association. Resolves the student contact for a name, maps the stage to a
  // friendly label, reads deal.amount (autoquote/manual), and back-links a SIS
  // booking if the deal has already won. Best-effort: callers wrap in try/catch.
  async function syncProgramDeals(agencyId: number) {
    const prog = await prisma.referralProgram.findUnique({ where: { agencyId } });
    if (!prog) return { synced: false, reason: 'no-program', count: 0 };
    const code = prog.code;

    const deals = await hsSearchDealsByCode(code);
    const dealIds = deals.map(d => String(d.id));
    const [stageMap, assoc, dealQuotes] = await Promise.all([
      hsDealStageMap().catch(() => ({} as Record<string, any>)),
      hsDealContacts(dealIds).catch(() => ({} as Record<string, Array<{ id: string; labels: string[] }>>)),
      hsDealQuotes(dealIds).catch(() => ({} as Record<string, string[]>)),
    ]);

    // Resolve the public quote link (+ amount fallback) and the quote's line
    // items (to compute the NET course total the reward is based on).
    const quoteIds = [...new Set(Object.values(dealQuotes).flat())];
    const [quoteProps, quoteLineItems] = await Promise.all([
      hsBatchQuotes(quoteIds).catch(() => ({} as Record<string, { link: string | null; amount: number | null; created: string | null }>)),
      hsQuoteLineItems(quoteIds).catch(() => ({} as Record<string, string[]>)),
    ]);
    const allLineItemIds = [...new Set(Object.values(quoteLineItems).flat())];
    const lineItemProps = await hsBatchLineItems(allLineItemIds).catch(() => ({} as Record<string, { sku: string; net: number }>));

    // Pick the student contact per deal: prefer a /student/ label, else the first
    // contact that is NOT the /partner/, else the first contact.
    const studentIdByDeal: Record<string, string> = {};
    const studentIds = new Set<string>();
    for (const d of deals) {
      const contacts = assoc[String(d.id)] || [];
      const stu = contacts.find(c => c.labels.some(l => /student/i.test(l)))
        || contacts.find(c => !c.labels.some(l => /partner/i.test(l)))
        || contacts[0];
      if (stu) { studentIdByDeal[String(d.id)] = stu.id; studentIds.add(stu.id); }
    }
    const contactProps = await hsBatchContacts([...studentIds]).catch(() => ({} as Record<string, Record<string, string>>));

    // Back-link SIS bookings already created for these deals (won path).
    const bookings = dealIds.length
      ? await prisma.booking.findMany({ where: { hubspotDealId: { in: dealIds } }, select: { id: true, hubspotDealId: true } })
      : [];
    const bookingByDeal: Record<string, number> = {};
    for (const b of bookings) if (b.hubspotDealId) bookingByDeal[b.hubspotDealId] = b.id;

    let count = 0;
    for (const d of deals) {
      const p = d.properties || {};
      const stageInfo = stageMap[p.dealstage] || null;
      const stuId = studentIdByDeal[String(d.id)];
      const cp = stuId ? (contactProps[stuId] || {}) : {};
      const name = `${cp.firstname || ''} ${cp.lastname || ''}`.trim() || p.dealname || null;
      // The deal's first quote: public link, plus its amount as a fallback when
      // deal.amount is still null (at early quote stage the value lives on the quote).
      const qid = (dealQuotes[String(d.id)] || [])[0];
      const q = qid ? quoteProps[qid] : null;
      // VALUE = the QUOTE total first (it's what actually changes when the quote
      // is re-built), with deal.amount only as a fallback. deal.amount can lag the
      // quote (Neil 2026-11-03), so the quote is the authoritative student price.
      const amount = (q && q.amount != null) ? q.amount : toNum(p.amount);
      // Reward base = NET total of the COURSE line items on the quote only
      // (student discount already applied; excludes reg/accom/exam/insurance).
      let rewardBase: number | null = null;
      if (qid) {
        const liIds = quoteLineItems[qid] || [];
        let sum = 0; let sawCourse = false;
        for (const li of liIds) {
          const info = lineItemProps[li];
          if (info && skuIsCourse(info.sku)) { sum += info.net; sawCourse = true; }
        }
        if (sawCourse) rewardBase = Math.round(sum * 100) / 100;
      }
      const data = {
        agencyId,
        referralCode: code,
        dealName: p.dealname || null,
        dealStage: p.dealstage || null,
        stageLabel: stageInfo?.label || p.dealstage || null,
        pipeline: p.pipeline || stageInfo?.pipeline || null,
        isWon: !!stageInfo?.isWon,
        isClosedLost: !!(stageInfo?.isClosed && !stageInfo?.isWon),
        amount,
        rewardBase,
        studentName: name,
        studentNationality: cp.nationality || cp.country || null,
        hubspotStudentContactId: stuId || null,
        quoteUrl: q?.link || null,
        bookingId: bookingByDeal[String(d.id)] ?? null,
        dealCreatedAt: p.createdate ? new Date(p.createdate) : null,
        lastSyncedAt: new Date(),
      };
      await prisma.referralDeal.upsert({
        where: { hubspotDealId: String(d.id) },
        update: data,
        create: { hubspotDealId: String(d.id), ...data },
      });
      count++;
    }

    // Drop rows whose deal no longer carries this code (code removed / re-pointed).
    await prisma.referralDeal.deleteMany({
      where: { agencyId, hubspotDealId: { notIn: dealIds.length ? dealIds : ['__none__'] } },
    });

    // NB: billing is NOT done here — portal-sync must never raise a Bill. The
    // reward DRAFT Bill is raised by billWonDeals(), called from the SIS
    // invoice-created webhook (the deal→WON event, same path as ReSync).
    return { synced: true, count };
  }

  // Raise the partner reward payout for any WON deal of this programme that hasn't
  // been billed yet — one DRAFT Xero Bill per deal (idempotent via xeroBillId).
  // Called from the invoice-created webhook after the pipeline row is synced.
  async function billWonDeals(agencyId: number) {
    const prog = await prisma.referralProgram.findUnique({ where: { agencyId } });
    if (!prog) return { billed: 0 };
    const rewardPct = prog.rewardFlatPct == null ? 0 : Number(prog.rewardFlatPct);
    if (rewardPct <= 0) return { billed: 0 };
    const toBill = await prisma.referralDeal.findMany({
      where: { agencyId, isWon: true, xeroBillId: null, rewardBase: { gt: 0 } },
    });
    let billed = 0;
    for (const row of toBill) {
      try { await createRewardBill(row, prog, rewardPct); billed++; }
      catch (e: any) { console.error(`[referral] reward bill failed for deal ${row.hubspotDealId}: ${e?.message || e}`); }
    }
    return { billed };
  }

  // Resolve (and cache) the partner's Xero contact for payout bills. Mirrors the
  // host-payment contact resolution: find by name, create if missing.
  async function resolvePartnerXeroContact(prog: any, xero: any, tenantId: string): Promise<string> {
    const a = await loadAgency(prog.agencyId);
    const name = (prog.label && String(prog.label).trim()) || a?.name || `Agency ${prog.agencyId}`;
    let contactId: string | null = prog.xeroContactId || null;
    if (!contactId) {
      try {
        const safe = name.replace(/"/g, '');
        const byName = await xero.accountingApi.getContacts(tenantId, undefined, `Name=="${safe}"`);
        contactId = byName.body.contacts?.[0]?.contactID || null;
      } catch { /* fall through to create */ }
      if (!contactId) {
        const created = await xero.accountingApi.createContacts(tenantId, { contacts: [{ name }] });
        contactId = created.body.contacts?.[0]?.contactID || null;
        if (!contactId) throw new Error('createContacts returned no contactID');
      }
      await prisma.referralProgram.update({ where: { agencyId: prog.agencyId }, data: { xeroContactId: contactId } });
    }
    // Keep the Xero contact's bank details aligned with HubSpot every run (Sales
    // is the source of truth). Non-fatal + idempotent: an empty or invalid IBAN
    // is logged and skipped, never pushed — so the bill still raises on DRAFT.
    try { await syncXeroContactBank(contactId, a, xero, tenantId); }
    catch (e: any) { console.warn(`[referral] Xero bank sync skipped (agency ${prog.agencyId}): ${e?.message || e}`); }
    return contactId;
  }

  // Mirror the HubSpot payout IBAN/BIC onto the Xero contact's bankAccountDetails.
  // Format follows the accommodation host-payment convention (`BIC/IBAN`, else
  // IBAN alone — see xero-host-match.ts). Validates the IBAN (mod-97) first, so a
  // mistyped account never reaches Xero. Only writes when the value changed.
  async function syncXeroContactBank(
    contactId: string,
    a: { id: number; hubspotCompanyId: string | null; primaryContactId: string | null; primaryEntityType: string | null } | null,
    xero: any,
    tenantId: string,
  ) {
    const bank = await readPartnerBank(a);
    if (!bank.iban) return;                       // nothing on file yet
    const v = validateIBAN(bank.iban);
    if (!v.valid) {
      console.warn(`[referral] agency ${a?.id} payout IBAN rejected (${v.error || 'invalid'}) — not pushed to Xero`);
      return;
    }
    const details = (bank.bic ? `${bank.bic}/${bank.iban}` : bank.iban).slice(0, 50); // Xero field cap
    let current: string | null = null;
    try {
      const g = await xero.accountingApi.getContact(tenantId, contactId);
      current = g.body.contacts?.[0]?.bankAccountDetails || null;
    } catch { /* treat as unknown → write */ }
    if (current === details) return;              // already aligned
    await xero.accountingApi.updateContact(tenantId, contactId, { contacts: [{ contactID: contactId, bankAccountDetails: details }] });
    console.log(`[referral] Xero contact ${contactId} bank details ← HubSpot (${details})`);
  }

  // Create a DRAFT ACCPAY Bill for the partner's reward on a won referral deal.
  // Reuses the host-payment Bill pattern (getAuthedXero + createInvoices ACCPAY).
  async function createRewardBill(row: any, prog: any, rewardPct: number) {
    const base = Number(row.rewardBase || 0);
    const amount = Math.round(base * rewardPct) / 100; // base × pct/100, 2dp
    if (!(amount > 0)) return;

    const { xero, tenantId } = await getAuthedXero();
    const contactId = await resolvePartnerXeroContact(prog, xero, tenantId);
    const today = new Date().toISOString().split('T')[0];
    const reference = `REF-${prog.code}-${row.hubspotDealId}`;

    const bill = await xero.accountingApi.createInvoices(tenantId, {
      invoices: [{
        type: 'ACCPAY' as any,
        contact: { contactID: contactId },
        date: today,
        dueDate: today,
        invoiceNumber: reference,
        reference,
        status: 'DRAFT' as any,
        lineItems: [{
          description: `Referral reward ${rewardPct}% — ${row.studentName || row.dealName || 'student'} (${prog.code}) · net course €${base.toFixed(2)}`,
          quantity: 1,
          unitAmount: amount,
          accountCode: REFERRAL_PAYOUT_ACCOUNT,
        }],
        lineAmountTypes: 'NoTax' as any,
      }],
    });
    const invoiceId = bill.body.invoices?.[0]?.invoiceID || null;
    await prisma.referralDeal.update({
      where: { id: row.id },
      data: { rewardAmount: amount, xeroBillId: invoiceId, xeroBillStatus: 'DRAFT', xeroBillAt: new Date() },
    });
    console.log(`[referral] DRAFT reward bill ${reference} €${amount} → ${prog.label || prog.code} (deal ${row.hubspotDealId})`);
  }

  async function partnerReferrals(agencyId: number) {
    const r2 = (n: number) => Math.round(n * 100) / 100;
    const prog = await prisma.referralProgram.findUnique({ where: { agencyId } });
    if (!prog) return { program: null, rows: [], totals: { count: 0, won: 0, value: 0, reward: 0 } };

    // Flat referral discount from config (KickStart is separate — never stacked).
    const discPct = Number(prog.studentDiscountPct);
    const rewardPct = prog.rewardFlatPct == null ? 0 : Number(prog.rewardFlatPct);

    // NB: the HubSpot refresh is triggered by the ROUTE (only when the tab is
    // opened, ?sync=1) so the lightweight tab-visibility probe stays cheap. Here
    // we just read the mirrored `referral_deals`. Pipeline reads newest-first,
    // with won flagged by a pill; closed-lost hidden from the partner's view.
    const deals = await prisma.referralDeal.findMany({
      where: { agencyId, isClosedLost: false },
      orderBy: [{ dealCreatedAt: 'desc' }, { id: 'desc' }],
    });

    // Enrich won rows with the real SIS paid figure where the booking exists.
    const bookingIds = deals.map(d => d.bookingId).filter((x): x is number => x != null);
    const bmap: Record<number, any> = {};
    if (bookingIds.length) {
      const bks = await prisma.booking.findMany({ where: { id: { in: bookingIds } }, select: { id: true, amountPaid: true, status: true } });
      for (const b of bks) bmap[b.id] = b;
    }

    const rows = deals.map(d => {
      const value = Number(d.amount || 0);
      const courseNet = Number(d.rewardBase || 0);   // NET course total — the reward base
      const bk = d.bookingId != null ? bmap[d.bookingId] : null;
      return {
        dealId: d.hubspotDealId,
        student: d.studentName || '—',
        nationality: d.studentNationality || null,
        stage: d.stageLabel || null,
        isWon: d.isWon,
        status: bk ? bk.status : null,
        quoteUrl: d.quoteUrl || null,
        value: r2(value),                       // total booking value (what the student pays)
        courseNet: r2(courseNet),               // net course only (post-discount) — reward base
        paid: bk ? r2(Number(bk.amountPaid || 0)) : 0,
        reward: r2(courseNet * rewardPct / 100),  // partner earns reward% of the NET course
        createdAt: d.dealCreatedAt,
      };
    });
    return {
      program: {
        code: prog.code, label: prog.label,
        studentDiscountPct: discPct,        // flat referral discount (KickStart is separate)
        rewardModel: prog.rewardModel, rewardFlatPct: rewardPct,
        settlementMode: prog.settlementMode, active: prog.active,
      },
      rows,
      totals: {
        count: rows.length,
        won: rows.filter(r => r.isWon).length,
        // Referral area is COURSE-ONLY — accommodation/extras never carry the
        // discount or reward, so we surface the course value, not the deal total.
        courseValue: r2(rows.reduce((s, r) => s + (r.courseNet || 0), 0)),
        value: r2(rows.reduce((s, r) => s + r.value, 0)),
        reward: r2(rows.reduce((s, r) => s + r.reward, 0)),
      },
    };
  }

  // Webhook entry point: on deal→WON (invoice-created / ReSync), refresh this
  // programme's pipeline from HubSpot then raise the reward DRAFT Bill for the
  // now-won deal. Keyed off the referral code. Best-effort; never throws.
  async function onReferralDealWon(referralCode: string) {
    try {
      const prog = await prisma.referralProgram.findUnique({ where: { code: normCode(referralCode) } });
      if (!prog) return { ok: false, reason: 'no-program' };
      await syncProgramDeals(prog.agencyId);
      const r = await billWonDeals(prog.agencyId);
      return { ok: true, billed: r.billed };
    } catch (e: any) {
      console.error(`[referral] onReferralDealWon(${referralCode}) failed: ${e?.message || e}`);
      return { ok: false, reason: String(e?.message || e) };
    }
  }

  // Re-pull the partner's payout bank details from HubSpot onto their Xero
  // contact, without raising a bill. Used by the weekly reconciliation and the
  // admin "re-sync" action so a newly-onboarded or corrected IBAN reaches Xero
  // even between reward bills. Best-effort.
  async function syncPartnerBank(agencyId: number) {
    const prog = await prisma.referralProgram.findUnique({ where: { agencyId } });
    if (!prog) return { ok: false, reason: 'no-program' };
    try {
      const { xero, tenantId } = await getAuthedXero();
      const contactId = await resolvePartnerXeroContact(prog, xero, tenantId);
      return { ok: true, contactId };
    } catch (e: any) {
      return { ok: false, reason: String(e?.message || e) };
    }
  }

  return { upsertProgram, syncFromHubSpot, getProgram, listPrograms, resolveReferralCode, validateForStudent, partnerReferrals, syncProgramDeals, billWonDeals, onReferralDealWon, syncPartnerBank };
}

function serialize(row: any) {
  return {
    agencyId: row.agencyId,
    hubspotCompanyId: row.hubspotCompanyId ?? null,
    code: row.code,
    label: row.label ?? null,
    studentDiscountPct: Number(row.studentDiscountPct),
    rewardModel: row.rewardModel,
    rewardFlatPct: row.rewardFlatPct == null ? null : Number(row.rewardFlatPct),
    settlementMode: row.settlementMode,
    active: row.active,
    syncedAt: row.syncedAt,
  };
}
