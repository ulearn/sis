Issue 18 - Flavia Nascimento Mariano - Visa Status Null - Addendum 23 Jul 2026

Sheet row: 19 | Check: 2nd (Thu 23 Jul 2026 UTC)

Status: UNCHANGED - visa null, last DB update 14 Jul 2026 (9 days ago)

Evidence (fresh DB, 23 Jul 2026 UTC):
- Student 983 (Flavia Nascimento Mariano): visaStatus = null
- Record last updated: 14 Jul 2026 (9 days ago)
- HubSpot contact ID: 783659478249 (linked - visa status can be cross-checked)
- Null visa status blocks student from class-to-be-assigned view
- Original Prisma save error (code bug) fixed; field was never backfilled

Fix Recipe (NOT YET RUN):

Step 1 - Confirm visa status via HubSpot contact 783659478249 or with student/staff.

Step 2 - Set visa status (once confirmed):
  UPDATE "Student" SET "visaStatus" = 'APPROVED' WHERE id = 983;
  (or use SIS admin UI: Student 983 -> Personal Details -> Visa Status -> Save)

Risk: Low. Reversible. Confirm actual status - do not assume Approved.

Last checked: Thu 23 Jul 2026 UTC