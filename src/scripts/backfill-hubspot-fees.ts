/**
 * One-shot backfill: classify HubSpot deal line items for existing
 * dataSource=HUBSPOT bookings and patch the per-row financial fields that
 * the original invoice-created webhook didn't populate.
 *
 * Why: the webhook prior to today only set BookingCourse.fee /
 * BookingAccommodation.fee from SKU-matched line items. Anything that
 * didn't match a SKU (registration fee, placement fee, airport transfer,
 * exam fee, insurance, sometimes accommodation by description-only) was
 * silently merged into Booking.amountTotal and never surfaced per-row.
 *
 * This script mirrors the new classifier in src/routes/webhooks.ts and
 * patches:
 *   - Booking.regFee
 *   - Booking.placementFee
 *   - BookingExtra.fee  (matched per-type: AIRPORT_PICKUP, AIRPORT_DROPOFF, EXAM_FEE, INSURANCE)
 *   - BookingCourse.fee / BookingAccommodation.fee where currently NULL
 *
 * Usage:
 *   node dist/scripts/backfill-hubspot-fees.js                  # dry-run, all HUBSPOT bookings
 *   node dist/scripts/backfill-hubspot-fees.js --apply          # write to DB
 *   node dist/scripts/backfill-hubspot-fees.js --booking=17842  # single row debug
 *   node dist/scripts/backfill-hubspot-fees.js --apply --limit=5
 */

import dotenv from 'dotenv';
import https from 'https';
import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';

dotenv.config();

const APPLY = process.argv.includes('--apply');
const limitArg = process.argv.find(a => a.startsWith('--limit='))?.split('=')[1];
const bookingArg = process.argv.find(a => a.startsWith('--booking='))?.split('=')[1];
const LIMIT = limitArg ? parseInt(limitArg, 10) : null;
const SINGLE_BOOKING = bookingArg ? parseInt(bookingArg, 10) : null;

const HS_TOKEN = process.env.ACCESS_TOKEN!;
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool as any) });

function hsGet(path: string): Promise<any> {
  return new Promise((resolve, reject) => {
    https.get({
      hostname: 'api.hubapi.com', path,
      headers: { 'Authorization': `Bearer ${HS_TOKEN}` },
    }, (res) => {
      let data = '';
      res.on('data', (c: string) => data += c);
      res.on('end', () => { try { resolve(JSON.parse(data)); } catch (e) { reject(e); } });
    }).on('error', reject);
  });
}

function hsPost(path: string, body: any): Promise<any> {
  return new Promise((resolve, reject) => {
    const bodyStr = JSON.stringify(body);
    const req = https.request({
      hostname: 'api.hubapi.com', path, method: 'POST',
      headers: { 'Authorization': `Bearer ${HS_TOKEN}`, 'Content-Type': 'application/json' },
    }, (res) => {
      let data = '';
      res.on('data', (c: string) => data += c);
      res.on('end', () => { try { resolve(JSON.parse(data)); } catch (e) { resolve(data); } });
    });
    req.on('error', reject);
    req.write(bodyStr);
    req.end();
  });
}

// SKU mappings — kept in sync with src/routes/webhooks.ts
function skuToCourseCategory(sku: string): string | null {
  if (!sku) return null;
  const s = sku.toUpperCase();
  if (s.startsWith('GEM') || s === 'AYMORN') return 'MORNING';
  if (s.startsWith('GIM') || s === 'AYMORN+') return 'MORNING_PLUS';
  if (s.startsWith('GEA') || s === 'AYAFT') return 'AFTERNOON';
  if (s.startsWith('GIA') || s === 'AYAFT+') return 'AFTERNOON_PLUS';
  if (s.startsWith('GE3') || s.startsWith('INT')) return 'INTENSIVE';
  if (s.startsWith('PVT') || s.startsWith('PRIV')) return 'PRIVATE';
  if (s.startsWith('LP')) return s.includes('AFT') ? 'AFTERNOON' : 'MORNING';
  return null;
}
function skuToAccommType(sku: string): string | null {
  if (!sku) return null;
  const s = sku.toUpperCase();
  if (s.startsWith('HFS')) return 'Host Family';
  if (s.startsWith('ARP') || s.startsWith('ASU') || s.startsWith('AST') || s.startsWith('ASH')) return 'Apartment';
  return null;
}

