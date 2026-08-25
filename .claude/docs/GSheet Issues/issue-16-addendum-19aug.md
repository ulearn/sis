Issue 16 Stale BAs Bed 66 (31st check, 19 Aug 2026)
Sheet row: 17  Reporter: NM  Area: Booking/Accommodation

Symptom: 4 Booking Accommodations remain active past their end date on bed 66.

CORRECTIONS (19 Aug 2026)
1. Booking ID swap: Previous H cells had BA 11216=booking100 and BA 11158=booking46.
   Correct values: BA 11216=booking46, BA 11158=booking100. Recipe file was already correct.
2. TABLE NAME BUG IN RECIPE: issue-16-stale-bas.md line 15 uses booking_accommodation (singular)
   but the actual DB table is booking_accommodations (plural). The SQL will fail as written.
   Also: active column exists in raw DB but is excluded from Prisma model -- raw SQL required.

Evidence (raw SQL, 19 Aug 2026)
- BA 11216 (booking 46, bed 66): end 9 May 2026, active=true, fee EUR 1,440 -- 102 days stale
- BA 11158 (booking 100, bed 66): end 17 May 2026, active=true, fee EUR 193.33 -- 94 days stale
- BA 11282 (booking 17897, bed 66): end 5 Jun 2026, active=true, fee EUR 720 -- 75 days stale
- BA 11361 (booking 18190, bed 66): end 9 Aug 2026, active=true, fee EUR 750 -- 10 days stale
- Bed 66 effectively free since 9 Aug 2026

Fix Recipe -- NOT YET RUN (CORRECTED from issue-16-stale-bas.md)
Table name is booking_accommodations (plural):
  UPDATE booking_accommodations SET active = false WHERE id IN (11216, 11158, 11282, 11361);

Pre-check: Verify Xero reconciliation for BA 11216 (EUR 1,440) and BA 11282 (EUR 720).
Undo: UPDATE booking_accommodations SET active = true WHERE id IN (11216, 11158, 11282, 11361);

Risk: Data-hygiene. Reversible. Low blast radius.
Status: Fix NOT RUN. Last checked: Wed 19 Aug 2026 UTC (31st check).