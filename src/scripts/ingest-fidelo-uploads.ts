// Ingest Fidelo upload-harvest files into SIS.
//
// Source layout (built by hub):
//   uploads/fidelo-import/<First-Last-Slug>/passport.pdf
//                                          /photo.jpg
//                                          /exit_letter_b<bookingId>.jpg
//                                          /flight_ticket_b<bookingId>.jpg
//                                          /visa_approval_b<bookingId>.jpg
//
// For each folder we find the matching SIS Student (cohort regenerated from
// DB the same way list-upload-targets.ts built the slug list — first+last
// with non-alphanumerics → hyphens). Then for each file we:
//   1) move it into uploads/students/<studentId>/<ts>-<originalName>
//   2) create a StudentDocument row with derived category
// Idempotent: skips files whose originalName already exists for that student.
//
// Pass --apply to write. Default is dry-run.
import dotenv from 'dotenv'; dotenv.config();
import fs from 'fs';
import path from 'path';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';

const apply = process.argv.includes('--apply');

const SRC = path.join(__dirname, '..', '..', 'uploads', 'fidelo-import');
const DST_BASE = path.join(__dirname, '..', '..', 'uploads', 'students');

// Same slug recipe hub used: trim, normalise unicode, strip diacritics,
// replace spaces with hyphens, drop everything else but ASCII alnum + hyphen.
function slugify(name: string): string {
  return name.normalize('NFKD').replace(/[̀-ͯ]/g, '')
    .trim().replace(/\s+/g, '-')
    .replace(/[^A-Za-z0-9-]/g, '');
}

// Filename → category. Falls back to 'other' for anything unrecognised.
function categoryFor(filename: string): string {
  const lower = filename.toLowerCase();
  if (lower.startsWith('passport'))      return 'passport';
  if (lower.startsWith('photo'))         return 'photo';
  if (lower.startsWith('exit_letter'))   return 'exit_letter';
  if (lower.startsWith('visa_approval')) return 'visa_approval';
  if (lower.startsWith('flight_ticket')) return 'flight_ticket';
  return 'other';
}

function mimeFor(filename: string): string {
  const ext = path.extname(filename).slice(1).toLowerCase();
  return ext === 'pdf' ? 'application/pdf'
       : ext === 'png' ? 'image/png'
       : ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg'
       : ext === 'webp' ? 'image/webp'
       : 'application/octet-stream';
}

async function main() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter } as any);

  if (!fs.existsSync(SRC)) { console.error(`Source ${SRC} missing`); process.exit(1); }

  // Cohort: same query as list-upload-targets.ts (bookings since 2025-09-01,
  // fidelo-linked students). Build a slug → student map.
  const rows: any[] = await (prisma as any).$queryRaw`
    SELECT DISTINCT s.id AS sis_student_id, s.fidelo_contact_id, s.first_name, s.last_name
    FROM students s JOIN bookings b ON b.student_id = s.id
    WHERE s.fidelo_contact_id IS NOT NULL AND b.service_start >= '2025-09-01'::date
  `;
  const slugMap = new Map<string, { sisStudentId: number; firstName: string; lastName: string }>();
  for (const r of rows) {
    const slug = slugify(`${r.first_name} ${r.last_name}`);
    slugMap.set(slug, { sisStudentId: Number(r.sis_student_id), firstName: r.first_name, lastName: r.last_name });
  }

  const folders = fs.readdirSync(SRC, { withFileTypes: true }).filter(d => d.isDirectory()).map(d => d.name);
  console.log(`Cohort in DB:        ${slugMap.size}`);
  console.log(`Folders on disk:     ${folders.length}`);

  let matched = 0, unmatched = 0, filesProcessed = 0, skippedExisting = 0, errors = 0;
  const unmatchedFolders: string[] = [];
  const perCategory: Record<string, number> = {};

  for (const folderSlug of folders) {
    const target = slugMap.get(folderSlug);
    if (!target) { unmatched++; unmatchedFolders.push(folderSlug); continue; }
    matched++;

    // Get already-stored documents to avoid duplicates on re-runs
    const existing = await (prisma as any).studentDocument.findMany({
      where: { studentId: target.sisStudentId },
      select: { originalName: true },
    });
    const existingNames = new Set(existing.map((d: any) => d.originalName));

    const folderPath = path.join(SRC, folderSlug);
    const files = fs.readdirSync(folderPath, { withFileTypes: true })
      .filter(f => f.isFile() && !f.name.startsWith('.'));

    const dstDir = path.join(DST_BASE, String(target.sisStudentId));
    if (apply) fs.mkdirSync(dstDir, { recursive: true });

    for (const f of files) {
      const original = f.name;
      if (existingNames.has(original)) { skippedExisting++; continue; }
      const category = categoryFor(original);
      perCategory[category] = (perCategory[category] || 0) + 1;
      const stat = fs.statSync(path.join(folderPath, original));
      const stored = `${Date.now()}-${original.replace(/[^a-zA-Z0-9._-]/g, '_')}`;

      if (apply) {
        try {
          fs.copyFileSync(path.join(folderPath, original), path.join(dstDir, stored));
          await (prisma as any).studentDocument.create({
            data: {
              studentId: target.sisStudentId,
              filename: stored,
              originalName: original,
              mimeType: mimeFor(original),
              size: stat.size,
              category,
              uploadedBy: 'fidelo-import',
            },
          });
          filesProcessed++;
        } catch (e) {
          errors++;
          console.error(`  s#${target.sisStudentId} ${original}: ${(e as any).message}`);
        }
      } else {
        filesProcessed++;
        if (filesProcessed <= 12) {
          console.log(`  [dry] s#${target.sisStudentId} ${target.firstName} ${target.lastName}  ←  ${original} (${category}, ${(stat.size/1024).toFixed(0)}K)`);
        }
      }
    }
  }

  console.log(`\n=== Summary ===`);
  console.log(`Matched folders → Student:   ${matched}`);
  console.log(`Unmatched folders:           ${unmatched}`);
  if (unmatched) console.log(`  examples: ${unmatchedFolders.slice(0, 8).join(', ')}${unmatchedFolders.length>8?'…':''}`);
  console.log(`Files ${apply ? 'ingested' : 'would ingest'}:        ${filesProcessed}`);
  console.log(`Files skipped (already in SIS): ${skippedExisting}`);
  console.log(`Errors:                      ${errors}`);
  console.log(`\nBy category:`);
  for (const [c, n] of Object.entries(perCategory).sort((a,b)=>b[1]-a[1])) console.log(`  ${c.padEnd(15)} ${n}`);
  console.log(apply ? '\nApplied. Source dir can be deleted: ' + SRC : '\nDry-run only — pass --apply to write.');

  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
