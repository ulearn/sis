# Issue 9 — Suvderdene Bayartsog (DRAFT doc + stale BC)
Reporter: PG | Area: Doc Gen/Certs | Row 10 | 66th check Sat 15 Aug 2026 UTC — no change

ROOT CAUSE (live data, verified 15 Aug 2026):
- Document 171 (booking 1498, template 82): DRAFT v1, created 2026-06-05 — 71 days unissued
- Booking 1498 (Suvderdene Bayartsog): CONFIRMED, confirmed = false — anomaly; amount_paid = null
- Booking Course 1660 (ULearn Renewal MORN): ended 2026-06-05 — 71 days stale, active, 0 SCAs

FIX RECIPE (NOT YET RUN):
1. Verify payment received for booking 1498 (amount_paid = null — check with finance).
2a. If content correct, issue doc 171:
    UPDATE document_record SET status = 'ISSUED', updated_at = NOW() WHERE id = 171;
2b. If content wrong, delete doc 171 and regenerate via admin UI:
    DELETE FROM document_record WHERE id = 171;
3. Once payment confirmed, set booking confirmed = true:
    UPDATE booking SET confirmed = true WHERE id = 1498;
4. Deactivate BC 1660 (0 SCAs — safe):
    UPDATE booking_course SET active = false WHERE id = 1660;

RISK: Documents; reversible. Blast radius: 1 document, 1 booking, 1 booking course.
STATUS: OPEN — no change. Fix NOT RUN.
Last checked: Sat 15 Aug 2026 UTC (66th check)