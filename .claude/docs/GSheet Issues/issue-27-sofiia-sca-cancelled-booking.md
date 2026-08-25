# Issue 27 — Sofiia Korkishchenko

Reporter: pg | Area: booking/class | Sheet row: 28

## Symptom

Old course shows in SIS ending day new course starts (08/06/2026); remained in B2-C1.
Old course ended 24.04. Cancelled course May25 appears in-progress alongside Jun08 renewal.

## Root cause

Student: s768 Sofiia Korkishchenko

### A — sca14 premature week_start

- student_class_assignments id=14, booking_course_id=24623, class_id=4 (B2-C1)
- week_start=2026-03-30, week_end=NULL
- Course bc24623 (bk17849 AY Renewal Afternoon) starts 2026-06-08 NOT Mar30
- Student appeared in B2-C1 register 10 weeks before renewal course began

### B — bk17909 CANCELLED + EUR 1455.5 orphaned payments

- bk17909 CANCELLED HS 500883363036: amount_total=727.5 amount_paid=1455.5
- pmt17477 EUR 727.5 Bank Apr28 + pmt17478 EUR 728 Bank May15 = EUR 1455.5 on cancelled booking
- bk17849 CONFIRMED: fully paid by pmt17468 EUR 1455.5 Apr21 (independent)
- EUR 1455.5 unresolved on cancelled booking — no refund or transfer recorded

### C — bk17909 visible in SIS alongside bk17849

CANCELLED booking (May25 course) appears alongside confirmed renewal (Jun08).

## Fix recipe (NOT YET RUN)

### Step 1 — Fix sca14 week_start

Verify: SELECT id,booking_course_id,class_id,week_start,week_end FROM student_class_assignments WHERE id=14;
Expect: bc=24623, class=4, week_start=2026-03-30, week_end=null

Fix: UPDATE student_class_assignments SET week_start='2026-06-08' WHERE id=14;

Risk: Low, reversible.

### Step 2 — Resolve bk17909 orphaned payments

Check: SELECT id,booking_id,amount,payment_date,xero_payment_id FROM payments WHERE id IN (17477,17478);

NEIL: Are pmt17477+17478 real received funds?
- If real + not refunded: issue refund EUR 1455.5 to student via Xero
- If duplicates: DELETE FROM payments WHERE id IN (17477,17478)
- Either way: UPDATE bookings SET amount_paid=0 WHERE id=17909

### Step 3 — Check bk1310 ESCROW

SELECT id,status,amount_total,amount_paid FROM bookings WHERE id=1310;
Courses ended Apr24; update status if escrow funds released.

## Risk

- Category: bookings + money | Blast radius: 1 student
- Step 1: Low risk reversible | Step 2: Medium — verify Xero/bank before acting

## Status

Pending Neil review — especially payment disposition on bk17909.
ANOMALY (Jun09): bk17909.confirmed=true despite status=CANCELLED; amount_paid=1455.5 exceeds amount_total=727.5 (double billed amount — investigate before refunding).

Last checked: 2026-06-09 UTC (hourly bot)
Last checked: 2026-06-09 UTC hrly(run2): UNCHANGED. sca14 still week_start=2026-03-30 (should Jun08). bk17909 CANCELLED confirmed=true (anomaly). pmt17477(727.5)+pmt17478(728)=EUR1455.5 orphaned on cancelled booking. bk17849 CONFIRMED, c24623 Jun08-Nov27 active. Await Neil: Step1 fix sca14 (safe), Step2 resolve orphaned pmts (check Xero first).
Last checked: 2026-06-09 UTC hrly(run3): UNCHANGED. sca14 week_start=Mar30. bk17909 CANCELLED confirmed=true. pmt17477(EUR727.5 Apr28 Bank)+pmt17478(EUR728 May15 Bank)=EUR1455.5 orphaned. bk17849 CONFIRMED c24623 Jun08-Nov27. Await Neil both steps.
Last checked: 2026-06-09 UTC hrly(run3): CONFIRMED DOUBLE CHARGE. bk17849 has own pmt17468 (EUR1455.5 Bank Apr21). pmt17477(727.5)+pmt17478(728) on bk17909 (cancelled) = EUR1455.5 GENUINELY ORPHANED — Sofiia was charged TWICE for renewal. Total collected: EUR2911, owed: EUR1455.5. Refund EUR1455.5 urgently (Step 2). sca14 week_start still Mar30 (should Jun08, Step 1 still needed).

