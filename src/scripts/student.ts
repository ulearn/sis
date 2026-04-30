/**
 * Student portal business logic (scaffold).
 *
 * V1 surfaces: Profile (read-only SIS), Challenges (gamified onboarding),
 * Learning (placement/quiz/delta status).
 *
 * Auth note: student sessions will live in a separate table (e.g. `student_users`
 * or a `userType='student'` row on `sis_users`). Not wired yet — stub returns
 * the first Student record so the shell can render data.
 */
import type { PrismaClient } from '../generated/prisma/client';

export function studentScripts(prisma: PrismaClient) {
  // Return a stubbed "me" payload. Until student auth is wired, we pick
  // the first active Student so the UI has something to render.
  async function me() {
    const s = await prisma.student.findFirst({
      where: { active: true } as any,
      select: {
        id: true, firstName: true, lastName: true, email: true,
        nationality: true, level: true, quizScore: true,
      } as any,
    });
    return { student: s || null, demo: true };
  }

  async function profile() {
    // TODO: swap stubbed student for authenticated one; join bookings/accomm/docs
    return { demo: true };
  }

  async function challenges() {
    // TODO: return campaign + tasks + submissions for current student
    return { demo: true, progress: { done: 2, total: 6 } };
  }

  async function learning() {
    // TODO: return placement status + delta eligibility + class level
    return { demo: true };
  }

  return { me, profile, challenges, learning };
}
