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
import { emailTemplateWhere } from './email-templates';
import { sendEmail } from './email';

// Public branded wrapper URLs (Drupal pages on ulearnschool.com that iframe the
// LMS). The Drupal page has an inline script that forwards ?token=… from the
// parent URL into the iframe src, so the LMS app picks it up.
const PUBLIC_BASE = 'https://ulearnschool.com';
// Direct LMS URLs — kept as a fallback route in case Drupal is unavailable
// or if we ever want to skip the marketing wrapper.
const LMS_BASE = 'https://sis.ulearnschool.com/prototype';  // migrated from lms.ulearnschool.com (nginx /prototype/ on the SIS host)

const TOKEN_TTL_DAYS = 30;
const FROM_EMAIL = 'dos@ulearnschool.com';
const FROM_NAME = 'ULearn Academic Team';

// AI Tutor lives in the LMS (lms-api /ai-tutor). The SIS calls it to grade the
// placement writing task (grammar/spelling/syntax + CEFR) and caches the result
// on the token. Server-to-server auth via a shared secret in both .env files.
// NB: read these inside the function, not at module top — app.ts calls
// dotenv.config() in its body (after route modules are imported), so a
// module-top read would capture undefined.

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

// The level-test email now PUSHES the student into their ULearn account rather
// than handing out a direct website link (Neil 2026-07-14): the test lives in
// the app under Learning, and requiring the account gets onboarding + challenges
// all happening in one place. Mirrors the transfer-nudge create-account block.
// House style (Verdana wrap + signature) is applied by sendEmail — body only.
// `_url` (the magic link) is intentionally NOT surfaced here; staff keep it as a
// copy-able fallback in the Send-Test modal.
function buildEmail(studentName: string, testType: TestType, _url: string, studentEmail?: string): { subject: string; html: string } {
  const subject = 'Action Needed: Your ULearn Level Test';
  const intro = testType === 'DELTA'
    ? `You've made a start on your placement — just a few questions remain to finalise your level.`
    : `Before your course starts, you need to complete your English level test so we can place you in the right class.`;
  const P = 'margin:0 0 16px';
  // Account is keyed to the student's on-file email — a mismatch is why the
  // "link sent but nothing arrives" reports happen (registration silently
  // no-ops on an unknown address). Spell out the exact email to use.
  const emailNotice = studentEmail
    ? `<p style="${P};padding:12px 14px;background:#f0f7e8;border-left:3px solid #6FB42C;border-radius:4px">
  <strong>Use this exact email address to create your account:</strong><br>
  <strong style="font-size:15px">${studentEmail}</strong><br>
  <span style="color:#6b7280;font-size:13px">Your ULearn account is linked to this address — signing up with any other email won't work.</span>
</p>`
    : '';
  const html = `
<p style="${P}">Hi ${studentName || 'there'},</p>
<p style="${P}">${intro}</p>
<p style="${P}"><strong>Your level test is waiting in your ULearn account.</strong> Create your account (or log in), open <strong>Learning</strong>, and you'll be ready to sit it — it takes about 10 minutes.</p>
${emailNotice}
<p style="${P}">Install the ULearn app or use your browser:</p>
<ul style="${P}">
  <li style="margin:0 0 10px"><strong>Android</strong> — install from
    <a href="https://play.google.com/store/apps/details?id=com.ulearnschool.app&amp;hl=en" style="color:#0091ae"><strong>Google Play</strong></a><br>
    <a href="https://play.google.com/store/apps/details?id=com.ulearnschool.app&amp;hl=en"><img src="https://sis.ulearnschool.com/sis/launch/google-play-badge.png" alt="Get it on Google Play" width="180" style="margin-top:6px"></a>
  </li>
  <li style="margin:0 0 10px"><strong>iOS</strong> — coming soon (use browser login for now).</li>
  <li style="margin:0 0 10px"><strong>Desktop / Browser</strong> —
    <a href="https://sis.ulearnschool.com/sis/register" style="color:#0091ae"><strong>Create Account</strong></a>.
    Click <strong>Create Account</strong>, then the verification email we send you, set a password, and open <strong>Learning</strong> to sit your test.
  </li>
</ul>
<p style="${P}">Once you finish, your level is recorded automatically. Please complete it before your course starts.</p>`;
  return { subject, html };
}

