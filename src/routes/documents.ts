import { Router } from 'express';
import { PrismaClient } from '../generated/prisma/client';
import { documentScripts } from '../scripts/documents';
import { sendEmail } from '../scripts/email';
import fs from 'fs';
import path from 'path';

const sigPath = path.join(__dirname, '..', '..', '.claude', 'docs', 'Email Templates', 'signature.html');
const DOC_SIGNATURE_HTML = fs.existsSync(sigPath) ? fs.readFileSync(sigPath, 'utf-8') : '';

export function documentRoutes(prisma: PrismaClient) {
  const router = Router();
  const scripts = documentScripts(prisma);

  // ── TEMPLATES ──────────────────────────────

  router.get('/templates', async (_req, res) => {
    try {
      const all = _req.query.all === 'true';
      const type = _req.query.type as string | undefined;
      res.json(await scripts.listTemplates(!all, type));
    } catch (e) { res.status(500).json({ error: String(e) }); }
  });

  router.get('/templates/:id', async (req, res) => {
    try {
      const t = await scripts.getTemplate(parseInt(req.params.id as string));
      if (!t) return res.status(404).json({ error: 'Not found' });
      res.json(t);
    } catch (e) { res.status(500).json({ error: String(e) }); }
  });

  router.post('/templates', async (req, res) => {
    try {
      res.json(await scripts.createTemplate(req.body));
    } catch (e) { res.status(400).json({ error: String(e) }); }
  });

  router.put('/templates/:id', async (req, res) => {
    try {
      res.json(await scripts.updateTemplate(parseInt(req.params.id as string), req.body));
    } catch (e) { res.status(400).json({ error: String(e) }); }
  });

  // ── TOKEN RESOLUTION (preview) ────────────

  router.get('/tokens/:studentId', async (req, res) => {
    try {
      const bookingId = req.query.bookingId ? parseInt(req.query.bookingId as string) : null;
      const { tokens } = await scripts.resolveTokens(parseInt(req.params.studentId as string), bookingId);
      res.json(tokens);
    } catch (e) { res.status(400).json({ error: String(e) }); }
  });

  // ── DOCUMENT RECORDS ──────────────────────

  router.get('/', async (req, res) => {
    try {
      const filters: any = {};
      if (req.query.studentId) filters.studentId = parseInt(req.query.studentId as string);
      if (req.query.bookingId) filters.bookingId = parseInt(req.query.bookingId as string);
      if (req.query.status) filters.status = req.query.status;
      res.json(await scripts.listDocuments(filters));
    } catch (e) { res.status(500).json({ error: String(e) }); }
  });

  router.get('/:id', async (req, res) => {
    try {
      const doc = await scripts.getDocument(parseInt(req.params.id as string));
      if (!doc) return res.status(404).json({ error: 'Not found' });
      res.json(doc);
    } catch (e) { res.status(500).json({ error: String(e) }); }
  });

  // Generate draft from template + student/booking
  router.post('/generate', async (req, res) => {
    try {
      const { templateId, studentId, bookingId } = req.body;
      if (!templateId || !studentId) return res.status(400).json({ error: 'templateId and studentId required' });
      res.json(await scripts.generateDraft(templateId, studentId, bookingId));
    } catch (e) { res.status(400).json({ error: String(e) }); }
  });

  // Delete a document record
  router.delete('/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id as string);
      await prisma.documentDispatch.deleteMany({ where: { documentId: id } });
      await prisma.documentRecord.delete({ where: { id } });
      res.json({ deleted: true });
    } catch (e) { res.status(400).json({ error: String(e) }); }
  });

  // Update draft content (only works on DRAFT status)
  router.put('/:id', async (req, res) => {
    try {
      res.json(await scripts.updateDraft(parseInt(req.params.id as string), req.body));
    } catch (e) { res.status(400).json({ error: String(e) }); }
  });

  // Issue document (lock + generate QR + verification token)
  router.post('/:id/issue', async (req, res) => {
    try {
      const issuedBy = req.body.issuedBy || 'admin';
      res.json(await scripts.issueDocument(parseInt(req.params.id as string), issuedBy));
    } catch (e) { res.status(400).json({ error: String(e) }); }
  });

  // Create new version from existing document
  router.post('/:id/new-version', async (req, res) => {
    try {
      res.json(await scripts.createNewVersion(parseInt(req.params.id as string)));
    } catch (e) { res.status(400).json({ error: String(e) }); }
  });

  // Revoke document
  router.post('/:id/revoke', async (req, res) => {
    try {
      res.json(await scripts.revokeDocument(parseInt(req.params.id as string)));
    } catch (e) { res.status(400).json({ error: String(e) }); }
  });

  // Download document as PDF
  router.get('/:id/pdf', async (req, res) => {
    try {
      const { pdf, filename } = await scripts.getDocumentPdf(parseInt(req.params.id as string));
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(pdf);
    } catch (e) { res.status(400).json({ error: String(e) }); }
  });

  // Send document as PDF email attachment
  router.post('/:id/send', async (req, res) => {
    try {
      const docId = parseInt(req.params.id as string);
      const { to, from, fromName, subject, body: emailBody, sentBy } = req.body;
      if (!to || !from) return res.status(400).json({ error: 'to and from are required' });

      const doc = await scripts.getDocument(docId);
      if (!doc) return res.status(404).json({ error: 'Document not found' });
      if (doc.status !== 'ISSUED') return res.status(400).json({ error: 'Only issued documents can be sent' });

      // Generate PDF
      const { pdf, filename } = await scripts.getDocumentPdf(docId);

      // Build email body
      const htmlBody = (emailBody || '<p>Please find the attached document.</p>') + '<br>' + DOC_SIGNATURE_HTML;
      const tplName = (doc as any).template?.name || doc.documentType || 'Document';
      const emailSubject = subject || tplName;

      // Send via Gmail API with PDF attachment
      const result = await sendEmail({
        from,
        fromName: fromName || 'ULearn',
        to,
        subject: emailSubject,
        html: htmlBody,
        attachments: [{
          filename,
          content: pdf,
          contentType: 'application/pdf',
        }],
      });

      // Log dispatch
      await scripts.logDispatch(docId, to, 'email', sentBy || from);

      // Also log to EmailLog
      await prisma.emailLog.create({
        data: {
          studentId: doc.studentId,
          bookingId: doc.bookingId,
          fromEmail: from,
          toEmail: to,
          subject: emailSubject,
          bodyHtml: htmlBody,
          gmailMessageId: result.messageId,
          gmailThreadId: result.threadId,
          sentBy: sentBy || from,
        },
      });

      res.json({ status: 'sent', messageId: result.messageId, filename });
    } catch (e) { res.status(500).json({ error: String(e) }); }
  });

  // Log a dispatch (email/download)
  router.post('/:id/dispatch', async (req, res) => {
    try {
      const { sentToEmail, deliveryMethod, sentBy } = req.body;
      res.json(await scripts.logDispatch(parseInt(req.params.id as string), sentToEmail, deliveryMethod, sentBy));
    } catch (e) { res.status(400).json({ error: String(e) }); }
  });

  // ── NET STATEMENT (on-demand, agency only) ──
  router.get('/net-statement/:bookingId', async (req, res) => {
    try {
      const bookingId = parseInt(req.params.bookingId as string);
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: { student: true, agency: true, courses: true },
      });
      if (!booking) return res.status(404).json({ error: 'Booking not found' });
      if (!booking.agencyId || !booking.agency) return res.status(400).json({ error: 'No agency on this booking' });

      const rate = Number(booking.agency.commissionRate || 0);
      if (rate === 0) return res.status(400).json({ error: 'No commission rate set for this agency' });

      // Get the template
      const tpl = await prisma.documentTemplate.findUnique({ where: { slug: 'Agency-Net-Statement' } });
      if (!tpl) return res.status(500).json({ error: 'Net statement template not found — restart server to seed' });

      // Resolve tokens
      const { tokens } = await scripts.resolveTokens(booking.studentId, bookingId);

      // Render
      let html = tpl.htmlTemplate.replace(/\{\{([^}]+)\}\}/g, (_match: string, key: string) => {
        const k = key.trim();
        if (k.startsWith('custom.') || k.startsWith('document.')) {
          if (k === 'document.issue_date') return new Date().toLocaleDateString('en-IE', { day: '2-digit', month: 'long', year: 'numeric' });
          if (k === 'document.number') return `NS-${bookingId}`;
          return tokens[k] || '';
        }
        return tokens[k] || '';
      });

      res.json({ success: true, html, booking: { id: booking.id, agency: booking.agency.name, student: `${booking.student.firstName} ${booking.student.lastName}` } });
    } catch (e) { res.status(500).json({ error: String(e) }); }
  });

  // ── NET-TO-GROSS INVOICE (on-demand, agency only) ──
  // Mirror of /net-statement — agents who were billed NET in Xero but want a
  // gross-style presentation invoice with no mention of commission.
  // Commission rate is fetched live from HubSpot per the agency-data rule.
  router.get('/net-to-gross/:bookingId', async (req, res) => {
    try {
      const bookingId = parseInt(req.params.bookingId as string);
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: { student: true, agency: true, courses: true },
      });
      if (!booking) return res.status(404).json({ error: 'Booking not found' });
      if (!booking.agencyId || !booking.agency) return res.status(400).json({ error: 'No agency on this booking' });
      if (!booking.agency.hubspotCompanyId) return res.status(400).json({ error: 'Agency is not linked to HubSpot — cannot fetch commission rate' });

      const tpl = await prisma.documentTemplate.findUnique({ where: { slug: 'Net-to-Gross-Invoice' } });
      if (!tpl) return res.status(500).json({ error: 'Net-to-Gross template not found — restart server to seed' });

      const { tokens } = await scripts.resolveTokens(booking.studentId, bookingId);

      let html = tpl.htmlTemplate.replace(/\{\{([^}]+)\}\}/g, (_match: string, key: string) => {
        const k = key.trim();
        if (k.startsWith('custom.') || k.startsWith('document.')) {
          if (k === 'document.issue_date') return new Date().toLocaleDateString('en-IE', { day: '2-digit', month: 'long', year: 'numeric' });
          if (k === 'document.number') return `INV-${bookingId}`;
          return tokens[k] || '';
        }
        return tokens[k] || '';
      });

      res.json({ success: true, html, booking: { id: booking.id, agency: booking.agency.name, student: `${booking.student.firstName} ${booking.student.lastName}` } });
    } catch (e) { res.status(500).json({ error: String(e) }); }
  });

  return router;
}
