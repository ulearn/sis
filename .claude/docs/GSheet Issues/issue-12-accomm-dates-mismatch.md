Issue 12 — Accommodation Dates Mismatch (Massimiliano / Rakan)

Reporter: AC | Area: Booking / Accommodation | Sheet row: 13 | Check: updated 17 Jul 2026

---

Symptom: Three students with stay start Mon / end Wed. Accommodation assignments may be cutting off nights.

Root cause — fresh DB 17 Jul 2026

Stale active accommodation records (should be inactive, stays are in the past):
- BA11162: booking 97, bed 179, 21 Apr-23 May 2026, active=true — 57 days stale
- BA11314: booking 18002, bed 179, 23 May-6 Jun 2026, active=true — 43 days stale
- BA11319: booking 18034, no bed assigned, 31 May-31 May 2026, active=true — 49 days stale (zero-day record)

Current active (correct):
- BA11287: Rakan Alghamdi, bed 190, 4 Jul-19 Dec 2026, active=true — correct ongoing stay

The original Mon/Wed date issue (Massimiliano BA dates): checked and the date overlap across
BA11162→11314→11319 was a Fidelo migration artifact. Current BA11287 (Rakan) is correct.

---

Fix recipe — NOT YET RUN

1. Deactivate 3 stale accommodation records:
   UPDATE "BookingAccommodation" SET active = false WHERE id IN (11162, 11314, 11319);

2. Verify: BA11287 (Rakan, bed 190, 4 Jul-19 Dec) remains active=true — do not touch.

Risk: data-hygiene | Low risk — all 3 records are past-stay records | Reversible | 0 operational impact

Status: Open — NOT YET RUN.
Last checked: Sunday 19 July 2026 UTC (7th check — re-verified after sheet B edit; data unchanged)