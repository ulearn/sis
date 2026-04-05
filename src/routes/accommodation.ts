import { Router } from 'express';
import { PrismaClient } from '../generated/prisma/client';
import { accommodationScripts } from '../scripts/accommodation';

export function accommodationRoutes(prisma: PrismaClient) {
  const router = Router();
  const scripts = accommodationScripts(prisma);

  // Providers
  router.get('/', async (req, res) => {
    try { res.json(await scripts.listProviders(req.query)); }
    catch (e) { res.status(500).json({ error: String(e) }); }
  });

  router.get('/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID' });
    try {
      const p = await scripts.getProviderById(id);
      if (!p) return res.status(404).json({ error: 'Provider not found' });
      res.json(p);
    } catch (e) { res.status(500).json({ error: String(e) }); }
  });

  router.post('/', async (req, res) => {
    try { res.status(201).json(await scripts.createProvider(req.body)); }
    catch (e) { res.status(400).json({ error: String(e) }); }
  });

  router.patch('/:id', async (req, res) => {
    try { res.json(await scripts.updateProvider(parseInt(req.params.id), req.body)); }
    catch (e) { res.status(400).json({ error: String(e) }); }
  });

  router.delete('/:id', async (req, res) => {
    try { await scripts.deleteProvider(parseInt(req.params.id)); res.json({ deleted: true }); }
    catch (e) { res.status(400).json({ error: String(e) }); }
  });

  // Properties
  router.post('/:providerId/properties', async (req, res) => {
    try { res.status(201).json(await scripts.addProperty(parseInt(req.params.providerId), req.body)); }
    catch (e) { res.status(400).json({ error: String(e) }); }
  });

  router.patch('/properties/:id', async (req, res) => {
    try { res.json(await scripts.updateProperty(parseInt(req.params.id), req.body)); }
    catch (e) { res.status(400).json({ error: String(e) }); }
  });

  router.delete('/properties/:id', async (req, res) => {
    try { await scripts.deleteProperty(parseInt(req.params.id)); res.json({ deleted: true }); }
    catch (e) { res.status(400).json({ error: String(e) }); }
  });

  // Rooms
  router.post('/properties/:propertyId/rooms', async (req, res) => {
    try { res.status(201).json(await scripts.addRoom(parseInt(req.params.propertyId), req.body)); }
    catch (e) { res.status(400).json({ error: String(e) }); }
  });

  router.patch('/rooms/:id', async (req, res) => {
    try { res.json(await scripts.updateRoom(parseInt(req.params.id), req.body)); }
    catch (e) { res.status(400).json({ error: String(e) }); }
  });

  router.delete('/rooms/:id', async (req, res) => {
    try { await scripts.deleteRoom(parseInt(req.params.id)); res.json({ deleted: true }); }
    catch (e) { res.status(400).json({ error: String(e) }); }
  });

  // Beds
  router.post('/rooms/:roomId/beds', async (req, res) => {
    try { res.status(201).json(await scripts.addBed(parseInt(req.params.roomId), req.body)); }
    catch (e) { res.status(400).json({ error: String(e) }); }
  });

  router.delete('/beds/:id', async (req, res) => {
    try { await scripts.deleteBed(parseInt(req.params.id)); res.json({ deleted: true }); }
    catch (e) { res.status(400).json({ error: String(e) }); }
  });

  // ── Matching Engine ────────────────────────────

  // Get unplaced students (optionally filtered by accommodation type)
  router.get('/matching/unplaced', async (_req, res) => {
    try {
      const accommType = _req.query.type as string | undefined;
      res.json(await scripts.getUnplacedStudents(accommType));
    } catch (e) { res.status(500).json({ error: String(e) }); }
  });

  // Get host timeline
  router.get('/matching/timeline', async (req, res) => {
    try {
      const from = req.query.from as string || new Date().toISOString().split('T')[0];
      const weeks = parseInt(req.query.weeks as string) || 6;
      const toDate = new Date(from);
      toDate.setDate(toDate.getDate() + weeks * 7);
      const to = toDate.toISOString().split('T')[0];
      const providerType = req.query.type as string | undefined;
      res.json(await scripts.getHostTimeline(from, to, providerType));
    } catch (e) { res.status(500).json({ error: String(e) }); }
  });

  // Place student
  router.post('/matching/place', async (req, res) => {
    try {
      const { bookingAccommodationId, bedId } = req.body;
      if (!bookingAccommodationId || !bedId) return res.status(400).json({ error: 'bookingAccommodationId and bedId required' });
      res.json(await scripts.placeStudent(bookingAccommodationId, bedId));
    } catch (e) { res.status(400).json({ error: String(e) }); }
  });

  // Split placement
  router.post('/matching/split', async (req, res) => {
    try {
      const { bookingAccommodationId, splitDate } = req.body;
      if (!bookingAccommodationId || !splitDate) return res.status(400).json({ error: 'bookingAccommodationId and splitDate required' });
      res.json(await scripts.splitPlacement(bookingAccommodationId, splitDate));
    } catch (e) { res.status(400).json({ error: String(e) }); }
  });

  // Unplace student
  router.post('/matching/unplace', async (req, res) => {
    try {
      const { bookingAccommodationId } = req.body;
      if (!bookingAccommodationId) return res.status(400).json({ error: 'bookingAccommodationId required' });
      res.json(await scripts.unplaceStudent(bookingAccommodationId));
    } catch (e) { res.status(400).json({ error: String(e) }); }
  });

  return router;
}
