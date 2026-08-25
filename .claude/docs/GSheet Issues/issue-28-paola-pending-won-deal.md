# Issue 28 — Paola Sthefane Missias Moreira

Reporter: pg | Area: booking/class | Sheet row: 29

## Symptom

Appears in class but cannot be assigned because it says payment not received.

## Root cause

Student: s14456 Paola Sthefane Missias Moreira | Booking: bk17850 | HS deal: 501314632910

- bookings.status=PENDING confirmed=false amount_paid=null
- pmt17519 EUR 321.35 Bank May07 linked to bk17850 but amount_paid not updated
- HubSpot deal 501314632910 stage=WON amount=EUR 321.5
- Won-webhook NOT triggered — same pattern as issue 4 (Mohammed)
- Course c24624 Morning General May18-Jun05 ENDED (Jun08 today)

SIS to-be-assigned requires status=CONFIRMED. Student stuck in PENDING.

## Fix recipe (NOT YET RUN)

### Step 1 — Verify payment

SELECT id,booking_id,amount,method,payment_date FROM payments WHERE id=17519;
Expect: booking_id=17850 amount=321.35 Bank 2026-05-07

### Step 2 — Confirm booking

Check: SELECT id,status,confirmed,amount_total,amount_paid FROM bookings WHERE id=17850;

Fix (NOT YET RUN):
UPDATE bookings SET status='CONFIRMED', confirmed=true, amount_paid=321.35, confirmed_at=NOW() WHERE id=17850;

### Step 3 — Class assignment (Neil choice)

Course c24624 ended Jun05. If retrospective class record needed:
- Assign s14456/bk17850 via SIS to Morning General class for wb May18
- If records not needed: skip — booking confirmation alone closes the issue

## Risk

- Category: bookings + data-hygiene | Blast radius: 1 student
- Reversible: yes | Note: course ended, fix is for data integrity

## Status

Pending Neil confirmation — course ended Jun05 (4d ago), fix is now purely data-integrity.
Last checked: 2026-06-09 UTC (hourly bot)
Last checked: 2026-06-09 UTC hrly(run2): UNCHANGED. bk17850 still PENDING, confirmed=false, amount_paid=null. Course c24624 ended Jun05 (4d ago). pmt17519 EUR321.35 Bank May07 exists. Fix is now purely data-integrity (course ended). Await Neil: Step2 UPDATE bookings SET status=CONFIRMED, confirmed=true, amount_paid=321.35 WHERE id=17850 (NOT YET RUN).
Last checked: 2026-06-09 UTC hrly(11): LIVE CONFIRMED. bk17850 PENDING confirmed=false amtPaid=null. pmt17519 EUR321.35 Bank exists. c24624 ended Jun05 (4d). Accounting gap. Await Neil.
Last checked: 2026-06-09 UTC hrly(12): UNCHANGED. bk17850 PENDING confirmed=false amtPaid=null. pmt17519 EUR321.35 Bank no txId. c24624 ended Jun05(4d ago). Data-integrity fix only now. NEIL: run UPDATE bk17850.
Last checked: 2026-06-09 UTC hrly(13): UNCHANGED. bk17850 PENDING confirmed=false amtPaid=null. pmt17519 EUR321.35 Bank (no txId, no xeroPaymentId). c24624 ended Jun05(4d). Data-integrity fix only. Run Step2 SQL when ready.

Last checked: 2026-06-09 UTC hrly: UNCHANGED. bk17850 PENDING confirmed=false amtPaid=null. pmt17519 EUR321.35 Bank no txId. c24624 ended Jun05(4d). Data-integrity fix only. Run Step2.

Last checked: 2026-06-10 UTC hrly: UNCHANGED day5. bk17850 PENDING confirmed=false amtPaid=null amtTotal=321.35. c24624 ended Jun05(5d). Data-integrity only. NEIL: run UPDATE per recipe.

Last checked: 2026-06-10 UTC hrly6 D5: bk17850 PENDING confirmed=false amtPaid=null/321.35. pmt17519 EUR321.35 Bank exists. c24624 ended Jun05 (5 days ago). Course already finished — this is now a data-integrity-only cleanup. No student impact. NEIL: run SQL when convenient.
Last checked: 2026-06-10 UTC hrly10 D6: UNCHANGED. bk17850 PENDING confirmed=false amtPaid=null. pmt17519 EUR321.35 Bank(booking_id=17850 confirmed). c24624 ended Jun05(6d). Data-integrity only.
Last checked: 2026-06-10 UTC hrly11 D5: UNCHANGED. bk17850 PENDING confirmed=false amtPaid=null. c24624 ended Jun05(5d). pmt17519 EUR321.35 exists. Data-integrity only. NEIL: run Step2 UPDATE when convenient.

