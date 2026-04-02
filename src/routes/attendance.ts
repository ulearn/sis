import { Router } from 'express';
import { PrismaClient } from '../generated/prisma/client';
import { attendanceScripts } from '../scripts/attendance';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const uploadDir = path.join(__dirname, '..', '..', 'uploads', 'attendance');

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${Date.now()}-${safe}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    const allowed = /\.(jpg|jpeg|png|webp|gif|pdf)$/i;
    if (allowed.test(path.extname(file.originalname))) cb(null, true);
    else cb(new Error('Only image and PDF files are allowed'));
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
  router.post('/upload/:classId/:weekOf', upload.single('file'), async (req, res) => {
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

  // List uploads for a class/week
  router.get('/uploads/:classId/:weekOf', async (req, res) => {
    try {
      const metaFile = path.join(uploadDir, 'meta', `${req.params.classId}-${req.params.weekOf}.json`);
      if (!fs.existsSync(metaFile)) return res.json([]);
      const files = JSON.parse(fs.readFileSync(metaFile, 'utf-8'));
      res.json(files);
    } catch (e) { res.status(500).json({ error: String(e) }); }
  });

  // Serve uploaded file
  router.get('/uploads/file/:filename', async (req, res) => {
    try {
      const filePath = path.join(uploadDir, req.params.filename);
      if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'File not found' });
      res.sendFile(filePath);
    } catch (e) { res.status(500).json({ error: String(e) }); }
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
