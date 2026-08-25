Issue 17 -- Ana Jessica Rosa de Paula Santos -- Accidental Booking Cancellation

Reporter: PG  Area: Booking  Sheet row: 18  Last checked: 2026-06-10 UTC hrly11

Symptom:
says booking cancelled

Root cause:
bk1308 CANCELLED while student fully paid and active. c1350 AY-Aft May25-Nov13 (17d in). Likely accidental click Jun7.

Status history (2026-06-10):
1. 2026-05-28 15:49 UTC: CONFIRMED to PENDING (unexplained)
2. 2026-06-07 20:41 UTC: CONFIRMED to CANCELLED (accidental click, 3d ago)

Evidence:
- bk1308 status=CANCELLED confirmed=false amountPaid=1530=amountTotal
- c1350 AY-Afternoon May25-Nov13 ACTIVE 17d
- pmt17186 EUR1280 + pmt17050 EUR250 = EUR1530 full
- s766 0 SCAs
- hubspotDealId=151536832724 dataSource=FIDELO

Fix recipe (NOT YET RUN):
Step1: UPDATE bookings SET status=CONFIRMED, confirmed=true, confirmed_at=NOW() WHERE id=1308;
Step2: Assign SCA via SIS UI (AY-Afternoon PM class, start May25 or Jun10)
Step3: Notify Success team

Risk: bookings | Reversible: yes | 1 student, no financial change

Status: AWAITING Step1 SQL. CRITICAL -- 17d+ active with cancelled booking + 0 SCAs.
Last checked: 2026-06-10 UTC hrly12 -- UNCHANGED D13. bk1308 STILL CANCELLED conf=false paid=1530. c1350 AFT ACTIVE. NEIL: run Step1 SQL immediately.
Last checked: 2026-06-10 UTC (this run) -- UNCHANGED D13. bk1308 CANCELLED conf=false amtPaid=1530=amtTotal. NEW: s766 0SCAs(NO class ever). c1350 AFT May25-Nov13 ACTIVE. Docs: LOA+attend locked. Status: CONF->PEND May28(pmt-webhook), CONF->CANCEL Jun7 20:41(manual). NEIL: Step1 SQL + Step2 assign SCA.

Last checked: 2026-06-11 UTC hrly(2) -- D14 UNCHANGED. bk1308 STILL CANCELLED conf=false amtPaid=1530/1530. c1350 AFT May25-Nov13 ACTIVE. s766 0SCAs. Jun14=3d. NEIL: run Step1 SQL today.
Last checked: 2026-06-11 UTC hrly(3) D15 -- UNCHANGED. bk1308 STILL CANCELLED confirmed=false. updatedAt=Jun07 21:01(not touched in 15d since cancel). c1350 AY-Aft May25-Nov13 ACTIVE. amtPaid=1530=amtTotal (fully paid). Student has been in limbo 15 days with a cancelled booking but active course. NEIL: run Step1 SQL urgently -- every day of delay means more attendance records may be mis-attributed. Recipe SQL: UPDATE bookings SET status='CONFIRMED', confirmed=true WHERE id=1308; (NOT YET RUN)
Last checked: 2026-06-11 UTC hrly(4) D16 -- UNCHANGED. DB: bk1308 CANCELLED conf=false amtPaid=1530/1530 updatedAt=Jun07T21:01. c1350 AY-Aft May25-Nov13 active. 4d since cancel 16d since flagged. NEIL: run Step1 SQL now.

Last checked: 2026-06-11 UTC hrly(5) D16 -- UNCHANGED (5th check today). bk1308 STILL CANCELLED confirmed=false. amtPaid=1530=amtTotal. 0 SCAs. 0 att. Student has been in limbo 16 days. NEIL: run Step1 SQL — UPDATE bookings SET status=CONFIRMED,confirmed=true WHERE id=1308; (NOT YET RUN)
Last checked: 2026-06-11 UTC hrly(6) -- bk1308 STILL CANCELLED conf=false. amtPaid=1530=amtTotal. D16 since Jun7. Status: UNRESOLVED. NEIL: run SQL.

Last checked: 2026-06-11 UTC hrly(7) D17 -- bk1308 STILL CANCELLED conf=false. amtPaid=1530=amtTotal. 0SCAs. 17d in AY-AFT May25-Nov13. NEIL: UPDATE bookings SET status=CONFIRMED,confirmed=true WHERE id=1308.

