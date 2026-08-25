# Issue 8 — Suvderdene Bayartsog — cert shows previous course dates
Reporter: AC · Area: Doc Gen / Certs · Sheet row 9

## URGENT — course ends 2026-06-05 (TODAY)

## Symptom
Completion certificate displays dates of her previous course, not the current renewal.

## Root cause
Student 947. Two bookings:
  Booking 1682 (old AY): course 1909 AY Morning 2025-05-05 to 2025-10-24 (CONFIRMED)
    -> Doc 158 cert DRAFT on THIS booking (WRONG)
  Booking 1498 (renewal): course 1660 Renewal MORN 2025-12-15 to 2026-06-05 (PENDING)
    -> NO cert document

Doc 158 (type=certificate, status=DRAFT, versionNo=1) was generated on booking 1682 (old AY).
sourceJson records: start_date 05 May 2025, end_date 24 Oct 2025, course AY Morning 25wks.
The cert should be on booking 1498 (renewal, Dec 15 2025 to Jun 5 2026 = TODAY).

Secondary code note: cert-picker sorts bookingCourses by startDate ASC picks [0] — harmless
here since bk1498 has only one course. Only matters for multi-course bookings.

## Fix recipe — NOT YET RUN

Step 1: No action on doc 158 — it is DRAFT (not issued, no revocation needed).

Step 2: Generate new cert on booking 1498:
  SIS UI: student 947 -> booking 1498 -> Documents -> Generate Certificate
  Verify: start 2025-12-15, end 2026-06-05, course ULearn Renewal MORN, ILEP 0318/0010

Step 3 (optional code fix): patch cert course-picker to select booking own courses
rather than globally earliest startDate.

## Risk / category
documents · single student · DRAFT only (no issued doc) · low risk · reversible

## Status — UPDATED 2026-06-05 (second check)
PROGRESS: bk1498 NOW CONFIRMED. Doc 171 DRAFT cert created Jun5 09:25 UTC on bk1498.
ACTION: staff review doc171 on bk1498 and ISSUE it. Course 1660 ended Jun5.
Last checked: 2026-06-05 UTC
## Updated 2026-06-06 UTC (run 4) — CORRECTION
Previous J entries incorrectly referenced bk97 (Massimiliano). Suvderdene bk=1498.

Current state:
  bk1498: status=CONFIRMED, confirmed=false (boolean still false)
  doc171: DRAFT cert (template 82=Certificate), created 2026-06-05 09:25 UTC
  Course c1660: Dec15 2025 – Jun05 2026 ENDED

Action: Issue doc171 via SIS->student947->bk1498->Documents->Issue.
If blocked by confirmed=false: UPDATE bookings SET confirmed=true WHERE id=1498; (NOT YET RUN) then retry.

Last checked 2026-06-06 UTC hrly(5): UNCHANGED. bk1498.confirmed=false. doc171 DRAFT cert. c1660 ended Jun5. Staff must issue doc171 in SIS.

Last checked 2026-06-06 UTC hrly(7): UNCHANGED. bk1498.confirmed=false. doc171 DRAFT. c1660 ended Jun5. Open bk1498->issue cert.
Last checked 2026-06-07 UTC hrly(11): SUN. UNCHANGED. doc171 DRAFT cert on bk1498. bk1498.confirmed=false. c1660 ended Jun5 (2d ago). Cert overdue. Open bk1498->issue cert.

Last checked 2026-06-07 UTC hrly#19: UNCHANGED. doc171 DRAFT, bk1498.confirmed=false, status=CONFIRMED. c1660 ended Jun5 (2d overdue). amount_paid=null. Open SIS->bk1498->issue cert.
Last checked 2026-06-07 UTC hrly#26: UNCHANGED. doc171 DRAFT, bk1498.confirmed=false, status=CONFIRMED. c1660 ended Jun5 (2d overdue). Action Mon Jun8: Open SIS->bk1498->issue cert. If blocked: UPDATE bookings SET confirmed=true WHERE id=1498; (NOT YET RUN) then retry.
Last checked 2026-06-07 UTC hrly#27 (this run): UNCHANGED. bk1498 confirmed=false, status=CONFIRMED. doc171 DRAFT cert (type=certificate, versionNo=1). c1660 ended Jun5. Cert 2d overdue. Mon action: SIS->student947->bk1498->Documents->Issue. If blocked: SET confirmed=true WHERE id=1498 (NOT YET RUN) then retry.

