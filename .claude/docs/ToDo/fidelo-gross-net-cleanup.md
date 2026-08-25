# Fidelo gross-vs-net booking-fee cleanup

**Status:** Pending — design decision needed before executing.
**Scope:** 474 Fidelo bookings with course start ≥ 2025-01-01.
**Total gross-over-net drift:** ~€388,000.

## Why this exists

Fidelo's `booking_course.fee` field carried the **rack-rate / gross course fee**, not what the school actually received. Partner agencies negotiate a "standing commission" off course fees (typically 20% / 25% / 30%), and the gross figure stayed on the SIS-side course row while `booking.amount_total` reflected the net amount the school actually banked.

This is purely a Fidelo-era reporting artefact — the going-forward HubSpot → SIS webhook reads `line_items.amount` (post-discount net), so new bookings won't drift.

## Scope breakdown (by course start year)

| Source | Year | Drifted | Total | Sum drift € | Avg % drift |
|---|---|---|---|---|---|
| FIDELO | 2028 | 1 / 1 | 1 | €1,178 | 35.2% |
| FIDELO | 2027 | 5 / 6 | 6 | €4,719 | 32.3% |
| FIDELO | 2026 | 194 / 336 (58%) | 336 | €163,303 | 32.7% |
| FIDELO | 2025 | 266 / 1,174 (23%) | 1,174 | €219,045 | 29.7% |
| MANUAL | 2026 | 0 / 4 | 4 | — | — |
| HUBSPOT | 2026 | 8 / 43 (19%) | 43 | €7,284 | 36.9% |

The ~30% average matches the typical partner commission rate, confirming the diagnosis.

## Two candidate algorithms

### Approach A — proportional scale-down
Scale every line item (course + accom + extras) by `amount_total / sum_lines`.
- ✅ Works when commission was uniform across all line items.
- ❌ Distorts course-vs-accom split when commission was course-only (Neil's stated rule).

### Approach B — absorb drift into course only
`course.fee = amount_total - accom_fee_sum - extras_fee_sum`. Accom/extras stay at retail.
- ✅ Matches Neil's stated rule: "standing arrangement with partners is in respect of course fees".
- ❌ Goes negative for ~ unknown small subset where accom alone exceeds total (needs fallback to A for those).

## Worked examples

| Booking | amount_total | A: Proportional | B: Course-absorb |
|---|---|---|---|
| 17924 (Rakan) | €8,682 | course €3193, accom €5489 | course €2922, accom €5760 |
| 17866 (XIAOFENG) | €2,722 | course €2240, accom €482 | course €2002, accom €720 |
| 17828 (Martina) | €6,431 | course €2308, accom €4123 | course €1871, accom €4560 |

## Why this matters for 2025

2025 year-end accounts haven't been closed yet. Need real-world alignment between `booking.amount_total` (cash received) and `sum(booking_courses.fee)` (P&L course revenue) so course-vs-accom split is right at year-end.

## Outstanding decisions before execute

1. **Approach A vs B** (B aligns with stated commission policy, but needs edge-case fallback)
2. **Edge-case count**: how many bookings would B produce negative course.fee for? Need to query.
3. **Single transaction vs per-booking batch?** 474 rows — small enough for one transaction with full rollback safety.
4. **Audit trail**: should the original gross fee be preserved somewhere (e.g. a `fee_gross_original` column or a `booking_audit_log` entry) before overwriting?

## When ready to execute

Script skeleton lives in this folder once approved. Will need:
- Backup query of original `booking_courses.fee` for all 474 affected rows (for rollback / audit)
- Single transaction wrapping all UPDATEs
- Post-execute verification: `sum(course.fee) + sum(accom.fee) + sum(extras.fee) = amount_total` per booking

## Cross-reference

- Task #48 in conversation TaskList
- Conversation context: search "Nozomi" or "gross-vs-net" in the session transcript
- Source of gross-fee writes: Fidelo nightly import (now disabled — see memory `project_fidelo_retired.md`)
- Going-forward webhook (already net): `src/routes/webhooks.ts:948`
