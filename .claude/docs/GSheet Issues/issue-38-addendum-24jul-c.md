Issue 38 — School Closures: August & October Bank Holidays — Addendum 24 Jul 2026 C
Reporter: ST | Area: Holidays / Bookings | Sheet row: 40

Symptom
August Bank Holiday 2026 and October Bank Holiday 2026 absent from school_closures.

Root cause (77th hourly check, 150th total — Fri 24 Jul 2026 UTC):
- school_closure table: 9 rows only — Good Friday 2026-2030, Christmas 2026-2029
- August Bank Holiday Mon 3 Aug 2026: STILL absent — 10 calendar days away — CRITICAL
- October Bank Holiday Mon 26 Oct 2026: STILL absent
- BC 24956 (Giampaolo Russo, Issue 41): starts Mon 3 Aug 2026 (the Bank Holiday itself)
  Check-in 2 Aug 2026 = 9 days away
- BC 24991 (Edith Nunes, Issue 22): course ends 7 Aug; system will count 3 Aug as school day
- Impact: attendance sheets show 3 Aug as school day; course end dates not extended past Aug BH

Fix recipe — NOT YET RUN

Step 1: Insert August Bank Holiday via SIS admin (School Closures section)
  Name: August Bank Holiday 2026
  Start: 2026-08-03
  End: 2026-08-03
  isPaidHoliday: true

Step 2: Insert October Bank Holiday
  Name: October Bank Holiday 2026
  Start: 2026-10-26
  End: 2026-10-26
  isPaidHoliday: true

Step 3: Re-check affected courses
After inserting, verify course 24956 (starts 3 Aug) and 24991 (ends 7 Aug) are handled correctly.
If BC 24956 start date needs to move to 4 Aug, that requires a separate booking course update.

Risk / Category
- Category: Bookings / holidays — school calendar data
- Reversible: Yes — can delete schoolClosure rows if incorrect
- Blast radius: All bookings with courses in Aug 2026 and Oct 2026; affects attendance sheets
- Urgency: CRITICAL — Aug BH is 10 days away; course 24956 starts on that day

Status: NOT YET RUN.
Last checked: Fri 24 Jul 2026 UTC (77th issue check, 150th total hourly run)