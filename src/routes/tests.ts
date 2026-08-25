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

  // POST /sis/api/tests/reset/:studentId — admin-only wipe of a student's
  // placement/quiz so the assessment test surfaces again in their app.
  router.post('/reset/:studentId', async (req: any, res) => {
    try {
      if ((req.session?.role || '') !== 'admin') {
        return res.status(403).json({ success: false, error: 'Admin only' });
      }
      const studentId = parseInt(req.params.studentId);
      if (!studentId) return res.status(400).json({ success: false, error: 'studentId required' });
      res.json(await scripts.resetPlacement(studentId));
    } catch (e: any) { res.status(500).json({ success: false, error: String(e?.message || e) }); }
  });

  // POST /sis/api/tests/placement-manual/:studentId — admin-only: record a
  // placement LEVEL for a student who was placed off the app (no online result).
  router.post('/placement-manual/:studentId', async (req: any, res) => {
    try {
      if ((req.session?.role || '') !== 'admin') {
        return res.status(403).json({ success: false, error: 'Admin only' });
      }
      const studentId = parseInt(req.params.studentId);
      if (!studentId) return res.status(400).json({ success: false, error: 'studentId required' });
      res.json(await scripts.setManualPlacement(studentId, String(req.body?.level || '')));
    } catch (e: any) { res.status(500).json({ success: false, error: String(e?.message || e) }); }
  });

  // POST /sis/api/tests/assess-writing/:studentId — admin/DOS: run (or refresh)
  // the AI Tutor grade of the student's placement writing task. force=true by
  // default here since it's a deliberate click; the result is cached on the token.
  router.post('/assess-writing/:studentId', async (req: any, res) => {
    try {
      const role = req.session?.role || '';
      if (!['admin', 'dos'].includes(role)) {
        return res.status(403).json({ success: false, error: 'admin or DOS only' });
      }
      const studentId = parseInt(req.params.studentId, 10);
      if (!Number.isFinite(studentId)) return res.status(400).json({ success: false, error: 'studentId required' });
      res.json(await scripts.assessWritingForStudent(studentId, { force: true }));
    } catch (e: any) { res.status(500).json({ success: false, error: String(e?.message || e) }); }
  });

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

  // GET /sis/api/tests/status/:studentId — send/completion state for the admin
  // "Send Test" button (greyed "already sent" colour + tooltip + re-send guard).
  router.get('/status/:studentId', async (req: any, res) => {
    try {
      const studentId = parseInt(req.params.studentId, 10);
      if (!Number.isFinite(studentId)) return res.status(400).json({ error: 'studentId must be an integer' });
      res.json(await scripts.testStatus(studentId));
    } catch (e: any) { res.status(500).json({ error: String(e?.message || e) }); }
  });

  // GET /sis/api/tests/placement/:studentId — admin/DOS review of a student's
  // most recent placement-class test (PLACEMENT or DELTA). Returns score,
  // CEFR, per-question Q&A (from rawResult), and the writing task. Used by
  // the LMS Placement Review page in the admin UI.
  router.get('/placement/:studentId', async (req: any, res) => {
    try {
      const role = req.session?.role || '';
      if (!['admin', 'dos'].includes(role)) {
        return res.status(403).json({ success: false, error: 'admin or DOS only' });
      }
      const studentId = parseInt(req.params.studentId, 10);
      if (!Number.isFinite(studentId)) return res.status(400).json({ success: false, error: 'studentId must be an integer' });
      const result = await scripts.getPlacementForStudent(studentId);
      res.json(result);
    } catch (e: any) { res.status(500).json({ success: false, error: String(e?.message || e) }); }
  });

  return router;
}

