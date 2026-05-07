// One-shot patch: swap the Start/Finish date tokens on the NonEU LoA template
// from course dates to visa-aware dates. The new tokens fall back to course
// dates when visa dates aren't filled in (see documents.ts) so the document
// always renders, but for the typical NonEU case where staff have entered the
// 35-week visa window, the embassy now sees the visa dates.
//
// Idempotent — safe to run multiple times. Pass --apply to write.
import dotenv from 'dotenv';
dotenv.config();
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';

async function main() {
  const apply = process.argv.includes('--apply');
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter } as any);

  const t = await (prisma as any).documentTemplate.findFirst({
    where: { slug: 'LOA-NonEU-QR' },
    select: { id: true, htmlTemplate: true },
  });
  if (!t) { console.error('LOA-NonEU-QR template not found'); process.exit(1); }

  const before = t.htmlTemplate as string;
  const after = before
    .replace(/\{\{booking\.start_date\}\}/g, '{{booking.visa_start_date}}')
    .replace(/\{\{booking\.end_date\}\}/g,   '{{booking.visa_end_date}}');

  if (after === before) {
    console.log('No date tokens to swap — template already patched or uses different tokens.');
    await prisma.$disconnect();
    return;
  }

  const startCount = (before.match(/\{\{booking\.start_date\}\}/g) || []).length;
  const endCount   = (before.match(/\{\{booking\.end_date\}\}/g) || []).length;
  console.log(`Replacements: ${startCount}× booking.start_date, ${endCount}× booking.end_date`);

  if (apply) {
    await (prisma as any).documentTemplate.update({
      where: { id: t.id },
      data: { htmlTemplate: after },
    });
    console.log('Patched.');
  } else {
    console.log('Dry-run only — pass --apply to write.');
  }
  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
