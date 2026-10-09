/**
 * Pure derivation: (booking-course name + CEFR level) → ILEP programme code.
 * Returns null when the course isn't an Academic Year programme, when the level
 * isn't one we have a code for, or when the student is EU/UK/Swiss (visa letters
 * are never issued for them, so an ILEP code would be cosmetic noise).
 *
 * Used by:
 *   - backfill-ilep.ts (one-shot)
 *   - student update hook (when current_level is set/changed)
 *   - booking-course add/update hook (when a new AY course is enrolled)
 */

// Any course whose title carries "Academic Year" (or the "ULearn Renewal" AY
// aliases) is an ILEP Academic Year programme — regardless of hours (AY 15/20h,
// Intensive 30h all count) (Neil, 2026-08-27). Session is read from the title
// (Afternoon/PM → PM); everything else — Morning, Intensive, or unspecified —
// defaults to the Morning series.
function ayInfo(courseName: string | null): { isAy: boolean; session: 'AM' | 'PM' } {
  const n = (courseName || '').toLowerCase();
  // LifePass IS an Academic Year programme (3 AYs back-to-back), so it takes an
  // ILEP code too — and its course NAME may read "Life Pass Morning/Afternoon"
  // rather than "Academic Year" (Neil, 2026-08-31).
  const isAy = n.includes('academic year') || n.includes('ulearn renewal')
    || n.includes('life pass') || n.includes('lifepass');
  const isPm = /afternoon|\bpm\b|\baft\b/.test(n);
  return { isAy, session: isPm ? 'PM' : 'AM' };
}

// A2 uses the TIE/ACELS "Academic Year Morning/Afternoon A2" codes (0009 / 0002) so
// A2 sits in the same award progression as B1→C1 (TIE→PET→FCE→CAE), not the odd
// KEY/Cambridge "A2 AM/PM" codes (0020 / 0021). This is also the default the LOA
// falls back to before a placement test sets a real level (Neil, 2026-08-27).
const ILEP_AM: Record<string, string> = { A2: '0318/0009', B1: '0318/0010', B2: '0318/0011', C1: '0318/0013' };
const ILEP_PM: Record<string, string> = { A2: '0318/0002', B1: '0318/0003', B2: '0318/0004', C1: '0318/0006' };

const NON_VISA_NATIONALITIES = new Set([
  'IE','GB','DE','FR','ES','IT','PT','PL','CZ','NL','BE','AT','SE','DK','FI','NO',
  'RO','HU','BG','GR','SK','SI','EE','LV','LT','IS','LU','CH','MT','CY','HR',
]);

/** True when the course title marks it an Academic Year programme (any hours/session). */
export function isAyIlepCourse(courseName: string | null): boolean {
  return ayInfo(courseName).isAy;
}

/** True for EU/UK/Swiss nationals — they never receive visa letters, so an ILEP code is not required. */
export function isNonVisaNationality(nationality: string | null): boolean {
  return !!nationality && NON_VISA_NATIONALITIES.has(nationality.toUpperCase());
}

export function deriveIlepCode(courseName: string | null, level: string | null, nationality: string | null): string | null {
  if (nationality && NON_VISA_NATIONALITIES.has(nationality.toUpperCase())) return null;
  const { isAy, session } = ayInfo(courseName);
  if (!isAy) return null;
  // No placement test yet → default to A2 (the same default the start level takes),
  // so an AY booking always has a code and the LoA isn't blocked. An unmapped level
  // also falls back to A2.
  const lvl = (level || 'A2').toUpperCase().trim() || 'A2';
  const map = session === 'PM' ? ILEP_PM : ILEP_AM;
  return map[lvl] || map['A2'];
}

/**
 * Scan a student's booking courses and auto-fill ILEP codes where:
 *   - ilepCode is currently null (manual values are never overwritten)
 *   - the course is an AY programme + the level can be determined
 *
 * Idempotent — calling repeatedly with no eligible rows is a no-op.
 */
export async function autoFillIlepForStudent(prisma: any, studentId: number) {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    select: { id: true, currentLevel: true, nationality: true },
  });
  if (!student) return { filled: 0 };

  const candidates = await prisma.bookingCourse.findMany({
    where: { ilepCode: null, booking: { studentId } },
    select: { id: true, name: true, level: true },
  });

  let filled = 0;
  for (const c of candidates) {
    const effectiveLevel = c.level || student.currentLevel;
    const code = deriveIlepCode(c.name, effectiveLevel, student.nationality);
    if (code) {
      await prisma.bookingCourse.update({ where: { id: c.id }, data: { ilepCode: code } });
      filled++;
    }
  }
  return { filled };
}
