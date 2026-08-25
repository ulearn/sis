Issue 7 - Sofiia Korkishchenko BK17909 Anomalies (Addendum 25 Jul 2026)
Reporter: AC | Area: Booking | Sheet row: 8

Status (12th check, Sat 25 Jul 2026 UTC):
UNCHANGED from prior checks.
- Booking 17909: status = CANCELLED, confirmed = true (anomaly; 38 days since Jun 17)
- amountOpen = EUR 727.50, amountPaid = EUR 0 (phantom balance on cancelled booking)
- Booking course 24693 (AY Renewal PM, ends Nov 13 2026): active = true on cancelled booking
- Document 94 (LOA, ISSUED v2): still live on cancelled booking
- Booking 1310 has 5 stale BCs (IDs 1352-1356, ended Dec 2025 to Apr 2026): all still active

Fix recipe (NOT YET RUN - see issue-7-addendum-24jul.md for full details)
1. Set booking 17909 confirmed = false
2. Close EUR 727.50 phantom balance
3. Revoke document 94
4. Deactivate BCs 24693, 1352, 1353, 1354, 1355, 1356

Risk: data-hygiene; reversible; medium priority (booking is already CANCELLED)

Status: OPEN. Last checked: Sat 25 Jul 2026 UTC (67th hourly)