/**
 * Student portal routes.
 *
 * Mounted at /sis/student/api/*. Auth gate: middleware in app.ts redirects
 * unauthenticated requests to /sis/login. The session's `studentId` is set
 * at login time when userType==='student'.
 */
import { Router } from 'express';
import type { PrismaClient } from '../generated/prisma/client';
import { studentScripts } from '../scripts/student';
import { activitiesScripts } from '../scripts/activities';
import { documentScripts } from '../scripts/documents';
import { compressUploads } from '../lib/compress';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Medical-cert uploads — stored under uploads/medical-certs/ alongside the
// attendance-sheets directory. Filename pattern: {ts}-{studentId}-{date}-{safe}.
const certUploadDir = path.join(__dirname, '..', '..', 'uploads', 'medical-certs');
if (!fs.existsSync(certUploadDir)) fs.mkdirSync(certUploadDir, { recursive: true });

const certStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, certUploadDir),
  filename: (req, file, cb) => {
    const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    const sid = req.session?.studentId || 'x';
    const dateRaw = req.params.date;
    const date = (typeof dateRaw === 'string' ? dateRaw : 'unknown').replace(/[^0-9-]/g, '');
    cb(null, `${Date.now()}-${sid}-${date}-${safe}`);
  },
});

const certUpload = multer({
  storage: certStorage,
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (/\.(jpg|jpeg|png|webp|gif|heic|heif|pdf)$/i.test(path.extname(file.originalname))) cb(null, true);
    else cb(new Error('Only image (jpg/png/webp/gif/heic) and PDF files are allowed'));
  },
});

