Issue 7 -- Booking 17909 CANCELLED+confirmed (47th check)

Reporter: NM | Area: Booking | Sheet row: 8 | Last checked: 2026-08-18 UTC

Symptom: Booking 17909 (Sofiia Korkishchenko) shows confirmed=true despite CANCELLED status.

Root cause (no change since 2026-06-17):
- Booking 17909 status = CANCELLED, confirmed = true (anomaly)
- Amount paid EUR 0, amount open EUR 727.50, zero payments
- Booking Course 24693 (Renewal AY PM, ends 13 Nov 2026): active = true on cancelled booking
- Student correctly enrolled via Booking 17849 / Booking Course 24623
- Last DB update: 2026-06-17 (62 days ago)
- Same anomaly: Issue 27 (row 28)

Fix recipe (NOT YET RUN):
1. UPDATE booking SET confirmed = false WHERE id = 17909;
2. UPDATE booking_course SET active = false WHERE id = 24693;
3. Verify student 768 enrolled via Booking 17849 (not affected).

Risk: Data hygiene. Low risk. Reversible.

Status: 62 days unchanged. Fix pending Neil approval.
Last checked: 2026-08-18 UTC (47th check)