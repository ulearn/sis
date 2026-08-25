# Issue 25 — Uyanga Tungalag: 102 Days Without Class + Visa Null (6 Aug 2026)

**Reporter:** AC | **Area:** Visa / Class | **Sheet row:** 26 | **Check:** 148th (Thu 6 Aug 2026 UTC)

## Symptom
Student visa_status = null (excluded from to-be-assigned list). 0 class assignments for 102 days despite confirmed, fully-paid booking.

## Root cause (live data)

**Student 917 (Uyanga Tungalag):**
- visa_status = null
- hubspot_contact_id = null

**Booking 1467:**
- Status: CONFIRMED, confirmed = true
- amount_paid = EUR 2,405, amount_open = EUR 0

**Booking Course 1613 (Academic Year Morning, 27 Apr to 30 Oct 2026):**
- active = true, 0 student class assignments

Fully paid since April. visa_status = null blocks the to-be-assigned filter. 102 days without class placement = no attendance tracking.

## Fix recipe (NOT YET RUN)

### Step 1 — Set visa_status
```sql
-- Confirm correct status with admin first (likely APPROVED if student is in Ireland)
UPDATE public.students SET visa_status = 'APPROVED' WHERE id = 917;
```

### Step 2 — Link HubSpot contact
Find student 917 in HubSpot (search Uyanga Tungalag), copy contact ID (numeric), then:
```sql
UPDATE public.students SET hubspot_contact_id = <HUBSPOT_CONTACT_ID> WHERE id = 917;
```

### Step 3 — Assign BC 1613 to class
After visa_status set, student appears in to-be-assigned. Assign via SIS admin from current week.
Backfill prior weeks only if confirmed attendance exists.

### Step 4 — Verify
```sql
SELECT id, visa_status, hubspot_contact_id FROM public.students WHERE id = 917;
SELECT COUNT(*)::int FROM public.student_class_assignments WHERE booking_course_id = 1613;
```

## Risk / category
- **Data hygiene**: low risk, reversible.
- Blast radius: 1 student.

## Status
Open — fix NOT RUN. Day 102 without class. Visa null, HubSpot null.
**Last checked:** Thu 6 Aug 2026 UTC