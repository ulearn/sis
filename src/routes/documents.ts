import { Router } from 'express';
import { PrismaClient } from '../generated/prisma/client';
import { documentScripts } from '../scripts/documents';

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

  // Log a dispatch (email/download)
  router.post('/:id/dispatch', async (req, res) => {
    try {
      const { sentToEmail, deliveryMethod, sentBy } = req.body;
      res.json(await scripts.logDispatch(parseInt(req.params.id as string), sentToEmail, deliveryMethod, sentBy));
    } catch (e) { res.status(400).json({ error: String(e) }); }
  });

  return router;
}
