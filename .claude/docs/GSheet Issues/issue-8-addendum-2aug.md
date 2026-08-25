Issue 8 - Stale Booking Courses (Diego / Pedro / Aurora ILEP certs)
Reporter: AC | Area: Doc Gen / Certs | Sheet row: 9

Symptom
8 booking courses remain active well past their end dates. Cert issue itself resolved Jun 2026.

Root cause - 15th check Sun 2 Aug 2026 UTC (1st today)
All 8 unchanged:
- BC 1482 (Academic Year Afternoon, ended Dec 19 2025): 225 days stale, active=true
- BC 1485 (Academic Year Afternoon, ended Dec 19 2025): 225 days stale, active=true
- BC 1602 (Academic Year Morning, ended Dec 19 2025): 225 days stale, active=true
- BC 1483 (Academic Year Afternoon, ended Feb 13 2026): 170 days stale, active=true
- BC 1486 (Academic Year Afternoon, ended Feb 13 2026): 170 days stale, active=true
- BC 1484 (Academic Year Afternoon, ended Jun 5 2026): 58 days stale, active=true
- BC 1487 (Academic Year Afternoon, ended Jun 5 2026): 58 days stale, active=true
- BC 1603 (Academic Year Morning, ended Jun 5 2026): 58 days stale, active=true
These are Fidelo migration artefacts. No active class assignments on any of them.

Fix recipe - NOT YET RUN

Step 1: Deactivate all 8 stale booking courses
  ids = [1482,1483,1484,1485,1486,1487,1602,1603]
  UPDATE booking_courses SET active=false WHERE id IN (1482,1483,1484,1485,1486,1487,1602,1603);
  -- Expected: 8 rows updated

Step 2: Verify
  SELECT id,active FROM booking_courses WHERE id IN (1482,1483,1484,1485,1486,1487,1602,1603);
  -- All 8: active=false

Risk: data-hygiene | Reversible: Yes | Blast radius: Zero (no active classes or upcoming dates)

Status: Open - NOT YET RUN (225 days max staleness)
Last checked: Sun 2 Aug 2026 UTC (15th check, 1st today)