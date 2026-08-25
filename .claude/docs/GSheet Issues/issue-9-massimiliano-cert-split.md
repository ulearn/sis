Issue 9 -- Massimiliano Cameran -- cert shows only last 2 weeks
Reporter: AC . Area: Doc Gen / Certs . Sheet row 10 (issue 10 in sheet)

Symptom
Cert shows only May25-Jun05 (2wks). Started Apr27. Manual date fix fails.

Root cause
Student 91. TWO SEPARATE BOOKINGS:
  bk97 (deal 493808162028): c107 Morning General Apr27-May22. Docs: doc63 REVOKED, doc64 ISSUED (accounts). NO cert.
  bk18002 (deal 504571278542): c24793 General English AM May25-Jun05. doc179 certificate ISSUED 2026-06-05.

Fix recipe -- NOT YET RUN (bk97 only)

1. In SIS open booking 97 (student 91 Massimiliano).
2. bk97.confirmed=false (boolean) despite status=CONFIRMED -- may block cert gen button.
   If button absent: run (NOT YET): UPDATE bookings SET confirmed=true WHERE id=97;
3. Generate Completion Certificate on bk97 -> Apr27-May22 Morning General.
4. Review DRAFT and ISSUE to student.
Student gets 2 certs: Apr27-May22 (bk97) + May25-Jun05 (bk18002 doc179).

Risk: documents. Single student. Low risk. Does not affect bk18002 doc179.

Last checked 2026-06-06 UTC hrly#13: bk97 CONFIRMED, c107 Apr27-May22 (ended 15d ago). No cert docs.
Last checked 2026-06-06 UTC hrly#14: UNCHANGED. c107 ended 15d. No cert. OVERDUE. Staff must gen cert in SIS.
Last checked 2026-06-08 UTC hrly#15: UNCHANGED. doc63+doc64 accounts only. c107 ended 17d. OVERDUE.
Last checked 2026-06-08 UTC hrly#16: bk97.confirmed=false (boolean) vs status=CONFIRMED. May block Generate Cert button. Set confirmed=true first (NOT YET RUN). Zero cert docs on bk97. c107 Apr27-May22 17d+ overdue.
Last checked 2026-06-06 UTC hrly (this run): bk97.confirmed=false STILL. No cert docs on bk97. c107 ended ~15d ago. bk18002 doc179 ISSUED ok. OVERDUE -- staff must gen cert via SIS->bk97.
Last checked 2026-06-06 UTC (run 2): bk97.confirmed=false STILL. No cert docs. c107 Apr27-May22 ended ~15d ago. bk18002 doc179 ISSUED ok. Confirmed=false may block cert button. Run: UPDATE bookings SET confirmed=true WHERE id=97; then gen cert (NOT YET RUN).
Last checked 2026-06-06 UTC (run 3): UNCHANGED. bk97.confirmed=false, no cert docs on bk97. c107 Apr27-May22 ended ~15d ago. bk18002 doc179 cert ISSUED ok. No invoices on bk97. OVERDUE -- must gen cert urgently. Set confirmed=true WHERE id=97 (NOT YET RUN) then gen cert via SIS.

Last checked 2026-06-06 UTC (run 4): UNCHANGED. bk97 confirmed=false. doc63+doc64=invoices only; NO cert. c107 Apr27-May22 ended 15d ago. SET confirmed=true WHERE id=97 (NOT RUN) then gen cert via SIS.

Last checked 2026-06-06 UTC (run 5): UNCHANGED. bk97.confirmed=false. doc63+doc64=invoices only. NO cert docs on bk97. c107 Apr27-May22 ended 15d ago. OVERDUE. Set confirmed=true WHERE id=97 (NOT RUN) then gen cert via SIS.

Last checked 2026-06-06 UTC (run 6): UNCHANGED. bk97.confirmed=false. docs=doc63(REVOKED)+doc64(ISSUED)=invoices only. NO cert. c107 Apr27-May22 ended 16d ago. Set confirmed=true WHERE id=97 (NOT RUN) then gen cert via SIS.

