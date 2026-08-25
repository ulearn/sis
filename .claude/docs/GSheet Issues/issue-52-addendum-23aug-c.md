Issue 52 — Fanny Scelles — BA 11399 Fee Null
Reporter: KC | Area: Booking / Accomm | Sheet row 54

Root cause (474th run, 23 Aug 2026 UTC)
No change since 472nd run. Data re-confirmed from fresh DB:
- Student Fanny Scelles (14451), booking 17843
- BA 11267: bed 23, 29 Aug – 4 Oct 2026, fee = EUR 3,840 — first stay, OK, student arrives in 6 days
- BA 11399: bed 54, 4 Oct – 19 Dec 2026, fee = null — second stay, fee missing (starts in 42 days)
- Bed 54 (accommodation_beds id 54, room 54, property 54): no historical BAs — no rate reference available in DB
- Note: accommodation_beds has no rate field; fee must be set based on host agreement

Two issues:
1. BA 11399 fee = null (data-entry gap)
2. Host email template does not auto-fill for multi-host stays (see issue-52-host-email-badge.md)

Fix recipe (NOT YET RUN)

Fix 1 — Set fee on BA 11399 (Neil must look up host rate):
  -- First: check the provider contract or ask the host for the agreed weekly rate
  -- Oct 4 to Dec 19 = 76 days = approx 10.86 weeks
  UPDATE booking_accommodations SET fee = <agreed_fee_amount> WHERE id = 11399;

Fix 2 — Host email template (code fix, spec needed):
  See issue-52-host-email-badge.md for original analysis.

Risk / Category
- Category: bookings / data-hygiene (fee); code (email template)
- Reversible: yes for fee
- Blast radius: Fanny only for fee; all host emails for template bug
- Arrival at bed 23 (BA 11267) is 29 Aug (6 days) — BA 11267 fee is set (EUR 3,840)
- BA 11399 fee-null affects Oct 4 onwards (42 days away)

Status: FIX NOT RUN (fee); host email template open
Last checked: 2026-08-23 UTC (474th run)