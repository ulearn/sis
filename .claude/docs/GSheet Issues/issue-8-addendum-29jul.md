# Issue 8 — Stale Booking Courses (Diego / Pedro / Aurora)
Reporter: AC | Area: Doc Gen / Certs | Sheet row 9

## Symptom
8 booking courses remain active past end dates. Cert issue itself RESOLVED Jun 2026.

## Current state — 12th check Wed 29 Jul 2026 UTC
All 8 unchanged (+1 day each):
- BCs 1482, 1485, 1602 (Academic Year, ended 19 Dec 2025): 222 days stale, active = true
- BCs 1483, 1486 (Academic Year Afternoon, ended 13 Feb 2026): 166 days stale, active = true
- BCs 1484, 1487, 1603 (Academic Year, ended 5 Jun 2026): 54 days stale, active = true
Last DB update on these records: May-Jun 2026.

## Fix recipe (NOT YET RUN)
Run from sis/ — deactivate 8 stale booking courses:
  ids = [1482,1483,1484,1485,1486,1487,1602,1603]
  p.bookingCourse.updateMany(where id in ids, data active=false)

Full script in: issue-8-addendum-27jul.md

## Risk
- Category: data-hygiene | Reversible: Yes | Blast radius: Zero

## Status
Open — fix NOT run. Max staleness 222 days.
Last checked: Wed 29 Jul 2026 UTC
