# Issue 41 — Giampaolo Russo: Dual Accommodation (Host Family + Capel)

Reporter: KC | Area: Booking / Accomm | Sheet row: 43

## Symptom

Student booked two accommodation types: Host Family (Aug 2-Sep 6, 5 weeks) and Capel Street Premium (Sep 6-Sep 14, 1 week + 1 night). Neither appears in SIS; student not visible in Matching section.

## Root Cause

Problem 1 — Capel accommodation missing from DB:
HubSpot deal form holds only one accommodation block. Webhook created Host Family only; Capel block (Sep 6-14) was never written to SIS.

Problem 2 — Host Family accommodation has no bed assigned (bed_id = null):
Accommodation 11357 (Host Family, Aug 2-Sep 6) exists but bed_id = null, making student invisible in Matching.

Evidence from DB (Jun 29 2026 UTC):
  Student 14571: Giampaolo Russo
  Booking 18180: CONFIRMED, confirmed=true, EUR 2584.96/2584.96 fully paid, updated Jun 29 11:57 UTC
  Booking course 24956: General English AM, 3 Aug to 11 Sep 2026
  Accommodation 11357: Host Family, 2 Aug to 6 Sep 2026, fee=EUR 1250, bed_id=null
  Capel accommodation (Sep 6-14): NOT PRESENT in DB
  Payment 17954: EUR 2584.96, HubSpot 1268783973563, xeroPaymentId=null

## Fix Recipe (NOT YET RUN)

### Step 1 — Add missing Capel accommodation
SIS admin: Student 14571 -> Booking 18180 -> Accommodation -> Add.
  Type: City Centre Apartment (Capel Street)
  Room type: Premium (confirm with KC)
  Start: 6 Sep 2026, End: 14 Sep 2026 (confirm checkout with KC)
  Fee: confirm from HubSpot deal
  Bed: assign in Step 3

Fallback SQL (NOT YET RUN — prefer SIS UI):
  INSERT INTO booking_accommodations (booking_id,accommodation_type,room_type,start_date,end_date,fee,active,created_at,updated_at)
  VALUES (18180,'City Centre Apartment','Premium','2026-09-06','2026-09-14',<fee>,true,NOW(),NOW());

### Step 2 — Assign host bed to accommodation 11357
SIS Matching: find host free Aug 2-Sep 6, assign to accommodation 11357.
Fallback SQL (NOT YET RUN): UPDATE booking_accommodations SET bed_id=<chosen>,updated_at=NOW() WHERE id=11357;

### Step 3 — Assign Capel bed to new Capel record
After Step 1, assign a free Capel Premium bed for Sep 6-14 via SIS allocation UI.

### Step 4 — Reconcile Xero payment
Payment 17954 (EUR 2584.96, HubSpot 1268783973563) xeroPaymentId=null. Reconcile against booking 18180 in Xero.

## Longer-term fix (design)
HubSpot form supports one accommodation block per deal. Multi-accomm students need second block added manually in SIS.
Recommended: add conditional Accommodation-Type-2 fields to HubSpot form.

## Risk / Category
  Category: bookings, accommodation
  Reversible: Yes
  Blast radius: One student, one booking
  Urgency: Student arrives Aug 2 (34 days). Host assign before then; Capel before Sep 6.

## Status
1st bot diagnostic Jun 29 2026 UTC. Neither accommodation assigned a bed. Capel record missing from DB.
Last checked: 2026-06-29 UTC
2nd check Jun30 TUE UTC (fresh DB): bk18180 CONFIRMED confirmed=true amtPaid=2584.96/amtTotal=2584.96 amtOpen=0 (fully paid, updated Jun29). ba11357 Host Family Aug02-Sep06 fee=1250 bed_id=STILL null (student not visible in Matching). 0 Capel accommodation records for booking 18180 — Capel Sep06-Sep14 STILL missing from DB. BOTH ACTIONS PENDING. Student arrives Aug 2 (33 days). Neil: (1) assign HF bed to ba11357 via SIS Matching; (2) add Capel accommodation Sep06-Sep14 to bk18180 via SIS admin. Last checked: 2026-06-30 TUE UTC (2nd check).
3rd check Jun30 TUE UTC (fresh DB): bk18180 CONFIRMED confirmed=true amtPaid=2584.96/2584.96 amtOpen=0. ba11357 Host Family (accommodationType confirmed) Aug02-Sep06 fee=1250 bed_id=STILL null. HF beds occupied Aug02-Sep06 (to exclude when assigning): 83, 112, 179, 190. 0 Capel accommodation records for booking 18180. BOTH ACTIONS PENDING. Student arrives Aug 2 = 33 days. Neil: (1) assign HF bed to ba11357 in SIS Matching (avoid beds 83/112/179/190); (2) add Capel accommodation Sep06-Sep14 to bk18180 via SIS admin. Last checked: 2026-06-30 TUE UTC (3rd check).

4th check Jun30 TUE UTC (fresh DB, 5th check overall): bk18180 CONF confirmed=true 2584.96/2584.96 amtOpen=0 (updated Jun29). ba11357 Host Family Aug02-Sep06 fee=1250 bed_id=STILL null. HF beds occupied Aug2-Sep6 (confirmed fresh query Jun30): 83(Jul12-Aug09), 112(Jul25-Sep04), 179(Jun28-Sep19), 190(Jun27-Dec12) — these 4 have specific bed IDs. Additionally 10 other HF accommodations overlap this period with bed_id=null (unassigned queue). 0 Capel accommodation records for booking 18180 — Sep6-Sep14 Capel STILL missing from DB. Payment 17954 (EUR2584.96, HubSpot 1268783973563) xeroPaymentId=null. Student arrives Aug 2 = 33 days. BOTH ACTIONS PENDING. Neil: (1) assign HF bed to ba11357 via SIS Matching (avoid beds 83/112/179/190); (2) add Capel accommodation Sep06-Sep14 to bk18180 via SIS admin; (3) reconcile pmt17954 in Xero. Last checked: 2026-06-30 TUE UTC (5th check).

**Jun30 TUE UTC (6th check, fresh DB): CONFIRMED UNCHANGED. bk18180 CONFIRMED confirmed=true EUR2584.96/2584.96 amtOpen=0 (updAt=Jun29). ba11357 Host Family Aug02-Sep06 fee=1250 bed_id=STILL null (updAt=Jun24=6d). Fresh query HF occupied Aug2-Sep6: bed83(ba11346 Jul12-Aug09), bed112(ba11213 Jul25-Sep04), bed179(ba11343 Jun28-Sep19), bed190(ba11287 Jun27-Dec12). Available Host Family beds Aug2-Sep6: 33, 38, 47, 54, 59, 66, 89, 178, 180, 182, 186, 188, 189 (13 beds free — avoid 83/112/179/190). 0 Capel records for booking 18180 — Sep6-14 Capel STILL missing from DB. Payment 17954 (EUR2584.96, HubSpot 1268783973563) xeroPaymentId=STILL null. Student arrives Aug 2 = 33 days. BOTH ACTIONS PENDING. Neil: (1) assign HF bed from available list to ba11357 via SIS Matching; (2) add Capel accommodation Sep06-Sep14 to bk18180 via SIS admin; (3) reconcile pmt17954 in Xero. Last checked: 2026-06-30 TUE UTC (6th check, hrly bot).**
Last checked: 2026-06-30 TUE UTC (11th check): bk18180 CONF 2584.96/2584.96 updAt=Jun29. ba11357 HF Aug02-Sep06 fee=1250 bedId=STILL null updAt=Jun24. 0 Capel records on bk18180. 13 HF beds available (33/38/47/54/59/66/89/178/180/182/186/188/189). HF start Aug02=33d; Capel Sep06-Sep14 not added.
**Jul01 WED UTC (13th check, fresh DB): NEW — ba11357 was TOUCHED today 1 Jul at 18:06:38 UTC (updatedAt changed from Jun24 to Jul01) but bed_id remains null. Someone opened the record and either failed to save a bed or cleared it. bk18180 CONF 2584.96/2584.96 amtOpen=0 updAt=Jun29. 0 Capel accommodation records for booking 18180. HF beds occupied Aug2-Sep6 (avoid when assigning): bed 59 (ba27, Aug1-Aug15), bed 83 (ba11346, Jul12-Aug9), bed 112 (ba11213, Jul25-Sep4), bed 179 (ba11343, Jun28-Sep19), bed 190 (ba11287, Jun27-Dec12). Bed 180 (ba11358, Xuezhen Huang, HF Jul12-Aug2) ends Aug2 — same-day turnover possible if checkout before Giampaolo check-in. Aug02=32d. BOTH actions (assign HF bed, add Capel Sep6-14) still pending. Neil: (1) assign HF bed to ba11357 via SIS Matching (not beds 59/83/112/179/190; check bed 180 for same-day turnover); (2) add Capel accommodation Sep06-Sep14 to bk18180 via SIS admin. Last checked: 2026-07-01 UTC (13th check, hrly bot).**


