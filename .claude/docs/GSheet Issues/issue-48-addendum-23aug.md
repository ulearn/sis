ISSUE 48 -- Telmuun Enkhsaikhan (and ILEP students)
Reporter: AC | Area: Attendance/classes | Sheet row 50

SYMPTOM
Several students not appearing in SIS for class assignment (Uyanga Tungalag, Ana Jessica
Rosa de Paula Santos, Telmuun Enkhsaikhan, Arunsarnai Batbayar). Saikhantes tracked as
Issue 15. Enshi Lu tracked as Issue 23.

ROOT CAUSE -- Telmuun Enkhsaikhan (24th check, Sun 23 Aug 2026 UTC)
- Booking 1624: PARTIAL, confirmed = false
- amountPaid = EUR 1,406, amountTotal = EUR 1,656, amountOpen = EUR 250
- Only 1 payment record in DB: id 17956, EUR 100 (Bank, xeroPaymentId = null, Jun 29 2026)
- Gap: EUR 1,306 stored in amountPaid but no corresponding payment records
  Likely: pre-migration Fidelo lump-sum or manual amountPaid edit
- Active BC 1810 (Academic Year Renewal Morning, Jun 29 2026 to Jan 1 2027): 0 SCAs, 55 days since start
- Last booking update: 2026-08-05

FIX RECIPE (NOT YET RUN)

Step 1 -- Investigate the EUR 1,306 gap:
  SELECT id, amount, method, xero_payment_id, created_at FROM payment WHERE booking_id = 1624;
  SELECT hubspot_deal_id FROM booking WHERE id = 1624;
  Check HubSpot deal + Xero for additional payments totalling EUR 1,306.
  If confirmed:
    INSERT INTO payment (booking_id, amount, method, xero_payment_id, created_at)
    VALUES (1624, 1306.00, 'Bank', '<XeroPaymentId>', NOW());
    -- Adjust amount/method/date to match actual Xero records

Step 2 -- Create class assignment for BC 1810:
  Confirm class with AC/Paul. Then:
  INSERT INTO student_class_assignments (student_id, class_id, booking_course_id, week_start, week_end, created_at)
  VALUES ((SELECT student_id FROM booking WHERE id = 1624), <CLASS_ID>, 1810, '2026-06-29', '2027-01-01', NOW());

Step 3 -- Set confirmed = true once payment gap resolved and amountOpen verified.

RISK: money / bookings. EUR 1,306 gap needs Xero/HubSpot verification before adding payment records.
Class assignment step is safe and independent. Blast radius: Telmuun only.

STATUS: OPEN -- Fix NOT RUN
Last checked: 2026-08-23 UTC (24th hourly run)
