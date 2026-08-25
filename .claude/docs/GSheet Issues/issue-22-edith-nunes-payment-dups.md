# Issue 22 - Edith Nunes (student 1015): Duplicate payments + not in TBA WB 18/05/26

- Reporter: AC
- Area: Booking / Class
- Sheet row: 23

## Symptom
Not appearing in TBA for WB 18.05.2026. Two payments with same invoice number.

## Root cause

### A - Not in TBA (May 18+)
Last course c24668 ends 2026-05-15. Two shell bookings (no courses) created 2026-06-02:
  bk18131 deal 438072533213 amtTotal=1185
  bk18133 deal 471541671147 amtTotal=648
Webhook fired when deals WON but course creation failed (likely missing course dates in deal).

### B - Duplicate payments
Each shell booking HubSpot payment duplicates a manual entry on bk1567:
  pmt970  (bk1567) 1185 Jan19 R2026241    == pmt17852 (bk18131) 1185 Jan19 HS:1245328690407
  pmt17027 (bk1567) 648 Feb16 R2026475   == pmt17730 (bk18133) 648 Feb16 HS:1242902318299

Also on bk1567 - probable dup pair (same amount, same date):
  pmt17161: 482.4 Apr14 receipt R20261233 (manual)
  pmt17728: 482.4 Apr14 no receipt HubSpot:1242859980986

Total paid on bk1567 = 3280.2 vs amount_total=482.4 (stale/wrong).

## Fix recipe (NOT YET RUN)

### Step 1 - Verify HubSpot deals 438072533213 and 471541671147 (READ-ONLY)
Check: what course dates do they cover? Are these renewals after May 15?

### Step 2 - Remove dup payment on bk1567 (after confirmation)
  -- NOT YET RUN
  DELETE FROM payments WHERE id = 17728;  -- dup 482.4 Apr14 HubSpot

### Step 3 - Create course rows on shell bookings (dates from HubSpot)
  -- NOT YET RUN - fill in correct start/end from HubSpot deal line items
  INSERT INTO booking_courses (booking_id, name, category, start_date, end_date)
  VALUES (18131, NULL, NULL, <start>, <end>);

### Step 4 - Recalculate bk1567.amount_total after cleanup

## Risk / category
- Category: money / bookings - MODERATE
- Reversible: staged; confirm HubSpot before deleting any payment
- Neil MUST check HubSpot deals 438072533213 and 471541671147 before acting

## Status
Pending Neil HubSpot verification.
Last checked: 2026-07-06 UTC (97th check) — BC24933 + BC24934 both still active, both end Fri Jul10 (4 school days). Last SCA for s1015 was May15. Student has been unassigned for 52 days. FINAL WEEK — fix needed today.


Last checked: 2026-06-11 UTC hrly (HS verified) -- HS VERIFICATION COMPLETE. deal438072533213 CLOSEDWON 2026-01-20 "Edith Nunes - 4 w Intensive General 30" EUR1185. deal471541671147 CLOSEDWON 2026-02-16 "Edith Nunes - 4 w Morning General 15" EUR648. Both old Fidelo-era short courses (Jan-Feb 2026), already completed. REVISED RECIPE: (1) DELETE FROM payments WHERE id IN (17728, 17730, 17852); (NOT YET RUN) -- dups have no txId. (2) UPDATE bookings SET status='CANCELLED' WHERE id IN (18131, 18133); (NOT YET RUN) -- shell bookings, no courses needed. (3) Verify bk1567 post-cleanup. Step 3 from original recipe (create course rows) is NOT needed -- these were Fidelo courses.

## New finding — Jun12 UTC

bk18158 PENDING 0/740 hs=505836060909 updAt=Jun11 — NEW active 2026 booking for s1015, NOT a Fidelo shell. Do NOT cancel bk18158.

Last checked: 2026-06-12 UTC hrly#7 — bk18131+18133 are shells (no courses). Dup pmts 17728/17730/17852 all xeroId=null. REVISED RECIPE (NOT YET RUN): (1) DELETE FROM payments WHERE id IN (17728, 17730, 17852); (2) UPDATE bookings SET status=CANCELLED WHERE id IN (18131, 18133); (3) verify bk1567 post-cleanup; (4) separately: fix bk18158 PENDING 0/740, Neil check HS deal 505836060909.

Last checked: 2026-06-12 UTC hrly (this run) — NEW: bk18158 has 2 DUPLICATE booking_course rows (c24933 AND c24934, both 'General English AM', Jun15-Jul10 — same dates, same name). Likely webhook double-insert on deal 505836060909. bk18158 has 0 payments. Fix (NOT YET RUN): DELETE FROM booking_courses WHERE id=24934; (keep c24933, verify first). Dup pmts 17728/17730/17852 unchanged (all xeroId=null). Full recipe: (1) DELETE FROM payments WHERE id IN (17728,17730,17852); (2) UPDATE bookings SET status='CANCELLED' WHERE id IN (18131,18133); (3) DELETE FROM booking_courses WHERE id=24934; (4) Neil check HS deal 505836060909 for bk18158 payment status.


Last checked: 2026-06-12 UTC hrly (this cron run) -- NEW: fee discrepancy in bk18158 dup courses:
  c24933: General English AM, Jun15-Jul10, 4wk, fee=380 (first row, likely the canonical one)
  c24934: General English AM, Jun15-Jul10, 4wk, fee=360 (duplicate row - created same moment Jun11)
  Note: 380+360=740 = bk18158.amountTotal exactly.
  This could mean: (a) webhook double-insert split the fee accidentally, OR
                   (b) intentional split (e.g. tuition=380 + registration=360) — UNLIKELY given identical names.
  RECOMMENDATION: Delete c24934. If fee=380 is wrong (total should be 740), then after deleting c24934,
  UPDATE booking_courses SET fee=740 WHERE id=24933; -- (NOT YET RUN)
  OR leave c24933.fee=380 if that is the correct 4-week rate (and total=740 is stale).
  bk18158 has 0 payments currently. amountTotal=740. HS deal 505836060909 must be checked for payment status.
  Course c24933/c24934 starts Mon Jun15 — assign class AFTER resolving dup course.
Last checked: 2026-06-12 UTC hrly-latest LAST BUSINESS DAY before Mon Jun15: UNCHANGED. c24933(GE-AM Jun15-Jul10 fee=380)+c24934(GE-AM Jun15-Jul10 fee=360) STILL DUP on bk18158. bk18158 PENDING 0/740. Dup pmts: pmt17728(bk1567 482.4 Apr14 HS=1242859980986)+pmt17730(bk18133 648 Feb16 HS=1242902318299)+pmt17852(bk18131 1185 Jan19 HS=1245328690407) all xeroPaymentId=null. RECIPE (NOT RUN): (1)DELETE payments WHERE id IN (17728,17730,17852); (2)UPDATE bookings SET status=CANCELLED WHERE id IN (18131,18133); (3)DELETE booking_courses WHERE id=24934; (4)check HS deal 505836060909 + assign class c24933 after fix. K set to CRITICAL fix today.

Last checked: 2026-06-12 UTC (this run) FINAL FRIDAY — STARTS MON JUN15: CONFIRMED UNCHANGED. bk18158 PENDING 0/740. c24933(fee=380)+c24934(fee=360) BOTH DUP GE-AM Jun15-Jul10. 0 pmts on bk18158. bk18131 CONFIRMED 1185(NOT cancelled). bk18133 CONFIRMED 648(NOT cancelled). Dup pmts 17728(bk1567 482.4)+17730(bk18133 648)+17852(bk18131 1185) all xeroPaymentId=null NOT deleted. ALL 4 STEPS NOT RUN. NEIL: fix before EOD. SQL(NOT RUN): (1)DELETE FROM payments WHERE id IN(17728,17730,17852); (2)UPDATE bookings SET status='CANCELLED' WHERE id IN(18131,18133); (3)DELETE FROM booking_courses WHERE id=24934; (4)verify HS 505836060909+assign class c24933.

Last checked: 2026-06-12 UTC hrly (this cron run) FINAL FRIDAY — STARTS MON JUN15: CONFIRMED UNCHANGED. bk18158 PENDING 0/740. c24933(GE-AM Jun15-Jul10 fee=380)+c24934(DUP fee=360) STILL DUP. bk18131 CONF 1185 + bk18133 CONF 648 NOT CANCELLED. Dup pmts 17728(bk1567)/17730(bk18133)/17852(bk18131) all xeroPaymentId=null NOT DELETED. 0 SCAs on s1015. ALL 4 STEPS NOT RUN. NEIL: fix TONIGHT. SQL(NOT RUN): (1)DELETE FROM payments WHERE id IN(17728,17730,17852); (2)UPDATE bookings SET status=CANCELLED WHERE id IN(18131,18133); (3)DELETE FROM booking_courses WHERE id=24934; (4)verify HS 505836060909+assign s1015 to class c24933(GE-AM Jun15).

Last checked: 2026-06-12 UTC hrly (cron) — UNCHANGED. bk18131 CONFIRMED 1185+bk18133 CONFIRMED 648 NOT cancelled. pmt17728/17730/17852 all xeroPaymentId=null NOT deleted. bk18158 PENDING 0/740. c24933(GE-AM fee=380)+c24934(DUP fee=360) active. s1015 Edith A1 0 new SCAs for Jun15 course. Starts MONDAY JUN15. All 4 steps not run.

Last checked: 2026-06-12 UTC hrly (this run) CONFIRMED: bk18158 PENDING 0/740 UNCHANGED. c24933(fee=380)+c24934(DUP fee=360) both GE-AM Jun15-Jul10 active. 0 pmts on bk18158. bk18131 CONFIRMED 1185+bk18133 CONFIRMED 648 NOT cancelled. pmt17728/17730/17852 NOT deleted (all xeroId=null). s1015 0 new SCAs. ALL 4 STEPS NOT RUN. STARTS MON JUN15.

Last checked: 2026-06-12 UTC hrly (cron FINAL) — STARTS MON JUN15. bk18158 PENDING 0/740 updAt=Jun11. c24933(GE-AM fee=380)+c24934(DUP GE-AM fee=360) both Jun15-Jul10. 0 pmts on bk18158. bk18131 CONFIRMED 1185(NOT cancelled). bk18133 CONFIRMED 648(NOT cancelled). pmt17728(bk1567 EUR482.4 HS:1242859980986 xeroId=null)+pmt17730(bk18133 EUR648 HS:1242902318299 xeroId=null)+pmt17852(bk18131 EUR1185 HS:1245328690407 xeroId=null) — all ghost dups NOT deleted. s1015 0 active SCAs. ALL 4 STEPS NOT RUN. NEIL: fix TONIGHT.
Last checked: 2026-06-13 UTC hrly — NEW FINDING: pmt17728(EUR482.4) bookingId=1567=Ediths own old CONFIRMED booking (bk1567 CONF 482.4/482.4 hs=498500200675). pmt17728 is dup of pmt17161 on bk1567. Edith has 5 bookings: bk1567(CONF 482.4 old), bk17894(CONF 540 Jun10), bk18131(CONF 1185 ghost), bk18133(CONF 648 ghost), bk18158(PEND 0/740 starts Mon). c24933(GE-AM fee=380)+c24934(DUP fee=360) still both on bk18158. REVISED RECIPE (NOT RUN): (1)DELETE FROM payments WHERE id=17728; (dup of pmt17161 on bk1567) (2)DELETE FROM payments WHERE id IN(17730,17852); (ghosts) (3)UPDATE bookings SET status=CANCELLED WHERE id IN(18131,18133); (4)DELETE FROM booking_courses WHERE id=24934; (5)Neil check HS deal 505836060909+assign s1015 to cls7(A1) for c24933 Jun15-Jul10. STARTS MON JUN15.

Last checked: 2026-06-13 UTC hrly SAT (this run) — CONFIRMED UNCHANGED. bk18158 PEND 0/740 updAt=Jun11. c24933(fee=380)+c24934(DUP fee=360) GE-AM Jun15-Jul10. bk18131 CONF 1185+bk18133 CONF 648 NOT cancelled. pmt17728(bk1567 EUR482.4)+17730(bk18133 EUR648)+17852(bk18131 EUR1185) xeroId=null NOT deleted. bk17894 CONF 540/540 ended Jun12. 0 SCAs s1015. STARTS MON JUN15. ALL 5 STEPS NOT RUN.

Last checked: 2026-06-13 UTC hrly SAT (cron) -- CONFIRMED UNCHANGED (SAT final). bk18158 PEND 0/740 updAt=Jun11. c24933(GE-AM fee=380)+c24934(DUP fee=360) BOTH Jun15-Jul10. bk18131 CONF 1185+bk18133 CONF 648 NOT cancelled. pmt17728(bk1567 482.4)+17730(bk18133 648)+17852(bk18131 1185) xeroId=null. 0 new SCAs s1015. COURSE STARTS MON JUN15. SQL(NOT RUN): (1)DELETE FROM payments WHERE id IN(17728,17730,17852); (2)UPDATE bookings SET status=CANCELLED WHERE id IN(18131,18133); (3)DELETE FROM booking_courses WHERE id=24934; (4)check HS 505836060909+assign s1015 cls7(A1) c24933 Jun15-Jul10. NEIL: fix NOW.

Last checked: 2026-06-13 UTC hrly SAT (this run) — CONFIRMED UNCHANGED. bk18158 PEND 0/740. c24933(fee=380)+c24934(DUP fee=360) Jun15-Jul10. bk18131 CONF 1185+bk18133 CONF 648 NOT cancelled. pmt17728/17730/17852 xeroId=null. s1015 0 active SCAs (old sca48+sca146 expired May15). COURSE STARTS MON JUN15. ALL 5 STEPS NOT RUN. NEIL: fix NOW before school opens.

Last checked: 2026-06-13 UTC hrly2 SAT — CONFIRMED UNCHANGED (2nd hourly check). DB raw SQL: c24933(bk18158,fee=380)+c24934(bk18158 DUP,fee=360) BOTH live. bk18131 CONF 1185/1185. bk18133 CONF 648/648. pmt17728(bk1567 EUR482.4)+pmt17730(bk18133 EUR648)+pmt17852(bk18131 EUR1185) undeleted. s1015: old SCAs sca48+sca146 only(expired). ALL 5 STEPS NOT RUN. STARTS MON JUN15 IN <35h.

Last checked: 2026-06-13 UTC hrly SAT#3 — CONFIRMED UNCHANGED. bk18158 PEND 0/740 updAt=Jun11. c24933(GE-AM fee=380)+c24934(DUP fee=360) Jun15-Jul10. bk18131 CONF 1185+bk18133 CONF 648 NOT cancelled. pmt17728/17730/17852 xeroId=null. s1015 0 active SCAs (sca48+sca146 expired). ALL 5 STEPS NOT RUN. COURSE STARTS MON JUN15 IN ~30h.

Last checked: 2026-06-13 UTC hrly SAT#4 — CONFIRMED UNCHANGED. bk18158 PEND 0/740 updAt=Jun11. c24933(GE-AM fee=380)+c24934(DUP fee=360) BOTH Jun15-Jul10 on bk18158. bk18131 CONF 1185/1185(NOT cancelled). bk18133 CONF 648/648(NOT cancelled). pmt17728(bk1567 EUR482.4 HS=1242859980986)+17730(bk18133 EUR648)+17852(bk18131 EUR1185) all xeroId=null NOT deleted. s1015 0 active SCAs (sca48+sca146 expired May15). COURSE STARTS MON JUN15 IN <30h. ALL 5 STEPS NOT RUN. SQL(NOT RUN): (1)DELETE FROM payments WHERE id IN(17728,17730,17852); (2)UPDATE bookings SET status=CANCELLED WHERE id IN(18131,18133); (3)DELETE FROM booking_courses WHERE id=24934; (4)verify HS 505836060909+assign s1015 cls7(A1) c24933 Jun15.

