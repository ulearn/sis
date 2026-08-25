Issue 7 - Sofiia Korkishchenko Booking Anomaly
Reporter: AC | Area: Booking | Sheet row 8

Symptom: Student not on arrivals list; two bookings in profile.

Root cause (26th hourly check - Wed 5 Aug 2026 UTC)

Booking 17909 (Sofiia Korkishchenko, student 768):
  Status:    CANCELLED
  Confirmed: true   (anomaly - should be false on a cancelled booking)
  Paid:      EUR 0
  Open:      EUR 727.50 (full balance unpaid)
  Payments:  0

Booking course 24693:
  Name:   Renewal - Academic Year PM
  End:    2026-11-13
  Active: true  (anomaly - active on a cancelled booking)
  SCAs:   0

All figures unchanged - 52 consecutive days open.

Fix recipe (NOT YET RUN)

Neil must decide: cancel vs reinstate.

Option A - Keep cancelled:
  UPDATE booking SET confirmed = false WHERE id = 17909 AND status = 'CANCELLED';
  UPDATE booking_course SET active = false WHERE id = 24693;

Option B - Reinstate:
  UPDATE booking SET status = 'CONFIRMED', confirmed = true WHERE id = 17909;
  Then collect EUR 727.50 via normal SIS payment flow.

Risk: bookings | money | Reversible: yes | Blast radius: low
Status: Open - awaiting Neil decision. 52 days open. NOT RUN.
Last checked: Wed 5 Aug 2026 UTC (26th hourly check)