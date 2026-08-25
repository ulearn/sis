# Issue 22 — Edith Nunes — Class Assignment Now Active; Stale BCs Remain
Reporter: Staff  |  Area: Booking / Class  |  Sheet row: 23

## Symptom (original)
Not appearing in class-to-be-assigned; two payments with same invoice number.

## Current state (Thu 30 Jul 2026 UTC)
PARTIALLY RESOLVED — class assignment is active:
- Student 1015 (Edith Nunes): visaStatus = null, hubspotContactId = 790679262424
- SCA 368: class 8 (A2 AM), Jul 13 to Aug 7 2026 — ACTIVE (she IS assigned)
- BC 24991: General English AM, Jul 13 to Aug 7 2026, active = true (aligns with SCA 368)
- Booking 18214: CONFIRMED, fully paid EUR 608, open = 0
- Payment 18004: EUR 608

REMAINING ISSUE — 7 stale BCs still active=true:
BC24934  General English AM     Jun 15 to Jul 10  active (STALE 20d)
BC24933  General English AM     Jun 15 to Jul 10  active (DUPLICATE of BC24934!)
BC24665  General English AM     May 18 to Jun 12  active (STALE 48d)
BC24668  Morning General        Apr 20 to May 15  active (STALE 75d)
BC1751   Morning General        Mar 23 to Apr 17  active (STALE 103d)
BC1750   Morning General        Feb 23 to Mar 20  active (STALE 131d)
BC1749   Intensive General 30   Jan 26 to Feb 20  active (STALE 159d)

BC24933 and BC24934 are exact duplicates (same dates, same type, same booking).
This was the original 'two payments same invoice' anomaly. Investigate before deactivating.

## Fix recipe (NOT YET RUN)

### Step 1 — investigate duplicate BCs 24933 / 24934
  SELECT * FROM booking_courses WHERE id IN (24933, 24934);
Check if attendance records or documents are tied to one vs the other.

### Step 2 — deactivate 7 stale BCs (after confirming which duplicate to keep)
  UPDATE booking_courses SET active=false
  WHERE id IN (24933,24934,24665,24668,1751,1750,1749) AND active=true;
  -- Expected: up to 7 rows (both duplicates deactivated if confirmed redundant)

### Post-Aug 7 note
BC 24991 ends Aug 7. If Edith renews, create new SCA from week Aug 10. If not, no action.

## Risk / category
- Category: data-hygiene — very low risk
- Reversible: set active=true if wrong BC deactivated
- K should be updated from CRITICAL — she is assigned through Aug 7

## Status
PARTIALLY RESOLVED — SCA active through Aug 7; 7 stale BCs need cleanup; fix NOT RUN
Last checked: Thu 30 Jul 2026 UTC