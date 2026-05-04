/**
 * Activities — admin CRUD + image upload + publish stub.
 * Mounted at /sis/api/activities.
 *
 * Image upload mirrors the medical-cert pattern in routes/student.ts:
 *   - multer disk storage under uploads/activities/
 *   - 25MB cap, image+pdf filter
 *   - JSON wrapper so errors come back as JSON not HTML
 */
import { Router } from 'express';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import type { PrismaClient } from '../generated/prisma/client';
import { activitiesScripts } from '../scripts/activities';

const uploadDir = path.join(__dirname, '..', '..', 'uploads', 'activities');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    const aid = (req as any).params?.id || 'new';
    cb(null, `${Date.now()}-${aid}-${safe}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (/\.(jpg|jpeg|png|webp|gif|heic|heif)$/i.test(path.extname(file.originalname))) cb(null, true);
    else cb(new Error('Only image files are allowed'));
  },
});

export function activitiesRoutes(prisma: PrismaClient) {
  const router = Router();
  const scripts = activitiesScripts(prisma);

  // List for a month grid (admin calendar view).
  // ?year=YYYY&month=1-12  (1-indexed for ergonomics; converted to 0-indexed internally)
  router.get('/month', async (req, res) => {
    try {
      const year = parseInt(String(req.query.year || new Date().getFullYear()), 10);
      const month = parseInt(String(req.query.month || (new Date().getMonth() + 1)), 10) - 1;
      res.json(await scripts.listForMonth(year, month));
    } catch (e: any) { res.status(400).json({ error: String(e?.message || e) }); }
  });

  // ── Image search (Pexels + Unsplash) ──
  // MUST be registered before GET /:id — otherwise Express matches "/:id" with
  // id="search-image" and Prisma rejects the NaN parseInt result.
  router.get('/search-image', async (req, res) => {
    try {
      const q = (req.query.q || '').toString().trim();
      const source = (req.query.source || 'pexels').toString();
      if (!q) return res.status(400).json({ error: 'q required' });
      const { searchImages } = await import('../scripts/image-services');
      res.json(await searchImages(source, q));
    } catch (e: any) { res.status(500).json({ error: String(e?.message || e) }); }
  });

  router.get('/:id', async (req, res) => {
    try {
      const a = await scripts.getById(parseInt(req.params.id, 10));
      if (!a) return res.status(404).json({ error: 'Not found' });
      res.json(a);
    } catch (e: any) { res.status(500).json({ error: String(e?.message || e) }); }
  });

  router.post('/', async (req, res) => {
    try {
      const by = (req as any).session?.user || null;
      const a = await scripts.create(req.body || {}, by);
      res.status(201).json(a);
    } catch (e: any) { res.status(400).json({ error: String(e?.message || e) }); }
  });

  router.patch('/:id', async (req, res) => {
    try { res.json(await scripts.update(parseInt(req.params.id, 10), req.body || {})); }
    catch (e: any) { res.status(400).json({ error: String(e?.message || e) }); }
  });

  router.delete('/:id', async (req, res) => {
    try { res.json(await scripts.remove(parseInt(req.params.id, 10))); }
    catch (e: any) { res.status(400).json({ error: String(e?.message || e) }); }
  });

  // Image upload — wraps multer to surface JSON errors.
  const uploadImage = (req: any, res: any, next: any) => {
    upload.single('file')(req, res, (err: any) => {
      if (err) {
        const msg = err.code === 'LIMIT_FILE_SIZE' ? 'File too large (max 25MB)' : (err.message || String(err));
        return res.status(400).json({ error: msg });
      }
      next();
    });
  };

  // Pre-save staged upload — no activity ID required. Lets Kelly attach an
  // image before saving the activity record. The returned filename is
  // submitted with the activity create/update body as `imageFilename`.
  router.post('/upload-image', uploadImage, async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
      res.json({ filename: req.file.filename });
    } catch (e: any) { res.status(400).json({ error: String(e?.message || e) }); }
  });

  // Backwards-compat: existing activity upload still supported.
  router.post('/:id/image', uploadImage, async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
      const updated = await scripts.update(parseInt(req.params.id, 10), { imageFilename: req.file.filename });
      res.json({ ok: true, imageFilename: req.file.filename, activity: updated });
    } catch (e: any) { res.status(400).json({ error: String(e?.message || e) }); }
  });

  // Pick a search result → download to uploads/activities/ + return filename
  router.post('/attach-from-url', async (req, res) => {
    try {
      const url = (req.body && req.body.url || '').toString();
      if (!url) return res.status(400).json({ error: 'url required' });
      const { downloadToActivities } = await import('../scripts/image-services');
      const filename = await downloadToActivities(url, uploadDir);
      res.json({ filename });
    } catch (e: any) { res.status(500).json({ error: String(e?.message || e) }); }
  });

  // ── Add ULearn logo watermark to a staged image ──
  // Hub returns BOTH a FB variant (logo on original aspect) and an IG variant
  // (cropped to IG aspect band first, then logo top-right of the cropped frame
  // — so the watermark survives cropping instead of being trimmed off the edge).
  // SIS downloads both and returns their filenames; the frontend uses the FB
  // version as the main staged file and the IG version for the IG preview /
  // publish path.
  router.post('/overlay-logo', async (req, res) => {
    try {
      const filename = (req.body && req.body.filename || '').toString();
      if (!filename) return res.status(400).json({ error: 'filename required' });
      const hubUrl = process.env.META_HUB_URL;
      if (!hubUrl) return res.status(500).json({ error: 'META_HUB_URL not set' });
      const publicBase = process.env.SIS_PUBLIC_URL || 'https://sis.ulearnschool.com';
      const imageUrl = `${publicBase}/sis/api/activities/image/${encodeURIComponent(filename)}`;

      const r = await fetch(`${hubUrl}/social/overlay-logo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId: 'ulearn', imageUrl, variant: req.body?.variant || 'primary' }),
      });
      const d: any = await r.json().catch(() => ({}));
      if (!r.ok || d.error) throw new Error(d.error || `Hub overlay: ${r.status}`);

      const abs = (u: string) => u?.startsWith('http') ? u : `${hubUrl}${u}`;
      const { downloadToActivities } = await import('../scripts/image-services');
      const fbFilename = await downloadToActivities(abs(d.fb?.url), uploadDir);
      const igFilename = await downloadToActivities(abs(d.ig?.url), uploadDir);
      res.json({ filename: fbFilename, igFilename });
    } catch (e: any) { res.status(500).json({ error: String(e?.message || e) }); }
  });

  // ── AI generate via Gemini ──
  router.post('/generate-image', async (req, res) => {
    try {
      const prompt = (req.body && req.body.prompt || '').toString().trim();
      if (!prompt) return res.status(400).json({ error: 'prompt required' });
      const { generateImage } = await import('../scripts/image-services');
      const filename = await generateImage(prompt, uploadDir);
      res.json({ filename });
    } catch (e: any) { res.status(500).json({ error: String(e?.message || e) }); }
  });

  // Serve an activity image (public — no auth needed; used in social posts too)
  router.get('/image/:filename', async (req, res) => {
    const filename = req.params.filename;
    const filePath = path.resolve(uploadDir, filename);
    if (!filePath.startsWith(path.resolve(uploadDir))) return res.status(400).json({ error: 'Invalid path' });
    if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'Not found' });
    res.sendFile(filePath);
  });

  // Publish to social — single call drafts to BOTH FB Page + IG Business
  // via hub.foxfix.ai. Kelly approves/discards each in Meta Business Suite.
  // igImageFilename, when present, is the pre-cropped+logod IG variant — pass
  // it through so hub uses it directly instead of auto-cropping the FB image.
  router.post('/:id/publish', async (req, res) => {
    try {
      const draft = req.body?.draft !== false;
      const igImageFilename = req.body?.igImageFilename || null;
      res.json(await scripts.publish(parseInt(req.params.id, 10), { draft, igImageFilename }));
    } catch (e: any) { res.status(400).json({ error: String(e?.message || e) }); }
  });

  // Admin: mark a student attended after the event (for the challenge unlock)
  router.patch('/attendees/:id', async (req, res) => {
    try {
      const attended = !!(req.body && req.body.attended);
      res.json(await scripts.markAttended(parseInt(req.params.id, 10), attended));
    } catch (e: any) { res.status(400).json({ error: String(e?.message || e) }); }
  });

  return router;
}
