Issue 16 -- Melie Villard / Bed 66: 4 Stale Booking Accommodations
Check: 18th, Sun 9 Aug 2026 UTC (2nd today) | Reporter: AC | Row: 17

ROOT CAUSE -- CURRENT STATE

Four BAs on bed 66 ended but still active=true:
  BA 11216  Erii Takigawa      bk 46     ended 2026-05-09  92 days stale
  BA 11158  Hugo Tavernier     bk 100    ended 2026-05-17  84 days stale
  BA 11282  Melie Villard      bk 17897  ended 2026-06-05  65 days stale
  BA 11361  Filippo Corazzini  bk 18190  ended 2026-08-09  Ended TODAY (newly stale)

No future bookings on bed 66 -- free from Mon 10 Aug 2026.

FIX RECIPE -- NOT YET RUN

  UPDATE BookingAccommodation SET active=false, updatedAt=NOW()
  WHERE id IN (11216,11158,11282,11361);

  Verify:
  SELECT id,active FROM BookingAccommodation WHERE id IN (11216,11158,11282,11361);
  Expect: all active=false

  Check bed 66 clear:
  SELECT id,active,startDate,endDate FROM BookingAccommodation
  WHERE bedId=66 AND active=true;
  Expect: 0 rows

RISK: Category=Accommodation/Data hygiene | Reversible=Yes
Blast radius: 4 BAs, 1 bed, cosmetic display issue only
Urgency: Low

STATUS: Open -- Fix NOT RUN | Last checked: Sun 9 Aug 2026 UTC (18th check, 2nd today)
