# Issue 45 Addendum 8 Aug 2026-c

**Check:** 39th (Sat 8 Aug 2026 UTC) **Sheet row:** 47

## Root Cause
- Total stale booking courses: 24,479 (active=true end_date < now)
- Unchanged from 38th check. Count stable.
- 10 new stale from 7 Aug: BC 88 (Africa Mera Bachir), BC 1672 (Undralbat Ganbaatar), BC 1673 (Tungalag Davaasuren), BC 1675 (Zorigt Bayarsaikhan), BC 1740 (Suvd-Erdene Baldorj), BC 1742 (Beatriz Venancio Freitas), BC 24955 (Gustavo Da Silva GE AM Plus), BC 24966 (Filippo Corazzini), BC 24967 (Gustavo Da Silva GE AM), BC 24983 (Erin Pastorelli)
- Count grows daily as more courses end

## Fix (NOT YET RUN)

Preview: SELECT COUNT(*) FROM booking_courses WHERE active=true AND end_date < NOW();

Bulk deactivate (WRITE - run only with Neil approval):
  UPDATE booking_courses SET active=false WHERE active=true AND end_date < NOW();

Rollback: UPDATE booking_courses SET active=true WHERE active=false AND updated_at > NOW()-INTERVAL 1 hour AND end_date < NOW();

Note: cert engine reads end_date regardless of active flag - deactivation does not break certificate generation.

## Risk
Data hygiene/bookings. 24,479 rows, reversible. Awaiting Neil decision.

## Status
Open NOT YET RUN. Awaiting decision.

## Last Checked
Sat 8 Aug 2026 UTC (39th check)
