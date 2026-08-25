Issue 18 — Flavia Nascimento Mariano (3rd check)
Reporter: PG | Area: Visa | Sheet row: 19

Symptom: Visa status shows pending in SIS; student not appearing in to-be-assigned list. UI save fails.

Root cause (Sun 2 Aug 2026 UTC, 2 days since last check Fri 31 Jul):
- Student 983 (Flavia Nascimento Mariano): visa_status = null — unchanged
- Class assignment 265 (class 11, week end 20 Nov 2026): active — student IS attending (visa not blocking attendance)
- visa_status column is TEXT — correct insert value is 'Approved' (title case)
- UI save throws PrismaClientKnownRequestError — requires direct SQL update
- Student last updated 28 Jul 2026 (visa field still null after that touch)

Fix recipe (NOT YET RUN):

Step 1 — Set visa_status via direct SQL:
  UPDATE students SET visa_status = 'Approved' WHERE id = 983;
  Verify: SELECT id, first_name, last_name, visa_status FROM students WHERE id = 983;

Step 2 — Confirm student now appears in to-be-assigned list:
  SIS admin: Classes > To Be Assigned — verify Flavia Nascimento Mariano appears

Risk/category: Data-hygiene; low blast radius (1 student). Reversible. Not urgent (student attending).
Status: NOT RUN — 3rd check Sun 2 Aug 2026 UTC