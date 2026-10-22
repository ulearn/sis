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

const HUBSPOT_TOKEN = process.env.ACCESS_TOKEN;

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

export function normCode(code: string | null | undefined): string {
  return String(code ?? '').trim().toUpperCase();
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
  async function assertCodeFree(code: string, exceptAgencyId?: number) {
    const existing = await prisma.referralProgram.findUnique({ where: { code }, select: { agencyId: true } });
    if (existing && existing.agencyId !== exceptAgencyId) {
      throw new Error(`Referral code "${code}" is already assigned to another partner.`);
    }
    const stu = await prisma.student.findFirst({ where: { ambassadorCode: code }, select: { id: true } });
    if (stu) throw new Error(`Referral code "${code}" is already a student ambassador code.`);
  }

  type ProgramInput = {
    code: string;
    label?: string | null;
    studentDiscountPct?: number | string | null;
    rewardModel?: string | null;
    rewardFlatPct?: number | string | null;
    settlementMode?: string | null;
    active?: boolean;
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
    await assertCodeFree(code, agencyId);

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
  async function resolveReferralCode(code: string) {
    const c = normCode(code);
    if (!c) return null;
    const row = await prisma.referralProgram.findUnique({ where: { code: c }, include: { agency: { select: { id: true, name: true } } } });
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
    };
  }

  // Student-facing validation (public booking form). Leaks ONLY the discount —
  // never the partner reward/commission.
  async function validateForStudent(code: string) {
    const r = await resolveReferralCode(code);
    if (!r) return { valid: false };
    return { valid: true, label: r.label, studentDiscountPct: r.studentDiscountPct };
  }

  return { upsertProgram, syncFromHubSpot, getProgram, listPrograms, resolveReferralCode, validateForStudent };
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
