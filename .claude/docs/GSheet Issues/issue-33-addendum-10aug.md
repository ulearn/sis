Issue 33 - Shih-Wei Huang: Gender Null, Document 238 Wrong Pronouns
Reporter: (staff) | Area: documents | Sheet row: 34
Last checked: 10 Aug 2026 UTC (23rd hourly check)

SYMPTOM
SIS defaulted to she/her pronouns in Shih-Wei Huang Exit Letter because gender was not set.
The issued document (doc 238) contains incorrect she/her pronouns.

ROOT CAUSE (live DB 10 Aug 2026)
- Student 356 (Shih-Wei Huang): gender = null
- Student last updated: 2026-07-28 (13 days ago, no gender correction applied)
- Document 238 (Exit Letter, booking 560): status = ISSUED, version 1
  Issued: 17 Jun 2026 - 54 days ago with incorrect pronouns
  Still active/issued; no revocation has occurred

FIX RECIPE - NOT YET RUN

Step 1 - Set gender on student 356:
  Verify against HubSpot contact 791708390643.
  In SIS: student 356 profile -> Personal Details -> set gender = male.

Step 2 - Revoke document 238:
  SIS -> student 356 -> Documents -> Exit Letter (doc 238) -> Revoke / mark superseded.

Step 3 - Regenerate Exit Letter:
  Regenerate with correct gender -> document will use male pronouns -> re-issue to student/agency.

RISK: Documents. Fully reversible (revoke old doc, generate new one).
Moderate urgency - document has been wrong for 54 days.

STATUS: Open (gender null 13 days since Jul 28; doc 238 ISSUED with wrong pronouns 54 days)
Last checked: 10 Aug 2026 UTC