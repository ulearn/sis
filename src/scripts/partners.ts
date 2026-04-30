/**
 * Partner portal — business logic layer
 * All queries are scoped by agencyId (never trust the client).
 */
import { PrismaClient } from '../generated/prisma/client';
import bcrypt from 'bcryptjs';

export function partnerScripts(prisma: PrismaClient) {

  // ── Dashboard ────────────────────────────────
  async function dashboard(agencyId: number) {
    const now = new Date();
    const weekAhead = new Date(now);
    weekAhead.setDate(now.getDate() + 7);
    const todayStr = now.toISOString().split('T')[0];
    const weekStr = weekAhead.toISOString().split('T')[0];

    const [activeStudents, arrivingThisWeek, departingThisWeek, financials] = await Promise.all([
      // Active students: have a booking with this agency that hasn't ended yet
      prisma.booking.count({
        where: {
          agencyId,
          status: { notIn: ['CANCELLED'] },
          serviceEnd: { gte: now },
          serviceStart: { lte: now },
        },
      }),
      // Arriving this week
      prisma.booking.count({
        where: {
          agencyId,
          serviceStart: { gte: new Date(todayStr), lte: new Date(weekStr) },
          status: { notIn: ['CANCELLED'] },
        },
      }),
      // Departing this week
      prisma.booking.count({
        where: {
          agencyId,
          serviceEnd: { gte: new Date(todayStr), lte: new Date(weekStr) },
          status: { notIn: ['CANCELLED'] },
        },
      }),
      // Financial summary
      prisma.booking.aggregate({
        where: { agencyId, status: { notIn: ['CANCELLED'] } },
        _sum: { amountTotal: true, amountPaid: true, amountOpen: true },
      }),
    ]);

    return {
      activeStudents,
      arrivingThisWeek,
      departingThisWeek,
      totalBilled: financials._sum.amountTotal || 0,
      totalPaid: financials._sum.amountPaid || 0,
      balanceOpen: financials._sum.amountOpen || 0,
    };
  }

  // ── Students ─────────────────────────────────
  async function students(agencyId: number, query?: { search?: string; page?: number; limit?: number }) {
    const page = query?.page || 1;
    const limit = query?.limit || 50;
    const skip = (page - 1) * limit;

    // Students are those who have at least one booking with this agency
    const where: any = {
      bookings: { some: { agencyId } },
    };
    if (query?.search) {
      const s = query.search;
      where.OR = [
        { firstName: { contains: s, mode: 'insensitive' } },
        { lastName: { contains: s, mode: 'insensitive' } },
        { email: { contains: s, mode: 'insensitive' } },
      ];
    }

    const [rows, total] = await Promise.all([
      prisma.student.findMany({
        where,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          birthday: true,
          nationality: true,
          currentLevel: true,
          bookings: {
            where: { agencyId },
            select: {
              id: true,
              status: true,
              serviceStart: true,
              serviceEnd: true,
              amountTotal: true,
              amountPaid: true,
              amountOpen: true,
              courses: {
                select: { name: true, level: true, startDate: true, endDate: true },
              },
            },
            orderBy: { serviceStart: 'desc' },
          },
        },
        skip,
        take: limit,
        orderBy: { lastName: 'asc' },
      }),
      prisma.student.count({ where }),
    ]);

    return { rows, total, page, limit };
  }

  // ── Bookings ─────────────────────────────────
  async function bookings(agencyId: number, query?: { status?: string; page?: number; limit?: number }) {
    const page = query?.page || 1;
    const limit = query?.limit || 50;
    const skip = (page - 1) * limit;

    const where: any = { agencyId };
    if (query?.status) where.status = query.status;

    const [rows, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        select: {
          id: true,
          status: true,
          serviceStart: true,
          serviceEnd: true,
          amountTotal: true,
          amountPaid: true,
          amountOpen: true,
          currency: true,
          student: {
            select: { id: true, firstName: true, lastName: true, nationality: true },
          },
          courses: {
            select: { name: true, level: true, startDate: true, endDate: true, weeks: true },
          },
          accommodations: {
            select: { accommodationType: true, roomType: true, startDate: true, endDate: true },
          },
        },
        skip,
        take: limit,
        orderBy: { serviceStart: 'desc' },
      }),
      prisma.booking.count({ where }),
    ]);

    return { rows, total, page, limit };
  }

  // ── Finance summary ──────────────────────────
  async function finance(agencyId: number) {
    const [summary, recentPayments, invoices] = await Promise.all([
      prisma.booking.aggregate({
        where: { agencyId, status: { notIn: ['CANCELLED'] } },
        _sum: { amountTotal: true, amountPaid: true, amountOpen: true },
        _count: true,
      }),
      prisma.payment.findMany({
        where: { booking: { agencyId } },
        select: {
          id: true,
          amount: true,
          method: true,
          paymentDate: true,
          paidBy: true,
          booking: {
            select: {
              id: true,
              student: { select: { firstName: true, lastName: true } },
            },
          },
        },
        orderBy: { paymentDate: 'desc' },
        take: 20,
      }),
      prisma.invoice.findMany({
        where: { booking: { agencyId } },
        select: {
          id: true,
          invoiceNumber: true,
          type: true,
          date: true,
          status: true,
          pdfUrl: true,
          booking: {
            select: {
              id: true,
              student: { select: { firstName: true, lastName: true } },
            },
          },
        },
        orderBy: { date: 'desc' },
        take: 30,
      }),
    ]);

    // Estimate commissions: pull agency commission rate
    const agency = await prisma.agency.findUnique({
      where: { id: agencyId },
      select: { commissionRate: true },
    });
    const rate = agency?.commissionRate ? Number(agency.commissionRate) / 100 : 0;
    const totalBilled = Number(summary._sum.amountTotal || 0);
    const commissionsEarned = totalBilled * rate;

    return {
      totalBilled,
      totalPaid: Number(summary._sum.amountPaid || 0),
      balanceOpen: Number(summary._sum.amountOpen || 0),
      bookingCount: summary._count,
      commissionRate: agency?.commissionRate || 0,
      commissionsEarned,
      recentPayments,
      invoices,
    };
  }

  // ── Enroll (HubSpot) ──────────────────────────
  // Creates a HubSpot contact (Student-B2B) + deal in Agent/Partner pipeline,
  // associates both with the partner's company.
  const HUBSPOT_PAT = process.env.HUBSPOT_WRITE_TOKEN || process.env.ACCESS_TOKEN;
  const HS = 'https://api.hubapi.com';
  const B2B_PIPELINE = '35765201';
  const ENROLMENT_STAGE = '109570243';

  async function hsRequest(method: string, path: string, body?: any): Promise<any> {
    const opts: any = {
      method,
      headers: { 'Authorization': `Bearer ${HUBSPOT_PAT}`, 'Content-Type': 'application/json' },
    };
    if (body && method !== 'GET') opts.body = JSON.stringify(body);
    const res = await fetch(HS + path, opts);
    return res.json().catch(() => ({}));
  }

  // Map form course type + sub-options to HubSpot course_type enum value
  // Exact alignment with Drupal BookingEnrichmentWorker.php resolveCourseType()
  function mapCourseType(data: any): string {
    const { courseType, courseSlot, aySlot, lpSlot, courseHours, examType, ieltsSlot } = data;

    switch (courseType) {
      case 'group': {
        const slot = courseSlot || '';
        if (courseHours === '30') return 'Intensive General English';
        if (courseHours === '20') return slot === 'morning' ? 'General English AM Plus' : 'General English PM Plus';
        return slot === 'afternoon' ? 'General English PM' : 'General English';
      }
      case 'exam': {
        const eslot = ieltsSlot || '';
        if (examType === 'ielts') return eslot === 'afternoon' ? 'IELTS PM' : 'IELTS AM';
        if (examType === 'fce') return 'Cambridge First FCE AM';
        if (examType === 'cae') return 'Cambridge Advanced CAE AM';
        return 'Exam Preparation';
      }
      case 'private': return 'Private Lessons';
      case 'lifepass': return (lpSlot || '') === 'afternoon' ? 'LifePass PM' : 'LifePass AM';
      case 'academic_year': return (aySlot || '') === 'afternoon' ? 'ay_year_aft' : 'ay_year_morn';
      case 'junior': return 'Junior';
      default: return courseType || '';
    }
  }

  // Resolve week band for course_duration property
  function resolveWeekBand(weeks: number): string {
    if (weeks <= 5) return '1 to 5 Weeks';
    if (weeks <= 7) return '6 to 7 Weeks';
    if (weeks <= 11) return '8 to 11 Weeks';
    if (weeks <= 24) return '12 to 24 Weeks';
    return '25 Weeks';
  }

  // Resolve territory — exact HubSpot enum values
  function resolveTerritory(territory: string): string | null {
    if (territory === 'EU') return 'EU';
    if (territory === 'Non-EU (VBD)') return 'Non-EU (VBD)';
    if (territory === 'Non-EU (No Visa)') return 'Non-EU (NO VISA)';
    return null; // Unsupported Territory — don't send
  }

  // Territory lookup
  const TERRITORY_MAP: Record<string, string> = {"Afghanistan":"Unsupported Territory","Albania":"Non-EU (VBD)","Algeria":"Non-EU (VBD)","Andorra":"EU","Argentina":"Non-EU (No Visa)","Armenia":"Non-EU (VBD)","Australia":"Non-EU (VBD)","Austria":"EU","Azerbaijan":"Non-EU (VBD)","Belarus":"Non-EU (VBD)","Belgium":"EU","Bolivia":"Non-EU (No Visa)","Bosnia and Herzegovina":"Non-EU (VBD)","Brazil":"Non-EU (No Visa)","Brunei":"Non-EU (VBD)","Bulgaria":"EU","Cameroon":"Non-EU (VBD)","Canada":"Non-EU (VBD)","Chile":"Non-EU (No Visa)","China":"Non-EU (VBD)","Colombia":"Non-EU (VBD)","Costa Rica":"Non-EU (No Visa)","Croatia":"EU","Cyprus":"EU","Czech Republic":"EU","Denmark":"EU","Ecuador":"Non-EU (VBD)","Egypt":"Non-EU (VBD)","El Salvador":"Non-EU (No Visa)","Estonia":"EU","Fiji":"Non-EU (VBD)","Finland":"EU","France":"EU","Georgia":"Non-EU (VBD)","Germany":"EU","Gibraltar":"EU","Greece":"EU","Guatemala":"Non-EU (No Visa)","Honduras":"Non-EU (No Visa)","Hong Kong":"Non-EU (No Visa)","Hungary":"EU","Iceland":"EU","Indonesia":"Non-EU (VBD)","Ireland":"EU","Israel":"EU","Italy":"EU","Japan":"Non-EU (No Visa)","Jordan":"Non-EU (VBD)","Kazakhstan":"Non-EU (VBD)","Kuwait":"Non-EU (VBD)","Latvia":"EU","Liechtenstein":"EU","Lithuania":"EU","Luxembourg":"EU","Malaysia":"Non-EU (No Visa)","Malta":"EU","Mexico":"Non-EU (No Visa)","Moldova":"Non-EU (VBD)","Monaco":"EU","Mongolia":"Non-EU (VBD)","Montenegro":"Non-EU (VBD)","Morocco":"Non-EU (VBD)","Netherlands":"EU","New Zealand":"Non-EU (VBD)","Nicaragua":"Non-EU (No Visa)","Norway":"EU","Oman":"Non-EU (VBD)","Panama":"Non-EU (No Visa)","Paraguay":"Non-EU (No Visa)","Peru":"Non-EU (VBD)","Poland":"EU","Portugal":"EU","Qatar":"Non-EU (No Visa)","Romania":"EU","Russia":"Non-EU (VBD)","San Marino":"EU","Saudi Arabia":"Non-EU (No Visa)","Serbia":"Non-EU (VBD)","Singapore":"Non-EU (VBD)","Slovakia":"EU","Slovenia":"EU","South Korea":"Non-EU (No Visa)","Spain":"EU","Sweden":"EU","Switzerland":"EU","Taiwan":"Non-EU (No Visa)","Turkey":"Non-EU (VBD)","Ukraine":"Non-EU (VBD)","United Arab Emirates":"Non-EU (VBD)","United Kingdom":"EU","United States":"Non-EU (VBD)","Uruguay":"Non-EU (No Visa)","Uzbekistan":"Non-EU (VBD)","Vatican City":"EU"};

  // ── Live HubSpot pull — quotes, invoices, payments, totals ──
  // Single round-trip source for the dashboard. Polled on dashboard load (refresh button).
  async function liveFinance(agencyId: number) {
    if (!HUBSPOT_PAT) return { quotes: [], invoices: [], totals: { billed: 0, paid: 0, balance: 0 }, dealCount: 0, commissionRate: 0, commissionsEarned: 0 };

    // Get the agency's HubSpot company ID + commission.
    // NOTE: commissionRate is a cached mirror of HubSpot's value, refreshed weekly
    // by scripts/sync-commissions.ts. Authoritative source is the HubSpot company
    // `commission` property. We keep a copy here for low-latency reads (incentive
    // projections, dashboard). Do not WRITE to it from the portal code.
    const agency = await prisma.agency.findUnique({
      where: { id: agencyId },
      select: { hubspotCompanyId: true, commissionRate: true, name: true },
    });
    if (!agency?.hubspotCompanyId) {
      return { quotes: [], invoices: [], totals: { billed: 0, paid: 0, balance: 0 }, dealCount: 0, commissionRate: 0, commissionsEarned: 0 };
    }

    // 1. All deals for the company
    const dealsRes = await hsRequest('GET', `/crm/v4/objects/companies/${agency.hubspotCompanyId}/associations/deals`);
    const dealIds: string[] = (dealsRes.results || []).map((r: any) => String(r.toObjectId));
    if (dealIds.length === 0) {
      return { quotes: [], invoices: [], totals: { billed: 0, paid: 0, balance: 0 }, dealCount: 0, commissionRate: Number(agency.commissionRate) || 0, commissionsEarned: 0 };
    }

    // 2. Pull quotes and invoices for all deals in parallel
    const [quoteLists, invoiceLists] = await Promise.all([
      Promise.all(dealIds.map(id => hsRequest('GET', `/crm/v4/objects/deals/${id}/associations/quotes`))),
      Promise.all(dealIds.map(id => hsRequest('GET', `/crm/v4/objects/deals/${id}/associations/invoices`))),
    ]);

    const quoteIds = new Set<string>();
    const dealByQuote: Record<string, string> = {};
    quoteLists.forEach((lst: any, i: number) => {
      for (const r of lst.results || []) {
        const qId = String(r.toObjectId);
        quoteIds.add(qId);
        dealByQuote[qId] = dealIds[i];
      }
    });

    const invoiceIds = new Set<string>();
    const dealByInvoice: Record<string, string> = {};
    invoiceLists.forEach((lst: any, i: number) => {
      for (const r of lst.results || []) {
        const iId = String(r.toObjectId);
        invoiceIds.add(iId);
        dealByInvoice[iId] = dealIds[i];
      }
    });

    // 3. Batch-read quote + invoice details in parallel
    const [quoteBatch, invoiceBatch] = await Promise.all([
      quoteIds.size ? hsRequest('POST', '/crm/v3/objects/quotes/batch/read', {
        properties: ['hs_status', 'hs_title', 'hs_quote_amount', 'hs_quote_number', 'hs_expiration_date', 'hs_createdate', 'hs_quote_link', 'hs_pdf_download_link'],
        inputs: Array.from(quoteIds).map(id => ({ id })),
      }) : Promise.resolve({ results: [] }),
      invoiceIds.size ? hsRequest('POST', '/crm/v3/objects/invoices/batch/read', {
        properties: ['hs_number', 'hs_invoice_status', 'hs_amount_billed', 'hs_amount_paid', 'hs_balance_due', 'hs_invoice_date', 'hs_due_date', 'hs_pdf_download_link', 'hs_invoice_link', 'hs_title'],
        inputs: Array.from(invoiceIds).map(id => ({ id })),
      }) : Promise.resolve({ results: [] }),
    ]);

    // 4. Filter + shape quotes — only approved/pending (hide drafts), join with partner action state
    const rawPublished = (quoteBatch.results || [])
      .filter((q: any) => q.properties?.hs_status && q.properties.hs_status !== 'DRAFT');

    // Look up partner actions for these quotes
    const actionRows = rawPublished.length ? await prisma.partnerQuoteAction.findMany({
      where: { quoteId: { in: rawPublished.map((q: any) => q.id) } },
      select: { quoteId: true, action: true, comments: true, createdAt: true },
    }) : [];
    const actionByQuote: Record<string, any> = {};
    for (const a of actionRows) actionByQuote[a.quoteId] = a;

    const publishedQuotes = rawPublished
      .map((q: any) => ({
        id: q.id,
        dealId: dealByQuote[q.id],
        status: q.properties.hs_status,
        title: q.properties.hs_title,
        amount: Number(q.properties.hs_quote_amount || 0),
        quoteNumber: q.properties.hs_quote_number,
        createdAt: q.properties.hs_createdate,
        expiresAt: q.properties.hs_expiration_date,
        publicUrl: q.properties.hs_quote_link || null,
        pdfUrl: q.properties.hs_pdf_download_link || null,
        partnerAction: actionByQuote[q.id]?.action || null,     // 'ACCEPTED' | 'QUERIED' | null
        partnerActionAt: actionByQuote[q.id]?.createdAt || null,
        partnerComments: actionByQuote[q.id]?.comments || null,
      }))
      .sort((a: any, b: any) => (b.createdAt || '').localeCompare(a.createdAt || ''));

    // 5. Filter + shape invoices — exclude drafts
    const invoices = (invoiceBatch.results || [])
      .filter((inv: any) => inv.properties?.hs_invoice_status && inv.properties.hs_invoice_status !== 'draft')
      .map((inv: any) => ({
        id: inv.id,
        dealId: dealByInvoice[inv.id],
        number: inv.properties.hs_number,
        status: inv.properties.hs_invoice_status,
        billed: Number(inv.properties.hs_amount_billed || 0),
        paid: Number(inv.properties.hs_amount_paid || 0),
        balance: Number(inv.properties.hs_balance_due || 0),
        invoiceDate: inv.properties.hs_invoice_date,
        dueDate: inv.properties.hs_due_date,
        pdfUrl: inv.properties.hs_pdf_download_link,
        invoiceUrl: inv.properties.hs_invoice_link,
      }))
      .sort((a: any, b: any) => (b.invoiceDate || '').localeCompare(a.invoiceDate || ''));

    // 6. Totals from live invoices (source of truth for partner's financial view)
    const billed = invoices.reduce((s: number, i: any) => s + i.billed, 0);
    const paid = invoices.reduce((s: number, i: any) => s + i.paid, 0);
    const balance = invoices.reduce((s: number, i: any) => s + i.balance, 0);

    const commissionRate = Number(agency.commissionRate) || 0;
    const commissionsEarned = billed * (commissionRate / 100);

    return {
      quotes: publishedQuotes,
      invoices,
      totals: { billed, paid, balance },
      dealCount: dealIds.length,
      commissionRate,
      commissionsEarned,
    };
  }

  // ── Record a partner quote action (ACCEPT or QUERY) ──
  //    Writes to SIS partner_quote_actions + creates a HubSpot Task on the deal.
  async function recordQuoteAction(
    agencyId: number,
    agencyName: string,
    data: { quoteId: string; dealId: string; action: 'ACCEPTED' | 'QUERIED'; comments?: string }
  ) {
    if (!HUBSPOT_PAT) throw new Error('HubSpot not configured');
    if (!data.quoteId || !data.dealId || !data.action) {
      return { success: false, error: 'Missing quoteId, dealId, or action' };
    }
    if (data.action !== 'ACCEPTED' && data.action !== 'QUERIED') {
      return { success: false, error: 'Invalid action' };
    }

    // 1. Upsert the action record in SIS (idempotent by quoteId)
    await prisma.partnerQuoteAction.upsert({
      where: { quoteId: data.quoteId },
      create: {
        quoteId: data.quoteId,
        dealId: data.dealId,
        agencyId,
        action: data.action,
        comments: data.comments || null,
      },
      update: {
        action: data.action,
        comments: data.comments || null,
      },
    });

    // 2. Create a HubSpot Task on the deal for staff to action
    const subject = data.action === 'ACCEPTED'
      ? `Quote Accepted — Convert to Invoice (${agencyName})`
      : `Quote Queried by Partner (${agencyName})`;

    const body = data.action === 'ACCEPTED'
      ? `${agencyName}: Accepted — please convert to invoice.`
      : `${agencyName}: "${data.comments || '(no reason provided)'}"`;

    const taskRes = await hsRequest('POST', '/crm/v3/objects/tasks', {
      properties: {
        hs_task_subject: subject,
        hs_task_body: body,
        hs_task_status: 'NOT_STARTED',
        hs_task_priority: data.action === 'QUERIED' ? 'HIGH' : 'MEDIUM',
        hs_timestamp: Date.now().toString(),
      },
    });

    if (taskRes.id) {
      // Associate task with the deal (associationTypeId 216 = task_to_deal)
      await hsRequest('PUT',
        `/crm/v4/objects/tasks/${taskRes.id}/associations/deals/${data.dealId}`,
        [{ associationCategory: 'HUBSPOT_DEFINED', associationTypeId: 216 }]
      );
    }

    return { success: true, taskId: taskRes.id || null };
  }

  async function enroll(agencyId: number, agencyName: string, data: any, partnerHubspotContactId?: string) {
    if (!HUBSPOT_PAT) throw new Error('HubSpot not configured');
    if (!data.firstName || !data.lastName || !data.nationality) {
      return { success: false, error: 'First name, last name, and nationality are required' };
    }

    // 1. Create or update contact.
    //    Email is optional for partner-submitted enrollments — some partners don't
    //    share student emails with us. We only include it if provided.
    const contactProps: Record<string, string> = {
      firstname: data.firstName,
      lastname: data.lastName,
      phone: data.phone || '',
      date_of_birth: data.dateOfBirth || '',
      nationality: data.nationality,
      type: 'Student-B2B',
      agent: agencyName,
    };
    if (data.email) contactProps.email = data.email;

    let contactId: string;
    const contactRes = await hsRequest('POST', '/crm/v3/objects/contacts', { properties: contactProps });

    if (contactRes.id) {
      contactId = contactRes.id;
    } else if (contactRes.status === 'error' && contactRes.category === 'CONFLICT') {
      // Contact exists — extract ID from error message
      const match = contactRes.message?.match(/Existing ID: (\d+)/);
      if (!match) return { success: false, error: 'Contact already exists but could not resolve ID' };
      contactId = match[1];
      await hsRequest('PATCH', '/crm/v3/objects/contacts/' + contactId, { properties: contactProps });
    } else {
      return { success: false, error: contactRes.message || 'Failed to create contact in HubSpot' };
    }

    // 2. Build deal properties — exact alignment with Drupal BookingEnrichmentWorker
    const rawTerritory = TERRITORY_MAP[data.nationality] || 'Unsupported Territory';
    const hsTerritory = resolveTerritory(rawTerritory);

    const dealProps: Record<string, any> = {
      dealname: `${data.firstName} ${data.lastName} — ${agencyName}`,
      pipeline: B2B_PIPELINE,
      dealstage: ENROLMENT_STAGE,
      course_type: mapCourseType(data),
    };

    // Territory — only send if supported
    if (hsTerritory) dealProps.territory = hsTerritory;

    // Course dates and weeks
    if (data.courseStart) dealProps.course_start = data.courseStart;
    if (data.courseEnd) dealProps.course_end = data.courseEnd;
    if (data.courseType !== 'private' && data.courseWeeks) {
      const weeks = parseInt(data.courseWeeks);
      dealProps.course_weeks = weeks;
      dealProps.course_duration = resolveWeekBand(weeks);
    }

    // Private hours (only for private lessons)
    if (data.courseType === 'private' && data.privateHours) {
      dealProps.private_hours = parseInt(data.privateHours);
    }

    // Junior pack
    if (data.courseType === 'junior' && data.juniorPack) {
      dealProps.junior_pack = data.juniorPack;
    }

    // Accommodation — exact mapping per resolveAccommType() / resolveRoomType()
    const accommMap: Record<string, string> = { host: 'Host Family', apartment: 'City Centre Apartment', hostel_hotel: 'Hostel' };
    if (data.accommType && data.accommType !== 'none') {
      dealProps.accomm_type = accommMap[data.accommType] || data.accommType;

      // Room type — hostel 'individual' maps to 'Standard', all others pass through
      if (data.accommRoom) {
        const hostelRoomMap: Record<string, string> = { individual: 'Standard', dorm: 'Dorm' };
        const aptRoomMap: Record<string, string> = { premium: 'Premium', superior: 'Superior', standard: 'Standard', twin_shared: 'Twin/Shared' };
        if (data.accommType === 'hostel_hotel') {
          dealProps.room_type = hostelRoomMap[data.accommRoom] || data.accommRoom;
        } else {
          dealProps.room_type = aptRoomMap[data.accommRoom] || data.accommRoom;
        }
      }

      if (data.accommStart) dealProps.accomm_start = data.accommStart;
      if (data.accommEnd) dealProps.accomm_end = data.accommEnd;
      if (data.accommWeeks) dealProps.accomm_weeks = parseInt(data.accommWeeks);
    }

    // Extras — booleans as strings, matching Drupal enrichment behaviour
    const extras: string[] = Array.isArray(data.extras) ? data.extras : data.extras ? [data.extras] : [];
    dealProps.airport_pickup = extras.includes('airport_pickup') ? 'true' : 'false';
    dealProps.airport_dropoff = extras.includes('airport_dropoff') ? 'true' : 'false';

    // AY + LifePass auto-bundle: Exam Fee + PEL/Health Insurance are always included.
    // Server-side enforced so a frontend that "forgets" to send them still produces a valid deal,
    // matching the Drupal/B2C enrichment behaviour. exam_type is intentionally left null —
    // it's filled in once the student sits the level test.
    const isBundled = data.courseType === 'lifepass' || data.courseType === 'academic_year';

    if (isBundled) {
      dealProps.exam_fee = 'true';
      dealProps.insurance = 'PEL;Health';
    } else {
      dealProps.exam_fee = extras.includes('exam_fee') ? 'true' : 'false';
      const insuranceParts: string[] = [];
      if (extras.includes('insurance_pel')) insuranceParts.push('PEL');
      if (extras.includes('insurance_health')) insuranceParts.push('Health');
      if (insuranceParts.length) dealProps.insurance = insuranceParts.join(';');
    }

    // Extras sub-fields — timestamps as Unix ms at midnight UTC
    if (extras.includes('airport_pickup') && data.pickupTime) {
      const d = new Date(data.pickupTime); d.setUTCHours(0,0,0,0);
      dealProps.airport_pickup_time = d.getTime();
    }
    if (extras.includes('airport_dropoff') && data.dropoffTime) {
      const d = new Date(data.dropoffTime); d.setUTCHours(0,0,0,0);
      dealProps.airport_dropoff_time = d.getTime();
    }
    // Exam type only set when a non-bundled exam fee is selected and a sub-type chosen.
    // For AY/LifePass we leave exam_type unset (level test happens later).
    if (!isBundled && extras.includes('exam_fee') && data.examTypeExtra) {
      const examMap: Record<string, string> = { ielts: 'IELTS', fce: 'FCE', cae: 'CAE' };
      dealProps.exam_type = examMap[data.examTypeExtra] || data.examTypeExtra;
    }

    if (data.notes) dealProps.description = data.notes;

    // 3. Create deal
    const dealRes = await hsRequest('POST', '/crm/v3/objects/deals', { properties: dealProps });
    if (!dealRes.id) return { success: false, error: dealRes.message || 'Failed to create deal in HubSpot' };
    const dealId = dealRes.id;

    // 4. Associate deal ↔ student contact (B2B Student)
    await hsRequest('PUT', `/crm/v4/objects/deals/${dealId}/associations/contacts/${contactId}`,
      [{ associationCategory: 'HUBSPOT_DEFINED', associationTypeId: 3 }]);

    // 5. Associate deal with the Partner's Primary Entity (Company OR Agent Employee Contact).
    //    This is authoritative: stored on the agency record at onboarding, not inferred at login.
    const agency = await prisma.agency.findUnique({
      where: { id: agencyId },
      select: { primaryEntityId: true, primaryEntityType: true, hubspotCompanyId: true },
    });

    if (agency?.primaryEntityId) {
      if (agency.primaryEntityType === 'company') {
        // Deal ↔ Company + Student Contact ↔ Company
        await hsRequest('PUT', `/crm/v4/objects/deals/${dealId}/associations/companies/${agency.primaryEntityId}`,
          [{ associationCategory: 'HUBSPOT_DEFINED', associationTypeId: 5 }]);
        await hsRequest('PUT', `/crm/v4/objects/contacts/${contactId}/associations/companies/${agency.primaryEntityId}`,
          [{ associationCategory: 'HUBSPOT_DEFINED', associationTypeId: 1 }]);
      } else if (agency.primaryEntityType === 'contact') {
        // Sole trader — deal ↔ Agent Employee contact
        if (agency.primaryEntityId !== contactId) {
          await hsRequest('PUT', `/crm/v4/objects/deals/${dealId}/associations/contacts/${agency.primaryEntityId}`,
            [{ associationCategory: 'HUBSPOT_DEFINED', associationTypeId: 3 }]);
        }
      }
    }

    // 6. Attach the submitting partner's own HubSpot Contact (for email routing).
    //    Whoever logged in and submitted this enrollment is the person whose email
    //    the ULearn team will reply to. This is the SisUser's stored hubspotContactId
    //    (captured at registration), not an agency-wide "primary" contact — partners
    //    self-select by logging in with the right account (admissions vs accounts, etc).
    if (partnerHubspotContactId && partnerHubspotContactId !== contactId) {
      try {
        await hsRequest('PUT', `/crm/v4/objects/deals/${dealId}/associations/contacts/${partnerHubspotContactId}`,
          [{ associationCategory: 'HUBSPOT_DEFINED', associationTypeId: 3 }]);
      } catch { /* non-fatal */ }
    }

    return { success: true, dealId, contactId };
  }

  // ── Student detail (agency-scoped single-student drilldown) ──
  async function studentDetail(agencyId: number, studentId: number) {
    // Agency-scope check baked in: student must have at least one booking with this agency
    const student = await prisma.student.findFirst({
      where: {
        id: studentId,
        bookings: { some: { agencyId } },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        phoneMobile: true,
        birthday: true,
        nationality: true,
        currentLevel: true,
        profilePicture: true,
        studentType: true,
        // Only bookings belonging to the partner's agency
        bookings: {
          where: { agencyId },
          select: {
            id: true,
            status: true,
            serviceStart: true,
            serviceEnd: true,
            amountTotal: true,
            amountPaid: true,
            amountOpen: true,
            currency: true,
            courses: {
              select: { name: true, level: true, startDate: true, endDate: true, weeks: true, hoursPerWeek: true, category: true },
              orderBy: { startDate: 'asc' },
            },
            accommodations: {
              select: { accommodationType: true, roomType: true, startDate: true, endDate: true, weeks: true },
              orderBy: { startDate: 'asc' },
            },
            payments: {
              select: { amount: true, method: true, paymentDate: true, type: true },
              orderBy: { paymentDate: 'desc' },
              take: 10,
            },
          },
          orderBy: { serviceStart: 'desc' },
        },
      },
    });
    if (!student) return { success: false, error: 'Student not found' };
    return { success: true, student };
  }

  // ── Documents (Zoho-signed contracts mirrored to SIS) ──
  async function documents(agencyId: number) {
    const docs = await prisma.partnerDocument.findMany({
      where: { agencyId },
      select: {
        id: true,
        zohoRequestId: true,
        requestName: true,
        folderName: true,
        requestStatus: true,
        signedAt: true,
        createdAtZoho: true,
        signerEmail: true,
        signerName: true,
        pdfCachedPath: true,
      },
      orderBy: { signedAt: 'desc' },
    });
    return { documents: docs.map(d => ({ ...d, hasPdf: !!d.pdfCachedPath, pdfCachedPath: undefined })) };
  }

  // ── Self-service registration ────────────────
  //    Validates the email against HubSpot: must belong to a Contact whose company
  //    has a linked SIS agency (primary_entity_type = 'company'), OR the Contact is
  //    itself the primary_entity for a sole-trader agency. If valid, creates a
  //    SisUser with user_type='partner' and links it to the agency.
  async function registerPartner(data: {
    email?: string; username?: string; password?: string;
  }) {
    if (!HUBSPOT_PAT) {
      console.warn(`[registerPartner] REJECT service-unavailable email="${data.email}"`);
      return { success: false, error: 'Service not available' };
    }

    const email = String(data.email || '').toLowerCase().trim();
    const username = String(data.username || '').trim();
    const password = String(data.password || '');

    // Basic validation
    if (!email || !username || !password) {
      console.warn(`[registerPartner] REJECT missing-fields email="${email}" username="${username}" pwLen=${password.length}`);
      return { success: false, error: 'All fields are required' };
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      console.warn(`[registerPartner] REJECT invalid-email "${email}"`);
      return { success: false, error: 'Invalid email address' };
    }
    if (username.length < 3 || /\s/.test(username)) {
      console.warn(`[registerPartner] REJECT invalid-username "${username}" for ${email}`);
      return { success: false, error: 'Username must be at least 3 characters and contain no spaces' };
    }
    if (password.length < 8) {
      console.warn(`[registerPartner] REJECT short-password email="${email}" len=${password.length}`);
      return { success: false, error: 'Password must be at least 8 characters' };
    }

    // Uniqueness checks
    const existingUser = await prisma.sisUser.findUnique({ where: { username } });
    if (existingUser) {
      console.warn(`[registerPartner] REJECT username-taken "${username}" attempted by ${email}`);
      return { success: false, error: 'Username already taken — choose another' };
    }

    const existingEmail = await prisma.sisUser.findFirst({ where: { email } });
    if (existingEmail) {
      console.warn(`[registerPartner] REJECT email-taken ${email} (existing user #${existingEmail.id})`);
      return { success: false, error: 'An account already exists for this email — use Forgot Password to reset' };
    }

    // ── Gate: are you a known partner in HubSpot? ─────────────────────
    // Pass if EITHER:
    //   (a) an Employee-typed Contact exists with this exact email, OR
    //   (b) the email's domain matches a HubSpot Company.
    // Student-typed contacts are rejected (gate leak prevention).
    const searchRes = await hsRequest('POST', '/crm/v3/objects/contacts/search', {
      filterGroups: [{ filters: [{ propertyName: 'email', operator: 'EQ', value: email }] }],
      properties: ['email', 'firstname', 'lastname', 'type'],
      limit: 1,
    });
    let contact = searchRes.results?.[0] || null;
    let contactId: string | null = null;
    let domainCompanyId: string | null = null;
    let domainCompanyName: string | null = null;

    if (contact) {
      const ctype = String(contact.properties?.type || '').toLowerCase();
      // Block student contacts from the partner portal
      if (ctype.startsWith('student')) {
        console.warn(`[registerPartner] REJECT student-contact ${email} (HS contact ${contact.id}, type="${ctype}")`);
        return { success: false, error: 'This email belongs to a student account. Partner registration is for agent employees only.' };
      }
      contactId = contact.id;
    }

    // Domain check — always run (covers: contact missing; also validates Employees
    // whose type field isn't yet set).
    const domain = email.split('@')[1] || '';
    if (domain) {
      const dcSearch = await hsRequest('POST', '/crm/v3/objects/companies/search', {
        filterGroups: [{ filters: [{ propertyName: 'domain', operator: 'EQ', value: domain }] }],
        properties: ['name', 'domain'],
        limit: 1,
      });
      const dc = dcSearch.results?.[0];
      if (dc) {
        domainCompanyId = dc.id;
        domainCompanyName = dc.properties?.name || null;
      }
    }

    // If neither a contact nor a domain-matched company — reject
    if (!contactId && !domainCompanyId) {
      console.warn(`[registerPartner] REJECT gate-miss ${email} — no HS contact, no domain-matched company (domain="${domain}")`);
      return { success: false, error: 'Email not recognised. Please contact us at partners@ulearnschool.com.' };
    }

    // Derive display name from HubSpot contact if available — fall back to email local-part
    const cfn = (contact?.properties?.firstname || '').trim();
    const cln = (contact?.properties?.lastname || '').trim();
    const displayName = `${cfn} ${cln}`.trim() || email.split('@')[0];

    // ── Resolve SIS agency ──────────────────────────────────────────
    // Gate passed. Now find-or-create an SIS agency row to tie this user to.
    // Preference order:
    //   1. HubSpot company linked to this contact → find-or-create in SIS
    //   2. Domain-matched HubSpot company → find-or-create in SIS
    //   3. Contact with no company (sole trader) → find-or-create contact-primary agency
    // Any Fidelo-era orphan rows with corrupted names are ignored — they're legacy.
    let agencyId: number | null = null;

    // Gather candidate company IDs: first from contact's associations, then from domain match
    const candidateCompanyIds: string[] = [];
    if (contactId) {
      const compAssoc = await hsRequest('GET', `/crm/v4/objects/contacts/${contactId}/associations/companies`);
      for (const r of compAssoc.results || []) candidateCompanyIds.push(String(r.toObjectId));
    }
    if (domainCompanyId && !candidateCompanyIds.includes(domainCompanyId)) {
      candidateCompanyIds.push(domainCompanyId);
    }

    // Step 1: find-or-create SIS agency per candidate company
    for (const cid of candidateCompanyIds) {
      const existing = await prisma.agency.findFirst({ where: { hubspotCompanyId: cid } });
      if (existing) { agencyId = existing.id; break; }

      try {
        const company = await hsRequest('GET', `/crm/v3/objects/companies/${cid}?properties=name`);
        const companyName = company?.properties?.name || domainCompanyName || `HubSpot Company ${cid}`;
        const newAgency = await prisma.agency.create({
          data: {
            name: companyName,
            hubspotCompanyId: cid,
            primaryEntityId: cid,
            primaryEntityType: 'company',
          } as any,
        });
        agencyId = newAgency.id;
        console.log(`[registerPartner] Auto-created SIS agency #${agencyId} "${companyName}" linked to HubSpot company ${cid}`);
        break;
      } catch (e: any) {
        console.warn(`[registerPartner] Auto-create agency failed for company ${cid}: ${e.message}`);
      }
    }

    // Step 2: sole-trader path — contact exists but no company anywhere
    if (!agencyId && contactId) {
      const existing = await prisma.agency.findFirst({
        where: { primaryEntityId: contactId, primaryEntityType: 'contact' },
      });
      if (existing) {
        agencyId = existing.id;
      } else {
        try {
          const contactFullName = displayName;
          const newAgency = await prisma.agency.create({
            data: {
              name: contactFullName,
              primaryEntityId: contactId,
              primaryEntityType: 'contact',
            } as any,
          });
          agencyId = newAgency.id;
          console.log(`[registerPartner] Auto-created sole-trader agency #${agencyId} "${contactFullName}" for contact ${contactId}`);
        } catch (e: any) {
          console.warn(`[registerPartner] Sole-trader auto-create failed for contact ${contactId}: ${e.message}`);
        }
      }
    }

    if (!agencyId) {
      // Unreachable in practice (gate passed so we have either contact or company),
      // but leave a safety net.
      console.warn(`[registerPartner] REJECT agency-link-failed ${email} contactId=${contactId} companies=${JSON.stringify(candidateCompanyIds)}`);
      return { success: false, error: 'Could not link your agency. Please contact us at partners@ulearnschool.com.' };
    }

    // Create the user — cache their HubSpot Contact ID now (used later when they
    // submit enrollments — the Deal gets associated with this specific person).
    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = await prisma.sisUser.create({
      data: {
        username,
        email,
        passwordHash,
        displayName,
        role: 'partner',
        userType: 'partner',
        agencyId,
        hubspotContactId: contactId,
        active: true,
      },
    });
    console.log(`[registerPartner] SUCCESS user #${newUser.id} ${email} → agency #${agencyId}`);

    // Fire-and-forget Zoho contract sync so any historical docs for this
    // partner's domain/agency get mapped + cached locally before they log in.
    // We don't await — the registration response returns immediately.
    (async () => {
      try {
        const { syncContracts } = await import('./sync-contracts');
        await syncContracts(prisma);
      } catch (e: any) {
        console.warn(`[registerPartner] Background doc sync failed: ${e?.message || e}`);
      }
    })();

    return { success: true, userId: newUser.id };
  }

  return { dashboard, students, studentDetail, bookings, finance, enroll, liveFinance, recordQuoteAction, registerPartner, documents };
}
