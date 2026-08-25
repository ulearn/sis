Issue 50 -- Checkout double-submit (4th check, Tue 18 Aug 2026 UTC)
Reporter: KC | Area: Booking/Accomm | Sheet row: 52

Symptom: Submitting current-week checkouts also queues prior-week BAs (2 actual show as 5).

Root cause (verified)
Checkout sync window is last-Monday to today+28d -- captures prior-week BAs.
Three prev-week BAs still active (ended 2026-08-15, 3 days stale):
- BA 27: bed 59, fee EUR 480, claimStatus null
- BA 11230: bed null (unclaimed), fee EUR 2,100, claimStatus null
- BA 11357: bed 178, fee EUR 1,250, claimStatus confirmed (also tracked in Issue 41)

Fix recipe (NOT YET RUN)
Data fix -- deactivate 3 stale prev-week BAs (confirm checkouts completed first):
  UPDATE booking_accommodations SET active = false, updated_at = NOW()
  WHERE id IN (27, 11230, 11357);

Code fix -- restrict checkout queue to current week:
  Change BA query window FROM last_monday TO this_monday in checkout submission endpoint.
  Prevents prior-week BAs from appearing in new checkout batches.

Risk: accommodation + code | Data fix reversible | BA 11357 overlap with Issue 41

Status: OPEN -- Fix NOT RUN | Last checked: Tue 18 Aug 2026 UTC (4th check)