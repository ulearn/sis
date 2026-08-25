Issue 38 Aug Bank Holiday — Addendum 98th hrly Sat 25 Jul 2026

Reporter: PG | Area: Holidays/Bookings | Sheet row 40

STATUS
Unchanged count from 97th hourly. Aug 3 Bank Holiday = 9 calendar days away. No school_closure entry exists for Aug 3.
Total: 17 booking courses start Aug 3 — 12 non-AY (11 to shunt + 1 dup to delete) + 5 AY auto-handled by webhook.

NEW FINDINGS (98th hrly)

Finding 1: BC 25016 (Anderson da Silva Martins) — end_date is 2028 (2-year typo)
  Booking course 25016: Life Pass Morning, Aug 3 to 2028-08-29 (active=true)
  Booking 18238: PENDING, EUR 0 / EUR 859.06
  Student 14607: Anderson da Silva Martins
  End date 2028-08-29 is almost certainly a typo for 2026-08-29.
  Must be corrected BEFORE the Aug 3 shunt to avoid a BC with a 2-year end date.

Fix (NOT YET RUN):
  SELECT id, name, start_date, end_date, booking_id FROM booking_courses WHERE id = 25016;
  UPDATE booking_courses SET end_date = '2026-08-29' WHERE id = 25016;

Finding 2: BC 97 (Gustavo Ferreira, booking 89) — AY Morning is PENDING/unconfirmed
  Booking course 97: Academic Year Morning, Aug 3 to Dec 18 2026 (active=true)
  Booking 89: status=PENDING, confirmed=false
  Student 83: Gustavo Ferreira
  AY webhook auto-shunt fires on confirmed bookings. A PENDING booking may NOT trigger it on Aug 3.
  Very old IDs (bk 89, student 83) — likely a Fidelo migration artefact.

Fix (NOT YET RUN):
  SELECT id, status, confirmed, amount_total, amount_paid, created_at FROM bookings WHERE id = 89;
  If stale artefact: UPDATE booking_courses SET active = false WHERE id = 97;
  If uncertain: manually shunt BC 97 to Aug 4 alongside non-AY BCs.

FULL SHUNT LIST (unchanged from 97th hourly)

DELETE (not shunt):
  BC 25003 — Aleix Cervera Gonzalez dup (same bk 18225 as BC 25002). Deactivate before shunting BC 25002.

SHUNT Aug 3 to Aug 4 (11 non-AY, NOT YET RUN):
  BC 88: Africa Mera Bachir (bk 82, CONFIRMED)
  BC 1755: Maria Giulia Serpi (bk 1571, CONFIRMED)
  BC 24627: Angelica Guerin (bk 17853, CONFIRMED but confirmed=false anomaly — pre-existing, unrelated)
  BC 24908: Ai Tsunashima (bk 18128, CONFIRMED)
  BC 24956: Giampaolo Russo (bk 18180, CONFIRMED — also Issue 41)
  BC 24964: Luana Salzano (bk 18188, PARTIAL)
  BC 24984: Deva Sofia Onorato (bk 18207, CONFIRMED)
  BC 24999: Soumaya Bourguiba (bk 18222, PENDING)
  BC 25002: Aleix Cervera Gonzalez (bk 18225, CONFIRMED)
  BC 25010: Alin Merticariu (bk 18232, PENDING)
  BC 25016: Anderson da Silva Martins (bk 18238, PENDING) — fix end_date typo first

AY booking courses (5 — auto-webhook when booking confirmed):
  BC 97: Gustavo Ferreira (bk 89, PENDING) — see Finding 2; may need manual shunt
  BC 1766: Maria Eduarda Alves Paiva (bk 1581, CONFIRMED)
  BC 24958: Aurora Madril Oliveira Molina (bk 18182, CONFIRMED)
  BC 24959: Diego Alves da Silva Molina (bk 18183, CONFIRMED)
  BC 24970: Tsengelbayar Mendsaikhan (bk 18194, PARTIAL)

SHUNT SQL (NOT YET RUN)

  -- Step 1: Fix end_date typo on BC 25016
  UPDATE booking_courses SET end_date = '2026-08-29' WHERE id = 25016;

  -- Step 2: Deactivate Aleix dup
  UPDATE booking_courses SET active = false WHERE id = 25003;

  -- Step 3: Shunt 11 non-AY BCs from Aug 3 to Aug 4
  UPDATE booking_courses SET start_date = '2026-08-04'
  WHERE id IN (88, 1755, 24627, 24908, 24956, 24964, 24984, 24999, 25002, 25010, 25016);

  -- Step 4: Verify
  SELECT id, name, start_date, end_date, active FROM booking_courses
  WHERE id IN (88, 1755, 24627, 24908, 24956, 24964, 24984, 24999, 25002, 25003, 25010, 25016) ORDER BY id;

RISK
Category: bookings. Reversible: yes (revert start_date if needed).
Blast radius: 11 students course start dates + 1 dup deactivation + 1 end_date correction.
BC 25016 end_date fix is low-risk but must precede the shunt.

STATUS: Fix NOT RUN. Aug 3 = 9 calendar days away.
Last checked: Sat 25 Jul 2026 UTC (98th hourly)