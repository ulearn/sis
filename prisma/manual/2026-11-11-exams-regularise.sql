-- Exams regularise (handover 2026-11-11). Hand-written per the Prisma 7 db-push
-- hazard (bare `db push` drops non-Prisma tables). Apply with:
--   npx prisma db execute --file prisma/manual/2026-11-11-exams-regularise.sql --schema prisma/schema.prisma
-- Then reflect the identical shape in schema.prisma → npx prisma generate → npx tsc → touch tmp/restart.txt.
-- Current data: 6 REQUEST_PENDING + 4 NEEDS_ATTENTION, 0 REQUESTED (safe).

-- ── A. ExamBookingStatus 11 → 5. One atomic CASE conversion, so the "order
--    matters" concern (REQUESTED changing meaning) can't bite — every OLD value
--    maps deterministically in a single pass. ──
BEGIN;
CREATE TYPE "ExamBookingStatus_new" AS ENUM ('REQUESTED','BOOKED','CONFIRMED','CANCELLED','NEEDS_ATTENTION');
ALTER TABLE student_exam_bookings ALTER COLUMN status DROP DEFAULT;
ALTER TABLE student_exam_bookings
  ALTER COLUMN status TYPE "ExamBookingStatus_new"
  USING (CASE status::text
    WHEN 'REQUEST_PENDING'  THEN 'REQUESTED'
    WHEN 'CHANGE_REQUESTED' THEN 'REQUESTED'
    WHEN 'REQUESTED'        THEN 'BOOKED'          -- today's REQUESTED (= sent to CES) becomes BOOKED
    WHEN 'CONFIRMED'        THEN 'CONFIRMED'
    WHEN 'SAT'              THEN 'CONFIRMED'
    WHEN 'RESULTS_RECEIVED' THEN 'CONFIRMED'
    WHEN 'COMPLETED'        THEN 'CONFIRMED'
    WHEN 'CANCELLED'        THEN 'CANCELLED'
    WHEN 'REJECTED'         THEN 'CANCELLED'
    WHEN 'EXPIRED'          THEN 'CANCELLED'
    WHEN 'NEEDS_ATTENTION'  THEN 'NEEDS_ATTENTION'
    ELSE 'NEEDS_ATTENTION'
  END::text::"ExamBookingStatus_new");
DROP TYPE "ExamBookingStatus";
ALTER TYPE "ExamBookingStatus_new" RENAME TO "ExamBookingStatus";
ALTER TABLE student_exam_bookings ALTER COLUMN status SET DEFAULT 'REQUESTED';
COMMIT;

-- ── C. ExamCode: add the two new codes (ADD VALUE must be its own autocommit;
--    not used in this script, so safe). ──
ALTER TYPE "ExamCode" ADD VALUE IF NOT EXISTS 'IELTS_ACADEMIC';
ALTER TYPE "ExamCode" ADD VALUE IF NOT EXISTS 'OTHER';

-- ── C. request-source enum + the inventory fields on student_exam_bookings ──
CREATE TYPE "ExamRequestSource" AS ENUM ('APP','EMAIL','RECEPTION','DESK','IMPORT');
ALTER TABLE student_exam_bookings
  ADD COLUMN IF NOT EXISTS source         "ExamRequestSource" NOT NULL DEFAULT 'APP',
  ADD COLUMN IF NOT EXISTS source_ref     text,
  ADD COLUMN IF NOT EXISTS exam_code      "ExamCode",
  ADD COLUMN IF NOT EXISTS exam_label     text,
  ADD COLUMN IF NOT EXISTS preferred_date date,
  ADD COLUMN IF NOT EXISTS notes          text;
CREATE INDEX IF NOT EXISTS idx_seb_source_ref ON student_exam_bookings (source_ref);
