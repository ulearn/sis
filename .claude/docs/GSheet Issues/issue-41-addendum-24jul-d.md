# Issue 41 — Giampaolo Russo (check Fri 24 Jul 2026 UTC, 75th hourly, 153rd total)

Reporter: Diego. Area: Booking / Accomm. Sheet row 43.

## Symptom
Student booked two types of accommodation (Host Family + Capel Street) but Capel Street not in SIS.

## Root Cause
- Booking 18180 (Giampaolo Russo, student 14571): CONFIRMED, fully paid EUR 2,584.96
- Payment 17954 (EUR 2,584.96, Bank, 26 Jun 2026): xeroPaymentId = null — 28 days unreconciled in Xero
- Booking accommodation 11357 (bed 178, Host Family, 2 Aug to 6 Sep 2026, EUR 1,250): active = true — CORRECT
- Capel Street accommodation (6 Sep to 14 Sep 2026, approx 1 week + 1 night): MISSING — only 1 accommodation on booking
- Booking course 24956 (General English AM): starts Mon 3 Aug 2026 = August Bank Holiday (resolve Issue 38 first)
- Check-in: Sun 2 Aug 2026 — 9 calendar days away
- Status UNCHANGED — 75th hourly check, fixes still NOT RUN

## Fix Recipe (NOT YET RUN)
1. Resolve Issue 38 first: add August Bank Holiday (Mon 3 Aug 2026) to school_closures
2. Add missing Capel Street accommodation to booking 18180:
   - Provider: Capel Street
   - Start: 6 Sep 2026
   - End: 14 Sep 2026
   - Fee: confirm with Diego / original booking documents
3. Reconcile payment 17954 in Xero:
   - Payment: EUR 2,584.96, Bank, 26 Jun 2026
   - HubSpot payment ID: 1268783973563
   - Link to the correct Xero invoice for booking 18180

## Risk / Category
- Category: bookings / accommodation / Xero
- Reversible: yes
- Blast radius: student 14571 only
- URGENCY: HIGH — check-in is 9 calendar days away (Sun 2 Aug)

## Status
Fix NOT RUN as of Fri 24 Jul 2026 UTC (153rd total check, 75th hourly).