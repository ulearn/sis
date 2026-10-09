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

// ── Printable attendance sheet ───────────────────────────────────────────
// Renders one or many classes' rosters as the paper sheet teachers fill in
// by hand (pre-fills student names so absences become visible by what's NOT
// ticked, instead of teachers writing the present list — the original gap
// Neil flagged). Auto-triggers window.print() on load; print stylesheets
// hide the browser chrome and page-break between classes.
function renderSheetHtml(opts: {
  weekStart: string;        // YYYY-MM-DD (Monday)
  classes: Array<{
    className: string;
    classroom: string | null;
    session: string;        // MORNING / AFTERNOON / PLUS_FIVE
    teacher: { firstName: string; lastName: string } | null;
    students: Array<{ firstName: string; lastName: string; nationality?: string | null }>;
  }>;
}): string {
  const fmtUK = (iso: string) => {
    const d = new Date(iso); const pad = (n: number) => String(n).padStart(2, '0');
    return `${pad(d.getDate())}/${pad(d.getMonth()+1)}/${d.getFullYear()}`;
  };
  const escHtml = (s: string) => String(s ?? '').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]!));
  const sessionLabel = (s: string) => s === 'MORNING' ? 'Morning' : s === 'AFTERNOON' ? 'Afternoon' : s === 'PLUS_FIVE' ? '+5 Afternoon' : '';
  const yearOf = (iso: string) => new Date(iso).getFullYear();

  // Always render at least 18 rows (matches the legacy template) so there's room
  // for late-add students written in by hand. Pre-filled rows come first.
  // IN / OUT cells are sized for STUDENT SIGNATURES (not just times) — that's
  // the actual workflow per Paul/Neil: each student signs in on arrival, signs
  // out at end. Late/early-exit rule enforced via the signature timestamps.
  const sheetFor = (cls: typeof opts.classes[number]) => {
    const minRows = 18;
    const totalRows = Math.max(minRows, cls.students.length + 2);
    const teacherName = cls.teacher ? `${cls.teacher.firstName} ${cls.teacher.lastName}` : '';
    const title = `ULearn ${sessionLabel(cls.session)} - Full Time Weekly Attendance ${yearOf(opts.weekStart)}`;
    return `
<section class="sheet">
  <header class="sheet-head">
    <img class="logo" src="https://ulearnschool.com/sites/default/files/images/logos/logo.png" alt="ULearn">
    <div class="nb">
      <strong>N.B.</strong> Late arrival = 50% attendance. Early exit = 50%. Late arrival <strong>and</strong> early exit = 0%.<br>
      For more information about how ULearn records attendance, please see the <strong>Student Handbook</strong>.
    </div>
  </header>
  <h2 class="sheet-title">${escHtml(title)}</h2>
  <table class="meta">
    <tr>
      <th class="lbl">Week<br>starting:</th><td class="val">${escHtml(fmtUK(opts.weekStart))}</td>
      <th class="lbl">GROUP:</th><td class="val">${escHtml(cls.className)}${cls.classroom ? ' · ' + escHtml(cls.classroom) : ''}</td>
      <th class="lbl">Teacher:</th><td class="val">${escHtml(teacherName)}</td>
      <th class="lbl">Cover Teacher: Y / N</th><td class="val"></td>
    </tr>
    <tr>
      <th class="lbl" colspan="2"></th>
      <th class="lbl">Signature</th><td class="val"></td>
      <th class="lbl" colspan="2"></th>
      <th class="lbl">Name &amp; Signature:</th><td class="val"></td>
    </tr>
  </table>
  <table class="grid">
    <thead>
      <tr>
        <th class="num" rowspan="2"></th>
        <th class="name" rowspan="2">FIRST (GIVEN) NAME</th>
        <th class="name" rowspan="2">SURNAME</th>
        <th colspan="2">MON</th><th colspan="2">TUE</th><th colspan="2">WED</th><th colspan="2">THUR</th><th colspan="2">FRI</th>
      </tr>
      <tr>
        <th class="inout">IN</th><th class="inout">OUT</th>
        <th class="inout">IN</th><th class="inout">OUT</th>
        <th class="inout">IN</th><th class="inout">OUT</th>
        <th class="inout">IN</th><th class="inout">OUT</th>
        <th class="inout">IN</th><th class="inout">OUT</th>
      </tr>
    </thead>
    <tbody>
      ${Array.from({ length: totalRows }, (_, i) => {
        const s = cls.students[i];
        return `<tr>
          <td class="num">${i + 1}</td>
          <td class="name">${escHtml(s?.firstName || '')}</td>
          <td class="name">${escHtml(s?.lastName || '')}</td>
          <td class="inout"></td><td class="inout"></td>
          <td class="inout"></td><td class="inout"></td>
          <td class="inout"></td><td class="inout"></td>
          <td class="inout"></td><td class="inout"></td>
          <td class="inout"></td><td class="inout"></td>
        </tr>`;
      }).join('')}
      <tr class="headcount">
        <td colspan="3" class="hc-lbl">HEAD COUNT</td>
        <td class="inout"></td><td class="inout"></td>
        <td class="inout"></td><td class="inout"></td>
        <td class="inout"></td><td class="inout"></td>
        <td class="inout"></td><td class="inout"></td>
        <td class="inout"></td><td class="inout"></td>
      </tr>
    </tbody>
  </table>
</section>`;
  };

  return `<!doctype html><html><head>
<meta charset="utf-8">
<title>Attendance Sheets — Week of ${fmtUK(opts.weekStart)}</title>
<style>
  @page { size: A4 landscape; margin: 10mm; }
  html, body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #111; }
  body { padding: 12px; background: #f3f3f3; }
  .toolbar { max-width: 1100px; margin: 0 auto 16px; display: flex; gap: 8px; align-items: center; }
  .toolbar button { padding: 8px 14px; border: 1px solid #ccc; background: #fff; border-radius: 6px; font-size: 13px; cursor: pointer; }
  .toolbar button.primary { background: #2563eb; color: #fff; border-color: #2563eb; }
  .sheet { background: #fff; padding: 14mm 10mm; max-width: 1100px; margin: 0 auto 18px; box-shadow: 0 1px 3px rgba(0,0,0,.1); page-break-after: always; }
  .sheet:last-child { page-break-after: auto; }
  .sheet-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 18px; margin-bottom: 12px; }
  .logo { height: 56px; width: auto; }
  .nb { font-size: 10.5px; line-height: 1.35; max-width: 70%; }
  .sheet-title { background: #e8e8e8; margin: 0 0 0 0; padding: 6px 10px; font-size: 13px; font-weight: 700; text-align: center; letter-spacing: .5px; border: 1px solid #999; border-bottom: 0; }
  table.meta { width: 100%; border-collapse: collapse; border: 1px solid #999; font-size: 11px; }
  table.meta th, table.meta td { border: 1px solid #ccc; padding: 5px 8px; vertical-align: middle; text-align: left; }
  table.meta th.lbl { background: #f4f4f4; font-weight: 700; font-size: 10.5px; width: 8%; }
  table.meta td.val { font-weight: 500; width: 12%; }
  table.grid { width: 100%; border-collapse: collapse; border: 1px solid #999; margin-top: 0; font-size: 12px; }
  table.grid th, table.grid td { border: 1px solid #bbb; padding: 6px 8px; }
  table.grid thead th { background: #f4f4f4; font-weight: 700; font-size: 11px; text-align: center; }
  table.grid th.num, table.grid td.num { width: 28px; text-align: center; font-size: 11px; color: #666; }
  table.grid th.name { text-align: left; }
  table.grid td.name { text-align: left; font-weight: 500; }
  /* IN/OUT sub-cells per day — sized for STUDENT SIGNATURES (each student
     signs in on arrival, signs out at end of session) per Paul's workflow.
     Late arrival = 50% / early exit = 50% / both = 0%; the signed timestamps
     make the rule auditable. */
  table.grid th.inout { width: 65px; text-align: center; font-size: 10px; font-weight: 600; color: #555; padding: 3px 0; }
  table.grid td.inout { width: 65px; text-align: center; padding: 4px 2px; font-family: ui-monospace, 'SF Mono', Menlo, monospace; font-size: 10.5px; }
  table.grid tbody td { height: 32px; }   /* taller — fits a handwritten signature */
  table.grid tr.headcount td { background: #f4f4f4; font-weight: 700; font-size: 11px; height: 28px; }
  table.grid tr.headcount td.hc-lbl { text-align: right; padding-right: 14px; letter-spacing: .3px; }
  @media print {
    body { background: #fff; padding: 0; }
    .toolbar { display: none; }
    .sheet { box-shadow: none; margin: 0; padding: 0; }
    .sheet-title { background: #e8e8e8 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    table.meta th.lbl, table.grid thead th { background: #f4f4f4 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  }
</style></head><body>
<div class="toolbar">
  <button class="primary" onclick="window.print()">Print</button>
  <button onclick="window.close()">Close</button>
  <span style="color:#666;font-size:12px">${opts.classes.length} sheet${opts.classes.length===1?'':'s'} — week of ${fmtUK(opts.weekStart)}</span>
</div>
${opts.classes.map(sheetFor).join('\n')}
<script>window.addEventListener('load', () => setTimeout(() => window.print(), 300));</script>
</body></html>`;
}

