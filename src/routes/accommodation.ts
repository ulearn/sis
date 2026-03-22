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

  return router;
}
