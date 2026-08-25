Issue 41 — Giampaolo Russo (bk18180) — Addendum 24 Jul 2026 C
Reporter: Diego | Area: Booking / Accomm | Sheet row: 43

Symptom
Student booked Host Family (Aug 2 – Sep 6) and Capel Street apartment (Sep 6 – Sep 14).
Capel Street accommodation cannot be added to SIS. Payment not in Xero.

Root cause (72nd hourly check, 150th total — Fri 24 Jul 2026 UTC):
- Booking 18180: CONFIRMED, fully paid EUR 2,584.96
- Payment 17954 (EUR 2,584.96, Bank): xeroId = null — 28 days unreconciled — UNCHANGED
- BA 11357 (bed 178, Host Family, 2 Aug – 6 Sep 2026, EUR 1,250): active = true — correct
- Capel Street BA (6 Sep – 14 Sep 2026): STILL missing — only 1 accommodation on booking
- BC 24956 (General English AM): starts Mon 3 Aug 2026 — August Bank Holiday (Issue 38)
- Check-in: 2 Aug 2026 (Sunday) — 9 days away

Fix recipe — NOT YET RUN

Step 1: Add Capel Street booking accommodation
Via SIS admin:
1. Admin → Students → Giampaolo Russo (student 14571)
2. Open Booking 18180 → Accommodations tab
3. Add new accommodation: Capel Street, room/bed for premium room
4. Set dates: 6 Sep 2026 – 14 Sep 2026 (8 nights + 1 extra night as per deal)
5. Set fee (confirm amount with Diego)
6. Save

Step 2: Reconcile Payment 17954 in Xero
Payment 17954 (EUR 2,584.96, Bank, booking 18180) has no Xero payment ID.
Via Hub fins/ or Xero: find matching bank transaction from ~26 Jun 2026, EUR 2,584.96.
Link xeroId to payment 17954 in SIS.

Step 3: Resolve Aug BH (Issue 38)
BC 24956 starts Mon 3 Aug 2026 which is the Bank Holiday.
After adding Aug BH to school_closures, check whether course start date needs to be moved to Tue 4 Aug.

Risk / Category
- Category: Bookings — accommodation + Xero reconciliation
- Reversible: Yes (BA can be deleted; Xero link is just an ID field)
- Blast radius: Single student; Xero reconciliation affects accounts
- Urgency: HIGH — check-in 2 Aug 2026 (9 days); Capel stay starts Sep 6

Status: NOT YET RUN.
Last checked: Fri 24 Jul 2026 UTC (72nd issue check, 150th total hourly run)