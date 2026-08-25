# Issue 33 -- Shih-Wei Huang -- Wrong Pronouns (Addendum 26 Jul 2026)

Reporter: AC | Area: Documents | Sheet row: 34

Status (10th check, Sun 26 Jul 2026 UTC): UNCHANGED -- 53 days open.

- Student 356 (Shih-Wei Huang): gender = null, last updated 3 Jun 2026 (53 days)
- Document 238 (exit_letter, booking 560): ISSUED v1, updated 18 Jun 2026
  Wrong pronouns: Ms./she/her (null gender defaults to female in code)
- Booking 560: CONFIRMED

Root cause: Code defect in src/scripts/documents.ts ~line 338: null gender defaults to female salutation.

Fix recipe (NOT YET RUN):
1. Confirm pronouns with staff: Shih-Wei Huang is male (he/him)
2. UPDATE students SET gender='male' WHERE id=356;
3. UPDATE document_records SET status='REVOKED' WHERE id=238;
4. Regenerate exit letter for booking 560 via SIS admin
5. Code fix: change null-gender fallback in documents.ts ~L338 from female to neutral (affects all null-gender students)

Risk: documents | Steps 1-4 reversible, step 5 needs testing | Blast radius (step 5): all future docs for null-gender students

Status: OPEN. Last checked: Sun 26 Jul 2026 UTC (110th hourly)