Issue 41 — Giampaolo Russo (64th check, 19th on Aug 2)
Sheet row: 43 | Reporter: AC/Diego | Area: Booking / Accomm

Symptom
Student has dual accommodation (host family + Capel St apartment). Capel BA missing from SIS. Student ARRIVED TODAY (Aug 2).

Root cause (unchanged from 2aug-p)
- Booking 18180 (Giampaolo Russo): confirmed=true, xero_id=null, EUR 2584.96 paid — Xero invoice 40 days overdue.
- BC 24956 (General English AM, Aug3-Sep11): active, sca_count=0 — in Aug3 BH shunt list.
- After Issue 38 BH shunt runs: BC 24956 shifts to Aug4. SCA needed for week Tue 4 Aug.
- BA 11357: Host Family, bed 178, Aug2-Sep6, active=true — OK.
- Capel St apartment (Sep6-Sep14): NO booking accommodation record in database for bk18180.

Status
FIX NOT RUN. Data unchanged from 2aug-p. Student arrived today. All steps still pending.

Fix recipe (NOT YET RUN)
Step 1: Run Issue 38 BH shunt first — BC 24956 is in the shunt list, start_date will move to Aug4.
Step 2: Create SCA on BC 24956 for week starting Tue 4 Aug.
Step 3: Add Capel St booking accommodation for booking 18180: Sep6-Sep14, premium room.
Step 4: Chase Xero for booking 18180 — create Xero invoice (xero_id is null, 40 days overdue).

Risk / category
bookings + documents (Xero) — reversible | blast radius: 1 student (Giampaolo)

Last checked
2026-08-02 UTC (64th overall, 19th on Aug 2)