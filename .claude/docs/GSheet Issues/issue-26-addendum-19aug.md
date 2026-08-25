Issue 26 Ivan Rodriguez (68th check, 19 Aug 2026)
Sheet row: 27  Reporter: AC  Area: Booking/Class

Symptom: Intensive students only appear once in to-be-assigned.

Status: No change since 67th check (Tue 18 Aug).

Evidence (live DB, 19 Aug 2026)
- Booking Course 23 (Intensive General 30): active = true, ended 22 May 2026 -- 89 days stale (booking 22, Ivan Rodriguez, student 18)
- Booking Course 24826 (2 weeks Intensive General 30): active = true, ended 19 Jun 2026 -- 61 days stale (booking 18034, student 14532, NOT Ivan Rodriguez)
- Booking 18034 (student 14532): PARTIAL, confirmed = false, EUR 845 paid, EUR 250 open
- Booking 22 (Ivan Rodriguez): CONFIRMED, fully paid EUR 1,948

Fix Recipe -- NOT YET RUN
1. Deactivate BC 23 (SCAs are historical within course period -- safe):
   UPDATE booking_courses SET active = false WHERE id = 23;
2. Deactivate BC 24826 (belongs to student 14532, not Ivan):
   UPDATE booking_courses SET active = false WHERE id = 24826;
3. Chase EUR 250 outstanding from booking 18034 (student 14532)

Risk: Data-hygiene. Reversible. Low blast radius.
Status: Fix NOT RUN. Last checked: Wed 19 Aug 2026 UTC (68th check).