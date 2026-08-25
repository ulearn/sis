Issue 10 addendum 45th check Sat 8 Aug 2026 UTC

Reporter: various | Area: Doc Gen / Certs | Sheet row: 11

CORRECTION from previous checks: BC 24793 is on booking 18002, NOT booking 97.
Both bookings 97 and 18002 belong to student 91 (Massimiliano Cameran).

State (unchanged):
- Booking 97: CONFIRMED, confirmed=false, EUR 1,741 paid, EUR 0 open
- No completion cert on booking 97 -- only REVOKED invoice (doc 63) + ISSUED invoice (doc 64)
- Booking Course 107 (Morning General, ended 22 May 2026): active=true -- 78 days stale, bookingId=97
- Booking Course 24793 (General English AM, ended 5 Jun 2026): active=true -- 64 days stale, bookingId=18002 (same student)

Fix Recipe (NOT YET RUN):
1. UPDATE booking SET confirmed=true, updated_at=NOW() WHERE id=97;
2. UPDATE booking_course SET active=false, updated_at=NOW() WHERE id IN (107, 24793);
3. Generate cert for booking 97 via SIS admin.

Risk: documents / data-hygiene. Reversible. Blast radius: 1 student, 2 bookings.
Status: OPEN -- fix NOT applied. Last checked: Sat 8 Aug 2026 UTC (45th check).