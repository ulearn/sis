// One-shot backfill: pull Fidelo Visa & Passport data into SIS.
//
// Strategy:
//   1. Hit /api/1.0/ts/bookings?filter[all_end_original]=<from>,<to> in
//      year-sized windows — this is the SAME endpoint the nightly importer
//      uses, but the visum_* fields it returns were never being read.
//   2. For each list entry that has a non-empty visum_passport_number_original,
//      look up the existing SIS Student by fideloContactId.
//   3. Patch passportNumber / passportValidFrom / passportValidUntil /
//      visaFrom / visaUntil / visaRequired — only when SIS is currently
//      empty (never overwrite a hand-entered value).
//
// Defaults to bookings ending 2025-01-01 → 2027-12-31 (per user direction —
// no historical sweep beyond two years; passport data has retention limits).
//
// Pass --apply to write. Default is dry-run.
//   --from=YYYY-MM-DD   override start (default 2025-01-01)
//   --to=YYYY-MM-DD     override end   (default 2027-12-31)
//   --overwrite         allow overwriting existing SIS values (off by default)
import dotenv from 'dotenv'; dotenv.config();
import https from 'https';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';

const API_HOST = 'ulearn.fidelo.com';
const API_TOKEN = process.env.FIDELO_API_TOKEN!;

function fideloGet(path: string): Promise<any> {
  return new Promise((resolve, reject) => {
    https.get({ hostname: API_HOST, path: encodeURI(path), headers: { Authorization: `Bearer ${API_TOKEN}` } }, res => {
      const { asStream: parserStream } = require('stream-json/parser.js');
      const { assembler: makeAssembler } = require('stream-json/assembler.js');
      const p = res.pipe(parserStream());
      const asm = makeAssembler();
      p.on('data', (t: any) => asm[t.name] && asm[t.name](t.value));
      p.on('end', () => resolve(asm.current));
      p.on('error', reject);
    }).on('error', reject);
  });
}

const apply     = process.argv.includes('--apply');
const overwrite = process.argv.includes('--overwrite');
const fromDate  = process.argv.find(a => a.startsWith('--from='))?.split('=')[1] || '2025-01-01';
const toDate    = process.argv.find(a => a.startsWith('--to='))?.split('=')[1]   || '2027-12-31';

function parseFideloDate(s: any): Date | null {
  if (!s) return null;
  const t = String(s).trim();
  if (!t) return null;
  const d = new Date(t);
  return isNaN(d.getTime()) ? null : d;
}

