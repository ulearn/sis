# Issue 1 Addendum 22 Jul 2026 d
Reporter: NM | Area: Cleanup | Sheet row: 2
Last checked: Wed 22 Jul 2026 UTC (37th hourly, 93rd total)

## Status
UNCHANGED from addendum -c. All 4 orphan payments and stale counts identical.

## Orphan payments (bookingId = null)
Pmt 16988: EUR 339.90, Bank Transfer, 28 Apr 2026 — 86 days, xeroId=null
Pmt 16989: EUR 339.90, Bank Transfer, 28 Apr 2026 — 86 days, xeroId=null
Pmt 17187: EUR 6151.00, TransferMate Escrow, 5 May 2026 — 79 days, xeroId=null
Pmt 4781:  EUR 380.00, Flywire (legacy), 10 Apr 2026 — 103 days, xeroId=null

## Stale counts
Active booking courses with end date in the past: 24,436
Active booking accommodations with end date in the past: 11,175

## Fix Recipe (NOT YET RUN)

### Orphan payments
For each, identify the correct booking:
  - Pmts 16988 + 16989 (EUR 339.90 x2): likely a shared booking — check Xero/HubSpot for the student
  - Pmt 17187 (EUR 6151): large amount — check TransferMate dashboard for remitter details
  - Pmt 4781 (EUR 380): legacy Flywire — check Flywire portal or archived emails
Once identified:
  UPDATE payment SET booking_id = <bookingId> WHERE id = <pmtId>;

### Stale deactivation
Run bulk deactivation for booking courses and accommodations with past end dates:
  UPDATE booking_course SET active = false WHERE active = true AND end_date < NOW();
  UPDATE booking_accommodation SET active = false WHERE active = true AND end_date < NOW();
Then verify counts are near zero.

## Risk
Category: data-hygiene + money | Reversible: yes for deactivation
Blast radius: stale deactivation is safe (records still exist, just inactive)
Orphan payment links: moderate — link to wrong booking would be a financial error

## Previous recipe: issue-1-addendum-22jul-c.md