# Issue 33 — Shih-Wei Huang (gender null; wrong pronouns on issued exit letter)
Reporter: PG | Area: Documents | Row 34 | 28th check Sat 15 Aug 2026 UTC — no change

ROOT CAUSE (live data, verified 15 Aug 2026):
- Student 356 (Shih-Wei Huang): gender = null — last updated 28 Jul 2026 (18 days ago)
- Document 238 (Exit Letter, booking 560): ISSUED v1, created 2026-06-17 — 59 days with incorrect she/her pronouns
- No superseding version generated; only one version (v1) exists

FIX RECIPE (NOT YET RUN):
1. Set student gender = MALE:
   UPDATE student SET gender = 'MALE' WHERE id = 356;
   (Verify exact enum value in prisma schema.)
2. Revoke document 238 (issued with wrong pronouns):
   UPDATE document_record SET status = 'REVOKED', updated_at = NOW() WHERE id = 238;
3. Regenerate exit letter via admin UI: Student 356 -> Booking 560 -> generate exit letter.
   Confirm new doc shows he/him pronouns before issuing.

RISK: Documents; reversible (gender field; new v2 supersedes revoked v1).
No financial impact. Blast radius: 1 student gender, 1 doc revoked, 1 new doc generated.
STATUS: OPEN — no change. Fix NOT RUN. Doc 238 ISSUED 59d wrong pronouns. Gender null 18d.
Last checked: Sat 15 Aug 2026 UTC (28th check)