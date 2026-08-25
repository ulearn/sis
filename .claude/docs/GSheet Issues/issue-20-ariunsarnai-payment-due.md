# Issue 20 -- Ariunsarnai Batbayar -- PENDING Booking D61 Unpaid

**Reporter:** PG  **Area:** Booking/Class  **Sheet row:** 21  **Last checked: 2026-07-06 UTC (17th check) — BK1605 STILL PENDING paid=0/1509. BC1791 AY-Ren-AM Apr13-Oct23 active. 0 SCAs for student 1047. Day 85 without class assignment. BK1605 last updated Jun23 (13d stale). HS deal 502951083215 needs Won stage.

## Symptom
Not appearing in to be assigned - says payment due.

## Root cause
bk1605 is PENDING (not CONFIRMED) because EUR 1509 has not been received and HubSpot deal 502951083215 is still at ENROLMENT stage (not WON). Student has been attending (presumably) since Apr 13 -- 58 days -- with no payment and a pending booking.

## Evidence (Jun 10 2026)
- bk1605 status=PENDING confirmed=false
- amountPaid=0 amountTotal=1509
- payments: [] (ZERO payments)
- c1791 Academic Year Renewal Morning 2026-04-13 to 2026-10-02 (58 days in)
- HS deal 502951083215: stage=ENROLMENT (not WON)
- student s1047: email=ariunsarnai0125@gmail.com phoneMobile=null

## Fix recipe (NOT YET RUN)

### Option A -- Payment arrives / deal moves to WON (preferred)
- Student or agency pays EUR 1509
- Once HubSpot deal 502951083215 is marked WON: webhook auto-fires and confirms bk1605
- No manual DB change needed

### Option B -- Manual SQL confirm (if payment confirmed but webhook missed)
~~~sql
UPDATE bookings SET status = CONFIRMED, confirmed = true, confirmed_at = NOW(), amount_paid = 1509 WHERE id = 1605; (NOT RUN)
~~~

### Option C -- Cancel if no payment expected
- Contact student: ariunsarnai0125@gmail.com
- If student not enrolled or withdrawing: UPDATE bookings SET status=CANCELLED WHERE id=1605 (NOT RUN)

### Immediate action
- Email/WhatsApp student at ariunsarnai0125@gmail.com re EUR 1509 outstanding
- Check HubSpot deal 502951083215 for agency contact info

## Risk
- Category: money/bookings
- Reversible: Yes
- Blast radius: single student. EUR 1509 outstanding.
- D61 unpaid with active course is a significant financial/compliance risk

## Status
D61 unpaid. Contact student urgently or cancel booking.

Last checked: 2026-06-10 UTC hrly11 D62 -- bk1605 PENDING confirmed=false 0/1509 EUR. 0 payments. c1791 AY Morn Apr13-Oct02 (58d in). HS deal 502951083215 stage=ENROLMENT (not WON). Student: ariunsarnai0125@gmail.com. NEIL: contact student or cancel booking.
Last checked: 2026-06-11 UTC hrly D63 -- UNCHANGED. bk1605 PENDING confirmed=false 0/1509 EUR. 0 payments. c1791 AY Morn Apr13-Oct02 (59d in). HS deal 502951083215 stage=ENROLMENT (not WON). Student: ariunsarnai0125@gmail.com. NEIL: contact student re EUR1509 or cancel booking.

Last checked: 2026-06-11 UTC hrly(2) -- UNCHANGED D64. bk1605 PENDING conf=false 0/1509 EUR. 0 pmts. c1791 AY Morn Apr13-Oct02. HS deal 502951083215 ENROLMENT (not WON). Student: ariunsarnai0125@gmail.com. NEIL: contact student re EUR1509 outstanding or cancel booking.

Last checked: 2026-06-11 UTC hrly (HS verified) -- HS deal 502951083215 CONFIRMED ENROLLED stage (109570243), amount=EUR1509, lastModified=2026-06-10 (yesterday). bk1605 PENDING created=2026-04-06 updated=2026-06-04. c1791 AY Renewal Morning Apr13-Oct02. D66 since booking created. Someone touched the HS deal yesterday (Jun10) but it remains ENROLLED (not WON). NEIL: check deal 502951083215 activity on Jun10 -- was there an attempt to progress it? Mark WON to trigger SIS confirmation webhook.

