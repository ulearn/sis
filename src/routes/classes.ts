import { Router } from 'express';
import { PrismaClient } from '../generated/prisma/client';
import { classScripts } from '../scripts/classes';

export function classRoutes(prisma: PrismaClient) {
  const router = Router();
  const scripts = classScripts(prisma);

  // ── Static/named routes MUST come before /:id ──

  // Classrooms
  router.get('/classrooms', async (_req, res) => {
    try { res.json(await scripts.listClassrooms()); }
    catch (e) { res.status(500).json({ error: String(e) }); }
  });

  // Unassigned students
  router.get('/unassigned', async (req, res) => {
    try { res.json(await scripts.unassignedStudents(req.query)); }
    catch (e) { res.status(500).json({ error: String(e) }); }
  });

  // Teacher covers
  router.get('/covers', async (req, res) => {
    try { res.json(await scripts.getCovers(req.query)); }
    catch (e) { res.status(500).json({ error: String(e) }); }
  });

  router.post('/covers', async (req, res) => {
    try { res.status(201).json(await scripts.createCover(req.body)); }
    catch (e) { res.status(400).json({ error: String(e) }); }
  });

  router.delete('/covers/:id', async (req, res) => {
    try { await scripts.removeCover(parseInt(req.params.id)); res.json({ deleted: true }); }
    catch (e) { res.status(400).json({ error: String(e) }); }
  });

  // Student assignments
  router.post('/assign', async (req, res) => {
    try { res.status(201).json(await scripts.assignStudent(req.body)); }
    catch (e) { res.status(400).json({ error: String(e) }); }
  });

  router.delete('/assign/:id', async (req, res) => {
    try { await scripts.removeAssignment(parseInt(req.params.id)); res.json({ deleted: true }); }
    catch (e) { res.status(400).json({ error: String(e) }); }
  });

  // Teachers CRUD
  router.get('/teachers/list', async (_req, res) => {
    try { res.json(await scripts.listTeachers()); }
    catch (e) { res.status(500).json({ error: String(e) }); }
  });

  router.get('/teachers/by-class/:classId', async (req, res) => {
    try { res.json(await scripts.getClassTeachers(parseInt(req.params.classId))); }
    catch (e) { res.status(500).json({ error: String(e) }); }
  });

  router.post('/teachers/assign', async (req, res) => {
    try { res.status(201).json(await scripts.assignClassTeacher(req.body)); }
    catch (e) { res.status(400).json({ error: String(e) }); }
  });

  router.delete('/teachers/class-assign/:id', async (req, res) => {
    try { await scripts.removeClassTeacher(parseInt(req.params.id)); res.json({ deleted: true }); }
    catch (e) { res.status(400).json({ error: String(e) }); }
  });

  router.post('/teachers', async (req, res) => {
    try { res.status(201).json(await scripts.createTeacher(req.body)); }
    catch (e) { res.status(400).json({ error: String(e) }); }
  });

  router.patch('/teachers/:id', async (req, res) => {
    try { res.json(await scripts.updateTeacher(parseInt(req.params.id), req.body)); }
    catch (e) { res.status(400).json({ error: String(e) }); }
  });

  router.delete('/teachers/:id', async (req, res) => {
    try { await scripts.deleteTeacher(parseInt(req.params.id)); res.json({ deleted: true }); }
    catch (e) { res.status(400).json({ error: String(e) }); }
  });

  // ── Classes CRUD (/:id route LAST) ──

  router.get('/', async (req, res) => {
    try { res.json(await scripts.listClasses(req.query)); }
    catch (e) { res.status(500).json({ error: String(e) }); }
  });

  router.post('/', async (req, res) => {
    try { res.status(201).json(await scripts.createClass(req.body)); }
    catch (e) { res.status(400).json({ error: String(e) }); }
  });

  router.get('/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid class ID' });
    try {
      const cls = await scripts.getClassById(id);
      if (!cls) return res.status(404).json({ error: 'Class not found' });
      res.json(cls);
    } catch (e) { res.status(500).json({ error: String(e) }); }
  });

  router.patch('/:id', async (req, res) => {
    try { res.json(await scripts.updateClass(parseInt(req.params.id), req.body)); }
    catch (e) { res.status(400).json({ error: String(e) }); }
  });

  router.delete('/:id', async (req, res) => {
    try { await scripts.deleteClass(parseInt(req.params.id)); res.json({ deleted: true }); }
    catch (e) { res.status(400).json({ error: String(e) }); }
  });

  return router;
}
