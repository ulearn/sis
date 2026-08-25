/**
 * Partner portal — API routes
 * All routes are mounted at /partners/api
 * Every request is scoped by session.agencyId (never from query params).
 */
import { Router } from 'express';
import { PrismaClient } from '../generated/prisma/client';
import { partnerScripts } from '../scripts/partners';
import { generatePartnerCertificate } from '../scripts/partner-cert';
import { CONTRACT_VERSION, gatherContractData, renderPreviewBytes, renderPreviewHtml, writeBackDetails, signContract } from '../scripts/partner-contract';
import { pushCredit, deleteCreditEverywhere } from '../scripts/partner-credit-sync';
import { acceleratorScripts } from '../scripts/accelerator';
import { clearanceScripts } from '../scripts/clearance';
import { documentScripts, buildGrossReceiptHtml, receiptPage } from '../scripts/documents';
import multer from 'multer';
import { parsePassport } from '../scripts/passport-parser';
import { classifyInsurancePdf } from '../scripts/insurance-classifier';
import path from 'path';
import fs from 'fs';

// Partner-uploaded student docs (passports etc.) → uploads/student-docs/.
const partnerUploadDir = path.join(__dirname, '..', '..', 'uploads', 'student-docs');
if (!fs.existsSync(partnerUploadDir)) fs.mkdirSync(partnerUploadDir, { recursive: true });
// Student self-uploads + staff uploads live here (per-student subfolder).
const studentsUploadDir = path.join(__dirname, '..', '..', 'uploads', 'students');
const partnerUpload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, partnerUploadDir),
    filename: (_req, file, cb) => cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`),
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ok = ['application/pdf', 'image/jpeg', 'image/png', 'image/heic', 'image/webp'].includes(file.mimetype);
    if (ok) cb(null, true); else cb(new Error('Only PDF / JPG / PNG accepted'));
  },
});

export function partnerRoutes(prisma: PrismaClient) {
  const router = Router();
  const scripts = partnerScripts(prisma);
  const docs = documentScripts(prisma);
  const accel = acceleratorScripts(prisma);
  const clearance = clearanceScripts(prisma);

  // Guard: authenticated partner only. Returns the agencyId or sends 401.
  function requirePartner(req: any, res: any): number | null {
    if (!req.session?.user || req.session.userType !== 'partner') {
      res.status(401).json({ success: false, error: 'Not authenticated' });
      return null;
    }
    return req.session.agencyId as number;
  }

  // ── Accelerator programme (non-blocking opt-in) ───────────────────
  router.get('/accelerator/status', async (req: any, res) => {
    const agencyId = requirePartner(req, res); if (agencyId == null) return;
    try { res.json(await accel.getStatus(agencyId)); }
    catch (e: any) { res.status(500).json({ error: String(e?.message || e) }); }
  });

  // Proxy the hubapp-rendered contract HTML for this agency (self-contained doc
  // with its own #accel-agree checkbox + #accel-activate button).
  router.get('/accelerator/contract', async (req: any, res) => {
    const agencyId = requirePartner(req, res); if (agencyId == null) return;
    try {
      const html = await accel.fetchContractHtml(agencyId);
      res.set('Content-Type', 'text/html; charset=utf-8').send(html);
    } catch (e: any) { res.status(502).send(`<p style="font-family:sans-serif;padding:24px;color:#991b1b">Could not load the Accelerator contract: ${String(e?.message || e)}</p>`); }
  });

  router.post('/accelerator/activate', async (req: any, res) => {
    const agencyId = requirePartner(req, res); if (agencyId == null) return;
    try {
      res.json({ success: true, ...(await accel.activate(agencyId, req.session?.user ?? null)) });
    } catch (e: any) { res.status(500).json({ success: false, error: String(e?.message || e) }); }
  });

  // ── Me ───────────────────────────────────────
  router.get('/me', async (req, res) => {
    if (!req.session.user || req.session.userType !== 'partner') {
      return res.status(401).json({ success: false, error: 'Not authenticated' });
    }
    // Contract-signed status — drives the first-login signing modal.
    const agency = await prisma.agency.findUnique({
      where: { id: req.session.agencyId! },
      select: { contractSignedAt: true, commissionRate: true, clearanceEligible: true },
    });
    // Seat Clearance — drives the tab: shown when eligible; auto-selected on load
    // while a sale is live. Light summary here; the tab fetches the full payload.
    const _clrSale = await clearance.currentSale();
    res.json({
      success: true,
      user: req.session.user,
      displayName: req.session.displayName,
      agencyId: req.session.agencyId,
      agencyName: req.session.agencyName,
      permissions: req.session.portalPermissions || {},
      // Percentage points (e.g. 25 = 25%), or null when unset — the LifePass
      // projection scales every figure by this / 100. Null = "not set" (kept
      // null, not 0, so it stays a visible gap); the display falls back to 22%.
      commissionRate: agency?.commissionRate != null ? Number(agency.commissionRate) : null,
      contractSigned: !!agency?.contractSignedAt,
      contractSignedAt: agency?.contractSignedAt ?? null,
      impersonating: !!req.session.impersonatedByAdmin,
      impersonatedBy: req.session.impersonatedByAdmin || null,
      // LifePass not offered to Visa-Before-Departure / Unsupported partner territories → hide the tab
      lifePassEligible: await scripts.agencyLifePassEligible(req.session.agencyId!),
      clearance: { eligible: !!agency?.clearanceEligible, state: clearance.saleState(_clrSale) },
    });
  });

  // ── Seat Clearance Sale ───────────────────────────────────
  router.get('/clearance', async (req: any, res) => {
    const agencyId = requirePartner(req, res); if (agencyId == null) return;
    try { res.json(await clearance.forAgency(agencyId)); }
    catch (e: any) { res.status(500).json({ error: String(e?.message || e) }); }
  });

  router.post('/clearance/reserve', async (req: any, res) => {
    const agencyId = requirePartner(req, res); if (agencyId == null) return;
    try {
      const items = Array.isArray(req.body?.items) ? req.body.items : [];
      const out = await clearance.reserve(
        agencyId,
        req.session?.user ?? null,
        req.session?.agencyName || '',
        null,
        items,
      );
      res.json(out);
    } catch (e: any) { res.status(400).json({ ok: false, error: String(e?.message || e) }); }
  });

  // Poll target — confirms a Stripe checkout is paid + flips the seats to RESERVED.
  router.get('/clearance/checkout-status', async (req: any, res) => {
    const agencyId = requirePartner(req, res); if (agencyId == null) return;
    try { res.json(await clearance.confirmCheckout(String(req.query.sessionId || ''))); }
    catch (e: any) { res.status(500).json({ paid: false, error: String(e?.message || e) }); }
  });

  // ── Contract status ──────────────────────────
  router.get('/contract', async (req, res) => {
    try {
      const agency = await prisma.agency.findUnique({
        where: { id: req.session.agencyId! },
        select: {
          contractSignedAt: true,
          signatures: {
            orderBy: { signedAt: 'desc' },
            take: 1,
            select: { id: true, contractVersion: true, pdfPath: true, mode: true },
          },
        },
      });
      const sig = agency?.signatures[0];

      // Pre-fill for the signing widget + "confirm your details" step. Unsigned
      // partners only — not worth the HubSpot round-trip once already signed.
      let suggestedName: string | null = null;
      let suggestedTitle: string | null = null;
      let commissionSet = true;
      let details: any = null;
      if (!agency?.contractSignedAt) {
        try {
          const d = await gatherContractData(prisma, req.session.agencyId!);
          suggestedName = d.suggestedSignerName;
          suggestedTitle = d.suggestedSignerTitle;
          commissionSet = d.commissionSet;
          // Editable, HubSpot-pulled details the ETO confirms/corrects on sign.
          details = {
            etoName: d.fields.etoName,
            primaryContact: d.fields.primaryContact,
            email: d.fields.email,
            telephone: d.fields.telephone,
            companyTaxNo: d.fields.companyTaxNo,
            wholesaleDiscount: d.fields.wholesaleDiscount,   // display-only
            street: d.address.street,
            city: d.address.city,
            state: d.address.state,
            zip: d.address.zip,
            country: d.address.country,
          };
        } catch { /* non-fatal — inputs will just be empty */ }
      }

      res.json({
        success: true,
        signed: !!agency?.contractSignedAt,
        signedAt: agency?.contractSignedAt ?? null,
        currentVersion: CONTRACT_VERSION,
        signedVersion: sig?.contractVersion ?? null,
        signedPdfUrl: sig?.pdfPath ? `/sis/partners/api/contract/signed.pdf` : null,
        previewPdfUrl: '/sis/partners/api/contract/preview.pdf',
        previewHtmlUrl: '/sis/partners/api/contract/preview.html',
        commissionSet,
        details,
        suggestedName,
        suggestedTitle,
      });
    } catch (e) { res.status(500).json({ success: false, error: String(e) }); }
  });

  // ── Contract preview (pre-fill from SIS + HubSpot, no signature) ────
  router.get('/contract/preview.pdf', async (req, res) => {
    try {
      const bytes = await renderPreviewBytes(prisma, req.session.agencyId!);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline; filename="ulearn-partner-agreement-preview.pdf"');
      res.setHeader('Cache-Control', 'no-store');
      res.send(Buffer.from(bytes));
    } catch (e) { res.status(500).send(String(e)); }
  });

  // ── Contract preview (responsive HTML — mobile-safe read pane) ─────
  router.get('/contract/preview.html', async (req, res) => {
    try {
      const html = await renderPreviewHtml(prisma, req.session.agencyId!);
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Cache-Control', 'no-store');
      res.send(html);
    } catch (e) { res.status(500).send(String(e)); }
  });

  // ── Confirm / correct details → write back to HubSpot (canonical) ──
  router.post('/contract/confirm', async (req, res) => {
    try {
      if (!req.session.user) return res.status(401).json({ success: false, error: 'Not authenticated' });
      const { etoName, primaryContact, email, telephone, companyTaxNo, street, city, state, zip, country } = req.body || {};
      const result = await writeBackDetails(prisma, req.session.agencyId!, {
        etoName, primaryContact, email, telephone, companyTaxNo, street, city, state, zip, country,
      });
      res.json({ success: true, ...result });
    } catch (e) { res.status(500).json({ success: false, error: String(e) }); }
  });

  // ── Signed contract download (this agency's latest) ────────────────
  router.get('/contract/signed.pdf', async (req, res) => {
    try {
      const sig = await prisma.agencySignature.findFirst({
        where: { agencyId: req.session.agencyId! },
        orderBy: { signedAt: 'desc' },
      });
      if (!sig || !sig.pdfPath) return res.status(404).send('No signed contract on file');
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline; filename="ulearn-partner-agreement-signed.pdf"');
      res.sendFile(sig.pdfPath);
    } catch (e) { res.status(500).send(String(e)); }
  });

  // ── A specific signature's PDF (agency-scoped) ─────────────────────
  //    Used by the Documents tab to view historical signatures, including
  //    legacy-zoho imports whose PDF lives on disk under data/contracts/.
  router.get('/contract/signatures/:id/pdf', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (!id) return res.status(400).send('Invalid id');
      const sig = await prisma.agencySignature.findUnique({ where: { id } });
      if (!sig || sig.agencyId !== req.session.agencyId) return res.status(404).send('Not found');
      if (!sig.pdfPath) return res.status(404).send('PDF not available');
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline; filename="ulearn-partner-agreement.pdf"');
      res.sendFile(sig.pdfPath);
    } catch (e) { res.status(500).send(String(e)); }
  });

  // ── Submit signature ───────────────────────────
  router.post('/contract/sign', async (req, res) => {
    try {
      if (!req.session.user) return res.status(401).json({ success: false, error: 'Not authenticated' });
      const sisUser = await prisma.sisUser.findUnique({
        where: { username: req.session.user },
        select: { id: true, email: true },
      });
      if (!sisUser) return res.status(401).json({ success: false, error: 'User not found' });

      const { mode, signerName, signerTitle, font, signatureSvg, signaturePngB64, agreed, companyTaxNo } = req.body || {};
      if (!agreed) return res.status(400).json({ success: false, error: 'Must agree to the terms' });
      if (mode !== 'typed' && mode !== 'drawn') return res.status(400).json({ success: false, error: 'Invalid mode' });
      if (!signerName || typeof signerName !== 'string' || !signerName.trim()) return res.status(400).json({ success: false, error: 'Signer name required' });
      if (!signaturePngB64 || typeof signaturePngB64 !== 'string') return res.status(400).json({ success: false, error: 'Signature image required' });

      const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket.remoteAddress || null;
      const ua = req.headers['user-agent'] || null;

      const result = await signContract(prisma, {
        agencyId: req.session.agencyId!,
        signedByUserId: sisUser.id,
        mode,
        signerName: signerName.trim(),
        signerTitle: typeof signerTitle === 'string' && signerTitle.trim() ? signerTitle.trim() : null,
        signerEmail: sisUser.email,
        font: typeof font === 'string' ? font : null,
        signatureSvg: typeof signatureSvg === 'string' ? signatureSvg : null,
        signaturePngB64,
        companyTaxNo: typeof companyTaxNo === 'string' && companyTaxNo.trim() ? companyTaxNo.trim() : null,
        ipAddress: ip,
        userAgent: typeof ua === 'string' ? ua : null,
      });
      res.json({ success: true, ...result });
    } catch (e) {
      console.error('[contract/sign]', e);
      res.status(500).json({ success: false, error: String(e) });
    }
  });

  // ── Dashboard ────────────────────────────────
  router.get('/dashboard', async (req, res) => {
    try {
      const data = await scripts.dashboard(req.session.agencyId!);
      res.json({ success: true, ...data });
    } catch (e) { res.status(500).json({ success: false, error: String(e) }); }
  });

  // ── Students ─────────────────────────────────
  router.get('/students', async (req, res) => {
    try {
      const data = await scripts.students(req.session.agencyId!, {
        search: req.query.search as string,
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 50,
      });
      res.json({ success: true, ...data });
    } catch (e) { res.status(500).json({ success: false, error: String(e) }); }
  });

  // ── Student detail (agency-scoped) ──────────
  router.get('/students/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (!id) return res.status(400).json({ success: false, error: 'Invalid id' });
      const data = await scripts.studentDetail(req.session.agencyId!, id);
      res.json(data);
    } catch (e) { res.status(500).json({ success: false, error: String(e) }); }
  });

  // ── Passport fields (partner-editable: number / issue / expiry) ──
  router.patch('/students/:id/passport', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (!id) return res.status(400).json({ success: false, error: 'Invalid id' });
      res.json(await scripts.updateStudentPassport(req.session.agencyId!, id, req.body || {}));
    } catch (e) { res.status(500).json({ success: false, error: String(e) }); }
  });

  // ── Flight details (inbound + outbound) — partner-editable ──
  router.patch('/students/:id/flights', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (!id) return res.status(400).json({ success: false, error: 'Invalid id' });
      res.json(await scripts.updateStudentFlights(req.session.agencyId!, id, req.body || {}));
    } catch (e) { res.status(500).json({ success: false, error: String(e) }); }
  });

  // ── One upload bucket. On upload we read the PDF and auto-classify: an Arachas
  //    insurance policy (Medical / Learner Protection) is filed as a ULearn
  //    Document; anything else lands in "Other Uploads". The client can force a
  //    type via `docType` (the override selector) when auto-detect is wrong. ──
  router.post('/students/:id/document-upload', (req, res) => {
    partnerUpload.single('file')(req, res, async (err: any) => {
      try {
        if (err) return res.status(400).json({ success: false, error: err.message });
        const id = parseInt(req.params.id);
        if (!id) return res.status(400).json({ success: false, error: 'Invalid id' });
        const file = (req as any).file;
        if (!file) return res.status(400).json({ success: false, error: 'No file uploaded' });
        const who = `partner:${req.session.agencyId}:${req.session.user || ''}`;

        const forced = String((req.body && req.body.docType) || 'auto');
        let subtype: 'medical' | 'learner_protection' | null = null;
        if (forced === 'medical' || forced === 'learner_protection') subtype = forced;
        else if (forced === 'other') subtype = null;
        else if ((file.mimetype || '').includes('pdf')) subtype = await classifyInsurancePdf(file.path);

        if (subtype) return res.json(await scripts.attachInsurance(req.session.agencyId!, id, file, subtype, who));
        const r = await scripts.addStudentDoc(req.session.agencyId!, id, file, who);
        res.json({ ...r, classifiedAs: 'other' });
      } catch (e) { res.status(500).json({ success: false, error: String(e) }); }
    });
  });

  router.delete('/students/:id/docs/:docId', async (req, res) => {
    try {
      const id = parseInt(req.params.id), docId = parseInt(req.params.docId);
      res.json(await scripts.deleteStudentDoc(req.session.agencyId!, id, docId));
    } catch (e) { res.status(500).json({ success: false, error: String(e) }); }
  });

  // ── Passport upload (drag&drop → student_documents, category 'passport') ──
  router.post('/students/:id/passport-upload', (req, res) => {
    partnerUpload.single('file')(req, res, async (err: any) => {
      try {
        if (err) return res.status(400).json({ success: false, error: err.message });
        const id = parseInt(req.params.id);
        if (!id) return res.status(400).json({ success: false, error: 'Invalid id' });
        if (!(req as any).file) return res.status(400).json({ success: false, error: 'No file uploaded' });
        const who = `partner:${req.session.agencyId}:${req.session.user || ''}`;
        const file = (req as any).file;
        const result: any = await scripts.addPassportUpload(req.session.agencyId!, id, file, who);
        // Best-effort AI read of the passport image for the human-confirm
        // split-screen. Never blocks the upload and never auto-saves — the
        // extracted fields are only suggestions the partner confirms.
        if (result?.success) {
          try {
            const pp = await parsePassport(file.path, file.mimetype);
            result.supported = pp.supported;
            result.extracted = pp.extracted;
            if (pp.error) result.parseError = pp.error;
          } catch (e) { result.parseError = String(e); }
        }
        res.json(result);
      } catch (e) { res.status(500).json({ success: false, error: String(e) }); }
    });
  });

  // ── Serve an uploaded passport file (agency-scoped) ──
  router.get('/students/:id/uploads/:docId', async (req, res) => {
    try {
      const id = parseInt(req.params.id), docId = parseInt(req.params.docId);
      const meta = await scripts.getPassportUpload(req.session.agencyId!, id, docId);
      if (!meta) return res.status(404).send('Not found');
      const fp = path.resolve(partnerUploadDir, meta.filename);
      if (!fp.startsWith(path.resolve(partnerUploadDir)) || !fs.existsSync(fp)) return res.status(404).send('File not found');
      res.setHeader('Content-Type', meta.mimeType || 'application/octet-stream');
      res.setHeader('Content-Disposition', `inline; filename="${(meta.originalName || 'file').replace(/[^a-z0-9_.-]/gi, '_')}"`);
      res.sendFile(fp);
    } catch (e) { res.status(500).send(String(e)); }
  });

  router.delete('/students/:id/uploads/:docId', async (req, res) => {
    try {
      const id = parseInt(req.params.id), docId = parseInt(req.params.docId);
      res.json(await scripts.deletePassportUpload(req.session.agencyId!, id, docId));
    } catch (e) { res.status(500).json({ success: false, error: String(e) }); }
  });

  // ── Serve a student's uploaded doc (self-uploads + staff uploads), agency-scoped ──
  router.get('/students/:id/files/:docId', async (req, res) => {
    try {
      const id = parseInt(req.params.id), docId = parseInt(req.params.docId);
      const meta = await scripts.getStudentUpload(req.session.agencyId!, id, docId);
      if (!meta) return res.status(404).send('Not found');
      const base = path.resolve(path.join(studentsUploadDir, String(id)));
      const fp = path.resolve(base, meta.filename);
      if (!fp.startsWith(base) || !fs.existsSync(fp)) return res.status(404).send('File not found');
      res.setHeader('Content-Type', meta.mimeType || 'application/octet-stream');
      res.setHeader('Content-Disposition', `inline; filename="${(meta.originalName || 'file').replace(/[^a-z0-9_.-]/gi, '_')}"`);
      res.sendFile(fp);
    } catch (e) { res.status(500).send(String(e)); }
  });

  // ── Issued document PDF (LOA/cert) — agency-scoped, ISSUED only ──
  router.get('/students/:id/issued/:recordId/pdf', async (req, res) => {
    try {
      const id = parseInt(req.params.id), recId = parseInt(req.params.recordId);
      if (!(await scripts.assertIssuedDoc(req.session.agencyId!, id, recId))) return res.status(404).send('Not found');
      const { pdf, filename } = await docs.getDocumentPdf(recId);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
      res.send(pdf);
    } catch (e) { res.status(500).send(String(e)); }
  });

  // ── Bookings ─────────────────────────────────
  router.get('/bookings', async (req, res) => {
    try {
      const data = await scripts.bookings(req.session.agencyId!, {
        status: req.query.status as string,
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 50,
      });
      res.json({ success: true, ...data });
    } catch (e) { res.status(500).json({ success: false, error: String(e) }); }
  });

  // ── Finance ──────────────────────────────────
  router.get('/finance', async (req, res) => {
    try {
      const data = await scripts.finance(req.session.agencyId!);
      res.json({ success: true, ...data });
    } catch (e) { res.status(500).json({ success: false, error: String(e) }); }
  });

  // ── Partner credit ledger — list (any authed partner sees their own) ──
  router.get('/credits', async (req, res) => {
    try {
      const data = await scripts.listCredits(req.session.agencyId!);
      // Staff-only "Add Credit" affordance shows in the portal when a ULearn
      // admin is impersonating — partners can view but not create.
      // Show "+ Add Credit" only when the actual write will succeed: an ADMIN
      // impersonating. Non-admin staff (sales/DOS) can view portals but are
      // read-only (see blockImpersonatedWrites in app.ts), so they don't get
      // the button. Real partners never do.
      const canManage = !!req.session.impersonatedByAdmin && req.session.role === 'admin';
      res.json({ success: true, ...data, canManage });
    } catch (e) { res.status(500).json({ success: false, error: String(e) }); }
  });

  // ── Add a credit — STAFF ONLY (must be impersonating from admin) ──
  router.post('/credits', async (req, res) => {
    try {
      if (!req.session.impersonatedByAdmin) return res.status(403).json({ success: false, error: 'Staff only' });
      const { amount, reason, issueDate, sourceRef } = req.body || {};
      const data = await scripts.addCredit(req.session.agencyId!, {
        amount: Number(amount), reason, issueDate, sourceRef,
        createdBy: req.session.impersonatedByAdmin || req.session.user || 'admin',
      });
      // Auto-push the new grant to Xero (credit note) + HubSpot (task). Non-fatal:
      // the SIS ledger row stands regardless; push status is returned for the UI.
      let push = null;
      try { push = await pushCredit(prisma, data.id); } catch (e) { push = { error: String(e instanceof Error ? e.message : e) }; }
      res.json({ ...data, push });
    } catch (e) { res.status(500).json({ success: false, error: String(e instanceof Error ? e.message : e) }); }
  });

  // ── Retry the Xero/HubSpot push for a credit — STAFF ONLY ──
  router.post('/credits/:id/push', async (req, res) => {
    try {
      if (!req.session.impersonatedByAdmin) return res.status(403).json({ success: false, error: 'Staff only' });
      const id = parseInt(req.params.id);
      if (!id) return res.status(400).json({ success: false, error: 'Invalid credit id' });
      // Scope-check: the credit must belong to this agency.
      const owned = await prisma.agencyCredit.findFirst({ where: { id, agencyId: req.session.agencyId! }, select: { id: true } });
      if (!owned) return res.status(404).json({ success: false, error: 'Credit not found' });
      const push = await pushCredit(prisma, id);
      res.json({ success: true, push });
    } catch (e) { res.status(500).json({ success: false, error: String(e instanceof Error ? e.message : e) }); }
  });

  // ── Delete a credit (accidental) — reverses Xero + HubSpot too — STAFF ONLY ──
  router.delete('/credits/:id', async (req, res) => {
    try {
      if (!req.session.impersonatedByAdmin) return res.status(403).json({ success: false, error: 'Staff only' });
      const id = parseInt(req.params.id);
      if (!id) return res.status(400).json({ success: false, error: 'Invalid credit id' });
      const result = await deleteCreditEverywhere(prisma, req.session.agencyId!, id);
      res.json({ success: result.ok, ...result });
    } catch (e) { res.status(500).json({ success: false, error: String(e instanceof Error ? e.message : e) }); }
  });

  // ── Use credit (post a debit) against a booking/invoice — STAFF ONLY ──
  router.post('/credits/use', async (req, res) => {
    try {
      if (!req.session.impersonatedByAdmin) return res.status(403).json({ success: false, error: 'Staff only' });
      const { amount, bookingId, invoice, reason } = req.body || {};
      const data = await scripts.useCredit(req.session.agencyId!, {
        amount: Number(amount),
        bookingId: bookingId != null && bookingId !== '' ? Number(bookingId) : null,
        invoice: typeof invoice === 'string' ? invoice : null,
        reason: typeof reason === 'string' ? reason : null,
        createdBy: req.session.impersonatedByAdmin || req.session.user || 'admin',
      });
      res.json(data);
    } catch (e) { res.status(500).json({ success: false, error: String(e instanceof Error ? e.message : e) }); }
  });

  // ── Live finance (quotes + invoices + totals, pulled from HubSpot) ──
  router.get('/live-finance', async (req, res) => {
    try {
      const data = await scripts.liveFinance(req.session.agencyId!);
      res.json({ success: true, ...data });
    } catch (e) { res.status(500).json({ success: false, error: String(e) }); }
  });

  // ── Gross receipt (on-demand, agency-scoped) ──
  // The partner display layer over a paid HubSpot invoice — re-presented at GROSS
  // (commission left in). Generated LIVE on click, nothing stored. Agency-scoped:
  // a partner can only ever pull a receipt for a booking belonging to THEIR agency.
  router.get('/gross-receipt/:bookingId', async (req, res) => {
    try {
      const bookingId = parseInt(req.params.bookingId, 10);
      if (!Number.isFinite(bookingId)) return res.status(400).json({ success: false, error: 'bad booking id' });
      const booking = await prisma.booking.findUnique({ where: { id: bookingId }, select: { agencyId: true } });
      if (!booking || booking.agencyId !== req.session.agencyId) {
        return res.status(403).json({ success: false, error: 'Not your booking' });
      }
      const format = String(req.query.format || 'json');
      const r = await buildGrossReceiptHtml(prisma, bookingId);
      if (!r.ok) {
        // HTML/PDF surfaces open in a tab — give a readable page, not raw JSON.
        if (format === 'html' || format === 'pdf') {
          return res.status(r.code).type('html').send(
            `<p style="font-family:system-ui,sans-serif;padding:24px;color:#b91c1c">${r.error}</p>`);
        }
        return res.status(r.code).json({ success: false, error: r.error });
      }
      if (format === 'pdf') {
        const pdf = await docs.generatePdf(r.html);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="receipt-${r.number || bookingId}.pdf"`);
        return res.send(pdf);
      }
      if (format === 'html') {
        const pdfUrl = `/sis/partners/api/gross-receipt/${bookingId}?format=pdf`;
        return res.type('html').send(receiptPage(r.html, pdfUrl, `Receipt ${r.number}`));
      }
      res.json({ success: true, html: r.html, number: r.number });
    } catch (e) { res.status(500).json({ success: false, error: String(e) }); }
  });

  // ── Quote action (Accept / Query) ─────────────
  router.post('/quote-action', async (req, res) => {
    try {
      const result = await scripts.recordQuoteAction(
        req.session.agencyId!,
        req.session.agencyName || '',
        req.body,
      );
      res.json(result);
    } catch (e) { res.status(500).json({ success: false, error: String(e) }); }
  });

  // ── Documents (Zoho-signed contracts) ─────────
  router.get('/documents', async (req, res) => {
    try {
      const data = await scripts.documents(req.session.agencyId!);
      res.json({ success: true, ...data });
    } catch (e) { res.status(500).json({ success: false, error: String(e) }); }
  });

  // ── Serve cached PDF (agency-scoped) ──────────
  router.get('/documents/:id/pdf', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (!id) return res.status(400).send('Invalid id');
      const doc = await prisma.partnerDocument.findUnique({ where: { id } });
      if (!doc || doc.agencyId !== req.session.agencyId) {
        return res.status(404).send('Not found');
      }
      if (!doc.pdfCachedPath) return res.status(404).send('PDF not available');
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="${(doc.requestName || 'contract').replace(/[^a-z0-9_.-]/gi,'_')}.pdf"`);
      res.sendFile(doc.pdfCachedPath);
    } catch (e) { res.status(500).send(String(e)); }
  });

  // ── Partnership Certificate (auto-generated, stamps Agency.name onto template) ──
  router.get('/certificate/pdf', async (req, res) => {
    try {
      const result = await generatePartnerCertificate(prisma, req.session.agencyId!);
      if (!result) return res.status(404).send('Certificate not available');
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="${result.filename}"`);
      res.sendFile(result.path);
    } catch (e) { res.status(500).send(String(e)); }
  });

  // ── Challenge promotion ────────────────────────
  // Current month's Challenge (name + % + ends) for the enrolment-form label.
  router.get('/challenge', async (_req, res) => {
    try { res.json(await scripts.currentChallenge()); }
    catch (e) { res.status(500).json({ success: false, error: String(e) }); }
  });

  // Blanket opt-in toggle (per agency) — read + set.
  router.get('/challenge/opt-in', async (req, res) => {
    try { res.json(await scripts.getChallengeOptIn(req.session.agencyId!)); }
    catch (e) { res.status(500).json({ success: false, error: String(e) }); }
  });
  router.post('/challenge/opt-in', async (req, res) => {
    try { res.json(await scripts.setChallengeOptIn(req.session.agencyId!, !!req.body?.on)); }
    catch (e) { res.status(500).json({ success: false, error: String(e) }); }
  });

  // ── Enroll ─────────────────────────────────────
  // Receives form data, creates contact + deal in HubSpot server-side.
  router.post('/enroll', async (req, res) => {
    try {
      const result = await scripts.enroll(
        req.session.agencyId!,
        req.session.agencyName || '',
        req.body,
        req.session.partnerHubspotContactId,
      );
      res.json(result);
    } catch (e) { res.status(500).json({ success: false, error: String(e) }); }
  });

  return router;
}