---
hrly 2 Jul UTC (14th check, fresh DB):
- bk18180: CONFIRMED, EUR 2584.96 / 2584.96 fully paid (updated Jun 29)
- bc24956: GE AM Aug03-Sep11, active=true
- ba11357: Host Family, Aug02-Sep06, bed_id=STILL null, active=true
- No Capel accommodation record on bk18180
- HF beds occupied Aug2-Sep6 (avoid): bed59(Aug1-15), bed83(Jul12-Aug9), bed112(Jul25-Sep4), bed179(Jun28-Sep19), bed190(Jun27-Dec12)
- bed180 currently occupied Jul12-Aug2 — same-day turnover possible if confirmed
- Aug 2 = 31 days away. BOTH actions (assign HF bed, add Capel record) still pending.

hrly 2 Jul UTC (15th check, fresh DB):
- bk18180: CONFIRMED, EUR 2584.96/2584.96 fully paid (updated Jun 29, unchanged)
- ba11357: Host Family, Aug 02-Sep 06, bed_id=STILL null, active=true (last touched Jul 01 18:06 UTC — bed not saved)
- No Capel accommodation record on booking 18180 — Sep 6-14 still missing from DB
- HF beds OCCUPIED Aug 2-Sep 6 (exclude): bed 59 (Aug 1-Aug 15), bed 83 (Jul 12-Aug 9), bed 112 (Jul 25-Sep 4), bed 179 (Jun 28-Sep 19), bed 190 (Jun 27-Dec 12)
- Bed 180 (Xuezhen Huang, HF): ends Aug 2 — same-day turnover possible if she checks out before Giampaolo checks in
- HF beds AVAILABLE Aug 2-Sep 6 (historically-used HF beds minus occupied): 33, 38, 47, 54, 66, 89, 178, 182, 186, 188, 189 (11 options)
- Capel beds 174, 175, 176: CONFIRMED FREE Sep 6-14 (zero DB conflicts — use one for Giampaolo Capel slot)
- Capel beds occupied Sep 6-14: bed 84 (through Sep 13), bed 156 (through Sep 26), bed 179 HF (through Sep 19), bed 190 HF (through Dec 12)
- Aug 2 = 31 days. BOTH actions still pending.
Last checked: 2026-07-02 UTC (15th check)

**Jul02 THU UTC (16th check, fresh DB): CONFIRMED UNCHANGED. bk18180 CONF 2584.96/2584.96 (updAt=Jun29=3d stale). ba11357 Host Family Aug02-Sep06 bedId=STILL null. 0 Capel accommodation records for bk18180. HF beds available Aug2-Sep6: 33/38/47/54/66/89/178/182/186/188/189 (11 options). Beds 175+176 confirmed zero bookings in DB. Capel beds 174/175/176 free Sep6-14. Arrives Aug2=31d. BOTH actions (assign HF bed; add Capel Sep6-14) STILL PENDING. Last checked: 2026-07-02 UTC (16th check, hrly bot).**


**Jul02 THU UTC (18th check, fresh DB): NEW — Host family provider 24 claimed ba11357 via host portal on 1 Jul 2026 at 18:06:38 UTC (claimStatus=pending, claimedVia=host-portal). Staff must review the claim and formally assign a bed. bk18180 CONF 2584.96/2584.96 (updAt=Jun29). ba11357 HF Aug02-Sep06 bedId=STILL null (updAt=Jul01=1d). 0 Capel accommodation records on bk18180. HF beds available Aug2-Sep6: 33/38/47/54/66/89/178/182/186/188/189 (avoid 59/83/112/179/190). Capel beds 174/175/176 confirmed free Sep6-14. Arrives Aug2=31d. Next action: (1) review provider24 claim in SIS Matching — assign a bed to ba11357; (2) add Capel accommodation Sep06-Sep14 to bk18180 via SIS admin. Last checked: 2026-07-02 UTC (18th check, hrly bot).**

**Jul02 THU UTC (19th check, fresh DB): Claim status STILL pending — provider 24 claimed ba11357 at 18:06 UTC on 1 Jul 2026, now over 28 hours with no action. bed_id = STILL null. 0 Capel accommodation records on booking 18180. HF beds available Aug2-Sep6: 33/38/47/54/66/89/178/182/186/188/189 (avoid 59/83/112/179/190). Capel beds 174/175/176 free Sep6-14. Arrives Aug 2 = 31 days. Actions: (1) approve/reject claim in host portal — if approved, assign bed to ba11357; (2) add Capel accommodation Sep06-14 to bk18180 via SIS admin. Last checked: 2026-07-02 UTC (19th check, hrly bot).**

**Jul02 THU UTC (20th check, fresh DB): CONFIRMED UNCHANGED. bk18180 CONF 2584.96/2584.96. ba11357 HF Aug02-Sep06 bedId=STILL null claimStatus=pending. Provider 24 claimed Jul01 18:06 UTC — now 32+ hours unactioned. 0 Capel accommodation records on bk18180. HF beds available Aug2-Sep6: 33/38/47/54/66/89/178/182/186/188/189. Capel beds 174/175/176 free Sep6-14 (zero conflicts, fresh DB). Aug2=31d. BOTH actions (assign HF bed; add Capel Sep6-14) STILL PENDING. Last checked: 2026-07-02 UTC (20th check, hrly bot).**


**Jul02 THU UTC (21st check, fresh DB): CONFIRMED UNCHANGED. bk18180 CONF 2584.96/2584.96. ba11357 HF Aug02-Sep06 bedId=STILL null, claimStatus=pending. Provider 24 = Edel McDonald (mcdonald.edel@gmail.com, +353 87 990 5430), IBAN IE50AIBK93311206028010, claimed via host portal Jul 01 18:06 UTC = 41+ hours unactioned. 0 Capel accommodation records on bk18180. Capel beds 174/175/176 confirmed free Sep6-14 (zero conflicts, fresh DB query). HF beds available Aug2-Sep6: 33/38/47/54/66/89/178/182/186/188/189. Aug2=31d. BOTH actions (assign HF bed, add Capel Sep6-14) STILL PENDING. Last checked: 2026-07-02 UTC (21st check, hrly bot).**

**Jul02 THU UTC (22nd check, fresh DB): KEY CHANGE — ba11357 claimStatus changed from pending to RELEASED at 16:37 UTC today (2 Jul 2026). Provider 24 = Edel McDonald (mcdonald.edel@gmail.com, +353 87 990 5430) claim CONFIRMED/RELEASED. However: bed_id = STILL null — host family confirmed but no bed number set in SIS. bk18180 CONF 2584.96/2584.96. 0 Capel accommodation records on bk18180 — Sep 6-14 still missing from DB. Capel beds 174/175/176 confirmed free Sep 6-14 (fresh DB, zero conflicts). HF beds available Aug 2-Sep 6 (avoid 59/83/112/179/190): 33/38/47/54/66/89/178/182/186/188/189 (11 options). Aug 2 = 31 days. NEIL: (1) assign a bed to ba11357 via SIS Matching (claim released — pick from available list); (2) add Capel accommodation Sep 6-14 to bk18180. Last checked: 2026-07-02 UTC (22nd check, hrly bot).**

**Jul02 THU UTC (24th check, fresh DB): CONFIRMED STILL REVERTED. ba11357 (Giampaolo Russo, Host Family, Aug 2-Sep 6): claimStatus=pending, bed_id=STILL null (updatedAt=2026-07-02T17:32 UTC). Claim was briefly RELEASED at 16:37 UTC on 2 Jul then reverted to pending at 17:32 UTC — reason unknown. Provider 24 = Edel McDonald (mcdonald.edel@gmail.com). 0 Capel accommodation records on booking 18180 — Sep 6-14 still not in DB. HF beds available Aug2-Sep6 (avoid 59/83/112/179/190): 33/38/47/54/66/89/178/182/186/188/189 (11 options). Capel beds 174/175/176: zero conflicts Sep 6-14 (fresh DB query). Arrives Aug 2 = 31 days. BOTH actions (assign HF bed; add Capel Sep 6-14) still pending. Last checked: 2026-07-02 UTC (24th check, hrly bot).**

