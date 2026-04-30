/**
 * Routes for placement-test token issuance + result recording.
 *
 * Staff (authenticated):  POST /sis/api/tests/generate-token
 * Public (token-auth):    GET  /sis/api/tests/lookup?token=...
 * Public (token-auth):    POST /sis/api/tests/submit
 *
 * The two public endpoints are called from the LMS at lms.ulearnschool.com,
 * so they need CORS. The app.ts mounts the public pair at a different path
 * that bypasses the SIS session auth (see /sis/api/tests/public/).
 */
import { Router } from 'express';
import type { PrismaClient } from '../generated/prisma/client';
import { testScripts } from '../scripts/tests';

// Staff-authenticated side (mounted inside /sis/api/, behind requireAuth)
export function testRoutesStaff(prisma: PrismaClient) {
  const router = Router();
  const scripts = testScripts(prisma);

  router.post('/generate-token', async (req: any, res) => {
    try {
      const studentId = parseInt(req.body?.studentId);
      const testType = req.body?.testType; // optional override
      if (!studentId) return res.status(400).json({ success: false, error: 'studentId required' });
      const issuedBy = req.session?.user || null;
      const send = req.body?.send !== false; // default true
      const direct = req.body?.direct === true;
      const result = await scripts.generateToken({ studentId, testType, issuedBy, send, direct });
      res.json(result);
    } catch (e: any) { res.status(500).json({ success: false, error: String(e?.message || e) }); }
  });

  return router;
}

// Public side (mounted outside the SIS auth middleware, CORS-enabled)
export function testRoutesPublic(prisma: PrismaClient) {
  const router = Router();
  const scripts = testScripts(prisma);

  // CORS — the LMS at lms.ulearnschool.com calls these directly from the browser.
  router.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'https://lms.ulearnschool.com');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Vary', 'Origin');
    if (req.method === 'OPTIONS') return res.sendStatus(204);
    next();
  });

  router.get('/lookup', async (req, res) => {
    try {
      const token = String(req.query?.token || '');
      if (!token) return res.status(400).json({ valid: false, error: 'token required' });
      res.json(await scripts.lookupByToken(token));
    } catch (e: any) { res.status(500).json({ valid: false, error: String(e?.message || e) }); }
  });

  router.post('/submit', async (req, res) => {
    try {
      const { token, scorePct, correct, wrong, cefrLevel, raw } = req.body || {};
      if (!token) return res.status(400).json({ success: false, error: 'token required' });
      const result = await scripts.recordResult({
        token,
        scorePct: Number(scorePct) || 0,
        correct: Number(correct) || 0,
        wrong: Number(wrong) || 0,
        cefrLevel,
        raw,
      });
      res.json(result);
    } catch (e: any) { res.status(500).json({ success: false, error: String(e?.message || e) }); }
  });

  return router;
}
