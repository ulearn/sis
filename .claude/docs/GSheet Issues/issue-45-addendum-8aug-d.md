Issue 45 -- 40th check, Sat 8 Aug 2026 UTC
Sheet row: 47 | Area: Renewal students / Booking Courses
===
UNCHANGED from 39th check. Count stable at 24479 -- Saturday no new ends today.

Live data:
  Stale booking_courses (active=true AND end_date < NOW()): 24479
  Last batch 13 BCs ended Fri 7 Aug: BC 88 1672 1673 1675 1740 1742 24955 24966 24967 24983 24990 24991 25038

FIX RECIPE - NOT YET RUN
  UPDATE booking_courses SET active=false WHERE active=true AND end_date < NOW();
  ~24479 rows affected. Reversible per-row.

RISK: data-hygiene. Reversible. Stale BCs inflate counts and confuse renewal/arrivals lists.
Last checked: Sat 8 Aug 2026 UTC (40th check)
