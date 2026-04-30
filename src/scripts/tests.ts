/**
 * Placement test orchestration — token issuance, email delivery, result recording.
 *
 * Tests live at lms.ulearnschool.com/prototype/{placement,delta}/ (LMS-hosted UI).
 * The SIS:
 *   - issues one-time tokens tied to a student + test type
 *   - sends the student the LMS link with ?token=<tok>
 *   - receives the completed score back (public CORS endpoint)
 *   - writes the score to the Student record; for DELTA, combines with prior quizScore
 *     into a full 40-Q placementTestScore.
 */
import crypto from 'crypto';
import type { PrismaClient } from '../generated/prisma/client';
import { sendEmail } from './email';

// Public branded wrapper URLs (Drupal pages on ulearnschool.com that iframe the
// LMS). The Drupal page has an inline script that forwards ?token=… from the
// parent URL into the iframe src, so the LMS app picks it up.
const PUBLIC_BASE = 'https://ulearnschool.com';
// Direct LMS URLs — kept as a fallback route in case Drupal is unavailable
// or if we ever want to skip the marketing wrapper.
const LMS_BASE = 'https://lms.ulearnschool.com/prototype';

const TOKEN_TTL_DAYS = 30;
const FROM_EMAIL = 'dos@ulearnschool.com';
const FROM_NAME = 'ULearn Academic Team';

type TestType = 'QUIZ' | 'PLACEMENT' | 'DELTA';

function lmsUrlFor(testType: TestType, token: string, direct: boolean = false): string {
  if (direct) {
    if (testType === 'PLACEMENT') return `${LMS_BASE}/placement/?token=${token}`;
    if (testType === 'DELTA') return `${LMS_BASE}/delta/?token=${token}`;
    return `${LMS_BASE}/?token=${token}`;
  }
  // Branded Drupal URLs (default) — wrapper forwards token into the LMS iframe
  if (testType === 'PLACEMENT') return `${PUBLIC_BASE}/placement-test?token=${token}`;
  if (testType === 'DELTA') return `${PUBLIC_BASE}/quiz-delta?token=${token}`;
  return `${PUBLIC_BASE}/quiz?token=${token}`;
}

function testLabel(testType: TestType): string {
  if (testType === 'PLACEMENT') return 'Placement Test (40 questions — ~10 min)';
  if (testType === 'DELTA') return 'Placement — Part 2 (20 remaining questions — ~5 min)';
  return 'English Level Quiz (20 questions — ~5 min)';
}

function buildEmail(studentName: string, testType: TestType, url: string): { subject: string; html: string } {
  const subject = testType === 'DELTA'
    ? `ULearn — Complete your placement (${studentName})`
    : `ULearn — Your English placement test`;

  const intro = testType === 'DELTA'
    ? `You've already completed our quick online quiz. To finalise your placement for class, please complete the remaining 20 questions below.`
    : `To place you in the right class, please complete our English placement test. It takes about 10 minutes.`;

  const html = `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#1a1d23;">
      <h2 style="margin:0 0 16px;font-size:20px;">Hi ${studentName || 'there'},</h2>
      <p>${intro}</p>
      <p style="margin:24px 0;">
        <a href="${url}" style="display:inline-block;padding:12px 24px;background:#6FB42C;color:#fff;text-decoration:none;border-radius:6px;font-weight:700;">Start the test</a>
      </p>
      <p style="font-size:13px;color:#6b7280;">Once you finish, your level will be recorded automatically. Please complete the test before your course starts.</p>
      <p style="font-size:12px;color:#9ca3af;word-break:break-all;margin-top:20px;">If the button doesn't work, paste this link into your browser:<br>${url}</p>
      <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;">
      <p style="font-size:12px;color:#9ca3af;margin:0;">
        ULearn English Language School — Dublin<br>
        Any issues? Reply to this email and we'll help you.
      </p>
    </div>
  `;
  return { subject, html };
}

