# Issue 2 — Andrea Michelle Diaz Moreno & Ignacio Giovanelli Barrio
Reporter: AC (Antonella) · Area: Booking / Holidays · Sheet row 3

## Symptom
Holiday requests weren't split into the existing course; SIS created a NEW course on the return date (per Antonella's email re Andrea). Plus questions on the Christmas split + an unexplained June holiday.

## Andrea (student 918, bk1468) — data
Courses: 1614 AY Morning **08/12/2025→19/12/2025** (pre-Xmas), 1615 AY Morning **05/01/2026→09/07/2026** (post-Xmas).
Holidays (chronological):
- **#1** id190 22/12/2025→04/01/2026 · type=student · weeks=2 · weekdaysPushed=**null** · created 06/04/2026  (Christmas)
- **#2** id2440 04/05/2026→22/05/2026 · type=student · weeks=3 · weekdaysPushed=**15** · created 04/06/2026
- **#3** id2441 15/06/2026→21/06/2026 · type=student · weeks=1 · weekdaysPushed=**5** · created 04/06/2026

## Analysis — the 1-day gap was a REAL BUG (timezone), now fixed
Neil was right to push on it. Root cause = a **DST/timezone off-by-one in the shunt's weekday math** (not the baseline, not Fidelo). The weekday helpers used local-time methods (`setHours/getDay/setDate`) on `@db.Date` (UTC-midnight) values; on the Dublin-time server (UTC+1 in summer) any shunt **landing on a summer date saved one day early**. Winter shunts were always correct — which is why it hid.
- Andrea's correct end is **Fri 10/07/2026**; it was stored Thu 09/07 (1 short). **Now corrected to 10/07.**
- Fixed in `scripts/bookings.ts` (addHoliday path) + `scripts/christmas-shunt.ts`, all math moved to UTC. See [[reference_utc_date_math]].
- Full recompute run 2026-06-05: 2,607 AY course-ends already correct, **19 corrected** (+1..+5 d), 56 flagged for manual review (`MigrationCleanup/holiday-recompute-applied-20260605.json`). Hol#3 confirmed legit by Antonella (kept).
- **#1 Christmas is mis-tagged `type=student`** but is a school-enforced break. It pushes nothing (sits in the gap between courses) which is correct, but the tag is wrong → (a) it won't show the new "School Hols" badge, (b) it risks counting 2wks against her 10-week personal holiday entitlement.
- **#3 (15–21 Jun)** — **Antonella confirmed legit** (student request, she assigned it 04/06, matching the created date). Keep as-is.

## Ignacio (student 968, bk1519)
Rogue return-date course already gone. Courses Jan12→Feb20 + Mar02→**Aug25**; the Apr27–May3 week was never shunted (end should be ~Sep01). Separate from Andrea.

## Fix recipe — NOT YET RUN (needs Neil)
1. **Strategy (Neil's preferred, endorsed):** retain the Fidelo Christmas split + Holiday #1; manage 2026-onward via shunts. No historical merge.
2. **Re-tag Andrea Christmas #1** `type: student → school`:
```js
// node --env-file=.env -e '...prisma.bookingHoliday.update({where:{id:190},data:{type:"school"}})...'
```
   (Then it shows "School Hols" and is excluded from her 10-wk entitlement.)
3. **#3 (15–21 Jun): confirmed legit by Antonella — no action.**
4. **Ignacio:** confirm + shunt the Apr27–May3 week (end Aug25→~Sep01) via addHoliday.

## Risk / category
bookings · single-student edits · reversible. Andrea's dates are already essentially correct.

## Status
Andrea: VERIFIED correct (Hol#3 confirmed legit by Antonella). Optional tidy: re-tag Xmas.
Ignacio: ALL holidays shunted. hol2438 weekdays_pushed=5, hol2439 weekdays_pushed=30.
Course c1695 ends 2026-08-28 = correct (accounts for both student holidays). Jun8 urgency RESOLVED.
Residual: re-tag hol217 type:student->school (cosmetic, low-pri).
Last checked 2026-06-05