Last checked: 2026-06-09 UTC hrly(run4): UNCHANGED. pmt17477(bk17909 EUR727.5)+pmt17478(bk17909 EUR728)=EUR1455.5 still orphaned. sca14 still week_start=2026-03-30. bk17849 CONFIRMED c24623 Jun08-Nov27. Both steps still needed.
Last checked: 2026-06-09 UTC hrly(run5): UNCHANGED. sca14 week_start=Mar30 (should Jun08). pmt17477(EUR727.5)+pmt17478(EUR728)=EUR1455.5 on bk17909 CANCELLED (double charge). Step1+Step2 still needed.
Last checked: 2026-06-09 UTC hrly(11): LIVE CONFIRMED. sca14 weekStart=Mar30 classId=4. bk17909 CANCELLED confirmed=true amtPaid=1455.5>727.5. pmts17477+17478 no txId. Both steps pending.
Last checked: 2026-06-09 UTC hrly(12): UNCHANGED. sca14 weekStart=Mar30 weekEnd=null classId=4(B2-C1). bk17849 amtPaid=1455.5=amtTotal OK (pmt17468 EUR1455.5 Apr21 Bank). pmt17477(EUR727.5 Apr28 Bank no txId)+pmt17478(EUR728 May15 Bank no txId) STILL on bk17909 CANCELLED. EUR1455.5 orphaned. Both steps pending.

--- UPDATE 2026-06-09 hrly(13) MAJOR STATUS CHANGE ---
STEP 1 RESOLVED (no action needed):
  sca14 weekEnd=2026-06-07 -> expired YESTERDAY. Step1 (update week_start) is MOOT.
  NEW: sca254 classId=6 weekStart=2026-06-08 weekEnd=2026-11-27 EXISTS.
  Sofiia's class assignment for renewal course c24623 is correct. No SCA fix needed.

STEP 2 STILL OPEN (MONEY):
  pmt17477 EUR727.5 Bank Apr28 (bookingId=17909, no transactionId, no xeroPaymentId)
  pmt17478 EUR728 Bank May15 (bookingId=17909, no transactionId, no xeroPaymentId)
  = EUR1455.5 orphaned on CANCELLED bk17909.
  bk17849 already fully paid by separate pmt17468 (EUR1455.5 Bank Apr21).
  Double charge: Sofiia paid EUR1455.5 twice. Refund EUR1455.5.