async function main() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter } as any);

  console.log(`Fidelo Visa+Passport backfill ${apply ? 'APPLY' : 'dry-run'}${overwrite ? ' (OVERWRITE EXISTING)' : ''}`);
  console.log(`Window: ${fromDate} → ${toDate}\n`);

  console.log('Fetching Fidelo bulk list…');
  const data = await fideloGet(`/api/1.0/ts/bookings?filter[all_end_original]=${fromDate},${toDate}`);
  const entries = Object.entries(data.entries || {}) as [string, any][];
  console.log(`Returned ${entries.length} bookings in window`);

  // Filter to only those with a populated passport
  const withPassport = entries.filter(([_, e]) => (e?.visum_passport_number_original || '').toString().trim());
  console.log(`Of those, ${withPassport.length} have a populated visum_passport_number_original\n`);

  // De-dupe by Fidelo contact_id — one student can have multiple bookings.
  // Prefer the entry with the MOST populated visum_* fields; tiebreak on
  // most-recent booking id. Picking by recency alone misses cases where the
  // current visa data lives on an earlier booking and a newer (future-dated)
  // booking has the visa fields still empty.
  const score = (e: any) => {
    let n = 0;
    if ((e.visum_passport_number_original || '').toString().trim()) n++;
    if ((e.visum_date_of_issue_original   || '').toString().trim()) n++;
    if ((e.visum_due_date_original        || '').toString().trim()) n++;
    if ((e.visum_date_from_original       || '').toString().trim()) n++;
    if ((e.visum_date_until_original      || '').toString().trim()) n++;
    return n;
  };
  const byContactId = new Map<number, any>();
  for (const [bookingId, e] of withPassport) {
    const cid = parseInt((e.contact_id || e.id_contact || e.customer_id || e.id_customer || 0).toString());
    if (!cid) continue;
    const candidate = { ...e, _bookingId: parseInt(bookingId), _score: score(e) };
    const prev = byContactId.get(cid);
    if (!prev) { byContactId.set(cid, candidate); continue; }
    if (candidate._score > prev._score) { byContactId.set(cid, candidate); continue; }
    if (candidate._score === prev._score && candidate._bookingId > prev._bookingId) byContactId.set(cid, candidate);
  }
  console.log(`Distinct contacts with passport data: ${byContactId.size}\n`);

  let matched = 0, missing = 0;
  let wPass = 0, wPassFrom = 0, wPassUntil = 0, wVisaFrom = 0, wVisaUntil = 0, wVisaReq = 0;
  const noMatch: number[] = [];

  for (const [contactId, e] of byContactId) {
    const student = await (prisma as any).student.findFirst({
      where: { fideloContactId: contactId },
      select: { id: true, passportNumber: true, passportValidFrom: true, passportValidUntil: true,
                visaFrom: true, visaUntil: true, visaRequired: true, firstName: true, lastName: true },
    });
    if (!student) { missing++; noMatch.push(contactId); continue; }
    matched++;

    const patch: any = {};
    const want = (sisVal: any) => overwrite ? true : (sisVal == null || sisVal === '');

    const pn = (e.visum_passport_number_original || '').toString().trim();
    if (pn && want(student.passportNumber)) { patch.passportNumber = pn; wPass++; }

    const pf = parseFideloDate(e.visum_date_of_issue_original);
    if (pf && want(student.passportValidFrom)) { patch.passportValidFrom = pf; wPassFrom++; }

    const pu = parseFideloDate(e.visum_due_date_original);
    if (pu && want(student.passportValidUntil)) { patch.passportValidUntil = pu; wPassUntil++; }

    const vf = parseFideloDate(e.visum_date_from_original);
    if (vf && want(student.visaFrom)) { patch.visaFrom = vf; wVisaFrom++; }

    const vu = parseFideloDate(e.visum_date_until_original);
    if (vu && want(student.visaUntil)) { patch.visaUntil = vu; wVisaUntil++; }

    if (typeof e.visa_required === 'boolean' && want(student.visaRequired === false ? null : student.visaRequired)) {
      // visaRequired is a boolean (default false). Only flip when Fidelo
      // says true AND SIS is at the default — never blank a manual flip.
      if (e.visa_required === true && !student.visaRequired) {
        patch.visaRequired = true;
        wVisaReq++;
      }
    }

    if (Object.keys(patch).length === 0) continue;

    if (apply) {
      await (prisma as any).student.update({ where: { id: student.id }, data: patch });
    } else {
      console.log(`  s#${student.id} ${student.firstName} ${student.lastName}  ←  ${Object.keys(patch).join(',')}`);
    }
  }

  console.log(`\n=== Summary ===`);
  console.log(`Bookings in window:           ${entries.length}`);
  console.log(`With populated passport:      ${withPassport.length}`);
  console.log(`Distinct contacts:            ${byContactId.size}`);
  console.log(`Matched to SIS Student:       ${matched}`);
  console.log(`Missing in SIS:               ${missing}`);
  if (missing) console.log(`  fideloContactIds (first 20): ${noMatch.slice(0,20).join(', ')}`);
  console.log(`\nFields ${apply ? 'written' : 'would write'}:`);
  console.log(`  passportNumber:      ${wPass}`);
  console.log(`  passportValidFrom:   ${wPassFrom}`);
  console.log(`  passportValidUntil:  ${wPassUntil}`);
  console.log(`  visaFrom:            ${wVisaFrom}`);
  console.log(`  visaUntil:           ${wVisaUntil}`);
  console.log(`  visaRequired:        ${wVisaReq}`);
  console.log(`\n${apply ? 'Applied.' : 'Dry-run only — pass --apply to write.'}`);

  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
