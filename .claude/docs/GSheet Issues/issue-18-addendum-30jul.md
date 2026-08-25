## Issue 18 -- Flavia Nascimento Mariano -- Visa Status Null (114th check 2026-07-30)
Reporter: PG | Area: Visa | Sheet row: 19
Last checked: 2026-07-30 UTC (114th check)

### Root cause (live DB, 2026-07-30)
- Student 983 Flavia Nascimento Mariano: visa_status=null -- 16 days stale (since ~2026-07-14)
- Last updated 2026-07-28 14:50 UTC (manual touch 2 days ago) -- visa still null
- BC 1710 Academic Year Afternoon: start 2026-06-01, end 2026-11-20, active=true
- Class assignments confirmed OK: SCA 256 class 9 Jun1-Jun14; SCA 265 class 11 Jun15-Nov20
- HubSpot contact ID: 783659478249

### Fix recipe (NOT YET RUN)
Step 1: Check HubSpot contact 783659478249 to confirm visa status (approved/not required/pending)
Step 2: UPDATE students SET visa_status='approved', updated_at=NOW() WHERE id=983;
  -- Use value from HubSpot. Expect 1 row.
Step 3: Verify the UI PrismaClientKnownRequestError on visa dropdown save is resolved.

Verify: SELECT id, first_name, last_name, visa_status FROM students WHERE id=983;

### Risk
Category: visa / data-hygiene. Reversible. Blast radius: 1 student record.

### Status
NOT YET RUN. Last checked: 2026-07-30 UTC (114th check). Visa null 16 days; class OK.