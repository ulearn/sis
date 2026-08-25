# Issue 13 — Lizbeth del Carmen Sierra Martinez: insurance dates null (42nd Tue 4 Aug UTC)

Reporter: AC | Row: 14

Root cause (fresh Tue 4 Aug 2026 UTC — UNCHANGED, 2 days since Sun 2 Aug)
- Student 14522: insurance_from=null, insurance_until=null — 64 days since course start Jun 1 2026.
- HubSpot contact ID = 756514173114 (linked). Visa status = null.
- Booking 17981: CONFIRMED, confirmed=false, amountPaid=EUR 1407.50.
- Booking course 24773 (Academic Year Afternoon, Jun 1 2026 to Jan 29 2027): active=true.
- Student record last updated Jul 28 2026.

Fix recipe (NOT YET RUN)
Step 1: UPDATE students SET insurance_from = "2026-06-01", insurance_until = "2027-01-29" WHERE id = 14522;
Step 2: UPDATE bookings SET confirmed = true WHERE id = 17981; (if EUR 1407.50 fully paid - verify first)
Step 3: UPDATE students SET visa_status = "<STATUS>" WHERE id = 14522;
Step 4: SELECT id, insurance_from, insurance_until, visa_status FROM students WHERE id = 14522;

Risk: data-hygiene | Reversible: yes | Blast: 1 student record, 1 booking
Status: OPEN — insurance null 64 days, booking confirmed=false
Last checked: Tue 4 Aug 2026 UTC (42nd check)
