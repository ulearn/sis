import https from 'https';
import dotenv from 'dotenv';
import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';

dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool as any);
const prisma = new PrismaClient({ adapter });

const HS_TOKEN = process.env.ACCESS_TOKEN!;

// ── HubSpot API helpers ──────────────────────────
function hsGet(path: string): Promise<any> {
  return new Promise((resolve, reject) => {
    https.get({
      hostname: 'api.hubapi.com',
      path,
      headers: { 'Authorization': `Bearer ${HS_TOKEN}` },
    }, (res) => {
      let data = '';
      res.on('data', (chunk: string) => data += chunk);
      res.on('end', () => { try { resolve(JSON.parse(data)); } catch (e) { reject(e); } });
    }).on('error', reject);
  });
}

function hsPost(path: string, body: any): Promise<any> {
  return new Promise((resolve, reject) => {
    const bodyStr = JSON.stringify(body);
    const req = https.request({
      hostname: 'api.hubapi.com',
      path,
      method: 'POST',
      headers: { 'Authorization': `Bearer ${HS_TOKEN}`, 'Content-Type': 'application/json' },
    }, (res) => {
      let data = '';
      res.on('data', (chunk: string) => data += chunk);
      res.on('end', () => { try { resolve(JSON.parse(data)); } catch (e) { reject(e); } });
    });
    req.on('error', reject);
    req.write(bodyStr);
    req.end();
  });
}

// ── SKU → Course Category mapping ────────────────
function skuToCourseCategory(sku: string): string | null {
  if (!sku) return null;
  const s = sku.toUpperCase();
  if (s.startsWith('GEM') || s === 'AYMORN') return 'MORNING';
  if (s.startsWith('GIM') || s === 'AYMORN+') return 'MORNING_PLUS';
  if (s.startsWith('GEA') || s === 'AYAFT') return 'AFTERNOON';
  if (s.startsWith('GIA') || s === 'AYAFT+') return 'AFTERNOON_PLUS';
  if (s.startsWith('GE3') || s.startsWith('INT')) return 'INTENSIVE';
  if (s.startsWith('PVT') || s.startsWith('PRIV')) return 'PRIVATE';
  if (s.startsWith('LP')) return s.includes('AFT') ? 'AFTERNOON' : 'MORNING'; // LifePass
  return null; // not a course SKU (reg fee, accomm, insurance, etc.)
}

