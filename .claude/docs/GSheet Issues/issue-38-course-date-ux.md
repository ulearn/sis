# Issue 38 — Course & Holiday Date Picker UX

**Reporter:** PG  **Area:** Holidays, Bookings etc.  **Sheet row:** 46

## Symptom
Staff have to set end date of courses and holidays in drop-down date menu - leaves room for human error.
Could course start dates be restricted to only Mondays and Tuesdays after a BH on the drop down
and could there be a drop down for number of weeks or a field to input it that then sets the right end date?

## Root Cause

This is a UX feature request, not a data bug. Three gaps exist:

Gap 1 — Admin course start date has no Monday restriction
- admin.html line 5609: inline course editor startDate input accepts any calendar date
- admin.html lines 12562-12582: calcCourseEnd() does not warn or snap if start is not a Monday
- student.html lines 778-793: snapCourseStart() already enforces Monday-snapping on the student portal
- The inline editor is the primary staff interface; New Booking modal (lines 6477-6479) has the same gap

Gap 2 — Holiday modal has no weeks field
- admin.html lines 5901-5932: openAddHolidayModal() renders only holStart + holEnd date inputs
- Staff must mentally calculate and type the end date — error-prone
- A weeks numeric input that auto-sets holEnd would prevent off-by-one errors

Gap 3 — No Irish public bank holiday list in DB/client
- SchoolClosure table (9 rows, 2026-06-23): only Christmas breaks and Good Friday
- Irish BH Mondays (May/June/August/October) are absent
- Without this list, Tuesday-after-BH-Monday logic cannot be implemented

## Fix Recipe (NOT YET RUN — for Neil to review)

### Part A — Monday-snapping for admin course start date

File: public/admin.html

Step 1 — Add snapAdminCourseStart() helper near calcCourseEnd() (~line 12560):

  const BH_MONDAYS = new Set([
    '2026-06-01', // June Bank Holiday
    '2026-08-03', // August Bank Holiday
    '2026-10-26', // October Bank Holiday
    '2027-05-03', // May Bank Holiday
    '2027-06-07', // June Bank Holiday
    '2027-08-02', // August Bank Holiday
    '2027-10-25', // October Bank Holiday
    '2028-05-01', // May Bank Holiday
    '2028-06-05', // June Bank Holiday
    '2028-08-07', // August Bank Holiday
    '2028-10-30', // October Bank Holiday
  ]);

  function snapAdminCourseStart(input) {
    if (!input.value) return;
    const d = new Date(input.value + 'T00:00:00Z');
    const add = (1 - d.getUTCDay() + 7) % 7;
    if (add) d.setUTCDate(d.getUTCDate() + add);
    if (BH_MONDAYS.has(d.toISOString().slice(0, 10))) d.setUTCDate(d.getUTCDate() + 1);
    input.value = d.toISOString().slice(0, 10);
    calcCourseEnd(input);
  }

Step 2 — Wire to inline course editor (~line 5609):
  Change onchange="calcCourseEnd(this)" to onchange="snapAdminCourseStart(this)" on the startDate input.

Step 3 — Wire to New Booking modal (~line 6477): apply same onchange to the modal startDate field.

Optional: add a server-side guard in src/routes/bookings.ts PATCH handler for bookingCourse.startDate.

### Part B — Weeks field + auto end-date for holiday modal

File: public/admin.html

Step 1 — Add calcHolEnd() helper near snapAdminCourseStart:

  function calcHolEnd() {
    const startEl = document.getElementById('holStart');
    const weeksEl = document.getElementById('holWeeks');
    const endEl   = document.getElementById('holEnd');
    if (!startEl?.value || !weeksEl?.value || !endEl) return;
    const wk = parseInt(weeksEl.value);
    if (!wk || wk < 1) return;
    const d = new Date(startEl.value + 'T00:00:00Z');
    d.setUTCDate(d.getUTCDate() + wk * 7 - 3); // Mon + (wk*7-3) = Friday
    endEl.value = d.toISOString().slice(0, 10);
  }

Step 2 — Update openAddHolidayModal() HTML (~line 5909). Replace start/end blocks with:

  <div class="form-group">
    <label class="form-label">Start date</label>
    <input type="date" class="form-input" id="holStart" onchange="snapAdminCourseStart(this); calcHolEnd()">
  </div>
  <div class="form-group">
    <label class="form-label">Duration (weeks)</label>
    <input type="number" class="form-input" id="holWeeks" min="1" max="25" placeholder="e.g. 2" oninput="calcHolEnd()">
  </div>
  <div class="form-group">
    <label class="form-label">End date (auto from weeks, or override manually)</label>
    <input type="date" class="form-input" id="holEnd">
  </div>

