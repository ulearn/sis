Issue 37 addendum 23 Aug 2026 (b)
Reporter: AC | Row 39 | 449th check 2026-08-23 UTC

ROOT CAUSE
- BA 11239 (Ivan Rodriguez Solares, 3 May-24 May 2026): 91d stale, fee EUR 1,050
- BA 11168 (booking 92, 6 Jun-20 Jun 2026): 64d stale, fee EUR 700
- BA 11285 (Jesus Manuel Ramirez Diaz, 21 Jun-5 Jul 2026): 49d stale, fee null
- BA 11352 (booking 18156, Veronica Martin, 4 Jul-11 Jul 2026): 43d stale, fee EUR 360
- BA 11179 (booking 82, 12 Jul-9 Aug 2026): 14d stale, fee EUR 1,360
- Current BA 11173 (Alessandro Signorotti, 9 Aug-30 Aug 2026): ends 30 Aug same day as BA 25 starts
- Incoming BA 25 (Rosa Maria Mollica, 30 Aug-11 Oct 2026): 6 DAYS

SAME-DAY NOTE: BA 11173 ends 30 Aug. BA 25 also starts 30 Aug. Both active on same bed on checkout/checkin day. Deactivate BA 11173 on 30 Aug when Alessandro checks out.

FIX RECIPE (NOT YET RUN)
Step 1 - Deactivate 5 stale BAs before 30 Aug:
  UPDATE booking_accommodations SET active=false,updated_at=NOW() WHERE id IN(11239,11168,11285,11179,11352);
Step 2 - Fee for BA 11285 (confirm amount first):
  UPDATE booking_accommodations SET fee=<confirmed>,updated_at=NOW() WHERE id=11285;
Step 3 - Verify: SELECT ba.id,ba.start_date,ba.end_date,ba.active,ba.fee FROM booking_accommodations ba WHERE ba.bed_id=83 ORDER BY ba.start_date;
Step 4 - On 30 Aug (Alessandro checkout): UPDATE booking_accommodations SET active=false,updated_at=NOW() WHERE id=11173;

RISK: accommodation, reversible. 5 past students affected.
DEADLINE: 30 Aug 2026 (6 days). Fix NOT RUN.
Last checked: 449th check 2026-08-23 UTC
