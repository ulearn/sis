# Issue 15 — Saikhantes service_end Expired (Addendum 9 Aug-d)

**Check:** 85th Sun 9 Aug 2026 UTC | **Row:** 16 | service_end 2 days past

## Status (fresh query, 9 Aug 2026)

Booking 18151 (Saikhantes Shagdarsuren):
  status=CONFIRMED, confirmed=true
  amountPaid=EUR 1,339.20, amountOpen=EUR 0 (fully settled)
  serviceEnd=2026-08-07 — now 3 days expired

Booking Course 24925 (Academic Year Afternoon, 2026-03-09 to 2026-10-02): active=true
serviceEnd should match BC end = 2026-10-02.

Payment 17872: EUR 1,339.20, Bank Transfer 2025-12-19, xeroPaymentId=null (unreconciled).
Also tracked as Issue 29 (row 30).

## Fix Recipe (NOT YET RUN)

  UPDATE bookings SET service_end = '2026-10-02' WHERE id = 18151;

Status: Open. NOT RUN. Last checked: 2026-08-09 UTC (85th check)