NEIL: Step2 only remains. Verify in Xero whether pmt17477+17478 were received as
separate transactions. If confirmed received and not yet refunded: issue refund EUR1455.5.
If duplicates/errors: DELETE FROM payments WHERE id IN (17477,17478).
Last checked: 2026-06-09 UTC hrly(this run): sca254 classId=6 (B2&C1 PM) weekStart=Jun08 weekEnd=Nov27 ACTIVE (step1 complete). pmt17477(EUR727.5 Apr28 Bank)+pmt17478(EUR728 May15 Bank) on bk17909 CANCELLED - no transactionId, no xeroPaymentId. bk17849 pmt17468(EUR1455.5 Apr21 Bank) also no transactionId. ALL 3 payments have zero txId/xeroId = strong indicator these are migration artifacts NOT real Xero transactions. NEIL: open Xero and search for Sofiia Korkishchenko payments around Apr-May 2026. If only 1 real payment exists (EUR1455.5) then pmts 17477+17478 are duplicates to DELETE. If 3 real payments found: real double-charge, issue refund EUR1455.5.
Last checked: 2026-06-10 UTC hrly3: sca254 classId=6 (B2&C1 PM) Jun08-Nov27 ACTIVE (correct). pmt17477 (EUR727.5) + pmt17478 (EUR728) on bk17909 CANCELLED both txId=null. CONFIRMED NEW: bk17909.confirmed=true despite status=CANCELLED — data anomaly (should be confirmed=false for a cancelled booking). This does not change the fix but should be noted. All migration-artifact payments have no transactionId or xeroPaymentId. NEIL: priority is Xero lookup for Sofiia payments Apr-May 2026 before any delete.
Last checked: 2026-06-11 UTC hrly -- UNCHANGED. sca254 classId=6 Jun08-Nov27 ACTIVE (step1 complete). bk17909 CANCELLED confirmed=true amtPaid=1455.5>amtTotal=727.5. pmt17477(EUR727.5 hsId=1230788330738)+pmt17478(EUR728 hsId=1230645766331) xeroPaymentId=null txId=null. bk17909 dealId=500883363036. NEIL: open Xero, search Sofiia payments Apr-May 2026; if only 1 EUR1455.5 found then 17477+17478 are migration dups to DELETE; if 3 found: issue refund EUR1455.5.

Last checked: 2026-06-11 UTC hrly(12): NEW FINDING - pmt17468(bk17849 EUR1455.5 hsPaymentId=1230607249606 xero=null). pmt17477(bk17909 EUR727.5 hsPaymentId=1230788330738 xero=null)+pmt17478(EUR728 hsPaymentId=1230645766331 xero=null). All 3 have DISTINCT HubSpot payment IDs = 3 separate HubSpot payment records (not migration dupes). Confirms double-charge scenario. bk17849 settled by pmt17468. Orphaned EUR1455.5 on bk17909. NEIL: urgent Xero cross-check to confirm money in/out.
Last checked: 2026-06-11 UTC hrly(15): pmt17468(bk17849 EUR1455.5 hs=1230607249606)+pmt17477(bk17909 EUR727.5 hs=1230788330738)+pmt17478(EUR728 hs=1230645766331). All xeroId=null txId=null. sca254 Jun08-Nov27 ACTIVE. Sheet row G updated(hash changed). NEIL: Xero check Sofiia Apr-May 2026 for EUR1455.5 double-pay before delete decision.

Last checked: 2026-06-13 UTC hrly SAT — UNCHANGED. sca254 cls6(B2&C1 PM) Jun08-Nov27 ACTIVE (step1 resolved). pmt17477(bk17909 EUR727.5 hs=1230788330738 xero=null txId=null)+pmt17478(bk17909 EUR728 hs=1230645766331 xero=null txId=null) still orphaned on bk17909 CANCELLED. pmt17468(bk17849 EUR1455.5 hs=1230607249606 xero=null): 3 distinct HubSpot payment IDs = double-charge scenario confirmed. bk17909 CANCELLED confirmed=true amtPaid=1455.5/727.5. NEIL: Xero check Sofiia Korkishchenko payments Apr-May 2026: if only EUR1455.5 found = pmts 17477+17478 are migration dupes, DELETE them; if 3 real payments found = refund EUR1455.5.
Last checked: 2026-06-13 UTC hrly SAT#4 — CONFIRMED UNCHANGED. sca254 cls6 Jun08-Nov27 ACTIVE(Step1 done). pmt17477(bk17909 EUR727.5 hsId=1230788330738 xeroId=null)+pmt17478(EUR728 hsId=1230645766331 xeroId=null) BOTH orphaned on cancelled bk17909. bk17909 CANC confirmed=true amtPaid=1455.5 amtTotal=727.5 (INCONSISTENCY: paid=1455.5 > total=727.5 = double-charge evidence). 2 distinct HS payment IDs. NEIL: check Xero for Sofiia Apr-May 2026. If no Xero entries for 727.5+728: DELETE FROM payments WHERE id IN(17477,17478)(NOT RUN). If found: refund process needed.

