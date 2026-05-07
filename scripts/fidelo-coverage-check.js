// One-shot diff: Fidelo bookings starting today → far future vs what SIS has.
// Uses the same all_end_original filter that import-fidelo.ts uses, then narrows
// to future-starts in JS.
require('dotenv').config({ path: '/home/sis/web/sis.ulearnschool.com/public_html/sis/.env', quiet: true });
const https = require('https');
const { Pool } = require('/home/sis/web/sis.ulearnschool.com/public_html/sis/node_modules/pg');

const TOKEN = process.env.FIDELO_API_TOKEN;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

function fideloGet(path) {
  return new Promise((resolve, reject) => {
    https.get(`https://ulearn.fidelo.com${path}&_token=${TOKEN}`, r => {
      const chunks = [];
      r.on('data', c => chunks.push(c));
      r.on('end', () => {
        try { resolve(JSON.parse(Buffer.concat(chunks).toString())); }
        catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}

(async () => {
  // Fetch every booking ending >= 2026-01-01 (same as nightly cron filter)
  const data = await fideloGet('/api/1.0/ts/bookings?filter[all_end_original]=2026-01-01');
  const entries = Object.entries(data.entries || {});
  const today = new Date().toISOString().slice(0, 10);

  // Future bookings: all_start > today
  const future = entries.filter(([_, e]) => e.all_start && e.all_start > today);
  const fideloFutureIds = future.map(([id]) => parseInt(id));

  // Compare against SIS
  const { rows } = await pool.query(
    `SELECT fidelo_booking_id FROM bookings WHERE fidelo_booking_id = ANY($1::int[])`,
    [fideloFutureIds]
  );
  const sisIds = new Set(rows.map(r => r.fidelo_booking_id));
  const missing = future.filter(([id]) => !sisIds.has(parseInt(id)));

  console.log(`Fidelo bookings starting > ${today}: ${future.length}`);
  console.log(`  Already in SIS: ${future.length - missing.length}`);
  console.log(`  Missing from SIS: ${missing.length}`);
  if (missing.length) {
    console.log('\nMissing — first 25 (Fidelo ID, customer #, start, end, name):');
    for (const [id, e] of missing.slice(0, 25)) {
      const name = `${e.customer_firstname || ''} ${e.customer_lastname || ''}`.trim();
      console.log(`  ${id}\t${e.customer_number || ''}\t${e.all_start}\t${e.all_end || ''}\t${name}`);
    }
  }

  // Also widen — past-end bookings since 2026-01-01 not in SIS (the broader picture)
  const allIds = entries.map(([id]) => parseInt(id));
  const { rows: r2 } = await pool.query(
    `SELECT fidelo_booking_id FROM bookings WHERE fidelo_booking_id = ANY($1::int[])`,
    [allIds]
  );
  const sisIds2 = new Set(r2.map(r => r.fidelo_booking_id));
  const allMissing = entries.filter(([id]) => !sisIds2.has(parseInt(id)));
  console.log(`\nAll Fidelo bookings ending >= 2026-01-01: ${entries.length}`);
  console.log(`  Already in SIS: ${entries.length - allMissing.length}`);
  console.log(`  Missing from SIS: ${allMissing.length}`);
  if (allMissing.length && allMissing.length !== missing.length) {
    console.log('\nAll missing — first 25:');
    for (const [id, e] of allMissing.slice(0, 25)) {
      const name = `${e.customer_firstname || ''} ${e.customer_lastname || ''}`.trim();
      console.log(`  ${id}\t${e.customer_number || ''}\t${e.all_start || ''}\t${e.all_end || ''}\t${name}`);
    }
  }

  await pool.end();
})().catch(e => { console.error('FATAL:', e); process.exit(1); });
