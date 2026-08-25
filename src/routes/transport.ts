/**
 * Transport — admin view + CRUD for upcoming pickup/dropoff jobs.
 * Mounted at /sis/api/transport.
 *
 * V1 surfaces BookingExtra rows of type AIRPORT_PICKUP / AIRPORT_DROPOFF
 * within the next 4 calendar weeks. Staff create new rows manually from
 * the Transport admin view (Fidelo import doesn't carry flight datetimes).
 * Each create fires a Slack notification to #student-success so Antonella
 * can book the taxi in Link's UI.
 *
 * Future versions will also surface group bus bookings and activity
 * shuttles — see .claude/docs/ToDo.md → Transport.
 */
import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { PrismaClient } from '../generated/prisma/client';
import { postSlackMessage } from '../lib/slack';
import { sendEmail } from '../scripts/email';
import { combineFlightDateTime, isUnsetSchedule } from '../lib/transport-sync';

const ALLOWED_KINDS = ['AIRPORT_PICKUP', 'AIRPORT_DROPOFF'] as const;
// Outbound collection lead time: 3h airport check-in + ~1h travel from a Dublin
// city/suburb address. A starting point for staff (Neil 2026-07-20) — the real
// journey time depends on the accommodation, so it stays editable.
const DROPOFF_LEAD_MINUTES = 240;
type TransferKind = typeof ALLOWED_KINDS[number];

