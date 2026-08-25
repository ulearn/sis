Issue 41 -- Giampaolo Russo (Student 14571): Apartment Bed Unassigned
Check: 35th, Sun 9 Aug 2026 UTC | Reporter: AC | Row: 43

ROOT CAUSE -- CURRENT STATE

BA 11392 (City Centre Apartment Premium, Sep 6-14 2026, EUR 415): bedId=null.
Booking 18180: Confirmed, confirmed=true, EUR 2,584.96 paid, EUR 0 open.
BA 11357 (Host Family, bed 178, Aug 2-Sep 6): correctly assigned (transition Sep 6).

Available Premium beds for Sep 6-14 (verified Sun 9 Aug 2026):
  Bed 161  BUSY -- booked 2026-08-30 to 2026-10-25 (was free in earlier checks)
  Bed 168  FREE
  Bed 177  FREE
  Bed 194  FREE

FIX RECIPE -- NOT YET RUN

Choose bed 168, 177, or 194 and run:
  UPDATE BookingAccommodation SET bedId=168, updatedAt=NOW() WHERE id=11392;
  (replace 168 with 177 or 194 if preferred)

Verify no overlap on chosen bed:
  SELECT id,bedId,startDate,endDate FROM BookingAccommodation WHERE id=11392;
  Expect: bedId=168 (or chosen), active=true
  SELECT id FROM BookingAccommodation
  WHERE bedId=168 AND active=true AND startDate<2026-09-14 AND endDate>2026-09-06;
  Expect: only BA 11392 (0 conflicts)

NOTES
  Bed 161 now busy Aug 30-Oct 25 -- no longer available
  BA 11357 (host family, bed 178, Aug 2-Sep 6) is correct -- do not touch

RISK: Category=Accommodation assignment | Reversible=Yes
Blast radius: Single student (Giampaolo), 1 BA
Urgency: Medium -- check-in Sep 6 2026 (27 days)

STATUS: Open -- Fix NOT RUN | Last checked: Sun 9 Aug 2026 UTC (35th check)
