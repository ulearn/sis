Issue 25 - Uyanga Tungalag (student 917) - Day 99; visa null; 0 SCAs
Reporter: PG | Area: Visa / Class | Sheet row: 26

Symptom
Visa status null; cannot save via UI; student not appearing in class-to-be-assigned.

Root cause - 136th check Sun 2 Aug 2026 UTC (2nd today)
- Student 917 (Uyanga Tungalag): visa_status=null, hubspot_contact_id=null, updated_at=2026-07-28 (5 days stale).
- Booking 1467: CONFIRMED, confirmed=true, amount_paid=EUR 2,405, amount_open=EUR 0.
- Total payment records for booking 1467 = EUR 3,066 vs booking amount_paid=EUR 2,405 - EUR 661 overpayment.
- BC 1613 (Academic Year Morning, Apr 27-Oct 30 2026): active=true - 0 class assignments, day 99.
- Student has not attended class for 99 days since course start (Apr 27).
- UI blocked: visa_status save throws PrismaClientKnownRequestError - direct SQL required.
- ESCALATION RECOMMENDED: longest unresolved attendance issue currently tracked.

Fix recipe - NOT YET RUN

Step 1: Set visa status via direct SQL (UI is broken for this field)
  UPDATE students SET visa_status = Approved WHERE id = 917;
  Value must be exactly Approved (title case) - APPROVED will fail

Step 2: Link HubSpot contact
  Look up Uyanga Tungalag in HubSpot to find contactId, then:
  UPDATE students SET hubspot_contact_id = hubspot_contact_id WHERE id = 917;

Step 3: Reconcile EUR 661 overpayment (escalate to accounts)
  SELECT id, amount, method, created_at, xero_payment_id FROM payments WHERE booking_id = 1467;
  -- Total = EUR 3,066; booking shows EUR 2,405 paid - EUR 661 difference
  -- Determine if refund, credit note, or booking amount update needed

Step 4: Create SCA on BC 1613 (after visa set)
  Confirm class with Paul:
  INSERT INTO student_class_assignments (booking_course_id, class_id, week_start, week_end)
  VALUES (1613, class_id, 2026-08-04, 2026-10-30);
  week_start = Aug 4 (next school day post-BH); week_end = Oct 30 (BC end)

Step 5: Verify
  SELECT visa_status, hubspot_contact_id FROM students WHERE id = 917;
  -- Should return: Approved, non-null
  SELECT id, class_id, week_start, week_end FROM student_class_assignments WHERE booking_course_id = 1613;
  -- 1 SCA returned

Risk / category
Category: bookings (visa blocking attendance) + money (EUR 661 overpayment)
Reversible: Yes | Blast radius: 1 student; 1 payment discrepancy
ESCALATION RECOMMENDED: day 99 without class assignment

Status: Open - NOT YET RUN (day 99; longest open attendance issue)
Last checked: Sun 2 Aug 2026 UTC (136th check, 2nd today)
