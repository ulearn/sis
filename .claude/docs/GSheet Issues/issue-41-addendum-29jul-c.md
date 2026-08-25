Issue 41 - Giampaolo Russo Capel Apartment Missing (Addendum 29 Jul 2026 run C)

Reporter: Diego/AC | Area: Booking / Accomm | Sheet row: 43

Root cause (verified Wed 29 Jul 2026 UTC - 152nd hourly check)
- Booking 18180 (Giampaolo Russo, student 14571): EUR 2584.96 paid, CONFIRMED
- Booking accommodation 11357: bed 178, Host Family, 2 Aug to 6 Sep 2026, active=true (OK)
- Capel Street apartment (6 Sep to 14 Sep 2026): ABSENT - only 1 BA on booking 18180 - confirmed fresh
- Booking course 24956 (General English AM, starts 2026-08-03): needs Aug BH shunt (Issue 38)
- Host family check-in: Sun 2 Aug 2026 - 4 days away

Fix recipe (NOT YET RUN)

Step 1 - Add Capel BA via SIS admin:
  Booking 18180 → Accommodation → Add new:
  - Type: Apartment (Capel Street)
  - Start date: 2026-09-06 | End date: 2026-09-14 | Weeks: 1 (+1 night) | Active: true

Step 2 - BC 24956 will shunt to Aug 4 once Issue 38 closure is inserted.

Risk: bookings/accommodation | Reversible: yes | Blast radius: 1 booking, 1 BA record.

Status: OPEN - Fix NOT RUN - Check-in Sun 2 Aug (4 days); Capel apartment absent
Last checked: Wed 29 Jul 2026 UTC (152nd hourly check)