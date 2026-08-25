Issue 54 -- Checkout Per Room / BA11161 Uncleaned

Reporter: KC | Area: Booking/Accomm | Sheet row: 56
Last checked: 2026-08-25 UTC (520th run)

SYMPTOM: SIS counts checkouts per person, not per room. BA11161 (Lucia Borroni, A1/Room 1) uncleaned.

STATUS (unchanged since 518th run):
- Booking Accommodation 11160 (Maicol Moretti, Bed B, A1/Room 1): cleanedAt = 24 Aug 17:11 IST -- CLEANED
- Booking Accommodation 11161 (Lucia Borroni, Bed A, A1/Room 1): ended 22 Aug 2026, cleanedAt = null -- UNCLEANED (3 days ago)

BA11161 is now 3 days past checkout with no cleaning mark. ESCALATE IMMEDIATELY to KC/Natia.

FIX RECIPE (NOT YET RUN)
Step 1 (immediate): Mark BA11161 as cleaned manually via the cleaning queue UI, or:
  UPDATE booking_accommodation SET cleaned_at = NOW() WHERE id = 11161;
  (Use only if cleaning queue UI unavailable)

Step 2 (code change): Group cleaning queue by roomId + endDate instead of per-BA, so shared rooms
  show one checkout card per room. See issue-54-checkout-per-room.md for Option A implementation.

RISK: Data-hygiene / cleaning queue. Reversible. Low blast radius.

STATUS: Step 1 NOT RUN. Step 2 design open.
