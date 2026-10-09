import { PrismaClient, Prisma } from '../generated/prisma/client';
import { autoFillIlepForStudent } from './ilep-deriver';
import { sendStudentEmail } from '../routes/email';
import { studentSearchSql } from '../lib/student-search';
import { emailTemplateWhere } from './email-templates';

const DATE_FIELDS = [
  'birthday', 'visaFrom', 'visaUntil', 'passportValidFrom', 'passportValidUntil',
  'flightDate', 'outboundFlightDate',
  'insuranceFrom', 'insuranceUntil', 'medicalFrom', 'medicalUntil',
];

function parseDates(data: Record<string, any>) {
  for (const field of DATE_FIELDS) {
    if (data[field] && typeof data[field] === 'string') {
      data[field] = new Date(data[field]);
    }
  }
  return data;
}

export function studentScripts(prisma: PrismaClient) {

  async function list(query: Record<string, any>) {
    const page = Math.max(1, parseInt(query.page) || 1);
    const limit = Math.min(100, parseInt(query.limit) || 25);
    const offset = (page - 1) * limit;
    const search = (query.search || '').trim();
    const nationality = (query.nationality || '').trim();
    const status = (query.status || '').trim();
    // Booking-status filter — accepts one OR several (comma-separated) statuses,
    // combinable from the UI's multi-select pills; matched as IN(...) below.
    const bookingStatuses = (query.bookingStatus || '').split(',').map((x: string) => x.trim().toUpperCase()).filter(Boolean);
    const archive = String(query.archive || '') === 'true' || query.archive === '1';
    const agencyId = parseInt(query.agencyId) || 0;   // Partner (agency) filter — 0 = all

    // Whitelist sort columns — onboarded is the derived join column, the rest map directly.
    // Default to onboarded-desc so the most recent enrolments surface first.
    const SORTABLE = ['name', 'email', 'nationality', 'phone', 'onboarded'];
    const sortBy = SORTABLE.includes(query.sortBy) ? query.sortBy : 'onboarded';
    const sortDirAsc = String(query.sortDir || '').toLowerCase() === 'asc';
    const dir = sortDirAsc ? Prisma.raw('ASC') : Prisma.raw('DESC');
    const orderClauses: Record<string, Prisma.Sql> = {
      name:        Prisma.sql`s.first_name ${dir}, s.last_name ${dir}, s.id DESC`,
      email:       Prisma.sql`s.email ${dir} NULLS LAST, s.id DESC`,
      nationality: Prisma.sql`s.nationality ${dir} NULLS LAST, s.last_name ASC`,
      phone:       Prisma.sql`COALESCE(s.phone, s.phone_mobile) ${dir} NULLS LAST, s.id DESC`,
      onboarded:   Prisma.sql`ob.onboarding_date ${dir} NULLS LAST, s.id DESC`,
    };
    const orderBy = orderClauses[sortBy];

    // Build WHERE conditions as Prisma.sql fragments (parameterized).
    // Search is tokenised on whitespace: each token must match at least one
    // searchable column, and all tokens must match (AND across tokens). This
    // is what lets "Maria Agustina Quiñoa" match a row where firstName is
    // "Maria Agustina" and lastName is "Quiñoa" — no single column contains
    // the full phrase.
    //
    // `unaccent()` wraps both column and term so typed "Quinoa" matches
    // stored "Quiñoa" (and vice versa). Latin diacritics are normalised for
    // matching only — original characters stay in the DB (legal names).
    // Email and Fidelo customer-num don't carry diacritics, so we skip the
    // unaccent call on those.
    const conditions: Prisma.Sql[] = [];
    // If the entire search term is purely digits, treat it as an ID-priority
    // search — rank an exact id match first, fall back to partial id matches
    // mixed in with name/email matches. Means typing "97" surfaces student
    // #97 at the top even though her name doesn't contain "97" anywhere.
    let exactIdRank: Prisma.Sql = Prisma.empty;
    if (search) {
      // Tokenised, accent-insensitive search — shared with the partner portal.
      const frag = studentSearchSql(search);
      if (frag !== Prisma.empty) conditions.push(frag);
      // Whole-string numeric → tiebreaker so the exact id sorts first.
      if (/^\d+$/.test(search.trim())) {
        const idNum = parseInt(search.trim(), 10);
        if (Number.isFinite(idNum)) {
          exactIdRank = Prisma.sql`CASE WHEN s.id = ${idNum} THEN 0 ELSE 1 END,`;
        }
      }
    }
    if (nationality) conditions.push(Prisma.sql`s.nationality = ${nationality}`);
    // Partner filter: match the student's CURRENT partner — i.e. the agency on their
    // most-recent agency-bearing booking. This is the SAME rule the Partner column uses
    // (partnerById below), so filter and displayed agent never disagree. (A repeat student
    // who switched agents shows/filters under their latest agent only, not every past one.)
    if (agencyId) conditions.push(Prisma.sql`(SELECT b3.agency_id FROM bookings b3 WHERE b3.student_id = s.id AND b3.agency_id IS NOT NULL ORDER BY b3.created_at DESC LIMIT 1) = ${agencyId}`);
    if (status) conditions.push(Prisma.sql`s.student_status = ${status}`);
    // Filter by the student's CURRENT booking status (most-recent booking) — drives the Students status pills.
    if (bookingStatuses.length) conditions.push(Prisma.sql`(SELECT b2.status FROM bookings b2 WHERE b2.student_id = s.id ORDER BY b2.created_at DESC LIMIT 1) IN (${Prisma.join(bookingStatuses)})`);
    // Default to the recent/active window (snappy): students with ANY booking
    // activity since 2024-01-01. The Archive toggle (archive=true) lifts it to the
    // whole database. A search always bypasses the bracket so you can find anyone.
    if (!archive && !search) conditions.push(Prisma.sql`ob.last_activity >= DATE '2024-01-01'`);
    const whereSql = conditions.length
      ? Prisma.sql`WHERE ${Prisma.join(conditions, ' AND ')}`
      : Prisma.empty;

    // Inline subquery rather than CTE so the planner can use student_id index directly.
    const onboardingJoin = Prisma.sql`
      LEFT JOIN (
        SELECT b.student_id,
               LEAST(MIN(bc.start_date), MIN(ba.start_date)) AS onboarding_date,
               GREATEST(MAX(bc.start_date), MAX(ba.start_date)) AS last_activity
        FROM bookings b
        LEFT JOIN booking_courses bc ON bc.booking_id = b.id
        LEFT JOIN booking_accommodations ba ON ba.booking_id = b.id
        GROUP BY b.student_id
      ) ob ON ob.student_id = s.id
    `;

    const [idRows, countRows, natRows, agencyRows] = await Promise.all([
      prisma.$queryRaw<{ id: number; onboarding_date: Date | null }[]>`
        SELECT s.id, ob.onboarding_date
        FROM students s
        ${onboardingJoin}
        ${whereSql}
        ORDER BY ${exactIdRank} ${orderBy}
        LIMIT ${limit} OFFSET ${offset}
      `,
      prisma.$queryRaw<{ count: bigint }[]>`
        SELECT COUNT(*)::bigint AS count
        FROM students s
        ${onboardingJoin}
        ${whereSql}
      `,
      prisma.student.findMany({
        where: { nationality: { not: null } },
        select: { nationality: true },
        distinct: ['nationality'],
        orderBy: { nationality: 'asc' },
      }),
      // Partner (agency) dropdown options — only agencies that actually appear on
      // a booking, so the list is the real partner roster, not every agency row.
      prisma.$queryRaw<{ id: number; name: string }[]>`
        SELECT DISTINCT ag.id, ag.name
        FROM agencies ag
        JOIN bookings b ON b.agency_id = ag.id
        WHERE ag.name IS NOT NULL AND ag.name <> ''
        ORDER BY ag.name ASC
      `,
    ]);

    const total = Number(countRows[0]?.count || 0);
    const nationalities = natRows.map(r => r.nationality).filter(Boolean) as string[];
    const agencies = agencyRows.map(r => ({ id: r.id, name: r.name }));
    const ids = idRows.map(r => r.id);

    // Load full Student records (for type-safe shape), then reorder per the sorted IDs.
    const records = ids.length ? await prisma.student.findMany({ where: { id: { in: ids } } }) : [];
    const byId = new Map(records.map(s => [s.id, s as any]));
    const onboardingById = new Map(idRows.map(r => [r.id, r.onboarding_date]));
    const data = ids.map(id => byId.get(id)).filter(Boolean);
    for (const s of data) s.onboardingDate = onboardingById.get(s.id) || null;

    // Partner column data: for each student, their most-recent booking-linked
    // agency name. Null = no agency relation = render as "B2C" client-side.
    if (ids.length > 0) {
      const partnerRows = await prisma.$queryRaw<{ student_id: number; agency_name: string }[]>`
        SELECT DISTINCT ON (b.student_id) b.student_id, ag.name AS agency_name
        FROM bookings b
        JOIN agencies ag ON ag.id = b.agency_id
        WHERE b.student_id = ANY(${ids}::int[])
        ORDER BY b.student_id, b.created_at DESC
      `;
      const partnerById = new Map(partnerRows.map(r => [r.student_id, r.agency_name]));
      for (const s of data) (s as any).partnerName = partnerById.get(s.id) || null;

      // Current booking status per student (most-recent booking) — for the status pills + name colour.
      const statusRows = await prisma.$queryRaw<{ student_id: number; status: string }[]>`
        SELECT DISTINCT ON (b.student_id) b.student_id, b.status
        FROM bookings b
        WHERE b.student_id = ANY(${ids}::int[])
        ORDER BY b.student_id, b.created_at DESC
      `;
      const statusById = new Map(statusRows.map(r => [r.student_id, r.status]));
      for (const s of data) (s as any).bookingStatus = statusById.get(s.id) || null;
    }

    return {
      data,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
      nationalities,
      agencies,
      sortBy,
      sortDir: sortDirAsc ? 'asc' : 'desc',
    };
  }

  async function getById(id: number) {
    return prisma.student.findUnique({
      where: { id },
      include: {
        bookings: {
          include: {
            agency: true,
            courses: true,
            // Closed/junior group membership lives on the booking (group_id).
            // Surfaced so the student profile can show a "Group: …" chip.
            group: { select: { id: true, name: true, groupType: true } },
            // Include the matched bed → room → property → provider so the
            // booking's Host Family line can surface WHO the student was
            // placed with (name + address) once matching is done.
            accommodations: {
              include: {
                bed: { include: { room: { include: { property: { include: { provider: true } } } } } },
              },
            },
            extras: {
              where: { active: true },
              orderBy: { scheduledAt: 'asc' },
            },
            // Instalment ledger presence = LifePass booking (€997 + 25×€297).
            // Count only — drives the "LifePass" badge in the student overview.
            _count: { select: { paymentInstalments: true } },
          },
          orderBy: { serviceStart: 'desc' },
        },
        // Class assignments — surfaced on the Learning tab so DOS can see at
        // a glance which class(es) the student is in. Includes class label
        // info for inline rendering without a second round-trip.
        classAssignments: {
          orderBy: { weekStart: 'desc' },
          include: {
            class_: { select: { id: true, name: true, level: true, session: true } },
          },
        },
      },
    });
  }

  async function create(data: Record<string, any>) {
    parseDates(data);
    // Auto-set studentType from DOB if not explicitly provided
    if (!data.studentType && data.birthday) {
      const dob = new Date(data.birthday);
      const age = Math.floor((Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
      data.studentType = age < 16 ? 'JUNIOR' : 'ADULT';
    }
    if (data.groupId) data.groupId = parseInt(data.groupId);
    // Derive Mother Tongue from Nationality when not supplied (fill-only — never
    // overwrite an explicit value). Uses the langmap (data/lang-map.json).
    if ((data.language == null || data.language === '') && data.nationality) {
      const { languageForNationality } = await import('../lib/nationality-language');
      const lang = languageForNationality(data.nationality);
      if (lang) data.language = lang;
    }
    return prisma.student.create({ data: data as any });
  }

  async function update(id: number, data: Record<string, any>) {
    // `email` is a required (NOT NULL) column but many legacy/junior students
    // carry an empty string. The admin form's blanket ''→null cleanup would try
    // to null it and Prisma rejects the whole update — silently blocking every
    // OTHER field (e.g. nationality) on emailless students. Never null email:
    // coerce a null/undefined back to '' so the save goes through unchanged.
    if (Object.prototype.hasOwnProperty.call(data, 'email') && data.email == null) {
      data.email = '';
    }
    // Admin manual placement, folded into the normal Save: choosing a level in
    // the (admin-only, un-placed-only) "Placement Score" dropdown marks the
    // student as placed — it stamps placementTestLevel (the "skip the test" flag
    // the app reads) + the entry currentLevel + the date. HARD GUARD: never
    // overwrite a REAL test result (placementTestScore set) — that would leave a
    // level/score mismatch. A blank selection is a no-op.
    if (Object.prototype.hasOwnProperty.call(data, 'manualPlacementLevel')) {
      const lvl = String(data.manualPlacementLevel || '').trim().toUpperCase();
      delete data.manualPlacementLevel;
      if (/^(A[012]|B[12]|C[12])$/.test(lvl)) {
        const cur = await prisma.student.findUnique({ where: { id }, select: { placementTestScore: true } });
        if (cur?.placementTestScore == null) {   // only when not placed by a real test
          data.placementTestLevel = lvl;
          data.currentLevel = lvl;
          data.placementTestDate = new Date();
        }
      }
    }
    const levelTouched = Object.prototype.hasOwnProperty.call(data, 'currentLevel')
                      || Object.prototype.hasOwnProperty.call(data, 'nationality');
    // Pull out the level-change side-channel fields. effectiveFrom + changedBy
    // are written to student_level_changes; the student row itself only
    // carries the new currentLevel.
    const incomingLevel = Object.prototype.hasOwnProperty.call(data, 'currentLevel') ? data.currentLevel : undefined;
    const effectiveFrom = data.effectiveFrom ? new Date(data.effectiveFrom) : null;
    const changedBy = data.changedBy || null;
    delete data.effectiveFrom;
    delete data.changedBy;
    // Single source of truth — same column powers Personal Details (admin +
    // student app) AND the Challenges/Ambassador flow. Strip the @ prefix on
    // the way in so admin entries stay consistent with the student-app input
    // (which already strips it).
    if ('instagramHandle' in data) {
      const h = (data.instagramHandle || '').toString().trim();
      data.instagramHandle = h ? h.replace(/^@/, '') : null;
    }
    // Beta-access flag — the admin form posts it as a string ('true'/'Yes'); coerce.
    if ('beta' in data) {
      const b = data.beta;
      data.beta = (b === true || b === 'true' || b === 'Yes' || b === 'yes' || b === '1' || b === 'on');
    }
    // Detect a Pending/InAppeal → Approved visa transition so we can apply
    // the +4-week minimum-notice shunt (T&C: ULearn requires four weeks to
    // arrange accommodation between visa approval and arrival).
    const visaStatusIncoming = Object.prototype.hasOwnProperty.call(data, 'visaStatus') ? data.visaStatus : undefined;
    let prevVisaStatus: string | null | undefined;
    let prevLevel: string | null | undefined;
    if (visaStatusIncoming !== undefined || incomingLevel !== undefined) {
      const before = await prisma.student.findUnique({
        where: { id },
        select: { visaStatus: true, currentLevel: true },
      });
      prevVisaStatus = before?.visaStatus;
      prevLevel = before?.currentLevel;
    }

    let result = await prisma.student.update({ where: { id }, data: parseDates(data) as any });
    if (levelTouched) {
      try { await autoFillIlepForStudent(prisma, id); } catch (e) { console.error('autoFillIlep failed', e); }
    }

    // Append history row if the level actually changed. effectiveFrom defaults
    // to today when the caller didn't supply one (e.g. student profile form
    // edit); inline class-roster moves pass the week-start they were viewing.
    const newLevel = (incomingLevel === undefined ? prevLevel : incomingLevel) ?? null;
    if (incomingLevel !== undefined && (prevLevel ?? null) !== newLevel) {
      try {
        await prisma.studentLevelChange.create({
          data: {
            studentId: id,
            fromLevel: prevLevel ?? null,
            toLevel: newLevel,
            effectiveFrom: effectiveFrom || new Date(),
            changedBy,
          },
        });
      } catch (e) { console.error('record level change failed', e); }
    }

    // Visa just approved? Walk the student's future bookings and ensure the
    // arrival date sits ≥ 28 days away. If it doesn't, push every related
    // date (booking serviceStart/End, course start/end, accommodation start/end)
    // by the same delta so durations are preserved.
    const isApprovalTransition =
      visaStatusIncoming === 'Approved' &&
      (prevVisaStatus === 'Pending' || prevVisaStatus === 'Appeal');
    if (isApprovalTransition) {
      try { await applyVisaApprovalShunt(id); } catch (e) { console.error('visa approval shunt failed', e); }
      // Re-read so the response reflects shuntAppliedAt — the client uses
      // this to decide whether to surface the live notification card.
      result = await prisma.student.findUnique({ where: { id } }) ?? result;
    }
    return result;
  }

  async function applyVisaApprovalShunt(studentId: number) {
    const today = new Date(); today.setUTCHours(0, 0, 0, 0);
    // Earliest legal arrival per ULearn T&Cs: 28 days from today.
    const earliest = new Date(today.getTime() + 28 * 24 * 60 * 60 * 1000);
    // School policy: accommodation check-in only on Sat/Sun, course start
    // only on the following Monday. Compute the canonical accom + course
    // anchor dates separately so we don't drag a course start onto, say,
    // a Wednesday.
    const accomAnchor = nextWeekend(earliest);   // Saturday on/after earliest
    const courseAnchor = nextMonday(accomAnchor); // Monday after that Saturday

    // ENTRY GATE: only operate on bookings that have at least one
    // accommodation row. The 4-week notice rule exists because we need
    // the time to arrange a host family / apartment placement; if the
    // student is course-only (self-arranged accom or none), there's
    // nothing for ULearn to schedule, so no shunt and no CTA.
    const bookings = await prisma.booking.findMany({
      where: {
        studentId,
        status: { not: 'CANCELLED' },
        accommodations: { some: {} },
      },
      include: { courses: true, accommodations: true },
    });
    if (bookings.length === 0) {
      console.log(`[visa-shunt] student ${studentId}: no accommodation on any booking — skipping shunt + CTA`);
      return;
    }

    let shuntCount = 0;
    // Capture the pre-shunt arrival date BEFORE we touch any rows. Use the
    // earliest accom startDate across candidate bookings — that's what the
    // student was told their provisional arrival date was.
    let originalArrival: Date | null = null;
    for (const b of bookings) {
      for (const a of b.accommodations) {
        if (a.startDate && a.startDate < accomAnchor) {
          if (!originalArrival || a.startDate < originalArrival) originalArrival = a.startDate;
        }
      }
    }
    for (const b of bookings) {
      // Determine the effective current arrival date — prefer booking.serviceStart,
      // fall back to earliest course/accom start. Anything already ≥ accomAnchor
      // (i.e., already at least 4 weeks out + on a Saturday) is a no-op.
      const candidateStarts: Date[] = [];
      if (b.serviceStart) candidateStarts.push(b.serviceStart);
      for (const c of b.courses) if (c.startDate) candidateStarts.push(c.startDate);
      for (const a of b.accommodations) if (a.startDate) candidateStarts.push(a.startDate);
      if (candidateStarts.length === 0) continue;
      const effectiveStart = candidateStarts.sort((a, b) => a.getTime() - b.getTime())[0];
      if (effectiveStart >= accomAnchor) continue;

      // Per-axis deltas: accom uses Saturday anchor, course uses Monday anchor.
      // Source the delta from any row that's pre-anchor — past-dated rows
      // included. Visa delays often mean the original provisional dates
      // have already elapsed; pushing them forward is precisely the recovery
      // we need. The accommodation matching pool filters out past-dated rows
      // separately so this won't pollute operational views.
      const accomToShift  = b.accommodations.find(a => a.startDate && a.startDate < accomAnchor);
      const courseToShift = b.courses.find(c => c.startDate && c.startDate < accomAnchor);
      const accomDeltaMs  = accomToShift?.startDate
        ? accomAnchor.getTime() - accomToShift.startDate.getTime()
        : 0;
      const courseDeltaMs = courseToShift?.startDate
        ? courseAnchor.getTime() - courseToShift.startDate.getTime()
        : 0;
      const bookingDeltaMs = accomDeltaMs || courseDeltaMs;
      const shiftBy = (d: Date | null, deltaMs: number) =>
        d ? new Date(d.getTime() + deltaMs) : null;

      // If booking.serviceStart was null, populate it to the accom anchor so
      // the booking now has a coherent arrival date. If it was set, shift by
      // the same delta as the accom (or course, fallback) row.
      const newServiceStart = b.serviceStart
        ? shiftBy(b.serviceStart, bookingDeltaMs)!
        : (b.accommodations[0]?.startDate ? accomAnchor : courseAnchor);
      const newServiceEnd = shiftBy(b.serviceEnd, bookingDeltaMs);

      await prisma.booking.update({
        where: { id: b.id },
        data: { serviceStart: newServiceStart, serviceEnd: newServiceEnd },
      });
      // Shift any pre-anchor row — including past-dated ones (visa delay
      // recovery). Already-future-enough rows (already ≥ accomAnchor) stay put.
      for (const c of b.courses) {
        if (!c.startDate || c.startDate >= accomAnchor) continue;
        const patch: any = {};
        const cs = shiftBy(c.startDate, courseDeltaMs);
        const ce = shiftBy(c.endDate, courseDeltaMs);
        if (cs) patch.startDate = cs;
        if (ce) patch.endDate = ce;
        if (Object.keys(patch).length > 0) await prisma.bookingCourse.update({ where: { id: c.id }, data: patch });
      }
      for (const a of b.accommodations) {
        if (!a.startDate || a.startDate >= accomAnchor) continue;
        const patch: any = {};
        const as = shiftBy(a.startDate, accomDeltaMs);
        const ae = shiftBy(a.endDate, accomDeltaMs);
        if (as) patch.startDate = as;
        if (ae) patch.endDate = ae;
        if (Object.keys(patch).length > 0) await prisma.bookingAccommodation.update({ where: { id: a.id }, data: patch });
      }

      const days = Math.round(bookingDeltaMs / 86400000);
      console.log(`[visa-shunt] student ${studentId} booking ${b.id}: +${days}d  accom→${accomAnchor.toISOString().slice(0,10)} (Sat)  course→${courseAnchor.toISOString().slice(0,10)} (Mon)`);
      shuntCount++;
    }

    if (shuntCount > 0) {
      await prisma.student.update({
        where: { id: studentId },
        data: {
          visaApprovalShuntAppliedAt: new Date(),
          visaShuntOriginalArrival: originalArrival,
          visaShuntNewArrival: accomAnchor,
        } as any,
      });
      // INTENTIONALLY NO auto-send. The CTA card is the only path; staff
      // must click Preview → Send manually. A previous version auto-sent
      // here and that was a bad call — visa workflow is too sensitive for
      // background email firing. Do NOT re-add without explicit approval.
    }
  }

  // Next Saturday on or after the given date. If `d` is already a Saturday,
  // returns d unchanged. Operates in UTC to match Prisma date semantics.
  function nextWeekend(d: Date): Date {
    const r = new Date(d.getTime());
    r.setUTCHours(0, 0, 0, 0);
    const dow = r.getUTCDay(); // 0=Sun..6=Sat
    const offset = (6 - dow + 7) % 7; // days to next Saturday
    r.setUTCDate(r.getUTCDate() + offset);
    return r;
  }

  // Next Monday strictly after the given date (i.e., not the same day).
  function nextMonday(d: Date): Date {
    const r = new Date(d.getTime());
    r.setUTCHours(0, 0, 0, 0);
    const dow = r.getUTCDay();
    const offset = ((1 - dow + 7) % 7) || 7; // 1..7 days, never 0
    r.setUTCDate(r.getUTCDate() + offset);
    return r;
  }

  async function remove(id: number) {
    // Cascade: delete child records first
    const bookings = await prisma.booking.findMany({ where: { studentId: id }, select: { id: true } });
    const bookingIds = bookings.map(b => b.id);
    if (bookingIds.length > 0) {
      await prisma.bookingStatusHistory.deleteMany({ where: { bookingId: { in: bookingIds } } });
      await prisma.bookingHoliday.deleteMany({ where: { bookingId: { in: bookingIds } } });
      const courseIds = (await prisma.bookingCourse.findMany({ where: { bookingId: { in: bookingIds } }, select: { id: true } })).map(c => c.id);
      if (courseIds.length > 0) {
        await prisma.studentClassAssignment.deleteMany({ where: { bookingCourseId: { in: courseIds } } });
      }
      await prisma.bookingCourse.deleteMany({ where: { bookingId: { in: bookingIds } } });
      await prisma.bookingAccommodation.deleteMany({ where: { bookingId: { in: bookingIds } } });
      await prisma.booking.deleteMany({ where: { id: { in: bookingIds } } });
    }
    await prisma.studentClassAssignment.deleteMany({ where: { studentId: id } });
    await prisma.attendance.deleteMany({ where: { studentId: id } });
    return prisma.student.delete({ where: { id } });
  }

  // ── Visa-approval 4-week notice ───────────────────
  // Renders the seeded "Visa-Approval-Notice" email template against the
  // student + their earliest future booking. Used by both the preview
  // endpoint and the send pathway so what staff sees in the modal is
  // exactly what gets emailed.
  async function renderVisaApprovalNotice(studentId: number): Promise<string> {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      select: {
        id: true, firstName: true, lastName: true, email: true,
        visaShuntOriginalArrival: true, visaShuntNewArrival: true,
      } as any,
    }) as any;
    if (!student) throw new Error('Student not found');

    const tpl = await prisma.documentTemplate.findFirst({
      where: emailTemplateWhere('Visa-Approval-Notice'),
    });
    if (!tpl) throw new Error('Template "Visa-Approval-Notice" not seeded — run seed-templates.');

    // Pull both dates from the columns the shunt stamped at firing time.
    // Fall back to the booking record only if the shunt-captured fields are
    // missing (legacy data — students whose shunt fired before these
    // columns existed). Format DD/MM/YYYY for the email body.
    const today = new Date(); today.setUTCHours(0, 0, 0, 0);
    const fmt = (d: Date | null | undefined) => d
      ? d.toISOString().slice(0, 10).split('-').reverse().join('/')
      : '';
    let newArrival: Date | null = student.visaShuntNewArrival ?? null;
    let originalArrival: Date | null = student.visaShuntOriginalArrival ?? null;
    if (!newArrival) {
      // Legacy fallback: read from the most recent shunted booking.
      const b = await prisma.booking.findFirst({
        where: { studentId, serviceStart: { gt: today }, status: { not: 'CANCELLED' } },
        orderBy: { serviceStart: 'asc' },
      });
      newArrival = b?.serviceStart ?? null;
    }
    if (!newArrival) throw new Error('No upcoming arrival date found — cannot render notice.');

    const tokens: Record<string, string> = {
      'student.first_name': student.firstName,
      'student.last_name': student.lastName ?? '',
      'booking.start_date': fmt(newArrival),
      'booking.original_start_date': fmt(originalArrival),
      'document.issue_date': fmt(today),
      'document.number': `VAN-${student.id}-${Date.now().toString(36)}`,
    };
    let html = tpl.htmlTemplate;
    for (const [k, v] of Object.entries(tokens)) {
      html = html.split(`{{${k}}}`).join(v);
    }
    return html;
  }

  async function sendVisaApprovalNotice(studentId: number) {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      select: {
        id: true, firstName: true, lastName: true, email: true,
        visaApprovalShuntAppliedAt: true, visaApprovalNoticeSentAt: true,
      } as any,
    }) as any;
    if (!student) throw new Error('Student not found');
    if (!student.email) throw new Error('Student has no email on file');
    if (student.visaApprovalNoticeSentAt) {
      throw new Error(`Notice already sent at ${student.visaApprovalNoticeSentAt.toISOString()}. Refusing to re-send.`);
    }
    if (!student.visaApprovalShuntAppliedAt) {
      throw new Error('No visa-approval shunt has fired for this student — nothing to send.');
    }

    const html = await renderVisaApprovalNotice(studentId);
    const subject = `Visa Approval — your new earliest arrival date for ULearn Dublin`;
    const tpl = await prisma.documentTemplate.findFirst({
      where: emailTemplateWhere('Visa-Approval-Notice'), select: { id: true },
    });

    // Same pathway as every other staff-sent email: signature gets
    // appended, message ships via Gmail, gets logged to email_log.
    const result = await sendStudentEmail(prisma, {
      from: 'success@ulearnschool.com',
      fromName: 'ULearn Success Team',
      to: student.email,
      subject,
      html,
      studentId,
      templateId: tpl?.id ?? null,
    });

    // Stamp idempotency timestamp ONLY after the email actually went out.
    await prisma.student.update({
      where: { id: studentId },
      data: { visaApprovalNoticeSentAt: new Date() } as any,
    });

    console.log(`[visa-notice] sent to ${student.email} (msg ${result.messageId})`);
    return { sent: true, to: student.email, messageId: result.messageId };
  }

  // Admin-only: clears the sent-at stamp so the inline CTA re-surfaces and
  // the email can be re-sent (bounced, missed, or staff just wants another
  // copy out). Does NOT touch booking dates and does NOT re-run the shunt —
  // the shunt is a one-shot side-effect, the CTA is the recoverable bit.
  async function resetVisaNoticeState(studentId: number) {
    await prisma.student.update({
      where: { id: studentId },
      data: { visaApprovalNoticeSentAt: null } as any,
    });
    return { reset: true };
  }

  // ── Students in school report ─────────────────────────────────────────
  // Every student whose active booking_course OVERLAPS the date range,
  // joined with the class assignment (if any) intersecting that range,
  // plus the booking status and dates. Diagnostic answer to "who's actually
  // here this week and where are they (or not) placed?" — built to triage
  // the 61-unassigned-pool mystery. Excludes ESCROW + CANCELLED bookings
  // (shadow / dead), but INCLUDES partial-paid + pending so the full
  // population is visible.
  async function studentsInSchool(from: string, to: string) {
    // UTC parse — @db.Date course dates are UTC midnight; local-midnight on a Dublin DST
    // server shifts the window a day early and leaks already-finished bookings (off-by-one).
    const fromDate = new Date(from + 'T00:00:00Z');
    const toDate = new Date(to + 'T23:59:59Z');
    const rows = await prisma.bookingCourse.findMany({
      where: {
        active: true,
        startDate: { lte: toDate },
        endDate:   { gte: fromDate },
        booking: {
          status: { notIn: ['ESCROW', 'CANCELLED'] },
          // Exclude commercially-empty bookings — €0 total + €0 paid = a draft
          // placeholder, not a real enrolment. ID 926 (Bundkhorol) was the
          // canonical case: PENDING, charged nothing, paid nothing, sitting on
          // the report as a phantom "in school" student. A real comp/freebie
          // would still carry a nominal total; €0/€0 is the ghost signature.
          amountTotal: { gt: 0 },
        },
      },
      select: {
        id: true, name: true, startDate: true, endDate: true, category: true, level: true,
        booking: {
          select: {
            id: true,
            status: true,
            amountPaid: true, amountTotal: true,
            serviceStart: true, serviceEnd: true,
            student: {
              select: {
                id: true, firstName: true, lastName: true, nationality: true,
                currentLevel: true,
                classAssignments: {
                  where: {
                    weekStart: { lte: toDate },
                    OR: [{ weekEnd: null }, { weekEnd: { gte: fromDate } }],
                  },
                  select: {
                    weekStart: true, weekEnd: true,
                    class_: { select: { id: true, name: true, level: true, session: true } },
                  },
                  orderBy: { weekStart: 'desc' },
                  take: 1,
                },
              },
            },
            payments: {
              where: {
                amount: { gt: 0 },
                AND: [
                  { OR: [{ type: null }, { type: { not: 'Escrow' } }] },
                  { OR: [{ method: null }, { method: { not: 'TransferMate Escrow' } }] },
                ],
              },
              select: { amount: true },
            },
          },
        },
      },
      orderBy: [{ startDate: 'asc' }],
    });
    // Dedup by student id — a student with two overlapping booking_courses
    // shouldn't double up. Keep the earliest-starting course (the canonical
    // "current" enrolment).
    const seen = new Set<number>();
    const out: any[] = [];
    for (const r of rows) {
      const sid = r.booking?.student?.id;
      if (!sid || seen.has(sid)) continue;
      seen.add(sid);
      const s = r.booking!.student;
      const realPaid = (r.booking!.payments || []).reduce((sum: number, p: any) => sum + Number(p.amount || 0), 0);
      const total = Number(r.booking!.amountTotal || 0);
      // payment-status classification mirrors what the matching engines use.
      let payState: 'paid' | 'partial' | 'unpaid' = 'unpaid';
      if (realPaid > 0) {
        payState = (total > 0 && (total - realPaid) > 0.01) ? 'partial' : 'paid';
      }
      const ca = (s as any).classAssignments?.[0] || null;
      const c = ca?.class_ || null;
      out.push({
        studentId: sid,
        firstName: s.firstName,
        lastName: s.lastName,
        nationality: s.nationality,
        level: s.currentLevel,
        bookingId: r.booking!.id,
        bookingStatus: r.booking!.status,
        bookingPayState: payState,
        bookingPaidReal: realPaid,
        bookingTotal: total,
        courseName: r.name,
        courseStart: r.startDate,
        courseEnd: r.endDate,
        courseCategory: r.category,
        classId: c?.id || null,
        className: c?.name || null,
        classLevel: c?.level || null,
        classSession: c?.session || null,
      });
    }
    return out;
  }

  // QQI / IEMAS learner-week report for a calendar year. Learner weeks = each
  // course's tuition weeks prorated into the year. CLEANED basis: enrolled
  // learners only (status CONFIRMED/PARTIAL), excluding spurious quotations
  // (null-status, €≤120 deposit-only proforma shells) and test bookings.
  // International learners only (Irish/GB/NI excluded). Programme + nationality
  // totals match by construction. See .claude/docs/reports/qqi-2024-learner-weeks.md.
  async function qqiLearnerWeeks(year: number) {
    const Y0 = new Date(`${year}-01-01`), Y1 = new Date(`${year}-12-31`), DAY = 86400000;
    const od = (s: any, e: any) => { if (!s || !e) return 0; const a = Math.max(+new Date(s), +Y0), b = Math.min(+new Date(e), +Y1); return b < a ? 0 : Math.round((b - a) / DAY) + 1; };
    const sp = (s: any, e: any) => (!s || !e) ? 0 : Math.round((+new Date(e) - +new Date(s)) / DAY) + 1;
    const IEGB = new Set(['IE','IRL','IRELAND','IRISH','GB','UK','GBR','UNITED KINGDOM','GREAT BRITAIN','BRITISH','NI','NORTHERN IRELAND','ENGLAND','SCOTLAND','WALES']);
    const natMap: Record<string,string> = { 'Türkiye':'Turkey','Czechia':'Czech Republic','Palestinian Territories':'Palestine','Congo - Kinshasa':'Congo (DR)','Congo':'Congo (DR)','Congo - Brazzaville':'Congo (Rep.)' };
    const prog = (n: string) => {
      if (/IELTS/i.test(n)) return { p:'IELTS Preparation', a:'IELTS' };
      if (/\bFCE\b/i.test(n)) return { p:'Cambridge B2 First (FCE)', a:'Cambridge English: First (B2)' };
      if (/\bCAE\b/i.test(n)) return { p:'Cambridge C1 Advanced (CAE)', a:'Cambridge English: Advanced (C1)' };
      if (/JUNIOR|Young Learner/i.test(n)) return { p:'Junior / Young Learners (Closed Groups)', a:'N/A' };
      if (/Private|1 to 1/i.test(n)) return { p:'One-to-One (Private Lessons)', a:'N/A' };
      if (/Academic Year/i.test(n)) return { p:'Academic Year (General English)', a:'N/A' };
      return { p:'General English', a:'N/A' };
    };
    const courses = await prisma.bookingCourse.findMany({
      where: { startDate: { lte: Y1 }, endDate: { gte: Y0 } },
      include: { booking: { select: { status: true, amountTotal: true, student: { select: { nationality: true, firstName: true, lastName: true } } } } },
    });
    const byProg: Record<string, number> = {}, byNat: Record<string, number> = {}, awards: Record<string, string> = {};
    let total = 0, exProforma = 0, exTest = 0;
    for (const c of courses) {
      const o = od(c.startDate, c.endDate); if (o <= 0) continue;
      const s = sp(c.startDate, c.endDate);
      const w = (c.weeks && c.weeks > 0 && s > 0) ? c.weeks * (o / s) : o / 7;
      let nat = (c.booking?.student?.nationality || '').trim();
      if (!nat || IEGB.has(nat.toUpperCase())) continue;
      const st = c.booking?.status, tot = Number(c.booking?.amountTotal || 0);
      const nm = `${c.booking?.student?.firstName || ''} ${c.booking?.student?.lastName || ''}`.toLowerCase();
      if (/test/.test(nm)) { exTest += w; continue; }
      if (st !== 'CONFIRMED' && st !== 'PARTIAL') continue;
      if (tot > 0 && tot <= 120) { exProforma += w; continue; }
      nat = natMap[nat] || nat;
      const pg = prog(c.name);
      total += w; byProg[pg.p] = (byProg[pg.p] || 0) + w; awards[pg.p] = pg.a; byNat[nat] = (byNat[nat] || 0) + w;
    }
    const order = ['General English','Academic Year (General English)','IELTS Preparation','Cambridge B2 First (FCE)','Cambridge C1 Advanced (CAE)','Junior / Young Learners (Closed Groups)','One-to-One (Private Lessons)'];
    const programmes = order.filter(p => byProg[p] != null).map(p => ({ programme: p, length: 'RE', award: awards[p], weeks: Math.round(byProg[p]) }));
    const nationalities = Object.entries(byNat).sort((a, b) => a[0].localeCompare(b[0])).map(([nationality, w]) => ({ nationality, weeks: Math.round(w) }));
    return { year, basis: 'Enrolled learners (CONFIRMED/PARTIAL); excludes proforma/quotations + test; intl only (IE/GB/NI excluded); weeks prorated into calendar year.', total: Math.round(total), excludedProformaWeeks: Math.round(exProforma), excludedTestWeeks: Math.round(exTest), programmes, nationalities };
  }

  return { list, getById, create, update, remove, renderVisaApprovalNotice, sendVisaApprovalNotice, resetVisaNoticeState, studentsInSchool, qqiLearnerWeeks };
}
