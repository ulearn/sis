# Issue 41 Addendum 30jul-g (9th check Thu 30 Jul 2026 UTC)

Reporter: KC | Sheet row: 43

Root Cause (fresh check):
- Booking 18180 (Giampaolo Russo, student 14571): CONFIRMED, EUR 2584.96 fully paid.
- Booking Accommodation 11357: Host Family (Patty McSweeney), bed 178, Aug 2 to Sep 6, fee EUR 1250. Present.
- Capel Street apartment BA: STILL ABSENT. 0 BA records beyond 11357. Capel beds: 83,84,87,88,89,156,157,161,168,173.
- BC 24956 starts Aug 3 (in Issue 38 list, will shift to Aug 4).
- CHECK-IN SUNDAY AUG 2 — 3 DAYS AWAY. No change from 30jul-f.

Status: NOT RUN. Awaiting Diego confirmation of Capel bed ID and fee.
Fix: INSERT booking_accommodations for bk18180, accommodation_type=Apartment, Sep 6 to Sep 14, bed=<TBD>, fee=<TBD>.
