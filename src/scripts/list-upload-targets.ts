// Build the cohort list for the Fidelo upload harvest:
// every SIS Student whose Fidelo booking has serviceStart >= 2025-09-01.
//
// Output is CSV-style on stdout AND a JSON file at /tmp/upload-targets.json
// so the hub-side script can iterate.
import dotenv from 'dotenv'; dotenv.config();
import fs from 'fs';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';

async function main() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter } as any);

  // De-dupe per contact_id (one student → many bookings); keep the earliest
  // qualifying serviceStart so we have a reasonable "since" stamp per row.
  const rows: any[] = await (prisma as any).$queryRaw`
    SELECT s.id          AS sis_student_id,
           s.fidelo_contact_id AS fidelo_contact_id,
           s.fidelo_customer_num AS fidelo_customer_num,
           s.first_name, s.last_name, s.nationality, s.email,
           MIN(b.service_start) AS earliest_service_start,
           MAX(b.service_start) AS latest_service_start,
           BOOL_OR(s.passport_number IS NOT NULL AND s.passport_number <> '') AS has_passport_in_sis,
           BOOL_OR(s.visa_required = true) AS visa_required,
           COUNT(b.id)::int AS booking_count
    FROM students s
    JOIN bookings b ON b.student_id = s.id
    WHERE s.fidelo_contact_id IS NOT NULL
      AND b.service_start >= '2025-09-01'::date
    GROUP BY s.id
    ORDER BY MAX(b.service_start) DESC
  `;

  // URL recipe — same pattern that worked on the PoC for passport_51470.pdf
  const HOST = 'ulearn.fidelo.com';
  const FOLDERS = [
    { type: 'photo',         folder: 'photo',         exts: ['jpg', 'jpeg', 'png', 'pdf'] },
    { type: 'passport',      folder: 'passport',      exts: ['pdf', 'jpg', 'png'] },
    { type: 'exit_letter',   folder: 'exit_letter',   exts: ['pdf'] },
    { type: 'visa_approval', folder: 'visa_approval', exts: ['pdf', 'jpg', 'png'] },
    { type: 'flight_ticket', folder: 'flight_ticket', exts: ['pdf'] },
  ];
  const buildUrls = (cid: number) =>
    FOLDERS.flatMap(f => f.exts.map(ext => ({
      type: f.type, ext,
      url: `https://${HOST}/storage/clients/client_1/school_1/${f.folder}/${f.folder}_${cid}.${ext}`,
    })));

  const out = {
    generatedAt: new Date().toISOString(),
    cohortFilter: 'serviceStart >= 2025-09-01',
    storageHost: HOST,
    folderRecipe: FOLDERS,
    targets: rows.map(r => ({
      fideloContactId: Number(r.fidelo_contact_id),
      sisStudentId: Number(r.sis_student_id),
      fideloCustomerNum: r.fidelo_customer_num,
      name: `${r.first_name} ${r.last_name}`.trim(),
      nationality: r.nationality,
      email: r.email,
      earliestServiceStart: r.earliest_service_start,
      latestServiceStart: r.latest_service_start,
      hasPassportInSis: r.has_passport_in_sis,
      visaRequired: r.visa_required,
      bookingCount: r.booking_count,
      probeUrls: buildUrls(Number(r.fidelo_contact_id)),
    })),
  };

  const path = '/tmp/upload-targets.json';
  fs.writeFileSync(path, JSON.stringify(out, null, 2));

  // Stdout summary + CSV
  console.log(`Cohort: ${out.targets.length} students with bookings since 2025-09-01`);
  console.log(`Wrote ${path}\n`);
  console.log('CSV (sis_id, fidelo_cid, customer_num, name, nationality, latest_start, visa_req, has_passport_sis, booking_count):');
  for (const t of out.targets) {
    console.log([
      t.sisStudentId, t.fideloContactId, t.fideloCustomerNum || '',
      `"${t.name}"`, t.nationality || '',
      String(t.latestServiceStart).slice(0, 10),
      t.visaRequired ? 'Y' : 'N',
      t.hasPassportInSis ? 'Y' : 'N',
      t.bookingCount,
    ].join(','));
  }

  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
