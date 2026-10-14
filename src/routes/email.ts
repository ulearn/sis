import { Router } from 'express';
import { PrismaClient } from '../generated/prisma/client';
import { sendEmail, getAllowedSenders } from '../scripts/email';
import { documentScripts } from '../scripts/documents';
import { messageScripts } from '../scripts/messages';
import { resolveLangCode } from '../scripts/translate-template';
import fs from 'fs';
import path from 'path';
import https from 'https';

// Mirror of FIDELO_TOKEN_MAP in admin.html so bulk-send can render the same
// {single_brace} legacy tokens that work in the single-recipient composer.
// Keep aligned with admin.html — the two diverging would silently drop tokens.
const FIDELO_TOKEN_MAP: Record<string, string> = {
  firstname: 'student.first_name',
  surname: 'student.last_name',
  email: 'student.email',
  birthdate: 'student.dob',
  nationality: 'student.nationality',
  gender: 'student.gender',
  salutation: 'student.salutation',
  phone_home: 'student.phone',
  phone_mobile: 'student.phone',
  age: 'student.age',
  address: 'student.address',
  city: 'student.address',
  zip: 'student.address',
  country: 'student.nationality',
  passport_number: 'student.passport_number',
  student_criteria_allergies: 'student.allergies',
  mothertongue: 'student.language',
  emergency_contact_phone: 'student.emergency_phone',
  course: 'booking.course_name',
  course_weeks: 'booking.weeks',
  date_course_start: 'booking.start_date',
  date_course_end: 'booking.end_date',
  school_name: 'institution.name',
  accommodation_provider_name: 'accommodation.provider_name',
  accommodation_contact_firstname: 'accommodation.contact_name',
  accommodation_contact_firststname: 'accommodation.contact_name',
  accommodation_contact_lastname: 'accommodation.contact_name',
  accommodation_address: 'accommodation.address',
  accommodation_city: 'accommodation.address',
  accommodation_zip: 'accommodation.address',
  accommodation_phone: 'accommodation.phone',
  accommodation_mobile: 'accommodation.phone',
  accommodation_provider_email: 'accommodation.email',
  date_accommodation_start: 'accommodation.start_date',
  date_accommodation_end: 'accommodation.end_date',
  accommodation_allocation_start: 'accommodation.start_date',
  accommodation_allocation_end: 'accommodation.end_date',
  accommodation_weeks: 'accommodation.weeks',
  accommodation_category: 'accommodation.type',
  accommodation_meal_full: 'accommodation.board',
  accommodation_meal: 'accommodation.board',
  roomtype: 'accommodation.room_type',
  roomtype_full: 'accommodation.room_type',
  amount: 'booking.amount_total',
  agency: 'booking.agency',
};

// Substitute both {{double.dot}} (SIS-native) and {single_brace} (Fidelo
// legacy) tokens against a resolved tokens map. Strips Fidelo conditional
// and loop markers — same logic as loadEmailTemplate in admin.html.
function applyTokens(input: string, tokens: Record<string, any>): string {
  let s = input;
  // Resolve Fidelo-style {if token}...{/if} conditionals FIRST — render the inner
  // content only when the token is truthy, else drop the whole block. Mirrors
  // documents.ts renderTemplate. Without this the old code merely stripped the
  // {if}/{/if} tags and kept EVERY block's content, so e.g. the Day-1 email went
  // out with all four AM/PM × ILEP variants + the bank-holiday note (Antonella,
  // 2026-08-14). Non-greedy so sequential (non-nested) blocks each close correctly;
  // bare key first, then booking./student./accommodation.* fallbacks.
  s = s.replace(/\{if\s+([a-z0-9_.]+)\}([\s\S]*?)\{\/if\}/gi, (_m, key, content) => {
    const k = String(key).trim();
    const v = tokens[k] || tokens['booking.' + k] || tokens['student.' + k] || tokens['accommodation.' + k] || '';
    return v ? content : '';
  });
  s = s.replace(/\{\{([^}]+)\}\}/g, (m, key) => {
    const k = key.trim();
    if (k.startsWith('custom.') || k.startsWith('document.')) return tokens[k] !== undefined ? tokens[k] : m;
    return tokens[k] != null ? String(tokens[k]) : '';
  });
  s = s.replace(/\{([a-z_]+)\}/g, (m, key) => {
    const mapped = FIDELO_TOKEN_MAP[key];
    if (mapped) return tokens[mapped] != null ? String(tokens[mapped]) : '';
    return '';
  });
  s = s.replace(/\{if [^}]+\}/g, '');
  s = s.replace(/\{\/if\}/g, '');
  s = s.replace(/\{else\}/g, '');
  s = s.replace(/\{start_loop_[^}]+\}/g, '');
  s = s.replace(/\{end_loop_[^}]+\}/g, '');
  s = s.replace(/\{start_selected_entries\}/g, '');
  s = s.replace(/\{end_selected_entries\}/g, '');
  return s;
}

