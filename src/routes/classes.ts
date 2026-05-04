import { Router } from 'express';
import { PrismaClient } from '../generated/prisma/client';
import { classScripts } from '../scripts/classes';
import { schedulingScripts } from '../scripts/scheduling';

export function classRoutes(prisma: PrismaClient) {
  const router = Router();
  const scripts = classScripts(prisma);
  const sched = schedulingScripts(prisma);

  // ── Static/named routes MUST come before /:id ──

  // Classrooms
  router.get('/classrooms', async (_req, res) => {
    try { res.json(await scripts.listClassrooms()); }
    catch (e) { res.status(500).json({ error: String(e) }); }
  });

  // School closures (Good Friday, Christmas break, etc.)
  router.get('/closures', async (_req, res) => {
    try { res.json(await sched.listClosures()); }
    catch (e) { res.status(500).json({ error: String(e) }); }
  });

  router.post('/closures', async (req, res) => {
    try { res.status(201).json(await sched.createClosure(req.body)); }
    catch (e) { res.status(400).json({ error: String(e) }); }
  });

  router.patch('/closures/:id', async (req, res) => {
    try { res.json(await sched.updateClosure(parseInt(req.params.id), req.body)); }
    catch (e) { res.status(400).json({ error: String(e) }); }
  });

  router.delete('/closures/:id', async (req, res) => {
    try { res.json(await sched.deleteClosure(parseInt(req.params.id))); }
    catch (e) { res.status(400).json({ error: String(e) }); }
  });

  // Pull approved leave from Zoho People → write OccurrenceAbsence rows (source='zoho').
  // Default range: today through 8 weeks out. Manual rows are not touched.
  router.post('/sync-leave', async (req, res) => {
    try {
      const { from, to } = req.body || {};
      const fromD = from ? new Date(from) : new Date();
      const toD = to ? new Date(to) : (() => { const d = new Date(); d.setDate(d.getDate() + 7 * 8); return d; })();
      const result = await sched.syncZohoLeaveToAbsences(fromD, toD);
      res.json(result);
    } catch (e) { res.status(500).json({ error: String(e) }); }
  });

  // Per-occurrence manual absence — DOS marks default teacher absent for one day.
  // Engine suppresses payment, same as Zoho-derived leave. Idempotent (one row per occurrence).
  router.post('/occurrences/:id/absence', async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const { teacherId, reason } = req.body;
      if (!teacherId) return res.status(400).json({ error: 'teacherId required' });
      const occ = await prisma.classOccurrence.findUnique({ where: { id } });
      if (!occ) return res.status(404).json({ error: 'Occurrence not found' });
      const row = await prisma.occurrenceAbsence.upsert({
        where: { occurrenceId: id },
        update: { teacherId: parseInt(teacherId), source: 'manual', reason: reason || null, createdBy: req.session?.user || null },
        create: { occurrenceId: id, teacherId: parseInt(teacherId), source: 'manual', reason: reason || null, createdBy: req.session?.user || null },
      });
      res.status(201).json(row);
    } catch (e) { res.status(400).json({ error: String(e) }); }
  });

  router.delete('/occurrences/:id/absence', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await prisma.occurrenceAbsence.delete({ where: { occurrenceId: id } });
      res.json({ deleted: true });
    } catch (e) { res.status(400).json({ error: String(e) }); }
  });

  // DOS exception: "this teacher WAS in the room despite Zoho." Removes any current
  // absence row for this (occurrence, teacher) and creates a presence override so
  // the next sync won't re-add the absence.
  router.post('/occurrences/:id/presence-override', async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const { teacherId, reason } = req.body;
      if (!teacherId) return res.status(400).json({ error: 'teacherId required' });
      const tId = parseInt(teacherId);
      // Delete any current absence row for this occurrence (if it concerns this teacher)
      await prisma.occurrenceAbsence.deleteMany({ where: { occurrenceId: id, teacherId: tId } });
      const row = await prisma.occurrencePresenceOverride.upsert({
        where: { occurrenceId_teacherId: { occurrenceId: id, teacherId: tId } },
        update: { reason: reason || null, createdBy: req.session?.user || null },
        create: { occurrenceId: id, teacherId: tId, reason: reason || null, createdBy: req.session?.user || null },
      });
      res.status(201).json(row);
    } catch (e) { res.status(400).json({ error: String(e) }); }
  });

  router.delete('/occurrences/:id/presence-override', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { teacherId } = req.query as any;
      await prisma.occurrencePresenceOverride.deleteMany({
        where: { occurrenceId: id, teacherId: parseInt(teacherId) },
      });
      res.json({ deleted: true });
    } catch (e) { res.status(400).json({ error: String(e) }); }
  });

  // List absences AND overrides for a class within a date window — feeds the Mon-Fri grid.
  router.get('/by-class/:classId/scheduling-state', async (req, res) => {
    try {
      const classId = parseInt(req.params.classId);
      const { from, to } = req.query;
      const dateFilter: any = {};
      if (from) dateFilter.gte = new Date(from as string);
      if (to)   dateFilter.lte = new Date(to as string);

      const occWhere: any = { classId };
      if (from || to) occWhere.date = dateFilter;

      const occurrences = await prisma.classOccurrence.findMany({
        where: occWhere,
        select: { id: true, date: true, cancelled: true },
      });
      const occIds = occurrences.map(o => o.id);
      const [absences, overrides] = await Promise.all([
        prisma.occurrenceAbsence.findMany({ where: { occurrenceId: { in: occIds } } }),
        prisma.occurrencePresenceOverride.findMany({ where: { occurrenceId: { in: occIds } } }),
      ]);
      res.json({ occurrences, absences, overrides });
    } catch (e) { res.status(500).json({ error: String(e) }); }
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

  router.get('/cover-dashboard', async (req, res) => {
    try { res.json(await scripts.coverDashboard(req.query)); }
    catch (e) { res.status(500).json({ error: String(e) }); }
  });

  // Admin-only — gated client-side by hiding the button; server-side gate
  // here belt-and-braces in case the URL is hit directly.
  router.get('/profit-margin', async (req, res) => {
    if ((req as any).session?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin only' });
    }
    try { res.json(await scripts.profitMargin(req.query)); }
    catch (e) { res.status(500).json({ error: String(e) }); }
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

  // Clip an assignment so the student is removed from `weekStart` onward but kept
  // in earlier weeks. Body: { weekStart: 'YYYY-MM-DD' }. Distinct from DELETE,
  // which wipes all weeks (the foot-gun staff hit when they meant "from now on").
  router.post('/assign/:id/end', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { weekStart } = req.body;
      if (!weekStart) return res.status(400).json({ error: 'weekStart required' });
      res.json(await scripts.endAssignment(id, weekStart));
    } catch (e) { res.status(400).json({ error: String(e) }); }
  });

  // Teachers CRUD
  router.get('/teachers/list', async (req, res) => {
    try { res.json(await scripts.listTeachers(req.query)); }
    catch (e) { res.status(500).json({ error: String(e) }); }
  });

  router.get('/teachers/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid teacher ID' });
    try {
      const t = await scripts.getTeacherById(id);
      if (!t) return res.status(404).json({ error: 'Teacher not found' });
      res.json(t);
    } catch (e) { res.status(500).json({ error: String(e) }); }
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
