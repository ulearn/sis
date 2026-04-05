import { PrismaClient } from '../generated/prisma/client';

/**
 * Host Payment Calculation
 *
 * Runs every Monday at 03:00 GMT (via cron).
 *
 * Rules:
 * 1. Hosts are paid retrospectively every 2 weeks — student must have stayed >= 14 days
 *    since their last paid-up-to date (or placement start if never paid).
 * 2. Hosts are paid when a student has left — if the accommodation end date has passed
 *    and there's any unpaid balance, the remaining amount is settled regardless of duration.
 *
 * The weekly rate comes from the provider's weeklyRate field.
 * Partial weeks (on checkout settlements) are calculated pro-rata (daily = weeklyRate / 7).
 */

export function hostPaymentScripts(prisma: PrismaClient) {

  async function calculatePaymentRun(runDate: Date) {
    const runDateStr = runDate.toISOString().split('T')[0];

    // If a pending (unapproved) run exists for this date, replace it
    // Approved/paid runs are kept — their line items are treated as already paid
    const existingPending = await prisma.hostPaymentRun.findFirst({
      where: { runDate: new Date(runDateStr), status: 'pending' },
    });
    if (existingPending) {
      await prisma.hostPaymentLineItem.deleteMany({ where: { runId: existingPending.id } });
      await prisma.hostPaymentRun.delete({ where: { id: existingPending.id } });
    }

    // Get all active placements (bed assigned) for Host Family providers
    const placements = await prisma.bookingAccommodation.findMany({
      where: {
        active: true,
        bedId: { not: null },
      },
      include: {
        booking: {
          include: {
            student: { select: { id: true, firstName: true, lastName: true } },
          },
        },
        bed: {
          include: {
            room: {
              include: {
                property: {
                  include: {
                    provider: { select: { id: true, name: true, weeklyRate: true, type: true } },
                  },
                },
              },
            },
          },
        },
      },
    });

    // Filter to Host Family only
    const hostPlacements = placements.filter(p => p.bed?.room?.property?.provider?.type === 'Host Family');

    // What's already been paid? Only look at approved/paid runs.
    const paidUpToMap: Record<number, Date> = {};
    const approvedRunIds = (await prisma.hostPaymentRun.findMany({
      where: { status: { in: ['approved', 'paid'] } },
      select: { id: true },
    })).map(r => r.id);

    if (approvedRunIds.length) {
      const paid = await prisma.hostPaymentLineItem.findMany({
        where: { runId: { in: approvedRunIds } },
        select: { bookingAccommodationId: true, periodTo: true },
        orderBy: { periodTo: 'desc' },
      });
      for (const li of paid) {
        if (!paidUpToMap[li.bookingAccommodationId] || li.periodTo > paidUpToMap[li.bookingAccommodationId]) {
          paidUpToMap[li.bookingAccommodationId] = li.periodTo;
        }
      }
    }

    const lineItems: Array<{
      providerId: number;
      bookingAccommodationId: number;
      studentName: string;
      providerName: string;
      weeksPaid: number;
      daysPaid: number;
      weeklyRate: number;
      amount: number;
      reason: string;
      periodFrom: string;
      periodTo: string;
    }> = [];

    const now = runDate;

    for (const p of hostPlacements) {
      const provider = p.bed!.room!.property!.provider!;
      const student = p.booking?.student;
      if (!student || !provider.weeklyRate) continue;

      const rate = Number(provider.weeklyRate);
      const startDate = new Date(p.startDate);
      const endDate = new Date(p.endDate);
      const paidUpTo = paidUpToMap[p.id] ? new Date(paidUpToMap[p.id]) : null;
      const unpaidFrom = paidUpTo ? new Date(paidUpTo.getTime() + 86400000) : startDate; // day after last paid

      const studentName = `${student.firstName} ${student.lastName}`;
      const providerName = provider.name;

      // Has the student left? (end date is before run date)
      const hasLeft = endDate < now;

      if (hasLeft) {
        // RULE 2: Student has left — settle any remaining balance
        const totalDays = Math.max(0, Math.ceil((endDate.getTime() - unpaidFrom.getTime()) / 86400000) + 1);
        if (totalDays <= 0) continue; // already fully paid

        const fullWeeks = Math.floor(totalDays / 7);
        const remainderDays = totalDays % 7;
        const amount = Math.round(((fullWeeks * rate) + (remainderDays * rate / 7)) * 100) / 100;

        lineItems.push({
          providerId: provider.id,
          bookingAccommodationId: p.id,
          studentName, providerName,
          weeksPaid: fullWeeks,
          daysPaid: remainderDays,
          weeklyRate: rate,
          amount,
          reason: 'checkout',
          periodFrom: unpaidFrom.toISOString().split('T')[0],
          periodTo: endDate.toISOString().split('T')[0],
        });
      } else {
        // RULE 1: Student still here — pay if >= 14 days unpaid
        const daysUnpaid = Math.ceil((now.getTime() - unpaidFrom.getTime()) / 86400000);
        if (daysUnpaid < 14) continue; // not yet 2 weeks

        const payableWeeks = Math.floor(daysUnpaid / 7);
        // Only pay in multiples of 2 weeks (fortnightly)
        const fortnights = Math.floor(payableWeeks / 2);
        if (fortnights < 1) continue;

        const weeksToPay = fortnights * 2;
        const amount = Math.round(weeksToPay * rate * 100) / 100;
        const periodTo = new Date(unpaidFrom);
        periodTo.setDate(periodTo.getDate() + (weeksToPay * 7) - 1);

        lineItems.push({
          providerId: provider.id,
          bookingAccommodationId: p.id,
          studentName, providerName,
          weeksPaid: weeksToPay,
          daysPaid: 0,
          weeklyRate: rate,
          amount,
          reason: 'fortnightly',
          periodFrom: unpaidFrom.toISOString().split('T')[0],
          periodTo: periodTo.toISOString().split('T')[0],
        });
      }
    }

    if (lineItems.length === 0) {
      return { run: null, message: 'No payments due for ' + runDateStr, created: false, lineItems: [] };
    }

    const totalAmount = lineItems.reduce((sum, li) => sum + li.amount, 0);

    // Create the payment run
    const run = await prisma.hostPaymentRun.create({
      data: {
        runDate: new Date(runDateStr),
        totalAmount: Math.round(totalAmount * 100) / 100,
        lineItems: {
          create: lineItems.map(li => ({
            providerId: li.providerId,
            bookingAccommodationId: li.bookingAccommodationId,
            studentName: li.studentName,
            providerName: li.providerName,
            weeksPaid: li.weeksPaid,
            daysPaid: li.daysPaid || 0,
            weeklyRate: li.weeklyRate,
            amount: li.amount,
            reason: li.reason,
            periodFrom: new Date(li.periodFrom),
            periodTo: new Date(li.periodTo),
          })),
        },
      },
      include: { lineItems: true },
    });

    return { run, message: `Created payment run: ${lineItems.length} line items, €${totalAmount.toFixed(2)}`, created: true };
  }

  async function listPaymentRuns() {
    return prisma.hostPaymentRun.findMany({
      include: { lineItems: true },
      orderBy: { runDate: 'desc' },
      take: 20,
    });
  }

  async function getPaymentRun(id: number) {
    return prisma.hostPaymentRun.findUnique({
      where: { id },
      include: { lineItems: true },
    });
  }

  async function approveRun(id: number, approvedBy: string) {
    return prisma.hostPaymentRun.update({
      where: { id },
      data: { status: 'approved', approvedAt: new Date(), approvedBy },
    });
  }

  async function markPaid(id: number) {
    return prisma.hostPaymentRun.update({
      where: { id },
      data: { status: 'paid', paidAt: new Date() },
    });
  }

  return { calculatePaymentRun, listPaymentRuns, getPaymentRun, approveRun, markPaid };
}
