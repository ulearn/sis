/**
 * cron-deal-resync.ts — closes the ReSync loop.
 *
 * The HubSpot "ReSync Deal" workflow sets deal.resync = "Yes" but does NOT fire a SIS
 * webhook, so nothing re-pulls (invoice-created only fires on genuinely new invoices).
 * This cron is the trigger: find every deal flagged resync=Yes, run the AUTHORITATIVE
 * resyncBookingLogistics against its SIS booking — which overwrites differing course/
 * accom/service dates + entries and then clears the flag. Idempotent: a failed run
 * leaves the flag set and retries next hour.
 *
 *   node dist/scripts/cron-deal-resync.js         # apply
 *   node dist/scripts/cron-deal-resync.js --dry    # report only, no writes
 *
 * Logistics-only (invoiceId=null): dates/entries, NOT financials — those keep their own
 * invoice-webhook paths.
 */
import dotenv from 'dotenv';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';
import { resyncBookingLogistics } from '../routes/webhooks';

async function hsSearchResyncDeals(token: string): Promise<string[]> {
  const ids: string[] = [];
  let after: string | undefined;
  do {
    const body: any = {
      filterGroups: [{ filters: [{ propertyName: 'resync', operator: 'EQ', value: 'Yes' }] }],
      properties: ['resync'], limit: 100,
    };
    if (after) body.after = after;
    const r = await fetch('https://api.hubapi.com/crm/v3/objects/deals/search', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const j: any = await r.json();
    (j.results || []).forEach((d: any) => ids.push(d.id));
    after = j.paging?.next?.after;
  } while (after);
  return ids;
}

async function main() {
  dotenv.config();
  const dry = process.argv.includes('--dry');
  const token = process.env.ACCESS_TOKEN!;
  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) });
  const stamp = new Date().toISOString();
  try {
    const dealIds = await hsSearchResyncDeals(token);
    console.log(`[${stamp}] [deal-resync] deals flagged resync=Yes: ${dealIds.length}${dry ? ' (DRY)' : ''}`);
    for (const dealId of dealIds) {
      const booking = await prisma.booking.findFirst({ where: { hubspotDealId: dealId }, select: { id: true } });
      if (!booking) { console.log(`  deal ${dealId}: no SIS booking — skipped (flag left set)`); continue; }
      if (dry) { console.log(`  deal ${dealId} → booking #${booking.id}: WOULD authoritative-resync`); continue; }
      try {
        const changes = await resyncBookingLogistics(prisma, booking.id, dealId, null);
        console.log(`  deal ${dealId} → booking #${booking.id}: ${changes.length ? changes.join('; ') : 'no deltas'}`);
      } catch (e: any) {
        console.error(`  deal ${dealId} → booking #${booking.id}: FAILED ${e?.message || e} (flag left set, retries next run)`);
      }
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(e => { console.error('[deal-resync] fatal', e); process.exit(1); });
