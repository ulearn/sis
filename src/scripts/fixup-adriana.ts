// Reconcile Adriana McTest (#97) and any other students caught up in the
// phantom-Sunday-occurrence bug fixed in attendance.ts. Two passes:
//
//   1) Phantom occurrences: any classOccurrence whose date is not in the
//      class's `days` whitelist. Delete the occurrence + any attendance rows
//      that reference it.
//   2) Adriana's class assignment #119: weekStart 2026-03-02 → bump to her
//      bookingCourse.startDate (2026-04-27). Limit to her id so we don't
//      touch any other student's row.
//
// Run with `--apply` to actually mutate; default is dry-run.
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';

const APPLY = process.argv.includes('--apply');

async function main() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter } as any);

  console.log(APPLY ? '== APPLY MODE ==' : '== DRY RUN ==');

  // ── Phantom occurrences ────────────────────────────
  const classes = await prisma.class.findMany({ select: { id: true, name: true, days: true } as any });
  let phantomTotal = 0;
  for (const c of classes) {
    const days: number[] = ((c as any).days || []) as number[];
    if (!days.length) continue;
    const occs: any[] = await (prisma as any).classOccurrence.findMany({
      where: { classId: c.id },
      select: { id: true, date: true } as any,
    });
    const phantom = occs.filter(o => !days.includes(new Date(o.date).getDay()));
    if (!phantom.length) continue;
    phantomTotal += phantom.length;
    console.log(`\nclass #${c.id} ${c.name} — ${phantom.length} phantom occurrence(s):`);
    for (const o of phantom) {
      const wkd = new Date(o.date).toLocaleDateString('en-IE', { weekday: 'short', timeZone: 'Europe/Dublin' });
      const att = await prisma.attendance.count({ where: { occurrenceId: o.id } });
      console.log(`  occ #${o.id} ${o.date.toISOString().slice(0,10)} (${wkd}) — ${att} attendance row(s)`);
      if (APPLY) {
        await prisma.attendance.deleteMany({ where: { occurrenceId: o.id } });
        await (prisma as any).classOccurrence.delete({ where: { id: o.id } });
      }
    }
  }
  console.log(`\nphantom occurrences total: ${phantomTotal} ${APPLY ? '(deleted)' : '(would delete)'}`);

  // ── Adriana's class assignment ─────────────────────
  const adriana = await prisma.student.findFirst({
    where: { firstName: { equals: 'Adriana' }, lastName: { equals: 'McTest' } },
    select: { id: true } as any,
  });
  if (adriana) {
    const assigns: any[] = await (prisma as any).studentClassAssignment.findMany({
      where: { studentId: adriana.id },
      include: { bookingCourse: { select: { startDate: true, endDate: true, name: true } } } as any,
      orderBy: { id: 'asc' },
    });
    console.log(`\nAdriana McTest #${adriana.id} — ${assigns.length} class assignment(s):`);
    for (const a of assigns) {
      const cs = a.bookingCourse?.startDate;
      const tooEarly = cs && new Date(a.weekStart) < new Date(cs);
      const flag = tooEarly ? '  ⚠ weekStart < course startDate' : '';
      console.log(`  assignment #${a.id} class ${a.classId} · weekStart=${a.weekStart?.toISOString().slice(0,10)} · course=${a.bookingCourse?.name} (${cs?.toISOString().slice(0,10)} → ${a.bookingCourse?.endDate?.toISOString().slice(0,10)})${flag}`);
      if (tooEarly && APPLY) {
        await (prisma as any).studentClassAssignment.update({
          where: { id: a.id },
          data: { weekStart: cs } as any,
        });
        console.log(`    → updated weekStart to ${cs.toISOString().slice(0,10)}`);
      }
    }
  }

  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
