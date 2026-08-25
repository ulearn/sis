Issue 22 -- Edith Nunes (addendum Sat 25 Jul 2026 UTC)

Sheet row: 23 | Area: Booking / Class

Student 1015 (Edith Nunes) -- 4 bookings:
  BK 1567  (Jan-May 2026, EUR 482.40)     legacy stale BCs
  BK 17894 (May 18-Jun 12, EUR 540.00)    BC 24665 stale, 0 SCAs
  BK 18158 (Jun 15-Jul 10, EUR 740.00)    2 duplicate BCs 24933+24934, both active, 15d stale, 0 SCAs; pmt 17895 xeroId=null
  BK 18214 (Jul 13-Aug 7, EUR 608.00) CURRENT -- BC 24991 active, 0 SCAs; pmt 18004 xeroId=null

Active booking BK18214:
  Created Jul 9 2026; BC 24991 General English AM Jul 13 to Aug 7
  SCAs: 0 -- no class assignments
  10 school days missed (weeks Jul 13 + Jul 20)
  9 school days remain (week Jul 28 + Aug 4-7, Aug 3 is BH)

Duplicate BCs in BK18158:
  BC 24933 and BC 24934 -- both General English AM Jun 15 to Jul 10
  Both active=true, 15d stale -- should be deactivated

Fix recipe (NOT YET RUN):
1. Assign student 1015 to General English AM for wb Mon 27 Jul (BC 24991, BK 18214)
2. Deactivate BCs 24933+24934:
   UPDATE booking_courses SET active=false WHERE id IN (24933,24934); -- NOT YET RUN
3. Xero reconciliation for pmts 17895 + 18004 (both xeroId=null)

Risk: CRITICAL -- 9 school days remain. Mon 27 Jul is next assignment window.
Last checked: Sat 25 Jul 2026 UTC
