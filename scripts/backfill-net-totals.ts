// Backfill: realign Booking.amountTotal/amountPaid/amountOpen to NET semantics
// for bookings whose current balance is non-zero (positive or negative).
//
// Why: legacy Fidelo imports stored le.amount/le.payments verbatim, which is a
// mix of gross and net depending on the agency's payment_method. Bookings
// with a negative balance are typically gross-paid-vs-net-total ghosts (e.g.
// Bilguunbayar — paid €2,951.50 vs net €2,313.62, "overpayment" €637.88 is
// just the agency commission slice routed through TransferMate).
//
// Source of truth: Fidelo's invoice.items[].amount_net per line item, summed
// over the canonical (most recent, non-credit-note) invoice.
//
// Usage:
//   node dist/scripts/backfill-net-totals.js              # dry-run (shows deltas)
//   node dist/scripts/backfill-net-totals.js --apply      # writes changes
//
// Targets only bookings with |amount_open| > 1 to avoid noise on already-clean rows.
import 'dotenv/config';
import https from 'https';
import { Client } from 'pg';
import { pickBestInvoice } from '../src/scripts/fidelo-fee-extractor';

const APPLY = process.argv.includes('--apply');
const TOKEN = process.env.FIDELO_API_TOKEN!;

function fideloGet(path: string): Promise<any> {
  return new Promise((resolve, reject) => {
    https.get({
      hostname: 'ulearn.fidelo.com',
      path: encodeURI(path),
      headers: { Authorization: 'Bearer ' + TOKEN },
    }, r => {
      let buf = '';
      r.on('data', c => buf += c);
      r.on('end', () => {
        try { resolve(JSON.parse(buf)); }
        catch (e) { reject(new Error('parse fail: ' + buf.substring(0, 200))); }
      });
    }).on('error', reject);
  });
}

