# Issue 25 — Uyanga Tungalag: Visa Null + No Class Assignment (147th Check)
Reporter: AC | Area: visa/class | Sheet row: 26 | 147th check Wed 5 Aug 2026 UTC
No change from 146th check. Day 101 without class assignment.

## State (verified live DB)
Student 917 (Uyanga Tungalag): visa_status=null, hubspot_contact_id=null
Booking 1467: CONFIRMED, confirmed=true, EUR 2,405 paid / EUR 0 open
BC 1613 (Academic Year Morning, 2026-04-27 to 2026-10-30): active=true, ILEP 0318/0010, SCAs=0

## Root Cause
visa_status=null blocks the student from appearing in the class to-be-assigned list.
Booking confirmed and fully paid (EUR 2,405). hubspot_contact_id also null — not linked at creation.

## Fix Recipe (NOT YET RUN)
Step 1: UPDATE students SET visa_status='approved', updated_at=NOW() WHERE id=917; (verify in HubSpot first)
Step 2: Search HubSpot contacts for Uyanga Tungalag; then:
        UPDATE students SET hubspot_contact_id=<contact_id>, updated_at=NOW() WHERE id=917;
Step 3: After step 1, assign BC 1613 to class via SIS admin; backfill attendance from 2026-04-27.

## Risk
Category: Visa/bookings/class | Reversible: Yes | Blast radius: 1 student, 101d missing class
Status: OPEN — NOT YET RUN | Last checked: Wed 5 Aug 2026 UTC (147th check)