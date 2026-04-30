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

const MORNING_AY_NAMES = new Set([
  'academic year morning',
  'academic year renewal morning',
  'ulearn renewal morn',
]);
const AFTERNOON_AY_NAMES = new Set([
  'academic year afternoon',
  'academic year renewal afternoon',
  'ulearn renewal aft',
]);

const ILEP_AM: Record<string, string> = { A2: '0318/0020', B1: '0318/0010', B2: '0318/0011', C1: '0318/0013' };
const ILEP_PM: Record<string, string> = { A2: '0318/0021', B1: '0318/0003', B2: '0318/0004', C1: '0318/0006' };

const NON_VISA_NATIONALITIES = new Set([
  'IE','GB','DE','FR','ES','IT','PT','PL','CZ','NL','BE','AT','SE','DK','FI','NO',
  'RO','HU','BG','GR','SK','SI','EE','LV','LT','IS','LU','CH','MT','CY','HR',
]);

export function deriveIlepCode(courseName: string | null, level: string | null, nationality: string | null): string | null {
  if (nationality && NON_VISA_NATIONALITIES.has(nationality.toUpperCase())) return null;
  const n = (courseName || '').toLowerCase().trim();
  const lvl = (level || '').toUpperCase().trim();
  if (!lvl) return null;
  if (MORNING_AY_NAMES.has(n))   return ILEP_AM[lvl] || null;
  if (AFTERNOON_AY_NAMES.has(n)) return ILEP_PM[lvl] || null;
  return null;
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
