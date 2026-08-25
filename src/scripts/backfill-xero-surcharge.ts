/**
 * One-off sweep: back-catalogue card-surcharge correction for Xero invoices.
 *
 * Card surcharges ("add fees") only appeared in hs_amount_billed at payment,
 * and the Xero builder didn't represent them until 2026-06 (see
 * .claude/docs/payments/inv-charge-realign-handover.md). So every invoice in
 * OUR cohort (carries an order-level discount → DataSync can't represent it →
 * we own the Xero side) that was paid by card before the fix is short by its
 * surcharge in Xero and won't reconcile to the Stripe receipt.
 *
 * This finds them (HubSpot invoices with hs_fees_total > 0) and, for each whose
 * matching Xero invoice is unpaid and short, re-runs the shared builder to add
 * the CRSC surcharge line — exactly the manual fix already done for INV-1316.
 *
 * Safe by construction:
 *   - The builder self-gates to the order-level-discount cohort (skips vanilla
 *     invoices that DataSync owns).
 *   - The builder refuses to re-author a Xero invoice that already has a
 *     payment applied (we flag those for manual handling, never touch them).
 *
 * Usage:
 *   node dist/scripts/backfill-xero-surcharge.js              # dry-run (default)
 *   node dist/scripts/backfill-xero-surcharge.js --apply      # write to Xero
 *   node dist/scripts/backfill-xero-surcharge.js --limit=5
 */
import dotenv from 'dotenv';
import https from 'https';
import { getAuthedXero } from './xero';
import { createXeroInvoiceFromHubSpot } from './xero-invoice-commission';

dotenv.config();

const APPLY = process.argv.includes('--apply');
const limitArg = process.argv.find(a => a.startsWith('--limit='))?.split('=')[1];
const LIMIT = limitArg ? parseInt(limitArg, 10) : null;
const HS_TOKEN = process.env.ACCESS_TOKEN!;

