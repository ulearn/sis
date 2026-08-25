Issue 45 - Eduardo Roche Diaz (Addendum 26 Jul 2026)

Reporter: AC | Area: Renewal students | Sheet row: 47

Root cause (fresh data 26 Jul 2026 UTC):
- Booking course 25011 (General English PM, Jul 20-24 2026): active=true, 2 days stale (ended Jul 24)
- Window permanently closed; no class assignment possible retroactively
- 5 school days missed (Jul 20-24): attendance permanently unrecorded
- Booking 18233: student 14602 Eduardo Roche Diaz, status=CONFIRMED

Fix recipe (NOT YET RUN):
Data hygiene only - no attendance recovery possible.
UPDATE booking_courses SET active = false WHERE id = 25011;

Risk/Category: data-hygiene, reversible; urgency: low

Status: OPEN (data hygiene) - window permanently closed as of Fri 24 Jul 2026.
Last checked: 26 Jul 2026 UTC (108th hourly run, 2d stale)