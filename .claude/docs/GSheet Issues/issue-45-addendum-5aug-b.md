Issue 45 — Stale Booking Courses / Renewal Arrivals (30th check)
Reporter: staff | Area: Attendance / Classes | Sheet row: 47 | Checked: Wed 5 Aug 2026 UTC

SYMPTOM
Renewal students not on arrivals list. Root cause: 24,467 stale booking courses (active=true, endDate past).

ROOT CAUSE — live data Wed 5 Aug 2026 UTC
  Total stale booking courses: 24,467 (unchanged since 29th check)
  BC 25006 (Marina Larripa, General English AM Plus, ended 3 Aug 2026): active=true, 2d stale, 2 SCAs
  Issue 38 BCs (25004/25005, end 14 Aug) correctly still active — excluded from stale count
  Bulk deactivation decision still pending

FIX RECIPE (NOT YET RUN)

Verify count first:
  const count = await p.bookingCourse.count({
    where: { active: true, endDate: { lt: new Date() }, id: { notIn: [25004, 25005] } }
  })
  expected: ~24,467

Bulk deactivate (once Neil confirms):
  const result = await p.bookingCourse.updateMany({
    where: { active: true, endDate: { lt: new Date() }, id: { notIn: [25004, 25005] } },
    data: { active: false }
  })
  console.log("Deactivated:", result.count)

RISK: data-hygiene. Reversible: yes. Blast radius: 24,467 BCs, no financial impact.
STATUS: Open — awaiting Neil decision on bulk deactivation. Last checked: Wed 5 Aug 2026 UTC (30th hourly run)