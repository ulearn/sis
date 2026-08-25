# Issue 33 — Shih-Wei Huang (gender null, doc 238 wrong pronouns)

Reporter: PG | Area: Documents | Sheet row 34 | 22nd check Sun 9 Aug 2026 UTC

## Symptom
Exit Letter (doc 238) generated with she/her pronouns. Gender not set in SIS.

## Root cause
- Student 356 (Shih-Wei Huang): gender = null, hubspotContactId = 791708390643
- Last student update: 2026-07-28 (12 days ago) — gender still null, no action taken
- Document 238 (booking 560, Exit Letter): status = ISSUED, versionNo = 1, createdAt 2026-06-17
- Document issued with incorrect she/her pronouns for 53 days (Jun 17 to Aug 9)
- Root cause: gender null when letter generated; template defaulted to she/her
- No change since Sat 8 Aug.

## Fix recipe (NOT YET RUN)
### Step 1 — Set gender in HubSpot
- Open HubSpot contact 791708390643
- Confirm correct gender (likely male — confirm with staff)
- Set gender field; SIS will sync

### Step 2 — Revoke doc 238
```sql
UPDATE "DocumentRecord" SET status = 'REVOKED' WHERE id = 238;
```
Or via SIS Admin: booking 560 → Documents → revoke doc 238.

### Step 3 — Regenerate Exit Letter
- SIS Admin → booking 560 → generate new Exit Letter (after gender set)
- Issue to student

## Risk
Category: documents | Reversible: yes | Blast radius: student 356, doc 238 only

## Status
Pending — gender null 53+ days; doc 238 ISSUED with wrong pronouns. Fix NOT RUN.
Last checked: Sun 9 Aug 2026 UTC