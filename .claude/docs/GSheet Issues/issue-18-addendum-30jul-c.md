## Issue 18 addendum 2026-07-30 (2nd run today)
Hash artefact. Data unchanged.
Student 983 Flavia Nascimento Mariano: visaStatus=null, last touched 2026-07-28 14:50 UTC.
SCA 265: class 11, Jun 15-Nov 20 2026. Active. No ops impact.
UI save blocked: PrismaClientKnownRequestError.

Fix (NOT YET RUN):
UPDATE students SET visa_status='APPROVED', updated_at=NOW() WHERE id=983;

Status: NOT YET RUN. 2026-07-30 UTC.