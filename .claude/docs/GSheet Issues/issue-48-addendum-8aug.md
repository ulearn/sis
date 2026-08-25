Issue 48 -- New findings: Telmuun 6 stale BCs, Ana Jessica CANCELLED, Ariunsarnai PENDING (72nd check, 8 Aug 2026)

Reporter: AC | Area: Attendance/classes | Sheet row: 50 | Check: 72nd hourly -- Sat 8 Aug 2026 UTC

SYMPTOM
Cannot assign several ILEP students to classes. New findings this run: Telmuun has 6 stale BCs (512d max); Ana Jessica booking CANCELLED despite EUR 1,530 paid; Ariunsarnai booking PENDING and unpaid.

ROOT CAUSE (verified live, 8 Aug 2026)

1. Telmuun Enkhsaikhan (student 293) -- NEW
   Booking 467 (CONFIRMED, EUR 220 paid):
   - BC 482 (Academic Year Afternoon, 6 Jan 2025 to 14 Mar 2025): active=true -- 512 days stale
   - BC 483 (Academic Year Afternoon, 31 Mar 2025 to 11 Jul 2025): active=true -- 393 days stale
   Booking 1466 (CONFIRMED, EUR 1,784.50 paid):
   - BC 1609 (Academic Year Renewal Afternoon, 13 Oct 2025 to 19 Dec 2025): active=true -- 231d stale
   - BC 1610 (Academic Year Renewal Afternoon, 5 Jan 2026 to 9 Jan 2026): active=true -- 211d stale
   - BC 1611 (Academic Year Renewal Afternoon, 19 Jan 2026 to 6 Mar 2026): active=true -- 155d stale
   - BC 1612 (Academic Year Renewal Afternoon, 16 Mar 2026 to 1 May 2026): active=true -- 99d stale
   BA 10779 (5 Jan 2025 to 19 Jan 2025): active=true -- 570 days stale
   Booking 1624 (PARTIAL, EUR 1,406/1,656, confirmed=false):
   - BC 1810 (Academic Year Renewal Morning, 29 Jun 2026 to 1 Jan 2027): active, CURRENT
   Root cause: Stale BCs from AY 2024-25 and 2025-26 never deactivated.

2. Ariunsarnai Batbayar (student 1047)
   Booking 1605: status=PENDING, confirmed=false, EUR 0/1,509 unpaid
   BC 1791 (Academic Year Renewal Morning, 13 Apr to 23 Oct 2026): active=true
   Root cause: PENDING booking -- student not confirmed, not visible in class assignment UI.

3. Ana Jessica Rosa de Paula Santos (student 766)
   Booking 1308: status=CANCELLED, confirmed=false, EUR 1,530 PAID (anomaly)
   BC 1350 (Academic Year Afternoon, 25 May to 13 Nov 2026): active=true
   Root cause: booking CANCELLED despite full payment. Class assignment filters to CONFIRMED.
   Student has HubSpot contact 777791875262.

4. Uyanga Tungalag (student 917)
   Booking 1467: CONFIRMED, confirmed=true, EUR 2,405 paid
   BC 1613 (Academic Year Morning, 27 Apr to 30 Oct 2026): active, CURRENT
   hubspotContactId = null -- may affect search/display in SIS.

5. Fassina / Fassini name (student 14462)
   DB: Francesca Fassina, email francescafassina98@gmail.com, HubSpot 769644314873
   Reporter uses "Fassini" -- correct spelling unverified (HubSpot lookup deferred).
   BCs 24630 + 24631: ended 10 Jul 2026, active=true -- 29 days stale.

FIX RECIPE (NOT YET RUN)

Step 1 -- Deactivate Telmuun 6 stale BCs:
  UPDATE booking_courses SET active = false, updated_at = NOW() WHERE id IN (482, 483, 1609, 1610, 1611, 1612);

Step 2 -- Deactivate Telmuun stale BA 10779:
  UPDATE booking_accommodations SET active = false, updated_at = NOW() WHERE id = 10779;

Step 3 -- Ana Jessica booking 1308 (Neil decision needed):
  Option A (student still studying): UPDATE bookings SET status = 'CONFIRMED', confirmed = true, updated_at = NOW() WHERE id = 1308;
  Option B (student departed): Deactivate BC 1350. UPDATE booking_courses SET active=false WHERE id=1350;

Step 4 -- Ariunsarnai booking 1605 (Neil decision needed):
  If payment received: UPDATE bookings SET status = 'CONFIRMED', confirmed = true, updated_at = NOW() WHERE id = 1605;
  If not paid: leave PENDING, follow up with student.

Step 5 -- Verify Fassina surname in HubSpot:
  Check HubSpot contact 769644314873 for correct last name.
  If Fassini: UPDATE students SET last_name = 'Fassini' WHERE id = 14462;

Step 6 -- Uyanga HubSpot link:
  Find HubSpot contact for Uyanga Tungalag (student 917) and set hubspot_contact_id.

RISK
Category: bookings / data-hygiene. Reversible: yes for Steps 1+2+5+6. Neil decision required for Steps 3+4.

STATUS
Open -- Fix NOT RUN. Last checked: Sat 8 Aug 2026 UTC (72nd hourly run)