// Static attachments to auto-attach when a given template is used.
// Keyed by template SLUG (more stable than id; survives template renumbering).
// File paths are relative to /sis/public — same dir as doc-header.jpg etc.
// Add a new entry here whenever a template needs a permanent PDF attachment
// (e.g. Capel Street SLA, terms-of-stay, etc).
const TEMPLATE_STATIC_ATTACHMENTS: Record<string, { filename: string; path: string; contentType: string }[]> = {
  // Apartment (Capel Street) arrival confirmation — student must sign the SLA
  // before move-in. PDF is auto-attached so Kelly doesn't have to remember.
  // Only the canonical "Arrival Student Apart" template (id=30) gets it; the
  // FromHere / SHARING variants are different operational paths and can be
  // added here when their flows are confirmed to need the same SLA.
  'Arrival-Student-Apart-2': [
    {
      filename: 'ULearn Student Resident License Agreement.pdf',
      path: path.join(__dirname, '..', '..', 'public', 'library', 'sla-capel-street.pdf'),
      contentType: 'application/pdf',
    },
  ],
};

function loadStaticAttachmentsForTemplate(slug: string | null): { filename: string; content: Buffer; contentType: string }[] {
  if (!slug) return [];
  const defs = TEMPLATE_STATIC_ATTACHMENTS[slug];
  if (!defs || defs.length === 0) return [];
  const out: { filename: string; content: Buffer; contentType: string }[] = [];
  for (const d of defs) {
    if (!fs.existsSync(d.path)) {
      console.warn(`[email] static attachment file missing for template "${slug}": ${d.path}`);
      continue;
    }
    out.push({ filename: d.filename, content: fs.readFileSync(d.path), contentType: d.contentType });
  }
  return out;
}

// Load signature once at startup.
// 2026-05-21 fix: the previous path '.claude/docs/Email Templates/signature.html'
// didn't exist — file lives at '.claude/docs/Templates/Fidelo Email Templates/signature.html'.
// Empty SIGNATURE_HTML at startup meant every outbound email shipped unsigned.
// Try the canonical path first, then the legacy path as a fallback so this
// doesn't quietly break again if the file gets re-organised.
const SIG_PATH_CANDIDATES = [
  path.join(__dirname, '..', '..', '.claude', 'docs', 'Templates', 'Fidelo Email Templates', 'signature.html'),
  path.join(__dirname, '..', '..', '.claude', 'docs', 'Email Templates', 'signature.html'),
];
const sigPath = SIG_PATH_CANDIDATES.find(p => fs.existsSync(p));
const SIGNATURE_HTML = sigPath ? fs.readFileSync(sigPath, 'utf-8') : '';
if (!sigPath) console.warn('[email] signature.html not found — outbound emails will be unsigned');