**Jul02 THU UTC (25th check, fresh DB): CONFIRMED UNCHANGED. ba11357 HF Aug02-Sep06 bedId=STILL null claimStatus=STILL pending (updatedAt=2026-07-02T17:32 UTC). Revert from Released to Pending at 17:32 UTC 2 Jul stands — reason unknown. Provider 24 = Edel McDonald (mcdonald.edel@gmail.com). 0 Capel accommodation records on booking 18180. bk18180 CONF 2584.96/2584.96. HF beds available Aug2-Sep6: 33/38/47/54/66/89/178/182/186/188/189. Capel beds 174/175/176 free Sep6-14. Aug2=31d. BOTH actions still pending. Last checked: 2026-07-02 UTC (25th check, hrly bot).**

**3 Jul FRI UTC (26th check, fresh DB): CONFIRMED UNCHANGED. ba11357 (Giampaolo Russo, Host Family, Aug02-Sep06): claimStatus=pending, bedId=STILL null (updatedAt=2026-07-02T17:32:09 UTC — claim reverted from Released at 16:37 UTC to Pending at 17:32 UTC on 2 Jul, reason unknown). Provider 24 = Edel McDonald (mcdonald.edel@gmail.com) — claim 1 Jul 18:06 UTC = now 47+ hours unactioned. bk18180 CONF 2584.96/2584.96 (updAt=Jun29). bc24956 GE AM Aug03-Sep11. 0 Capel accommodation records on booking 18180 — Sep 6-14 STILL missing from DB. pmt17954 EUR2584.96 xeroPaymentId=null. HF beds available Aug2-Sep6: 33/38/47/54/66/89/178/182/186/188/189. Capel beds 174/175/176 confirmed free Sep6-14 (zero conflicts, fresh DB). Arrives Aug 2 = 30 days. BOTH actions (assign HF bed; add Capel Sep6-14) still pending. Last checked: 2026-07-03 UTC (26th check, hrly bot).**

**3 Jul FRI UTC (29th check, fresh DB): CONFIRMED UNCHANGED. ba11357 (Giampaolo Russo, Host Family, Aug02-Sep06): claimStatus=STILL pending, bedId=null (updatedAt=2026-07-02T17:32:09 UTC — claim reverted from Released at 16:37 UTC to Pending at 17:32 UTC on 2 Jul, reason unknown). Provider 24 = Edel McDonald (mcdonald.edel@gmail.com). bk18180 CONFIRMED 2584.96/2584.96. 0 Capel accommodation records on booking 18180 — Sep 6-14 STILL missing from DB. HF beds available Aug2-Sep6: 33/38/47/54/66/89/178/182/186/188/189. Capel beds 174/175/176: zero conflicts Sep6-14 (fresh DB). Aug2 = 30 days. BOTH actions (assign HF bed; add Capel Sep6-14) still pending. Last checked: 2026-07-03 UTC (29th check, hrly bot).**


--- 34th check 3 Jul 2026 UTC ---
Fresh DB: ba11357 (Host Family Aug 2-Sep 6 2026): bedId=STILL null, claimStatus=STILL pending, fee=EUR 1250. Provider 24 = Edel McDonald (mcdonald.edel@gmail.com, +353879905430) — claim placed Jul 1 18:06 UTC, not yet confirmed or released by Kelly (2 days ago). 134+ free Host Family beds available Aug 2-Sep 6 (only beds 59, 112, 180, 179, 33, 190 booked). bk18180 CONFIRMED EUR 2584.96/2584.96 fully paid. Zero Capel accommodations in DB (Sep 6-14 not yet added). Aug 2 = 30 DAYS. Fix: (1) confirm Edel McDonald claim or release + reassign to alternative bed; (2) add Capel accommodation Sep 6-Sep 14 to bk18180 via SIS admin.

**4 Jul SAT UTC (35th check, fresh DB): CONFIRMED UNCHANGED. Accommodation 11357 (Giampaolo Russo, Host Family, 2 Aug-6 Sep 2026): bed_id=null, claim_status=pending, claimed_by_provider_id=24 (Edel McDonald, mcdonald.edel@gmail.com, +353879905430), claimed_at=2026-07-01 18:06 UTC (3 days ago). Booking 18180: CONFIRMED, confirmed=true, amount_paid=2584.96, amount_total=2584.96, amount_open=0. No Capel accommodation record found in booking_accommodations for booking 18180 (Sep 6-14 entry still missing). Aug 2 start = 29 days away. 35 hourly checks. NEIL: (1) confirm or release Edel McDonald claim on BA 11357; (2) assign host family bed; (3) add Capel Sep 6-14 accommodation in SIS admin. Last checked: 2026-07-04 UTC (35th check, hrly bot).**


---
STATUS UPDATE 4 JUL 2026 UTC (fresh DB):

Two confirmed bookings for student 14571 (Giampaolo Russo):

BOOKING 17980 (Apartment):
  - bk17980: CONFIRMED, confirmed=true, EUR5331/5331 fully paid
  - bc24772: General English AM, Jun29-Aug21 — ACTIVE (course started Jun29)
  - ba11311: bed_id=84, accommodation_type=null, Jun28-Sep13, active=true, fee=EUR3850
  - This IS the apartment booking — bed 84 is assigned, student is in accommodation now

BOOKING 18180 (Host Family):
  - bk18180: CONFIRMED, confirmed=true, EUR2584.96/2584.96 fully paid
  - bc24956: General English AM, Aug3-Sep11 — future
  - ba11357: Host Family, Aug2-Sep6, fee=EUR1250, bed_id=null, claim_status=pending, claimed_by_provider_id=24
  - Provider 24 has claimed the student but has NOT assigned a specific bed yet
  - Aug2 = 29 days away

RESOLVED: The 'missing Capel Sep6-14' from original recipe is covered by ba11311 (bed84, Jun28-Sep13 on bk17980).

OUTSTANDING ACTION: Provider 24 must assign a specific bed to ba11357 (Host Family Aug2-Sep6).
Neil: contact provider 24 via HubSpot or SIS Matching to assign bed before Jul26 (one week before arrival).
Last checked: 2026-07-04 UTC.

**4 Jul SAT UTC (fresh DB check): CONFIRMED UNCHANGED. bk17980 (Giampaolo Russo, s14571): CONFIRMED, confirmed=true, EUR5331/5331. ba11311 (bed 84, Capel apartment, Jun28-Sep13, active=true): student in situ. bk18180: CONFIRMED, confirmed=true, EUR2584.96/2584.96. ba11357 (Host Family, Aug2-Sep6, fee=EUR1250): bedId=null, claimStatus=pending, claimedByProviderId=24, claimedAt=Jul1. Provider 24 claimed Jul1 (3 days ago) — bed still unassigned. Aug2 accommodation start = 29 days. OUTSTANDING: Kelly to confirm claim from provider 24 in SIS Matching to assign a specific bed. Last checked: 2026-07-04 UTC (hrly bot).**


**5 Jul SUN UTC (fresh DB): CONFIRMED UNCHANGED. ba11357 (Giampaolo HF Aug02-Sep06): bedId=STILL null, claimStatus=STILL pending, provider24=Edel McDonald claimed Jul1 (4 days unactioned). ba11311 (Capel bed84 Jun28-Sep13): active, student in apartment now. bk17980 CONFIRMED EUR5331/5331. bk18180 CONFIRMED EUR2584.96/2584.96. No Capel Sep6-14 record on bk18180. HF beds available Aug2-Sep6: 33/38/47/54/66/89/178/182/186/188/189. Aug2=28d. NEIL: (1)confirm or release Edel McDonald claim on ba11357; (2)add Capel Sep6-14 to bk18180. Last checked: 2026-07-05 UTC.**