Last checked: 2026-06-13 UTC hrly SAT#5 — CONFIRMED UNCHANGED. pmt17477(bk17909 EUR727.5 hs=1230788330738 xeroId=null)+pmt17478(EUR728 hs=1230645766331 xeroId=null) BOTH orphaned on CANC bk17909. Both xeroId=null = not Xero-reconciled (likely Fidelo migration artifacts). bk17909 CANC amtPaid=1455.5 amtTotal=727.5 INCONSISTENCY. NEIL: Xero search Sofiia Korkishchenko Apr-May 2026. If only EUR1455.5 found: DELETE FROM payments WHERE id IN(17477,17478)(NOT RUN). If 3 real payments found: refund EUR1455.5.

Last checked: 2026-06-13 UTC hrly SAT (this run) — CONFIRMED UNCHANGED. sca254 cls6(B2&C1 PM) Jun08-Nov27 ACTIVE(Step1 done). pmt17477(bk17909 EUR727.5 hs=1230788330738 xeroId=null createdAt=May22)+pmt17478(EUR728 hs=1230645766331 xeroId=null createdAt=May22) BOTH orphaned on CANC bk17909. 2 distinct HS payment IDs. NEIL: Xero search Sofiia Korkishchenko Apr-May 2026. If only EUR1455.5 found: DELETE FROM payments WHERE id IN(17477,17478)(NOT RUN). If 3 real payments: refund EUR1455.5.

Last checked: 2026-06-13 UTC hrly SAT (final) — hash chg=cosmetic(B column edit). SUBSTANTIVELY UNCHANGED. pmt17477(EUR727.5 hs=1230788330738)+pmt17478(EUR728 hs=1230645766331) STILL orphaned on CANC bk17909, xeroId=null. sca254 cls6 Jun08-Nov27 ACTIVE(confirmed). NEIL: search Xero for Sofiia Korkishchenko EUR1455.5 Apr-May2026. If only EUR1455.5 found: DELETE pmts 17477+17478(NOT RUN). If 3 real pmts: refund EUR1455.5.

Last checked: 2026-06-15 UTC run3: NEW — bk17909 updatedAt changed to 15:46 UTC Jun15 (after run2/hrly16 check), but status=CANCELLED, confirmed=true, amtPaid=1455.5, amtTotal=727.5 are unchanged. Possible admin edit or webhook touch at 15:46 UTC. pmt17477(EUR727.5 hs=1230788330738 xeroId=null)+pmt17478(EUR728 hs=1230645766331 xeroId=null) still orphaned on cancelled bk17909. NEIL: urgent Xero check Sofiia Korkishchenko Apr-May 2026 — 3 distinct HubSpot payment IDs suggest 3 separate charges. If only EUR1455.5 in Xero: DELETE FROM payments WHERE id IN(17477,17478)(NOT RUN). If 3 real payments: refund EUR1455.5.

Last checked: 2026-06-17 UTC hrly: UNCHANGED. bk17909 CANCELLED confirmed=true amtPaid=1455.50/amtTotal=727.50 (updAt=Jun15). pmt17477(EUR727.50 hs=1230788330738 xeroId=null)+pmt17478(EUR728 hs=1230645766331 xeroId=null) still orphaned on CANC bk17909. sca254 cls6 Jun08-Nov27 ACTIVE (Step1 done). NEIL: Xero search Sofiia Korkishchenko Apr-May 2026; if only EUR1455.50 found = DELETE FROM payments WHERE id IN(17477,17478) (NOT RUN); if 3 real pmts = refund EUR1455.50.

**Jun17 hrly #9 — STATE CHANGE:** Payments 17477 and 17478 DELETED from database today (both had xeroId = null — database-side safe). bk17909 now shows amountPaid = 0 (updatedAt = 2026-06-17 12:54 UTC). HubSpot payment IDs 1230788330738 and 1230645766331 — status in HubSpot UNKNOWN; Neil must check/void if still live.