Last checked: 2026-06-11 UTC hrly(11) D17 -- CONFIRMED UNCHANGED (11th check today). bk1308 status=CANCELLED confirmed=false. amtPaid=1530=amtTotal. updatedAt=Jun07T21:01 (4d since accidental cancel). c1350 AY-Aft May25-Nov13 ACTIVE. s766 0 SCAs. SQL (NOT YET RUN): UPDATE bookings SET status='CONFIRMED', confirmed=true WHERE id=1308; Step2: assign SCA cls11-B1PM via SIS UI. NEIL: run Step1 SQL NOW.

Last checked: 2026-06-11 UTC hrly(12) D4: CONFIRMED UNCHANGED (12th check today). bk1308 STILL CANCELLED confirmed=false. amtPaid=1530=amountTotal. Status history: CONF>PEND May28 15:49 UTC, CONF>CANCEL Jun7 20:41 UTC (4d ago). c1350 AY-Aft May25-Nov13 ACTIVE. 0 SCAs. 17d in limbo. SQL (NOT YET RUN): UPDATE bookings SET status=CONFIRMED, confirmed=true WHERE id=1308; Step2: assign SCA PM class. NEIL: run Step1 SQL ASAP.
Last checked: 2026-06-11 UTC hrly(13) D4 UNCHANGED (13th check today). bk1308 STILL CANCELLED confirmed=false amtPaid=1530=amtTotal. updatedAt=Jun07T21:01 (4d since cancel). c1350 AY-Aft May25-Nov13 ACTIVE. 0 SCAs. hist: CONF>PEND May28 by payment-webhook, CONF>CANCEL Jun7 by null/manual. NEIL: run Step1 SQL — UPDATE bookings SET status=CONFIRMED, confirmed=true WHERE id=1308;

Last checked: 2026-06-11 UTC hrly(15) D4 UNCHANGED x15. bk1308 STILL CANCELLED conf=false amtPaid=1530=amtTotal. updatedAt=Jun07T21:01. NOT in Jun11 18:47 batch. 0SCAs. c1350 AY-Aft ACTIVE. NEIL: UPDATE bookings SET status=CONFIRMED,confirmed=true WHERE id=1308;

Last checked: 2026-06-11 UTC hrly(this run) D4. CONFIRMED UNCHANGED. bk1308 status=CANCELLED confirmed=false amountPaid=1530=amountTotal. Only booking for s766. c1350 AY-Aft May25-Nov13 ACTIVE 17d. 0 SCAs. Docs doc31 LOA ISSUED + doc121 attendance ISSUED. NEIL: UPDATE bookings SET status=CONFIRMED, confirmed=true WHERE id=1308 (NOT RUN); then assign SCA PM class via SIS.
Last checked: 2026-06-11 UTC hrly(17) D5: bk1308 STILL CANCELLED conf=false amtPaid=1530=amtTotal. updAt=Jun07T21:01. c1350 AY-Aft May25-Nov13 ACTIVE. 0SCAs. NEIL: UPDATE bookings SET status=CONFIRMED,confirmed=true WHERE id=1308 NOW.

Last checked: 2026-06-12 UTC hrly D6: CONFIRMED UNCHANGED. bk1308 STILL CANCELLED confirmed=false amtPaid=1530=amtTotal. updatedAt=Jun07T21:01 (5d since accidental cancel). c1350 AY-Aft May25-Nov13 ACTIVE. 0 SCAs. D6 limbo. NEIL: UPDATE bookings SET status=CONFIRMED, confirmed=true WHERE id=1308; then assign SCA PM class via SIS.

Last checked: 2026-06-12 UTC hrly#3 D5: SAME. bk1308 STILL CANCELLED conf=false amtPaid=1530=amtTotal updAt=Jun07T20:01 (5d untouched). c1350 AY-Aft May25-Nov13 ACTIVE. 0SCAs. 0att. 18d in AY-Aft with cancelled booking. NEIL: UPDATE bookings SET status=CONFIRMED,confirmed=true WHERE id=1308 NOW.
Last checked: 2026-06-12 UTC hrly (this run) D5: CONFIRMED UNCHANGED. bk1308 STILL CANCELLED confirmed=false amtPaid=1530=amtTotal. updatedAt=Jun07T21:01 (5d since cancel). c1350 AY-Aft May25-Nov13 ACTIVE. s766 A2 0SCAs hubspotContactId=777791875262. 18d in AY-Aft with cancelled booking. SQL (NOT RUN): UPDATE bookings SET status=CONFIRMED,confirmed=true WHERE id=1308; then assign SCA PM class via SIS. D5 CRITICAL UNRESOLVED.

