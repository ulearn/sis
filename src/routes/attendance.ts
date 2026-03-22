import { Router } from 'express';
import { PrismaClient } from '../generated/prisma/client';
import { attendanceScripts } from '../scripts/attendance';

export function attendanceRoutes(prisma: PrismaClient) {
  const router = Router();
  const scripts = attendanceScripts(prisma);

  // Get weekly attendance for a class
  router.get('/week/:classId/:weekOf', async (req, res) => {
    try {
      const result = await scripts.getWeekAttendance(parseInt(req.params.classId), req.params.weekOf);
      if (!result) return res.status(404).json({ error: 'Class not found' });
      res.json(result);
    } catch (e) { res.status(500).json({ error: String(e) }); }
  });

  // Get attendance for a class on a date
  router.get('/class/:classId/:date', async (req, res) => {
    try {
      const result = await scripts.getClassAttendance(parseInt(req.params.classId), req.params.date);
      if (!result) return res.status(404).json({ error: 'Class not found' });
      res.json(result);
    } catch (e) { res.status(500).json({ error: String(e) }); }
  });

  // Mark attendance for a single student
  router.post('/mark', async (req, res) => {
    try {
      const result = await scripts.markAttendance(req.body);
      res.json(result);
    } catch (e) { res.status(400).json({ error: String(e) }); }
  });

  // Bulk mark attendance
  router.post('/bulk', async (req, res) => {
    try {
      const results = await scripts.bulkMarkAttendance(req.body.records);
      res.json({ updated: results.length });
    } catch (e) { res.status(400).json({ error: String(e) }); }
  });

  // Toggle class cancellation
  router.post('/cancel/:classId/:date', async (req, res) => {
    try {
      const result = await scripts.toggleCancelled(parseInt(req.params.classId), req.params.date);
      res.json(result);
    } catch (e) { res.status(400).json({ error: String(e) }); }
  });

  // Student attendance summary
  router.get('/student/:studentId', async (req, res) => {
    try {
      const result = await scripts.studentSummary(parseInt(req.params.studentId));
      res.json(result);
    } catch (e) { res.status(500).json({ error: String(e) }); }
  });

  return router;
}
