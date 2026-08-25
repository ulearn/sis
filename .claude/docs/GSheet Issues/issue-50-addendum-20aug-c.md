# Issue 50 — Stale BAs + Checkout Code | 15th check Thu 20 Aug 2026 UTC

Sheet row 52 | Reporter: KC | Area: Booking/Accomm

## DB-verified state (15th — no change from 14th, earlier today)

61 stale Booking Accommodations — all ended but still active:
  5 no-bed BAs: 11230, 11362, 11276, 11174, 11347
  30 bed-assigned BAs (none deactivated since tracking began)
  26 additional Mar–Jun 2026 vintage BAs discovered in 13th check
  11 null-fee BAs (including 11280 bed 188 ended Jun 27; 11264 bed 156 ended May 9)
Checkout code bug unchanged — stale BAs inflate weekly checkout count.

## Fix recipe (NOT YET RUN)

Step 1 (preview): SELECT id,"bedId","endDate",fee,"bookingId" FROM "BookingAccommodation"
  WHERE active = true AND "endDate" < NOW() AND fee IS NOT NULL ORDER BY "endDate";
Step 2 (deactivate confirmed-fee): UPDATE "BookingAccommodation" SET active = false
  WHERE active = true AND "endDate" < NOW() AND fee IS NOT NULL;
Step 3: Confirm fees on BA 11280 (bed 188) and BA 11264 (bed 156), then deactivate.
Step 4: Fix checkout query to filter WHERE active = true AND endDate >= week_start (see issue-50-checkout-double-submit.md)

Risk: medium (many BAs — run preview first). Reversible. No deadline.
Status: No change. 15th check Thu 20 Aug 2026 UTC. 61 stale BAs, 11 null-fee.