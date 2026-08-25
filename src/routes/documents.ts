import { Router } from 'express';
import { PrismaClient } from '../generated/prisma/client';
import { documentScripts, buildGrossReceiptHtml } from '../scripts/documents';
import { sendEmail } from '../scripts/email';
import { sendStudentEmail } from './email';
import multer from 'multer';
import { compressUploads } from '../lib/compress';
import { translateTemplateContent, TARGET_LANGUAGES } from '../scripts/translate-template';
import fs from 'fs';
import path from 'path';

const sigPath = path.join(__dirname, '..', '..', '.claude', 'docs', 'Email Templates', 'signature.html');
const DOC_SIGNATURE_HTML = fs.existsSync(sigPath) ? fs.readFileSync(sigPath, 'utf-8') : '';

// Editor image uploads land in public/launch/editor — served with NO auth at
// /sis/launch/editor/* (see app.ts), so the absolute URL embedded in a template
// resolves when the email/document is opened outside the app.
const editorImgDir = path.join(__dirname, '..', '..', 'public', 'launch', 'editor');
const editorImgUpload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => { fs.mkdirSync(editorImgDir, { recursive: true }); cb(null, editorImgDir); },
    filename: (_req, file, cb) => cb(null, Date.now() + '-' + (file.originalname || 'image').replace(/[^a-zA-Z0-9._-]/g, '_')),
  }),
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB
  fileFilter: (_req, file, cb) => cb(null, /^image\//.test(file.mimetype)),
});

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

  router.delete('/templates/:id', async (req, res) => {
    try {
      res.json(await scripts.deleteTemplate(parseInt(req.params.id as string)));
    } catch (e) { res.status(400).json({ error: String(e) }); }
  });

  // ── TEMPLATE TRANSLATIONS ──────────────────
  // English lives on the template itself; each row here is one machine- (or
  // hand-) translated variant. Stored raw (no Prisma model) to avoid schema drift.

  router.get('/templates/:id/translations', async (req, res) => {
    try {
      const id = parseInt(req.params.id as string);
      const rows: any[] = await prisma.$queryRawUnsafe(
        `SELECT lang, subject, html_template AS "htmlTemplate", edited, updated_at AS "updatedAt"
           FROM document_template_translations WHERE template_id = $1 ORDER BY lang`, id);
      res.json({ targets: TARGET_LANGUAGES, translations: rows });
    } catch (e) { res.status(500).json({ error: String(e) }); }
  });

  // Machine-translate one language and store it (edited=false). Client calls this
  // per-language so each request stays short and the UI can update progressively.
  router.post('/templates/:id/translate', async (req, res) => {
    try {
      const id = parseInt(req.params.id as string);
      const lang = String(req.body?.lang || '');
      if (!TARGET_LANGUAGES.some(l => l.code === lang)) return res.status(400).json({ error: 'Unsupported language' });
      const tpl = await scripts.getTemplate(id);
      if (!tpl) return res.status(404).json({ error: 'Template not found' });
      const out = await translateTemplateContent(tpl.subject || '', tpl.htmlTemplate || '', lang);
      await prisma.$executeRawUnsafe(
        `INSERT INTO document_template_translations (template_id, lang, subject, html_template, edited, updated_at)
           VALUES ($1,$2,$3,$4,false,now())
         ON CONFLICT (template_id, lang) DO UPDATE SET subject=$3, html_template=$4, edited=false, updated_at=now()`,
        id, lang, out.subject, out.html);
      res.json({ lang, subject: out.subject, htmlTemplate: out.html, edited: false });
    } catch (e) { res.status(400).json({ error: String(e) }); }
  });

  // Save a hand-edited variant (marks edited=true so re-translate-all skips it).
  router.put('/templates/:id/translations/:lang', async (req, res) => {
    try {
      const id = parseInt(req.params.id as string);
      const lang = String(req.params.lang);
      if (!TARGET_LANGUAGES.some(l => l.code === lang)) return res.status(400).json({ error: 'Unsupported language' });
      const subject = String(req.body?.subject ?? '');
      const html = String(req.body?.htmlTemplate ?? '');
      await prisma.$executeRawUnsafe(
        `INSERT INTO document_template_translations (template_id, lang, subject, html_template, edited, updated_at)
           VALUES ($1,$2,$3,$4,true,now())
         ON CONFLICT (template_id, lang) DO UPDATE SET subject=$3, html_template=$4, edited=true, updated_at=now()`,
        id, lang, subject, html);
      res.json({ ok: true });
    } catch (e) { res.status(400).json({ error: String(e) }); }
  });

  router.delete('/templates/:id/translations/:lang', async (req, res) => {
    try {
      const id = parseInt(req.params.id as string);
      const lang = String(req.params.lang);
      await prisma.$executeRawUnsafe(
        `DELETE FROM document_template_translations WHERE template_id=$1 AND lang=$2`, id, lang);
      res.json({ ok: true });
    } catch (e) { res.status(400).json({ error: String(e) }); }
  });

  // Upload an image from the editor → returns a public absolute URL to embed.
  // Path is intentionally NOT under /templates so it isn't caught by the
  // admin-only template-write gate — any staff rich-text editor can use it.
  router.post('/upload-image', editorImgUpload.single('image'), compressUploads({ imageMaxDim: 1400, imageQuality: 85 }), async (req, res) => {
    try {
      const f = (req as any).file;
      if (!f) return res.status(400).json({ error: 'No image uploaded' });
      const baseUrl = process.env.BASE_URL || 'https://sis.ulearnschool.com';
      res.json({ url: `${baseUrl}/sis/launch/editor/${path.basename(f.path)}` });
    } catch (e) { res.status(400).json({ error: String(e) }); }
  });

  // ── TOKEN RESOLUTION (preview) ────────────

  router.get('/tokens/:studentId', async (req, res) => {
    try {
      const studentId = parseInt(req.params.studentId as string);
      const bookingId = req.query.bookingId ? parseInt(req.query.bookingId as string) : null;
      // When the caller doesn't name a booking (the student-page comms compose
      // pane never does), resolveTokens auto-picks the booking holding the
      // student's arrival-relevant accommodation (upcoming → present → past) —
      // NOT merely the newest booking by id, which for multi-booking students
      // could be one with no room attached and rendered accommodation blank.
      const { tokens } = await scripts.resolveTokens(studentId, bookingId);
      res.json(tokens);
    } catch (e) { res.status(400).json({ error: String(e) }); }
  });

  // Context-aware token resolution for the standardised commsBlock.
  // Surfaces the same {{token}} substitution to host (provider) and
  // teacher pages — not just student pages.
  //
  //  - student: same as /tokens/:studentId (most recent active booking)
  //  - provider: find the most recent active booking_accommodation at
  //              this provider → use its student + booking to resolve
  //              (the email is ABOUT that incoming student so all the
  //              {{student.*}} and {{accommodation.*}} tokens populate)
  //  - teacher: no resolver yet — returns {} so the front-end pre-send
  //             guard catches any unresolved tokens and blocks the send
  //
  // Always falls back to empty object on error so the front-end can
  // still inject the template body (with literal tokens) and the
  // pre-send guard blocks send. Never throws.
  router.get('/tokens-for/:contextType/:contextId', async (req, res) => {
    try {
      const contextType = String(req.params.contextType);
      const contextId = parseInt(req.params.contextId as string);
      if (!Number.isFinite(contextId)) return res.json({});

      if (contextType === 'student') {
        // null booking → resolveTokens picks the arrival-relevant booking
        // (upcoming → present → past accommodation), not newest-by-id.
        const { tokens } = await scripts.resolveTokens(contextId, null);
        return res.json(tokens);
      }

      if (contextType === 'provider') {
        // Host's OWN tokens — always available, even with no student placed, so
        // host outreach (e.g. "here's your portal link") resolves. Includes the
        // magic-link portal URL the host uses to see their bookings/payments.
        const provider = await prisma.accommodationProvider.findUnique({ where: { id: contextId } });
        const base: Record<string, string> = {};
        if (provider) {
          const tok = await prisma.hostPortalToken.findUnique({ where: { providerId: contextId }, select: { token: true } });
          const baseUrl = process.env.BASE_URL || 'https://sis.ulearnschool.com';
          const addr = [provider.address, (provider as any).addressAddon, provider.city, provider.zip].filter(Boolean).join(', ');
          base['accommodation.host_name'] = provider.name || '';
          base['accommodation.provider_name'] = provider.name || '';
          base['accommodation.contact_name'] = [(provider as any).contactFirstName, (provider as any).contactLastName].filter(Boolean).join(' ');
          base['accommodation.contact_first_name'] = (provider as any).contactFirstName || '';
          base['accommodation.email'] = provider.email || '';
          base['accommodation.phone'] = provider.phone || (provider as any).mobile || '';
          base['accommodation.address'] = addr;
          base['accommodation.host_address'] = addr;
          base['accommodation.portal_link'] = tok?.token ? `${baseUrl}/host-portal/${tok.token}` : '';
        }

        // Picker-driven mode: if the caller explicitly passes ?studentId=
        // (and optionally ?bookingId=), resolve against THAT student and merge
        // it over the host base (host portal_link always preserved).
        const studentOverride = req.query.studentId ? parseInt(req.query.studentId as string) : null;
        const bookingOverride = req.query.bookingId ? parseInt(req.query.bookingId as string) : null;
        if (studentOverride && Number.isFinite(studentOverride)) {
          const { tokens } = await scripts.resolveTokens(studentOverride, bookingOverride);
          return res.json({ ...base, ...tokens, 'accommodation.portal_link': base['accommodation.portal_link'] || '' });
        }
        // Fallback (no override): the most recent active placement, if any.
        const ba = await prisma.bookingAccommodation.findFirst({
          where: { active: true, bed: { room: { property: { providerId: contextId } } } },
          orderBy: { startDate: 'desc' },
          select: { bookingId: true, booking: { select: { studentId: true } } },
        });
        if (ba?.booking?.studentId) {
          const { tokens } = await scripts.resolveTokens(ba.booking.studentId, ba.bookingId);
          return res.json({ ...base, ...tokens, 'accommodation.portal_link': base['accommodation.portal_link'] || '' });
        }
        // No student placed — still return the host's own tokens (incl. portal link).
        return res.json(base);
      }

      // teacher and any unknown contextType → no tokens resolved yet
      return res.json({});
    } catch (e) {
      // Never break the comms UI on a token-resolution failure — return
      // empty and let the front-end pre-send guard catch unresolved
      // markers in the body.
      console.warn('[/tokens-for] failed:', String(e));
      return res.json({});
    }
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
      const role = (req as any).session?.role;
      res.json(await scripts.generateDraft(templateId, studentId, bookingId, role));
    } catch (e) { res.status(400).json({ error: String(e) }); }
  });

  // Pre-generate validation: returns the list of {{tokens}} referenced by
  // the template that would resolve to empty strings for this student +
  // booking. Used by the UI to show a "missing data" overlay before the
  // staff member commits to generating the draft.
  router.get('/templates/:templateId/validate', async (req, res) => {
    try {
      const templateId = parseInt(req.params.templateId as string, 10);
      const studentId = parseInt(String(req.query.studentId || ''), 10);
      const bookingIdRaw = req.query.bookingId;
      const bookingId = bookingIdRaw ? parseInt(String(bookingIdRaw), 10) : null;
      if (!Number.isFinite(templateId) || !Number.isFinite(studentId)) {
        return res.status(400).json({ error: 'templateId and studentId required' });
      }
      res.json(await scripts.validateTemplate(templateId, studentId, bookingId));
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

  // Live-edit an ISSUED document in place (same record/version/token; audited)
  router.put('/:id/live-edit', async (req, res) => {
    try {
      const editedBy = (req as any).session?.user || 'admin';
      res.json(await scripts.liveEditDocument(parseInt(req.params.id as string), req.body.contentHtml, editedBy));
    } catch (e) { res.status(400).json({ error: String(e) }); }
  });

  // Surgically refresh only the changed dynamic field values in an issued
  // document (preserves any Live Edit to static text). Returns {document, changed, skipped}.
  router.put('/:id/refresh-from-source', async (req, res) => {
    try {
      const by = (req as any).session?.user || 'admin';
      res.json(await scripts.refreshDocumentFromSource(parseInt(req.params.id as string), { by }));
    } catch (e) { res.status(400).json({ error: String(e instanceof Error ? e.message : e) }); }
  });

  // Reset an issued document fully to source — clean whole-doc re-render,
  // discards manual Live Edits, realigns the entire letter to source truth.
  router.put('/:id/reset-from-source', async (req, res) => {
    try {
      const by = (req as any).session?.user || 'admin';
      res.json(await scripts.resetDocumentFromSource(parseInt(req.params.id as string), { by }));
    } catch (e) { res.status(400).json({ error: String(e instanceof Error ? e.message : e) }); }
  });

  // Issue document (lock + generate QR + verification token)
  router.post('/:id/issue', async (req, res) => {
    try {
      const issuedBy = req.body.issuedBy || (req as any).session?.user || 'admin';
      const role = (req as any).session?.role;
      res.json(await scripts.issueDocument(parseInt(req.params.id as string), issuedBy, role));
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
      // ?inline=1 → render in the browser (used by the document-preview iframe);
      // default = attachment (the Download PDF button).
      const inline = req.query.inline === '1' || req.query.inline === 'true';
      res.setHeader('Content-Disposition', `${inline ? 'inline' : 'attachment'}; filename="${filename}"`);
      res.send(pdf);
    } catch (e) { res.status(400).json({ error: String(e) }); }
  });

  // Send document as PDF email attachment. Orchestration lives in
  // documentScripts.sendDocument so the hub can invoke the same path via node.
  router.post('/:id/send', async (req, res) => {
    try {
      const docId = parseInt(req.params.id as string);
      const { to, from, fromName, subject, body: emailBody, sentBy } = req.body;
      if (!to || !from) return res.status(400).json({ error: 'to and from are required' });

      const result = await scripts.sendDocument({ docId, to, from, fromName, subject, body: emailBody, sentBy });
      res.json({ status: result.status, messageId: result.messageId, filename: result.filename });
    } catch (e) {
      const msg = String(e instanceof Error ? e.message : e);
      if (/not found/i.test(msg)) return res.status(404).json({ error: msg });
      if (/Only issued|to and from/i.test(msg)) return res.status(400).json({ error: msg });
      res.status(500).json({ error: msg });
    }
  });

  // Notify Agent and/or Student that the insurance policy docs are now available.
  // Renders the email templates policy-agent (#89) / policy-student (#49) with
  // the booking's tokens and ships them — no PDF attached (the docs auto-surface
  // in the Partner Portal + Student App, which the templates link to).
  // Keyed by studentId (not a specific doc — the email is the generic "your
  // insurance docs are available"); the booking is the most recent, matching
  // how save-insurance picks the booking it files under.
  // Body: { studentId, agent?:bool, student?:bool, sentBy? }
  router.post('/notify-insurance', async (req, res) => {
    try {
      const studentId = parseInt(String(req.body?.studentId));
      if (!Number.isFinite(studentId)) return res.status(400).json({ error: 'studentId required' });
      const notifyAgent = req.body.agent !== false;     // default on
      const notifyStudent = req.body.student !== false;  // default on
      const sentBy = req.body.sentBy || 'success@ulearnschool.com';
      const validEmail = (e?: string | null) => !!e && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e);

      const student = await prisma.student.findUnique({ where: { id: studentId }, select: { id: true, email: true } });
      if (!student) return res.status(404).json({ error: 'Student not found' });
      // Prefer a booking that actually has an agency (so agency.email resolves
      // even when the most-recent booking is a B2C continuation); else newest.
      const agencyBk = await prisma.booking.findFirst({ where: { studentId, agencyId: { not: null } }, orderBy: { id: 'desc' }, select: { id: true } });
      const bk = agencyBk || await prisma.booking.findFirst({ where: { studentId }, orderBy: { id: 'desc' }, select: { id: true } });

      const { tokens } = await scripts.resolveTokens(studentId, bk?.id ?? null);
      const results: Record<string, { status: string; to?: string | null; reason?: string; messageId?: string }> = {};

      // ── Student ──
      if (notifyStudent) {
        const tpl = await prisma.documentTemplate.findFirst({ where: { slug: 'policy-student', templateType: 'email' } });
        if (!tpl) results.student = { status: 'failed', reason: 'policy-student template missing' };
        else if (!validEmail(student.email)) results.student = { status: 'skipped', to: student.email, reason: 'no valid student email' };
        else {
          const subject = scripts.renderTemplate(tpl.subject || tpl.name, tokens);
          const html = scripts.renderTemplate(tpl.htmlTemplate, tokens);
          const r = await sendStudentEmail(prisma, {
            from: 'success@ulearnschool.com', fromName: 'ULearn',
            to: student.email!, subject, html,
            studentId, bookingId: bk?.id ?? null, templateId: tpl.id, sentBy,
          });
          results.student = { status: 'sent', to: student.email, messageId: r.messageId };
        }
      }

      // ── Agent (agency on the booking) ──
      if (notifyAgent) {
        const tpl = await prisma.documentTemplate.findFirst({ where: { slug: 'policy-agent', templateType: 'email' } });
        const agentEmail = tokens['agency.email'];
        if (!tpl) results.agent = { status: 'failed', reason: 'policy-agent template missing' };
        else if (!validEmail(agentEmail)) results.agent = { status: 'skipped', to: agentEmail || null, reason: 'no valid agency email' };
        else {
          const subject = scripts.renderTemplate(tpl.subject || tpl.name, tokens);
          const html = scripts.renderTemplate(tpl.htmlTemplate, tokens);
          const r = await sendStudentEmail(prisma, {
            from: 'partners@ulearnschool.com', fromName: 'ULearn',
            to: agentEmail, subject, html,
            studentId, bookingId: bk?.id ?? null, templateId: tpl.id, sentBy,
          });
          results.agent = { status: 'sent', to: agentEmail, messageId: r.messageId };
        }
      }

      res.json({ results });
    } catch (e) {
      res.status(500).json({ error: String(e instanceof Error ? e.message : e) });
    }
  });

  // LoA-only lightweight notify: pre-selects the Agent/Student LoA templates +
  // attaches the (living) LoA PDF, agent from partners@ / student from success@.
  // Replaces the full compose modal for LoAs — the send is nearly always identical,
  // so this cuts the template-pick / sender-switch clicks. Skips a recipient
  // gracefully if its email is missing (mirrors /notify-insurance).
  router.post('/:id/notify', async (req, res) => {
    try {
      const docId = parseInt(String(req.params.id));
      if (!Number.isFinite(docId)) return res.status(400).json({ error: 'bad document id' });
      const notifyAgent = req.body.agent !== false;      // default on
      const notifyStudent = req.body.student !== false;  // default on
      const sentBy = (req as any).session?.user || 'admin';
      const validEmail = (e?: string | null) => !!e && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e);

      const doc = await scripts.getDocument(docId);
      if (!doc) return res.status(404).json({ error: 'Document not found' });
      if (doc.status !== 'ISSUED') return res.status(400).json({ error: 'Only issued documents can be sent' });

      const student = await prisma.student.findUnique({ where: { id: doc.studentId }, select: { email: true } });
      const { tokens } = await scripts.resolveTokens(doc.studentId, doc.bookingId ?? null);
      const results: Record<string, { status: string; to?: string | null; reason?: string }> = {};

      // ── Student ──
      if (notifyStudent) {
        const tpl = await prisma.documentTemplate.findFirst({ where: { slug: 'LoA-Attach-Student', templateType: 'email' } });
        if (!tpl) results.student = { status: 'failed', reason: 'LoA-Attach-Student template missing' };
        else if (!validEmail(student?.email)) results.student = { status: 'skipped', to: student?.email, reason: 'no valid student email' };
        else {
          await scripts.sendDocument({
            docId, to: student!.email!, from: 'success@ulearnschool.com', fromName: 'ULearn',
            subject: scripts.renderTemplate(tpl.subject || tpl.name, tokens),
            body: scripts.renderTemplate(tpl.htmlTemplate, tokens), sentBy,
            attach: false,   // notify-only — the LoA lives in their ULearn account
          });
          results.student = { status: 'sent', to: student!.email };
        }
      }

      // ── Agent (agency on the booking) ──
      if (notifyAgent) {
        const tpl = await prisma.documentTemplate.findFirst({ where: { slug: 'LoA-Attach-Agent', templateType: 'email' } });
        const agentEmail = tokens['agency.email'];
        if (!tpl) results.agent = { status: 'failed', reason: 'LoA-Attach-Agent template missing' };
        else if (!validEmail(agentEmail)) results.agent = { status: 'skipped', to: agentEmail || null, reason: 'no valid agency email' };
        else {
          await scripts.sendDocument({
            docId, to: agentEmail, from: 'partners@ulearnschool.com', fromName: 'ULearn',
            subject: scripts.renderTemplate(tpl.subject || tpl.name, tokens),
            body: scripts.renderTemplate(tpl.htmlTemplate, tokens), sentBy,
            attach: false,   // notify-only — the LoA lives in their Partner Portal
          });
          results.agent = { status: 'sent', to: agentEmail };
        }
      }

      res.json({ results });
    } catch (e) {
      res.status(500).json({ error: String(e instanceof Error ? e.message : e) });
    }
  });

  // Send MULTIPLE documents as a single email with all PDFs attached.
  // Body: { docIds:number[], to, from, fromName?, subject?, body?, sentBy? }
  // Generates each PDF (skips non-ISSUED + bad ids), attaches them all,
  // logs a dispatch row on each doc + a single EmailLog row.
  router.post('/send-multi', async (req, res) => {
    try {
      const { docIds, to, from, fromName, subject, body: emailBody, sentBy } = req.body || {};
      if (!Array.isArray(docIds) || docIds.length === 0) return res.status(400).json({ error: 'docIds[] required' });
      if (!to || !from) return res.status(400).json({ error: 'to and from are required' });

      const attachments: { filename: string; content: Buffer; contentType: string }[] = [];
      const okDocs: any[] = [];
      const skipped: { id: number; reason: string }[] = [];
      for (const rawId of docIds) {
        const docId = parseInt(String(rawId), 10);
        if (!Number.isFinite(docId)) { skipped.push({ id: rawId, reason: 'bad id' }); continue; }
        const doc = await scripts.getDocument(docId);
        if (!doc) { skipped.push({ id: docId, reason: 'not found' }); continue; }
        if (doc.status !== 'ISSUED') { skipped.push({ id: docId, reason: 'not ISSUED' }); continue; }
        const { pdf, filename } = await scripts.getDocumentPdf(docId);
        attachments.push({ filename, content: pdf, contentType: 'application/pdf' });
        okDocs.push(doc);
      }
      if (attachments.length === 0) return res.status(400).json({ error: 'No valid documents to attach', skipped });

      // Subject defaults to first doc's template/type name (matches single-send pattern)
      const tplName = (okDocs[0] as any).template?.name || okDocs[0].documentType || 'Document';
      const emailSubject = subject || tplName;
      const htmlBody = (emailBody || '<p>Please find the attached document' + (attachments.length > 1 ? 's' : '') + '.</p>') + '<br>' + DOC_SIGNATURE_HTML;

      const result = await sendEmail({
        from,
        fromName: fromName || 'ULearn',
        to,
        subject: emailSubject,
        html: htmlBody,
        attachments,
      });

      // Log dispatch on each doc — keeps the per-doc audit trail intact.
      for (const doc of okDocs) {
        await scripts.logDispatch(doc.id, to, 'email', sentBy || from);
      }
      // Single EmailLog row covering the multi-attachment send. studentId/bookingId
      // pulled from the first doc — caller can split into per-doc logs later if needed.
      await prisma.emailLog.create({
        data: {
          studentId: okDocs[0].studentId,
          bookingId: okDocs[0].bookingId,
          fromEmail: from,
          toEmail: to,
          subject: emailSubject,
          bodyHtml: htmlBody,
          gmailMessageId: result.messageId,
          gmailThreadId: result.threadId,
          sentBy: sentBy || from,
        },
      });

      res.json({ status: 'sent', messageId: result.messageId, attached: attachments.map(a => a.filename), skipped });
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

  // ── GROSS RECEIPT (the partner display layer) ──
  // A pure DISPLAY layer over the HubSpot invoice. NO maths happen here: gross,
  // line items and totals are read verbatim from the HubSpot invoice (the
  // quote/invoice engine is the single source of truth — any arithmetic in the
  // SIS would only create drift). It's the same invoice an agent was billed NET
  // for, re-presented at GROSS — i.e. the commission is LEFT IN (the order-level
  // discount line is simply not shown). Receipt → paid invoices only.
  router.get('/net-to-gross/:bookingId', async (req, res) => {
    try {
      const bookingId = parseInt(req.params.bookingId as string);
      const r = await buildGrossReceiptHtml(prisma, bookingId);
      if (!r.ok) return res.status(r.code).json({ error: r.error });
      const booking = await prisma.booking.findUnique({ where: { id: bookingId }, include: { student: true, agency: true } });
      res.json({ success: true, html: r.html, booking: { id: bookingId, agency: (booking as any)?.agency?.name, student: `${booking?.student.firstName} ${booking?.student.lastName}` } });
    } catch (e) { res.status(500).json({ error: String(e) }); }
  });

  return router;
}
