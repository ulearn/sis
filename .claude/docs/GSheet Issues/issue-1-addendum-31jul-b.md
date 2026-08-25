# Issue 1 — Orphan Payments (117th check)

Reporter: NM · Area: Cleanup · Sheet row: 2

## Root cause (31 Jul 2026)

4 payments with bookingId=null — all unchanged:
- Payment 16988: EUR 339.90, Bank, paid 2026-04-28, 94 days, HubSpot payment ID 1204827374829
- Payment 16989: EUR 339.90, Bank, paid 2026-04-28, 94 days, HubSpot payment ID 1204846469317
- Payment 17187: EUR 6,151, TransferMate Escrow, paid 2026-05-01, 91 days, Fidelo ID 37587, ref D2026226
- Payment 4781: EUR 380, Flywire, paid 2019-08-20, ~7 years, Fidelo ID 32056

Total unlinked: EUR 7,210.80

## Fix recipe (NOT YET RUN)

16988 + 16989: Look up HubSpot payments 1204827374829 / 1204846469317 → identify booking →
  UPDATE payments SET booking_id=<id>, updated_at=NOW() WHERE id IN (16988,16989);

17187: Look up Fidelo ref D2026226 in /home/hub/web/hub.ulearnschool.com/public_html/fins/ →
  identify booking → UPDATE payments SET booking_id=<id>, updated_at=NOW() WHERE id=17187;

4781: Legacy 2019 Flywire migration artefact. Likely no matching SIS booking.
  Consider: UPDATE payments SET comment='Legacy Flywire 2019 — no matching booking' WHERE id=4781;

## Risk: Money. Reversible. 4 payments, EUR 7,210.80 unlinked.
## Status: OPEN — fix NOT RUN — Last checked: Fri 31 Jul 2026 UTC (117th check)
