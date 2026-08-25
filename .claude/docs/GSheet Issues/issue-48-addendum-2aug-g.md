# Issue 48 - Galbusera / Fassina / class assignment group
Reporter: Staff | Area: Attendance/Classes | Sheet row: 50

Symptom: Four ILEP students don't appear in SIS for class assignment. Galbusera and Fassina (2-week) also affected.

Root cause (32nd check, 7th today - Sun 2 Aug 2026 UTC):
Galbusera / Fassina sub-issue (cross-ref Issue 1):
- Booking 17856 (Galbusera): CONFIRMED, confirmed = false, amtPaid = EUR 339.90, amtOpen = null, 0 payments linked
- Booking 17857 (Fassina): CONFIRMED, confirmed = false, amtPaid = EUR 339.90, amtOpen = null, 0 payments linked
- Booking course 24631 (ended Jul 10): active = true - 23 days stale
- Booking course 24630 (ended Jul 10): active = true - 23 days stale
- Orphan pmt 16988 (EUR 339.90, Bank, hubspotId=1204827374829, Apr 28): bookingId = null, 97 days
- Orphan pmt 16989 (EUR 339.90, Bank, hubspotId=1204846469317, Apr 28): bookingId = null, 97 days
- Likely match: pmt 16988 to bk 17856 (Galbusera); pmt 16989 to bk 17857 (Fassina) - same amounts/date/method

Uyanga, Arunsarnai, Telmuun: tracked in Issues 20, 25. Saikhantes: Issue 15. Enshi: Issue 23.

Fix recipe (NOT YET RUN):

Step 1 - Verify HubSpot payments 1204827374829 and 1204846469317:
Look up in HubSpot. Expected: one = Galbusera deal, one = Fassina deal.

Step 2 - Link orphan payments to bookings (after HubSpot verification):
UPDATE payments SET booking_id = 17856 WHERE id = 16988;
UPDATE payments SET booking_id = 17857 WHERE id = 16989;

Step 3 - Set confirmed = true on bookings 17856 and 17857:
UPDATE bookings SET confirmed = true WHERE id IN (17856, 17857);

Step 4 - Deactivate stale booking courses:
UPDATE booking_courses SET active = false WHERE id IN (24630, 24631);

Step 5 - Reconcile Xero for both payments (xeroPaymentId = null for both).

Step 6 - Verify:
SELECT id, status, confirmed, amount_paid FROM bookings WHERE id IN (17856, 17857);
SELECT id, amount, booking_id, xero_payment_id FROM payments WHERE id IN (16988, 16989);
SELECT id, active, end_date FROM booking_courses WHERE id IN (24630, 24631);

Risk: money (payment linking), bookings, data-hygiene. Confirm via HubSpot before linking payments.
Status: OPEN. Fix NOT RUN. 0 payments linked. BCs 23d stale. Last checked: Sun 2 Aug 2026 UTC (31st check, 6th today)