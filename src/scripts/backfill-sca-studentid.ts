// One-off: backfill student_id on student_class_assignments rows that have
// only booking_course_id set. UI-created rows from before the assignStudent
// patch left student_id NULL, breaking downstream consumers (LMS feedback
// auth) that join on student_id.
import dotenv from "dotenv";
import pg from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

dotenv.config();
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool as any);
const prisma = new PrismaClient({ adapter });

async function main() {
  const before = await prisma.$queryRawUnsafe<{ count: bigint }[]>(`
    SELECT COUNT(*)::bigint AS count FROM student_class_assignments
     WHERE student_id IS NULL AND booking_course_id IS NOT NULL
  `);
  console.log("rows missing student_id (before):", before[0].count.toString());

  const updated = await prisma.$executeRawUnsafe(`
    UPDATE student_class_assignments sca
       SET student_id = b.student_id
      FROM booking_courses bc
      JOIN bookings b ON b.id = bc.booking_id
     WHERE sca.booking_course_id = bc.id
       AND sca.student_id IS NULL
       AND b.student_id IS NOT NULL
  `);
  console.log("rows updated:", updated);

  const after = await prisma.$queryRawUnsafe<{ count: bigint }[]>(`
    SELECT COUNT(*)::bigint AS count FROM student_class_assignments
     WHERE student_id IS NULL AND booking_course_id IS NOT NULL
  `);
  console.log("rows missing student_id (after):", after[0].count.toString());
}
main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
