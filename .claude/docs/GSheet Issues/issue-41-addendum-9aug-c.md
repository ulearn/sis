Issue 41 - Giampaolo Russo: Premium apartment bed unassigned - 31st check Sun 9 Aug 2026 UTC
Sheet row: 43

STATUS: UNCHANGED. Bed still null. 28 days to check-in (2026-09-06).

ROOT CAUSE (confirmed):
Booking 18180 (student 14571 Giampaolo Russo): CONFIRMED, confirmed=true, EUR 2,584.96 paid, EUR 0 open.
BA 11357 (Host Family): bed_id=178, Aug 2 - Sep 6 - correctly assigned.
BA 11392 (City Centre Apartment, Premium): bed_id=NULL, Sep 6 - Sep 14, fee=EUR 415 - UNASSIGNED.

Available Premium beds for Sep 6-14 2026 (no conflicts from 30th check):
  Bed 168, Bed 174, Bed 175, Bed 176 (Capel Street / A1/A2 property)
  Bed 194 (Arasain)
  Bed 177 (B9.2 Home - verify if City Centre Apartment type)
Conflicting (unavailable): Bed 83 (bk17844 Aug 30 - Oct 11), Bed 161 (bk3 Aug 30 - Oct 25).

FIX RECIPE (NOT YET RUN):
  Step 1: Confirm bed choice with accommodation team (168/174/175/176/194 all appear free Sep 6-14).
  Step 2: SIS admin -> Accommodation -> BA 11392 -> assign chosen bed.
    Or: UPDATE booking_accommodations SET bed_id = 168 WHERE id = 11392; (confirm bed first)
  Step 3: Verify student appears in Matching section after assignment.

RISK: bookings/accommodation | Reversible: yes | No financial impact. 28 days to check-in.
STATUS: NOT RUN
Last checked: 2026-08-09 UTC (31st check)