export function transportRoutes(prisma: PrismaClient) {
  const router = Router();

  // ── List jobs in a window ──────────────────────
  // Default: from last Monday → +4 weeks (matches the cleaning queue
  // pattern — gives the previous-week's last weekend a few days of
  // visibility). Caller can pass `from` / `to` ISO dates to navigate
  // historically. `to` is inclusive.
  router.get('/upcoming', async (req, res) => {
    try {
      const today = new Date(); today.setHours(0, 0, 0, 0);
      const thisMon = new Date(today);
      thisMon.setDate(thisMon.getDate() + (thisMon.getDay() === 0 ? -6 : 1 - thisMon.getDay()));
      thisMon.setHours(0, 0, 0, 0);
      const defaultFrom = new Date(thisMon); defaultFrom.setDate(defaultFrom.getDate() - 7);
      const defaultTo = new Date(today.getTime() + 28 * 24 * 60 * 60 * 1000);

      const from = req.query.from ? new Date(String(req.query.from)) : defaultFrom;
      const to = req.query.to ? new Date(String(req.query.to)) : defaultTo;
      if (isNaN(from.getTime()) || isNaN(to.getTime())) {
        return res.status(400).json({ success: false, error: 'invalid from/to' });
      }

      const rows = await prisma.bookingExtra.findMany({
        where: {
          active: true,
          extraType: { in: [...ALLOWED_KINDS] },
          scheduledAt: { gte: from, lte: to },
          // Lifted from accommodation getUnplacedStudents — same payment-tier
          // contract everywhere:
          //   - paid <= 0  → hidden (don't spend on a taxi for someone who
          //                  hasn't paid us anything; they're adults, they can
          //                  grab one themselves)
          //   - ESCROW     → hidden (money in TM not BoI, treat as unpaid)
          //   - CANCELLED  → hidden
          //   - visa pending/appeal → hidden (can't fly yet)
          //   - partial    → surfaced + tagged so UI paints orange + locks
          //                  the Book-Taxi action for non-admin/DOS
          //   - paid       → surfaced normally
          booking: {
            amountPaid: { gt: 0 },
            status: { notIn: ['ESCROW', 'CANCELLED'] },
            student: { is: { OR: [
              { visaStatus: null },
              { visaStatus: { notIn: ['Pending', 'Appeal'] } },
            ]}},
          },
        },
        orderBy: { scheduledAt: 'asc' },
        select: extraSelect(),
      });

      res.json({ success: true, items: rows.map(serialise) });
    } catch (e) {
      res.status(500).json({ success: false, error: String(e) });
    }
  });

  // ── Date TBC — booked transfers with NO arrival datetime yet ──────
  // The gap Antonella can't see: an airport pickup/dropoff has been booked and
  // paid for, but nobody has told us WHEN (no scheduledAt), so it never enters
  // the weekly queue above. We surface every such transfer whose booking's
  // EARLIEST service start (accom or course) is today-or-later — a past start
  // is water under the bridge (done/failed), no point chasing it. Not week-
  // shifted: these have no date to bucket, so it's one fixed list, most-urgent
  // (soonest arrival window) first. Non-cancelled only; payment/visa status is
  // tagged, not filtered — the whole point is total visibility for the chase.
  router.get('/tbc', async (req, res) => {
    try {
      const now = new Date();
      const todayUTC = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
      const rows = await prisma.bookingExtra.findMany({
        where: {
          active: true,
          scheduledAt: null,
          extraType: { in: [...ALLOWED_KINDS] },
          booking: { status: { not: 'CANCELLED' } },
        },
        select: extraSelect(),
      });
      const items = rows
        .map((r: any) => {
          const start = earliestServiceStart(r.booking);
          return { ...serialise(r), earliestServiceStart: start };
        })
        .filter(it => it.earliestServiceStart && it.earliestServiceStart.getTime() >= todayUTC.getTime())
        .sort((a, b) => a.earliestServiceStart!.getTime() - b.earliestServiceStart!.getTime());
      res.json({ success: true, items });
    } catch (e) {
      res.status(500).json({ success: false, error: String(e) });
    }
  });

  // ── Booking lookup (autocomplete for the New-job modal) ──
  router.get('/booking-search', async (req, res) => {
    const q = String(req.query.q || '').trim();
    if (q.length < 2) return res.json({ success: true, items: [] });
    try {
      const rows = await prisma.booking.findMany({
        where: {
          student: {
            OR: [
              { firstName: { contains: q, mode: 'insensitive' } },
              { lastName: { contains: q, mode: 'insensitive' } },
            ],
          },
        },
        orderBy: { serviceStart: 'desc' },
        take: 20,
        select: {
          id: true, serviceStart: true, serviceEnd: true,
          student: { select: { id: true, firstName: true, lastName: true } },
        },
      });
      res.json({
        success: true,
        items: rows.map(b => ({
          id: b.id,
          studentName: `${b.student?.firstName ?? ''} ${b.student?.lastName ?? ''}`.trim(),
          serviceStart: b.serviceStart,
          serviceEnd: b.serviceEnd,
        })),
      });
    } catch (e) {
      res.status(500).json({ success: false, error: String(e) });
    }
  });

  // ── Create job (POST) ──────────────────────────
  router.post('/', async (req, res) => {
    const { bookingId, kind, scheduledAt, details, fee } = req.body || {};
    if (!bookingId || !Number.isInteger(Number(bookingId))) {
      return res.status(400).json({ success: false, error: 'bookingId is required' });
    }
    if (!ALLOWED_KINDS.includes(kind)) {
      return res.status(400).json({ success: false, error: `kind must be one of ${ALLOWED_KINDS.join(', ')}` });
    }
    if (!scheduledAt) {
      return res.status(400).json({ success: false, error: 'scheduledAt is required' });
    }
    const when = new Date(scheduledAt);
    if (isNaN(when.getTime())) {
      return res.status(400).json({ success: false, error: 'scheduledAt is not a valid datetime' });
    }
    try {
      const extra = await prisma.bookingExtra.create({
        data: {
          bookingId: Number(bookingId),
          extraType: kind,
          scheduledAt: when,
          details: details || null,
          fee: fee != null ? fee : null,
          active: true,
        },
        select: extraSelect(),
      });
      // Slack — best-effort, never blocks the response
      notifySlack(extra).catch(e => console.error('[transport] slack notify failed:', e));
      res.json({ success: true, item: serialise(extra) });
    } catch (e) {
      res.status(500).json({ success: false, error: String(e) });
    }
  });

  // ── Update job (PATCH) ─────────────────────────
  router.patch('/:id', async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ success: false, error: 'invalid id' });
    const data: any = {};
    if (req.body.scheduledAt) {
      const d = new Date(req.body.scheduledAt);
      if (!isNaN(d.getTime())) data.scheduledAt = d;
    }
    if (req.body.kind && ALLOWED_KINDS.includes(req.body.kind)) data.extraType = req.body.kind;
    if (req.body.details !== undefined) data.details = req.body.details || null;
    if (req.body.lynkDetails !== undefined) data.lynkDetails = req.body.lynkDetails || null;
    if (req.body.fee !== undefined) data.fee = req.body.fee;
    if (req.body.terminalOverride !== undefined) {
      const t = String(req.body.terminalOverride || '').toUpperCase();
      data.terminalOverride = (t === 'T1' || t === 'T2') ? t : null;
    }
    try {
      // "Taxi booked" is a transition — only stamp the timestamp when it first
      // flips on (so re-saving the job doesn't reset when it was booked).
      if (req.body.taxiBooked !== undefined) {
        const cur = await prisma.bookingExtra.findUnique({ where: { id }, select: { taxiBookedAt: true } });
        if (req.body.taxiBooked) {
          if (!cur?.taxiBookedAt) { data.taxiBookedAt = new Date(); data.taxiBookedBy = req.session?.user || 'admin'; }
        } else {
          data.taxiBookedAt = null; data.taxiBookedBy = null;
        }
      }
      const extra = await prisma.bookingExtra.update({
        where: { id }, data, select: extraSelect(),
      });
      res.json({ success: true, item: serialise(extra) });
    } catch (e) {
      res.status(500).json({ success: false, error: String(e) });
    }
  });

  // ── Notify: email the confirmation to student and/or agent (POST /:id/send-email) ──
  // Body: { student?:bool (default true), agent?:bool (default false) }. Sending
  // to the student also publishes the transfer to the student app (✓ Confirmed).
  // The same reviewed email goes to both; the agent copy sends from partners@.
  router.post('/:id/send-email', async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ success: false, error: 'invalid id' });
    const notifyStudent = req.body?.student !== false;   // default on
    const notifyAgent   = req.body?.agent === true;      // default off
    const validEmail = (e?: string | null) => !!e && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e);
    try {
      const extra = await prisma.bookingExtra.findUnique({ where: { id }, select: extraSelect() });
      if (!extra) return res.status(404).json({ success: false, error: 'Not found' });
      const s = serialise(extra);
      if (!s.taxiBookedAt) {
        return res.status(400).json({ success: false, error: 'Mark the taxi as booked with Lynk before notifying' });
      }
      if (!s.structuredReady) {
        return res.status(400).json({ success: false, error: 'Missing flight number / arrival time — add them on the student detail page first' });
      }
      if (!notifyStudent && !notifyAgent) {
        return res.status(400).json({ success: false, error: 'Pick at least one recipient' });
      }

      // Use the admin's edited subject/body if the Send dialog sent them back;
      // otherwise fall back to the freshly-built structured email.
      const built = buildTransportEmail(s, req.session?.displayName);
      const subject = (typeof req.body?.subject === 'string' && req.body.subject.trim())
        ? req.body.subject.trim() : built.subject;
      const html = (typeof req.body?.html === 'string' && req.body.html.trim())
        ? req.body.html : built.html;
      const attachments = built.attachments;
      const senderName  = req.session?.displayName || 'ULearn Success Team';
      const sentBy = req.session?.user || senderName;
      const results: Record<string, { status: string; to?: string | null; reason?: string }> = {};

      // ── Student — also publishes to the app on success ──
      if (notifyStudent) {
        if (!validEmail(s.studentEmail)) {
          results.student = { status: 'skipped', to: s.studentEmail, reason: 'no valid student email' };
        } else {
          await sendEmail({
            from: process.env.SUCCESS_FROM_EMAIL || 'success@ulearnschool.com',
            fromName: 'ULearn Success Team',
            to: s.studentEmail!, subject, html, attachments,
          });
          results.student = { status: 'sent', to: s.studentEmail };
        }
      }

      // ── Agent (agency on the booking) ──
      if (notifyAgent) {
        if (!validEmail(s.agencyEmail)) {
          results.agent = { status: 'skipped', to: s.agencyEmail, reason: 'no valid agency email' };
        } else {
          await sendEmail({
            from: process.env.PARTNERS_FROM_EMAIL || 'partners@ulearnschool.com',
            fromName: 'ULearn Partners', to: s.agencyEmail!, subject, html, attachments,
          });
          results.agent = { status: 'sent', to: s.agencyEmail };
        }
      }

      // Stamp: emailSentAt when anyone was emailed; publish to app when the
      // student was actually notified (so the app card shows ✓ Confirmed).
      const anySent = Object.values(results).some(r => r.status === 'sent');
      const studentSent = results.student?.status === 'sent';
      const data: any = {};
      if (anySent) { data.emailSentAt = new Date(); data.emailSentBy = sentBy; }
      if (studentSent && !s.publishedAt) { data.publishedAt = new Date(); data.publishedBy = sentBy; }
      const updated = Object.keys(data).length
        ? await prisma.bookingExtra.update({ where: { id }, data, select: extraSelect() })
        : extra;
      res.json({ success: true, results, item: serialise(updated) });
    } catch (e) {
      res.status(500).json({ success: false, error: String(e) });
    }
  });

  // ── Preview the email body (GET /:id/email-preview) ──
  // Returns rendered HTML the admin can review before pressing send.
  router.get('/:id/email-preview', async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).send('invalid id');
    try {
      const extra = await prisma.bookingExtra.findUnique({ where: { id }, select: extraSelect() });
      if (!extra) return res.status(404).send('Not found');
      const s = serialise(extra);
      const { subject, html } = buildTransportEmail(s, req.session?.displayName);
      // Return the job too so the Send dialog can render its verify-checklist.
      res.json({ success: true, subject, html, to: s.studentEmail, job: s });
    } catch (e) {
      res.status(500).json({ success: false, error: String(e) });
    }
  });

  // ── Publish to student app (POST /:id/publish) ──
  // Sets publishedAt — this is the explicit "Send to app" action that
  // surfaces the transfer as ✓ Confirmed in the student's mobile portal.
  // Distinct from emailSentAt (which records the formal email to the
  // student); admins typically email first, then publish to app.
  router.post('/:id/publish', async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ success: false, error: 'invalid id' });
    try {
      const cur = await prisma.bookingExtra.findUnique({ where: { id }, select: extraSelect() });
      if (!cur) return res.status(404).json({ success: false, error: 'Not found' });
      const s = serialise(cur);
      if (!s.taxiBookedAt) {
        return res.status(400).json({ success: false, error: 'Mark the taxi as booked with Lynk before publishing to the app' });
      }
      if (!s.structuredReady) {
        return res.status(400).json({ success: false, error: 'Missing flight number / arrival time — add them on the student detail page first' });
      }
      const sentBy = req.session?.user || 'admin';
      const updated = await prisma.bookingExtra.update({
        where: { id },
        data: { publishedAt: new Date(), publishedBy: sentBy },
        select: extraSelect(),
      });
      res.json({ success: true, item: serialise(updated) });
    } catch (e) {
      res.status(500).json({ success: false, error: String(e) });
    }
  });

  router.post('/:id/unpublish', async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ success: false, error: 'invalid id' });
    try {
      const updated = await prisma.bookingExtra.update({
        where: { id },
        data: { publishedAt: null, publishedBy: null },
        select: extraSelect(),
      });
      res.json({ success: true, item: serialise(updated) });
    } catch (e) {
      res.status(500).json({ success: false, error: String(e) });
    }
  });

  // ── Soft-delete (DELETE) ───────────────────────
  router.delete('/:id', async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ success: false, error: 'invalid id' });
    try {
      await prisma.bookingExtra.update({ where: { id }, data: { active: false } });
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ success: false, error: String(e) });
    }
  });

  return router;
}

