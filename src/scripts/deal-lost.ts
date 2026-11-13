/**
 * HubSpot deal → LOST: the SIS side (fins handover SIS-LOST-DEAL-HANDOVER.md, Neil 2026-11-12).
 *
 * fins' `hs-lost-hook` voids / credits the invoices, then POSTs here. Per booking on the deal:
 *   - already CANCELLED → nothing
 *   - student already in class (a class placement on this booking that has started, or attendance
 *     marked present/late since the booking began) → NOT cancelled; flagged for staff with a booking
 *     note instead — a Lost deal on a student in class is a data error a person must look at
 *   - otherwise → CANCELLED (+ status history)
 * Escrow: a held escrow row (type 'Escrow') on a lost deal is escrow released BACK to the student, so the
 * SAME row is updated to type 'Returned' (method kept as provenance, amount kept, never a second row,
 * never deleted). NOT a refund — a refund is money leaving our bank (Neil 2026-11-12); a visa refusal
 * should only ever be an escrow return. Returned rows stay out of Paid; on a visa refusal the note
 * records the €300 that comes to us.
 * Idempotent: a second call finds everything already done and changes nothing. Every change → audit_log.
 */
import type { PrismaClient } from '../generated/prisma/client';

const WHO = 'deal-lost-webhook';
const FLAG_MARK = '[Deal Lost]';

export interface DealLostInput {
  dealId: string;
  reason?: string | null;
  stage?: string | null;
  escrow?: string | null;
  invoices?: any[];
}

export function dealLostScripts(prisma: PrismaClient) {
  const audit = (entityType: string, entityId: number, field: string, oldValue: any, newValue: any) =>
    prisma.auditLog.create({ data: { entityType, entityId, action: 'update', field, oldValue: oldValue == null ? null : String(oldValue), newValue: newValue == null ? null : String(newValue), userId: WHO } });

  async function inClass(booking: { id: number; studentId: number | null; serviceStart: Date | null }) {
    const today = new Date();
    const placed = await prisma.studentClassAssignment.count({
      where: { bookingCourse: { bookingId: booking.id }, weekStart: { lte: today } },
    });
    if (placed) return true;
    if (!booking.studentId || !booking.serviceStart) return false;
    const attended = await prisma.attendance.count({
      where: { studentId: booking.studentId, status: { in: ['PRESENT', 'LATE'] as any }, occurrence: { date: { gte: booking.serviceStart, lte: today } } },
    });
    return attended > 0;
  }

  async function handle(input: DealLostInput) {
    const dealId = String(input.dealId || '').trim();
    if (!dealId) return { ok: false, error: 'dealId required', bookings: [] as any[] };
    const reason = input.reason || null;
    const refusal = /visa\s*refus/i.test(reason || '');

    const bookings = await prisma.booking.findMany({
      where: { hubspotDealId: dealId },
      select: { id: true, status: true, studentId: true, serviceStart: true, payments: { select: { id: true, type: true, amount: true, comment: true } } },
      orderBy: { id: 'asc' },
    });

    const out: any[] = [];
    for (const b of bookings) {
      const row: any = { id: b.id, from: b.status, to: b.status, escrowReturned: [] as number[] };

      // 1. Booking status
      if (b.status !== 'CANCELLED') {
        if (await inClass(b)) {
          row.flagged = 'student already in class — not cancelled, flagged for staff';
          const note = `${FLAG_MARK} HubSpot deal ${dealId} went to Lost${reason ? ` (${reason})` : ''} on ${new Date().toISOString().slice(0, 10)}, but this student has already started classes, so the booking was NOT cancelled. Check the deal and the booking.`;
          const existing = await prisma.entityNote.findUnique({ where: { entityType_entityId: { entityType: 'financial', entityId: b.id } } });
          if (!existing) {
            await prisma.entityNote.create({ data: { bookingId: b.id, entityType: 'financial', entityId: b.id, body: note, createdBy: WHO } });
            await audit('booking', b.id, 'note', null, note);
          } else if (!existing.body.includes(FLAG_MARK)) {
            await prisma.entityNote.update({ where: { id: existing.id }, data: { body: `${existing.body}\n\n${note}` } });
            await audit('booking', b.id, 'note', null, note);
          }
        } else {
          await prisma.booking.update({ where: { id: b.id }, data: { status: 'CANCELLED' as any, confirmed: false } as any });
          await prisma.bookingStatusHistory.create({ data: { bookingId: b.id, fromStatus: b.status as any, toStatus: 'CANCELLED' as any, changedBy: WHO } });
          await audit('booking', b.id, 'status', b.status, 'CANCELLED');
          row.to = 'CANCELLED';
        }
      }

      // 2. Escrow: the held row becomes the returned row (same row, type only + a note)
      for (const p of b.payments.filter(p => p.type === 'Escrow')) {
        const stamp = `Escrow released back to the student: deal Lost${reason ? ` (${reason})` : ''} ${new Date().toISOString().slice(0, 10)}${refusal ? '; €300 to ULearn (visa refusal)' : ''}.`;
        await prisma.payment.update({ where: { id: p.id }, data: { type: 'Returned', comment: p.comment ? `${p.comment}\n${stamp}` : stamp } });
        await audit('payment', p.id, 'type', 'Escrow', 'Returned');
        row.escrowReturned.push(p.id);
      }
      out.push(row);
    }

    const changed = out.filter(r => r.from !== r.to || r.escrowReturned.length || r.flagged).length;
    console.log(`[Deal Lost] deal ${dealId} (${reason || 'no reason'}): ${bookings.length} booking(s), ${changed} changed — ${JSON.stringify(out)}`);
    return { ok: true, dealId, reason, bookings: out };
  }

  return { handle };
}
