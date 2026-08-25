Issue 48 - Telmuun Stale Booking Courses + BC 1810 0 SCAs + Ana Jessica EUR 1,530
Reporter: AC | Sheet row: 50 | Check: 87th hourly, Mon 10 Aug 2026 UTC

CHANGE SINCE 86th CHECK
None. BC 1810 still 0 SCAs. 6 stale Booking Courses unchanged.

CURRENT STATE (live DB 10 Aug 2026)

Telmuun Enkhsaikhan (student 293):
  6 stale active Booking Courses (ended months ago, still active = true):
  BC 482  | Academic Year Afternoon          | ended 2025-03-14 | approx 515 days stale
  BC 483  | Academic Year Afternoon          | ended 2025-07-11 | approx 396 days stale
  BC 1609 | Academic Year Renewal Afternoon  | ended 2025-12-19 | approx 235 days stale
  BC 1610 | Academic Year Renewal Afternoon  | ended 2026-01-09 | approx 214 days stale
  BC 1611 | Academic Year Renewal Afternoon  | ended 2026-03-06 | approx 158 days stale
  BC 1612 | Academic Year Renewal Afternoon  | ended 2026-05-01 | approx 102 days stale

  BC 1810 | Academic Year Renewal Morning | Jun 29 2026 - Jan 1 2027 | CURRENT COURSE
           | 0 class assignments - 42 days into course with no class assignment
           | Booking 1624 status: PARTIAL

Ana Jessica Rosa de Paula Santos (student 766):
  Booking 1308: status = CANCELLED
  EUR 1,530 paid but booking cancelled - money unresolved

FIX RECIPE - NOT YET RUN

Fix A - Deactivate stale Booking Courses for Telmuun (student 293):
  await prisma.bookingCourse.updateMany({
    where: { id: { in: [482, 483, 1609, 1610, 1611, 1612] } },
    data: { active: false }
  });
  (NOT YET RUN)

Fix B - Assign Telmuun to class for BC 1810 (current course, ends Jan 1 2027):
  Assign via SIS admin -> Class Assignment -> select appropriate morning class -> assign BC 1810.
  Confirm booking 1624 payment status with accounts (PARTIAL payment).

Fix C - Resolve Ana Jessica EUR 1,530 (booking 1308 CANCELLED):
  Check Hub fins/ or Xero for original payment reference.
  Option 1: Refund EUR 1,530 if student did not attend.
  Option 2: Reallocate to another booking if she transferred.
  Neil decision required before any action.

RISK: Fix A = bookings, fully reversible. Fix B = class assignment, low risk. Fix C = financial, needs Neil decision.

STATUS: Open - 6 stale Booking Courses + BC 1810 42 days 0 SCAs + EUR 1,530 unresolved.
Last checked: 10 Aug 2026 UTC (87th hourly run)