// ── helpers ──────────────────────────────────────

// ── Dublin Airport terminal derivation ──────────────────────────
// Airlines always fly into the same terminal, so the IATA prefix of the flight
// number (first 2 chars, e.g. "FR" in FR1234, "B6" in B6123) tells us T1 vs T2.
// T2 is the short explicit set (Aer Lingus, IAG carriers, US carriers, Emirates);
// EVERYTHING else at Dublin is T1. Source: dublinairport.com/flight-information/airlines.
// terminalOverride on the job wins when a codeshare / edge case needs correcting.
const T2_AIRLINES = new Set([
  'EI',  // Aer Lingus (+ Emerald-operated regional flies as EI)
  'BA',  // British Airways
  'IB', 'I2',  // Iberia / Iberia Express
  'VY',  // Vueling
  'AA',  // American
  'DL',  // Delta
  'B6',  // JetBlue
  'EK',  // Emirates
  'UA',  // United (US preclearance / US carriers → T2)
]);
const MEETING_POINTS: Record<'T1' | 'T2', string> = {
  T1: 'Dublin Airport Terminal 1, Meeting Point - Insomnia Coffee Station, T1',
  T2: 'Dublin Airport Terminal 2, Meeting Point - Yellow Sculpture In Arrivals, T2',
};