Last checked 2026-06-07 UTC hrly#18: UNCHANGED. bk97.confirmed=false, status=CONFIRMED, amount_paid=amount_total=EUR1741. docs=doc63(REVOKED)+doc64(ISSUED)=accounts only. NO cert. c107 Apr27-May22 ended 16d ago. OVERDUE.
Last checked 2026-06-07 UTC hrly#26: UNCHANGED. bk97.confirmed=false, status=CONFIRMED. docs=doc63(REVOKED)+doc64(ISSUED)=accounts only. NO cert. c107 Apr27-May22 ended 16d ago. OVERDUE. Mon Jun8: set confirmed=true WHERE id=97 (NOT YET RUN) then gen cert via SIS->bk97.
Last checked 2026-06-07 UTC hrly#27 (this run): UNCHANGED. bk97 confirmed=false, status=CONFIRMED. docs=[doc63 REVOKED accounts, doc64 ISSUED accounts] — NO cert. c107 Apr27-May22 ended 16d ago. OVERDUE. Mon: (1) UPDATE bookings SET confirmed=true WHERE id=97; (NOT YET RUN) (2) gen cert bk97->c107->Apr27-May22.

Last checked 2026-06-07 UTC hrly#28: UNCHANGED. bk97 confirmed=false, status=CONFIRMED. docs=[doc63 REVOKED+doc64 ISSUED]=accounts only. ZERO certs. c107 Apr27-May22 ended 16d ago. Mon Jun8: (1) UPDATE bookings SET confirmed=true WHERE id=97; (NOT YET RUN) (2) SIS->bk97->gen cert c107 Apr27-May22.

Last checked 2026-06-08 UTC hrly(2): UNCHANGED. bk97 confirmed=false, status=CONFIRMED. docs=[] (no certs; invoice docs in invoices relation). c107 Apr27-May22 ended 17d ago. OVERDUE. NEIL: (1) UPDATE bookings SET confirmed=true WHERE id=97; (NOT YET RUN) (2) SIS->bk97->gen cert c107 Apr27-May22.
Last checked 2026-06-08 UTC hrly(3): UNCHANGED. bk97 confirmed=false status=CONFIRMED. doc63 REVOKED+doc64 ISSUED=accounts only. ZERO certs. c107 Apr27-May22 ended 17d. OVERDUE. NEIL: (1) SET confirmed=true WHERE id=97 (NOT RUN) (2) SIS->bk97->gen cert.
Last checked 2026-06-08 UTC hrly(4): UNCHANGED. bk97 confirmed=false, status=CONFIRMED. doc63(REVOKED)+doc64(ISSUED)=accounts only. ZERO certs. c107 Apr27-May22 ended 17d. NEIL: (1) UPDATE bookings SET confirmed=true WHERE id=97; (NOT YET RUN) (2) SIS->bk97->gen cert c107.

Last checked 2026-06-08 UTC hrly(5): UNCHANGED. bk97 confirmed=false, status=CONFIRMED. docs=[doc63 REVOKED+doc64 ISSUED]=accounts only. ZERO certs. c107 Apr27-May22 ended 17d ago. NEIL: (1) UPDATE bookings SET confirmed=true WHERE id=97; (NOT YET RUN) (2) SIS->bk97->gen cert c107 Apr27-May22.

Last checked 2026-06-08 UTC hrly(12): UNCHANGED. bk97.confirmed=false, status=CONFIRMED. docs=accounts only. ZERO certs. c107 Apr27-May22 17d overdue. NEIL: (1) UPDATE bookings SET confirmed=true WHERE id=97; (NOT YET RUN) (2) SIS->bk97->gen cert c107 Apr27-May22.
Last checked 2026-06-08 UTC hrly(16): UNCHANGED. bk97.confirmed=false, status=CONFIRMED. doc63(REVOKED)+doc64(ISSUED)=accounts only. ZERO certs. c107 Apr27-May22 17d overdue. NEIL: (1) UPDATE bookings SET confirmed=true WHERE id=97 (NOT YET RUN) (2) SIS->bk97->gen cert c107 Apr27-May22.
Last checked 2026-06-08 UTC hrly(18): UNCHANGED. bk97.confirmed=false, status=CONFIRMED. doc63(REVOKED)+doc64(ISSUED)=accounts only. ZERO certs. c107 Apr27-May22 17d overdue. NEIL: (1) UPDATE bookings SET confirmed=true WHERE id=97; (NOT YET RUN) (2) SIS->bk97->gen cert c107 Apr27-May22.
Last checked: 2026-06-09 UTC hrly(run2): UNCHANGED. bk97.confirmed=false, status=CONFIRMED. docs=[doc63 REVOKED+doc64 ISSUED]=accounts only. ZERO certs on bk97. c107 Apr27-May22 ended 18d. OVERDUE. Await Neil: (1) UPDATE bookings SET confirmed=true WHERE id=97; (NOT YET RUN) (2) SIS->bk97->gen cert c107 Apr27-May22.
Last checked: 2026-06-09 hrly(this run): bk97 UNCHANGED. confirmed=false amtPaid=1741. docs: doc63 REVOKED accounts + doc64 ISSUED accounts (invoices only, no cert). c107 Morning General Apr27-May22 ended 19d. bk18002 doc179 cert ISSUED ok. NEIL: (1) UPDATE bookings SET confirmed=true WHERE id=97 (NOT RUN) (2) SIS->bk97->Generate Certificate->c107 Apr27-May22. 19d overdue.

