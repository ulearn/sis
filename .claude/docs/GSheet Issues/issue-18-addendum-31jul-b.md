Issue 18 - Flavia Nascimento Mariano: Visa Status Null (2nd check 31 Jul 2026)
Student 983 (Flavia Nascimento Mariano): visa_status=null, last updated 2026-07-28T14:50 UTC (UI save failed).
SCA265: class11 (B1 PM), weekEnd 2026-11-20 -- student IS attending (assigned despite visa null).
SCA256: class9 (A2 PM), weekEnd 2026-06-14 -- older, ended.
Root cause: visa_status is TEXT column (not enum). UI throws PrismaClientKnownRequestError.
Must use title-case 'Approved' NOT 'APPROVED' -- case-sensitive match in SIS code.

Fix recipe - NOT YET RUN:
UPDATE students SET visa_status = 'Approved' WHERE id = 983;
Verify: SELECT id, first_name, last_name, visa_status FROM students WHERE id = 983;
Note: student already attending (SCA265 active to Nov 20 2026) -- no operational urgency, data quality only.
UI bug (Prisma enum mismatch) is a separate code issue not addressed here.
Risk: data-hygiene. Reversible. Blast radius: 1 record.
Last checked: 2026-07-31 UTC (2nd check). Student attending via SCA265 to Nov 20 2026.