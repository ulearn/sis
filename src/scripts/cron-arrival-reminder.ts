/**
 * Standalone cron: pre-arrival HOST reminder (confirmation-by-exception follow-up).
 *
 * The placement confirmation email (#19) no longer asks the host to acknowledge —
 * their portal offer + Kelly's acceptance are the two decisive actions. This cron
 * is the single pre-arrival nudge: a short reminder a couple of days before the
 * student lands, pulled from the CURRENT SIS booking (so changed dates/rooms are
 * reflected), expecting no reply unless the host can no longer accommodate.
 *
 * SYSTEM-WIDE ARM: data/arrival-reminder.json { armed, leadDays }. armed=false →
 * the cron runs but sends NOTHING (dark). Flip armed=true once to enable it for
 * ALL upcoming host-family arrivals — it is not a per-host toggle.
 *
 * COHORT: active Host-Family placements (bed assigned) whose start date is exactly
 * `leadDays` days out, booking not CANCELLED, not already reminded for this stay
 * (arrival_reminder_sent_at NULL). One reminder per stay — stamped after send so a
 * re-run never double-sends.
 *
 * TEMPLATE: document_templates slug 'host-arrival-reminder' (templateType 'email'),
 * staff-editable in the SIS Templates UI. Self-heals from DEFAULT_HTML if missing;
 * thereafter staff edits win (never overwritten). From accomm@.
 *
 * Usage: node dist/scripts/cron-arrival-reminder.js [--dry]
 */

import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import pg from 'pg';
import { emailTemplateWhere } from './email-templates';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';
import { sendEmail } from './email';
import { documentScripts } from './documents';

dotenv.config();

const ACCOMM_FROM = 'accomm@ulearnschool.com';
export const TEMPLATE_SLUG = 'host-arrival-reminder';
export const DEFAULT_SUBJECT = 'Reminder — {{student.first_name}} arriving {{accommodation.start_date}}';
const isValidEmail = (e?: string | null) => !!e && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e);

// Body-only HTML — sendEmail() adds the Verdana chrome + accomm@ signature.
// Mirrors the #19 house style (teal table) so the two host emails read as a set.
export const DEFAULT_HTML = `<p style="margin:0 0 16px">Dear {{accommodation.contact_name}},</p>
<p style="margin:0 0 20px">Just a quick reminder that your student is due to arrive on <strong>{{accommodation.start_date}}</strong>.</p>

<table style="border-collapse:collapse;width:100%;max-width:540px;margin:0 0 20px;font-size:14px"><tbody><tr><td colspan="2" style="background:#0091ae;color:#fff;padding:8px 12px;font-weight:700;border:1px solid #0091ae;font-size:13px;letter-spacing:.3px">Your Student</td></tr><tr><td style="padding:8px 12px;background:#f3fafc;border:1px solid #e4ebed;font-weight:700;width:150px;vertical-align:top">Student</td><td style="padding:8px 12px;border:1px solid #e4ebed;vertical-align:top">{{student.first_name}} {{student.last_name}}</td></tr><tr><td style="padding:8px 12px;background:#f3fafc;border:1px solid #e4ebed;font-weight:700;width:150px;vertical-align:top">Arrival</td><td style="padding:8px 12px;border:1px solid #e4ebed;vertical-align:top">{{accommodation.start_date}}</td></tr><tr><td style="padding:8px 12px;background:#f3fafc;border:1px solid #e4ebed;font-weight:700;width:150px;vertical-align:top">Departure</td><td style="padding:8px 12px;border:1px solid #e4ebed;vertical-align:top">{{accommodation.end_date}}</td></tr><tr><td style="padding:8px 12px;background:#f3fafc;border:1px solid #e4ebed;font-weight:700;width:150px;vertical-align:top">Room</td><td style="padding:8px 12px;border:1px solid #e4ebed;vertical-align:top">{{accommodation.room_type}}</td></tr><tr><td style="padding:8px 12px;background:#f3fafc;border:1px solid #e4ebed;font-weight:700;width:150px;vertical-align:top">Board</td><td style="padding:8px 12px;border:1px solid #e4ebed;vertical-align:top">{{accommodation.board}}</td></tr></tbody></table>

{if student.flight_number}<table style="border-collapse:collapse;width:100%;max-width:540px;margin:0 0 20px;font-size:14px"><tbody><tr><td colspan="2" style="background:#0091ae;color:#fff;padding:8px 12px;font-weight:700;border:1px solid #0091ae;font-size:13px;letter-spacing:.3px">Flight</td></tr><tr><td style="padding:8px 12px;background:#f3fafc;border:1px solid #e4ebed;font-weight:700;width:150px;vertical-align:top">Flight</td><td style="padding:8px 12px;border:1px solid #e4ebed;vertical-align:top">{{student.flight_number}}</td></tr><tr><td style="padding:8px 12px;background:#f3fafc;border:1px solid #e4ebed;font-weight:700;width:150px;vertical-align:top">Date</td><td style="padding:8px 12px;border:1px solid #e4ebed;vertical-align:top">{{student.flight_date}}</td></tr><tr><td style="padding:8px 12px;background:#f3fafc;border:1px solid #e4ebed;font-weight:700;width:150px;vertical-align:top">Time</td><td style="padding:8px 12px;border:1px solid #e4ebed;vertical-align:top">{{student.flight_time}}</td></tr></tbody></table>{/if}

<p style="margin:0 0 16px">Please have everything ready for their arrival. If anything has changed and you are no longer able to accommodate the student, please let us know immediately. Otherwise, no reply is necessary.</p>
<p style="margin:0 0 16px">ULearn's Accomm support phone is <strong>+353 85 157 4801</strong>.</p>
<p style="margin:0 0 8px">Warm regards,</p>`;