Last checked 2026-06-07 UTC hrly#28: UNCHANGED. bk1498 confirmed=false, status=CONFIRMED. doc171 DRAFT cert. c1660 ended Jun5 (2d overdue). Mon Jun8: open SIS->student947->bk1498->Documents->Issue. If blocked: UPDATE bookings SET confirmed=true WHERE id=1498; (NOT YET RUN) then retry.

Last checked 2026-06-08 UTC hrly(2): UNCHANGED. bk1498 confirmed=false, status=CONFIRMED. doc171 DRAFT cert (versionNo=1). c1660 ended Jun5 (3d overdue). NEIL: SIS->student947->bk1498->Documents->Issue. If blocked: UPDATE bookings SET confirmed=true WHERE id=1498; (NOT YET RUN) then retry.
Last checked 2026-06-08 UTC hrly(3): UNCHANGED. bk1498 confirmed=false status=CONFIRMED. doc171 DRAFT cert (vNo=1, Jun5 09:25 UTC). c1660 ENDED Jun5. 3d overdue. NEIL: SIS->student947->bk1498->issue doc171. If blocked: SET confirmed=true WHERE id=1498 (NOT RUN).
Last checked 2026-06-08 UTC hrly(4): UNCHANGED. bk1498 confirmed=false, status=CONFIRMED. doc171 DRAFT cert. c1660 ended Jun5. 3d overdue. NEIL: SIS->student947->bk1498->issue doc171. If blocked: SET confirmed=true WHERE id=1498 (NOT YET RUN).

Last checked 2026-06-08 UTC hrly(5): UNCHANGED. bk1498 confirmed=false, status=CONFIRMED. doc171 DRAFT cert (versionNo=1, created Jun5 09:25 UTC). c1660 ended Jun5. 3d overdue. NEIL: SIS->student947->bk1498->Documents->Issue. If blocked: UPDATE bookings SET confirmed=true WHERE id=1498; (NOT YET RUN) then retry.

Last checked 2026-06-08 UTC hrly(12): UNCHANGED. bk1498.confirmed=false, status=CONFIRMED. doc171 DRAFT cert. c1660 ended Jun5. 3d overdue. NEIL: SIS->student947->bk1498->Documents->Issue. If blocked: UPDATE bookings SET confirmed=true WHERE id=1498; (NOT YET RUN) then retry.
Last checked 2026-06-08 UTC hrly(16): UNCHANGED. bk1498.confirmed=false, status=CONFIRMED. doc171 DRAFT cert (versionNo=1). c1660 ended Jun5. 3d overdue. NEIL: SIS->student947->bk1498->Documents->Issue. If blocked: UPDATE bookings SET confirmed=true WHERE id=1498 (NOT YET RUN) then retry.
Last checked 2026-06-08 UTC hrly(18): UNCHANGED. bk1498.confirmed=false, status=CONFIRMED. doc171 DRAFT cert (type=certificate). c1660 Dec15-Jun05 ENDED 3d. Await Neil: SIS->student947->bk1498->Documents->Issue. If blocked: UPDATE bookings SET confirmed=true WHERE id=1498; (NOT YET RUN).
Last checked: 2026-06-09 UTC hrly(run2): UNCHANGED. bk1498.confirmed=false, status=CONFIRMED. doc171 DRAFT cert (type=certificate, versionNo=1, created Jun05 09:25 UTC). c1660 Dec15-Jun05 ENDED 4d. Cert 4d overdue. Await Neil: SIS->student947->bk1498->Documents->Issue. If blocked: UPDATE bookings SET confirmed=true WHERE id=1498; (NOT YET RUN) then retry.
Last checked: 2026-06-09 UTC hrly(12): UNCHANGED. bk1498 status=CONFIRMED confirmed=false amtPaid=null amtTotal=null. doc171 DRAFT vNo=1 created Jun05. c1660 ended Jun05(4d). NEIL: Issue doc171 via SIS or UPDATE bookings SET confirmed=true WHERE id=1498.
Last checked: 2026-06-09 UTC hrly(this run): bk1498 UNCHANGED. status=CONFIRMED confirmed=false amtPaid=null. doc171 DRAFT certificate issuedAt=null. c1660 ULearn Renewal MORN Dec15-Jun05 ended 4d. NEIL: (1) UPDATE bookings SET confirmed=true WHERE id=1498 (NOT RUN) (2) SIS->student 947->bk1498->Docs->Issue. Also check: amtPaid=null may block cert issuance - verify.

