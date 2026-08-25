Issue 37 addendum 23 Aug 2026
Reporter: AC | Row 39 | 448th check 2026-08-23 UTC

ROOT CAUSE
5 stale Booking Accommodations on bed 83, all active:
- BA 11239 (Ivan Rodriguez Solares, 3 May-24 May 2026): 91d stale, fee=EUR 1050
- BA 11168 (Diego Da Silva Saldanha, 6 Jun-20 Jun 2026): 64d stale, fee=EUR 700
- BA 11285 (Jesus Manuel Ramirez Diaz, 21 Jun-5 Jul 2026): 49d stale, fee=null
- BA 11179 (Africa Mera Bachir, 12 Jul-9 Aug 2026): 14d stale, fee=EUR 1360
- BA 11352 (Veronica Martin, 4 Jul-11 Jul 2026): 43d stale, fee=EUR 360
Current: BA 11173 (Alessandro Signorotti, 9 Aug-30 Aug 2026)
NEXT ARRIVAL: BA 25 (Rosa Maria Mollica, 30 Aug-11 Oct 2026, fee=EUR 2100) -- 7 DAYS

FIX RECIPE (NOT YET RUN)
Step 1 -- Deactivate 5 stale BAs before 30 Aug:
  UPDATE booking_accommodations SET active=false,updated_at=NOW() WHERE id IN(11239,11168,11285,11179,11352);
Step 2 -- Set fee on BA 11285 if confirmed (fee=null): UPDATE booking_accommodations SET fee=<amount>,updated_at=NOW() WHERE id=11285;
Step 3 -- Verify: SELECT ba.id,ba.start_date,ba.end_date,ba.active,ba.fee,s.first_name,s.last_name FROM booking_accommodations ba JOIN bookings bk ON bk.id=ba.booking_id JOIN students s ON s.id=bk.student_id WHERE ba.bed_id=83 ORDER BY ba.start_date;

RISK: accommodation, reversible. Blast radius: 5 past students + bed 83 future bookings.
DEADLINE: Must clear before 30 Aug (Rosa Maria Mollica check-in in 7 days).

STATUS: 5 stale BAs on bed 83. Rosa Maria Mollica arrives 30 Aug (7 days). Fix NOT RUN.
Last checked: 448th check 2026-08-23 UTC