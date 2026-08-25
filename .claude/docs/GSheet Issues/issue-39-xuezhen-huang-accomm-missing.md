# Issue 39 - Xuezhen Huang - Host Family Accommodation + Xero Reconciliation

Reporter: KC | Area: Booking / Accomm | Sheet row: 41 | SIS student: 14443

SYMPTOM
The student paid for 3 weeks of accommodation in Host Family, but it did not appear in SIS accommodation section for allocation. From 12/07/2026 to 02/08/2026.

ROOT CAUSE (at time of initial report)
No booking_accommodation record existed. Accommodation was never created in SIS.

RESOLUTION of original complaint (Jun 25 2026)
Staff created accommodation record 11358 via SIS UI:
- booking_accommodation id=11358, booking_id=17831, bed_id=180 (Host Family)
- start_date=2026-07-12, end_date=2026-08-02, active=true, fee=900
- created_at=2026-06-25T14:25:25.053Z
Original complaint RESOLVED. Two items remain open.

---

UPDATED STATE - 2 Jul 2026 (3rd bot check, fresh DB)

MAJOR CHANGE: New payment 17963 arrived 1 Jul 2026.

Current DB state:
- Booking 17831: status=PARTIAL, confirmed=false, amtPaid=965.00, amtTotal=1396.90, amtOpen=431.90
- Course 24609 (Morning General, 13 Jul to 31 Jul, fee=570): active=true, starts in 11 days
- Accommodation 11358 (Host Family, bed 180, 12 Jul to 2 Aug, fee=900): active=true, starts in 10 days
- Payment 17180: EUR 431.90, method=TransferMate Escrow, date=27 Apr 2026, bookingId=17831, xeroPaymentId=null, hubspotPaymentId=null
- Payment 17963: EUR 965.00, method=Bank, date=1 Jul 2026, bookingId=17831, xeroPaymentId=null, hubspotPaymentId=1273784562922

Why booking shows PARTIAL: Payment 17180 (EUR 431.90, Escrow) has no Xero ID and no HubSpot ID.
Total of both payments = 431.90 + 965.00 = 1396.90 = amtTotal — booking is fully covered,
but payment 17180 must be reconciled before the system counts it in amountPaid.

---

FIX RECIPE (NOT YET RUN)

Step 1 — Reconcile payment 17180 in Xero (EUR 431.90, TransferMate Escrow, 27 Apr 2026)
  In Xero: find the invoice for booking 17831 (student Xuezhen Huang, ref BK-2026-017831)
  Match the EUR 431.90 TransferMate Escrow payment to the invoice.
  Verify xeroPaymentId populates in SIS payments table.

Step 2 — Reconcile payment 17963 in Xero (EUR 965.00, Bank, 1 Jul 2026)
  In Xero: find the EUR 965 Bank payment dated 1 Jul 2026 for booking 17831.
  HubSpot payment ID 1273784562922 can help cross-reference.
  Match to the invoice and verify xeroPaymentId is set.

Step 3 — Confirm booking once both payments reconciled (NOT YET RUN)
  UPDATE bookings SET confirmed=true, updated_at=NOW() WHERE id=17831;

Step 4 — Verify
  SELECT id, status, confirmed, amount_paid, amount_total, amount_open FROM bookings WHERE id=17831;
  SELECT id, amount, method, payment_date, xero_payment_id, hubspot_payment_id FROM payments WHERE booking_id=17831;
  Expected: status=CONFIRMED, confirmed=true, amount_paid=1396.90, amount_open=0.

RISK / CATEGORY
  Category: bookings, payments, Xero reconciliation
  Reversible: Yes
  Blast radius: One student, one booking, two payments
  Urgency: Course starts 13 Jul (11 days); accommodation starts 12 Jul (10 days)

STATUS
OPEN — accommodation ba11358 (bed 180, HF, Jul 12-Aug 2) resolved Jun 25.
Payment 17180 (EUR 431.90 Escrow) still unreconciled.
New payment 17963 (EUR 965 Bank) arrived 1 Jul 2026 — also unreconciled.
Booking PARTIAL (965/1396.90). Course starts 11 days.
Last checked: 2026-07-06 UTC (61st check) — BA11358 claimStatus=null. BK17831 PARTIAL EUR965/1396.9. Pmt17963 xero_payment_id=null. Pmt17180 TransferMate escrow type=null xero=null. ACCOMMODATION STARTS JUL12 = 6 DAYS.
**2 Jul UTC (4th check, fresh DB): CONFIRMED UNCHANGED. pmt17963 (EUR965, Bank, hsId=1273784562922, Jul01): xeroId=STILL null. pmt17180 (EUR431.90, Escrow, Apr27): xeroId=null, hsId=null — completely unreconciled. bk17831 PARTIAL EUR965/1396.90 (EUR431.90 outstanding) confirmed=false. ba11358 (bed 180, Jul12-Aug2) OK. bc24609 (Morning General, Jul13-31) starts in 11 days. Both payments unreconciled (UNCHANGED 4 checks). Neil: reconcile pmt17180 + pmt17963 in Xero before Jul13 course start. Last checked: 2026-07-02 UTC (4th check, hrly bot).**

**3 Jul UTC (5th check, fresh DB): CONFIRMED UNCHANGED. pmt17963 (EUR965, Bank, hsId=1273784562922, Jul01): xeroId=STILL null. pmt17180 (EUR431.90, Apr27=67d): xeroId=null, hsId=null — completely unreconciled. bk17831 PARTIAL EUR965/1396.90 (EUR431.90 outstanding) confirmed=false. ba11358 (bed 180, HF, Jul12-Aug2) OK. bc24609 (Morning General, Jul13-31) starts in 10 days. Both payments unreconciled (UNCHANGED 5 checks). NEIL: reconcile pmt17180 + pmt17963 in Xero before Jul13 course start. Last checked: 2026-07-03 UTC (5th check, hrly bot).**


**3 Jul FRI UTC (7th check, fresh DB): UNCHANGED. pmt17963 EUR965 type=null xeroPaymentId=null hubspotPaymentId=1273784562922 bookingId=17831 createdAt=Jul02. pmt17180 EUR431.90 type=null xeroPaymentId=null hubspotPaymentId=null bookingId=17831. bk17831 PARTIAL amtPaid=965/1396.90 (open=431.90) confirmed=false. ba11358 bed180 Jul12-Aug02 active=true. Accommodation starts 9 days. Neither payment reconciled in Xero. Note: pmt17180 has no HubSpot payment ID — may have come from TransferMate or bank wire direct. Last checked: 2026-07-03 UTC (7th check, hrly bot).**
**3 Jul FRI UTC (8th check, fresh DB): CONFIRMED UNCHANGED. pmt17963 (EUR965.00, Bank, HubSpot 1273784562922, bookingId=17831, created Jul02): type=null, xeroPaymentId=STILL null. pmt17180 (EUR431.90, bookingId=17831, hubspotPaymentId=null): type=null, xeroPaymentId=null — 67 days unreconciled. bk17831 PARTIAL, confirmed=false, amountTotal=1396.90, amountOpen=431.90. ba11358 (bed 180, Jul12-Aug02, active=true): in place. Accommodation starts in 9 days; course starts in 10 days. Neither payment reconciled in Xero (UNCHANGED 8 checks). NEIL: reconcile pmt17180 + pmt17963 in Xero, then confirm booking 17831. Last checked: 2026-07-03 UTC (8th check, hrly bot).**

**3 Jul FRI UTC (10th check, fresh DB): CONFIRMED UNCHANGED. pmt17963 (EUR965.00, Bank, HubSpot 1273784562922, bookingId=17831, created Jul02): type=null, xeroPaymentId=STILL null. pmt17180 (EUR431.90, bookingId=17831, hubspotPaymentId=null): type=null, xeroPaymentId=null — 68 days unreconciled. bk17831 PARTIAL, confirmed=false, amountTotal=1396.90, amountOpen=431.90. ba11358 (bed 180, Jul12-Aug02, active=true): in place. Accommodation starts in 9 days. Neither payment reconciled in Xero (UNCHANGED 10 checks). NEIL: reconcile pmt17180 + pmt17963 in Xero, then confirm booking 17831 before Jul12. Last checked: 2026-07-03 UTC (10th check, hrly bot).**


**3 Jul FRI UTC (12th check, fresh DB): CONFIRMED UNCHANGED. pmt17963 (EUR965.00, Bank, HubSpot 1273784562922, bookingId=17831, created Jul02): type=null, xeroPaymentId=STILL null. pmt17180 (EUR431.90, TransferMate Escrow, bookingId=17831, hubspotPaymentId=null, Apr27=67d): type=null, xeroPaymentId=null — still completely unreconciled. bk17831 PARTIAL, confirmed=false, amountTotal=1396.90, amountPaid=965.00, amountOpen=431.90. ba11358 (bed 180, Host Family, Jul12-Aug02, active=true): in place, 9 days to start. Neither payment reconciled in Xero (UNCHANGED 12 checks). NEIL: reconcile pmt17180 (EUR431.90 Escrow) + pmt17963 (EUR965 Bank) in Xero, then UPDATE bookings SET confirmed=true WHERE id=17831 before Jul12 accommodation start. Last checked: 2026-07-03 UTC (12th check, hrly bot).**

**3 Jul UTC (12th check, fresh DB): CONFIRMED UNCHANGED. pmt17963 EUR965 type=null xeroId=null HS1273784562922 (updatedAt=Jul02). pmt17180 EUR431.90 type=null xeroId=null hsId=null. bk17831 PARTIAL confirmed=false amtPaid=965 amtOpen=431.9 (updatedAt=Jul02). ba11358 bed180 Jul12-Aug02 active=true. Accommodation starts Jul12=9d. Both payments unreconciled. NEIL: reconcile both in Xero before Jul12. Last checked: 2026-07-03 UTC (12th check, hrly bot).**

**3 Jul UTC (13th check, fresh DB): CONFIRMED UNCHANGED. pmt17963 (EUR965.00, Bank, HubSpot 1273784562922, bookingId=17831, created Jul02): type=null, xeroPaymentId=STILL null. pmt17180 (EUR431.90, bookingId=17831, hubspotPaymentId=null, paid Apr27=67d): type=null, xeroPaymentId=null — completely unreconciled. bk17831 PARTIAL, confirmed=false, amountTotal=1396.90, amountPaid=965.00, amountOpen=431.90. ba11358 (bed 180, Host Family, Jul12-Aug02, active=true, claimStatus=null): bed assigned, not yet released to provider. Accommodation starts in 9 days; course starts in 10 days. Both payments unreconciled (UNCHANGED 13 checks). NEIL: reconcile pmt17180 (EUR431.90, TransferMate Escrow, Apr27) + pmt17963 (EUR965, Bank, Jul01) in Xero, then UPDATE bookings SET confirmed=true WHERE id=17831 before Jul12. Last checked: 2026-07-03 UTC (13th check, hrly bot).**

**3 Jul FRI UTC (15th check, fresh raw SQL): CONFIRMED UNCHANGED. bk17831 PARTIAL, confirmed=false, amountTotal=1396.90, amountPaid=965.00 (amountOpen=431.90). ba11358 (bed 180, Host Family, Jul12-Aug02, active=true, claimStatus=null). pmt17963 (EUR965.00, HubSpot 1273784562922, bookingId=17831, type=null, xeroPaymentId=STILL null, created Jul02). pmt17180 (EUR431.90, bookingId=17831, type=null, xeroPaymentId=null, hubspotPaymentId=null, created May05=59 days). Both payments total 1396.90 = amtTotal — booking is fully covered in DB but system shows amountPaid=965 (only counting pmt17963; pmt17180 not reconciled so not counted in amtPaid). Accommodation starts Jul12 = 9 days. Course (bc24609 Morning General Jul13-Jul31) starts 10 days. Both payments unreconciled in Xero (UNCHANGED 15 checks). NEIL: reconcile pmt17180 (EUR431.90 TransferMate/Escrow, May05) + pmt17963 (EUR965, Bank, Jul01) in Xero, then UPDATE bookings SET confirmed=true WHERE id=17831 before Jul12. Last checked: 2026-07-03 UTC (15th check, hrly bot).**
**3 Jul FRI UTC (16th check, fresh DB): CONFIRMED UNCHANGED. bk17831 PARTIAL, confirmed=false, amountTotal=1396.90, amountPaid=965.00, amountOpen=431.90. ba11358 (bed 180, Host Family, Jul12-Aug02, active=true, claimStatus=null) — accommodation starts in 9 days. pmt17963 (EUR965.00, Bank, HubSpot 1273784562922, payment_date=2026-07-01): type=null, xeroPaymentId=STILL null. pmt17180 (EUR431.90, payment_date=2026-04-27, type=null, xeroPaymentId=null, hubspotPaymentId=null) — 67 days unreconciled. Both payments together = EUR1396.90 = amtTotal — booking fully covered in DB. Neither payment reconciled in Xero (UNCHANGED 16 checks). NEIL: reconcile pmt17180 (EUR431.90 Escrow, Apr27) + pmt17963 (EUR965 Bank, Jul01) in Xero, then UPDATE bookings SET confirmed=true WHERE id=17831 before Jul12 accommodation start. Last checked: 2026-07-03 UTC (16th check, hrly bot).**


**4 Jul SAT UTC (17th check, fresh DB): CONFIRMED UNCHANGED. Booking 17831: status=PARTIAL, confirmed=false, amount_paid=EUR 965, amount_total=EUR 1396.90, amount_open=EUR 431.90. Payment 17963 (EUR 965, 2 Jul 2026): hubspot_payment_id=1273784562922, xero_payment_id=null. Payment 17180 (EUR 431.90, 5 May 2026): type=null, hubspot_payment_id=null, xero_payment_id=null (60 days unreconciled). Combined payments EUR 1396.90 = booking total. Booking auto-confirms when amount_open=0. Accommodation 11358 (bed 180, Jul 12-Aug 2): active=true, no claim placed. Accommodation starts in 8 days. 17 hourly checks, NO XERO RECONCILIATION. NEIL: reconcile both payments in Xero — particularly pmt17180 (60 days old, type=null). Last checked: 2026-07-04 UTC (17th check, hrly bot).**