Current state after Jun17 cleanup:
- bk17909: CANCELLED, confirmed = true (anomaly — should be false), amountPaid = 0
- bk17849 (active renewal): CONFIRMED, pmt17468 EUR 1455.50 — correct
- sca254 (class 6, B2–C1 PM, Jun 08 – Nov 27): ACTIVE — correct

Remaining open items (NOT YET RUN):
1. UPDATE bookings SET confirmed = false WHERE id = 17909;
2. Check HubSpot payments 1230788330738 + 1230645766331 — void via HubSpot UI if still live.

Last checked: 2026-06-17 UTC hrly #9.

Last checked: 2026-06-17 UTC hrly (latest) — bk17909 CANCELLED confirmed=true amtPaid=0/727.5 (updAt=Jun17 12:54 UTC — amtPaid=0 confirms pmts 17477+17478 DELETED). sca254 cls6 Jun08-Nov27 ACTIVE (confirmed fresh DB). HubSpot payments 1230788330738+1230645766331 status UNKNOWN. REMAINING (NOT RUN): (1) UPDATE bookings SET confirmed=false WHERE id=17909; (2) void HubSpot pmts via HubSpot UI.


**Jun18 hrly:** CONFIRMED UNCHANGED (fresh DB). bk17909 CANCELLED confirmed=true amtPaid=0 (pmts deleted Jun17). sca254 cls6 Jun08-Nov27 ACTIVE and correct. HubSpot payment IDs 1230788330738 + 1230645766331 status UNKNOWN — unverified/unvoided. REMAINING OPEN (NOT RUN): (1) UPDATE bookings SET confirmed=false WHERE id=17909; (2) check/void HubSpot pmts via HubSpot UI. Last checked: 2026-06-18 UTC hrly.

**Jun19 hrly9 — HubSpot payments confirmed still NOT voided (fresh API check):** bk17909 CANCELLED confirmed=true amtPaid=0 (pmts 17477+17478 deleted from DB Jun17 — confirmed fresh DB). HubSpot payment 1230788330738 (EUR727.50): archived=false — NOT voided. HubSpot payment 1230645766331 (EUR728.00): archived=false — NOT voided. sca254 cls6 Jun08-Nov27 ACTIVE and correct. bk17849 CONFIRMED amtPaid=1455.5 correct. Remaining (NOT RUN): (1) UPDATE bookings SET confirmed=false WHERE id=17909; (2) void HubSpot pmts 1230788330738+1230645766331 via HubSpot UI (Contact: Sofiia Korkishchenko -> Commerce -> Payments). Last checked: 2026-06-19 UTC hrly9.


**Jun21 hrly (3rd) — HubSpot payment type CORRECTED + full status confirmed:**
Prior 'OBJECT_NOT_FOUND' errors used wrong endpoint (/line_items/). These IDs are Commerce Hub payment objects (type 0-101).

Confirmed via /crm/v3/objects/payments/ on 2026-06-21:
- 1230788330738: EUR 727.50, status=succeeded, archived=false, refunds=null, refund_deadline=2026-10-25
- 1230645766331: EUR 728.00, status=succeeded, archived=false, refunds=null, refund_deadline=2026-11-11

Both LIVE — NOT refunded, NOT voided. DB side clean (pmts deleted Jun17). bk17909 CANCELLED confirmed=true. sca254 ACTIVE.

Remaining (NOT YET RUN):
1. Xero check Sofiia Apr-May 2026 → if 3 payments: refund EUR1455.50 via HS Commerce before Oct25-26.
2. UPDATE bookings SET confirmed=false WHERE id=17909 (cosmetic).
Last checked: 2026-06-21 UTC hrly3.