Last checked: 2026-06-11 UTC hrly(2) -- UNCHANGED D6. bk17850 PENDING conf=false amtPaid=null. pmt17519 EUR321.35 Bank May07 confirmed (raw query). Note: May07 not May23 - H column date corrected this run. c24624 ended Jun05(D6). Data-integrity fix only. Run Step2 SQL when ready.
Last checked: 2026-06-11 UTC hrly(12) D7: UNCHANGED. bk17850 PENDING confirmed=false amtPaid=null amtTotal=321.35. pmt17519 EUR321.35 Bank May07 hsPaymentId=1231805396201 xero=null. c24624 MORNING May18-Jun05 ENDED 6d ago. Course complete, booking still PENDING. Data-integrity only. Run UPDATE when convenient: UPDATE bookings SET status=CONFIRMED, confirmed=true, amount_paid=321.35 WHERE id=17850; (NOT RUN)
Last checked: 2026-06-11 UTC hrly(13) D7 UNCHANGED. bk17850 PENDING amtPaid=null amtTotal=321.35. pmt17519 EUR321.35 Bank May07 (hsId=1231805396201, bookingId=17850). c24624 Morning General May18-Jun05 ENDED 6d ago. Course complete. Data-integrity only, no live student impact. Low urgency.

Last checked: 2026-06-11 UTC hrly(this run) D7. CONFIRMED UNCHANGED. bk17850 PENDING confirmed=false amountPaid=null amountTotal=321.35. pmt17519 EUR321.35 Bank May07 (hsPaymentId=1231805396201, bookingId=17850). c24624 Morning May18-Jun05 ENDED 6d ago. Low priority. UPDATE bookings SET status=CONFIRMED, confirmed=true, amount_paid=321.35 WHERE id=17850 (NOT RUN).

Last checked: 2026-06-12 UTC hrly D8: UNCHANGED. bk17850 PENDING confirmed=false amtPaid=null amtTotal=321.35. pmt17519 EUR321.35 Bank May07 (hsPaymentId=1231805396201, xeroId=null). c24624 Morning May18-Jun05 ENDED 7d ago. Data-integrity cleanup only. UPDATE bookings SET status=CONFIRMED, confirmed=true, amount_paid=321.35 WHERE id=17850; (NOT RUN)

Last checked: 2026-06-12 UTC hrly#4 D8: SAME. bk17850 PENDING confirmed=false amtPaid=null amtTotal=321.35 updatedAt=Jun04. pmt17519 EUR321.35 Bank May07 (booking_id=17850 confirmed, hsPaymentId=1231805396201, xeroId=null). c24624 Morning General May18-Jun05 ENDED 7d ago. Course complete, no student impact. UPDATE bookings SET status=CONFIRMED, confirmed=true, amount_paid=321.35 WHERE id=17850; (NOT RUN — run when convenient)

Last checked: 2026-06-12 UTC hrly (this run) D8: CONFIRMED UNCHANGED. bk17850 PENDING confirmed=false amountPaid=null amountTotal=321.35 updatedAt=Jun04. pmt17519 EUR321.35 Bank May07 (hsPaymentId=1231805396201, xeroId=null, bookingId=17850). c24624 Morning General May18-Jun05 ENDED 7d ago. Data-integrity cleanup only. SQL (NOT RUN): UPDATE bookings SET status=CONFIRMED, confirmed=true, amount_paid=321.35 WHERE id=17850;
Last checked: 2026-06-13 UTC hrly SAT D9 — UNCHANGED. bk17850 PENDING confirmed=false amountPaid=null amountTotal=321.35 updatedAt=Jun04. pmt17519 EUR321.35 Bank May07 (hsPaymentId=1231805396201, xeroPaymentId=null, bookingId=17850). c24624 Morning General May18-Jun05 ENDED 8 days ago. Course complete, no live student impact. Data-integrity cleanup only, low urgency. SQL (NOT RUN): UPDATE bookings SET status=CONFIRMED, confirmed=true, amount_paid=321.35 WHERE id=17850;
**Last checked Jun13 SAT hrly6:** CONFIRMED UNCHANGED. bk17850 PENDING conf=false amtPaid=null updAt=Jun04(9d). pmt17519 EUR321.35 booking_id=17850 (LINKED) xeroPaymentId=null hubspotPaymentId=1231805396201. c24624 Morning General ended Jun05 (8d ago). Course complete, low priority data hygiene. SQL(NOT RUN): UPDATE bookings SET status=CONFIRMED, amount_paid=321.35 WHERE id=17850;


