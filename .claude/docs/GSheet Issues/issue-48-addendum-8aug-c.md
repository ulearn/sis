Issue 48 -- 75th check, Sat 8 Aug 2026 UTC
Sheet row: 50 | Area: Attendance/classes
===
UNCHANGED from 74th check.

Telmuun Enkhsaikhan (student 293):
  BC 482:  active=true  ended 2025-03-14  512 days stale
  BC 483:  active=true  ended 2025-07-11  393 days stale
  BC 1609: active=true  ended 2025-12-19  232 days stale
  BC 1610: active=true  ended 2026-01-09  211 days stale
  BC 1611: active=true  ended 2026-03-06  155 days stale
  BC 1612: active=true  ended 2026-05-01   99 days stale

Ana Jessica Rosa de Paula Santos (student 766):
  Booking 1308: CANCELLED confirmed=false amountPaid=EUR 1530
  EUR 1530 on record as paid against cancelled booking -- refund status unknown.

FIX RECIPE - NOT YET RUN
  1. UPDATE booking_courses SET active=false WHERE id IN (482,483,1609,1610,1611,1612);
  2. Verify Ana refund: check HubSpot/Xero for EUR 1530 refund against booking 1308.
     If refund confirmed: no DB action needed.
     If not refunded: initiate refund before archiving.

RISK: data-hygiene (Telmuun) + money (Ana). Telmuun reversible. Ana verify first.
Last checked: Sat 8 Aug 2026 UTC (75th check)
