# Issue 38 — Aug Bank Holiday Shunt (11th check Tue 4 Aug 2026 UTC)
Reporter: NM | Area: Holidays/Bookings | Sheet row: 40

## Symptom
School closed Mon Aug 3 (Aug Bank Holiday). 22 booking courses started 2026-08-03. Aug BH still absent from school_closures.

## Root Cause (verified 2026-08-04 UTC, 11th check)
- school_closures: 9 records, none covering 2026-08-03.
- Progress since last run: BC 24964 (Luana Salzano) now has 1 class assignment — assigned.
- 14 booking courses now have 0 class assignments (was 15). BC 25003 confirmed duplicate.
- URGENT: BC 88 (Africa Mera Bachir, bk 82, student 76) ends Fri 7 Aug — 0 SCAs.
- URGENT: BC 25038 (Eduardo Roche Diaz, bk 18258, student 14602) ends Fri 7 Aug — 0 SCAs.
- BC 25006 (Marina Larripa, ended 2026-08-03): 2 days stale, still active.

## 14 BCs with 0 class assignments
  BC 88    | ends Fri 7 Aug  | Africa Mera Bachir (bk 82, st 76)            | URGENT TODAY
  BC 97    | ends Dec 18     | Gustavo Ferreira (bk 89, st 83)
  BC 1766  | ends Sep 4      | Maria Eduarda Alves Paiva (bk 1581, st 1028)
  BC 24958 | ends Feb 2027   | Aurora Madril Oliveira Molina (bk 18182, st 841)
  BC 24959 | ends Feb 2027   | Diego Alves da Silva Molina (bk 18183, st 840)
  BC 24999 | ends Aug 29     | Soumaya Bourguiba (bk 18222, st 14594)
  BC 25003 | ends Sep 18     | Aleix Cervera Gonzalez — DUPLICATE, deactivate only
  BC 25010 | ends Aug 28     | Alin Merticariu (bk 18232, st 14601)
  BC 25016 | ends Jan 2027   | Anderson da Silva Martins (bk 18238, st 14607)
  BC 25029 | ends Nov 13     | Monica Breier Fiametti (bk 18250, st 979)
  BC 25030 | ends Aug 28     | Tayron Sanches Feijo Filho (bk 18251, st 14616)
  BC 25033 | ends Aug 28     | Jingyi Yang (bk 18254, st 14608)
  BC 25035 | ends Dec 18     | Rakan Alghamdi (bk 17915, st 14444)
  BC 25038 | ends Fri 7 Aug  | Eduardo Roche Diaz (bk 18258, st 14602)      | URGENT TODAY

## Fix Recipe (NOT YET RUN)
Step 1 — URGENT: Assign BC 88 + BC 25038 TODAY (end Fri Aug 7).
Step 2 — Deactivate BC 25003 + BC 25006:
  UPDATE booking_courses SET active = false WHERE id IN (25003, 25006);
Step 3 — Insert Aug Bank Holiday:
  INSERT INTO school_closures (name, start_date, end_date, note, is_paid_holiday)
  VALUES ('August Bank Holiday', '2026-08-03', '2026-08-03', 'Public holiday Ireland 2026', false);
Step 4 — Assign remaining 11 students (confirm class first):
  BC 97, 1766, 24958, 24959, 24999, 25010, 25016, 25029, 25030, 25033, 25035.

## Risk: bookings, data-hygiene | Reversible: yes | Blast radius: 22 BCs, 21 students
## Status: NOT YET RUN | Last checked: 2026-08-04 UTC (11th check)
URGENCY: BC 88 (Africa) + BC 25038 (Eduardo) end Fri 7 Aug — assign TODAY.