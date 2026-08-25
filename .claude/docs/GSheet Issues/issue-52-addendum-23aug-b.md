Issue 52 - Fanny Scelles - Host Email Auto-fill + BA 11399 Fee Null
Reporter: KC | Area: Booking / Accomm | Sheet row 54 | Run: 471st, Sun 23 Aug 2026 UTC

Symptom
Host email not auto-filling in Host Booking template; BA 11399 fee null.

Root Cause (confirmed from live DB, 471st run)
Student Fanny Scelles (14451), booking 17843:
- BA 11267: bed 23, 29 Aug to 4 Oct 2026, fee EUR 3,840 - first stay, OK
- BA 11399: bed 54, 4 Oct to 19 Dec 2026, fee = NULL - second stay, fee missing
- Student arrives 29 Aug 2026 = 6 days from now

Two issues:
1. Host email not auto-filling in template (code/template bug, ongoing)
2. BA 11399 fee = null (data-entry gap)

Fix Recipe (NOT YET RUN)

Fix 1 - Set fee on BA 11399:
  SELECT id, room_rate FROM beds WHERE id = 54;
  UPDATE booking_accommodations SET fee = <rate * weeks> WHERE id = 11399;
  -- 4 Oct to 19 Dec = approx 11 weeks

Fix 2 - Host email template (code fix, spec needed):
  See issue-52-host-email-badge.md for original analysis.

Risk / Category
- Category: bookings / data-hygiene (fee); code (email template)
- Reversible: yes for fee
- Blast radius: Fanny only for fee; all host emails for template bug
- DEADLINE: 29 Aug 2026 (6 days)

Status: FIX NOT RUN (fee); host email template open
Last checked: 2026-08-23 (471st run UTC)