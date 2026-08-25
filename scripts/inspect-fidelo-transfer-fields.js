// Dump every transfer_* field for one specific list entry so we know the
// full shape (and how arrival vs departure are encoded).
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
  const today = new Date().toISOString().slice(0, 10);
  const r = await fideloGet(`/api/1.0/ts/bookings?filter[all_end_original]=${today}`);
  const entries = Object.entries(r.entries || {});

  // Pick the entry with the most populated transfer_* fields
  let best = null, bestScore = -1;
  for (const [id, e] of entries) {
    const score = Object.keys(e).filter(k =>
      /^transfer_/.test(k) && e[k] != null && e[k] !== '' && e[k] !== '0' && e[k] !== false && !(Array.isArray(e[k]) && e[k].length === 0)
    ).length;
    if (score > bestScore) { best = [id, e]; bestScore = score; }
  }
  if (!best) return console.log('no entries');
  const [bid, b] = best;
  console.log(`Most-populated entry: booking ${bid} — ${b.customer_firstname} ${b.customer_lastname} (${bestScore} populated transfer_*)\n`);
  for (const k of Object.keys(b).sort()) {
    if (/^transfer_/.test(k)) {
      console.log(`  ${k} = ${JSON.stringify(b[k])}`);
    }
  }
})();
