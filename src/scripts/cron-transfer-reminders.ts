/**
 * Standalone cron: Airport-transfer "Arrival Details Needed" chase.
 *
 * The gap: a student books an airport pickup/dropoff but never tells us WHEN.
 * With no arrival datetime the job can't be actioned (see the Date-TBC panel in
 * the Transport view). This cron shepherds the student into their own ULearn
 * account to enter the flight details themselves — the moment they do, the
 * flight→arrival auto-seed (lib/transport-sync) fills scheduledAt and the job
 * drops out of the chase. It's their account; only they can provide it.
 *
 * COHORT (per BookingExtra): active AIRPORT_PICKUP/DROPOFF, scheduledAt NULL,
 * booking not CANCELLED, booking's EARLIEST service start (accom or course) is
 * today-or-later. A past start is water under the bridge — no chase.
 *
 * STOP conditions (both automatic via the cohort filter):
 *   · success — flight details entered → scheduledAt seeded → leaves cohort.
 *   · expiry  — service start date passes → leaves cohort.
 *
 * CADENCE (Neil, 2026-07-14): weekly until the week of arrival, then DAILY in
 * that final week. The cron runs daily; this script throttles per student off
 * arrivalReminderSentAt (7-day gap normally, 1-day when start is <= 7 days out).
 * One email per student even with several transfers.
 *
 * TEMPLATE: the email lives in document_templates (slug 'transfer-arrival-details',
 * templateType 'email') so staff can edit the copy in the SIS Templates UI —
 * NOT hardcoded here. The cron self-heals: if the row is missing it's created
 * from DEFAULT_HTML, but thereafter staff edits win (we never overwrite).
 *
 * From: success@. Usage: node dist/scripts/cron-transfer-reminders.js [--dry]
 */

import dotenv from 'dotenv';
import pg from 'pg';
import { emailTemplateWhere } from './email-templates';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';
import { sendStudentEmail } from '../routes/email';
import { isUnsetSchedule } from '../lib/transport-sync';

dotenv.config();

const SUCCESS_FROM = process.env.SUCCESS_FROM_EMAIL || 'success@ulearnschool.com';
export const TEMPLATE_SLUG = 'transfer-arrival-details';
export const DEFAULT_SUBJECT = 'Arrival Details Needed!';
const isValidEmail = (e?: string | null) => !!e && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e);
const esc = (s: any) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Body-only HTML (house-style wrap adds the Verdana chrome + signature on send).
// Token {{student.first_name}} follows the SIS template convention. This is only
// the SEED copy — once the row exists, staff edits in the Templates UI are the
// source of truth. Neil's ask (the three flight fields) + the "provide it in
// YOUR account" install/create-account block.
export const DEFAULT_HTML = `<p style="margin:0 0 16px">Dear {{student.first_name}},</p>
<p style="margin:0 0 16px">You booked an <strong>Airport Transfer</strong> with ULearn — thank you!</p>
<p style="margin:0 0 16px">To ensure a smooth transfer experience, please send us your flight details:</p>
{if inbound}<ul style="margin:0 0 16px">
  <li>Inbound Flight Number</li>
  <li>Flight Arrival Date</li>
  <li>Flight Arrival Time</li>
</ul>{endif}{if outbound}<ul style="margin:0 0 16px">
  <li>Outbound Flight Number</li>
  <li>Flight Departure Date</li>
  <li>Flight Departure Time</li>
</ul>{endif}
<p style="margin:0 0 16px"><strong>These details live in your own ULearn account — please add them there.</strong> Install the ULearn app or use your browser:</p>
<ul style="margin:0 0 16px">
  <li style="margin:0 0 10px"><strong>Android</strong> — install from
    <a href="https://play.google.com/store/apps/details?id=com.ulearnschool.app&amp;hl=en" style="color:#0091ae"><strong>Google Play</strong></a><br>
    <a href="https://play.google.com/store/apps/details?id=com.ulearnschool.app&amp;hl=en"><img src="https://sis.ulearnschool.com/sis/launch/google-play-badge.png" alt="Get it on Google Play" width="180" style="margin-top:6px"></a>
  </li>
  <li style="margin:0 0 10px"><strong>iOS</strong> — coming soon (use browser login for now).</li>
  <li style="margin:0 0 10px"><strong>Desktop / Browser</strong> —
    <a href="https://sis.ulearnschool.com/sis/register" style="color:#0091ae"><strong>Create Account</strong></a>.
    Click <strong>Create Account</strong>, then the verification email we send you, set a password, and open <strong>Flights</strong> to add the three details above.
  </li>
</ul>
<p style="margin:0 0 16px">Once your flight details are in your account, your transfer is confirmed. Without them we can't book it — so please add them as soon as you can.</p>`;

