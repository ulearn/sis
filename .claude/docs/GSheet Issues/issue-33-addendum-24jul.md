Issue 33 - Shih-Wei Huang - Wrong Pronouns in Exit Letter - Addendum 24 Jul 2026
Sheet row: 34 | Check: 9th (Fri 24 Jul 2026 UTC)
Status: UNCHANGED - doc 238 still ISSUED with wrong pronouns; gender still null.
Evidence:
- Student 356 (Shih-Wei Huang): gender=null, last updated 3 Jun 2026 (51d ago)
- Doc 238 (exit_letter, bk560): ISSUED v1, created 17 Jun, updated 18 Jun - wrong Ms/she/her pronouns
- Booking 560: CONFIRMED confirmed=true
- Code defect in src/scripts/documents.ts ~line 338: null gender defaults to female salutation
- 14,000+ null-gender students affected by same code defect
Fix Recipe (NOT YET RUN):
1. Confirm pronouns with staff (he/him for Shih-Wei Huang)
2. UPDATE Student SET gender='male' WHERE id=356
3. UPDATE DocumentRecord SET status='REVOKED' WHERE id=238
4. Regenerate exit letter for bk560 in SIS admin
5. Code fix: change null-gender fallback in documents.ts ~L338 from female to neutral/error
Risk: Low. DB reversible. Code fix needs careful testing (all doc types).
Last checked: Fri 24 Jul 2026 UTC