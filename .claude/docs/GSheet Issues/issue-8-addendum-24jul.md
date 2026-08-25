Issue 8 - Stale BCs - Addendum 24 Jul 2026
Sheet row: 9 | Check: 8th (Fri 24 Jul 2026 UTC)
Status: Certificate issue RESOLVED. Stale BCs: UNCHANGED (+1d).
BC 1482/1485/1602 ended 19 Dec 2025 - 217d stale
BC 1483/1486 ended 13 Feb 2026 - 161d stale
BC 1484/1487/1603 ended 5 Jun 2026 - 49d stale
Fix (NOT YET RUN): UPDATE BookingCourse SET active=false WHERE id IN (1482,1483,1484,1485,1486,1487,1602,1603)
Risk: Low. Reversible.
Last checked: Fri 24 Jul 2026 UTC