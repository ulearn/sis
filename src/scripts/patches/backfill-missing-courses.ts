/**
 * One-shot backfill: find bookings since 2026-01-01 that have a HubSpot deal
 * but zero BookingCourse rows (the SKU-mapping bug fixed in webhooks.ts left
 * an entire class of B2B bookings with accommodation but no courses). For
 * each, re-fetch the deal's line items from HubSpot, reclassify SKUs with
 * the corrected mapping, and insert the missing BookingCourse rows.
 *
 * Idempotent: skips bookings that now have courses.
 *
 * Usage:
 *   npx tsx src/scripts/patches/backfill-missing-courses.ts          # dry-run, lists candidates
 *   npx tsx src/scripts/patches/backfill-missing-courses.ts --apply  # actually write
 */
import 'dotenv/config';
import https from 'https';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../generated/prisma/client';

const APPLY = process.argv.includes('--apply');
const HS_TOKEN = process.env.ACCESS_TOKEN!;
if (!HS_TOKEN) { console.error('Missing ACCESS_TOKEN in env'); process.exit(1); }

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

// Mirror of the corrected mapping in src/routes/webhooks.ts
function skuToCourseCategory(sku: string): string | null {
  if (!sku) return null;
  const s = sku.toUpperCase();
  if (s.startsWith('GEM')   || s === 'AYMORN')  return 'MORNING';
  if (s.startsWith('GMPLS') || s.startsWith('GIM') || s === 'AYMORN+') return 'MORNING_PLUS';
  if (s.startsWith('GEA')   || s === 'AYAFT')   return 'AFTERNOON';
  if (s.startsWith('GAPLS') || s.startsWith('GIA') || s === 'AYAFT+') return 'AFTERNOON_PLUS';
  if (s.startsWith('G30')   || s.startsWith('GE3') || s.startsWith('INT')) return 'INTENSIVE';
  if (s.startsWith('121')   || s.startsWith('PVT') || s.startsWith('PRIV')) return 'PRIVATE';
  if (s.startsWith('IELTSAM') || s.startsWith('FCE') || s.startsWith('CAE')) return 'MORNING';
  if (s.startsWith('IELTSPM')) return 'AFTERNOON';
  // Legacy HubSpot renewal products (not produced by autoQuote.js)
  if (s.startsWith('RNW-AM')) return 'MORNING';
  if (s.startsWith('RNW-PM')) return 'AFTERNOON';
  if (s.startsWith('LP')) return s.includes('AFT') ? 'AFTERNOON' : 'MORNING';
  return null;
}

function cleanCourseName(hubspotName: string, category: string, sku?: string): string {
  const s = (sku || '').toUpperCase();
  if (s.startsWith('LP')) return s.includes('AFT') ? 'Life Pass Afternoon' : 'Life Pass Morning';
  if (s.startsWith('AY')) {
    const aft = s.includes('AFT');
    const plus = s.includes('+');
    return `Academic Year ${aft ? 'Afternoon' : 'Morning'}${plus ? ' Plus' : ''}`;
  }
  let name = (hubspotName || '').replace(/\s*\|.*$/, '').replace(/\s*\(.*\)$/, '').trim();
  if (!name) {
    const names: Record<string, string> = {
      MORNING:        'General English Morning',
      MORNING_PLUS:   'General English Morning Plus',
      AFTERNOON:      'General English Afternoon',
      AFTERNOON_PLUS: 'General English Afternoon Plus',
      INTENSIVE:      'Intensive General English',
      PRIVATE:        'Private Lessons',
    };
    name = names[category] || 'Course';
  }
  return name;
}

function getHoursPerWeek(category: string): number | null {
  switch (category) {
    case 'MORNING':        return 15;
    case 'MORNING_PLUS':   return 20;
    case 'AFTERNOON':      return 15;
    case 'AFTERNOON_PLUS': return 20;
    case 'INTENSIVE':      return 30;
    default: return null;
  }
}

