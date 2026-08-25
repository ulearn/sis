/**
 * One-off: merge duplicate Student #14511 into #800 (Guilherme Cavalcante da Silva).
 *
 * #800 = canonical (Fidelo origin, has CRM data, Fidelo booking 1342)
 * #14511 = duplicate created 2026-05-22 from HubSpot invoice webhook because
 *          the HubSpot contact 782949405914 had email=null so the email
 *          fallback in the webhook couldn't find #800.
 *
 * Plan:
 *   1. Cross-reference the €250 payment: add hubspotPaymentId to existing
 *      Fidelo-sourced Payment #17046 on booking 1342 (it's the same real-world
 *      money as HubSpot's Payment #17518, recorded twice).
 *   2. Move the new €1791.88 Payment #17517 from booking 17931 to booking 1342.
 *   3. Delete the duplicate €250 Payment #17518.
 *   4. Copy HubSpot identifiers (contactId, dealId) onto Student #800 and
 *      Booking #1342.
 *   5. Delete dependent rows on Booking 17931 (courses, extras, statusHistory).
 *   6. Delete Booking 17931.
 *   7. Delete Student 14511.
 *
 * Wrapped in a transaction. Idempotent only in the sense that it refuses to
 * run if #14511 no longer exists or has unexpected state.
 */
import dotenv from 'dotenv';
dotenv.config();

const DUPE_STUDENT = 14511;
const KEEP_STUDENT = 800;
const DUPE_BOOKING = 17931;
const KEEP_BOOKING = 1342;
const FIDELO_250_PAYMENT = 17046;   // existing on Fidelo side
const HUBSPOT_250_PAYMENT = 17518;  // duplicate to delete
const HUBSPOT_BIG_PAYMENT = 17517;  // €1791.88 to keep
const NEW_HS_PAYMENT_ID = '1230977791204'; // to cross-reference onto Fidelo row
const HS_CONTACT_ID = '782949405914';
const HS_DEAL_ID = '165183153372';

async function main() {
  const { Pool } = await import('pg');
  const { PrismaPg } = await import('@prisma/adapter-pg');
  const { PrismaClient } = await import('../generated/prisma/client');
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool as any) } as any);

  try {
    // Safety preflight — verify everything still looks how we expect.
    const dupe = await prisma.student.findUnique({ where: { id: DUPE_STUDENT },
      select: { id: true, firstName: true, hubspotContactId: true,
        bookings: { select: { id: true, payments: { select: { id: true, amount: true, hubspotPaymentId: true } } } } } });
    const keep = await prisma.student.findUnique({ where: { id: KEEP_STUDENT },
      select: { id: true, firstName: true, fideloContactId: true, hubspotContactId: true,
        bookings: { select: { id: true, payments: { select: { id: true, amount: true, fideloPaymentId: true } } } } } });
    if (!dupe) throw new Error(`Student ${DUPE_STUDENT} not found — nothing to merge`);
    if (!keep) throw new Error(`Student ${KEEP_STUDENT} not found — cannot merge into`);
    const dupeBooking = dupe.bookings.find(b => b.id === DUPE_BOOKING);
    const keepBooking = keep.bookings.find(b => b.id === KEEP_BOOKING);
    if (!dupeBooking) throw new Error(`Expected booking ${DUPE_BOOKING} on student ${DUPE_STUDENT}`);
    if (!keepBooking) throw new Error(`Expected booking ${KEEP_BOOKING} on student ${KEEP_STUDENT}`);

    console.log('[merge] Preflight OK. Running transaction…');

    await prisma.$transaction(async (tx) => {
      // Step A — release every unique HubSpot identifier from the dupe side
      // so we can re-attach them to the canonical records. Student.hubspotContactId,
      // Booking.hubspotDealId and Payment.hubspotPaymentId all have @unique
      // constraints.
      await tx.payment.delete({ where: { id: HUBSPOT_250_PAYMENT } });
      await tx.payment.update({
        where: { id: HUBSPOT_BIG_PAYMENT },
        data: { hubspotPaymentId: null },
      });
      await tx.booking.update({
        where: { id: DUPE_BOOKING },
        data: { hubspotDealId: null },
      });
      await tx.student.update({
        where: { id: DUPE_STUDENT },
        data: { hubspotContactId: null, hubspotDealId: null },
      });

      // Step B — assign the HubSpot identifiers to the canonical records.
      await tx.student.update({
        where: { id: KEEP_STUDENT },
        data: { hubspotContactId: HS_CONTACT_ID, hubspotDealId: HS_DEAL_ID },
      });
      await tx.booking.update({
        where: { id: KEEP_BOOKING },
        data: { hubspotDealId: HS_DEAL_ID },
      });

      // Step C — cross-reference the €250 payment (Fidelo row gains the
      // HubSpot payment id we just freed from the dupe).
      await tx.payment.update({
        where: { id: FIDELO_250_PAYMENT },
        data: { hubspotPaymentId: NEW_HS_PAYMENT_ID },
      });

      // Step D — move the new €1791.88 payment onto the canonical booking,
      // restoring its hubspotPaymentId so it stays cross-referenced.
      await tx.payment.update({
        where: { id: HUBSPOT_BIG_PAYMENT },
        data: { bookingId: KEEP_BOOKING, hubspotPaymentId: '1231029704891' },
      });

      // 5. Wipe child rows of the duplicate booking (1 course, 2 extras, 1 status history)
      await tx.bookingCourse.deleteMany({ where: { bookingId: DUPE_BOOKING } });
      await tx.bookingAccommodation.deleteMany({ where: { bookingId: DUPE_BOOKING } });
      await tx.bookingExtra.deleteMany({ where: { bookingId: DUPE_BOOKING } });
      await tx.bookingHoliday.deleteMany({ where: { bookingId: DUPE_BOOKING } });
      await tx.bookingStatusHistory.deleteMany({ where: { bookingId: DUPE_BOOKING } });
      await tx.paymentInstalment.deleteMany({ where: { bookingId: DUPE_BOOKING } });

      // 6. Delete the duplicate booking shell
      await tx.booking.delete({ where: { id: DUPE_BOOKING } });

      // 7. Delete the duplicate student
      await tx.student.delete({ where: { id: DUPE_STUDENT } });
    });

    console.log('[merge] Done.');

    // Verify
    const after = await prisma.student.findUnique({ where: { id: KEEP_STUDENT },
      select: { id: true, firstName: true, lastName: true, hubspotContactId: true, hubspotDealId: true, fideloContactId: true,
        bookings: { select: { id: true, hubspotDealId: true, fideloBookingId: true,
          payments: { select: { id: true, amount: true, paymentDate: true, fideloPaymentId: true, hubspotPaymentId: true, dataSource: true } } } } } });
    console.log(JSON.stringify(after, null, 2));
    const stillThere = await prisma.student.findUnique({ where: { id: DUPE_STUDENT }, select: { id: true } });
    if (stillThere) throw new Error(`Student ${DUPE_STUDENT} not actually deleted!`);
    console.log(`[merge] Student #${DUPE_STUDENT} deleted. Merge complete.`);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}
main().catch(e => { console.error('[merge] Fatal:', e); process.exit(1); });
