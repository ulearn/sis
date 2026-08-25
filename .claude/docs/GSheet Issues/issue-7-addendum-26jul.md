# Issue 7 -- Sofiia Korkishchenko BK17909 Anomalies (Addendum 26 Jul 2026)

Reporter: AC | Area: Booking | Sheet row: 8

Status (13th check, Sun 26 Jul 2026 UTC): UNCHANGED from prior checks.

- Booking 17909: status = CANCELLED, confirmed = true (anomaly) -- 39 days since 17 Jun 2026
- amountOpen = EUR 727.50, amountPaid = EUR 0 -- phantom balance on cancelled booking
- Booking course 24693 (Renewal Academic Year PM, ends Nov 2026): active = true -- anomalous on cancelled booking
- Document 94 (LOA, ISSUED v2): still live on cancelled booking
- Payments 17477 + 17478: deleted Jun 17 2026

Fix recipe (NOT YET RUN -- see issue-7-addendum-25jul.md for full details):
1. Set booking 17909 confirmed = false
2. Close EUR 727.50 phantom balance (amountOpen to 0)
3. Revoke document 94 (Letter of Acceptance)
4. Deactivate booking course 24693 (active = false)
5. Also deactivate BCs 1352-1356 on booking 1310 (5 stale BCs, ended Dec 2025-Apr 2026)

Risk: data-hygiene | Reversible: yes | Priority: medium (booking already CANCELLED)

Status: OPEN. Last checked: Sun 26 Jul 2026 UTC (110th hourly)