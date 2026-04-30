import { Router } from 'express';
import { PrismaClient } from '../generated/prisma/client';
import { sendEmail, getAllowedSenders } from '../scripts/email';
import fs from 'fs';
import path from 'path';
import https from 'https';

// Load signature once at startup
const sigPath = path.join(__dirname, '..', '..', '.claude', 'docs', 'Email Templates', 'signature.html');
const SIGNATURE_HTML = fs.existsSync(sigPath) ? fs.readFileSync(sigPath, 'utf-8') : '';

// ── Quiz-result email config ──
const QUIZ_TEMPLATE_URL = 'https://lms.ulearnschool.com/prototype/email/result.html';
const QUIZ_FROM         = 'sales@ulearnschool.com';
const QUIZ_FROM_NAME    = 'ULearn Sales';
const QUIZ_TPL_TTL_MS   = 60_000;

const ALLOWED_LEVELS = new Set(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']);
const LEVEL_LABEL: Record<string, string> = {
  A1: 'Beginner',
  A2: 'Elementary',
  B1: 'Intermediate',
  B2: 'Upper-Intermediate',
  C1: 'Advanced',
  C2: 'Proficient',
};
const LEVEL_DESC: Record<string, string> = {
  A1: 'You can recognise familiar words and very basic phrases — names, simple introductions, slow clear speech. A solid foundation to build from.',
  A2: 'You can handle short, routine exchanges — shopping, directions, work and family topics. Reading and writing simple notes is comfortable.',
  B1: 'You can deal with most situations while travelling, describe experiences and opinions, and follow most everyday speech and writing.',
  B2: 'You can converse fluently with native speakers, follow complex texts on familiar subjects, and discuss most topics in detail.',
  C1: 'You can use English flexibly and effectively for social, academic and professional purposes, and produce clear, well-structured text.',
  C2: 'You can understand virtually everything you hear or read, summarise from different sources, and express yourself precisely in complex situations.',
};

// In-memory template cache (60s TTL, picks up edits without restart)
let _tplCache: { html: string; fetchedAt: number } | null = null;
async function fetchTemplate(): Promise<string> {
  if (_tplCache && Date.now() - _tplCache.fetchedAt < QUIZ_TPL_TTL_MS) {
    return _tplCache.html;
  }
  const html = await new Promise<string>((resolve, reject) => {
    https.get(QUIZ_TEMPLATE_URL, (res) => {
      if ((res.statusCode ?? 0) >= 400) return reject(new Error('Template HTTP ' + res.statusCode));
      let buf = ''; res.on('data', (c) => buf += c); res.on('end', () => resolve(buf));
    }).on('error', reject);
  });
  _tplCache = { html, fetchedAt: Date.now() };
  return html;
}

function escHtml(s: string) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
function isValidEmail(s: string) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s); }

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
      const { from, fromName, to, subject, html, replyTo, studentId, bookingId, providerId, teacherId, templateId } = req.body;
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
          providerId: providerId ? parseInt(providerId) : null,
          teacherId: teacherId ? parseInt(teacherId) : null,
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

  // ── Locked-down quiz-result email send ──
  // Only accepts whitelisted lead fields. Sender + template are server-side.
  // Public from /api/lms/email/quiz-result via lms nginx proxy.
  // nginx injects X-Quiz-Secret on the proxy hop; matched against env.
  router.post('/quiz-result', async (req, res) => {
    try {
      const expected = process.env.QUIZ_EMAIL_SECRET;
      if (!expected) return res.status(500).json({ error: 'server misconfigured (no QUIZ_EMAIL_SECRET)' });
      if (req.get('x-quiz-secret') !== expected) {
        return res.status(403).json({ error: 'forbidden' });
      }

      const { name, email, country, level, score, correct, wrong } = req.body || {};
      if (!email || !isValidEmail(email)) return res.status(400).json({ error: 'invalid email' });
      const lvl = String(level || '').toUpperCase();
      if (!ALLOWED_LEVELS.has(lvl))      return res.status(400).json({ error: 'invalid level' });
      const scorePct  = Math.max(0, Math.min(100, parseInt(score, 10) || 0));
      const correctN  = Math.max(0, parseInt(correct, 10) || 0);
      const wrongN    = Math.max(0, parseInt(wrong, 10) || 0);
      const cleanName = (name || '').toString().trim().slice(0, 60) || 'there';

      const tpl = await fetchTemplate();
      const tokens: Record<string, string> = {
        name:              escHtml(cleanName),
        level:             lvl,
        level_label:       LEVEL_LABEL[lvl] || '',
        level_description: LEVEL_DESC[lvl] || '',
        score_pct:         String(scorePct),
        correct_count:     String(correctN),
        wrong_count:       String(wrongN),
        cta_url:           `https://wa.me/353899750229?text=${encodeURIComponent(`Hi! I just took the placement test — my level is ${lvl}. I'd like to book a free trial.`)}`,
        cta_label:         'CHAT WITH US ON WHATSAPP',
        unsubscribe_url:   `https://ulearnschool.com/unsubscribe?email=${encodeURIComponent(email)}`,
      };
      const fullHtml = tpl.replace(/\{\{(\w+)\}\}/g, (_, k) => tokens[k] ?? '');

      const subject = `${cleanName !== 'there' ? cleanName + ', y' : 'Y'}our English level is ${lvl}`;

      const result = await sendEmail({
        from: QUIZ_FROM,
        fromName: QUIZ_FROM_NAME,
        to: email,
        subject,
        html: fullHtml,
        replyTo: QUIZ_FROM,
      });

      await prisma.emailLog.create({
        data: {
          studentId: null,
          bookingId: null,
          fromEmail: QUIZ_FROM,
          toEmail: email,
          subject,
          bodyHtml: fullHtml,
          templateId: null,
          gmailMessageId: result.messageId,
          gmailThreadId: result.threadId,
          sentBy: QUIZ_FROM,
        },
      });

      res.json({ status: 'sent', messageId: result.messageId, to: email, level: lvl, country: country || null });
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

  // Get email history for any context (student / provider / teacher)
  router.get('/history-for/:type/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ error: 'Invalid id' });
      const where: any =
        req.params.type === 'student'  ? { studentId:  id } :
        req.params.type === 'provider' ? { providerId: id } :
        req.params.type === 'teacher'  ? { teacherId:  id } : null;
      if (!where) return res.status(400).json({ error: 'Invalid context type' });
      const logs = await prisma.emailLog.findMany({ where, orderBy: { createdAt: 'desc' }, take: 50 });
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
