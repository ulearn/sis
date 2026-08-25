# Issue 17 — Ana Jessica Rosa de Paula Santos / EUR 1,530 Cancelled + Active BC 1350

**Reporter:** AC | **Area:** Booking | **Sheet row:** 18 | **Check:** 35th (Sun 16 Aug 2026 UTC)

## Symptom
Booking reported as cancelled.

## Root cause
Booking 1308 CANCELLED, EUR 1,530 paid, no successor booking.
NEW (16 Aug): Booking Course 1350 (Academic Year Afternoon, 25 May–13 Nov 2026) is active=true on this CANCELLED booking. Future end date — student may appear enrolled in some views.

Key data:
- Booking 1308: CANCELLED, confirmed=false, amountPaid=EUR 1530, amountOpen=null
- Booking Course 1350: active=true, endDate=2026-11-13 — active on cancelled booking
- Payment 17186: EUR 1280, Bank Transfer, xeroPaymentId=null (103d)
- Payment 17050: EUR 250, Bank Transfer, xeroPaymentId=null (103d)
- Student 766: hubspotContactId=777791875262, only one booking
- Booking last updated 2026-06-07 (70 days ago)

## Fix recipe (NOT YET RUN)

Step 1 — Verify 0 SCAs on BC 1350, then deactivate:
SELECT COUNT(*) FROM student_class_assignments WHERE booking_course_id=1350;
UPDATE booking_courses SET active=false WHERE id=1350;

Step 2 — Investigate via HubSpot (contact 777791875262):
  Option A — Refund issued: reconcile pmts 17186+17050 in Xero (no DB change)
  Option B — Re-enrol: create new CONFIRMED booking, link payments
  Option C — Cancelled in error: UPDATE bookings SET status=CONFIRMED, confirmed=true WHERE id=1308

Step 3 — Reconcile payments 17186 (EUR 1280) + 17050 (EUR 250) in Xero (103d outstanding).

## Risk
money / bookings — reversible — 1 student EUR 1,530

## Status
Open — Fix NOT RUN. Human decision on refund/re-enrol/cancel-error needed.

**Last checked:** Sun 16 Aug 2026 UTC (35th check)