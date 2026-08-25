// Probe what fields the Fidelo bookings-LIST endpoint carries —
// looking for airport-transfer / flight datetime fields that we could
// surface in SIS Transport view without per-booking detail fetches.
require('dotenv').config();
const https = require('https');

const API_HOST = 'ulearn.fidelo.com';
const TOKEN = process.env.FIDELO_API_TOKEN;
if (!TOKEN) { console.error('FIDELO_API_TOKEN not set'); process.exit(1); }

function fideloGet(path) {
  return new Promise((resolve, reject) => {
    https.get({ hostname: API_HOST, path, headers: { Authorization: 'Bearer ' + TOKEN } }, (res) => {
      let buf = '';
      res.on('data', (c) => buf += c);
      res.on('end', () => { try { resolve(JSON.parse(buf)); } catch (e) { reject(e); } });
    }).on('error', reject);
  });
}

(async () => {
  // Bookings ending in the next 60 days
  const today = new Date().toISOString().slice(0, 10);
  const r = await fideloGet(`/api/1.0/ts/bookings?filter[all_end_original]=${today}`);
  const entries = Object.entries(r.entries || {});
  console.log(`Found ${entries.length} list entries`);
  if (!entries.length) return;
  // Sample first entry's full key set
  const [firstId, first] = entries[0];
  console.log(`\nSample booking ${firstId} — ${first.customer_firstname} ${first.customer_lastname}`);
  console.log('All keys:');
  console.log(' ', Object.keys(first).sort().join(', '));
  console.log('\nTransfer-like keys across ALL entries:');
  const transferKeys = new Set();
  for (const [, e] of entries) {
    for (const k of Object.keys(e)) {
      if (/transfer|airport|flight|arriv|depart|pickup|dropoff|taxi/i.test(k)) transferKeys.add(k);
    }
  }
  console.log(' ', [...transferKeys].sort().join(', ') || '(none)');

  // For each transfer key, dump the populated values seen
  for (const k of transferKeys) {
    const populated = entries.filter(([,e]) => e[k] != null && e[k] !== '' && e[k] !== '0').slice(0, 6);
    console.log(`\n  ${k} — ${populated.length} populated (showing up to 6):`);
    for (const [id, e] of populated) {
      console.log(`    [${id}] ${e.customer_firstname} ${e.customer_lastname}: ${JSON.stringify(e[k]).slice(0, 200)}`);
    }
  }
})();