Last checked: 2026-06-10 UTC hrly: UNCHANGED day5. bk1498 status=CONFIRMED confirmed=false amtPaid=null. doc171 DRAFT cert issuedAt=null. c1660 ended Jun05(5d). NEIL: UPDATE bookings SET confirmed=true WHERE id=1498 (NOT RUN) then issue doc171 via SIS.

Last checked: 2026-06-10 UTC hrly6 D6: bk1498 status=CONFIRMED confirmed=false amtPaid=null. doc171 documentType=certificate status=DRAFT issuedAt=null. c1660 ended Jun05, 5 days ago. No change from previous checks. NEIL: (1) run UPDATE bookings SET confirmed=true WHERE id=1498; (2) open SIS bk1498 and issue doc171.
Last checked: 2026-06-10 UTC hrly: UNCHANGED day5+. bk1498 status=CONFIRMED confirmed=false amtPaid=null amtTotal=null. doc171 documentType=certificate status=DRAFT issuedAt=null versionNo=1. c1660 ULearn Renewal MORN ended Jun05 (5 days ago). Recipe: run UPDATE bookings SET confirmed=true WHERE id=1498 then issue doc171 via SIS. NEIL: still pending.
Last checked: 2026-06-11 UTC hrly(4) -- bk1498 CONF/conf=false/null UNCHANGED. doc171 DRAFT. D8. Status: UNRESOLVED. NEIL: SQL+issue cert.

Last checked: 2026-06-11 UTC hrly(12) D6: UNCHANGED. bk1498 status=CONFIRMED confirmed=false amtPaid=null amtTotal=null. doc171 DRAFT cert vNo=1 created Jun05. c1660 ULearn Renewal MORN ended Jun05 (6d ago). No action taken. NEIL: (1) UPDATE bookings SET confirmed=true WHERE id=1498 (NOT RUN); (2) SIS->student947->bk1498->Documents->Issue cert.
Last checked: 2026-06-11 UTC hrly(this run) D6. CONFIRMED UNCHANGED. bk1498 status=CONFIRMED confirmed=false amountPaid=null amountTotal=null. doc171 documentType=certificate status=DRAFT versionNo=1 createdJun05 issuedAt=null. c1660 ULearn Renewal MORN Dec15-Jun05 ended 6d. NEIL: (1) UPDATE bookings SET confirmed=true WHERE id=1498 (NOT RUN); (2) SIS->student947->bk1498->Documents->Issue cert.

Last checked: 2026-06-12 UTC hrly D7: UNCHANGED. bk1498 CONF confirmed=false amountPaid=null updAt=May21. doc171 DRAFT cert issuedAt=null. c1660 MORN ended Jun05(7d). NEIL: (1) UPDATE bookings SET confirmed=true WHERE id=1498 (NOT RUN) (2) SIS->student947->bk1498->Documents->Issue.

Last checked: 2026-06-12 UTC hrly#2 D8: SAME. bk1498 CONF conf=false amtPaid=null (c1660 ENDED Jun04, 8d). bk1682 c1909 AY-MORN ENDED Oct25. doc171 cert DRAFT issuedAt=null. 8d overdue. NEIL: UPDATE bookings SET confirmed=true WHERE id=1498 (NOT RUN); then SIS->student947->bk1498->Docs->Issue.


Last checked: 2026-06-14 SUN hrly2: SCHEMA UPDATE. bk1498.status=CONFIRMED in new schema (old boolean conf=false was legacy holdover). amountPaid=null/amountTotal=null — 0 payments in new payments table (may be B2B/agency, no payment block expected). doc171 DRAFT cert tmpl82=Certificate of Completion on bk1498. c1660 ULearn Renewal MORN Dec15-Jun05 ended 9d ago. ACTION: Open SIS->student947->bk1498->Documents->Issue cert. No confirmed=true SQL needed.

**Jun15 hrly18:** UNCHANGED. doc171 DRAFT(tmpl82) bk1498 CONFIRMED confirmed=false(schema anomaly). 0 pmts. c1660 ended Jun05(10d ago). NEIL: SIS->student947->bk1498->Documents->Issue.


**Jun18 hrly:** UNCHANGED. doc171 STILL DRAFT (template 82, certificate). 13 calendar days stale (created Jun05 09:25 UTC). bk1498 CONFIRMED confirmed=false amountPaid=null. c1660 ULearn Renewal MORN ended Jun05. NEIL: SIS->student947->bk1498->Documents->Issue cert. Last checked: 2026-06-18 UTC hrly.