function skuToAccommType(sku: string): string | null {
  if (!sku) return null;
  const s = sku.toUpperCase();
  if (s.startsWith('HFS')) return 'Host Family';
  if (s.startsWith('ARP') || s.startsWith('ASU') || s.startsWith('AST') || s.startsWith('ASH')) return 'Apartment';
  return null;
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

// ── Main sync function ───────────────────────────
export async function syncNewInvoices() {
  console.log('=== HubSpot Invoice Sync ===');

  // Search for HubSpot invoices that are "open" or "paid" and not yet in SIS
  const searchBody = {
    filterGroups: [{
      filters: [{
        propertyName: 'hs_invoice_status',
        operator: 'IN',
        values: ['open', 'paid', 'partially_paid'],
      }],
    }],
    sorts: [{ propertyName: 'hs_createdate', direction: 'DESCENDING' }],
    properties: [
      'hs_invoice_status', 'hs_amount_billed', 'hs_balance_due',
      'hs_invoice_number', 'hs_currency', 'hs_due_date', 'hs_amount_paid',
    ],
    limit: 50,
  };

  const invoiceSearch = await hsPost('/crm/v3/objects/invoices/search', searchBody);
  const invoices = invoiceSearch.results || [];
  console.log(`Found ${invoices.length} HubSpot invoices`);

  let created = 0, skipped = 0, errors = 0;

  for (const inv of invoices) {
    const hsInvoiceId = inv.id;

    try {
      // Get associated deal
      const dealAssoc = await hsGet(`/crm/v3/objects/invoices/${hsInvoiceId}/associations/deals`);
      const dealId = dealAssoc.results?.[0]?.id;
      if (!dealId) { console.log(`  Invoice ${hsInvoiceId}: no associated deal, skipping`); skipped++; continue; }

      // Check if we already have a booking for this deal
      const existingBooking = await prisma.booking.findFirst({
        where: { student: { hubspotDealId: dealId } },
      });
      if (existingBooking) { skipped++; continue; }

      // Get deal details
      const deal = await hsGet(`/crm/v3/objects/deals/${dealId}?properties=dealname,dealstage,amount,hs_object_id`);

      // Get contact
      const contactAssoc = await hsGet(`/crm/v3/objects/deals/${dealId}/associations/contacts`);
      const contactId = contactAssoc.results?.[0]?.id;
      if (!contactId) { console.log(`  Deal ${dealId}: no associated contact, skipping`); skipped++; continue; }

      const contact = await hsGet(`/crm/v3/objects/contacts/${contactId}?properties=firstname,lastname,email,phone,mobilephone,country,date_of_birth,hs_lead_status`);
      const cp = contact.properties || {};

      // Get line items
      const liAssoc = await hsGet(`/crm/v3/objects/deals/${dealId}/associations/line_items`);
      const lineItemIds = (liAssoc.results || []).map((r: any) => r.id);

      let lineItems: any[] = [];
      if (lineItemIds.length > 0) {
        const liData = await hsPost('/crm/v3/objects/line_items/batch/read', {
          inputs: lineItemIds.map((id: string) => ({ id })),
          properties: ['name', 'hs_sku', 'quantity', 'price', 'amount', 'description'],
        });
        lineItems = liData.results || [];
      }

      // ── Create or find student ──
      let student = await prisma.student.findFirst({ where: { hubspotContactId: contactId } });
      if (!student) {
        student = cp.email ? await prisma.student.findFirst({ where: { email: cp.email } }) : null;
      }

      if (!student) {
        student = await prisma.student.create({
          data: {
            firstName: cp.firstname || 'Unknown',
            lastName: cp.lastname || 'Unknown',
            email: cp.email || '',
            phone: cp.phone || null,
            phoneMobile: cp.mobilephone || null,
            hubspotContactId: contactId,
            hubspotDealId: dealId,
          } as any,
        });
        console.log(`  Created student: ${student.firstName} ${student.lastName} (HubSpot ${contactId})`);
      } else {
        // Update HubSpot IDs if missing
        if (!student.hubspotContactId || !student.hubspotDealId) {
          await prisma.student.update({
            where: { id: student.id },
            data: { hubspotContactId: contactId, hubspotDealId: dealId } as any,
          });
        }
      }

      // ── Map line items to courses and accommodation ──
      const courses: any[] = [];
      const accommodations: any[] = [];
      let totalAmount = 0;

      for (const li of lineItems) {
        const p = li.properties;
        const sku = p.hs_sku || '';
        const amount = parseFloat(p.amount) || 0;
        totalAmount += amount;

        const courseCategory = skuToCourseCategory(sku);
        if (courseCategory) {
          // Extract weeks from SKU if possible (e.g. GEM-1-5 = 1-5 weeks)
          const qty = parseInt(p.quantity) || 1;
          courses.push({
            name: p.name || 'Course',
            category: courseCategory,
            startDate: new Date(), // will be updated from deal properties
            endDate: new Date(),
            weeks: qty,
            hoursPerWeek: getHoursPerWeek(courseCategory),
            fee: amount,
            active: true,
          });
        }

        const accommType = skuToAccommType(sku);
        if (accommType) {
          const qty = parseInt(p.quantity) || 1;
          accommodations.push({
            accommodationType: accommType,
            startDate: new Date(),
            endDate: new Date(),
            weeks: qty,
            fee: amount,
            active: true,
          });
        }
      }

      // ── Create booking ──
      const hsAmount = parseFloat(inv.properties.hs_amount_billed) || totalAmount;
      const hsPaid = parseFloat(inv.properties.hs_amount_paid) || 0;

      const booking = await prisma.booking.create({
        data: {
          studentId: student.id,
          status: hsPaid >= hsAmount && hsAmount > 0 ? 'CONFIRMED' : 'PENDING',
          confirmed: hsPaid >= hsAmount && hsAmount > 0,
          currency: 'EUR',
          amountTotal: hsAmount,
          amountPaid: hsPaid,
          amountOpen: hsAmount - hsPaid,
          dataSource: 'HUBSPOT',
          note: `HubSpot Deal: ${deal.properties?.dealname || dealId}`,
          courses: courses.length > 0 ? { create: courses } : undefined,
          accommodations: accommodations.length > 0 ? { create: accommodations } : undefined,
          statusHistory: {
            create: {
              fromStatus: 'ENQUIRY',
              toStatus: hsPaid >= hsAmount && hsAmount > 0 ? 'CONFIRMED' : 'PENDING',
            },
          },
        } as any,
        include: { student: true, courses: true, accommodations: true },
      });

      console.log(`  Created booking #${booking.id} for ${student.firstName} ${student.lastName} — €${hsAmount} (${courses.length} courses, ${accommodations.length} accomm)`);
      created++;
    } catch (e: any) {
      console.log(`  ERROR on invoice ${hsInvoiceId}: ${e.message?.substring(0, 300)}`);
      errors++;
    }
  }

  console.log(`\n=== Sync Complete ===`);
  console.log(`Created: ${created}, Skipped: ${skipped}, Errors: ${errors}`);

  await prisma.$disconnect();
  await pool.end();
}

// Run directly if called as script
if (require.main === module) {
  syncNewInvoices().catch(e => { console.error(e); process.exit(1); });
}
