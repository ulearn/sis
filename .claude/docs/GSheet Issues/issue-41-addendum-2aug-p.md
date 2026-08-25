Issue 41 — Giampaolo Russo (63rd check, 18th today)
Reporter: KC | Area: Booking / Accomm | Sheet row: 43

Symptom: Host family (Aug2-Sep6) set up OK; Capel St apartment (Sep6-14) cannot be added.

Root cause (Sun 2 Aug 2026 UTC, student arrived today):
- Student 14571 (Giampaolo Russo), booking 18180
- BC 24956 (General English AM, Aug3-Sep11): active, 0 class assignments
- BC 24956 is in Aug3 BH shunt list — after Issue 38 fix shifts to Aug4
- Class assignment for week starting Tue 4 Aug needed on BC 24956
- BA 11357: Host Family, bed 178, Aug2-Sep6, active, fee EUR 1250 — OK
- Capel St apartment (Sep6-Sep14, 1 week + 1 night): NO booking_accommodation in database (still absent)
- Booking 18180: xero_id = null, EUR 2584.96 paid, confirmed = true — Xero invoice 39 days overdue

Fix recipe (NOT YET RUN):

Step 1 — Complete Issue 38 BH shunt first (BC 24956 shifts to Aug4).

Step 2 — Create class assignment on BC 24956, week starting Tue 4 Aug:
  Via SIS admin: Classes > Assign > Giampaolo Russo > week starting Tue 4 Aug 2026

Step 3 — Add Capel St accommodation:
  Via SIS admin: Booking 18180 > Add Accommodation
  Type: Capel Street apartment; Dates: Sep 6 to Sep 14 2026; Room/bed: TBD (confirm with KC/Diego)

Step 4 — Chase Xero invoice for booking 18180:
  Accounts team: create Xero invoice for booking 18180 (EUR 2584.96 paid, confirmed=true, 39 days overdue)

Risk/category: Bookings + Accommodation; low blast radius (1 student). Reversible. Student arrived today.
Status: NOT RUN — 63rd check, 18th today Sun 2 Aug 2026 UTC