// Load the staff-editable template; create it from the seed copy if absent so
// the cron never silently no-ops. Never overwrites an existing (edited) row.
export async function loadArrivalTemplate(prisma: PrismaClient) {
  let tpl = await prisma.documentTemplate.findFirst({
    where: emailTemplateWhere(TEMPLATE_SLUG),
    select: { id: true, subject: true, htmlTemplate: true },
  });
  if (!tpl) {
    tpl = await prisma.documentTemplate.create({
      data: {
        name: 'Transfer — Arrival Details Needed',
        slug: TEMPLATE_SLUG,
        templateType: 'email',
        category: 'transport/arrival-details',
        documentType: 'transport/arrival-details',
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

// Keep or strip a {if NAME …}…{endif} (or {end_if}) block. Non-nested, dotall.
// Tolerates trailing words like "{if outbound requested}".
function applyCond(html: string, name: string, keep: boolean): string {
  const re = new RegExp('\\{if\\s+' + name + '[^}]*\\}([\\s\\S]*?)\\{(?:endif|end_if)\\}', 'gi');
  return html.replace(re, keep ? '$1' : '');
}

// Render the arrival-details email. Directional: only the pending transfer
// side(s) are shown — inbound (pickup) and/or outbound (dropoff) — so an
// inbound-only student never sees the outbound ask, and an outbound-only
// student never sees the inbound ask. Both pending → one email lists both
// (the common case; they'll fill both in the account at once).
export function renderArrival(htmlTemplate: string, opts: { firstName: string; inbound: boolean; outbound: boolean }): string {
  let html = htmlTemplate;
  html = applyCond(html, 'inbound', opts.inbound);
  html = applyCond(html, 'outbound', opts.outbound);
  html = html.replace(/\{\{\s*student\.first_name\s*\}\}/g, esc(opts.firstName || 'Student'));
  return html;
}

// Earliest service start = min(course starts, active-accom start). @db.Date → UTC midnight.
function earliestServiceStart(booking: any): Date | null {
  const ts: number[] = [];
  for (const c of booking?.courses || []) if (c?.startDate) ts.push(new Date(c.startDate).getTime());
  for (const a of booking?.accommodations || []) if (a?.startDate) ts.push(new Date(a.startDate).getTime());
  return ts.length ? new Date(Math.min(...ts)) : null;
}

// Latest service end = max(course ends, active-accom end) — the DEPARTURE window
// a drop-off (outbound) transfer keys off. A pickup keys off arrival (start); a
// drop-off keys off when they actually leave.
function latestServiceEnd(booking: any): Date | null {
  const ts: number[] = [];
  for (const c of booking?.courses || []) if (c?.endDate) ts.push(new Date(c.endDate).getTime());
  for (const a of booking?.accommodations || []) if (a?.endDate) ts.push(new Date(a.endDate).getTime());
  return ts.length ? new Date(Math.max(...ts)) : null;
}

// Don't chase a return-flight detail more than this many days before departure —
// students rarely have return flights booked months out, and doing so just spams
// them (Lavdim Dobra, Sept 2026: chased for a December return flight 3 months early).
const OUTBOUND_LEAD_DAYS = 28;

async function main() {
  const dry = process.argv.includes('--dry');
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool as any) });

  try {
    const now = new Date();
    const todayUTC = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
    console.log(`[${now.toISOString()}] transfer-reminders${dry ? ' (DRY RUN)' : ''} — building cohort…`);

    const tpl = await loadArrivalTemplate(prisma);

    const rows = (await prisma.bookingExtra.findMany({
      where: {
        active: true,
        // NB: not `scheduledAt: null` — a UTC-midnight placeholder also means
        // "time not known" and must still be chased. Filtered below with the
        // shared isUnsetSchedule() rule so the chase and the flight-seed agree.
        extraType: { in: ['AIRPORT_PICKUP', 'AIRPORT_DROPOFF'] },
        booking: { status: { not: 'CANCELLED' } },
      },
      select: {
        id: true, extraType: true, scheduledAt: true, arrivalReminderSentAt: true, arrivalReminderCount: true,
        booking: {
          select: {
            id: true, studentId: true,
            student: { select: { id: true, firstName: true, email: true } },
            courses: { select: { startDate: true, endDate: true } },
            accommodations: { where: { active: true }, select: { startDate: true, endDate: true } },
          },
        },
      },
    })).filter((r: any) => isUnsetSchedule(r.scheduledAt));

    // Keep only future-start transfers, then group by student. ONE email per
    // student no matter how many transfers are missing (Neil): inbound/outbound
    // are folded into a single directional email, never two separate chases.
    type Grp = { studentId: number; firstName: string; email: string | null; bookingId: number; extraIds: number[]; earliest: Date; lastSent: Date | null; count: number; inbound: boolean; outbound: boolean };
    const byStudent = new Map<number, Grp>();
    for (const r of rows) {
      if (!r.booking) continue;   // group-level transfers (no member booking) aren't student-chased here
      const isPickup = r.extraType === 'AIRPORT_PICKUP';
      // Reference date = the deadline this transfer keys off. Pickup ← ARRIVAL
      // (earliest service start); drop-off ← DEPARTURE (latest service end). A
      // drop-off is also gated to a lead window before departure so we don't
      // chase a return flight the student hasn't booked yet.
      const ref = isPickup ? earliestServiceStart(r.booking) : latestServiceEnd(r.booking);
      if (!ref || ref.getTime() < todayUTC.getTime()) continue;   // past — water under the bridge
      if (!isPickup) {
        const daysToDeparture = Math.round((ref.getTime() - todayUTC.getTime()) / 86400000);
        if (daysToDeparture > OUTBOUND_LEAD_DAYS) continue;        // too early to ask for the return flight
      }
      const sid = r.booking.studentId;
      if (sid == null) continue;
      const g = byStudent.get(sid);
      if (!g) {
        byStudent.set(sid, {
          studentId: sid,
          firstName: r.booking.student?.firstName || 'Student',
          email: r.booking.student?.email || null,
          bookingId: r.booking.id,
          extraIds: [r.id],
          earliest: ref,
          lastSent: r.arrivalReminderSentAt,
          count: r.arrivalReminderCount || 0,
          inbound: isPickup,
          outbound: !isPickup,
        });
      } else {
        g.extraIds.push(r.id);
        if (ref.getTime() < g.earliest.getTime()) g.earliest = ref;   // soonest pending deadline drives cadence
        if (r.arrivalReminderSentAt && (!g.lastSent || r.arrivalReminderSentAt > g.lastSent)) g.lastSent = r.arrivalReminderSentAt;
        g.count = Math.max(g.count, r.arrivalReminderCount || 0);
        if (isPickup) g.inbound = true; else g.outbound = true;
      }
    }

    console.log(`  cohort: ${byStudent.size} student(s) with a dateless future transfer`);
    let sent = 0, skippedThrottle = 0, skippedNoEmail = 0;

    for (const g of byStudent.values()) {
      const daysToStart = Math.round((g.earliest.getTime() - todayUTC.getTime()) / 86400000);
      const intervalDays = daysToStart <= 7 ? 1 : 7;   // daily in arrival week, else weekly
      // 1h grace so a once-daily cron never skips a scheduled day on drift.
      const due = !g.lastSent || (now.getTime() - g.lastSent.getTime()) >= intervalDays * 86400000 - 60 * 60 * 1000;
      if (!due) { skippedThrottle++; continue; }
      if (!isValidEmail(g.email)) {
        skippedNoEmail++;
        console.log(`  · SKIP ${g.firstName} (student ${g.studentId}) — no valid email`);
        continue;
      }

      const dir = [g.inbound && 'in', g.outbound && 'out'].filter(Boolean).join('+');
      const label = `${g.firstName} (student ${g.studentId}) [${dir}] start=${g.earliest.toISOString().slice(0, 10)} in ${daysToStart}d · every ${intervalDays}d · reminder #${g.count + 1}`;
      if (dry) { console.log(`  · WOULD SEND → ${label}`); sent++; continue; }

      try {
        await sendStudentEmail(prisma, {
          from: SUCCESS_FROM,
          fromName: 'ULearn Success Team',
          to: g.email!,
          subject: tpl.subject || DEFAULT_SUBJECT,
          html: renderArrival(tpl.htmlTemplate, { firstName: g.firstName, inbound: g.inbound, outbound: g.outbound }),
          studentId: g.studentId,
          bookingId: g.bookingId,
          templateId: tpl.id,
          sentBy: 'cron:transfer-reminders',
        });
        await prisma.bookingExtra.updateMany({
          where: { id: { in: g.extraIds } },
          data: { arrivalReminderSentAt: now, arrivalReminderCount: { increment: 1 } },
        });
        sent++;
        console.log(`  · SENT → ${label}`);
      } catch (e: any) {
        console.error(`  · FAILED ${g.firstName} (student ${g.studentId}):`, e?.message || e);
      }
    }

    console.log(`[${new Date().toISOString()}] done — ${sent} sent, ${skippedThrottle} throttled, ${skippedNoEmail} no-email`);
  } catch (e) {
    console.error('transfer-reminders cron error:', e);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

if (require.main === module) main();
