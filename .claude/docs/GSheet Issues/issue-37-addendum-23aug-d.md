Issue 37 - Veronica Martin - Bed 83 Stale Booking Accommodations
Reporter: KC | Area: Booking / Accomm | Sheet row 39 | Run: 471st, Sun 23 Aug 2026 UTC

Symptom
Student paid for a week on bed 83 (Capel); stale BAs blocking allocation view.

Root Cause (confirmed from live DB, 471st run)
5 past-end BAs on bed 83 are still active = true:

  BA 11239 (Ivan Rodriguez Solares):     3 May to 24 May 2026 - 91 days stale, fee EUR 1,050
  BA 11168 (Diego Da Silva Saldanha):    6 Jun to 20 Jun 2026 - 64 days stale, fee EUR 700
  BA 11285 (Jesus Manuel Ramirez Diaz): 21 Jun to  5 Jul 2026 - 49 days stale, fee null
  BA 11352 (Veronica Martin):            4 Jul to 11 Jul 2026 - 43 days stale, fee EUR 360
  BA 11179 (Africa Mera Bachir):        12 Jul to  9 Aug 2026 - 14 days stale, fee EUR 1,360

Current valid: BA 11173 (Alessandro Signorotti, bed 83, 9 Aug to 30 Aug 2026) active, fee EUR 1,080 - DO NOT TOUCH.
Next: BA 25 (Rosa Maria Mollica, bed 83, 30 Aug to 11 Oct 2026) - starts in 7 DAYS.

Fix Recipe (NOT YET RUN)

  UPDATE booking_accommodations SET active = false
  WHERE id IN (11239, 11168, 11285, 11352, 11179);

Verify:
  SELECT id, start_date, end_date, active FROM booking_accommodations
  WHERE bed_id = 83 ORDER BY start_date;

Risk / Category
- Category: bookings / data-hygiene
- Reversible: yes (SET active = true to undo)
- Blast radius: bed 83 allocation view only; no financial impact
- DEADLINE: before 30 Aug 2026 (7 days)

Status: FIX NOT RUN
Last checked: 2026-08-23 (471st run UTC)