Last checked Jun28 SUN UTC (10th check): bk17909 CANCELLED confirmed=STILL TRUE 0/727.5 (updAt=Jun17=11d stale). bk17849 CONF 1455.5/1455.5 pmt17468 hsId=1230607249606 xeroId=null. HS Commerce pmts (EUR727.50+EUR728.00) not verifiable from DB. Refund deadlines Oct25/Nov11-26. UNCHANGED.
**1 Jul UTC (14th check, fresh DB): CONFIRMED UNCHANGED. bk17909 CANCELLED confirmed=STILL TRUE 0/727.5 (updAt=Jun17=14d stale). bk17849 CONF 1455.5/1455.5 pmt17468 xeroId=null hsId=1230607249606. HS Commerce pmts EUR727.50+EUR728.00 not verifiable from DB -- refund deadlines Oct25/Nov11-26. Fix (NOT RUN): (1) Xero check Apr-May26 -> refund EUR1455.50 via HS Commerce before Oct25; (2) UPDATE bookings SET confirmed=false WHERE id=17909. Last checked: 2026-07-01 UTC (14th check, hrly bot).**


**2 Jul UTC (16th check, fresh DB): CONFIRMED — bk17909 CANCELLED confirmed=STILL TRUE amtPaid=0 (pmts 17477+17478 deleted Jun17). The H/J in the sheet had been showing stale pre-Jun17 data (amtPaid=1455.5) — corrected this run. HS Commerce pmts EUR727.50 (1230788330738) + EUR728 (1230645766331) NOT voided; refund deadlines Oct25/Nov11-26. Remaining: (1) Xero check Sofiia Apr-May 2026 + void HS pmts before Oct25; (2) UPDATE bookings SET confirmed=false WHERE id=17909 (NOT RUN, low-pri).**
**6 Jul UTC (18th check, fresh DB): CONFIRMED UNCHANGED. bk17909 CANCELLED confirmed=STILL true amtPaid=0/727.5. 0 payments (pmts 17477+17478 deleted Jun17). bc24693 (Renewal-AY-PM May25-Nov13) STILL active=true on cancelled booking -- anomalous. HS Commerce pmts 1230788330738 (EUR727.50 deadline Oct25) + 1230645766331 (EUR728 deadline Nov11) NOT voided. Fix (NOT RUN): (1) Xero check Sofiia Apr-May 2026; (2) void HS Commerce pmts before Oct25; (3) UPDATE bookings SET confirmed=false WHERE id=17909. Last checked: 2026-07-06 UTC (18th check, hrly bot).**


**13 Jul MON UTC (23rd check, fresh DB): CONFIRMED UNCHANGED. BK17909 CANCELLED confirmed=STILL true amtPaid=0 (payments 17477+17478 deleted Jun17). BC24693 Renewal-AY-PM May25-Nov13 active=STILL true (anomaly on cancelled booking). HS Commerce payments 1230788330738 (EUR727.50) and 1230645766331 (EUR728.00): NOT voided. Void deadline Oct25=104 days, Nov11=121 days away. NEIL: Xero check Sofiia Apr-May 2026; if double-charged void both HS payments before Oct25. Last checked: 2026-07-13 UTC (23rd check).**

**15 Jul WED UTC (25th check, fresh DB):** BK17909 CANCELLED confirmed=STILL true amtPaid=0 amtOpen=727.5. BC24693 STILL active=true on cancelled booking. HubSpot payments 1230788330738 (EUR727.50) + 1230645766331 (EUR728.00): NOT voided. Void deadline Oct25=102 days, Nov11=119 days. UNCHANGED. Fix NOT RUN. Last checked: 2026-07-15 UTC.

**27th check Sat 18 Jul UTC (fresh DB): CONFIRMED UNCHANGED. BK17909 CANCELLED confirmed=STILL true amtPaid=0 amtOpen=EUR727.50. BC24693 Renewal-AY-PM May25-Nov13: STILL active=true on cancelled booking (anomaly). PMT17468 EUR1455.50 bk17849 type=STILL null. HS void deadlines: payment 1230788330738 by Oct25 (99d), payment 1230645766331 by Nov11 (116d). Fix NOT RUN. Last checked: 2026-07-18 SAT UTC (27th check).**