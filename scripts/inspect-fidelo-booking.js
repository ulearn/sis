// One-shot: fetch a single Fidelo booking's detail and dump course / accom /
// holiday summaries. Used to diagnose drift between Fidelo and SIS — e.g.
// when a course is added to an existing booking after the import skipped
// nested rows on its "patch existing" pass.
//
// Usage:
//   FIDELO_API_TOKEN=... node scripts/inspect-fidelo-booking.js <fidelo_booking_id>
require('dotenv').config();
const https = require('https');

const API_HOST = 'ulearn.fidelo.com';
const TOKEN = process.env.FIDELO_API_TOKEN;
if (!TOKEN) { console.error('FIDELO_API_TOKEN not set'); process.exit(1); }

const bookingId = process.argv[2];
if (!bookingId) { console.error('usage: node inspect-fidelo-booking.js <fidelo_booking_id>'); process.exit(1); }

function fideloGet(path) {
  return new Promise((resolve, reject) => {
    https.get({
      hostname: API_HOST, path,
      headers: { Authorization: 'Bearer ' + TOKEN },
    }, (res) => {
      let buf = '';
      res.on('data', (c) => buf += c);
      res.on('end', () => { try { resolve(JSON.parse(buf)); } catch (e) { reject(e); } });
    }).on('error', reject);
  });
}

(async () => {
  const r = await fideloGet(`/api/1.1/ts/booking/${bookingId}?include_inactive_services=1`);
  const booking = r.data?.booking;
  const student = r.data?.student;
  if (!booking) { console.error('no booking in response'); console.log(JSON.stringify(r, null, 2).slice(0, 2000)); process.exit(2); }
  console.log(`Booking ${bookingId} — ${student?.firstname || ''} ${student?.surname || ''}`);
  console.log(`  status:    ${booking.status} (confirmed=${booking.confirmed})`);
  console.log(`  serviceStart/End: ${booking.all_start || ''} → ${booking.all_end || ''}`);
  console.log(`  courses (${booking.courses ? Object.keys(booking.courses).length : 0}):`);
  if (booking.courses) {
    for (const [cid, c] of Object.entries(booking.courses)) {
      console.log(`    - id=${cid}  ${c.from} → ${c.until}  ${c.name}  (cat=${c.category}, weeks=${c.weeks}, active=${c.active})`);
    }
  }
  console.log(`  accommodations (${booking.accommodations ? Object.keys(booking.accommodations).length : 0}):`);
  if (booking.accommodations) {
    for (const [aid, a] of Object.entries(booking.accommodations)) {
      console.log(`    - id=${aid}  ${a.from} → ${a.until}  ${a.name || a.host_family_name || ''}`);
    }
  }
  console.log('\n  --- TOP-LEVEL BOOKING KEYS ---');
  console.log('  ', Object.keys(booking).sort().join(', '));
  console.log('\n  --- TRANSFER-LIKE KEYS ---');
  for (const k of Object.keys(booking).sort()) {
    if (/transfer|airport|flight|arriv|depart|pickup|dropoff|taxi/i.test(k)) {
      const v = booking[k];
      const preview = v && typeof v === 'object' ? `[object: ${Object.keys(v).join(', ')}]` : String(v);
      console.log(`    ${k}: ${preview.slice(0, 200)}`);
    }
  }
  console.log('\n  --- TOP-LEVEL STUDENT KEYS ---');
  if (student) console.log('  ', Object.keys(student).sort().join(', '));
  console.log('\n  --- RAW transfers JSON ---');
  console.log(JSON.stringify(booking.transfers, null, 2));
  console.log('\n  --- RAW custom_fields (booking) JSON ---');
  console.log(JSON.stringify(booking.custom_fields, null, 2));
})();