### Part C — Bank holiday list decision

Option C1 (recommended): Hardcode BH_MONDAYS as above. Update each November.
Source: gov.ie/en/publication/6a7ef-public-holidays-in-ireland/

Option C2: Add type column to SchoolClosure, insert BH Mondays, fetch /sis/api/classes/closures on
admin page load, build BH_MONDAYS dynamically. Requires DB migration.

## Risk / Category

- Category: Code — UX enhancement (no data mutation)
- Reversible: Yes — purely additive JS in admin.html
- Blast radius: Low — only admin course editor + holiday modal; student portal unchanged
- BH list: verify against gov.ie calendar before shipping

## Status

Open — feature not yet implemented.
Last checked: 2026-06-23 UTC

---

## Status Update: 2026-07-08 UTC

**Part B (holiday weeks field): DONE** — holWeeks input, calcHolEnd(), calcHolWeeks() now in admin.html (lines 6774, 13825, 13831).

**Part A (Monday snap for course start): STILL OPEN** — no snapAdminCourseStart() or BH_MONDAYS array in admin.html.

**Part C (Irish BH Mondays in DB): STILL OPEN** — SchoolClosure table has only Christmas breaks + Good Friday; no Irish public bank holiday Mondays added.

---
## Status Update: 2026-07-09 UTC (1st check 9 Jul)
- Part B (holWeeks): STILL FIXED — calcHolEnd() / calcHolWeeks() at admin.html lines 13832-13843 confirmed present.
- Part A (Monday snap): STILL OPEN — calcCourseEnd() at admin.html line 13801 has no Monday-snap logic; no BH_MONDAYS or snapAdminCourseStart anywhere in admin.html (full grep).
- Part C (Irish BH Mondays): STILL OPEN — SchoolClosure DB: 9 records total (4 Christmas 2026-2029 + 5 Good Friday 2026-2030); zero Irish public bank holiday Mondays. Confirmed by fresh DB read.
- Gaps 1 and 3 remain open. Sheet row 40 H/I/J/K written.

---
## Status Update: 2026-07-12 UTC

UNCHANGED (re-checked from recipe + admin.html). Gap 2 holWeeks FIXED (calcHolEnd/calcHolWeeks at admin.html lines 13832-13843). Gap 1 Monday-snap STILL OPEN (no snapAdminCourseStart in admin.html). Gap 3 Irish BH Mondays STILL OPEN (SchoolClosure: 9 records total, Christmas+GF only; zero Irish public bank holiday Mondays). Code-only change, no DB. Low priority. Sheet H40:K40 updated.
Last checked: 2026-07-12 SUN UTC (hourly bot).


---

## Status Update: 2026-07-13 MON UTC

G column annotated by staff (hash changed). Code re-confirmed:
- Gap 2 (holiday weeks field): STILL FIXED - calcHolEnd() and calcHolWeeks() at admin.html lines 13832-13843 confirmed.
- Gap 1 (Monday snap): STILL OPEN - no snapAdminCourseStart() or Monday enforcement in admin.html.
- Gap 3 (Irish BH Mondays): STILL OPEN - SchoolClosure table: 9 records total (Christmas 2026-2029, Good Friday 2026-2030); zero Irish public bank holiday Mondays. Low priority. Sheet row 40 H/I/J/K written.
Last checked: 2026-07-13 MON UTC (hourly bot).
---
## Status — 13 July 2026 MON UTC

G column annotated by staff on sheet (hash changed). Staff confirmed Gap 2 (holWeeks) is FIXED; Gaps 1+3 still open.
- Gap 1 (Monday snap): calcCourseEnd() admin.html:13801 — no Monday enforcement. STILL OPEN.
- Gap 3 (Bank holiday Mondays): school_closures has 9 records (Christmas 2026-2029 + Good Friday 2026-2030) only. STILL OPEN.
Last checked: 2026-07-13 MON UTC.

---
Status update 2026-07-13 Mon UTC (this run)

