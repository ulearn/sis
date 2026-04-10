import { Router } from 'express';
import https from 'https';
import { PrismaClient } from '../generated/prisma/client';

const HS_TOKEN = process.env.ACCESS_TOKEN!;
// Custom HubSpot Contact property used to classify contacts (Student-B2C / Student-B2B / Agent Employee).
// Override the property internal name via env var if it differs from the default.
const HS_CONTACT_TYPE_PROPERTY = process.env.HUBSPOT_CONTACT_TYPE_PROPERTY || 'contact_type';

function hsGet(path: string): Promise<any> {
  return new Promise((resolve, reject) => {
    https.get({
      hostname: 'api.hubapi.com', path,
      headers: { 'Authorization': `Bearer ${HS_TOKEN}` },
    }, (res) => {
      let data = '';
      res.on('data', (chunk: string) => data += chunk);
      res.on('end', () => { try { resolve(JSON.parse(data)); } catch (e) { reject(e); } });
    }).on('error', reject);
  });
}

function hsPatch(path: string, body: any): Promise<any> {
  return new Promise((resolve, reject) => {
    const bodyStr = JSON.stringify(body);
    const req = https.request({
      hostname: 'api.hubapi.com', path, method: 'PATCH',
      headers: { 'Authorization': `Bearer ${HS_TOKEN}`, 'Content-Type': 'application/json' },
    }, (res) => {
      let data = '';
      res.on('data', (chunk: string) => data += chunk);
      res.on('end', () => { try { resolve({ status: res.statusCode, body: JSON.parse(data) }); } catch (e) { resolve({ status: res.statusCode, body: data }); } });
    });
    req.on('error', reject);
    req.write(bodyStr);
    req.end();
  });
}

function hsPost(path: string, body: any): Promise<any> {
  return new Promise((resolve, reject) => {
    const bodyStr = JSON.stringify(body);
    const req = https.request({
      hostname: 'api.hubapi.com', path, method: 'POST',
      headers: { 'Authorization': `Bearer ${HS_TOKEN}`, 'Content-Type': 'application/json' },
    }, (res) => {
      let data = '';
      res.on('data', (chunk: string) => data += chunk);
      res.on('end', () => { try { resolve(JSON.parse(data)); } catch (e) { resolve(data); } });
    });
    req.on('error', reject);
    req.write(bodyStr);
    req.end();
  });
}

function skuToCourseCategory(sku: string): string | null {
  if (!sku) return null;
  const s = sku.toUpperCase();
  if (s.startsWith('GEM') || s === 'AYMORN') return 'MORNING';
  if (s.startsWith('GIM') || s === 'AYMORN+') return 'MORNING_PLUS';
  if (s.startsWith('GEA') || s === 'AYAFT') return 'AFTERNOON';
  if (s.startsWith('GIA') || s === 'AYAFT+') return 'AFTERNOON_PLUS';
  if (s.startsWith('GE3') || s.startsWith('INT')) return 'INTENSIVE';
  if (s.startsWith('PVT') || s.startsWith('PRIV')) return 'PRIVATE';
  if (s.startsWith('LP')) return s.includes('AFT') ? 'AFTERNOON' : 'MORNING';
  return null;
}

function skuToAccommType(sku: string): string | null {
  if (!sku) return null;
  const s = sku.toUpperCase();
  if (s.startsWith('HFS')) return 'Host Family';
  if (s.startsWith('ARP') || s.startsWith('ASU') || s.startsWith('AST') || s.startsWith('ASH')) return 'Apartment';
  return null;
}

// Strip pricing tier from HubSpot product name → clean SIS course name
function cleanCourseName(hubspotName: string, category: string): string {
  // "General English AM | 1 - 5 Weeks" → "General English AM"
  // "Academic Year Afternoon (375 Hours)" → "Academic Year Afternoon"
  let name = hubspotName.replace(/\s*\|.*$/, '').replace(/\s*\(.*\)$/, '').trim();
  if (!name) {
    const names: Record<string, string> = {
      MORNING: 'General English Morning',
      MORNING_PLUS: 'General English Morning Plus',
      AFTERNOON: 'General English Afternoon',
      AFTERNOON_PLUS: 'General English Afternoon Plus',
      INTENSIVE: 'Intensive General English',
      PRIVATE: 'Private Lessons',
    };
    name = names[category] || 'Course';
  }
  return name;
}

