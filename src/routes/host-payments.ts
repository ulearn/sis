import { Router } from 'express';
import { PrismaClient } from '../generated/prisma/client';
import { hostPaymentScripts } from '../scripts/host-payments';

export function hostPaymentRoutes(prisma: PrismaClient) {
  const router = Router();
  const scripts = hostPaymentScripts(prisma);

  // Calculate and create a payment run (normally called by cron, but can be triggered manually)
  router.post('/run', async (req, res) => {
    try {
      const runDate = req.body.runDate ? new Date(req.body.runDate) : new Date();
      const result = await scripts.calculatePaymentRun(runDate);
      res.json(result);
    } catch (e) { res.status(500).json({ error: String(e) }); }
  });

  // List recent payment runs
  router.get('/runs', async (_req, res) => {
    try { res.json(await scripts.listPaymentRuns()); }
    catch (e) { res.status(500).json({ error: String(e) }); }
  });

  // Get single payment run with line items
  router.get('/runs/:id', async (req, res) => {
    try {
      const run = await scripts.getPaymentRun(parseInt(req.params.id as string));
      if (!run) return res.status(404).json({ error: 'Not found' });
      res.json(run);
    } catch (e) { res.status(500).json({ error: String(e) }); }
  });

  // Approve a payment run
  router.post('/runs/:id/approve', async (req, res) => {
    try {
      const approvedBy = req.body.approvedBy || 'admin';
      res.json(await scripts.approveRun(parseInt(req.params.id as string), approvedBy));
    } catch (e) { res.status(400).json({ error: String(e) }); }
  });

  // Mark as paid
  router.post('/runs/:id/paid', async (req, res) => {
    try {
      res.json(await scripts.markPaid(parseInt(req.params.id as string)));
    } catch (e) { res.status(400).json({ error: String(e) }); }
  });

  // Edit a line item
  router.patch('/line-items/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id as string);
      const { amount, weeksPaid, daysPaid, weeklyRate, amendmentNote, amendedBy } = req.body;
      const data: any = {};
      if (amount !== undefined) data.amount = parseFloat(amount);
      if (weeksPaid !== undefined) data.weeksPaid = parseInt(weeksPaid);
      if (daysPaid !== undefined) data.daysPaid = parseInt(daysPaid);
      if (weeklyRate !== undefined) data.weeklyRate = parseFloat(weeklyRate);
      if (amendmentNote !== undefined) data.amendmentNote = amendmentNote;
      if (amendedBy !== undefined) data.amendedBy = amendedBy;
      const updated = await prisma.hostPaymentLineItem.update({ where: { id }, data });
      // Recalculate run total
      const allItems = await prisma.hostPaymentLineItem.findMany({ where: { runId: updated.runId } });
      const total = allItems.reduce((s, li) => s + Number(li.amount), 0);
      await prisma.hostPaymentRun.update({ where: { id: updated.runId }, data: { totalAmount: Math.round(total * 100) / 100 } });
      res.json(updated);
    } catch (e) { res.status(400).json({ error: String(e) }); }
  });

  // Add an amendment line item to a run for a specific provider
  router.post('/runs/:runId/amendment', async (req, res) => {
    try {
      const runId = parseInt(req.params.runId as string);
      const { providerId, providerName, amount, amendmentNote, amendedBy } = req.body;
      if (!providerId || !amount || !amendmentNote) return res.status(400).json({ error: 'providerId, amount, and amendmentNote required' });
      const now = new Date().toISOString().split('T')[0];
      const li = await prisma.hostPaymentLineItem.create({
        data: {
          runId,
          providerId: parseInt(providerId),
          bookingAccommodationId: 0, // no booking — pure amendment
          studentName: 'Amendment',
          providerName: providerName || '',
          weeksPaid: 0,
          daysPaid: 0,
          weeklyRate: 0,
          amount: parseFloat(amount),
          reason: 'amendment',
          periodFrom: new Date(now),
          periodTo: new Date(now),
          amendmentNote,
          amendedBy: amendedBy || 'admin',
        },
      });
      // Recalculate run total
      const allItems = await prisma.hostPaymentLineItem.findMany({ where: { runId } });
      const total = allItems.reduce((s, item) => s + Number(item.amount), 0);
      await prisma.hostPaymentRun.update({ where: { id: runId }, data: { totalAmount: Math.round(total * 100) / 100 } });
      res.json(li);
    } catch (e) { res.status(400).json({ error: String(e) }); }
  });

  // Delete a line item
  router.delete('/line-items/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id as string);
      const li = await prisma.hostPaymentLineItem.delete({ where: { id } });
      // Recalculate run total
      const allItems = await prisma.hostPaymentLineItem.findMany({ where: { runId: li.runId } });
      const total = allItems.reduce((s, item) => s + Number(item.amount), 0);
      await prisma.hostPaymentRun.update({ where: { id: li.runId }, data: { totalAmount: Math.round(total * 100) / 100 } });
      res.json({ deleted: true });
    } catch (e) { res.status(400).json({ error: String(e) }); }
  });

  return router;
}