Last checked: 2026-06-11 UTC hrly(4) D66 -- bk1605 PENDING 0/1509 updatedAt=Jun04(7d). HS deal 502951083215 ENROLLED lastMod=Jun10(touched yest-unconfirmed why). NEIL: check deal Jun10 activity; mark WON to trigger SIS webhook.

Last checked: 2026-06-11 UTC hrly(5) D66 -- bk1605 STILL PENDING 0/1509. 0pmts 0SCAs. c1791 AY-Renew-MORN Apr13-Oct02. hsDealId=502951083215 ENROLLED lastMod=Jun10. NEIL: check Jun10 deal; mark WON to fire webhook.

Last checked: 2026-06-11 UTC hrly(11) D67 -- CONFIRMED UNCHANGED. bk1605 PENDING confirmed=false 0/1509 updatedAt=Jun04 (7d stale). 0 payments. c1791 AY Renewal Morning Apr13-Oct02. s1047 0 SCAs. HS deal 502951083215 ENROLLED stage, lastModified=Jun10 (touched yesterday — unknown activity). D67 since booking created (~Apr06). NEIL: (A) check HS deal 502951083215 for Jun10 activity — was someone trying to progress it?; (B) if payment confirmed: mark WON to fire webhook OR run manual SQL; (C) if no payment expected: cancel bk1605 and notify student ariunsarnai0125@gmail.com.

Last checked: 2026-06-11 UTC hrly(13) D67 -- NEW PIPELINE DETAIL: HS deal 502951083215 in B2B Sales pipeline (not Direct Sales). Deal name: Sarantuya Taivankhuu - Ariunsarnai Batbayar (agency-linked). Stage: ENROLMENT (id=109570243). B2B Sales WON stage = 104175589. CONTRACT stage = 104175588. To fire SIS webhook: advance deal to WON in B2B Sales pipeline. bk1605 PENDING 0/1509, 0 payments, 0 SCAs, updatedAt=Jun04.
Last checked: 2026-06-11 UTC hrly(14) D67 -- NEW: Jun10 14:54 update confirmed as NOTE engagement (not stage change). Deal property history: stage 109570243 (ENROLMENT) set ONCE on May18 creation, never advanced. B2B pipeline confirmed: ENROLMENT(109570243,0.8)->CONTRACT(104175588,0.9)->WON(104175589,1.0). bk1605.hubspotDealId=502951083215 MATCHES. NEIL: advance deal to stage 104175589(WON) to auto-confirm bk1605, OR run manual SQL.

Last checked: 2026-06-11 UTC hrly(15) D68 NOTABLE: bk1605.updatedAt=Jun11T18:47(same-second as bk18151 Saikhantes — batch op touched both). Status UNCHANGED PENDING 0/1509. c1791 AY-Morn Apr13-Oct02. Deal 502951083215 ENROLLED not WON. NEIL: check 18:47 batch; advance deal to WON(104175589) OR manual SQL confirm.
Last checked: 2026-06-11 UTC hrly(17) D68: bk1605 UNCHANGED PENDING 0/1509. updAt=Jun11T17:47(batch). HS deal 502951083215 ENROLMENT not WON. 0SCAs s1047. NEIL: advance deal to WON(stage 104175589) or manual SQL confirm.

Last checked: 2026-06-12 UTC hrly D69: CONFIRMED UNCHANGED. bk1605 STILL PENDING 0/1509. updAt=Jun11T17:47(batch). 0 payments. 0 SCAs. c1791 AY Renewal Morning Apr13-Oct02 ACTIVE. hubspotDealId=502951083215 ENROLMENT stage (not WON). B2B pipeline WON stage=104175589. NEIL: advance HS deal 502951083215 to stage 104175589(WON) to auto-confirm bk1605, OR run manual SQL if payment already received.

Last checked: 2026-06-12 UTC hrly#4 D70: SAME. bk1605 PENDING confirmed=false 0/1509 updAt=Jun11T17:47. 0 payments 0 SCAs. c1791 AY-Renew-MORN Apr13-Oct02 ACTIVE. HS deal 502951083215 ENROLMENT (not WON). B2B WON=104175589. NEIL: advance HS deal to WON(104175589) to fire webhook, OR if payment received run: UPDATE bookings SET status=CONFIRMED,confirmed=true,amount_paid=1509 WHERE id=1605 (NOT RUN).

