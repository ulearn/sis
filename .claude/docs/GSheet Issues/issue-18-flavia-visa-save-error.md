Issue 18 — Flavia Nascimento Mariano Visa Status Save Error

Reporter: AC | Area: Visa | Sheet row: 19 | Check: updated 17 Jul 2026

---

Symptom: Visa status says pending so student not showing in to-be-assigned list.
Dropdown change to Approved → save → PrismaClientKnownRequestError.

Root cause — fresh DB 17 Jul 2026

- Student 983 (Flavia Nascimento Mariano): visaStatus = null
- Student record last updated 14 Jul 2026 (unrelated field); visa still null
- Booking 1534: Confirmed, EUR 1308 fully paid
- Root cause: Prisma enum mismatch on visa_status column — the UI is sending a value that
  does not match the stored enum definition, causing the Prisma save to fail
- Operational impact: NONE — student attending normally via SCA 265 (class 11, B1 PM)
- This is a cosmetic data issue only

---

Fix recipe — NOT YET RUN

1. Confirm visa is actually approved in HubSpot before changing (check deal / contact).

2. Set visa status via direct SQL (NOT YET RUN):
   UPDATE "Student" SET visa_status = 'Approved' WHERE id = 983;
   (or whatever the correct visa_status enum value is — check Prisma schema for exact string)

3. Verify fix: reload student 983 in SIS admin, confirm visaStatus shows Approved.

4. Code fix (future): investigate the Prisma enum mismatch so the UI save works without direct SQL.
   Check the visa_status column definition in Prisma schema vs actual DB enum.

Risk: data-hygiene | Cosmetic | No operational impact | Reversible | 1 student

Status: Open — NOT YET RUN. Low urgency (student attending normally).
Last checked: Friday 17 July 2026 UTC
Last checked: Sunday 19 July 2026 UTC (5th check — visaStatus still null, hubspotContactId=783659478249 linked Jul14, BK1534 CONF EUR1308/1308, student attending normally, no change)