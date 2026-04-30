/**
 * Weekly HubSpot → SIS commission rate sync.
 *
 * HubSpot is the source of truth for commission rates. This script refreshes the
 * cached mirror in `agencies.commission_rate` so low-latency reads (portal dashboard,
 * incentive projections) don't hit the HubSpot API on every request.
 *
 * Pulls commission from the linked HubSpot Company — or, for sole-trader agencies
 * (primary_entity_type='contact'), from the linked HubSpot Contact.
 *
 * Run weekly via cron:
 *   17 6 * * 0 cd /home/sis/web/sis.ulearnschool.com/public_html/sis && \
 *     /usr/bin/node dist/scripts/sync-commissions.js \
 *     >> /home/sis/web/sis.ulearnschool.com/private/db/commissions-sync.log 2>&1
 */
import dotenv from 'dotenv';
import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';

dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool as any);
const prisma = new PrismaClient({ adapter });

const HUBSPOT_PAT = process.env.ACCESS_TOKEN!;
const HS = 'https://api.hubapi.com';

async function hsGet(path: string): Promise<any> {
  const res = await fetch(HS + path, {
    headers: { Authorization: `Bearer ${HUBSPOT_PAT}` },
  });
  return res.json();
}

// Normalise HubSpot commission values to an integer percent (22 means 22%).
// Post-2026-04 migration HubSpot stores decimals (0.22 = 22%) for the Percentage-
// format property; we still accept legacy integer storage and clamp mis-entered
// over-scaled values so one data-entry mistake can't propagate into payroll.
function normalise(raw: any): number | null {
  if (raw === null || raw === undefined || raw === '') return null;
  const n = parseFloat(raw);
  if (isNaN(n) || n <= 0) return null;
  // Expected (decimal storage): 0.22 → 22, 0.225 → 22.5
  if (n < 1) return Math.round(n * 10000) / 100;
  // >= 50 is implausible (real rates max out ~35%) — almost certainly a ×100
  // typo (2500 meant 25). Divide and warn so the next cron log surfaces it.
  if (n >= 50) {
    console.warn(`[sync-commissions] value ${n} looks mis-scaled (×100 typo) — treating as ${n/100}`);
    return Math.round(n) / 100;
  }
  // Legacy integer storage (1 ≤ x < 50): already a percent
  return Math.round(n * 100) / 100;
}

async function main() {
  const started = new Date();
  console.log(`[sync-commissions] Started at ${started.toISOString()}`);

  // Pull every agency with either a linked company or a primary contact entity
  const agencies = await prisma.agency.findMany({
    where: {
      OR: [
        { hubspotCompanyId: { not: null } },
        { primaryEntityId: { not: null }, primaryEntityType: 'contact' },
      ],
    },
    select: { id: true, name: true, hubspotCompanyId: true, primaryEntityId: true, primaryEntityType: true, commissionRate: true },
  });

  console.log(`[sync-commissions] Found ${agencies.length} agencies to check`);

  let updated = 0;
  let unchanged = 0;
  let notFound = 0;
  let errors = 0;

  for (const a of agencies) {
    try {
      let hsRate: number | null = null;
      // Company takes precedence (for agencies with a Company, even if we also stored a contact)
      if (a.hubspotCompanyId) {
        const c = await hsGet(`/crm/v3/objects/companies/${a.hubspotCompanyId}?properties=commission`);
        hsRate = normalise(c?.properties?.commission);
      } else if (a.primaryEntityType === 'contact' && a.primaryEntityId) {
        // Sole trader — read commission directly from the contact
        const c = await hsGet(`/crm/v3/objects/contacts/${a.primaryEntityId}?properties=commission`);
        hsRate = normalise(c?.properties?.commission);
      }

      if (hsRate === null) { notFound++; continue; }

      const currentRate = a.commissionRate ? Number(a.commissionRate) : null;
      if (currentRate !== null && Math.abs(currentRate - hsRate) < 0.005) {
        unchanged++;
        continue;
      }

      await prisma.agency.update({
        where: { id: a.id },
        data: { commissionRate: hsRate },
      });
      console.log(`[sync-commissions] #${a.id} ${a.name}: ${currentRate ?? '(null)'} -> ${hsRate}`);
      updated++;
    } catch (e) {
      errors++;
      console.error(`[sync-commissions] #${a.id} ${a.name}: error ${String(e)}`);
    }
  }

  const elapsed = Math.round((Date.now() - started.getTime()) / 1000);
  console.log(`[sync-commissions] Done in ${elapsed}s — updated: ${updated}, unchanged: ${unchanged}, not found in HubSpot: ${notFound}, errors: ${errors}`);

  await prisma.$disconnect();
  await pool.end();
}

main().catch(async (e) => {
  console.error('[sync-commissions] Fatal:', e);
  await prisma.$disconnect();
  await pool.end();
  process.exit(1);
});
