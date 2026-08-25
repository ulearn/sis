# Issue 38 — August + October Bank Holidays missing (34th hourly, Tue 21 Jul 2026)

**Reporter:** Staff  **Area:** Holidays / Bookings  **Sheet row:** 40

## Status check (34th hourly, 107th check)

School closures table: 9 records (Good Fridays 2026-2030 + Christmas 2026-2029). Zero bank holidays.

Missing:
- **Mon 3 Aug 2026** — August Bank Holiday — **13 calendar days away**
- **Mon 26 Oct 2026** — October Bank Holiday — 97 days away

Affected active booking courses (confirmed this run):
- Aug 3: **202 courses**
- Oct 26: **114 courses**

## Fix recipe (NOT YET RUN)

SIS admin → Settings → School Closures → Add:

1. Name: August Bank Holiday | Start: 2026-08-03 | End: 2026-08-03 | Is Paid Holiday: true
2. Name: October Bank Holiday | Start: 2026-10-26 | End: 2026-10-26 | Is Paid Holiday: true

Future years (also add):
- Aug BH 2027: 2027-08-02  /  Oct BH 2027: 2027-10-25
- Aug BH 2028: 2028-08-07  /  Oct BH 2028: 2028-10-30
- Aug BH 2029: 2029-08-06  /  Oct BH 2029: 2029-10-29
- Aug BH 2030: 2030-08-05  /  Oct BH 2030: 2030-10-28

After adding, the shunt system should recalculate end dates for affected courses.

**Status: OPEN — Fix NOT RUN**
**Last checked:** Tue 21 Jul 2026 UTC (34th hourly, 107th overall)