async function loadReminderTemplate(prisma: PrismaClient) {
  let tpl = await prisma.documentTemplate.findFirst({
    where: emailTemplateWhere(TEMPLATE_SLUG),
    select: { id: true, subject: true, htmlTemplate: true },
  });
  if (!tpl) {
    tpl = await prisma.documentTemplate.create({
      data: {
        name: 'Host — Pre-Arrival Reminder',
        slug: TEMPLATE_SLUG,
        templateType: 'email',
        category: 'accommodation/host-arrival-reminder',
        documentType: 'accommodation/host-arrival-reminder',
        subject: DEFAULT_SUBJECT,
        htmlTemplate: DEFAULT_HTML,
        active: true,
      },
      select: { id: true, subject: true, htmlTemplate: true },
    });
    console.log(`  created email template '${TEMPLATE_SLUG}' (#${tpl.id})`);
  }
  return tpl;
}

function loadConfig(): { armed: boolean; leadDays: number } {
  try {
    const raw = fs.readFileSync(path.join(__dirname, '..', '..', 'data', 'arrival-reminder.json'), 'utf8');
    const c = JSON.parse(raw);
    return { armed: c.armed === true, leadDays: Number.isFinite(c.leadDays) ? c.leadDays : 2 };
  } catch {
    return { armed: false, leadDays: 2 };
  }
}

async function main() {
  const dry = process.argv.includes('--dry');
  const cfg = loadConfig();
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool as any) });

  try {
    const now = new Date();
    // Target arrival date = today + leadDays, at UTC midnight (accom startDate is @db.Date).
    const target = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + cfg.leadDays));
    const targetEnd = new Date(target.getTime() + 86400000);
    console.log(`[${now.toISOString()}] arrival-reminder${dry ? ' (DRY RUN)' : ''} — armed=${cfg.armed} leadDays=${cfg.leadDays} target=${target.toISOString().slice(0, 10)}`);

    if (!cfg.armed && !dry) {
      console.log('  system is DARK (armed=false) — no reminders sent. Set data/arrival-reminder.json armed=true to enable.');
      return;
    }

    const docs = documentScripts(prisma);
    const tpl = await loadReminderTemplate(prisma);

    const placements = await prisma.bookingAccommodation.findMany({
      where: {
        active: true,
        bedId: { not: null },
        arrivalReminderSentAt: null,
        startDate: { gte: target, lt: targetEnd },
        booking: { status: { not: 'CANCELLED' } },
        bed: { room: { property: { provider: { type: 'Host Family' } } } },
      },
      select: {
        id: true,
        booking: { select: { id: true, studentId: true, student: { select: { firstName: true } } } },
        bed: { select: { room: { select: { property: { select: { provider: { select: { name: true, email: true } } } } } } } },
      },
    });

    console.log(`  cohort: ${placements.length} host-family arrival(s) ${cfg.leadDays} day(s) out`);
    let sent = 0, skippedNoEmail = 0, failed = 0;

    for (const p of placements) {
      const studentId = p.booking?.studentId;
      const bookingId = p.booking?.id;
      const prov = p.bed?.room?.property?.provider;
      if (studentId == null || bookingId == null) continue;

      const { tokens } = await docs.resolveTokens(studentId, bookingId, { slug: TEMPLATE_SLUG });
      const to = prov?.email || (tokens as any)['accommodation.email'] || null;
      const who = `${p.booking?.student?.firstName || 'student'} → ${prov?.name || 'host'} (ba#${p.id})`;

      if (!isValidEmail(to)) { skippedNoEmail++; console.log(`  · SKIP ${who} — no valid host email`); continue; }
      if (dry) { console.log(`  · WOULD SEND → ${who} to ${to}`); sent++; continue; }

      try {
        await sendEmail({
          from: ACCOMM_FROM,
          fromName: 'ULearn',
          to,
          subject: docs.renderTemplate(tpl.subject || DEFAULT_SUBJECT, tokens),
          html: docs.renderTemplate(tpl.htmlTemplate, tokens),
        });
        await prisma.bookingAccommodation.update({ where: { id: p.id }, data: { arrivalReminderSentAt: now } });
        sent++;
        console.log(`  · SENT → ${who} to ${to}`);
      } catch (e: any) {
        failed++;
        console.error(`  · FAILED ${who}:`, e?.message || e);
      }
    }

    console.log(`[${new Date().toISOString()}] done — ${sent} sent, ${skippedNoEmail} no-email, ${failed} failed`);
  } catch (e) {
    console.error('arrival-reminder cron error:', e);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

if (require.main === module) main();
