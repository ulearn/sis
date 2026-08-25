Issue 20 - Ariunsarnai Batbayar - Payment Due / Missing Class
Reporter: PG | Area: Booking / Class | Sheet row 21

Symptom: Student not in class-assignment queue due to outstanding payment.

Root cause (23rd hourly check - Wed 5 Aug 2026 UTC)

Booking 1605 (Ariunsarnai Batbayar, student 1047):
  Status:    PENDING (not CONFIRMED)
  Confirmed: false
  Paid:      EUR 0
  Open:      EUR 1,509
  Payments:  0

Booking course 1791:
  Name:   Academic Year Renewal Morning
  End:    2026-10-23
  Active: true
  SCAs:   0

Course start approx 2026-04-13. Today is day 115. No payment, no SCA.

Fix recipe (NOT YET RUN)

Step 1 - Collect EUR 1,509 payment from student/agent.
Step 2 - Confirm booking once payment received:
  UPDATE booking SET status = 'CONFIRMED', confirmed = true WHERE id = 1605;
Step 3 - Assign class: SIS Classes -> Assign. BC 1791 (ends 2026-10-23).

Risk: money | bookings | Reversible: yes | Blast radius: low
Status: Open - EUR 0 paid, day 115, 0 SCAs. NOT RUN.
Last checked: Wed 5 Aug 2026 UTC (23rd hourly check)