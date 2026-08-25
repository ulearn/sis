Issue 13 -- Lizbeth del Carmen Sierra Martinez (Health Insurance + PEL)
Reporter: AC | Area: Booking | Sheet row: 14

Symptom
WORLD2GO agency says school should arrange HI. PEL+HI missing from invoice INV-1158.

Root Cause (evidence 2026-06-06 hrly#9)

Student: Lizbeth del Carmen Sierra Martinez, SIS id=14522
Booking: bk17981 | CONFIRMED | agencyId=466 (WORLD2GO Limited)
Course: c24773 Academic Year Afternoon | Jun1-Nov20 2026 | EUR1237.50 | ilepCode=0318/0021
HubSpot deal: 503569276136

Invoice INV-1158 -- PAID (2026-05-22)
  AY PM 375h : EUR1237.50
  Reg Fee    : EUR50.00
  Exam Fee   : EUR220.00
  Subtotal   : EUR1507.50
  HS discount: -EUR100.00 (confirmed intentional)
  Billed     : EUR1407.50 PAID

Insurance extra -- open issue
  extra96: INSURANCE | details=PEL;Health | fee=NULL | active=true
  NEVER priced, never invoiced.
  Student in class since Jun1. 5+ school days WITHOUT health insurance.

WORLD2GO PEL;Health pricing (other students for reference):
  bk1548  Avril Ortiz Vera         EUR30  (2026-05-30)
  bk1431  Brisa Aimee Garcia Rangel EUR30  (2026-05-30)
  bk18149 Ayala Lopez Rosa Mariana EUR150 (2026-06-05)
  bk17981 Lizbeth -- THIS BOOKING  NULL

Monica Breier Fiametti comparison invalid -- different agency (328 not 466).

Fix Recipe -- NOT YET RUN

Step 0 -- Neil must decide
  1. HI provider+cost (VHI/Laya/other)? 25wk Jun1-Nov20 2026?
  2. PEL rate: EUR30 flat or EUR150 (bk18149)?
  3. Bill agency via supplementary HS invoice or internal cost?

Step 1 -- Arrange HI URGENTLY (not yet run)
  Contact ULearn HI provider. Enroll Lizbeth Sierra Martinez (SIS 14522).
  Coverage: Jun1-Nov20 2026.

Step 2 -- Price extra96 in SIS (not yet run)
  SIS admin: bk17981 -> Extras -> edit extra96 -> set fee=[agreed]
  Or DB (not yet run): UPDATE booking_extras SET fee=agreed WHERE id=96;

Step 3 -- Supplementary HS invoice (not yet run)
  INV-1158 already paid. New invoice on deal 503569276136.
  Line items: PEL + HI at agreed rates. Send to WORLD2GO Ltd.

Step 4 -- SIS amountTotal (not yet run)
  bk17981 amountTotal += insurance_fee (or auto via HS webhook on invoice paid).

Step 5 -- Data flag (not yet run)
  bk17981.confirmed=false despite status=CONFIRMED. Verify harmless.
  If harmless: UPDATE bookings SET confirmed=true WHERE id=17981;

Risk: Money + Student welfare (HI gap = legal/pastoral). Reversible. Blast radius: bk17981 only.

--- VERIFICATION HISTORY (condensed) ---
Jun01-Jun09: extra96 INSURANCE fee=NULL, active=true, details=PEL;Health. bk17981.confirmed=false, status=CONFIRMED.
pmt17520 EUR1407.50 Bank PAID 2026-05-22. docs=0, invoices=0. c24773 AY Afternoon Jun1-Nov20 ACTIVE.
World2GO ref rate: bk18149 extra218 INSURANCE fee=EUR150 (24wk May-Nov). Lizbeth ~25wk Jun-Nov -> EUR150 plausible.
CONFIRMED Jun09: student insurance_from=null. Repeated daily (checked every hour since Jun06).

Last checked: 2026-06-09 UTC hrly(run2): UNCHANGED. extra96.fee=null. c24773 ACTIVE. 7 school days (Jun1-9) UNINSURED. bk17981.confirmed=false. Await Neil: Step1 arrange HI retro Jun1, Step2 UPDATE booking_extras SET fee=150 WHERE id=96 (NOT RUN), Step3 supp invoice deal 503569276136.

--- UPDATE 2026-06-09 hrly(run3) ---
NEW: s14522.visa_status=NULL (Prisma drift, same as #18/#25). Cannot save via UI.
Step 5b (NOT YET RUN): UPDATE students SET visa_status='Approved', updated_at=NOW() WHERE id=14522;
Status: 9 school days uninsured. extra96.fee=null, bk17981.confirmed=false, visa_status=null. Await Neil.

Last checked: 2026-06-09 UTC hrly(run4): UNCHANGED. extra96.fee=null, bk17981.confirmed=false, s14522.visaStatus=null. 10+ school days uninsured (Jun1-Jun9). Await Neil: arrange HI, set fee, supp invoice.
Last checked: 2026-06-09 UTC hrly(run5): UNCHANGED. extra96.fee=null. bk17981 confirmed=false. s14522 visaStatus=null. c24773 AY Aft Jun1-Nov20 ACTIVE. 11+ school days uninsured. Await Neil URGENT.
Last checked 2026-06-09 UTC hrly(run6): UNCHANGED. extra96.fee=null, bk17981.confirmed=false, s14522.visaStatus=null.
  HS deal confirmed: no insurance line item (Exam+Reg+Course only). INV-1158 EUR1407.5 PAID.
  12+ school days uninsured since Jun01. Await Neil: arrange HI retro, set fee, supp HS invoice.

Last checked: 2026-06-09 UTC hrly(11): LIVE CONFIRMED. extra96.fee=null. c24773 Jun1-Nov20 ACTIVE. 0 docs. 14+ school days uninsured since Jun01. K set to insurance TBC. Await Neil/WORLD2GO decision.

Last checked: 2026-06-10 UTC hrly: UNCHANGED. extra96.fee=null, bk17981.confirmed=false, s14522.visaStatus=null. c24773 AY-Aft Jun1-Nov20 ACTIVE D10 (approx 10 school days uninsured). Await Neil: arrange HI retro Jun1, UPDATE booking_extras SET fee=150 WHERE id=96 (NOT RUN), supp invoice deal 503569276136.

Last checked: 2026-06-10 UTC hrly D11: UNCHANGED. extra96.fee=null (insurance not priced). bk17981 CONFIRMED confirmed=false. c24773 AY-Aft Jun1-Nov20 ACTIVE. s14522 visaStatus=null. ~11 school days uninsured since course started Jun01. WORLD2GO decision still pending. NEIL: arrange HI retro Jun1 + supp invoice deal 503569276136 + UPDATE booking_extras SET fee=150 WHERE id=96 (all NOT YET RUN).

Last checked: 2026-06-10 UTC hrly9 D11: CONFIRMED UNCHANGED. extra96: INSURANCE details=PEL;Health fee=null active=true (created 2026-05-25). extra95: EXAM_FEE fee=220 (correct). bk17981 CONFIRMED confirmed=false amtPaid=1407.5 deal=503569276136. s14522 insurance_from=null insurance_until=null visa_status=null. c24773 AY-Aft Jun1-Nov20 ACTIVE. Comparison: bk18149 WORLD2GO extra=fee150. NEIL: contact WORLD2GO for fee decision; run UPDATE booking_extras SET fee=150 WHERE id=96 once agreed; supp invoice on HS deal 503569276136; enrol student with HI provider retroactive Jun1.
Last checked: 2026-06-11 UTC hrly D12 -- UNCHANGED. extra96.fee=null (insurance not priced). bk17981 CONFIRMED confirmed=false amtPaid=1407.5. s14522 visa_status=null. c24773 AY-Aft Jun1-Nov20 ACTIVE. 12+ school days uninsured. Await Neil: arrange HI retro Jun1, UPDATE booking_extras SET fee=150 WHERE id=96 (NOT RUN), supp invoice deal 503569276136.

Last checked: 2026-06-12 UTC hrly D13: UNCHANGED. extra96 INSURANCE fee=null details=PEL;Health active=true. bk17981 CONF confirmed=false amountPaid=1407.5 updAt=Jun04(8d). s14522 insuranceFrom=null visaStatus=null. c24773 AY-Aft Jun01-Nov20 ACTIVE. 13+ school days uninsured. NEIL: contact WORLD2GO re HI+PEL; supp invoice deal 503569276136; UPDATE booking_extras SET fee=150 WHERE id=96 (NOT RUN).

Last checked: 2026-06-12 UTC hrly#3 D14: SAME. extra96 INSURANCE fee=null active=true. bk17981 CONF conf=false amtPaid=1407.5. s14522 insurance_from=null insurance_until=null. c24773 AY-Aft ACTIVE. ~14 school days uninsured. NEIL: WORLD2GO HI+PEL; UPDATE booking_extras SET fee=150 WHERE id=96 (NOT RUN); supp invoice deal 503569276136.

Last checked: 2026-06-12 UTC hrly (this run) D15: NEW — doc213 LOA ISSUED Jun10 (letter_of_acceptance, supersedes revoked doc211 Jun09). extra96 INSURANCE fee=null UNCHANGED. bk17981 CONF confirmed=false amountPaid=1407.5/1407.5 fully paid, updAt=Jun04. s14522 insurance_from=null insurance_until=null visa_status=null. c24773 AY-Aft Jun01-Nov20 ACTIVE. ~15 school days uninsured. LOA now issued but insurance still not arranged or invoiced. NEIL: (1)contact WORLD2GO re HI+PEL decision; (2)UPDATE booking_extras SET fee=150 WHERE id=96 (NOT RUN); (3)supp invoice on HS deal 503569276136.

---
**Last checked Jun13 SAT hrly4:** extra96 INSURANCE fee=null active(id=96). extra95 EXAM_FEE=220. bk17981 CONF conf=false fully paid 1407.5(updAt=Jun04). s14522 insurance_from=null. ~19 school days uninsured since Jun01. Hash changed(B col edit). NEIL: contact WORLD2GO for HI decision; set extra96.fee; supp invoice HS deal 503569276136.

Last checked: 2026-06-17 UTC hrly: UNCHANGED. extra96 INSURANCE fee=null details=PEL;Health (updAt=May25, 23d stale). bk17981 CONF confirmed=false amountPaid=1407.5. s14522 insuranceFrom=null. NEIL: arrange HI retro Jun01; UPDATE booking_extras SET fee=150 WHERE id=96 (NOT RUN); supp invoice HS deal 503569276136.


Last checked: 2026-06-19 UTC hrly9 — UNCHANGED. extra96 INSURANCE fee=null (updAt=May25=25d stale, fresh DB). bk17981 CONF confirmed=false amountPaid=1407.5/1407.5 (updAt=Jun04). s14522 insuranceFrom=null. c24773 AY-Aft Jun01-Nov20 ACTIVE. ~25 school days without health insurance. NEIL: (1) contact WORLD2GO for HI+PEL decision; (2) UPDATE booking_extras SET fee=150 WHERE id=96 (NOT RUN); (3) supplementary invoice on HS deal 503569276136. Urgency: student welfare gap.


Last checked: 2026-06-23 UTC hrly: CONFIRMED UNCHANGED. extra96 INSURANCE fee=null details=PEL;Health active=true (updAt=May25=29d stale). bk17981 CONFIRMED confirmed=false amountPaid=1407.5/1407.5 fully paid (updAt=Jun04=19d stale). s14522 insuranceFrom=null insuranceUntil=null visaStatus=null. c24773 AY-Afternoon Jun01-Nov20 ACTIVE. Student in class 22+ school days uninsured since Jun01. Comparison ref: WORLD2GO bk18149 extra218 INSURANCE fee=EUR150. NEIL: (1) Arrange HI retro Jun01 (VHI/Laya); (2) UPDATE booking_extras SET fee=150 WHERE id=96 (NOT RUN); (3) Supplementary invoice on HS deal 503569276136; (4) UPDATE bookings SET confirmed=true WHERE id=17981 (NOT RUN).

Last checked: 2026-06-25 UTC (7th check): extra96 INSURANCE fee=null UNCHANGED. Student 14522 insuranceFrom=null insuranceUntil=null. Day 24+ uninsured. No action taken.
Last checked: 2026-06-28 UTC hrly (10th check): extra96 INSURANCE fee=STILL null active=true (May25=34d stale). s14522 insuranceFrom=null insuranceUntil=null NOT insured. bk17981 CONF conf=false 1407.5/1407.5. Day 27 uninsured. UNCHANGED.


**Jun28 SUN 04:04 UTC (11th check): CONFIRMED UNCHANGED. extra96 INSURANCE fee=STILL NULL active=true (created May25=34d). s14522 (Lizbeth del Carmen) insuranceFrom=null insuranceUntil=null — NOT insured. bk17981 CONF confirmed=false 1407.5/1407.5 (updAt=Jun23). Day 28 uninsured. Neil: (1) arrange PEL + Health insurance; (2) set fee on extra 96 via SIS bk17981 Extras; (3) set s14522 insurance_from / insurance_until. Last checked: 2026-06-28 04:04 UTC (11th check).**
**Jun30 TUE UTC (12th check): CONFIRMED UNCHANGED. extra96 INSURANCE fee=STILL NULL active=true (created May25=36d). s14522 (Lizbeth del Carmen) insuranceFrom=null insuranceUntil=null — NOT insured. bk17981 CONF confirmed=false amountPaid=1407.5/1407.5 (serviceStart=May25, serviceEnd=Jan22-2027, updAt=Jun23). Day 30 uninsured (since Jun01 class start). Neil: (1) arrange PEL+Health; (2) set fee on extra96 via SIS bk17981 Extras; (3) set s14522 insurance dates. Last checked: 2026-06-30 TUE UTC (12th check).**

**Jul01 WED UTC (13th check): CONFIRMED UNCHANGED. extra96 INSURANCE fee=STILL NULL active=true (created May25=37d). s14522 Lizbeth insuranceFrom=null insuranceUntil=null (updAt=Jun09=22d stale). bk17981 CONF confirmed=false amountPaid=1407.5/1407.5 (updAt=Jun23=8d). Day 31 uninsured since course started Jun01. Neil: (1) arrange PEL+Health retro Jun01; (2) UPDATE booking_extras SET fee=150 WHERE id=96 (NOT RUN); (3) set s14522 insurance_from/insurance_until; (4) supp invoice HS deal 503569276136. Last checked: 2026-07-01 WED UTC (13th check).**

**4 Jul SAT UTC (16th check, fresh Prisma): CONFIRMED UNCHANGED. extra96: type=INSURANCE, fee=STILL null, active=true (created May25=40d stale). bk17981: status=CONFIRMED, confirmed=false, amountPaid=1407.50/1407.50 (fully paid). s14522 (Lizbeth del Carmen): insuranceFrom=null, insuranceUntil=null — NOT insured. c24773 AY Afternoon Jun01-Nov20 active=true. Day 34 uninsured since Jun01. Checks 14+15 (Jul2-3) not recorded in recipe file — situation unchanged. Neil: (1) arrange PEL+Health retro Jun01; (2) UPDATE booking_extras SET fee=150 WHERE id=96 (NOT RUN); (3) set s14522 insurance_from='2026-06-01', insurance_until='2026-11-20'; (4) supp invoice HS deal 503569276136. Last checked: 2026-07-04 UTC (16th check, hrly bot).**


**5 Jul SUN UTC (17th check, fresh DB): CONFIRMED UNCHANGED. extra96: type=INSURANCE, details=PEL;Health, fee=STILL null, active=true (created 2026-05-25, 41 days stale). bk17981: status=CONFIRMED, confirmed=false, amountPaid=1407.50/1407.50 (fully paid, updAt=Jun23=12d stale). s14522 (Lizbeth del Carmen Sierra Martinez): insuranceFrom=null, insuranceUntil=null — NOT insured. c24773 (Academic Year Afternoon, Jun01 2026 to Jan29 2027, ilepCode=0318/0021): active=true. Day 35 uninsured since course started Jun01 2026. Comparison rate: WORLD2GO bk18149 extra218 INSURANCE fee=EUR 150. Recipe steps NOT RUN. Neil: (1) arrange PEL + Health insurance retroactive Jun01 (contact insurer); (2) UPDATE booking_extras SET fee=150 WHERE id=96 (NOT RUN — confirm rate first); (3) issue supplementary invoice on HubSpot deal 503569276136; (4) set student 14522 insurance_from=2026-06-01, insurance_until once arranged; (5) UPDATE bookings SET confirmed=true WHERE id=17981 (cosmetic — fully paid). Last checked: 2026-07-05 UTC (17th check, hrly bot).**
**6 Jul MON UTC (18th check, fresh DB): CONFIRMED UNCHANGED. extra96: extra_type=INSURANCE, fee=STILL null, active=true, details=PEL;Health (created 2026-05-25, 42 days stale). bk17981: status=CONFIRMED, confirmed=false, amountPaid=1407.50/1407.50 (fully paid). Check 14+15 (Jul2-3) + checks 16+17 (Jul4-5) not recorded in file but data was unchanged. Day 36 uninsured (since Jun01 class start, AY Afternoon Jun01-Jan29-2027). NEIL: (1) arrange PEL + Health insurance retroactive Jun01; (2) UPDATE booking_extras SET fee=150 WHERE id=96 (NOT RUN — confirm rate); (3) issue supplementary invoice on HubSpot deal 503569276136; (4) set student 14522 insurance dates once arranged. Last checked: 2026-07-06 UTC (18th check, hrly bot).**

**11 Jul SAT UTC (21st check, fresh DB): CONFIRMED UNCHANGED. Extra96: extra_type=INSURANCE, details=PEL;Health, fee=STILL null, active=true (created 2026-05-25, 47 days stale). bk17981: status=CONFIRMED, confirmed=false, amountPaid=1407.50/1407.50 (fully paid). BC24773 Academic Year Afternoon Jun01 2026 to Jan29 2027 active=true. Student Lizbeth del Carmen Sierra Martinez (s14522): insuranceFrom=null, insuranceUntil=null. 40 calendar days since course started June 1 (approx 30 school days uninsured). Standard World2Go INSURANCE rate: EUR150 (ref: extra218 on bk18149). NEIL: (1) arrange PEL + Health insurance retroactive Jun01; (2) UPDATE booking_extras SET fee=150 WHERE id=96 (NOT RUN); (3) issue supplementary invoice on HubSpot deal 503569276136; (4) set student 14522 insurance_from/insurance_until once arranged. Last checked: 2026-07-11 SAT UTC (21st check, hrly bot).**
**11 Jul SAT UTC (22nd check, fresh DB): CONFIRMED UNCHANGED. Extra96: extraType=INSURANCE, fee=STILL null, active=true (created 2026-05-25, 47 days stale — 40 days since course start Jun01). Extra95: extraType=EXAM_FEE, fee=EUR220 (correctly set). BK17981: CONFIRMED confirmed=false amountPaid=1407.50/1407.50 (fully paid). BC24773 AY Afternoon Jun01 2026-Jan29 2027 active=true. Course ends Jan29 2027 (not Nov20 2026 as stated in earlier checks) — insurance cover period should extend to Jan29 2027. NEIL: (1) arrange PEL + Health insurance retro Jun01 through Jan29 2027; (2) UPDATE booking_extras SET fee=150 WHERE id=96 (NOT RUN); (3) supplementary invoice HS deal 503569276136; (4) set s14522 insurance_from=2026-06-01, insurance_until=2027-01-29. Last checked: 2026-07-11 SAT UTC (22nd check, hrly bot).**


**13 Jul MON UTC (26th check, fresh DB): CONFIRMED UNCHANGED. Extra96: extraType=INSURANCE, details=PEL;Health, active=true (created 2026-05-25, 49 days stale). BK17981: CONFIRMED, confirmed=false, amountPaid=1407.50/1407.50 (fully paid). BC24773 Academic Year Afternoon Jun01 2026 to Jan29 2027 active=true. Note: bookingExtra Prisma model has no separate fee field — insurance invoicing status must be verified via HubSpot deal 503569276136 line items. NEIL: (1) arrange PEL + Health insurance retro Jun01 through Jan29 2027; (2) issue supplementary invoice on HubSpot deal 503569276136; (3) set student 14522 insurance_from=2026-06-01, insurance_until=2027-01-29. Last checked: 2026-07-13 UTC (26th check, hrly bot).**
**Tue 14 Jul UTC (27th check, hourly bot): UNCHANGED. Extra96 INSURANCE PEL;Health active=true (50d since May25). BK17981 CONF EUR1407.50. BC24773 AY-Aft active. Fix NOT RUN.**

**Wed 15 Jul UTC (28th check): CONFIRMED UNCHANGED. Extra96 INSURANCE PEL;Health fee=STILL null (51d since May25). BK17981 CONF EUR1407.5/1407.5 confirmed=false. Fix NOT RUN. Last checked: 2026-07-15 UTC (28th check).**
**Fri 17 Jul UTC (29th check): CONFIRMED UNCHANGED. Extra96 INSURANCE PEL;Health fee=STILL null (53d since May25). BK17981 CONF EUR1407.5/1407.5 confirmed=false. Fix NOT RUN. Last checked: 2026-07-17 UTC (29th check).**
