Issue 41 - Giampaolo Russo Dual Accommodation - 70th check Mon 3 Aug 2026 UTC (6th today)

Root Cause (confirmed 2026-08-03 UTC, 70th check):
- Booking 18180 (Giampaolo Russo, student 14571): CONFIRMED, amount_paid=EUR 2584.96, amount_open=EUR 0.
- BC24956 (GE AM, Aug3-Sep11): active=true, start_date=2026-08-03 (bank holiday), 0 class assignments.
- BC24956 is in Issue 38 shunt list. Shunt moves start_date to 2026-08-04.
- Accommodation 11357 (bed 178, Aug2-Sep6): active=true, host family Patty McSweeney, property 66.
- Capel Street BA (Sep6-Sep14): NO booking_accommodations record in database. Confirmed absent.
- Document records on bk18180: NONE. No invoice issued.
- Payment 17954: EUR 2584.96 paid 2026-06-26, xero_payment_id=null (38 days unreconciled).

Fix Recipe - NOT YET RUN
Step 1: Run Issue 38 BH shunt. BC24956 start_date moves Aug3 to Aug4 automatically.
Step 2: Create SCA for week of 2026-08-04 on BC24956 via SIS admin To-Be-Assigned. URGENT.
Step 3: Add booking_accommodation for Capel Street on bk18180: start Sep6, end Sep14.
Step 4: Issue invoice for bk18180 via SIS admin Documents.
Step 5: Reconcile Xero for payment 17954 (38d gap).

Risk: Bookings, Accommodation, Documents, Money. Single student. Reversible.
URGENT: SCA before Tuesday 4 Aug morning.

Status: STILL NOT RUN (70th check, 6th today). 0 SCAs. Capel BA absent. No invoice. Xero 38d gap.
Last checked: 2026-08-03 UTC (70th hourly check, 6th today)