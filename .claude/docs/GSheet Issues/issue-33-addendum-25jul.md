# Issue 33 Shih-Wei Huang — Wrong Pronouns — Addendum 99th hrly Sat 25 Jul 2026

Reporter: AC | Area: Documents | Sheet row 34

STATUS: UNCHANGED (52 days open)

Live data (99th hrly):
  Student 356 (Shih-Wei Huang): gender=null, last updated 3 Jun 2026 (52 days)
  Document 238 (exit_letter, booking 560): ISSUED v1, created 17 Jun, updated 18 Jun
    Wrong pronouns: Ms/she/her (null gender defaults to female in code)
  Booking 560: CONFIRMED, confirmed=true

Root cause (unchanged):
  Code defect in src/scripts/documents.ts ~line 338: null gender defaults to female salutation.
  14,000+ students may have null gender — same code defect affects all generated documents.

Fix recipe (NOT YET RUN):
  1. Confirm pronouns with staff: is Shih-Wei Huang he/him?
  2. UPDATE students SET gender='male' WHERE id=356; (or female if confirmed)
  3. UPDATE document_records SET status='REVOKED' WHERE id=238;
  4. Regenerate exit letter for booking 560 in SIS admin.
  5. Code fix: change null-gender fallback in documents.ts ~L338 from female to neutral/error.
     This must be done carefully — affects all document types with pronoun substitution.

Risk: Low for steps 1-4 (reversible). Medium for step 5 (code change, needs testing).
Category: documents. Blast radius (step 5): all future document generation for null-gender students.

STATUS: Fix NOT RUN. 52 days open.
Last checked: Sat 25 Jul 2026 UTC (99th hourly)
