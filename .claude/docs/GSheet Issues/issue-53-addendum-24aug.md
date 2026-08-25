# Issue 53 - Multi-Accommodation Host Template (503rd run, Mon 24 Aug 2026 UTC)

Reporter: KC | Area: Booking / Accomm | Sheet row: 55

## Symptom
Host booking confirmation template does not support multiple accommodation periods for one student.

## Root cause
Same student as issue 52 - Fanny Scelles (student 14451), booking 17843:
- BA 11267 (bed 23): 2026-08-29 to 2026-10-04, fee EUR 3,840, active - arrival 5 days away
- BA 11399 (bed 54): 2026-10-04 to 2026-12-19, fee null, active - second stay, fee NOT SET
Two separate fixes required: (1) fee data on BA 11399; (2) code/template fix for multi-host emails.

## Fix recipe (NOT YET RUN)

Fix 1 - Set fee on BA 11399 (data)
Confirm weekly accommodation rate with KC, then:
  UPDATE booking_accommodations SET fee = <agreed_rate> WHERE id = 11399;
Oct 4 to Dec 19 = 11 weeks. Check standard Capel rate for that period.

Fix 2 - Multi-host template (code spec open)
Neil to define spec for a combined host template covering two BA periods in one email.
Reference: issue-52-host-email-badge.md for design notes.
Code changes NOT started - spec must come first.

## Risk / category
- Category: bookings (fee = data-hygiene); code (template = medium scope)
- Reversible: yes (fee) | Blast radius: Fanny only (fee); all multi-host bookings (template)

## Status
OPEN - fee fix NOT RUN; template spec open
Last checked: 2026-08-24 UTC (503rd run)