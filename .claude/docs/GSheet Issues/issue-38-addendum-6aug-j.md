# Issue 38 — Aug 10 Class Assignments (URGENT: deadline Fri 7 Aug)
Reporter: NM | Area: Holidays, Bookings etc. | Sheet row: 40

## Symptom
17 booking courses starting Mon 10 Aug 2026 have 0 class assignments. Deadline Fri 7 Aug EOD.

## Root Cause (verified 16:02 UTC Thu 6 Aug 2026)
All 17 BCs starting 2026-08-10 still have 0 student_class_assignments. No change since 15:02 UTC.

13 confirmed + confirmed=true (ready to assign):
  BC 108 Intensive General 30, BC 109 Morning General, BC 1313 AY Afternoon,
  BC 1818 AY Morning, BC 24915 AY Morning, BC 24970 AY Afternoon,
  BC 25004 General English AM Plus, BC 25005 General English AM,
  BC 25024 General English PM, BC 25027 AY Morning, BC 25031 AY Morning,
  BC 25036 General English AM, BC 25039 General English PM Plus.

4 blocked:
  BC 96 Alessandro Signorotti (CONFIRMED but confirmed=false)
  BC 833 Settiyanee Duangjai (ESCROW)
  BC 25007 Nominjin Amartsogt (PARTIAL)
  BC 25042 Edith Nunes (PENDING)

## Fix Recipe (NOT YET RUN)
Assign the 13 ready booking courses via SIS Admin -> Classes -> Class Assignments.
Select each BC by ID, assign appropriate class for week starting Mon 10 Aug 2026.
Do NOT assign the 4 blocked BCs until booking status is resolved.

## Risk / Category
- Category: Bookings / Class management. Reversible.
- Blast radius: 13 students starting Mon 10 Aug.
- Urgency: HIGH — deadline tomorrow Fri 7 Aug EOD.

## Status
Fix NOT RUN. All 17 BCs still at 0 SCAs as of 16:02 UTC Thu 6 Aug 2026.
Last checked: 16:02 UTC Thu 6 Aug 2026