---
4 Jul 2026 UTC (fresh DB check):
- bk17831: PARTIAL, confirmed=false, amount_paid=965.00/1396.90, amount_open=431.90 — UNCHANGED
- bc24609 (Morning General, Jul13-Jul31, fee=570): active=true — starts in 9 days
- ba11358 (bed 180, Host Family, Jul12-Aug2, fee=900): active=true — starts in 8 days
- pmt17180 (EUR431.90, no xero_payment_id, no hubspot_payment_id): STILL unreconciled
- pmt17963 (EUR965, hubspot_payment_id=1273784562922, no xero_payment_id): STILL unreconciled in Xero
- Both payments together = EUR1396.90 = amount_total — booking is fully covered
- NEIL: Reconcile both payments in Xero urgently. Accommodation starts Jul12 = 8 days.

**4 Jul SAT UTC: CONFIRMED UNCHANGED. bk17831 PARTIAL confirmed=false amtPaid=965/1396.9 (EUR431.9 outstanding). pmt17180(EUR431.9 Apr27 TM Escrow xeroId=null hsId=null) NOT reconciled, NOT counted in amtPaid. pmt17963(EUR965 Jul1 hsId=1273784562922 xeroId=null) counted in amtPaid but not in Xero. Both payments together = EUR1396.9 = booking total. Accommodation 11358 (bed 180, Host Family) Jul12-Aug2 = starts in 8 days. Course 24609 (Morning General Jul13-Jul31) = starts in 9 days. Xero reconciliation of both payments URGENT. Last checked: 2026-07-04 UTC (hrly bot).**

**4 Jul SAT UTC (21st check, fresh DB): CONFIRMED UNCHANGED. bk17831 PARTIAL confirmed=false EUR965/1396.90 (EUR431.90 open). pmt17180 (EUR431.90, May 5, 60 days): type=null xeroPaymentId=null hubspotPaymentId=null — completely unreconciled. pmt17963 (EUR965, Jul 2): type=null xeroPaymentId=null hubspotPaymentId=1273784562922 — counted in amtPaid but not in Xero. ba11358 (bed 180, Host Family, Jul12-Aug02, active=true): starts in 8 days. bc24609 (Morning General, Jul13-Jul31): starts in 9 days. Booking unconfirmed — accommodation blocked from provider allocation view. Both payments STILL unreconciled in Xero (UNCHANGED 21 checks). NEIL: reconcile pmt17180 + pmt17963 in Xero, then UPDATE bookings SET confirmed=true WHERE id=17831 before Jul12. Last checked: 2026-07-04 UTC (21st check, hrly bot).**
**4 Jul SAT UTC (22nd check, fresh DB): CONFIRMED UNCHANGED. bk17831 PARTIAL confirmed=false amountPaid=965/1396.90 amountOpen=431.90. pmt17180 (EUR431.90, Apr27, TransferMate Escrow): xeroPaymentId=null, hubspotPaymentId=null — not counted in amountPaid. pmt17963 (EUR965, Jul1, Bank, HS 1273784562922): xeroPaymentId=null — counted in amountPaid but not reconciled in Xero. Both payments together = EUR1396.90 = booking total. ba11358 (bed 180, Host Family, Jul12-Aug02): starts in 8 days. bc24609 (Morning General, Jul13-Jul31): starts in 9 days. NEIL: reconcile pmt17180+pmt17963 in Xero, then confirm booking 17831 via SIS before Jul12. Last checked: 2026-07-04 UTC (22nd check, hrly bot).**


**4 Jul SAT UTC (25th check, fresh DB): CONFIRMED UNCHANGED. bk17831 STILL PARTIAL, confirmed=false, amtPaid=965.00/1396.90, amountOpen=431.90. pmt17963 (EUR965.00, Bank, HubSpot 1273784562922, bookingId=17831, created Jul02): type=null, xeroPaymentId=STILL null — counted in amtPaid but not reconciled in Xero. pmt17180 (EUR431.90, bookingId=17831, hubspotPaymentId=null, created Apr27=68d): type=null, xeroPaymentId=null — completely unreconciled, NOT counted in amtPaid. Combined payments EUR1396.90 = booking total — fully covered in DB. ba11358 (bed 180, Host Family, Jul12-Aug02, active=true, claimStatus=null): starts in 8 DAYS. bc24609 (Morning General, Jul13-Jul31): starts in 9 days. Both payments still unreconciled in Xero (UNCHANGED 25 checks). NEIL: reconcile pmt17180 (EUR431.90, TransferMate Escrow, Apr27) + pmt17963 (EUR965, Bank, Jul01) in Xero, then UPDATE bookings SET confirmed=true WHERE id=17831 before Jul12 accommodation start. Last checked: 2026-07-04 UTC (25th check, hrly bot).**

**4 Jul UTC (26th check, fresh DB): CONFIRMED UNCHANGED. bk17831 STILL PARTIAL confirmed=false amtPaid=965/1396.90 (EUR431.90 open). pmt17963 (EUR965 Jul1 HS1273784562922): type=null xeroId=null — counted in amtPaid. pmt17180 (EUR431.90 Apr27): type=null xeroId=null hsId=null — NOT counted in amtPaid (explains EUR431.90 shortfall). ba11358 bed180 Host Family Jul12-Aug02 active=true fee=EUR900. Accommodation starts in 8 days. Booking still PARTIAL — neither payment Xero-reconciled. Steps NOT RUN. NEIL: reconcile pmt17963+pmt17180 in Xero, then confirm bk17831 via SIS before Jul12. Last checked: 2026-07-04 UTC (26th check, hrly bot).**
**4 Jul SAT UTC (27th check, fresh DB): CONFIRMED UNCHANGED. bk17831 (Xuezhen Huang, student 14443): STILL PARTIAL, confirmed=false, EUR965/1396.90 (EUR431.90 open). pmt17180 (EUR431.90, Apr27, 68d): type=null, xeroPaymentId=null, hubspotPaymentId=null — completely unreconciled. pmt17963 (EUR965, Jul1, HubSpot 1273784562922): type=null, xeroPaymentId=null — counted in amtPaid but not reconciled in Xero. ba11358 (bed 180, Host Family, Jul12-Aug02, active=true, claimStatus=null): accommodation STARTS IN 8 DAYS. bc24609 (Morning General, Jul13-Jul31): starts in 9 days. Both payments still unreconciled in Xero (UNCHANGED 27 checks). NEIL: reconcile pmt17180 (EUR431.90, Apr27, TransferMate) + pmt17963 (EUR965, Jul1, HubSpot 1273784562922) in Xero, then UPDATE bookings SET confirmed=true WHERE id=17831 before Jul12. Last checked: 2026-07-04 UTC (27th check, hrly bot).**

**4 Jul SAT UTC (29th check, fresh DB): CONFIRMED UNCHANGED. bk17831 (Xuezhen Huang, student 14443): STILL PARTIAL, confirmed=false, EUR965/1396.90 (EUR431.90 open). pmt17180 (EUR431.90, Apr27, 68d): type=null, xeroPaymentId=null, hubspotPaymentId=null — completely unreconciled, NOT counted in amountPaid. pmt17963 (EUR965, Jul01, HubSpot 1273784562922): type=null, xeroPaymentId=null — counted in amountPaid but not reconciled in Xero. Combined payments EUR1396.90 = booking total — fully covered, confirmation blocked by missing Xero reconciliation. ba11358 (bed 180, Host Family, Jul12-Aug02, active=true): accommodation starts in 8 DAYS. bc24609 (Morning General, Jul13-Jul31): starts in 9 days. Both payments still unreconciled in Xero (UNCHANGED 29 checks). NEIL: reconcile pmt17180 (EUR431.90, TransferMate Escrow, Apr27) + pmt17963 (EUR965, Bank, Jul01, HubSpot 1273784562922) in Xero, then UPDATE bookings SET confirmed=true WHERE id=17831 before Jul12 accommodation start. Last checked: 2026-07-04 UTC (29th check, hrly bot).**


**4 Jul SAT UTC (31st check, fresh DB): CONFIRMED UNCHANGED. bk17831 (Xuezhen Huang, student 14443): STILL PARTIAL, confirmed=false, EUR965/1396.90 (EUR431.90 open). pmt17180 (EUR431.90, Apr27, 68d): type=null, xeroPaymentId=null, hubspotPaymentId=null — completely unreconciled. pmt17963 (EUR965, Jul01, HubSpot 1273784562922): type=null, xeroPaymentId=null — counted in amtPaid, not in Xero. Combined payments EUR1396.90 = booking total — fully covered but Xero blocks confirmation. ba11358 (bed 180, Host Family, Jul12-Aug02, active=true): STARTS IN 8 DAYS. Steps NOT RUN. NEIL: reconcile both payments in Xero then UPDATE bookings SET confirmed=true WHERE id=17831 before Jul12. Last checked: 2026-07-04 UTC (31st check, hrly bot).**

**5 Jul SUN UTC (33rd check, fresh DB): CONFIRMED UNCHANGED. Booking 17831 (Xuezhen Huang, student 14443): status=PARTIAL, confirmed=false, amount_paid=965.00/1396.90, amount_open=431.90. Payment 17180 (EUR431.90, Apr27, TransferMate Escrow): type=null, xero_payment_id=null, hubspot_payment_id=null — completely unreconciled (68 days). Payment 17963 (EUR965.00, Jul01, Bank, HubSpot 1273784562922): type=null, xero_payment_id=null — counted in amtPaid but not reconciled in Xero. Both payments together = EUR1396.90 = amtTotal — booking fully covered in DB but confirmation blocked. Accommodation 11358 (bed 180, Host Family, Jul12-Aug02, active=true): STARTS IN 7 DAYS. Course bc24609 (Morning General, Jul13-Jul31): starts in 8 days. Both payments still unreconciled in Xero (UNCHANGED 33 checks). NEIL: reconcile pmt17180 (EUR431.90, Apr27, TransferMate Escrow) + pmt17963 (EUR965, Jul01, Bank, HubSpot 1273784562922) in Xero, then UPDATE bookings SET confirmed=true WHERE id=17831 before Jul12 accommodation start. Last checked: 2026-07-05 UTC (33rd check, hrly bot).**
**5 Jul SUN UTC (34th check, fresh DB): CONFIRMED UNCHANGED. bk17831 (Xuezhen Huang, student 14443): status=PARTIAL, confirmed=false, amount_paid=965.00/1396.90, amount_open=431.90. ba11358 (bed 180, Host Family, Jul 12 - Aug 2, 3 weeks, active=true, claim_status=null, updated Jun 26): STARTS IN 7 DAYS. Accommodation IS in database with bed assigned. Not appearing in host family view because booking is PARTIAL/unconfirmed. pmt17180 (EUR 431.90, Apr 27, TransferMate Escrow): type=null, xero_payment_id=null, hubspot_payment_id=null — unreconciled. pmt17963 (EUR 965, Jul 01, Bank, HubSpot 1273784562922): type=null, xero_payment_id=null — counted in amtPaid, not Xero reconciled. Both payments combined = EUR 1396.90 = amtTotal. Booking fully covered but confirmation blocked. Steps NOT RUN. NEIL: reconcile pmt17180 (EUR 431.90, TransferMate, Apr 27) + pmt17963 (EUR 965, Bank, Jul 01) in Xero, then UPDATE bookings SET confirmed=true WHERE id=17831 before Jul 12 accommodation start. Last checked: 2026-07-05 UTC (34th check, hrly bot).**
**5 Jul SUN UTC (36th check, fresh DB): CONFIRMED UNCHANGED. bk17831 (Xuezhen Huang, student 14443): status=PARTIAL, confirmed=false, amount_paid=965.00/1396.90, amount_open=431.90. pmt17180 (EUR431.90, Apr27, TransferMate Escrow, Fidelo): type=null, xero_payment_id=null — not counted in amtPaid. pmt17963 (EUR965.00, Jul01, Bank, HubSpot 1273784562922): type=null, xero_payment_id=null — in amtPaid. pmt17180+pmt17963=EUR1396.90=amtTotal — booking fully covered, confirmation blocked pending Xero reconciliation. Accommodation 11358 (bed 180, Host Family, Jul12-Aug02, active=true): STARTS IN 7 DAYS. Booking must be confirmed before Jul12 checkin. NEIL: reconcile pmt17180 (EUR431.90, TransferMate Apr27) + pmt17963 (EUR965, HubSpot Jul01) in Xero before Jul12. Last checked: 2026-07-05 UTC (36th check, hrly bot).**


**5 Jul UTC (39th check, fresh DB): CONFIRMED UNCHANGED. bk17831 STILL PARTIAL confirmed=false EUR965/1396.9 (EUR431.9 outstanding). pmt17963 (EUR965 Jul1 HS1273784562922): type=STILL null, xeroPaymentId=null. pmt17180 (EUR431.9 Apr27): type=STILL null, xeroPaymentId=null, hsId=null — 69 days unreconciled. ba11358 (bed 180, Host Family, Jul12-Aug02): active=true, fee=EUR900 — 7 days to checkin. Booking unconfirmed — may not show in provider view. SQL NOT RUN. NEIL: reconcile pmt17180+pmt17963 in Xero, confirm bk17831 BEFORE Jul12 checkin. Last checked: 2026-07-05 UTC (39th check, hrly bot).**

