# Issue 41 — Giampaolo Russo: Capel St Apartment + Xero (20th check, 7 Aug 2026)
Reporter: Diego | Area: Booking / Accommodation | Sheet row: 43 | 20th hrly check Fri 7 Aug 2026 UTC

Root cause (verified Fri 7 Aug 2026 UTC):
- BA 11357 (Host Family, bed 178, Claremont Close, 2 Aug to 6 Sep 2026): active, checked in 5 days ago — OK
- BA 11392 (City Centre Apartment, 6 Sep to 14 Sep 2026): bed_id=null, still unassigned, 30 days to check-in, fee EUR 415
- Payment 17954: EUR 2,584.96, Bank, 26 Jun 2026, xero_payment_id=null — 42 days unreconciled

Fix recipe (NOT YET RUN):

Step 1 — Assign bed to BA 11392 in SIS Admin:
  Accommodation > booking 18180 > BA 11392 > assign available city-centre apartment bed for 6 Sep to 14 Sep 2026.

Step 2 — Reconcile payment 17954 in Xero:
  Match EUR 2,584.96 Bank Transfer (26 Jun 2026) to Xero invoice for booking 18180.

Step 3 — Verify:
  SELECT id, bed_id, active FROM booking_accommodations WHERE id=11392;
  SELECT id, xero_payment_id FROM payments WHERE id=17954;

Risk: Accommodation / accounts | Reversible | Single student | Check-in 30 days (6 Sep 2026)
Status: NOT RUN | Last checked: Fri 7 Aug 2026 UTC (20th check)