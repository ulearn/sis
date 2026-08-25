Issue 48 -- Telmuun Enkhsaikhan (booking 1624)
Reporter: Staff | Area: Attendance/classes | Sheet row 50

Symptom
EUR 1,306 payment gap in DB. BC 1810 has 0 class assignments after 55 days.

Root cause
- Booking 1624: status = PARTIAL, confirmed = false
- amountPaid = EUR 1,406 | amountTotal = EUR 1,656 | amountOpen = EUR 250
- Only 1 payment record: id 17956, EUR 100 (Bank, xeroPaymentId = null, 29 Jun 2026)
- EUR 1,306 gap: amountPaid = 1,406 but sum of payment rows = 100
- BC 1810 (Academic Year Renewal Morning, Jun 29 to Jan 1 2027): 0 SCAs, 55 days active
- Last booking update: 5 Aug 2026

Fix recipe (NOT YET RUN)

Step 1: Verify EUR 1,306 in Xero / HubSpot
  Check Xero for payments vs this student around May-Jun 2026.
  Check HubSpot deal for payment notes.

Step 2: Create payment record(s) if verified
  p.payment.create({ data: { bookingId: 1624, amount: 1306, method: "Bank",
    xeroPaymentId: "<id>", createdAt: new Date("<date>") } })

Step 3: Mark booking 1624 confirmed = true, status = CONFIRMED (once total = EUR 1,656).

Step 4: Create SCA on BC 1810
  Class: ask AC for current class
  weekStart: 2026-06-29
  weekEnd: 2027-01-01

Risk / category
- Category: money / bookings / class assignments
- Reversible: yes (payment record deletable if wrong)
- Blast radius: booking 1624 only; Xero verification required before any DB write

Status: OPEN -- Fix NOT RUN
Last checked: 2026-08-23 UTC (483rd run, 25th issue check)