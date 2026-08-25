Issue 48 — Stale BCs + Unlinked Payments (38th check, 1st on Aug 3)
Sheet row: 50

Status: Mon 3 Aug 2026 UTC, 1st check. 4 items unchanged.

Fresh DB confirms:
- BC 24630 (General English AM Plus, Jun29-Jul10 2026): active=true, bookingId=17857 (Francesca Fassina) — 24d stale.
- BC 24631 (General English AM Plus, Jun29-Jul10 2026): active=true, bookingId=17856 (Margherita Galbusera) — 24d stale.
- Booking 17856 (Margherita Galbusera): CONFIRMED, confirmed=false, amountPaid=EUR 339.90, 0 payments linked.
- Booking 17857 (Francesca Fassina): CONFIRMED, confirmed=false, amountPaid=EUR 339.90, 0 payments linked.
- Orphan payments 16988 + 16989 (EUR 339.90 each): bookingId=null. Same as Issue 1.
- Note: BCs 24630+24631 were 23d stale at last check; now 24d.

Fix recipe (NOT YET RUN) — coordinate with Issue 1:
1. Deactivate BCs: UPDATE booking_courses SET active=false WHERE id IN (24630, 24631);
2. Link pmts: UPDATE payments SET booking_id=17856 WHERE id=16988;
            UPDATE payments SET booking_id=17857 WHERE id=16989;
   (First verify via HubSpot — see Issue 1 recipe.)
3. Set confirmed=true on bk17856+bk17857 once payments verified.

Risk: payments + bookings — reversible — 2 students (Galbusera, Fassina).
Status: NOT RUN — 38th check, 1st Mon 3 Aug 2026 UTC.