**5 Jul SUN UTC (2nd check this run, fresh DB): NOTE — PRIOR SHEET H WAS PARTIALLY CONTAMINATED (mixed bk17980 Apartment data into HF context). Corrected state: Student 14571 Giampaolo Russo has TWO confirmed bookings. bk17980 (Apartment booking): confirmed=true EUR 5331/5331, ba11311 bed 84 Capel Jun28-Sep13 active=true — student in situ. bk17980 also carries bc24772 (GE-AM Jun29-Aug21). bk18180 (Host Family booking): confirmed=true EUR 2584.96/2584.96, bc24956 (GE-AM Aug03-Sep11), ba11357 (Host Family Aug02-Sep06, fee=EUR 1250, bedId=STILL null, claimStatus=STILL pending). Provider 24 Edel McDonald (mcdonald.edel@gmail.com) claimed ba11357 2026-07-01 18:06 UTC — 4 days 6+ hours unactioned. No separate Capel record for Sep6-14 on bk18180 — ba11311 (bk17980) ends Sep13, likely covering the gap. HF beds available Aug2-Sep6: 33/38/47/54/66/89/178/182/186/188/189. Aug 2 = 28 days. NEIL: (1) SIS Matching → confirm or release Edel McDonald claim on ba11357 to assign a specific bed; (2) verify Sep6-14 Capel is covered by ba11311 on bk17980 (ends Sep13). Last checked: 2026-07-05 UTC (hrly bot).**

**5 Jul SUN UTC (correction note, fresh DB): BOOKING ID CORRECTION — prior sheet H incorrectly referenced booking 17980 (Pietro Caccianiga's booking); corrected to booking 18180 (Giampaolo Russo's Host Family booking). Student 14571 Giampaolo Russo has TWO confirmed bookings: (1) bk17980 (Apartment booking): CONFIRMED EUR 5331/5331, ba11311 bed 84 Capel Jun28-Sep13 active=true — student is in apartment now. bk17980 also carries bc24772 (GE-AM Jun29-Aug21). (2) bk18180 (Host Family booking): CONFIRMED EUR 2584.96/2584.96, bc24956 (GE-AM Aug03-Sep11), ba11357 (Host Family Aug02-Sep06, fee=EUR 1250, bedId=STILL null, claimStatus=STILL pending). Provider 24 Edel McDonald (mcdonald.edel@gmail.com) claimed ba11357 via host portal on 2026-07-01 18:06 UTC — 4+ days unactioned. No separate Capel record for Sep6-14 on bk18180 — ba11311 (bk17980) ends Sep13, likely covering the gap. HF beds available Aug2-Sep6: 33/38/47/54/66/89/178/182/186/188/189. Aug 2 = 28 days. OUTSTANDING: SIS Matching → confirm or release Edel McDonald claim on ba11357 to assign a specific bed. Sheet H corrected this run (was contaminated with bk17980/Pietro data). Last checked: 2026-07-05 UTC (hrly bot — booking ID correction applied).**

**6 Jul MON UTC (hrly check, fresh DB): ba11357 (Giampaolo Russo, s14571, HF Aug2-Sep6) claim STILL PENDING — now 5 days since Jul1 18:06 UTC claim by provider 24 (Edel McDonald). bedId=null — no specific bed assigned yet. bk18180 CONFIRMED fully paid EUR2584.96. bc24956 (GE-AM Aug3-Sep11): starts in 28 days. pmt17954 EUR2584.96 HS 1268783963563 xeroId=null. Capel Sep6-14 covered by ba11311 (bed 84, bk17980). NEIL: confirm or release Edel McDonald HF claim on ba11357 via SIS provider admin — 28 days until Aug2 checkin. Last checked: 2026-07-06 UTC (hrly bot).**
**6 Jul UTC (fresh DB): CONFIRMED — host family claim STILL PENDING 6 DAYS. Accommodation 11357 claimStatus=pending bedId=null provider=24 Edel McDonald (mcdonald.edel@gmail.com). Course starts Aug 3=28 days. Booking 18180 CONFIRMED fully paid EUR2584.96. NEIL: confirm or release Edel McDonald claim in SIS provider admin — claim has sat unactioned 6 days. Last checked: 2026-07-06 UTC.**


**6 Jul MON UTC 07:48 — RESOLVED: Host family claim CONFIRMED. Accommodation 11357 bedId=178 claimStatus=confirmed (updatedAt=2026-07-06T07:48:56 UTC). Provider 24 Edel McDonald claim active since 1 Jul — confirmed by Kelly today. Bed 178 assigned. Remaining: payment 17954 (EUR 2584.96, HubSpot 1268783973563) xeroPaymentId=null — reconcile in Xero. Capel Sep6-14 covered by accommodation 11311 (bed 84, booking 17980). Course bc24956 GE-AM Aug3-Sep11 starts in 28 days. K updated to Xero pmt pending.**
Last checked: 2026-07-06 UTC (HF claim confirmed, bed 178 assigned — main issue resolved).


**6 Jul UTC (this run): CONFIRMED — Host family resolved. Accommodation 11357 bedId=178 claimStatus=confirmed (done 07:48 UTC today). Booking 18180 EUR2584.96/2584.96 fully paid. Payment 17954 EUR2584.96 HubSpot1268783973563 xeroPaymentId=STILL null. Only outstanding: reconcile pmt17954 in Xero. Last checked: 2026-07-06 UTC.**

**7 Jul TUE UTC (fresh DB): CONFIRMED — accommodation resolved; Xero reconciliation STILL outstanding. Accommodation 11357 (bed 178, Host Family, 2 Aug – 6 Sep 2026, Giampaolo Russo student 14571): bed ID = 178, claim status = confirmed — resolved 6 July 2026 07:48 UTC. Booking 18180: Confirmed, confirmed = true, EUR 2584.96 / 2584.96 — fully paid. Payment 17954 (EUR 2584.96, HubSpot 1268783973563): type = STILL null, Xero payment ID = STILL null — not classified or reconciled in Xero. Capel accommodation 6–14 Sep covered by accommodation 11311 (bed 84, booking 17980) — no action needed. Only outstanding item: reconcile payment 17954 in Xero. NEIL: reconcile payment 17954 (EUR 2584.96, HubSpot 1268783973563) against booking 18180 in Xero. Last checked: 2026-07-07 UTC (hrly bot).**
---
## 9 Jul UTC (hrly14)
CONFIRMED UNCHANGED (fresh DB). PMT17954 EUR2584.96 type=null xeroId=STILL null. ba11357 claimStatus=confirmed bed178 Aug2-Sep6. 24 days to host family check-in Aug2. NEIL: reconcile pmt17954 in Xero vs booking 18180 (HS 1268783973563). Sheet row 43 H/I/J/K written.

## 9 Jul UTC hrly22
CONFIRMED UNCHANGED (fresh DB). PMT17954 EUR2584.96 type=null xeroId=STILL null. BA11357 claimStatus=confirmed Aug2-Sep6 active=true. 24d to host family check-in Aug2. NEIL: reconcile pmt17954 in Xero vs booking 18180 (HS 1268783973563).

---
## 10 Jul 2026 UTC (this run)

CONFIRMED UNCHANGED (fresh DB). PMT17954 EUR2584.96 type=STILL null xeroPaymentId=STILL null. BA11357 claimStatus=confirmed bed178 Aug2-Sep6 active=true (resolved 6 Jul). Capel Sep6-14 covered by ba11311 (bed84 bk17980 Jun28-Sep13). BK18180 CONF EUR2584.96/2584.96. 23 days to Aug2 Host Family check-in. Only outstanding: reconcile pmt17954 in Xero.

NEIL: reconcile payment 17954 (EUR 2584.96, HubSpot 1268783973563) in Xero vs booking 18180.
Last checked: 2026-07-10 UTC (this run).


**11 Jul SAT UTC (25th check, fresh DB): CONFIRMED UNCHANGED. Payment 17954: amount=EUR 2584.96, booking_id=18180, xeroPaymentId=STILL null, type=STILL null — not recorded in Xero. Accommodation 11357 (bed 178, Host Family, 2 Aug - 6 Sep 2026, student 14571): claimed 1 July 2026, active=true — 22 days to check-in. Capel Street (Sep 6-14): covered by accommodation 11311 (bed 84, booking 17980) — no separate action needed. No change from prior passes. Last checked: 2026-07-11 UTC (25th check, hrly bot).**

---
## 11 Jul 2026 SAT UTC (this bot run)

CONFIRMED UNCHANGED (fresh DB). PMT17954 EUR2584.96 bookingId=18180 type=STILL null xeroPaymentId=STILL null hubspotPaymentId=1268783973563. BA11357 bed178 HF Aug2-Sep6 claimedAt=Jul1 claimStatus=confirmed (host notified). BK18180 CONF EUR2584.96/2584.96 confirmed=true. Aug2=22d. Xero reconciliation still pending. BC24956 GE-AM Aug3-Sep11 (23d). Sheet H43:K43 updated. NEIL: reconcile PMT17954 in Xero before Aug2.

