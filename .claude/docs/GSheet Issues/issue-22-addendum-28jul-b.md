Issue 22 Edith Nunes Class (138th check Tue 28 Jul 2026)
Row 23 CRITICAL ends Aug 7 10 days remain

Root cause: Student 1015 (Edith Nunes) BC24991 General English AM 13 Jul-7 Aug 2026 active=true 0 class assignments. Duplicate BCs 24933+24934 on booking 18158 both active same Jun15 start date.

Fix NOT YET RUN:
1. Resolve dup: SELECT from booking_course WHERE id IN (24933,24934); deactivate the wrong one.
2. Assign student 1015 to class on BC24991 (10 days remain to Aug7).

Risk: 1 student + 1 dup BC. Reversible.
Status: CRITICAL 0 SCAs 10d remain ends Aug7. Last checked Tue 28 Jul 2026 UTC