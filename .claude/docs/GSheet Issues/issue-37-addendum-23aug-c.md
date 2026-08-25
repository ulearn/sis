Issue 37 addendum 470th check Sun 23 Aug 2026
Veronica Martin / Bed 83 -- 5 stale BAs, Aug 30 = 7 days (corrected from 6)

Root cause:
5 stale active Booking Accommodations block bed 83. Rosa Maria Mollica arrives 30 Aug (7 days).

  BA 11239 Ivan Rodriguez Solares: 3 May -- 24 May 2026, 91d stale, fee EUR 1,050
  BA 11168 Diego Da Silva Saldanha: 6 Jun -- 20 Jun 2026, 64d stale, fee EUR 700
  BA 11285 Jesus Manuel Ramirez Diaz: 21 Jun -- 5 Jul 2026, 49d stale, fee null
  BA 11352 Veronica Martin: 4 Jul -- 11 Jul 2026, 43d stale, fee EUR 360
  BA 11179 Africa Mera Bachir: 12 Jul -- 9 Aug 2026, 14d stale, fee EUR 1,360

Current occupant: BA 11173 Alessandro Signorotti, 9 Aug -- 30 Aug 2026, fee EUR 1,080 (not stale).
Incoming: BA 25 Rosa Maria Mollica booking 17844, starts 30 Aug -- 7 DAYS.
Note: corrected from prior 6 DAYS -- Aug 23 to Aug 30 = 7 calendar days.
No data changes since 449th check (also Sun 23 Aug, ~21h earlier).

Fix NOT YET RUN:
1. Deactivate BAs 11239, 11168, 11285, 11179, 11352 before 30 Aug.
   IMPORTANT: BA 11285 fee=null -- confirm with Jesus Ramirez booking whether fee was charged before deactivating.
2. On 30 Aug at checkout: deactivate BA 11173 Alessandro Signorotti.
3. Verify BA 25 Rosa Maria Mollica configured correctly: start 30 Aug, fee EUR 2,100.

Risk: bookings/accomm -- deactivation reversible (set active=true). Blast radius: 5 stale BAs + 1 incoming on bed 83.
Status: Open -- 7 days to Aug 30 arrival. Fix NOT RUN.
Last checked: 2026-08-23 UTC (470th run)
