# Issue 53 - No template for students with multiple accommodation periods

Reporter: KC | Area: Booking / Accomm | Sheet row: 55

## Symptom

A student with two accommodation periods (different hosts, or same host across a break) cannot be sent a single combined host-confirmation email.

## Root cause

Token resolver (documents.ts line 499) picks ONE accommodation via pickAccommByArrival. No multi-period support: no loop token, no accommodation_1.* / accommodation_2.* indexed tokens.

## Confirmed examples

Fanny Scelles (student 14451, booking 17843):
  BA 11267: OSullivan, Aug 29 - Oct 4 2026 (bed 23), fee EUR 3,840
  BA 11399: Linda Land, Oct 4 - Dec 19 2026 (bed 54), fee = null

Romain Verlut (student 74, booking 80):
  BA 11181: McSweeney, Sep 12 - Dec 19 2026 (bed 178)
  BA 11182: McSweeney, Jan 3 - Mar 21 2027 (bed 178, Christmas break return)

## URGENT: Fanny arrives 29 Aug - 7 DAYS (4th check Sat 22 Aug 2026)

BA 11399 (Fanny/Linda Land, Oct 4-Dec 19) has fee = null.
Booking 17843: CONFIRMED, confirmed = true, amountPaid = EUR 5,595.16 (fully paid), amountOpen = null.
Expected fee = EUR 5,595.16 minus EUR 3,840.00 (BA 11267) = EUR 1,755.16.
Fanny arrives 29 Aug (7 days). Host confirmation email blocked until template built.

## Fix recipe (NOT YET RUN)

Part 1 - Set missing fee on BA 11399 (do immediately):
  UPDATE booking_accommodations SET fee = 1755.16, updated_at = NOW() WHERE id = 11399;

Part 2 - Template feature (Option A recommended):
  In resolveTokens() (documents.ts ~499), expose sorted accommodations as indexed tokens:
    accommodation_1.start_date, accommodation_1.end_date, accommodation_1.host_name, ...
    accommodation_2.*, etc.
  Create new email template "Host Booking (Multiple)".
  Existing templates unaffected (indexed tokens absent when only 1 accommodation).

## Risk

Category: feature + data-fix | Reversible: yes | Medium blast radius (documents.ts).
Fee fix: low risk, 1 BA.

## Status

Open. Fee fix ready to run immediately - Fanny arrives 29 Aug (7 days).
Template feature: KC to confirm frequency of multi-host students.
First diagnosed: 2026-08-18. Last checked: 2026-08-22 Sat UTC (4th check).