// Level-test onboarding email. The copy now lives in the editable DB template
// 'Level-Test' (Communications module) so a human and the automated Send-Test
// flow view / edit / send the exact same email. Renders the same {{token}} /
// {if} grammar the Communications composer uses, keyed on the standard
// student.* tokens so it renders identically from either path. Falls back to
// the inline buildEmail() above if the template row is ever missing. (Neil 2026-09-24)
const LEVEL_TEST_SLUG = 'Level-Test';
async function renderLevelTestEmail(prisma: PrismaClient, firstName: string, testType: TestType, studentEmail?: string): Promise<{ subject: string; html: string }> {
  try {
    const tpl = await prisma.documentTemplate.findFirst({
      where: emailTemplateWhere(LEVEL_TEST_SLUG, { templateType: 'email', active: true }),
      select: { subject: true, htmlTemplate: true },
    });
    if (tpl?.htmlTemplate) {
      const tokens: Record<string, string> = {
        'student.first_name': firstName || 'there',
        'student.email': studentEmail || '',
      };
      const render = (s: string) => String(s || '')
        .replace(/\{if\s+([a-z0-9_.]+)\}([\s\S]*?)\{\/if\}/gi, (_m, k, c) => tokens[String(k).trim()] ? c : '')
        .replace(/\{\{([^}]+)\}\}/g, (_m, k) => { const v = tokens[String(k).trim()]; return v != null ? String(v) : ''; });
      return { subject: render(tpl.subject || 'Action Needed: Your ULearn Level Test'), html: render(tpl.htmlTemplate) };
    }
  } catch (e: any) {
    console.warn('[tests] Level-Test template render failed — using inline fallback:', e?.message || e);
  }
  return buildEmail(firstName, testType, '', studentEmail);
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
      const { subject, html } = await renderLevelTestEmail(prisma, student.firstName || '', testType, student.email || undefined);
      try {
        const sent: any = await sendEmail({
          from: FROM_EMAIL,
          fromName: FROM_NAME,
          to: student.email,
          subject,
          html,
        });
        // Log to the comms thread so the magic-link send is visible like any
        // other student email — not a "raw send into the ether".
        await prisma.emailLog.create({
          data: {
            studentId: student.id,
            fromEmail: FROM_EMAIL,
            toEmail: student.email,
            subject,
            bodyHtml: html,
            gmailMessageId: sent?.messageId || null,
            gmailThreadId: sent?.threadId || null,
            sentBy: opts.issuedBy || FROM_EMAIL,
          },
        }).catch(() => {});
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
    writingPrompt?: string;
    writingResponse?: string;
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
    // Writing only applies to the PLACEMENT variant; we still accept and save
    // it if it arrives on a different type so we don't silently lose data.
    const writingPrompt   = (opts.writingPrompt   || '').trim().slice(0, 500)  || null;
    const writingResponse = (opts.writingResponse || '').trim().slice(0, 8000) || null;

    // Mark token used + store the raw result + writing task (placement only)
    await prisma.testAccessToken.update({
      where: { id: tok.id },
      data: {
        usedAt: new Date(),
        scorePct,
        correct,
        wrong,
        cefrLevel: cefr || null,
        rawResult: opts.raw || null,
        writingPrompt,
        writingResponse,
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
      if (cefr) {
        studentUpdate.currentLevel = cefr;
        // Frozen historical snapshot — captures the CEFR level AT placement
        // time so later currentLevel edits don't rewrite the entry marker.
        studentUpdate.placementTestLevel = cefr;
      }
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
      if (cefr) {
        studentUpdate.currentLevel = cefr;
        studentUpdate.placementTestLevel = cefr;
      }
    }

    if (Object.keys(studentUpdate).length > 0) {
      await prisma.student.update({ where: { id: tok.studentId }, data: studentUpdate });

      // Authoritative-level propagation (Neil, Jun 2026): the placement test is the
      // source of truth for the student's level, so push the new CEFR onto their
      // active booking course(s) too. The LoA reads booking_course.level (falling
      // back to currentLevel), so without this the letter keeps showing the A2
      // default that the invoice-created webhook seeds on the first booking. Only a
      // FULL placement (PLACEMENT/DELTA = quiz+delta combined) is authoritative — a
      // quiz-only result stays a partial display signal and doesn't overwrite here.
      // Overwrite only courses still on the default (level null, or == the prior
      // currentLevel we just replaced) so a deliberately hand-set level isn't lost.
      if (cefr && (tok.testType === 'PLACEMENT' || tok.testType === 'DELTA')) {
        const priorLevel = tok.student.currentLevel || null;
        const orLevels: any[] = [{ level: null }];
        if (priorLevel) orLevels.push({ level: priorLevel });
        try {
          const upd = await prisma.bookingCourse.updateMany({
            where: {
              active: true,
              booking: { studentId: tok.studentId, status: { notIn: ['CANCELLED'] } },
              OR: orLevels,
            } as any,
            data: { level: cefr } as any,
          });
          if (upd.count) console.log(`[placement] student ${tok.studentId}: overwrote ${upd.count} booking-course level(s) → ${cefr} (was null/${priorLevel || '—'})`);
        } catch (e: any) { console.error(`[placement] booking-level propagation failed for student ${tok.studentId}: ${e.message}`); }
      }

      // Auto-derive ILEP code for any AY booking course now that we know
      // the student's level. Fire-and-forget — won't block test submission
      // if the deriver throws (e.g. course-name unfamiliar).
      try {
        const { autoFillIlepForStudent } = await import('./ilep-deriver');
        autoFillIlepForStudent(prisma, tok.studentId).catch(() => {});
      } catch (e) { console.error('[ilep-deriver] import failed', e); }
      // Push level + quiz_score back to HubSpot Contact (fire-and-forget).
      // Almost every SIS student arrived via HubSpot first, so the ID is set;
      // we fall back to an email search when it isn't. Errors are logged but
      // never bubble — test submission must not depend on HubSpot uptime.
      try {
        const { pushStudentTestResultToHubspot } = await import('./hubspot-contact-push');
        pushStudentTestResultToHubspot(prisma, tok.studentId).catch(() => {});
      } catch (e) { console.error('[hubspot-push] import failed', e); }
    }

    // AI Tutor: grade the writing task (grammar/spelling/syntax + CEFR) via the
    // LMS. Fire-and-forget so it never slows or breaks the (now durable) submit —
    // the DOS review can also trigger/refresh it manually.
    if (tok.testType === 'PLACEMENT' && writingResponse) {
      assessWritingForStudent(tok.studentId, { force: true }).catch(e =>
        console.error(`[ai-tutor] auto-assess failed for student ${tok.studentId}:`, e?.message || e));
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
   * Grade a student's most recent placement writing task via the LMS AI Tutor
   * and cache the result on the token (writing_assessment). Idempotent: returns
   * the cached assessment unless force=true. Safe to call fire-and-forget — every
   * failure path returns a reason rather than throwing.
   */
  async function assessWritingForStudent(studentId: number, opts: { force?: boolean } = {}) {
    const tok = await prisma.testAccessToken.findFirst({
      where: { studentId, testType: { in: ['PLACEMENT', 'DELTA'] }, usedAt: { not: null } },
      orderBy: { usedAt: 'desc' },
    });
    if (!tok) return { success: false, error: 'no_placement' };
    if (!tok.writingResponse || !tok.writingResponse.trim()) return { success: false, error: 'no_writing' };
    if (tok.writingAssessment && !opts.force) return { success: true, assessment: tok.writingAssessment, cached: true };

    const AI_INTERNAL_KEY = process.env.AI_INTERNAL_KEY || '';
    const LMS_AI_URL = process.env.LMS_AI_URL || 'https://sis.ulearnschool.com/lms-api';
    if (!AI_INTERNAL_KEY) return { success: false, error: 'AI_INTERNAL_KEY not set' };

    let res: any;
    try {
      res = await fetch(`${LMS_AI_URL}/ai-tutor/assess-writing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-ai-internal-key': AI_INTERNAL_KEY },
        body: JSON.stringify({
          text: tok.writingResponse,
          taskPrompt: tok.writingPrompt || undefined,
          targetLevel: tok.cefrLevel || undefined,
        }),
      });
    } catch (e: any) {
      return { success: false, error: 'lms_unreachable: ' + (e?.message || e) };
    }
    if (!res.ok) {
      const t = await res.text().catch(() => '');
      return { success: false, error: `lms_${res.status}: ${String(t).slice(0, 200)}` };
    }
    const body: any = await res.json();
    if (!body?.success || !body.assessment) return { success: false, error: body?.error || 'no_assessment' };

    await prisma.testAccessToken.update({
      where: { id: tok.id },
      data: { writingAssessment: body.assessment } as any,
    });
    return { success: true, assessment: body.assessment, tokenId: tok.id };
  }

  /**
   * Admin/DOS read of a student's most recent placement-class test (PLACEMENT
   * or DELTA, whichever is newer). Returns everything needed to render the
   * review screen: score, CEFR, per-question Q&A from rawResult, and the
   * writing task prompt + response. QUIZ-only students return null (we don't
   * surface marketing-quiz results to DOS — only the real placement gates).
   */
  async function getPlacementForStudent(studentId: number) {
    const tok = await prisma.testAccessToken.findFirst({
      where: {
        studentId,
        testType: { in: ['PLACEMENT', 'DELTA'] },
        usedAt: { not: null },
      },
      orderBy: { usedAt: 'desc' },
      include: {
        student: { select: { id: true, firstName: true, lastName: true, email: true, currentLevel: true, placementTestScore: true, placementTestDate: true } },
      },
    });
    if (!tok) return { success: true, found: false };
    return {
      success: true,
      found: true,
      tokenId: tok.id,
      testType: tok.testType,
      takenAt: tok.usedAt,
      scorePct: tok.scorePct,
      correct: tok.correct,
      wrong: tok.wrong,
      cefrLevel: tok.cefrLevel,
      writingPrompt: tok.writingPrompt,
      writingResponse: tok.writingResponse,
      writingAssessment: tok.writingAssessment,
      raw: tok.rawResult,
      student: tok.student,
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

  // Send/completion state for the admin "Send Test" button: how many times a
  // test was issued, when last, and whether the student has since COMPLETED one
  // (drives the greyed "already sent" colour/tooltip + the re-send guardrail).
  async function testStatus(studentId: number) {
    const [sendCount, last, student] = await Promise.all([
      prisma.testAccessToken.count({ where: { studentId } }),
      prisma.testAccessToken.findFirst({ where: { studentId }, orderBy: { createdAt: 'desc' }, select: { createdAt: true, createdBy: true } }),
      prisma.student.findUnique({ where: { id: studentId }, select: { placementTestLevel: true, placementTestScore: true, placementTestDate: true, quizScore: true } }),
    ]);
    // FULLY assessed = the full 40 done (PLACEMENT in one go, or QUIZ+DELTA
    // merged) → placementTestLevel is set. A quiz-only score does NOT count
    // (the DELTA is still the normal next send) — so no guardrail for that.
    const completed = !!(student && student.placementTestLevel);
    return {
      sendCount,
      lastSentAt: last?.createdAt || null,
      lastSentBy: last?.createdBy || null,
      completed,
      cefrLevel: student?.placementTestLevel || null,
      scorePct: student?.placementTestScore ?? null,
      completedAt: student?.placementTestDate || null,
      quizOnly: !!(student && student.quizScore != null && !student.placementTestLevel),
    };
  }

  // Student-app placement GATE: what to surface in the Learning panel for the
  // logged-in student. If they've completed the full placement (placementTestLevel
  // set) → completed:true, no url. Otherwise returns an embeddable same-origin
  // test URL — DELTA if they already did the 20-Q quiz, else the full PLACEMENT.
  // Reuses a live unused token of that type if one exists (no churn); only mints
  // (without emailing) when none is available.
  async function placementGateForStudent(studentId: number) {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      select: { id: true, email: true, quizScore: true, placementTestLevel: true },
    });
    if (!student) return { completed: false, testType: null, url: null, error: 'not_found' };
    if (student.placementTestLevel) return { completed: true, testType: null, url: null };

    const testType: TestType = student.quizScore !== null ? 'DELTA' : 'PLACEMENT';
    const existing = await prisma.testAccessToken.findFirst({
      where: { studentId, testType, usedAt: null, expiresAt: { gt: new Date() } },
      orderBy: { id: 'desc' },
      select: { token: true },
    });
    let token = existing?.token || null;
    if (!token) {
      const gen: any = await generateToken({ studentId, testType, send: false, direct: true, issuedBy: 'student-app' });
      if (!gen.success) return { completed: false, testType, url: null, error: gen.error };
      token = gen.token;
    }
    return { completed: false, testType, url: lmsUrlFor(testType, token!, true) };
  }

  // Admin: wipe a student's placement/quiz so the assessment test surfaces
  // again (in the app gate + a fresh Send Test). Leaves currentLevel untouched
  // (class/LMS level shouldn't be disturbed by a test reset). Expires any live
  // unused tokens so the next surface mints a clean one.
  async function resetPlacement(studentId: number) {
    const student = await prisma.student.findUnique({ where: { id: studentId }, select: { id: true } });
    if (!student) return { success: false, error: 'Student not found' };
    await prisma.student.update({
      where: { id: studentId },
      data: { quizScore: null, quizDate: null, placementTestScore: null, placementTestDate: null, placementTestLevel: null },
    });
    await prisma.testAccessToken.updateMany({
      where: { studentId, usedAt: null, expiresAt: { gt: new Date() } },
      data: { expiresAt: new Date() },
    });
    return { success: true };
  }

  // Admin manual placement — for the (rare) case where a student was placed off
  // the app (e.g. a paper test, or a level agreed by the DOS) and there's no
  // online result to sync. Stamps the placement LEVEL (+ currentLevel + date) so
  // day-to-day staff see it; leaves placementTestScore null, which the UI shows
  // as "set manually" (no per-question review to open). Not a graded test.
  async function setManualPlacement(studentId: number, level: string) {
    const lvl = (level || '').trim().toUpperCase();
    if (!/^(A[012]|B[12]|C[12])$/.test(lvl)) return { success: false, error: 'A valid CEFR level (A0–C2) is required' };
    const student = await prisma.student.findUnique({ where: { id: studentId }, select: { id: true } });
    if (!student) return { success: false, error: 'Student not found' };
    await prisma.student.update({
      where: { id: studentId },
      data: { placementTestLevel: lvl, currentLevel: lvl, placementTestDate: new Date() },
    });
    return { success: true, level: lvl };
  }

  // ── In-progress autosave (PLACEMENT only) ──────────────────────────────────
  // The client throttle-POSTs its state (question index, answers-so-far, the
  // writing text) as the student types, so an unfinished attempt survives a
  // browser close, a new token, or a different device. Resume-only — never
  // trusted for grading. No-op for QUIZ/DELTA and once the token is submitted.
  async function recordDraft(token: string, draft: any) {
    if (!token) return { success: false, error: 'token required' };
    const tok = await prisma.testAccessToken.findUnique({
      where: { token }, select: { id: true, testType: true, usedAt: true },
    });
    if (!tok) return { success: false, error: 'Invalid token' };
    if (tok.testType !== 'PLACEMENT') return { success: true, skipped: 'not_placement' };
    if (tok.usedAt) return { success: true, skipped: 'already_submitted' };
    await prisma.testAccessToken.update({
      where: { id: tok.id },
      data: { draft: draft ?? undefined, draftUpdatedAt: new Date() },
    });
    return { success: true };
  }

  // Return the most-recent UNSUBMITTED placement draft for the STUDENT behind this
  // token — so a fresh token (re-sent link / new device / new login) resumes the
  // same in-progress answer instead of orphaning it.
  async function loadDraft(token: string) {
    if (!token) return { success: false, draft: null };
    const tok = await prisma.testAccessToken.findUnique({
      where: { token },
      select: { studentId: true, student: { select: { placementTestLevel: true } } },
    });
    if (!tok) return { success: false, draft: null };
    // Already placed → nothing to resume (avoids re-offering a draft left on an
    // earlier unsubmitted token after they completed a later attempt).
    if (tok.student?.placementTestLevel) return { success: true, draft: null };
    const latest = await prisma.testAccessToken.findFirst({
      where: { studentId: tok.studentId, testType: 'PLACEMENT', usedAt: null, draftUpdatedAt: { not: null } },
      orderBy: { draftUpdatedAt: 'desc' },
      select: { draft: true, draftUpdatedAt: true },
    });
    return { success: true, draft: latest?.draft ?? null, updatedAt: latest?.draftUpdatedAt ?? null };
  }

  /**
   * Attach the writing task to a token whose SCORE was already submitted at
   * questions-end (Paul's placement-not-linking fix, 2026-08-13). The CEFR level
   * comes from the questions, so the test now submits the score the moment the
   * questions finish — the writing is optional and posted here afterwards. This
   * deliberately does NOT gate on usedAt (the token is already used by then) and
   * never touches the score/level — it only saves the writing + kicks the AI
   * assessment. Empty writing is a no-op success (student skipped it).
   */
  async function recordWriting(token: string, opts: { writingPrompt?: string; writingResponse?: string }) {
    const tok = await prisma.testAccessToken.findUnique({ where: { token }, select: { id: true, studentId: true, testType: true } });
    if (!tok) return { success: false, error: 'Invalid token' };
    const writingPrompt = (opts.writingPrompt || '').trim().slice(0, 500) || null;
    const writingResponse = (opts.writingResponse || '').trim().slice(0, 8000) || null;
    if (!writingResponse) return { success: true, skipped: 'empty' };
    await prisma.testAccessToken.update({ where: { id: tok.id }, data: { writingPrompt, writingResponse } });
    if (tok.testType === 'PLACEMENT') {
      assessWritingForStudent(tok.studentId, { force: true }).catch(e =>
        console.error(`[ai-tutor] auto-assess (writing-attach) failed for student ${tok.studentId}:`, e?.message || e));
    }
    return { success: true };
  }

  return { generateToken, recordResult, recordWriting, lookupByToken, getPlacementForStudent, testStatus, placementGateForStudent, resetPlacement, assessWritingForStudent, recordDraft, loadDraft, setManualPlacement };
}