function getHoursPerWeek(category: string): number | null {
  switch (category) {
    case 'MORNING': return 15;
    case 'MORNING_PLUS': return 20;
    case 'AFTERNOON': return 15;
    case 'AFTERNOON_PLUS': return 20;
    case 'INTENSIVE': return 30;
    default: return null;
  }
}

export function webhookRoutes(prisma: PrismaClient) {
  const router = Router();

  // HubSpot invoice created → create Student + Booking in SIS
  // Triggered by HubSpot workflow when quote is converted to invoice
  router.post('/invoice-created', async (req, res) => {
    try {
      const { invoiceId, dealId, type } = req.body;
      const isB2B = String(type || '').toUpperCase() === 'B2B';

      if (!invoiceId && !dealId) {
        return res.status(400).json({ error: 'invoiceId or dealId required' });
      }

      // Resolve deal ID if not provided
      let resolvedDealId = dealId;
      if (!resolvedDealId && invoiceId) {
        const assoc = await hsGet(`/crm/v3/objects/invoices/${invoiceId}/associations/deals`);
        resolvedDealId = assoc.results?.[0]?.id;
      }
      if (!resolvedDealId) {
        return res.status(404).json({ error: 'No deal found for this invoice' });
      }

      // Check if booking already exists for this deal.
      // Dedup key is Booking.hubspotDealId (not student.hubspotDealId) because
      // a single student can have multiple deals over time, and the Student row
      // only holds the most recent one — which would cause stale lookups.
      const existingBooking = await prisma.booking.findFirst({
        where: { hubspotDealId: resolvedDealId } as any,
      });
      if (existingBooking) {
        return res.json({ status: 'already_exists', bookingId: existingBooking.id });
      }

      // Get deal details
      const deal = await hsGet(`/crm/v3/objects/deals/${resolvedDealId}?properties=dealname,dealstage,amount,course_start,course_end,course_weeks`);

      // Resolve the STUDENT contact and (for B2B) the AGENCY company on the deal.
      // B2C: deal has one contact (the student) — fast path, no label filtering needed.
      // B2B: deal has multiple contacts (student + partner order desk + maybe more).
      //      Use v4 associations API which exposes labels, and pick the contact
      //      labelled "Student-B2B". Also resolve the associated Company → agency.
      let resolvedContactId: string | null = null;
      let resolvedCompanyId: string | null = null;
      let resolvedCompanyName: string | null = null;

      if (isB2B) {
        // Find the student contact on the deal.
        //   1. If only ONE contact on the deal → take it (unambiguous, no extra calls).
        //   2. Otherwise, batch-fetch contacts with the `contact_type` property and
        //      EXCLUDE any tagged as "Agent Employee". Pick whatever's left:
        //        - exactly one non-employee → that's the student
        //        - multiple non-employees → prefer one tagged Student-*, else label, else first
        //        - zero non-employees → log loudly (all contacts tagged Agent Employee = broken state)
        //   This subtractive approach works even on partially-categorized contacts:
        //   the student doesn't need to be tagged, only the employees do.
        const contactAssocV4 = await hsGet(`/crm/v4/objects/deals/${resolvedDealId}/associations/contacts`);
        const contactAssocs: any[] = contactAssocV4.results || [];

        if (contactAssocs.length === 1) {
          resolvedContactId = String(contactAssocs[0].toObjectId);
        } else if (contactAssocs.length > 1) {
          let candidates = contactAssocs.slice();

          // Exclude employees by contact_type
          try {
            const ids = contactAssocs.map(a => ({ id: String(a.toObjectId) }));
            const batch = await hsPost('/crm/v3/objects/contacts/batch/read', {
              inputs: ids,
              properties: [HS_CONTACT_TYPE_PROPERTY],
            });
            const typeById = new Map<string, string>();
            for (const c of batch.results || []) {
              typeById.set(String(c.id), String(c.properties?.[HS_CONTACT_TYPE_PROPERTY] || '').toLowerCase());
            }
            const nonEmployees = candidates.filter(a => typeById.get(String(a.toObjectId)) !== 'agent employee');
            if (nonEmployees.length > 0) candidates = nonEmployees;
            else console.warn(`[Invoice Created] B2B deal ${resolvedDealId}: all ${contactAssocs.length} contacts tagged as Agent Employee — skipping exclusion`);

            // If still multiple, prefer one explicitly tagged Student-*
            if (candidates.length > 1) {
              const explicitStudent = candidates.find(a => (typeById.get(String(a.toObjectId)) || '').startsWith('student'));
              if (explicitStudent) resolvedContactId = String(explicitStudent.toObjectId);
            } else if (candidates.length === 1) {
              resolvedContactId = String(candidates[0].toObjectId);
            }
          } catch (e: any) {
            console.warn(`[Invoice Created] contact_type fetch failed for deal ${resolvedDealId}: ${e.message}`);
          }

          // Fallback: "Student-B2B" association label (aligned with contact_type naming)
          if (!resolvedContactId) {
            for (const a of candidates) {
              const labels = (a.associationTypes || []).map((t: any) => (t.label || '').toLowerCase());
              if (labels.includes('student-b2b')) {
                resolvedContactId = String(a.toObjectId);
                break;
              }
            }
          }

          // Last-resort fallback
          if (!resolvedContactId) {
            resolvedContactId = String(candidates[0].toObjectId);
            console.warn(`[Invoice Created] B2B deal ${resolvedDealId}: no employee exclusion / student tag / label match worked — falling back to first non-employee contact ${resolvedContactId}`);
          }
        }

        // Resolve the agency company. The quote builder can only bill one company,
        // so there should only ever be one associated. Per the agency-data rule in
        // CLAUDE.md, we store only id/name/hubspotCompanyId locally — commission
        // rate stays in HubSpot.
        try {
          const companyAssocV4 = await hsGet(`/crm/v4/objects/deals/${resolvedDealId}/associations/companies`);
          const companyAssocs: any[] = companyAssocV4.results || [];
          if (companyAssocs.length > 0) {
            resolvedCompanyId = String(companyAssocs[0].toObjectId);
            const company = await hsGet(`/crm/v3/objects/companies/${resolvedCompanyId}?properties=name`);
            resolvedCompanyName = company?.properties?.name || null;
          }
        } catch (e: any) {
          console.warn(`[Invoice Created] Failed to resolve company on deal ${resolvedDealId}: ${e.message}`);
        }
      } else {
        // B2C: simple, single contact on the deal
        const contactAssoc = await hsGet(`/crm/v3/objects/deals/${resolvedDealId}/associations/contacts`);
        resolvedContactId = contactAssoc.results?.[0]?.id || null;
      }

      if (!resolvedContactId) {
        return res.status(404).json({ error: 'No contact found on deal' });
      }

      const contact = await hsGet(`/crm/v3/objects/contacts/${resolvedContactId}?properties=firstname,lastname,email,phone,mobilephone,country,date_of_birth`);
      const cp = contact.properties || {};

      // Get line items
      const liAssoc = await hsGet(`/crm/v3/objects/deals/${resolvedDealId}/associations/line_items`);
      const lineItemIds = (liAssoc.results || []).map((r: any) => r.id);

      let lineItems: any[] = [];
      if (lineItemIds.length > 0) {
        const liData = await hsPost('/crm/v3/objects/line_items/batch/read', {
          inputs: lineItemIds.map((id: string) => ({ id })),
          properties: ['name', 'hs_sku', 'quantity', 'price', 'amount', 'description'],
        });
        lineItems = liData.results || [];
      }

      // Get invoice details
      let invoiceAmount = 0;
      if (invoiceId) {
        const inv = await hsGet(`/crm/v3/objects/invoices/${invoiceId}?properties=hs_amount_billed`);
        invoiceAmount = parseFloat(inv.properties?.hs_amount_billed) || 0;
      }

      // Create or find student
      let student = await prisma.student.findFirst({ where: { hubspotContactId: resolvedContactId } });
      if (!student && cp.email) {
        student = await prisma.student.findFirst({ where: { email: cp.email } });
      }

      if (!student) {
        student = await prisma.student.create({
          data: {
            firstName: cp.firstname || 'Unknown',
            lastName: cp.lastname || 'Unknown',
            email: cp.email || '',
            phone: cp.phone || null,
            phoneMobile: cp.mobilephone || null,
            hubspotContactId: resolvedContactId,
            hubspotDealId: resolvedDealId,
          } as any,
        });
      } else if (!student.hubspotContactId || !student.hubspotDealId) {
        await prisma.student.update({
          where: { id: student.id },
          data: { hubspotContactId: resolvedContactId, hubspotDealId: resolvedDealId } as any,
        });
      }

      // Map line items to courses and accommodation
      const courses: any[] = [];
      const accommodations: any[] = [];
      let totalAmount = 0;

      const dp = deal.properties || {};
      const courseStart = dp.course_start ? new Date(dp.course_start) : new Date();
      const courseEnd = dp.course_end ? new Date(dp.course_end) : null;
      const courseWeeks = parseInt(dp.course_weeks) || null;

      for (const li of lineItems) {
        const p = li.properties;
        const sku = p.hs_sku || '';
        const amount = parseFloat(p.amount) || 0;
        totalAmount += amount;

        const courseCategory = skuToCourseCategory(sku);
        if (courseCategory) {
          courses.push({
            name: cleanCourseName(p.name || '', courseCategory),
            category: courseCategory,
            startDate: courseStart,
            endDate: courseEnd || courseStart,
            weeks: courseWeeks || parseInt(p.quantity) || 1,
            hoursPerWeek: getHoursPerWeek(courseCategory),
            fee: amount,
            active: true,
          });
        }

        const accommType = skuToAccommType(sku);
        if (accommType) {
          courses.push; // skip — wrong array
          accommodations.push({
            accommodationType: accommType,
            startDate: courseStart,
            endDate: courseEnd || courseStart,
            weeks: parseInt(p.quantity) || 1,
            fee: amount,
            active: true,
          });
        }
      }

      // Create booking
      const hsAmount = invoiceAmount || totalAmount || parseFloat(dp.amount) || 0;

      // Upsert the agency for B2B bookings.
      // Per CLAUDE.md agency rule: only id/name/hubspotCompanyId are stored locally.
      // Commission rate stays in HubSpot and is fetched on-demand by the document layer.
      let agencyId: number | null = null;
      if (resolvedCompanyId) {
        let agency = await prisma.agency.findUnique({ where: { hubspotCompanyId: resolvedCompanyId } });
        if (!agency) {
          agency = await prisma.agency.create({
            data: {
              name: resolvedCompanyName || `HubSpot Company ${resolvedCompanyId}`,
              hubspotCompanyId: resolvedCompanyId,
            } as any,
          });
        } else if (resolvedCompanyName && agency.name !== resolvedCompanyName) {
          // Refresh display name if HubSpot has updated it
          await prisma.agency.update({ where: { id: agency.id }, data: { name: resolvedCompanyName } });
        }
        agencyId = agency.id;
      }

      const booking = await prisma.booking.create({
        data: {
          studentId: student.id,
          agencyId: agencyId || undefined,
          hubspotDealId: resolvedDealId,
          hubspotInvoiceId: invoiceId || null,
          status: 'PENDING',
          confirmed: false,
          serviceStart: courseStart,
          serviceEnd: courseEnd,
          currency: 'EUR',
          amountTotal: hsAmount,
          amountPaid: 0,
          amountOpen: hsAmount,
          dataSource: 'HUBSPOT',
          note: `HubSpot Deal: ${dp.dealname || resolvedDealId}`,
          courses: courses.length > 0 ? { create: courses } : undefined,
          accommodations: accommodations.length > 0 ? { create: accommodations } : undefined,
          // No statusHistory entry on initial creation — there's no genuine "from" state.
          // History is appended on subsequent transitions (e.g. PENDING → PARTIAL → COMPLETE).
        } as any,
        include: { student: true, courses: true, accommodations: true },
      });

      const name = `${student.firstName} ${student.lastName}`;
      const channel = isB2B ? `B2B${resolvedCompanyName ? ' via ' + resolvedCompanyName : ''}` : 'B2C';
      console.log(`[Invoice Created] ${name} (${channel}): booking #${booking.id} — €${hsAmount} (${courses.length} courses, ${accommodations.length} accomm)`);

      res.json({
        status: 'ok',
        channel: isB2B ? 'B2B' : 'B2C',
        student: name,
        studentId: student.id,
        bookingId: booking.id,
        agencyId: agencyId || null,
        agencyName: resolvedCompanyName || null,
        amountTotal: hsAmount,
        courses: courses.length,
        accommodations: accommodations.length,
      });
    } catch (e: any) {
      console.error('[Invoice Created] Error:', e.message);
      res.status(500).json({ error: e.message });
    }
  });

  // HubSpot invoice payment status webhook
  // Triggered by HubSpot workflow when invoice status changes (paid, partially_paid)
  router.post('/invoice-paid', async (req, res) => {
    try {
      const { invoiceId, dealId } = req.body;

      if (!invoiceId && !dealId) {
        return res.status(400).json({ error: 'invoiceId or dealId required' });
      }

      // Find the deal ID if we only got invoiceId
      let resolvedDealId = dealId;
      if (!resolvedDealId && invoiceId) {
        const assoc = await hsGet(`/crm/v3/objects/invoices/${invoiceId}/associations/deals`);
        resolvedDealId = assoc.results?.[0]?.id;
      }

      if (!resolvedDealId) {
        return res.status(404).json({ error: 'No deal found for this invoice' });
      }

      // Get invoice details
      const invoiceAssoc = await hsGet(`/crm/v3/objects/deals/${resolvedDealId}/associations/invoices`);
      const invoiceIds = (invoiceAssoc.results || []).map((r: any) => r.id);

      let totalBilled = 0;
      let totalPaid = 0;

      for (const invId of invoiceIds) {
        const inv = await hsGet(`/crm/v3/objects/invoices/${invId}?properties=hs_amount_billed,hs_amount_paid`);
        const props = inv.properties || {};
        totalBilled += parseFloat(props.hs_amount_billed) || 0;
        totalPaid += parseFloat(props.hs_amount_paid) || 0;
      }

      const isFullyPaid = totalPaid >= totalBilled && totalBilled > 0;

      // Find the SIS booking for this deal.
      // Dedup via Booking.hubspotDealId (unique FK) rather than student.hubspotDealId
      // which only holds the most recent deal and would give stale lookups for
      // students with multiple deals.
      const booking = await prisma.booking.findFirst({
        where: {
          hubspotDealId: resolvedDealId,
          dataSource: 'HUBSPOT',
        } as any,
        include: { student: true },
      });

      if (!booking) {
        return res.status(404).json({ error: 'No SIS booking found for deal ' + resolvedDealId });
      }

      // Update booking payment status
      const updateData: any = {
        amountPaid: totalPaid,
        amountOpen: Math.max(0, totalBilled - totalPaid),
      };

      // Status reconciliation — handles both forward and reverse transitions.
      // Reverse happens when a payment is deleted/reduced in Xero, which propagates
      // back to HubSpot, which should (if the workflow is wired correctly) re-fire
      // this webhook with the lower totalPaid.
      let targetStatus: string | null = null;
      if (isFullyPaid) {
        targetStatus = 'CONFIRMED';
      } else if (totalPaid > 0) {
        targetStatus = 'PARTIAL';
      } else {
        // totalPaid === 0 → payment was removed, roll back to PENDING
        targetStatus = 'PENDING';
      }

      if (targetStatus !== booking.status) {
        updateData.status = targetStatus;
        updateData.confirmed = targetStatus === 'CONFIRMED';
        if (targetStatus === 'CONFIRMED') updateData.confirmedAt = new Date();
        else if (booking.status === 'CONFIRMED') updateData.confirmedAt = null; // rolled back from CONFIRMED

        await prisma.bookingStatusHistory.create({
          data: {
            bookingId: booking.id,
            fromStatus: booking.status || 'PENDING',
            toStatus: targetStatus,
            changedBy: 'payment-webhook',
          } as any,
        });
      }

      await prisma.booking.update({
        where: { id: booking.id },
        data: updateData,
      });

      // ── Sync individual payment records from HubSpot ──
      // Fetches every commerce_payment associated with the deal's invoice(s),
      // upserts them into the SIS Payment table keyed by hubspotPaymentId, and
      // removes any stale SIS rows whose HubSpot source has been deleted.
      // Manual payments (dataSource=MANUAL) are never touched.
      try {
        const hsPaymentIdsFound = new Set<string>();
        for (const invId of invoiceIds) {
          const pAssoc = await hsGet(`/crm/v4/objects/invoices/${invId}/associations/commerce_payments`);
          const payIds = (pAssoc.results || []).map((r: any) => String(r.toObjectId));
          if (payIds.length === 0) continue;

          const batch = await hsPost('/crm/v3/objects/commerce_payments/batch/read', {
            inputs: payIds.map((id: string) => ({ id })),
            properties: [
              'hs_initial_amount', 'hs_initiated_date', 'hs_payment_method',
              'hs_payment_method_type', 'hs_reference_number', 'hs_internal_comment',
              'hs_payment_type', 'hs_latest_status', 'hs_currency_code',
            ],
          });

          for (const pay of (batch.results || [])) {
            const p = pay.properties || {};
            const hsId = String(pay.id);
            hsPaymentIdsFound.add(hsId);
            const amount = parseFloat(p.hs_initial_amount || '0') || 0;
            if (amount <= 0) continue;

            const paymentDate = p.hs_initiated_date
              ? new Date(p.hs_initiated_date)
              : new Date();
            // Method: HubSpot flattens all Xero-sourced payments to "Other" (or null)
            // because Xero doesn't preserve processor info. For operational purposes
            // in the SIS, default to "Bank" — the real processor (Stripe, TransferMate,
            // Revolut, etc.) will be captured upstream in the hub.ulearnschool.com
            // /fins/tm/ module when it's live, and surfaced via Xero reconciliation.
            const method = 'Bank';

            await prisma.payment.upsert({
              where: { hubspotPaymentId: hsId },
              update: {
                amount,
                paymentDate,
                method,
                transactionId: p.hs_reference_number || null,
                comment: p.hs_internal_comment || null,
                type: p.hs_payment_type || null,
              },
              create: {
                bookingId: booking.id,
                hubspotPaymentId: hsId,
                amount,
                paymentDate,
                method,
                transactionId: p.hs_reference_number || null,
                comment: p.hs_internal_comment || null,
                type: p.hs_payment_type || null,
                dataSource: 'HUBSPOT',
              } as any,
            });
          }
        }

        // Clean up any HubSpot-sourced payments on this booking that are no
        // longer present in HubSpot (i.e. deleted in Xero and propagated).
        // Never touches MANUAL or FIDELO payments.
        const existingHsPayments = await prisma.payment.findMany({
          where: { bookingId: booking.id, dataSource: 'HUBSPOT' as any, hubspotPaymentId: { not: null } },
          select: { id: true, hubspotPaymentId: true },
        });
        const toDelete = existingHsPayments
          .filter(p => p.hubspotPaymentId && !hsPaymentIdsFound.has(p.hubspotPaymentId))
          .map(p => p.id);
        if (toDelete.length > 0) {
          await prisma.payment.deleteMany({ where: { id: { in: toDelete } } });
          console.log(`[Payment Webhook] Pruned ${toDelete.length} stale HubSpot payment row(s) on booking ${booking.id}`);
        }
      } catch (e: any) {
        console.error(`[Payment Webhook] Payment row sync failed for booking ${booking.id}:`, e.message);
        // Non-fatal — the booking totals were already updated above
      }

      const name = `${booking.student?.firstName} ${booking.student?.lastName}`;
      console.log(`[Payment Webhook] ${name}: €${totalPaid} of €${totalBilled} — ${isFullyPaid ? 'FULLY PAID' : 'PARTIAL'}`);

      // On forward transition to fully-paid only (not on repeat calls or rollbacks),
      // move the HubSpot deal to closedwon.
      if (isFullyPaid && booking.status !== 'CONFIRMED') {
        const result = await hsPatch(`/crm/v3/objects/deals/${resolvedDealId}`, {
          properties: { dealstage: 'closedwon' },
        });
        console.log(`[Payment Webhook] Deal ${resolvedDealId} → WON (${result.status})`);
      }

      res.json({
        status: 'ok',
        student: name,
        amountPaid: totalPaid,
        amountBilled: totalBilled,
        fullyPaid: isFullyPaid,
        dealMovedToWon: isFullyPaid,
      });
    } catch (e: any) {
      console.error('[Payment Webhook] Error:', e.message);
      res.status(500).json({ error: e.message });
    }
  });

  return router;
}
