Issue 43 -- Jesus Ramirez / Veronica Martin: Stale Active BAs -- Addendum 24 Jul

Reporter: AC | Area: Booking / Accomm | Sheet row: 45
Checked: Fri 24 Jul 2026 UTC -- 9th check, 154th total run

SYMPTOM
Accommodation dates for Jesus Manuel Ramirez Diaz should be 20 Jun - 4 Jul. BA is past checkout but still marked active.

ROOT CAUSE (confirmed, unchanged)
Two booking accommodations are past end date with active = true:

- BA 11285 (Jesus Manuel Ramirez Diaz, bed 83, booking 17825): startDate=21 Jun, endDate=5 Jul 2026 -- 19 days past checkout -- active=true, fee=null
- BA 11352 (Veronica Martin, bed 83, booking 18156): startDate=4 Jul, endDate=11 Jul 2026 -- 13 days past checkout -- active=true, fee=360

Both hold bed 83 as occupied. Root cause: active flag not auto-cleared on checkout. Also tracked under Issue 37 (row 39).

FIX RECIPE (NOT YET RUN)

  UPDATE booking_accommodations SET active = false, updated_at = NOW()
  WHERE id IN (11285, 11352);

  Verify: SELECT id, active, end_date FROM booking_accommodations WHERE id IN (11285, 11352);

RISK
- Category: data-hygiene
- Reversible: Yes (set active=true if needed)
- Blast radius: Cosmetic -- bed 83 shows occupied in matching UI. No financial impact.

STATUS
OPEN (cosmetic) - Fix NOT Run | Last checked: Fri 24 Jul 2026 UTC
