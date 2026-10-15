// ── Exam Booking module — business logic ─────────────────────────────────────
// ULearn is the registration FACILITATOR for end-of-programme exams at CES
// Dublin. A student picks a published sitting in the app and confirms; we email
// CES (student CC'd) to initiate registration — CES confirms the actual booking
// and handles payment. A request is NOT a confirmed registration.
// Spec: sis/.claude/projects/exam-calendar.md. Mirrors the holiday self-service
// shape in scripts/student.ts (validate → write → notify, email non-fatal) and
// the on-box documentScripts(prisma) factory pattern so the hub can call it too.
import type { PrismaClient } from '../generated/prisma/client';
import { sendStudentEmail } from '../routes/email';
import { applyTemplateTokens } from './render-template';
import { emailTemplateWhere } from './email-templates';
import { getExamConfig } from '../lib/exam-config';
import { irishPublicHolidays } from './irish-holidays';

type ExamCode = 'B1_PRELIMINARY' | 'B2_FIRST' | 'C1_ADVANCED' | 'IELTS_GT';

const EXAM_TITLE: Record<ExamCode, string> = {
  B1_PRELIMINARY: 'Cambridge B1 Preliminary (PET)',
  B2_FIRST: 'Cambridge B2 First (FCE)',
  C1_ADVANCED: 'Cambridge C1 Advanced (CAE)',
  IELTS_GT: 'IELTS General Training',
};
const EXAM_KIND: Record<ExamCode, 'cambridge' | 'ielts'> = {
  B1_PRELIMINARY: 'cambridge', B2_FIRST: 'cambridge', C1_ADVANCED: 'cambridge', IELTS_GT: 'ielts',
};
// Indicative results turnaround (weeks) per Exam-Renewal-Protocol.md — IELTS on
// computer 1–5 days (≤1wk); Cambridge digital 5–10 working days (~2wk). CES
// sittings are computer-delivered; paper-based (4–6wk) isn't modelled separately.
// Used only to estimate "results expected by" + a soft deadline warning — never
// a hard block.
const RESULT_TURNAROUND_WEEKS: Record<ExamCode, number> = {
  IELTS_GT: 1, B1_PRELIMINARY: 2, B2_FIRST: 2, C1_ADVANCED: 2,
};

const LEVEL_ORDER = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const levelRank = (l?: string | null) => LEVEL_ORDER.indexOf((l || '').toUpperCase());
const B1_RANK = LEVEL_ORDER.indexOf('B1');

// Statuses that mean "the student has acted" — the dashboard reminder hides and
// no second active request is allowed. (REQUEST_PENDING = started but the CES
// send didn't go through yet, so it still counts as active/one-per-enrolment but
// does NOT satisfy the reminder.)
const ACTIVE_STATUSES = ['REQUEST_PENDING', 'REQUESTED', 'CONFIRMED', 'SAT', 'RESULTS_RECEIVED', 'COMPLETED', 'CHANGE_REQUESTED', 'NEEDS_ATTENTION'];
const SATISFIED_STATUSES = ['REQUESTED', 'CONFIRMED', 'SAT', 'RESULTS_RECEIVED', 'COMPLETED', 'CHANGE_REQUESTED', 'NEEDS_ATTENTION'];

const DAY = 86400000;
const WEEK = 7 * DAY;
const iso = (d: any) => (d ? new Date(d).toISOString().slice(0, 10) : null);
const addWeeksUtc = (d: Date, w: number) => new Date(d.getTime() + w * WEEK);

function fmtLongDate(d: Date): string {
  // UTC so a @db.Date midnight never drifts a day (reference_utc_date_math).
  return new Intl.DateTimeFormat('en-IE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(d);
}

// Working days between two dates (exclusive of weekends + Irish bank holidays).
function workingDaysSince(from: Date, now: Date): number {
  if (now <= from) return 0;
  let count = 0;
  const cur = new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate()));
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const holsByYear = new Map<number, Set<string>>();
  while (cur < end) {
    cur.setUTCDate(cur.getUTCDate() + 1);
    const dow = cur.getUTCDay();
    if (dow === 0 || dow === 6) continue;
    const y = cur.getUTCFullYear();
    if (!holsByYear.has(y)) holsByYear.set(y, irishPublicHolidays(y));
    if (holsByYear.get(y)!.has(cur.toISOString().slice(0, 10))) continue;
    count++;
  }
  return count;
}

