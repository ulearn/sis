import { Router } from 'express';
import { PrismaClient } from '../generated/prisma/client';
import { bookingScripts } from '../scripts/bookings';

export function bookingRoutes(prisma: PrismaClient) {
  const router = Router();
  const scripts = bookingScripts(prisma);

  router.get('/', async (req, res) => {
    try {
      const result = await scripts.list(req.query);
      res.json(result);
    } catch (e) { res.status(500).json({ error: String(e) }); }
  });

  router.get('/:id', async (req, res) => {
    try {
      const booking = await scripts.getById(parseInt(req.params.id));
      if (!booking) return res.status(404).json({ error: 'Booking not found' });
      res.json(booking);
    } catch (e) { res.status(500).json({ error: String(e) }); }
  });

  router.post('/', async (req, res) => {
    try {
      const booking = await scripts.create(req.body);
      res.status(201).json(booking);
    } catch (e) { res.status(400).json({ error: String(e) }); }
  });

  router.patch('/:id', async (req, res) => {
    try {
      const booking = await scripts.update(parseInt(req.params.id), req.body);
      if (!booking) return res.status(404).json({ error: 'Booking not found' });
      res.json(booking);
    } catch (e) { res.status(400).json({ error: String(e) }); }
  });

  router.delete('/:id', async (req, res) => {
    try {
      await scripts.remove(parseInt(req.params.id));
      res.json({ deleted: true });
    } catch (e) { res.status(400).json({ error: String(e) }); }
  });

  // Booking courses
  router.post('/:bookingId/courses', async (req, res) => {
    try { res.status(201).json(await scripts.addCourse(parseInt(req.params.bookingId), req.body)); }
    catch (e) { res.status(400).json({ error: String(e) }); }
  });

  router.patch('/courses/:id', async (req, res) => {
    try { res.json(await scripts.updateCourse(parseInt(req.params.id), req.body)); }
    catch (e) { res.status(400).json({ error: String(e) }); }
  });

  router.delete('/courses/:id', async (req, res) => {
    try { await scripts.removeCourse(parseInt(req.params.id)); res.json({ deleted: true }); }
    catch (e) { res.status(400).json({ error: String(e) }); }
  });

  // Booking accommodation
  router.post('/:bookingId/accommodations', async (req, res) => {
    try { res.status(201).json(await scripts.addAccommodation(parseInt(req.params.bookingId), req.body)); }
    catch (e) { res.status(400).json({ error: String(e) }); }
  });

  router.patch('/accommodations/:id', async (req, res) => {
    try { res.json(await scripts.updateAccommodation(parseInt(req.params.id), req.body)); }
    catch (e) { res.status(400).json({ error: String(e) }); }
  });

  router.delete('/accommodations/:id', async (req, res) => {
    try { await scripts.removeAccommodation(parseInt(req.params.id)); res.json({ deleted: true }); }
    catch (e) { res.status(400).json({ error: String(e) }); }
  });

  return router;
}
