import { Router } from 'express';
import { PrismaClient } from '../generated/prisma/client';
import { sendEmail, getAllowedSenders } from '../scripts/email';
import fs from 'fs';
import path from 'path';

// Load signature once at startup
const sigPath = path.join(__dirname, '..', '..', '.claude', 'docs', 'Email Templates', 'signature.html');
const SIGNATURE_HTML = fs.existsSync(sigPath) ? fs.readFileSync(sigPath, 'utf-8') : '';

export function emailRoutes(prisma: PrismaClient) {
  const router = Router();

  router.get('/senders', (_req, res) => {
    res.json(getAllowedSenders());
  });

  router.get('/signature', (_req, res) => {
    res.json({ html: SIGNATURE_HTML });
  });

  // Send an email (with signature auto-appended)
  router.post('/send', async (req, res) => {
    try {
      const { from, fromName, to, subject, html, replyTo, studentId, bookingId, templateId } = req.body;
      if (!from || !to || !subject || !html) {
        return res.status(400).json({ error: 'from, to, subject, and html are required' });
      }

      // Append signature
      const fullHtml = html + '<br>' + SIGNATURE_HTML;

      const result = await sendEmail({ from, fromName, to, subject, html: fullHtml, replyTo });

      // Log to email_log
      await prisma.emailLog.create({
        data: {
          studentId: studentId ? parseInt(studentId) : null,
          bookingId: bookingId ? parseInt(bookingId) : null,
          fromEmail: from,
          toEmail: to,
          subject,
          bodyHtml: fullHtml,
          templateId: templateId ? parseInt(templateId) : null,
          gmailMessageId: result.messageId,
          gmailThreadId: result.threadId,
          sentBy: from,
        },
      });

      res.json({
        status: 'sent',
        messageId: result.messageId,
        threadId: result.threadId,
        from,
        to,
      });
    } catch (e) {
      res.status(500).json({ error: String(e) });
    }
  });

  // Get email history for a student
  router.get('/history/:studentId', async (req, res) => {
    try {
      const logs = await prisma.emailLog.findMany({
        where: { studentId: parseInt(req.params.studentId as string) },
        orderBy: { createdAt: 'desc' },
        take: 50,
      });
      res.json(logs);
    } catch (e) { res.status(500).json({ error: String(e) }); }
  });

  // Get single email detail
  router.get('/detail/:id', async (req, res) => {
    try {
      const log = await prisma.emailLog.findUnique({
        where: { id: parseInt(req.params.id as string) },
      });
      if (!log) return res.status(404).json({ error: 'Not found' });
      res.json(log);
    } catch (e) { res.status(500).json({ error: String(e) }); }
  });

  // Test endpoint
  router.post('/test', async (req, res) => {
    try {
      const { from, to } = req.body;
      const result = await sendEmail({
        from: from || 'info@ulearnschool.com',
        fromName: 'ULearn SIS',
        to: to || from || 'info@ulearnschool.com',
        subject: 'SIS Email Test — ' + new Date().toLocaleString(),
        html: '<p>This is a test email from the ULearn Student Information System.</p><p>If you received this, the Gmail API integration is working correctly.</p><br>' + SIGNATURE_HTML,
      });
      res.json({ status: 'sent', ...result });
    } catch (e) {
      res.status(500).json({ error: String(e) });
    }
  });

  return router;
}