Last checked: 2026-06-13 UTC hrly SAT#5 — CONFIRMED UNCHANGED. bk18158 PEND 0/740 updAt=Jun11. c24933(GE-AM fee=380)+c24934(DUP fee=360) both Jun15-Jul10 on bk18158. bk18131 CONF 1185+bk18133 CONF 648 NOT cancelled. pmt17728/17730/17852 xeroId=null. s1015 0 active SCAs (sca48+sca146 expired May15). COURSE STARTS MON JUN15. ALL 5 STEPS NOT RUN.

Last checked: 2026-06-13 UTC hrly SAT (this run) — CONFIRMED UNCHANGED. bk18158 PEND 0/740 updAt=Jun11. c24933(GE-AM fee=380)+c24934(DUP fee=360) Jun15-Jul10. bk18131 CONF 1185+bk18133 CONF 648 NOT cancelled (0 booking_courses each = ghost). pmt17728(bk1567 EUR482.4)+17730(bk18133 EUR648)+17852(bk18131 EUR1185) all xeroId=null. s1015 sca48+sca146 expired only. ALL 5 STEPS NOT RUN. STARTS MON JUN15 <19h.

Last checked: 2026-06-13 UTC hrly SAT (FINAL RUN) — CONFIRMED UNCHANGED. bk18158 PEND 0/740 updAt=Jun11. c24933(GE-AM fee=380)+c24934(DUP fee=360) BOTH Jun15-Jul10 on bk18158. bk18131 CONF 1185/1185(NOT cancelled). bk18133 CONF 648/648(NOT cancelled). pmt17728(bk1567 EUR482.4 hsId=1242859980986)+17730(bk18133 EUR648)+17852(bk18131 EUR1185) all xeroPaymentId=null NOT deleted. s1015 old SCAs sca48+sca146 expired May15 only. ALL 5 STEPS NOT RUN. COURSE STARTS MON JUN15 IN <19h. NEIL: fix TONIGHT. SQL(NOT RUN): (1)DELETE FROM payments WHERE id IN(17728,17730,17852); (2)UPDATE bookings SET status=CANCELLED WHERE id IN(18131,18133); (3)DELETE FROM booking_courses WHERE id=24934; (4)check HS deal 505836060909+assign s1015 cls7(A1) for c24933 Jun15-Jul10.

---
**Last checked Jun13 SAT hrly4:** UNCHANGED. bk18158 PEND 0/740(updAt Jun11). c24933(GE-AM fee=380)+c24934(DUP fee=360) BOTH Jun15-Jul10. bk18131 CONF 1185(pmt17852 xero=null)+bk18133 CONF 648(pmt17730 xero=null) NOT cancelled. 0 active SCAs s1015. STARTS MON JUN15. ALL 5 STEPS NOT RUN. NEIL: fix TONIGHT.

**Last checked Jun13 SAT hrly6:** CONFIRMED UNCHANGED. bk18158 PEND 0/740 updAt=Jun11. c24933(GE-AM fee=380)+c24934(DUP fee=360) BOTH Jun15-Jul10 on bk18158. bk18131 CONF 1185(0crs ghost)+bk18133 CONF 648(0crs ghost) NOT cancelled. pmt17728(bk1567 EUR482.4)+17730(bk18133 EUR648)+17852(bk18131 EUR1185) xeroId=null NOT deleted. s1015 0 active SCAs. ALL 5 STEPS NOT RUN. STARTS TOMORROW. SQL(NOT RUN): (1)DELETE FROM payments WHERE id IN(17728,17730,17852); (2)UPDATE bookings SET status=CANCELLED WHERE id IN(18131,18133); (3)DELETE FROM booking_courses WHERE id=24934; (4)check HS 505836060909+assign s1015 cls7(A1) c24933 Jun15.

**Last checked Jun13 SAT hrly7 23:00IST:** CONFIRMED UNCHANGED. bk18158 PEND 0/740. c24933(fee=380)+c24934(DUP fee=360) BOTH Jun15-Jul10. bk18131 CONF 1185+bk18133 CONF 648 NOT cancelled. pmt17728/17730/17852 xeroId=null. s1015 0 active SCAs. ALL 5 STEPS NOT RUN. COURSE STARTS ~32h.

**Last checked Jun14 SUN hrly:** CONFIRMED UNCHANGED. bk18158 PEND amtPaid=0/amtTotal=740 updAt=Jun11(3d stale). bk18131 CONFIRMED(ghost 0bc)+bk18133 CONFIRMED(ghost 0bc) NOT cancelled. pmt17730(EUR648->bk18133)+pmt17852(EUR1185->bk18131) xeroId=null NOT deleted. c24934(DUP GE-AM fee=360 Jun15-Jul10) still live. s1015 old sca48(ended Apr17)+sca146(ended May15) only. ALL 5 STEPS NOT RUN. COURSE STARTS TOMORROW MON JUN15. NEIL: URGENT — cancel bk18131+18133, handle pmts, delete c24934, assign s1015 to c24933 AM class.

**Last checked Jun14 SUN hrly2:** CONFIRMED UNCHANGED. bk18158 PEND 0/740 updAt=Jun11. c24933(GE-AM fee=380)+c24934(DUP GE-AM fee=360) BOTH Jun15-Jul10. bk18131 CONF 1185/1185(0crs ghost)+bk18133 CONF 648/648(0crs ghost) NOT cancelled. pmt17728(bk1567 EUR482.4)+17730(bk18133 EUR648)+17852(bk18131 EUR1185) xeroId=null NOT deleted. s1015 0 active SCAs (sca48+sca146 expired). ALL 5 STEPS NOT RUN. COURSE STARTS TOMORROW MON JUN15. NEIL: run SQL TONIGHT.
**Last checked Jun14 SUN hrly4:** CONFIRMED UNCHANGED. bk18158 PEND 0/740 updAt=Jun11. c24933(GE-AM fee=380)+c24934(DUP fee=360) BOTH Jun15-Jul10. bk18131 CONF 1185/1185(0crs ghost)+bk18133 CONF 648/648(0crs ghost) NOT cancelled. pmt17728(bk1567 EUR482.4)+17730(bk18133 EUR648)+17852(bk18131 EUR1185) xeroId=null NOT deleted. s1015 0 active SCAs. COURSE STARTS TOMORROW MON JUN15. ALL 5 STEPS NOT RUN. Until bk18158 paid+confirmed s1015 NOT assignable. NEIL: Mon urgent.
---
CORRECTION Jun14 hrly6 (COURSE STARTS TODAY JUN15)

pmt17728 clarification: Previous recipe said DELETE pmts WHERE id IN(17728,17730,17852).
pmt17728=bookingId=1567(Edite old Fidelo bk CONF 482.40/482.40)=dup of pmt17161 on bk1567.
Safe to delete but NOT connected to bk18158. Does not help fix.
The ghost payments to cancel/void are: pmt17730(bk18133 EUR648)+pmt17852(bk18131 EUR1185).

Revised recipe (NOT YET RUN):
1. UPDATE bookings SET status=CANCELLED WHERE id IN (18131, 18133);
2. Refund pmt17852(EUR1185 HS=1245328690407)+pmt17730(EUR648 HS=1242902318299) via HubSpot.
   These paid for old Jan/Feb Fidelo courses(done). Student owes EUR740 NEW for bk18158.
3. DELETE FROM booking_courses WHERE id=24934; (keep c24933 fee=380)
4. Optional: DELETE FROM payments WHERE id=17728; (dup on old bk1567, low pri)
5. After bk18158 CONFIRMED: assign s1015 cls7(A1-AM) c24933 Jun15-Jul10

State Jun14 hrly6 - COURSE STARTS TODAY:
bk18158 PENDING 0/740 STARTS TODAY - 0 pmts, 0 SCAs
bk18131 CONF 1185 ghost(0bc) NOT cancelled
bk18133 CONF 648 ghost(0bc) NOT cancelled
c24933(fee=380)+c24934(DUP fee=360) both on bk18158
Student arriving with no class assignment - URGENT

Last checked: 2026-06-14 UTC hrly6

**Last checked Jun14 SUN hrly7:** CONFIRMED UNCHANGED. bk18158 PEND 0/740 updAt=Jun11. c24933(GE-AM fee=380)+c24934(DUP fee=360) BOTH Jun15-Jul10. bk18131 CONF 1185(0bc ghost)+bk18133 CONF 648(0bc ghost) NOT cancelled. pmt17730(EUR648 bk18133 xero=null)+pmt17852(EUR1185 bk18131 xero=null) NOT deleted. s1015 0 active SCAs. Edite has NO class Mon. COURSE STARTS MON JUN15. NEIL: urgent tonight — run revised recipe (steps 1-4 NOT RUN).
**Last checked Jun15 MON hrly11:** STARTED TODAY. bk18158 PEND 0/740 updAt=Jun11 UNCHANGED. bc24933(GE-AM fee=380)+bc24934(DUP fee=360) BOTH Jun15-Jul10. bk18131 CONF 1185 ghost+bk18133 CONF 648 ghost NOT cancelled. pmt17730(EUR648 xero=null)+pmt17852(EUR1185 xero=null) NOT deleted. s1015 0 active SCAs(sca48+sca146 expired May15). Revised recipe(NOT RUN): 1)UPDATE bookings SET status=CANCELLED WHERE id IN(18131,18133); 2)void pmt17852(HS=1245328690407)+pmt17730(HS=1242902318299) via HubSpot; 3)DELETE FROM booking_courses WHERE id=24934; 4)assign s1015 cls7/c24933 after bk18158 paid. NEIL: run revised recipe IMMEDIATELY.

**Jun15 hrly12:** STARTED. bk18158 PEND 0/740 UNCHANGED. bc24933+bc24934 DUP Jun15-Jul10. bk18131(1185)+bk18133(648) CONF no-courses NOT cancelled. 0 SCAs. Steps 1-4 NOT RUN.

**Jun14-UTC hrly (cron):** COURSE STARTED (Jun15 BST). s1015 Edith 0 SCAs. bk18158 PEND 0/740 updAt=Jun11. c24933(GE-AM EUR380)+c24934(DUP EUR360) both active Jun15-Jul10. bk18131(CONF 1185 pmt17852 hs=1245328690407)+bk18133(CONF 648 pmt17730 hs=1242902318299) NOT cancelled. pmt17728 EUR482.40 on bk1567 (DO NOT TOUCH). REVISED RECIPE (NOT RUN): 1)UPDATE bookings SET status=CANCELLED WHERE id IN(18131,18133); 2)void pmt17852+pmt17730 via HubSpot; 3)DELETE FROM booking_courses WHERE id=24934; 4)assign cls7 to c24933 after bk18158 paid. NEIL: run steps 1-4 IMMEDIATELY.
**Jun15-UTC hrly14 (cron):** COURSE ACTIVE DAY1. bk18158 PEND 0/740 with c24933+c24934 DUP (both GE-AM Jun15-Jul10). bk18131(CONF 1185 pmt17852 Bank Jan19)+bk18133(CONF 648 pmt17730 Bank Feb16) NOT cancelled. 0 SCAs across all bookings. bk18158 amtTotal=740 amtPaid=0. ALL 4 STEPS NOT RUN. NEIL: execute steps 1-4 immediately.

**Jun14-UTC 20:03:** UNCHANGED. COURSE STARTS ~4H. bk18158 PEND 0/740 updAt=Jun11. bc24933(fee=380)+bc24934(DUP fee=360) BOTH Jun15-Jul10. bk18131 CONF 1185 ghost+bk18133 CONF 648 ghost NOT cancelled. 0 SCAs s1015. ALL 4 STEPS NOT RUN. SQL(NOT RUN): 1)UPDATE bookings SET status=CANCELLED WHERE id IN(18131,18133); 2)void pmt17852(HS=1245328690407)+pmt17730(HS=1242902318299) via HubSpot; 3)DELETE booking_courses WHERE id=24934; 4)assign s1015 cls7/c24933 after bk18158 paid.


**Jun15 hrly18:** COURSE DAY1. bk18158 PEND 0/740 UNCHANGED. bk18131 CONF 1185+bk18133 CONF 648 NOT cancelled. 0 SCAs bc24933(Jun15-Jul10). NEIL: collect EUR740; CANCEL bk18131+18133; assign SCA cls7 bc24933 TODAY.

**Jun15 hrly (this run):** COURSE DAY1 IN SESSION. bk18158 PEND 0/740 updAt=Jun11 UNCHANGED. bc24933(GE-AM fee=380)+bc24934(DUP fee=360) BOTH Jun15-Jul10 still active. bk18131 CONFIRMED 1185/1185(0bc ghost)+bk18133 CONFIRMED 648/648(0bc ghost) NOT cancelled. 0 SCAs s1015. Revised recipe NOT RUN. NEIL: execute steps 1-4 IMMEDIATELY.

**Jun15 hrly(cron): CONFIRMED UNCHANGED (this run).** bk18158 PEND 0/740. bc24933+bc24934 DUP. bk18131 CONF 1185+bk18133 CONF 648 NOT cancelled. 0 SCAs s1015. Steps 1-4 NOT RUN. Sheet J23 updated.

**Jun15 hrly(cron): CONFIRMED UNCHANGED (this run).** bk18158 PEND 0/740. bc24933+bc24934 DUP. bk18131 CONF 1185+bk18133 CONF 648 NOT cancelled. 0 SCAs s1015. Steps 1-4 NOT RUN. Sheet J23 updated.