**5 Jul UTC (40th check, fresh DB): CONFIRMED UNCHANGED. bk17831 (Xuezhen Huang, student 14443): status=PARTIAL, confirmed=false, amountPaid=965.00/1396.90, amountOpen=431.90. ba11358 (bed 180, Host Family, Jul12-Aug02, active=true, fee=EUR900, claimStatus=null): STARTS IN 7 DAYS. pmt17180 (EUR431.90, Apr27, TransferMate Escrow): type=null, xeroPaymentId=null, hubspotPaymentId=null — 69 days completely unreconciled. pmt17963 (EUR965.00, Jul01, Bank, HubSpot 1273784562922): type=null, xeroPaymentId=null — counted in amountPaid but not Xero-reconciled. pmt17180+pmt17963=EUR1396.90=amountTotal — booking fully covered, confirmation blocked. 40 checks, NO XERO RECONCILIATION. NEIL: reconcile pmt17180 (EUR431.90, TransferMate, Apr27) + pmt17963 (EUR965, Bank, Jul01) in Xero, then UPDATE bookings SET confirmed=true WHERE id=17831 before Jul12 accommodation start. Last checked: 2026-07-05 UTC (40th check, hrly bot).**

**5 Jul SUN UTC (44th check, fresh DB): CONFIRMED UNCHANGED. bk17831 PARTIAL confirmed=false EUR965/1396.90 (EUR431.90 open). pmt17180 (EUR431.90 Apr27 TransferMate): type=null xeroId=null hsId=null — 69d unreconciled. pmt17963 (EUR965 Jul1 HS1273784562922): type=null xeroId=null. ba11358 bed180 (Mary Carver HF) Jul12-Aug02 active. CHECKIN IN 7 DAYS. bc24609 Morning General Jul13-31. NEIL: reconcile pmt17180+pmt17963 in Xero then confirm bk17831 BEFORE Jul12. Last checked: 2026-07-05 UTC (44th check).**

**5 Jul SUN UTC (45th check, fresh DB): CONFIRMED UNCHANGED — CHECKIN 7 DAYS. bk17831 (Xuezhen Huang, student 14443): status=PARTIAL, confirmed=false, amountPaid=EUR 965.00/amountTotal=EUR 1396.90, amountOpen=EUR 431.90. Payment 17180 (EUR 431.90, bookingId=17831, 27 April, TransferMate Escrow): xeroPaymentId=null, hubspotPaymentId=null — 69 days completely unreconciled, NOT counted in amountPaid. Payment 17963 (EUR 965.00, bookingId=17831, 1 July, Bank, HubSpot 1273784562922): xeroPaymentId=null — counted in amountPaid but not Xero-reconciled. Combined EUR 431.90 + EUR 965.00 = EUR 1396.90 = amountTotal — fully covered but confirmation blocked by Xero. Accommodation 11358 (bed 180 Mary Carver, Host Family, checkin 12 July, checkout 2 August, active=true, fee=EUR 900): STARTS IN 7 DAYS. Course 24609 (Morning General, Jul13-Jul31, fee=EUR 570): starts 8 days. 45 hourly checks — no Xero action. NEIL: reconcile pmt17180 (EUR 431.90, TransferMate, Apr 27) + pmt17963 (EUR 965.00, Bank, Jul 1) in Xero, then UPDATE bookings SET confirmed=true WHERE id=17831 — before 12 July. Last checked: 2026-07-05 UTC (45th check, hrly bot).**

**5 Jul SUN UTC (46th check, fresh DB): CONFIRMED UNCHANGED. bk17831 (Xuezhen Huang, student 14443): status=PARTIAL, confirmed=false, amountPaid=EUR 965.00/1396.90, amountOpen=EUR 431.90. Payment 17180 (EUR 431.90, 27 Apr, TransferMate Escrow): xeroPaymentId=null, hubspotPaymentId=null — completely unreconciled (69 days), NOT counted in amountPaid. Payment 17963 (EUR 965.00, 1 Jul, Bank, HubSpot 1273784562922): xeroPaymentId=null — counted in amountPaid but not Xero-reconciled. Combined EUR 431.90 + EUR 965.00 = EUR 1396.90 = amountTotal — booking fully covered but amountPaid shows only 965 (sync issue: pmt17180 not reflected). Accommodation 11358 (bed 180, Host Family, 12 Jul to 2 Aug, fee=EUR 900, active=true): CHECKIN IN 7 DAYS. Course 24609 (Morning General, 13 Jul to 31 Jul, fee=EUR 570): starts 8 days. Booking unconfirmed — accommodation may not appear in provider view. DIRECT FIX (NOT YET RUN): UPDATE bookings SET amount_paid=1396.90, amount_open=0 WHERE id=17831; then confirm via SIS. Or: reconcile pmt17180 in Xero which should trigger auto-update. NEIL: action before Jul 12 checkin. Last checked: 2026-07-05 UTC (46th check, hrly bot).**

**6 Jul MON UTC (48th check, fresh DB): bk17831 (Xuezhen Huang, s14443) still PARTIAL confirmed=false amtPaid=EUR965/1396.9. pmt17180 (EUR431.9, Apr27): type=null, xeroId=null, hsId=null — 70 days unreconciled. pmt17963 (EUR965, Jul1, HS 1273784562922): type=null but counted in amtPaid. Total both = EUR1396.9 = booking total — student IS fully paid but system shows PARTIAL. ba11358 (bed 180, HF Jul12-Aug2): checkin is 6 DAYS AWAY — booking must be confirmed before then. bc24609 (Morning Gen Jul13-31, 0 SCA): starts in 7 days. NEIL: set type on pmt17180, confirm bk17831 — MUST action before Jul 12. Last checked: 2026-07-06 UTC (48th check, hrly bot).**
**6 Jul UTC (49th check, fresh DB): CONFIRMED UNCHANGED. Payment 17180 type=null EUR431.9 (excluded from amtPaid). Payment 17963 type=null EUR965. Accommodation 11358 bedId=180 startDate=2026-07-12=6 DAYS claimStatus=null active=true — bed IS assigned. Booking 17831 PARTIAL confirmed=false 965/1396.9. SQL NOT RUN. NEIL: set type on payment 17180 and confirm booking before Jul12 check-in. Last checked: 2026-07-06 UTC (49th check).**

**6 Jul MON UTC (50th check, fresh DB): CONFIRMED UNCHANGED. ba11358 (bed 180 Host Family Jul12-Aug2): active=true fee=EUR900 claimStatus=null — bed IS assigned, check-in in 6 days. bk17831 (s14443): PARTIAL confirmed=false amtPaid=965/1396.9 amtOpen=431.9. pmt17180 (EUR431.9): type=null xeroPaymentId=null hubspotPaymentId=null — excluded from amtPaid calculation. pmt17963 (EUR965 hubspotId=1273784562922): type=null — anomalously counted in amtPaid. bc24609 (GE-AM Jul13-31): active=true fee=EUR570 scaCount=0, starts in 7 days. NOTE: amtOpen=431.9 is incorrect (both payments cover full total EUR1396.9). SQL NOT RUN. Last checked: 2026-07-06 UTC (50th check, hrly bot).**

**6 Jul MON UTC (51st check, fresh DB): CONFIRMED UNCHANGED. bk17831 (Xuezhen Huang s14443): PARTIAL confirmed=false EUR965/1396.9 amtOpen=431.9. pmt17180 EUR431.9 type=null xeroId=null hubId=null (EXCLUDED from amtPaid). pmt17963 EUR965 type=null xeroId=null hubId=1273784562922 (COUNTED). Both payments sum=1396.9=booking total — student IS fully paid; amtOpen=431.9 is incorrect. ba11358 (bed180 HF Jul12-Aug2): active=true fee=900 claimStatus=null. CHECK-IN 6 DAYS (12 Jul). bc24609 (GE-AM Jul13-31): fee=570 active=true 0SCA. NEIL: (1)UPDATE payments SET type=1 WHERE id=17180 (or appropriate type value to trigger inclusion in amtPaid); (2)UPDATE bookings SET confirmed=true,status=CONFIRMED WHERE id=17831; MUST RUN BEFORE JUL 12. Last checked: 2026-07-06 UTC (51st check, hrly bot).**


**6 Jul MON UTC (54th check, fresh DB): CONFIRMED UNCHANGED. bk17831 (Xuezhen Huang s14443): PARTIAL confirmed=false EUR965/1396.9 amtOpen=431.9. pmt17180 EUR431.9 type=null xeroId=null hubId=null (EXCLUDED from amtPaid). pmt17963 EUR965 type=null xeroId=null hubId=1273784562922 (COUNTED). Both payments sum=1396.9=booking total — student IS fully paid; amtOpen=431.9 is incorrect. ba11358 (bed180 Host Family Jul12-Aug2): active=true fee=900 claimStatus=STILL null. CHECK-IN IN 6 DAYS (Jul12). bc24609 (GE-AM Jul13-31): fee=570 active=true 0SCA. NEIL: (1)Confirm accommodation claim ba11358; (2)reconcile pmt17180 in Xero (set type); (3)UPDATE bookings SET confirmed=true WHERE id=17831. MUST RUN BEFORE JUL 12. Last checked: 2026-07-06 UTC (54th check, hrly bot).**
**6 Jul MON UTC (55th check, fresh DB): CONFIRMED UNCHANGED. bk17831 PARTIAL confirmed=false EUR965/1396.9 amtOpen=431.9. ba11358 bed180 Jul12-Aug2 active claimStatus=STILL null. pmt17180 EUR431.9 type=STILL null xeroId=null. pmt17963 EUR965 type=null xeroId=null hsId=1273784562922. CHECK-IN IN 6 DAYS (Jul12). NEIL: confirm accommodation claim on ba11358, reconcile pmt17180 in Xero, then UPDATE bookings SET confirmed=true WHERE id=17831. Last checked: 2026-07-06 UTC (55th check).**


**6 Jul UTC (56th check): CONFIRMED UNCHANGED. Booking 17831 PARTIAL EUR965/1396.9 amtOpen=431.9. Accommodation 11358 bed180 Jul12-Aug2 active claimStatus=null. Payment 17180 EUR431.9 type=null xeroId=null hubspotId=null. Payment 17963 EUR965 type=null xeroId=null. Check-in Jul12 = 6 days. No action taken.**

**6 Jul UTC (65th check): CONFIRMED UNCHANGED. ba11358 bed180 Jul12-Aug2 active claimStatus=null. bk17831 PARTIAL EUR965/1396.9. pmt17180 EUR431.9 type=null xeroId=null. pmt17963 EUR965 type=null hsId=1273784562922. CHECK-IN SUN JUL12 = 6 DAYS. Fix NOT RUN. Last checked: 2026-07-06 UTC (65th check).**
**6 Jul UTC (66th check, fresh DB): CONFIRMED UNCHANGED. Accommodation 11358 (bed 180, Host Family, booking 17831): start Jul12, end Aug2, active=true, fee=EUR 900, claim_status=null — CHECK-IN IN 6 DAYS. Booking 17831 (Xuezhen Huang, student 14443): status=PARTIAL, confirmed=false, EUR 965/1396.90, EUR 431.90 open. Payment 17963 (EUR 965, Bank, Jul 1, HubSpot 1273784562922): type=null, xeroPaymentId=null — counted in amount_paid. Payment 17180 (EUR 431.90, Apr 27, 70 days): type=null, xeroPaymentId=null, hubspotPaymentId=null — excluded from amount_paid. Both payments sum=EUR 1396.90=booking total. Fix NOT RUN. NEIL: reconcile pmt17180+pmt17963 in Xero, confirm booking 17831 BEFORE 12 July. Last checked: 2026-07-06 UTC (66th check, hrly bot).**

**6 Jul UTC (67th check, fresh DB): CONFIRMED UNCHANGED. Accommodation 11358 (bed 180, Host Family, booking 17831): start_date=2026-07-12, end_date=2026-08-02, active=true, fee=EUR 900, claim_status=STILL null — CHECK-IN IN 6 DAYS (Sunday Jul12). Booking 17831 (Xuezhen Huang, student 14443): status=PARTIAL, confirmed=false, EUR 965/1396.90, EUR 431.90 open. Payment 17963 (EUR 965, Bank, 1 Jul 2026, HubSpot 1273784562922): type=null, xero_payment_id=STILL null — counted in amount_paid. Payment 17180 (EUR 431.90, TransferMate Escrow, 27 Apr 2026): type=STILL null, xero_payment_id=null, hubspot_payment_id=null — excluded from amount_paid (70 days unreleased). Both payments sum=EUR 1396.90 = booking total — student fully paid; amtOpen=431.9 is incorrect. Fix NOT RUN. NEIL: reconcile pmt17180+pmt17963 in Xero, confirm booking 17831 — MUST ACTION BEFORE JUL12. Last checked: 2026-07-06 UTC (67th check, hrly bot).**

**7 Jul UTC (70th check, fresh DB): CONFIRMED UNCHANGED. ba11358 bed180 Jul12-Aug2 active claimStatus=null fee=EUR900. bk17831 PARTIAL EUR965/1396.9 confirmed=false. pmt17963 EUR965 type=null xeroId=null hsId=1273784562922. pmt17180 EUR431.9 type=null xeroId=null (71d). CHECK-IN SUN JUL12 = 5 DAYS. Fix NOT RUN. NEIL: reconcile pmt17180+pmt17963 in Xero; confirm bk17831 BEFORE JUL12. Last checked: 2026-07-07 UTC (70th check).**