---
## 22nd check 2026-07-11 SAT UTC

CONFIRMED UNCHANGED (fresh DB). PMT17954 EUR2584.96 bookingId=18180 xeroPaymentId=STILL null type=STILL null hubspotPaymentId=1268783973563. BK18180 CONF EUR2584.96/2584.96 confirmed=true (updAt=Jun29). BA11357 bed178 HF Aug2-Sep6 claimedAt=2026-07-01 claimStatus=confirmed active=true. Only 1 accommodation found on bk18180 (not 2 as originally described — verify if second booking exists separately). Aug2=22 days. Sheet H43:K43 updated. NEIL: reconcile PMT17954 in Xero before Aug2. Last checked: 2026-07-11 SAT UTC.

---
## 25th check 12 Jul 2026 SUN UTC (2nd check today)

CONFIRMED UNCHANGED (fresh DB). PMT17954 EUR2584.96 xeroPaymentId=STILL null type=STILL null (bookingId=18180 hsId=1268783973563 paymentDate=Jun26). BK18180 CONFIRMED EUR2584.96/2584.96 confirmed=true (updAt=Jun29). BA11357 bed178 HF Aug2-Sep6 claimedAt=Jul1 claimStatus=CONFIRMED (HF claim done). Only 1 accommodation on bk18180 — Capel St apt Sep6-14 may not be in SIS. Aug2 check-in=21 days. NEIL: reconcile PMT17954 in Xero before Aug2. Sheet H43:K43 updated.
Last checked: 2026-07-12 SUN UTC (25th check, hourly bot).

---
26th check 2026-07-12 SUN UTC (later run): CONFIRMED UNCHANGED (fresh DB). PMT17954 EUR2584.96 xeroPaymentId=STILL null type=STILL null (bookingId=18180 hsId=1268783973563). BA11357 bed178 HF Aug2-Sep6 claimStatus=confirmed OK. Only 1 accommodation on bk18180 — Capel Street apt Sep6-14 still not in SIS. Aug2 check-in=21d. NEIL: reconcile PMT17954 in Xero. Sheet H43:K43 updated.
Last checked: 2026-07-12 SUN UTC (26th check, hourly bot).


---

29th check 2026-07-13 MON UTC (second run today)

CONFIRMED UNCHANGED (fresh DB). PMT17954 EUR2584.96 xeroPaymentId=STILL null type=STILL null (bookingId=18180, hubspotPaymentId=1268783973563). BA11357 bed178 Host Family Aug2-Sep6 claimStatus=confirmed active=true (confirmed 6 Jul). BC24956 General English AM Aug3-Sep11 active=true. CORRECTION: Only 1 accommodation record on booking 18180 (BA11357 HF Aug2-Sep6). Capel Street period (Sep6-14) is covered by BA11311 on booking 17980 (apartment booking for same student, ends Sep13) - NOT missing from DB, exists on a different booking record. Outstanding ONLY: reconcile PMT17954 (EUR2584.96) in Xero before Aug2 check-in (20 days). NEIL: reconcile PMT17954 in Xero. Sheet H43:K43 updated. Last checked: 2026-07-13 MON UTC (29th check, hourly bot).
---
## 30th check — 13 July 2026 MON UTC

CONFIRMED UNCHANGED (fresh DB).
- Payment 17954 (EUR2584.96, booking 18180): xero_payment_id=null, type=null — still not reconciled in Xero
- Booking 18180: CONFIRMED, EUR2584.96/2584.96, service_start=2026-08-03 (21 days away)
- Accommodation 11357 (HF, bed 178, Aug2-Sep6): claim_status=confirmed via host-portal (Jul1) — OK
- Only 1 BA record for booking 18180 (the HF). Capel Street apartment is pre-booked directly (not in SIS).
Fix NOT RUN. NEIL: Reconcile PMT17954 in Xero. Last checked: 2026-07-13 MON UTC (30th check, hourly bot).

---
32nd check 2026-07-13 UTC. Unchanged. PMT17954 xeroPaymentId=null type=null. BA11357 claimedAt=Jul1. Service starts Aug2 (20d). Capel apt: no SIS record. Xero reconciliation pending. Fix NOT RUN.

---
33rd check 2026-07-13 MON UTC
CONFIRMED UNCHANGED (fresh DB). PMT17954 EUR2584.96 hubspotPmtId=1268783973563 xeroPaymentId=STILL null type=STILL null (paid Jun29=14d stale). BK18180 CONF EUR2584.96/2584.96 confirmed=true. BA11357 bed178 Aug2-Sep6 claimStatus=confirmed. BC24956 GE AM Aug3-Sep11 fee=804.96 active. Aug2=20d. Capel apt: BA11311 bk17980 (separate booking, not missing). Fix NOT RUN. NEIL: reconcile PMT17954 in Xero. Last checked: 2026-07-13 MON UTC (33rd check, hourly bot).

---
34th check 2026-07-13 MON UTC
CONFIRMED UNCHANGED (fresh DB). Payment 17954 (EUR 2584.96, HubSpot payment 1268783973563): xeroPaymentId = null, type = null — 14 days since payment (Jun 29). Booking 18180 confirmed EUR2584.96/2584.96. Accommodation 11357 (bed 178, August 2-September 6): claimStatus = confirmed (claimed July 1). Booking course 24956 (General English AM, August 3-September 11): active, starts 21 days. Capel Street apartment (BA11311 on bk17980) is a separate booking, not missing. Only Xero reconciliation remains.
Fix NOT RUN. NEIL: reconcile payment 17954 (EUR2584.96) in Xero against booking 18180 invoice.
Last checked: 2026-07-13 MON UTC (34th check, hourly bot).
---
56th check 2026-07-13 Mon UTC

NEW FINDING: Capel Street accommodation (Sep 6-14) STILL NOT PRESENT in SIS. Recipe Step 1 has NOT been run.
Booking 18180 has only 1 accommodation record: BA11357 (Host Family, bed 178, Aug 2-Sep 6, claimStatus=confirmed).
Payment 17954 (EUR 2584.96, HubSpot 1268783973563): xeroPaymentId = still null, 17 days since payment (26 Jun).
Open items: (1) Add Capel accommodation Sep 6-14 to booking 18180 via SIS admin. (2) Reconcile payment 17954 in Xero.
Fix NOT RUN. Last checked: 2026-07-13 Mon UTC (56th check, hourly bot).

---
35th check 2026-07-13 Mon UTC

CONFIRMED UNCHANGED (fresh DB). Payment 17954 (EUR 2584.96, HubSpot 1268783973563, booking 18180): xeroPaymentId STILL null, type STILL null - paid Jun 26 2026, 17 days unreconciled. BA 11357 (bed 178, Host Family, Aug2-Sep6): claimStatus confirmed Jul 6 - RESOLVED.
CORRECTION: Prior 56th check entry incorrectly flagged Capel Sep6-14 as missing. It is covered by BA 11311 (bed 84, bk17980, Jun28-Sep13) - no separate record needed on bk18180. Sheet H corrected this run.
Outstanding: reconcile PMT17954 (EUR 2584.96) in Xero before Aug 2 check-in (20 days).
Fix NOT RUN. NEIL: reconcile PMT17954 in Xero.
Last checked: 2026-07-13 Mon UTC (35th check, hourly bot).


---
36th check 2026-07-14 Tue UTC

CONFIRMED UNCHANGED (fresh DB). Payment 17954 (EUR 2584.96, HubSpot 1268783973563, booking 18180): xeroPaymentId = STILL null, type = STILL null — 18 days since payment (26 June 2026). Booking 18180: Confirmed EUR 2584.96/2584.96. Accommodation 11357 (bed 178, HF, Aug2-Sep6): claimStatus = confirmed (Jul6) — resolved. Booking course 24956 (GE AM, Aug3-Sep11, EUR 804.96): active. Capel Sept6-14: covered by BA11311 on bk17980. Aug2 check-in = 19 days. Fix NOT RUN. NEIL: reconcile payment 17954 (EUR 2584.96, HubSpot 1268783973563) in Xero before Aug 2.
Last checked: 2026-07-14 Tue UTC (36th check, hourly bot).
---
37th check 2026-07-14 TUE UTC