**Jun19 hrly8 (this run):** CONFIRMED UNCHANGED (fresh DB). doc171 status=DRAFT templateId=82 (certificate) created=Jun05 updatedAt=Jun05 — 14 days stale. bk1498 CONFIRMED conf=false amountPaid=null (still not confirmed or marked paid). bc1660 ULearn Renewal MORN ended Jun05 (14 days ago). NEIL: SIS → student 947 → booking 1498 → Documents → press Issue button. Cert is 14 days overdue. Last checked: 2026-06-19 UTC hrly8.
Last checked: 2026-06-26 UTC hrly (8th check): doc171 STILL DRAFT (updAt=Jun05=21d). bk1498 CONF conf=false amtPaid=null (updAt=May21=36d). bc1660 ended Jun05=21d ago. UNCHANGED. Neil: SIS student 947 bk1498 Documents Issue button.
Last checked: 2026-06-27 UTC hrly (9th check): doc171 STILL DRAFT (tmpl82, updAt=Jun05=22d stale). bk1498 CONF conf=false amtPaid=null (updAt=May21=37d stale). bc1660 ULearn Renewal MORN ended Jun05=22d ago active=true. UNCHANGED. Neil: SIS student 947 -> bk1498 -> Documents -> Issue button.
Last checked: 2026-06-28 UTC hrly (10th check): doc171 STILL DRAFT (tmpl82, Jun05=23d stale). bk1498 CONF conf=false amtPaid=null. bc1660 ended Jun05=23d ago active=true. UNCHANGED. Neil: SIS student 947 bk1498 Documents Issue button.


**Jun28 SUN 04:04 UTC (11th check, fresh DB): CONFIRMED UNCHANGED. doc171 STILL DRAFT (tmpl82, last updated Jun05=23d stale). bk1498 CONFIRMED confirmed=false amountPaid=null. bc1660 ULearn Renewal Morning ended Jun05=23d ago active=true. Certificate never issued after course ended. Neil: SIS student 947 -> bk1498 -> Documents -> Issue button. Last checked: 2026-06-28 04:04 UTC (11th check).**
**Jun30 TUE UTC (16th check, fresh DB): CONFIRMED UNCHANGED. doc171 STILL DRAFT (tmpl82, last updated Jun05=25d stale). bk1498 CONFIRMED confirmed=false amountPaid=null (updAt=May21=40d stale). bc1660 ULearn Renewal Morning ended Jun05=25d ago active=STILL true. Certificate never issued after course ended. Neil: SIS student 947 -> bk1498 -> Documents -> Issue button. Last checked: 2026-06-30 TUE UTC (16th check).**

**Jul01 WED UTC (17th check, fresh DB): CONFIRMED UNCHANGED. doc171 STILL DRAFT (tmpl82, last updated Jun05=26d stale). bk1498 CONFIRMED confirmed=false amountPaid=null (updAt=May21=41d stale). bc1660 ULearn Renewal Morning ended Jun05=26d ago active=STILL true. Certificate never issued after course ended. Neil: SIS student 947 -> bk1498 -> Documents -> Issue button.**


**Jul02 THU UTC (19th check, fresh DB): CONFIRMED UNCHANGED. doc171 STILL DRAFT (template 82 cert, created Jun05=27d stale). bk1498 CONF confirmed=false amtPaid=null. bc1660 ended Jun05. Certificate content complete (name, dates, ILEP code all correct). NEIL: SIS student 947 > booking 1498 > Documents > click Issue button to issue the DRAFT certificate. Last checked: 2026-07-02 UTC (19th check, hrly bot).**


**5 Jul SUN UTC (24th check, fresh DB): CONFIRMED UNCHANGED. doc171 STILL DRAFT (documentType=certificate, templateId=82, created Jun05=31 days stale, issuedAt=null). bk1498 CONFIRMED confirmed=false amountPaid=null. bc1660 (ULearn Renewal Morning): ended Jun05, active=true. Certificate never issued after 31 days. NEIL: SIS student 947 > booking 1498 > Documents > click Issue button. Last checked: 2026-07-05 UTC (24th check, hrly bot).**
**6 Jul UTC (27th check, fresh DB): CONFIRMED UNCHANGED. Document 171 still DRAFT (31 days old, created Jun 05, issuedAt=null). Booking 1498 CONFIRMED confirmed=false amountPaid=null. Booking course 1660 ended Jun 05 still active=true. NEIL: SIS student 947 > booking 1498 > Documents > Issue button. Last checked: 2026-07-06 UTC (27th check).**
