# Issue 6 - Erroneous Mobile Numbers (addendum 14 Aug 2026-b)
Reporter: PG | Area: Overview | Sheet row: 7
52nd check Fri 14 Aug 2026 UTC

Root cause (live data):
- 552 students with non-null phone_mobile not starting with + (unchanged)
- 418 students with + prefix but spaces or dashes (unchanged)
- Total non-E.164: 970 of 14,462 total students (unchanged)
- Day 37 since issue logged; fix not applied
- Hash change this run: minor edit to B/F/G on sheet; phone data unchanged

Fix recipe (NOT YET RUN):
Step 1 - strip spaces/dashes from + numbers:
  UPDATE students SET phone_mobile = replace(replace(phone_mobile, ' ', ''), '-', ''),
         updated_at = NOW()
  WHERE phone_mobile LIKE '+%' AND (phone_mobile LIKE '% %' OR phone_mobile LIKE '%-%');
Step 2 - triage 552 without + prefix manually (country code unknown per record).

Risk: data-hygiene. Reversible. Blast: up to 418 phone records.
Status: Open - 970 non-E.164. Fix NOT RUN. Day 37.
Last checked: Fri 14 Aug 2026 UTC (52nd check)
