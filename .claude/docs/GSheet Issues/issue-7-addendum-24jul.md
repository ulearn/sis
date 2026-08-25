# Issue 7 — Sofiia Korkishchenko Booking Anomaly (check Fri 24 Jul 2026 UTC, 11th check, 45th hourly)

Reporter: staff. Area: Booking. Sheet row 8.

## Symptom
Student scheduled to start next week but name not appearing on arrival register.

## Root Cause (current state, all items UNCHANGED)
- Booking 17909 (Sofiia Korkishchenko): status = CANCELLED — confirmed flag = true (anomaly)
- Booking 17909: amount open = EUR 727.50, amount paid = EUR 0 — phantom balance, 37 days since Jun 17 2026
- Booking course 24693 (Renewal Academic Year PM, ends 13 Nov 2026): active = true, ILEP code = null — stale on cancelled booking
- Document 94 (Letter of Acceptance, ISSUED version 2): still live on cancelled booking — should be revoked
- Document 80 (Letter of Acceptance, SUPERSEDED): correctly superseded
- Booking 1310: 5 old booking courses (IDs 1352-1356, ended Dec 2025 to Apr 2026) all active = true — up to 217 days stale

## Fix Recipe (NOT YET RUN)
1. Booking 17909 — set confirmed = false:
   UPDATE booking SET confirmed = false WHERE id = 17909;
2. Booking 17909 — close phantom balance (set amountOpen = 0 or verify this is correct):
   Review why amountOpen = 727.50 on a CANCELLED booking with amountPaid = 0
3. Document 94 — revoke:
   UPDATE document_record SET status = "REVOKED" WHERE id = 94;
4. Booking course 24693 — deactivate:
   UPDATE booking_course SET active = false WHERE id = 24693;
5. Booking courses 1352-1356 (on booking 1310) — deactivate all:
   UPDATE booking_course SET active = false WHERE id IN (1352, 1353, 1354, 1355, 1356);
   (NOT YET RUN — verify these IDs and their booking before executing)

## Risk / Category
- Category: bookings / documents / data-hygiene
- Reversible: yes (all updates can be reversed)
- Blast radius: Sofiia Korkishchenko (students 14444 / relevant) and old booking 1310

## Status
Fix NOT RUN as of Fri 24 Jul 2026 UTC (11th check, 45th hourly). 37 days since anomaly first noted (Jun 17).