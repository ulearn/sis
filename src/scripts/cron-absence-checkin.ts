/**
 * cron-absence-checkin — the day after a student is marked absent, send them the
 * Attendance-Absence courtesy/notice email (+ in-app inbox message).
 *
 * COHORT: a student who
 *   · has an ABSENT_UNCERTIFIED attendance row on YESTERDAY's class occurrence, AND
 *   · is on an Academic Year / ILEP course active over that day (the visa cohort the
 *     template's ISD wording applies to — a short-course tourist isn't emailed), AND
 *   · was NOT on holiday that day (holiday days aren't absences), AND
 *   · has a valid email, AND
 *   · hasn't already been sent this template TODAY — dedup on email_log so a re-run
 *     is idempotent, and a multi-day absence gets one email per day (each morning's
 *     run covers the previous day).
 *
 * Attendance itself is the source of truth for the %/limit; this email changes
 * nothing — it's the courtesy check-in + the ISD-required non-attendance notice.
 * Sends via sendStudentEmail (house signature + Gmail + email_log). Dry run:
 *   node dist/scripts/cron-absence-checkin.js --dry
 *
 * Template: DB slug 'Attendance-Absence' (document_templates, templateType=email),
 * staff-editable. Escalation (#8 Week+) and punctuality (#10) are separate and not
 * wired here.
 */
import dotenv from 'dotenv';
import { PrismaPg } from '@prisma/adapter-pg';
import { emailTemplateWhere } from './email-templates';
import { PrismaClient } from '../generated/prisma/client';
import { sendStudentEmail } from '../routes/email';
import { messageScripts } from '../scripts/messages';

const TEMPLATE_SLUG = 'Attendance-Absence';
const FROM_EMAIL = 'success@ulearnschool.com';
const FROM_NAME = 'ULearn Team';
const FALLBACK_SUBJECT = 'ULearn — Attendance Notice';

function isValidEmail(e: string | null | undefined): boolean {
  return !!e && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e);
}
function render(html: string, firstName: string): string {
  return html.replace(/\{\{\s*student\.first_name\s*\}\}/g, firstName || 'there');
}

async function main() {
  dotenv.config();
  const dry = process.argv.includes('--dry');
  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) });
  const now = new Date();
  console.log(`[${now.toISOString()}] absence check-in${dry ? ' (DRY RUN)' : ''} — building cohort for yesterday…`);

  try {
    const tpl = await prisma.documentTemplate.findFirst({
      where: emailTemplateWhere(TEMPLATE_SLUG, { templateType: 'email' }),
      select: { id: true, subject: true, htmlTemplate: true },
    });
    if (!tpl?.htmlTemplate) { console.log(`  '${TEMPLATE_SLUG}' template missing — aborting`); return; }

    const rows: any[] = await prisma.$queryRawUnsafe(
      `SELECT DISTINCT ON (s.id) s.id AS student_id, s.first_name, s.email
         FROM students s
         JOIN attendance a        ON a.student_id = s.id AND a.status::text = 'ABSENT_UNCERTIFIED'
         JOIN class_occurrences o  ON o.id = a.occurrence_id AND o.date = (CURRENT_DATE - 1)
         -- in school on an Academic Year / ILEP course (visa cohort) that day
         JOIN bookings b          ON b.student_id = s.id AND b.status NOT IN ('ESCROW','CANCELLED') AND b.amount_total > 0
         JOIN booking_courses bc  ON bc.booking_id = b.id AND bc.active = true
                                  AND (CURRENT_DATE - 1) BETWEEN bc.start_date AND bc.end_date
                                  AND (bc.holiday_wks IS NOT NULL OR bc.name ~* 'academic year|renewal|life ?pass')
        WHERE s.email IS NOT NULL AND s.email <> ''
          -- not on holiday that day (holiday ≠ absence)
          AND NOT EXISTS (
            SELECT 1 FROM booking_holidays h
             WHERE h.booking_id = b.id AND (CURRENT_DATE - 1) BETWEEN h.start_date AND h.end_date)
          -- once per day, idempotent on re-run
          AND NOT EXISTS (
            SELECT 1 FROM email_log el
             WHERE el.student_id = s.id AND el.template_id = ${tpl.id}
               AND el.created_at >= CURRENT_DATE)
        ORDER BY s.id`,
    );
    console.log(`  cohort: ${rows.length} student(s) absent yesterday (AY/ILEP, in school, not on holiday, not yet emailed today)`);
    let sent = 0, skipped = 0;

    for (const r of rows) {
      if (!isValidEmail(r.email)) { skipped++; console.log(`  · SKIP ${r.first_name} (${r.student_id}) — no valid email`); continue; }
      const subject = render(tpl.subject || FALLBACK_SUBJECT, r.first_name);
      const html = render(tpl.htmlTemplate, r.first_name);
      if (dry) { console.log(`  · WOULD SEND → ${r.first_name} <${r.email}>`); sent++; continue; }
      try {
        const res = await sendStudentEmail(prisma, {
          from: FROM_EMAIL, fromName: FROM_NAME, to: r.email,
          subject, html, studentId: r.student_id, templateId: tpl.id,
        });
        await messageScripts(prisma).postToApp({
          studentId: r.student_id, subject, bodyHtml: html,
          sentBy: FROM_EMAIL, emailLogId: res.emailLogId,
        });
        sent++;
        console.log(`  · SENT → ${r.first_name} <${r.email}>`);
      } catch (e: any) {
        console.log(`  · FAILED → ${r.first_name}: ${e?.message || e}`);
      }
    }
    console.log(`  done — ${dry ? 'would send' : 'sent'} ${sent}, skipped ${skipped}`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => { console.error('absence check-in cron failed:', e); process.exit(1); });