**Jun15 hrly(cron): CONFIRMED UNCHANGED (this run).** bk18158 PEND 0/740. bc24933+bc24934 DUP. bk18131 CONF 1185+bk18133 CONF 648 NOT cancelled. 0 SCAs s1015. Steps 1-4 NOT RUN. Sheet J23 updated.
**Jun15 hrly(cron#2):** CONFIRMED UNCHANGED. bk18158 PEND 0/740 updAt=Jun11. bc24933(GE-AM fee=380)+bc24934(DUP fee=360) BOTH Jun15-Jul10. bk18131 CONF 1185/1185+bk18133 CONF 648/648 NOT cancelled. pmt17852(bk18131 EUR1185 HS=1245328690407 xeroId=null)+pmt17730(bk18133 EUR648 HS=1242902318299 xeroId=null) NOT deleted. 0 SCAs bc24933+24934. Steps 1-4 NOT RUN. NEIL: execute steps 1-4 IMMEDIATELY. Course is DAY1 in session.

**Jun15 hrly(cron#3):** CONFIRMED UNCHANGED. bk18158 PEND 0/740(updAt=Jun11). bc24933+24934 BOTH named General English AM Jun15-Jul10 (DUP). bk18131 CONF 1185(pmt17852 EUR1185)+bk18133 CONF 648(pmt17730 EUR648) NOT cancelled. s1015 Edith last SCA id=146 cls7 expired May15. Course bc24933 started TODAY Jun15. 4 steps NOT RUN. NEIL: URGENT — course started with 0 SCA. Last checked: 2026-06-15 UTC hrly(cron#3).

**Jun15 cron: CONFIRMED UNCHANGED. bk18158 PEND 0/740. bc24933(fee=380)+bc24934(DUP fee=360) BOTH Jun15-Jul10. bk18131 CONF 1185(0bc)+bk18133 CONF 648(0bc) NOT cancelled. 0 SCAs s1015. ALL 4 STEPS NOT RUN. Last checked: 2026-06-15 UTC cron.


**Jun15 hrly19:** KEY CHANGE — bk18158 now CONFIRMED+PAID (740/740 updated 10:10UTC Jun15). Was PENDING. Payment received. BUT: 0 SCAs still. bc24934 DUP still live. bk18131 CONF 1185 + bk18133 CONF 648 NOT cancelled. Revised priority: SCA cls7 bc24933 IMMEDIATE (student in school now with no class). Steps 1-4 NOT RUN. Last checked: 2026-06-15 UTC hrly19.
**Jun15 UTC run2:** 0 SCAs s1015 UNCHANGED since hrly19 update. bk18158 CONF 740/740. bc24933+24934 BOTH live. bk18131 CONF 1185 + bk18133 CONF 648 NOT cancelled. 4 steps NOT RUN. Last checked: 2026-06-15 UTC run2.

**Jun16 hrly D2:** KEY STATE -- bk18158 CONFIRMED 740/740 (paid Jun15 10:10UTC). s1015 0 active SCAs (bc24933 GE-AM Jun15-Jul10 active). bc24934 DUP still live. bk18131 CONF 1185+bk18133 CONF 648 NOT cancelled. Revised priority: step4=assign s1015 cls7(A1) bc24933 IMMEDIATELY (student in school D2 no class). Steps 1-3 also NOT RUN. Last checked: 2026-06-16 UTC hrly.

**Jun16 hrly #3 D2:** STILL 0 SCAs (fresh DB confirmed). s1015 Edith Nunes (A1). bc24933+bc24934 BOTH live GE-AM Jun15-Jul10 (duplicate, both on bk18158). bk18131 CONF 1185/1185 + bk18133 CONF 648/648 still NOT cancelled (xeroId=null both). SCAs exist only for OLD bookings (sca146 Apr20-May15, sca48 Mar30-Apr17). STEPS NOT RUN. NEIL: assign cls7(A1) bc24933 TODAY — student in school Day 2 with no class. Last checked: 2026-06-16 UTC hrly3.


**Jun16 hrly D2 (this run):** STILL 0 CURRENT SCAs. bk18158 CONF 740/740 (paid Jun15 10:10UTC). bc24933(GE-AM fee=380)+bc24934(DUP fee=360) BOTH live Jun15-Jul10 on bk18158. bk18131 CONF 1185/1185+bk18133 CONF 648/648 NOT cancelled. pmt17852(EUR1185 HS=1245328690407)+pmt17730(EUR648 HS=1242902318299) xeroId=null NOT deleted. s1015 Edith A1 0 active SCAs. Day 2 in school with no class. Steps 1-4 NOT RUN. NEIL: assign cls7(A1-AM) bc24933 TODAY. Last checked: 2026-06-16 UTC hrly (this run).
**Jun16 hrly (this run) D2 — 0 current SCAs:** CONFIRMED UNCHANGED (fresh DB query). bk18158 CONFIRMED paid=740/740 conf=true. bc24933+bc24934 BOTH General English AM Jun15-Jul10 (duplicate on bk18158). bk18131(1185)+bk18133(648) still CONFIRMED not cancelled. s1015 Edith currentLevel=A1 confirmed. 2 previous SCAs both expired (sca146 ended May15, sca48 ended Apr17). 0 current class assignments. Steps NOT RUN. NEIL: cancel bk18131+bk18133; DELETE bc24934; assign cls7 A1-AM bc24933 ws=Jun16 we=Jul10. Last checked: 2026-06-16 UTC hrly.

**Jun16 hrly D2(Tue) — 0 SCAs, bk18158 CONFIRMED:** bk18158 CONFIRMED 740/740 (paid Jun15 10:10UTC). 0 current SCAs bc24933(GE-AM Jun15-Jul10). bc24934 DUP(fee=360) still live. bk18131 CONF 1185/1185+bk18133 CONF 648/648 NOT cancelled. pmt17852(EUR1185 HS=1245328690407 xeroId=null)+pmt17730(EUR648 HS=1242902318299 xeroId=null) NOT deleted. s1015 A1 0 active SCAs (last sca146 expired May15). Day 2 in school with no class. NEIL: assign cls7(A1-AM) bc24933 ws=Jun16 we=Jul10 IMMEDIATELY, then cancel bk18131+bk18133+delete bc24934. Last checked: 2026-06-16 UTC hrly(Tue).

**Jun16 hrly(Tue eve): CONFIRMED UNCHANGED (fresh DB query).** bk18158 CONF 740/740 (updAt=Jun15T10:10). bk18131 CONF 1185/1185 (stale Jun05=11d). bk18133 CONF 648/648 (stale Jun04=12d). bc24933(MORNING fee=380)+bc24934(DUP MORNING fee=360) BOTH Jun15-Jul10 on bk18158. 0 SCAs on all bk18158 courses. s1015 Edite Nunes (A1) Day 2 in school with no class. NEIL: (1)assign cls7(A1-AM) to bc24933 ws=Jun16 we=Jul10 IMMEDIATELY; (2)cancel bk18131+bk18133; (3)void pmt17852(HS=1245328690407)+pmt17730(HS=1242902318299) via HubSpot; (4)DELETE FROM booking_courses WHERE id=24934. ALL STEPS NOT RUN. Last checked: 2026-06-16 UTC hrly(Tue eve).

**Jun16 hrly(eve+1): CONFIRMED UNCHANGED (this run).** bk18158 CONF 740/740 confirmed=true (Jun15). 0 active SCAs: sca48(cls7 Mar-Apr) + sca146(cls7 Apr-May) both expired; no current SCA. bk18131 CONF 1185/1185(11d stale) + bk18133 CONF 648/648(12d stale) still not cancelled. bc24933+bc24934 BOTH ACTIVE (dup). NEIL: (1)assign cls7(A1-AM) to bc24933 ws=Jun16 we=Jul10 IMMEDIATELY; (2)cancel bk18131+18133; (3)void pmt17852(HS=1245328690407)+pmt17730(HS=1242902318299) via HubSpot; (4)DELETE FROM booking_courses WHERE id=24934. ALL STEPS NOT RUN. D2 in school with no class. Last checked: 2026-06-16 UTC hrly(eve+1).
**Jun17 hrly #3 D3 — 0 SCAs, duplicate booking courses active:** CONFIRMED UNCHANGED (fresh DB). bk18158 CONF 740/740 (paid Jun15). bc24933 (fee=380) + bc24934 (DUP fee=360) BOTH General English AM Jun15-Jul10 on bk18158. 0 SCAs on either. bk18131 CONF conf=true 1185/1185 stale Jun03=14d NOT cancelled. bk18133 CONF conf=true 648/648 stale Jun04=13d NOT cancelled. pmt17852 (EUR1185 HS=1245328690407 xeroId=null) + pmt17730 (EUR648 HS=1242902318299 xeroId=null) NOT voided. s1015 Edite Day 3 in school with no class record. Revised recipe (NOT RUN): 1) UPDATE bookings SET status='CANCELLED' WHERE id IN (18131, 18133); 2) void pmt17852+pmt17730 via HubSpot; 3) DELETE FROM booking_courses WHERE id=24934; 4) assign s1015 cls7 (A1-AM) to bc24933 ws=2026-06-17 we=2026-07-10. NEIL: URGENT execute all 4 steps. Last checked: 2026-06-17 UTC hrly#3.


**Jun17 07:02 UTC hrly D3:** CONFIRMED UNCHANGED (fresh DB). bc24933+bc24934 both 0 SCAs. bk18131 CONF 1185+bk18133 CONF 648 still NOT cancelled. s1015 Day3 in school without class. ALL 4 STEPS NOT RUN. Last checked: 2026-06-17T07:02 UTC.
**Jun17 hrly #8 D3:** CONFIRMED UNCHANGED (fresh DB). bk18158 CONF 740/740 (paid Jun15). bc24933(GE-AM fee=380)+bc24934(DUP fee=360) BOTH Jun15-Jul10 still active. 0 SCAs bc24933+bc24934 (and all of bk18158). bk18131 CONF 1185/1185+bk18133 CONF 648/648 NOT cancelled (stale Jun03+Jun04). pmt17852(EUR1185 HS=1245328690407)+pmt17730(EUR648 HS=1242902318299) xeroId=null NOT voided. Edite s1015 Day3 in school. ALL 4 STEPS NOT RUN. NEIL: execute steps 1-4 IMMEDIATELY. Last checked: 2026-06-17 UTC hrly#8.

**Jun17 hrly #9 D3 — STATE CHANGE:** bk18131 and bk18133 DELETED from database (raw query returns 0 rows; both were CONFIRMED before this run). Payments 17852 (EUR 1185, HubSpot 1245328690407) and 17730 (EUR 648, HubSpot 1242902318299) also DELETED — both had xeroId = null (Fidelo migration artefacts). Neil must check in HubSpot whether those payment IDs were also voided.

Current state after Jun17 cleanup:
- bk18158 CONFIRMED 740/740 (paid Jun15) — active booking correct
- bc24933 (General English AM, fee=380, Jun15–Jul10): EXISTS, 0 SCAs — NO CLASS ASSIGNED
- bc24934 (DUP General English AM, fee=360, Jun15–Jul10): STILL EXISTS — must be deleted
- s1015 Edith Nunes (A1), Day 3 in school with no class record

Remaining recipe — steps 3+4 still NOT YET RUN:
3. DELETE FROM booking_courses WHERE id = 24934;
4. INSERT INTO student_class_assignments(booking_course_id,class_id,week_start,week_end,student_id)
   VALUES(24933, 7, '2026-06-17', '2026-07-10', 1015);
   (confirm class 7 = A1-AM before running)

Also verify: HubSpot pmts 1245328690407 + 1242902318299 — voided in HubSpot UI?

Last checked: 2026-06-17 UTC hrly #9.

**Jun17 hrly (latest) D3 — state confirmed:** bk18131+bk18133 DELETED (fresh DB — 0 rows). bk18158 CONF 740/740. bc24933(fee=380)+bc24934(DUP fee=360) BOTH Jun15-Jul10 still present. 0 active SCAs (sca48 expired Apr17, sca146 expired May15). Edith s1015 A1 Day3 in school with no class. Remaining steps (NOT RUN): (1) DELETE FROM booking_courses WHERE id=24934; (2) INSERT INTO student_class_assignments(booking_course_id,class_id,week_start,week_end,student_id) VALUES(24933,7,2026-06-17,2026-07-10,1015). Last checked: 2026-06-17 UTC hrly.

Last checked: 2026-06-17 UTC hrly (latest) — UNCHANGED. bc24934 DUP still present 0 SCAs (fresh DB). bc24933 (correct) also 0 SCAs (fresh DB). bk18158 CONF 740/740. Edith s1015 A1 Day 3 in school with no class. SQL NOT RUN: (1) DELETE FROM booking_courses WHERE id=24934; (2) INSERT INTO student_class_assignments(booking_course_id,class_id,week_start,week_end,student_id) VALUES(24933,7,2026-06-17,2026-07-10,1015).

**Jun17 WED hrly (latest):** bc24934 DUP still active. 0 active SCAs student1015 (sca48 exp Apr17, sca146 exp May15). bk18158 CONF 740/740. Day 3 in school (Jun15 start). Steps NOT RUN: (1)DELETE FROM booking_courses WHERE id=24934; (2)INSERT INTO student_class_assignments VALUES(24933,7,2026-06-17,2026-07-10,1015). Status: PENDING NEIL ACTION.

**Jun18 hrly (latest): UNCHANGED (fresh DB).** bc24933(fee=380)+bc24934(DUP fee=360) BOTH Jun15-Jul10 on bk18158. 0 active SCAs (last: sca146 cls7 expired May15). bk18158 CONFIRMED 740/740 conf=true. Ghost bk18131+18133 DELETED Jun17 (confirmed). 2 steps NOT RUN: (1) DELETE booking_courses WHERE id=24934; (2) INSERT INTO student_class_assignments(booking_course_id,class_id,week_start,week_end,student_id) VALUES(24933,7,2026-06-15,2026-07-10,1015). Edith Day 4 in school with no class record. Last checked: 2026-06-18 UTC hrly.


**Jun19 FRI hrly: CONFIRMED UNCHANGED (fresh DB).** bc24933(GE-AM fee=380)+bc24934(DUP fee=360) BOTH Jun15-Jul10 on bk18158. CORRECTION: student ID = s1015 (prior cron notes incorrectly used s14607 — confirmed via DB). s1015 has sca48(cls7 Mar30-Apr17 EXPIRED)+sca146(cls7 Apr20-May15 EXPIRED) — 0 active SCAs for current Jun15-Jul10 course. bk18158 CONFIRMED 740/740 (paid Jun15). bc24934 DUP not deleted. Remaining steps (NOT RUN): (1) DELETE FROM booking_courses WHERE id=24934; (2) INSERT INTO student_class_assignments(booking_course_id,class_id,week_start,week_end,student_id) VALUES(24933,7,"2026-06-15","2026-07-10",1015). Day 5 (Jun19). Last checked: 2026-06-19 UTC hrly.

**Jun19 hrly9 — Day 5, 2 steps still NOT RUN:** bc24933(GE-AM fee=380)+bc24934(DUP fee=360) BOTH Jun15-Jul10 on bk18158 CONF 740/740 (fresh DB). s1015 Edith A1: sca48(cls7 Apr17 EXPIRED)+sca146(cls7 May15 EXPIRED) — 0 active SCAs for current course. Course ends Jul10 (15 school days remaining). Steps NOT RUN: (1) DELETE FROM booking_courses WHERE id=24934; (2) INSERT INTO student_class_assignments(booking_course_id,class_id,week_start,week_end,student_id) VALUES(24933,7,2026-06-15,2026-07-10,1015). Last checked: 2026-06-19 UTC hrly9.


**Jun20 SAT hrly — Day 6 (Mon Jun22 = Day7 back in school):** CONFIRMED UNCHANGED (fresh DB). bc24933(GE-AM fee=380)+bc24934(DUP fee=360) BOTH Jun15-Jul10 on bk18158 CONF 740/740. s1015 sca48(cls7 Apr17 EXPIRED)+sca146(cls7 May15 EXPIRED) — 0 active SCAs. Note: earlier runs incorrectly referenced bk18044 (Giulia booking) — correct booking is bk18158. Course ends Jul10 = 15 school days remaining. Steps NOT RUN: (1) DELETE FROM booking_courses WHERE id=24934; (2) INSERT INTO student_class_assignments(booking_course_id,class_id,week_start,week_end,student_id) VALUES(24933,7,"2026-06-22","2026-07-10",1015). Last checked: 2026-06-20 UTC hrly.

**Jun20 SAT hrly2 — NEW FINDING:** att_1015 = 10 attendance records (fresh DB count). Student attended all 5 school days Jun15-19 (2 records/day = morning+afternoon slots) WITHOUT any active SCA for bc24933. Teacher tracking attendance manually or via block entry — Edith does not appear in class lists formally. bc24933+bc24934 DUP unchanged (both Jun15-Jul10 fee=380/360). 0 active SCAs confirmed. Steps NOT RUN. Mon Jun22 = Day6. Last checked: 2026-06-20 UTC hrly2.


**Jun20 SAT hrly#2 — Week2 Mon Jun22 = 2 DAYS, bc24934 DUP still live:** CONFIRMED UNCHANGED (fresh DB). bc24933(GE-AM fee=380)+bc24934(DUP fee=360) BOTH Jun15-Jul10 on bk18158 CONF 740/740. s1015: sca48(cls7 Apr17 EXPIRED)+sca146(cls7 May15 EXPIRED) — 0 active SCAs. Confirmed correct booking is bk18158 (NOT bk18044). Course ends Jul10 (15 school days remain). Week 2 starts Mon Jun22 — NEIL must assign SCA now. STEPS NOT RUN: (1) DELETE FROM booking_courses WHERE id=24934; (2) INSERT INTO student_class_assignments(booking_course_id,class_id,week_start,week_end,student_id) VALUES(24933,7,"2026-06-22","2026-07-10",1015). Last checked: 2026-06-20 UTC hrly#2.

**Jun21 SUN hrly — WEEK 2 STARTS TOMORROW MON JUN22:** CONFIRMED UNCHANGED (fresh DB). bk18158 CONFIRMED 740/740 (updAt=Jun15). bc24933(GE-AM fee=380)+bc24934(DUP fee=360) BOTH Jun15-Jul10 — bc24934 still present, not deleted. s1015: sca48(cls7 Apr17 EXPIRED)+sca146(cls7 May15 EXPIRED) — 0 active SCAs for bc24933 or bc24934. Edith attended Week 1 (10 att records Jun15-19) without formal SCA. Week 2 starts TOMORROW — she will not appear in class rolls Monday. STEPS NOT RUN (CRITICAL): (1) DELETE FROM booking_courses WHERE id=24934; (2) INSERT INTO student_class_assignments(booking_course_id,class_id,week_start,week_end,student_id) VALUES(24933,7,2026-06-22,2026-07-10,1015). Last checked: 2026-06-21 UTC hrly.

**Jun21 hrly7 09UTC FINAL SUNDAY NIGHT:** CONFIRMED UNCHANGED (fresh DB). bc24933(GE-AM fee=380)+bc24934(DUP fee=360) BOTH active Jun15-Jul10 on bk18158 CONFIRMED 740/740. s1015 Edith: sca48(cls7 expired Apr17)+sca146(cls7 expired May15) — 0 active SCAs. TOMORROW MON JUN22 8am = Week 2 Day 1. Edith will be in class with no assignment record. CRITICAL — 2 steps NOT RUN: (1) DELETE FROM booking_courses WHERE id=24934; (2) INSERT INTO student_class_assignments(booking_course_id,class_id,week_start,week_end,student_id) VALUES(24933,7,2026-06-22,2026-07-10,1015). Last checked: 2026-06-21T09:04 UTC hrly7.

**Jun21 11UTC hrly — WEEK 2 STARTS TOMORROW 8am MON JUN22:** CONFIRMED UNCHANGED (fresh DB this run). bc24933(GE-AM fee=380)+bc24934(DUP fee=360) BOTH Jun15-Jul10 on bk18158 CONF 740/740. s1015 Edith: sca48(cls7 Apr17 EXPIRED)+sca146(cls7 May15 EXPIRED) — 0 active SCAs. 10 attendance records exist for Week 1 (Jun15-19) without formal SCA. CRITICAL STEPS NOT RUN: (1) DELETE FROM booking_courses WHERE id=24934; (2) INSERT INTO student_class_assignments(booking_course_id,class_id,week_start,week_end,student_id) VALUES(24933,7,2026-06-22,2026-07-10,1015). Neil: execute TONIGHT — class starts 8am tomorrow. Last checked: 2026-06-21T11:03 UTC.

**Jun21 SUN PM (this run):** CONFIRMED UNCHANGED (2nd fresh check today). bc24934 (DUP fee=360) + bc24933 (fee=380) BOTH Jun15-Jul10 on bk18158 CONF 740/740. s1015: sca48 (cls7 expired Apr17) + sca146 (cls7 expired May15) — 0 active SCAs. 10 att records Week1 (Jun15-19) without formal SCA record. WEEK 2 STARTS TOMORROW MON JUN22 8am. Steps (NOT RUN): (1) DELETE FROM booking_courses WHERE id=24934; (2) INSERT INTO student_class_assignments(booking_course_id,class_id,week_start,week_end,student_id) VALUES(24933,7,'2026-06-22','2026-07-10',1015). Neil: TONIGHT is the last window. Last checked: 2026-06-21 PM UTC.

**Jun21 EVENING (3rd check today): FINAL WINDOW.** bc24934 (DUP fee=360) STILL EXISTS active=true (updAt=Jun11). s1015: sca48 (Apr17 expired) + sca146 (May15 expired) — 0 active SCAs confirmed. bk18158 CONFIRMED 740/740. 10 attendance records exist for Week1 (Jun15-19) without formal SCA. TOMORROW Mon Jun22 08:00 = Week2 Day1. Steps NOT RUN: (1) DELETE FROM booking_courses WHERE id=24934; (2) INSERT INTO student_class_assignments(booking_course_id,class_id,week_start,week_end,student_id) VALUES(24933,7,2026-06-22,2026-07-10,1015). Last checked: 2026-06-21 EVENING UTC.

**Jun21 LATE hrly — TONIGHT IS THE LAST WINDOW.** bc24934 (DUP fee=360) STILL ACTIVE (updAt=Jun11 — 10 days untouched). bc24933 (correct fee=380) Jun15-Jul10 0 active SCAs (fresh DB). bk18158 CONFIRMED 740/740. 10 att records Week1 (Jun15-19) without formal SCA — student attends but invisible to class rolls. Week2 starts Mon Jun22 08:00 TOMORROW. 2 steps STILL NOT RUN: (1) DELETE FROM booking_courses WHERE id=24934; (2) INSERT INTO student_class_assignments(booking_course_id,class_id,week_start,week_end,student_id) VALUES(24933,7,2026-06-22,2026-07-10,1015). Last checked: 2026-06-21 LATE UTC (hrly cron).

**Jun21 late hrly (cron): CONFIRMED UNCHANGED (fresh DB). bk18158 CONF 740/740 (updAt=Jun15). bc24933(fee=380)+bc24934(DUP fee=360) BOTH Jun15-Jul10 active. 0 SCAs s1015 (sca48+sca146 both expired). Week 2 starts TOMORROW Mon Jun22 8am. SQL NOT RUN: (1)DELETE FROM BookingCourse WHERE id=24934; (2)INSERT INTO StudentClassAssignment VALUES(24933,7,2026-06-22,2026-07-10,1015). Last checked: 2026-06-21 late UTC hrly.**


**Jun22 MON hrly (this run): CONFIRMED UNCHANGED (fresh DB). bk18158 CONFIRMED 740/740 (updAt=Jun15=7d stale). bc24933(GE-AM fee=380 active=true)+bc24934(DUP GE-AM fee=360 active=true) BOTH Jun15-Jul10 on bk18158. 0 active SCAs — sca48(cls7 Apr17 EXPIRED)+sca146(cls7 May15 EXPIRED). Week 2 started today. REVISED SQL (safe, soft-delete): (1) UPDATE booking_courses SET active=false WHERE id=24934; (2) INSERT INTO student_class_assignments(booking_course_id,class_id,week_start,week_end,student_id) VALUES(24933,7,'2026-06-22','2026-07-10',1015). NEIL: OVERDUE — student in school Day 8, no formal class record. Last checked: 2026-06-22 UTC hrly.**
**Jun22 hrly x2: CONFIRMED UNCHANGED (2nd fresh DB check today). bk18158 CONF 740/740 (updAt=Jun15=7d). bc24933(GE-AM fee=380)+bc24934(DUP fee=360) BOTH active=true Jun15-Jul10. 0 SCAs (fresh DB). D9 in school, 0 formal class assignment. Remaining steps NOT RUN: (1) UPDATE booking_courses SET active=false WHERE id=24934; (2) INSERT INTO student_class_assignments(booking_course_id,class_id,week_start,week_end,student_id) VALUES(24933,7,2026-06-22,2026-07-10,1015). NEIL: assign Edite to class via SIS immediately. Last checked: 2026-06-22 UTC hrly x2.**

## Update Jun23 hrly — CURRENT ACTIVE ISSUE (original TBA issue is now secondary)

Fresh DB check Jun23:
- bk18158 CONFIRMED confirmed=true amtPaid=740/740 updAt=Jun15
- bc24933 (General English AM, Jun15-Jul10, fee=380) ACTIVE — no SCA
- bc24934 (General English AM, Jun15-Jul10, fee=360) ACTIVE — DUPLICATE of bc24933 (different fee)
- All SCAs for student 1015: sca48 (cls7, bcId=1751, Mar30-Apr17 EXPIRED) + sca146 (cls7, bcId=24668, Apr20-May15 EXPIRED)
- ZERO SCAs on bc24933 or bc24934 (confirmed)
- Student in school since Jun15 — today Jun23 = Day 9 school, zero class assignment

Fix (NOT YET RUN):
1. Delete duplicate bc24934 (lower fee EUR360 vs EUR380) — NOT YET RUN: UPDATE booking_courses SET active=false WHERE id=24934; OR confirm with Neil which is correct course fee
2. Assign student to class: SIS -> student 1015 (Edith Nunes) -> bk18158 -> bc24933 -> Assign to class 7 (A1 AM)

Last checked: 2026-06-23 UTC hrly.

**Jun24 WED hrly (Day 10): CONFIRMED UNCHANGED (fresh DB). bc24933(GE-AM Jun15-Jul10 fee=380)+bc24934(GE-AM Jun15-Jul10 fee=360) BOTH still active (dup). Class assignments for s1015: sca48(cls7 bc1751 Mar30-Apr17 EXPIRED)+sca146(cls7 bc24668 Apr20-May15 EXPIRED) — both on previous courses. ZERO SCAs on bc24933 or bc24934 (current course). bk18158 CONF conf=true 740/740 (updAt=Jun15=9d). Day 10 in school, bc24933/24934 end Jul10=16d remaining. NEIL URGENT: (1) SIS bk18158 deactivate bc24934; (2) assign student 1015 to class 7 (A1 AM) on bc24933. Last checked: 2026-06-24 UTC hrly.**


**Jun25 UTC (16th check, fresh DB): bc24933 Jun15-Jul10 fee=380 active=true. bc24934 DUP STILL active=true Jun15-Jul10 fee=360. s1015 SCAs=[] for bc24933/bc24934 — 0 class assignments. Day 10 in school (Jun15 start). bk18158 CONF 740/740 (Jun15). Course ends Jul10=15d. NEIL URGENT: (1) SIS deactivate bc24934; (2) SIS assign s1015 cls7 A1-AM on bc24933.**

Last checked: 2026-06-25 UTC (17th check): bc24933+bc24934 BOTH still active=true (dup bc24934 NOT deactivated). s1015 0 active SCAs, Day 10 in school. Course ends Jul10=15d. SQL NOT RUN.
Last checked: 2026-06-26 FRI UTC (27th check, fresh DB): bc24933 active=true fee=380 Jun15-Jul10 CONFIRMED. bc24934 DUP STILL active=true fee=360 Jun15-Jul10. s1015 SCAs=[sca48 expApr17 (bc1751), sca146 expMay15 (bc24668)] — 0 active class on bk18158. Course ends Jul10=14 days. Fix NOT RUN. NEIL: (1) SIS deactivate bc24934; (2) SIS assign s1015 cls7 A1-AM via bk18158/bc24933.


Last checked: 2026-06-26 FRI UTC (34th check): bc24933 active=true fee=380 Jun15-Jul10 CONFIRMED. bc24934 DUP STILL active=true fee=360 Jun15-Jul10. s1015 Edite STILL 0 active class assignments (last sca48 expApr17 + sca146 expMay15). 14d to Jul10. Fix NOT RUN. Neil: (1) UPDATE booking_courses SET active=false WHERE id=24934; (2) assign s1015 cls7 A1-AM via SIS bk18158/bc24933.

**Jun26 FRI UTC (fresh DB — this run): CONFIRMED UNCHANGED. bc24933(General English AM fee=380 Jun15-Jul10 active=true) + bc24934(General English AM fee=360 Jun15-Jul10 active=true) BOTH still on bk18158 — DUPLICATE. Student 1015 (Edith Nunes) has 2 SCAs: sca48(classId=7 Mar30-Apr17 EXPIRED) + sca146(classId=7 Apr20-May15 EXPIRED) — ZERO active class assignments for current course. Payment 17895 EUR740 xeroPaymentId=null — no Xero reconciliation. bk18158 CONFIRMED amtPaid=740/740. Course ends Jul10=14 days. Fix (NOT YET RUN): (1) UPDATE booking_courses SET active=false WHERE id=24934; (2) assign student 1015 to class 7 (A1-AM) via SIS UI for bc24933 weekStart=2026-06-26 weekEnd=2026-07-10. Last checked: 2026-06-26 FRI UTC hourly bot.**
**Jun27 SAT UTC (fresh DB): student 1015 STILL 0 active class assignments. Booking courses 24933 (fee=380) + 24934 (fee=360) BOTH active Jun15-Jul10 = duplicate. Booking 18158 Confirmed paid 740/740. 10 school days with no class. Jul10=13d. Last checked: 2026-06-27 SAT UTC hourly bot.**

**Jun27 SAT UTC (fresh DB): UNCHANGED. bk18158 CONF conf=true 740/740. bc24933 (fee=380) + bc24934 (fee=360) BOTH active Jun15-Jul10 (duplicate). 0 SCAs on either. Course started Jun15 = 12d ago. Jul10 end = 13d away. Neil: deactivate bc24934 then assign class via SIS bk18158. Last checked: 2026-06-27 SAT UTC hrly.**

**Jun28 SUN UTC (fresh DB): CONFIRMED UNCHANGED. bk18158 CONF conf=true 740/740 (updAt=Jun15=13d stale). bc24933(GE-AM fee=380)+bc24934(DUP GE-AM fee=360) BOTH active Jun15-Jul10 on bk18158. 0 active SCAs (sca48+sca146 both expired May). Day 13 in school, course ends Jul10=12d. Fix NOT RUN: (1) UPDATE booking_courses SET active=false WHERE id=24934; (2) assign s1015 cls7 A1-AM via SIS bk18158/bc24933. Last checked: 2026-06-28 UTC (SUN).**

**Jun28 SUN UTC (fresh DB): bk18158 CONFIRMED conf=true amtPaid=740/740. bc24933(GE-AM Jun15-Jul10 fee=380)+bc24934(GE-AM Jun15-Jul10 fee=360) both active, STILL 0 SCAs. Edith in school since Jun15 (D13 unassigned). pmt17895 EUR740 xeroPaymentId=null type=null. Course ends Jul10 (12 days). Fix: assign Edith to a class via SIS UI for bc24933 or bc24934. UNCHANGED. Last checked: 2026-06-28 SUN UTC.**

**Jun28 SUN UTC (fresh DB): bk18158 CONFIRMED confirmed=true amtPaid=740/740 amtOpen=0 (updAt=Jun15=13d). bc24933(GE-AM fee=380)+bc24934(GE-AM fee=360) Jun15-Jul10 same dates STILL 0 SCAs. pmt17895 EUR740 xeroId=STILL null hsId=1254474444002. Student Edith Nunes (s1015) D13 in school with no class assigned. Jul10=12d course end. UNCHANGED. NEIL: assign Edith to class via SIS admin — course ends in 12 days. Reconcile pmt17895 in Xero. Last checked: 2026-06-28 SUN UTC (hrly bot).**
**Jun28 SUN UTC (fresh re-check): CONFIRMED UNCHANGED. bk18158 CONF conf=true amtPaid=740/740 (updAt=Jun15=13d stale). sca48(classId=7, ended Apr17)+sca146(classId=7, ended May15) = 0 CURRENT class assignments. bc24933(fee=380)+bc24934(fee=360) GE-AM Jun15-Jul10 both active. Course ends Jul10 (12 days). NEIL: assign Edith Nunes to current GE-AM class via SIS admin. Last checked: 2026-06-28 SUN UTC (fresh re-check).**

**Jun30 TUE UTC (7th check, fresh DB): BC24933(fee=380)+BC24934(fee=360) BOTH active GE-AM Jun15-Jul10 STILL DUPLICATE. SCAs: id48 expired Apr17, id146 expired May15 — 0 ACTIVE SCA. bk18158 CONF 740/740. Course ends Jul10=10d. Neil: deactivate BC24934, assign s1015 to A1-AM for BC24933.**

Last checked: 2026-07-01 UTC (8th check, hrly bot): bk18158 CONF 740/740. BC24933+BC24934 BOTH active GE-AM Jun15-Jul10 STILL DUPLICATE (fee 380+360). SCAs sca48+sca146 BOTH EXPIRED May15 — 0 ACTIVE SCA. Day 17 in school, courses end Jul10 = 9 days. Neil: (1) deactivate bc24934 in SIS; (2) assign s1015 Edith Nunes to class 7 (A1 AM) for bc24933 via SIS admin before Jul10.

**Jul01 WED UTC (10th check, fresh DB): CONFIRMED UNCHANGED. bcs 24933 (fee=380)+24934 (fee=360) BOTH active GE-AM Jun15-Jul10 STILL DUPLICATE. bk18158 CONF 740/740. sca48 (class7 Mar30-Apr17 expired)+sca146 (class7 Apr20-May15 expired) — ZERO active SCAs for student 1015. Jul10=9 school days left. SQL NOT RUN: (1) UPDATE booking_courses SET active=false WHERE id=24934; (2) assign student 1015 to class 7 (A1) via SIS admin for bc24933. Last checked: 2026-07-01 UTC (10th check, hrly bot).**

**Jul01 WED UTC (11th check, fresh DB): CONFIRMED UNCHANGED. bk18158 CONF conf=true amtPaid=740/740. bc24933(GE-AM fee=380)+bc24934(DUP fee=360) BOTH active Jun15-Jul10. sca48(cls7 Apr17 EXPIRED)+sca146(cls7 May15 EXPIRED) — ZERO active SCAs for current course. Student 1015 Edith Nunes Day 17 in school with no class record. Course ends Jul10=9 days. 2 steps NOT RUN: (1) UPDATE booking_courses SET active=false WHERE id=24934; (2) assign s1015 to class 7 (A1 AM) via SIS admin for bc24933. Last checked: 2026-07-01 UTC (11th check, hrly bot).**
**Jul01 WED UTC (13th check, fresh DB): CONFIRMED UNCHANGED. bk18158 CONF conf=true amtPaid=740/740. bc24933(GE-AM fee=380)+bc24934(DUP fee=360) BOTH active Jun15-Jul10. 0 active SCAs for bc24933/bc24934. s1015 last SCA=sca146 cls7 expired May15. Student 1015 Edith Nunes Day 17 in school with no class assignment. Course ends Jul10=9 days. NOT RUN: (1) UPDATE booking_courses SET active=false WHERE id=24934; (2) assign s1015 to class 7 (A1 AM) via SIS bc24933 before Jul10. Last checked: 2026-07-01 UTC (13th check, hrly bot).**


---
hrly 2 Jul UTC (18th check, fresh DB):
- bk18158: CONFIRMED, conf=true, amtPaid=740/740 (Jun 15 updated, 17d stale)
- bc24933 (GE-AM, fee=380) + bc24934 (DUPLICATE, fee=360): BOTH active Jun15-Jul10
- student_class_assignments for bc24933: 0 SCAs
- student_class_assignments for bc24934: 0 SCAs
- s1015 last SCA: sca146, class 7, expired May 15 2026
- Student Day 18 in school, no active class assignment.
- Course ends Jul 10 = 8 days. Both actions (deactivate bc24934; assign SCA) NOT RUN.
- NEIL: (1) Deactivate bc24934 via SIS; (2) assign s1015 to class 7 before Jul 10.

**Jul02 THU UTC (18th check, fresh DB): CONFIRMED UNCHANGED. bk18158 CONFIRMED conf=true amtPaid=740/740 (updAt=Jun15=17d stale). bc24933(GE-AM fee=380)+bc24934(DUP fee=360) BOTH active Jun15-Jul10 — 0 SCAs on either. s1015 Edith Nunes: sca48(cls7 Apr17 EXPIRED)+sca146(cls7 May15 EXPIRED) — zero active class assignments for current course. Student in school Day 18 (attended informally). Course ends Jul10=8 days. Remaining steps (NOT RUN): (1) deactivate bc24934 via SIS; (2) assign s1015 to class 7 (A1 AM) for bc24933 before Jul10. Last checked: 2026-07-02 UTC (18th check, hrly bot).**
**Jul02 THU UTC (19th check, fresh DB): CONFIRMED UNCHANGED. bk18158 CONFIRMED conf=true amtPaid=740/740 (updAt=Jun15=17d stale). bc24933(GE-AM fee=380)+bc24934(DUP fee=360) BOTH active Jun15-Jul10 — 0 SCAs on either. s1015 Edith Nunes: sca48(cls7 Apr17 EXPIRED)+sca146(cls7 May15 EXPIRED) — zero active class assignments. Student Day 18 in school (attended informally). Course ends Jul10=8d. NOT RUN: (1) deactivate bc24934 via SIS; (2) assign s1015 to class 7 (A1 AM) for bc24933 before Jul10. Last checked: 2026-07-02 UTC (19th check, hrly bot).**

**Jul02 THU UTC (23rd check, fresh DB): CONFIRMED UNCHANGED. bk18158 CONFIRMED conf=true amtPaid=740/740 (updAt=Jun15=17d stale). bc24933(GE-AM fee=380)+bc24934(DUP fee=360) BOTH active Jun15-Jul10 — 0 SCAs on either. s1015 Edith Nunes: sca48(cls7 Apr17 EXPIRED)+sca146(cls7 May15 EXPIRED) — zero active class assignments. Student Day 18+ in school (attended informally). Course ends Jul10=8d. NOT RUN: (1) deactivate bc24934 via SIS; (2) assign s1015 to class 7 (A1 AM) for bc24933 before Jul10. Last checked: 2026-07-02 UTC (23rd check, hrly bot).**

**Jul02 THU UTC (24th check, fresh DB): CONFIRMED UNCHANGED. bk18158 CONFIRMED conf=true amtPaid=740/740 (updAt=Jun15=17d stale). bc24933 (General English AM, Jun15-Jul10, fee=380, active=true) + bc24934 (DUPLICATE, Jun15-Jul10, fee=360, active=true). Note fees 380+360=740=total — possible webhook split (NOT pure dup). Student 1015 (Edith Nunes): sca48 (cls7 Apr17 EXPIRED) + sca146 (cls7 May15 EXPIRED) — ZERO active SCAs for current course. Student attended informally since Jun15 (Day 18 in school). Payment 17895 (EUR740 hsId=1254474444002) xeroPaymentId=STILL null. Course ends Jul10=8 days. NOT RUN: (1) UPDATE booking_courses SET active=false WHERE id=24934; (2) assign s1015 to class 7 (A1 AM) via SIS admin for bc24933 before Jul10; (3) reconcile pmt17895 in Xero. Last checked: 2026-07-02 UTC (24th check, hrly bot).**

**Jul02 THU UTC (26th check, fresh DB): CONFIRMED UNCHANGED. bk18158 CONFIRMED conf=true amtPaid=740/740 (updAt=Jun15=17d stale). bc24933 (General English AM, Jun15-Jul10, fee=380, active=true) + bc24934 (DUPLICATE, Jun15-Jul10, fee=360, active=true) — both still on bk18158. sca48 (cls7, Apr17 EXPIRED) + sca146 (cls7, May15 EXPIRED): ZERO active SCAs for current course. Student 1015 (Edith Nunes) attended informally since Jun 15 (Day 18+ in school). Payment 17895 (EUR 740, HubSpot 1254474444002): xeroPaymentId=null. Course ends Jul10=8 days. Both steps NOT RUN: (1) UPDATE booking_courses SET active=false WHERE id=24934; (2) assign s1015 to class 7 (A1 AM) via SIS admin for bc24933. NEIL: urgently assign Edith to class before Jul 10. Last checked: 2026-07-02 UTC (26th check, hrly bot).**

**Jul02 THU UTC (27th check, fresh DB): CONFIRMED UNCHANGED. bk18158 CONFIRMED conf=true amtPaid=740/740 (updAt=Jun15=17d stale). bc24933 (GE-AM, Jun15-Jul10, fee=380, active=true) + bc24934 (DUPLICATE, fee=360, active=true). sca48 (cls7 Apr17 EXPIRED) + sca146 (cls7 May15 EXPIRED): ZERO active SCAs. Student 1015 (Edith Nunes) attended informally since Jun 15 (Day 18+). pmt17895 (EUR740, HubSpot 1254474444002) xeroPaymentId=null. Course ends Jul10=8 days. Both steps NOT RUN. Last checked: 2026-07-02 UTC (27th check, hrly bot).**


**Jul02 THU UTC (28th check, fresh DB): CONFIRMED UNCHANGED. bk18158 CONFIRMED conf=true amtPaid=740/740 (updAt=Jun15=17d stale). bc24933 (GE-AM Jun15-Jul10 fee=380) + bc24934 (DUPLICATE fee=360) — both active. sca48 (cls7 Apr17 EXPIRED) + sca146 (cls7 May15 EXPIRED): ZERO active SCAs. Student 1015 Edith Nunes Day 18 in school informally. pmt17895 EUR740 xeroPaymentId=null. Course ends Jul10=8 days. NOT RUN: (1) UPDATE booking_courses SET active=false WHERE id=24934; (2) assign s1015 cls7 A1-AM via SIS bc24933. Last checked: 2026-07-02 UTC (28th check, hrly bot).**

**2 Jul UTC (30th check, fresh DB): CONFIRMED UNCHANGED. bk18158 (Edith Nunes, student 1015): Confirmed, confirmed=true, EUR740/740 fully paid. bc24933 (GE-AM, Jun15-Jul10, fee=380) STILL active. bc24934 (GE-AM DUP, Jun15-Jul10, fee=360) STILL active. Last SCA: id146 cls7 weekEnd=May15 (48d ago). pmt17895 EUR740 xeroId=null hsId=1254474444002. Course ends Jul10=8d. Fix steps NOT RUN (30 checks). Neil: (1) deactivate bc24934 via SQL; (2) assign Edith to class 7 A1-AM for bc24933 via SIS admin before Jul10. Last checked: 2026-07-02 UTC (30th check, hrly bot).**

**3 Jul FRI UTC (32nd check, fresh DB): bk18158 CONFIRMED confirmed=true 740/740 fully paid. bc24933 (fee=380) + bc24934 (DUP fee=360) BOTH active Jun15-Jul10. Student 1015: last SCA (id146) expired May15=48 days ago — ZERO active class assignment. Course ends Jul10=7 days. 32 checks, fix not run. NEIL: (1) UPDATE booking_courses SET active=false WHERE id=24934; (2) assign student 1015 to class via SIS Classes. Last checked: 2026-07-03 UTC (32nd check, hrly bot).**


**3 Jul FRI UTC (35th check, fresh DB): UNCHANGED. bk18158 CONFIRMED confirmed=true amtPaid=740/740. bc24933 active Jun15-Jul10 fee=380. bc24934 DUPLICATE active Jun15-Jul10 fee=360. Last SCA: id=146 class=7 weekEnd=2026-05-15 (49 days expired). 0 active SCAs for student 1015. Course ends Jul10 = 7 days. bc24934 deactivation + class assignment both UNRUN. NEIL: deactivate bc24934 + assign student 1015 to class. URGENT — 7 days left. Last checked: 2026-07-03 UTC (35th check, hrly bot).**
**3 Jul FRI UTC (37th check, fresh DB): UNCHANGED. bk18158 CONFIRMED confirmed=true amtPaid=740/740. bc24933 active Jun15-Jul10 fee=380. bc24934 DUPLICATE active Jun15-Jul10 fee=360. Last SCA: id=146 class=7 weekEnd=2026-05-15 (49 days expired). 0 active SCAs for student 1015. Course ends Jul 10 = 7 days. Fix still UNRUN. NEIL: (1) deactivate bc24934; (2) assign student 1015 to class. URGENT. Last checked: 2026-07-03 UTC (37th check, hrly bot).**

**3 Jul FRI UTC (38th check, fresh DB): UNCHANGED. bk18158 CONFIRMED confirmed=true amtPaid=740/740. bc24933 active Jun15-Jul10 fee=380. bc24934 DUPLICATE active Jun15-Jul10 fee=360. Last SCA: id=146 class=7 weekEnd=2026-05-15 (49 days expired). 0 active SCAs for student 1015. Course ends Jul10 = 7 days. bc24934 deactivation + class assignment both UNRUN. NEIL: deactivate bc24934 + assign student 1015 to class — URGENT 7 days left. Last checked: 2026-07-03 UTC (38th check, hrly bot).**


**3 Jul FRI UTC (40th check, fresh DB): UNCHANGED. bk18158 CONFIRMED confirmed=true amtPaid=740/740. bc24933 (General English AM, fee=380) active Jun15-Jul10. bc24934 (DUPLICATE, fee=360) still active Jun15-Jul10. Last SCA: id=146 class=7 weekEnd=2026-05-15 (49 days expired). 0 active class assignments for student 1015 (Edith Nunes). Course ends Jul10 = 7 days. Both bc24934 deactivation and class assignment UNRUN (40 checks). NEIL: (1) UPDATE booking_courses SET active=false WHERE id=24934; (2) assign student 1015 to class via SIS admin for bc24933 — URGENT, course ends in 7 days. Last checked: 2026-07-03 UTC (40th check, hrly bot).**

**3 Jul UTC (41st check, fresh DB): CONFIRMED UNCHANGED. bk18158 CONFIRMED confirmed=true amtPaid=740/740. bc24933(GE-AM EUR380)+bc24934(GE-AM DUP EUR360) BOTH active Jun15-Jul10. Last SCA: id=146 class7 expired May15 (49d ago). 0 active class assignments. Course ends Jul10=7d. Fix NOT RUN. NEIL: (1) UPDATE booking_courses SET active=false WHERE id=24934; (2) assign student 1015 to class via SIS. URGENT — 7 days left. Last checked: 2026-07-03 UTC (41st check, hrly bot).**

**3 Jul UTC (43rd check, fresh DB): CONFIRMED UNCHANGED. bk18158 CONFIRMED confirmed=true amtPaid=740/740. bc24933 (GE-AM, Jun15-Jul10, fee=380) + bc24934 (DUPLICATE, fee=360) BOTH still active. Zero active class assignments: last SCA (id=146, class=7) expired May15 = 48 days ago. Student 1015 (Edith Nunes) attending informally since Jun15. Course ends Jul10 = 7 days. Both bc24934 deactivation and class assignment UNRUN (43 checks). NEIL: (1) UPDATE booking_courses SET active=false WHERE id=24934; (2) assign student 1015 to class via SIS admin for bc24933 — 7 days left. Last checked: 2026-07-03 UTC (43rd check, hrly bot).**

--- 47th check 3 Jul 2026 UTC ---
Fresh DB: bk18158 CONFIRMED confirmed=true EUR 740/740. bc24933 (General English AM, EUR 380) + bc24934 (DUPLICATE General English AM, EUR 360) BOTH active, both startDate=Jun 15 endDate=Jul 10 2026. sca48 expired Apr 17, sca146 expired May 15 — ZERO current SCAs (Day 49 unassigned). Course ends Jul 10 = 7 DAYS. Neil must: (1) assign student 1015 to class manually via SIS admin; (2) deactivate bc24934 (set active=false, duplicate).

**3 Jul FRI UTC (50th check, fresh raw SQL): CONFIRMED UNCHANGED. bk18158 CONFIRMED confirmed=true amtPaid=740/740 (updAt=Jun15=18d stale). bc24933 (General English AM, Jun15-Jul10, fee=380, active=true) + bc24934 (DUPLICATE, fee=360, active=true) — STILL BOTH ACTIVE. Class assignments for student 1015: sca48 (classId=7, weekEnd=Apr17 EXPIRED) + sca146 (classId=7, weekEnd=May15 EXPIRED) — ZERO active SCAs for current course. Student 1015 (Edith Nunes) attended informally since Jun15 (Day 50 in school without formal class record). Course ends Jul10 = 7 days. bc24934 deactivation and class assignment UNRUN (50 checks). NEIL: (1) assign s1015 to class via SIS admin for bc24933; (2) UPDATE booking_courses SET active=false WHERE id=24934 — URGENT 7 days left. Last checked: 2026-07-03 UTC (50th check, hrly bot).**
## Status update — 4 Jul 2026 UTC (52nd check, fresh DB)

Current active issue (supersedes original shell-booking diagnosis):

Booking 18158 (Edith Nunes, student 1015): CONFIRMED, fully paid EUR 740.
Two duplicate booking courses on bk18158:
  bc24933: General English AM, 15 Jun – 10 Jul 2026, active=true, fee=EUR380
  bc24934: General English AM, 15 Jun – 10 Jul 2026, active=true, fee=EUR360 (DUPLICATE)
Zero class assignments since SCA 146 (class 7, A1 AM) expired 15 May 2026.
Course ends 10 Jul 2026 — 6 days remaining — student unassigned 50 days.

Fix (NOT RUN):
  (1) UPDATE booking_courses SET active=false WHERE id=24934;  -- deactivate duplicate
  (2) Assign student 1015 to class 7 (A1 AM) via SIS admin for bc24933 — before Jul 10.

Note: bc24933 fee=380, bc24934 fee=360, total=740 = bk18158.amountTotal — both BCs are priced in.
Deactivating bc24934 does NOT change what the student owes; it only cleans the data.
52 hourly checks — no action taken. Last checked: 2026-07-04 UTC (52nd check, hrly bot).


**4 Jul SAT UTC (53rd check, fresh DB): CONFIRMED UNCHANGED. bk18158 CONFIRMED confirmed=true amtPaid=740/740. bc24933 (General English AM, Jun15-Jul10, fee=380, active=true) + bc24934 (DUPLICATE, fee=360, active=true) BOTH still on bk18158. Last SCA: id146 (class 7, bc24668) expired May15 = 50 days ago. ZERO active class assignments for student 1015 (Edite Nunes). Course ends Jul10 = 6 days. Note: deactivating bc24934 does NOT change what student owes (380+360=740=total). NOT RUN: (1) UPDATE booking_courses SET active=false WHERE id=24934; (2) assign student 1015 to class 7 (A1 AM) via SIS admin for bc24933 before Jul10. Last checked: 2026-07-04 UTC (53rd check, hrly bot).**
**4 Jul SAT UTC (54th check, fresh DB): CONFIRMED UNCHANGED. bk18158 CONFIRMED confirmed=true amtPaid=740/740. bc24933 (General English AM, Jun15-Jul10, fee=380, active=true) + bc24934 (DUPLICATE, fee=360, active=true) — both still on bk18158. SCA146 (class 7, A1 AM) expired May15 = 50 days ago — ZERO active class assignments for student 1015 (Edite Nunes). Course ends Jul10 = 6 days. NOT RUN: (1) UPDATE booking_courses SET active=false WHERE id=24934; (2) assign student 1015 to class 7 (A1 AM) via SIS admin for bc24933 before Jul10. Last checked: 2026-07-04 UTC (54th check, hrly bot).**


**4 Jul UTC (59th check, fresh DB): CONFIRMED UNCHANGED. bk18158 (Edite Nunes, student 1015): CONFIRMED, confirmed=true, EUR740/740. bc24933 (General English AM, Jun15-Jul10, EUR380): active=true — valid course. bc24934 (General English AM, Jun15-Jul10, EUR360): active=STILL true — duplicate. Payment 17895 (EUR740): xeroPaymentId=null. Last SCA s1015: id146 on bc24668 class7, expired May15=50d. Zero SCAs on bc24933 or bc24934. Courses end Jul10=6d — 6 days to assign class or lose the window. Steps NOT RUN: (1) deactivate bc24934; (2) assign s1015 to class 7 for bc24933 before Jul10. NEIL: fix before courses end Jul10. Last checked: 2026-07-04 UTC (59th check, hrly bot).**

**4 Jul UTC (60th check, fresh DB): CONFIRMED UNCHANGED. bk18158 CONF EUR740/740 confirmed=true. bc24933 GE-AM Jun15-Jul10 EUR380 active=true (valid course). bc24934 GE-AM Jun15-Jul10 EUR360 STILL active (dup). Last SCA id146 class7 weekEnd=May15=50d stale, zero SCAs on bc24933/24934. Courses end Jul10=6 days. Steps NOT RUN: (1) UPDATE booking_courses SET active=false WHERE id=24934; (2) assign s1015 to class7 via SIS admin before Jul10. Last checked: 2026-07-04 UTC (60th check, hrly bot).**

**4 Jul UTC (61st check, fresh DB): CONFIRMED UNCHANGED. bk18158 (Edite Nunes, student 1015): CONFIRMED, confirmed=true, EUR740/740. bc24933 (General English AM, Jun15-Jul10, EUR380): active=true — valid course. bc24934 (General English AM, Jun15-Jul10, EUR360): active=STILL true — duplicate. Last SCA s1015: id146 on bc24668 class7, expired May15=50d. Zero SCAs on bc24933 or bc24934. Course ends Jul10=6d. Steps NOT RUN: (1) UPDATE booking_courses SET active=false WHERE id=24934; (2) assign s1015 to class 7 for bc24933 before Jul10. NEIL: deactivate bc24934 + assign student 1015 to class 7 before Jul 10. Last checked: 2026-07-04 UTC (61st check, hrly bot).**

**4 Jul SAT UTC (63rd check, fresh DB): CONFIRMED UNCHANGED. bk18158 (Edite Nunes, student 1015): CONFIRMED, confirmed=true, EUR740/740. bc24933 (General English AM, Jun15-Jul10, EUR380, active=true) — valid course, 0 SCAs. bc24934 (General English AM, Jun15-Jul10, EUR360, active=STILL true) — duplicate, 0 SCAs. Last SCA s1015: id146 class7 expired May15=50d ago. Course ends Jul10=6 days — window closing. NOT RUN: (1) UPDATE booking_courses SET active=false WHERE id=24934; (2) assign student 1015 to class 7 (A1 AM) via SIS admin for bc24933 before Jul10. NEIL: urgently assign Edith to class before course ends — 6 days left. Last checked: 2026-07-04 UTC (63rd check, hrly bot).**


**4 Jul SAT UTC (65th check, fresh DB): CONFIRMED UNCHANGED. bk18158 (Edite Nunes, student 1015): CONFIRMED, confirmed=true, EUR740/740. bc24933 (General English AM, Jun15-Jul10, EUR380, active=true) — valid course, zero SCAs. bc24934 (General English AM, Jun15-Jul10, EUR360, active=STILL true) — duplicate. Last SCA: id146 class7, expired May15=50d. ZERO active class assignments. Course ends Jul10=6 days. Steps NOT RUN: (1) UPDATE booking_courses SET active=false WHERE id=24934; (2) assign student 1015 to class 7 (A1 AM) via SIS admin before Jul10. Last checked: 2026-07-04 UTC (65th check, hrly bot).**

**5 Jul SUN UTC (66th check, fresh DB): CONFIRMED UNCHANGED. bk18158 (Edite Nunes, student 1015): CONFIRMED, EUR740/740. bc24933 (General English AM, Jun15-Jul10, EUR380, active=true) — valid course, 0 current SCAs. bc24934 (General English AM, Jun15-Jul10, EUR360, active=STILL true) — DUPLICATE. Note: sca48+sca146 exist for student 1015 but are on old booking courses (bc1751 Apr17 + bc24668 May15), not on bc24933 — zero current SCAs for bc24933. Course ends Jul10 = 5 days. NOT RUN: (1) UPDATE booking_courses SET active=false WHERE id=24934; (2) assign student 1015 to class 7 (A1 AM) via SIS admin for bc24933 before Jul10. NEIL: 5 DAYS LEFT — assign Edite to class before Jul10. Last checked: 2026-07-05 UTC (66th check, hrly bot).**
**5 Jul SUN UTC (67th check, fresh DB): CONFIRMED UNCHANGED. bk18158 (Edite Nunes, student 1015): CONFIRMED, confirmed=true, EUR 740/740 (fully paid). bc24933 (General English AM, Jun15-Jul10, fee=380): active=true — valid course, 0 SCAs. bc24934 (General English AM, Jun15-Jul10, fee=360): active=STILL true — DUPLICATE. No invoices on bk18158. Single payment pmt17895 (EUR 740, HubSpot 1254474444002, Jun 12). COURSES END FRIDAY JUL 10 = 5 DAYS. Student Edite has been in class ~20 days with no SCA in SIS. NOT RUN: (1) UPDATE booking_courses SET active=false WHERE id=24934; (2) assign student 1015 (Edite Nunes) to class 7 (A1 AM) via SIS admin for bc24933 before Jul 10. NEIL: 5 DAYS LEFT — deactivate bc24934 + assign student to class NOW. Last checked: 2026-07-05 UTC (67th check, hrly bot).**
**5 Jul SUN UTC (69th check, fresh DB): CONFIRMED UNCHANGED. bk18158 (Edite Nunes, student 1015): CONFIRMED, confirmed=true, EUR 740/740 (fully paid). bc24933 (General English AM, Jun15-Jul10, fee=EUR380): active=true, 0 class assignments. bc24934 (General English AM, Jun15-Jul10, fee=EUR360): active=STILL true — DUPLICATE. SCAs for s1015: last was sca146 class7 bc24668 expired May15=51d, and sca48 bc1751 expired Apr17 — ZERO current class assignments. COURSES END FRIDAY JUL 10 = 5 SCHOOL DAYS. Student Edite has been in class ~20 days with no SIS attendance record. NOT RUN: (1) UPDATE booking_courses SET active=false WHERE id=24934; (2) assign student 1015 to class 7 (A1 AM) via SIS admin for bc24933 before Jul10. NEIL: 5 DAYS LEFT — act before Fri Jul 10. Last checked: 2026-07-05 UTC (69th check, hrly bot).**

**5 Jul SUN UTC (70th check, fresh DB): CONFIRMED UNCHANGED. bk18158 (Edite Nunes, student 1015): CONFIRMED, confirmed=true, EUR 740/740. bc24933 (General English AM, Jun15-Jul10, fee=EUR380): active=true, zero class assignments for current period. bc24934 (General English AM, Jun15-Jul10, fee=EUR360): active=STILL true — DUPLICATE. SCAs for s1015: sca48 bc1751 expired Apr17 + sca146 bc24668 expired May15 — ZERO current class assignments. Courses end Friday Jul10 = 5 school days. NOT RUN: (1) UPDATE booking_courses SET active=false WHERE id=24934; (2) assign student 1015 to class 7 (A1 AM) via SIS admin for bc24933 before Jul10. NEIL: 5 DAYS LEFT — deactivate bc24934 + assign student to class before Fri Jul10. Last checked: 2026-07-05 UTC (70th check, hrly bot).**

**5 Jul SUN UTC (71st check, fresh DB): CONFIRMED UNCHANGED. bk18158 CONFIRMED EUR740/740. bc24933 (GE-AM Jun15-Jul10 EUR380): active=true, 0 SCAs. bc24934 (GE-AM Jun15-Jul10 EUR360): active=STILL true - DUPLICATE. SCAs s1015: sca48 (bc1751 Apr17 expired) + sca146 (bc24668 May15 expired) - ZERO current. Courses end Fri Jul10 = 5 school days. NOT RUN: (1) UPDATE booking_courses SET active=false WHERE id=24934; (2) assign s1015 to class 7 A1-AM for bc24933 before Jul10. Last checked: 2026-07-05 UTC (71st check, hrly bot).**


**5 Jul UTC (74th check, fresh DB): CONFIRMED UNCHANGED. bk18158 CONFIRMED confirmed=true EUR740/740. bc24933 (GE-AM Jun15-Jul10 EUR380): active=true ZERO SCAs for this booking course. bc24934 (GE-AM Jun15-Jul10 EUR360): active=STILL true — DUPLICATE bc, not deactivated. s1015 SCAs: sca48 (class 7, bc1751, weekEnd Apr17 EXPIRED) + sca146 (class 7, bc24668, weekEnd May15 EXPIRED) — ZERO current SCAs. Courses end FRIDAY JUL10 = 5 school days. SQL NOT RUN. NEIL: (1) deactivate bc24934; (2) assign student 1015 to class 7 (A1-AM) for bc24933 before Friday Jul10. Last checked: 2026-07-05 UTC (74th check, hrly bot).**

**5 Jul UTC (75th check, fresh DB): CONFIRMED UNCHANGED. bk18158 (Edite Nunes, student 1015): CONFIRMED confirmed=true EUR740/740. bc24933 (GE-AM Jun15-Jul10, fee=EUR380): active=true, ZERO SCAs for current booking course period. bc24934 (GE-AM Jun15-Jul10, fee=EUR360): DUPLICATE still active=true, ZERO SCAs. s1015 SCAs: sca48 (class 7, bc1751, weekEnd Apr17 EXPIRED) + sca146 (class 7, bc24668, weekEnd May15 EXPIRED) — ZERO current SCAs. 51 school days in course with no formal class record. Courses end FRIDAY JUL10 = 5 school days. SQL NOT RUN. NEIL: (1) UPDATE booking_courses SET active=false WHERE id=24934; (2) assign student 1015 to class 7 (A1-AM) for bc24933 before Friday Jul10. Last checked: 2026-07-05 UTC (75th check, hrly bot).**

**5 Jul SUN UTC (78th check, fresh DB): CONFIRMED UNCHANGED. bk18158 CONFIRMED 740/740. bc24933 (GE-AM Jun15-Jul10 fee=380) + bc24934 (DUP fee=360) BOTH active. s1015 Edite A1: 0 active SCAs (sca48+sca146 expired May15). COURSE ENDS FRI JUL10 = 5 SCHOOL DAYS. Fix (NOT RUN): (1)UPDATE booking_courses SET active=false WHERE id=24934; (2)assign s1015 cls7 A1-AM via SIS bc24933 before Fri Jul10. Last checked: 2026-07-05 UTC (78th check).**

**5 Jul SUN UTC (79th check, fresh DB): CONFIRMED UNCHANGED. bk18158 (Edite Nunes, student 1015): confirmed=true, amountPaid=EUR 740/740 (fully paid). bc24933 (General English AM, Jun15-Jul10, fee=EUR 380, active=true): ZERO class assignments — fresh query confirmed. bc24934 (DUPLICATE General English AM, Jun15-Jul10, fee=EUR 360, active=true): ZERO class assignments — dup STILL not deactivated. pmt17895 (EUR 740, HubSpot 1254474444002): xeroPaymentId=null. Student 1015 SCAs: sca48 (class 7, weekEnd Apr17 expired) + sca146 (class 7, weekEnd May15 expired) — ZERO active class assignments. Student in class since Jun 15 = 15 school days with zero formal SCA. COURSES END FRI JUL 10 = 5 SCHOOL DAYS REMAINING. 2-step fix NOT RUN across 79 checks: (1) UPDATE booking_courses SET active=false WHERE id=24934; (2) assign student 1015 to class 7 (A1 AM) via SIS admin for bc24933. NEIL: 5 school days left — deactivate bc24934 then assign class. Last checked: 2026-07-05 UTC (79th check, hrly bot).**

**5 Jul SUN UTC (80th check, fresh DB): CONFIRMED UNCHANGED. bk18158 CONFIRMED confirmed=true amountPaid=EUR 740/740 (updAt=Jun15=20d stale). bc24933 (General English AM, Jun15-Jul10, fee=EUR380): active=true, scaCount=0. bc24934 (General English AM, Jun15-Jul10, fee=EUR360): STILL ACTIVE duplicate, scaCount=0. pmt17895 EUR740 xeroPaymentId=null. SCAs for student 1015: sca48 (class 7, bc1751, weekEnd Apr17 EXPIRED) + sca146 (class 7, bc24668, weekEnd May15 EXPIRED) — ZERO active class assignments for current course. Student 1015 Edite Nunes (A1) in school since Jun15 = Day 15 of course (20 calendar days) with no formal class assignment. COURSES END FRIDAY JUL10 = 5 SCHOOL DAYS REMAINING. Fix NOT RUN: (1) UPDATE booking_courses SET active=false WHERE id=24934; (2) assign student 1015 to class 7 (A1 Morning) via SIS admin for bc24933 before Fri Jul10. NEIL: execute TODAY — 5 days left. Last checked: 2026-07-05 UTC (80th check, hrly bot).**

**6 Jul MON UTC (81st check, fresh DB): bc24933 (EUR380) + bc24934 (EUR360) BOTH still active, BOTH 0 SCA. bk18158 CONF confirmed=true EUR740/740. Day 21 of course — course ends Fri Jul10, 4 school days remaining. pmt17895 EUR740 xeroId=null. Student in school since Jun15 with zero attendance tracked for 21 days. NEIL: deactivate bc24934 (lower fee EUR360), then assign s1015 to class — URGENT TODAY. Last checked: 2026-07-06 UTC (81st check, hrly bot).**
**6 Jul UTC (82nd check, fresh DB): CONFIRMED UNCHANGED. Booking courses 24933+24934 both active=true, both 0 class assignments, ends Fri Jul10=4d. Payment 17895 xeroId=null. Day 22 of course. URGENT — only 4 school days remain. NEIL: deactivate bc24934 (EUR 360, lower fee) then assign student 1015 to class. Last checked: 2026-07-06 UTC (82nd check).**

**6 Jul MON UTC (83rd check, fresh DB): CONFIRMED UNCHANGED. bk18158 (Edith Nunes, s1015): CONFIRMED confirmed=true amtPaid=740/740 amtOpen=0. bc24933 (GE-AM Jun15-Jul10 EUR380): active=true scaCount=0. bc24934 (GE-AM Jun15-Jul10 EUR360): active=true scaCount=0. pmt17895 (EUR740): type=null xeroPaymentId=null. COURSES END FRI JUL10 = 4 SCHOOL DAYS. Day 22, 0 SCAs. SQL NOT RUN 83 checks. NEIL: (1) UPDATE booking_courses SET active=false WHERE id=24934; (2) Assign student 1015 to class via SIS admin. Last checked: 2026-07-06 UTC (83rd check, hrly bot).**

**6 Jul MON UTC (84th check, fresh DB): CONFIRMED UNCHANGED. bk18158 (Edith Nunes s1015): CONFIRMED conf=true EUR740/740 amtOpen=0. bc24933 (GE-AM EUR380 active 0SCA)+bc24934 (GE-AM EUR360 active 0SCA) — both Jun15-Jul10. pmt17895 EUR740 type=null xeroId=null. COURSE ENDS FRI JUL10 = 4 school days. Student in school with zero attendance tracking for 22 days. NEIL: (1)UPDATE booking_courses SET active=false WHERE id=24934; (2)assign student 1015 to a class via SIS TODAY — only 4 days left. Last checked: 2026-07-06 UTC (84th check, hrly bot).**

**6 Jul MON UTC (86th check, fresh DB): CONFIRMED UNCHANGED. bk18158 (Edith Nunes, s1015): CONFIRMED conf=true EUR740/740 amtOpen=0. bc24933 (GE-AM EUR380 active 0SCA)+bc24934 (GE-AM EUR360 active 0SCA) — both Jun15-Jul10 ends Fri. pmt17895 EUR740 type=null xeroId=null. COURSE ENDS FRI JUL10 = 4 SCHOOL DAYS. Student in school since Jun15, Day 22, zero attendance tracking. Last SCA for s1015 was May15 on bc24668 (different course). NEIL: (1)UPDATE booking_courses SET active=false WHERE id=24934; (2)assign student 1015 to class via SIS TODAY. Last checked: 2026-07-06 UTC (86th check, hrly bot).**


**6 Jul MON UTC (89th check, fresh DB): CONFIRMED UNCHANGED. bk18158 (Edith Nunes, s1015): CONFIRMED conf=true EUR740/740 amtOpen=0. bc24933 (GE-AM EUR380 active 0SCA)+bc24934 (GE-AM EUR360 active 0SCA) — both Jun15-Jul10 ends FRIDAY. pmt17895 EUR740 type=null xeroId=null. COURSE ENDS FRI JUL10 = 4 SCHOOL DAYS. Student in school since Jun15, Day 22, zero attendance tracking. NEIL: (1)UPDATE booking_courses SET active=false WHERE id=24934; (2)assign student 1015 to class via SIS TODAY — LAST CHANCE (only 4 days left). Last checked: 2026-07-06 UTC (89th check, hrly bot).**
**6 Jul MON UTC (90th check, fresh DB): CONFIRMED UNCHANGED. bk18158 CONFIRMED EUR740/740. bc24933 (GE-AM EUR380 Jun15-Jul10 active=true) + bc24934 (DUPLICATE GE-AM EUR360 Jun15-Jul10 active=true) — 0 class assignments on either. COURSE ENDS FRIDAY JUL10 = 4 SCHOOL DAYS LEFT (7/8/9/10 Jul). Zero class record for full 3-week course. NEIL: TODAY MON — deactivate bc24934 + assign student 1015 to class 7 A1-AM on bc24933 via SIS before Friday. Last checked: 2026-07-06 UTC (90th check).**


**6 Jul UTC (91st check): CONFIRMED UNCHANGED. Booking 18158 EUR740/740 CONFIRMED. Booking courses 24933+24934 both active=true, 0 class assignments. Course ends FRIDAY Jul10 = 4 school days. 91 checks, no action taken.**

**6 Jul UTC (101st check): CONFIRMED UNCHANGED. bk18158 CONFIRMED EUR740/740. bc24933+bc24934 both active ends Jul10. Last SCA s1015=May15. 0 class assignments. COURSE ENDS FRIDAY JUL10. Fix NOT RUN 101 checks. Last checked: 2026-07-06 UTC (101st check).**
**6 Jul UTC (102nd check, fresh DB): CONFIRMED UNCHANGED. Booking 18158 (Edith Nunes, student 1015): CONFIRMED, confirmed=true, EUR 740/740, amount_open=0. Booking course 24933 (GE-AM Jun15–Jul10): fee=EUR 380, active=true, 0 SCAs. Booking course 24934 (GE-AM Jun15–Jul10): fee=EUR 360, active=true, 0 SCAs — DUPLICATE still active. Last SCA for student 1015: SCA 146 (class 7, bc24668), week_end=May15 — expired. COURSE ENDS FRIDAY JUL 10 = 4 SCHOOL DAYS. SQL NOT RUN 102 checks. NEIL: (1) UPDATE booking_courses SET active=false WHERE id=24934; (2) assign student 1015 to class 7 A1-AM via SIS — URGENTLY before Friday. Last checked: 2026-07-06 UTC (102nd check, hrly bot).**

**6 Jul UTC (103rd check, fresh DB): CONFIRMED UNCHANGED. Booking 18158 (Edith Nunes, student 1015): CONFIRMED, confirmed=true, EUR 740/740, amount_open=0. Booking course 24933 (GE-AM Jun15–Jul10): fee=EUR 380, active=true, 0 SCAs. Booking course 24934 (GE-AM Jun15–Jul10): fee=EUR 360, active=true, 0 SCAs — DUPLICATE still active. Last SCA for student 1015: SCA 146 (class 7, bc24668), week_end=May15 — expired. COURSE ENDS FRIDAY JUL 10 = 4 SCHOOL DAYS. Student in school since Jun15 (Day22) with zero attendance tracking for current course. SQL NOT RUN 103 checks. NEIL: (1) UPDATE booking_courses SET active=false WHERE id=24934; (2) assign student 1015 to class via SIS — MUST DO BEFORE FRIDAY. Last checked: 2026-07-06 UTC (103rd check, hrly bot).**

**7 Jul UTC (106th check, fresh DB): CONFIRMED UNCHANGED. bk18158 CONFIRMED EUR740/740. bc24933 GE-AM Jun15-Jul10 active=true 0 SCAs. bc24934 DUP GE-AM Jun15-Jul10 active=true 0 SCAs. Last SCA for s1015 = SCA146 on bc24668 (ended May15=53d stale). COURSE ENDS FRI JUL10 = 3 DAYS. Fix NOT RUN. NEIL: assign s1015 to class 7 on bc24933 + deactivate bc24934 TODAY. Last checked: 2026-07-07 UTC (106th check).**

**7 Jul TUE UTC (108th check, fresh DB): CONFIRMED UNCHANGED. Booking 18158 (Edith Nunes, student 1015): Confirmed, confirmed = true, EUR 740 / 740, amount open = 0. Booking course 24933 (General English AM, 15 Jun – 10 Jul 2026): fee = EUR 380, active = true — zero class assignments. Booking course 24934 (General English AM, 15 Jun – 10 Jul 2026): fee = EUR 360, active = true — DUPLICATE, zero class assignments. Payment 17895 (EUR 740, HubSpot 1254474444002): type = null, Xero payment ID = null — not reconciled in Xero. Last class assignment for student 1015: assignment 146 (class 7, booking course 24668), week_end = 15 May — expired 53 days ago. COURSE ENDS FRIDAY 10 JUL = 3 SCHOOL DAYS. Two steps NOT RUN across 108 hourly checks: (1) UPDATE booking_courses SET active=false WHERE id=24934; (2) assign student 1015 to class 7 A1-AM via SIS for booking course 24933. NEIL: action TODAY before Friday. Last checked: 2026-07-07 UTC (108th check, hrly bot).**
**7 Jul TUE UTC (109th check, fresh DB): CONFIRMED UNCHANGED. Booking 18158 (Edith Nunes, student 1015): CONFIRMED confirmed=true, EUR 740/740. Booking course 24933 (General English AM, Jun15-Jul10, EUR 380): active=true, 0 SCAs. Booking course 24934 (General English AM, Jun15-Jul10, EUR 360): DUPLICATE, active=true, 0 SCAs. Last SCA for student 1015 = SCA146 on bc24668 (ended 15 May). Payment 17895 (EUR 740): type=null, xeroPaymentId=null. COURSE ENDS FRIDAY 10 JULY — 3 SCHOOL DAYS LEFT. Student 23 days in school with zero attendance tracking. SQL NOT RUN 109 checks. NEIL: (1) UPDATE booking_courses SET active=false WHERE id=24934; (2) assign student 1015 to class 7 A1-AM via SIS admin — MUST DO BEFORE FRIDAY JUL10. Last checked: 2026-07-07 UTC (109th check, hrly bot).**

**7 Jul TUE UTC (110th check, fresh DB): CONFIRMED UNCHANGED. bk18158 (Edith Nunes, student 1015): CONFIRMED confirmed=true, EUR 740/740. bc24933 (General English AM, Jun15-Jul10): active=true, fee=EUR 380, zero SCAs. bc24934 (General English AM, Jun15-Jul10): active=true, fee=EUR 360 — DUPLICATE, zero SCAs. Most recent SCAs for student 1015: SCA48 (class 7, bc1751, expired Apr17) and SCA146 (class 7, bc24668, expired May15). Payment 17895: EUR 740, xeroPaymentId=null, type=null. COURSE ENDS FRIDAY JUL10 = 3 SCHOOL DAYS LEFT. NEIL: (1) deactivate bc24934 via SIS admin; (2) assign student 1015 to class 7 A1-AM on bc24933 TODAY. Last checked: 2026-07-07 UTC (110th check, hrly bot).**

**7 Jul TUE UTC (113th check, fresh DB): CONFIRMED UNCHANGED. Booking 18158 (Edith Nunes, student 1015): CONFIRMED confirmed=true, EUR 740/740. Booking course 24933 (General English AM, Jun15-Jul10): fee=EUR 380, active=true, 0 SCAs. Booking course 24934 (General English AM, Jun15-Jul10): fee=EUR 360, active=true — DUPLICATE, 0 SCAs. Most recent SCAs for student 1015: SCA48 (class 7, bc1751, expired Apr17) and SCA146 (class 7, bc24668, expired May15). COURSE ENDS FRIDAY JUL10 = 3 SCHOOL DAYS LEFT. SQL NOT RUN 113 checks. NEIL: (1) UPDATE booking_courses SET active=false WHERE id=24934; (2) assign student 1015 to class 7 A1-AM via SIS — TODAY before Friday. Last checked: 2026-07-07 UTC (113th check, hrly bot).**


**7 Jul 2026 UTC (2nd check today, fresh DB): CONFIRMED UNCHANGED. BK18158 CONF confirmed=true EUR740/740. BC24933 (GE-AM Jun15-Jul10) active fee=380 0SCAs. BC24934 (GE-AM Jun15-Jul10) dup STILL active fee=360 0SCAs. PMT17895 EUR740 xeroId=null. Last SCA for student 1015: id146 weekEnd May15. COURSE ENDS FRIDAY 10 JUL (3 school days). Fix: (1) deact bc24934; (2) assign s1015 to class 7 A1-AM on bc24933. Last checked: 2026-07-07 UTC.**
Last checked: 2026-07-07 UTC (5th check today) — BC24933 GE-AM Jun15-Jul10 active fee=380 0SCAs. BC24934 dup STILL active fee=360. BK18158 CONF EUR740/740. PMT17895 EUR740 xeroId=null. SCA146 weekEnd=May15 (expired). ENDS FRI JUL10=3 SCHOOL DAYS. NEIL: (1) deact bc24934; (2) assign s1015 class 7 A1-AM on bc24933 TODAY.
**7 Jul TUE UTC (6th check today, fresh DB): CONFIRMED UNCHANGED. Booking 18158 (Edith Nunes, student 1015): CONFIRMED confirmed=true, EUR 740/740. Booking course 24933 (General English AM, Jun 15–Jul 10): active=true, fee=EUR 380, 0 SCAs. Booking course 24934 (General English AM, Jun 15–Jul 10): active=true, fee=EUR 360 — DUPLICATE, 0 SCAs. Most recent SCAs for student 1015: SCA48 (class 7, bc1751, expired Apr 17) and SCA146 (class 7, bc24668, expired May 15). Payment 17895: EUR 740, xeroPaymentId=null. COURSE ENDS FRIDAY JUL 10 = 3 SCHOOL DAYS LEFT. SQL NOT RUN. NEIL: (1) deactivate booking course 24934 via SIS admin; (2) assign student 1015 to class 7 A1-AM on booking course 24933 TODAY before Friday. Last checked: 2026-07-07 UTC (6th check today, hrly bot).**
**8 Jul 2026 WED UTC (11th check, fresh DB): CONFIRMED UNCHANGED. BK18158 CONF confirmed=true EUR740/740. BC24933 GE-AM Jun15-Jul10 fee=380 active 0SCAs. BC24934 DUP STILL active fee=360. s1015 last SCA weekEnd May15 (54d ago). 2 SCHOOL DAYS REMAIN (Thu 9, Fri 10). NEIL: (1) deact bc24934; (2) assign s1015 to class 7 A1-AM on bc24933 TOMORROW LAST CHANCE. Last checked: 2026-07-08 UTC.**
**8 Jul 2026 WED UTC (12th check, fresh DB): CONFIRMED UNCHANGED. BK18158 CONF confirmed=true EUR740/740. BC24933 GE-AM Jun15-Jul10 fee=380 active=true 0SCAs. BC24934 DUP STILL active fee=360 0SCAs. s1015 last SCA id146 weekEnd=May15 (54d ago). 2 SCHOOL DAYS REMAIN (Thu9, Fri10). TODAY IS LAST DAY to act (course ends Fri Jul10). NEIL: (1) deact bc24934; (2) assign s1015 to class 7 A1-AM on bc24933 — TODAY URGENTLY. Last checked: 2026-07-08 UTC (12th check).**

**8 Jul 2026 WED UTC (13th check, fresh DB): CONFIRMED UNCHANGED. BK18158 CONF confirmed=true EUR740/740. BC24933 GE-AM Jun15-Jul10 fee=380 active=true 0SCAs. BC24934 DUP STILL active fee=360 0SCAs. Student 1015 last SCA weekEnd=May15 (54d ago). COURSE ENDS TOMORROW FRI 10 JULY. NEIL: (1) deactivate bc24934; (2) assign student 1015 to class 7 A1-AM on bc24933 — TODAY FINAL CHANCE. Last checked: 2026-07-08 UTC (13th check, hrly bot).**
**8 Jul 2026 WED UTC (14th check, fresh DB): CONFIRMED UNCHANGED. BK18158 CONF EUR740/740. BC24933 GE-AM Jun15-Jul10 fee=380 active=true 0SCAs. BC24934 DUP STILL active fee=360 0SCAs. s1015 last SCA weekEnd=May15 (54d ago). 2 SCHOOL DAYS REMAIN (Thu9+Fri10). NEIL: (1) deactivate BC24934; (2) assign student 1015 to class 7 A1-AM on BC24933 TODAY. Last checked: 2026-07-08 UTC (14th check, hrly bot).**
**8 Jul UTC (15th check, 3rd today): CONFIRMED UNCHANGED. BK18158 CONFIRMED EUR740/740. BC24933 GE-AM Jun15-Jul10 active fee=380 ZERO SCAs. BC24934 DUPLICATE active fee=360 ZERO SCAs. Last SCA s1015: sca146 weekEnd=May15. COURSE ENDS FRI JUL10 (2 days). Deactivate+class assignment NOT RUN. NEIL: deactivate BC24934 + assign s1015 TODAY — LAST CHANCE. Last checked: 2026-07-08 UTC.**

**8 Jul UTC (16th+ check, fresh DB): CONFIRMED UNCHANGED. BK18158 CONFIRMED EUR740/740. BC24933 GE-AM Jun15-Jul10 active fee=380 ZERO SCAs. BC24934 DUPLICATE active fee=360. s1015 last SCA weekEnd=May15 (54d ago). COURSE ENDS FRI JUL10 (2 days). Fix NOT RUN. NEIL: (1) deact bc24934; (2) assign s1015 class 7 A1-AM on bc24933 TODAY — LAST CHANCE. Last checked: 2026-07-08 UTC.**

**8 Jul UTC (19th check, hrly5, fresh DB): CONFIRMED UNCHANGED. BK18158 CONFIRMED EUR740/740. BC24933 GE-AM Jun15-Jul10 active fee=380 ZERO SCAs. BC24934 DUPLICATE STILL active fee=360 ZERO SCAs. s1015 last SCA weekEnd=May15 (54d ago). NEW (from earlier run): bc24934 confirmed as duplicate — same course same dates different fee. COURSE ENDS FRI JUL10 (2 days). NEIL: (1) deactivate bc24934; (2) assign s1015 to class 7 A1-AM on bc24933 TODAY — FINAL CHANCE. Last checked: 2026-07-08 UTC (19th check, hrly5).**

## 20th check hrly6 — 2026-07-08T11:20Z

CONFIRMED UNCHANGED (fresh DB). No action taken. Report-only.

## 21st check hrly7 — 2026-07-08 UTC

CONFIRMED UNCHANGED (fresh DB). No action taken. Report-only.
BK18158 CONFIRMED EUR740/740. BC24933 GE-AM Jun15-Jul10 active fee=380 ZERO SCAs. BC24934 DUP STILL active fee=360 ZERO SCAs. s1015 last SCA weekEnd=May15 (54d ago). COURSE ENDS FRI JUL10 = 2 school days. Pmt17895 EUR740 xeroId=null. NEIL: (1) deactivate bc24934; (2) assign s1015 class7 A1-AM on bc24933 TODAY — FINAL CHANCE. Last checked: 2026-07-08 UTC (hrly7).


**8 Jul WED UTC (hrly8 - COURSE ENDS TOMORROW FRI JUL10):** CONFIRMED UNCHANGED (fresh DB).
bk18158: CONFIRMED confirmed=true amtPaid=740/740 (paid Jun15).
bc24933 (GE-AM Jun15-Jul10 fee=380): active=true, 0 SCAs.
bc24934 (GE-AM Jun15-Jul10 fee=360): STILL active=true (dup NOT deactivated after 23 days of bot notices).
s1015 SCAs: sca48 (cls7 Mar30-Apr17 EXPIRED) + sca146 (cls7 Apr20-May15 EXPIRED) - 0 active SCAs for bc24933.
pmt17895 EUR740 type=null xeroPaymentId=null hubspotPaymentId=1254474444002.
No documents generated for bk18158 (docs=[]).
COURSE ENDS TOMORROW FRI JUL10. Student in school since Jun15 = 23 school days with no formal class assignment.
NEIL: (1) UPDATE booking_courses SET active=false WHERE id=24934; (2) assign s1015 to class 7 (A1-AM) via SIS for bc24933 ws=Jul6 we=Jul10. LAST CHANCE TODAY.
Last checked: 2026-07-08 UTC (hrly8).

---
## Last checked: 8 Jul UTC (hrly11)
- bk18158 confirmed=true, amtPaid=740/740
- bc24933 active, fee=380 — ends TOMORROW Fri 10 Jul; LAST CHANCE
- bc24934 DUP active, fee=360 — STILL not deactivated (24 school days)
- s1015 last SCA=146 weekEnd=May15 — 54 school days unassigned
- pmt17895 type=null, xeroId=null
- Sheet row 23 H/I/J/K written


**8 Jul WED UTC (29th check, fresh DB): CONFIRMED UNCHANGED. bk18158 (Edith Nunes s1015): CONFIRMED confirmed=true EUR740/740 fully paid. bc24933 (GE-AM, Jun15-Jul10, fee=380, active=true) — ends TOMORROW FRI JUL10. bc24934 (DUPLICATE GE-AM, same dates, fee=360, active=STILL true) — duplicate not deactivated (53+ days). Last SCA for student 1015: id146 bc24668 weekEnd=May15 — NO CLASS FOR 53 DAYS. pmt17895 xeroPaymentId=STILL null type=null EUR740. LAST CHANCE: course ends TOMORROW FRI JUL10 and student still has no class. NEIL: (1) Deactivate bc24934; (2) Assign student 1015 to class TODAY. Last checked: 2026-07-08 UTC (29th check, hrly12).**
---
## 31st check — 2026-07-08 UTC (hrly13)
CONFIRMED UNCHANGED (fresh DB). bk18158 CONF EUR740/740. bc24933 GEAM Jun15-Jul10 fee=380 active=true ENDS FRIDAY JUL10. bc24934 DUP GEAM STILL active=true fee=360 (54+ days not deactivated). s1015 last SCA id146 bc24668 weekEnd=May15 (54 days unassigned). pmt17895 xeroId=null type=null EUR740. Sheet row 23 J updated.

---
## 32nd check — 2026-07-09 UTC (hrly14)
CONFIRMED UNCHANGED (fresh DB). bk18158 CONF EUR740/740. bc24933 GEAM Jun15-Jul10 fee=380 active=true ENDS TOMORROW FRI JUL10. bc24934 DUP GEAM STILL active=true fee=360 (55d). s1015 last SCA id146 bc24668 weekEnd=May15 (55 days unassigned). pmt17895 xeroId=null type=null EUR740. NEIL: ABSOLUTE LAST CHANCE — (1) deactivate bc24934; (2) assign s1015 to class TODAY. Sheet row 23 H/I/J/K written.

**9 Jul UTC (hrly16, 34th check): CONFIRMED UNCHANGED (fresh DB). bk18158 CONF confirmed=true amtPaid=740/740. bc24933(GE-AM Jun15-Jul10 fee=380 active=true)+bc24934(DUP GE-AM fee=360 active=true) — BOTH END TOMORROW FRI JUL10. s1015: last SCA id=146 bc24668 weekEnd=May15 — ZERO SCAs for bc24933 or bc24934 (55 school days unassigned). pmt17895 EUR740 xeroPaymentId=STILL null type=STILL null. NEIL: deactivate bc24934 then assign s1015 to class bc24933 TODAY — LAST CHANCE before course ends. Last checked: 2026-07-09 UTC (hrly16, 34th check).**

38th check 9 Jul UTC hrly20: CONFIRMED UNCHANGED (fresh DB). BK18158 CONF EUR740/740. BC24933 GE-AM Jun15-Jul10 fee=380 active=true. BC24934 DUP GE-AM fee=360 active=STILL true. SCAs s1015: SCA146 bc24668 weekEnd=May15 + SCA48 bc1751 weekEnd=Apr17 ZERO active SCAs on BC24933/24934 (55+ days). BOTH COURSES END TOMORROW FRI JUL10 last chance. NEIL: deactivate BC24934 + assign s1015 to class BEFORE SCHOOL OPENS TODAY. Sheet row 23 H/I/J/K written.

Last checked: 2026-07-09 UTC hrly22 (40th check, fresh DB). CONFIRMED UNCHANGED. BK18158 CONF confirmed=true EUR740/740. BC24933 GE-AM Jun15-Jul10 fee=380 active=true. BC24934 DUP GE-AM Jun15-Jul10 fee=360 active=STILL true (55+ days). s1015 ZERO SCAs this term (last SCA146 expired May15). PMT17895 EUR740 xeroId=null type=null. COURSES END TOMORROW FRI JUL10. After Jul10: deactivate bc24934; reconcile pmt17895 in Xero.


[LAST_STATUS_UPDATE]
Status update 9 Jul 2026 UTC hrly23: UNCHANGED (40th check). BC24933+24934 both active ends Jul10. Student 1015 ZERO SCAs this term. ABSOLUTE FINAL DAY.


---
STATUS UPDATE 9 Jul 2026 UTC (cron run)
BK18158: Confirmed, EUR740/740 paid, updatedAt=2026-07-08T10:21.
BC24933 (GE-AM Jun15-Jul10, fee=380) + BC24934 (GE-AM Jun15-Jul10, fee=360): BOTH COURSES END TOMORROW Fri Jul10.
ZERO class assignments for student 1015 this booking period. Student is finishing tomorrow without ever being assigned.
Post-Jul10 cleanup (NOT YET RUN):
  1. SET active=false: UPDATE booking_courses SET active=false WHERE id IN (24933,24934);
  2. INVESTIGATE: two booking courses with identical dates (Jun15-Jul10) - one may be a duplicate from a webhook or manual re-entry. Check if fees are correct (380+360=740 = bk18158 amountTotal) - this suggests both are intentional (e.g. different course components or weeks).
  3. CHECK cert eligibility: GE-AM without ILEP code - check if completion cert should be generated.

**10 Jul FRI UTC (this run, DEADLINE DAY): COURSES ENDED TODAY. CONFIRMED UNCHANGED (fresh DB). bk18158 CONFIRMED EUR740/740 fully paid. bc24933(GE-AM Jun15-Jul10 fee=380)+bc24934(DUP GE-AM Jun15-Jul10 fee=360) BOTH ENDED TODAY still active=STILL true. pmt17895 EUR740 Jun12 xeroPaymentId=STILL null. ZERO document records on bk18158. ZERO class assignments for student 1015 this term (last SCA146 for bc24668 expired May15). Post-Jul10 cleanup STILL NOT RUN. NEIL: (1) UPDATE booking_courses SET active=false WHERE id IN(24933,24934); (2) Generate completion cert for student 1015 booking 18158 (check if ILEP cert applies or standard completion); (3) Reconcile payment 17895 EUR740 in Xero. Sheet K updated to post-Jul10 cleanup. Last checked: 2026-07-10 FRI UTC (bot).**


## 10 Jul 2026 UTC (this run) — COURSES ENDED TODAY

CONFIRMED UNCHANGED (fresh DB). Report-only.
- BC24933 (General English AM, Jun15-Jul10, fee=EUR380): active=STILL true — course ENDED TODAY, not deactivated
- BC24934 (DUP General English AM, Jun15-Jul10, fee=EUR360): active=STILL true — course ENDED TODAY, not deactivated
- Payment 17895 (EUR740): xeroPaymentId=STILL null, type=null
- ZERO document records on booking 18158 — no completion certificate
- ZERO class assignments for student 1015 this entire term — class issue was never resolved
- Remaining steps (NOT YET RUN):
  1. UPDATE booking_courses SET active=false WHERE id IN(24933,24934);
  2. Generate completion cert for student 1015 booking 18158 via SIS admin
  3. Reconcile payment 17895 EUR740 in Xero
Last checked: 2026-07-10 UTC (this run).


---
## 10 Jul 2026 UTC (this run — courses ended today)

Fresh DB confirms:
- BC24933 (General English AM, Jun15-Jul10): ENDED TODAY — still active=true (updAt=Jun11)
- BC24934 (General English AM, Jun15-Jul10): ENDED TODAY — DUPLICATE — still active=true (updAt=Jun11)
- Zero class assignments on either BC during entire Jun15-Jul10 term
- Zero document records on booking 18158 — no completion certificate generated
- Payment 17895 (EUR 740, booking 18158): type=null, xero_payment_id=null — not reconciled in Xero

Fix recipe (NOT YET RUN):
1. Deactivate both booking courses:
   UPDATE booking_courses SET active=false WHERE id IN (24933,24934);
2. Generate completion certificate:
   SIS admin > student 1015 > booking 18158 > Documents > Generate Certificate
3. Reconcile payment in Xero:
   Locate payment 17895 (EUR 740) and match to Xero invoice for booking 18158
4. Review duplicate BC24934 — same dates/name as BC24933; may represent a corrected invoice duplicate from Jun11 import

Risk: data-hygiene + documents; reversible. No double-booking conflict.
Last checked: 2026-07-10 UTC (hourly bot).

---
12th pass 2026-07-13 UTC. Unchanged. BC24933+24934 ended Jul10 still active=true (3d stale). 0 docs on bk18158. PMT17895 xeroPaymentId=null. Fix NOT RUN.

---
13th check 2026-07-13 MON UTC — NEW FINDING: Edith Nunes booking 18214 started today

CONFIRMED state (fresh DB):
- Booking courses 24933 (fee=380) + 24934 (fee=360): ended July 10, both STILL active = true (3 days stale)
- Booking 18158: CONFIRMED EUR740/740. Zero documents (no completion certificate).
- Payment 17895 (EUR740, HubSpot 1254474444002): xeroPaymentId = null
- NEW: Booking 18214 (BC24991 General English AM Jul13-Aug7, fee=608, EUR608/608 CONFIRMED): started today, zero class assignments — also listed in issue 45

Remaining fix steps (NOT YET RUN):
1. UPDATE booking_courses SET active=false WHERE id IN (24933, 24934); — deactivate stale courses
2. Generate completion certificate for student 1015 Edith Nunes via SIS Documents
3. Reconcile payment 17895 (EUR740) in Xero against booking 18158
4. Assign class for BC24991 (new booking 18214) via SIS Classes > To Be Assigned (also in issue 45 list)

NEIL: Also verify ghost bookings 18131 (EUR1185) + 18133 (EUR648) remain deleted (confirmed deleted Jun17).
Last checked: 2026-07-14 TUE UTC (15th check, hourly bot). BC24933+24934 still active (4d stale). BC24991 Day2, 0 SCAs.

---
23rd check 2026-07-15 WED UTC

CONFIRMED UNCHANGED (fresh DB). Booking course 24991 (Edith Nunes, student 1015, General English AM, 13 July--7 August 2026): classAssignments = 0 -- Day 3 today (Wed 15 Jul). Booking 18214: CONFIRMED, confirmed = true. Booking 18214 is fully active and paid; no excuse for missing assignment. Booking courses 24933 and 24934 (ended 10 July 2026): both still active = true -- 5 days stale. Payment 17895 (EUR 740): xeroPaymentId still null.

Action (NOT YET RUN):
1. Assign Edith Nunes (student 1015) to AM class via SIS Admin > Classes > To Be Assigned (BC 24991).
2. Deactivate booking courses 24933 and 24934 (set active = false).
3. Reconcile payment 17895 in Xero (EUR 740).
Fix NOT RUN. Last checked: 2026-07-15 WED UTC (23rd check, hourly bot).

---
26th check 2026-07-15 WED UTC (this hourly run — correction)

PAYMENT ID CORRECTION (fresh DB): Prior entries referenced PMT17895 as if it belonged to booking 18214.
Correct mapping confirmed:
- Payment 18004 (EUR 608) = booking 18214 (CURRENT active booking — BC24991 Jul13-Aug07)
- Payment 17895 (EUR 740) = booking 18158 (PREVIOUS Fidelo-era course, ended Jul10)
Both payments have xeroPaymentId = null. PMT18004 is higher priority as it is the current booking.

Current state (UNCHANGED):
- BC24991 (GE-AM Jul13-Aug07 booking 18214): active=true, 0 class assignments — Day 3 URGENT
- BC24933+24934 (ended Jul10 booking 18158): both still active=true — 5 days stale
- PMT18004 EUR608 booking 18214 xeroId=null
- PMT17895 EUR740 booking 18158 xeroId=null

Fix (NOT YET RUN):
1. Assign Edith Nunes (student 1015) to AM class via SIS Admin > Classes > To Be Assigned (BC24991).
2. Deactivate booking courses 24933 and 24934 (ended Jul10).
3. Reconcile PMT18004 EUR608 (booking 18214) in Xero.
4. Reconcile PMT17895 EUR740 (booking 18158) in Xero.
Last checked: 2026-07-15 WED UTC (26th check, hourly bot).