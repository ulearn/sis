# Issue 7 — Diego / Pedro / Aurora — wrong ILEP code on certificates
Reporter: AC · Area: Doc Gen / Certs · Sheet row 8

## Symptom
For three ILEP students the ILEP course code is wrong, and staff can't edit it in the profile or on the certificate.

## Root cause
- Edit lock: ILEP code editing was gated; a date-whitelist unlock was applied earlier this session (per memory project_ilep_codes / the DATE_WHITELIST), so the profile field should now be editable.
- Current codes in SIS:
  - **Aurora Madril Oliveira Molina** (841) — AY Afternoon, all rows `0318/0003`.
  - **Pedro De Pauli Pastre** (911) — AY Morning, all rows `0318/0013`.
  - **Diego Alves da Silva Molina** (840) — AY Afternoon, **MIXED**: rows 2026-01-05→02-13 and 2025-11-24→12-19 = `0318/0003`, but row 2026-02-23→06-05 = `0318/0021`. The odd `0318/0021` row is the likely culprit.

## Fix recipe — NOT YET RUN
1. Confirm the correct ILEP code per student against the ILEP CSV/JSON source of truth (per-enrolment, AY only — see project_ilep_codes).
2. If Diego's `0318/0021` row is wrong, align it:
```js
// sis/ — confirm the bookingCourse id for Diego's 2026-02-23→06-05 row, then:
// node --env-file=.env -e '...prisma.bookingCourse.update({where:{id:<id>},data:{ilepCode:"0318/0003"}})...'  // only if confirmed wrong
```
3. Regenerate the three certificates after codes are correct.

## Risk / category
bookings (ILEP) + documents · per-student · reversible. Needs the authoritative ILEP codes to proceed.

## Status
Edit unlocked. **info needed** — correct ILEP code per student (esp Diego's 0318/0021 row) · Last checked 2026-06-05

## 10th check hrly6 — 2026-07-08T11:20Z

CONFIRMED UNCHANGED (fresh DB). No action taken. Report-only.


## 11th check hrly8 — 2026-07-08 UTC

CONFIRMED UNCHANGED (fresh DB). No action taken. Report-only.
Diego Alves da Silva Molina (s840): bc24959 (Academic Year Morning, Aug3-Feb5 2027, bk18183) - ilepCode=STILL null. Bk18183: PARTIAL confirmed=false EUR1485/1735 (EUR250 outstanding).
Aurora Madril Oliveira Molina (s841): bc24958 (Aug3-Feb5 2027, bk18182 CONFIRMED EUR1735) - ilepCode=0318/0010 (DONE).
Pedro De Pauli Pastre (s911): last bc1603 ended 2026-06-05 - no new booking course in DB yet.
ILEP edit whitelist in place. Aug3 = 26 days. Set ilepCode on bc24959 via admin UI (student 840 > booking 18183 > bc24959).
Last checked: 2026-07-08 UTC (hrly8).

Last checked: 2026-07-08 UTC (hrly12). Diego s840 bc24959 ilepCode=STILL null. Aurora bc24958 ilepCode=0318/0010 RESOLVED. Pedro bc1603 ended Jun5 no new BC. bk18183 PARTIAL EUR1485/1735 EUR250 outstanding. Aug3=26 days. UNCHANGED.

[LAST_STATUS_UPDATE]
Status update 9 Jul 2026 UTC hrly23: UNCHANGED (13th check). Diego s840 bc24959 ilepCode=STILL null. bk18183 PARTIAL amtTotal=1735 amtOpen=250. Aurora DONE. Pedro no new BC. Aug3=25 days.

**11 Jul SAT UTC (16th check, fresh DB): CONFIRMED UNCHANGED. Diego s840 bc24959 (Academic Year Morning Aug3-Feb5): ilepCode=STILL null -- 23 days to course start. BK18183 PARTIAL EUR1485/1735 EUR250 outstanding confirmed=false (updatedAt=Jul8). Aurora bc24958 ilepCode=DONE. Pedro s911 no active booking course. NEIL: set ilepCode on bc24959 via SIS student 840 > booking 18183 > course 24959 BEFORE Aug3. Last checked: 2026-07-11 SAT UTC (hrly bot).**

---
## 11 Jul 2026 SAT UTC — 17th check (fresh DB)

BC24959 (Diego Seidel Goncalves s840, Academic Year Morning, starts 3 Aug 2026): ilepCode=STILL null, active=true. BK18183: PARTIAL EUR1485 confirmed=false. Course starts in 23 days. Aurora BC24958 DONE. Pedro no active booking course. NEIL: set ILEP code for BC24959 before Aug3. NOT RUN. Last checked: 2026-07-11 SAT UTC (17th check, hourly bot).

---
25th check 2026-07-13 MON UTC
CONFIRMED UNCHANGED (fresh DB). BC24959 (Diego AY Morn Aug3-Feb5): ilepCode=STILL null, fee=1365, active=true. Aug3=21 DAYS. BK18183 PARTIAL EUR1485/1735 EUR250 outstanding confirmed=false. PMT17995 EUR1265 type=null xeroId=null. Aurora BC24958 ilepCode=DONE. Pedro s911 no active BC. Fix NOT RUN. NEIL: set ilepCode on BC24959 before Aug3. Last checked: 2026-07-13 MON UTC (25th check, hourly bot).


---
26th check 2026-07-13 MON UTC — KEY CHANGE: BALANCE NOW FULLY PAID

Booking 18183 is NOW CONFIRMED, fully paid EUR 1735/1735, amountOpen = 0.
- Previously: PARTIAL EUR 1485/1735, EUR 250 outstanding, confirmed = false.
- New payment 18012 (EUR 250) appeared: type=null, xeroPaymentId=null, hubspotPaymentId=1282255191233.
- Payment 17995 (EUR 1265): type=null, xeroPaymentId=null, hubspotPaymentId=1278720259290.
- Both payments have HubSpot IDs but neither has a Xero ID — Xero reconciliation still needed.

Booking course 24959 (Diego AY Morning Aug3-Feb5 2027): ILEP code = STILL null. Aug3 = 21 days. URGENT.
Aurora bc24958: ilepCode = 0318/0010 — DONE. Pedro s911: no active booking course.

FIX PRIORITY (NOT YET RUN):
1. Set ILEP code on bc24959 — SIS admin: student 840 > booking 18183 > course 24959 — before Aug3
2. Reconcile pmt17995 (EUR 1265, hsPaymentId 1278720259290) in Xero vs booking 18183 invoice
3. Reconcile pmt18012 (EUR 250, hsPaymentId 1282255191233) in Xero vs booking 18183 invoice

Last checked: 2026-07-13 MON UTC (26th check, hourly bot). Fix NOT RUN.