Last checked: 2026-06-12 UTC hrly#6 D71: CONFIRMED UNCHANGED. bk1605 PENDING confirmed=false student_id=1047 amount_total=1509 amount_paid=0 amount_open=1509. hubspot_deal_id=502951083215. 0 payments, 0 SCAs. HS deal still ENROLMENT stage, not WON. NEIL: advance deal 502951083215 to WON (pipeline 104175589) to trigger webhook, OR manually confirm+create SCA. D71 no action.

Last checked: 2026-06-12 UTC hrly (this run) D71: CONFIRMED UNCHANGED. bk1605 PENDING confirmed=false 0/1509 updAt=Jun11T17:47. 0pmts 0SCAs. c1791 AY-Renew-MORN Apr13-Oct02 ACTIVE. s1047 B2 hubId=780356561119. HS deal 502951083215 ENROLMENT (not WON). NEIL: advance deal to WON(104175589) or manual SQL confirm.
Last checked: 2026-06-12 UTC (this run) D72: CONFIRMED UNCHANGED. bk1605 status=PENDING confirmed=false amountPaid=0 amountTotal=1509. c1791 AY-Renewal Morning Apr13-Oct2 ACTIVE. 0 payments. 0 SCAs. 0 attendance records. updatedAt=2026-06-11 (yesterday). 72 days pending with zero payment. HS deal 502951083215 still ENROLMENT stage. NEIL: contact student ariunsarnai0125@gmail.com re EUR 1509 outstanding OR check HS deal status. If no payment coming: cancel bk1605.
**Jun15 hrly (this run):** bk1605 PEND 0/1509 updAt=Jun11 UNCHANGED. c1791 AY-Ren-Morn Apr13-Oct02 ongoing. 0 SCAs. D78 pending. HS deal 502951083215 still not WON per DB (bk1605 still PENDING). NEIL: move HS deal to WON.

**Jun15 UTC run2:** CONFIRMED UNCHANGED. bk1605 PEND 0/1509 (updAt=Jun11, D79). bc1791 AY-Ren-Morn Apr13-Oct02 ACTIVE. 0 SCAs. HS deal 502951083215 NOT WON. Last checked: 2026-06-15 UTC run2.

**Jun16 hrly D80:** bk1605 PENDING 0/1509 UNCHANGED (updAt=Jun11, 5d stale). bc1791 AY-Ren-Morn Apr13-Oct02 ACTIVE. 0 SCAs s1047. hubspotDealId=502951083215 NOT WON. NEIL: WIN deal 502951083215 in HubSpot to trigger webhook. Last checked: 2026-06-16 UTC hrly.

Last checked: 2026-06-17 UTC hrly#8 — bk1605 STILL PENDING confirmed=false 0/1509 (stale Jun11=6d). bc1791 AY-Ren-Morn Apr13-Oct02 ACTIVE. 0 SCAs ALL TIME (fresh DB). HubSpot deal 502951083215 STILL at ENROLMENT not WON. s1047 Ariunsarnai Batbayar B2 Day 66 in school. No action. NEIL: move HubSpot deal 502951083215 to WON stage.


**Jun20 SAT hrly#6:** bk1605 STILL PENDING confirmed=false 0/1509 (updAt=Jun11=9d stale, fresh DB). bc1791 AY-Renewal-Morning Apr13-Oct02 (D68cal). 0 SCAs, 0 att (s1047 confirmed fresh DB). HS deal 502951083215 NOT WON. NEIL: advance deal to WON (104175589) in HubSpot B2B pipeline to auto-confirm bk1605. Sheet row 21 H-K updated. Last checked: 2026-06-20 UTC hrly#6.

Last checked: 2026-06-23 UTC hrly: CONFIRMED UNCHANGED D71cal. bk1605 PENDING confirmed=false amountPaid=0/1509 (updAt=Jun11=12d stale). bc1791 AY-Renewal-Morning Apr13-Oct02 ACTIVE Day71cal. 0 SCAs (s1047 all time). 0 payments on bk1605. HS deal 502951083215 STILL at ENROLMENT stage (NOT WON). NEIL: advance HS deal 502951083215 to WON stage in B2B Sales pipeline — webhook will auto-confirm bk1605 + enable class assignment. If payment not received yet, coordinate with student/agency before advancing.
Last checked: 2026-06-26 UTC hrly (7th check): UNCHANGED. bk1605 PENDING conf=false 0/1509 (updAt=Jun23=3d). bc1791 AY-Morn-Renewal Apr13-Oct23 active. Day 74 cal. 0 SCAs, 0 pmts. HS deal 502951083215 NOT WON. Neil: advance deal to WON stage (104175589).
**Jun27 SAT UTC (9th check, fresh DB): UNCHANGED. bk1605 STILL PENDING conf=false 0/1509 (updAt=Jun23=4d). bc1791 AY-Morn-Renewal Apr13-Oct23 active fee=2150. 0 pmts. 0 SCAs. Day 76 in school no class. Neil: advance HS deal 502951083215 to WON stage (104175589). Last checked: 2026-06-27 SAT UTC hrly (9th check).**