export function attendanceRoutes(prisma: PrismaClient) {
  const router = Router();
  const scripts = attendanceScripts(prisma);

  // Print a single class's attendance sheet for a given week.
  router.get('/print/class/:classId/:weekOf', async (req, res) => {
    try {
      const data = await scripts.getWeekAttendance(parseInt(req.params.classId), req.params.weekOf);
      if (!data) return res.status(404).send('Class not found');
      const html = renderSheetHtml({
        weekStart: data.weekStart,
        classes: [{
          className: data.className,
          classroom: data.classroom || null,
          session: data.session,
          teacher: data.teacher ? { firstName: data.teacher.firstName, lastName: data.teacher.lastName } : null,
          students: data.students.map((s: any) => ({ firstName: s.firstName, lastName: s.lastName, nationality: s.nationality })),
        }],
      });
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.send(html);
    } catch (e: any) { res.status(500).send(`Error: ${e.message}`); }
  });

  // Print every class's sheet for a given week — single page, page-breaks between.
  router.get('/print/week/:weekOf', async (req, res) => {
    try {
      const weekOf = req.params.weekOf;
      // UTC throughout — weekOf parses to UTC midnight; local getDay/setDate/
      // setHours shift the header back a day on the BST server, printing the week
      // as Sunday-14 instead of Monday-15 (issue #31). Matches getWeekAttendance.
      const monday = new Date(weekOf);
      monday.setUTCDate(monday.getUTCDate() - ((monday.getUTCDay() + 6) % 7));
      monday.setUTCHours(0, 0, 0, 0);
      // List all classes that have any students assigned this week — same
      // visibility rule as the main attendance page (active classes only).
      const classes = await prisma.class.findMany({
        where: { active: true } as any,
        select: { id: true, name: true, session: true },
        orderBy: [{ session: 'asc' }, { name: 'asc' }],
      });
      const sheets = [];
      for (const c of classes) {
        const data = await scripts.getWeekAttendance(c.id, weekOf);
        if (!data || !data.students.length) continue; // skip empty classes — no point printing them
        sheets.push({
          className: data.className,
          classroom: data.classroom || null,
          session: data.session,
          teacher: data.teacher ? { firstName: data.teacher.firstName, lastName: data.teacher.lastName } : null,
          students: data.students.map((s: any) => ({ firstName: s.firstName, lastName: s.lastName, nationality: s.nationality })),
        });
      }
      const html = renderSheetHtml({
        weekStart: monday.toISOString().split('T')[0],
        classes: sheets,
      });
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.send(html);
    } catch (e: any) { res.status(500).send(`Error: ${e.message}`); }
  });

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
      const who = req.body.recordedBy || (req.session as any)?.user || (req.session as any)?.displayName || null;
      const result = await scripts.markAttendance({ ...req.body, recordedBy: who });
      res.json(result);
    } catch (e) { res.status(400).json({ error: String(e) }); }
  });

  // Bulk mark attendance
  router.post('/bulk', async (req, res) => {
    try {
      const who = (req.session as any)?.user || (req.session as any)?.displayName || null;
      const results = await scripts.bulkMarkAttendance(req.body.records, who);
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

  // ---- Monitoring dashboard ----
  router.get('/monitor', async (req, res) => {
    try {
      const classId = req.query.classId ? parseInt(req.query.classId as string) : null;
      const from = (req.query.from as string) || null;
      const to = (req.query.to as string) || null;
      res.json(await scripts.monitor({ classId, from, to }));
    } catch (e) { res.status(500).json({ error: String(e) }); }
  });

  router.post('/send-warning', async (req, res) => {
    try {
      const ids = Array.isArray(req.body?.studentIds)
        ? req.body.studentIds.map((x: any) => parseInt(x)).filter((n: number) => !!n) : [];
      if (!ids.length) return res.status(400).json({ error: 'No students selected' });
      const who = (req.session as any)?.user || (req.session as any)?.displayName || null;
      res.json(await scripts.sendWarnings(ids, who));
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