// Shared send pathway used by /email/send and any other server-side caller
// that wants the standard "append signature, ship via Gmail, log to email_log"
// behaviour. Keeps callers from re-implementing the signature/log dance.
export async function sendStudentEmail(prisma: PrismaClient, opts: {
  from: string;
  fromName?: string;
  to: string;
  cc?: string;
  bcc?: string;
  subject: string;
  html: string;
  replyTo?: string;
  studentId?: number | null;
  bookingId?: number | null;
  providerId?: number | null;
  teacherId?: number | null;
  groupId?: number | null;
  templateId?: number | null;
  sentBy?: string;
  // Set false for fully-designed branded templates (e.g. the birthday email) that
  // carry their own layout + closing — skips the Verdana wrap AND the personal
  // per-sender signature, so a team blast isn't signed by an individual.
  houseStyle?: boolean;
  // Optional ad-hoc attachments from the caller (rare). Static attachments
  // tied to a templateId are loaded automatically via the slug mapping.
  attachments?: { filename: string; content: Buffer; contentType: string }[];
}) {
  // Auto-load any static attachments declared for this template's slug
  // (e.g. SLA PDF for Capel Street accommodation confirmations). Merged
  // with whatever the caller passed explicitly.
  let staticAtts: { filename: string; content: Buffer; contentType: string }[] = [];
  if (opts.templateId) {
    try {
      const tpl = await prisma.documentTemplate.findUnique({
        where: { id: opts.templateId },
        select: { slug: true },
      });
      if (tpl?.slug) staticAtts = loadStaticAttachmentsForTemplate(tpl.slug);
    } catch (e: any) {
      console.warn('[email] failed to load template for static-attachments lookup:', e?.message || e);
    }
  }
  const allAttachments = [...staticAtts, ...(opts.attachments || [])];
  // House-style wrap + signature happen inside sendEmail() now (default-on
  // applyHouseStyle in scripts/email.ts), so every caller — sendStudentEmail,
  // launch-email, tests.ts, placement test path — gets the same brand format
  // without re-implementing the wrap. Just pass the body through.
  const result = await sendEmail({
    from: opts.from,
    fromName: opts.fromName,
    to: opts.to,
    cc: opts.cc,
    bcc: opts.bcc,
    subject: opts.subject,
    html: opts.html,
    replyTo: opts.replyTo,
    houseStyle: opts.houseStyle,
    attachments: allAttachments.length ? allAttachments : undefined,
  });
  const log = await prisma.emailLog.create({
    data: {
      studentId:  opts.studentId  ?? null,
      bookingId:  opts.bookingId  ?? null,
      providerId: opts.providerId ?? null,
      teacherId:  opts.teacherId  ?? null,
      groupId:    opts.groupId    ?? null,
      fromEmail: opts.from,
      toEmail: opts.to,
      subject: opts.subject,
      // Log the body as the caller passed it (pre-wrap). The wrap is purely
      // a display concern; the audit row should record the editorial content,
      // not the brand chrome.
      bodyHtml: opts.html,
      templateId: opts.templateId ?? null,
      gmailMessageId: result.messageId,
      gmailThreadId: result.threadId,
      sentBy: opts.sentBy ?? opts.from,
    },
  });
  // emailLogId lets a paired in-app StudentMessage link back to the audit row.
  return { ...result, emailLogId: log.id };
}

