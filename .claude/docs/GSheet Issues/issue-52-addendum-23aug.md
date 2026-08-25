# Issue 52 addendum 23 Aug 2026 (4th check)

Sheet row 54 | Reporter: KC | Area: Booking / Accommodation

## Symptom
(A) Host email not auto-populated in admin comms To: field when using host booking templates.
(B) Booking Accommodation 11399 has fee = null — student Fanny Scelles arrives 29 Aug (6 days).

## Root cause
(A) Feature not implemented: admin comms block has no logic to look up accommodation host email.

(B) Booking Accommodation 11399 (bed 54, booking 17843): starts 4 Oct 2026, ends 19 Dec 2026, fee = null.
    Booking Accommodation 11267 (bed 23, booking 17843): 29 Aug to 4 Oct 2026, fee = EUR 3,840, active.
    Student Fanny Scelles (14451) arrives 29 Aug: 6 days.

## Fix recipe (NOT YET RUN)
Part A (code): Add host email auto-populate to admin.html comms block.
  When selected template is host-type (Host Availability / Host Booking / Host Cancel),
  derive host email: active BA -> bed -> accommodationProvider -> email.
  Requires Neil review before shipping.

Part B (data): Set fee on BA 11399.
  Confirm amount with Diego / booking staff BEFORE Oct 4.
  UPDATE booking_accommodations SET fee = <CONFIRMED_AMOUNT> WHERE id = 11399;

Cross-reference: Issue 53 (row 55) same student Fanny Scelles, same BA 11399.

## Risk / category
data-hygiene / code | reversible | deadline: confirm fee before Oct 4

## Status
Fix NOT RUN. 4th check. Last checked: 2026-08-23 UTC.