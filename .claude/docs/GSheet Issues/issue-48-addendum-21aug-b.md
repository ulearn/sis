Issue 48 addendum - Telmuun Enkhsaikhan Class Assignment / Payment Gap - Fri 21 Aug 2026 19:00 UTC
No change since yesterday.

Booking 1624 (Telmuun Enkhsaikhan, student 293):
  Status: PARTIAL, confirmed = false
  amountTotal: EUR 1,656 | amountPaid (booking field): EUR 1,406 | amountOpen: EUR 250
  Payment records: 1 only - Payment 17956, EUR 100, 31 Mar 2026, xeroPaymentId = null
  EUR 1,306 gap: booking.amountPaid shows 1,406 vs Payment table total EUR 100
  Same anomaly pattern as Issue 1 (bookings 17856/17857).

Booking Course 1810 (Academic Year Renewal Morning):
  Started 29 Jun 2026, ends 1 Jan 2027, active = true
  Student class assignments: 0
  Days since start: 54

Fix NOT YET RUN:
  Step 1: ssh hub@localhost, check fins/ for payments on booking 1624 or student 293
  Step 2: Create StudentClassAssignment for BC 1810 (confirm class/weekEnding first)
  Step 3: After payment confirmed: UPDATE Booking SET confirmed = true, amountOpen = 0 WHERE id = 1624

Risk: Money/Bookings, reversible, 1 student, 1 booking, 1 booking course.
Last checked: Fri 21 Aug 2026 ~19:00 UTC