async function main() {
  const c = new Client({ connectionString: process.env.DATABASE_URL });
  await c.connect();

  console.log(`\n=== Backfill NET totals ${APPLY ? '[APPLY]' : '[DRY-RUN]'} ===\n`);

  // Target: bookings with non-zero balance, fidelo-imported, recent enough that
  // the Fidelo invoice still exists. We'll catch both overpaid and underpaid.
  const rows = (await c.query<{
    id: number; fidelo_booking_id: number;
    amount_total: string; amount_paid: string; amount_open: string;
    last_name: string;
  }>(`
    SELECT b.id, b.fidelo_booking_id, b.amount_total, b.amount_paid, b.amount_open, s.last_name
    FROM bookings b JOIN students s ON s.id = b.student_id
    WHERE b.fidelo_booking_id IS NOT NULL
      AND (
        -- non-zero balance: typical gross/net mismatch
        (b.amount_open IS NOT NULL AND ABS(b.amount_open::numeric) > 1)
        -- OR an ESCROW booking where amountPaid > amountTotal even with null open
        -- (visa-rejection refund cases — kept the fee, refunded the rest, but
        -- amount_paid still records the gross deposit).
        OR (
          b.status = 'ESCROW'
          AND b.amount_total IS NOT NULL
          AND b.amount_paid IS NOT NULL
          AND b.amount_paid::numeric > b.amount_total::numeric + 1
        )
      )
      AND (b.service_end IS NULL OR b.service_end >= NOW() - INTERVAL '24 months')
    ORDER BY ABS(COALESCE(b.amount_open, b.amount_paid - b.amount_total, 0)::numeric) DESC
  `)).rows;

  console.log(`Targeting ${rows.length} bookings with |balance| > €1\n`);

  const changes: { id: number; name: string; oldTotal: number; oldPaid: number; oldOpen: number; newTotal: number; newPaid: number; newOpen: number; }[] = [];
  let unchanged = 0, noInvoice = 0, errors = 0;

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    process.stdout.write(`\r  [${i + 1}/${rows.length}] ${r.last_name}...`);
    try {
      const detail = await fideloGet(`/api/1.1/ts/booking/${r.fidelo_booking_id}?include_inactive_services=1`);
      const invoices = detail?.data?.invoices || detail?.invoices || [];
      const inv = pickBestInvoice(invoices as any[]);
      const oldTotal = Number(r.amount_total) || 0;
      const oldPaid  = Number(r.amount_paid)  || 0;
      const oldOpen  = Number(r.amount_open)  || 0;

      // Primary path: derive net total from canonical invoice line items.
      let newTotal: number | null = null;
      if (inv?.items?.length) {
        const sum = inv.items.reduce((s: number, it: any) => s + (Number(it.amount_net) || 0), 0);
        if (sum > 0) newTotal = sum;
      }
      // Fallback: invoice didn't yield a usable net (no invoice, or credit-note
      // brought it negative). If the existing amount_total looks plausible
      // (positive) AND amount_paid > amount_total (i.e., the only issue is
      // a phantom overpayment from gross deposit), keep the existing total
      // and just cap the paid. This handles visa-rejection-retain-fee rows
      // where amount_total IS already the kept-fee amount.
      if (newTotal === null) {
        if (oldTotal > 0 && oldPaid > oldTotal + 1) {
          newTotal = oldTotal;
        } else {
          noInvoice++; continue;
        }
      }

      const newPaid = oldPaid > newTotal ? newTotal : oldPaid;
      const newOpen = Math.max(0, newTotal - newPaid);

      const totalDelta = Math.abs(newTotal - oldTotal);
      const paidDelta  = Math.abs(newPaid - oldPaid);
      const openDelta  = Math.abs(newOpen - oldOpen);
      if (totalDelta < 0.5 && paidDelta < 0.5 && openDelta < 0.5) { unchanged++; continue; }

      changes.push({
        id: r.id, name: r.last_name,
        oldTotal, oldPaid, oldOpen,
        newTotal, newPaid, newOpen,
      });
    } catch (e: any) {
      errors++;
    }
  }
  process.stdout.write('\n\n');

  // Show first 20 deltas
  console.log(`Bookings with computed deltas: ${changes.length}`);
  console.log(`Bookings already matching net: ${unchanged}`);
  console.log(`Bookings with no usable invoice: ${noInvoice}`);
  console.log(`Errors fetching detail: ${errors}\n`);

  console.log('Sample deltas (first 20, sorted by |open delta|):');
  console.log('id      name                  oldTot   oldPaid   oldOpen  →  newTot   newPaid   newOpen');
  console.log('─'.repeat(98));
  const sample = [...changes].sort((a, b) => Math.abs(b.newOpen - b.oldOpen) - Math.abs(a.newOpen - a.oldOpen)).slice(0, 20);
  for (const ch of sample) {
    console.log(
      String(ch.id).padStart(5),
      ch.name.padEnd(20).substring(0, 20),
      ch.oldTotal.toFixed(2).padStart(9),
      ch.oldPaid.toFixed(2).padStart(9),
      ch.oldOpen.toFixed(2).padStart(9),
      '→',
      ch.newTotal.toFixed(2).padStart(9),
      ch.newPaid.toFixed(2).padStart(9),
      ch.newOpen.toFixed(2).padStart(9),
    );
  }

  if (!APPLY) {
    console.log('\n(dry-run — re-run with --apply to write the deltas above)');
    await c.end();
    return;
  }

  console.log(`\nApplying ${changes.length} updates...`);
  await c.query('BEGIN');
  try {
    for (const ch of changes) {
      await c.query(
        `UPDATE bookings SET amount_total = $1, amount_paid = $2, amount_open = $3 WHERE id = $4`,
        [ch.newTotal.toFixed(2), ch.newPaid.toFixed(2), ch.newOpen.toFixed(2), ch.id]
      );
    }
    await c.query('COMMIT');
    console.log('Done.');
  } catch (e) {
    await c.query('ROLLBACK');
    throw e;
  }
  await c.end();
}

main().catch(e => { console.error('FAIL:', e); process.exit(1); });
