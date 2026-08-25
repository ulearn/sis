Issue 13 addendum — 9 Aug 2026 (47th check)

Reporter: ST | Area: Booking | Row: 14

47th hourly check — unchanged. 69 days since course start (1 Jun 2026).

Root cause:
  Student 14522 (Lizbeth del Carmen Sierra Martinez): medical_from = null, medical_until = null
  Visa: visa_from = 2026-06-01, visa_until = 2027-02-01, visa_id = null, visa_status = null
  Booking 17981: CONFIRMED, confirmed = false, amount paid EUR 1407.50, amount open = null
  Booking Course 24773 (Academic Year Afternoon, 1 Jun 2026 to 29 Jan 2027): active
  Documents: template 1 ISSUED (doc 213), template 1 REVOKED (doc 211) — no insurance template

Fix recipe (NOT YET RUN):
  Step 1 — Confirm insurance dates from paperwork, then:
    UPDATE public.students SET medical_from = "<start>", medical_until = "<end>" WHERE id = 14522;
  Step 2 — Confirm booking:
    UPDATE public.bookings SET confirmed = true WHERE id = 17981;

Verify:
  SELECT id, medical_from, medical_until, visa_status FROM public.students WHERE id = 14522;
  SELECT id, status, confirmed, amount_paid FROM public.bookings WHERE id = 17981;

Risk: data-hygiene | reversible | Blast radius: 1 student, 1 booking

OPEN — fix NOT RUN. Insurance null 69 days. Booking confirmed = false.
Last checked: 2026-08-09 UTC (47th hourly check)