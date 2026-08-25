# Issue 25 - Uyanga Tungalag - 124th check Wed 29 Jul 2026 UTC

Reporter: PG | Area: Visa / Class | Sheet row: 26

## Symptom
Visa status not selectable; not appearing in class to be assigned.

## Root cause (live DB, Wed 29 Jul 2026)
- Student 917 (Uyanga Tungalag): visaStatus = null, hubspotContactId = null
- Updated 28 Jul 2026 09:38 UTC (bulk touch; visaStatus still null after)
- Booking 1467 (BC 1613): Confirmed, EUR 2405 / 2405 fully paid
- Booking course 1613 (Academic Year Morning, 27 Apr-30 Oct 2026): active = true, 0 class assignments
- 94 days into a 187-day Academic Year course with no class assignment

## Fix recipe (NOT YET RUN)

Step 1 - Set visa status on student 917:
  Check HubSpot contact for Uyanga Tungalag for correct visa status.
  Via SIS admin: Student 917 -> Profile -> Visa Status -> set to Approved
  Or DB: UPDATE students SET visa_status = approved WHERE id = 917;

Step 2 - Link HubSpot contact ID:
  Search HubSpot for Uyanga Tungalag; get contact ID.
  UPDATE students SET hubspot_contact_id = <contactId> WHERE id = 917;

Step 3 - Assign student 917 to Academic Year Morning class on BC 1613:
  Via SIS admin: Student 917 -> Bookings -> BC 1613 -> assign to class.

## Risk
Category: data-hygiene/class | Reversible: yes | Blast radius: 1 student, 94 of 187 AY days without class.

## Status
ONGOING - FIX NOT RUN. visaStatus null, 0 class assignments, 94 days into AY. hubspotContactId null.

Last checked: Wed 29 Jul 2026 UTC (124th hourly check)