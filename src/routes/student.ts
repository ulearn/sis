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
import { syncArrivalFromFlight } from '../lib/transport-sync';
import { testScripts } from '../scripts/tests';
import { activitiesScripts } from '../scripts/activities';
import { documentScripts } from '../scripts/documents';
import { examScripts } from '../scripts/exams';
import { messageScripts } from '../scripts/messages';
import { CONTRACT_VERSION, renderPreviewBytes, buildPreviewHtmlDoc, signContract } from '../scripts/student-contract';
import { compressUploads } from '../lib/compress';
import { parsePassport, fillBirthdayIfEmpty } from '../scripts/passport-parser';
import os from 'os';
import { execFile } from 'child_process';
import { promisify } from 'util';
const execFileP = promisify(execFile);
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

// Student self-service document uploads — stored in the SAME bucket as staff
// uploads (uploads/students/<studentId>/) and as a student_documents row, so a
// student-uploaded doc surfaces automatically in the SIS admin and (broadened)
// the agency portal. category='student-upload', uploadedBy='student'.
const stuDocDir = path.join(__dirname, '..', '..', 'uploads', 'students');
const stuDocStorage = multer.diskStorage({
  destination: (req, _file, cb) => {
    const sid = (req as any).session?.studentId;
    const dir = path.join(stuDocDir, String(sid || 'unknown'));
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (_req, file, cb) => cb(null, Date.now() + '-' + file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_')),
});
const stuDocUpload = multer({ storage: stuDocStorage, limits: { fileSize: 20 * 1024 * 1024 }, fileFilter: (_r, _f, cb) => cb(null, true) });

// KickStart prize: day-14 Progress-Post screenshots → uploads/challenge-screenshots/.
const shotDir = path.join(__dirname, '..', '..', 'uploads', 'challenge-screenshots');
if (!fs.existsSync(shotDir)) fs.mkdirSync(shotDir, { recursive: true });
const shotStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, shotDir),
  filename: (req, file, cb) => {
    const sid = (req as any).session?.studentId || 'x';
    const cid = (req.params as any).id || 'x';
    const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${Date.now()}-${sid}-${cid}-${safe}`);
  },
});
const shotUpload = multer({
  storage: shotStorage,
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (/\.(jpg|jpeg|png|webp|gif|heic|heif)$/i.test(path.extname(file.originalname))) cb(null, true);
    else cb(new Error('Only image files (jpg/png/webp/gif/heic) are allowed'));
  },
});

export function studentRoutesPortal(prisma: PrismaClient) {
  const router = Router();
  const scripts = studentScripts(prisma);
  const exams = examScripts(prisma);
  const tests = testScripts(prisma);
  const acts = activitiesScripts(prisma);
  const docs = documentScripts(prisma);
  const msgs = messageScripts(prisma);

  // ── Student Agreement gate ────────────────────────────────────────────
  // Until the student signs (Student.contractSignedAt null), only /me and the
  // /contract* endpoints work; everything else 403s with reason='contract_required'
  // so the frontend surfaces the signing overlay. Mirrors the partner gate.
  // Only applies to REAL student sessions — staff previewing the portal
  // (userType!=='student', auto-pinned to test.student) are never gated.
  // Go-live flag: the gate only enforces when STUDENT_CONTRACT_GATE=on, so the
  // code can ship/restart safely BEFORE the grandfather backfill runs. Flip on
  // (after backfilling existing account-holders) to activate. Off → never gates.
  const CONTRACT_GATE_ON = process.env.STUDENT_CONTRACT_GATE === 'on';
  const CONTRACT_GATE_ALLOWLIST = ['/me', '/contract', '/contract/preview.pdf', '/contract/preview.html', '/contract/signed.pdf', '/contract/signed.html', '/contract/sign'];
  router.use(async (req, res, next) => {
    try {
      if (!CONTRACT_GATE_ON) return next();                            // feature flag off → no gate
      if (req.session?.userType !== 'student') return next();          // staff preview / other → no gate
      if (CONTRACT_GATE_ALLOWLIST.includes(req.path)) return next();
      const studentId = req.session.studentId;
      if (!studentId) return next();                                    // no session → downstream 401s handle it
      const s = await prisma.student.findUnique({ where: { id: studentId }, select: { contractSignedAt: true } });
      if (!s?.contractSignedAt) {
        return res.status(403).json({ error: 'Student Agreement must be signed', reason: 'contract_required' });
      }
      next();
    } catch (e) { res.status(500).json({ error: String(e) }); }
  });

  // ── Student Agreement — state + PDFs + sign ───────────────────────────
  router.get('/contract', async (req, res) => {
    try {
      const studentId = req.session.studentId;
      if (!studentId) return res.status(401).json({ error: 'No student session' });
      const s = await prisma.student.findUnique({ where: { id: studentId }, select: { contractSignedAt: true, firstName: true, lastName: true } });
      const sig = s?.contractSignedAt
        ? await prisma.studentSignature.findFirst({ where: { studentId }, orderBy: { id: 'desc' }, select: { signerName: true, pdfPath: true } })
        : null;
      // LifePass students also get the LifePass Programme Terms & Conditions in
      // their Agreement section (the appendix in the Student Agreement points here).
      // Identified by an active instalment ledger — the reliable LifePass signal.
      const lp: any[] = await prisma.$queryRawUnsafe(
        `SELECT 1 FROM payment_instalments pi JOIN bookings b ON b.id = pi.booking_id
          WHERE b.student_id = $1 AND pi.cancelled_at IS NULL LIMIT 1`, studentId);
      const isLifePass = Array.isArray(lp) && lp.length > 0;
      res.json({
        signed: !!s?.contractSignedAt,
        signedAt: s?.contractSignedAt ?? null,
        contractVersion: CONTRACT_VERSION,
        signerName: sig?.signerName ?? [s?.firstName, s?.lastName].filter(Boolean).join(' '),
        previewPdfUrl: '/sis/student/api/contract/preview.pdf',
        signedPdfUrl: sig?.pdfPath ? '/sis/student/api/contract/signed.pdf' : null,
        isLifePass,
        lifePassTermsUrl: isLifePass ? '/sis/student/api/contract/lifepass-terms.pdf' : null,
      });
    } catch (e: any) { res.status(500).json({ error: String(e?.message || e) }); }
  });

  router.get('/contract/preview.pdf', async (req, res) => {
    try {
      const pdf = await renderPreviewBytes(prisma);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline; filename="ULearn-Student-Agreement.pdf"');
      res.send(pdf);
    } catch (e) { res.status(500).send(String(e)); }
  });

  // Responsive HTML preview for the in-frame read pane (fits width + pinch-zoom
  // on mobile, where PDF-in-iframe renders blank). PDF stays the download path.
  router.get('/contract/preview.html', (_req, res) => {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(buildPreviewHtmlDoc());
  });

  // LifePass Programme Terms & Conditions — a static hosted PDF (update the file
  // to update the terms for everyone). Served to any authenticated student; the
  // app only surfaces the link for LifePass students.
  router.get('/contract/lifepass-terms.pdf', async (req, res) => {
    try {
      if (!req.session.studentId) return res.status(401).send('No student session');
      const p = path.join(__dirname, '..', '..', 'data', 'contracts', 'lifepass-terms.pdf');
      if (!fs.existsSync(p)) return res.status(404).send('LifePass Terms not available');
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline; filename="ULearn-LifePass-Terms.pdf"');
      fs.createReadStream(p).pipe(res);
    } catch (e) { res.status(500).send(String(e)); }
  });

  router.get('/contract/signed.pdf', async (req, res) => {
    try {
      const studentId = req.session.studentId;
      if (!studentId) return res.status(401).send('No student session');
      const sig = await prisma.studentSignature.findFirst({ where: { studentId }, orderBy: { id: 'desc' }, select: { pdfPath: true } });
      if (!sig?.pdfPath || !fs.existsSync(sig.pdfPath)) return res.status(404).send('No signed contract on file');
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline; filename="ULearn-Student-Agreement-signed.pdf"');
      fs.createReadStream(sig.pdfPath).pipe(res);
    } catch (e) { res.status(500).send(String(e)); }
  });

  // Signed copy as responsive HTML (re-renders the contract with the stored
  // signature block) — PDFs render blank in the Capacitor webview, so this is
  // what the student re-reads in-app. Falls back to the unsigned terms if no sig.
  router.get('/contract/signed.html', async (req, res) => {
    try {
      const studentId = req.session.studentId;
      if (!studentId) return res.status(401).send('No student session');
      const sig = await prisma.studentSignature.findFirst({
        where: { studentId }, orderBy: { id: 'desc' },
        select: { signerName: true, signaturePngB64: true, createdAt: true },
      });
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.send(buildPreviewHtmlDoc(sig
        ? { signerName: sig.signerName, signaturePngB64: sig.signaturePngB64, signedDate: sig.createdAt }
        : {}));
    } catch (e) { res.status(500).send(String(e)); }
  });

  router.post('/contract/sign', async (req, res) => {
    try {
      const studentId = req.session.studentId;
      if (!studentId) return res.status(401).json({ error: 'No student session' });
      const { mode, signerName, agreed, font, signatureSvg, signaturePngB64 } = req.body || {};
      if (!agreed) return res.status(400).json({ error: 'You must agree to the terms' });
      if (mode !== 'typed' && mode !== 'drawn') return res.status(400).json({ error: 'Invalid signature mode' });
      if (!signerName || typeof signerName !== 'string' || !signerName.trim()) return res.status(400).json({ error: 'Your name is required' });
      if (!signaturePngB64 || typeof signaturePngB64 !== 'string') return res.status(400).json({ error: 'A signature is required' });

      const sisUser = req.session.user
        ? await prisma.sisUser.findUnique({ where: { username: req.session.user }, select: { id: true, email: true } })
        : null;
      const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket.remoteAddress || null;
      const ua = req.headers['user-agent'] || null;

      const result = await signContract(prisma, {
        studentId,
        signedByUserId: sisUser?.id ?? null,
        mode,
        signerName: signerName.trim(),
        signerEmail: sisUser?.email ?? null,
        font: typeof font === 'string' ? font : null,
        signatureSvg: typeof signatureSvg === 'string' ? signatureSvg : null,
        signaturePngB64,
        ipAddress: ip,
        userAgent: typeof ua === 'string' ? ua : null,
      });
      res.json({ success: true, ...result });
    } catch (e: any) {
      console.error('[student/contract/sign]', e);
      res.status(500).json({ error: String(e?.message || e) });
    }
  });

  router.get('/me', async (req, res) => {
    try {
      const studentId = req.session.studentId;
      if (!studentId) return res.status(401).json({ error: 'No student session' });
      const [me, unreadMessages, gate, accomCount, groupBookings, lifePassCount, challengeCount, examState] = await Promise.all([
        scripts.me(studentId),
        msgs.unreadCount(studentId),
        prisma.student.findUnique({ where: { id: studentId }, select: { contractSignedAt: true, cardOnFile: true, email: true, birthday: true } }),
        prisma.bookingAccommodation.count({ where: { booking: { studentId }, active: true } }),
        prisma.booking.count({ where: { studentId, groupId: { not: null } } }),
        // LifePass enrolment — the reliable marker is the INSTALMENT payment schedule
        // (`payment_instalments`), which every LifePass booking carries. The course
        // NAME is unreliable (LifePass often outputs as "Academic Year"). Card-on-file
        // now applies to these too.
        prisma.booking.count({ where: { studentId, paymentInstalments: { some: {} } } }),
        // Challenge enrolment — any booking carrying the mirrored HubSpot Deal.challenge tag.
        prisma.booking.count({ where: { studentId, hubspotChallenge: { not: null } } }),
        // Exam-booking eligibility + dashboard reminder (null-safe — never breaks /me).
        exams.eligibility(studentId).catch(() => null),
      ]);
      // Only REAL student sessions are gated; staff previewing the portal never
      // see it, and the whole gate is inert until STUDENT_CONTRACT_GATE=on.
      const contractSigned = (process.env.STUDENT_CONTRACT_GATE !== 'on' || req.session?.userType !== 'student') ? true : !!gate?.contractSignedAt;
      // Card-on-file onboarding step — a REAL student who doesn't yet have a card
      // and is in a card-required cohort must complete the €1 CardOnFile checkout.
      // Cohort = an ACTIVE accommodation booking (breakage guarantee) OR a LifePass
      // OR a Challenge enrolment (Neil, 2026-08-31). Group + under-16 exemptions still apply.
      const isStudent = req.session?.userType === 'student';
      const cardOnFile = !!gate?.cardOnFile;
      // EXEMPT from the €1 card step (Neil 2026-08-21): students in a group (agency-
      // managed, often juniors — group WON/card flow is separate) and any student
      // UNDER 16 (a minor can't lodge a card). Age computed UTC-safe; unknown DOB is
      // treated as adult (individual bookers are adults; junior cohorts come via groups).
      const inGroup = groupBookings > 0;
      let age: number | null = null;
      if (gate?.birthday) {
        const dob = new Date(gate.birthday); const now = new Date();
        age = now.getUTCFullYear() - dob.getUTCFullYear();
        const m = now.getUTCMonth() - dob.getUTCMonth();
        if (m < 0 || (m === 0 && now.getUTCDate() < dob.getUTCDate())) age--;
      }
      const isUnder16 = age !== null && age < 16;
      const needsCardOnFile = isStudent && (accomCount > 0 || lifePassCount > 0 || challengeCount > 0) && !cardOnFile && !inGroup && !isUnder16;
      // Only real student sessions get the welcome video — suppress it for staff
      // previewing a portal, so a preview can't "use up" the student's one-shot.
      if ((me as any)?.student && !isStudent) (me as any).student.welcomeVideoSeenAt = 'preview';
      res.json({
        ...me, unreadMessages, contractSigned, contractSignedAt: gate?.contractSignedAt ?? null,
        exam: examState || null, examReminder: (examState as any)?.reminder || null,
        cardOnFile, needsCardOnFile,
        cardOnFileLink: needsCardOnFile ? (process.env.CARD_ON_FILE_LINK || 'https://payments-eu1.hubspot.com/payments/G72pxrd7YqZG?referrer=PAYMENT_LINK') : null,
        studentEmail: needsCardOnFile ? (gate?.email || null) : null,
      });
    } catch (e: any) { res.status(500).json({ error: String(e?.message || e) }); }
  });

  // Welcome video — stamp once the student has been shown it, so it never repeats.
  router.post('/welcome-video/seen', async (req, res) => {
    try {
      const studentId = req.session.studentId;
      if (!studentId) return res.status(401).json({ error: 'No student session' });
      // Never stamp from a staff preview session — only a real student's own view.
      if (req.session?.userType !== 'student') return res.json({ ok: true, skipped: 'preview' });
      await prisma.student.update({ where: { id: studentId }, data: { welcomeVideoSeenAt: new Date() } as any });
      res.json({ ok: true });
    } catch (e: any) { res.status(500).json({ error: String(e?.message || e) }); }
  });

  // Card-on-file poll — the onboarding €1 step calls this to know when to advance.
  // Reads SIS first; if still false, live-reads HubSpot (the workflow→SIS mirror
  // can lag the payment by a few seconds) and self-heals the SIS flag on success.
  router.get('/card-on-file/status', async (req, res) => {
    try {
      const studentId = req.session.studentId;
      if (!studentId) return res.status(401).json({ error: 'No student session' });
      const s = await prisma.student.findUnique({ where: { id: studentId }, select: { cardOnFile: true, hubspotContactId: true, email: true } });
      if (s?.cardOnFile) return res.json({ cardOnFile: true });
      const TOKEN = process.env.ACCESS_TOKEN;
      const hsAuth = { Authorization: `Bearer ${TOKEN}` };
      let yes = false;
      if (TOKEN) {
        // 1) Read by stored contact id.
        if (s?.hubspotContactId) {
          try {
            const r = await fetch(`https://api.hubapi.com/crm/v3/objects/contacts/${s.hubspotContactId}?properties=accommodation_card_guarantee`, { headers: hsAuth });
            if (r.ok) { const b: any = await r.json(); yes = (b?.properties?.accommodation_card_guarantee || '') === 'Yes'; }
          } catch { /* try email next */ }
        }
        // 2) Fallback: search by email — the payment associates by email, so this
        // catches a stale/missing contact id (the id lookup 404s).
        if (!yes && s?.email) {
          try {
            const r = await fetch('https://api.hubapi.com/crm/v3/objects/contacts/search', {
              method: 'POST', headers: { ...hsAuth, 'Content-Type': 'application/json' },
              body: JSON.stringify({ filterGroups: [{ filters: [{ propertyName: 'email', operator: 'EQ', value: s.email }] }], properties: ['accommodation_card_guarantee'], limit: 1 }),
            });
            if (r.ok) { const b: any = await r.json(); yes = (b?.results?.[0]?.properties?.accommodation_card_guarantee || '') === 'Yes'; }
          } catch { /* fall through to false */ }
        }
      }
      if (yes) {
        await prisma.student.update({ where: { id: studentId }, data: { cardOnFile: true, cardOnFileAt: new Date() } });
        return res.json({ cardOnFile: true });
      }
      res.json({ cardOnFile: false });
    } catch (e: any) { res.status(500).json({ error: String(e?.message || e) }); }
  });

  // ── Other bookings (Upcoming / History overlays) ──────
  // On-demand list of the student's bookings that are NOT the one in view.
  // ?exclude=<inViewBookingId> keeps the on-screen booking out of the lists.
  router.get('/bookings/list', async (req, res) => {
    try {
      const studentId = req.session.studentId;
      if (!studentId) return res.status(401).json({ error: 'No student session' });
      const exclude = req.query.exclude ? parseInt(String(req.query.exclude), 10) : undefined;
      res.json(await scripts.bookingsList(studentId, Number.isFinite(exclude as any) ? exclude : undefined));
    } catch (e: any) { res.status(500).json({ error: String(e?.message || e) }); }
  });

  // ── Placement-test gate for the Learning panel ──────
  // Returns { completed, testType, url }. When not completed, `url` is an
  // embeddable same-origin placement/delta test the app surfaces in-panel.
  router.get('/placement', async (req, res) => {
    try {
      const studentId = req.session.studentId;
      if (!studentId) return res.status(401).json({ error: 'No student session' });
      res.json(await tests.placementGateForStudent(studentId));
    } catch (e: any) { res.status(500).json({ error: String(e?.message || e) }); }
  });

  // ── Self-service booking ("+ Book") ──────
  // Creates a HubSpot continuation deal off the student's existing contact and
  // drops a staff "send quotation" task. Body = the booking-form payload
  // (courseType/courseSlot/courseWeeks/courseStart/accommType/extras/…).
  router.post('/book', async (req, res) => {
    try {
      const studentId = req.session.studentId;
      if (!studentId) return res.status(401).json({ error: 'No student session' });
      const result = await scripts.book(studentId, req.body || {});
      if (!result.success) return res.status(400).json(result);
      res.json(result);
    } catch (e: any) { res.status(500).json({ error: String(e?.message || e) }); }
  });

  // ── Self-service document upload (student → SIS + agency portal) ──────
  // The student uploads their own docs (passport, IRP, etc.) once; staff and
  // their agent both see it — no more emailing files around.
  router.post('/documents', stuDocUpload.array('files', 5), compressUploads(), async (req, res) => {
    try {
      const studentId = req.session.studentId;
      if (!studentId) return res.status(401).json({ error: 'No student session' });
      const files = (req.files as Express.Multer.File[]) || [];
      if (!files.length) return res.status(400).json({ error: 'No files' });
      const created = [];
      for (const f of files) {
        created.push(await prisma.studentDocument.create({
          data: {
            studentId, filename: f.filename, originalName: f.originalname,
            mimeType: f.mimetype, size: f.size, category: 'student-upload', uploadedBy: 'student',
          },
          select: { id: true, originalName: true, mimeType: true },
        }));
      }
      // Return the created docs so the app can auto-scan them for a passport.
      res.status(201).json({ success: true, count: created.length, documents: created });
    } catch (e: any) { res.status(400).json({ error: String(e?.message || e) }); }
  });

  router.get('/documents', async (req, res) => {
    try {
      const studentId = req.session.studentId;
      if (!studentId) return res.status(401).json({ error: 'No student session' });
      const docs = await prisma.studentDocument.findMany({
        where: { studentId },
        orderBy: { createdAt: 'desc' },
        select: { id: true, originalName: true, mimeType: true, category: true, createdAt: true, uploadedBy: true },
      });
      res.json({ documents: docs });
    } catch (e: any) { res.status(500).json({ error: String(e?.message || e) }); }
  });

  router.get('/documents/:docId/download', async (req, res) => {
    try {
      const studentId = req.session.studentId;
      if (!studentId) return res.status(401).json({ error: 'No student session' });
      const doc = await prisma.studentDocument.findUnique({ where: { id: parseInt(req.params.docId) } });
      if (!doc || doc.studentId !== studentId) return res.status(404).json({ error: 'Not found' });
      const filePath = path.join(stuDocDir, String(studentId), doc.filename);
      if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'File missing' });
      const inline = req.query.inline === '1' || req.query.inline === 'true';
      res.setHeader('Content-Disposition', `${inline ? 'inline' : 'attachment'}; filename="${doc.originalName}"`);
      res.setHeader('Content-Type', doc.mimeType);
      fs.createReadStream(filePath).pipe(res);
    } catch (e: any) { res.status(500).json({ error: String(e?.message || e) }); }
  });

  // Student may remove only their OWN uploads (never staff/issued docs).
  router.delete('/documents/:docId', async (req, res) => {
    try {
      const studentId = req.session.studentId;
      if (!studentId) return res.status(401).json({ error: 'No student session' });
      const doc = await prisma.studentDocument.findUnique({ where: { id: parseInt(req.params.docId) } });
      if (!doc || doc.studentId !== studentId || doc.category !== 'student-upload') return res.status(404).json({ error: 'Not found' });
      try { fs.unlinkSync(path.join(stuDocDir, String(studentId), doc.filename)); } catch { /* file already gone */ }
      await prisma.studentDocument.delete({ where: { id: doc.id } });
      res.json({ success: true });
    } catch (e: any) { res.status(500).json({ error: String(e?.message || e) }); }
  });

  // Preview image for the confirm dialog: images stream as-is; PDFs are
  // rasterised (page 1 → PNG) because the Android WebView can't render a PDF in
  // an <iframe>/<img>. Student-scoped (own docs only).
  router.get('/documents/:docId/preview', async (req, res) => {
    try {
      const studentId = req.session.studentId;
      if (!studentId) return res.status(401).end();
      const doc = await prisma.studentDocument.findUnique({ where: { id: parseInt(req.params.docId) } });
      if (!doc || doc.studentId !== studentId) return res.status(404).end();
      const filePath = path.join(stuDocDir, String(studentId), doc.filename);
      if (!fs.existsSync(filePath)) return res.status(404).end();
      const mt = doc.mimeType || '';
      if (mt.startsWith('image/')) {
        res.setHeader('Content-Type', mt);
        return fs.createReadStream(filePath).pipe(res);
      }
      if (mt.includes('pdf')) {
        const out = path.join(os.tmpdir(), `ppprev-${Date.now()}-${studentId}`);
        try {
          await execFileP('pdftoppm', ['-png', '-f', '1', '-l', '1', '-r', '150', '-singlefile', filePath, out]);
          const png = out + '.png';
          res.setHeader('Content-Type', 'image/png');
          const stream = fs.createReadStream(png);
          stream.pipe(res);
          stream.on('close', () => { fs.promises.unlink(png).catch(() => {}); });
          return;
        } catch { return res.status(415).end(); }
      }
      res.status(415).end();
    } catch { res.status(500).end(); }
  });

  // AI-read one of the student's own uploaded docs as a passport → suggested
  // fields for the student to confirm. Same engine/contract as the staff +
  // partner readers; never writes. Student-scoped (own docs only).
  router.post('/documents/:docId/read-passport', async (req, res) => {
    try {
      const studentId = req.session.studentId;
      if (!studentId) return res.status(401).json({ success: false, error: 'No student session' });
      const doc = await prisma.studentDocument.findUnique({ where: { id: parseInt(req.params.docId) } });
      if (!doc || doc.studentId !== studentId) return res.status(404).json({ success: false, error: 'Not found' });
      const filePath = path.join(stuDocDir, String(studentId), doc.filename);
      if (!fs.existsSync(filePath)) return res.status(404).json({ success: false, error: 'File missing' });
      const pp = await parsePassport(filePath, doc.mimeType);
      const birthdaySet = await fillBirthdayIfEmpty(prisma, studentId, pp.extracted);
      res.json({ success: true, supported: pp.supported, extracted: pp.extracted, parseError: pp.error || null, birthdaySet });
    } catch (e: any) { res.status(500).json({ success: false, error: String(e?.message || e) }); }
  });

  // Save the student's own passport fields (after they confirm the AI read).
  // Only sets fields that are non-empty — a blank never wipes existing data.
  router.post('/passport', async (req, res) => {
    try {
      const studentId = req.session.studentId;
      if (!studentId) return res.status(401).json({ error: 'No student session' });
      const { passportNumber, passportValidFrom, passportValidUntil } = req.body || {};
      const toDate = (s: any) => (s && typeof s === 'string') ? new Date(s + 'T00:00:00Z') : null;
      const data: any = {};
      if (typeof passportNumber === 'string' && passportNumber.trim()) data.passportNumber = passportNumber.trim();
      if (passportValidFrom) data.passportValidFrom = toDate(passportValidFrom);
      if (passportValidUntil) data.passportValidUntil = toDate(passportValidUntil);
      if (Object.keys(data).length) await prisma.student.update({ where: { id: studentId }, data });
      res.json({ success: true });
      // Passport just arrived via the student app → close the LoA loop: if a
      // fully-paid AY booking was waiting only on the passport, issue it now.
      // Fire-and-forget; non-fatal.
      if (data.passportNumber) {
        const { documentScripts } = await import('../scripts/documents');
        documentScripts(prisma).issueLoaForStudentIfReady(studentId, 'auto-loa-passport-app')
          .catch((e: any) => console.warn('[LOA passport-trigger] app student', studentId, e?.message || e));
      }
    } catch (e: any) { res.status(500).json({ error: String(e?.message || e) }); }
  });

  // ── Self-service address edit (student → own native + Irish address) ──────
  // Lets the student keep their own address current so address-bearing documents
  // (Confirmation with Address) can be self-issued without emailing the office.
  // Whitelisted fields only; scoped to the session's own student. Mirrors /passport.
  router.post('/address', async (req, res) => {
    try {
      const studentId = req.session.studentId;
      if (!studentId) return res.status(401).json({ error: 'No student session' });
      const ALLOWED = [
        'address', 'addressAddon', 'zip', 'city', 'state', 'countryIso',
        'irishAddress', 'irishAddressAddon', 'irishZip', 'irishCity', 'irishState', 'irishCountryIso',
      ];
      const body = req.body || {};
      const data: any = {};
      for (const k of ALLOWED) {
        if (k in body) {
          const v = body[k];
          data[k] = (typeof v === 'string' && v.trim()) ? v.trim() : null;
        }
      }
      if (Object.keys(data).length) await prisma.student.update({ where: { id: studentId }, data });
      res.json({ success: true });
    } catch (e: any) { res.status(500).json({ error: String(e?.message || e) }); }
  });

  // ── Self-service document generation (student → own whitelisted docs) ──────
  // Students self-issue a FIXED set of their OWN documents instead of emailing the
  // office. Hard whitelist by slug — LoA is deliberately excluded (stays office-
  // issued; assertLoaPaymentGate blocks it regardless of caller). The with-address
  // confirmation is gated on the Irish address being filled. Reuses the exact admin
  // generate→issue pipeline, scoped to the session's own studentId.
  const SELF_SERVE_DOC_SLUGS = new Set([
    'Attendance-Current', 'Attendance-Final', 'Student-Letter',
    'Holiday-Letter', 'Confirm-General', 'Confirm-ISD',
  ]);
  router.post('/documents/issue', async (req, res) => {
    try {
      const studentId = req.session.studentId;
      if (!studentId) return res.status(401).json({ error: 'No student session' });
      const slug = String(req.body?.slug || '');
      if (!SELF_SERVE_DOC_SLUGS.has(slug)) return res.status(400).json({ error: 'This document is not available to self-issue' });
      const template = await prisma.documentTemplate.findFirst({ where: { slug, active: true }, select: { id: true } });
      if (!template) return res.status(404).json({ error: 'Template not found' });
      // Address gate: the with-address confirmation needs an Irish address on file.
      if (slug === 'Confirm-ISD') {
        const s = await prisma.student.findUnique({ where: { id: studentId }, select: { irishAddress: true } });
        if (!s?.irishAddress || !String(s.irishAddress).trim()) return res.status(400).json({ error: 'irish_address_required' });
      }
      // Course-end gate: the FINAL attendance letter is an end-of-course document —
      // it must only surface AFTER the student's last day of class. "Last day" =
      // the latest end date across all their non-cancelled real-category courses
      // (same aggregate the Final doc prints), so multi-/split-booking students are
      // gated on their true final day. Future last day → block with friendly copy.
      if (slug === 'Attendance-Final') {
        const REAL_COURSE_CATS = new Set(['MORNING', 'MORNING_PLUS', 'AFTERNOON', 'AFTERNOON_PLUS', 'INTENSIVE', 'PRIVATE']);
        const bks = await prisma.booking.findMany({
          where: { studentId },
          select: { status: true, courses: { select: { category: true, endDate: true } } },
        });
        let lastDay: Date | null = null;
        for (const b of bks) {
          // Skip only explicitly cancelled bookings — a null status is a live
          // booking here, and `NOT status='CANCELLED'` in SQL would wrongly drop nulls.
          if (String(b.status) === 'CANCELLED') continue;
          for (const c of b.courses) {
            if (!REAL_COURSE_CATS.has(String(c.category)) || !c.endDate) continue;
            const d = new Date(c.endDate);
            if (!lastDay || d > lastDay) lastDay = d;
          }
        }
        if (!lastDay) return res.status(400).json({ error: 'Your course dates aren’t set yet — please message the office.' });
        const cutoff = new Date(lastDay); cutoff.setHours(23, 59, 59, 999);
        if (Date.now() <= cutoff.getTime()) {
          return res.status(400).json({ error: 'Your Final Attendance letter will be available after your last day of class.' });
        }
      }
      // Single-instance guard: a student holds at most ONE issued copy of each
      // self-serve document. A repeat request must explicitly overwrite (the app
      // confirms "Doc already exists. Update with new version?"); without the flag
      // we refuse with `exists` so we never silently stack duplicates.
      const overwrite = req.body?.overwrite === true || String(req.body?.overwrite) === 'true';
      const existingIssued = await prisma.documentRecord.findMany({
        where: { studentId, templateId: template.id, status: 'ISSUED' },
        orderBy: { versionNo: 'desc' },
        select: { id: true, versionNo: true },
      });
      if (existingIssued.length && !overwrite) return res.status(409).json({ error: 'exists' });
      // Issue against the student's in-view booking (the one the app shows) so the
      // course dates and the LoA-style payment gate (the confirmations are flagged
      // requiresFullPayment) evaluate correctly instead of erroring on a null booking.
      // Multi-booking students always default to the current/latest booking — there
      // is no picker; previous-booking docs go through the office.
      const meData: any = await scripts.me(studentId);
      const bookingId = meData?.booking?.id ?? null;
      try {
        const draft = await docs.generateDraft(template.id, studentId, bookingId, 'student');
        const issued = await docs.issueDocument(draft.record.id, 'Student (self-service)', 'student');
        // Overwrite → supersede the prior issued copies and carry the version chain
        // forward, so the old versions drop out of the student's list (status filter
        // is ISSUED) but stay on record for audit. Done only after the new copy
        // issues cleanly, so a failed regenerate never destroys the existing one.
        if (existingIssued.length) {
          const prev = existingIssued[0];
          await prisma.documentRecord.updateMany({ where: { id: { in: existingIssued.map(e => e.id) } }, data: { status: 'SUPERSEDED' } });
          await prisma.documentRecord.update({ where: { id: issued.id }, data: { versionNo: prev.versionNo + 1, supersedesId: prev.id } });
        }
        res.json({ success: true, documentId: issued.id });
      } catch (gen: any) {
        // Payment/visa gate (confirmations only) → student-friendly guidance.
        const msg = String(gen?.message || gen);
        if (/visa/i.test(msg)) return res.status(400).json({ error: 'This letter is available after your visa decision — message the office if it’s urgent.' });
        if (/escrow|balance|not linked|paid|payment|full/i.test(msg)) return res.status(400).json({ error: 'This letter is available once your fees are paid in full — message the office if it’s urgent.' });
        throw gen;
      }
    } catch (e: any) { res.status(400).json({ error: String(e?.message || e) }); }
  });

  // ── "Message us" support email (student → success@) ──────
  router.post('/support', async (req, res) => {
    try {
      const studentId = req.session.studentId;
      if (!studentId) return res.status(401).json({ error: 'No student session' });
      const result = await scripts.support(studentId, req.body || {});
      if (!result.success) return res.status(400).json(result);
      // Acknowledge in the student's in-app inbox (reuses the existing channel).
      try {
        await msgs.postToApp({
          studentId,
          subject: 'We’ve got your message',
          bodyHtml: `<p>Thanks${result.studentFirst ? ', ' + result.studentFirst : ''} — your message reached our team. We’ll be in touch by email shortly.</p>`,
          sentBy: 'ULearn',
          emailLogId: result.emailLogId ?? null,
        });
      } catch { /* ack is a nicety — never fail the send on it */ }
      res.json({ success: true });
    } catch (e: any) { res.status(500).json({ error: String(e?.message || e) }); }
  });

  // ── In-app messages (inbox + bell badge) ──────
  // The student-facing side of the comms "Student app" channel. List drives
  // the drawer; readAt clears the bell badge.
  router.get('/messages', async (req, res) => {
    try {
      const studentId = req.session.studentId;
      if (!studentId) return res.status(401).json({ error: 'No student session' });
      const [items, unread] = await Promise.all([
        msgs.listForStudent(studentId),
        msgs.unreadCount(studentId),
      ]);
      res.json({ items, unread });
    } catch (e: any) { res.status(500).json({ error: String(e?.message || e) }); }
  });

  router.post('/messages/:id/read', async (req, res) => {
    try {
      const studentId = req.session.studentId;
      if (!studentId) return res.status(401).json({ error: 'No student session' });
      const id = parseInt(req.params.id, 10);
      if (!Number.isFinite(id)) return res.status(400).json({ error: 'bad id' });
      await msgs.markRead(studentId, id);
      res.json({ ok: true, unread: await msgs.unreadCount(studentId) });
    } catch (e: any) { res.status(500).json({ error: String(e?.message || e) }); }
  });

  router.post('/messages/read-all', async (req, res) => {
    try {
      const studentId = req.session.studentId;
      if (!studentId) return res.status(401).json({ error: 'No student session' });
      const count = await msgs.markAllRead(studentId);
      res.json({ ok: true, marked: count, unread: 0 });
    } catch (e: any) { res.status(500).json({ error: String(e?.message || e) }); }
  });

  // Flight details — student-side read + write.
  //
  // The admin records arrival flight separately from the student's
  // transport bookings, but students need a way to provide it themselves
  // (they often book the transfer before they know their flight). This
  // endpoint returns their current data + a `nudges` payload computed
  // from upcoming AIRPORT_PICKUP/DROPOFF extras: if a transfer exists
  // without matching flight data, the UI nudges them to fill it in.
  router.get('/flights', async (req, res) => {
    try {
      const studentId = req.session.studentId;
      if (!studentId) return res.status(401).json({ error: 'No student session' });

      const [student, transfers] = await Promise.all([
        prisma.student.findUnique({
          where: { id: studentId },
          select: {
            flightNumber: true, flightDate: true, flightTime: true,
            outboundFlightNumber: true, outboundFlightDate: true, outboundFlightTime: true,
          },
        }),
        prisma.bookingExtra.findMany({
          where: {
            active: true,
            extraType: { in: ['AIRPORT_PICKUP', 'AIRPORT_DROPOFF'] },
            booking: { studentId },
            scheduledAt: { gte: new Date() },
          },
          select: { id: true, extraType: true, scheduledAt: true },
          orderBy: { scheduledAt: 'asc' },
        }),
      ]);
      if (!student) return res.status(404).json({ error: 'Student not found' });

      const now = new Date();
      const daysUntil = (d: Date | null) => d
        ? Math.ceil((new Date(d).getTime() - now.getTime()) / 86400000)
        : null;
      const urgency = (days: number | null): 'soon' | 'warning' | 'urgent' | 'critical' => {
        if (days == null) return 'soon';
        if (days <= 3)  return 'critical';
        if (days <= 7)  return 'urgent';
        if (days <= 14) return 'warning';
        return 'soon';
      };

      // Compute nudges — for each upcoming transfer, check whether the
      // matching flight side (inbound for pickup, outbound for dropoff)
      // has data. If not, emit a nudge with severity tied to how close
      // the transfer date is.
      const nudges: any[] = [];
      const earliestPickup = transfers.find(t => t.extraType === 'AIRPORT_PICKUP');
      if (earliestPickup && !student.flightNumber) {
        const days = daysUntil(earliestPickup.scheduledAt);
        nudges.push({
          side: 'inbound',
          severity: urgency(days),
          daysUntil: days,
          transferAt: earliestPickup.scheduledAt,
          message: 'You\'ve booked an airport pickup but we don\'t have your inbound flight yet.',
        });
      }
      const earliestDropoff = transfers.find(t => t.extraType === 'AIRPORT_DROPOFF');
      if (earliestDropoff && !student.outboundFlightNumber) {
        const days = daysUntil(earliestDropoff.scheduledAt);
        nudges.push({
          side: 'outbound',
          severity: urgency(days),
          daysUntil: days,
          transferAt: earliestDropoff.scheduledAt,
          message: 'You\'ve booked an airport dropoff but we don\'t have your outbound flight yet.',
        });
      }

      res.json({ flights: student, nudges });
    } catch (e: any) { res.status(500).json({ error: String(e?.message || e) }); }
  });

  router.patch('/flights', async (req, res) => {
    try {
      const studentId = req.session.studentId;
      if (!studentId) return res.status(401).json({ error: 'No student session' });
      // Allow-list — students can only update flight fields, not arbitrary columns.
      const ALLOWED = ['flightNumber', 'flightDate', 'flightTime', 'outboundFlightNumber', 'outboundFlightDate', 'outboundFlightTime'];
      const data: any = {};
      for (const k of ALLOWED) {
        if (k in req.body) {
          const v = req.body[k];
          if (k === 'flightDate' || k === 'outboundFlightDate') {
            data[k] = v ? new Date(v) : null;
          } else {
            data[k] = v || null;
          }
        }
      }
      const updated = await prisma.student.update({
        where: { id: studentId },
        data,
        select: {
          flightNumber: true, flightDate: true, flightTime: true,
          outboundFlightNumber: true, outboundFlightDate: true, outboundFlightTime: true,
        },
      });
      // Auto-seed any airport-transfer arrival that has no datetime yet from the
      // flight just saved (fill-only-if-empty — never clobbers a manual arrival).
      const seeded = await syncArrivalFromFlight(prisma, studentId);
      if (seeded.length) console.log(`[transport-sync] student ${studentId}: seeded scheduledAt on ${seeded.length} extra(s)`);
      res.json({ success: true, flights: updated });
    } catch (e: any) { res.status(500).json({ error: String(e?.message || e) }); }
  });

  // Transport — surfaces this student's own upcoming airport pickups/dropoffs
  // for the Transport card on the Profile tab. Returns active, future
  // BookingExtras with type AIRPORT_PICKUP / AIRPORT_DROPOFF across all
  // their bookings.
  router.get('/transport', async (req, res) => {
    try {
      const studentId = req.session.studentId;
      if (!studentId) return res.status(401).json({ error: 'No student session' });
      const rows = await prisma.bookingExtra.findMany({
        where: {
          active: true,
          extraType: { in: ['AIRPORT_PICKUP', 'AIRPORT_DROPOFF'] },
          scheduledAt: { gte: new Date() },
          booking: { studentId },
        },
        orderBy: { scheduledAt: 'asc' },
        select: {
          id: true, extraType: true, scheduledAt: true, details: true,
          lynkDetails: true, emailSentAt: true, publishedAt: true,
        },
      });
      res.json({
        items: rows.map(r => ({
          id: r.id,
          kind: r.extraType,
          scheduledAt: r.scheduledAt,
          details: r.details,
          // Status state-machine:
          //   no lynkDetails           → 'requested'  (admin hasn't booked taxi yet)
          //   lynkDetails, no publish  → 'booked'     (taxi booked, admin hasn't pushed to app)
          //   publishedAt set          → 'confirmed'  (admin pressed Send → app shows ✓)
          status: r.publishedAt ? 'confirmed' : r.lynkDetails ? 'booked' : 'requested',
        })),
      });
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

  // Student holiday requests — the list, and a self-service create (writes the
  // BookingHoliday directly + notifies success@; staff veto in SIS).
  router.get('/holidays', async (req, res) => {
    try {
      const studentId = req.session.studentId;
      if (!studentId) return res.status(401).json({ error: 'No student session' });
      res.json(await scripts.holidaysList(studentId));
    } catch (e: any) { res.status(500).json({ error: String(e?.message || e) }); }
  });

  router.post('/holiday-request', async (req, res) => {
    try {
      const studentId = req.session.studentId;
      if (!studentId) return res.status(401).json({ error: 'No student session' });
      const out = await scripts.requestHoliday(studentId, req.body || {});
      if (!out.success) return res.status(400).json({ error: out.error });
      res.json(out);
    } catch (e: any) { res.status(400).json({ error: String(e?.message || e) }); }
  });

  router.delete('/holidays/:id', async (req, res) => {
    try {
      const studentId = req.session.studentId;
      if (!studentId) return res.status(401).json({ error: 'No student session' });
      const out = await scripts.cancelHoliday(studentId, req.params.id);
      if (!out.success) return res.status(400).json({ error: out.error });
      res.json(out);
    } catch (e: any) { res.status(400).json({ error: String(e?.message || e) }); }
  });

  // ── Exam booking (self-service) ──────────────────────────────────────────────
  // Eligible exams + ranked suitable sittings for the picker.
  router.get('/exam/options', async (req, res) => {
    try {
      const studentId = req.session.studentId;
      if (!studentId) return res.status(401).json({ error: 'No student session' });
      res.json(await exams.options(studentId));
    } catch (e: any) { res.status(500).json({ error: String(e?.message || e) }); }
  });
  // Confirm a sitting → create the request + email CES (student CC'd).
  router.post('/exam/request', async (req, res) => {
    try {
      const studentId = req.session.studentId;
      if (!studentId) return res.status(401).json({ error: 'No student session' });
      const out = await exams.createExamRequest(studentId, req.body || {});
      if (!out.success) return res.status(400).json({ error: out.error });
      res.json(out);
    } catch (e: any) { res.status(400).json({ error: String(e?.message || e) }); }
  });
  // Below-B1 / no suitable date → raise a Success Desk assistance case.
  router.post('/exam/assistance', async (req, res) => {
    try {
      const studentId = req.session.studentId;
      if (!studentId) return res.status(401).json({ error: 'No student session' });
      const out = await exams.requestAssistance(studentId, (req.body || {}).note);
      if (!out.success) return res.status(400).json({ error: out.error });
      res.json(out);
    } catch (e: any) { res.status(400).json({ error: String(e?.message || e) }); }
  });
  // Cancel the student's own pending/requested exam booking.
  router.delete('/exam/:id', async (req, res) => {
    try {
      const studentId = req.session.studentId;
      if (!studentId) return res.status(401).json({ error: 'No student session' });
      const out = await exams.cancelOwn(studentId, Number(req.params.id));
      if (!out.success) return res.status(400).json({ error: out.error });
      res.json(out);
    } catch (e: any) { res.status(400).json({ error: String(e?.message || e) }); }
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

  // KickStart prize: upload the day-14 screenshot for a Progress Post, store it,
  // then AI-read the engagement counts and return them for the student to
  // confirm (NOT saved yet — confirmation comes via POST /content/:id/metrics).
  const uploadShot = (req: any, res: any, next: any) => {
    shotUpload.single('file')(req, res, (err: any) => {
      if (err) return res.status(400).json({ error: String(err.message || err) });
      next();
    });
  };
  router.post('/content/:id/screenshot', uploadShot, compressUploads(), async (req, res) => {
    try {
      const studentId = req.session.studentId;
      if (!studentId) return res.status(401).json({ error: 'No student session' });
      if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
      const contentId = parseInt(req.params.id, 10);
      const relPath = path.join('challenge-screenshots', req.file.filename);
      // Derive the platform from the linked URL — deterministic, beats the model
      // guessing heart-vs-thumbs-up (FB has no repost; IG does).
      const row: any = await prisma.studentChallengeContent.findUnique({ where: { id: contentId }, select: { url: true } });
      const u = String(row?.url || '').toLowerCase();
      const platform = /facebook\.com|fb\.watch|\bfb\.me/.test(u) ? 'facebook' : /instagram\.com|instagr\.am/.test(u) ? 'instagram' : null;
      const { parsePostMetrics } = await import('../scripts/screenshot-metrics-parser');
      const read = await parsePostMetrics(req.file.path, req.file.mimetype, { platform });
      // Store the screenshot + the AI-read date → sets leaderboard eligibility.
      const saved = await scripts.attachContentScreenshot(studentId, contentId, relPath, read.extracted?.date || null);
      res.json({ ok: true, extracted: read.extracted, readError: read.error || null, eligible: saved.eligible, shotDate: saved.shotDate });
    } catch (e: any) { res.status(400).json({ error: String(e?.message || e) }); }
  });

  router.get('/challenge-leaderboard', async (req, res) => {
    try {
      const studentId = req.session.studentId;
      if (!studentId) return res.status(401).json({ error: 'No student session' });
      res.json(await scripts.challengeLeaderboard(studentId));
    } catch (e: any) { res.status(500).json({ error: String(e?.message || e) }); }
  });

  router.post('/content/:id/metrics', async (req, res) => {
    try {
      const studentId = req.session.studentId;
      if (!studentId) return res.status(401).json({ error: 'No student session' });
      const contentId = parseInt(req.params.id, 10);
      const b = req.body || {};
      res.json(await scripts.saveContentMetrics(studentId, contentId, {
        views: b.views, likes: b.likes, comments: b.comments,
        reposts: b.reposts, shares: b.shares, saves: b.saves,
      }));
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
      // App-hidden activities are suppressed from the student month browse too
      // (same flag as the main feed). The shared listForMonth helper also feeds
      // the public website, so we filter HERE rather than in the helper.
      const visible = (data.items || []).filter((a: any) => a.appVisible !== false);
      // Annotate items with this student's RSVP state so the cell can render
      // the "going" pip without a second round-trip per chip.
      const myRsvps: any[] = await prisma.activityAttendee.findMany({
        where: { studentId, activityId: { in: visible.map((a: any) => a.id) } },
        select: { activityId: true, attended: true },
      });
      const rsvpMap = new Map(myRsvps.map(r => [r.activityId, r]));
      const items = visible.map((a: any) => ({
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

  // ── Accommodation feedback (two prompts per stay) ────────────
  // Each stay surfaces up to two rating prompts:
  //   • first_week — the first Thursday on or after check-in. Students
  //     typically arrive on the weekend, so this lands ~4-5 days in: late
  //     enough to form an opinion, early enough to flag a placement issue
  //     while there's still time to move them.
  //   • final     — the day after departure. Wrap-up rating once the stay
  //     is done; captures the whole-experience view (incl. checkout).
  // Each prompt is resolved by either a rating or a dismissal; the key is
  // (student, stay, kind) so short stays where both anchor dates land in
  // the same Monday-of-week still produce both prompts independently.
  router.get('/accomm-feedback/eligible', async (req, res) => {
    try {
      const studentId = req.session.studentId;
      if (!studentId) return res.status(401).json({ error: 'No student session' });
      const DEMO = studentId === 97; // DEMO-97: force-surface BOTH accommodation reviews for the explainer-video demo — remove after

      const stays: any[] = await prisma.$queryRawUnsafe(
        `SELECT ba.id AS booking_accommodation_id,
                ba.accommodation_type, ba.room_type, ba.board,
                to_char(ba.start_date, 'YYYY-MM-DD') AS start_date,
                to_char(ba.end_date,   'YYYY-MM-DD') AS end_date,
                ap.name AS provider_name
           FROM booking_accommodations ba
           JOIN bookings b ON b.id = ba.booking_id
           LEFT JOIN accommodation_beds bed ON bed.id = ba.bed_id
           LEFT JOIN accommodation_rooms ar ON ar.id = bed.room_id
           LEFT JOIN accommodation_properties prop ON prop.id = ar.property_id
           LEFT JOIN accommodation_providers ap ON ap.id = prop.provider_id
          WHERE b.student_id = $1 AND ba.active = true
          ORDER BY ba.start_date DESC`,
        studentId,
      );

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const mondayOf = (d: Date) => {
        const m = new Date(d);
        m.setDate(d.getDate() - ((d.getDay() + 6) % 7));
        return m;
      };

      const slots: { stay: any; kind: 'first_week' | 'final'; promptDate: Date; weekStart: string }[] = [];
      for (const s of stays) {
        const start = new Date(s.start_date + 'T00:00:00');
        const end   = new Date(s.end_date   + 'T00:00:00');

        // first_week — first Thursday on or after check-in
        const daysToThu = (4 - start.getDay() + 7) % 7;
        const firstWeek = new Date(start); firstWeek.setDate(start.getDate() + daysToThu);
        if (DEMO || (firstWeek <= end && today >= firstWeek)) {
          slots.push({
            stay: s, kind: 'first_week', promptDate: firstWeek,
            weekStart: mondayOf(firstWeek).toISOString().slice(0, 10),
          });
        }

        // final — day after departure
        const finalDate = new Date(end); finalDate.setDate(end.getDate() + 1);
        if (DEMO || today >= finalDate) {
          slots.push({
            stay: s, kind: 'final', promptDate: finalDate,
            weekStart: mondayOf(finalDate).toISOString().slice(0, 10),
          });
        }
      }

      const existing = slots.length === 0 ? [] : await prisma.accommodationFeedback.findMany({
        where: {
          studentId,
          bookingAccommodationId: { in: slots.map(s => s.stay.booking_accommodation_id) },
        },
      });
      const existingMap = new Map(existing.map(f => [`${f.bookingAccommodationId}|${f.kind}`, f]));

      const items = slots.map(sl => {
        const f = existingMap.get(`${sl.stay.booking_accommodation_id}|${sl.kind}`);
        return {
          booking_accommodation_id: sl.stay.booking_accommodation_id,
          kind: sl.kind,
          week_start: sl.weekStart,
          provider_name: sl.stay.provider_name || null,
          accommodation_type: sl.stay.accommodation_type || null,
          room_type: sl.stay.room_type || null,
          feedback_id: f?.id || null,
          stars: f?.stars ?? null,
          comment: f?.comment || null,
          status: f?.status || null,
          dismissed_at: f?.dismissedAt || null,
        };
      }).filter(it => DEMO || !(it.dismissed_at && it.stars == null));

      res.json({ eligible: items });
    } catch (e: any) { res.status(500).json({ error: String(e?.message || e) }); }
  });

  router.post('/accomm-feedback/dismiss', async (req, res) => {
    try {
      const studentId = req.session.studentId;
      if (!studentId) return res.status(401).json({ error: 'No student session' });

      const bookingAccommodationId = parseInt(String(req.body?.booking_accommodation_id), 10);
      const kind = String(req.body?.kind || '');
      const weekStartRaw = String(req.body?.week_start || '');
      if (!Number.isFinite(bookingAccommodationId)) return res.status(400).json({ error: 'bad booking_accommodation_id' });
      if (kind !== 'first_week' && kind !== 'final') return res.status(400).json({ error: 'bad kind' });
      if (!/^\d{4}-\d{2}-\d{2}$/.test(weekStartRaw))  return res.status(400).json({ error: 'week_start must be YYYY-MM-DD' });

      const ba: any = await prisma.bookingAccommodation.findUnique({
        where: { id: bookingAccommodationId },
        select: { booking: { select: { studentId: true } } },
      });
      if (!ba || ba.booking.studentId !== studentId) return res.status(404).json({ error: 'stay not found' });

      const weekStart = new Date(weekStartRaw + 'T00:00:00');
      const upserted = await prisma.accommodationFeedback.upsert({
        where: { studentId_bookingAccommodationId_kind: { studentId, bookingAccommodationId, kind } },
        update: { dismissedAt: new Date() },
        create: { studentId, bookingAccommodationId, kind, weekStart, dismissedAt: new Date() },
      });
      res.json({ feedback: upserted });
    } catch (e: any) { res.status(400).json({ error: String(e?.message || e) }); }
  });

  router.post('/accomm-feedback', async (req, res) => {
    try {
      const studentId = req.session.studentId;
      if (!studentId) return res.status(401).json({ error: 'No student session' });

      const bookingAccommodationId = parseInt(String(req.body?.booking_accommodation_id), 10);
      const kind = String(req.body?.kind || '');
      const weekStartRaw = String(req.body?.week_start || '');
      const stars = parseInt(String(req.body?.stars), 10);
      const rawComment = (req.body?.comment ?? '').toString().trim();
      const comment = rawComment.length > 0 ? rawComment.slice(0, 2000) : null;

      if (!Number.isFinite(bookingAccommodationId)) return res.status(400).json({ error: 'bad booking_accommodation_id' });
      if (kind !== 'first_week' && kind !== 'final') return res.status(400).json({ error: 'bad kind' });
      if (!/^\d{4}-\d{2}-\d{2}$/.test(weekStartRaw))  return res.status(400).json({ error: 'week_start must be YYYY-MM-DD' });
      if (!Number.isFinite(stars) || stars < 1 || stars > 10) return res.status(400).json({ error: 'stars must be 1..10' });

      // Authorize: stay belongs to this student. For 'first_week' the
      // weekStart must sit inside the stay window; for 'final' it'll be the
      // week-of-(endDate+1) so it can legitimately fall just after endDate.
      const ba: any = await prisma.bookingAccommodation.findUnique({
        where: { id: bookingAccommodationId },
        select: { startDate: true, endDate: true, booking: { select: { studentId: true } } },
      });
      if (!ba || ba.booking.studentId !== studentId) return res.status(404).json({ error: 'stay not found' });
      const weekStart = new Date(weekStartRaw + 'T00:00:00');
      if (kind === 'first_week') {
        if (weekStart < ba.startDate || weekStart > ba.endDate) {
          return res.status(403).json({ error: 'week_start is outside this stay' });
        }
      }

      const upserted = await prisma.accommodationFeedback.upsert({
        where: { studentId_bookingAccommodationId_kind: { studentId, bookingAccommodationId, kind } },
        update: { stars, comment },
        create: { studentId, bookingAccommodationId, kind, weekStart, stars, comment },
      });
      res.status(201).json({ feedback: upserted });
    } catch (e: any) { res.status(400).json({ error: String(e?.message || e) }); }
  });

  // ── Social activity feedback (per-activity rating) ─────────────
  // ── Course feedback (end-of-course questionnaire) ──────────────────
  // The third feedback stream, and the last core service to get one:
  // accommodation and social already had a surface, Course had none. The
  // legacy path emailed students "click here to leave your feedback" pointing
  // at the app root with nothing to fill in (65 sends, zero captured).
  //
  // Eligible from the FINAL WEEK onward (course ends within 7 days) and for 90
  // days after — the same window the final-week email fires in. Dismissed and
  // not-yet-submitted rows drop out so the student isn't pestered; submitted
  // rows stay so they can amend, mirroring the social-feedback contract.
  router.get('/course-feedback/eligible', async (req, res) => {
    try {
      const studentId = req.session.studentId;
      if (!studentId) return res.status(401).json({ error: 'No student session' });
      const rows: any[] = await prisma.$queryRawUnsafe(
        `SELECT b.id AS booking_id,
                to_char(MAX(c.end_date), 'YYYY-MM-DD') AS course_end,
                MIN(c.name) AS course_name,
                f.id AS feedback_id, f.submitted_at, f.dismissed_at,
                f.teacher, f.lessons, f.materials, f.homework,
                f.location, f.classrooms, f.technology, f.toilets, f.rec_room,
                f.success_team, f.overall, f.comment
           FROM bookings b
           JOIN booking_courses c ON c.booking_id = b.id
           LEFT JOIN course_feedback f
             ON f.student_id = $1 AND f.booking_id = b.id
          WHERE b.student_id = $1
            AND b.status <> 'CANCELLED'
            -- DEMO-97: bypass the dismiss filter + final-week window for the explainer-video demo student — remove after
            AND ($1 = 97 OR NOT (f.dismissed_at IS NOT NULL AND f.submitted_at IS NULL))
          GROUP BY b.id, f.id
         HAVING MAX(c.end_date) IS NOT NULL
            AND ($1 = 97 OR (MAX(c.end_date) <= CURRENT_DATE + INTERVAL '7 days'
                             AND MAX(c.end_date) >= CURRENT_DATE - INTERVAL '90 days'))
          ORDER BY MAX(c.end_date) DESC`,
        studentId,
      );
      res.json({ eligible: rows });
    } catch (e: any) { res.status(500).json({ error: String(e?.message || e) }); }
  });

  router.post('/course-feedback/dismiss', async (req, res) => {
    try {
      const studentId = req.session.studentId;
      if (!studentId) return res.status(401).json({ error: 'No student session' });
      const bookingId = parseInt(String(req.body?.booking_id), 10);
      if (!Number.isFinite(bookingId)) return res.status(400).json({ error: 'bad booking_id' });
      const owned = await prisma.booking.findFirst({ where: { id: bookingId, studentId }, select: { id: true } });
      if (!owned) return res.status(403).json({ error: 'not your booking' });
      const row = await prisma.courseFeedback.upsert({
        where: { studentId_bookingId: { studentId, bookingId } },
        update: { dismissedAt: new Date() },
        create: { studentId, bookingId, dismissedAt: new Date() },
      });
      res.json({ feedback: row });
    } catch (e: any) { res.status(400).json({ error: String(e?.message || e) }); }
  });

  router.post('/course-feedback', async (req, res) => {
    try {
      const studentId = req.session.studentId;
      if (!studentId) return res.status(401).json({ error: 'No student session' });
      const bookingId = parseInt(String(req.body?.booking_id), 10);
      if (!Number.isFinite(bookingId)) return res.status(400).json({ error: 'bad booking_id' });
      const owned = await prisma.booking.findFirst({ where: { id: bookingId, studentId }, select: { id: true } });
      if (!owned) return res.status(403).json({ error: 'not your booking' });

      // Every score is 1–5; anything else (including 0 or a stray string) is
      // stored as null rather than rejected, so a part-finished form still saves.
      const score = (v: any) => {
        const n = parseInt(String(v), 10);
        return Number.isFinite(n) && n >= 1 && n <= 5 ? n : null;
      };
      const b = req.body || {};
      const data: any = {
        teacher: score(b.teacher), lessons: score(b.lessons),
        materials: score(b.materials), homework: score(b.homework),
        location: score(b.location), classrooms: score(b.classrooms),
        technology: score(b.technology), toilets: score(b.toilets), recRoom: score(b.rec_room),
        successTeam: score(b.success_team), overall: score(b.overall),
        comment: (b.comment ?? '').toString().trim() || null,
        submittedAt: new Date(),
        dismissedAt: null,
      };
      const row = await prisma.courseFeedback.upsert({
        where: { studentId_bookingId: { studentId, bookingId } },
        update: data,
        create: { studentId, bookingId, ...data },
      });
      res.json({ feedback: row });
    } catch (e: any) { res.status(400).json({ error: String(e?.message || e) }); }
  });

  router.get('/social-feedback/eligible', async (req, res) => {
    try {
      const studentId = req.session.studentId;
      if (!studentId) return res.status(401).json({ error: 'No student session' });

      // Eligible = activities the student attended (attendance-confirmed by Kelly)
      // and the activity has happened. A dismissed row is cleared from the stack
      // whether or not it was rated — the × / swipe is a true "clear" so the
      // student isn't left staring at an edit card once they're done (Neil,
      // 2026-10-09). A rated row that has NOT been dismissed still stays, so it
      // remains editable from history until the student deliberately swipes it
      // away; the saved stars persist in the DB for admin reporting regardless.
      const rows: any[] = await prisma.$queryRawUnsafe(
        `SELECT a.id AS activity_id, to_char(a.date, 'YYYY-MM-DD') AS date,
                a.title, a.location, a.image_filename,
                f.id AS feedback_id, f.stars, f.comment, f.status,
                f.dismissed_at
           FROM activity_attendees aa
           JOIN activities a ON a.id = aa.activity_id
           LEFT JOIN social_activity_feedback f
             ON f.student_id = $1 AND f.activity_id = a.id
          WHERE aa.student_id = $1
            AND aa.attended = true
            AND a.date <= CURRENT_DATE
            AND f.dismissed_at IS NULL
          ORDER BY a.date DESC, a.id DESC`,
        studentId,
      );
      res.json({ eligible: rows });
    } catch (e: any) { res.status(500).json({ error: String(e?.message || e) }); }
  });

  router.post('/social-feedback/dismiss', async (req, res) => {
    try {
      const studentId = req.session.studentId;
      if (!studentId) return res.status(401).json({ error: 'No student session' });

      const activityId = parseInt(String(req.body?.activity_id), 10);
      if (!Number.isFinite(activityId)) return res.status(400).json({ error: 'bad activity_id' });

      const att: any = await prisma.activityAttendee.findUnique({
        where: { activityId_studentId: { activityId, studentId } },
        select: { attended: true },
      });
      if (!att) return res.status(403).json({ error: 'not RSVP\'d to this activity' });

      const upserted = await prisma.socialActivityFeedback.upsert({
        where: { studentId_activityId: { studentId, activityId } },
        update: { dismissedAt: new Date() },
        create: { studentId, activityId, dismissedAt: new Date() },
      });
      res.json({ feedback: upserted });
    } catch (e: any) { res.status(400).json({ error: String(e?.message || e) }); }
  });

  router.post('/social-feedback', async (req, res) => {
    try {
      const studentId = req.session.studentId;
      if (!studentId) return res.status(401).json({ error: 'No student session' });

      const activityId = parseInt(String(req.body?.activity_id), 10);
      const stars = parseInt(String(req.body?.stars), 10);
      const rawComment = (req.body?.comment ?? '').toString().trim();
      const comment = rawComment.length > 0 ? rawComment.slice(0, 2000) : null;

      if (!Number.isFinite(activityId)) return res.status(400).json({ error: 'bad activity_id' });
      if (!Number.isFinite(stars) || stars < 1 || stars > 10) return res.status(400).json({ error: 'stars must be 1..10' });

      // Authorize: student attended this activity and it has already happened.
      const att: any = await prisma.activityAttendee.findUnique({
        where: { activityId_studentId: { activityId, studentId } },
        select: { attended: true, activity: { select: { date: true } } },
      });
      if (!att) return res.status(403).json({ error: 'not RSVP\'d to this activity' });
      if (!att.attended) return res.status(403).json({ error: 'attendance not yet confirmed' });
      if (att.activity.date > new Date()) return res.status(403).json({ error: 'activity has not happened yet' });

      const upserted = await prisma.socialActivityFeedback.upsert({
        where: { studentId_activityId: { studentId, activityId } },
        update: { stars, comment },
        create: { studentId, activityId, stars, comment },
      });
      res.status(201).json({ feedback: upserted });
    } catch (e: any) { res.status(400).json({ error: String(e?.message || e) }); }
  });

  // ── Documents (preview + PDF) ─────────────────
  // The student portal mirrors what the SIS admin offers: an HTML preview of
  // the issued document and a PDF download. Both endpoints check that the
  // requested document belongs to the logged-in student so a guessed/forged
  // ID can't leak someone else's letter.

  // NOTE: distinct path (`/view`, not `/preview`) — an earlier route
  // `/documents/:docId/preview` serves the student's UPLOADED files and would
  // otherwise shadow this issued-document HTML view (Express matches first-wins),
  // leaving the app's document viewer blank.
  router.get('/documents/:id/view', async (req, res) => {
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
      // Wrap in a mobile-friendly page. The letter is a fixed 210mm (~794px) wide
      // page, so a ~800 viewport makes phones fit the WHOLE letter to the frame on
      // load, while user-scalable enables pinch-to-zoom to read detail — so someone
      // at an airport desk can zoom in without downloading the PDF. Content was
      // generated by our own template engine + locked at issue time (no CSP needed).
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.send(
        '<!doctype html><html><head><meta charset="utf-8">'
        + '<meta name="viewport" content="width=800, user-scalable=yes, maximum-scale=6, minimum-scale=0.25">'
        + '<style>html,body{margin:0;padding:0;background:#fff;-webkit-text-size-adjust:100%}</style>'
        + '</head><body>' + (doc.contentHtml || '<p>Document content unavailable.</p>') + '</body></html>'
      );
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
      // inline=1 → render in a tab / system browser (the webview can't act on an
      // attachment download, and the student needs to save/share the real PDF).
      const disp = req.query.inline ? 'inline' : 'attachment';
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `${disp}; filename="${filename}"`);
      res.send(pdf);
    } catch (e: any) { res.status(500).json({ error: String(e?.message || e) }); }
  });

  // Push-notification token registration — called by the mobile app on
  // first launch after the user grants notification permission, and on
  // every cold start (FCM rotates tokens). De-duped on (token).
  router.post('/push-register', async (req, res) => {
    try {
      const studentId = req.session.studentId;
      if (!studentId) return res.status(401).json({ error: 'No student session' });
      const { token, platform, appVersion, deviceModel } = req.body || {};
      if (!token || !platform) return res.status(400).json({ error: 'token and platform required' });
      if (platform !== 'android' && platform !== 'ios') return res.status(400).json({ error: 'platform must be android or ios' });
      await prisma.deviceToken.upsert({
        where: { token },
        create: { token, platform, studentId, appVersion, deviceModel },
        update: { studentId, appVersion, deviceModel, lastSeenAt: new Date() },
      });
      res.json({ ok: true });
    } catch (e: any) { res.status(500).json({ error: String(e?.message || e) }); }
  });

  router.post('/push-unregister', async (req, res) => {
    try {
      const { token } = req.body || {};
      if (!token) return res.status(400).json({ error: 'token required' });
      await prisma.deviceToken.deleteMany({ where: { token } });
      res.json({ ok: true });
    } catch (e: any) { res.status(500).json({ error: String(e?.message || e) }); }
  });

  // Account deletion request (Google Play / GDPR compliance).
  //
  // We don't immediately hard-delete: Irish education law requires the
  // academic transcript to be retained 7 years. So the request is queued
  // for staff, who hard-delete personal data and leave only the
  // anonymised transcript. The user is signed out immediately and their
  // push tokens are removed so notifications stop.
  router.post('/me/delete', async (req, res) => {
    try {
      const studentId = req.session.studentId;
      if (!studentId) return res.status(401).json({ error: 'No student session' });
      const student = await prisma.student.findUnique({
        where: { id: studentId },
        select: { email: true },
      });
      const sisUser = req.session.user
        ? await prisma.sisUser.findUnique({
            where: { username: req.session.user },
            select: { username: true, email: true },
          })
        : null;
      await prisma.accountDeletionRequest.create({
        data: {
          studentId,
          email: sisUser?.email || student?.email || 'unknown',
          username: sisUser?.username,
          source: 'app',
        },
      });
      await prisma.deviceToken.deleteMany({ where: { studentId } });
      req.session.destroy(() => {
        res.json({ ok: true, message: 'Deletion request received. Personal data will be removed within 30 days; academic records are retained per Irish education law (see /legal/account-deletion.html).' });
      });
    } catch (e: any) { res.status(500).json({ error: String(e?.message || e) }); }
  });

  return router;
}
