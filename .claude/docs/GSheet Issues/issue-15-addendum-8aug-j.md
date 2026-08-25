# Issue 15 — Addendum Sat 8 Aug 2026 (j) — service_end EXPIRED yesterday

**Check:** 76th hourly — Sat 8 Aug 2026 UTC
Also covers: row 30 (Issue 29 and 15), same booking 18151.

Booking 18151 (student 1001, Saikhantes Shagdarsuren):
- Status: CONFIRMED, confirmed=true, paid EUR 1,339.20
- service_end = 2026-08-07 — EXPIRED YESTERDAY (Fri 7 Aug 2026)

Booking Course 24925 (Academic Year Afternoon):
- Start: 2026-03-09, End: 2026-10-02, active=true — 55 days remaining

Accommodations: none.

Root cause: service_end (7 Aug) expired while BC 24925 runs to 2 Oct 2026.
Expired service_end may hide student from active-student dashboard views.

Fix (NOT YET RUN):
Option A (recommended): UPDATE booking SET service_end = 2026-10-02 WHERE id = 18151;
Option B: leave if 7 Aug was intentional — confirm with staff before touching.

Category: data-hygiene. Reversible. Blast radius: student 1001 only.

Status: service_end EXPIRED. NOT YET FIXED. Last checked: Sat 8 Aug 2026 UTC