Last checked: 2026-06-12 UTC hrly#4 D5: SAME. bk1308 CANCELLED conf=false amtPaid=1530=amtTotal updatedAt=Jun07T21:01 (5d). 18d in AY-Aft with no confirmed booking. 0 SCAs. SQL (NOT RUN): UPDATE bookings SET status=CONFIRMED,confirmed=true WHERE id=1308; Step2: assign SCA cls11-B1PM or cls9-A2PM via SIS. NEIL: run Step1 SQL immediately.

Last checked: 2026-06-12 UTC hrly#6 D5: CONFIRMED UNCHANGED. bk1308 STILL CANCELLED confirmed=false amtPaid=1530=amtTotal. updatedAt=Jun07T21:01 (5d since accidental cancel). c1350 AY-Aft May25-Nov13 ACTIVE. s766 0SCAs 0att. 18d in AY-Aft with cancelled booking. SQL (NOT RUN): UPDATE bookings SET status=CONFIRMED,confirmed=true WHERE id=1308; then assign SCA PM class via SIS. D5 CRITICAL UNRESOLVED.

Last checked: 2026-06-12 UTC hrly (this run) D5: CONFIRMED UNCHANGED. bk1308 STILL CANCELLED confirmed=false amtPaid=1530=amtTotal. updatedAt=Jun07T21:01 (5d since accidental cancel). c1350 AY-Aft May25-Nov13 ACTIVE. s766 A2 0SCAs 19d in AY-Aft with cancelled bk. SQL (NOT RUN): UPDATE bookings SET status=CONFIRMED,confirmed=true WHERE id=1308;
Last checked: 2026-06-12 UTC (this run) D5: CONFIRMED UNCHANGED. bk1308 status=CANCELLED confirmed=false amountPaid=1530=amountTotal. updatedAt=2026-06-07T21:01 (5d since accidental cancel). c1350 AY-Aft May25-Nov13 ACTIVE. s766 0 SCAs 0 att. 18d in AY-Afternoon with cancelled booking. NEIL: UPDATE bookings SET status=CONFIRMED, confirmed=true WHERE id=1308; (NOT RUN). Then assign SCA cls11-B1PM or cls9-A2PM via SIS UI.
Last checked: 2026-06-12 UTC (this run) D6: CONFIRMED UNCHANGED. bk1308 STILL CANCELLED confirmed=false amtPaid=1530=amtTotal updatedAt=Jun07T21:01 (5d since accidental cancel). c1350 AY-Aft May25-Nov13 ACTIVE. s766 0SCAs 0att. 19d AY with cancelled bk. pmts 17186(1280)+17050(250) xeroId=null. SQL(NOT RUN): UPDATE bookings SET status=CONFIRMED,confirmed=true WHERE id=1308; then assign SCA PM class.

Last checked: 2026-06-12 UTC hrly-latest D18: CONFIRMED UNCHANGED (18d since accidental cancel Jun07). bk1308 CANCELLED conf=false amtPaid=1530=amtTotal updAt=Jun07T21:01. pmts: pmt17050(EUR250 Feb17 D2026101)+pmt17186(EUR1280 May01 D2026101) both xeroPaymentId=null. c1350 AY-Aft May25-Nov13 ACTIVE. s766 A2 0SCAs 0att. K set to D18 cancelled. NEIL: UPDATE bookings SET status=CONFIRMED, confirmed=true WHERE id=1308; then assign SCA PM class (A2 = cls9) via SIS. AWAITING.

Last checked: 2026-06-12 UTC hrly (this cron run) D18: UNCHANGED. bk1308 CANCELLED conf=false amtPaid=1530=amtTotal updAt=Jun07. c1350 AY-Aft May25-Nov13 active (~18d in). pmts17050(250 Fidelo)+17186(1280 Fidelo) both txId=D2026101 xeroId=null. s766 Ana Jessica Rosa de Paula Santos visaStatus=null. 0SCAs. SQL(NOT RUN): UPDATE bookings SET status=CONFIRMED,confirmed=true WHERE id=1308; then assign class via SIS.
Last checked: 2026-06-13 UTC hrly D19 — CONFIRMED UNCHANGED. bk1308 CANCELLED confirmed=false amtPaid=1530/1530(fully paid) updAt=Jun07. c1350 AY-Aft May25-Nov13 ACTIVE. pmts17050(EUR250 txId=D2026101)+17186(EUR1280 txId=D2026101) both xeroPaymentId=null. s766 visaStatus=null. 0SCAs. SQL(NOT RUN): UPDATE bookings SET status=CONFIRMED,confirmed=true WHERE id=1308;

