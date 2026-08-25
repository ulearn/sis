# Issue 36 — Pietro Caccianiga / BA 11393 fee null (182nd check Thu 13 Aug 2026)

Reporter: Staff (KC) | Area: Booking/Accomm | Sheet row: 38
182nd check — Thu 13 Aug 2026 ~20:00 UTC

## Symptom
Booking Accommodation 11393 (Pietro Caccianiga, ID 14521) has fee = null.
Check-in is 9 days away (22 Aug 2026).

## Root Cause (evidence)
- Booking Accommodation 11393: bedId = 88, fee = null, Aug 22 – Sep 13 2026, active = true
- Payment 17733: EUR 5,331 associated with this booking — unreconciled in Xero (73 days)
- No change since 181st check

## Fix Recipe (NOT YET RUN)

Step 1: Confirm with Diego what the correct weekly accommodation fee is for bed 88.

Step 2: In SIS Admin — set fee on Booking Accommodation 11393.
  Duration: 3 weeks (Aug 22 – Sep 13). Confirm total fee amount.

Step 3: Reconcile Payment 17733 (EUR 5,331) in Xero against the correct invoice.

## Risk / Category
data-hygiene / money | Reversible: yes | Blast radius: 1 student, 1 booking accommodation

## Status
OPEN. Fee null 182 days. Check-in 9 days (22 Aug 2026). Fix NOT RUN.

Last checked: 2026-08-13T20:00:00Z
Previous recipe: issue-36b-addendum-13aug-b.md