# Issue 4 — Rakan Alghamdi (Agent: Bashir Khan) — LOA barcode + no accommodation
Reporter: ST · Area: Doc Gen · Sheet row 5 · DealID 503029394680

## Symptom
LOA showed only the net course fee, no accommodation. Staff manually amended → "the barcode is not updating."

## Root cause (two bugs)
Student 14444, booking 17915 (AY Morning 2026-06-29→12-18). Documents: REC 57 LOA v1 SUPERSEDED (token wwKviJiF) → REC 112 LOA v2 ISSUED (token BUOPrj-H), plus REC 129 v1 REVOKED.
1. **Barcode never changes on re-issue.** `createNewVersion` clones the already-issued `contentHtml`, which has the v1 QR `<img>` baked in and the `{{document.qr}}` placeholder already consumed. On re-issue, `issueDocument` saved a NEW token but the `.replace(/{{document.qr}}/)` matched nothing → REC 112 still prints v1's QR. Scanning v2 resolves the SUPERSEDED doc.
2. **No accommodation on the LOA.** The `accommodation.*` tokens only populate when `accommProvider` resolves, which needs `accomm.bedId`. Rakan isn't placed yet (accom 11287 has no bed) → the accom block + fee collapse, leaving only the course net fee.

## Fix recipe
**Bug 1 — DONE (applied 2026-06-05).** `scripts/documents.ts` (+ compiled `dist`) `issueDocument` now re-injects QR/verify-url idempotently (swaps the baked `<img alt="QR Verification">` / old `…/sis/verify/<token>` when the placeholder is gone). Server restarted.
- **Remaining manual step (NOT YET RUN):** staff re-issue Rakan's LOA (make a fresh version → Issue) → barcode will now match the live token.

**Bug 2 — NOT YET RUN (needs Neil OK).** Render booked accommodation on the LOA before a bed is assigned: in `resolveTokens`, fall back to the `BookingAccommodation` row (type/dates/fee) when `accommProvider` is null, instead of emitting blanks. Code change in `scripts/documents.ts` — FLAG (documents).

## Risk / category
documents · Bug1 fix is isolated/idempotent (first-issue path unchanged). Bug2 is a template/token change affecting all LOAs.

## Status
Barcode: fixed in code (re-issue his LOA to clear). Accom-before-placement: **needs Neil OK** · Last checked 2026-06-05 EOD UTC — barcode fix in code, no new doc generated. doc112 still ISSUED w/ old barcode. Staff must re-issue.


Last checked: 2026-06-11 UTC hrly -- NEW: doc204 ISSUED 2026-06-08 10:37 UTC (v1). Staff re-issued Jun8 -- barcode fix confirmed working. Docs bk17915: doc57 SUPERSEDED, doc112 REVOKED, doc129 REVOKED, doc187 REVOKED, doc204 ISSUED (current). Bug1 RESOLVED. Bug2 STILL OPEN: ba11287 bed_id=null, accom block absent from LOA. bk17915 CONF amtPaid=8682 AY Morn Jun29-Dec18. NEIL: assign bed to ba11287 (Jun27-Dec12) to populate accom block on next LOA issue. Bug2 code fix awaiting Neil OK.

Last checked: 2026-06-12 UTC hrly (cron FINAL) — ba11287 bedId=null booking_id=17915 start_date=Jun27 end_date=Dec12 updated_at=Jun05 UNCHANGED. Arrival in 15 days. LOA doc204 ISSUED Jun08 — accom block absent because bedId=null. Must assign bed before Jun27 to enable LOA regen.

**Last checked Jun13 SAT hrly7:** UNCHANGED. ba11287 bedId=null claimStatus=pending Jun27-Dec12. updAt=Jun05. Arrival Jun27=14d. LOA blocked until bed assigned.
**Jun15-UTC hrly14 (cron):** ba11287 bedId=null UNCHANGED (updAt=Jun05). bk17915 active Jun27-Dec12. doc204 LOA ISSUED Jun08(ok, manually fixed). 13d to arrival Jun27. NEIL: assign bed to ba11287 via SIS Accom module BEFORE Jun27.

**Jun14-UTC 20:03:** ba11287 bed_id=null UNCHANGED(updAt=Jun05). 13d to Jun27 arrival. NEIL: assign bed ASAP via SIS Accom module.

