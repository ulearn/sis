Issue 37 -- Bed 83 Stale Booking Accommodations

Reporter: ST | Area: Booking/Accomm | Sheet row: 39
Last checked: 2026-08-25 UTC (520th run)

ROOT CAUSE (current)
Bed 83, Capel Street. Current: Alessandro Signorotti (BA11173, ends 30 Aug 2026 = 5 DAYS, cleanedAt = null).
Next: Rosa Maria Mollica (BA25, starts 30 Aug 2026 = 5 DAYS, fee = EUR 2,100).

5 stale BAs still active = true (unchanged since 512th run earlier today):
- BA11239 (Ivan Rodriguez Solares): ended 24 May 2026 -- 93d stale, fee 1050
- BA11168 (Diego Da Silva Saldanha): ended 20 Jun 2026 -- 66d stale, fee 700
- BA11285 (Jesus Manuel Ramirez Diaz): ended 5 Jul 2026 -- 51d stale, fee null, cleanedAt set
- BA11352 (Veronica Martin): ended 11 Jul 2026 -- 45d stale, fee 360, cleanedAt = null
- BA11179 (Africa Mera Bachir): ended 9 Aug 2026 -- 16d stale, fee 1360, cleanedAt set

BA11173 (ends Aug 30) needs cleaning before Rosa Mollica (BA25) moves in.

FIX RECIPE (NOT YET RUN)
URGENT -- run BEFORE Aug 30 (5 days):

Step 1: Deactivate all 5 stale BAs on bed 83:
  UPDATE booking_accommodation SET active = false WHERE id IN (11239, 11168, 11285, 11352, 11179);

Step 2: Set fee on BA11285 (Jesus Manuel -- never set):
  UPDATE booking_accommodation SET fee = <rate_for_jun21_to_jul5> WHERE id = 11285;
  (2 weeks, confirm rate with KC)

Step 3: After 30 Aug -- clean BA11173 when Alessandro checks out:
  UPDATE booking_accommodation SET cleaned_at = NOW(), active = false WHERE id = 11173;

RISK: Accommodation / data-hygiene. Reversible. Blast radius: bed 83 only.
DEADLINE: 30 Aug 2026 (5 days) -- Rosa Mollica move-in.
STATUS: Fix NOT RUN.
