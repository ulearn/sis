Issue 13 Lizbeth del Carmen Sierra Martinez (40th check Fri 31 Jul 2026)

Reporter: AC | Area: Booking | Sheet row: 14

Root cause verified live Fri 31 Jul 2026 UTC unchanged
Student 14522: insurance_from null insurance_until null
Booking 17981: CONFIRMED status confirmed=false amountPaid 1407.50 EUR
Course Academic Year Afternoon Jun 1 2026 to Jan 29 2027
Insurance dates null for 67 days since course start

Fix recipe NOT YET RUN
UPDATE students SET insurance_from = 2026-06-01, insurance_until = 2027-01-29 WHERE id = 14522
SELECT id, status, confirmed, amount_paid FROM bookings WHERE id = 17981

Risk: data-hygiene reversible blast-radius 1 student record
Status: Fix NOT RUN 40 consecutive checks
Last checked: Fri 31 Jul 2026 UTC