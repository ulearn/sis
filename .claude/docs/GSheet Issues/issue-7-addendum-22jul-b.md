# Issue 7 — 8th Check (42nd Hourly, Wed 22 Jul 2026 UTC)
Row 8. Student: Sofiia Korkishchenko. UNCHANGED.

DB state (fresh query):
BK17909: CANCELLED, confirmed=true (anomaly), amountOpen=EUR727.5, amountPaid=EUR0 (35d since Jun17)
BC 24693 (Renewal AY PM, ends 13 Nov 2026): active=true on cancelled booking
Doc 94 (LOA, ISSUED v2): still live on cancelled booking
BK 1310 courses 1352-1356 (ended Dec 2025 to Apr 2026): all active=true, up to 215d stale

## Fix (NOT YET RUN)
UPDATE booking SET confirmed=false WHERE id=17909
UPDATE booking SET amount_open=0 WHERE id=17909
UPDATE booking_course SET active=false WHERE id=24693
UPDATE booking_course SET active=false WHERE id IN (1352,1353,1354,1355,1356)
Revoke Document 94 via SIS admin.

Category: bookings/data-hygiene. Reversible: yes.

Status: OPEN. Last checked: Wed 22 Jul 2026 (8th check, 42nd hrly).