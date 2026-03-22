import { Router } from 'express';
import https from 'https';
import { PrismaClient } from '../generated/prisma/client';

const HS_TOKEN = process.env.ACCESS_TOKEN!;

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
      const { invoiceId, dealId, contactId } = req.body;

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

      // Check if booking already exists for this deal
      const existingBooking = await prisma.booking.findFirst({
        where: { student: { hubspotDealId: resolvedDealId } },
      });
      if (existingBooking) {
        return res.json({ status: 'already_exists', bookingId: existingBooking.id });
      }

      // Get deal details
      const deal = await hsGet(`/crm/v3/objects/deals/${resolvedDealId}?properties=dealname,dealstage,amount,course_start,course_end,course_weeks`);

      // Resolve contact ID if not provided
      let resolvedContactId = contactId;
      if (!resolvedContactId) {
        const contactAssoc = await hsGet(`/crm/v3/objects/deals/${resolvedDealId}/associations/contacts`);
        resolvedContactId = contactAssoc.results?.[0]?.id;
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

      const booking = await prisma.booking.create({
        data: {
          studentId: student.id,
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
          statusHistory: {
            create: { fromStatus: 'ENQUIRY', toStatus: 'PENDING' },
          },
        } as any,
        include: { student: true, courses: true, accommodations: true },
      });

      const name = `${student.firstName} ${student.lastName}`;
      console.log(`[Invoice Created] ${name}: booking #${booking.id} — €${hsAmount} (${courses.length} courses, ${accommodations.length} accomm)`);

      res.json({
        status: 'ok',
        student: name,
        studentId: student.id,
        bookingId: booking.id,
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

      // Find the SIS booking for this deal
      const booking = await prisma.booking.findFirst({
        where: {
          student: { hubspotDealId: resolvedDealId },
          dataSource: 'HUBSPOT',
        },
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

      if (isFullyPaid && booking.status !== 'CONFIRMED') {
        updateData.status = 'CONFIRMED';
        updateData.confirmed = true;
        updateData.confirmedAt = new Date();

        await prisma.bookingStatusHistory.create({
          data: {
            bookingId: booking.id,
            fromStatus: booking.status,
            toStatus: 'CONFIRMED',
            changedBy: 'payment-webhook',
          } as any,
        });
      }

      await prisma.booking.update({
        where: { id: booking.id },
        data: updateData,
      });

      const name = `${booking.student?.firstName} ${booking.student?.lastName}`;
      console.log(`[Payment Webhook] ${name}: €${totalPaid} of €${totalBilled} — ${isFullyPaid ? 'FULLY PAID' : 'PARTIAL'}`);

      // If fully paid → move HubSpot deal to WON
      if (isFullyPaid) {
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
