# Issue 48 — Fassina, Galbusera, Saikhantes, Enshi (Addendum 31 Jul 2026, check #5)
Sheet row: 50 | Reporter: staff | Area: Attendance/classes

UNCHANGED (5th hourly check Fri 31 Jul UTC):

Fassina (student 14462, bk17857): CONFIRMED, confirmed=false, EUR 339.90 fully paid.
  BC 24630 (General English AM Plus, Jun 29-Jul 10 2026): active=true — 21d stale. 0 SCAs.

Galbusera (student 14461, bk17856): CONFIRMED, confirmed=false, EUR 339.90 fully paid.
  BC 24631 (General English AM Plus, Jun 29-Jul 10 2026): active=true — 21d stale. 0 SCAs.

Saikhantes (student 1001, bk18151): SCA 255 weekEnd=Jul 3 2026.
  Holiday 2500: Jul 20-Aug 21 2026. Returns Aug 24. NOT URGENT until Aug 18.

Enshi (student 397, bk787): Booking CONFIRMED fully paid (no issue).
  BC 829 (Academic Year Morning, Mar 30-Jun 5 2026): active=true — 56d stale.

Fix recipe (NOT YET RUN):
1: UPDATE Booking SET confirmed=true WHERE id IN (17857,17856) AND status='CONFIRMED';
2: UPDATE BookingCourse SET active=false WHERE id IN (24630,24631,829);
3: Confirm Jun 29-Jul 10 class for Fassina+Galbusera with AC/Paul; insert SCAs retroactively.
4: Create new SCA for Saikhantes week of Aug 24 (no action yet).
5: Verify Enshi Jun 1-12 gap; extend BC 829 if he attended Jun 8-12.

Risk: Bookings + data-hygiene + attendance. Reversible. Blast: 4 students, 3 BCs.
Status: OPEN — Saikhantes not urgent. Last checked: Fri 31 Jul 2026 UTC