**Jun28 SUN UTC (10th check, fresh DB): CONFIRMED UNCHANGED. bk1605 STILL PENDING conf=false EUR 0/1509 (updAt=Jun23=5d stale). bc1791 Academic Year Renewal Morning Apr13-Oct23 active fee=2150. 0 payments. 0 SCAs for bc1791. serviceStart=Apr13 = Day 77 in school with no class assignment. UNCHANGED. Last checked: 2026-06-28 UTC.**


**4 Jul SAT UTC (15th check, fresh DB): CONFIRMED UNCHANGED. bk1605 STILL PENDING confirmed=false amountPaid=0 amountTotal=1509 (updAt=Jun23=11d stale). bc1791 Academic Year Renewal Morning Apr13-Oct23 active fee=2150. 0 payments on booking. 0 SCAs (student 1047, all time). D82 since bc1791 start (Apr 13). HS deal 502951083215 B2B pipeline — NOT WON (stage WON=104175589). Neil: advance deal to WON in HubSpot to auto-confirm bk1605, or contact student ariunsarnai0125@gmail.com re EUR 1509 outstanding. Last checked: 2026-07-04 UTC (15th check, hrly bot).**

**6 Jul UTC (18th check, fresh DB): CONFIRMED UNCHANGED. Booking 1605 (Ariunsarnai Batbayar, student 1047): status=PENDING, confirmed=false, EUR 0/1509, updated_at=Jun23 (13 days stale). Booking course 1791 (Academic Year Renewal Morning, Apr13–Oct23 2026): active=true, fee=EUR 2150. Zero payments on booking 1605. Zero class assignments for student 1047 (all time). Day 85 since course start. HubSpot deal 502951083215 (B2B pipeline) still not at Won stage (104175589). NEIL: advance HS deal 502951083215 to Won in HubSpot B2B pipeline — webhook auto-confirms bk1605 and enables class assignment. Or contact student ariunsarnai0125@gmail.com re EUR 1509 outstanding. Last checked: 2026-07-06 UTC (18th check, hrly bot).**

**7 Jul TUE UTC (19th check, fresh DB): CONFIRMED UNCHANGED. bk1605 STILL PENDING confirmed=false EUR 0/1509 (updAt=Jun23, 14 days stale). bc1791 Academic Year Renewal Morning Apr13-Oct23 2026 active fee=EUR 2150. Zero payments. Zero SCAs for student 1047 (Day 86 unassigned). HubSpot deal 502951083215 B2B pipeline still not Won (stage 104175589). NEIL: advance HS deal 502951083215 to Won in B2B pipeline to auto-confirm bk1605 and enable class assignment. Last checked: 2026-07-07 UTC (19th check, hrly bot).**


**10 Jul 2026 UTC (22nd check, fresh DB + HubSpot API): CONFIRMED UNCHANGED. BK1605 (Ariunsarnai Batbayar, student 1047): STILL PENDING, confirmed=false, EUR 0/1509, updated_at=2026-06-23 (17 days stale). BC1791 Academic Year Renewal Morning Apr13-Oct23 2026 active fee=EUR 2150, ILEP=0318/0011. Zero SCAs for student 1047 all time. HubSpot deal 502951083215 API call confirmed: dealstage=STILL 109570243 (ENROLMENT), NOT Won (104175589). Last modified 2026-07-08T14:42:55 UTC (2 days stale). Day 88 since course start — 88 days of untracked attendance and zero payment. NEIL: check what changed in HS deal on Jul8, then advance deal to Won (104175589) in B2B pipeline to trigger auto-confirm webhook. Last checked: 2026-07-10 UTC (22nd check, hrly bot).**

---
## 23rd check — 10 Jul 2026 UTC