CONFIRMED UNCHANGED (fresh DB). Payment 17954 (EUR 2584.96, HubSpot 1268783973563, booking 18180): xeroPaymentId=STILL null, type=STILL null -- 18 days since payment (26 Jun 2026). Booking 18180: Confirmed EUR 2584.96/2584.96. Accommodation 11357 (bed 178, Host Family, Aug 2-Sep 6): claimStatus=confirmed (Jul 6) -- resolved. Booking course 24956 (General English AM, Aug 3-Sep 11): active. Capel Sep 6-14: covered by accommodation 11311 (bed 84, booking 17980). Aug 2 check-in = 19 days. Only outstanding: reconcile payment 17954 in Xero.
Fix NOT RUN. NEIL: reconcile payment 17954 (EUR 2584.96, HubSpot 1268783973563) in Xero vs booking 18180 before Aug 2.
Last checked: 2026-07-14 TUE UTC (37th check, hourly bot).

---
38th check 2026-07-14 TUE UTC (this run) — G column change triggered re-diagnosis

CONFIRMED UNCHANGED (fresh DB).
Payment 17954: EUR 2584.96, Bank Transfer, 26 June 2026, booking 18180, HubSpot 1268783973563, xeroPaymentId = STILL null, type = STILL null.
Booking 18180: Confirmed EUR 2584.96/2584.96, last updated 29 June 2026.
Accommodation 11357 (bed 178, Host Family, Aug2-Sep6): claimStatus = confirmed (6 Jul) — resolved.
Booking course 24956 (GE AM, Aug3-Sep11): active, 19 days to start.
Capel Street Sep6-14: covered by accommodation 11311 (bed 84, booking 17980) — no action needed.
Only outstanding: reconcile payment 17954 in Xero before Aug 2 check-in (19 days).

Fix (NOT YET RUN): In Xero locate invoice for booking 18180, apply payment EUR 2584.96 (HubSpot 1268783973563, Bank Transfer, 26 Jun 2026).
Fix NOT RUN. Last checked: 2026-07-14 TUE UTC (38th check, hourly bot).

---
## 40th check — 15 July 2026 WED UTC — BOOKING ID CORRECTION (critical)

CORRECTION: Booking 17980 (bk17980) belongs to student 14521 (Pietro Caccianiga), NOT student 14571 (Giampaolo Russo). All prior checks that said "Capel Sep 6-14 is covered by BA11311 (bed 84, bk17980)" were attributing Pietro's accommodation to Giampaolo in error.

Fresh DB confirmed (15 Jul 2026 UTC):
- bk17980: student_id = 14521 (Pietro Caccianiga), CONFIRMED EUR 5331/5331
- BA11311 (bed 84, Jun 28-Sep 13): belongs to bk17980 = Pietro Caccianiga, NOT Giampaolo

Student 14571 (Giampaolo Russo) ALL accommodation records in SIS:
- BA11357 on bk18180: Host Family, bed 178, 2 August-6 September 2026, claim_status=confirmed
- Capel Street (6 September-14 September 2026): NO record in SIS for student 14571 = GENUINELY MISSING

Payment 17954 (EUR 2584.96, HubSpot 1268783973563): xeroPaymentId=STILL null, 39 days unreconciled. 18 days to Aug 2 check-in.

Two outstanding actions (NOT YET RUN):
1. Add Capel Street accommodation Sep 6-14 to booking 18180 via SIS admin (Student 14571, Booking 18180, Accommodation tab).
2. Reconcile payment 17954 (EUR 2584.96, Bank Transfer 26 Jun 2026) in Xero against booking 18180 invoice.

Last checked: 2026-07-15 WED UTC (40th check).


---
## 42nd check 2026-07-16 THU UTC (this run)

CONFIRMED UNCHANGED (fresh DB). Payment 17954: EUR 2584.96, paymentDate 2026-06-26, xeroPaymentId=null, type=null — 20 days unreconciled. Booking 18180: Confirmed EUR 2584.96/2584.96. Accommodation 11357 (bed 178, Host Family, Aug 2-Sep 6): claimStatus=confirmed (Jul 6) — resolved. Only 1 accommodation record on booking 18180 (Host Family ba11357) — Capel Street accommodation Sep 6-14 GENUINELY MISSING from DB (fresh DB confirmed this run). 17 days to Aug 2 check-in.

Two outstanding actions (NOT YET RUN):
1. Add Capel Street accommodation (Sep 6-14) to booking 18180 via SIS admin > Student 14571 > Booking 18180 > Accommodation tab.
2. Reconcile payment 17954 (EUR 2584.96, Bank Transfer, HubSpot 1268783973563) in Xero against booking 18180 invoice.

Last checked: 2026-07-16 THU UTC (42nd check, hourly bot).

---
43rd check 2026-07-16 THU UTC (8th check today). CONFIRMED UNCHANGED (fresh DB). PMT17954 EUR2584.96 xeroPaymentId=STILL null type=null (21d since Jun26). BK18180 CONF EUR2584.96/2584.96. BA11357 bed178 HF Aug2-Sep6 claimStatus=confirmed. Only 1 BA on bk18180 - Capel Sep6-14 GENUINELY MISSING. Aug2=17d. Fix NOT RUN. NEIL: (1) reconcile PMT17954 in Xero; (2) add Capel Sep6-14 to bk18180 via SIS admin.
Last checked: 2026-07-16 THU UTC (43rd check, hourly bot).

---
46th check 2026-07-17 FRI UTC

CONFIRMED UNCHANGED (fresh DB).
Payment 17954 (EUR 2584.96, booking 18180, Bank Transfer, 26 June 2026, HubSpot 1268783973563):
  xero_payment_id = STILL null
  type = STILL null
  21 days since payment date (26 Jun to 17 Jul 2026)

Accommodation 11357 (Host Family, bed 178, Aug 2-Sep 6 2026, student 14571):
  claim_status = confirmed (6 July 2026)
  active = true
  16 days to check-in (Aug 2)

Only 1 booking accommodation on booking 18180:
  BA11357 (Host Family, bed 178, Aug 2-Sep 6)
  Capel Street accommodation (Sep 6-14 2026): NOT PRESENT in DB for booking 18180
  Confirmed: bk17980 belongs to student 14521 (Pietro Caccianiga) — not Giampaolo

Two outstanding actions (NOT YET RUN):
1. Add Capel Street accommodation Sep 6-14 to booking 18180 via SIS admin > Student 14571 > Booking 18180 > Accommodation tab.
2. Reconcile payment 17954 (EUR 2584.96, Bank Transfer, HubSpot 1268783973563) in Xero against booking 18180 invoice.

Fix NOT RUN. Last checked: 2026-07-17 FRI UTC (46th check, hourly bot).

---
47th check 2026-07-17 FRI UTC

CONFIRMED UNCHANGED (fresh DB).
Payment 17954 (EUR 2584.96, Bank Transfer, 26 June 2026, HubSpot 1268783973563): xero_payment_id = STILL null, type = STILL null — 21 days since payment date.
Accommodation 11357 (bed 178, Host Family, Aug 2-Sep 6 2026): claim_status = confirmed (6 July 2026), active = true — 16 days to check-in.
Only 1 booking accommodation on booking 18180 (BA11357 Host Family). Capel Street accommodation (6–14 September 2026) is GENUINELY MISSING from SIS for student 14571 (confirmed fresh DB — bk17980 belongs to student 14521 Pietro Caccianiga, not Giampaolo).
Two outstanding actions (NOT YET RUN):
1. Add Capel Street accommodation Sep 6-14 to booking 18180 via SIS admin > Student 14571 > Booking 18180 > Accommodation.
2. Reconcile payment 17954 in Xero against booking 18180 invoice.
Fix NOT RUN. Last checked: 2026-07-17 FRI UTC (47th check, hourly bot).


---
48th check 2026-07-17 FRI UTC

CONFIRMED UNCHANGED (fresh DB).
Payment 17954 (EUR 2584.96, Bank Transfer, 26 Jun 2026, HubSpot 1268783973563): xero_payment_id = STILL null, type = STILL null — 18 days since Jun 29.
Accommodation 11357 (bed 178, Host Family, Aug 2-Sep 6 2026): claim_status = confirmed (6 July 2026), active = true — 16 days to check-in.
Only 1 booking accommodation on booking 18180 (BA11357). Capel Street accommodation (6-14 September 2026) STILL MISSING from SIS (confirmed fresh DB).
Two outstanding actions (NOT YET RUN):
1. Add Capel Street accommodation Sep 6-14 to booking 18180 via SIS admin > Student 14571 > Booking 18180 > Accommodation.
2. Reconcile payment 17954 in Xero against booking 18180 invoice.
Fix NOT RUN. Last checked: 2026-07-17 FRI UTC (48th check, hourly bot).

