# Holiday-entity backfill from legacy Fidelo course splits

## Why this exists
In Fidelo a holiday was the **absence** of course dates (the gap between two course segments). In SIS a holiday is an explicit `BookingHoliday` row. The legacy Christmas split (course A → gap → course B) is **harmless to the shunt engine** — a gap-resident holiday overlaps neither course, so `weekdaysPushed = null` and it never shifts course B (verified on Andrea bk1468 #1). The only real cost is **holiday-days reporting**: that needs the breaks represented as entities, not inferred from gaps.

## Audit (FIDELO bookings, 2026-06-05)
- 17,739 FIDELO bookings; **1,590** already carry ≥1 holiday entity.
- 3,720 are multi-course (split) bookings; 4,336 inter-course gaps ≥3 days.
- **2,291 gaps already covered** by a holiday entity (backfill is well underway, not absent).
- **2,045 uncovered**, classified:
  - **193** Christmas-window (≤35d, Dec/Jan), across **191 bookings** — real enforced breaks → backfill target.
  - **1,211** short non-Xmas (<28d) — plausible (Easter / mid-course) → review against calendar first.
  - **641** long (≥28d) — **re-enrollment spells, NOT holidays** → exclude.

## The trap
A holiday-days report built from "sum of gaps" would over-count by the 641 long spells (and some of the 1,211). Report MUST use holiday entities; backfill MUST be of genuine breaks only.

## Resolution (2026-06-05) — NO ACTION NEEDED for current cohorts
Official enforced closure (Neil): **Christmas 2025/26 = 22/12/2025 → 04/01/2026** (resume 05/01). Targeting that exact window:
- Bookings whose courses straddle Christmas 2025: **87 — all already have the holiday entity. 0 missing.**
- The 193 uncovered Christmas gaps are almost all **ancient**: ~161 from 2009–2017, ~28 from 2017–2022, **2022/23 = 3, 2023/24 = 1, 2024/25 = 0, 2025/26 = 0.**

→ The Christmas holiday-entity backfill is **effectively complete** for every cohort that matters (2023/24 onward). Remaining gaps are 2009–2016 students — out of scope for current visa/holiday reporting. **No backfill run required.** Meet the rare late-joiner case ad-hoc when it arises.

- Short non-Xmas gaps (1,211) and long gaps (641): unchanged conclusion — short need calendar review only if a report demands it; long are re-enrollment spells, never holidays.
- Merging split courses is cosmetic and not required — the dual representation is safe (gap-resident holidays never shunt).

## Risk / category
bookings · resolved, no write performed · revisit only if a historical (pre-2023) holiday-days report is ever needed.