CONFIRMED UNCHANGED. Gap 2 holWeeks: STILL FIXED (calcHolEnd admin.html:13855). Gap 1 Monday snap: STILL OPEN (calcCourseEnd admin.html:13824 no Monday enforcement). Gap 3 Irish BH Mondays: STILL OPEN (school_closures 9 records Christmas+GF only; Aug BH Mon 3 Aug 2026 = 21 days away, not in table). Sheet row 40 H/I/J/K written.
Last checked: 2026-07-13 Mon UTC (hourly bot).

---

Status Update: 2026-07-14 TUE UTC (3rd check)

CONFIRMED UNCHANGED. school_closures table confirmed (9 records): id1 Good Friday Apr03 2026; id7 Christmas Dec21-Jan03 2026-27; id8 Christmas Dec20-Jan04 2027-28; id9 Christmas Dec18-Jan02 2028-29; id10 Christmas Dec24-Jan06 2029-30; id11 Good Friday Mar26 2027; id12 Good Friday Apr14 2028; id13 Good Friday Mar30 2029; id14 Good Friday Apr19 2030.
Zero Irish public bank holiday Mondays. August BH Mon 3 Aug 2026 = 20 days away. Oct BH Mon 26 Oct 2026 = 104 days away.
Gap 1 (Monday snap): calcCourseEnd() admin.html:13824 confirmed no Monday enforcement (code unchanged).
Gap 3 INSERT recipe (NOT YET RUN):
  INSERT INTO school_closures (name, start_date, end_date, note, is_paid_holiday) VALUES ('August Bank Holiday', '2026-08-03', '2026-08-03', 'Irish Public Holiday', false), ('October Bank Holiday', '2026-10-26', '2026-10-26', 'Irish Public Holiday', false), ('May Bank Holiday', '2027-05-03', '2027-05-03', 'Irish Public Holiday', false), ('June Bank Holiday', '2027-06-07', '2027-06-07', 'Irish Public Holiday', false), ('August Bank Holiday', '2027-08-02', '2027-08-02', 'Irish Public Holiday', false), ('October Bank Holiday', '2027-10-25', '2027-10-25', 'Irish Public Holiday', false);
Last checked: 2026-07-14 TUE UTC (hourly bot).
---

## Status Update: 2026-07-14 TUE UTC (4th check)

CONFIRMED UNCHANGED. Same 9 school closure records. August BH Mon 3 Aug 2026 = 20 days away. Oct BH Mon 26 Oct 2026 = 104 days away. AY Morning students (booking course 97 Gustavo Ferreira, student 83; booking course 24959 Diego Alves, student 840) both start 3 August — if August BH is treated as a school closure their end-dates would need shunting. Gap 1 (Monday snap): STILL OPEN. Gap 3 (Irish BH Mondays): STILL OPEN. INSERT recipe above unchanged. Fix NOT RUN.
Last checked: 2026-07-14 TUE UTC (4th check, hourly bot).

---

## Status

68th check Sun 19 Jul 2026 04:08 UTC (19th today):
9 school_closures in DB: Good Fridays 2026-2030 and Christmas 2026-2029.
August Bank Holiday (Mon 3 Aug 2026) STILL absent — 15 days away.
October Bank Holiday (Mon 26 Oct 2026) STILL absent — 99 days away.
Fix NOT RUN.
---

Status Update: Sun 19 Jul 2026 UTC (69th check, 19th today)

CONFIRMED UNCHANGED. school_closures table: 9 records - Christmas 2026-2029 + Good Friday 2026-2030. Zero Irish public bank holiday Mondays. August Bank Holiday (Mon 3 Aug 2026): STILL absent - 15 days away. October Bank Holiday (Mon 26 Oct 2026): STILL absent - 99 days away. Gap 1 (Monday snap for admin course start): STILL OPEN. Gap 2 (holiday weeks field): STILL FIXED.

INSERT recipe - NOT YET RUN:
INSERT INTO school_closures (name, start_date, end_date, note, is_paid_holiday) VALUES ('August Bank Holiday', '2026-08-03', '2026-08-03', 'Irish Public Holiday', false), ('October Bank Holiday', '2026-10-26', '2026-10-26', 'Irish Public Holiday', false), ('May Bank Holiday', '2027-05-03', '2027-05-03', 'Irish Public Holiday', false), ('June Bank Holiday', '2027-06-07', '2027-06-07', 'Irish Public Holiday', false), ('August Bank Holiday', '2027-08-02', '2027-08-02', 'Irish Public Holiday', false), ('October Bank Holiday', '2027-10-25', '2027-10-25', 'Irish Public Holiday', false);

Last checked: Sun 19 Jul 2026 UTC (69th check, hourly bot).
