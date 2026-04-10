import { PrismaClient, DocumentStatus } from '../generated/prisma/client';
import crypto from 'crypto';
import QRCode from 'qrcode';
import puppeteer from 'puppeteer';

const BASE_URL = process.env.BASE_URL || 'https://sis.ulearnschool.com';

export function documentScripts(prisma: PrismaClient) {

  // ── TEMPLATES ──────────────────────────────

  async function listTemplates(activeOnly = true, templateType?: string) {
    const where: any = {};
    if (activeOnly) where.active = true;
    if (templateType) where.templateType = templateType;
    return prisma.documentTemplate.findMany({
      where,
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
      include: { _count: { select: { records: true } } },
    });
  }

  async function getTemplate(id: number) {
    return prisma.documentTemplate.findUnique({ where: { id } });
  }

  async function createTemplate(data: {
    name: string; slug: string; category?: string; documentType: string;
    htmlTemplate: string; tokenSchema?: string;
  }) {
    return prisma.documentTemplate.create({ data });
  }

  async function updateTemplate(id: number, data: {
    name?: string; category?: string; htmlTemplate?: string; tokenSchema?: string; active?: boolean;
  }) {
    // Bump version when template content changes
    const current = await prisma.documentTemplate.findUnique({ where: { id } });
    if (!current) throw new Error('Template not found');
    const bump = data.htmlTemplate && data.htmlTemplate !== current.htmlTemplate;
    return prisma.documentTemplate.update({
      where: { id },
      data: { ...data, ...(bump ? { version: current.version + 1 } : {}) },
    });
  }

  // ── HUBSPOT COMMISSION FETCH ──────────────────
  // Per the CLAUDE.md agency-data rule: commission rates must come from HubSpot,
  // not from the local `agencies.commission_rate` column (which is Fidelo-era stale
  // data kept only for FK joins). This helper fetches the live rate.
  // The exact HubSpot Company property name may need adjustment — override with
  // HUBSPOT_COMMISSION_PROPERTY env var if the internal name differs.
  const HS_COMMISSION_PROP = process.env.HUBSPOT_COMMISSION_PROPERTY || 'commission';

  async function fetchHubspotCommissionRate(hubspotCompanyId: string): Promise<number | null> {
    const token = process.env.ACCESS_TOKEN;
    if (!token) return null;
    try {
      const https = await import('https');
      const data = await new Promise<any>((resolve, reject) => {
        https.get({
          hostname: 'api.hubapi.com',
          path: `/crm/v3/objects/companies/${encodeURIComponent(hubspotCompanyId)}?properties=${HS_COMMISSION_PROP}`,
          headers: { Authorization: `Bearer ${token}` },
        }, (res) => {
          let body = '';
          res.on('data', (c: string) => body += c);
          res.on('end', () => { try { resolve(JSON.parse(body)); } catch (e) { reject(e); } });
        }).on('error', reject);
      });
      const raw = data?.properties?.[HS_COMMISSION_PROP];
      if (raw == null || raw === '') return null;
      const n = Number(raw);
      if (isNaN(n)) return null;
      // HubSpot stores commission as a decimal (0.3 = 30%) — convert to percentage.
      // Defensive: if someone enters "30" instead of "0.3", treat values >= 1 as already-percent.
      return n < 1 ? n * 100 : n;
    } catch {
      return null;
    }
  }

  // ── TOKEN RESOLUTION ──────────────────────

  async function resolveTokens(studentId: number, bookingId?: number | null) {
    const student = await prisma.student.findUnique({ where: { id: studentId } });
    if (!student) throw new Error('Student not found');

    const booking = bookingId
      ? await prisma.booking.findUnique({
          where: { id: bookingId },
          include: { courses: true, accommodations: true, agency: true },
        })
      : null;

    // Commission rate (HubSpot-authoritative — see CLAUDE.md agency rule)
    const hsCompanyId = (booking as any)?.agency?.hubspotCompanyId;
    const hsCommissionRate: number | null = hsCompanyId ? await fetchHubspotCommissionRate(hsCompanyId) : null;

    const course = booking?.courses?.[0];

    // Gender-based pronouns (replaces Fidelo's {if gender =="Male"} conditionals)
    const isMale = student.gender === 1;
    const salutation = isMale ? 'Mr.' : 'Ms.';

    // Accommodation (first placement if exists)
    const accomm = booking?.accommodations?.[0];
    let accommProvider: any = null;
    if (accomm?.bedId) {
      const bed = await prisma.accommodationBed.findUnique({
        where: { id: accomm.bedId },
        include: { room: { include: { property: { include: { provider: true } } } } },
      });
      accommProvider = bed?.room?.property?.provider;
    }

    const fmtDate = (d: any) => d ? new Date(d).toLocaleDateString('en-IE', { day: '2-digit', month: 'long', year: 'numeric' }) : '';

    const tokens: Record<string, string> = {
      // Student
      'student.full_name': `${student.firstName} ${student.lastName}`,
      'student.first_name': student.firstName,
      'student.last_name': student.lastName,
      'student.email': student.email || '',
      'student.dob': fmtDate(student.birthday),
      'student.nationality': student.nationality || '',
      'student.passport_number': student.passportNumber || '',
      'student.passport_number_masked': student.passportNumber ? student.passportNumber.slice(0, -4).replace(/./g, '*') + student.passportNumber.slice(-4) : '',
      'student.student_type': student.studentType || '',
      'student.current_level': student.currentLevel || '',
      'student.photo': student.profilePicture || '',
      'student.id': String(student.id),
      'student.salutation': salutation,
      'student.gender': isMale ? 'Male' : 'Female',
      'student.allergies': student.allergies || '',
      'student.address': [student.address, student.addressAddon, student.city, student.zip].filter(Boolean).join(', '),
      'student.phone': student.phoneMobile || student.phone || '',
      'student.emergency_phone': student.emergencyPhone || '',
      'student.age': student.birthday ? String(Math.floor((Date.now() - new Date(student.birthday).getTime()) / (365.25 * 24 * 60 * 60 * 1000))) : '',
      'student.language': (student as any).language || (student as any).contactLanguage || '',
      'student.attendance_rate': '', // computed at render time from attendance records

      // Gender pronouns (replaces Fidelo {if gender} blocks)
      'student.pronoun_subject': isMale ? 'he' : 'she',
      'student.pronoun_object': isMale ? 'him' : 'her',
      'student.pronoun_possessive': isMale ? 'his' : 'her',
      'student.pronoun_possessive_cap': isMale ? 'His' : 'Her',
      'student.pronoun_subject_cap': isMale ? 'He' : 'She',

      // Booking
      'booking.reference': booking ? `BK-${new Date().getFullYear()}-${String(booking.id).padStart(6, '0')}` : '',
      'booking.status': booking?.status || '',
      'booking.start_date': fmtDate(course?.startDate),
      'booking.end_date': fmtDate(course?.endDate),
      'booking.course_name': course?.name || '',
      'booking.course_level': course?.level || '',
      'booking.hours_per_week': course?.hoursPerWeek ? String(course.hoursPerWeek) : '',
      'booking.weeks': course?.weeks ? String(course.weeks) : '',
      'booking.amount_total': booking?.amountTotal ? `€${booking.amountTotal}` : '',
      'booking.agency': (booking as any)?.agency?.name || '',
      'booking.amount_paid': booking?.amountPaid ? `€${Number(booking.amountPaid).toFixed(2)}` : '',
      'booking.amount_open': booking?.amountOpen ? `€${Number(booking.amountOpen).toFixed(2)}` : '',
      'booking.currency': booking?.currency || 'EUR',

      // Agency / Commission
      'agency.name': (booking as any)?.agency?.name || '',
      'agency.contact': (booking as any)?.agency?.contactPerson || '',
      'agency.email': (booking as any)?.agency?.email || '',
      'agency.commission_rate': (booking as any)?.agency?.commissionRate ? String((booking as any).agency.commissionRate) + '%' : '',
      'agency.commission_amount': (() => {
        const rate = Number((booking as any)?.agency?.commissionRate || 0);
        const total = Number(booking?.amountTotal || 0);
        return rate > 0 ? `€${(total * rate / 100).toFixed(2)}` : '';
      })(),
      'agency.net_amount': (() => {
        const rate = Number((booking as any)?.agency?.commissionRate || 0);
        const total = Number(booking?.amountTotal || 0);
        return rate > 0 ? `€${(total - (total * rate / 100)).toFixed(2)}` : booking?.amountTotal ? `€${Number(booking.amountTotal).toFixed(2)}` : '';
      })(),

      // Course fee breakdown
      'booking.course_fee': course?.fee ? `€${Number(course.fee).toFixed(2)}` : booking?.amountTotal ? `€${Number(booking.amountTotal).toFixed(2)}` : '',
      'booking.course_commission': (() => {
        const rate = Number((booking as any)?.agency?.commissionRate || 0);
        const fee = Number(course?.fee || booking?.amountTotal || 0);
        return rate > 0 ? `€${(fee * rate / 100).toFixed(2)}` : '';
      })(),
      'booking.course_net': (() => {
        const rate = Number((booking as any)?.agency?.commissionRate || 0);
        const fee = Number(course?.fee || booking?.amountTotal || 0);
        return rate > 0 ? `€${(fee - (fee * rate / 100)).toFixed(2)}` : `€${fee.toFixed(2)}`;
      })(),
      // Net-to-Gross transformation for the Net-to-Gross Invoice document.
      // booking.amountTotal is the NET amount (post Xero-sync flip). Gross is
      // derived via the complement of the commission rate:
      //   Gross = Net ÷ (1 − rate/100)      // 22% → Gross = Net ÷ 0.78
      // Commission rate is fetched from HubSpot (never local) per the
      // agency-data rule in CLAUDE.md.
      'booking.gross_from_net': (() => {
        const rate = hsCommissionRate;
        const net = Number(course?.fee || booking?.amountTotal || 0);
        if (rate == null || rate <= 0 || rate >= 100) {
          // No live HubSpot rate — can't derive gross. Return net as a safe fallback
          // so the template still renders without blowing up.
          return net ? `€${net.toFixed(2)}` : '';
        }
        const gross = net / (1 - rate / 100);
        return `€${gross.toFixed(2)}`;
      })(),

      // Visa
      'student.visa_until': fmtDate(student.visaUntil),

      // Accommodation
      'accommodation.contact_name': accommProvider?.contactPerson || '',
      'accommodation.provider_name': accommProvider?.name || '',
      'accommodation.address': accommProvider ? [accommProvider.address, accommProvider.addressAddon, accommProvider.city, accommProvider.zip].filter(Boolean).join(', ') : '',
      'accommodation.phone': accommProvider?.phone || accommProvider?.mobile || '',
      'accommodation.email': accommProvider?.email || '',
      'accommodation.start_date': fmtDate(accomm?.startDate),
      'accommodation.end_date': fmtDate(accomm?.endDate),
      'accommodation.weeks': accomm?.weeks ? String(accomm.weeks) : '',
      'accommodation.room_type': accomm?.roomType || '',
      'accommodation.board': accomm?.board || '',
      'accommodation.type': accomm?.accommodationType || '',

      // Institution
      'institution.name': 'ULearn English Language School',
      'institution.address': 'Dublin, Ireland',

      // Document (placeholders — replaced at issue time)
      'document.issue_date': new Date().toLocaleDateString('en-IE', { day: '2-digit', month: 'long', year: 'numeric' }),
    };

    return { tokens, student, booking };
  }

  function renderTemplate(htmlTemplate: string, tokens: Record<string, string>): string {
    return htmlTemplate.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
      const trimmed = key.trim();
      // Keep custom.* and document.* placeholders (resolved later or editable)
      if (trimmed.startsWith('custom.') || trimmed.startsWith('document.')) {
        return tokens[trimmed] !== undefined ? tokens[trimmed] : match;
      }
      // For all other tokens: output value if set, empty string if missing/empty
      return tokens[trimmed] || '';
    });
  }

  // ── DOCUMENT RECORDS ──────────────────────

  async function generateDraft(templateId: number, studentId: number, bookingId?: number | null) {
    const template = await prisma.documentTemplate.findUnique({ where: { id: templateId } });
    if (!template) throw new Error('Template not found');

    const { tokens } = await resolveTokens(studentId, bookingId);
    const rendered = renderTemplate(template.htmlTemplate, tokens);

    // Find missing tokens (exclude custom blocks and document.* tokens resolved at issue time)
    const missing = (rendered.match(/\{\{[^}]+\}\}/g) || [])
      .filter(t => !t.includes('custom.') && !t.includes('document.'));

    const record = await prisma.documentRecord.create({
      data: {
        studentId,
        bookingId: bookingId || null,
        templateId: template.id,
        documentType: template.documentType,
        sourceJson: JSON.stringify(tokens),
        contentHtml: rendered,
        templateVersion: template.version,
        status: 'DRAFT',
      },
    });

    return { record, missing, tokens };
  }

  async function getDocument(id: number) {
    return prisma.documentRecord.findUnique({
      where: { id },
      include: { template: true, dispatches: true, supersededBy: true },
    });
  }

  async function listDocuments(filters: { studentId?: number; bookingId?: number; status?: DocumentStatus } = {}) {
    const where: any = {};
    if (filters.studentId) where.studentId = filters.studentId;
    if (filters.bookingId) where.bookingId = filters.bookingId;
    if (filters.status) where.status = filters.status;
    const docs = await prisma.documentRecord.findMany({
      where,
      include: { template: { select: { name: true, slug: true } } },
      orderBy: { createdAt: 'desc' },
    });
    // Hydrate student names in a single query
    const studentIds = Array.from(new Set(docs.map(d => d.studentId)));
    const students = studentIds.length
      ? await prisma.student.findMany({
          where: { id: { in: studentIds } },
          select: { id: true, firstName: true, lastName: true },
        })
      : [];
    const byId = new Map(students.map(s => [s.id, s]));
    return docs.map(d => ({ ...d, student: byId.get(d.studentId) || null }));
  }

  async function updateDraft(id: number, data: { contentHtml?: string; editableFields?: string }) {
    const doc = await prisma.documentRecord.findUnique({ where: { id } });
    if (!doc) throw new Error('Document not found');
    if (doc.status !== 'DRAFT') throw new Error('Cannot edit: document is locked (status: ' + doc.status + ')');

    return prisma.documentRecord.update({
      where: { id },
      data: {
        contentHtml: data.contentHtml,
        editableFields: data.editableFields,
      },
    });
  }

  async function issueDocument(id: number, issuedBy: string) {
    const doc = await prisma.documentRecord.findUnique({ where: { id } });
    if (!doc) throw new Error('Document not found');
    if (doc.status !== 'DRAFT') throw new Error('Only drafts can be issued');

    const token = crypto.randomBytes(16).toString('base64url');
    const verificationUrl = `${BASE_URL}/sis/verify/${token}`;

    // Generate QR as data URI SVG
    const qrDataUri = await QRCode.toDataURL(verificationUrl, { type: 'image/png', width: 150, margin: 1 });

    // Inject QR into content
    let finalHtml = doc.contentHtml || '';
    finalHtml = finalHtml.replace(/\{\{document\.qr\}\}/g, `<img src="${qrDataUri}" alt="QR Verification" style="width:120px;height:120px">`);
    finalHtml = finalHtml.replace(/\{\{document\.verification_url\}\}/g, verificationUrl);
    finalHtml = finalHtml.replace(/\{\{document\.version\}\}/g, `v${doc.versionNo}.0`);
    finalHtml = finalHtml.replace(/\{\{document\.number\}\}/g, `DOC-${new Date().getFullYear()}-${String(id).padStart(6, '0')}`);

    const now = new Date();

    // Look up student photo for snapshot
    const student = await prisma.student.findUnique({ where: { id: doc.studentId }, select: { profilePicture: true } });

    return prisma.documentRecord.update({
      where: { id },
      data: {
        contentHtml: finalHtml,
        verificationToken: token,
        status: 'ISSUED',
        issuedAt: now,
        issuedBy,
        lockedAt: now,
        photoAssetUsed: student?.profilePicture || null,
      },
    });
  }

  async function createNewVersion(originalId: number) {
    const original = await prisma.documentRecord.findUnique({ where: { id: originalId } });
    if (!original) throw new Error('Document not found');

    // Supersede the original
    await prisma.documentRecord.update({
      where: { id: originalId },
      data: { status: 'SUPERSEDED' },
    });

    // Create new version as draft
    const newDoc = await prisma.documentRecord.create({
      data: {
        studentId: original.studentId,
        bookingId: original.bookingId,
        templateId: original.templateId,
        documentType: original.documentType,
        sourceJson: original.sourceJson,
        contentHtml: original.contentHtml,
        editableFields: original.editableFields,
        templateVersion: original.templateVersion,
        versionNo: original.versionNo + 1,
        supersedesId: originalId,
        status: 'DRAFT',
      },
    });

    return newDoc;
  }

  async function revokeDocument(id: number) {
    const doc = await prisma.documentRecord.findUnique({ where: { id } });
    if (!doc) throw new Error('Document not found');
    if (doc.status !== 'ISSUED') throw new Error('Only issued documents can be revoked');

    return prisma.documentRecord.update({
      where: { id },
      data: { status: 'REVOKED' },
    });
  }

  // ── VERIFICATION ──────────────────────────

  async function verify(token: string) {
    const doc = await prisma.documentRecord.findUnique({
      where: { verificationToken: token },
    });
    if (!doc) return null;

    const student = await prisma.student.findUnique({ where: { id: doc.studentId } });
    const booking = doc.bookingId
      ? await prisma.booking.findUnique({ where: { id: doc.bookingId }, include: { courses: true } })
      : null;
    const course = booking?.courses?.[0];

    return {
      status: doc.status,
      documentType: doc.documentType,
      versionNo: doc.versionNo,
      issuedAt: doc.issuedAt,
      student: student ? {
        fullName: `${student.firstName} ${student.lastName}`,
        dob: student.birthday,
        nationality: student.nationality,
      } : null,
      booking: booking ? {
        reference: `BK-${new Date(booking.createdAt).getFullYear()}-${String(booking.id).padStart(6, '0')}`,
        courseName: course?.name,
        startDate: course?.startDate,
        endDate: course?.endDate,
      } : null,
    };
  }

  // ── PDF GENERATION ─────────────────────────

  async function generatePdf(contentHtml: string): Promise<Buffer> {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    });
    try {
      const page = await browser.newPage();
      const fullHtml = `<!DOCTYPE html><html><head>
        <meta charset="UTF-8">
        <style>body{margin:0;padding:40px;font-family:Verdana,sans-serif;font-size:14px;line-height:1.7;color:#1a1d23}img{max-width:100%}</style>
      </head><body>${contentHtml}</body></html>`;
      await page.setContent(fullHtml, { waitUntil: 'networkidle0' });
      const pdf = await page.pdf({
        format: 'A4',
        margin: { top: '20mm', bottom: '20mm', left: '15mm', right: '15mm' },
        printBackground: true,
      });
      return Buffer.from(pdf);
    } finally {
      await browser.close();
    }
  }

  async function getDocumentPdf(id: number): Promise<{ pdf: Buffer; filename: string }> {
    const doc = await prisma.documentRecord.findUnique({
      where: { id },
      include: { template: true },
    });
    if (!doc) throw new Error('Document not found');
    if (!doc.contentHtml) throw new Error('Document has no content');

    const pdf = await generatePdf(doc.contentHtml);
    const tplSlug = doc.template?.slug || doc.documentType || 'document';
    const filename = `${tplSlug}-${doc.id}-v${doc.versionNo}.pdf`;
    return { pdf, filename };
  }

  // ── DISPATCH LOGGING ──────────────────────

  async function logDispatch(documentId: number, sentToEmail: string, deliveryMethod: string, sentBy?: string) {
    const doc = await prisma.documentRecord.findUnique({ where: { id: documentId } });
    if (!doc || doc.status !== 'ISSUED') throw new Error('Can only dispatch issued documents');

    return prisma.documentDispatch.create({
      data: { documentId, sentToEmail, deliveryMethod, sentBy },
    });
  }

  return {
    listTemplates, getTemplate, createTemplate, updateTemplate,
    resolveTokens, renderTemplate,
    generateDraft, getDocument, listDocuments, updateDraft,
    issueDocument, createNewVersion, revokeDocument,
    verify,
    generatePdf, getDocumentPdf,
    logDispatch,
  };
}
