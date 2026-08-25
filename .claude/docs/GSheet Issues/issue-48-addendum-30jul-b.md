# Issue 48 Addendum 30jul-b (4th check Thu 30 Jul 2026 UTC)

Reporter: AC | Sheet row: 50

Fresh DB check:
- Fassina (s14462, bk17857): CONFIRMED/confirmed=false, BC 24630 stale 20d, 0 class assignments. Unchanged.
- Galbusera (s14461, bk17856): CONFIRMED/confirmed=false, BC 24631 stale 20d, 0 class assignments, paid EUR 339.90. Unchanged.
- Saikhantes (s1001): SCA 255 last week_end Jul 3, class 11 (B1 PM). On holiday Jul 20-Aug 21. Returns Aug 24. No new SCA.
- Enshi (s397): BC 829 stale 55d. SCA 58 last May 31. Jun attendance gap.
- Uyanga/Ana Jessica/Ariunsarnai: see issues 25/17/20.

Fix: UPDATE bookings SET confirmed=true WHERE id IN (17857,17856); deactivate BCs 24630,24631; insert SCAs for Fassina/Galbusera after staff confirm class. For Saikhantes: insert SCA (BC 24925, class 11, Aug 24 - Oct 2) after holiday.

Status: NOT RUN. 4th check Thu 30 Jul 2026 UTC.