---
49th check 2026-07-17 FRI UTC

CONFIRMED UNCHANGED (fresh DB). Payment 17954 (EUR 2584.96, Bank Transfer, 26 June 2026, HubSpot 1268783973563): xeroPaymentId = STILL null, type = STILL null — 21 days since payment date. Accommodation 11357 (bed 178, Host Family, Aug 2-Sep 6 2026): claimStatus = confirmed (6 July 2026), active = true — 16 days to check-in. Only 1 booking accommodation on booking 18180 (BA11357 HF). Capel Street accommodation (6-14 September 2026) STILL MISSING from SIS for student 14571 (confirmed fresh DB — bk17980 belongs to student 14521 Pietro Caccianiga, not Giampaolo).
Two outstanding actions (NOT YET RUN):
1. Add Capel Street accommodation Sep 6-14 to booking 18180 via SIS admin > Student 14571 > Booking 18180 > Accommodation.
2. Reconcile payment 17954 (EUR 2584.96, HubSpot 1268783973563) in Xero against booking 18180 invoice.
Fix NOT RUN. Last checked: 2026-07-17 FRI UTC (49th check, hourly bot).

---
50th check 2026-07-17 FRI UTC

CONFIRMED UNCHANGED (fresh DB). Payment 17954 (EUR 2584.96, Bank Transfer, 26 June 2026, HubSpot 1268783973563): xeroPaymentId = STILL null, type = STILL null — 21 days since payment date. Accommodation 11357 (bed 178, Host Family, Aug 2-Sep 6 2026): claimStatus = confirmed (6 July 2026), active = true — 16 days to check-in. Only 1 booking accommodation on booking 18180 (BA11357 HF). Capel Street accommodation (6-14 September 2026) STILL MISSING from SIS for student 14571 (confirmed fresh DB — bk17980 belongs to student 14521 Pietro Caccianiga, not Giampaolo). Two outstanding actions (NOT YET RUN): (1) Add Capel Street accommodation Sep 6-14 to booking 18180 via SIS admin > Student 14571 > Booking 18180 > Accommodation. (2) Reconcile payment 17954 (EUR 2584.96, HubSpot 1268783973563) in Xero against booking 18180 invoice. Fix NOT RUN. Last checked: 2026-07-17 FRI UTC (50th check, hourly bot).

---
51st check 2026-07-17 FRI UTC

CONFIRMED UNCHANGED (fresh DB).
Payment 17954 (EUR 2584.96, Bank Transfer, 26 June 2026, HubSpot 1268783973563): xeroPaymentId = STILL null, type = STILL null - 21 days since payment date.
Accommodation 11357 (bed 178, Host Family, Aug 2-Sep 6 2026): claimStatus = confirmed (6 July 2026), active = true - 16 days to check-in.
Only 1 booking accommodation on booking 18180 (BA11357 Host Family). Capel Street accommodation (6-14 September 2026): NOT PRESENT in DB for student 14571 (confirmed fresh DB - booking 17980 belongs to student 14521 Pietro Caccianiga, not Giampaolo).
Two outstanding actions (NOT YET RUN):
1. Add Capel Street accommodation Sep 6-14 to booking 18180 via SIS admin > Student 14571 > Booking 18180 > Accommodation.
2. Reconcile payment 17954 (EUR 2584.96, Bank Transfer, HubSpot 1268783973563) in Xero against booking 18180 invoice.
Fix NOT RUN. Last checked: 2026-07-17 FRI UTC (51st check, hourly bot).

---
52nd check 2026-07-17 FRI UTC

CONFIRMED UNCHANGED (fresh DB).
Payment 17954 (EUR 2584.96, Bank Transfer, 26 June 2026, HubSpot 1268783973563): xeroPaymentId = STILL null, type = STILL null - 21 days since payment date.
Accommodation 11357 (bed 178, Host Family, Aug 2-Sep 6 2026): claimStatus = confirmed (6 July 2026), active = true - 16 days to check-in.
Only 1 booking accommodation on booking 18180 (BA11357 Host Family). Capel Street accommodation (6-14 September 2026) STILL MISSING from SIS for student 14571 (confirmed fresh DB - booking 17980 belongs to student 14521 Pietro Caccianiga, not Giampaolo).
Two outstanding actions (NOT YET RUN):
1. Add Capel Street accommodation Sep 6-14 to booking 18180 via SIS admin > Student 14571 > Booking 18180 > Accommodation.
2. Reconcile payment 17954 (EUR 2584.96, Bank Transfer, HubSpot 1268783973563) in Xero against booking 18180 invoice.
Fix NOT RUN. Last checked: 2026-07-17 FRI UTC (52nd check, hourly bot).
---
53rd check 2026-07-17 FRI UTC (this run)
CONFIRMED UNCHANGED (fresh DB). Payment 17954 (EUR 2584.96, Bank Transfer, 26 Jun 2026, HubSpot 1268783973563): xeroPaymentId=STILL null, type=STILL null — 21 days since payment date. Accommodation 11357 (bed 178, Host Family, Aug 2-Sep 6 2026): claimStatus=confirmed (6 Jul 2026), active=true — 16 days to check-in. Only 1 BA on booking 18180 (BA11357 HF). Capel Street accommodation (Sep 6-14): NOT PRESENT in DB for student 14571 (fresh DB confirmed — bk17980 is Pietro Caccianiga s14521, not Giampaolo). Two outstanding actions (NOT YET RUN): (1) Add Capel accommodation Sep 6-14 to bk18180 via SIS admin > Student 14571 > Booking 18180 > Accommodation; (2) Reconcile pmt17954 (EUR 2584.96, HubSpot 1268783973563) in Xero against bk18180 invoice. Fix NOT RUN. Last checked: 2026-07-17 FRI UTC (53rd check, hrly bot).

---
54th check Saturday 18 July 2026 UTC

CONFIRMED UNCHANGED (fresh DB, Sat 18 Jul).
Payment 17954 (EUR 2584.96, Bank Transfer, 26 June 2026, HubSpot payment ID 1268783973563): xeroPaymentId=STILL null — 22 days unreconciled.
Booking accommodation 11357 (bed 178, host family, 2 August to 6 September 2026): active=true, claimStatus=confirmed — 15 days to check-in (2 August).
Capel Street accommodation (6 September to 14 September 2026): STILL missing from booking 18180 (confirmed fresh DB).

Fix NOT RUN. 15 days to host family check-in. Last checked: Saturday 18 July 2026 UTC (54th check, hourly bot).

---
58th check Saturday 18 July 2026 UTC (5th today)

CONFIRMED UNCHANGED (fresh DB). Payment 17954 (EUR 2584.96, Bank Transfer, 26 June 2026, HubSpot 1268783973563): xeroPaymentId = STILL null — 22 days unreconciled. Accommodation 11357 (bed 178, Host Family, 2 Aug to 6 Sep 2026): claimStatus = confirmed (6 Jul 2026), active = true — 15 days to check-in. Only 1 booking accommodation on booking 18180 (BA11357 HF). Capel Street accommodation (6-14 September 2026) STILL MISSING from SIS for student 14571 (confirmed fresh DB — booking 17980 belongs to student 14521 Pietro Caccianiga, not Giampaolo).
Fix NOT RUN. Last checked: Saturday 18 July 2026 UTC (58th check, 5th today, hourly bot).

---
62nd check Sun 19 Jul 2026 UTC (1st today)

CONFIRMED UNCHANGED (fresh DB, Sun 19 Jul).
Payment 17954 (EUR 2584.96, Bank Transfer, 26 June 2026, HubSpot 1268783973563): xeroPaymentId = STILL null — 23 days unreconciled.
Booking 18180: Confirmed, EUR 2584.96 / 2584.96, amount open = EUR 0 (fully paid).
Accommodation 11357 (bed 178, host family, 2 August to 6 September 2026): claimStatus = confirmed (6 Jul) — active.
Capel Street accommodation (6 September to 14 September 2026): STILL absent from booking 18180 — only 1 accommodation record exists (confirmed fresh DB, booking 17980 belongs to student 14521 Pietro Caccianiga, not Giampaolo).
Fix NOT Run. Last checked: Sun 19 Jul 2026 UTC (62nd check, 1st today, hourly bot).