// The single "learning-outcome" exam hard-mapped to a student's recorded level
// (Neil 2026-10-13): the app pre-populates this one exam; if the student thinks
// it's wrong they contact us (we get involved). C1/C2 → Advanced, B2 → First,
// everything at or below B1 (incl. unknown) → Preliminary (the lowest offered).
function alignedExamForLevel(level?: string | null): ExamCode {
  const r = levelRank(level);
  if (r >= LEVEL_ORDER.indexOf('C1')) return 'C1_ADVANCED';
  if ((level || '').toUpperCase() === 'B2') return 'B2_FIRST';
  return 'B1_PRELIMINARY';
}

export function examScripts(prisma: PrismaClient) {
  const isAyCourse = (c: any) =>
    c.holidayWks != null || /academic year|life ?pass|renewal/i.test(c.name || '') || c.isRenewal;

  // Resolve the student's current Academic Year enrolment (BookingCourse) + the
  // owning booking, whether they prepaid an exam fee, and programme context.
  async function resolveEnrolment(studentId: number) {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      select: { id: true, firstName: true, lastName: true, email: true, currentLevel: true, visaUntil: true, visaStatus: true },
    });
    if (!student) return { student: null as any, booking: null as any, course: null as any, hasExamFee: false };

    const bookings = await prisma.booking.findMany({
      where: { studentId, status: { not: 'CANCELLED' } },
      orderBy: { serviceStart: 'desc' },
      select: {
        id: true,
        extras: { where: { extraType: 'EXAM_FEE', active: true }, select: { id: true, details: true } },
        courses: { select: { id: true, name: true, category: true, level: true, startDate: true, endDate: true, holidayWks: true, isRenewal: true } },
      },
    });

    const now = Date.now();
    let booking: any = null, course: any = null;
    const candidates: Array<{ b: any; c: any }> = [];
    for (const b of bookings) for (const c of b.courses) if (isAyCourse(c) && c.startDate) candidates.push({ b, c });
    // running today → else most-recent started → else earliest
    const running = candidates.find(({ c }) => c.endDate && +new Date(c.startDate) <= now && now <= +new Date(c.endDate) + DAY);
    const started = [...candidates].filter(({ c }) => +new Date(c.startDate) <= now).sort((a, z) => +new Date(z.c.startDate) - +new Date(a.c.startDate))[0];
    const earliest = [...candidates].sort((a, z) => +new Date(a.c.startDate) - +new Date(z.c.startDate))[0];
    const picked = running || started || earliest || null;
    if (picked) { booking = picked.b; course = picked.c; }
    const hasExamFee = !!booking?.extras?.length;
    return { student, booking, course, hasExamFee, examFeeDetails: booking?.extras?.[0]?.details || null };
  }

  // Core eligibility/state for a student (no sittings list). Used by /me and as
  // the base for examOptions.
  async function eligibility(studentId: number) {
    const cfg = getExamConfig();
    const { student, booking, course } = await resolveEnrolment(studentId);
    if (!student || !course) {
      return { relevant: false, visible: false, satisfied: false, reminder: null as any };
    }
    const courseStart = new Date(course.startDate);
    const courseEnd = course.endDate ? new Date(course.endDate) : null;         // reflects holiday shunts
    const programmeWeek = Math.floor((Date.now() - +courseStart) / WEEK) + 1;
    // Outer exam limit = the student's ACTUAL immigration-permission expiry
    // (Student.visaUntil). The ILEP/TrustEd protocol is explicit: do NOT compute
    // this as course start + 35 weeks (Exam-Renewal-Protocol.md §5 + validation).
    // The 35-week figure is only a FALLBACK when visaUntil isn't recorded yet.
    const permissionFromVisa = student.visaUntil ? new Date(student.visaUntil) : null;
    const permissionEnd = permissionFromVisa || addWeeksUtc(courseStart, 35);
    const permissionSource = permissionFromVisa ? 'visaUntil' : 'course+35w (fallback)';
    const level = student.currentLevel || null;
    const alignedCode = alignedExamForLevel(level);          // level-aligned learning-outcome exam
    // The level-aligned Cambridge exam is the default; IELTS General Training is
    // an approved PARALLEL option offered alongside it (the protocol and student
    // FAQ both list IELTS as an approved exam). IELTS is band-scored with no level
    // floor, and the sitting is months after today's recorded level, so it is not
    // level-gated — the student (with our confirmation) chooses which to sit.
    const codes: ExamCode[] = [alignedCode];
    if (alignedCode !== 'IELTS_GT') codes.push('IELTS_GT');

    const existing = await prisma.studentExamBooking.findMany({
      where: { studentId, bookingCourseId: course.id },
      orderBy: { createdAt: 'desc' },
      select: { id: true, status: true, examSittingId: true, requestedAt: true },
    });
    const active = existing.find((e) => ACTIVE_STATUSES.includes(e.status)) || null;
    const satisfied = existing.some((e) => SATISFIED_STATUSES.includes(e.status));
    const visible = programmeWeek >= cfg.eligibilityWeek;

    const reminder = (visible && !satisfied)
      ? { active: true, message: 'Book your end-of-programme exam.' }
      : null;

    return {
      relevant: true, visible, satisfied,
      programmeWeek, eligibilityWeek: cfg.eligibilityWeek,
      level, eligibleExamCodes: codes,
      alignedExamCode: alignedCode, alignedExamTitle: EXAM_TITLE[alignedCode],
      courseName: course.name, courseEnd: iso(courseEnd), permissionEnd: iso(permissionEnd), permissionSource,
      activeBooking: active ? { id: active.id, status: active.status } : null,
      reminder,
    };
  }

  // Full picker payload: eligible exams + ranked suitable sittings.
  async function options(studentId: number) {
    const cfg = getExamConfig();
    const base = await eligibility(studentId);
    if (!base.relevant) return { ...base, exams: [], sittings: [] };

    const codes = base.eligibleExamCodes as ExamCode[];
    const exams = codes.map((code) => ({ code, title: EXAM_TITLE[code], kind: EXAM_KIND[code] }));

    const courseEnd = base.courseEnd ? new Date(base.courseEnd) : null;
    const permissionEnd = base.permissionEnd ? new Date(base.permissionEnd) : null;
    const renewalBufferMs = cfg.resultLeadWeeks * WEEK;   // soft renewal-prep buffer, not exam turnaround

    // Regulatory bookends, aligned to Exam-Renewal-Protocol.md:
    //   earliest = course end (inclusive) — a safe proxy for "after 25 weeks of
    //              tuition delivered"; courseEnd already reflects holiday shunts.
    //   latest   = the student's ACTUAL immigration-permission expiry (hard):
    //              the exam cannot be sat after the permission ends. This is
    //              permissionEnd (= Student.visaUntil, else the 35-week fallback),
    //              NOT "course start + 35 weeks minus a results lead".
    // The result-turnaround lead is a SOFT buffer, never a hard cut: a sitting
    // whose results would land after the permission expires is still SHOWN, with
    // a warning + marked not-suitable, so the picker warns + ranks + allows rather
    // than hiding it (protocol §3/§12). The earlier build subtracted the lead from
    // the outer limit AND used course-start+35w, collapsing the window to ~2 weeks.
    const earliest = courseEnd;                                           // inclusive
    const latest = permissionEnd;                                         // inclusive — hard outer = permission expiry
    const floorMs = Math.max(Date.now(), earliest ? +earliest : 0);       // never list a past date

    const rows = codes.length ? await prisma.examSitting.findMany({
      where: {
        examCode: { in: codes as any }, status: 'PUBLISHED',
        examDate: { gte: new Date(floorMs), ...(latest ? { lte: latest } : {}) },
      },
      orderBy: { examDate: 'asc' },
      select: { id: true, examCode: true, provider: true, centreId: true, examDate: true, startTime: true, endTime: true, feeEur: true, notes: true },
    }) : [];

    const sittings = rows.map((s) => {
      const d = new Date(s.examDate);
      const code = s.examCode as ExamCode;
      // Honest results estimate = sitting + this exam's own turnaround (KB table),
      // NOT the renewal buffer — so an IELTS date (~days) isn't wrongly flagged.
      const resultsBy = new Date(+d + (RESULT_TURNAROUND_WEEKS[code] ?? 2) * WEEK);
      const warnings: string[] = [];
      let suitable = true;
      if (permissionEnd && +resultsBy > +permissionEnd) {
        // Genuine problem: results won't be issued before the permission expires.
        suitable = false;
        warnings.push('Results are expected after your immigration permission expires — they may not be ready in time. Check with Student Support before choosing this date.');
      } else if (permissionEnd && +resultsBy > +permissionEnd - renewalBufferMs) {
        // Results land before expiry but inside the recommended renewal-prep
        // buffer — allowed, just tight. Soft note only (stays suitable).
        warnings.push('This date leaves limited time to use your results for an immigration renewal — pick an earlier date if you can.');
      }
      return {
        id: s.id, examCode: code, title: EXAM_TITLE[code],
        date: iso(d), dateLong: fmtLongDate(d), time: s.startTime || null, endTime: s.endTime || null,
        centre: 'Centre of English Studies, Dublin',
        feeEur: s.feeEur != null ? Number(s.feeEur) : null,
        suitable, warnings, notes: s.notes || null,
        resultsExpectedBy: iso(resultsBy),
      };
    });

    return {
      ...base, exams, sittings,
      earliestExamDate: iso(earliest), latestExamDate: iso(latest),
      recommendedResultsBy: iso(permissionEnd),
    };
  }

  // Student confirms a sitting → create the booking, email CES (student CC'd),
  // track the Gmail thread. Email failure is non-fatal (row stays REQUEST_PENDING
  // and staff see it) — mirrors requestHoliday.
  async function createExamRequest(studentId: number | undefined, data: { examSittingId?: number; consent?: boolean }) {
    if (!studentId) return { success: false, error: 'No student session' };
    if (!data?.consent) return { success: false, error: 'Please confirm you want ULearn to request this sitting.' };
    const examSittingId = Number(data.examSittingId);
    if (!Number.isInteger(examSittingId)) return { success: false, error: 'Pick an examination sitting.' };

    const cfg = getExamConfig();
    const { student, booking, course, hasExamFee } = await resolveEnrolment(studentId);
    if (!student || !course) return { success: false, error: 'No Academic Year course on file — exams apply to Academic Year students.' };

    const programmeWeek = Math.floor((Date.now() - +new Date(course.startDate)) / WEEK) + 1;
    if (programmeWeek < cfg.eligibilityWeek) {
      return { success: false, error: `Exam booking opens at week ${cfg.eligibilityWeek} of your programme (you're in week ${Math.max(1, programmeWeek)}).` };
    }

    // One active request per enrolment.
    const existingActive = await prisma.studentExamBooking.findFirst({
      where: { studentId, bookingCourseId: course.id, status: { in: ACTIVE_STATUSES as any } },
      select: { id: true, status: true },
    });
    if (existingActive) return { success: false, error: 'You already have an active exam request. To change it, cancel the existing one first.' };

    const sitting = await prisma.examSitting.findUnique({ where: { id: examSittingId } });
    if (!sitting || sitting.status !== 'PUBLISHED') return { success: false, error: 'That sitting is no longer available. Please pick another.' };

    // Payment arrangement.
    // V1 (default, cfg.directPayEnabled=false): ULearn settles with CES for EVERY
    //   student — the exam fee was already paid to us (bundled into the course
    //   price, or as an EXAM_FEE extra), so we never send a student to pay the
    //   centre directly.
    // V2 (cfg.directPayEnabled=true): honour the per-booking signal — an EXAM_FEE
    //   extra ⇒ PREPAID (we pay CES); no extra ⇒ the newer cohort that wasn't
    //   charged up front ⇒ DIRECT (student pays CES).
    // V2 is gated because most legacy AY bookings carry NO itemised EXAM_FEE extra
    // yet DID pay (bundled) — flipping the branch on before that population clears
    // would wrongly tell ~2,000 paid students to pay CES again.
    const paymentArrangement = (cfg.directPayEnabled && !hasExamFee) ? 'DIRECT' : 'PREPAID';
    const code = sitting.examCode as ExamCode;

    // Create the row first (REQUEST_PENDING) so its id is the ULearn reference.
    const row = await prisma.studentExamBooking.create({
      data: {
        studentId, bookingCourseId: course.id, examSittingId: sitting.id,
        status: 'REQUEST_PENDING', paymentArrangement,
        studentConfirmedAt: new Date(),
        choiceSnapshot: {
          examCode: code, title: EXAM_TITLE[code], provider: sitting.provider,
          examDate: iso(sitting.examDate), startTime: sitting.startTime, centre: sitting.centreId,
          feeEur: sitting.feeEur != null ? Number(sitting.feeEur) : null,
        } as any,
      },
    });
    await prisma.examBookingEvent.create({ data: { examBookingId: row.id, eventType: 'status_change', toStatus: 'REQUEST_PENDING', actor: 'student-app', detail: `Selected ${EXAM_TITLE[code]} on ${iso(sitting.examDate)} (${paymentArrangement})` } });

    const ref = `EX-${row.id}`;

    // Blocked if sends disarmed or CES address not yet verified/configured — the
    // request is still tracked; staff complete it from the admin UI.
    if (!cfg.sendsArmed || !cfg.cesEmail) {
      await prisma.examBookingEvent.create({ data: { examBookingId: row.id, eventType: 'error', detail: !cfg.cesEmail ? 'CES email not configured — send skipped' : 'Sends disarmed — send skipped' } });
      return { success: true, bookingId: row.id, status: 'REQUEST_PENDING', pendingSend: true, reference: ref,
        message: 'Your request is recorded. Our team will finalise it with the exam centre.' };
    }

    // Render the right CES template (prepaid vs direct) + send from success@,
    // student CC'd. threadId → emailThreadId so replies stay on one thread.
    try {
      const slug = paymentArrangement === 'PREPAID' ? 'CES-Exam-Request-Prepaid' : 'CES-Exam-Request-DirectPay';
      const tpl = await prisma.documentTemplate.findFirst({
        where: emailTemplateWhere(slug, { templateType: 'email', active: true }),
        select: { id: true, subject: true, htmlTemplate: true },
      });
      if (!tpl?.htmlTemplate) throw new Error(`CES template "${slug}" missing`);
      const tokens: Record<string, any> = {
        'student.first_name': student.firstName || 'there',
        'student.full_name': `${student.firstName || ''} ${student.lastName || ''}`.trim() || `Student #${student.id}`,
        'exam.title': EXAM_TITLE[code],
        'exam.date': fmtLongDate(new Date(sitting.examDate)),
        'exam.time': sitting.startTime || '',
        'ulearn.ref': ref,
      };
      const subject = applyTemplateTokens(tpl.subject || `Examination registration request — ${tokens['student.full_name']} (ULearn ref ${ref})`, tokens);
      const html = applyTemplateTokens(tpl.htmlTemplate, tokens);
      const sent = await sendStudentEmail(prisma, {
        from: 'success@ulearnschool.com', fromName: 'ULearn Student Success Team',
        to: cfg.cesEmail!, cc: student.email || undefined, replyTo: student.email || undefined,
        subject, html, studentId: student.id, bookingId: booking?.id ?? null, templateId: tpl.id, sentBy: 'exam-request',
      });
      const updated = await prisma.studentExamBooking.update({
        where: { id: row.id },
        data: { status: 'REQUESTED', requestedAt: new Date(), emailThreadId: sent.threadId, templateSlug: slug },
      });
      await prisma.examBookingEvent.createMany({ data: [
        { examBookingId: row.id, eventType: 'email_sent', detail: `CES request sent to ${cfg.cesEmail} (student CC'd) via ${slug}`, emailLogId: sent.emailLogId },
        { examBookingId: row.id, eventType: 'status_change', fromStatus: 'REQUEST_PENDING', toStatus: 'REQUESTED', actor: 'student-app' },
      ] });
      return { success: true, bookingId: updated.id, status: 'REQUESTED', reference: ref,
        message: 'Request sent to the exam centre — they will confirm your place and payment directly. We\'ll keep you posted here.' };
    } catch (e: any) {
      await prisma.examBookingEvent.create({ data: { examBookingId: row.id, eventType: 'error', detail: `CES email failed: ${String(e?.message || e).slice(0, 300)}` } });
      return { success: true, bookingId: row.id, status: 'REQUEST_PENDING', pendingSend: true, reference: ref,
        message: 'Your request is recorded. Our team will finalise it with the exam centre.' };
    }
  }

  // Below-B1 or no-suitable-date → raise a Success Desk case (email success@) and
  // track a NEEDS_ATTENTION row so the dashboard reminder clears.
  async function requestAssistance(studentId: number | undefined, note?: string) {
    if (!studentId) return { success: false, error: 'No student session' };
    const { student, course } = await resolveEnrolment(studentId);
    if (!student || !course) return { success: false, error: 'No Academic Year course on file.' };

    const existing = await prisma.studentExamBooking.findFirst({
      where: { studentId, bookingCourseId: course.id, status: { in: ACTIVE_STATUSES as any } },
      select: { id: true },
    });
    const row = existing
      ? await prisma.studentExamBooking.update({ where: { id: existing.id }, data: { status: 'NEEDS_ATTENTION' } })
      : await prisma.studentExamBooking.create({ data: { studentId, bookingCourseId: course.id, status: 'NEEDS_ATTENTION', paymentArrangement: 'DIRECT' } });
    await prisma.examBookingEvent.create({ data: { examBookingId: row.id, eventType: 'escalation', toStatus: 'NEEDS_ATTENTION', actor: 'student-app', detail: `Assistance requested (level ${student.currentLevel || 'unknown'})${note ? ': ' + note.slice(0, 300) : ''}` } });

    const name = `${student.firstName || ''} ${student.lastName || ''}`.trim() || `Student #${student.id}`;
    const link = `https://sis.ulearnschool.com/sis/admin?view=student-detail&id=${student.id}`;
    try {
      await sendStudentEmail(prisma, {
        from: 'app@ulearnschool.com', fromName: 'ULearn Student App', to: 'success@ulearnschool.com',
        subject: `[Exam Assistance] ${name} (#${student.id}) — level ${student.currentLevel || 'unknown'}`,
        html: `<p style="font-size:15px;line-height:1.6"><a href="${link}">${name}</a> requested help choosing an examination through the Student App.</p>`
          + `<p style="font-size:15px;line-height:1.6">Recorded level: <strong>${student.currentLevel || 'unknown'}</strong> — below B1 / no suitable Cambridge sitting. Please follow up to select and register an appropriate A1/A2 examination.</p>`
          + (note ? `<p style="font-size:14px;color:#555">Student note: ${note.slice(0, 500)}</p>` : ''),
        replyTo: student.email || undefined, studentId: student.id, sentBy: 'exam-assistance',
      });
    } catch (e: any) { /* non-fatal — the row still records the ask */ }
    return { success: true, bookingId: row.id, status: 'NEEDS_ATTENTION', message: 'Thanks — our team will be in touch to arrange the right exam for your level.' };
  }

  // Student cancels their own pending/requested booking (frees the one-active slot).
  async function cancelOwn(studentId: number | undefined, bookingId: number) {
    if (!studentId) return { success: false, error: 'No student session' };
    const row = await prisma.studentExamBooking.findFirst({ where: { id: bookingId, studentId } });
    if (!row) return { success: false, error: 'Request not found.' };
    if (['CONFIRMED', 'SAT', 'RESULTS_RECEIVED', 'COMPLETED'].includes(row.status)) {
      return { success: false, error: 'This registration is already confirmed with the exam centre — contact Student Success to change it.' };
    }
    await prisma.studentExamBooking.update({ where: { id: row.id }, data: { status: 'CANCELLED' } });
    await prisma.examBookingEvent.create({ data: { examBookingId: row.id, eventType: 'status_change', fromStatus: row.status, toStatus: 'CANCELLED', actor: 'student-app' } });
    return { success: true };
  }

  // ── Staff / admin helpers ───────────────────────────────────────────────────

  async function listSittings(filter: { examCode?: string; status?: string; from?: string } = {}) {
    const where: any = {};
    if (filter.examCode) where.examCode = filter.examCode;
    if (filter.status) where.status = filter.status;
    if (filter.from) where.examDate = { gte: new Date(filter.from) };
    return prisma.examSitting.findMany({ where, orderBy: [{ examDate: 'asc' }, { examCode: 'asc' }] });
  }

  async function createSitting(data: any, actor?: string) {
    return prisma.examSitting.create({ data: normaliseSitting(data) });
  }
  async function updateSitting(id: number, data: any) {
    return prisma.examSitting.update({ where: { id }, data: normaliseSitting(data, true) });
  }
  async function archiveSitting(id: number) {
    return prisma.examSitting.update({ where: { id }, data: { status: 'ARCHIVED' } });
  }

  function normaliseSitting(d: any, partial = false) {
    const out: any = {};
    const set = (k: string, v: any) => { if (v !== undefined) out[k] = v; };
    set('examCode', d.examCode);
    set('provider', d.provider ?? (d.examCode === 'IELTS_GT' ? 'IELTS / British Council' : 'Cambridge'));
    set('centreId', d.centreId);
    if (d.examDate !== undefined) out.examDate = new Date(d.examDate);
    set('startTime', d.startTime ?? null);
    set('endTime', d.endTime ?? null);
    set('timezone', d.timezone);
    if (d.feeEur !== undefined) out.feeEur = d.feeEur === null || d.feeEur === '' ? null : String(d.feeEur);
    set('externalExamId', d.externalExamId ?? null);
    set('sourceUrl', d.sourceUrl ?? null);
    if (d.sourceCheckedAt !== undefined) out.sourceCheckedAt = d.sourceCheckedAt ? new Date(d.sourceCheckedAt) : null;
    set('status', d.status);
    set('notes', d.notes ?? null);
    return out;
  }

  async function listRequests(filter: { status?: string } = {}) {
    const where: any = {};
    if (filter.status) where.status = filter.status;
    return prisma.studentExamBooking.findMany({
      where, orderBy: { createdAt: 'desc' },
      include: {
        student: { select: { id: true, firstName: true, lastName: true, email: true, currentLevel: true } },
        examSitting: true,
        bookingCourse: { select: { id: true, name: true } },
      },
    });
  }

  // Staff update: record CES confirmation / mark sat / results / cancel / amend.
  async function updateRequest(id: number, patch: any, actor: string) {
    const row = await prisma.studentExamBooking.findUnique({ where: { id } });
    if (!row) return { ok: false, code: 404, error: 'Exam booking not found' };
    const data: any = {};
    const events: any[] = [];
    const now = new Date();

    if (patch.externalBookingReference !== undefined) data.externalBookingReference = patch.externalBookingReference || null;
    if (patch.status && patch.status !== row.status) {
      data.status = patch.status;
      if (patch.status === 'CONFIRMED' && !row.centreConfirmedAt) data.centreConfirmedAt = now;
      if (patch.status === 'SAT' && !row.satAt) data.satAt = now;
      if (patch.status === 'RESULTS_RECEIVED' && !row.resultsReceivedAt) data.resultsReceivedAt = now;
      events.push({ examBookingId: id, eventType: patch.status === 'CONFIRMED' ? 'confirmation_recorded' : 'status_change', fromStatus: row.status, toStatus: patch.status, actor, detail: patch.note || null });
    }
    if (patch.note && !(patch.status && patch.status !== row.status)) {
      events.push({ examBookingId: id, eventType: 'amendment', actor, detail: patch.note });
    }
    const updated = await prisma.studentExamBooking.update({ where: { id }, data });
    if (events.length) await prisma.examBookingEvent.createMany({ data: events });
    return { ok: true, booking: updated };
  }

  async function getRequest(id: number) {
    return prisma.studentExamBooking.findUnique({
      where: { id },
      include: {
        student: { select: { id: true, firstName: true, lastName: true, email: true, currentLevel: true } },
        examSitting: true,
        bookingCourse: { select: { id: true, name: true } },
        events: { orderBy: { createdAt: 'desc' } },
      },
    });
  }

  // Idempotent import: upsert each row by externalExamId (preferred) or the
  // natural key (centre+code+date+time). Flags a changed date/fee where a student
  // booking already references the sitting. commit=false → preview only.
  async function importSittings(rows: any[], opts: { commit?: boolean } = {}) {
    const result = { created: 0, updated: 0, unchanged: 0, flagged: [] as any[], errors: [] as any[], preview: [] as any[] };
    for (let i = 0; i < rows.length; i++) {
      const raw = rows[i];
      try {
        const data = normaliseSitting(raw);
        if (!data.examCode || !data.examDate) { result.errors.push({ row: i + 1, error: 'Missing examCode or examDate' }); continue; }
        const startTime = data.startTime ?? null;
        let existing = null as any;
        if (data.externalExamId) existing = await prisma.examSitting.findUnique({ where: { externalExamId: data.externalExamId } });
        if (!existing) existing = await prisma.examSitting.findFirst({ where: { centreId: data.centreId || 'CES-DUBLIN', examCode: data.examCode, examDate: data.examDate, startTime } });

        if (!existing) {
          result.preview.push({ row: i + 1, action: 'create', examCode: data.examCode, examDate: iso(data.examDate), startTime, feeEur: data.feeEur ?? null });
          if (opts.commit) { await prisma.examSitting.create({ data }); }
          result.created++;
        } else {
          const dateChanged = iso(existing.examDate) !== iso(data.examDate);
          const feeChanged = (existing.feeEur != null ? Number(existing.feeEur) : null) !== (data.feeEur != null ? Number(data.feeEur) : null);
          const changed = dateChanged || feeChanged || existing.status !== (data.status || existing.status) || (existing.notes || null) !== (data.notes ?? existing.notes ?? null);
          if (changed && (dateChanged || feeChanged)) {
            const refCount = await prisma.studentExamBooking.count({ where: { examSittingId: existing.id, status: { in: ACTIVE_STATUSES as any } } });
            if (refCount > 0) result.flagged.push({ id: existing.id, examCode: existing.examCode, examDate: iso(existing.examDate), change: dateChanged ? 'date' : 'fee', activeBookings: refCount });
          }
          result.preview.push({ row: i + 1, action: changed ? 'update' : 'unchanged', id: existing.id, examCode: data.examCode, examDate: iso(data.examDate) });
          if (changed) { if (opts.commit) await prisma.examSitting.update({ where: { id: existing.id }, data }); result.updated++; }
          else result.unchanged++;
        }
      } catch (e: any) { result.errors.push({ row: i + 1, error: String(e?.message || e).slice(0, 200) }); }
    }
    return result;
  }

  // Reminder cron tick — see cron-exam-reminders.ts. Returns a summary; sends
  // only when armed (dark otherwise). Working-days via Irish bank-holiday calendar.
  async function reminderTick(opts: { dry?: boolean } = {}) {
    const cfg = getExamConfig();
    const now = new Date();
    const summary = { armed: cfg.reminders.armed, dry: !!opts.dry, ackDue: 0, escalated: 0, sent: 0 };

    // Awaiting CES acknowledgement (REQUESTED) past ackDays / escalateDays working days.
    const pending = await prisma.studentExamBooking.findMany({
      where: { status: 'REQUESTED' },
      include: { student: { select: { id: true, firstName: true, lastName: true } }, examSitting: true },
    });
    for (const b of pending) {
      const since = b.requestedAt || b.createdAt;
      const wd = workingDaysSince(new Date(since), now);
      if (wd >= cfg.reminders.escalateDays && !b.escalatedAt) {
        summary.escalated++;
        if (cfg.reminders.armed && !opts.dry) {
          const name = `${b.student.firstName || ''} ${b.student.lastName || ''}`.trim() || `Student #${b.student.id}`;
          const link = `https://sis.ulearnschool.com/sis/admin?view=examinations&id=${b.id}`;
          try {
            await sendStudentEmail(prisma, { from: 'app@ulearnschool.com', fromName: 'ULearn Student App', to: 'success@ulearnschool.com',
              subject: `[Exam] No CES confirmation after ${wd} working days — ${name} (req #${b.id})`,
              html: `<p style="font-size:15px;line-height:1.6">CES has not confirmed <a href="${link}">exam request #${b.id}</a> for ${name} — ${wd} working days since the request. Please chase.</p>`,
              studentId: b.student.id, sentBy: 'exam-reminder' });
            await prisma.studentExamBooking.update({ where: { id: b.id }, data: { escalatedAt: now } });
            await prisma.examBookingEvent.create({ data: { examBookingId: b.id, eventType: 'escalation', actor: 'cron', detail: `Escalated to Success Desk (${wd} working days, no CES confirmation)` } });
            summary.sent++;
          } catch { /* non-fatal */ }
        }
      } else if (wd >= cfg.reminders.ackDays && !b.ackReminderSentAt && !b.escalatedAt) {
        summary.ackDue++;
        if (cfg.reminders.armed && !opts.dry) {
          try {
            await prisma.studentExamBooking.update({ where: { id: b.id }, data: { ackReminderSentAt: now } });
            await prisma.examBookingEvent.create({ data: { examBookingId: b.id, eventType: 'status_change', actor: 'cron', detail: `Ack-chase flag set (${wd} working days, no CES acknowledgement)` } });
            summary.sent++;
          } catch { /* non-fatal */ }
        }
      }
    }
    return summary;
  }

  return {
    eligibility, options, createExamRequest, requestAssistance, cancelOwn,
    listSittings, createSitting, updateSitting, archiveSitting,
    listRequests, getRequest, updateRequest, importSittings, reminderTick,
    EXAM_TITLE,
  };
}