function hsReq(method: string, path: string, body?: any): Promise<any> {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const req = https.request({
      hostname: 'api.hubapi.com', path, method,
      headers: {
        Authorization: `Bearer ${HS_TOKEN}`,
        ...(data ? { 'Content-Type': 'application/json' } : {}),
      },
    }, (res) => {
      let d = ''; res.on('data', (c) => d += c);
      res.on('end', () => { try { resolve(JSON.parse(d || '{}')); } catch (e) { reject(e); } });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function main() {
  console.log(`\n=== Xero card-surcharge back-catalogue sweep — ${APPLY ? 'APPLY (writes to Xero)' : 'DRY-RUN'} ===\n`);

  // 1. Find every HubSpot invoice carrying a surcharge (hs_fees_total > 0).
  const invoices: any[] = [];
  let after: string | undefined;
  do {
    const r = await hsReq('POST', '/crm/v3/objects/invoices/search', {
      filterGroups: [{ filters: [{ propertyName: 'hs_fees_total', operator: 'GT', value: '0' }] }],
      properties: ['hs_number', 'hs_fees_total', 'hs_amount_billed', 'hs_amount_paid', 'hs_order_level_discounts_total', 'hs_invoice_status'],
      limit: 100, after,
    });
    if (r.status === 'error') { console.error('HubSpot search error:', r.message); break; }
    invoices.push(...(r.results || []));
    after = r.paging?.next?.after;
  } while (after && (!LIMIT || invoices.length < LIMIT));

  const list = LIMIT ? invoices.slice(0, LIMIT) : invoices;
  console.log(`HubSpot invoices with hs_fees_total > 0: ${invoices.length}${LIMIT ? ` (processing ${list.length})` : ''}\n`);

  const { xero, tenantId } = await getAuthedXero();
  const buckets: Record<string, any[]> = { needsFix: [], aligned: [], paidSkip: [], notInXero: [], flagged: [], notCohort: [], error: [] };

  for (const inv of list) {
    const num = inv.properties?.hs_number;
    const fees = parseFloat(inv.properties?.hs_fees_total || '0') || 0;
    const billed = Math.round((parseFloat(inv.properties?.hs_amount_billed || '0') || 0) * 100) / 100;
    try {
      // resolve the deal for the builder
      const assoc = await hsReq('GET', `/crm/v3/objects/invoices/${inv.id}/associations/deals`);
      const dealId = assoc.results?.[0]?.id;
      if (!dealId) { buckets.error.push({ num, why: 'no deal association' }); continue; }

      // what WOULD the builder produce?
      const dry = await createXeroInvoiceFromHubSpot({ hubspotInvoiceId: inv.id, hubspotDealId: dealId, dryRun: true });

      // Builder returned BEFORE the dry-run path:
      //  - 'duplicate-fell-through-to-update' → cohort invoice but Xero already
      //    PAID (paid-guard fired) → never touch, manual review.
      //  - 'skipped' → genuinely not our cohort (no order-level discount).
      if (dry.status === 'duplicate-fell-through-to-update') {
        const xr = await xero.accountingApi.getInvoices(tenantId, undefined, undefined, undefined, undefined, [num]);
        const xi = (xr.body.invoices || []).find((i: any) => i.invoiceNumber === num);
        buckets.paidSkip.push({ num, xeroTotal: Number(xi?.total || 0), xeroPaid: Number(xi?.amountPaid || 0), billed, fees });
        continue;
      }
      if (dry.status !== 'dry-run') { buckets.notCohort.push({ num, builder: dry.status }); continue; }

      // SAFETY: only ever fix when adding the surcharge makes Xero EQUAL the
      // HubSpot billed total. If the builder's computed total wouldn't match
      // hs_amount_billed, the fee data is inconsistent (e.g. hs_fees_total set
      // but not baked into hs_amount_billed) — flag, never auto-write.
      if (Math.abs(dry.computedTotal - billed) > 0.01) {
        buckets.flagged.push({ num, computed: dry.computedTotal, hsBilled: billed, fees, why: 'builder total != hs_amount_billed' });
        continue;
      }

      const xr = await xero.accountingApi.getInvoices(tenantId, undefined, undefined, undefined, undefined, [num]);
      const xi = (xr.body.invoices || []).find((i: any) => i.invoiceNumber === num);
      if (!xi) { buckets.notInXero.push({ num, computed: dry.computedTotal }); continue; }

      const xeroTotal = Number(xi.total || 0);
      const short = Math.round((dry.computedTotal - xeroTotal) * 100) / 100;
      if (Math.abs(short) <= 0.01) { buckets.aligned.push({ num, total: xeroTotal }); continue; }

      // short & unpaid & builder matches HubSpot → safe to fix
      buckets.needsFix.push({ num, id: inv.id, dealId, xeroTotal, shouldBe: dry.computedTotal, short, fees });
      if (APPLY) {
        const r = await createXeroInvoiceFromHubSpot({ hubspotInvoiceId: inv.id, hubspotDealId: dealId });
        console.log(`  FIXED ${num}: €${xeroTotal} → €${dry.computedTotal} (+€${fees}) [${r.status}]`);
      }
    } catch (e: any) {
      buckets.error.push({ num, why: e.message });
    }
  }

  const f = (arr: any[]) => arr.length ? arr.map((x) => JSON.stringify(x)).join('\n  ') : '(none)';
  console.log(`\n--- RESULTS ---`);
  console.log(`\nNEEDS FIX (short, unpaid, matches HubSpot) — ${buckets.needsFix.length}${APPLY ? ' (fixed above)' : ' (run --apply to fix)'}:\n  ${f(buckets.needsFix)}`);
  console.log(`\nFLAGGED — fee data inconsistent, DO NOT auto-fix — ${buckets.flagged.length}:\n  ${f(buckets.flagged)}`);
  console.log(`\nPAID — skipped, settled in Xero (manual if correction wanted) — ${buckets.paidSkip.length}:\n  ${f(buckets.paidSkip)}`);
  console.log(`\nNOT IN XERO (never synced; builder would create) — ${buckets.notInXero.length}:\n  ${f(buckets.notInXero)}`);
  console.log(`\nALREADY ALIGNED — ${buckets.aligned.length}`);
  console.log(`NOT OUR COHORT — ${buckets.notCohort.length}`);
  console.log(`ERRORS — ${buckets.error.length}:\n  ${f(buckets.error)}`);
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
