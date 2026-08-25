Issue 41 - Giampaolo Russo: Premium apartment bed unassigned - 30th check Sun 9 Aug 2026 UTC
Sheet row: 43

ROOT CAUSE:
Booking 18180 (Giampaolo Russo, student 14571): CONFIRMED, confirmed=true, EUR 2584.96 paid, EUR 0 open.

Two BAs on booking 18180:
  BA 11357 (Host Family, Individual): bed_id=178, Aug 2 - Sep 6, EUR 1250 - correctly assigned.
  BA 11392 (City Centre Apartment, Premium): bed_id=NULL, Sep 6 - Sep 14, EUR 415 - UNASSIGNED.

Available Premium beds for Sep 6-14 2026 (no conflicts):
  Bed 168  Bed A  A1/Room 1  property A1
  Bed 174  Bed B  A1/Room 1  property A1
  Bed 175  Bed B  A1/Room 2  property A1
  Bed 176  Bed B  A2/Room 1  property A2
  Bed 194  Bed1   Arasain-1  property Arasain
  Bed 177  Bed    B9.2       property Home (verify if City Centre Apt type)

Conflicting (unavailable Sep 6-14):
  Bed 83  (A1/Room 2, A1): bk17844 booked Aug 30 - Oct 11
  Bed 161 (A2/Room 1, A2): bk3 booked Aug 30 - Oct 25

FIX RECIPE (NOT YET RUN):
Step 1: Confirm bed choice with accommodation team (beds 168/174/175/176/194 all free Sep 6-14).
Step 2: SIS admin -> Accommodation -> BA 11392 -> assign chosen bed.
  Or SQL: UPDATE booking_accommodations SET bed_id = 168 WHERE id = 11392; (example - confirm bed first)
Step 3: Verify student appears in Matching section after assignment.

RISK: bookings/accommodations | Reversible: yes | No financial impact. 28 days to Sep 6 check-in.
STATUS: NOT RUN
Last checked: 2026-08-09 UTC (30th check)