Last checked: 2026-06-10 UTC hrly: UNCHANGED day20. bk97 status=CONFIRMED confirmed=false amtPaid=1741=amtTotal. No cert doc exists for bk97. c107 Apr27-May22 ended 20d ago. NEIL: (1) UPDATE bookings SET confirmed=true WHERE id=97 (NOT RUN) (2) SIS->bk97->Docs->Generate cert.
Last checked: 2026-06-11 UTC hrly: UNCHANGED D22. bk97 CONF conf=false amtPaid=1741/1741. 0 docs. c107 Apr27-May22 ended 22d. NEIL: (1) UPDATE bookings SET confirmed=true WHERE id=97 (NOT RUN) (2) SIS->bk97->gen cert c107.

Last checked: 2026-06-11 UTC hrly(this run) D22. CONFIRMED UNCHANGED. bk97 status=CONFIRMED confirmed=false amountPaid=1741 amountTotal=1741. docs=[doc63 REVOKED accounts + doc64 ISSUED accounts] — ZERO certs. c107 Morning General Apr27-May22 ended 22d. NEIL: (1) UPDATE bookings SET confirmed=true WHERE id=97 (NOT RUN); (2) SIS->student91->bk97->Documents->Generate Certificate->c107 Apr27-May22.

Last checked: 2026-06-12 UTC hrly D23: UNCHANGED. bk97 CONF confirmed=false amountPaid=1741 updAt=Jun05(7d). docs=doc63 REVOKED+doc64 ISSUED accounts only. ZERO certs. c107 MORN Apr27-May22 ended D21. NEIL: (1) UPDATE bookings SET confirmed=true WHERE id=97 (NOT RUN) (2) SIS->bk97->gen cert c107 Apr27-May22.


Last checked: 2026-06-14 SUN hrly2: SCHEMA CLARIFICATION. bk97.status=CONFIRMED amountPaid=1741. doc63(REVOKED tmpl78=Net-Gross Invoice)+doc64(ISSUED tmpl78=Net-Gross Invoice) — CONFIRMED NOT certs. ZERO cert(tmpl82=Certificate of Completion) docs on bk97. bk18002 doc179(tmpl82 ISSUED)=ok. NOTE: UPDATE confirmed=true may not apply in new schema — try SIS cert gen button directly first. c107 Apr27-May22 ended D53. NEIL: SIS->student91->bk97->Docs->Generate Certificate.
**Jun15 08:04UTC (cron):** CONFIRMED UNCHANGED D53. bk97 CONF confirmed=false amtPaid=1741/1741. doc63(REVOKED tmpl78=invoice)+doc64(ISSUED tmpl78=invoice) — ZERO cert(tmpl82) docs on bk97. c107 MORNING Apr27-May22 ended 24d ago. bk18002 doc179(tmpl82) ISSUED ok. NEIL: SIS->student91->bk97->Docs->Generate Certificate.

Last checked: 2026-06-23 UTC hrly: CONFIRMED UNCHANGED D32 from course end. bk97 status=CONFIRMED confirmed=false amountPaid=1741=amountTotal. docs: doc63 REVOKED tmpl78 (invoice) + doc64 ISSUED tmpl78 (invoice) — ZERO cert docs (tmpl82) on bk97. bc107 Morning General Apr27-May22 ended 32d ago (active=true stale). bk18002 doc179 cert ISSUED ok. Note: bc107.active=true is stale flag (course ended). NEIL: (1) UPDATE bookings SET confirmed=true WHERE id=97 (NOT RUN); (2) SIS->student91->bk97->Documents->Generate Certificate->bc107 Apr27-May22.
Last checked: 2026-06-26 UTC hrly (8th check): bk97 CONF 1741/1741. 0 cert docs (tmpl82). doc63 REVOKED + doc64 ISSUED (both tmpl78 invoices). bc107 ended May22=35d (active=true stale). UNCHANGED. Neil: SIS student 91 bk97 Documents Generate Certificate.
Last checked: 2026-06-27 UTC hrly (9th check): bk97 CONF amtPaid=1741/amtTotal=1741. doc63 REVOKED tmpl78 + doc64 ISSUED tmpl78 — ZERO cert docs (tmpl82) on bk97. bc107 Morning General Apr27-May22 ended 36d ago (active=true stale). UNCHANGED. Neil: SIS student 91 bk97 Documents Generate Certificate.
Last checked: 2026-06-28 UTC hrly (10th check): bk97 CONF amtPaid=1741/amtTotal=1741. doc63 REVOKED tmpl78 + doc64 ISSUED tmpl78 — ZERO cert docs (tmpl82) on bk97. bc107 Morning General Apr27-May22 ended 37d ago (active=true stale). UNCHANGED. Neil: SIS student 91 bk97 Documents Generate Certificate.


