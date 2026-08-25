Issue 41 -- Giampaolo Russo Capel Street accommodation missing (Addendum Wed 29 Jul 2026 -- 154th check)

Reporter: KC | Area: Booking / Accomm | Sheet row: 43

STATUS: Capel Street apartment still absent from booking 18180. Check-in for host family: Sun 2 Aug 2026 (4 days).

EVIDENCE (live DB, Wed 29 Jul 2026):

Booking 18180 (Giampaolo Russo, student 14571): CONFIRMED, EUR 2584.96 fully paid
Accommodation records on bk18180: 1 only
  BA 11357: bed 178, start=2026-08-02, end=2026-09-06, active=true, fee=EUR 1250 (host family)
Capel Street apartment (Sep 6 to Sep 14 2026): ABSENT - 0 accommodation records for this period

BC 24956 General English AM: starts 2026-08-03, ends 2026-09-11
  This BC also requires the Issue 38 Aug BH shunt (startDate -> 2026-08-04)

FIX RECIPE (NOT YET RUN):

Step 1: In SIS admin, open booking 18180 (Giampaolo Russo)
Step 2: Add new accommodation record:
  Type: Apartment / Capel Street
  Start: 2026-09-06, End: 2026-09-14
  Fee: as per agreement (Diego to confirm amount)
  Assign a specific bed/room once available
Step 3: Ensure Issue 38 fix is run for BC 24956 (shunt startDate to Aug 4)

RISK: bookings - reversible - single student accommodation addition

Status: OPEN - Fix NOT Run
Last checked: Wed 29 Jul 2026 UTC