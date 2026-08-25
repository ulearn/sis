# Issue 11 — Valeriya Salauyova / Egor Solovyov
Reporter: AC · Area: Booking · Sheet row 12

## Symptom
Egor Solovyov (believed to be Valeriya father) appears in SIS as a student starting Jun 8.
Valeriya is 16, travelling alone, staying with host family.
Note: deal URLs in sheet col C are WRONG — belong to Sofiia Korkishchenko (Issue 7).

## Root Cause
HS deal 503015191778 (Valeriya Salauyova - 4 w Host Family with Full board, closedwon May 14)
was under Egor Solovyov contact (HS ID 745052118203, solovyov.by@gmail.com).
SIS stores as deal 495706369263 (both IDs resolve to same HS deal).

Webhook created booking for deal CONTACT (Egor), not named student (Valeriya).

EGOR st14502 bk17912 CONFIRMED deal=495706369263
  Course c24696: General English AM Plus startDate=endDate=2026-06-08 (1-DAY ERROR weeks=4 fee=603)
  No accommodation.
  Payments: pay17428=1125 pay17429=653 pay17431=653 pay17432=1125 = EUR 3556 total

VALERIYA st1063 bk1622 CONFIRMED hubspotDealId=NULL
  Course c1808: Morning General Plus Jun8-Jul3 (4 weeks) fee=900 fideloCourseId=64617
  Accommodation a11280: Host Family Full Board Jun6-Jul4 bedId=188
  Payment: pay17152=653 only

Valeriya has NO HubSpot contact record. She is a Fidelo returning student -> NOT in arrivals.

## Fix Recipe (NOT YET RUN)

Option A — Keep bk1622 fix payments and deal link (RECOMMENDED)
bk1622 already has correct course dates accommodation.

Step 1: Move payments to bk1622:
  UPDATE Payment SET bookingId=1622 WHERE id IN (17428,17429,17431,17432);

Step 2: Link deal to Valeriya booking:
  UPDATE Booking SET hubspotDealId=495706369263 WHERE id=1622;

Step 3: Cancel Egor phantom booking:
  UPDATE Booking SET status=CANCELLED WHERE id=17912;

Step 4: Fix sheet col C to HS deal 503015191778
  https://app-eu1.hubspot.com/contacts/26488591/record/0-3/503015191778

Option B — Reassign bk17912 to Valeriya (NOT recommended - more risk)

## Arrivals gap
Valeriya is returning student (fideloCourseId on c1808) -> filtered out of arrivals.
See Issue 7 recipe for renewals arrivals gap solution.

## Risk: bookings + money · reversible · blast: 2 bookings 5 payments

---

POST-FIX STATE (applied 2026-06-05)

What was done (per sheet I column):
- bk1622 (Valeriya Fidelo dup) DELETED
- Egor st14502 DELETED
- bk17912 REASSIGNED to Valeriya st1063 (confirmed in DB)
- bk17912 CONFIRMED, amountPaid=amountTotal=1938, amountOpen=0, serviceStart=Jun6, serviceEnd=Jul4

Residuals (non-blocking):
1. bk17912 dup payment rows: 4 records (ids 17428-17432, 2 May-18 dup pairs). Balance correct. Cosmetic.
2. Valeriya#1063 hubspotContactId=null — no HS contact linked. Minor CRM gap.
3. Egor HS contact 745052118203 still has student_id=14502 (deleted). Fix: clear property in HS.

Status: FIXED (main issue). Residuals low priority.
Last checked: 2026-06-05 UTC


---
14 Jul TUE UTC (fresh DB): CONFIRMED UNCHANGED. Student 1063 (Valeriya Salauyova) hubspotContactId=STILL null (35 days since 9 June 2026). Booking 17912: CONFIRMED EUR1938/1938 confirmed=true (updAt=Jul08). Low priority cosmetic. NEIL: set hubspotContactId for student 1063 when convenient. Last checked: 2026-07-14 UTC.

**15 Jul WED UTC (fresh DB):** Student 1063 Valeriya Salauyova hubspotContactId=STILL null (36d since Jun09). BK17912 CONFIRMED EUR1938/1938 confirmed=true (updAt=Jul08). UNCHANGED. Low priority cosmetic. Last checked: 2026-07-15 UTC.


**17 Jul FRI UTC (fresh DB):** Student 1063 Valeriya Salauyova hubspotContactId=STILL null (38d since Jun09). BK17912 CONFIRMED EUR1938/1938 confirmed=true (updAt=Jul08). UNCHANGED. Low priority cosmetic. Fix NOT RUN. Last checked: 2026-07-17 UTC.


**24 Jul FRI UTC (fresh DB):** Student 1063 Valeriya Salauyova hubspotContactId=STILL null (45d since Jun09). BK17912 CONFIRMED EUR1938/1938 confirmed=true (updAt=Jul08). UNCHANGED. Low priority cosmetic. Fix NOT RUN. Last checked: 2026-07-24 UTC.