type AuxKind = 'registration' | 'placement_fee' | 'pickup' | 'dropoff' | 'transfer' | 'exam' | 'insurance' | 'accommodation' | 'other';
function classifyAuxItem(name: string, description: string): AuxKind {
  const d = `${name || ''} ${description || ''}`.toLowerCase();
  if (/\bregistration\b/.test(d)) return 'registration';
  if (/\b(placement\s*fee|admission)\b/.test(d)) return 'placement_fee';
  if (/\b(pick[\s-]?up|arrival\s*transfer)\b/.test(d)) return 'pickup';
  if (/\b(drop[\s-]?off|departure\s*transfer)\b/.test(d)) return 'dropoff';
  if (/\b(transfer|airport)\b/.test(d)) return 'transfer';
  if (/\b(exam\s*fee|exam\b|test\s*fee|ielts|cambridge|fce|cae)\b/.test(d)) return 'exam';
  if (/\b(insurance|pel\b|health\s*cover)\b/.test(d)) return 'insurance';
  if (/\b(accomm|host\s*family|hotel|residence|apartment|homestay|room|lodging|board)\b/.test(d)) return 'accommodation';
  return 'other';
}

interface ProcessedFees {
  regFee: number;
  placementFee: number;
  pickupFee: number;
  dropoffFee: number;
  examFee: number;
  insuranceFee: number;
  // SKU-matched course/accom amounts — keyed by SKU so we can patch the right row
  courseSkuAmounts: Map<string, number>;
  accomSkuAmounts: Map<string, number>;
  accomFallbackFee: number; // description-matched accom (no SKU)
  totalLineItems: number;
}

function processLineItems(lineItems: any[], dpAirportPickup: any, dpAirportDropoff: any): ProcessedFees {
  const out: ProcessedFees = {
    regFee: 0, placementFee: 0, pickupFee: 0, dropoffFee: 0,
    examFee: 0, insuranceFee: 0,
    courseSkuAmounts: new Map(), accomSkuAmounts: new Map(),
    accomFallbackFee: 0, totalLineItems: 0,
  };
  let transferFee = 0;

  for (const li of lineItems) {
    const p = li.properties || {};
    const sku = p.hs_sku || '';
    const amount = parseFloat(p.amount) || 0;
    out.totalLineItems++;

    const courseCategory = skuToCourseCategory(sku);
    if (courseCategory) {
      out.courseSkuAmounts.set(sku.toUpperCase(), (out.courseSkuAmounts.get(sku.toUpperCase()) || 0) + amount);
      continue;
    }
    const accommType = skuToAccommType(sku);
    if (accommType) {
      out.accomSkuAmounts.set(sku.toUpperCase(), (out.accomSkuAmounts.get(sku.toUpperCase()) || 0) + amount);
      continue;
    }

    const kind = classifyAuxItem(p.name || '', p.description || '');
    switch (kind) {
      case 'registration':   out.regFee          += amount; break;
      case 'placement_fee':  out.placementFee    += amount; break;
      case 'pickup':         out.pickupFee       += amount; break;
      case 'dropoff':        out.dropoffFee      += amount; break;
      case 'transfer':       transferFee         += amount; break;
      case 'exam':           out.examFee         += amount; break;
      case 'insurance':      out.insuranceFee    += amount; break;
      case 'accommodation':  out.accomFallbackFee += amount; break;
    }
  }

  // Split ambiguous transfer/airport between pickup/dropoff per deal flags
  if (transferFee > 0) {
    const isTrueLocal = (v: any) => String(v ?? '').toLowerCase() === 'true';
    const wantPickup = isTrueLocal(dpAirportPickup);
    const wantDropoff = isTrueLocal(dpAirportDropoff);
    if (wantPickup && wantDropoff) {
      out.pickupFee += transferFee / 2;
      out.dropoffFee += transferFee / 2;
    } else if (wantDropoff && !wantPickup) {
      out.dropoffFee += transferFee;
    } else {
      out.pickupFee += transferFee;
    }
  }

  return out;
}

