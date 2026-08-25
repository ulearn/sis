Issue 15 -- 74th check, Sat 8 Aug 2026 UTC
Sheet row: 16 | Area: booking/class | Student: Saikhantes Shagdarsuren s1001 bk18151
===
UNCHANGED from 73rd check. Portal still blocked day 2.

Live data:
  Booking 18151: CONFIRMED confirmed=true amountPaid=EUR 1339.20
  service_end = 2026-08-07 -- expired yesterday
  BC 24925 AY Afternoon 9 Mar to 2 Oct 2026: active end date correct
  Holiday 2500: 20 Jul to 21 Aug 2026 -- student on holiday returns Mon 24 Aug
  service_end was not extended when holiday was added; correct value = 2026-10-02

FIX RECIPE - NOT YET RUN
  UPDATE bookings SET service_end = '2026-10-02' WHERE id = 18151;

Deadline: before Mon 24 Aug (student returns). Today Sat 8 Aug = 16 days.
Student on holiday so portal block has no immediate daily impact.

RISK: bookings. Reversible. Blast radius: 1 student.
Last checked: Sat 8 Aug 2026 UTC (74th check)
