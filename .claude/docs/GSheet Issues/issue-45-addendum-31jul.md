Issue 45 - Stale Booking Courses (7th check, Fri 31 Jul 2026 UTC)
Reporter: AC, Sheet row: 47

PROGRESS: Jul 3, Jul 10, Jul 17 batches all cleaned up since Thu 30 Jul. Good progress.

CURRENT STATE (live DB, Fri 31 Jul 2026):

Jul 24 batch - 11 stale BCs (active=true, ended 2026-07-24, 7 days stale):
  BC 20 - Academic Year Morning - Lalita Champakhong (confirmed=false)
  BC 37 - Academic Year Afternoon - Ralph Belizaire Calderon (confirmed=true)
  BC 81 - Morning General Plus - Pietro Colombo (confirmed=true)
  BC 1781 - Morning General Plus - Jose Geraldo Cursino de Moura Neto (confirmed=true)
  BC 1792 - Morning General Plus - Nicole Valentina Rueda Mendoza (confirmed=true)
  BC 24606 - Morning General Plus - Martina Tartaro (confirmed=true)
  BC 24620 - General English AM - Jade Ribeiro (confirmed=false)
  BC 24776 - General English AM - Mario Roggi (confirmed=true)
  BC 24828 - 12 wks Morning General Plus & IELTS - Martina Tartaro (confirmed=true)
  BC 24989 - General English AM - Marcos Abrego Tofe (confirmed=true)
  BC 25011 - General English PM - Eduardo Roche Diaz (confirmed=true)

Note: count is 11 (vs 9 in 30jul-i) - 2 re-added or prior undercount.

Jul 31 batch - 16 BCs ended today, will be stale from Aug 1:
  IDs: 87, 1347, 1454, 1502, 1503, 1723, 24609, 24616, 24945, 24987, 24998, 25008, 25017, 25019, 25021, 25023

FIX RECIPE (NOT YET RUN):

Deactivate Jul 24 batch (11 BCs):
  SQL (NOT YET RUN):
  UPDATE booking_courses SET active = false, updated_at = NOW()
  WHERE id IN (20, 37, 81, 1781, 1792, 24606, 24620, 24776, 24828, 24989, 25011)
    AND end_date = '2026-07-24' AND active = true;

Deactivate Jul 31 batch (16 BCs - run on/after Aug 1):
  SQL (NOT YET RUN):
  UPDATE booking_courses SET active = false, updated_at = NOW()
  WHERE id IN (87, 1347, 1454, 1502, 1503, 1723, 24609, 24616, 24945, 24987, 24998, 25008, 25017, 25019, 25021, 25023)
    AND end_date = '2026-07-31' AND active = true;

RISK: Data hygiene - reversible. Blast radius: 27 BC records.
STATUS: OPEN - Fix NOT RUN - Last checked: Fri 31 Jul 2026 UTC (7th check)
