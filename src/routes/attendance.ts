import { Router } from 'express';
import { PrismaClient } from '../generated/prisma/client';
import { attendanceScripts } from '../scripts/attendance';
import { compressUploads } from '../lib/compress';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const uploadDir = path.join(__dirname, '..', '..', 'uploads', 'attendance');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${Date.now()}-${safe}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB — phone photos can run 8–15MB
  fileFilter: (_req, file, cb) => {
    const allowed = /\.(jpg|jpeg|png|webp|gif|heic|heif|pdf)$/i;
    if (allowed.test(path.extname(file.originalname))) cb(null, true);
    else cb(new Error('Only image (jpg/png/webp/gif/heic) and PDF files are allowed'));
  }
});

export function attendanceRoutes(prisma: PrismaClient) {
  const router = Router();
  const scripts = attendanceScripts(prisma);

  // Get weekly attendance for a class
  router.get('/week/:classId/:weekOf', async (req, res) => {
    try {
      const result = await scripts.getWeekAttendance(parseInt(req.params.classId), req.params.weekOf);
      if (!result) return res.status(404).json({ error: 'Class not found' });
      res.json(result);
    } catch (e) { res.status(500).json({ error: String(e) }); }
  });

  // Get attendance for a class on a date
  router.get('/class/:classId/:date', async (req, res) => {
    try {
      const result = await scripts.getClassAttendance(parseInt(req.params.classId), req.params.date);
      if (!result) return res.status(404).json({ error: 'Class not found' });
      res.json(result);
    } catch (e) { res.status(500).json({ error: String(e) }); }
  });

  // Mark attendance for a single student
  router.post('/mark', async (req, res) => {
    try {
      const result = await scripts.markAttendance(req.body);
      res.json(result);
    } catch (e) { res.status(400).json({ error: String(e) }); }
  });

  // Bulk mark attendance
  router.post('/bulk', async (req, res) => {
    try {
      const results = await scripts.bulkMarkAttendance(req.body.records);
      res.json({ updated: results.length });
    } catch (e) { res.status(400).json({ error: String(e) }); }
  });

  // Toggle class cancellation
  router.post('/cancel/:classId/:date', async (req, res) => {
    try {
      const result = await scripts.toggleCancelled(parseInt(req.params.classId), req.params.date);
      res.json(result);
    } catch (e) { res.status(400).json({ error: String(e) }); }
  });

  // Student attendance summary
  router.get('/student/:studentId', async (req, res) => {
    try {
      const result = await scripts.studentSummary(parseInt(req.params.studentId));
      res.json(result);
    } catch (e) { res.status(500).json({ error: String(e) }); }
  });

  // ---- Attendance image uploads (per class per week) ----

  // Upload image
  const uploadOne = (req: any, res: any, next: any) => {
    upload.single('file')(req, res, (err: any) => {
      if (err) {
        const msg = err.code === 'LIMIT_FILE_SIZE' ? 'File too large (max 25MB)' : (err.message || String(err));
        return res.status(400).json({ error: msg });
      }
      next();
    });
  };
  router.post('/upload/:classId/:weekOf', uploadOne, compressUploads(), async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
      const meta = {
        classId: parseInt(req.params.classId as string),
        weekOf: req.params.weekOf as string,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
      };
      // Store metadata in a sidecar JSON
      const metaDir = path.join(uploadDir, 'meta');
      if (!fs.existsSync(metaDir)) fs.mkdirSync(metaDir, { recursive: true });
      const metaFile = path.join(metaDir, `${req.params.classId}-${req.params.weekOf}.json`);
      let existing: any[] = [];
      if (fs.existsSync(metaFile)) existing = JSON.parse(fs.readFileSync(metaFile, 'utf-8'));
      existing.push(meta);
      fs.writeFileSync(metaFile, JSON.stringify(existing, null, 2));
      res.json({ status: 'ok', file: meta });
    } catch (e) { res.status(500).json({ error: String(e) }); }
  });

  // Serve uploaded file — MUST come before /uploads/:classId/:weekOf so the
  // literal `/file/` segment isn't captured as `:classId`.
  router.get('/uploads/file/:filename', async (req, res) => {
    try {
      const filePath = path.resolve(uploadDir, req.params.filename);
      if (!filePath.startsWith(path.resolve(uploadDir))) return res.status(400).json({ error: 'Invalid filename' });
      if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'File not found' });
      res.sendFile(filePath);
    } catch (e) { res.status(500).json({ error: String(e) }); }
  });

  // List uploads for a class/week
  router.get('/uploads/:classId/:weekOf', async (req, res) => {
    try {
      const metaFile = path.join(uploadDir, 'meta', `${req.params.classId}-${req.params.weekOf}.json`);
      if (!fs.existsSync(metaFile)) return res.json([]);
      const files = JSON.parse(fs.readFileSync(metaFile, 'utf-8'));
      res.json(files);
    } catch (e) { res.status(500).json({ error: String(e) }); }
  });

  // ── Admin override of student-supplied absence reasons ──
  // Lets admins edit / add / remove a reason on behalf of a student (e.g. when
  // they have external context the student didn't supply: "IRP letter on file",
  // "cert mailed in later", etc.). The submittedBy field records the admin's
  // username so we can tell admin-set entries apart from student-set ones.
  const certDir = path.join(__dirname, '..', '..', 'uploads', 'medical-certs');
  if (!fs.existsSync(certDir)) fs.mkdirSync(certDir, { recursive: true });

  const ALLOWED_REASONS = ['SICK', 'IRP_APPT', 'PPS_APPT', 'EXAM', 'TRANSPORT', 'WEATHER', 'OTHER'];

  // GET — read existing reason + cert files for one (student, date)
  router.get('/absence-reason/:studentId/:date', async (req, res) => {
    try {
      const studentId = parseInt(req.params.studentId, 10);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(req.params.date)) return res.status(400).json({ error: 'Bad date' });
      const date = new Date(req.params.date + 'T00:00:00Z');
      const row = await prisma.absenceReason.findUnique({
        where: { studentId_date: { studentId, date } },
        select: {
          reason: true, noteText: true, submittedBy: true, submittedAt: true,
          certFiles: { select: { id: true, originalName: true, filename: true, uploadedAt: true, uploadedBy: true }, orderBy: { uploadedAt: 'asc' } },
        },
      });
      res.json(row || null);
    } catch (e) { res.status(500).json({ error: String(e) }); }
  });

  // POST — upsert reason + note (admin override)
  router.post('/absence-reason/:studentId/:date', async (req, res) => {
    try {
      const studentId = parseInt(req.params.studentId, 10);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(req.params.date)) return res.status(400).json({ error: 'Bad date' });
      const date = new Date(req.params.date + 'T00:00:00Z');
      const reason = String(req.body?.reason || '').toUpperCase();
      if (!ALLOWED_REASONS.includes(reason)) return res.status(400).json({ error: 'Invalid reason' });
      const noteText = req.body?.noteText ? String(req.body.noteText).slice(0, 500) : null;
      const adminUser = (req as any).session?.user || 'admin';

      const out = await prisma.absenceReason.upsert({
        where: { studentId_date: { studentId, date } },
        create: { studentId, date, reason, noteText, submittedBy: adminUser, reviewedBy: adminUser, reviewedAt: new Date() },
        update: { reason, noteText, reviewedBy: adminUser, reviewedAt: new Date() },
      });
      res.json({ ok: true, id: out.id });
    } catch (e: any) { res.status(400).json({ error: String(e?.message || e) }); }
  });

  // DELETE — clear reason (also removes any attached cert)
  router.delete('/absence-reason/:studentId/:date', async (req, res) => {
    try {
      const studentId = parseInt(req.params.studentId, 10);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(req.params.date)) return res.status(400).json({ error: 'Bad date' });
      const date = new Date(req.params.date + 'T00:00:00Z');
      const existing = await prisma.absenceReason.findUnique({ where: { studentId_date: { studentId, date } }, select: { certFilename: true } });
      if (existing?.certFilename) {
        try {
          const abs = path.resolve(certDir, existing.certFilename);
          if (abs.startsWith(path.resolve(certDir)) && fs.existsSync(abs)) fs.unlinkSync(abs);
        } catch {}
      }
      await prisma.absenceReason.deleteMany({ where: { studentId, date } });
      res.json({ ok: true });
    } catch (e: any) { res.status(400).json({ error: String(e?.message || e) }); }
  });

  // POST cert — admin uploads on behalf of student
  const adminCertStorage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, certDir),
    filename: (req, file, cb) => {
      const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
      const sid = req.params.studentId;
      const dRaw = req.params.date;
      const d = (typeof dRaw === 'string' ? dRaw : 'unknown').replace(/[^0-9-]/g, '');
      cb(null, `${Date.now()}-${sid}-${d}-${safe}`);
    },
  });
  const adminCertUpload = multer({
    storage: adminCertStorage,
    limits: { fileSize: 25 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
      if (/\.(jpg|jpeg|png|webp|gif|heic|heif|pdf)$/i.test(path.extname(file.originalname))) cb(null, true);
      else cb(new Error('Only image (jpg/png/webp/gif/heic) and PDF files are allowed'));
    },
  });
  const adminUploadCert = (req: any, res: any, next: any) => {
    adminCertUpload.single('file')(req, res, (err: any) => {
      if (err) return res.status(400).json({ error: err.code === 'LIMIT_FILE_SIZE' ? 'File too large (max 25MB)' : err.message });
      next();
    });
  };
  // Admin upload cert — appends a new AbsenceCertFile row (capped at 5).
  const CERT_MAX = 5;
  router.post('/absence-reason/:studentId/:date/cert', adminUploadCert, compressUploads(), async (req, res) => {
    try {
      const studentId = parseInt(req.params.studentId, 10);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(req.params.date)) return res.status(400).json({ error: 'Bad date' });
      const date = new Date(req.params.date + 'T00:00:00Z');
      if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
      const existing = await prisma.absenceReason.findUnique({
        where: { studentId_date: { studentId, date } },
        include: { certFiles: { select: { id: true } } },
      });
      if (!existing) return res.status(400).json({ error: 'Set a reason before attaching a cert' });
      if (existing.certFiles.length >= CERT_MAX) {
        try {
          const abs = path.resolve(certDir, req.file.filename);
          if (abs.startsWith(path.resolve(certDir)) && fs.existsSync(abs)) fs.unlinkSync(abs);
        } catch {}
        return res.status(400).json({ error: `Maximum ${CERT_MAX} files reached` });
      }
      const adminUser = (req as any).session?.user || 'admin';
      const out = await prisma.absenceCertFile.create({
        data: {
          absenceReasonId: existing.id,
          filename: req.file.filename,
          originalName: req.file.originalname,
          uploadedBy: adminUser,
        },
      });
      res.json({ ok: true, id: out.id, filename: out.filename, originalName: out.originalName });
    } catch (e: any) { res.status(400).json({ error: String(e?.message || e) }); }
  });

  // Serve a specific cert file by id — admin/staff path.
  // /attendance/absence-reason/:studentId/:date/cert/:fileId already exists for
  // server logic; this preserves the older /cert/:studentId/:date URL too.
  router.get('/cert/:studentId/:date', async (req, res) => {
    try {
      const studentId = parseInt(req.params.studentId, 10);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(req.params.date)) return res.status(400).json({ error: 'Bad date' });
      const date = new Date(req.params.date + 'T00:00:00Z');
      const row = await prisma.absenceReason.findUnique({
        where: { studentId_date: { studentId, date } },
        select: { certFiles: { select: { filename: true }, orderBy: { uploadedAt: 'asc' }, take: 1 }, certFilename: true },
      });
      const filename = row?.certFiles?.[0]?.filename || row?.certFilename;
      if (!filename) return res.status(404).json({ error: 'No cert on file' });
      const abs = path.resolve(certDir, filename);
      if (!abs.startsWith(path.resolve(certDir))) return res.status(400).json({ error: 'Invalid path' });
      if (!fs.existsSync(abs)) return res.status(404).json({ error: 'File missing' });
      res.sendFile(abs);
    } catch (e) { res.status(500).json({ error: String(e) }); }
  });

  // Serve a specific cert file by file id.
  router.get('/absence-reason/:studentId/:date/cert/:fileId', async (req, res) => {
    try {
      const studentId = parseInt(req.params.studentId, 10);
      const fileId = parseInt(req.params.fileId, 10);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(req.params.date)) return res.status(400).json({ error: 'Bad date' });
      const date = new Date(req.params.date + 'T00:00:00Z');
      const reason = await prisma.absenceReason.findUnique({
        where: { studentId_date: { studentId, date } },
        select: { id: true },
      });
      if (!reason) return res.status(404).json({ error: 'No reason on file' });
      const file = await prisma.absenceCertFile.findFirst({
        where: { id: fileId, absenceReasonId: reason.id },
        select: { filename: true },
      });
      if (!file) return res.status(404).json({ error: 'File not on this absence' });
      const abs = path.resolve(certDir, file.filename);
      if (!abs.startsWith(path.resolve(certDir))) return res.status(400).json({ error: 'Invalid path' });
      if (!fs.existsSync(abs)) return res.status(404).json({ error: 'File missing' });
      res.sendFile(abs);
    } catch (e) { res.status(500).json({ error: String(e) }); }
  });

  // Delete one cert file from an absence (admin override).
  router.delete('/absence-reason/:studentId/:date/cert/:fileId', async (req, res) => {
    try {
      const studentId = parseInt(req.params.studentId, 10);
      const fileId = parseInt(req.params.fileId, 10);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(req.params.date)) return res.status(400).json({ error: 'Bad date' });
      const date = new Date(req.params.date + 'T00:00:00Z');
      const reason = await prisma.absenceReason.findUnique({
        where: { studentId_date: { studentId, date } },
        select: { id: true },
      });
      if (!reason) return res.status(404).json({ error: 'No reason on file' });
      const file = await prisma.absenceCertFile.findFirst({
        where: { id: fileId, absenceReasonId: reason.id },
        select: { filename: true },
      });
      if (!file) return res.status(404).json({ error: 'File not on this absence' });
      try {
        const abs = path.resolve(certDir, file.filename);
        if (abs.startsWith(path.resolve(certDir)) && fs.existsSync(abs)) fs.unlinkSync(abs);
      } catch {}
      await prisma.absenceCertFile.delete({ where: { id: fileId } });
      res.json({ ok: true });
    } catch (e: any) { res.status(400).json({ error: String(e?.message || e) }); }
  });

  // Delete uploaded file
  router.delete('/uploads/:classId/:weekOf/:filename', async (req, res) => {
    try {
      const filePath = path.join(uploadDir, req.params.filename);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      const metaFile = path.join(uploadDir, 'meta', `${req.params.classId}-${req.params.weekOf}.json`);
      if (fs.existsSync(metaFile)) {
        let existing = JSON.parse(fs.readFileSync(metaFile, 'utf-8'));
        existing = existing.filter((f: any) => f.filename !== req.params.filename);
        fs.writeFileSync(metaFile, JSON.stringify(existing, null, 2));
      }
      res.json({ status: 'deleted' });
    } catch (e) { res.status(500).json({ error: String(e) }); }
  });

  return router;
}
