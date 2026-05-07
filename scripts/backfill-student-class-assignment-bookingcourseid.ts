// One-off: populate booking_course_id on student_class_assignments rows that
// have only student_id (Fidelo-imported rows). Without this link, the
// Profit Margin calc skips every student → revenue=0, full cost → -100% margin.
//
// Match heuristic, per assignment:
//   1. Find BookingCourse rows for the same student where:
//      - bc.start_date <= assignment.week_end (or +90d if open-ended)
//      - bc.end_date   >= assignment.week_start
//      - fee IS NOT NULL AND hours_per_week IS NOT NULL  (revenue-usable)
//   2. Rank candidates:
//      - same category as class.session (MORNING ↔ MORNING/MORNING_PLUS,
//        AFTERNOON ↔ AFTERNOON/AFTERNOON_PLUS)
//      - same level as class.level (string match, '_' tolerant)
//      - most recently started (tie-break)
//   3. Take the top candidate. Ambiguous (no clear winner) → leave NULL,
//      log for manual review.
//
// Usage:
//   npx ts-node scripts/backfill-student-class-assignment-bookingcourseid.ts            # dry-run
//   npx ts-node scripts/backfill-student-class-assignment-bookingcourseid.ts --apply    # write
import dotenv from "dotenv";
import pg from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

dotenv.config();
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool as any);
const prisma = new PrismaClient({ adapter });

const APPLY = process.argv.includes("--apply");

const sessionCategoryMatch: Record<string, string[]> = {
  MORNING:   ["MORNING", "MORNING_PLUS", "INTENSIVE"],
  AFTERNOON: ["AFTERNOON", "AFTERNOON_PLUS", "INTENSIVE"],
};

async function main() {
  // Pull every NULL-booking_course_id assignment with its class context.
  const rows = await prisma.studentClassAssignment.findMany({
    where: { bookingCourseId: null, studentId: { not: null } },
    include: {
      class_: { select: { id: true, name: true, level: true, session: true } },
    },
    orderBy: { id: "asc" },
  });
  console.log(`Found ${rows.length} assignments with bookingCourseId=NULL`);

  let linked = 0, ambiguous = 0, missing = 0;
  const ambiguousLog: any[] = [];
  const missingLog: any[] = [];

  for (const a of rows) {
    if (!a.studentId || !a.class_) continue;
    const lookbackEnd = a.weekEnd ?? new Date(Date.now() + 90 * 24 * 3600 * 1000);

    const candidates = await prisma.bookingCourse.findMany({
      where: {
        booking: { studentId: a.studentId },
        startDate: { lte: lookbackEnd },
        endDate: { gte: a.weekStart },
        fee: { not: null },
        hoursPerWeek: { not: null },
      },
      orderBy: { startDate: "desc" },
    });

    if (candidates.length === 0) {
      missing++;
      missingLog.push({ scaId: a.id, studentId: a.studentId, classId: a.class_.id });
      continue;
    }

    // Score each candidate
    const sessKey = String(a.class_.session || "");
    const allowedCategories = sessionCategoryMatch[sessKey] || [];
    const today = new Date();
    const scored = candidates.map(c => {
      let s = 0;
      if (allowedCategories.includes(String(c.category))) s += 10;
      if (c.level && a.class_!.level && c.level.toLowerCase() === a.class_!.level.toLowerCase()) s += 5;
      // Prefer the course whose start_date <= assignment.weekStart (the one
      // actually in effect during that week — distinguishes consecutive
      // "Academic Year" / "Academic Year Renewal" pairs for the same student).
      if (c.startDate <= a.weekStart) s += 3;
      // Fallback when both candidates start after weekStart: prefer the one
      // currently in effect (today). Resolves cases where the student
      // updated their assignment from Mar but the relevant booking course is
      // a renewal that started in April.
      else if (c.startDate <= today && c.endDate >= today) s += 2;
      return { c, s };
    });
    // Tie-break by latest startDate (most recent course in effect)
    scored.sort((x, y) => y.s - x.s || y.c.startDate.getTime() - x.c.startDate.getTime());
    const top = scored[0];
    const next = scored[1];

    if (candidates.length === 1) {
      // single candidate — link it regardless of score
      if (APPLY) await prisma.studentClassAssignment.update({ where: { id: a.id }, data: { bookingCourseId: top.c.id } });
      linked++;
      continue;
    }

    if (top.s > 0 && (!next || top.s > next.s)) {
      if (APPLY) await prisma.studentClassAssignment.update({ where: { id: a.id }, data: { bookingCourseId: top.c.id } });
      linked++;
      continue;
    }

    // Truly ambiguous
    ambiguous++;
    ambiguousLog.push({
      scaId: a.id,
      studentId: a.studentId,
      classId: a.class_.id,
      className: a.class_.name,
      classLevel: a.class_.level,
      classSession: a.class_.session,
      candidates: scored.map(s => ({ id: s.c.id, name: s.c.name, category: s.c.category, level: s.c.level, startDate: s.c.startDate, score: s.s })),
    });
  }

  console.log(`\n=== ${APPLY ? "APPLY" : "DRY-RUN"} ===`);
  console.log(`linked:    ${linked}`);
  console.log(`ambiguous: ${ambiguous}`);
  console.log(`missing:   ${missing}`);
  if (ambiguousLog.length) {
    console.log(`\nAmbiguous (${ambiguousLog.length}):`);
    for (const a of ambiguousLog) console.log(JSON.stringify(a));
  }
  if (missingLog.length) {
    console.log(`\nNo candidate course (${missingLog.length}):`);
    for (const m of missingLog) console.log(JSON.stringify(m));
  }
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
