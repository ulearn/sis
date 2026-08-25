Issue 28 - Paola Moreira (BK17850 confirmed=false) | Addendum 1 Aug 2026

Reporter: AC | Area: Booking | Sheet row: 29 | Check: 31st (Sat 1 Aug 2026 UTC)

Symptom
Appears in class but cannot be assigned - says payment not received.

Root Cause (fresh DB - NOT YET FIXED)
Booking 17850 (Paola Sthefane Missias Moreira, student 14456):
  Status = CONFIRMED - confirmed = false (anomaly)
  Amount open = EUR 321.35, amount paid = null (unset)
  Last updated 8 Jul 2026 - 24 days stale (was 22d on Thu 30 Jul)

Student is in class (confirmed via previous checks) but SCA creation is blocked because
confirmed = false causes the system to treat the booking as unpaid.

Fix Recipe (NOT YET RUN)

Step 1 - Verify payment status in HubSpot and Xero before changing confirmed flag.

Step 2 - If EUR 321.35 is confirmed outstanding (not yet received):
  Leave confirmed = false; advise student/agent to pay.

Step 3 - If payment confirmed received externally but not yet synced:
  UPDATE bookings SET confirmed = true WHERE id = 17850;

Step 4 - Verify:
  SELECT id, status, confirmed, amount_paid, amount_open FROM bookings WHERE id = 17850;

Risk / Category
- Category: bookings
- Reversible: yes
- Blast radius: 1 booking (1 student)
- Low priority: student is already attending class; issue is SCA assignment only

Status
Open - 31st check (Sat 1 Aug 2026). NOT FIXED.
Booking 24 days stale since last update (Jul 8). Verify external payment before acting.

Last checked: 2026-08-01 UTC