function terminalForFlight(flightNumber: string | null | undefined): 'T1' | 'T2' | null {
  if (!flightNumber) return null;
  const m = String(flightNumber).trim().toUpperCase().match(/^([A-Z0-9]{2})/);
  if (!m) return null;
  return T2_AIRLINES.has(m[1]) ? 'T2' : 'T1';
}

// "13:00" + 35 → "13:35" (24h, wraps past midnight). Null on bad input.
function addMinutesToTime(hhmm: string | null | undefined, mins: number): string | null {
  if (!hhmm) return null;
  const m = String(hhmm).trim().match(/^(\d{1,2}):(\d{2})/);
  if (!m) return null;
  let total = (parseInt(m[1], 10) * 60 + parseInt(m[2], 10) + mins) % (24 * 60);
  if (total < 0) total += 24 * 60;
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

function extraSelect() {
  return {
    id: true, extraType: true, scheduledAt: true, details: true, fee: true,
    lynkDetails: true, emailSentAt: true, emailSentBy: true,
    publishedAt: true, publishedBy: true,
    taxiBookedAt: true, taxiBookedBy: true, terminalOverride: true,
    arrivalReminderSentAt: true, arrivalReminderCount: true,
    booking: {
      select: {
        id: true, amountPaid: true, amountTotal: true, status: true,
        student: {
          select: {
            id: true, firstName: true, lastName: true, email: true, phone: true, phoneMobile: true,
            nationality: true,
            // Inbound flight (used for AIRPORT_PICKUP rows)
            flightNumber: true, flightDate: true, flightTime: true,
            // Outbound flight (used for AIRPORT_DROPOFF rows)
            outboundFlightNumber: true, outboundFlightDate: true, outboundFlightTime: true,
          },
        },
        agency: { select: { id: true, name: true, email: true } },
        // Earliest active-accom start (also feeds the "earliest service start"
        // used by the Date-TBC list).
        accommodations: {
          where: { active: true }, orderBy: { startDate: 'asc' as const }, take: 1,
          select: {
            startDate: true,
            bed: { select: { room: { select: { name: true, property: { select: { name: true, address: true, provider: { select: { address: true, addressAddon: true, city: true } } } } } } } },
          },
        },
        courses: { select: { startDate: true } },
      },
    },
  };
}

// Earliest service start for a booking = min(course starts, active-accom start).
// Booking.serviceStart alone is unreliable — it tracks the COURSE, so an accom
// that begins before the course (arrival a few days early) is missed. Returns a
// @db.Date (UTC midnight) or null.
function earliestServiceStart(booking: any): Date | null {
  const ts: number[] = [];
  for (const c of booking?.courses || []) { if (c?.startDate) ts.push(new Date(c.startDate).getTime()); }
  for (const a of booking?.accommodations || []) { if (a?.startDate) ts.push(new Date(a.startDate).getTime()); }
  return ts.length ? new Date(Math.min(...ts)) : null;
}

function serialise(r: any) {
  const st = r.booking.student;
  const isPickup = r.extraType === 'AIRPORT_PICKUP';
  // Wire in the right flight side based on the transfer type.
  // Pickup → use inbound; dropoff → use outbound. Falls back to the legacy
  // BookingExtra.details field if the structured student-record flight
  // hasn't been entered yet.
  const sideFlightNumber = isPickup ? st?.flightNumber : st?.outboundFlightNumber;
  const sideFlightDate   = isPickup ? st?.flightDate   : st?.outboundFlightDate;
  const sideFlightTime   = isPickup ? st?.flightTime   : st?.outboundFlightTime;

  // Payment-tier tagging — same shape as accommodation getUnplacedStudents
  // and classes unassignedStudents. Don't lean on amountOpen (lags in Fidelo
  // import). EPS = €0.01 wiggle for currency rounding.
  const EPS = 0.01;
  const paid  = Number(r.booking.amountPaid  || 0);
  const total = Number(r.booking.amountTotal || 0);
  let paymentStatus: 'paid' | 'partial' = 'paid';
  let paymentBalance = 0;
  if (total > 0 && (total - paid) > EPS) {
    paymentStatus = 'partial';
    paymentBalance = Math.round((total - paid) * 100) / 100;
  }

  // Terminal: manual override wins, else derive from the flight number.
  // Pickup time = arrival + 35 min (baggage + passport control); pickups only.
  const terminal = (r.terminalOverride === 'T1' || r.terminalOverride === 'T2')
    ? r.terminalOverride as 'T1' | 'T2'
    : terminalForFlight(sideFlightNumber);
  const pickupTime = isPickup ? addMinutesToTime(sideFlightTime, 35) : null;
  // The actual CAR time, derived from the flight (the fixed point). Inbound and
  // outbound are NOT symmetrical:
  //   pickup  = arrival   + 35min  (baggage + passport control)
  //   dropoff = departure − 4h     (3h check-in buffer + ~1h from accommodation)
  // Never apply the +35 to a dropoff — that would order the car after take-off.
  // Built as a full Date (not a clock string) so a pre-04:00 departure lands on
  // the PREVIOUS day instead of wrapping the clock onto the wrong date.
  const flightAt = combineFlightDateTime(sideFlightDate, sideFlightTime);
  const transferAt = flightAt
    ? new Date(flightAt.getTime() + (isPickup ? 35 : -DROPOFF_LEAD_MINUTES) * 60_000)
    : null;
  // What we actually tell the student/driver. For a pickup the flight is the
  // fixed point, so the derived arrival+35 always wins. For a DROPOFF a
  // human-set time must win — real travel time depends on the accommodation —
  // but a scheduledAt that is merely the auto-seeded flight departure (or a
  // midnight placeholder) is NOT a collection time and must never be shown as
  // one, or the student is told the car comes as their plane leaves.
  const seededToFlight = !!(flightAt && r.scheduledAt && Math.abs(+r.scheduledAt - +flightAt) < 60_000);
  const collectionAt = isPickup
    ? transferAt
    : (isUnsetSchedule(r.scheduledAt) || seededToFlight ? transferAt : r.scheduledAt);
  // Structured send is ready once we have the flight essentials + a terminal.
  const structuredReady = !!(sideFlightNumber && sideFlightTime && terminal);

  return {
    id: r.id,
    kind: r.extraType,
    scheduledAt: r.scheduledAt,
    details: r.details,
    fee: r.fee,
    lynkDetails: r.lynkDetails ?? null,
    emailSentAt: r.emailSentAt ?? null,
    emailSentBy: r.emailSentBy ?? null,
    publishedAt: r.publishedAt ?? null,
    publishedBy: r.publishedBy ?? null,
    taxiBookedAt: r.taxiBookedAt ?? null,
    taxiBookedBy: r.taxiBookedBy ?? null,
    terminalOverride: r.terminalOverride ?? null,
    terminal,
    terminalDerived: terminalForFlight(sideFlightNumber),
    meetingPoint: terminal ? MEETING_POINTS[terminal] : null,
    pickupTime,
    transferAt,
    collectionAt,
    structuredReady,
    bookingId: r.booking.id,
    student: st ? `${st.firstName ?? ''} ${st.lastName ?? ''}`.trim() : null,
    studentFirstName: st?.firstName ?? null,
    studentEmail: st?.email ?? null,
    studentPhone: st?.phoneMobile || st?.phone || null,
    studentId: st?.id ?? null,
    nationality: st?.nationality ?? null,
    flightNumber: sideFlightNumber ?? null,
    flightDate: sideFlightDate ?? null,
    flightTime: sideFlightTime ?? null,
    agency: r.booking.agency?.name ?? null,
    agencyEmail: r.booking.agency?.email ?? null,
    hasAgency: !!r.booking.agency?.id,
    // Real street address for the taxi — the household address lives on the
    // provider (address + addon + city), NOT the property name ("Main House").
    // Fall back to property.address only if the provider has no address.
    accomAddress: (() => {
      const prop = r.booking.accommodations[0]?.bed?.room?.property;
      const prov = prop?.provider;
      const joined = [prov?.address, prov?.addressAddon, prov?.city].filter(Boolean).join(', ')
        .replace(/\s+/g, ' ').replace(/(\s*,\s*)+/g, ', ').replace(/^,\s*|[,\s]+$/g, '').trim();
      return joined || prop?.address || null;
    })(),
    accomName: r.booking.accommodations[0]?.bed?.room?.property?.name ?? null,
    accomRoom: r.booking.accommodations[0]?.bed?.room?.name ?? null,
    paymentStatus,
    paymentBalance,
    bookingStatus: r.booking.status ?? null,
    reminderCount: r.arrivalReminderCount ?? 0,
    reminderSentAt: r.arrivalReminderSentAt ?? null,
  };
}

// ── Email templates ─────────────────────────────────────────────
// Two variants: PICKUP (airport → accom, short) and DROPOFF (accom →
// airport, long with Capel Street pickup-location map embedded).
// `<pre>` blocks preserve the Lynk paste exactly as Antonella received it.

function escHtml(s: string | null | undefined): string {
  if (s == null) return '';
  return String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function fmtDateTime(iso: string | Date | null): string {
  if (!iso) return 'TBC';
  const d = typeof iso === 'string' ? new Date(iso) : iso;
  return d.toLocaleString('en-IE', {
    weekday: 'long', day: '2-digit', month: 'long',
    hour: '2-digit', minute: '2-digit', hour12: false,
  });
}

function fmtTime(iso: string | Date | null): string {
  if (!iso) return 'TBC';
  const d = typeof iso === 'string' ? new Date(iso) : iso;
  return d.toLocaleString('en-IE', { hour: '2-digit', minute: '2-digit', hour12: false });
}

// Sign-off — just a name. The success@ mailbox appends the full ULearn
// signature (logo/contact) itself, so we don't duplicate it here.
function signOffHtml(senderName?: string | null): string {
  const name = (senderName || '').trim().split(/\s+/)[0] || 'Antonella';
  return `
  <p style="margin-top:24px;margin-bottom:0">Kind Regards,</p>
  <p style="margin:16px 0 0"><strong>${escHtml(name)}</strong></p>`;
}

// Flight date (@db.Date) → "Sat 4 Jul 2026". UTC methods — @db.Date is stored
// at UTC midnight, so local getters would shift a day on Dublin summer time.
function fmtFlightDate(iso: string | Date | null): string {
  if (!iso) return 'TBC';
  const d = typeof iso === 'string' ? new Date(iso) : iso;
  if (isNaN(d.getTime())) return 'TBC';
  const wd = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getUTCDay()];
  const mon = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][d.getUTCMonth()];
  return `${wd} ${d.getUTCDate()} ${mon} ${d.getUTCFullYear()}`;
}

