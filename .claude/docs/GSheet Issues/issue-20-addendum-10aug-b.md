Issue 20 - Ariunsarnai Batbayar: EUR 1,509 Unpaid, Day 119
Reporter: AC | Sheet row: 21 | Last checked: 2026-08-10 UTC

Root Cause (Live DB 10 Aug 2026):
Booking 1605 (Ariunsarnai Batbayar, student 1047):
- Status: PENDING | Confirmed: false
- Amount paid: EUR 0 | Amount open: EUR 1,509 | Amount total: EUR 1,509
- Payments linked: 0 - no payment record in DB
- Booking last updated: 2026-06-23 (48 days ago)
- BC 1791 (Academic Year Renewal Morning, 2026-04-13 to 2026-10-23): active=true, 0 SCAs
- Day 119 since course start (April 13). No payment and no class assignment.

FIX RECIPE (NOT YET RUN):
Step 1 - Check HubSpot for payment evidence for student 1047 (Ariunsarnai Batbayar).
  If paid in HubSpot/Xero but not in SIS:
    Create payment record linked to booking 1605
    Set booking confirmed=true, status=CONFIRMED
Step 2 - If no payment found: contact student/agent re EUR 1,509.
Step 3 - Assign BC 1791 to morning class in SIS admin (regardless of payment if attending).

Risk: Financial + Bookings. Reversible. 1 student, 119 days unrecorded; EUR 1,509 unresolved.
Status: Open. PENDING, 0 pmts, 0 SCAs, day 119. Fix NOT RUN. Last checked: 2026-08-10 UTC (45th)
