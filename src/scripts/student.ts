/**
 * Student portal business logic.
 *
 * Resolves the logged-in student from `session.studentId` (set at login by
 * /sis/auth/login when userType==='student' — see app.ts). Returns shaped
 * payloads for the three tabs: Profile (SIS), Challenges, LMS.
 */
import type { PrismaClient } from '../generated/prisma/client';
import { fetchStudentHolidays, filterOutHolidayDates, pctFromRows } from './attendance-pct';
import { kellyMention } from '../lib/slack';
import { notifyChallenge } from '../lib/challenge-notify';

export function studentScripts(prisma: PrismaClient) {

  async function me(studentId?: number) {
    if (!studentId) return { student: null, error: 'No student session' };

    const student = await prisma.student.findUnique({
      where: { id: studentId },
      select: {
        id: true, firstName: true, lastName: true, email: true,
        nationality: true, birthday: true, phoneMobile: true, phone: true,
        currentLevel: true, profilePicture: true,
      },
    });
    if (!student) return { student: null, error: 'Student not found' };

    // Pick the active/current booking — most recent service window. Fall back
    // to most recent regardless of dates if none are active right now.
    const today = new Date();
    const bookings = await prisma.booking.findMany({
      where: { studentId },
      orderBy: { id: 'desc' },
      include: {
        courses: { orderBy: { startDate: 'desc' } },
        accommodations: {
          orderBy: { startDate: 'desc' },
          include: {
            bed: { include: { room: { include: { property: { include: { provider: true } } } } } },
          },
        },
      },
    });
    const current = bookings.find(b =>
      b.serviceStart && b.serviceEnd && b.serviceStart <= today && b.serviceEnd >= today
    ) || bookings[0] || null;

    const course = current?.courses?.[0] || null;
    const accom = current?.accommodations?.[0] || null;
    const provider = (accom as any)?.bed?.room?.property?.provider || null;

    // Attendance — count records for this student. Holiday days are excluded
    // entirely from the calculation (neither present nor absent — the student
    // wasn't supposed to be in class).
    const attRowsAll = await prisma.attendance.findMany({
      where: { studentId },
      select: { status: true, hours: true, occurrence: { select: { date: true } } },
    });
    const holidays = await fetchStudentHolidays(prisma, studentId);
    const attRows = filterOutHolidayDates(attRowsAll, holidays);
    const total = attRows.length;
    const overallPct = pctFromRows(attRows);

    // "This week" = Monday-of-this-week to today
    const monday = new Date(today);
    const dow = (monday.getDay() + 6) % 7; // 0 = Mon
    monday.setDate(monday.getDate() - dow);
    monday.setHours(0, 0, 0, 0);
    const wkRows = attRows.filter(r => r.occurrence?.date && r.occurrence.date >= monday);
    const weekPct = pctFromRows(wkRows);

    // Class timetable footnote — pulled from the student's current
    // StudentClassAssignment so we can show "Mon-Fri · 09:00-12:20 · Room 1
    // @ Harcourt Centre" inside Course Details. Uses the most recent open
    // assignment as the source of truth.
    const todayD = new Date(); todayD.setHours(0, 0, 0, 0);
    const assignment: any = await prisma.studentClassAssignment.findFirst({
      where: {
        studentId,
        weekStart: { lte: todayD },
        OR: [{ weekEnd: null }, { weekEnd: { gte: todayD } }],
      },
      orderBy: { weekStart: 'desc' },
      include: {
        class_: {
          select: {
            name: true, level: true, session: true,
            startTime: true, endTime: true, days: true,
            classroom: { select: { name: true } } as any,
          } as any,
        },
      } as any,
    });
    const cls = assignment?.class_ || null;
    const timetable = cls ? {
      days: (cls.days as number[]) || [],
      startTime: cls.startTime,
      endTime: cls.endTime,
      classroomName: cls.classroom?.name || null,
    } : null;

    // Documents — issued only (drafts aren't shown to students)
    const documents = await prisma.documentRecord.findMany({
      where: { studentId, status: 'ISSUED' },
      orderBy: { issuedAt: 'desc' },
      select: {
        id: true, documentType: true, issuedAt: true, versionNo: true,
        template: { select: { name: true, slug: true } },
      },
      take: 10,
    });

    return {
      student: {
        id: student.id,
        firstName: student.firstName,
        lastName: student.lastName,
        email: student.email,
        nationality: student.nationality,
        birthday: student.birthday,
        phone: student.phoneMobile || student.phone,
        level: student.currentLevel,
        profilePicture: student.profilePicture,
      },
      booking: current ? {
        id: current.id,
        serviceStart: current.serviceStart,
        serviceEnd: current.serviceEnd,
        status: current.status,
      } : null,
      course: course ? {
        name: course.name,
        level: course.level,
        startDate: course.startDate,
        endDate: course.endDate,
        weeks: course.weeks,
        hoursPerWeek: course.hoursPerWeek,
      } : null,
      timetable,
      accommodation: accom ? {
        type: accom.accommodationType,
        roomType: accom.roomType,
        board: accom.board,
        startDate: accom.startDate,
        endDate: accom.endDate,
        provider: provider ? {
          name: provider.name,
          city: provider.city,
        } : null,
      } : null,
      attendance: {
        overallPct,
        weekPct,
        totalRecords: total,
      },
      documents,
    };
  }

  // ── Absence reasons ────────────────────────────
  // The student annotates an absence with why they missed class. Reasons NEVER
  // change attendance % — they're documentation only, used in the exit letter
  // when a student finishes <85% (and possibly cited at IRP renewal).
  const ALLOWED_REASONS = ['SICK', 'IRP_APPT', 'PPS_APPT', 'EXAM', 'TRANSPORT', 'WEATHER', 'OTHER'] as const;
  type Reason = typeof ALLOWED_REASONS[number];

  async function absences(studentId: number, days = 60) {
    const since = new Date();
    since.setDate(since.getDate() - days);
    since.setHours(0, 0, 0, 0);

    const rows = await prisma.attendance.findMany({
      where: {
        studentId,
        status: { in: ['ABSENT_CERTIFIED', 'ABSENT_UNCERTIFIED', 'EXCUSED'] },
        occurrence: { date: { gte: since } },
      },
      include: {
        occurrence: { include: { class_: { select: { name: true } } } },
      },
      orderBy: { occurrence: { date: 'desc' } },
    });

    const dates = rows.map(r => r.occurrence.date);
    const reasons = dates.length
      ? await prisma.absenceReason.findMany({
          where: { studentId, date: { in: dates } },
          select: {
            date: true, reason: true, noteText: true, submittedAt: true, accepted: true,
            certFiles: { select: { id: true, filename: true, originalName: true }, orderBy: { uploadedAt: 'asc' } },
          },
        })
      : [];
    const byDate = new Map(reasons.map(r => [r.date.toISOString().slice(0, 10), r]));

    return rows.map(r => {
      const iso = r.occurrence.date.toISOString().slice(0, 10);
      const rsn = byDate.get(iso);
      return {
        date: iso,
        status: r.status,
        className: r.occurrence.class_?.name || '',
        reason: rsn?.reason || null,
        noteText: rsn?.noteText || null,
        submittedAt: rsn?.submittedAt || null,
        certs: (rsn?.certFiles || []).map(f => ({ id: f.id, name: f.originalName || f.filename })),
      };
    });
  }

  async function planned(studentId: number, days = 60) {
    // Future-dated absence_reasons rows for this student. Past rows live on
    // the regular /absences endpoint (joined to Attendance). Planned rows
    // exist before the teacher has marked attendance for that day.
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const horizon = new Date(today);
    horizon.setDate(horizon.getDate() + days);

    const rows = await prisma.absenceReason.findMany({
      where: { studentId, date: { gte: today, lte: horizon } },
      select: {
        date: true, reason: true, noteText: true, submittedAt: true,
        certFiles: { select: { id: true, originalName: true, filename: true }, orderBy: { uploadedAt: 'asc' } },
      },
      orderBy: { date: 'asc' },
    });

    return rows.map(r => ({
      date: r.date.toISOString().slice(0, 10),
      reason: r.reason,
      noteText: r.noteText,
      submittedAt: r.submittedAt,
      certs: r.certFiles.map(f => ({ id: f.id, name: f.originalName || f.filename })),
    }));
  }

  async function recordAbsenceReason(input: {
    studentId: number;
    date: string;        // YYYY-MM-DD
    reason: string;
    noteText?: string;
    submittedBy: string;
  }) {
    const reason = String(input.reason || '').toUpperCase();
    if (!(ALLOWED_REASONS as readonly string[]).includes(reason)) {
      throw new Error('Invalid reason');
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date)) throw new Error('Invalid date');
    const date = new Date(input.date + 'T00:00:00Z');

    // Reject Saturdays and Sundays (no classes run). Server-side guard so a
    // student can't pre-tag e.g. a weekend just to hit the form. Past dates
    // are still allowed (post-hoc reason is the dominant case).
    const dayOfWeek = date.getUTCDay(); // 0=Sun, 6=Sat
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      throw new Error('Pick a weekday — no classes run on weekends');
    }

    return prisma.absenceReason.upsert({
      where: { studentId_date: { studentId: input.studentId, date } },
      create: {
        studentId: input.studentId,
        date,
        reason: reason as Reason,
        noteText: input.noteText?.slice(0, 500) || null,
        submittedBy: input.submittedBy,
      },
      update: {
        reason: reason as Reason,
        noteText: input.noteText?.slice(0, 500) || null,
        submittedAt: new Date(),
        // Re-submission resets review state — admin can re-confirm if they want.
        reviewedBy: null,
        reviewedAt: null,
      },
    });
  }

  async function clearAbsenceReason(studentId: number, dateIso: string) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateIso)) throw new Error('Invalid date');
    const date = new Date(dateIso + 'T00:00:00Z');
    // Cascade-delete via the FK takes care of cert rows; we still want to
    // unlink the actual files from disk first.
    const existing = await prisma.absenceReason.findUnique({
      where: { studentId_date: { studentId, date } },
      select: { certFilename: true, certFiles: { select: { filename: true } } },
    });
    if (existing) {
      for (const f of existing.certFiles) await unlinkCert(f.filename);
      if (existing.certFilename) await unlinkCert(existing.certFilename);
    }
    await prisma.absenceReason.deleteMany({ where: { studentId, date } });
    return { ok: true };
  }

  // ── Medical-cert attachment helpers ──────────
  async function unlinkCert(filename: string) {
    try {
      const fs = await import('fs');
      const path = await import('path');
      const dir = path.resolve(__dirname, '..', '..', 'uploads', 'medical-certs');
      const abs = path.resolve(dir, filename);
      if (abs.startsWith(dir) && fs.existsSync(abs)) fs.unlinkSync(abs);
    } catch { /* swallow — disk cleanup isn't critical */ }
  }

  const CERT_MAX = 5;

  async function attachAbsenceCert(input: {
    studentId: number; dateIso: string; filename: string; originalName: string; uploadedBy?: string;
  }) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(input.dateIso)) throw new Error('Invalid date');
    const date = new Date(input.dateIso + 'T00:00:00Z');
    const reason = await prisma.absenceReason.findUnique({
      where: { studentId_date: { studentId: input.studentId, date } },
      include: { certFiles: { select: { id: true } } },
    });
    if (!reason) throw new Error('Pick a reason before attaching a cert');
    if (reason.certFiles.length >= CERT_MAX) {
      // Remove the just-saved temp file so we don't leave orphans on disk
      await unlinkCert(input.filename);
      throw new Error(`Maximum ${CERT_MAX} files reached`);
    }
    return prisma.absenceCertFile.create({
      data: {
        absenceReasonId: reason.id,
        filename: input.filename,
        originalName: input.originalName,
        uploadedBy: input.uploadedBy || null,
      },
    });
  }

  async function removeAbsenceCertFile(studentId: number, dateIso: string, fileId: number) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateIso)) throw new Error('Invalid date');
    const date = new Date(dateIso + 'T00:00:00Z');
    const reason = await prisma.absenceReason.findUnique({
      where: { studentId_date: { studentId, date } },
      select: { id: true },
    });
    if (!reason) throw new Error('No reason on file for that date');
    const file = await prisma.absenceCertFile.findFirst({
      where: { id: fileId, absenceReasonId: reason.id },
      select: { filename: true },
    });
    if (!file) throw new Error('File not found on this absence');
    await unlinkCert(file.filename);
    await prisma.absenceCertFile.delete({ where: { id: fileId } });
    return { ok: true };
  }

  async function getAbsenceCertFile(studentId: number, dateIso: string, fileId: number) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateIso)) return null;
    const date = new Date(dateIso + 'T00:00:00Z');
    const reason = await prisma.absenceReason.findUnique({
      where: { studentId_date: { studentId, date } },
      select: { id: true },
    });
    if (!reason) return null;
    return prisma.absenceCertFile.findFirst({
      where: { id: fileId, absenceReasonId: reason.id },
      select: { filename: true, originalName: true },
    });
  }

  // ── Challenges ─────────────────────────────────
  // Engagement layer surfacing six challenge types on /sis/student.
  // Most are self-claim + admin-verify; "Course Attended" is computed live
  // from the Attendance table.

  // Compute attendance % for a date window. Returns null when there are no
  // attendance records yet (e.g. brand-new student, first week not begun).
  function pctForWindow(rows: any[], from: Date) {
    const wnd = rows.filter(r => r.occurrence?.date && r.occurrence.date >= from);
    if (!wnd.length) return null;
    const present = wnd.filter(r => r.status === 'PRESENT' || r.status === 'LATE').length;
    return Math.round((present / wnd.length) * 100);
  }

  async function challenges(studentId?: number) {
    if (!studentId) return { error: 'No student session' };

    const s = await prisma.student.findUnique({
      where: { id: studentId },
      select: {
        id: true, firstName: true, lastName: true,
        instagramHandle: true, instagramFollowVerified: true,
        googleReviewUrl: true, googleReviewVerified: true,
        trustpilotReviewUrl: true,
        ambassadorCode: true, ambassadorApprovedAt: true,
      } as any,
    });
    if (!s) return { error: 'Student not found' };

    // Decide weekly vs monthly window from the student's primary booking.
    // AY/LifePass (>= 12 weeks) → monthly, otherwise → weekly.
    const booking = await prisma.booking.findFirst({
      where: { studentId },
      orderBy: { id: 'desc' },
      select: {
        serviceStart: true, serviceEnd: true,
        courses: { select: { weeks: true }, orderBy: { id: 'desc' }, take: 1 },
      },
    });
    const wks = booking?.courses?.[0]?.weeks ?? null;
    const periodKind: 'WEEK' | 'MONTH' = (wks && wks >= 12) ? 'MONTH' : 'WEEK';

    const today = new Date();
    const from = new Date(today);
    from.setHours(0,0,0,0);
    if (periodKind === 'WEEK') {
      const dow = (from.getDay() + 6) % 7; // Mon = 0
      from.setDate(from.getDate() - dow);
    } else {
      from.setDate(1); // start of current month
    }

    const attRowsAll = await prisma.attendance.findMany({
      where: { studentId },
      select: { status: true, occurrence: { select: { date: true } } },
    });
    // Exclude holiday-overlap days so the student isn't penalised for being
    // off when they're meant to be off.
    const hols = await fetchStudentHolidays(prisma, studentId);
    const attRows = filterOutHolidayDates(attRowsAll, hols);
    const periodPct = pctForWindow(attRows, from);
    // Overall % across the student's whole booking — used as a fallback in
    // the Course Attended challenge when the current week/month hasn't
    // accumulated any attendance rows yet (otherwise the card reads
    // "No attendance yet" even though the student clearly has historical
    // data showing on the Profile tab).
    const overallPct = pctFromRows(attRows);
    const courseAttendedDone = periodPct !== null && periodPct === 100;

    // Auto-notify Kelly the first time a student hits 100 % in the cycle.
    // The thread row's `notifiedCourse100` flag dedupes within the cycle, so
    // visiting the Challenges tab again on Friday won't re-fire the message.
    if (courseAttendedDone) {
      void notifyChallenge(prisma, studentId, {
        title: '🎯 Attended Course — 100 % unlocked',
        body: `Auto-verified by attendance records. No action needed.`,
        setOnceFlag: 'notifiedCourse100',
      });
    }

    // Content tasks: 3 verified video posts to clear it
    const content = await (prisma as any).studentChallengeContent.findMany({
      where: { studentId },
      orderBy: { id: 'asc' },
    });
    const verifiedContent = content.filter((c: any) => c.verified).length;
    const contentTasksDone = verifiedContent >= 3;

    const social = !!(s as any).instagramHandle && (s as any).instagramFollowVerified;
    const review = (s as any).googleReviewVerified;
    const ambassador = !!(s as any).ambassadorCode;

    // Attended Social — Kelly marks `attended=true` after the event, and the
    // student earns the unlock once they've attended at least one social
    // activity in the current period (week/month). The card body surfaces a
    // calendar icon so students can browse the wider monthly programme even
    // when this week's slate is light.
    const attendedRows = await (prisma as any).activityAttendee.findMany({
      where: {
        studentId,
        attended: true,
        activity: { date: { gte: from } },
      },
      include: { activity: { select: { id: true, title: true, date: true } } },
    });
    const activityAttendedDone = attendedRows.length >= 1;

    const items = [
      {
        key: 'social',
        label: 'Social Platform',
        icon: '📱',
        done: social,
        state: social ? 'Unlocked' : ((s as any).instagramHandle ? 'Awaiting verification' : 'Add your handle'),
        data: {
          instagramHandle: (s as any).instagramHandle,
          followVerified: (s as any).instagramFollowVerified,
        },
      },
      {
        key: 'content',
        label: 'Content Tasks',
        icon: '🎬',
        done: contentTasksDone,
        state: `${verifiedContent} of 3 verified`,
        data: { content, verified: verifiedContent, target: 3 },
      },
      {
        key: 'course_attended',
        label: 'Attended Course',
        icon: '🎯',
        done: courseAttendedDone,
        state: periodPct !== null
          ? `${periodPct}% this ${periodKind === 'WEEK' ? 'week' : 'month'}`
          : (overallPct !== null ? `${overallPct}% overall` : 'No attendance yet'),
        data: { periodKind, periodPct, overallPct },
      },
      {
        key: 'activity_attended',
        label: 'Attended Social',
        icon: '🎉',
        done: activityAttendedDone,
        state: activityAttendedDone
          ? `${attendedRows.length} attended this ${periodKind === 'WEEK' ? 'week' : 'month'}`
          : 'RSVP and show up to an activity',
        data: { attended: attendedRows.map((r: any) => ({ activityId: r.activity.id, title: r.activity.title, date: r.activity.date })) },
      },
      {
        // Single "Review" challenge — the Google 5★ is the unlock criterion;
        // Trustpilot URL sits alongside as a secondary backend-tracked field
        // (it's typically captured during booking, not as part of the challenge).
        key: 'review',
        label: 'Review',
        icon: '⭐',
        done: review,
        state: review ? '5★ verified' : ((s as any).googleReviewUrl ? 'Awaiting verification' : 'Submit your Google review link'),
        data: {
          googleUrl: (s as any).googleReviewUrl,
          googleVerified: (s as any).googleReviewVerified,
          trustpilotUrl: (s as any).trustpilotReviewUrl,
        },
      },
      {
        key: 'ambassador',
        label: 'Ambassador',
        icon: '🏆',
        done: ambassador,
        state: ambassador ? 'Unlocked' : 'Unlocks after 5★ Google Review verified',
        data: {
          code: (s as any).ambassadorCode,
          approvedAt: (s as any).ambassadorApprovedAt,
        },
      },
    ];
    const done = items.filter(i => i.done).length;

    return {
      progress: { done, total: items.length },
      periodKind,
      items,
    };
  }

  // Student updates own social fields. Verification is admin-only — toggling
  // `instagramFollowVerified` or `googleReviewVerified` from this endpoint is
  // ignored (use the admin endpoints).
  async function updateSocial(studentId: number, body: any) {
    const allowed: any = {};
    if ('instagramHandle' in body) {
      const h = (body.instagramHandle || '').toString().trim();
      // Allow null/empty to clear; strip leading @ for storage consistency
      allowed.instagramHandle = h ? h.replace(/^@/, '') : null;
      // Editing handle invalidates prior follow verification; admin must re-tick
      allowed.instagramFollowVerified = false;
    }
    if ('googleReviewUrl' in body) {
      const u = (body.googleReviewUrl || '').toString().trim();
      allowed.googleReviewUrl = u || null;
      // Editing URL invalidates prior verification — and clears ambassador
      allowed.googleReviewVerified = false;
      allowed.ambassadorCode = null;
      allowed.ambassadorApprovedAt = null;
    }
    if ('trustpilotReviewUrl' in body) {
      const u = (body.trustpilotReviewUrl || '').toString().trim();
      allowed.trustpilotReviewUrl = u || null;
    }
    if (Object.keys(allowed).length === 0) return { ok: true, noop: true };
    await prisma.student.update({ where: { id: studentId }, data: allowed as any });

    // Notify Kelly when the student submits/updates a Google review URL —
    // she needs to verify the rating before the Ambassador badge auto-mints.
    if (allowed.googleReviewUrl) {
      void notifyChallenge(prisma, studentId, {
        title: '⭐ Review — link submitted',
        body: [
          `URL: ${allowed.googleReviewUrl}`,
          `${kellyMention()} please confirm it's a 5★ review (anything less = no unlock).`,
        ].join('\n'),
      });
    }
    return { ok: true };
  }

  // Self-certified follow confirmation. The student clicks "I followed" after
  // visiting Instagram; we mark followVerified=true immediately (no API can
  // verify a follower since Meta retired that endpoint) and ping Slack so a
  // staff member can spot-check and revoke if needed. Trust-by-default —
  // friction kills challenge participation, and Kelly can revoke through the
  // admin endpoint if someone games it.
  async function confirmFollow(studentId: number) {
    const s = await prisma.student.findUnique({
      where: { id: studentId },
      select: { id: true, firstName: true, lastName: true, instagramHandle: true } as any,
    }) as any;
    if (!s) throw new Error('Student not found');
    if (!s.instagramHandle) throw new Error('Add your Instagram handle first');

    // Idempotent — multiple confirms just stay verified.
    await prisma.student.update({
      where: { id: studentId },
      data: { instagramFollowVerified: true } as any,
    });

    // Slack notify (best-effort). Posts as a reply on the student's cycle
    // thread (creates the thread if this is their first event of the week).
    const handle = String(s.instagramHandle).replace(/^@/, '');
    void notifyChallenge(prisma, studentId, {
      title: '📱 Social Platform — follow claimed',
      body: [
        `Handle: <https://instagram.com/${handle}|@${handle}>`,
        `${kellyMention()} please spot-check the followers list; revoke via admin if false.`,
      ].join('\n'),
    });

    return { ok: true, verified: true };
  }

  async function addContentSubmission(studentId: number, body: any) {
    const url = (body.url || '').toString().trim();
    if (!url) throw new Error('URL required');
    const row = await (prisma as any).studentChallengeContent.create({
      data: {
        studentId,
        url,
        kind: (body.kind || 'VIDEO').toString().toUpperCase(),
        note: body.note || null,
      },
    });
    // How many of the 3 has the student now submitted? Drives the body text
    // so Kelly knows at a glance whether they've finished the set.
    const total = await (prisma as any).studentChallengeContent.count({ where: { studentId } });
    void notifyChallenge(prisma, studentId, {
      title: `🎬 Content Tasks — video ${total}/3 submitted`,
      body: [
        `URL: ${url}`,
        `${kellyMention()} please review and verify.`,
      ].join('\n'),
    });
    return row;
  }

  async function removeContentSubmission(studentId: number, id: number) {
    // Guard: students can only delete their own (and only if not yet verified).
    const row = await (prisma as any).studentChallengeContent.findUnique({ where: { id } });
    if (!row || row.studentId !== studentId) throw new Error('Not found');
    if (row.verified) throw new Error('Cannot remove a verified submission');
    await (prisma as any).studentChallengeContent.delete({ where: { id } });
    return { deleted: true };
  }

  // ── Admin verify endpoints (for the staff side) ─────────────
  // Toggling googleReviewVerified → true also mints an ambassador code.
  async function adminSetVerify(studentId: number, body: any, byUser: string | null) {
    const data: any = {};
    if ('instagramFollowVerified' in body) data.instagramFollowVerified = !!body.instagramFollowVerified;
    if ('googleReviewVerified' in body) {
      data.googleReviewVerified = !!body.googleReviewVerified;
      if (data.googleReviewVerified) {
        // Mint a code if there isn't one already
        const existing = await prisma.student.findUnique({
          where: { id: studentId },
          select: { firstName: true, ambassadorCode: true } as any,
        });
        if (existing && !(existing as any).ambassadorCode) {
          const fn = String((existing as any).firstName || 'STUDENT');
          const slug = fn.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12);
          data.ambassadorCode = `${slug}-${studentId}`;
          data.ambassadorApprovedAt = new Date();
        }
      } else {
        // Unverifying clears the ambassador
        data.ambassadorCode = null;
        data.ambassadorApprovedAt = null;
      }
    }
    if (Object.keys(data).length === 0) return { ok: true, noop: true };
    await prisma.student.update({ where: { id: studentId }, data });
    return { ok: true, by: byUser };
  }

  async function adminVerifyContent(contentId: number, verified: boolean, byUser: string | null) {
    const data: any = {
      verified,
      verifiedBy: verified ? byUser : null,
      verifiedAt: verified ? new Date() : null,
    };
    return (prisma as any).studentChallengeContent.update({ where: { id: contentId }, data });
  }

  async function learning() {
    // LMS surface stub — handover/redirect to lms.ulearnschool.com is the real path.
    return { lmsUrl: 'https://lms.ulearnschool.com/' };
  }

  return {
    me, absences, planned,
    recordAbsenceReason, clearAbsenceReason,
    attachAbsenceCert, removeAbsenceCertFile, getAbsenceCertFile,
    challenges, learning,
    updateSocial, confirmFollow, addContentSubmission, removeContentSubmission,
    adminSetVerify, adminVerifyContent,
  };
}
