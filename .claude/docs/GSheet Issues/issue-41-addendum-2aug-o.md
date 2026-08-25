Issue 41 — Giampaolo Russo (62nd check, 17th today)

Reporter: KC | Area: Booking / Accomm | Sheet row: 43

Symptom: Two accommodation types needed (host family + Capel St); neither visible in SIS Matching section.

Root cause (confirmed Sun 2 Aug 2026 UTC):
- Student 14571 (Giampaolo Russo), booking 18180
- BC 24956 (General English AM, 3 Aug to 11 Sep 2026): active, 0 SCAs
- BC 24956 is in the Aug 3 BH shunt list — will shift to 4 Aug after Issue 38 fix
- After shunt: SCA for week starting Tue 4 Aug needed on BC 24956
- BA 11357: Host Family, Individual, Half Board, bed 178, 2 Aug to 6 Sep 2026, provider 24, confirmed, fee EUR 1250 — OK
- Capel St apartment (6 Sep to 14 Sep 2026, 1 week + 1 night): NO booking_accommodation in DB
- Booking 18180: xero_id = null, amount_paid = EUR 2584.96, confirmed = true
- Xero invoice missing for 38+ days

Fix recipe (NOT YET RUN):

Step 1 — Complete Issue 38 BH shunt first (BC 24956 shifts to Aug 4)

Step 2 — Create SCA on BC 24956 week Aug 4:
  Via SIS admin: Classes > Assign > Giampaolo Russo > week starting Tue 4 Aug

Step 3 — Add Capel St accommodation:
  Via SIS admin: Booking 18180 > Add Accommodation > Capel Street, Sep 6 to Sep 14 2026, room/bed TBD

Step 4 — Chase Xero invoice for booking 18180:
  Accounts team: create Xero invoice for booking 18180 (EUR 2584.96 paid, confirmed)

Risk: Bookings + Accomm; low blast radius (1 student). Reversible.

Status: Fix NOT RUN — 62nd check, 17th today Sun 2 Aug 2026 UTC (student arrived today)