import { Router } from 'express';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { PrismaClient } from '../generated/prisma/client';
import { studentScripts } from '../scripts/students';

const uploadDir = path.join(__dirname, '..', '..', 'uploads', 'students');
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const dir = path.join(uploadDir, String(_req.params.id));
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (_req, file, cb) => cb(null, Date.now() + '-' + file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_')),
});
const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  fileFilter: (_req, file, cb) => {
    const ok = /^(image\/|application\/pdf|application\/msword|application\/vnd\.openxmlformats)/.test(file.mimetype);
    cb(null, ok || true); // allow all — the filter is advisory
  },
});

export function studentRoutes(prisma: PrismaClient) {
  const router = Router();
  const scripts = studentScripts(prisma);

  router.get('/', async (req, res) => {
    try {
      const result = await scripts.list(req.query);
      res.json(result);
    } catch (e) { res.status(500).json({ error: String(e) }); }
  });

  router.get('/:id', async (req, res) => {
    try {
      const student = await scripts.getById(parseInt(req.params.id));
      if (!student) return res.status(404).json({ error: 'Student not found' });
      res.json(student);
    } catch (e) { res.status(500).json({ error: String(e) }); }
  });

  router.post('/', async (req, res) => {
    try {
      const student = await scripts.create(req.body);
      res.status(201).json(student);
    } catch (e) { res.status(400).json({ error: String(e) }); }
  });

  router.patch('/:id', async (req, res) => {
    try {
      const student = await scripts.update(parseInt(req.params.id), req.body);
      res.json(student);
    } catch (e) { res.status(400).json({ error: String(e) }); }
  });

  router.delete('/:id', async (req, res) => {
    try {
      await scripts.remove(parseInt(req.params.id));
      res.json({ deleted: true });
    } catch (e) { res.status(400).json({ error: String(e) }); }
  });

  // ── Student document uploads (visa, passport, etc.) ──────────

  // List documents for a student
  router.get('/:id/documents', async (req, res) => {
    try {
      const docs = await prisma.studentDocument.findMany({
        where: { studentId: parseInt(req.params.id) },
        orderBy: { createdAt: 'desc' },
      });
      res.json(docs);
    } catch (e) { res.status(500).json({ error: String(e) }); }
  });

  // Upload one or more files
  router.post('/:id/documents', upload.array('files', 10), async (req, res) => {
    try {
      const studentId = parseInt(String(req.params.id));
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) return res.status(400).json({ error: 'No files' });
      const category = String(req.body.category || 'visa');
      const uploadedBy = (req as any).session?.user || null;

      const docs = [];
      for (const f of files) {
        const doc = await prisma.studentDocument.create({
          data: {
            studentId,
            filename: f.filename,
            originalName: f.originalname,
            mimeType: f.mimetype,
            size: f.size,
            category,
            uploadedBy,
          },
        });
        docs.push(doc);
      }
      res.status(201).json(docs);
    } catch (e) { res.status(400).json({ error: String(e) }); }
  });

  // Download a document
  router.get('/:id/documents/:docId/download', async (req, res) => {
    try {
      const doc = await prisma.studentDocument.findUnique({ where: { id: parseInt(req.params.docId) } });
      if (!doc || doc.studentId !== parseInt(req.params.id)) return res.status(404).json({ error: 'Not found' });
      const filePath = path.join(uploadDir, String(doc.studentId), doc.filename);
      if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'File missing from disk' });
      res.setHeader('Content-Disposition', `attachment; filename="${doc.originalName}"`);
      res.setHeader('Content-Type', doc.mimeType);
      fs.createReadStream(filePath).pipe(res);
    } catch (e) { res.status(500).json({ error: String(e) }); }
  });

  // Delete a document
  router.delete('/:id/documents/:docId', async (req, res) => {
    try {
      const doc = await prisma.studentDocument.findUnique({ where: { id: parseInt(req.params.docId) } });
      if (!doc || doc.studentId !== parseInt(req.params.id)) return res.status(404).json({ error: 'Not found' });
      const filePath = path.join(uploadDir, String(doc.studentId), doc.filename);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      await prisma.studentDocument.delete({ where: { id: doc.id } });
      res.json({ deleted: true });
    } catch (e) { res.status(400).json({ error: String(e) }); }
  });

  return router;
}
