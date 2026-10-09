// ILEP holiday-timing rules for Academic Year students, measured in NOMINAL
// weeks from the course start (the 35-week visa year). Per ILEP:
//   · weeks 1–2   : no holidays permitted
//   · weeks 3–25  : at most 6 weeks (the tuition block)
//   · weeks 26–35 : at most 4 weeks (the tail the student must retain)
// 6 + 4 = the 10-week entitlement, but split so 4 weeks are held back for after
// tuition. Week numbering is relative to the course start (courses start Monday,
// holidays start Monday, so the offset is a whole number of weeks).

export const ILEP_TUITION_CAP = 6;   // weeks 3–25
export const ILEP_TAIL_CAP = 4;      // weeks 26–35

// Split a holiday (start Monday + N whole weeks) into ILEP buckets by the week
// number of each of its weeks relative to the course start.
export function classifyIlepHoliday(courseStart: Date, holStart: Date, weeks: number): {
  startWeek: number; firstTwo: number; tuition: number; tail: number; beyond: number;
} {
  const diffDays = Math.round((+holStart - +courseStart) / 86400000);
  const startWeek = Math.floor(diffDays / 7) + 1;   // week 1 = the course-start week
  let firstTwo = 0, tuition = 0, tail = 0, beyond = 0;
  for (let i = 0; i < Math.max(0, weeks); i++) {
    const wk = startWeek + i;
    if (wk <= 2) firstTwo++;
    else if (wk <= 25) tuition++;
    else if (wk <= 35) tail++;
    else beyond++;
  }
  return { startWeek, firstTwo, tuition, tail, beyond };
}

// Validate a proposed holiday against the ILEP caps, given the existing holidays
// already recorded on the same course. Returns { ok } or { ok:false, error }.
export function checkIlepAllowance(
  courseStart: Date,
  existing: { startDate: Date | string; weeks: number | null }[],
  newStart: Date,
  newWeeks: number,
): { ok: true } | { ok: false; error: string } {
  const nc = classifyIlepHoliday(courseStart, newStart, newWeeks);
  if (nc.firstTwo > 0) {
    return { ok: false, error: 'Holidays aren’t permitted in the first 2 weeks of the course (ILEP rule).' };
  }
  let tuitionUsed = 0, tailUsed = 0;
  for (const h of existing) {
    const c = classifyIlepHoliday(courseStart, new Date(h.startDate), h.weeks || 0);
    tuitionUsed += c.tuition; tailUsed += c.tail;
  }
  if (tuitionUsed + nc.tuition > ILEP_TUITION_CAP) {
    return { ok: false, error: `ILEP allows at most ${ILEP_TUITION_CAP} holiday weeks during the course (weeks 3–25)${tuitionUsed ? ` — you've already used ${tuitionUsed}` : ''}. Keep the other 4 for after your course ends.` };
  }
  if (tailUsed + nc.tail > ILEP_TAIL_CAP) {
    return { ok: false, error: `ILEP allows at most ${ILEP_TAIL_CAP} holiday weeks in the final period (weeks 26–35)${tailUsed ? ` — you've already used ${tailUsed}` : ''}.` };
  }
  return { ok: true };
}
