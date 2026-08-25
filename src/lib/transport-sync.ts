/**
 * Auto-seed a transport job's arrival datetime from the student's flight.
 *
 * The Transport queue keys off BookingExtra.scheduledAt, but the flight
 * itself is entered on the Student record (flightNumber/Date/Time inbound,
 * outbound* for dropoffs). Historically nothing bridged the two, so a student
 * could have their flight fully entered and still be invisible in Transport
 * because the extra's scheduledAt was null (see Marcos Ábrego Tofé, Jul 2026).
 *
 * This fills that gap: whenever flight details are saved — or an airport extra
 * is created — we seed scheduledAt from the matching flight side.
 *
 * FILL-ONLY-IF-EMPTY (Neil, 2026-07-14): we NEVER overwrite a scheduledAt that
 * a human already set. The flight is the default; a hand-typed arrival wins.
 * Pickup ← inbound flight, dropoff ← outbound flight.
 */
import type { PrismaClient } from '../generated/prisma/client';

// Combine a @db.Date (stored at UTC midnight) with an "HH:MM" wall-clock time
// into a Dublin-local Date — matching exactly what the datetime-local UI save
// produces (new Date("YYYY-MM-DDThh:mm") on a Dublin server). Read the date's
// Y/M/D via UTC getters (it's a pure calendar date) then rebuild in local TZ.
export function combineFlightDateTime(flightDate: Date | null | undefined, flightTime: string | null | undefined): Date | null {
  if (!flightDate || !flightTime) return null;
  const m = String(flightTime).trim().match(/^(\d{1,2}):(\d{2})/);
  if (!m) return null;
  const y = flightDate.getUTCFullYear();
  const mo = flightDate.getUTCMonth();
  const d = flightDate.getUTCDate();
  return new Date(y, mo, d, parseInt(m[1], 10), parseInt(m[2], 10), 0, 0);
}

/**
 * Is this scheduledAt effectively "not known"? Null, or exactly UTC midnight
 * (a placeholder — see the note in syncArrivalFromFlight). Exported so the
 * arrival-details chase uses the identical rule.
 */
export function isUnsetSchedule(d: Date | null | undefined): boolean {
  if (!d) return true;
  return d.getUTCHours() === 0 && d.getUTCMinutes() === 0 && d.getUTCSeconds() === 0;
}

/**
 * Seed scheduledAt on this student's active airport extras that don't have one.
 * Returns the list of extras that were seeded (empty if nothing to do) so
 * callers can log it. Safe to call unconditionally after any flight write.
 */
export async function syncArrivalFromFlight(prisma: PrismaClient, studentId: number | null | undefined) {
  if (!studentId) return [];
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    select: { flightDate: true, flightTime: true, outboundFlightDate: true, outboundFlightTime: true },
  });
  if (!student) return [];

  const pickupAt  = combineFlightDateTime(student.flightDate, student.flightTime);
  const dropoffAt = combineFlightDateTime(student.outboundFlightDate, student.outboundFlightTime);
  if (!pickupAt && !dropoffAt) return [];

  const extras = await prisma.bookingExtra.findMany({
    where: {
      active: true,
      extraType: { in: ['AIRPORT_PICKUP', 'AIRPORT_DROPOFF'] },
      booking: { is: { studentId } },
    },
    select: { id: true, extraType: true, scheduledAt: true },
  });

  const seeded: Array<{ id: number; extraType: string; scheduledAt: Date }> = [];
  for (const ex of extras) {
    // "Unset" = null OR exactly UTC-midnight. Midnight is never a real transfer
    // time — it's a placeholder: the Fidelo migration seeded scheduledAt from
    // booking.serviceStart/End, and HubSpot sends a date-only pick as 00:00
    // (staff are told: leave blank, or use 00:00 for "date known, time not").
    // Treating it as unset unblocks the flight seed, which is fill-only-if-empty
    // and would otherwise be permanently skipped (see Bernardo Hughes Pimentel,
    // Jul 2026). Real seeded times are Dublin-LOCAL, so they never read as UTC
    // midnight — a genuine 00:00 local pickup is 23:00Z and is left untouched.
    if (!isUnsetSchedule(ex.scheduledAt)) continue;
    const when = ex.extraType === 'AIRPORT_PICKUP' ? pickupAt : dropoffAt;
    if (!when) continue;
    await prisma.bookingExtra.update({ where: { id: ex.id }, data: { scheduledAt: when } });
    seeded.push({ id: ex.id, extraType: ex.extraType, scheduledAt: when });
  }
  return seeded;
}