async function main() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter } as any);

  // Candidates: bookings created since 2026-01-01 with a HubSpot deal but no courses.
  // Cast to any because BookingCourse relation is named `courses` on the model.
  const candidates: any[] = await prisma.booking.findMany({
    where: {
      createdAt: { gte: new Date('2026-01-01') },
      hubspotDealId: { not: null },
      courses: { none: {} },
    },
    include: {
      student: { select: { id: true, firstName: true, lastName: true, email: true } },
      agency:  { select: { id: true, name: true } },
    },
    orderBy: { id: 'asc' },
  });

  console.log(`\n${APPLY ? 'APPLY' : 'DRY-RUN'} — found ${candidates.length} candidate booking(s) with no courses\n`);
  if (candidates.length === 0) { await prisma.$disconnect(); return; }

  let created = 0;
  let errors  = 0;

  for (const b of candidates) {
    const tag = `Booking ${b.id} (${b.student?.firstName} ${b.student?.lastName}${b.agency?.name ? ' / ' + b.agency.name : ''})`;
    try {
      // 1. Fetch the deal (for course dates) + its line items
      const dealId = b.hubspotDealId;
      const deal = await hsGet(`/crm/v3/objects/deals/${dealId}?properties=dealname,course_start,course_end,course_weeks`);
      if (!deal?.properties) {
        console.log(`  ${tag} — deal ${dealId} not found, skipping`);
        continue;
      }

      const liAssoc = await hsGet(`/crm/v3/objects/deals/${dealId}/associations/line_items`);
      const lineItemIds = (liAssoc.results || []).map((r: any) => r.id);
      if (lineItemIds.length === 0) {
        console.log(`  ${tag} — no line items on deal, skipping`);
        continue;
      }

      const liData = await hsPost('/crm/v3/objects/line_items/batch/read', {
        inputs: lineItemIds.map((id: string) => ({ id })),
        properties: ['name', 'hs_sku', 'quantity', 'price', 'amount', 'description'],
      });
      const lineItems: any[] = liData.results || [];

      const dp = deal.properties || {};
      const courseStart = dp.course_start ? new Date(dp.course_start) : (b.serviceStart || new Date());
      const courseEnd   = dp.course_end   ? new Date(dp.course_end)   : (b.serviceEnd   || courseStart);
      const courseWeeks = parseInt(dp.course_weeks) || null;

      // 2. Classify and collect course rows to insert
      const toInsert: any[] = [];
      for (const li of lineItems) {
        const p = li.properties || {};
        const sku = p.hs_sku || '';
        const cat = skuToCourseCategory(sku);
        if (!cat) continue;

        // Derive weeks: prefer deal.course_weeks, else line-item quantity,
        // else parse "(NNN Hours)" from name/description and divide by
        // hoursPerWeek (used for renewals which carry no course_weeks).
        let weeks = courseWeeks || parseInt(p.quantity) || 0;
        const hpw = getHoursPerWeek(cat);
        if (!weeks || weeks === 1) {
          const hoursMatch = `${p.name || ''} ${p.description || ''}`.match(/\((\d{2,4})\s*Hours?\)/i);
          if (hoursMatch && hpw) {
            const derived = Math.round(parseInt(hoursMatch[1]) / Number(hpw));
            if (derived > 1) weeks = derived;
          }
        }
        if (!weeks) weeks = 1;

        // End date: prefer deal.course_end, else start + weeks * 7 days
        let endDate = courseEnd || courseStart;
        if ((!dp.course_end) && weeks > 1) {
          const ms = weeks * 7 * 24 * 60 * 60 * 1000;
          endDate = new Date(courseStart.getTime() + ms - 1);
        }

        toInsert.push({
          bookingId:    b.id,
          name:         cleanCourseName(p.name || '', cat, sku),
          category:     cat,
          startDate:    courseStart,
          endDate,
          weeks,
          hoursPerWeek: hpw,
          fee:          parseFloat(p.amount) || 0,
          active:       true,
        });
      }

      if (toInsert.length === 0) {
        console.log(`  ${tag} — no course-SKU line items found (line items: ${lineItems.map((x: any) => x.properties?.hs_sku || '?').join(', ')})`);
        continue;
      }

      console.log(`  ${tag}`);
      for (const c of toInsert) {
        console.log(`    + ${c.category.padEnd(15)} "${c.name}"  ${c.weeks}w  €${c.fee}  ${c.startDate.toISOString().slice(0,10)} → ${c.endDate.toISOString().slice(0,10)}`);
      }

      if (APPLY) {
        for (const data of toInsert) {
          await (prisma as any).bookingCourse.create({ data });
          created++;
        }
      }
    } catch (e: any) {
      errors++;
      console.error(`  ${tag} — ERROR: ${e?.message || e}`);
    }
  }

  console.log(`\n${APPLY ? 'APPLY' : 'DRY-RUN'} complete — courses inserted: ${created}, errors: ${errors}\n`);
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