// Public side (mounted outside the SIS auth middleware, CORS-enabled)
export function testRoutesPublic(prisma: PrismaClient) {
  const router = Router();
  const scripts = testScripts(prisma);

  // CORS — the LMS calls these from the browser. Post-migration it's served at
  // sis.ulearnschool.com/prototype (same-origin), but the old lms.ulearnschool.com
  // host still runs in parallel, so reflect either allowed origin.
  const TEST_ORIGINS = new Set(['https://sis.ulearnschool.com', 'https://lms.ulearnschool.com']);
  router.use((req, res, next) => {
    const o = req.headers.origin || '';
    res.setHeader('Access-Control-Allow-Origin', TEST_ORIGINS.has(o) ? o : 'https://sis.ulearnschool.com');
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
    // Diagnostic logging (Paul's placement-not-linking issue, 2026-08-13): capture
    // EVERY submit attempt with its context, so we can see whether app-webview
    // submits arrive at all and, if so, why they fail. UA/Origin/Referer
    // distinguish the Capacitor app-iframe path from the emailed-link browser path.
    const ua = String(req.headers['user-agent'] || '');
    const origin = String(req.headers.origin || '');
    const referer = String(req.headers.referer || '');
    try {
      const { token, scorePct, correct, wrong, cefrLevel, raw, writingPrompt, writingResponse } = req.body || {};
      const tokPrefix = token ? String(token).slice(0, 8) : '(none)';
      console.log(`[tests/submit] IN token=${tokPrefix} score=${scorePct} cefr=${cefrLevel} writing=${!!(writingResponse && String(writingResponse).trim())} origin=${origin || '-'} ref=${referer || '-'} ua=${ua.slice(0, 140)}`);
      if (!token) {
        console.warn(`[tests/submit] REJECT no-token origin=${origin || '-'} ref=${referer || '-'} ua=${ua.slice(0, 140)}`);
        return res.status(400).json({ success: false, error: 'token required' });
      }
      const result = await scripts.recordResult({
        token,
        scorePct: Number(scorePct) || 0,
        correct: Number(correct) || 0,
        wrong: Number(wrong) || 0,
        cefrLevel,
        raw,
        writingPrompt,
        writingResponse,
      });
      console.log(`[tests/submit] OUT token=${tokPrefix} result=${JSON.stringify(result).slice(0, 200)}`);
      res.json(result);
    } catch (e: any) {
      console.error(`[tests/submit] ERROR origin=${origin || '-'} ref=${referer || '-'} ua=${ua.slice(0, 140)}: ${e?.message || e}`);
      res.status(500).json({ success: false, error: String(e?.message || e) });
    }
  });

  // Attach the writing task AFTER the score was already submitted at questions-end.
  // The placement score/level now links the moment the questions finish (so a
  // student who skips/abandons the writing still gets their level); this saves the
  // optional writing onto the already-scored token. Never rejects on "already used".
  router.post('/writing', async (req, res) => {
    try {
      const { token, writingPrompt, writingResponse } = req.body || {};
      if (!token) return res.status(400).json({ success: false, error: 'token required' });
      console.log(`[tests/writing] token=${String(token).slice(0, 8)} len=${writingResponse ? String(writingResponse).length : 0}`);
      res.json(await scripts.recordWriting(String(token), { writingPrompt, writingResponse }));
    } catch (e: any) { res.status(500).json({ success: false, error: String(e?.message || e) }); }
  });

  // ── In-progress autosave (PLACEMENT only) ──────────────────────────────────
  // POST: the client throttle-saves its state as the student types (survives
  // browser close / new token / new device). GET: resume — returns the student's
  // most-recent unsubmitted placement draft. Both public + token-scoped.
  router.post('/draft', async (req, res) => {
    try {
      const { token, draft } = req.body || {};
      if (!token) return res.status(400).json({ success: false, error: 'token required' });
      res.json(await scripts.recordDraft(String(token), draft));
    } catch (e: any) { res.status(500).json({ success: false, error: String(e?.message || e) }); }
  });
  router.get('/draft', async (req, res) => {
    try {
      const token = String(req.query?.token || '');
      if (!token) return res.status(400).json({ success: false, draft: null });
      res.json(await scripts.loadDraft(token));
    } catch (e: any) { res.status(500).json({ success: false, error: String(e?.message || e) }); }
  });

  return router;
}
