Issue 18 - Flavia Nascimento Mariano Visa Status Null (113th check, 29 Jul 2026)
Reporter: AC | Area: Booking | Sheet row: 19

Root cause (live check Wed 29 Jul 2026 UTC)
- Student 983 (Flavia Nascimento Mariano): visaStatus=null -- 15 days
- Record last updated 28 Jul 2026 14:50 UTC (manual touch yesterday) -- visa still not set
- Class assignments confirmed: SCA 256 class 9 (Jun 1-14), SCA 265 class 11 (Jun 15-Nov 20) -- class OK
- UI save error (PrismaClientKnownRequestError) may still be present when setting via admin

Fix recipe (NOT YET RUN)
1. Check HubSpot contact for Flavia -- confirm visa status (approved/pending/not required)
2. Try setting via SIS admin. If save error recurs, note exact error.
3. Direct DB fallback: UPDATE Student SET visaStatus=APPROVED, updatedAt=NOW() WHERE id=983;
   (replace APPROVED with correct enum value from HubSpot)

Risk: Data hygiene - low blast radius; student is attending class. Reversible.
Status: Unchanged - Fix NOT RUN.
Last checked: 2026-07-29 UTC