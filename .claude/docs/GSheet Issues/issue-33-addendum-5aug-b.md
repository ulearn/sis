Issue 33 — Shih-Wei Huang Wrong Pronouns (18th check)
Reporter: ST | Area: Documents | Sheet row: 34 | Checked: Wed 5 Aug 2026 UTC

SYMPTOM
Exit letter (doc 238) generated with female pronouns for a male student. Gender null in SIS.

ROOT CAUSE — live data Wed 5 Aug 2026 UTC
  Student 356 (Shih-Wei Huang): gender=null, HubSpot contact ID 791708390643
  Last student update: 28 Jul 2026 — gender still null after that touch
  Document 238 (booking 560, Exit Letter, template 4): status=ISSUED, created 17 Jun 2026 — 49 days with wrong pronouns

FIX RECIPE (NOT YET RUN)

Step 1 — Set gender:
  Via HubSpot contact 791708390643 — set gender to Male
  Or directly: p.student.update({ where: { id: 356 }, data: { gender: "MALE" } })

Step 2 — Revoke document 238:
  SIS admin: Documents tab — Doc 238 — Revoke / Void

Step 3 — Regenerate Exit Letter for booking 560:
  Verify pronouns correct in preview before issuing.

RISK: documents. Reversible: yes. Blast radius: 1 student, 1 document.
STATUS: Open — gender null; doc 238 ISSUED 49d with wrong pronouns. Last checked: Wed 5 Aug 2026 UTC (18th hourly run)