// ── Quiz-result email config ──
const QUIZ_TEMPLATE_URL = 'https://sis.ulearnschool.com/prototype/email/result.html';
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

  // Server-side render of a template for a student/booking — returns the fully
  // resolved subject + body ({if} AND {{token}} both applied) plus the resolved
  // accommodation recipient. Used by the "email the host on placement" preview
  // modal so staff see the real email (notice block, student details) before
  // sending, rather than raw {{ }}/{if} markers.
  router.post('/render', async (req, res) => {
    try {
      const { templateId, studentId, bookingId } = req.body || {};
      if (!templateId || !studentId) return res.status(400).json({ error: 'templateId and studentId required' });
      const tpl = await prisma.documentTemplate.findUnique({
        where: { id: parseInt(templateId) },
        select: { htmlTemplate: true, subject: true },
      });
      if (!tpl) return res.status(404).json({ error: 'Template not found' });
      const docs = documentScripts(prisma);
      const { tokens } = await docs.resolveTokens(parseInt(studentId), bookingId ? parseInt(bookingId) : null);
      res.json({
        subject: docs.renderTemplate(tpl.subject || '', tokens),
        html: docs.renderTemplate(tpl.htmlTemplate || '', tokens),
        to: tokens['accommodation.email'] || '',
        hostName: tokens['accommodation.contact_name'] || tokens['accommodation.provider_name'] || '',
        // Step 2 of the placement email flow goes to the student.
        studentTo: tokens['student.email'] || '',
        studentName: [tokens['student.first_name'], tokens['student.last_name']].filter(Boolean).join(' '),
      });
    } catch (e: any) { res.status(400).json({ error: String(e?.message || e) }); }
  });

  // Send a message on one or both channels (signature auto-appended on email).
  // Channel flags (default = email-only, so existing callers are unaffected):
  //   sendEmail !== false  → deliver via Gmail + log to EmailLog
  //   sendApp === true      → drop a StudentMessage into the student's in-app inbox
  // App delivery needs a studentId to target; email needs `to`.
  router.post('/send', async (req, res) => {
    try {
      const { from, fromName, to, subject, html, replyTo, studentId, bookingId, providerId, teacherId, groupId, templateId, documentId } = req.body;
      const channelEmail = req.body.sendEmail !== false;   // opt-out
      const channelApp   = req.body.sendApp === true;      // opt-in
      const sid = studentId ? parseInt(studentId) : null;

      if (!channelEmail && !channelApp) {
        return res.status(400).json({ error: 'Select at least one channel (email or app)' });
      }
      if (!from) {
        return res.status(400).json({ error: 'from (sender) is required' });
      }
      if (channelEmail && !to) {
        return res.status(400).json({ error: 'to is required for email' });
      }
      if (channelApp && !sid) {
        return res.status(400).json({ error: 'studentId is required to send to the student app' });
      }

      // Server-authoritative render for CONDITIONAL templates ({if} blocks). The
      // composer renders client-side and posts the HTML, but the dynamic {if}
      // selection must NOT depend on the browser — a stale/edge client shipped
      // every branch (the Day-1 email went out with all four AM/PM×ILEP variants,
      // Antonella 2026-08-14). So for any template whose body carries {if}, ignore
      // the client HTML and re-render body+subject here from the template + this
      // student's booking tokens. Non-conditional templates keep the client HTML
      // (staff edits + native-language variants preserved). Falls back to client
      // HTML on any error.
      let finalHtml = html;
      let finalSubject = subject;
      if (templateId && sid) {
        try {
          const t = await prisma.documentTemplate.findUnique({
            where: { id: parseInt(templateId) },
            select: { htmlTemplate: true, subject: true },
          });
          if (t && /\{if\s/.test(t.htmlTemplate || '')) {
            const { tokens } = await documentScripts(prisma).resolveTokens(sid, bookingId ? parseInt(bookingId) : null);
            // Render tokens/conditionals ON the staff-edited HTML (finalHtml =
            // client body), NOT the raw t.htmlTemplate. The composer inserts the
            // raw template ({if} markers intact) and staff edit on top, so this
            // both evaluates the conditionals AND preserves those edits. Using
            // t.htmlTemplate here (added with the Day-1 fix, 2026-08-14) silently
            // discarded composer edits — e.g. a room number Kelly added vanished
            // on send (issue #51). Same for the subject.
            finalHtml = applyTokens(finalHtml, tokens);
            finalSubject = applyTokens(finalSubject, tokens);
            console.log(`[email/send] conditional template ${templateId} re-rendered server-side for student ${sid}`);
          }
        } catch (e: any) {
          console.warn(`[email/send] conditional re-render failed (${e?.message}); using client HTML`);
        }
      }

      const out: any = { status: 'sent', from, to, email: null, app: null };

      if (channelEmail) {
        // Optional document attachment: when a formal document's cover email is
        // sent through the shared comms module, attach the issued PDF and record
        // the dispatch against the document so its Dispatch History stays correct.
        let attachments: { filename: string; content: Buffer; contentType: string }[] | undefined;
        const docs = documentScripts(prisma);
        const docIdN = documentId ? parseInt(documentId) : null;
        if (docIdN) {
          const doc = await docs.getDocument(docIdN);
          if (!doc) return res.status(404).json({ error: 'Document not found' });
          if (doc.status !== 'ISSUED') return res.status(400).json({ error: 'Only issued documents can be sent' });
          const { pdf, filename } = await docs.getDocumentPdf(docIdN);
          attachments = [{ filename, content: pdf, contentType: 'application/pdf' }];
        }

        const result = await sendStudentEmail(prisma, {
          from, fromName, to, bcc: req.body.bcc || undefined, subject: finalSubject, html: finalHtml, replyTo,
          studentId:  sid,
          bookingId:  bookingId  ? parseInt(bookingId)  : null,
          providerId: providerId ? parseInt(providerId) : null,
          teacherId:  teacherId  ? parseInt(teacherId)  : null,
          groupId:    groupId    ? parseInt(groupId)    : null,
          templateId: templateId ? parseInt(templateId) : null,
          sentBy: from,
          attachments,
        });

        if (docIdN) await docs.logDispatch(docIdN, to, 'email', from);
        out.messageId = result.messageId;
        out.threadId  = result.threadId;
        out.email = { messageId: result.messageId, emailLogId: result.emailLogId };

        if (channelApp && sid) {
          const m = await messageScripts(prisma).postToApp({ studentId: sid, subject: finalSubject, bodyHtml: finalHtml, sentBy: from, emailLogId: result.emailLogId });
          out.app = { id: m.id };
        }
      } else if (channelApp && sid) {
        // App-only: no Gmail call, just the in-app message.
        const m = await messageScripts(prisma).postToApp({ studentId: sid, subject: finalSubject, bodyHtml: finalHtml, sentBy: from });
        out.app = { id: m.id };
      }

      res.json(out);
    } catch (e) {
      res.status(500).json({ error: String(e) });
    }
  });

  // ── Bulk send ─────────────────────────────────
  // Send the same template to multiple students. Tokens are resolved
  // PER recipient, so {{student.first_name}} and friends render correctly
  // for each. Each send is its own Gmail API call + email_log row — failures
  // on one recipient don't abort the rest. Response gives a per-recipient
  // outcome so the UI can summarise (sent/failed counts + the failure list).
  router.post('/send-bulk', async (req, res) => {
    try {
      const { from, fromName, studentIds, subject, html, replyTo, templateId } = req.body || {};
      const channelEmail = req.body.sendEmail !== false;   // opt-out
      const channelApp   = req.body.sendApp === true;      // opt-in
      const useNative    = req.body.useNative === true;    // send each student their native-language variant
      if (!channelEmail && !channelApp) {
        return res.status(400).json({ error: 'Select at least one channel (email or app)' });
      }
      if (!from) {
        return res.status(400).json({ error: 'from (sender) is required' });
      }
      if (!Array.isArray(studentIds) || studentIds.length === 0) {
        return res.status(400).json({ error: 'studentIds must be a non-empty array' });
      }
      const ids: number[] = studentIds.map(Number).filter(Number.isFinite);
      const docs = documentScripts(prisma);
      const msgs = messageScripts(prisma);

      // Native mode: load this template's translations ONCE (lang → variant), then
      // per student pick their language variant; fall back to the English base
      // (the subject/html posted in) when there's no variant for their language.
      const variants: Record<string, { subject: string; html: string }> = {};
      if (useNative && templateId) {
        const rows: any[] = await prisma.$queryRawUnsafe(
          `SELECT lang, subject, html_template AS "html" FROM document_template_translations WHERE template_id = $1`,
          parseInt(templateId));
        for (const r of rows) variants[r.lang] = { subject: r.subject || '', html: r.html || '' };
      }
      const results: Array<{ studentId: number; email: string | null; status: 'sent' | 'failed' | 'skipped'; reason?: string; messageId?: string }> = [];

      for (const studentId of ids) {
        try {
          const student = await prisma.student.findUnique({ where: { id: studentId }, select: { id: true, email: true, firstName: true, lastName: true, language: true, nationality: true } });
          if (!student) { results.push({ studentId, email: null, status: 'failed', reason: 'student not found' }); continue; }
          const hasEmail = !!student.email && isValidEmail(student.email);

          // Email-only with no valid address → nothing we can deliver.
          if (channelEmail && !channelApp && !hasEmail) {
            results.push({ studentId, email: student.email, status: 'skipped', reason: 'missing or invalid email' });
            continue;
          }

          // Pick the language base for THIS student. Native mode → their variant
          // if one exists, else the English base (posted in). Default → English.
          let baseSubject = subject, baseHtml = html;
          if (useNative) {
            const code = resolveLangCode(student.language, student.nationality);
            const v = code && variants[code];
            if (v) { baseSubject = v.subject; baseHtml = v.html; }
          }

          const { tokens } = await docs.resolveTokens(studentId);
          const resolvedSubject = applyTokens(baseSubject, tokens);
          const resolvedHtml = applyTokens(baseHtml, tokens);

          let emailLogId: number | null = null;
          let messageId: string | undefined;
          let emailed = false;
          if (channelEmail && hasEmail) {
            const r = await sendStudentEmail(prisma, {
              from, fromName,
              to: student.email!,
              subject: resolvedSubject,
              html: resolvedHtml,
              replyTo,
              studentId,
              templateId: templateId ? parseInt(templateId) : null,
            });
            emailLogId = r.emailLogId;
            messageId = r.messageId;
            emailed = true;
          }
          if (channelApp) {
            await msgs.postToApp({ studentId, subject: resolvedSubject, bodyHtml: resolvedHtml, sentBy: from, emailLogId });
          }

          const reason = (channelEmail && !emailed) ? 'app only (no email on file)' : undefined;
          results.push({ studentId, email: student.email, status: 'sent', reason, messageId });
        } catch (e: any) {
          results.push({ studentId, email: null, status: 'failed', reason: String(e?.message || e) });
        }
      }

      const summary = {
        total: results.length,
        sent: results.filter(r => r.status === 'sent').length,
        skipped: results.filter(r => r.status === 'skipped').length,
        failed: results.filter(r => r.status === 'failed').length,
      };
      res.json({ summary, results });
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
        req.params.type === 'teacher'  ? { teacherId:  id } :
        req.params.type === 'group'    ? { groupId:    id } : null;
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
