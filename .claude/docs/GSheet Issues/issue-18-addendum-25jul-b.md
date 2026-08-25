Issue 18 -- Flavia Nascimento Mariano (addendum Sat 25 Jul 2026 UTC, 91st hourly run)

Sheet row: 19 | Area: Visa | Reporter: PG

Status: OPEN (low priority) -- class assignment resolved; only visaStatus = null remains.

Current DB state (confirmed unchanged):
  Student 983 Flavia Nascimento Mariano: visaStatus = null (last updated Jul 14 -- 11 days ago)
  HubSpot contact: 783659478249
  Booking 1534: Confirmed, fully paid EUR 1308
  Booking course 1710: Academic Year Afternoon, Jun 1 to Nov 20 2026, active = true
  Class assignment 265: class 11 (B1 PM), week_start Jun 15 2026, week_end Nov 20 2026 -- ACTIVE
  Class assignment 256: class 9 (A2 PM), week_start Jun 1 2026, week_end Jun 14 2026 -- expired

Assessment:
  Class assignment issue is RESOLVED. SCA 265 active through Nov 20 (course end).
  SCA 256 covered Jun 1-14; SCA 265 took over Jun 15. No gap.
  visaStatus = null not blocking attendance. May affect compliance reports and student portal display.

Why B/F/G hash changed:
  Sheet columns B/F/G edited between 90th and 91st runs. Underlying data unchanged.

Fix Recipe (NOT YET RUN):
  Step 1 -- Confirm actual visa status via HubSpot:
    Check contact 783659478249. Flavia is Brazilian (non-EEA) -- likely D-Study visa.
    Confirm whether visa is approved, rejected, or pending.
  Step 2 -- Set visaStatus once confirmed:
    Via SIS admin: Student 983 -> Personal Details -> Visa Status -> [actual status] -> Save.
    SQL (NOT YET RUN -- confirm actual status first):
      UPDATE students SET visa_status = 'APPROVED' WHERE id = 983;

Risk: Low. Data-hygiene. Reversible. Low urgency -- she is actively attending class 11.

Last checked: Sat 25 Jul 2026 UTC (91st hourly run) -- data unchanged from 90th run.