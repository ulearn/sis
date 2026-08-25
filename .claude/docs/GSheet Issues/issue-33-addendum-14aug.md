Issue 33 - Shih-Wei Huang: Wrong Pronouns in Exit Letter - addendum 14 Aug 2026
Reporter: NM | Row: 34
27th check Fri 14 Aug 2026 UTC

ROOT CAUSE (live data):
- Student 356 (Shih-Wei Huang): gender = null, last updated 28 Jul 2026 (17 days ago)
- Document 238 (Exit Letter, bk 560): ISSUED v1, created 17 Jun 2026 - 58 days with incorrect she/her pronouns
- No superseding version generated

FIX RECIPE (NOT YET RUN):
1. Set gender: prisma.student.update({where:{id:356},data:{gender:MALE}})
2. Revoke doc 238: prisma.documentRecord.update({where:{id:238},data:{status:REVOKED}})
3. Regenerate exit letter for booking 560 via admin UI (will use MALE gender).

RISK: documents. Gender reversible. Revoke not truly reversible but new v2 becomes canonical.
STATUS: Open - fix NOT RUN. Doc 238 ISSUED 58d wrong pronouns. Gender null 17d.
Last checked: Fri 14 Aug 2026 UTC (27th check)