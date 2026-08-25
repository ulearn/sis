Issue 38 — Addendum 5 Aug 2026 (h) — CRITICAL: Courses End Friday, 0 Class Assignments

Reporter: Diego/Paul  Area: Holidays, Bookings, Classes  Sheet row: 40

25th check Wed 5 Aug 2026 UTC — CRITICAL: Africa Mera Bachir (BC88) and Eduardo Roche Diaz (BC25038) have been in school since Monday with 0 class assignments. Their courses end Friday 7 Aug. Only Thursday and Friday remain.

Symptom

Staff reported course date UX issues; ongoing tracker for unassigned booking courses.

CRITICAL: 2 students in school, 0 class assignments — courses end Friday

Booking Course 88 — Africa Mera Bachir (student 76)
- Course: Morning General, booking 82 (CONFIRMED)
- Dates: Aug 3-7 2026 (one week)
- Class assignments: 0 — 3 days (Mon/Tue/Wed) in school, untracked

Booking Course 25038 — Eduardo Roche Diaz (student 14602)
- Course: General English PM, booking 18258 (CONFIRMED)
- Dates: Aug 3-7 2026 (one week)
- Class assignments: 0 — 3 days (Mon/Tue/Wed) in school, untracked

Booking Course 24967 — Gustavo Da Silva (booking 18179)
- General English AM, Jul 6-Aug 7, 0 class assignments
- Duplicate of Booking Course 24955 (AM Plus, same booking, 2 class assignments)
- Deactivate only, do not assign

Booking Course 25004 — Vincenzo Contu (student 14597, booking 18226 CONFIRMED)
- General English AM Plus, Aug 10-14, 0 class assignments — starts Sunday, assign by Friday

Booking Course 25005 — Claudia Mereu (student 14598, booking 18227 CONFIRMED)
- General English AM, Aug 10-14, 0 class assignments — starts Sunday, assign by Friday

Booking Course 24 — Amine Ibrani
- Academic Year Afternoon, Feb 23-Aug 14 2026
- Booking 23 CANCELLED, 0 class assignments — deactivate only

Fix Recipe (NOT YET RUN)

Step 1 — IMMEDIATELY: Assign Africa Mera Bachir (Booking Course 88)
SIS admin: Classes > To Be Assigned > BC 88 > assign to Morning General class, week Aug 3-7.
Then manually enter attendance for Mon 3 Aug, Tue 4 Aug, Wed 5 Aug.

Step 2 — IMMEDIATELY: Assign Eduardo Roche Diaz (Booking Course 25038)
SIS admin: Classes > To Be Assigned > BC 25038 > assign to General English PM class, week Aug 3-7.
Then manually enter attendance for Mon 3 Aug, Tue 4 Aug, Wed 5 Aug.

Step 3 — TODAY: Deactivate duplicate Booking Course 24967 (NOT YET RUN)
  UPDATE "BookingCourse" SET active = false, updated_at = NOW() WHERE id = 24967;
Risk: Low. BC 24955 has correct assignments. Reversible.

Step 4 — BY FRIDAY: Assign Vincenzo Contu (BC25004)
SIS admin: assign Booking Course 25004 to AM Plus class starting Mon 10 Aug.

Step 5 — BY FRIDAY: Assign Claudia Mereu (BC25005)
SIS admin: assign Booking Course 25005 to AM class starting Mon 10 Aug.

Step 6 — ANYTIME: Deactivate Booking Course 24 (cancelled booking) (NOT YET RUN)
  UPDATE "BookingCourse" SET active = false, updated_at = NOW() WHERE id = 24;

Step 7 — Neil decides: legacy Booking Courses 1144/1305/1344/1591 (NOT YET RUN)
  UPDATE "BookingCourse" SET active = false, updated_at = NOW() WHERE id IN (1144, 1305, 1344, 1591);
Students: Anar-Erdene Batbayar, Nomin Nergui, Bat-Orgil Baljinnyam, Turbold Altankhuyag.

Risk

- Category: Bookings / Classes / Attendance
- Severity: HIGH — 2 paying students in school 3 days, attendance untracked; courses end Friday
- Reversible: All steps reversible

Status: Pending — fix NOT YET RUN
Last checked: Wed 5 Aug 2026 UTC (25th hourly run)