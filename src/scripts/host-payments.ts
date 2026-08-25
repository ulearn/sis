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

  // Pull paid/voided status for any line item we previously pushed to Xero.
  // Called automatically at the top of calculatePaymentRun (so "Run Calculation"
  // is bidirectional — outbound bill generation + inbound paid-status sync).
  // Only hits Xero for line items that are still 'submitted' (unpaid), so the
  // query volume naturally shrinks as bills get paid.
  // Optional providerId narrows the sync to one host — used by the public
  // host portal on page load (Slice 3) so each host's view shows fresh
  // Paid/Open state without waiting for the Monday cron. Without it the
  // function behaves as before (whole-DB sweep at the top of every
  // calculatePaymentRun).
  async function syncXeroBillStatuses(providerId?: number) {
    const open = await prisma.hostPaymentLineItem.findMany({
      where: {
        xeroBillId: { not: null },
        OR: [{ xeroStatus: null }, { xeroStatus: 'submitted' }],
        ...(providerId ? { providerId } : {}),
      },
      select: { id: true, xeroBillId: true },
    });
    if (open.length === 0) return { checked: 0, paid: 0, voided: 0 };

    const { xero, tenantId } = await getAuthedXero();
    let paid = 0, voided = 0;
    const now = new Date();

    for (const li of open) {
      try {
        const r = await xero.accountingApi.getInvoice(tenantId, li.xeroBillId!);
        const inv: any = r.body.invoices?.[0];
        if (!inv) continue;

        if (inv.status === 'PAID') {
          await prisma.hostPaymentLineItem.update({
            where: { id: li.id },
            data: {
              xeroStatus: 'paid',
              xeroPaidAt: inv.fullyPaidOnDate ? new Date(inv.fullyPaidOnDate) : now,
              xeroAmountPaid: inv.amountPaid ?? null,
              xeroSyncedAt: now,
            },
          });
          paid++;
        } else if (inv.status === 'VOIDED' || inv.status === 'DELETED') {
          await prisma.hostPaymentLineItem.update({
            where: { id: li.id },
            data: { xeroStatus: 'voided', xeroSyncedAt: now },
          });
          voided++;
        } else {
          await prisma.hostPaymentLineItem.update({
            where: { id: li.id },
            data: { xeroStatus: 'submitted', xeroSyncedAt: now },
          });
        }
      } catch (e: any) {
        // Don't let one bad bill break the whole sync. Log + carry on.
        console.error(`syncXeroBillStatuses: failed for line ${li.id} (bill ${li.xeroBillId}):`, e?.message || e);
      }
    }
    return { checked: open.length, paid, voided };
  }

  async function calculatePaymentRun(runDate: Date) {
    // Bidirectional: refresh paid-status on already-submitted Xero bills first.
    // Best-effort — if Xero is down we still generate the new run.
    try {
      const r = await syncXeroBillStatuses();
      if (r.checked) console.log(`Xero sync: checked ${r.checked}, paid ${r.paid}, voided ${r.voided}`);
    } catch (e: any) {
      console.error('syncXeroBillStatuses failed (continuing):', e?.message || e);
    }

    const runDateStr = runDate.toISOString().split('T')[0];

    // Run Calculation is ADDITIVE — it checks for newly-due cover/stay nights,
    // it must NOT wipe work already pushed to Xero. If a pending (unapproved)
    // run exists for this date, clear only its UN-PUSHED drafts (xeroBillId is
    // null) and recompute those; line items that already have a Xero bill are
    // preserved (and their period is treated as already billed above, so they
    // won't be regenerated). Reuse the run if billed items remain; otherwise
    // drop the empty shell so a fresh one is created below.
    let reuseRunId: number | null = null;
    const existingPending = await prisma.hostPaymentRun.findFirst({
      where: { runDate: new Date(runDateStr), status: 'pending' },
    });
    if (existingPending) {
      await prisma.hostPaymentLineItem.deleteMany({
        where: { runId: existingPending.id, xeroBillId: null },
      });
      const remaining = await prisma.hostPaymentLineItem.count({ where: { runId: existingPending.id } });
      if (remaining > 0) reuseRunId = existingPending.id;
      else await prisma.hostPaymentRun.delete({ where: { id: existingPending.id } });
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

    // What's already been BILLED? Any line item that has a live Xero bill —
    // whether it's only submitted/authorised or fully bank-paid. The boundary
    // for "don't bill this again" is the existence of a Bill, NOT payment:
    // previously this looked at xeroStatus='paid' only, so a Bill created but
    // not yet paid (e.g. approved this morning, settles in 2 days) was billed
    // AGAIN on the next Run Calculation — duplicate Xero bills. Voided bills
    // are excluded so a voided period becomes billable again.
    const billedUpToMap: Record<number, Date> = {};
    const billedBills = await prisma.hostPaymentLineItem.findMany({
      where: { xeroBillId: { not: null }, NOT: { xeroStatus: 'voided' } },
      select: { bookingAccommodationId: true, periodTo: true },
      orderBy: { periodTo: 'desc' },
    });
    for (const li of billedBills) {
      if (!billedUpToMap[li.bookingAccommodationId] || li.periodTo > billedUpToMap[li.bookingAccommodationId]) {
        billedUpToMap[li.bookingAccommodationId] = li.periodTo;
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
      const paidUpTo = billedUpToMap[p.id] ? new Date(billedUpToMap[p.id]) : null;
      // periodTo already follows the checkout convention (it IS the first
      // unpaid night — the morning the student "leaves" that billing period),
      // so the next period starts exactly AT the prior periodTo, not +1 day.
      // Adding a day here skipped a night every time a continuing student hit
      // their 2nd+ invoice (e.g. paid 21 Apr→9 May = 18n, next must start 9 May
      // not 10 May, else 9 May→23 May reads as 13 nights instead of 14).
      const unpaidFrom = paidUpTo ? new Date(paidUpTo.getTime()) : startDate;

      const studentName = `${student.firstName} ${student.lastName}`;
      const providerName = provider.name;

      // Has the student left? (end date is before run date)
      const hasLeft = endDate < now;

      if (hasLeft) {
        // RULE 2: Student has left — settle any remaining balance.
        // Hotel convention: periodFrom = check-in (first night), periodTo =
        // checkout day (student leaves that morning, didn't sleep that night).
        // So nights stayed = periodTo - periodFrom (no +1, no -1).
        const totalDays = Math.max(0, Math.round((endDate.getTime() - unpaidFrom.getTime()) / 86400000));
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
        // periodTo = checkout-equivalent day (= the day after the last paid
        // night); nights covered = periodTo - periodFrom = weeksToPay * 7.
        const periodTo = new Date(unpaidFrom);
        periodTo.setDate(periodTo.getDate() + (weeksToPay * 7));

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

    const newRowData = lineItems.map(li => ({
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
    }));

    // Nothing newly due. If we're reusing a run that still holds already-billed
    // items, return it as-is (don't churn); otherwise there's genuinely nothing.
    if (lineItems.length === 0) {
      if (reuseRunId) {
        const run = await prisma.hostPaymentRun.findUnique({ where: { id: reuseRunId }, include: { lineItems: true } });
        return { run, message: 'No new payments due — existing billed items kept.', created: false, lineItems: run?.lineItems || [] };
      }
      return { run: null, message: 'No payments due for ' + runDateStr, created: false, lineItems: [] };
    }

    const newTotal = lineItems.reduce((sum, li) => sum + li.amount, 0);

    if (reuseRunId) {
      // Append the newly-due drafts to the existing run; bump its total by the
      // new amount (preserved billed items already contributed their share).
      await prisma.hostPaymentLineItem.createMany({
        data: newRowData.map(r => ({ ...r, runId: reuseRunId! })),
      });
      const agg = await prisma.hostPaymentLineItem.aggregate({ where: { runId: reuseRunId }, _sum: { amount: true } });
      await prisma.hostPaymentRun.update({
        where: { id: reuseRunId },
        data: { totalAmount: Math.round(Number(agg._sum.amount || 0) * 100) / 100 },
      });
      const run = await prisma.hostPaymentRun.findUnique({ where: { id: reuseRunId }, include: { lineItems: true } });
      return { run, message: `Added ${lineItems.length} new line item(s), €${newTotal.toFixed(2)}`, created: true };
    }

    const run = await prisma.hostPaymentRun.create({
      data: {
        runDate: new Date(runDateStr),
        totalAmount: Math.round(newTotal * 100) / 100,
        lineItems: { create: newRowData },
      },
      include: { lineItems: true },
    });

    return { run, message: `Created payment run: ${lineItems.length} line items, €${newTotal.toFixed(2)}`, created: true };
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
    // Idempotency: never create a second Xero bill for a line item that already
    // has one. Re-submitting (or a stale UI) would otherwise duplicate the Bill.
    if (li.xeroBillId) {
      throw new Error(`Already submitted to Xero (Bill H-${3500 + li.id}). Use "Update" to amend it, not re-submit.`);
    }

    const run = await prisma.hostPaymentRun.findUnique({ where: { id: li.runId } });
    if (!run) throw new Error('Payment run not found');

    const provider = await prisma.accommodationProvider.findUnique({
      where: { id: li.providerId },
      select: { name: true, email: true, iban: true, bic: true, xeroContactId: true },
    });
    if (!provider) throw new Error('Host provider not found');

    const acctNumber = xeroAccountNumber(provider.bic || null, provider.iban || null);

    const { xero, tenantId } = await getAuthedXero();

    let contactId: string | null = provider.xeroContactId || null;
    // Track WHICH step blew up so the error message names it.
    let step: string = 'init';

    try {
      if (!contactId) {
        // Search by email only (most reliable)
        if (provider.email) {
          step = 'getContacts(email)';
          const byEmail = await xero.accountingApi.getContacts(tenantId, undefined, `EmailAddress=="${provider.email}"`);
          contactId = byEmail.body.contacts?.[0]?.contactID || null;
        }
        // Search by account number (BIC/IBAN)
        if (!contactId && acctNumber) {
          step = 'getContacts(acctNumber)';
          const byAcct = await xero.accountingApi.getContacts(tenantId, undefined, `AccountNumber=="${acctNumber}"`);
          contactId = byAcct.body.contacts?.[0]?.contactID || null;
        }
        // Search by name as a last resort — catches the case where the
        // Xero contact pre-exists (different/empty email, different
        // account number format) and would otherwise collide with the
        // create call on Xero's unique-name rule (Mary Carver scenario,
        // 2026-05-19). Only takes the hit if the search returns EXACTLY
        // ONE match — multiple matches mean an ambiguous name and we'd
        // rather fail loudly than pick the wrong contact.
        if (!contactId && provider.name) {
          step = 'getContacts(name)';
          const safe = provider.name.replace(/"/g, '\\"');
          const byName = await xero.accountingApi.getContacts(tenantId, undefined, `Name=="${safe}"`);
          const matches = byName.body.contacts || [];
          if (matches.length === 1) contactId = matches[0].contactID || null;
          else if (matches.length > 1) console.warn(`[Xero] name lookup ambiguous for "${provider.name}" — ${matches.length} contacts match; skipping auto-link`);
        }

        // Create if not found
        if (!contactId) {
          step = 'createContacts';
          const newContact = await xero.accountingApi.createContacts(tenantId, {
            contacts: [{
              name: provider.name,
              emailAddress: provider.email || undefined,
              accountNumber: acctNumber || undefined,
              bankAccountDetails: acctNumber || undefined,
            }],
          });
          contactId = newContact.body.contacts?.[0]?.contactID || null;
          if (!contactId) throw new Error('createContacts returned no contactID');
        }

        // Save the xeroContactId for future use
        if (contactId) {
          step = 'prisma.update(xeroContactId)';
          await prisma.accommodationProvider.update({
            where: { id: li.providerId },
            data: { xeroContactId: contactId },
          });
        }
      }

      // Ensure contact is in Accomm Hosts group
      if (contactId) {
        try {
          step = 'createContactGroupContacts';
          await xero.accountingApi.createContactGroupContacts(tenantId, '3a6ef17b-42b3-48a3-94a6-db271f6824e8', {
            contacts: [{ contactID: contactId }],
          });
        } catch {} // Ignore if already in group
      }

      // Ensure account number is set on the contact
      if (contactId && acctNumber) {
        step = 'updateContact';
        await xero.accountingApi.updateContact(tenantId, contactId, {
          contacts: [{
            contactID: contactId,
            accountNumber: acctNumber,
            bankAccountDetails: acctNumber,
          }],
        });
      }
    } catch (e: any) {
      // Try every place xero-node / our own throws stash the actionable
      // detail. Past attempts only checked response.body, which was empty
      // on Mary Carver's error — so we now also pull .message, .name,
      // .code, and dump a stringified snapshot as a last resort.
      const body = e?.response?.body;
      const status = e?.response?.statusCode || e?.statusCode;
      // xero-node sometimes presents body as a JSON string instead of a
      // parsed object — try to parse it so the field reads below succeed.
      const bodyObj: any = typeof body === 'string' ? (() => { try { return JSON.parse(body); } catch { return null; } })() : body;
      // Xero's raw JSON uses capital-E (Elements, ValidationErrors, Message);
      // xero-node's TS shape uses lowercase. Check both so we don't miss either.
      const elements = bodyObj?.elements || bodyObj?.Elements || [];
      const validationMessages: string[] = [];
      for (const el of elements) {
        const ves = el?.validationErrors || el?.ValidationErrors || [];
        for (const ve of ves) {
          const m = ve?.message || ve?.Message;
          if (m) validationMessages.push(m);
        }
      }
      let raw = '';
      try { raw = JSON.stringify(e, Object.getOwnPropertyNames(e)).slice(0, 600); } catch { raw = String(e); }
      const detail = validationMessages.length
        ? validationMessages.join('; ')
        : (body?.message || body?.Message || body?.Detail || e?.message || (body && Object.keys(body).length ? JSON.stringify(body).slice(0, 400) : '') || `[${e?.name || 'Error'}${e?.code ? '/' + e.code : ''}] ${raw}`);
      const provLabel = `${provider.name} (id=${li.providerId})`;
      console.error(`[Xero] contact step "${step}" failed for ${provLabel} status=${status || '?'} detail=${detail} raw=${raw}`);
      throw new Error(`Xero contact error for ${provLabel} at step "${step}": ${detail}`);
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
          data: {
            xeroBillId: invoiceId,
            xeroStatus: 'submitted',
            xeroSyncedAt: new Date(),
            xeroPaidAt: null,
            xeroAmountPaid: null,
          },
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

  // Delete a Xero bill and unlink it from our line item.
  // Draft bills in Xero are deletable (status='DELETED'). If the remote bill is
  // already gone (e.g. deleted manually in Xero, leaving an orphaned ID on our
  // side), we still want to clear the local link so the line item is unstuck.
  async function deleteBillFromXero(lineItemId: number) {
    const li = await prisma.hostPaymentLineItem.findUnique({ where: { id: lineItemId } });
    if (!li) throw new Error('Line item not found');
    if (!li.xeroBillId) throw new Error('No Xero bill linked');

    let remoteResult = 'deleted';
    let remoteError: string | null = null;

    try {
      const { xero, tenantId } = await getAuthedXero();
      await xero.accountingApi.updateInvoice(tenantId, li.xeroBillId, {
        invoices: [{
          invoiceID: li.xeroBillId,
          status: 'DELETED' as any,
        }],
      });
    } catch (e: any) {
      remoteError = e.response?.body?.Message || e.body?.Message || e.message || 'Unknown Xero error';
      const isOrphan = /not (found|exist)|invalid|cannot be found|does not exist/i.test(remoteError || '');
      remoteResult = isOrphan ? 'already_gone' : 'failed';
    }

    // Always clear the local Xero link so the line item is unstuck
    await prisma.hostPaymentLineItem.update({
      where: { id: lineItemId },
      data: { xeroBillId: null, xeroStatus: null, xeroPaidAt: null, xeroAmountPaid: null, xeroSyncedAt: null },
    });

    if (remoteResult === 'deleted') {
      return { success: true, message: 'Bill deleted in Xero and unlinked locally' };
    }
    if (remoteResult === 'already_gone') {
      return { success: true, message: 'Xero bill no longer exists — link cleared locally' };
    }
    // Hard failure in Xero (auth, rate limit, etc.) — but we still cleared the link
    return { success: true, warning: `Local link cleared. Xero delete failed: ${remoteError}` };
  }

  return { calculatePaymentRun, listPaymentRuns, getPaymentRun, approveRun, markPaid, submitBillToXero, updateBillInXero, deleteBillFromXero, syncXeroBillStatuses };
}
