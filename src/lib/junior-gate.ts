/**
 * Junior safeguarding gate (Neil 2026-10-10).
 *
 * Garda vetting is required for hosts of JUNIORS, not adults. A student who is
 * under JUNIOR_AGE on the stay's ARRIVAL date may only be offered to, claimed by,
 * or placed with a host family whose vetting is COMPLETE. Adult-only hosting
 * needs no vetting. Unknown date of birth is treated as a junior (fail safe).
 *
 * Used by: host-portal (pool card + claim), accommodation.placeStudent (and so
 * acceptClaim), auto-nudge (non-vetted hosts are matched to the adult pool only).
 */
export const JUNIOR_AGE = 18;

const PHASE: Record<string, number> = { none: 0, form: 1, upload: 2, complete: 3, returned: 3 };

/** GV phase 0..3 — manual vettingStatus wins; else derived from the submissions. */
export function gvPhase(vettingStatus: string | null | undefined, subs: { status: string }[] | null | undefined): number {
  if (vettingStatus != null) return PHASE[vettingStatus] ?? 0;
  if (!subs || !subs.length) return 0;
  if (subs.some(s => s.status === 'submitted')) return 1;
  if (subs.some(s => s.status === 'signed')) return 2;
  return 3;
}
export const gvComplete = (vettingStatus: string | null | undefined, subs: { status: string }[] | null | undefined) =>
  gvPhase(vettingStatus, subs) === 3;

/** Whole years old on `at` (default now); null when the birthday is missing/invalid. */
export function ageAt(birthday: Date | string | null | undefined, at?: Date | string | null): number | null {
  if (!birthday) return null;
  const b = new Date(birthday), a = at ? new Date(at) : new Date();
  if (isNaN(b.getTime())) return null;
  let age = a.getUTCFullYear() - b.getUTCFullYear();
  const m = a.getUTCMonth() - b.getUTCMonth();
  if (m < 0 || (m === 0 && a.getUTCDate() < b.getUTCDate())) age--;
  return age;
}

/** Under JUNIOR_AGE on `at` (the arrival date). No birthday → junior. */
export function isJuniorAt(birthday: Date | string | null | undefined, at: Date | string | null | undefined): boolean {
  const age = ageAt(birthday, at);
  return age === null || age < JUNIOR_AGE;
}

export const JUNIOR_GV_MESSAGE =
  'This student is under 18 on arrival, so Garda vetting must be complete before you can host them.';