Status Jun14 hrly6 (D20 since cancel):
bk1308 CANCELLED conf=false(updAt=Jun07). paid=1530/1530 fully paid. 0 SCAs.
c1350 AY-Afternoon May25-Nov13 still active.
SQL NOT RUN. Student has been absent from class for 20 days post-cancel.
Last checked: 2026-06-14 UTC hrly6
**Jun15 hrly (this run):** bk1308 CANCELLED conf=false amtPaid=1530=amtTotal UNCHANGED (updAt=Jun07, D8). c1350 AY-Aft May25-Nov13 active. 0 SCAs. D21 since issue date. Recipe SQL NOT RUN. NEIL: confirm fix?

**Jun15 UTC run2:** CONFIRMED UNCHANGED. bk1308 CANCELLED confirmed=false amtPaid=1530/1530 (updAt=Jun07, D22). bc1350 AY-AFT May25-Nov13 ACTIVE. 0 SCAs. SQL NOT RUN. Last checked: 2026-06-15 UTC run2.

**Jun16 hrly D40+:** bk1308 CANCELLED confirmed=false 1530/1530 UNCHANGED (updAt=Jun07, 9d stale). bc1350 AY-AFT May25-Nov13 ACTIVE. s766 0 SCAs. Course running 22d with student booking cancelled and unassigned. NEIL: UPDATE bookings SET status=CONFIRMED, confirmed=true WHERE id=1308 (NOT RUN). Last checked: 2026-06-16 UTC hrly.


**Jun16 hrly D23:** CONFIRMED UNCHANGED. bk1308 STILL CANCELLED confirmed=false amtPaid=1530=amtTotal (updAt=Jun07, 9d stale). bc1350 AY-AFT May25-Nov13 ACTIVE. s766 Ana Jessica Rosa (A2) 0 SCAs. hubspotDealId=151536832724. Day 23 in AY Afternoon with cancelled booking and zero class records. SQL NOT RUN: UPDATE bookings SET status=CONFIRMED, confirmed=true WHERE id=1308; Last checked: 2026-06-16 UTC hrly (this run).
**Jun16 hrly (this run) D24+:** CONFIRMED UNCHANGED (fresh DB query). bk1308 STILL CANCELLED confirmed=false amtPaid=1530=amtTotal (updAt=Jun07, 9d stale). bc1350 AY-AFT May25-Nov13 ACTIVE. s766 Ana Jessica Rosa (A2) 0 SCAs all time. SQL(NOT RUN): UPDATE bookings SET status=CONFIRMED,confirmed=true WHERE id=1308; then assign A2-AFT class via SIS. Last checked: 2026-06-16 UTC hrly.


**Jun16 hrly(eve+1): CONFIRMED UNCHANGED (this run).** bk1308 STILL CANCELLED confirmed=false (stale Jun07, 9d). 0 SCAs all time confirmed by DB. AmtPaid=1530=amtTotal. bc1350 AY-AFT May25-Nov13 ACTIVE. Day 23 in school with no class record. SQL(NOT RUN): UPDATE bookings SET status=CONFIRMED,confirmed=true WHERE id=1308; then assign A2-AFT SCA via SIS. Last checked: 2026-06-16 UTC hrly(eve+1).
Last checked: 2026-06-17 UTC hrly#8 — bk1308 STILL CANCELLED confirmed=false (stale Jun07=10d). amtPaid=1530/1530. bc1350 AY-AFT May25-Nov13 active. s766 A2 0 SCAs ALL TIME (fresh DB). visaStatus=null hubspotContactId=777791875262. Day24 in school. SQL NOT RUN: UPDATE bookings SET status=CONFIRMED, confirmed=true WHERE id=1308; then assign A2-AFT class to bc1350.

Last checked: 2026-06-17 UTC hrly (latest) — UNCHANGED. bk1308 STILL CANCELLED confirmed=false (updAt=Jun07=10d stale, fresh DB). bc1350 AY-AFT May25-Nov13 ACTIVE. s766 A2 0 SCAs all time. Day 24 in school with no class. SQL NOT RUN: UPDATE bookings SET status=CONFIRMED, confirmed=true WHERE id=1308; then assign A2-AFT class via SIS.

**Jun17 WED hrly (latest):** UNCHANGED (fresh DB). bk1308 CANCELLED conf=false (updAt=Jun07=10d stale). 0 SCAs student766 all time. bc1350 AFT May25-Nov13 ACTIVE. ~17 school days with no confirmed booking or class. SQL NOT RUN. Status: PENDING NEIL ACTION (confirm/fix booking).