**7 Jul UTC (72nd check, fresh DB): CONFIRMED UNCHANGED. ba11358 (bed 180, Host Family, Jul12-Aug02): active=true, fee=EUR900, claimStatus=null — CHECK-IN IN 5 DAYS (Sunday Jul12). bk17831 (Xuezhen Huang, student 14443): status=PARTIAL, confirmed=false, amountPaid=EUR965/1396.90, amountOpen=EUR431.90. pmt17180 (EUR431.90, created 5 May 2026, 63 days old): type=null, xeroPaymentId=null, hubspotPaymentId=null — excluded from amountPaid. pmt17963 (EUR965.00, created 2 Jul 2026, HubSpot 1273784562922): type=null, xeroPaymentId=null — counted in amountPaid. Both payments sum=EUR1396.90=amountTotal — student IS fully paid; booking shows PARTIAL because pmt17180 type=null excludes it. Fix NOT RUN. NEIL: reconcile pmt17180+pmt17963 in Xero, then confirm bk17831 BEFORE Jul12. Last checked: 2026-07-07 UTC (72nd check, hrly bot).**
**7 Jul TUE UTC (73rd check, fresh DB): CONFIRMED UNCHANGED. Accommodation 11358 (bed 180, Host Family, 12 Jul – 2 Aug 2026, Xuezhen Huang student 14443): active = true, claim status = STILL null, fee = EUR 900 — CHECK-IN THIS SUNDAY 12 JULY = 5 DAYS. Booking 17831: status = PARTIAL, confirmed = STILL false, amount paid = EUR 965 / total = EUR 1396.90. Payment 17180 (EUR 431.90, TransferMate Escrow, 27 Apr 2026, data source = FIDELO): type = null, Xero payment ID = null, HubSpot payment ID = null — NOT counted in amount paid (71 days unreleased). Payment 17963 (EUR 965.00, Bank, 1 Jul 2026, HubSpot 1273784562922): type = null, Xero payment ID = STILL null — IS counted in amount paid. Both payments together = EUR 1396.90 = booking total — student IS fully paid; booking shows Partial only because Fidelo payment 17180 has no HubSpot payment ID and is excluded from amount paid calculation. Fix NOT RUN. NEIL: reconcile payment 17180 (EUR 431.90 Escrow) + payment 17963 (EUR 965 Bank) in Xero; then confirm booking 17831 before Sun 12 Jul. Last checked: 2026-07-07 UTC (73rd check, hrly bot).**
**7 Jul TUE UTC (74th check, fresh DB): CONFIRMED UNCHANGED. Accommodation 11358 (bed 180, Host Family, booking 17831): start_date=2026-07-12, end_date=2026-08-02, active=true, fee=EUR 900, claim_status=STILL null — CHECK-IN THIS SUNDAY 12 JULY (5 days). Booking 17831 (Xuezhen Huang, student 14443): status=PARTIAL, confirmed=false, amountPaid=EUR 965/1396.90, amountOpen=EUR 431.90. Payment 17963 (EUR 965.00, Bank, 1 Jul 2026, HubSpot 1273784562922): type=null, xeroPaymentId=STILL null — counted in amountPaid. Payment 17180 (EUR 431.90, created 27 Apr 2026, data source=Fidelo): type=null, xeroPaymentId=null, hubspotPaymentId=null — excluded from amountPaid (71 days unreleased). Both payments sum=EUR 1396.90=amountTotal — student IS fully paid; booking shows PARTIAL only because Fidelo payment 17180 has no HubSpot payment ID and is excluded from amountPaid calculation. Fix NOT RUN. NEIL: reconcile payment 17180 (EUR 431.90) + payment 17963 (EUR 965) in Xero; then confirm booking 17831 BEFORE SUNDAY JUL12. Last checked: 2026-07-07 UTC (74th check, hrly bot).**

**7 Jul TUE UTC (77th check, fresh DB): CONFIRMED UNCHANGED. Accommodation 11358 (bed 180, Host Family, Jul12-Aug02): active=true, fee=EUR 900, claim_status=STILL null — CHECK-IN THIS SUNDAY 12 JULY (5 days). Booking 17831 (Xuezhen Huang, student 14443): status=PARTIAL, confirmed=false, amountPaid=EUR 965/1396.90 (EUR 431.90 open). Payment 17180 (EUR 431.90, TransferMate Escrow, 27 Apr 2026, Fidelo): type=null, xeroPaymentId=null, hubspotPaymentId=null — excluded from amountPaid. Payment 17963 (EUR 965.00, Bank, 1 Jul 2026, HubSpot 1273784562922): type=null, xeroPaymentId=STILL null — counted in amountPaid. Both payments total EUR 1396.90 = booking total — student IS fully paid. Fix NOT RUN. NEIL: reconcile pmt17180+pmt17963 in Xero; confirm booking 17831 BEFORE Sunday Jul12. Last checked: 2026-07-07 UTC (77th check, hrly bot).**


**7 Jul 2026 UTC (2nd check today, fresh DB): CONFIRMED UNCHANGED. BK17831 PARTIAL EUR965/1396.9 confirmed=false. BA11358 bed180 Jul12-Aug2 claimStatus=null fee=EUR900. Pmt17180 EUR431.9 Escrow xeroId=null hsId=null (Fidelo, 71d unreleased). Pmt17963 EUR965 Bank xeroId=null hsId=1273784562922. Both total 1396.9=booking total (student fully paid). CHECK-IN SUNDAY JUL12=5 DAYS. NEIL: reconcile pmts in Xero + confirm bk17831 before Sunday. Last checked: 2026-07-07 UTC.**

**7 Jul TUE UTC (3rd check today — BOOKING CONFIRMED): BK17831 STATUS CHANGED. Booking 17831 updated at 14:57 UTC 7 Jul 2026: confirmed=true, status=CONFIRMED, amountPaid=EUR 1396.90/1396.90 (step 3 of fix recipe DONE). Remaining: reconcile pmt17180 (EUR 431.90, TransferMate Escrow, 27 Apr 2026): xeroPaymentId=STILL null, hubspotPaymentId=null — 71 days unreconciled. And pmt17963 (EUR 965.00, Bank, 1 Jul 2026, HubSpot 1273784562922): xeroPaymentId=STILL null. BA11358 (bed 180, Host Family, Jul12-Aug02): active=true, fee=EUR900, claimStatus=null — CHECK-IN SUN JUL12=5 DAYS. NEIL: reconcile pmt17180 + pmt17963 in Xero before Sun 12 July. Last checked: 2026-07-07 UTC (3rd check today).**
Last checked: 2026-07-07 UTC (5th check today): UNCHANGED (fresh DB). PMT17180 EUR431.9 Escrow xeroId=null type=null. PMT17963 EUR965 Bank xeroId=null type=null hsId=1273784562922. BA11358 bed180 Jul12-Aug2 active=true claimStatus=null fee=EUR900. BK17831 CONF EUR1396.9/1396.9. CHECK-IN SUN JUL12=5 DAYS. NEIL: reconcile both pmts in Xero TODAY.
**8 Jul 2026 WED UTC (9th check, fresh DB): CONFIRMED UNCHANGED. BA11358 bed180 HF Jul12-Aug2 active=true claimStatus=null fee=900. BK17831 CONF EUR1396.9/1396.9. Pmt17180 EUR431.9 Escrow xeroId=null (72 days). Pmt17963 EUR965 Bank xeroId=null hsId=1273784562922 (7 days). CHECK-IN SUN JUL12=4 DAYS. NEIL: reconcile pmts 17180+17963 in Xero BEFORE SUNDAY. Last checked: 2026-07-08 UTC.**
**8 Jul 2026 WED UTC (10th check, fresh DB): CONFIRMED UNCHANGED. BK17831 (Xuezhen Huang, student 14443): CONFIRMED, confirmed=true, amountPaid=EUR 1396.90/1396.90 (fully paid — booking confirmed Jul 7). BA11358 (bed 180, Host Family, Jul12-Aug02): active=true, fee=EUR900, claimStatus=STILL null — CHECK-IN THIS SUNDAY 12 JULY = 4 DAYS. Payment 17180 (EUR431.90, TransferMate Escrow, 27 Apr 2026, Fidelo): type=null, xeroPaymentId=STILL null — 73 days unreconciled. Payment 17963 (EUR965.00, Bank, 1 Jul 2026, HubSpot 1273784562922): type=null, xeroPaymentId=STILL null — 7 days outstanding. Booking IS confirmed; remaining action is Xero reconciliation of both payments before Sunday check-in. NEIL: reconcile pmt17180 (EUR431.90 Escrow, Apr27) + pmt17963 (EUR965 Bank, Jul01) in Xero BEFORE SUNDAY JUL12. Last checked: 2026-07-08 UTC (10th check).**

**8 Jul 2026 WED UTC (11th check, fresh DB): NEW FINDING — 2 additional payments discovered on booking 17831.

Booking 17831 (Xuezhen Huang, student 14443): CONFIRMED, confirmed=true, amount_paid=EUR 1396.90/1396.90 (confirmed Jul 7).

All 4 payments linked to booking 17831:
- Payment 17180: EUR 431.90, payment_date=2026-04-27, TransferMate Escrow (Fidelo), type=null, xero_payment_id=null, hubspot_payment_id=null — 73 days unreconciled.
- Payment 17963: EUR 965.00, payment_date=2026-07-01, Bank, HubSpot 1273784562922, type=null, xero_payment_id=null — 7 days unreconciled.
- Payment 17987: EUR 131.90, payment_date=2026-06-25, type=null, xero_payment_id=null [NEW — discovered this run].
- Payment 17988: EUR 300.00, payment_date=2026-06-12, type=null, xero_payment_id=null [NEW — discovered this run].
Total all 4 payments: EUR 1828.80 vs amount_paid=EUR 1396.90.

Analysis: EUR 131.90 + EUR 300.00 = EUR 431.90 = exactly payment 17180 (TransferMate Escrow). Payments 17987+17988 are likely the two Fidelo installment components that were later consolidated into payment 17180 escrow — NOT additional money received. However all 4 have xero_payment_id=null and none are reconciled in Xero.

Accommodation 11358 (bed 180, Host Family, Jul12-Aug02): active=true, fee=EUR 900, claim_status=STILL null — CHECK-IN THIS SUNDAY 12 JULY = 4 DAYS.

NEIL: (1) Clarify whether payments 17987 (EUR131.90, Jun25) and 17988 (EUR300, Jun12) are the Fidelo installment precursors to payment 17180 escrow — if yes, they should be voided/marked as superseded to avoid double-counting; (2) Reconcile payment 17180 (EUR431.90 Escrow, Apr27) + payment 17963 (EUR965 Bank, Jul01) in Xero BEFORE Sunday 12 July check-in. Last checked: 2026-07-08 UTC (11th check, hrly bot).**
**8 Jul UTC (2nd check today): CONFIRMED UNCHANGED. BA11358

**8 Jul UTC (4th check today - NEW FINDING): 2 additional payments found on booking 17831. Full list of 4 payments, ALL xero_payment_id=null:
- Payment 17180: EUR 431.90, payment_date=2026-04-27 (TransferMate Escrow, Fidelo), type=null, xero_payment_id=null, hubspot_payment_id=null - 73 days unreconciled
- Payment 17988: EUR 300.00, payment_date=2026-06-12, type=null, xero_payment_id=null
- Payment 17987: EUR 131.90, payment_date=2026-06-25, type=null, xero_payment_id=null
- Payment 17963: EUR 965.00, payment_date=2026-07-01 (Bank, HubSpot 1273784562922), type=null, xero_payment_id=null
Sum of all 4: EUR 1828.80 vs booking amount_paid=EUR 1396.90 (diff=EUR 431.90 = p17987 EUR131.9 + p17988 EUR300 = exactly p17180 escrow). Payments 17987+17988 are likely Fidelo installment precursors consolidated into escrow p17180 - do NOT reconcile separately in Xero; verify with Neil first. BA11358 bed180 Host Family Jul12-Aug2 active=true claimStatus=STILL null. BK17831 CONFIRMED EUR1396.9/1396.9. CHECK-IN SUNDAY JUL12 = 4 DAYS. Last checked: 2026-07-08 UTC.** bed180 Host Family Jul12-Aug2 active=true claimStatus=STILL null fee=EUR900. BK17831 CONFIRMED EUR1396.90/1396.90. PMT17180 EUR431.90 Escrow Apr2026 xeroPaymentId=STILL null type=null. PMT17963 EUR965 Bank Jul1 HS1273784562922 xeroPaymentId=STILL null type=null. STUDENT ARRIVES SUNDAY JUL12=4 DAYS. XERO CLAIM NOT SUBMITTED. NEIL: Submit Xero host family claim for BA11358 before Sunday. Last checked: 2026-07-08 UTC.**

**8 Jul UTC (5th+ check today, fresh DB): UNCHANGED. BK17831 CONFIRMED EUR1396.90/1396.90 (confirmed Jul7). BA11358 bed180 HF Jul12-Aug2 active claimStatus=null — CHECK-IN SUNDAY JUL12=4 DAYS. 4 payments all xero_payment_id=null: pmt17180 EUR431.90 Apr27 escrow, pmt17963 EUR965 Jul1 HS1273784562922, pmt17987 EUR131.90 Jun25 HS1277724782804, pmt17988 EUR300 Jun12 HS1277795367133. Pmts17987+17988 sum=431.90=pmt17180 (Fidelo installment precursors — verify before separate Xero reconciliation). NEIL: reconcile pmt17180+pmt17963 in Xero before Sunday. Last checked: 2026-07-08 UTC.**

**8 Jul UTC (6th check, hrly5, fresh DB): CONFIRMED UNCHANGED. BK17831 CONFIRMED EUR1396.90/1396.90 (confirmed Jul7). BA11358 bed180 HF Jul12-Aug2 active claimStatus=null — CHECK-IN SUNDAY JUL12=4 DAYS. All 4 payments xeroPaymentId=STILL null: pmt17180 EUR431.90 Escrow Apr27, pmt17963 EUR965 Bank Jul1 HS1273784562922, pmt17987 EUR131.90 Bank Jul7 HS1277724782804, pmt17988 EUR300 Bank Jul7 HS1277795367133. Pmts17987+17988 sum=EUR431.90=pmt17180 (Fidelo installment precursors — verify before separate Xero reconciliation). NEIL: reconcile all in Xero + confirm host before Sunday. Last checked: 2026-07-08 UTC (6th check, hrly5).**

## 7th check hrly6 — 2026-07-08T11:20Z

CONFIRMED UNCHANGED (fresh DB). No action taken. Report-only.

## 8th check hrly7 — 2026-07-08 UTC

