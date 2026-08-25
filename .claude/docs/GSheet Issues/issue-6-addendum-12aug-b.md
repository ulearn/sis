ISSUE 6 - Erroneous Mobile Numbers (count up 966 to 969)
Reporter: PG | Sheet row: 7 | 45th check Wed 12 Aug 2026 UTC

Symptom: Students have non-E.164 mobile numbers in SIS.

Root Cause (updated 12 Aug):
Phone count increased by 3: 969 non-E.164 (was 966 at 44th check).
Breakdown of 969 non-E.164 numbers:
  552: no + prefix (e.g. 0857123456)
  414: + prefix but contains spaces (e.g. +353 85 7123456)
    3: + prefix but contains other non-digit characters (dashes or parentheses) - newly detected
Total students with mobile on record: 1,372 (unchanged; 3 new students added with bad format).

Fix Recipe (NOT YET RUN):
  Preview script (read-only, run first to review before any UPDATE):
    students.filter(s => not_e164(s.phoneMobile)).forEach(s => {
      const fixed = plus_prefix + digits_only(s.phoneMobile);
      console.log(s.id, s.phoneMobile, fixed.length >= 8 ? fixed : NEEDS_MANUAL_REVIEW);
    });
  After Neil approves preview output, run batch UPDATE.

Risk: Data hygiene - reversible with backup. 969 student records.
Status: OPEN - not run. Count: 969 (up 3 from 966). Day 32.
Last checked: Wed 12 Aug 2026 UTC (45th check)