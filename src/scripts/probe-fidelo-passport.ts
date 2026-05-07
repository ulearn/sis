// One-off probe: hit Fidelo's booking-detail API for a single known booking
// and dump every passport-related field, so we can see exactly which keys
// are exposed (passport_number alone, or also passport_valid_from /
// passport_valid_until). The Fidelo *UI* shows all three, but the public
// API may only expose the number.
import dotenv from 'dotenv'; dotenv.config();
import https from 'https';

const API_HOST = 'ulearn.fidelo.com';
const API_TOKEN = process.env.FIDELO_API_TOKEN!;

function fideloGet(path: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const opts = { host: API_HOST, path, headers: { Authorization: `Bearer ${API_TOKEN}` } };
    https.get(opts, res => {
      const chunks: Buffer[] = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => {
        try { resolve(JSON.parse(Buffer.concat(chunks).toString())); } catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}

async function main() {
  const fideloBookingId = parseInt(process.argv[2] || '0');
  if (!fideloBookingId) {
    console.error('Usage: tsx probe-fidelo-passport.ts <fideloBookingId>');
    process.exit(1);
  }
  const data = await fideloGet(`/api/1.0/ts/bookings/${fideloBookingId}`);
  const le = (data.entries && Object.values(data.entries)[0] as any) || data;
  const student = le?.student || le?.customer_detail || {};

  const dump = (label: string, obj: any) => {
    console.log(`\n--- ${label} ---`);
    const keys = Object.keys(obj || {}).filter(k => /pass|visa|valid_from|valid_until|customer_birthday|number/i.test(k));
    if (!keys.length) { console.log('  (no matching keys)'); return; }
    for (const k of keys) console.log(' ', k.padEnd(40), '=', JSON.stringify(obj[k]));
  };
  dump('list entry (le.*)', le);
  dump('student/customer_detail.*', student);

  console.log('\nAll top-level keys:', Object.keys(le).slice(0, 80).join(', '));
}
main().catch(e => { console.error(e); process.exit(1); });
