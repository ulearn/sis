# Issue 41 — Giampaolo Russo — Capel Street Apartment Missing (Check-in Sun 2 Aug)
Reporter: Diego  |  Area: Booking / Accommodation  |  Sheet row: 43

## Symptom
Student booked Host Family (Aug 2-Sep 6) AND Capel Street apartment. Host family present and confirmed. Capel Street BA completely absent from SIS. Check-in Sunday 2 Aug 2026 (3 days).

## Root cause (Thu 30 Jul 2026 UTC)
- Student 14571 (Giampaolo Russo): visaStatus = null
- Booking 18180: CONFIRMED, confirmed = true, paid EUR 2,584.96, open = 0
  - Payment 17954: EUR 2,584.96 Bank
- BA 11357: Host Family, bed 178, 2026-08-02 to 2026-09-06, 5 weeks, fee EUR 1,250
  - active = true, claimStatus = confirmed (claimed via host portal 2026-07-01)
  - Provider 24 claimed it via host portal
- BC 24956: General English AM, 2026-08-03 to 2026-09-11, active = true
  - NOTE: start_date 2026-08-03 = Aug Bank Holiday; also needs shunting (see issue 38)
- Total booking accommodations for booking 18180: 1 record only
- Capel Street apartment: ABSENT — no BA record exists

## Financial note
Paid EUR 2,584.96. Host Family fee EUR 1,250. Capel apartment fee is unclear — may be
outstanding on a separate invoice, or included in a deal not reflected in SIS yet.
Diego must clarify the Capel fee status.

## Fix recipe (NOT YET RUN)

### Step 1 — identify correct Capel Street bed
  SELECT b.id, b.name, ap.name as provider
  FROM beds b
  JOIN accommodation_providers ap ON ap.id = b.provider_id
  WHERE ap.name ILIKE '%capel%'
  ORDER BY b.id;

Also check availability for the required date range (dates to be confirmed by Diego).

### Step 2 — create missing BA record (after confirming dates, bed, fee)
  INSERT INTO booking_accommodations (
    booking_id, accommodation_type, room_type, board,
    start_date, end_date, weeks, bed_id, active, fee
  ) VALUES (
    18180, 'Apartment', 'Individual', 'Self Catering',
    '2026-XX-XX', '2026-XX-XX', N, BED_ID, true, FEE
  );

Fill in XX-XX dates, N weeks, BED_ID, and FEE from Diego confirmation.

## Information needed from Diego / Neil (URGENT — check-in 3 days)
1. Exact start and end dates for the Capel Street accommodation
2. Which Capel Street room / bed number
3. Room type (Individual or Shared) and board type
4. Fee amount — is it invoiced / paid, or still outstanding?

## Risk / category
- Category: bookings / accommodation — data gap, reversible
- BA can be deleted if wrong
- URGENT: check-in Sun 2 Aug 2026
- Also: BC24956 starts Aug 3 (bank holiday) — shunt per issue 38

## Status
OPEN — URGENT — Capel BA absent, check-in 3 days — fix NOT RUN
Last checked: Thu 30 Jul 2026 UTC