export function testScripts(prisma: PrismaClient) {

  /**
   * Issue a token for a student. Picks test type automatically if not specified:
   *   - Student already has quizScore → DELTA (complete the placement)
   *   - Otherwise → PLACEMENT (full 40 Q)
   * Deactivates any prior unused tokens for the same student+type so we always
   * have at most one live token per test type per student.
   */
  async function generateToken(opts: {
    studentId: number;
    testType?: TestType;       // optional — if omitted we pick based on prior scores
    issuedBy?: string;          // sis_users.username
    send?: boolean;             // send email after token creation (default true)
    direct?: boolean;           // use bare lms.ulearnschool.com URL instead of branded Drupal wrapper
  }) {
    const student = await prisma.student.findUnique({
      where: { id: opts.studentId },
      select: { id: true, firstName: true, lastName: true, email: true, quizScore: true },
    });
    if (!student) return { success: false, error: 'Student not found' };
    if (!student.email) return { success: false, error: 'Student has no email address' };

    const testType: TestType = opts.testType || (student.quizScore !== null ? 'DELTA' : 'PLACEMENT');

    // Expire existing unused tokens of the same type — only one live at a time
    await prisma.testAccessToken.updateMany({
      where: { studentId: student.id, testType, usedAt: null, expiresAt: { gt: new Date() } },
      data: { expiresAt: new Date() },
    });

    const token = crypto.randomBytes(32).toString('base64url');
    const expiresAt = new Date(Date.now() + TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000);

    const record = await prisma.testAccessToken.create({
      data: {
        token,
        studentId: student.id,
        testType,
        expiresAt,
        createdBy: opts.issuedBy || null,
      },
    });

    const url = lmsUrlFor(testType, token, opts.direct === true);

    if (opts.send !== false) {
      const { subject, html } = buildEmail(student.firstName || '', testType, url);
      try {
        await sendEmail({
          from: FROM_EMAIL,
          fromName: FROM_NAME,
          to: student.email,
          subject,
          html,
        });
      } catch (e) {
        // Log and continue — the token is created, staff can resend
        console.warn(`[tests] Email send failed for ${student.email}: ${e}`);
        return { success: true, token, url, testType, emailSent: false, emailError: String(e), tokenId: record.id };
      }
    }

    return { success: true, token, url, testType, emailSent: opts.send !== false, tokenId: record.id };
  }

  /**
   * Record the result of a completed test. Called by the LMS app when a student
   * submits. Validates the token, writes score to the appropriate Student column,
   * and for DELTA combines with the existing quizScore to produce the full
   * 40-Q placementTestScore.
   */
  async function recordResult(opts: {
    token: string;
    scorePct: number;
    correct: number;
    wrong: number;
    cefrLevel?: string;
    raw?: any;
  }) {
    const tok = await prisma.testAccessToken.findUnique({
      where: { token: opts.token },
      include: { student: true },
    });
    if (!tok) return { success: false, error: 'Invalid token' };
    if (tok.usedAt) return { success: false, error: 'Token already used' };
    if (tok.expiresAt < new Date()) return { success: false, error: 'Token expired' };

    const scorePct = Math.max(0, Math.min(100, Math.round(opts.scorePct || 0)));
    const correct = Math.max(0, Math.round(opts.correct || 0));
    const wrong = Math.max(0, Math.round(opts.wrong || 0));
    const cefr = (opts.cefrLevel || '').trim().toUpperCase().slice(0, 8);

    // Mark token used + store the raw result
    await prisma.testAccessToken.update({
      where: { id: tok.id },
      data: {
        usedAt: new Date(),
        scorePct,
        correct,
        wrong,
        cefrLevel: cefr || null,
        rawResult: opts.raw || null,
      },
    });

    // Write to the student — depends on test type.
    //   QUIZ       → quizScore + quizDate + currentLevel (if not set)
    //   PLACEMENT  → placementTestScore + placementTestDate + currentLevel (always)
    //   DELTA      → combine with existing quiz score → placementTestScore + currentLevel
    const studentUpdate: any = {};
    const now = new Date();

    if (tok.testType === 'QUIZ') {
      studentUpdate.quizScore = scorePct;
      studentUpdate.quizDate = now;
      if (cefr && !tok.student.currentLevel) studentUpdate.currentLevel = cefr;
    } else if (tok.testType === 'PLACEMENT') {
      studentUpdate.placementTestScore = scorePct;
      studentUpdate.placementTestDate = now;
      if (cefr) studentUpdate.currentLevel = cefr;
    } else if (tok.testType === 'DELTA') {
      // Combine quizScore (20 Q) + delta (20 Q) → 40 Q placement
      const priorQuiz = tok.student.quizScore;
      let combinedPct = scorePct;
      if (priorQuiz != null) {
        // Weighted by equal question count (20 + 20 = 40)
        combinedPct = Math.round((Number(priorQuiz) + scorePct) / 2);
      }
      studentUpdate.placementTestScore = combinedPct;
      studentUpdate.placementTestDate = now;
      if (cefr) studentUpdate.currentLevel = cefr;
    }

    if (Object.keys(studentUpdate).length > 0) {
      await prisma.student.update({ where: { id: tok.studentId }, data: studentUpdate });
    }

    return {
      success: true,
      testType: tok.testType,
      scorePct,
      placementTestScore: studentUpdate.placementTestScore ?? null,
      cefrLevel: cefr || null,
    };
  }

  /**
   * Public lookup (by token) — used by the LMS at page load to confirm the
   * token is valid and hydrate basic student context (first name for the UI).
   */
  async function lookupByToken(token: string) {
    const tok = await prisma.testAccessToken.findUnique({
      where: { token },
      include: { student: { select: { firstName: true } } },
    });
    if (!tok) return { valid: false, error: 'not_found' };
    if (tok.usedAt) return { valid: false, error: 'used' };
    if (tok.expiresAt < new Date()) return { valid: false, error: 'expired' };
    return {
      valid: true,
      testType: tok.testType,
      studentFirstName: tok.student?.firstName || null,
      expiresAt: tok.expiresAt,
    };
  }

  return { generateToken, recordResult, lookupByToken };
}
