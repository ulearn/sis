# Issue 33 - Shih-Wei Huang (29th check)
Reporter: Staff | Area: Doc Gen | Sheet row: 34 | Sun 16 Aug 2026 UTC

Symptom: Exit letter generated with she/her pronouns; student uses he/him.

Root Cause (29th check - 16 Aug 2026 UTC):
- Student 356 (Shih-Wei Huang): gender=null, last updated 2026-07-28 (19 days ago)
- Document 238 (Exit Letter, booking 560): ISSUED v1, created 2026-06-17 - 60 days issued with wrong pronouns
- No superseding version exists
- No change from 28th check (Sat 15 Aug). +1 day.

Fix Recipe (NOT YET RUN):
1. Confirm pronouns with staff (he/him assumed)
2. Set gender: UPDATE Student SET gender='MALE' WHERE id=356
3. Navigate to student 356 > Booking 560 > Documents > Exit Letter > regenerate (creates v2 DRAFT)
4. Review and ISSUE v2; notify student/agency

Risk: Documents | Reversible | Low blast radius
Status: Open - fix NOT RUN | Last checked: Sun 16 Aug 2026 UTC
