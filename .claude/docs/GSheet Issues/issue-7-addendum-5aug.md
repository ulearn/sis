Issue 7 — Sofiia Korkishchenko: Cancelled Booking Anomaly (25th check Wed 5 Aug 2026 UTC)
Reporter: Staff | Area: Bookings | Sheet row: 8

Symptom: Student not appearing on arrivals list; booking data anomalous.

Root Cause (verified 2026-08-05 UTC — unchanged, 51 days open)
- Booking 17909 (Sofiia Korkishchenko, student 768): status = CANCELLED, confirmed = true — anomalous (CANCELLED should force confirmed = false)
- Amount paid = EUR 0, amount open = EUR 727.50 — full balance unpaid on a CANCELLED booking
- Booking course 24693 (Renewal Academic Year PM, ends 2026-11-13): active = true — BC still active despite CANCELLED booking status, 0 class assignments

Fix Recipe (NOT YET RUN)
Step 1 — Confirm with Neil/staff whether booking 17909 should remain cancelled or be reinstated.

If staying CANCELLED:
  UPDATE bookings SET confirmed = false, updated_at = NOW() WHERE id = 17909 AND status = 'CANCELLED';
  UPDATE booking_courses SET active = false, updated_at = NOW() WHERE id = 24693;

If reinstating (CONFIRMED):
  UPDATE bookings SET status = 'CONFIRMED', confirmed = true, updated_at = NOW() WHERE id = 17909;
  -- Then assign class to BC 24693 in SIS admin.

Risk: bookings | Reversible: yes | Blast radius: 1 booking, 1 BC
Status: NOT YET RUN | Last checked: 2026-08-05 UTC (25th check) | Open 51 days