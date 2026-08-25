Issue 48 — Telmuun Enkhsaikhan (Student 293) — Addendum 15 Aug 2026

Reporter: ST | Area: Attendance / Classes | Sheet row: 50

SYMPTOM
Student cannot be assigned to a class; Booking is PARTIAL with payment discrepancy.

CURRENT STATE (131st check — Sat 15 Aug 2026 UTC)

Booking 1624 (Telmuun Enkhsaikhan, student 293)
- Status: PARTIAL | confirmed: false
- Amount paid: EUR 1,406 | Amount open: EUR 250

Booking Course 1810
- Name: Academic Year Renewal Morning
- Dates: 29 Jun 2026 – 1 Jan 2027, active=true
- Class assignments: 0 — 47 days without assignment (Jun 29 to Aug 15)
- ILEP code: 0318/0005

Payment for Booking 1624:
  Payment 17956: EUR 100, Bank, 31 Mar 2026, xero_payment_id=null

Discrepancy: booking.amount_paid = EUR 1,406 vs DB payment sum = EUR 100 — EUR 1,306 gap
  (likely Fidelo migration lump sum; booking total is correct)

FIX RECIPE (NOT YET RUN)

Step 1: Assign Booking Course 1810 to AM class (47 days overdue — most urgent)
  SIS admin -> Student 293 -> Booking 1624 -> Booking Course 1810
  Class matching screen -> assign to Academic Year Morning class
  week_start: 29 Jun 2026 (or nearest available week)

Step 2: Collect EUR 250 open balance
  Contact student 293 or agency re EUR 250 outstanding
  Record payment in SIS when received

Step 3: Set confirmed=true once balance settled
  UPDATE bookings SET confirmed=true WHERE id=1624;
  -- NOT YET RUN — only after EUR 250 collected

Step 4: Reconcile Payment 17956 in Xero
  EUR 100, Bank, 31 Mar 2026
  Xero -> find Mar 31 bank receipt -> link to Booking 1624 invoice

Step 5: EUR 1,306 gap (informational — no action needed if total is correct)
  Optionally add booking note: EUR 1,306 migrated from Fidelo as lump sum

RISK: reversible; single student; EUR 250 collection needed; 47-day attendance gap
STATUS: OPEN — Booking Course 1810 unassigned 47d; EUR 250 outstanding; Payment 17956 unreconciled. Last checked: 2026-08-15 UTC (131st check)