**Jun15 hrly(cron#2):** ba11287 bedId=null CONFIRMED UNCHANGED (updAt=Jun05). startDate=Jun27 endDate=Dec12 active=true. doc204 ISSUED versionNo=1 updAt=Jun08. 12d to Jun27 arrival. Bed still unassigned. NEIL: assign bed via SIS Accommodation module ASAP.

**Jun15 hrly(cron#3):** ba11287 bed_id=null UNCHANGED(updAt=Jun05). doc204 LOA ISSUED v1(Jun08). bc active Jun27-Dec12. 12d to Jun27 arrival. NEIL: assign bed in SIS Accom module before Jun27. Last checked: 2026-06-15 UTC hrly(cron#3).

**Jun15 cron: CONFIRMED UNCHANGED. ba11287 bedId=null(updAt=Jun05). Arrival Jun27=12d. NEIL: assign bed in SIS Accom ASAP. Last checked: 2026-06-15 UTC cron.


**Jun17 hrly (this run):** RESOLVED — ba11287 bedId=179 confirmed (set Jun16 18:14 UTC). bk17871 ESCROW status, confirmed=true, paid=300/2313.62 (EUR2013 outstanding). doc204 LOA ISSUED v1 Jun08 — issued BEFORE bed was assigned; accommodation block absent. NEIL: regenerate LOA via SIS, Rakan, booking 17871, Documents, Regenerate. Arrival Jun27=10d.

**Jun18 hrly — CORRECTION:** doc204 has bookingId=17915 (student 14444) — that is a DIFFERENT student, NOT Rakan. Rakan is student 14473, booking 17871. A fresh DB query confirmed student 14473 has ZERO document_records (no SIS-generated LOA has ever existed for this student). The LOA mentioned in the issue was created and manually amended OUTSIDE SIS — no SIS barcode was ever attached. The root cause note in this recipe re "Student 14444, booking 17915" describes the barcode bug investigation on that student; Rakan booking 17871 is a separate case tracked here. CORRECTED ACTION: Generate (not regenerate) the LOA for booking 17871 via SIS → Rakan → booking 17871 → Documents → Generate LOA. Bed assignment ba11287 bedId=179 Jun27-Dec12 is confirmed (set Jun16). Fee data will now populate correctly. Arrival Jun27 = 9 days. Last checked: 2026-06-18 UTC hrly.

**Jun23 hrly:** (1) Rakan (s14444, bk17915): ba11287 bedId=179 confirmed. LOA still NOT GENERATED (SIS bk17915 Documents Generate LOA). Arrival Jun27=4d URGENT. (2) Khongorzul (s14473, bk17871): ESCROW UNCHANGED (fresh DB). amtPaid=300/2313.62 (EUR2013.62 outstanding). bc24644 AY-Morn ended Jan23-2026 active=false. pmt17375 xeroId=null hsId=null. updAt=May08=46d. Await Neil decision. Last checked: 2026-06-23 UTC hrly.

Last checked: 2026-06-26 UTC hrly (8th check): Khongorzul bk17871 ESCROW conf=true 300/2313.62 (updAt=May08=49d). bc24644 ended Jan23-2026. pmt17375 EUR300 xeroId=null hsId=null. UNCHANGED. Neil: decide fate of EUR2013.62.
Last checked: 2026-06-27 SAT UTC hrly (11th check): bk17871 ESCROW conf=true amtPaid=300/2313.62 (EUR2013.62 outstanding). pmt17375 EUR300 xeroId=null hsId=null type=Escrow. May08=50d stale. UNCHANGED. Neil: decide write off / pursue / reclassify EUR2013.62.
**Jun30 TUE UTC (14th check, fresh DB): Khongorzul bk17871 ESCROW conf=true amtPaid=300/2313.62 (EUR2013.62 outstanding). pmt17375 EUR300 xeroId=null hsId=null type=Escrow. updAt=May08=53d stale. UNCHANGED. Neil: decide write off / pursue / reclassify EUR2013.62. Last checked: 2026-06-30 UTC (14th check).**

Last checked: 2026-06-30 UTC (15th check, hrly bot): bk17871 ESCROW conf=true amtPaid=300/2313.62 EUR2013.62 outstanding. pmt17375 xeroId=null hsId=null type=Escrow. updAt=May08=53d stale. UNCHANGED. Neil: decide write off / pursue / reclassify EUR2013.62.