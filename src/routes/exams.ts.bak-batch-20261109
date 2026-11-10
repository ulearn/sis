// Staff API for the Exam Booking module — mounted at /sis/api/exams (role-gated
// by the /sis/api staff gate in app.ts). Sittings CRUD + CSV import, request
// management (record CES confirmation / sat / results), config, export.
import { Router } from 'express';
import multer from 'multer';
import { PrismaClient } from '../generated/prisma/client';
import { examScripts } from '../scripts/exams';
import { getExamConfig, updateExamConfig } from '../lib/exam-config';
import { parseCsv, csvRowsToSittings, normExamCode } from '../lib/exam-csv';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

export function examRoutes(prisma: PrismaClient) {
  const router = Router();
  const scripts = examScripts(prisma);

  // ── Sittings ────────────────────────────────────────────────────────────────
  router.get('/sittings', async (req, res) => {
    try {
      const rows = await scripts.listSittings({ examCode: req.query.examCode as string, status: req.query.status as string, from: req.query.from as string });
      res.json({ sittings: rows });
    } catch (e: any) { res.status(500).json({ error: String(e?.message || e) }); }
  });
  router.post('/sittings', async (req, res) => {
    try {
      if (!normExamCode(req.body.examCode) && !req.body.examCode) return res.status(400).json({ error: 'examCode required' });
      const row = await scripts.createSitting({ ...req.body, examCode: normExamCode(req.body.examCode) || req.body.examCode });
      res.json({ sitting: row });
    } catch (e: any) { res.status(400).json({ error: String(e?.message || e) }); }
  });
  router.patch('/sittings/:id', async (req, res) => {
    try {
      const body = { ...req.body };
      if (body.examCode) body.examCode = normExamCode(body.examCode) || body.examCode;
      const row = await scripts.updateSitting(Number(req.params.id), body);
      res.json({ sitting: row });
    } catch (e: any) { res.status(400).json({ error: String(e?.message || e) }); }
  });
  router.post('/sittings/:id/archive', async (req, res) => {
    try { res.json({ sitting: await scripts.archiveSitting(Number(req.params.id)) }); }
    catch (e: any) { res.status(400).json({ error: String(e?.message || e) }); }
  });

  // ── CSV import: preview then commit ──────────────────────────────────────────
  router.post('/import', upload.single('file'), async (req: any, res) => {
    try {
      if (!req.file?.buffer) return res.status(400).json({ error: 'Upload a CSV file (field "file").' });
      const parsed = parseCsv(req.file.buffer.toString('utf-8'));
      const sittings = csvRowsToSittings(parsed);
      const result = await scripts.importSittings(sittings, { commit: false });
      res.json({ rows: sittings, result });   // preview — rows echoed so commit can post them back
    } catch (e: any) { res.status(400).json({ error: String(e?.message || e) }); }
  });
  router.post('/import/commit', async (req, res) => {
    try {
      const rows = Array.isArray(req.body?.rows) ? req.body.rows : [];
      if (!rows.length) return res.status(400).json({ error: 'No rows to import.' });
      const result = await scripts.importSittings(rows, { commit: true });
      res.json({ result });
    } catch (e: any) { res.status(400).json({ error: String(e?.message || e) }); }
  });

  // ── Requests ────────────────────────────────────────────────────────────────
  router.get('/requests', async (req, res) => {
    try { res.json({ requests: await scripts.listRequests({ status: req.query.status as string }) }); }
    catch (e: any) { res.status(500).json({ error: String(e?.message || e) }); }
  });
  router.get('/requests/:id', async (req, res) => {
    try {
      const row = await scripts.getRequest(Number(req.params.id));
      if (!row) return res.status(404).json({ error: 'Not found' });
      res.json({ request: row });
    } catch (e: any) { res.status(500).json({ error: String(e?.message || e) }); }
  });
  router.patch('/requests/:id', async (req: any, res) => {
    try {
      const actor = req.session?.user || req.session?.userType || 'staff';
      const out = await scripts.updateRequest(Number(req.params.id), req.body, String(actor));
      if (!out.ok) return res.status(out.code || 400).json({ error: out.error });
      res.json({ request: out.booking });
    } catch (e: any) { res.status(400).json({ error: String(e?.message || e) }); }
  });

  // ── Config (CES address, live-send arm, reminder schedule) ───────────────────
  router.get('/config', (_req, res) => res.json({ config: getExamConfig() }));
  router.patch('/config', (req, res) => {
    try { res.json({ config: updateExamConfig(req.body || {}) }); }
    catch (e: any) { res.status(400).json({ error: String(e?.message || e) }); }
  });

  // ── Compliance export (CSV) ──────────────────────────────────────────────────
  router.get('/export', async (_req, res) => {
    try {
      const rows = await scripts.listRequests({});
      const esc = (v: any) => { const s = v == null ? '' : String(v); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
      const header = ['id', 'student_id', 'student_name', 'level', 'status', 'payment', 'exam', 'exam_date', 'requested_at', 'centre_confirmed_at', 'sat_at', 'results_received_at', 'external_reference', 'email_thread_id'];
      const lines = [header.join(',')];
      for (const r of rows as any[]) {
        lines.push([
          r.id, r.studentId, `${r.student?.firstName || ''} ${r.student?.lastName || ''}`.trim(), r.student?.currentLevel || '',
          r.status, r.paymentArrangement, r.examSitting ? r.examSitting.examCode : '',
          r.examSitting?.examDate ? new Date(r.examSitting.examDate).toISOString().slice(0, 10) : '',
          r.requestedAt ? new Date(r.requestedAt).toISOString() : '', r.centreConfirmedAt ? new Date(r.centreConfirmedAt).toISOString() : '',
          r.satAt ? new Date(r.satAt).toISOString() : '', r.resultsReceivedAt ? new Date(r.resultsReceivedAt).toISOString() : '',
          r.externalBookingReference || '', r.emailThreadId || '',
        ].map(esc).join(','));
      }
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="exam-requests.csv"');
      res.send(lines.join('\n'));
    } catch (e: any) { res.status(500).json({ error: String(e?.message || e) }); }
  });

  return router;
}