const round2 = (n: number) => Math.round(n * 100) / 100;

async function main() {
  console.log('=== HubSpot Fee Backfill ===');
  console.log(`Mode: ${APPLY ? 'APPLY (writing to DB)' : 'DRY-RUN (no writes)'}`);

  const where: any = { dataSource: 'HUBSPOT', hubspotDealId: { not: null } };
  if (SINGLE_BOOKING) where.id = SINGLE_BOOKING;

  const bookings = await prisma.booking.findMany({
    where,
    select: {
      id: true, hubspotDealId: true, hubspotInvoiceId: true,
      regFee: true, placementFee: true, amountTotal: true,
      student: { select: { firstName: true, lastName: true } },
      courses: { select: { id: true, name: true, category: true, fee: true } },
      accommodations: { select: { id: true, accommodationType: true, fee: true } },
      extras: { select: { id: true, extraType: true, fee: true } },
    } as any,
    orderBy: { id: 'desc' },
    take: LIMIT || undefined,
  });
  console.log(`Targeting ${bookings.length} bookings\n`);

  const stats = {
    fetched: 0, fetchErrors: 0, noLineItems: 0,
    bookingFinanceUpdates: 0, extraUpdates: 0, courseUpdates: 0, accomUpdates: 0,
    regFeeTotal: 0, placementTotal: 0,
  };

  for (let i = 0; i < bookings.length; i++) {
    const b: any = bookings[i];
    if (!b.hubspotDealId) continue;

    try {
      // Re-fetch deal props (need airport flags for transfer split)
      const deal = await hsGet(`/crm/v3/objects/deals/${b.hubspotDealId}?properties=airport_pickup,airport_dropoff`);
      const dp = deal.properties || {};

      // Fetch line items
      const liAssoc = await hsGet(`/crm/v3/objects/deals/${b.hubspotDealId}/associations/line_items`);
      const lineItemIds = (liAssoc.results || []).map((r: any) => r.id);
      if (lineItemIds.length === 0) { stats.noLineItems++; continue; }

      const liData = await hsPost('/crm/v3/objects/line_items/batch/read', {
        inputs: lineItemIds.map((id: string) => ({ id })),
        properties: ['name', 'hs_sku', 'quantity', 'price', 'amount', 'description'],
      });
      const lineItems = liData.results || [];
      stats.fetched++;

      const fees = processLineItems(lineItems, dp.airport_pickup, dp.airport_dropoff);

      const studentName = `${b.student?.firstName} ${b.student?.lastName}`;
      const updates: string[] = [];

      // ── Booking-level: regFee + placementFee (only fill when NULL) ──
      const bookingPatch: any = {};
      if (b.regFee == null && fees.regFee > 0) {
        bookingPatch.regFee = round2(fees.regFee);
        updates.push(`regFee=€${round2(fees.regFee)}`);
      }
      if (b.placementFee == null && fees.placementFee > 0) {
        bookingPatch.placementFee = round2(fees.placementFee);
        updates.push(`placementFee=€${round2(fees.placementFee)}`);
      }
      if (Object.keys(bookingPatch).length) {
        if (APPLY) await prisma.booking.update({ where: { id: b.id }, data: bookingPatch });
        stats.bookingFinanceUpdates++;
        stats.regFeeTotal += bookingPatch.regFee || 0;
        stats.placementTotal += bookingPatch.placementFee || 0;
      }

      // ── Extras: match by extraType, only fill NULL ──
      const extraBuckets: Record<string, number> = {
        'AIRPORT_PICKUP':  fees.pickupFee,
        'AIRPORT_DROPOFF': fees.dropoffFee,
        'EXAM_FEE':        fees.examFee,
        'INSURANCE':       fees.insuranceFee,
      };
      for (const ex of b.extras) {
        const want = extraBuckets[ex.extraType];
        if (ex.fee == null && want > 0) {
          if (APPLY) await prisma.bookingExtra.update({ where: { id: ex.id }, data: { fee: round2(want) } });
          stats.extraUpdates++;
          updates.push(`${ex.extraType}=€${round2(want)}`);
        }
      }

      // ── Courses: fill NULL fee from SKU-matched amount ──
      // Match by category (since cleanCourseName may rename), pick first NULL course.
      // If multiple courses exist and only one has NULL fee, this works cleanly.
      const courseSkuByCategory = new Map<string, number>();
      for (const [sku, amt] of fees.courseSkuAmounts.entries()) {
        const cat = skuToCourseCategory(sku);
        if (cat) courseSkuByCategory.set(cat, (courseSkuByCategory.get(cat) || 0) + amt);
      }
      for (const c of b.courses) {
        if (c.fee != null) continue;
        const want = courseSkuByCategory.get(c.category);
        if (want && want > 0) {
          if (APPLY) await prisma.bookingCourse.update({ where: { id: c.id }, data: { fee: round2(want) } });
          stats.courseUpdates++;
          updates.push(`course[${c.category}]=€${round2(want)}`);
          // consume so a 2nd course in the same category doesn't double-claim
          courseSkuByCategory.delete(c.category);
        }
      }

      // ── Accommodations: SKU match by accommodationType, fall back to accomFallbackFee ──
      const accomSkuByType = new Map<string, number>();
      for (const [sku, amt] of fees.accomSkuAmounts.entries()) {
        const t = skuToAccommType(sku);
        if (t) accomSkuByType.set(t, (accomSkuByType.get(t) || 0) + amt);
      }
      for (const a of b.accommodations) {
        if (a.fee != null) continue;
        let want = accomSkuByType.get(a.accommodationType) || 0;
        if (!want && fees.accomFallbackFee > 0) {
          want = fees.accomFallbackFee;
          fees.accomFallbackFee = 0; // consume once
        }
        if (want > 0) {
          if (APPLY) await prisma.bookingAccommodation.update({ where: { id: a.id }, data: { fee: round2(want) } });
          stats.accomUpdates++;
          updates.push(`accom[${a.accommodationType}]=€${round2(want)}`);
          accomSkuByType.delete(a.accommodationType);
        }
      }

      const tag = updates.length ? updates.join(', ') : '(no changes)';
      console.log(`[${i+1}/${bookings.length}] booking ${b.id} (${studentName}) — ${tag}`);
    } catch (e: any) {
      stats.fetchErrors++;
      console.log(`  ERROR booking ${b.id} (deal ${b.hubspotDealId}): ${e.message?.substring(0, 200)}`);
    }
  }

  console.log('\n=== Summary ===');
  console.log(`Bookings fetched: ${stats.fetched}`);
  console.log(`Fetch errors:     ${stats.fetchErrors}`);
  console.log(`No line items:    ${stats.noLineItems}`);
  console.log(`Booking financials ${APPLY ? 'updated' : 'would update'}: ${stats.bookingFinanceUpdates}`);
  console.log(`  reg fees:       €${round2(stats.regFeeTotal)}`);
  console.log(`  placement fees: €${round2(stats.placementTotal)}`);
  console.log(`Extras  ${APPLY ? 'updated' : 'would update'}: ${stats.extraUpdates}`);
  console.log(`Courses ${APPLY ? 'updated' : 'would update'}: ${stats.courseUpdates}`);
  console.log(`Accoms  ${APPLY ? 'updated' : 'would update'}: ${stats.accomUpdates}`);
  if (!APPLY) console.log('\nDRY-RUN — no DB changes. Re-run with --apply to commit.');

  await prisma.$disconnect();
  await pool.end();
}

main().catch(e => { console.error('FATAL:', e); process.exit(1); });