**Jun17 hrly (this run):** bk17850 UNCHANGED (PENDING confirmed=false amtPaid=null updatedAt=Jun04). pmt17519 EUR321.35 Bank May07 (bookingId=17850 linked, hubspotPaymentId=1231805396201, xeroPaymentId=null). bc24624 Morning General May18-Jun05 ended 12 days ago. Historical data-integrity cleanup only. SQL (NOT RUN): UPDATE bookings SET status=CONFIRMED, confirmed=true, amount_paid=321.35 WHERE id=17850;
Last checked: 2026-06-25 UTC hrly — bk17850 PENDING conf=false amtPaid=null UNCHANGED (updAt=Jun04=21d). pmt17519 EUR321.35 xeroId=null bkId=17850. bc24624 Morning May18-Jun05 active=true (20d ended). Historical low-pri. Fix NOT RUN.
**1 Jul UTC (11th check, fresh DB): CONFIRMED UNCHANGED. bk17850 STILL PENDING conf=false amtPaid=null (updAt=Jun04=27d stale). pmt17519 EUR321.35 xeroId=null hsId=1231805396201 bookingId=17850 (linked). bc24624 Morning May18-Jun05 active=STILL true (26d stale). Historical. Fix NOT RUN. Last checked: 2026-07-01 UTC (11th check, hrly bot).**

**2 Jul UTC (12th check, fresh DB): CONFIRMED UNCHANGED. bk17850 STILL PENDING conf=false amtPaid=null amtTotal=321.35. pmt17519 EUR321.35 type=null xeroId=null bkId=17850 linked. NOTE: type=null on pmt17519 — if system filters WHERE type IS NOT NULL for amount_paid calculation, that explains null. Also consider: UPDATE payments SET type='one_time_or_initial' WHERE id=17519 BEFORE the bookings UPDATE. bc24624 Morning May18-Jun05 ended Jun05 (27d ago, active=STILL true). Historical data-integrity cleanup only, no live student impact. Last checked: 2026-07-02 UTC (12th check, hrly bot).**
**6 Jul UTC (13th check, fresh DB): CONFIRMED UNCHANGED. bk17850 STILL PENDING confirmed=false amtPaid=null amtTotal=321.35. pmt17519 EUR321.35 type=STILL null xeroId=null hsId=1231805396201 bookingId=17850 (linked). bc24624 Morning May18-Jun5 STILL active=true (ended 31 days ago). Course complete, no live student impact. SQL (NOT RUN, low-pri): (1) UPDATE payments SET type=one_time_or_initial WHERE id=17519; (2) UPDATE bookings SET status=CONFIRMED, confirmed=true, amount_paid=321.35 WHERE id=17850; (3) deactivate bc24624. Last checked: 2026-07-06 UTC (13th check, hrly bot).**

**7 Jul UTC (14th check, fresh DB): CONFIRMED UNCHANGED. bk17850 STILL PENDING confirmed=false amtPaid=null amtTotal=321.35 (updAt=Jun04=33d stale). pmt17519 EUR321.35 type=null xeroPaymentId=null hubspotPaymentId=1231805396201 bookingId=17850 (linked). bc24624 Morning General May18-Jun05 active=STILL true (32 days past end date). Historical data-hygiene only. No live student impact. SQL (NOT RUN, low-pri): (1) UPDATE payments SET type='one_time_or_initial' WHERE id=17519; (2) UPDATE bookings SET status='CONFIRMED', confirmed=true, amount_paid=321.35 WHERE id=17850; (3) UPDATE booking_courses SET active=false WHERE id=24624. Last checked: 2026-07-07 UTC (14th check, hrly bot).**


**10 Jul UTC (15th check, fresh DB): NEW FINDING. bk17850 status changed PENDING->CONFIRMED on 8 Jul 2026 at 19:29 UTC. STILL: confirmed=false, amountPaid=null, amountTotal=321.35. pmt17519 EUR321.35 type=null xeroPaymentId=null hubspotPaymentId=1231805396201 bookingId=17850 (linked). bc24624 Morning General May18-Jun05 STILL active=true (35d past end). Status progression is positive. Minor cleanup items remain. SQL (NOT RUN, low-pri): (1) UPDATE payments SET type='one_time_or_initial' WHERE id=17519; (2) UPDATE bookings SET confirmed=true, amount_paid=321.35 WHERE id=17850; (3) UPDATE booking_courses SET active=false WHERE id=24624. Last checked: 2026-07-10 UTC (15th check).**

**15 Jul WED UTC (20th check, fresh DB):** BK17850 status=CONFIRMED (Jul8) confirmed=STILL false amtPaid=STILL null. PMT17519 EUR321.35 type=STILL null xeroPaymentId=null. BC24624 Morning May18-Jun5 STILL active=true (40d stale). Historical — student left. Low priority. UNCHANGED. Fix NOT RUN. Last checked: 2026-07-15 UTC.
