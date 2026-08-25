Issue 13 -- Lizbeth del Carmen (addendum 30 Jul 2026)

Reporter: AC | Area: Doc Gen / Insurance | Sheet row: 14

Symptom
Health insurance issue -- insurance dates null despite active insurance extra on booking.

Root cause (Thu 30 Jul 2026 UTC)
- Student 14522 (Lizbeth del Carmen Sierra Martinez): insuranceFrom = null, insuranceUntil = null
- Booking 17981: status = CONFIRMED, confirmed = false, amountOpen = null, amountPaid = EUR 1407.5
- Booking extra 96: extraType = INSURANCE, active = true, details = PEL;Health -- insurance product IS on the booking
- Booking course 24773 (Academic Year Afternoon, 2026-06-01 to 2027-01-29): active = true
- Insurance extra exists but student-level insuranceFrom/insuranceUntil dates never set

Fix recipe (NOT YET RUN)

Step 1 -- Set insurance dates on student record:
  UPDATE student
  SET insurance_from = 2026-06-01,
      insurance_until = 2027-01-29
  WHERE id = 14522;
  (confirm exact dates with PEL provider)

Step 2 -- Confirm booking if payment verified:
  UPDATE booking SET confirmed = true WHERE id = 17981;

Risk: data hygiene -- low blast radius; reversible.

Status: UNCHANGED. Insurance extra active (PEL;Health) but student insurance dates null. Course Jun 2026 to Jan 2027.
Last checked: Thu 30 Jul 2026 UTC