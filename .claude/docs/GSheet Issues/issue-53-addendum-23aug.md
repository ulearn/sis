# Issue 53 addendum 23 Aug 2026 (4th check)

Sheet row 55 | Reporter: KC | Area: Booking / Accommodation

## Symptom
Multi-booking host template needed: Fanny Scelles has two hosts; two separate emails required.
BA 11399 fee = null (same data gap as Issue 52).

## Root cause
No multi-booking template exists. Two Booking Accommodation records reference different beds/hosts.

Fanny Scelles (student 14451):
  BA 11267: bed 23, 29 Aug to 4 Oct 2026, fee EUR 3,840, active (first stay, OK)
  BA 11399: bed 54, 4 Oct to 19 Dec 2026, fee = null, active (second stay, fee still unset)

Student arrives 29 Aug: 6 days.

## Fix recipe (NOT YET RUN)
Data: Set fee on BA 11399.
  Confirm amount with Diego before Oct 4.
  UPDATE booking_accommodations SET fee = <CONFIRMED_AMOUNT> WHERE id = 11399;

Code: Multi-host template.
  Awaiting Neil spec before implementation.

Cross-reference: Issue 52 (row 54) same student, host email auto-populate.

## Risk / category
data-hygiene / code | reversible | deadline: confirm fee before Oct 4

## Status
Fix NOT RUN. 4th check. Last checked: 2026-08-23 UTC.