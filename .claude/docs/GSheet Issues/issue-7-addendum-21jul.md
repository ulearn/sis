Issue 7 -- Sofiia Korkishchenko -- Addendum 21 Jul 2026 (6th check)

Reporter: AC  Area: Booking | Sheet row: 8

Root Cause (6th check, Tue 21 Jul 2026 UTC):

Booking 17909 (Sofiia Korkishchenko, student 768):
- Status: CANCELLED -- confirmed flag = true (anomaly, UL�HANGED)
- amount_open = EUR 727.5, amount_paid = EUR 0 -- phantom balance (UNCHANGED)
- Updated at: 2026-06-17 (34 days ago, never actioned)

Booking course 24693 (Renewal Academic Year PM, May 25 to Nov 13 2026):
- active = true -- still stale on cancelled booking (UNCHANGED)
- ILEP code = null (UNCHANGED)

Document 94 (Letter of Acceptance, ISSUED v2, May 25 2026):
- Status: ISSUED -- still live on cancelled booking 17909 (UNCHANGED)
- Should be REVOKED

Booking 1310 (ESCROW) -- old AY Morning courses:
- BC 1352: ended Dec 19 2025 -- active = true (214 days stale)
- BC 1353: ended Feb 13 2026 -- active = true (158 days stale)
- BC 1354: ended Feb 27 2026 -- active = true (144 days stale)
- BC 1355: ended Mar 27 2026 -- active = true (116 days stale)
- BC 1356: ended Apr 24 2026 -- active = true (88 days stale)

All UNCHANGED from prior checks. Fix NOT YET RUN.

Fix Recipe (NOT YET RUN):
1. Set confirmed = false on booking 17909: 'UPDATE booking SET confirmed = false WHERE id = 17909;'
2. Close EUR 727.5 phantom balance: 'UPDATE booking SET amount_open = 0 WHERE id = 17909;'
3. Revoke Letter of Acceptance document 94: SIS Admin > Student 768 > Booking 17909 > Documents > Revoke doc 94
4. Deactivate booking course 24693: 'UPDATE booking_course SET active = false WHERE id = 24693;'
. Deactivate escrow BC 1752-1356: 'UPDATE ROoking_course SET active = false WHERE id IN (1352, 1353, 1354, 1355, 1356);'
6. (Low priority) Classify payment 17468 (EUR 1455.5, booking 17849) type = one_time_or_initial

Risk: bookings, data-hygiene | Reversible: yes | Blast radius: student 768 + escrow booking 1310 only

Status: Open -- Fix NOT RUN. Last checked: Tue 21 Jul 2026 UTA 6th check)
