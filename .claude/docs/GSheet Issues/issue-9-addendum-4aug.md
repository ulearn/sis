# Issue 9 — Suvderdene: DRAFT cert never issued (55th Tue 4 Aug UTC)

Reporter: AC | Row: 10

Root cause (fresh Tue 4 Aug 2026 UTC — UNCHANGED)
- Document 171 (booking 1498): DRAFT, versionNo=1, 60 days old (created Jun 5 2026), never updated.
- Booking 1498: CONFIRMED, confirmed=false, amountPaid=null, amountOpen=null.
- Student 947 (Suvderdene Bayartsog).

Fix recipe (NOT YET RUN)
Step 1: SELECT status, confirmed, amount_paid, amount_open FROM bookings WHERE id = 1498;
Step 2: UPDATE bookings SET confirmed = true WHERE id = 1498; (if payment verified)
Step 3: Issue or regenerate doc 171 via SIS admin.
Step 4: SELECT id, status, version_no FROM document_records WHERE booking_id = 1498;

Risk: documents | Reversible: yes | Blast: 1 doc, 1 booking
Status: OPEN — 60 days, doc 171 never issued
Last checked: Tue 4 Aug 2026 UTC (55th check)
