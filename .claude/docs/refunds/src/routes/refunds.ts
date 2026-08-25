import { Router } from 'express';
import multer from 'multer';
import { PrismaClient } from '../generated/prisma/client';
import { refundScripts } from '../scripts/refunds';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

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
      };
      res.json(await scripts.list(filters));
    } catch (e: any) {
      res.status(500).json({ error: String(e?.message ?? e) });
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
      const id = parseInt(req.params.id, 10);
      const allowed = ['feeDeductionEur', 'feeBreakdown', 'amountRequested', 'otherInformation'];
      const data: any = {};
      for (const k of allowed) if (k in req.body) data[k] = req.body[k];
      res.json(await scripts.update(id, data));
    } catch (e: any) {
      res.status(400).json({ error: String(e?.message ?? e) });
    }
  });

  router.post('/:id/approve', async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const userId = (req as any).session?.user?.id;
      if (!userId) return res.status(401).json({ error: 'Not authenticated' });
      const result = await scripts.approve(id, userId);
      res.json(result);
    } catch (e: any) {
      console.error('[refunds.approve]', e);
      res.status(500).json({ error: String(e?.message ?? e) });
    }
  });

  router.post('/:id/reject', async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const userId = (req as any).session?.user?.id;
      if (!userId) return res.status(401).json({ error: 'Not authenticated' });
      const reason = (req.body?.reason ?? '').toString().trim();
      if (!reason) return res.status(400).json({ error: 'reason required' });
      res.json(await scripts.reject(id, userId, reason));
    } catch (e: any) {
      res.status(500).json({ error: String(e?.message ?? e) });
    }
  });

  router.post('/batch-approve', async (req, res) => {
    try {
      const userId = (req as any).session?.user?.id;
      if (!userId) return res.status(401).json({ error: 'Not authenticated' });
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