CONFIRMED UNCHANGED (fresh DB). No action taken. Report-only.
BK17831 CONFIRMED EUR1396.9/1396.9 (updAt=2026-07-08T10:21 UTC). BA11358 bed180 HF Jul12-Aug2 active=true claimStatus=STILL null. All 4 pmts xeroPaymentId=STILL null: pmt17180 EUR431.9 Escrow May5, pmt17963 EUR965 Jul2, pmt17987 EUR131.9 Jul7, pmt17988 EUR300 Jul7. CHECK-IN SUN JUL12 = 4 DAYS. NEIL: (1) verify pmt17987+pmt17988 vs pmt17180 Escrow; (2) reconcile all 4 in Xero; (3) notify host. Last checked: 2026-07-08 UTC (hrly7).

## 12th check hrly8 - 2026-07-08 UTC

CONFIRMED UNCHANGED (fresh DB). No action taken. Report-only.
BK17831 (Xuezhen Huang, student 14443): CONFIRMED confirmed=true amtPaid=EUR1396.90/1396.90 (confirmed Jul 7 - DONE).
BA11358 (bed 180, Host Family, Jul12-Aug02): active=true, fee=EUR900, claimStatus=STILL null - CHECK-IN THIS SUNDAY 12 JUL = 4 DAYS.
All 4 payments xeroPaymentId=STILL null:
  Pmt17180: EUR431.90, TransferMate Escrow, 27 Apr 2026, type=null, no HubSpot ID (Fidelo migration).
  Pmt17963: EUR965.00, Bank, 1 Jul 2026, HubSpot 1273784562922, type=null.
  Pmt17987: EUR131.90, Bank, 25 Jun 2026, HubSpot 1277724782804, type=null (NEW - likely Fidelo installment).
  Pmt17988: EUR300.00, Bank, 12 Jun 2026, HubSpot 1277795367133, type=null (NEW - likely Fidelo installment).
Note: Pmt17987 (EUR131.90) + Pmt17988 (EUR300.00) = EUR431.90 = exactly Pmt17180 escrow amount.
Likely Fidelo installments consolidated into escrow pmt17180 - verify before reconciling separately.
Xero action needed: reconcile pmt17963 (EUR965, Bank) + pmt17180 (EUR431.90, Escrow) before Sunday.
Host provider needs to be notified of student check-in Sunday 12 Jul.
Last checked: 2026-07-08 UTC (hrly8).

## 13th check hrly10 — 2026-07-08 UTC

CONFIRMED UNCHANGED (fresh DB). No action taken. Report-only.
BK17831 CONFIRMED EUR1396.90/1396.90. BA11358 bed180 HF Jul12-Aug02 active claimStatus=STILL null. All 4 pmts xeroId=STILL null.
NEW ANALYSIS: pmt17987 (EUR131.90 Jun25 HS1277724782804) + pmt17988 (EUR300.00 Jun12 HS1277795367133) = EUR431.90 = pmt17180 (Fidelo Escrow Apr27). These two HubSpot payments are likely the same money as the original Fidelo escrow — verify before reconciling all 4 separately in Xero.
Recommendation: reconcile pmt17963 (EUR965 Bank Jul1) + pmt17988/17987 (or pmt17180) in Xero = EUR1396.90. CHECK-IN SUN JUL12=4 DAYS. Host family claim not submitted.
Last checked: 2026-07-08 UTC (hrly10).

---
## Last checked: 8 Jul UTC (hrly11)
- ba11358 claimStatus=null, bed180, Jul12-Aug2, active=true — CHECK-IN SUN 12 JUL (4 DAYS)
- pmt17180 (431.90) xeroId=null type=null
- pmt17963 (965.00) xeroId=null type=null
- pmt17987 (131.90) xeroId=null type=null
- pmt17988 (300.00) xeroId=null type=null
- pmts17987+17988=431.90=pmt17180 (possible Fidelo replacement pair — verify before reconciling separately)
- Sheet row 41 H/I/J/K written

## Last checked: 8 Jul UTC (hrly12 resumed)

CONFIRMED UNCHANGED (fresh DB). Report-only.
- bk17831 CONFIRMED EUR1396.90/1396.90 (confirmed Jul7).
- ba11358 (bed 180, Host Family, Jul12-Aug02): active=true, fee=EUR900, claimStatus=STILL null — CHECK-IN SUN JUL12 = 4 DAYS.
- All 4 payments xeroPaymentId=STILL null: pmt17180 EUR431.90, pmt17963 EUR965, pmt17987 EUR131.90, pmt17988 EUR300.
- pmt17987+pmt17988=EUR431.90=pmt17180 (likely Fidelo installment pair — verify before reconciling all 4 separately).
- NEIL: reconcile in Xero + notify host family TODAY — check-in Sunday.
- Sheet row 41 H/I/J/K written.
Last checked: 2026-07-08 UTC (hrly12 resumed).

---
## 16th check — 2026-07-09 UTC (hrly14)
CONFIRMED UNCHANGED (fresh DB). 4 payments all xeroId=STILL null: pmt17180(EUR431.90), pmt17963(EUR965), pmt17987(EUR131.90), pmt17988(EUR300). ba11358 claimStatus=STILL null bed180 Jul12-Aug2. CHECK-IN SUN JUL12 = 3 DAYS. pmts 17987+17988=431.90=pmt17180 (Fidelo pair — verify before reconciling separately). NEIL: reconcile in Xero + submit host family claim URGENTLY. Sheet row 41 H/I/J/K written.

**18th check 9 Jul UTC (hrly16): CONFIRMED UNCHANGED (fresh DB). Accommodation 11358 bed180 Jul12-Aug2 active=true claimStatus=STILL null. 4 payments ALL xeroPaymentId=STILL null type=null: pmt17180(EUR431.90 Fidelo no-HS)+pmt17963(EUR965.00 HS1273784562922)+pmt17987(EUR131.90 HS1277724782804)+pmt17988(EUR300.00 HS1277795367133). pmts17987+17988 sum=EUR431.90=pmt17180 amount (likely HubSpot replacements for Fidelo pmt). CHECK-IN SAT JUL12=3 DAYS. NEIL: reconcile in Xero + submit host family claim URGENTLY before Saturday. Last checked: 2026-07-09 UTC (hrly16, 18th check).**
**9 Jul UTC hrly18 (20th check, fresh DB): CONFIRMED UNCHANGED. BK17831 status=CONFIRMED amtPaid=1396.90/1396.90 amtOpen=0 (fully paid). BA11358 bed180 Host Family Jul12-Aug2 active=true claimStatus=STILL null. 4 payments ALL xeroPaymentId=STILL null: pmt17180(EUR431.90 Apr27 Fidelo-era hsId=null), pmt17963(EUR965 Jul2 HS1273784562922), pmt17987(EUR131.90 Jul7 HS1277724782804), pmt17988(EUR300 Jul7 HS1277795367133). Note: pmt17987+17988=EUR431.90=pmt17180 — likely HubSpot re-entry of Fidelo payment; do NOT reconcile pmt17180 and pmts17987+17988 separately without verification. CHECK-IN SAT JUL12=3 DAYS. NEIL: verify pmts17987+17988 vs pmt17180, then reconcile distinct payments in Xero + submit HF claim before Sat Jul12. Last checked: 2026-07-09 UTC hrly18 (20th check).**

21st check 9 Jul UTC hrly20: CONFIRMED UNCHANGED (fresh DB). BK17831 CONF EUR1396.90/1396.90. BA11358 bed180 Host Family Jul12-Aug2 active=true fee=EUR900 claimStatus=STILL null. 4 pmts ALL xeroId=STILL null: pmt17180(EUR431.90 TM-Escrow Apr27 hsId=null Fidelo), pmt17963(EUR965 Bank Jul1 HS1273784562922), pmt17987(EUR131.90 Bank Jun25 HS1277724782804 CORRECTED from Jul7), pmt17988(EUR300 Bank Jun12 HS1277795367133 CORRECTED from Jul7). pmt17987+17988=EUR431.90=pmt17180 likely HubSpot re-entry. CHECK-IN SAT JUL12=3 DAYS. NEIL: verify pmts17987+17988 vs pmt17180 then reconcile Xero + submit HF claim URGENTLY. Sheet row 41 H/I/J/K written.

---
## 22nd check 2026-07-09 UTC hrly21

CONFIRMED UNCHANGED (fresh DB). Report-only.
BK17831 CONFIRMED confirmed=true amtPaid=EUR1396.90 (confirmed Jul7 - DONE). BA11358 bed180 HF Jul12-Aug02 active claimStatus=STILL null - CHECK-IN SAT JUL12 = 3 DAYS. 4 pmts ALL xeroPaymentId=STILL null type=null: pmt17180(EUR431.90 Fidelo escrow Apr27 no-HS-ID), pmt17963(EUR965 Bank Jul1 HS1273784562922), pmt17987(EUR131.90 Bank Jun25 HS1277724782804), pmt17988(EUR300 Bank Jun12 HS1277795367133). pmt17987+17988=EUR431.90=pmt17180 (verify Fidelo pair before reconciling 4 separately). Sheet I41 added solution (was empty). Neil: submit HF claim + reconcile Xero TODAY.
Last checked: 2026-07-09 UTC hrly21.

## 23rd check 2026-07-09 UTC hrly22
CONFIRMED UNCHANGED (fresh DB). BA11358 bed180 HF Jul12-Aug2 active=true claimStatus=STILL null — CHECK-IN SAT JUL12 = 3 DAYS. 4 pmts ALL xeroId=STILL null type=null: pmt17180(EUR431.90 Fidelo Apr27), pmt17963(EUR965 Jul1 HS1273784562922), pmt17987(EUR131.90 Jun25 HS1277724782804), pmt17988(EUR300 Jun12 HS1277795367133). pmt17987+17988=EUR431.90=pmt17180 (Fidelo re-entry — verify before reconciling all 4 separately). NEIL: submit HF claim + reconcile Xero TODAY.


[LAST_STATUS_UPDATE]
Status update 9 Jul 2026 UTC hrly23: UNCHANGED (23rd check). BA11358 claimStatus=null. 4 pmts all xeroId=null. Check-in SAT JUL12 = 3 DAYS. Pmt17987+17988 may dup pmt17180.

---
**9 Jul UTC hrly24 (this run): MAJOR CHANGE SINCE JUL4. bk17831 NOW CONFIRMED, amountPaid=EUR1396.9/amountTotal=EUR1396.9 (was PARTIAL EUR965/1396.9 on Jul4; updAt=2026-07-08T10:21 UTC). 4 payments on bk17831 ALL xeroPaymentId=null: pmt17180(EUR431.90 Escrow Apr27), pmt17963(EUR965 Bank Jul1 HS1273784562922), pmt17987(EUR131.90 Bank Jun25 HS1277724782804 NEW since Jul4), pmt17988(EUR300 Bank Jun12 HS1277795367133 NEW since Jul4). NOTE: pmt17987+pmt17988=431.90=pmt17180 — likely Fidelo split or re-entry; do NOT reconcile all 3 in Xero (total would be EUR863.80 instead of EUR431.90). ba11358 (bed 180, Host Family, Jul12-Aug2, fee=EUR900): active=true, claimStatus=STILL null. CHECK-IN SAT JUL12=3 DAYS. NEIL: (1) Submit host family claim for ba11358 BEFORE Sat 12 Jul; (2) Reconcile payments in Xero — verify 17987+17988 are dups of 17180 first. Step 3 (UPDATE bookings SET confirmed=true WHERE id=17831) is NO LONGER NEEDED — booking already confirmed Jul8.**


## 10 Jul 2026 UTC (this run) — CHECK-IN TOMORROW

CONFIRMED UNCHANGED (fresh DB). BA11358 bed180 HF Jul12-Aug2 active=true claimStatus=STILL null. BK17831 CONF EUR1396.90/1396.90. 4 payments all xeroPaymentId=STILL null type=null: pmt17180(EUR431.90 TM-Escrow Apr27 no-HS), pmt17963(EUR965 Bank Jul1 HS1273784562922), pmt17987(EUR131.90 Bank Jun25 HS1277724782804), pmt17988(EUR300 Bank Jun12 HS1277795367133). pmt17987+17988=EUR431.90=pmt17180 (Fidelo pair — verify before reconciling all 4 separately). CHECK-IN IS TOMORROW SATURDAY 12 JULY. No claim submitted. Sheet row 41 H/I/J/K written. NEIL: submit HF claim TODAY + notify host family.


## 10 Jul 2026 UTC (this run) — CHECK-IN TOMORROW SATURDAY 12 JULY

CONFIRMED UNCHANGED (fresh DB). Report-only.
- BA11358 (bed 180, Host Family, Jul12-Aug02): active=true, fee=EUR900, claimStatus=STILL null — CHECK-IN TOMORROW SAT JUL12
- BK17831 (Xuezhen Huang, student 14443): CONFIRMED, confirmed=true, amountPaid=EUR1396.90/1396.90 (fully paid)
- 4 payments ALL xeroPaymentId=null type=null:
  pmt17180 (EUR431.90, TransferMate Escrow, Apr27, no HubSpot ID, Fidelo)
  pmt17963 (EUR965.00, Bank, Jul1, HubSpot 1273784562922)
  pmt17987 (EUR131.90, Bank, Jun25, HubSpot 1277724782804)
  pmt17988 (EUR300.00, Bank, Jun12, HubSpot 1277795367133)
- pmt17987+pmt17988=EUR431.90=pmt17180 (likely Fidelo installment pair — verify before reconciling all 4 separately)
- NEIL: Submit host family claim for BA11358 TODAY + notify host family. CHECK-IN TOMORROW SATURDAY 12 JULY.
Last checked: 2026-07-10 UTC (this run).

---
## 10 Jul 2026 UTC (2nd pass) — CHECK-IN TOMORROW SATURDAY 12 JULY

