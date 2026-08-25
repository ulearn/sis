Issue 41 addendum 23jul-g — Giampaolo Russo: Capel apt still missing, Host Family check-in 10 days
Addendum: 66th hourly check Thu 23 Jul 2026 UTC (143rd total)
Reporter: KC | Area: Booking / Accomm | Sheet row 43

Symptom
Giampaolo Russo (student 14571) booked Host Family + Capel Street apartment. Capel apt absent from SIS. Xero payment null.

Root cause (confirmed this check — fresh DB)
- Booking 18180 (Giampaolo Russo, student 14571): Confirmed, confirmed = true, fully paid EUR 2,584.96
- Booking accommodation 11357: Host Family, active = true, start 2026-08-02, end 2026-09-06 (provider = Home, Room 2)
- Capel Street apartment (Sep 6-14 2026, 1 week): STILL NOT in database — no booking_accommodation record
- Payment 17954 (EUR 2,584.96, Bank, 26 Jun 2026): xeroPaymentId = STILL null
- Host Family check-in: Aug 2 = 10 days away
- No change from 65th check (142nd total)

Fix recipe (NOT YET RUN)
Step 1 — Add Capel apartment to booking 18180:
  SIS Admin -> Student 14571 (Giampaolo Russo) -> Booking 18180 -> Accommodation
  -> Add: Capel Street | Type: Apartment | Start: 2026-09-06 | End: 2026-09-14 | Weeks: 1

Step 2 — Reconcile Xero payment 17954:
  SIS Admin -> Booking 18180 -> Payments -> Payment 17954 (EUR 2,584.96)
  -> Link to Xero or manually set xeroPaymentId

Step 3 — Verify booking_accommodation record created for Capel and bed assigned.

Risk / category
bookings / accommodation; reversible. Single student. Blast radius: low.
Host Family check-in Aug 2 (10 days). Capel check-in Sep 6 (45 days).

Status: OPEN — Capel apt missing; payment 17954 xeroId null; Host Family check-in Aug 2 (10d)
Last checked: Thu 23 Jul 2026 UTC (66th hourly / 143rd total)