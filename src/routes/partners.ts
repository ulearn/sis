/**
 * Partner portal — API routes
 * All routes are mounted at /partners/api
 * Every request is scoped by session.agencyId (never from query params).
 */
import { Router } from 'express';
import { PrismaClient } from '../generated/prisma/client';
import { partnerScripts } from '../scripts/partners';

export function partnerRoutes(prisma: PrismaClient) {
  const router = Router();
  const scripts = partnerScripts(prisma);

  // ── Me ───────────────────────────────────────
  router.get('/me', (req, res) => {
    if (!req.session.user || req.session.userType !== 'partner') {
      return res.status(401).json({ success: false, error: 'Not authenticated' });
    }
    res.json({
      success: true,
      user: req.session.user,
      displayName: req.session.displayName,
      agencyId: req.session.agencyId,
      agencyName: req.session.agencyName,
      permissions: req.session.portalPermissions || {},
    });
  });

  // ── Dashboard ────────────────────────────────
  router.get('/dashboard', async (req, res) => {
    try {
      const data = await scripts.dashboard(req.session.agencyId!);
      res.json({ success: true, ...data });
    } catch (e) { res.status(500).json({ success: false, error: String(e) }); }
  });

  // ── Students ─────────────────────────────────
  router.get('/students', async (req, res) => {
    try {
      const data = await scripts.students(req.session.agencyId!, {
        search: req.query.search as string,
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 50,
      });
      res.json({ success: true, ...data });
    } catch (e) { res.status(500).json({ success: false, error: String(e) }); }
  });

  // ── Student detail (agency-scoped) ──────────
  router.get('/students/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (!id) return res.status(400).json({ success: false, error: 'Invalid id' });
      const data = await scripts.studentDetail(req.session.agencyId!, id);
      res.json(data);
    } catch (e) { res.status(500).json({ success: false, error: String(e) }); }
  });

  // ── Bookings ─────────────────────────────────
  router.get('/bookings', async (req, res) => {
    try {
      const data = await scripts.bookings(req.session.agencyId!, {
        status: req.query.status as string,
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 50,
      });
      res.json({ success: true, ...data });
    } catch (e) { res.status(500).json({ success: false, error: String(e) }); }
  });

  // ── Finance ──────────────────────────────────
  router.get('/finance', async (req, res) => {
    try {
      const data = await scripts.finance(req.session.agencyId!);
      res.json({ success: true, ...data });
    } catch (e) { res.status(500).json({ success: false, error: String(e) }); }
  });

  // ── Live finance (quotes + invoices + totals, pulled from HubSpot) ──
  router.get('/live-finance', async (req, res) => {
    try {
      const data = await scripts.liveFinance(req.session.agencyId!);
      res.json({ success: true, ...data });
    } catch (e) { res.status(500).json({ success: false, error: String(e) }); }
  });

  // ── Quote action (Accept / Query) ─────────────
  router.post('/quote-action', async (req, res) => {
    try {
      const result = await scripts.recordQuoteAction(
        req.session.agencyId!,
        req.session.agencyName || '',
        req.body,
      );
      res.json(result);
    } catch (e) { res.status(500).json({ success: false, error: String(e) }); }
  });

  // ── Documents (Zoho-signed contracts) ─────────
  router.get('/documents', async (req, res) => {
    try {
      const data = await scripts.documents(req.session.agencyId!);
      res.json({ success: true, ...data });
    } catch (e) { res.status(500).json({ success: false, error: String(e) }); }
  });

  // ── Serve cached PDF (agency-scoped) ──────────
  router.get('/documents/:id/pdf', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (!id) return res.status(400).send('Invalid id');
      const doc = await prisma.partnerDocument.findUnique({ where: { id } });
      if (!doc || doc.agencyId !== req.session.agencyId) {
        return res.status(404).send('Not found');
      }
      if (!doc.pdfCachedPath) return res.status(404).send('PDF not available');
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="${(doc.requestName || 'contract').replace(/[^a-z0-9_.-]/gi,'_')}.pdf"`);
      res.sendFile(doc.pdfCachedPath);
    } catch (e) { res.status(500).send(String(e)); }
  });

  // ── Enroll ─────────────────────────────────────
  // Receives form data, creates contact + deal in HubSpot server-side.
  router.post('/enroll', async (req, res) => {
    try {
      const result = await scripts.enroll(
        req.session.agencyId!,
        req.session.agencyName || '',
        req.body,
        req.session.partnerHubspotContactId,
      );
      res.json(result);
    } catch (e) { res.status(500).json({ success: false, error: String(e) }); }
  });

  return router;
}
