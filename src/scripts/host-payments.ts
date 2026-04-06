import { PrismaClient } from '../generated/prisma/client';
import { getAuthedXero } from './xero';

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

  // Build the BIC/IBAN Xero account number format
  function xeroAccountNumber(bic: string | null, iban: string | null): string | null {
    if (!iban) return null;
    // Format: BIC/IBAN — if no BIC, just IBAN
    return bic ? `${bic}/${iban}` : iban;
  }

  // Submit a single line item as a Bill to Xero
  async function submitBillToXero(lineItemId: number) {
    const li = await prisma.hostPaymentLineItem.findUnique({ where: { id: lineItemId } });
    if (!li) throw new Error('Line item not found');

    const run = await prisma.hostPaymentRun.findUnique({ where: { id: li.runId } });
    if (!run) throw new Error('Payment run not found');

    const provider = await prisma.accommodationProvider.findUnique({
      where: { id: li.providerId },
      select: { name: true, email: true, iban: true, bic: true, contactPerson: true, xeroContactId: true },
    });
    if (!provider) throw new Error('Host provider not found');

    const acctNumber = xeroAccountNumber(provider.bic || null, provider.iban || null);

    const { xero, tenantId } = await getAuthedXero();

    let contactId: string | null = provider.xeroContactId || null;

    try {
      if (!contactId) {
        // Search by email only (most reliable)
        if (provider.email) {
          const byEmail = await xero.accountingApi.getContacts(tenantId, undefined, `EmailAddress=="${provider.email}"`);
          contactId = byEmail.body.contacts?.[0]?.contactID || null;
        }
        // Search by account number (BIC/IBAN)
        if (!contactId && acctNumber) {
          const byAcct = await xero.accountingApi.getContacts(tenantId, undefined, `AccountNumber=="${acctNumber}"`);
          contactId = byAcct.body.contacts?.[0]?.contactID || null;
        }

        // Create if not found
        if (!contactId) {
          const newContact = await xero.accountingApi.createContacts(tenantId, {
            contacts: [{
              name: provider.name,
              emailAddress: provider.email || undefined,
              accountNumber: acctNumber || undefined,
              bankAccountDetails: acctNumber || undefined,
            }],
          });
          contactId = newContact.body.contacts?.[0]?.contactID || null;
          if (!contactId) throw new Error('Failed to create Xero contact');
        }

        // Save the xeroContactId for future use
        if (contactId) {
          await prisma.accommodationProvider.update({
            where: { id: li.providerId },
            data: { xeroContactId: contactId },
          });
        }
      }

      // Ensure contact is in Accomm Hosts group
      if (contactId) {
        try {
          await xero.accountingApi.createContactGroupContacts(tenantId, '3a6ef17b-42b3-48a3-94a6-db271f6824e8', {
            contacts: [{ contactID: contactId }],
          });
        } catch {} // Ignore if already in group
      }

      // Ensure account number is set on the contact
      if (contactId && acctNumber) {
        await xero.accountingApi.updateContact(tenantId, contactId, {
          contacts: [{
            contactID: contactId,
            accountNumber: acctNumber,
            bankAccountDetails: acctNumber,
          }],
        });
      }
    } catch (e: any) {
      throw new Error('Xero contact error: ' + e.message);
    }

    // Build the Bill
    const pad = (n: number) => String(n).padStart(2, '0');
    const from = new Date(li.periodFrom);
    const to = new Date(li.periodTo);
    const fromFmt = pad(from.getDate()) + '/' + pad(from.getMonth() + 1);
    const toFmt = pad(to.getDate()) + '/' + pad(to.getMonth() + 1) + '/' + to.getFullYear();
    const runDate = new Date(run.runDate);
    const dueDate = new Date(runDate);
    dueDate.setDate(dueDate.getDate() + 2); // Wednesday

    const reference = `H-${3500 + li.id}`;

    // Xero tracking category "Costs" → "Cost of Sales"
    const tracking = [{ name: 'Costs', option: 'Cost of Sales' }];

    const billLineItems: any[] = [];

    // Main stay line
    if (li.reason !== 'amendment') {
      const nights = (li.weeksPaid * 7) + (li.daysPaid || 0);
      const baseAmount = Number(li.weeksPaid) * Number(li.weeklyRate) + (li.daysPaid || 0) * Number(li.weeklyRate) / 7;
      billLineItems.push({
        description: `${li.studentName} — ${fromFmt} to ${toFmt} (${nights} nights)`,
        quantity: 1,
        unitAmount: Math.round(baseAmount * 100) / 100,
        accountCode: 'A100',
        tracking,
      });

      // Amendment on top of stay (if exists)
      if (li.amendmentNote) {
        const amendAmount = Number(li.amount) - Math.round(baseAmount * 100) / 100;
        if (Math.abs(amendAmount) > 0.01) {
          billLineItems.push({
            description: `Amendment: ${li.amendmentNote}`,
            quantity: 1,
            unitAmount: Math.round(amendAmount * 100) / 100,
            accountCode: 'A100',
        tracking,
          });
        }
      }
    } else {
      // Pure amendment
      billLineItems.push({
        description: li.amendmentNote || 'Amendment',
        quantity: 1,
        unitAmount: Number(li.amount),
        accountCode: 'A100',
        tracking,
      });
    }

    try {
      const bill = await xero.accountingApi.createInvoices(tenantId, {
        invoices: [{
          type: 'ACCPAY' as any,
          contact: { contactID: contactId },
          date: runDate.toISOString().split('T')[0],
          dueDate: dueDate.toISOString().split('T')[0],
          invoiceNumber: reference,
          reference: reference,
          status: 'SUBMITTED' as any,
          lineItems: billLineItems,
          lineAmountTypes: 'NoTax' as any,
        }],
      });

      const invoiceId = bill.body.invoices?.[0]?.invoiceID;

      // Store the Xero bill ID on the line item
      if (invoiceId) {
        await prisma.hostPaymentLineItem.update({
          where: { id: lineItemId },
          data: { xeroBillId: invoiceId },
        });
      }

      return {
        success: true,
        xeroInvoiceId: invoiceId,
        reference,
        message: `Bill created in Xero: ${reference}`,
      };
    } catch (e: any) {
      const detail = e.response?.body?.Message || e.body?.Message || e.message;
      throw new Error('Xero bill creation failed: ' + detail);
    }
  }

  // Update an existing bill in Xero
  async function updateBillInXero(lineItemId: number) {
    const li = await prisma.hostPaymentLineItem.findUnique({ where: { id: lineItemId } });
    if (!li) throw new Error('Line item not found');
    if (!li.xeroBillId) throw new Error('No Xero bill linked — submit first');

    const run = await prisma.hostPaymentRun.findUnique({ where: { id: li.runId } });
    if (!run) throw new Error('Payment run not found');

    const { xero, tenantId } = await getAuthedXero();

    const pad = (n: number) => String(n).padStart(2, '0');
    const from = new Date(li.periodFrom);
    const to = new Date(li.periodTo);
    const fromFmt = pad(from.getDate()) + '/' + pad(from.getMonth() + 1);
    const toFmt = pad(to.getDate()) + '/' + pad(to.getMonth() + 1) + '/' + to.getFullYear();
    const reference = `H-${3500 + li.id}`;
    const tracking = [{ name: 'Costs', option: 'Cost of Sales' }];

    const billLineItems: any[] = [];

    if (li.reason !== 'amendment') {
      const nights = (li.weeksPaid * 7) + (li.daysPaid || 0);
      const baseAmount = Number(li.weeksPaid) * Number(li.weeklyRate) + (li.daysPaid || 0) * Number(li.weeklyRate) / 7;
      billLineItems.push({
        description: `${li.studentName} — ${fromFmt} to ${toFmt} (${nights} nights)`,
        quantity: 1,
        unitAmount: Math.round(baseAmount * 100) / 100,
        accountCode: 'A100',
        tracking,
      });
      if (li.amendmentNote) {
        const amendAmount = Number(li.amount) - Math.round(baseAmount * 100) / 100;
        if (Math.abs(amendAmount) > 0.01) {
          billLineItems.push({
            description: `Amendment: ${li.amendmentNote}`,
            quantity: 1,
            unitAmount: Math.round(amendAmount * 100) / 100,
            accountCode: 'A100',
            tracking,
          });
        }
      }
    } else {
      billLineItems.push({
        description: li.amendmentNote || 'Amendment',
        quantity: 1,
        unitAmount: Number(li.amount),
        accountCode: 'A100',
        tracking,
      });
    }

    try {
      await xero.accountingApi.updateInvoice(tenantId, li.xeroBillId, {
        invoices: [{
          invoiceID: li.xeroBillId,
          invoiceNumber: reference,
          reference: reference,
          lineItems: billLineItems,
          lineAmountTypes: 'NoTax' as any,
        }],
      });
      return { success: true, message: `Bill updated in Xero: ${reference}` };
    } catch (e: any) {
      const detail = e.response?.body?.Message || e.body?.Message || e.message;
      throw new Error('Xero update failed: ' + detail);
    }
  }

  // Delete a bill from Xero
  async function deleteBillFromXero(lineItemId: number) {
    const li = await prisma.hostPaymentLineItem.findUnique({ where: { id: lineItemId } });
    if (!li) throw new Error('Line item not found');
    if (!li.xeroBillId) throw new Error('No Xero bill linked');

    const { xero, tenantId } = await getAuthedXero();

    try {
      // Void the invoice (Xero doesn't truly delete, it voids)
      await xero.accountingApi.updateInvoice(tenantId, li.xeroBillId, {
        invoices: [{
          invoiceID: li.xeroBillId,
          status: 'VOIDED' as any,
        }],
      });

      // Clear the bill ID from our record
      await prisma.hostPaymentLineItem.update({
        where: { id: lineItemId },
        data: { xeroBillId: null },
      });

      return { success: true, message: 'Bill voided in Xero' };
    } catch (e: any) {
      const detail = e.response?.body?.Message || e.body?.Message || e.message;
      throw new Error('Xero delete failed: ' + detail);
    }
  }

  return { calculatePaymentRun, listPaymentRuns, getPaymentRun, approveRun, markPaid, submitBillToXero, updateBillInXero, deleteBillFromXero };
}