// One row of the details table.
function emailRow(label: string, value: string | null): string {
  return `<tr>
    <td style="padding:6px 12px;border-bottom:1px solid #eee;color:#6b7280;white-space:nowrap">${escHtml(label)}</td>
    <td style="padding:6px 12px;border-bottom:1px solid #eee;font-weight:600">${escHtml(value || '—')}</td>
  </tr>`;
}

function buildTransportEmail(s: any, senderName?: string | null): { subject: string; html: string; attachments?: any[] } {
  const isPickup = s.kind === 'AIRPORT_PICKUP';
  const firstName = s.studentFirstName || s.student || 'there';
  const SIGNATURE_HTML = signOffHtml(senderName);

  if (isPickup) {
    const subject = `Your ULearn airport pickup — ${fmtFlightDate(s.flightDate)}`;
    // Auto-built from the known flight data — mirrors the Lynk confirmation.
    const detailsTable = `
      <table style="border-collapse:collapse;font-size:14px;margin:10px 0 4px">
        ${emailRow('Flight Number', s.flightNumber)}
        ${emailRow('Flight Date', fmtFlightDate(s.flightDate))}
        ${emailRow('Arrival Time', s.flightTime)}
        ${emailRow('Terminal', s.terminal)}
        ${emailRow('Pickup Time', s.pickupTime)}
        ${emailRow('Your Phone', s.studentPhone)}
      </table>`;
    const html = `
      <div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;font-size:14px;line-height:1.55;color:#1f2937">
        <p style="margin:0 0 16px">Dear ${escHtml(firstName)},</p>
        <p style="margin:0 0 16px">Your airport pickup is booked. A Lynk taxi driver will meet you after you land:</p>
        ${detailsTable}
        <p style="margin:16px 0 6px"><strong>Where to meet your driver:</strong></p>
        <div style="margin:0 0 16px;padding:12px 14px;border:2px solid #10b981;border-radius:8px;background:#f0fdf4;color:#065f46;font-weight:600">${escHtml(s.meetingPoint || 'Dublin Airport — your driver will call you on arrival.')}</div>
        <p style="margin:0 0 16px">Your pickup time is <strong>35 minutes after landing</strong> to allow for baggage &amp; passport control. The driver has your number and <strong>will call you</strong> when they arrive — please make your way to the meeting point above.</p>
        <p style="margin:0 0 16px">If any of the details above look wrong, reply to this email straight away.</p>
        <p style="margin:0 0 16px">Have a safe trip — we look forward to welcoming you to Dublin.</p>
        ${SIGNATURE_HTML}
      </div>`;
    return { subject, html };
  }

  // DROPOFF — long version with Capel St pickup location instructions + map
  const subject = `Your ULearn airport dropoff — ${fmtDateTime(s.scheduledAt)}`;
  // Flight number comes only from the student's structured outbound field —
  // no legacy BookingExtra.details fallback (send is gated on structuredReady).
  const flightNo = s.flightNumber || 'TBC';
  const departTime = s.flightTime || fmtTime(s.scheduledAt);

  // Capel Street pickup-location map — embedded as inline CID attachment so
  // it renders directly in the email body (rather than as a downloadable file).
  const mapPath = path.join(__dirname, '..', '..', '.claude', 'docs', 'transport', 'capel-staycity.png');
  const attachments: any[] = [];
  let mapImgHtml = '';
  try {
    if (fs.existsSync(mapPath)) {
      attachments.push({
        filename: 'capel-staycity-pickup-location.png',
        content: fs.readFileSync(mapPath),
        contentType: 'image/png',
      });
      mapImgHtml = `<p><img src="cid:capel-staycity-pickup-location.png" alt="Pickup location at StayCity ApartHotel, Little Mary Street" style="max-width:520px;width:100%;border:1px solid #e5e7eb;border-radius:6px"></p>`;
    }
  } catch { /* image absent — render text-only fallback */ }

  const html = `
    <div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;font-size:14px;line-height:1.55;color:#1f2937">
      <p>Dear ${escHtml(firstName)},</p>
      <p>Please see your Airport Transfer details below.</p>
      <ul style="padding-left:18px">
        <li>Your driver will arrive on <strong>${escHtml(s.collectionAt ? fmtDateTime(s.collectionAt) : 'TBC')}</strong></li>
        <li>Please be ready for your taxi</li>
        <li>You will get a telephone call when your car arrives — your driver <strong>will not knock on your door</strong></li>
        <li>Please go out onto the street at the appointed time</li>
        <li>Capel Street is pedestrian after 11am and your pickup location is <strong>outside StayCity ApartHotel on Little Mary Street</strong> (60 seconds walk from 32 Capel Street)</li>
      </ul>
      ${mapImgHtml}
      <p>Please make your way to that location for the pickup time — your driver has your number &amp; will call on arrival.</p>
      <p>The journey time to Dublin Airport is approx <strong>35–45 minutes</strong>.</p>
      <p>Your flight <strong>${escHtml(flightNo)}</strong> departs at <strong>${escHtml(departTime)}</strong>${s.terminal ? ` from <strong>Dublin Airport ${escHtml(s.terminal)}</strong>` : ''}.</p>
      <p>Have a safe trip.</p>
      ${SIGNATURE_HTML}
    </div>`;
  return { subject, html, attachments };
}

async function notifySlack(extra: any) {
  const channel = process.env.SLACK_TRANSPORT_CHANNEL || '#student-success';
  const antonellaId = process.env.SLACK_ANTONELLA_USER_ID;
  const mention = antonellaId ? `<@${antonellaId}>` : '@Antonella';
  const s = serialise(extra);
  const when = s.scheduledAt
    ? new Date(s.scheduledAt).toLocaleString('en-IE', {
        weekday: 'short', day: '2-digit', month: 'short',
        hour: '2-digit', minute: '2-digit', hour12: false,
      })
    : 'TBC';
  const kindLabel = s.kind === 'AIRPORT_PICKUP' ? '🛬 Airport pickup' : '🛫 Airport dropoff';
  const lines = [
    `${mention} new transport job for ${s.student || 'a student'}`,
    `*${kindLabel}* · ${when}`,
    s.details ? `Flight / details: ${s.details}` : '',
    s.accomName || s.accomAddress ? `Accommodation: ${s.accomName || s.accomAddress}` : '',
    `Book in Link Taxis when ready and flip status in SIS.`,
  ].filter(Boolean);
  await postSlackMessage({ channel, text: lines.join('\n') });
}
