Issue 20 Addendum 13 Aug 2026 (50th check) -- Payment Due / Not Assigned

Reporter: Unknown  Area: Class Assignment / Payments  Sheet row: 21

Symptom
Student not appearing in to-be-assigned list -- says payment due.

Root cause (50th check -- Thu 13 Aug UTC)
- Booking 1605 (Ariunsarnai Batbayar, student 1047): status = PENDING, confirmed = false
- EUR 0 paid, EUR 1,509 open -- no payments linked to booking 1605
- Booking last updated 2026-06-23 (51 days ago)
- Booking Course 1791 (Academic Year Renewal Morning, 13 Apr to 23 Oct 2026): active = true, 0 class assignments
- Day 122 since course start (13 Apr 2026) -- student unassigned entire course
- Likely Fidelo migration gap: payment made in Fidelo before SIS migration, not carried across
  (same pattern as Telmuun Enkhsaikhan, Issue 48)
- Unchanged from 49th check (Wed 12 Aug)

Fix recipe (NOT YET RUN)
Step 1 -- Confirm payment with accounts: check Xero/bank for payment from Ariunsarnai Batbayar / student 1047 ~Apr 2026
Step 2 -- If payment confirmed externally:
  a. Create payment record (NOT YET RUN -- adjust amount/date/method as confirmed):
     INSERT INTO payment (booking_id, amount, method, created_at) VALUES (1605, 1509, chr(39)||Bank Transfer||chr(39), chr(39)||2026-04-13||chr(39));
  b. Set booking confirmed = true (NOT YET RUN):
     UPDATE booking SET confirmed = true WHERE id = 1605;
  c. Assign student to class via SIS admin UI (Booking Course 1791)
Step 3 -- If payment NOT confirmed: contact student/agent re outstanding EUR 1,509

DO NOT set confirmed=true without payment confirmation.

Risk: money / bookings. Medium risk. Reversible. Blast: 1 student, EUR 1,509.

Status: open -- fix NOT RUN. 50 consecutive checks.
Last checked: Thu 13 Aug 2026 UTC (50th check, day 122 in course)