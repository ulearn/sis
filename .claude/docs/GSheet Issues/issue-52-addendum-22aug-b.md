# Issue 52 addendum 22 Aug 2026 (3rd check)

Sheet row 54 | Reporter: KC | Area: Booking / Accommodation

## Symptom
(A) Host email not auto-populated in admin comms To: field when using host booking templates.
(B) Booking Accommodation 11399 has fee = null.

## Root cause
(A) Feature not implemented: admin.html comms block derives student/partner email for To: field,
    but has no logic to look up the accommodation host email for host-type templates.

(B) Booking Accommodation 11399 (bed 54, booking 17843): starts 4 Oct 2026, ends 19 Dec 2026, fee = null.
    Student Fanny Scelles (14451) arrives 29 Aug 2026 — 7 days away.
    First stay BA 11267 (bed 23, 29 Aug – 4 Oct, EUR 3,840) is correctly priced.
    Second stay BA 11399 has no fee set.

## Fix recipe (NOT YET RUN)
Part A (code) — Add host email auto-populate:
  In public/admin.html, in the comms To: field population logic (~line 4430-4465),
  when the selected template is a host-type (Host Availability, Host Booking, Host Cancel),
  derive the host email: active BA -> bed -> accommodationProvider -> email.
  Requires Neil review before shipping.

Part B (data) — Set fee on BA 11399:
  Confirm amount with Diego / booking staff BEFORE Oct 4.
  prisma.bookingAccommodation.update({ where: { id: 11399 }, data: { fee: <CONFIRMED_AMOUNT> } })

Cross-reference: Issue 53 (row 55) same student Fanny Scelles, same BA 11399.

## Risk / category
documents / data-hygiene / code | reversible | deadline: confirm fee before Oct 4

## Status
Fix NOT RUN. 3rd check. Last checked: 2026-08-22 UTC.