# Issue 10 - Massimiliano Cameran (36th check, Mon 27 Jul 2026 UTC)

Reporter: AC | Area: Doc Gen / Certs | Sheet row: 11

## Symptom
Certificate shows only last 2 weeks of course (started Apr 27). Cannot correct dates manually.

## Root cause - updated 27 Jul 2026

Student 91 (Massimiliano Cameran) has TWO bookings in SIS:

  Booking 97:    Morning General, 27 Apr - 22 May 2026 (4 wks), EUR 1741/1741, confirmed=false
  Booking 18002: General English AM, 25 May - 5 Jun 2026 (2 wks), EUR 723/723, confirmed=true

NEW 27 Jul 2026: Document 179 is a completion certificate (ISSUED Jun 5 2026) on booking 18002.
This IS the cert showing only last 2 weeks: covers May 25 - Jun 5 only.

Booking 97 (original 4-week course) still has NO completion certificate.
  - Doc 63: accounts REVOKED
  - Doc 64: accounts ISSUED
  - No certificate on booking 97.

Stale booking courses (both active=true past end dates):
  - BC 107:   bk97, Morning General, Apr 27-May 22 2026 - 66 days stale
  - BC 24793: bk18002, General English AM, May 25-Jun 5 2026 - 52 days stale

## Fix recipe - NOT YET RUN

1. Deactivate stale BCs (NOT YET RUN):
     SQL: UPDATE booking_course SET active = false WHERE id IN (107, 24793);
     Or via SIS admin on bookings 97 and 18002.

2. Generate completion certificate for booking 97 (NOT YET RUN):
     SIS admin -> Booking 97 -> Documents -> Generate Certificate of Completion
     Date range: Apr 27 - May 22 2026 (4-week Morning General course)

3. Optional combined cert (NOT YET RUN):
     Weekend gap May 23-24 is cosmetic; consider one cert Apr 27 - Jun 5 if preferred.

4. Review doc 179 (NOT YET RUN):
     If full-period cert issued for bk97, consider revoking doc 179 (2-week cert on bk18002).
     SIS admin -> Booking 18002 -> Documents -> Revoke doc 179.

## Risk / category
- Documents: reversible (cert generation, revocation)
- Data hygiene: stale BC deactivation, cosmetic, low-risk
- Blast radius: student 91 only

## Status
Open. No cert for booking 97. Two stale BCs (107, 24793). Doc 179 = wrong 2-week cert on bk18002.

Last checked: Mon 27 Jul 2026 UTC (36th check)