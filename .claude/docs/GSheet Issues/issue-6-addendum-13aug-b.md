Issue 6 Addendum 13 Aug 2026 (48th check) -- Erroneous Mobile Numbers

Reporter: PG  Area: Overview  Sheet row: 7

Root Cause (48th check -- Thu 13 Aug UTC, 237th hourly run, no change)
- 552 students with phoneMobile not starting with + (unchanged)
- ~417 students with + prefix but containing spaces or dashes (unchanged)
- Total non-E.164: ~969 students
- Day 34 -- fix not applied. No change since 47th check.

Fix Recipe -- NOT YET RUN
  Step 1: Export all student rows where phone_mobile IS NOT NULL.
  Step 2: Strip spaces and dashes; add country code where + prefix missing.
  Step 3: Validate against E.164 regex; review flagged rows before committing.
  Step 4 (bulk update):
    UPDATE student SET phone_mobile = REGEXP_REPLACE(phone_mobile, chr(39)||[^0-9+]||chr(39), chr(39)||chr(39), chr(39)||g||chr(39))
    WHERE phone_mobile IS NOT NULL AND phone_mobile NOT SIMILAR TO chr(39)||chr(92)||+[0-9]{8,15}||chr(39);

Risk: data-hygiene. Reversible (backup first). Blast radius: ~969 student records.
Status: Fix NOT RUN. 48 consecutive checks (day 34). Last checked: Thu 13 Aug 2026 UTC