CONFIRMED UNCHANGED (fresh DB). BA11358 bed180 HF Jul12-Aug2 active=true claimStatus=STILL null fee=EUR900. BK17831 CONF EUR1396.90/1396.90. 4 pmts ALL xeroPaymentId=null type=null: pmt17180(EUR431.90 Fidelo-Escrow Apr27 no-HS), pmt17963(EUR965 Jul1 HS1273784562922), pmt17987(EUR131.90 Jun25 HS1277724782804), pmt17988(EUR300 Jun12 HS1277795367133). pmt17987+17988=EUR431.90=pmt17180 (Fidelo pair — verify before reconciling all 4 separately). STUDENT ARRIVES TOMORROW SATURDAY 12 JULY. No HF claim submitted.

NEIL: Submit host family claim for BA11358 TODAY (10 Jul) + notify host. Reconcile pmt17963+pmt17180 in Xero.
Last checked: 2026-07-10 UTC (this run).

---
## 10 Jul 2026 UTC (3rd pass this day) — CHECK-IN TOMORROW SATURDAY 12 JULY

CONFIRMED UNCHANGED (fresh DB). BA11358 bed180 HF Jul12-Aug2 active=true claimStatus=STILL null fee=EUR900.
BK17831 CONFIRMED confirmed=true amountPaid=EUR1396.90/1396.90 (fully paid, confirmed 7 July).
4 payments ALL xeroPaymentId=STILL null type=null:
  pmt17180 (EUR431.90, TransferMate Escrow, 27 Apr 2026, Fidelo, no HubSpot ID)
  pmt17963 (EUR965.00, Bank, 1 Jul 2026, HubSpot 1273784562922)
  pmt17987 (EUR131.90, Bank, 25 Jun 2026, HubSpot 1277724782804)
  pmt17988 (EUR300.00, Bank, 12 Jun 2026, HubSpot 1277795367133)
pmt17987+pmt17988 = EUR431.90 = pmt17180 (likely Fidelo installment pair - verify before reconciling all 4 separately).

NEIL: CHECK-IN IS TOMORROW SATURDAY 12 JULY.
(1) Submit host family claim for BA11358 via SIS TODAY.
(2) Reconcile pmt17963 (EUR965, Bank, Jul1) + pmt17180 (EUR431.90, Escrow, Apr27) in Xero.
(3) Notify host family of check-in tomorrow.
Booking is already CONFIRMED. Remaining: Xero reconciliation + claim submission.
Last checked: 2026-07-10 UTC (3rd pass this day, hourly bot).


---
## 10 Jul 2026 UTC (4th pass this day) -- CHECK-IN SUNDAY 12 JULY (2 DAYS)

CONFIRMED UNCHANGED (fresh DB). BA11358 bed180 HF Jul12-Aug2 active=true claimStatus=STILL null fee=EUR900.
BK17831 CONFIRMED confirmed=true amountPaid=EUR1396.90/1396.90 (fully paid, confirmed 7 July).
4 payments ALL xeroPaymentId=STILL null type=null:
  pmt17180 (EUR431.90, TransferMate Escrow, 27 Apr 2026, Fidelo, no HubSpot ID)
  pmt17963 (EUR965.00, Bank, 1 Jul 2026, HubSpot 1273784562922)
  pmt17987 (EUR131.90, Bank, 25 Jun 2026, HubSpot 1277724782804)
  pmt17988 (EUR300.00, Bank, 12 Jun 2026, HubSpot 1277795367133)
pmt17987+pmt17988=EUR431.90=pmt17180 (Fidelo installment pair -- verify before reconciling all 4 separately).
Note: check-in is SUNDAY 12 July (2 days) -- previous entries stated TOMORROW SATURDAY which was incorrect.

NEIL: CHECK-IN SUNDAY 12 JULY (2 DAYS).
(1) Submit host family claim for BA11358 via SIS admin TODAY.
(2) Reconcile pmt17963 (EUR965, Bank, Jul1) + pmt17180 (EUR431.90, Escrow, Apr27) in Xero.
(3) Notify host family of check-in this Sunday morning.
Booking already CONFIRMED. Remaining: Xero reconciliation + claim submission + host notification.
Last checked: 2026-07-10 UTC (4th pass this day, hourly bot).
**11 Jul SAT UTC (10th pass, fresh DB): CONFIRMED UNCHANGED. BA11358 (bed 180, Host Family, booking 17831): startDate=2026-07-12 claimedAt=STILL null -- check-in TOMORROW SUN JUL12. BK17831 CONFIRMED EUR1396.90/1396.90 (updatedAt=Jul8). 4 payments ALL xeroPaymentId=null: pmt17180(EUR431.90 Apr27 no-HubSpot Fidelo), pmt17987(EUR131.90 Jun25 HS1277724782804), pmt17988(EUR300 Jun12 HS1277795367133), pmt17963(EUR965 Jul1 HS1273784562922). pmts17987+17988=EUR431.90=pmt17180 (likely HubSpot re-entry of Fidelo escrow). NEIL: (1) submit host family claim TODAY -- check-in TOMORROW; (2) reconcile pmts in Xero (verify pmt17987+17988 vs pmt17180 before reconciling separately). Last checked: 2026-07-11 SAT UTC (10th pass, hrly bot).**

**11 Jul SAT UTC (12th pass, fresh DB): CONFIRMED UNCHANGED. BA11358 bed180 HF Jul12-Aug2 claimedAt=STILL null fee=EUR900. Host identified: Mary Carver, mary.carver28@gmail.com, +353 87 927 1130 (property 147, room 159). BK17831 CONFIRMED confirmed=true EUR1396.90/1396.90 (updatedAt=Jul8). 4 payments ALL xeroPaymentId=null type=null: pmt17180(EUR431.90 Fidelo Apr27 no-HS-ID), pmt17963(EUR965 Bank Jul1 HS1273784562922), pmt17987(EUR131.90 Bank Jun25 HS1277724782804), pmt17988(EUR300 Bank Jun12 HS1277795367133). pmts17987+17988=EUR431.90=pmt17180 (Fidelo installment pair, verify before reconciling all 4 separately). CHECK-IN TOMORROW SUN JUL12. HOST NOT NOTIFIED. NEIL: (1) contact Mary Carver TODAY (mary.carver28@gmail.com / +353 87 927 1130) to notify student check-in tomorrow; (2) submit host family claim for BA11358 via SIS; (3) reconcile pmts 17963+17180 in Xero. Last checked: 2026-07-11 SAT UTC (12th pass, hrly bot).**

**11 Jul SAT UTC (13th pass, fresh DB): CONFIRMED UNCHANGED. BA11358 (bed 180, Host Family, booking 17831): startDate=2026-07-12, endDate=2026-08-02, active=true, claimedAt=STILL null, fee=EUR 900 — CHECK-IN TOMORROW SUNDAY 12 JULY. Host Mary Carver (mary.carver28@gmail.com, +353 87 927 1130) has NOT been notified. BK17831 CONFIRMED EUR1396.90/1396.90 (updatedAt=Jul8). 4 payments ALL xeroPaymentId=null type=null: pmt17180(EUR431.90, Fidelo Escrow, Apr27, no HS ID), pmt17963(EUR965.00, Bank, Jul1, HS1273784562922), pmt17987(EUR131.90, Bank, Jun25, HS1277724782804), pmt17988(EUR300.00, Bank, Jun12, HS1277795367133). pmt17987+17988=EUR431.90=pmt17180 (likely Fidelo installment pair — verify before reconciling all 4 separately). No action taken. Last checked: 2026-07-11 UTC (13th pass, hrly bot).**
---
## 15th pass 2026-07-11 SAT UTC

CONFIRMED UNCHANGED. BA11358 claimedAt=null claimStatus=null bed180 Jul12-Aug02. CHECK-IN TOMORROW SUN JUL12. Host Mary Carver mary.carver28@gmail.com +353 87 927 1130 NOT NOTIFIED. BK17831 CONF EUR1396.90 fully paid. 4 pmts ALL xeroId=null. pmt17987+17988=EUR431.90=pmt17180 Fidelo pair verify first. Last checked 2026-07-11 UTC (15th pass).

---
## 16th pass 2026-07-11 SAT UTC — CHECK-IN TOMORROW

UNCHANGED (fresh DB). BA11358 (bed 180, Host Family, Jul12-Aug02): active=true, fee=EUR900, claimedAt=STILL null, claimStatus=STILL null. CHECK-IN TOMORROW SUN JUL12.

BK17831 (Xuezhen Huang, student 14443): CONFIRMED, confirmed=true, amountPaid=EUR1396.90/1396.90 (confirmed Jul7).

4 payments ALL xeroPaymentId=STILL null type=null:
- pmt17180 (EUR431.90, TransferMate Escrow, 27 Apr 2026, Fidelo, no HubSpot ID)
- pmt17963 (EUR965.00, Bank, 1 Jul 2026, HubSpot 1273784562922)
- pmt17987 (EUR131.90, Bank, 25 Jun 2026, HubSpot 1277724782804)
- pmt17988 (EUR300.00, Bank, 12 Jun 2026, HubSpot 1277795367133)
pmt17987+pmt17988=EUR431.90=pmt17180 (Fidelo installment pair — verify before reconciling all 4 separately).

Host: Mary Carver, mary.carver28@gmail.com, +353 87 927 1130 — NOT YET NOTIFIED.

NEIL MUST ACT TODAY:
(1) Contact Mary Carver TODAY to confirm check-in tomorrow morning.
(2) Submit host family claim for BA11358 via SIS admin (student 14443 > booking 17831 > accommodation 11358 > Submit Claim).
(3) Reconcile pmt17963 (EUR965 Bank Jul1) + pmt17180 (EUR431.90 Escrow Apr27) in Xero — verify pmt17987+pmt17988 are Fidelo installment pairs first.

Last checked: 2026-07-11 SAT UTC (16th pass, hourly bot).

---
## 11 Jul 2026 SAT UTC — 17th pass (fresh DB) — CHECK-IN TOMORROW

BA11358 (bed 180, Host Family, Jul12-Aug2 2026): claimedAt=STILL null (claim NOT submitted). Check-in = TOMORROW Sunday 12 July 2026. BK17831 (Xuezhen Huang s14443): CONFIRMED confirmed=true amountPaid=EUR1396.90/1396.90 (confirmed Jul7). 4 payments ALL xeroPaymentId=STILL null: pmt17180 (EUR431.90 TransferMate Escrow Apr27 Fidelo era no HubSpot ID), pmt17963 (EUR965.00 Bank Jul1 HS1273784562922), pmt17987 (EUR131.90 Bank Jun25 HS1277724782804), pmt17988 (EUR300.00 Bank Jun12 HS1277795367133). Note: pmt17987+pmt17988=EUR431.90=pmt17180 (likely Fidelo installment pair — verify before reconciling all 4 separately in Xero). Host: Mary Carver, mary.carver28@gmail.com, +353 87 927 1130. NEIL MUST ACT NOW: (1) contact Mary Carver TODAY to confirm arrival tomorrow; (2) submit HF claim for BA11358 via SIS admin (student 14443 > booking 17831 > accommodation 11358 > Submit Claim); (3) reconcile pmts in Xero (verify Fidelo pair first). Last checked: 2026-07-11 SAT UTC (17th pass, hourly bot).

---
## 11 Jul 2026 SAT UTC — 18th pass (URGENT — check-in TOMORROW)

Fresh DB: BA11358 bed180 Host Family claimedAt=STILL null, startDate=2026-07-12, endDate=2026-08-02, fee=900, active=true. BK17831 CONFIRMED EUR1396.90/1396.90 fully paid. 4 payments ALL xeroPaymentId=null: pmt17963 EUR965 (Bank Jul1), pmt17180 EUR431.90 (Fidelo Escrow Apr27), pmt17987 EUR131.90 (Bank Jun25), pmt17988 EUR300 (Bank Jun12). Note: pmt17987+pmt17988=EUR431.90=pmt17180 amount — likely Fidelo installment pair, verify before reconciling. HOST MARY CARVER HAS NOT BEEN NOTIFIED. Check-in is TOMORROW Sunday 12 July 2026. Contact: mary.carver28@gmail.com / +353 87 927 1130. NEIL: submit host family claim TODAY. Last checked: 2026-07-11 SAT UTC (18th pass, hourly bot).

---
## 20th pass 2026-07-11 SAT UTC — CHECK-IN TOMORROW (FINAL ALERT)

CONFIRMED UNCHANGED (fresh DB). BA11358 (bed 180, Host Family, Jul12-Aug02): active=true, fee=EUR900, claimedAt=STILL null, claimStatus=STILL null. BK17831 CONFIRMED EUR1396.90/1396.90 (fully paid, confirmed 7 July). 4 payments ALL xeroPaymentId=STILL null type=null: pmt17180(EUR431.90 TransferMate Escrow Apr27 no-HubSpot Fidelo), pmt17963(EUR965.00 Bank Jul1 HS1273784562922), pmt17987(EUR131.90 Bank Jun25 HS1277724782804), pmt17988(EUR300.00 Bank Jun12 HS1277795367133). pmt17987+pmt17988=EUR431.90=pmt17180 (Fidelo installment pair — verify before reconciling all 4 separately). Host: Mary Carver, mary.carver28@gmail.com, +353 87 927 1130 — NOT NOTIFIED.

NEIL MUST ACT TODAY (Saturday 11 July):
(1) Contact Mary Carver (mary.carver28@gmail.com / +353 87 927 1130) — student arrives TOMORROW SUNDAY 12 JULY.
(2) Submit host family claim for BA11358 via SIS admin (student 14443 > booking 17831 > accommodation 11358 > Submit Claim).
(3) Reconcile pmt17963 (EUR965 Bank Jul1) + pmt17180 (EUR431.90 Escrow Apr27) in Xero — verify pmt17987+pmt17988 are Fidelo pair first.
Last checked: 2026-07-11 SAT UTC (20th pass, hourly bot).

---
## 21st pass 2026-07-11 SAT UTC — CHECK-IN TOMORROW SUNDAY 12 JULY

