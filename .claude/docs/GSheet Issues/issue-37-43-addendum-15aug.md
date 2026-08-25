# Issues 37 + 43 — Verónica Martín / Jesús Ramírez Díaz — Addendum 15 Aug 2026

**Reporter:** Various  
**Area:** Booking / Accommodation  
**Sheet rows:** 39 (Issue 37), 45 (Issue 43)  

---

## Symptom
Issue 37: Verónica Martin accommodation not appearing in SIS allocation.  
Issue 43: Jesús Ramírez Díaz accommodation dates incorrect — 5 stale Booking Accommodations on bed 83.

## Current State (32nd check — Sat 15 Aug 2026 UTC)

### Bed 83 — all active BAs
| BA ID | Dates | Fee | Active | Notes |
|-------|-------|-----|--------|-------|
| 11239 | May 3 – May 24 | EUR 1,050 | true | **83 days stale** |
| 11168 | Jun 6 – Jun 20 | EUR 700 | true | **56 days stale** |
| 11285 | Jun 21 – Jul 5 | **NULL** | true | **41 days stale** (this is Jesús, Issue 43) |
| 11352 | Jul 4 – Jul 11 | EUR 360 | true | **35 days stale** |
| 11179 | Jul 12 – Aug 9 | EUR 1,360 | true | **6 days stale** |
| 11173 | Aug 9 – Aug 30 | EUR 1,080 | true | Current occupant (Alessandro Signorotti) — OK |
| 25 | Aug 30 – Oct 11 | EUR 2,100 | true | Next occupant: Rosa Maria Mollica — **15 days** |

### Changes since yesterday
- All 5 stale BAs unchanged (active=true, fees unchanged)
- Rosa Mollica (BA 25) check-in countdown: 15 days (was 16)
- Current occupant BA 11173 running normally

### Key concern
Rosa Mollica arrives Aug 30. The 5 stale BAs must be deactivated before then.
BA 11285 (Jesús) also has fee=null — needs fee set before deactivating.

---

## Fix Recipe (NOT YET RUN)

### 1. Set fee on BA 11285 (Jesús Ramírez Díaz)
SIS admin → find BA 11285 (bed 83, Jun 21–Jul 5):
- Confirm expected fee with Diego/AC (student was here Jun 21–Jul 5 = 14 days ≈ 2 weeks)
- Set fee (expected: 2 × weekly rate) and save

### 2. Deactivate the 5 stale BAs
SIS admin → deactivate each of the following (set active = false):
- BA 11239 (May 3–May 24, EUR 1,050)
- BA 11168 (Jun 6–Jun 20, EUR 700)
- BA 11285 (Jun 21–Jul 5, fee TBD — set fee first)
- BA 11352 (Jul 4–Jul 11, EUR 360)
- BA 11179 (Jul 12–Aug 9, EUR 1,360)

### Timing
Must complete before Aug 30 (Rosa Mollica check-in). 15 days remaining.

---

## Risk / Category
- **Category:** Bookings / Accommodation (data hygiene)
- **Reversible:** Yes — deactivating a past BA is non-destructive
- **Blast radius:** Bed 83 only; affects allocation display
- **Time risk:** Must complete before Aug 30

---

## Status
OPEN — 5 stale BAs on bed 83; fee null on BA 11285; Rosa Mollica check-in in 15 days  
**Last checked:** 2026-08-15 UTC (32nd check, Issues 37+43)