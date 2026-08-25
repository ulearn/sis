Issue 6 -- Sofiia Korkishchenko -- not on arrivals + duplicate booking
Reporter: AC . Area: Booking . Sheet row 7

Symptom
Starts next week but not on the arrivals list (shows in bookings filtered 08/06/2026). Two bookings.

Root cause
Student 768. Bookings:
- bk17849 CONFIRMED: Academic Year Renewal Afternoon, serviceStart 2026-06-08. Correct upcoming renewal.
- bk1310 CONFIRMED: last year AY Morning Sep2025-Apr2026 (Fidelo source). The "started last week" one.
- bk17909 CANCELLED: duplicate renewal. Already cancelled. Done.

Arrivals gap -- root cause confirmed 2026-06-05:
The /students/arrivals route (dist/routes/students.js) picks the EARLIEST booking_course.start_date
ever across ALL of a student's bookings, and only surfaces students whose first-ever course falls
in the query window. Comment: "Returning students extending into another course don't qualify."

Sofiia's earliest course is from bk1310 (Sep 2025, Fidelo). She is a returning student and will
NEVER appear on /students/arrivals -- by design. There is no renewals-starting-this-week view in SIS.

bk17849.serviceStart IS correctly set to 2026-06-08; the field is not the gap.

Fix recipe -- NOT YET RUN
Dup bk17909 already cancelled -- nothing to do.

For the arrivals gap, Neil must decide:
Option A: Build a renewals-this-week panel.
  Query: bookings WHERE serviceStart BETWEEN from AND to AND status=CONFIRMED
  AND student has > 1 booking (i.e. not their first). Separate from /students/arrivals.
Option B: Accept the gap -- staff use /bookings?courseStart=2026-06-08 export.csv each Friday.
Option C: Add renewing students to /students/arrivals response under a separate "renewals" key.

Risk/category: code change if A or C; data-hygiene/no DB change if B.

Status
Dup resolved. Arrivals gap: design limitation (first-timers-only route). Needs Neil: A/B/C.
Last checked 2026-06-06 UTC hrly#14:
  bk17849: CONFIRMED Jun8-Nov27, starts Mon (2 days). hubspotContactId=765074576630 IS SET (prev note saying null was stale).
  bk17909: CANCELLED - confirmed.
  No accommodation row on bk17849 - consistent with returning student (may have own/permanent place).
  Design decision A/B/C (/renewals view) still pending Neil.
Last checked 2026-06-06 UTC hrly(5):
  bk17849: confirmed=true, status=CONFIRMED, c24623 Jun8-Nov27. All correct.
  RESOLVED. K marked fixed.
