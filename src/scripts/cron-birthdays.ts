/**
 * cron-birthdays — a Happy Birthday email + in-app inbox notification (bell badge)
 * to every student whose birthday is TODAY.
 *
 * COHORT: a student who
 *   · has a DOB whose month+day == today, AND
 *   · is currently in school (a non-cancelled, active booking course spanning today), AND
 *   · has a valid email, AND
 *   · hasn't already been wished this year — dedup on email_log (template_id) within
 *     the last DEDUP_DAYS, so a re-run (or a student with two overlapping bookings)
 *     can't double-send. Idempotent.
 *
 * Sends via sendStudentEmail (house signature + Gmail + email_log). Dry run:
 *   node dist/scripts/cron-birthdays.js --dry
 *
 * The email uses the DB template slug 'birthday' (document_templates, templateType=email).
 * Its hero image lives at public/assets/email-templates/birthday-hero.jpg (served no-auth
 * at https://sis.ulearnschool.com/sis/assets/email-templates/birthday-hero.jpg).
 */
import dotenv from 'dotenv';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';
import { sendStudentEmail } from '../routes/email';
import { messageScripts } from '../scripts/messages';

const TEMPLATE_SLUG = 'birthday';
const FROM_EMAIL = 'success@ulearnschool.com';
const FROM_NAME = 'ULearn Team';
const DEDUP_DAYS = 300;   // annual event — a wide window guarantees once/year

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
  console.log(`[${now.toISOString()}] birthdays${dry ? ' (DRY RUN)' : ''} — building cohort…`);

  try {
    const tpl = await prisma.documentTemplate.findFirst({
      where: { slug: TEMPLATE_SLUG, templateType: 'email' },
      select: { id: true, subject: true, htmlTemplate: true },
    });
    if (!tpl?.htmlTemplate) { console.log(`  '${TEMPLATE_SLUG}' template missing — aborting`); return; }

    const rows: any[] = await prisma.$queryRawUnsafe(
      `SELECT DISTINCT ON (s.id) s.id AS student_id, s.first_name, s.email
         FROM students s
         -- Canonical "currently in school" cohort: real (non-escrow, non-cancelled,
         -- non-€0-ghost) booking spanning today. Never wishes escrow/visa-pending
         -- (paid but never arrived) or refund/never-showed students a happy birthday.
         JOIN bookings b         ON b.student_id = s.id AND b.status NOT IN ('ESCROW','CANCELLED') AND b.amount_total > 0
         JOIN booking_courses bc ON bc.booking_id = b.id AND bc.active = true
        WHERE s.birthday IS NOT NULL AND s.email IS NOT NULL
          AND EXTRACT(MONTH FROM s.birthday) = EXTRACT(MONTH FROM CURRENT_DATE)
          AND EXTRACT(DAY   FROM s.birthday) = EXTRACT(DAY   FROM CURRENT_DATE)
          AND CURRENT_DATE BETWEEN bc.start_date AND bc.end_date
          AND NOT EXISTS (
            SELECT 1 FROM email_log el
             WHERE el.student_id = s.id
               AND el.template_id = ${tpl.id}
               AND el.created_at >= NOW() - INTERVAL '${DEDUP_DAYS} days')
        ORDER BY s.id`,
    );
    console.log(`  cohort: ${rows.length} student(s) with a birthday today (in school, not yet wished)`);
    let sent = 0, skipped = 0;

    for (const r of rows) {
      if (!isValidEmail(r.email)) { skipped++; console.log(`  · SKIP ${r.first_name} (${r.student_id}) — no valid email`); continue; }
      const subject = render(tpl.subject || '🎂 Happy Birthday!', r.first_name);
      const html = render(tpl.htmlTemplate, r.first_name);
      if (dry) { console.log(`  · WOULD SEND (email + app) → ${r.first_name} <${r.email}>`); sent++; continue; }
      try {
        const res = await sendStudentEmail(prisma, {
          from: FROM_EMAIL, fromName: FROM_NAME, to: r.email,
          subject, html, studentId: r.student_id, templateId: tpl.id,
          // Designed template with its own layout + Antonella sign-off —
          // no Verdana wrap, no auto operational signature.
          houseStyle: false,
        });
        // Also surface the wish in the student-app inbox (bell badge). Posted in
        // the same branch as the email, so the cohort's email_log dedup gates it
        // too — once/year, re-run safe. Linked to the email_log row.
        await messageScripts(prisma).postToApp({
          studentId: r.student_id, subject, bodyHtml: html,
          sentBy: FROM_EMAIL, emailLogId: res.emailLogId,
        });
        sent++;
        console.log(`  · SENT (email + app) → ${r.first_name} <${r.email}>`);
      } catch (e: any) {
        console.log(`  · FAILED → ${r.first_name}: ${e?.message || e}`);
      }
    }
    console.log(`  done — ${dry ? 'would send' : 'sent'} ${sent}, skipped ${skipped}`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => { console.error('birthdays cron failed:', e); process.exit(1); });