**Jun28 SUN 04:04 UTC (11th check, fresh DB): CONFIRMED UNCHANGED. bk97 CONFIRMED confirmed=false amtPaid=1741/amtTotal=1741 (fully paid). 0 certificate documents (template 82) found. doc63 REVOKED (tmpl78 invoice) + doc64 ISSUED (tmpl78 invoice) — invoices only, no cert. bc107 Morning General Apr27-May22 ended 37d ago (active=true stale). Neil: SIS student 91 -> bk97 -> Documents -> Generate Certificate. Last checked: 2026-06-28 04:04 UTC (11th check).**
**Jun30 TUE UTC (13th check, fresh DB): CONFIRMED UNCHANGED. bk97 CONFIRMED confirmed=false amtPaid=1741/amtTotal=1741 (fully paid). 0 certificate documents (template 82) found. doc63 REVOKED (tmpl78 invoice) + doc64 ISSUED (tmpl78 invoice) — invoices only, no cert. bc107 Morning General Apr27-May22 ended 39d ago (active=STILL true stale). Neil: SIS student 91 -> bk97 -> Documents -> Generate Certificate. Last checked: 2026-06-30 TUE UTC (13th check).**

**Jul01 WED UTC (15th check, fresh DB): CONFIRMED UNCHANGED. bk97 CONFIRMED confirmed=false amtPaid=1741/amtTotal=1741 (fully paid). 0 certificate documents (template 82) found. doc63 REVOKED (tmpl78 invoice) + doc64 ISSUED (tmpl78 invoice). bc107 Morning General Apr27-May22 ended 40d ago (active=STILL true stale). Neil: SIS student 91 -> bk97 -> Documents -> Generate Certificate. Last checked: 2026-07-01 WED UTC (15th check).**


## 10 Jul 2026 UTC (this run) — 24th check, NO CERT

CONFIRMED UNCHANGED (fresh DB). Report-only.
- Booking 97 (Massimiliano Cameran, student 91): CONFIRMED, confirmed=false, EUR1741/1741 (updatedAt=Jun05=35d ago)
- Document 63 (type=accounts, issued May19): invoice only
- Document 64 (type=accounts, issued May19): invoice only
- NO completion certificate on booking 97
- NEIL: SIS > student 91 > booking 97 > Documents > Generate Certificate (NOT YET RUN)
Last checked: 2026-07-10 UTC (24th check).


---
14 Jul TUE UTC (28th check, fresh DB): CONFIRMED UNCHANGED. BK97 (Massimiliano Cameran, student 91): CONFIRMED EUR1741/1741 confirmed=false (updAt=Jun05=39d stale). BC107 (Morning General) active=true 1 SCA. Doc63 REVOKED + Doc64 ISSUED (accounts only) — zero completion certificates. NEIL: SIS student 91 > booking 97 > Documents > Generate Certificate. Last checked: 2026-07-14 UTC (28th check).
**15 Jul WED UTC (29th check, fresh DB): CONFIRMED UNCHANGED. BK97 (Massimiliano Cameran, student 91): CONFIRMED EUR1741/1741 confirmed=false (updAt=Jun05=40d). Doc63 REVOKED accounts bk97 + Doc64 ISSUED accounts bk97 — ZERO completion certs on bk97. Doc179 ISSUED cert bk18002 (not bk97). NEIL: SIS student 91 -> bk97 -> Documents -> Generate Certificate. Last checked: 2026-07-15 UTC (29th check).**
**30th check Sat 18 Jul UTC (fresh DB). CONFIRMED UNCHANGED. BK97 (Massimiliano Cameran, student 91): CONFIRMED EUR1741/1741 confirmed=false (updAt=Jun05=43d). Doc63 REVOKED accounts bk97. Doc64 ISSUED accounts bk97. ZERO completion certs on bk97. Doc179 ISSUED cert bk18002 (not bk97). NEIL: SIS student 91 -> bk97 -> Documents -> Generate Certificate. Last checked: 2026-07-18 SAT UTC (30th check).**