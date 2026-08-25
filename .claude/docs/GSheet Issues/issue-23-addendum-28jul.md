Issue 23 - Enshi Lu - Backwards Course Dates (Tue 28 Jul 2026)

Reporter: pg | Area: Booking/Class/Holiday | Sheet row: 24

Current state (Tue 28 Jul 2026 UTC):
- BC 826 (AY Morning, booking 787): start 17 Nov 2025, end 28 Nov 2025 - 242 days stale, active = true
- BC 827: start 5 Jan 2026, end 30 Jan 2026 - 179 days stale, active = true
- BC 828: start 2 Mar 2026, end 27 Feb 2026 - BACKWARDS dates (DST legacy bug)
- BC 829: start 30 Mar 2026, end 5 Jun 2026 - 53 days stale, active = true
- No change since Sun 26 Jul

Fix recipe (NOT YET RUN):
UPDATE BookingCourse SET endDate = 2026-03-20 WHERE id = 828;  (estimate; confirm first)
UPDATE BookingCourse SET active = false WHERE id IN (826, 827, 828, 829);

Risk: Data hygiene | Low blast radius | Reversible | Low priority

Status: UNCHANGED - Fix NOT RUN. Also unchanged Sun 26 Jul.
Last checked: Tue 28 Jul 2026 UTC