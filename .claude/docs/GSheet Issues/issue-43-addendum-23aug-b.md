Issue 43 addendum 23 Aug 2026 (b)
Reporter: AC | Row 45 | 446th check 2026-08-23 UTC

ROOT CAUSE
- BA 11285 (booking 17825, bed 83, Jesus Manuel Ramirez Diaz, 21 Jun-5 Jul 2026): 49d stale, fee null
- Same bed 83 as Issue 37 -- 5 stale BAs total
- Incoming BA 25 (Rosa Maria Mollica, 30 Aug-11 Oct 2026): 6 DAYS
- BA 11173 ends 30 Aug -- same day as BA 25 starts (same-day deactivation needed on 30 Aug)

FIX RECIPE (NOT YET RUN)
See issue-37-addendum-23aug-b.md for full bed 83 cleanup.
Direct: UPDATE booking_accommodations SET active=false,updated_at=NOW() WHERE id=11285;
Fee (confirm with staff first): UPDATE booking_accommodations SET fee=<amount>,updated_at=NOW() WHERE id=11285;

RISK: accommodation, reversible. Student 14439 (Jesus Manuel Ramirez Diaz), bed 83 history.
DEADLINE: 30 Aug 2026 (6 days). Fix NOT RUN.
Last checked: 446th check 2026-08-23 UTC
