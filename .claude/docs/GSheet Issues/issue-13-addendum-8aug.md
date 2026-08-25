# Issue 13 — Lizbeth del Carmen: Insurance Null (46th check)

Reporter: ST | Area: Booking | Row: 14 | Check: 46th Sat 8 Aug 2026 UTC

46th hourly check — unchanged. 68 days since course start (1 Jun 2026).

## Root cause

- Student 14522 (Lizbeth del Carmen Sierra Martinez): insurance_from = null, insurance_until = null, visa_status = null
- Booking 17981: CONFIRMED, confirmed = false — amount paid EUR 1,407.50, amount open = null
- Booking Course 24773 (Academic Year Afternoon, 1 Jun 2026 to 29 Jan 2027): active

## Fix recipe (NOT YET RUN)

Step 1 — Set insurance dates on student 14522 (confirm dates from agency paperwork first):
  UPDATE public.students SET insurance_from = '<start>', insurance_until = '<end>' WHERE id = 14522;

Step 2 — Set booking 17981 confirmed = true:
  UPDATE public.bookings SET confirmed = true WHERE id = 17981;

Verify:
  SELECT id, insurance_from, insurance_until, visa_status FROM public.students WHERE id = 14522;
  SELECT id, status, confirmed, amount_paid FROM public.bookings WHERE id = 17981;

## Risk / category

- Category: bookings / data-hygiene | Low risk, reversible
- Blast radius: 1 student (Lizbeth Sierra Martinez), 1 booking

## Status

OPEN — fix NOT RUN. Insurance null 68 days. Confirmed flag anomaly.
Last checked: Sat 8 Aug 2026 UTC (46th hourly check)