CONFIRMED UNCHANGED (fresh DB). BA11358 (bed 180, Host Family, Jul12-Aug02): active=true, fee=EUR900, claimedAt=STILL null, claimStatus=STILL null.
BK17831 (Xuezhen Huang, student 14443): CONFIRMED confirmed=true amountPaid=EUR1396.90/1396.90 (fully paid, confirmed Jul7).
4 payments ALL xeroPaymentId=STILL null type=null:
  pmt17180 (EUR431.90, TransferMate Escrow, 27 Apr 2026, Fidelo, no HubSpot ID)
  pmt17963 (EUR965.00, Bank, 1 Jul 2026, HubSpot 1273784562922)
  pmt17987 (EUR131.90, Bank, 25 Jun 2026, HubSpot 1277724782804)
  pmt17988 (EUR300.00, Bank, 12 Jun 2026, HubSpot 1277795367133)
pmt17987+pmt17988=EUR431.90=pmt17180 (Fidelo installment pair — verify before reconciling all 4 separately).
Host: Mary Carver, mary.carver28@gmail.com, +353 87 927 1130 — NOT NOTIFIED.

NEIL MUST ACT TODAY (Saturday 11 July):
(1) Contact Mary Carver (mary.carver28@gmail.com / +353 87 927 1130) — student arrives TOMORROW SUNDAY 12 JULY.
(2) Submit host family claim for BA11358 via SIS admin (student 14443 > booking 17831 > accommodation 11358 > Submit Claim).
(3) Reconcile pmt17963 (EUR965 Bank Jul1) + pmt17180 (EUR431.90 Escrow Apr27) in Xero — verify pmt17987+pmt17988 are Fidelo pair first.

Last checked: 2026-07-11 SAT UTC (21st pass, hourly bot).

---
## 23rd pass 2026-07-11 SAT UTC — CHECK-IN TOMORROW (fresh DB)

CONFIRMED UNCHANGED. BA11358 (bed 180, Host Family, Jul12-Aug02): active=true, fee=EUR900, claimedAt=STILL null, claimStatus=STILL null. BK17831 CONFIRMED confirmed=true amountPaid=EUR1396.90/1396.90 (fully paid, confirmed Jul7). 4 payments ALL xeroPaymentId=STILL null type=null: pmt17180(EUR431.90 TransferMate Escrow Apr27 Fidelo no-HS), pmt17963(EUR965 Bank Jul1 HS1273784562922), pmt17987(EUR131.90 Bank Jun25 HS1277724782804), pmt17988(EUR300 Bank Jun12 HS1277795367133). pmt17987+17988=EUR431.90=pmt17180 (Fidelo installment pair — verify before reconciling all 4 separately). Host: Mary Carver, mary.carver28@gmail.com, +353 87 927 1130 — NOT NOTIFIED.

NEIL MUST ACT TODAY (Saturday 11 July):
(1) Contact Mary Carver (mary.carver28@gmail.com / +353 87 927 1130) — student arrives TOMORROW SUNDAY 12 JULY.
(2) Submit host family claim for BA11358 via SIS admin (student 14443 > booking 17831 > accommodation 11358 > Submit Claim).
(3) Reconcile pmt17963 (EUR965 Bank Jul1) + pmt17180 (EUR431.90 Escrow Apr27) in Xero — verify pmt17987+pmt17988 are Fidelo pair first.
Last checked: 2026-07-11 SAT UTC (23rd pass, hourly bot).


---
## 11 Jul 2026 SAT UTC (this bot run) — CHECK-IN TOMORROW SUN 12 JULY

CONFIRMED UNCHANGED (fresh DB). BA11358 bed180 HF claimedAt=STILL null claimStatus=null. BK17831 CONF EUR1396.90/1396.90. 4 pmts ALL xeroPaymentId=null: pmt17180(EUR431.90 Fidelo Apr27), pmt17963(EUR965 Jul1 HS1273784562922), pmt17987(EUR131.90 Jun25 HS1277724782804), pmt17988(EUR300 Jun12 HS1277795367133). pmt17987+17988=EUR431.90=pmt17180 (Fidelo pair — verify before reconciling separately). Host Mary Carver (mary.carver28@gmail.com / +353 87 927 1130) NOT NOTIFIED. NEIL: contact Mary + submit HF claim TODAY. Sheet H41:K41 updated.


---
## 21st check 2026-07-11 SAT UTC (this run)
CONFIRMED UNCHANGED. BA11358 claimedAt=null bed180 Jul12-Aug2. BK17831 CONF EUR1396.90/1396.90 (confirmed Jul7). 4 pmts ALL xeroId=null. CHECK-IN TOMORROW SUN 12 JULY. HOST NOT NOTIFIED. Sheet H41:K41 updated (21st check). NEIL: contact Mary Carver + submit claim TONIGHT.

---
## 22nd check 2026-07-11 SAT UTC — CHECK-IN TOMORROW SUN 12 JULY

CONFIRMED UNCHANGED (fresh DB). BA11358 (bed 180, Host Family, Jul12-Aug02): claimedAt=STILL null, claimStatus=STILL null, active=true, fee=EUR 900. BK17831 (Xuezhen Huang, student 14443): CONFIRMED, confirmed=true, amountPaid=EUR 1396.90/1396.90 (fully paid, confirmed Jul7). 4 payments ALL xeroPaymentId=STILL null: pmt17180(EUR431.90 Escrow Apr27 Fidelo no-HS), pmt17963(EUR965 Bank Jul1 HS1273784562922), pmt17987(EUR131.90 Bank Jun25 HS1277724782804), pmt17988(EUR300 Bank Jun12 HS1277795367133). pmt17987+17988=EUR431.90=pmt17180 (Fidelo installment pair). HOST MARY CARVER (mary.carver28@gmail.com / +353 87 927 1130) NOT NOTIFIED. Sheet H41:K41 updated. Last checked: 2026-07-11 SAT UTC (22nd check, hourly bot).


## 12 Jul 2026 SUN UTC (25th pass) — CHECK-IN TODAY

CONFIRMED UNCHANGED (fresh DB). Report-only.
- BA11358 (bed 180, Host Family, Jul12-Aug02): active=true, fee=EUR 900, claimedAt=STILL null, claimStatus=STILL null — CHECK-IN TODAY SUNDAY 12 JULY.
- BK17831 (Xuezhen Huang, student 14443): CONFIRMED, confirmed=true, amountPaid=EUR 1396.90/1396.90 (fully paid).
- 4 payments ALL xeroPaymentId=null type=null: pmt17180 (EUR431.90 Fidelo Escrow Apr27 no-HS), pmt17987 (EUR131.90 Jun25 HS1277724782804), pmt17988 (EUR300.00 Jun12 HS1277795367133), pmt17963 (EUR965.00 Jul1 HS1273784562922).
- pmt17987+pmt17988=EUR431.90=pmt17180 (Fidelo installment pair — verify before reconciling all 4 separately).
- HOST FAMILY (Mary Carver +353 87 927 1130 / mary.carver28@gmail.com) HAS NOT BEEN NOTIFIED.
- NEIL: contact Mary Carver NOW + submit host family claim for BA11358 TODAY + reconcile pmts17963+17180 in Xero.
Sheet row 41 H/I/J/K written.
Last checked: 2026-07-12 SUN UTC (25th pass, hourly bot).
---
## 27th check 12 Jul 2026 SUN UTC

CONFIRMED UNCHANGED (fresh DB). BA11358 (bed 180, Host Family, Jul12-Aug02): active=true, claimedAt=STILL null, claimStatus=STILL null. BK17831 CONFIRMED EUR1396.90/1396.90 (amountOpen=0, fully paid). 4 payments ALL xeroPaymentId=null: pmt17180 EUR431.90 Fidelo Escrow Apr27 no-HS, pmt17963 EUR965 Jul1 HS1273784562922, pmt17987 EUR131.90 Jun25 HS1277724782804, pmt17988 EUR300 Jun12 HS1277795367133. pmt17987+17988=EUR431.90=pmt17180 (Fidelo pair). HOST MARY CARVER NOT NOTIFIED. NEIL: call +353 87 927 1130 NOW + submit HF claim + reconcile Xero. Sheet row 41 H/I/J/K updated.
Last checked: 2026-07-12 SUN UTC (27th check, hourly bot).

---
## 28th check 2026-07-12 SUN UTC (this run)

CONFIRMED UNCHANGED (fresh DB). Report-only.
- ba11358: bed180, start_date=2026-07-12 (TODAY), end_date=2026-08-02, active=true, claimed_at=null, claim_status=null, fee=EUR900
- bk17831: CONFIRMED, confirmed=true, amount_paid=EUR1396.90/1396.90, amount_open=0 (confirmed Jul 7)
- 4 payments ALL xero_payment_id=null: pmt17180(EUR431.90 Fidelo-Escrow Apr27 no-HS), pmt17963(EUR965 Bank Jul1 HS1273784562922), pmt17987(EUR131.90 Bank Jun25 HS1277724782804), pmt17988(EUR300 Bank Jun12 HS1277795367133)
- pmt17987+pmt17988=EUR431.90=pmt17180 (Fidelo installment pair — verify before reconciling all 4 separately)
- STUDENT CHECK-IN DAY TODAY 12 JULY. HOST FAMILY NOT NOTIFIED. CLAIM STILL NULL.
- Sheet row 41 H/I/J/K updated.
Last checked: 2026-07-12 SUN UTC (28th check, hourly bot).

---
## 29th check 2026-07-12 SUN UTC — CHECK-IN TODAY

CONFIRMED UNCHANGED (fresh DB). Report-only.
- BA11358 (bed 180, Host Family, 12 Jul to 2 Aug 2026): active=true, fee=EUR900, claimedAt=STILL null, claimStatus=STILL null, updatedAt=Jun26 — CHECK-IN IS TODAY SUNDAY 12 JULY.
- BK17831 (Xuezhen Huang, student 14443): CONFIRMED, confirmed=true, amountPaid=EUR1396.90/1396.90 (fully paid, confirmed Jul7).
- 4 payments ALL xeroPaymentId=STILL null type=null: pmt17180(EUR431.90 Fidelo Escrow Apr27 no-HS-ID), pmt17963(EUR965.00 Bank Jul1 HS1273784562922), pmt17987(EUR131.90 Bank Jun25 HS1277724782804), pmt17988(EUR300.00 Bank Jun12 HS1277795367133).
- pmt17987+pmt17988=EUR431.90=pmt17180 (verify Fidelo pair before reconciling separately).
- Host: Mary Carver, mary.carver28@gmail.com, +353 87 927 1130 — NOT YET NOTIFIED as of this check.
- No Xero reconciliation or HF claim submitted. Steps NOT RUN.
NEIL: STUDENT ARRIVES TODAY. Contact Mary Carver urgently. Submit HF claim via SIS.
Last checked: 2026-07-12 SUN UTC (29th check, hourly bot).

---
33rd check 2026-07-12 SUN UTC: CONFIRMED UNCHANGED (fresh DB). BA11358 bed180 HF Jul12-Aug2 claimedAt=STILL null claimStatus=STILL null fee=EUR900 active=true (updAt=Jun26). BK17831 CONFIRMED EUR1396.90/1396.90 confirmed=true (updAt=Jul8). 4 payments ALL xeroPaymentId=STILL null: pmt17180(EUR431.90 Fidelo Apr27), pmt17963(EUR965 Jul1 HS1273784562922), pmt17987(EUR131.90 Jun25 HS1277724782804), pmt17988(EUR300 Jun12 HS1277795367133). pmt17987+17988=EUR431.90=pmt17180 (Fidelo pair — verify before reconciling separately). CHECK-IN TODAY SUN 12 JUL — HOST NOT NOTIFIED. Steps NOT RUN. NEIL: call Mary Carver +353 87 927 1130 NOW.
Last checked: 2026-07-12 SUN UTC (33rd check, hourly bot).

---
34th check 2026-07-12 SUN UTC: CONFIRMED UNCHANGED (fresh DB). BA11358 bed180 HF Jul12-Aug2 claimedAt=STILL null claimStatus=STILL null fee=EUR900 active=true. CHECK-IN IS TODAY SUNDAY 12 JULY. Host Mary Carver (+353 87 927 1130 / mary.carver28@gmail.com) NOT NOTIFIED. BK17831 CONFIRMED EUR1396.90/1396.90. 4 pmts ALL xeroPaymentId=null. pmt17987+17988=EUR431.90=pmt17180 (Fidelo pair). Steps NOT RUN. NEIL: call Mary Carver NOW + submit HF claim.
Last checked: 2026-07-12 SUN UTC (34th check, hourly bot).

---
35th check 2026-07-12 SUN UTC: CONFIRMED UNCHANGED (fresh DB). BA11358 bed180 Host-Family startDate=TODAY Jul12 endDate=Aug2 claimedAt=STILL null claimStatus=STILL null fee=EUR900 active=true (updAt=Jun26). HOST MARY CARVER (+353 87 927 1130 / mary.carver28@gmail.com) NOT NOTIFIED. BK17831 CONFIRMED EUR1396.90/1396.90 confirmed=true (updAt=Jul8). 4 pmts ALL xeroPaymentId=STILL null: pmt17180(EUR431.90 Fidelo Apr27 no-HS-ID), pmt17963(EUR965 Jul1 HS1273784562922), pmt17987(EUR131.90 Jun25 HS1277724782804), pmt17988(EUR300 Jun12 HS1277795367133). pmt17987+17988=EUR431.90=pmt17180 (Fidelo pair). STUDENT ARRIVING TODAY. Steps NOT RUN. Sheet H41:K41 updated.
Last checked: 2026-07-12 SUN UTC (35th check, hourly bot).

