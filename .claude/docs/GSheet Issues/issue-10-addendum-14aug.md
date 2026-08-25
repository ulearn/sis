Issue 10 check 51 Fri 14 Aug 2026

BC 107 (bk97): active ended 2026-05-22, 84d stale
BC 24793 (bk18002): active ended 2026-06-05, 70d stale
bk97: CONFIRMED confirmed=false (anomaly), fully paid EUR 1741
No cert on bk97: docs 63+64 are template 78 (invoices)
Cert doc 179 (template 82, ISSUED) is on bk18002/student91, not bk97

Fix (NOT YET RUN):
  UPDATE booking SET confirmed = true WHERE id = 97;
  UPDATE booking_course SET active = false WHERE id IN (107, 24793);
Then generate cert from SIS admin for booking 97.

Risk: data-hygiene + documents; reversible.
Status: Unchanged. Fix NOT RUN. Last checked 2026-08-14 UTC, 51st check.
