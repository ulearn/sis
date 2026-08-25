/**
 * Accelerator programme — SIS side of the hubapp handoff
 * (Docs/Accelerator-SIS-Handoff.md).
 *
 * hubapp owns the engine, the tiered-commission maths, and the base-protected
 * contract RENDER. SIS owns three small things:
 *   1. serve the hubapp-rendered contract to the logged-in partner (proxy — keeps
 *      the hub URL server-side, no CORS),
 *   2. on Agree & Activate, stamp `agencies.accel_agree_date` (idempotent, logged),
 *   3. push the three already-created props to the partner's HubSpot Company
 *      (or Contact for a sole trader).
 * SIS computes NO rate — the moment accel_agree_date lands on HubSpot, the hubapp
 * engine takes over.
 */
import type { PrismaClient } from '../generated/prisma/client';

const HUB_BASE = process.env.HUB_BASE_URL || 'https://hub.ulearnschool.com';
const HUBSPOT_TOKEN = process.env.ACCESS_TOKEN;

// today / next-year computed in UTC to dodge the Dublin-DST off-by-one (see
// reference_utc_date_math): a summer `@db.Date` save can otherwise land a day early.
function todayIso(): string {
  const d = new Date();
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
}
function cycleEndIso(): string {
  return `${new Date().getUTCFullYear() + 1}-12-31`;   // founding runway: 31 Dec of next year
}

// Resolve which HubSpot entity this agency maps to: Company when we have a
// company id, else the primary Agent Employee Contact (sole traders, e.g.
// Saranzaya). Mirrors Agency.primaryEntityType.
function hubEntity(agency: { hubspotCompanyId: string | null; primaryContactId: string | null; primaryEntityType: string | null }):
  { kind: 'company' | 'contact'; id: string } | null {
  if (agency.hubspotCompanyId && agency.primaryEntityType !== 'contact') return { kind: 'company', id: agency.hubspotCompanyId };
  if (agency.primaryContactId) return { kind: 'contact', id: agency.primaryContactId };
  if (agency.hubspotCompanyId) return { kind: 'company', id: agency.hubspotCompanyId };
  return null;
}

export function acceleratorScripts(prisma: PrismaClient) {
  async function loadAgency(agencyId: number) {
    return prisma.agency.findUnique({
      where: { id: agencyId },
      select: {
        id: true, name: true, hubspotCompanyId: true, primaryContactId: true,
        primaryEntityType: true, accelAgreeDate: true, accelAgreeById: true,
      },
    });
  }

  async function getStatus(agencyId: number) {
    const a = await loadAgency(agencyId);
    if (!a) throw new Error('Agency not found');
    const entity = hubEntity(a);
    return {
      signed: !!a.accelAgreeDate,
      agreeDate: a.accelAgreeDate ?? null,
      // eligible to be shown the offer = we can resolve a HubSpot entity to write to
      eligible: !!entity,
    };
  }

  // Server-side proxy of the hubapp-rendered contract HTML for THIS agency. The
  // returned document is self-contained (logo inlined) and carries its own
  // #accel-agree checkbox + #accel-activate button.
  async function fetchContractHtml(agencyId: number): Promise<string> {
    const a = await loadAgency(agencyId);
    if (!a) throw new Error('Agency not found');
    const entity = hubEntity(a);
    if (!entity) throw new Error('No HubSpot Company or Contact on file for this agency — cannot render the Accelerator contract.');
    const qs = entity.kind === 'company' ? `companyId=${encodeURIComponent(entity.id)}` : `contactId=${encodeURIComponent(entity.id)}`;
    const url = `${HUB_BASE}/hubapp/accelerator/contract?${qs}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`hubapp contract fetch failed (${res.status})`);
    return res.text();
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

  // Idempotent: only stamps + pushes on the FIRST signing. Never overwrites an
  // existing accel_agree_date. `signedByUsername` is the session username (partner
  // login stores a username, not a numeric id) — resolved to a SisUser id for the
  // audit stamp, best-effort.
  async function activate(agencyId: number, signedByUsername: string | null) {
    const a = await loadAgency(agencyId);
    if (!a) throw new Error('Agency not found');
    if (a.accelAgreeDate) {
      return { alreadySigned: true, agreeDate: a.accelAgreeDate };
    }
    const entity = hubEntity(a);
    if (!entity) throw new Error('No HubSpot Company or Contact on file for this agency.');

    let signedById: number | null = null;
    if (signedByUsername) {
      const u = await prisma.sisUser.findFirst({ where: { username: signedByUsername }, select: { id: true } });
      signedById = u?.id ?? null;
    }

    const agree = todayIso();
    // 1) Stamp SIS first (source of truth for the gate) — the HubSpot push is
    //    best-effort and can be retried; the local signature must not be lost.
    await prisma.agency.update({
      where: { id: agencyId },
      data: { accelAgreeDate: new Date(agree + 'T00:00:00.000Z'), accelAgreeById: signedById ?? undefined },
    });

    // 2) Push the three hubapp-owned props → the engine inherits from here.
    let hubspotPushed = false, hubspotError: string | null = null;
    try {
      await hsPatch(entity.kind, entity.id, {
        accel_agree_date: agree,
        accel_cycle_start: agree,
        accel_cycle_end: cycleEndIso(),
      });
      hubspotPushed = true;
    } catch (e: any) {
      hubspotError = String(e?.message || e);
      console.error(`[accelerator] agency ${agencyId} HubSpot push failed:`, hubspotError);
    }
    console.log(`[accelerator] agency ${agencyId} activated by ${signedByUsername ?? '?'} (uid=${signedById ?? '?'}) — agree=${agree}, hubspot=${hubspotPushed ? 'ok' : 'FAILED'}`);
    return { alreadySigned: false, agreeDate: agree, cycleEnd: cycleEndIso(), hubspotPushed, hubspotError, entity };
  }

  return { getStatus, fetchContractHtml, activate };
}
