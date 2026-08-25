# Issue 24 addendum — Mon 20 Jul 2026 (102nd check, 17th hourly)

Students: Alberto Squillace / Mia Wehrli | Bookings 1611 / 17842 | Sheet row 25

## Current status (fresh DB Mon 20 Jul 2026 UTC)

- Booking course 24686 (Alberto Squillace, Morning General, booking 1611): fee = null — started TODAY 20 Jul 2026, ends 18 Sep 2026
- Booking course 24616 (Mia Wehrli, General English AM Plus, booking 17842): fee = null — started TODAY 20 Jul 2026, ends 31 Jul 2026
- Booking course 1797 (Alberto Squillace, Morning General, booking 1611): fee = EUR 1836, active = true — ended 26 Jun 2026, 24 days stale

Both new courses are live (day 1). Fees needed for invoicing and financial reporting.

Context:
- Booking 1611 (Alberto): confirmed = true, paid EUR 1280.12, HubSpot deal 494814774510
- Booking 17842 (Mia Wehrli): confirmed = true, paid EUR 1149.90, HubSpot deal 500658783423
- Confirm fee values from HubSpot deal line items before updating

## Fix recipe (NOT YET RUN)

1. Check HubSpot deal 494814774510 (Alberto Squillace) for Morning General course fee, then set BC24686.fee
2. Check HubSpot deal 500658783423 (Mia Wehrli) for GE AM Plus course fee, then set BC24616.fee
3. Set BC1797.active = false (ended 26 Jun 2026)

SQL (values to be confirmed from HubSpot first):
  -- NOT YET RUN
  UPDATE booking_course SET fee = <alberto_fee_from_hubspot> WHERE id = 24686;
  UPDATE booking_course SET fee = <mia_fee_from_hubspot> WHERE id = 24616;
  UPDATE booking_course SET active = false WHERE id = 1797;

## Risk
financial / data-hygiene — reversible. Wrong fee value would affect invoicing. Confirm from HubSpot before running.

## Status
OPEN. Both courses active day 1, fees null. Fix NOT RUN. Last checked: Mon 20 Jul 2026 UTC (102nd check, 17th hourly).