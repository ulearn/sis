Issue 15 — Saikhantes Shagdasuren (20th check, 12th today)

Reporter: pg | Area: Booking / Class | Sheet row: 16

Symptom: Course dates and holidays make no sense for renewal student.

Root cause (confirmed Sun 2 Aug 2026 UTC):
- Student 1001 (Saikhantes Shagdarsuren), booking 18151 (and older bookings)
- BC 24925 (AY Afternoon, 9 Mar to 2 Oct 2026): active, 1 SCA
- SCA 255: class 11, week_start 12 Jan 2026, week_end 3 Jul 2026 — expired 30 days ago (migration artifact range)
- Holiday 2500: start 20 Jul 2026, end 21 Aug 2026 — student on holiday now
- Student returns Monday 24 Aug 2026 (22 days from now)
- BC 1982 (AY Morning, 30 Jun to 19 Dec 2025): still active 226 days after end — stale, 0 SCAs
- No SCA exists for the period after Jul 3 return from holiday

Fix recipe (NOT YET RUN):

Step 1 — Deactivate stale BC 1982:
  UPDATE booking_courses SET active = false WHERE id = 1982;

Step 2 — Create SCA on BC 24925 for week starting Aug 24:
  Via SIS admin: Classes > Assign > Saikhantes Shagdarsuren
  Class 11, week starting Mon 24 Aug 2026
  (Holiday ends Fri 21 Aug; class resumes Mon 24 Aug)

Step 3 — Confirm class number with Adriana (currently class 11).

Risk: Bookings + Classes; low blast radius (1 student). Reversible.

Status: Fix NOT RUN — 20th check, 12th today Sun 2 Aug 2026 UTC (returns 24 Aug, 22 days)