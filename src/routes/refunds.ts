import { Router } from 'express';
import multer from 'multer';
import { PrismaClient } from '../generated/prisma/client';
import { refundScripts } from '../scripts/refunds';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

// session.user in this SIS is the username string (not an object). Look up
// the SisUser row to get the integer id required by the refund schema's
// approvedById FK. Returns null if not signed in or user not found.
async function sessionUserId(prisma: PrismaClient, req: any): Promise<number | null> {
  const username = req?.session?.user;
  if (!username) return null;
  const u = await prisma.sisUser.findUnique({ where: { username }, select: { id: true } });
  return u?.id ?? null;
}

export function refundRoutes(prisma: PrismaClient) {
  const router = Router();
  const scripts = refundScripts(prisma);

  // ── PUBLIC WEBHOOK ────────────────────────────
  // Mounted under /sis/api/webhooks/refund-request (publicPaths covers /sis/api/webhooks).
  // Auth = shared secret in X-Refund-Secret header.
  router.post(
    '/webhook',
    upload.single('visa_refusal_letter'),
    async (req, res) => {
      try {
        const secret = req.header('X-Refund-Secret');
        if (!secret || secret !== process.env.REFUND_WEBHOOK_SECRET) {
          return res.status(401).json({ error: 'Invalid secret' });
        }
        const raw = req.body?.payload;
        if (!raw) return res.status(400).json({ error: 'Missing payload' });
        const payload = typeof raw === 'string' ? JSON.parse(raw) : raw;
        const result = await scripts.intake(payload, req.file);
        return res.status(201).json({ ok: true, id: result.id });
      } catch (e: any) {
        console.error('[refunds.webhook]', e);
        return res.status(500).json({ error: String(e?.message ?? e) });
      }
    },
  );

  // ── AUTHENTICATED ─────────────────────────────
  // Mounted under /sis/api/refunds — gated by requireAuth + role permissions.
  router.get('/', async (req, res) => {
    try {
      const filters = {
        status: (req.query.status as string) || undefined,
        territory: (req.query.territory as string) || undefined,
        reason: (req.query.reason as string) || undefined,
        fromDate: (req.query.fromDate as string) || undefined,
        toDate: (req.query.toDate as string) || undefined,
        bookingId: (req.query.bookingId as string) || undefined,
      };
      res.json(await scripts.list(filters));
    } catch (e: any) {
      res.status(500).json({ error: String(e?.message ?? e) });
    }
  });

  // Manual create — staff-created refund (no webform). Prefills from bookingId.
  router.post('/', async (req, res) => {
    try {
      const row = await scripts.create(req.body || {});
      res.status(201).json(row);
    } catch (e: any) {
      console.error('[refunds.create]', e);
      res.status(400).json({ error: String(e?.message ?? e) });
    }
  });

  router.get('/:id', async (req, res) => {
    try {
      const row = await scripts.get(parseInt(req.params.id, 10));
      if (!row) return res.status(404).json({ error: 'Not found' });
      res.json(row);
    } catch (e: any) {
      res.status(500).json({ error: String(e?.message ?? e) });
    }
  });

  router.patch('/:id', async (req, res) => {
    try {
      const id = parseInt(String(req.params.id), 10);
      const allowed = ['feeDeductionEur', 'feeBreakdown', 'amountRequested', 'otherInformation', 'approvedAmountEur', 'status',
        // submission fields — editable because these are manually-tracked legacy records
        'studentName', 'studentEmail', 'nationality', 'agentName', 'invoiceNumber', 'refundReason', 'refundReasonOther',
        // V1 legacy-tracker fields folded in (2026-09-11)
        'amountRefunded', 'notes', 'createdAt', 'lastContactAt', 'escrowHeld', 'tmRef', 'tmAmount', 'tmStatus',
        // identity links — editable so staff can connect/relink the booking (and student) being refunded
        'bookingId', 'studentId',
        // payee / bank details — editable so staff can correct where the refund is paid
        'bankType', 'bankCountry', 'payeeName', 'payeeAddress', 'payeeAddress2', 'payeeCountry',
        'bicSwift', 'nsc', 'accountNumber', 'bankName', 'bankStreetAddress', 'bankCity', 'correspondentBank', 'correspondentSwift'];
      const data: any = {};
      for (const k of allowed) if (k in req.body) data[k] = req.body[k];
      // Nullable integer FKs: '' → null, else an int.
      for (const k of ['bookingId', 'studentId']) {
        if (k in data) data[k] = (data[k] == null || String(data[k]).trim() === '') ? null : parseInt(String(data[k]), 10);
      }
      // Nullable Decimals: '' → null, else a numeric string (Prisma accepts strings).
      for (const k of ['approvedAmountEur', 'feeDeductionEur', 'amountRequested', 'tmAmount']) {
        if (k in data) data[k] = (data[k] == null || String(data[k]).trim() === '') ? null : String(data[k]);
      }
      // amountRefunded is NOT NULL (default 0): '' → '0', never null.
      if ('amountRefunded' in data) data.amountRefunded = (data.amountRefunded == null || String(data.amountRefunded).trim() === '') ? '0' : String(data.amountRefunded);
      // Date fields: ISO date string → Date. createdAt is the "first requested"
      // date (editable for manual/legacy records where the row's creation ≠ the
      // real request date); ignore a blank rather than null it (NOT NULL column).
      if ('lastContactAt' in data) data.lastContactAt = data.lastContactAt ? new Date(data.lastContactAt) : null;
      if ('createdAt' in data) { if (data.createdAt) data.createdAt = new Date(data.createdAt); else delete data.createdAt; }
      if ('escrowHeld' in data && typeof data.escrowHeld === 'string') data.escrowHeld = /^(true|yes|1)$/i.test(data.escrowHeld);
      res.json(await scripts.update(id, data));
    } catch (e: any) {
      res.status(400).json({ error: String(e?.message ?? e) });
    }
  });

  // Staff upload for manual / legacy visa-refusal cases. The document is saved
  // to the same private store used by Drupal intake and replaces the case link
  // (the old document remains in the student's document history).
  // Accepts one OR many files ('files' or the legacy single 'visa_refusal_letter').
  router.post('/:id/refusal-letter', upload.any(), async (req, res) => {
    try {
      const id = parseInt(String(req.params.id), 10);
      const files = Array.isArray(req.files) ? req.files : [];
      const docs = await scripts.attachRefusalLetter(id, files, req.session?.user);
      res.status(201).json(docs);
    } catch (e: any) {
      res.status(400).json({ error: String(e?.message ?? e) });
    }
  });

  // Per-file: stream (view/download) and delete one attached refund file.
  router.get('/:id/files/:docId', async (req, res) => {
    try {
      const file = await scripts.getRefundFileStream(parseInt(String(req.params.docId), 10));
      if (!file) return res.status(404).json({ error: 'File not found' });
      res.setHeader('Content-Type', file.mimeType || 'application/octet-stream');
      res.setHeader('Content-Disposition', `inline; filename="${(file.originalName || 'file').replace(/"/g, '')}"`);
      require('fs').createReadStream(file.path).pipe(res);
    } catch (e: any) {
      res.status(400).json({ error: String(e?.message ?? e) });
    }
  });
  router.delete('/:id/files/:docId', async (req, res) => {
    try {
      const userId = await sessionUserId(prisma, req);
      if (!userId) return res.status(401).json({ error: 'Not authenticated' });
      await scripts.deleteRefundFile(parseInt(String(req.params.id), 10), parseInt(String(req.params.docId), 10));
      res.status(204).end();
    } catch (e: any) {
      res.status(400).json({ error: String(e?.message ?? e) });
    }
  });

  router.delete('/:id/refusal-letter', async (req, res) => {
    try {
      await scripts.removeRefusalLetter(parseInt(String(req.params.id), 10));
      res.status(204).end();
    } catch (e: any) {
      res.status(400).json({ error: String(e?.message ?? e) });
    }
  });

  // Read-only pre-flight: the exact Notify-TM email + attachments + warnings, no send.
  router.post('/:id/tm-preview', async (req, res) => {
    try {
      const id = parseInt(String(req.params.id), 10);
      res.json(await scripts.tmPreview(id, req.body?.amount));
    } catch (e: any) {
      res.status(400).json({ error: String(e?.message ?? e) });
    }
  });

  router.post('/:id/approve', async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const userId = await sessionUserId(prisma, req);
      if (!userId) return res.status(401).json({ error: 'Not authenticated' });
      if (!['admin', 'accounts'].includes((req.session as any)?.role)) return res.status(403).json({ error: 'Refunds are restricted to Accounts/Admin.' });
      const result = await scripts.approve(id, userId, req.body?.amount, { subject: req.body?.subject, bodyText: req.body?.bodyText });
      res.json(result);
    } catch (e: any) {
      console.error('[refunds.approve]', e);
      res.status(500).json({ error: String(e?.message ?? e) });
    }
  });

  // Bank-transfer lane: approve + create the Xero refund Bill (100 – General Course Sales).
  router.post('/:id/approve-xero', async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const userId = await sessionUserId(prisma, req);
      if (!userId) return res.status(401).json({ error: 'Not authenticated' });
      if (!['admin', 'accounts'].includes((req.session as any)?.role)) return res.status(403).json({ error: 'Refunds are restricted to Accounts/Admin.' });
      const result = await scripts.approveToXero(id, userId, req.body?.amount);
      res.json(result);
    } catch (e: any) {
      console.error('[refunds.approve-xero]', e);
      res.status(500).json({ error: String(e?.message ?? e) });
    }
  });

  // Sync the linked Xero Bill's PAID status from Xero (marks refunded when paid).
  router.post('/:id/xero-bill/sync', async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const userId = await sessionUserId(prisma, req);
      if (!userId) return res.status(401).json({ error: 'Not authenticated' });
      if (!['admin', 'accounts'].includes((req.session as any)?.role)) return res.status(403).json({ error: 'Refunds are restricted to Accounts/Admin.' });
      res.json(await scripts.syncRefundXeroBill(id));
    } catch (e: any) {
      console.error('[refunds.xero-bill.sync]', e);
      res.status(500).json({ error: String(e?.message ?? e) });
    }
  });

  // Update the linked Xero refund Bill in place (re-push contact/line from current state).
  router.post('/:id/xero-bill/update', async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const userId = await sessionUserId(prisma, req);
      if (!userId) return res.status(401).json({ error: 'Not authenticated' });
      if (!['admin', 'accounts'].includes((req.session as any)?.role)) return res.status(403).json({ error: 'Refunds are restricted to Accounts/Admin.' });
      res.json(await scripts.updateRefundXeroBill(id));
    } catch (e: any) {
      console.error('[refunds.xero-bill.update]', e);
      res.status(500).json({ error: String(e?.message ?? e) });
    }
  });

  // Void the linked Xero refund Bill + reverse the tranche locally.
  router.post('/:id/xero-bill/delete', async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const userId = await sessionUserId(prisma, req);
      if (!userId) return res.status(401).json({ error: 'Not authenticated' });
      if (!['admin', 'accounts'].includes((req.session as any)?.role)) return res.status(403).json({ error: 'Refunds are restricted to Accounts/Admin.' });
      res.json(await scripts.deleteRefundXeroBill(id));
    } catch (e: any) {
      console.error('[refunds.xero-bill.delete]', e);
      res.status(500).json({ error: String(e?.message ?? e) });
    }
  });

  router.post('/:id/reject', async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const userId = await sessionUserId(prisma, req);
      if (!userId) return res.status(401).json({ error: 'Not authenticated' });
      if (!['admin', 'accounts'].includes((req.session as any)?.role)) return res.status(403).json({ error: 'Refunds are restricted to Accounts/Admin.' });
      const reason = (req.body?.reason ?? '').toString().trim();
      if (!reason) return res.status(400).json({ error: 'reason required' });
      res.json(await scripts.reject(id, userId, reason));
    } catch (e: any) {
      res.status(500).json({ error: String(e?.message ?? e) });
    }
  });

  // Hard-delete a refund created in error (guarded in the script against any that
  // moved money / were dispatched). Accounts/Admin only.
  router.delete('/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const userId = await sessionUserId(prisma, req);
      if (!userId) return res.status(401).json({ error: 'Not authenticated' });
      if (!['admin', 'accounts'].includes((req.session as any)?.role)) return res.status(403).json({ error: 'Refunds are restricted to Accounts/Admin.' });
      res.json(await scripts.deleteRefund(id));
    } catch (e: any) {
      console.error('[refunds.delete]', e);
      res.status(500).json({ error: String(e?.message ?? e) });
    }
  });

  router.post('/batch-approve', async (req, res) => {
    try {
      const userId = await sessionUserId(prisma, req);
      if (!userId) return res.status(401).json({ error: 'Not authenticated' });
      if (!['admin', 'accounts'].includes((req.session as any)?.role)) return res.status(403).json({ error: 'Refunds are restricted to Accounts/Admin.' });
      const ids: number[] = Array.isArray(req.body?.ids) ? req.body.ids.map((n: any) => parseInt(n, 10)) : [];
      if (!ids.length) return res.status(400).json({ error: 'ids[] required' });
      res.json(await scripts.batchApprove(ids, userId));
    } catch (e: any) {
      res.status(500).json({ error: String(e?.message ?? e) });
    }
  });

  // Visa refusal letter — proxied through SIS so the review UI can render it.
  router.get('/:id/refusal-letter', async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const file = await scripts.getRefusalLetterStream(id);
      if (!file) return res.status(404).end();
      res.setHeader('Content-Type', file.mimeType);
      res.setHeader('Content-Disposition', `inline; filename="${file.filename}"`);
      file.stream.pipe(res);
    } catch (e: any) {
      res.status(500).json({ error: String(e?.message ?? e) });
    }
  });

  return router;
}