UNCHANGED (fresh DB):
- BK1605 (Ariunsarnai Batbayar, s1047): status=PENDING, confirmed=false, amount_total=1509, amount_paid=0 — zero payments on file
- BC1791 (Academic Year Renewal Morning, Apr13-Oct23 2026): active=true, ILEP code=0318/0011
- Zero class assignments on bc1791 all time
- No payments on booking 1605
- HubSpot deal 502951083215: still in Enrolment stage (not Won)
- Day 88 since course start (Apr 13 to Jul 10 = 88 calendar days)

Status: Student appears to be attending school (active bc, ILEP set) but deal never advanced to Won, so no payment flow triggered. No invoice has been sent.

Fix (NOT YET RUN): Advance HubSpot deal 502951083215 to Won in B2B pipeline stage 104175589.
Last checked: 2026-07-10 UTC (hourly bot, 23rd check).

---
## 11 Jul 2026 SAT UTC (25th check)

UNCHANGED. Booking 1605 STILL PENDING (89 days, no payments, no SCAs). BC1791 (AY-Renewal-Morning Apr13-Oct23) active=true. Student 1047 Ariunsarnai Batbayar not appearing in to-be-assigned list. No change since Jul10.

NEIL: decide — chase payment via HubSpot deal, advance deal to Won, or cancel booking 1605.

Last checked: 2026-07-11 SAT UTC (25th check, hourly bot).


---
## 11 Jul 2026 SAT UTC (this bot run)

CONFIRMED UNCHANGED (fresh DB). BK1605 STILL PENDING, confirmed=false, amtPaid=0, updatedAt=Jun23 (18d stale). BC1791 AY-Renewal-Morning Apr13-Oct23 active=true. Zero SCAs. 89 days since course start with zero payment. NEIL: advance HubSpot deal 502951083215 or cancel BK1605. Sheet H21:K21 updated.

---
## 22nd check 2026-07-11 SAT UTC

CONFIRMED UNCHANGED (fresh DB). BK1605 STILL PENDING 89 days amtPaid=EUR0 confirmed=false updAt=Jun23. BC1791 AY-Renewal-Morning Apr13-Oct23 active=true 0 SCAs. Zero payments on booking. Sheet H21:K21 updated. NEIL: advance deal 502951083215 to Won or cancel BK1605. Last checked: 2026-07-11 SAT UTC.


---
## 24th check 2026-07-13 MON UTC

CONFIRMED UNCHANGED (fresh DB). BK1605 STILL PENDING, confirmed=false, amtPaid=EUR0, updatedAt=Jun23 (20 days stale). BC1791 Academic Year Renewal Morning Apr13-Oct23 active=true. Zero payments. Zero SCAs for student 1047. Day 91 since course start (Apr 13 to Jul 13). HubSpot deal 502951083215 B2B pipeline still at Enrolment (not Won).

NEIL: advance HubSpot deal 502951083215 to Won (stage 104175589) in B2B pipeline, or cancel booking and contact student ariunsarnai0125@gmail.com re EUR 1509.

Last checked: 2026-07-14 TUE UTC (27th check, hourly bot). UNCHANGED. BK1605 STILL PENDING day 92, EUR0 paid.

---
32nd check 2026-07-17 FRI UTC

CONFIRMED UNCHANGED (fresh DB). Booking 1605 (Ariunsarnai Batbayar, student 1047): status=PENDING, confirmed=false, amountTotal=EUR 1509, amountPaid=EUR 0, updatedAt=2026-06-23 (24 days stale). Zero payments on booking. Day 95 since booking course 1791 (Academic Year Renewal Morning, Apr 13-Oct 23 2026) started with no payment. Student email: ariunsarnai0125@gmail.com. HubSpot deal 502951083215 (B2B pipeline). NEIL: advance HubSpot deal 502951083215 to Won or cancel booking 1605 and contact student re EUR 1509.
Fix NOT RUN. Last checked: 2026-07-17 FRI UTC (32nd check, hourly bot).

---
34th check Sun 19 Jul 2026 UTC

CONFIRMED UNCHANGED (fresh DB, Sun 19 Jul).
Booking 1605 (Ariunsarnai Batbayar, student 1047): status = PENDING — 97 calendar days without payment since course started 13 April 2026.
Amount paid = EUR 0 — zero payments on file; course fee = EUR 1509. No class assignments on booking course 1791 ever.
Booking last updated 23 June 2026 — no activity in 26 days.
HubSpot deal 502951083215 still not advanced to Won.
Fix NOT Run. Enrolment decision needed. Last checked: Sun 19 Jul 2026 UTC (34th check).
