# Issue 52 -- Host Email Badge in Comms To: Field | Row 54 | 421st run

Reporter: KC | Area: Booking / Accommodation | Sheet row: 54

## Symptom
Host Booking/Availability/Cancel templates do not auto-populate To: with host email.

## Root Cause (Thu 20 Aug 2026, 421st run)

Code: public/admin.html, comms section (lines ~4430-4465).
To: field auto-populates student email only. No Host recipient option.
Quick-pick badge at line 4464 (Accomm Arrival Host) selects a TEMPLATE -- does not set To:.

Fix required:
1. Add Host badge to To: selector (alongside Student / Partner badges)
2. On Host badge click: look up active accommodation provider email -> populate To:
3. On Host-type template selected: auto-activate Host badge

Fanny Scelles (student 14451, booking 17843) -- 2 hosts:
  BA 11267: 29 Aug to 4 Oct 2026, fee EUR 3,840, active -- OK
  BA 11399: 4 Oct to 19 Dec 2026, fee = null, active -- FEE MISSING (unchanged)

Main fix recipe: see issue-52-host-email-badge.md (18 Aug 2026, confirmed still correct).

Side-fix for BA 11399 fee (NOT YET RUN):
  1. SELECT amount_paid FROM bookings WHERE id=17843;
  2. UPDATE booking_accommodations SET fee = (total_paid - 3840) WHERE id = 11399;

## Risk
Code (admin.html client-side, low risk, reversible) + Data-hygiene (BA 11399 fee null).

## Status
OPEN -- Check Thu 20 Aug. BA 11399 fee still null. To: field unchanged. Fix NOT applied.
Last checked: 2026-08-20 UTC (421st run)