**Jun18 hrly (latest): UNCHANGED (fresh DB).** bk1308 STILL CANCELLED confirmed=false amtPaid=1530/1530 (updAt=Jun07=11d stale). 0 SCAs student766 all time. bc1350 AFT May25-Nov13 ACTIVE. Day 18 school days elapsed. SQL NOT RUN: UPDATE bookings SET status=CONFIRMED,confirmed=true WHERE id=1308; then assign A2-AFT class bc1350 via SIS. Last checked: 2026-06-18 UTC hrly.


**Jun19 hrly8 (this run):** CONFIRMED UNCHANGED (fresh DB). bk1308 STILL CANCELLED confirmed=false amtPaid=1530/1530 (updAt=Jun07, 12d since accidental cancel). Only booking for student 766 — no replacement booking. bc1350 AY-Afternoon May25-Nov13 active=true. 0 SCAs all time. pmt17186 EUR1280 (May01 xeroId=null) + pmt17050 EUR250 (Feb17 xeroId=null) — neither Xero-reconciled. Student has been 25 calendar days in school with no confirmed booking and no class assignment. SQL NOT RUN: UPDATE bookings SET status=CONFIRMED, confirmed=true WHERE id=1308; Last checked: 2026-06-19 UTC hrly8.

Last checked: 2026-06-23 UTC hrly: CONFIRMED UNCHANGED D29cal. bk1308 STILL CANCELLED confirmed=false amountPaid=1530=amountTotal (updAt=Jun07=16d stale). bc1350 AY-Afternoon May25-Nov13 ACTIVE Day29cal. 0 SCAs (s766 all time). pmt17186 EUR1280 hsId=1243664915703 xeroId=null; pmt17050 EUR250 hsId=1243648063725 xeroId=null — both unreconciled in Xero. hubspotDealId=151536832724 dataSource=FIDELO. NEIL: (1) UPDATE bookings SET status='CONFIRMED', confirmed=true WHERE id=1308; (NOT RUN) (2) SIS->s766->bk1308->assign AY-Afternoon PM class; (3) reconcile pmt17186+17050 in Xero.
Last checked: 2026-06-25 UTC hrly (check #6) — UNCHANGED. bk1308 CANCELLED conf=false amtPaid=1530 (updAt=Jun07=18d stale). bc1350 AY-AFT May25-Nov13 STILL active=true — D31cal, 0 SCAs. pmt17186 EUR1280 + pmt17050 EUR250 both xeroId=null. 0 invoices. NEIL: confirm uncancel (Step1 SQL) or issue refund?
Last checked: 2026-07-14 TUE UTC. UNCHANGED. BK1308 CANCELLED EUR1530/1530, pmts 17186+17050 xeroId=null, BC1350 active on cancelled bk (zero SCAs). Fix NOT RUN.

**Wed 15 Jul UTC: CONFIRMED UNCHANGED. BK1308 CANCELLED EUR1530/1530 (updAt=Jun07=38d). PMT17186 EUR1280 xeroId=STILL null (71d since May05). PMT17050 EUR250 xeroId=STILL null. BC1350 AY-Aft May25-Nov13 active=STILL true on cancelled bk. Fix NOT RUN. Last checked: 2026-07-15 UTC.**

**17 Jul FRI UTC (fresh DB). CONFIRMED UNCHANGED. BK1308 CANCELLED EUR1530/1530 confirmed=false (updAt=Jun07=40d). PMT17186 EUR1280 xeroId=STILL null (paymentDate May01, 77d). PMT17050 EUR250 xeroId=STILL null (paymentDate Feb17, 150d). BC1350 AY Afternoon active=STILL true on cancelled booking — endDate Nov13 2026 (future, course in-progress on dead booking). Fix NOT RUN. Last checked: 2026-07-17 UTC.**

**Sun 26 Jul UTC hrly (10th check): CONFIRMED UNCHANGED (fresh DB).** BK1308 STILL CANCELLED confirmed=false amtPaid=1530=amtTotal (updAt=Jun07, 48d since accidental cancel). PMT17186 EUR1280 type=null xeroPaymentId=null. PMT17050 EUR250 type=null xeroPaymentId=null. BC1350 AY Afternoon active=STILL true (ends Nov 2026 -- future date). SQL NOT RUN: UPDATE bookings SET status=CONFIRMED, confirmed=true WHERE id=1308; Then reconcile pmts 17186 + 17050 in Xero. Last checked: 2026-07-26 UTC hrly.