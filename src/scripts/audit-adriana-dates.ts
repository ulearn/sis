// Drill into the actual occurrence/attendance dates for Adriana McTest (97)
// — show both UTC and local interpretations so we can see whether the
// "Mon 26 Apr" label is a storage drift or a render miscount.
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';

async function main() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter } as any);

  console.log('TZ env:', process.env.TZ || '(unset)');
  console.log('process locale offset:', new Date().getTimezoneOffset(), 'min');

  const studentId = 97;
  const att: any[] = await prisma.attendance.findMany({
    where: { studentId },
    include: { occurrence: { select: { date: true, classId: true } } } as any,
    orderBy: { id: 'asc' },
  });
  console.log(`\nattendance rows for ${studentId}:`);
  for (const r of att) {
    const d: Date = r.occurrence?.date;
    const iso = d?.toISOString();
    const ymdUtc = iso?.slice(0, 10);
    const ymdLocal = d ? `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}` : '';
    const wkd = d ? d.toLocaleDateString('en-IE', { weekday: 'short', timeZone: 'Europe/Dublin' }) : '';
    const wkdUtc = d ? d.toLocaleDateString('en-IE', { weekday: 'short', timeZone: 'UTC' }) : '';
    console.log(`  raw=${iso} · ymd(UTC)=${ymdUtc} · ymd(local)=${ymdLocal} · wkd(Dublin)=${wkd} · wkd(UTC)=${wkdUtc} · class ${r.occurrence?.classId} · ${r.status}`);
  }

  // And the occurrences themselves on class 4 around the boundary
  const occs: any[] = await (prisma as any).classOccurrence.findMany({
    where: { classId: 4, date: { gte: new Date('2026-04-24'), lte: new Date('2026-05-04') } },
    orderBy: { date: 'asc' },
    select: { id: true, date: true } as any,
  });
  console.log(`\nclass 4 occurrences 24 Apr → 4 May:`);
  for (const o of occs) {
    const d: Date = o.date;
    const iso = d.toISOString();
    const ymdLocal = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    const wkd = d.toLocaleDateString('en-IE', { weekday: 'short', timeZone: 'Europe/Dublin' });
    console.log(`  occ #${o.id} raw=${iso} · ymd(local)=${ymdLocal} · wkd(Dublin)=${wkd}`);
  }

  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