export function studentRoutesPortal(prisma: PrismaClient) {
  const router = Router();
  const scripts = studentScripts(prisma);
  const acts = activitiesScripts(prisma);
  const docs = documentScripts(prisma);

  router.get('/me', async (req, res) => {
    try {
      const studentId = req.session.studentId;
      if (!studentId) return res.status(401).json({ error: 'No student session' });
      res.json(await scripts.me(studentId));
    } catch (e: any) { res.status(500).json({ error: String(e?.message || e) }); }
  });

  router.get('/absences', async (req, res) => {
    try {
      const studentId = req.session.studentId;
      if (!studentId) return res.status(401).json({ error: 'No student session' });
      const days = Math.min(180, Math.max(1, parseInt(String(req.query.days || '60'), 10) || 60));
      res.json(await scripts.absences(studentId, days));
    } catch (e: any) { res.status(500).json({ error: String(e?.message || e) }); }
  });

  router.get('/planned-absences', async (req, res) => {
    try {
      const studentId = req.session.studentId;
      if (!studentId) return res.status(401).json({ error: 'No student session' });
      const days = Math.min(180, Math.max(1, parseInt(String(req.query.days || '60'), 10) || 60));
      res.json(await scripts.planned(studentId, days));
    } catch (e: any) { res.status(500).json({ error: String(e?.message || e) }); }
  });

  router.post('/absence-reason', async (req, res) => {
    try {
      const studentId = req.session.studentId;
      if (!studentId) return res.status(401).json({ error: 'No student session' });
      const { date, reason, noteText } = req.body || {};
      const out = await scripts.recordAbsenceReason({
        studentId,
        date,
        reason,
        noteText,
        submittedBy: req.session.user || 'student',
      });
      res.json({ ok: true, id: out.id });
    } catch (e: any) { res.status(400).json({ error: String(e?.message || e) }); }
  });

  router.delete('/absence-reason/:date', async (req, res) => {
    try {
      const studentId = req.session.studentId;
      if (!studentId) return res.status(401).json({ error: 'No student session' });
      res.json(await scripts.clearAbsenceReason(studentId, req.params.date));
    } catch (e: any) { res.status(400).json({ error: String(e?.message || e) }); }
  });

  // Medical cert upload — wraps multer to surface JSON errors instead of HTML.
  const uploadCert = (req: any, res: any, next: any) => {
    certUpload.single('file')(req, res, (err: any) => {
      if (err) {
        const msg = err.code === 'LIMIT_FILE_SIZE' ? 'File too large (max 25MB)' : (err.message || String(err));
        return res.status(400).json({ error: msg });
      }
      next();
    });
  };
  router.post('/absence-reason/:date/cert', uploadCert, compressUploads(), async (req, res) => {
    try {
      const studentId = req.session.studentId;
      if (!studentId) return res.status(401).json({ error: 'No student session' });
      if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
      const out = await scripts.attachAbsenceCert({
        studentId,
        dateIso: req.params.date,
        filename: req.file.filename,
        originalName: req.file.originalname,
        uploadedBy: req.session.user || 'student',
      });
      res.json({ ok: true, id: out.id, filename: out.filename, originalName: out.originalName });
    } catch (e: any) { res.status(400).json({ error: String(e?.message || e) }); }
  });

  router.delete('/absence-reason/:date/cert/:fileId', async (req, res) => {
    try {
      const studentId = req.session.studentId;
      if (!studentId) return res.status(401).json({ error: 'No student session' });
      const fileId = parseInt(req.params.fileId, 10);
      res.json(await scripts.removeAbsenceCertFile(studentId, req.params.date, fileId));
    } catch (e: any) { res.status(400).json({ error: String(e?.message || e) }); }
  });

  // Serve a specific cert file. Student can fetch their own.
  router.get('/absence-reason/:date/cert/:fileId', async (req, res) => {
    try {
      const studentId = req.session.studentId;
      if (!studentId) return res.status(401).json({ error: 'No student session' });
      const fileId = parseInt(req.params.fileId, 10);
      const meta = await scripts.getAbsenceCertFile(studentId, req.params.date, fileId);
      if (!meta?.filename) return res.status(404).json({ error: 'No cert on file' });
      const filePath = path.resolve(certUploadDir, meta.filename);
      if (!filePath.startsWith(path.resolve(certUploadDir))) return res.status(400).json({ error: 'Invalid path' });
      if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'File not found' });
      res.sendFile(filePath);
    } catch (e: any) { res.status(500).json({ error: String(e?.message || e) }); }
  });

  router.get('/challenges', async (req, res) => {
    try {
      const studentId = req.session.studentId;
      if (!studentId) return res.status(401).json({ error: 'No student session' });
      res.json(await scripts.challenges(studentId));
    } catch (e: any) { res.status(500).json({ error: String(e?.message || e) }); }
  });

  // Student updates their own social fields. Admin verification flips happen
  // through admin endpoints (mounted on the main router); this is self-claim only.
  router.patch('/social', async (req, res) => {
    try {
      const studentId = req.session.studentId;
      if (!studentId) return res.status(401).json({ error: 'No student session' });
      res.json(await scripts.updateSocial(studentId, req.body || {}));
    } catch (e: any) { res.status(400).json({ error: String(e?.message || e) }); }
  });

  // Self-certified follow confirmation. Marks instagramFollowVerified=true and
  // pings Slack so staff can spot-check. No API verification possible — Meta
  // retired the followers endpoint years ago.
  router.post('/social/confirm-follow', async (req, res) => {
    try {
      const studentId = req.session.studentId;
      if (!studentId) return res.status(401).json({ error: 'No student session' });
      res.json(await scripts.confirmFollow(studentId));
    } catch (e: any) { res.status(400).json({ error: String(e?.message || e) }); }
  });

  router.post('/content', async (req, res) => {
    try {
      const studentId = req.session.studentId;
      if (!studentId) return res.status(401).json({ error: 'No student session' });
      res.status(201).json(await scripts.addContentSubmission(studentId, req.body || {}));
    } catch (e: any) { res.status(400).json({ error: String(e?.message || e) }); }
  });

  router.delete('/content/:id', async (req, res) => {
    try {
      const studentId = req.session.studentId;
      if (!studentId) return res.status(401).json({ error: 'No student session' });
      res.json(await scripts.removeContentSubmission(studentId, parseInt(req.params.id, 10)));
    } catch (e: any) { res.status(400).json({ error: String(e?.message || e) }); }
  });

  router.get('/learning', async (_req, res) => {
    try { res.json(await scripts.learning()); }
    catch (e: any) { res.status(500).json({ error: String(e?.message || e) }); }
  });

  // ── Activities (student feed + RSVP) ─────────
  router.get('/activities', async (req, res) => {
    try {
      const studentId = req.session.studentId;
      if (!studentId) return res.status(401).json({ error: 'No student session' });
      res.json(await acts.studentFeed(studentId));
    } catch (e: any) { res.status(500).json({ error: String(e?.message || e) }); }
  });

  // Read-only monthly calendar for the Attended Social challenge browse view.
  // Students need the same data the admin calendar pulls so they can flip
  // through months and RSVP to anything coming up. ?year=YYYY&month=1-12.
  router.get('/activities/month', async (req, res) => {
    try {
      const studentId = req.session.studentId;
      if (!studentId) return res.status(401).json({ error: 'No student session' });
      const year = parseInt(String(req.query.year || new Date().getFullYear()), 10);
      const month = parseInt(String(req.query.month || (new Date().getMonth() + 1)), 10) - 1;
      const data = await acts.listForMonth(year, month);
      // Annotate items with this student's RSVP state so the cell can render
      // the "going" pip without a second round-trip per chip.
      const myRsvps: any[] = await prisma.activityAttendee.findMany({
        where: { studentId, activityId: { in: (data.items || []).map((a: any) => a.id) } },
        select: { activityId: true, attended: true },
      });
      const rsvpMap = new Map(myRsvps.map(r => [r.activityId, r]));
      const items = (data.items || []).map((a: any) => ({
        id: a.id, date: a.date, startTime: a.startTime, endTime: a.endTime,
        title: a.title, description: a.description, cost: a.cost,
        location: a.location, imageFilename: a.imageFilename,
        myRsvp: rsvpMap.get(a.id) ? { attended: rsvpMap.get(a.id)!.attended } : null,
      }));
      res.json({ from: data.from, to: data.to, items });
    } catch (e: any) { res.status(500).json({ error: String(e?.message || e) }); }
  });

  router.post('/activities/:id/rsvp', async (req, res) => {
    try {
      const studentId = req.session.studentId;
      if (!studentId) return res.status(401).json({ error: 'No student session' });
      res.json(await acts.rsvp(parseInt(req.params.id, 10), studentId));
    } catch (e: any) { res.status(400).json({ error: String(e?.message || e) }); }
  });

  router.delete('/activities/:id/rsvp', async (req, res) => {
    try {
      const studentId = req.session.studentId;
      if (!studentId) return res.status(401).json({ error: 'No student session' });
      res.json(await acts.cancelRsvp(parseInt(req.params.id, 10), studentId));
    } catch (e: any) { res.status(400).json({ error: String(e?.message || e) }); }
  });

  // ── Documents (preview + PDF) ─────────────────
  // The student portal mirrors what the SIS admin offers: an HTML preview of
  // the issued document and a PDF download. Both endpoints check that the
  // requested document belongs to the logged-in student so a guessed/forged
  // ID can't leak someone else's letter.

  router.get('/documents/:id/preview', async (req, res) => {
    try {
      const studentId = req.session.studentId;
      if (!studentId) return res.status(401).json({ error: 'No student session' });
      const id = parseInt(req.params.id, 10);
      const doc: any = await prisma.documentRecord.findUnique({
        where: { id },
        select: { studentId: true, contentHtml: true, status: true, documentType: true, issuedAt: true } as any,
      });
      if (!doc || doc.studentId !== studentId || doc.status !== 'ISSUED') {
        return res.status(404).send('Not found');
      }
      // Serve the rendered HTML directly so the browser/iframe can display it.
      // No CSP restrictions are added — the content was generated by our own
      // template engine and locked at issue time.
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.send(doc.contentHtml || '<p>Document content unavailable.</p>');
    } catch (e: any) { res.status(500).send('Error rendering document'); }
  });

  router.get('/documents/:id/pdf', async (req, res) => {
    try {
      const studentId = req.session.studentId;
      if (!studentId) return res.status(401).json({ error: 'No student session' });
      const id = parseInt(req.params.id, 10);
      const doc: any = await prisma.documentRecord.findUnique({
        where: { id },
        select: { studentId: true, status: true } as any,
      });
      if (!doc || doc.studentId !== studentId || doc.status !== 'ISSUED') {
        return res.status(404).json({ error: 'Not found' });
      }
      const { pdf, filename } = await docs.getDocumentPdf(id);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(pdf);
    } catch (e: any) { res.status(500).json({ error: String(e?.message || e) }); }
  });

  return router;
}
