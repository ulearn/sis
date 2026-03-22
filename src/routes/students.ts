import { Router } from 'express';
import { PrismaClient } from '../generated/prisma/client';
import { studentScripts } from '../scripts/students';

export function studentRoutes(prisma: PrismaClient) {
  const router = Router();
  const scripts = studentScripts(prisma);

  router.get('/', async (req, res) => {
    try {
      const result = await scripts.list(req.query);
      res.json(result);
    } catch (e) { res.status(500).json({ error: String(e) }); }
  });

  router.get('/:id', async (req, res) => {
    try {
      const student = await scripts.getById(parseInt(req.params.id));
      if (!student) return res.status(404).json({ error: 'Student not found' });
      res.json(student);
    } catch (e) { res.status(500).json({ error: String(e) }); }
  });

  router.post('/', async (req, res) => {
    try {
      const student = await scripts.create(req.body);
      res.status(201).json(student);
    } catch (e) { res.status(400).json({ error: String(e) }); }
  });

  router.patch('/:id', async (req, res) => {
    try {
      const student = await scripts.update(parseInt(req.params.id), req.body);
      res.json(student);
    } catch (e) { res.status(400).json({ error: String(e) }); }
  });

  router.delete('/:id', async (req, res) => {
    try {
      await scripts.remove(parseInt(req.params.id));
      res.json({ deleted: true });
    } catch (e) { res.status(400).json({ error: String(e) }); }
  });

  return router;
}
