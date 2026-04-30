// One-off: populate student_id on student_class_assignments rows that have only
// booking_course_id (UI-created rows from before assignStudent was patched).
// Run once: npx ts-node scripts/backfill-student-class-assignment-studentid.ts
import { PrismaClient } from "../src/generated/prisma/client";
const prisma = new PrismaClient();

async function main() {
  const result = await prisma.$executeRaw`
    UPDATE student_class_assignments AS sca
       SET student_id = b.student_id
      FROM booking_courses bc
      JOIN bookings b ON b.id = bc.booking_id
     WHERE sca.booking_course_id = bc.id
       AND sca.student_id IS NULL
       AND b.student_id IS NOT NULL
  `;
  console.log("rows updated:", result);
}
main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
