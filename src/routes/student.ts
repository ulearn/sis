/**
 * Student portal routes.
 *
 * Mounted at /sis/student/api/*. The shell at /sis/student (static HTML)
 * calls these with fetch().
 *
 * Auth is NOT yet wired — tomorrow's phase-1 work is the students table +
 * login. For now these endpoints return stub data so the UI renders.
 */
import { Router } from 'express';
import type { PrismaClient } from '../generated/prisma/client';
import { studentScripts } from '../scripts/student';

export function studentRoutesPortal(prisma: PrismaClient) {
  const router = Router();
  const scripts = studentScripts(prisma);

  router.get('/me', async (_req, res) => {
    try { res.json(await scripts.me()); }
    catch (e: any) { res.status(500).json({ error: String(e?.message || e) }); }
  });

  router.get('/profile', async (_req, res) => {
    try { res.json(await scripts.profile()); }
    catch (e: any) { res.status(500).json({ error: String(e?.message || e) }); }
  });

  router.get('/challenges', async (_req, res) => {
    try { res.json(await scripts.challenges()); }
    catch (e: any) { res.status(500).json({ error: String(e?.message || e) }); }
  });

  router.get('/learning', async (_req, res) => {
    try { res.json(await scripts.learning()); }
    catch (e: any) { res.status(500).json({ error: String(e?.message || e) }); }
  });

  return router;
}