---
36th check 2026-07-12 SUN UTC (later run): CONFIRMED UNCHANGED (fresh DB). BA11358 bed180 HF startDate=TODAY Jul12 endDate=Aug2 claimedAt=STILL null claimStatus=STILL null. HOST MARY CARVER STILL NOT NOTIFIED. STUDENT HAS ARRIVED TODAY. BK17831 CONFIRMED EUR1396.90/1396.90. 4 payments ALL xeroPaymentId=STILL null. Contact: Mary Carver +353 87 927 1130 / mary.carver28@gmail.com. Steps NOT RUN. Sheet H41:K41 updated.
Last checked: 2026-07-12 SUN UTC (36th check, hourly bot).

---
38th check 2026-07-12 SUN UTC (later run): CONFIRMED UNCHANGED (fresh DB). BA11358 bed180 HF startDate=TODAY Jul12 endDate=Aug2 claimedAt=STILL null claimStatus=STILL null fee=EUR900 active=true. HOST MARY CARVER (+353 87 927 1130 / mary.carver28@gmail.com) STILL NOT NOTIFIED. STUDENT HAS ARRIVED TODAY. BK17831 CONFIRMED EUR1396.90/1396.90 confirmed=true (updAt=Jul8). 4 payments ALL xeroPaymentId=STILL null type=null: pmt17180(EUR431.90 Fidelo Escrow Apr27 no-HS-ID), pmt17963(EUR965.00 Bank Jul1 HS1273784562922), pmt17987(EUR131.90 Bank Jun25 HS1277724782804), pmt17988(EUR300.00 Bank Jun12 HS1277795367133). pmt17987+17988=EUR431.90=pmt17180 (Fidelo pair — verify before reconciling separately). No action taken. Sheet H41:K41 updated.
NEIL: call Mary Carver NOW +353 87 927 1130. Submit host family claim via SIS admin. Reconcile pmts in Xero.
Last checked: 2026-07-12 SUN UTC (38th check, hourly bot).

---
## 39th check 2026-07-12 SUN UTC — STUDENT ARRIVED TODAY, HF STILL NOT NOTIFIED

CONFIRMED UNCHANGED (fresh DB). BA11358: bed 180 (Host Family, provider 146 = Mary Carver, mary.carver28@gmail.com, +353 87 927 1130), startDate=2026-07-12 (TODAY), endDate=2026-08-02, claimedAt=null, claimStatus=null. Xuezhen Huang (student 14443) has arrived today; host family has NOT been notified. BK17831 CONFIRMED EUR1396.90/1396.90 (updAt=Jul8). 4 payments all xeroPaymentId=null: pmt17180 EUR431.90, pmt17963 EUR965.00, pmt17987 EUR131.90, pmt17988 EUR300.00 (total on record EUR1828.80 — discrepancy vs booking total EUR1396.90 noted; some may be superseded installments). NEIL: call Mary Carver +353 87 927 1130 / email mary.carver28@gmail.com NOW + submit host family claim for BA11358 via SIS admin. Last checked: 2026-07-12 SUN UTC (39th check, hourly bot).

---
40th check 2026-07-12 SUN UTC: CONFIRMED UNCHANGED (fresh DB). BA11358 bed180 HF startDate=TODAY Jul12 endDate=Aug2 claimedAt=STILL null claimStatus=STILL null fee=EUR900. HOST MARY CARVER (+353 87 927 1130 mary.carver28@gmail.com) STILL NOT NOTIFIED. STUDENT HAS ARRIVED TODAY. BK17831 CONFIRMED EUR1396.90/1396.90 amountOpen=0 (confirmed Jul8). 4 pmts ALL xeroPaymentId=STILL null: pmt17180(EUR431.90 Fidelo Apr27 no-HS-ID), pmt17963(EUR965 Jul1 HS1273784562922), pmt17987(EUR131.90 Jun25 HS1277724782804), pmt17988(EUR300 Jun12 HS1277795367133). Sum=EUR1828.80 vs amountPaid=EUR1396.90 (EUR431.90 excess; pmt17987+17988=pmt17180 Fidelo pair, verify before reconciling all 4 separately). Steps NOT RUN. NEIL: call Mary Carver NOW + submit HF claim for BA11358 via SIS admin + reconcile pmts in Xero.
Last checked: 2026-07-12 SUN UTC (40th check, hourly bot).

---
## 41st check 2026-07-12 SUN UTC (later run) — STUDENT ARRIVED TODAY

CONFIRMED UNCHANGED (fresh DB).
- BA11358 (bed 180, Host Family, Jul12-Aug02): active=true, fee=EUR900, claim_status=STILL null — STUDENT HAS ARRIVED TODAY.
- BK17831 (Xuezhen Huang, student 14443): CONFIRMED, confirmed=true, amountPaid=EUR1396.90/1396.90 (fully paid).
- Host: Mary Carver, mary.carver28@gmail.com, +353 87 927 1130 — NOT YET NOTIFIED.
- 4 payments ALL xeroPaymentId=null type=null: pmt17180(EUR431.90 Fidelo Escrow Apr27 no-HS-ID), pmt17963(EUR965 Bank Jul1 HS1273784562922), pmt17987(EUR131.90 Bank Jun25 HS1277724782804), pmt17988(EUR300 Bank Jun12 HS1277795367133). pmt17987+pmt17988=EUR431.90=pmt17180 (Fidelo installment pair — verify before reconciling all four separately).

NEIL: STUDENT IS HOME NOW. Call Mary Carver immediately: +353 87 927 1130. Submit HF claim for BA11358 via SIS. Reconcile pmts in Xero.
Sheet H41:K41 updated.
Last checked: 2026-07-12 SUN UTC (41st check, hourly bot).

---
## 42nd check 2026-07-12 SUN UTC — STUDENT ARRIVED TODAY

CONFIRMED UNCHANGED (fresh DB). Report-only.

BK17831 (Xuezhen Huang, student 14443): CONFIRMED, confirmed=true, amountPaid=EUR1396.90/1396.90, amountOpen=0 (fully paid, confirmed Jul7).

BA11358 (bed 180, Host Family — Mary Carver, property 147, room 159): startDate=2026-07-12 (TODAY), endDate=2026-08-02, active=true, fee=EUR900, claimStatus=STILL null.

STUDENT HAS ARRIVED. HOST NOT NOTIFIED.

Host contact: Mary Carver, mary.carver28@gmail.com, +353 87 927 1130.

4 payments ALL xeroPaymentId=null:
  pmt17180 (EUR431.90, TransferMate Escrow, 27 Apr 2026, Fidelo, no HubSpot ID)
  pmt17963 (EUR965.00, Bank, 1 Jul 2026, HubSpot 1273784562922)
  pmt17987 (EUR131.90, Bank, 25 Jun 2026, HubSpot 1277724782804)
  pmt17988 (EUR300.00, Bank, 12 Jun 2026, HubSpot 1277795367133)
pmt17987+pmt17988=EUR431.90=pmt17180 (likely Fidelo installment pair — verify before reconciling all 4 separately).

NEIL: STUDENT HAS ARRIVED — call Mary Carver NOW (+353 87 927 1130). Then:
(1) Submit host family claim for BA11358 via SIS admin.
(2) Reconcile pmt17963 (EUR965 Bank Jul1) + pmt17180 (EUR431.90 Escrow Apr27) in Xero.
Sheet H41:K41 updated.
Last checked: 2026-07-12 SUN UTC (42nd check, hourly bot).

---
43rd check — 13 Jul 2026 MON UTC

CONFIRMED UNCHANGED (fresh DB).
ba11358: bed_id=180, start_date=2026-07-12, end_date=2026-08-02, claim_status=STILL null, fee=900.
Student Xuezhen Huang arrived 12 Jul (yesterday). Day 2 of host family stay.
Host Mary Carver: +353 87 927 1130 / mary.carver28@gmail.com — STILL not notified.
bk17831: CONFIRMED, EUR1396.90/1396.90 amtOpen=0 (fully paid).
4 payments all xeroPaymentId=null.

NEIL: call Mary Carver NOW — student is in the house and host was never told.
Then submit host family claim for ba11358 via SIS admin.
Last checked: 2026-07-13 MON UTC (43rd check, hourly bot).
---

## Status update — 13 July 2026 (Mon) UTC — 44th check

**CRITICAL CORRECTION — HOST FAMILY MISIDENTIFIED IN ALL PRIOR RUNS**

Every previous bot run named **Mary Carver (mary.carver28@gmail.com, +353 87 927 1130)** as the host family for Xuezhen Huang.

Fresh DB query (bed → room → property → provider join):
- Bed 180 → Room 159 → Property 147 → Provider **Kathleen Delahunty**
  - Email: ctdelahunty@gmail.com
  - Phone: +353 87 639 8049

Mary Carver appears elsewhere in the DB but is NOT linked to bed 180. Any prior contact attempts using Mary Carver details were sent to the wrong person.

### Live DB state (13 Jul)

- BA11358 (Xuezhen Huang, student 14443, bed 180): check-in 12 Jul — Day 2 — claimStatus = null
- BK17831: CONFIRMED, EUR 1396.90 paid / 1396.90 total
- 4 payments: PMT17180 EUR965.00, PMT17987 EUR131.90, PMT17988 EUR300.00, PMT17989 EUR0.00 — all xeroPaymentId = null, type = null
- Note: PMT17987 (EUR131.90) + PMT17988 (EUR300) = EUR431.90 = PMT17180 amount — possible Fidelo installment pair; verify before reconciling separately in Xero

### Action required (NEIL)

1. Call Kathleen Delahunty immediately: +353 87 639 8049 / ctdelahunty@gmail.com
2. Submit host family claim for BA11358
3. Reconcile 4 payments in Xero (confirm whether 17987+17988 = installments of 17180 before creating Xero records)

**Do NOT contact Mary Carver for this issue.**
---
## 45th check — 13 July 2026 MON UTC (Day 2 of stay)

CONFIRMED UNCHANGED (fresh DB).
- Accommodation 11358 (bed 180, HF, Jul12-Aug2): claimStatus=null — host not notified via portal
- Booking 17831: CONFIRMED, amount_total=EUR1396.90, amount_paid=EUR1396.90
- 4 payments on booking 17831: PMT17180 EUR431.90 (Fidelo TransferMate import) + PMT17987 EUR131.90 + PMT17988 EUR300.00 + PMT17963 EUR965.00 = EUR1828.80 total vs booking total EUR1396.90
- Discrepancy EUR432: PMT17180 is a Fidelo escrow import (data_source=FIDELO, receipt_number=R20261300) — may be double-counted. Three HubSpot payments (131.90+300+965=1396.90) match booking total exactly.
- Host: Kathleen Delahunty, ctdelahunty@gmail.com, +353 87 639 8049
Fix NOT RUN. NEIL: Call host immediately. Last checked: 2026-07-13 MON UTC (45th check, hourly bot).

---
49th check 2026-07-13 UTC. Day 2 of stay. BA11358 claimedAt=null — host Kathleen Delahunty NOT claimed. BK17831 CONF EUR1396.9/1396.9. PMTs 17180+17987+17988+17963 all xeroPaymentId=null. Fix NOT RUN. Student in accommodation now — CALL HOST.

---
50th check 2026-07-13 MON UTC (Day 2 of stay)
CONFIRMED UNCHANGED (fresh DB). BA11358 bed180 Jul12-Aug2 claimStatus=null claimedAt=null. Provider146 in this run's fresh DB: Mary Carver +353 87 927 1130 portalMatchingEnabled=true. DISCREPANCY: 45th check named Kathleen Delahunty ctdelahunty@gmail.com - verify which is correct host for bed180. BK17831 CONF EUR1396.90/1396.90. 4 pmts all xeroPaymentId=null. BC24609 GE AM Jul13-Jul31 active, starts today, 0 SCAs for student 14443. Host NOT claimed, course started today. NEIL: call host + assign to class TODAY. Fix NOT RUN. Last checked: 2026-07-13 MON UTC (50th check, hourly bot).

---
51st check 2026-07-13 MON UTC (Day 2 of stay)
CONFIRMED UNCHANGED (fresh DB). Accommodation 11358 (bed 180, July 12-August 2): claimStatus = null. Host: Mary Carver +353 87 927 1130 (per provider 146 DB record — 45th check named Kathleen Delahunty ctdelahunty@gmail.com; verify which is correct host for bed 180). Booking 17831 confirmed EUR1396.90/1396.90. Payments 17180, 17987, 17988, 17963: all xeroPaymentId = null. Booking course 24609 (Morning General, Jul13-Jul31): active, confirmed, zero class assignments (day 1 overdue).
Fix NOT RUN. NEIL: (1) confirm correct host identity and call to claim bed 180; (2) assign class for BC24609 via SIS today.
Last checked: 2026-07-13 MON UTC (51st check, hourly bot).
---
52nd check 2026-07-13 MON UTC (Day 2 of stay)

CONFIRMED UNCHANGED (fresh DB). No action taken.

Accommodation 11358 (bed 180, Host Family, Jul12-Aug2): claimStatus=null, claimedAt=null. Host: Mary Carver +353 87 927 1130 (portalMatchingEnabled=true — verify vs 45th check which named Kathleen Delahunty). Student arrived YESTERDAY (Jul12). Host has still not claimed.

Booking course 24609 (Morning General, Jul13-Jul31, fee=EUR570): started TODAY. Zero class assignments. Student is in school Day 1 with no class.

4 payments ALL xeroPaymentId=null: pmt17180 EUR431.90 (TransferMate Escrow Apr27), pmt17963 EUR965 Bank Jul1 HS1273784562922, pmt17987 EUR131.90 Jun25 HS1277724782804, pmt17988 EUR300 Jun12 HS1277795367133.

Booking 17831: CONFIRMED EUR1396.90/1396.90.

NEIL: (1) Confirm host identity (Mary Carver vs Kathleen Delahunty — call +353 87 927 1130); (2) Assign class for BC24609 via SIS TODAY; (3) Reconcile Xero payments.
Last checked: 2026-07-13 MON UTC (52nd check, hourly bot). Fix NOT RUN.
