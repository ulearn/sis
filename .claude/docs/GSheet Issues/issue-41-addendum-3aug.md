# Issue 41 — Giampaolo Russo (65th check, 1st on Aug 3)
Sheet row: 43 | Reporter: AC/Diego | Area: Booking / Accomm

Symptom
Student has dual accommodation (host family + Capel St apartment). Capel BA missing from SIS. Student arrived Aug 2.

Root cause (Mon 3 Aug 2026 UTC — Bank Holiday today):
- BC 24956 (General English AM, Aug3-Sep11): active, 0 class assignments. NOT shunted — still starts Aug3 (Bank Holiday).
- After Issue 38 BH shunt runs: BC 24956 shifts to Aug4. SCA needed for week starting Tue 4 Aug.
- BA 11357: Host Family, bed 178, Aug2-Sep6, active=true, fee EUR 1250 — OK.
- Capel St apartment (Sep6-Sep14): NO booking accommodation record in database for bk18180.
- Booking 18180: confirmed=true, payment 17954 (EUR 2584.96, Bank): xeroPaymentId = null — 41 days unreconciled.
- State unchanged from 2aug-q. All steps still pending.

Fix recipe (NOT YET RUN):
Step 1: Run Issue 38 BH shunt FIRST — BC 24956 is in the shunt list, start_date will move from Aug3 to Aug4.
Step 2: Create SCA on BC 24956 for week starting Tue 4 Aug via SIS class assignment UI.
Step 3: Add Capel St booking accommodation for booking 18180:
  - Start date: 2026-09-06, End date: 2026-09-14
  - Type: Apartment / premium room (Capel Street)
  - Assign a Capel bed once allocation is decided
Step 4: Chase Xero for booking 18180 — payment 17954 (EUR 2584.96, Bank) has xeroPaymentId=null for 41 days.
  Create Xero payment manually and record ID back in SIS payments.xero_payment_id.

Risk/category: bookings + documents (Xero) — reversible | blast radius: 1 student (Giampaolo)
Status: NOT RUN — 65th check, 1st on Mon 3 Aug 2026 UTC
