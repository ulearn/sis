// Referral programmes — routes.
//
// PUBLIC (mounted at /sis/referral, before requireAuth; CORS for the Drupal site):
//   GET  /validate?code=AMICI   → { valid, label?, studentDiscountPct? }  (student-facing; no reward leak)
//
// STAFF (mounted at /sis/api/referral, behind requireAuth + role gate):
//   GET  /                      → list all programs (+ agency name)
//   GET  /:agencyId             → one program (cache)
//   PUT  /:agencyId             → create/update (admin/accounts only) → PATCHes HubSpot + refreshes cache
//   POST /:agencyId/sync        → refresh cache from HubSpot (admin/accounts only)
import { Router } from 'express';
import { PrismaClient } from '../generated/prisma/client';
import { referralScripts } from '../scripts/referral';

// The Drupal booking form (ulearnschool.com) calls /validate cross-origin.
const ALLOWED_ORIGINS = new Set([
  'https://ulearnschool.com',
  'https://www.ulearnschool.com',
]);
function applyCors(req: any, res: any) {
  const origin = req.headers.origin;
  if (origin && ALLOWED_ORIGINS.has(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');
    res.setHeader('Access-Control-Max-Age', '600');
  }
}

// ── PUBLIC ────────────────────────────────────────────────────────────────
export function publicReferralRoutes(prisma: PrismaClient): Router {
  const router = Router();
  const svc = referralScripts(prisma);

  router.options('/validate', (req, res) => { applyCors(req, res); res.sendStatus(204); });

  router.get('/validate', async (req, res) => {
    applyCors(req, res);
    try {
      const code = String(req.query.code || '');
      if (!code.trim()) return res.json({ valid: false });
      const out = await svc.validateForStudent(code);
      res.json(out);
    } catch (e: any) {
      // Never block a booking on a referral hiccup — just report invalid.
      console.error('[referral] validate error:', e?.message || e);
      res.json({ valid: false });
    }
  });

  return router;
}

// ── STAFF ─────────────────────────────────────────────────────────────────
export function referralRoutes(prisma: PrismaClient): Router {
  const router = Router();
  const svc = referralScripts(prisma);

  // Writing referral config PATCHes commercial terms onto the live CRM → restrict
  // to admin/accounts (mirrors the document-templates rule).
  function requireFinanceRole(req: any, res: any): boolean {
    const role = req.session?.role;
    if (role !== 'admin' && role !== 'accounts') {
      res.status(403).json({ success: false, error: 'Referral programmes are admin/accounts-managed.' });
      return false;
    }
    return true;
  }

  router.get('/', async (_req, res) => {
    try { res.json({ success: true, programs: await svc.listPrograms() }); }
    catch (e: any) { res.status(500).json({ success: false, error: String(e?.message || e) }); }
  });

  // Agency picker for the admin "New Program" flow — name search, flags whether
  // the partner has a HubSpot entity to store the config on.
  router.get('/agencies', async (req, res) => {
    try {
      const q = String(req.query.q || '').trim();
      const rows = await prisma.agency.findMany({
        where: q ? { name: { contains: q, mode: 'insensitive' } } : undefined,
        select: { id: true, name: true, hubspotCompanyId: true, primaryContactId: true },
        orderBy: { name: 'asc' },
        take: 25,
      });
      res.json({
        success: true,
        agencies: rows.map((a) => ({
          id: a.id,
          name: a.name,
          hasHubspot: !!(a.hubspotCompanyId || a.primaryContactId),
        })),
      });
    } catch (e: any) { res.status(500).json({ success: false, error: String(e?.message || e) }); }
  });

  router.get('/:agencyId', async (req, res) => {
    try {
      const program = await svc.getProgram(Number(req.params.agencyId));
      res.json({ success: true, program });
    } catch (e: any) { res.status(500).json({ success: false, error: String(e?.message || e) }); }
  });

  router.put('/:agencyId', async (req, res) => {
    if (!requireFinanceRole(req, res)) return;
    try {
      const out = await svc.upsertProgram(Number(req.params.agencyId), req.body || {});
      res.json({ success: true, ...out });
    } catch (e: any) { res.status(400).json({ success: false, error: String(e?.message || e) }); }
  });

  router.post('/:agencyId/sync', async (req, res) => {
    if (!requireFinanceRole(req, res)) return;
    try {
      const out = await svc.syncFromHubSpot(Number(req.params.agencyId));
      res.json({ success: true, ...out });
    } catch (e: any) { res.status(500).json({ success: false, error: String(e?.message || e) }); }
  });

  return router;
}
