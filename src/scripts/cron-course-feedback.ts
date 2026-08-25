/**
 * cron-course-feedback — final-week end-of-course feedback request.
 *
 * The feedback email (template FeedbackFinal / #59) was previously sent by hand
 * from the Comms composer (65 sends, always paired with End-Of-Course), and its
 * link pointed at the app root with nothing to fill in — so nothing was ever
 * captured. That link now deep-links to the in-app Course Feedback questionnaire
 * (…/sis/student/?feedback=course, built 2026-07-20), and this cron fires the
 * request automatically so it no longer depends on someone remembering.
 *
 * COHORT: a booking whose course ENDS within the final-week window
 * (CURRENT_DATE-1 … CURRENT_DATE+5), not cancelled, student has an email, and:
 *   · no CourseFeedback already SUBMITTED for it, and
 *   · no FeedbackFinal (#59) already logged for that student in the last 120d
 *     — dedup on email_log so hand-sent invites and prior cron runs both count,
 *     making this idempotent without a new column.
 *
 * Sends via sendStudentEmail (house signature + Gmail + email_log). Dry run:
 *   node dist/scripts/cron-course-feedback.js --dry
 */
import dotenv from 'dotenv';
import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';
import { sendStudentEmail } from '../routes/email';

const FEEDBACK_TEMPLATE_ID = 59;                 // FeedbackFinal (DB-only)
const FROM_EMAIL = 'success@ulearnschool.com';
const FROM_NAME = 'ULearn Team';
const DEDUP_DAYS = 120;

function isValidEmail(e: string | null | undefined): boolean {
  return !!e && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e);
}

// Minimal token fill — FeedbackFinal only uses {{student.first_name}} and the
// {if ilep_course_code}…{/if} exit-letter clause.
function render(html: string, firstName: string, hasIlep: boolean): string {
  let out = html.replace(/\{if\s+ilep_course_code\}([\s\S]*?)\{\/if\}/gi, hasIlep ? '$1' : '');
  out = out.replace(/\{\{\s*student\.first_name\s*\}\}/g, firstName || 'Student');
  return out;
}

async function main() {
  dotenv.config();
  const dry = process.argv.includes('--dry');
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) });
  const now = new Date();
  console.log(`[${now.toISOString()}] course-feedback${dry ? ' (DRY RUN)' : ''} — building cohort…`);

  try {
    const tpl = await prisma.documentTemplate.findUnique({
      where: { id: FEEDBACK_TEMPLATE_ID },
      select: { subject: true, htmlTemplate: true },
    });
    if (!tpl?.htmlTemplate) { console.log('  FeedbackFinal template missing — aborting'); return; }
    const subject = tpl.subject || 'Before you go — your feedback on your ULearn course (2 mins)';

    // Bookings whose course ends in the final-week window, not yet fed back and
    // not already invited. One row per booking (the course with the latest end).
    const rows: any[] = await prisma.$queryRawUnsafe(
      `SELECT b.id AS booking_id, b.student_id,
              s.first_name, s.email,
              to_char(MAX(c.end_date), 'YYYY-MM-DD') AS course_end,
              bool_or(c.ilep_code IS NOT NULL) AS has_ilep
         FROM bookings b
         JOIN students s        ON s.id = b.student_id
         JOIN booking_courses c ON c.booking_id = b.id
        WHERE b.status <> 'CANCELLED'
          AND s.email IS NOT NULL
          -- not already submitted feedback for this booking
          AND NOT EXISTS (
            SELECT 1 FROM course_feedback f
             WHERE f.booking_id = b.id AND f.submitted_at IS NOT NULL)
          -- not already invited (hand-sent OR a prior cron run) in the window
          AND NOT EXISTS (
            SELECT 1 FROM email_log el
             WHERE el.student_id = b.student_id
               AND el.template_id = ${FEEDBACK_TEMPLATE_ID}
               AND el.created_at >= NOW() - INTERVAL '${DEDUP_DAYS} days')
        GROUP BY b.id, b.student_id, s.first_name, s.email
       HAVING MAX(c.end_date) BETWEEN CURRENT_DATE - INTERVAL '1 day'
                                  AND CURRENT_DATE + INTERVAL '5 days'
        ORDER BY MAX(c.end_date)`,
    );

    console.log(`  cohort: ${rows.length} booking(s) in their final week, not yet invited`);
    let sent = 0, skippedNoEmail = 0;

    for (const r of rows) {
      if (!isValidEmail(r.email)) {
        skippedNoEmail++;
        console.log(`  · SKIP ${r.first_name} (student ${r.student_id}) — no valid email`);
        continue;
      }
      const label = `${r.first_name} (student ${r.student_id}) bk${r.booking_id} · course ends ${r.course_end}`;
      if (dry) { console.log(`  · WOULD SEND → ${label}`); sent++; continue; }
      try {
        await sendStudentEmail(prisma, {
          from: FROM_EMAIL,
          fromName: FROM_NAME,
          to: r.email,
          subject,
          html: render(tpl.htmlTemplate, r.first_name, !!r.has_ilep),
          studentId: r.student_id,
          bookingId: r.booking_id,
          templateId: FEEDBACK_TEMPLATE_ID,
        });
        sent++;
        console.log(`  · SENT → ${label}`);
      } catch (e: any) {
        console.log(`  · FAILED → ${label}: ${e?.message || e}`);
      }
    }
    console.log(`  done — ${dry ? 'would send' : 'sent'} ${sent}, skipped(no email) ${skippedNoEmail}`);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch((e) => { console.error('course-feedback cron failed:', e); process.exit(1); });