---
63rd check Sun 19 Jul 2026 UTC (2nd today)

CONFIRMED UNCHANGED (fresh DB, Sun 19 Jul).
Payment 17954 (EUR 2584.96, Bank Transfer, 26 June 2026, HubSpot 1268783973563): xeroPaymentId = STILL null — 23 days unreconciled.
Booking 18180: Confirmed, EUR 2584.96 / 2584.96 fully paid, amount open = EUR 0.
Accommodation 11357 (bed 178, host family, 2 August – 6 September 2026): claimStatus = confirmed (6 July), active = true — 14 days to check-in.
Only 1 accommodation record on booking 18180. Capel Street accommodation (6–14 September 2026) STILL absent from DB for student 14571.
(bk17980 belongs to student 14521 Pietro Caccianiga — confirmed again this run.)

Two outstanding actions (NOT YET RUN):
1. Reconcile payment 17954 (EUR 2584.96, HubSpot 1268783973563) in Xero against booking 18180 invoice — 23 days overdue.
2. Add Capel Street accommodation Sep 6–14 to booking 18180 via SIS admin > Student 14571 > Booking 18180 > Accommodation.
Fix NOT RUN. Last checked: Sun 19 Jul 2026 UTC (63rd check, 2nd today, hourly bot).
---
64th check Sun 19 Jul 2026 UTC (3rd today)

FRESH DB CHECK CONFIRMED:
Payment 17954 (Giampaolo Russo, EUR 2584.96, Bank Transfer, payment date 26 June 2026): xeroPaymentId = STILL null — 23 days unreconciled.
Booking 18180: CONFIRMED, fully paid EUR 2584.96/2584.96.
Booking accommodation 11357 (bed 178, host family, 2 August to 6 September 2026): active = true — 14 days to check-in.
Capel Street accommodation (6 September to 14 September 2026): STILL absent from booking 18180 — only BA11357 exists.
Fix Not Run. Last checked: Sun 19 Jul 2026 UTC (64th check, 3rd today).

---
65th check Sun 19 Jul 2026 UTC (4th today)
CONFIRMED UNCHANGED (fresh DB, Sun 19 Jul).
Payment 17954 (EUR 2584.96, Bank Transfer, 26 June 2026, HubSpot 1268783973563): xeroPaymentId = STILL null — 23 days unreconciled.
Booking 18180: Confirmed, EUR 2584.96/2584.96 fully paid.
Accommodation 11357 (bed 178, host family, 2 August to 6 September 2026): claimStatus = confirmed (6 July), active = true — 14 days to check-in.
Only 1 accommodation record on booking 18180 (BA11357 HF). Capel Street accommodation (6-14 September 2026) CONFIRMED absent from DB this run (fresh query: no other BAs on bk18180; bk17980 belongs to student 14521 Pietro Caccianiga, not Giampaolo).
Two outstanding actions (NOT YET RUN):
1. Add Capel Street accommodation Sep 6-14 to booking 18180 via SIS admin > Student 14571 > Booking 18180 > Accommodation.
2. Reconcile payment 17954 (EUR 2584.96, HubSpot 1268783973563) in Xero against booking 18180 invoice.
Fix NOT RUN. Last checked: Sun 19 Jul 2026 UTC (66th check, 5th today, hourly bot).

---
67th check Mon 20 Jul 2026 UTC (7th overall today)

CONFIRMED UNCHANGED (fresh DB, Mon 20 Jul).
Payment 17954 (EUR 2584.96, Bank Transfer, 26 June 2026, HubSpot 1268783973563): xeroPaymentId = STILL null -- 24 days unreconciled (payment created 29 Jun).
Booking 18180: Confirmed, EUR 2584.96/2584.96 fully paid.
Accommodation 11357 (bed 178, host family, 2 August to 6 September 2026): claimStatus = confirmed (6 July), active = true -- 13 days to check-in.
Only 1 accommodation record on booking 18180 (BA11357 HF). Capel Street accommodation (6-14 September 2026) STILL absent from DB for student 14571 (bk17980 belongs to student 14521 Pietro Caccianiga).

Two outstanding actions (NOT YET RUN):
1. Add Capel Street accommodation Sep 6-14 to booking 18180 via SIS admin > Student 14571 > Booking 18180 > Accommodation.
2. Reconcile payment 17954 (EUR 2584.96, HubSpot 1268783973563) in Xero against booking 18180 invoice.
Fix NOT RUN. Last checked: Mon 20 Jul 2026 UTC (67th check, hourly bot).

---
68th check Mon 20 Jul 2026 UTC (8th today)

CONFIRMED UNCHANGED (fresh DB Mon 20 Jul).
Payment 17954 (EUR 2584.96, Bank Transfer, created 29 Jun 2026, HubSpot 1268783973563): xeroPaymentId = STILL null, type = STILL null — 21 days unreconciled.
Booking 18180: CONFIRMED, EUR 2584.96/2584.96 fully paid.
Accommodation 11357 (bed 178, Host Family, 2 Aug to 6 Sep 2026): claimStatus = confirmed (6 Jul 2026), active = true — 13 days to check-in.
Only 1 accommodation record on booking 18180 (BA11357 HF). Capel Street accommodation (6-14 Sep 2026) STILL absent for student 14571 (bk17980 belongs to student 14521 Pietro Caccianiga — not Giampaolo).

Two outstanding actions (NOT YET RUN):
1. Add Capel Street accommodation Sep 6-14 to booking 18180 via SIS admin > Student 14571 > Booking 18180 > Accommodation.
2. Reconcile payment 17954 (EUR 2584.96, HubSpot 1268783973563) in Xero against booking 18180 invoice.
Fix NOT RUN. Last checked: Mon 20 Jul 2026 UTC (68th check, hourly bot).

Fix NOT RUN. Last checked: Mon 20 Jul 2026 UTC (69th check, 9th today).

Fix NOT RUN. Last checked: Mon 20 Jul 2026 UTC (71st check, 11th today). Capel Sep6-14 STILL absent. PMT17954 xeroId=null (21d). Check-in Aug2=13 days.
---
56th hrly 106th check Thu 23 Jul 2026 UTC

CONFIRMED UNCHANGED (fresh DB, Thu 23 Jul).
Booking 18180 (Giampaolo Russo, student 14571): CONFIRMED, EUR 2584.96/2584.96 fully paid. Last updated Jun 29 2026.
Booking course 24956 (General English AM, Aug 3 to Sep 11 2026): active = true.
Booking accommodation 11357 (bed 178, Host Family, Aug 2 to Sep 6 2026): claimStatus = confirmed (6 Jul 2026), active = true — 10 calendar days to check-in.
Only 1 BA record on booking 18180 — Capel Street accommodation (Sep 6 to Sep 14 2026) STILL MISSING from DB for student 14571 (confirmed: bk17980 belongs to student 14521 Pietro Caccianiga, not Giampaolo).
Payment 17954 (EUR 2584.96, Bank Transfer, 26 Jun 2026, HubSpot 1268783973563): xero_payment_id = STILL null — 27 days unreconciled.

Two outstanding actions (NOT YET RUN):
1. Add Capel Street accommodation Sep 6-14 to booking 18180 via SIS admin > Student 14571 > Booking 18180 > Accommodation.
2. Reconcile payment 17954 (EUR 2584.96, HubSpot 1268783973563) in Xero against booking 18180 invoice.
Fix NOT RUN. Last checked: Thu 23 Jul 2026 UTC (56th hrly 106th check, hourly bot).

---
## 139th check Tue 28 Jul 2026 UTC

CONFIRMED (fresh DB). Booking 18180 Confirmed EUR 2584.96/2584.96 paid. BA 11357 (bed 178, HF, Aug 2-Sep 6): active=true, claimStatus=confirmed — OK. Capel Street accommodation (Sep 6-14): STILL ABSENT from booking 18180 — only 1 BA exists on this booking.

NEW FINDING: booking course 24956 (General English AM, 3 Aug-11 Sep 2026): 0 class assignments — class not yet assigned. Starts Mon 3 Aug = 6 days away. Check-in Aug 2 = 5 days.

Two outstanding actions (NOT YET RUN):
1. Add Capel Street accommodation Sep 6-14 to booking 18180 via SIS admin.
2. Assign booking course 24956 to a General English AM class before Aug 3.

Fix NOT RUN. Last checked: Tue 28 Jul 2026 UTC (139th check).
