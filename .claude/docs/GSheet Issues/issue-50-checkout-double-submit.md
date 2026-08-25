Issue 50 -- Cleaning sheet sync pushes previous-week checkouts (1st check, 17 Aug 2026 UTC)
Reporter: KC | Area: Booking / Accomm | Sheet row: 52

Symptom
When KC submits checkouts for the week, the toast says the current AND previous week are being sent.
Example: Natia reported 2 checkouts this week; submitting shows 5 in the toast.

Root cause
Code path: admin.html syncCleaningSheet(providerId) -> POST /accommodation/:id/cleaning-sync
-> syncCleaningSheet() in src/scripts/cleaning-sheet-sync.ts -> getCleaningQueue(providerId)
-> toast: Sheet sync . N pushed (N = dataIdxs.length = all rows in the window)

Window logic in getCleaningQueue() (accommodation.ts lines 804-818):
- Window start = last weeks Monday (today Mon Aug 17 -> start = Mon Aug 10)
- Window end = today + 28 days = Sep 14
- Deliberately includes last weeks checkouts for Monday-morning verification

Why 5 instead of 2:
- 3 checkouts from last week (Aug 10-16) still in the window
- 2 checkouts this week (Aug 17+), all 5 are pushed

Secondary: no filter on cleanedAt or active in getCleaningQueue query.
Stale BAs (active=true, past end_date) appear in the queue and inflate the count.

Fix recipe (NOT YET RUN)

Option A -- UX fix: show week breakdown in toast (code change)
  In src/scripts/cleaning-sheet-sync.ts, before return on line 325:
    compute thisWeekMonday same as getCleaningQueue does;
    const thisWeekPushed = items.filter(r => new Date(r.checkoutAt) >= thisMon).length;
    return { pushed: dataIdxs.length, thisWeekPushed, markedDone, tab: tabName };
  In admin.html near line 14406, update toast to show (X this week, Y prior) breakdown.

Option B -- Data-hygiene: identify and deactivate Natilas stale BAs
  SELECT id, name FROM accommodation_providers WHERE name ILIKE :nati:;
  SELECT ba.id,ba.start_date,ba.end_date FROM booking_accommodations ba
    JOIN accommodation_beds b ON b.id=ba.bed_id JOIN accommodation_rooms r ON r.id=b.room_id
    JOIN accommodation_properties p ON p.id=r.property_id
    WHERE p.provider_id=<id> AND ba.active=true AND ba.end_date<CURRENT_DATE AND ba.clean_cancelled_at IS NULL;
  UPDATE booking_accommodations SET active=false WHERE id IN (<ids>);

Risk: Code (A) or data-hygiene (B) | Reversible | Low blast radius
Status: OPEN -- diagnosed 1st check 17 Aug 2026 UTC. Fix NOT RUN.