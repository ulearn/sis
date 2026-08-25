Issue 41 status — Giampaolo Russo 147th check Thu 20 Aug 2026 (late night)
No change since 146th check (night). DB verified.

BA 11394 bed 89 booking 17826: ended 9 Aug 2026 — 11 days stale, still active — deactivate TODAY
BA 11357 bed 178 booking 18180: ended 15 Aug 2026 — 5 days stale, still active — deactivate ASAP
BA 11396 bed 44 booking 18180: 15-22 Aug 2026, active, fee null — set fee before Sat 22 checkout
BA 11397 bed 89 booking 18180: 22 Aug-6 Sep 2026, active, fee null — set fee before Sat 22 start
BA 11392 bed 168 booking 18180: 6-14 Sep 2026, fee EUR 415 — no action yet

Total paid EUR 2,584.96
EUR 1,250 (BA 11357) + EUR 415 (BA 11392) = EUR 1,665 accounted
EUR 919.96 remaining for BAs 11396 + 11397 combined (confirm split with Diego)

Fix NOT RUN

Step 1 TODAY deactivate stale BAs:
UPDATE booking_accommodations SET active = false WHERE id IN (11394, 11357);

Step 2 TODAY confirm fee split with Diego then set:
UPDATE booking_accommodations SET fee = AMOUNT_1 WHERE id = 11396;
UPDATE booking_accommodations SET fee = AMOUNT_2 WHERE id = 11397;
(total must equal EUR 919.96)

Step 3 after Sat 22 Aug checkout:
UPDATE booking_accommodations SET active = false WHERE id = 11396;

Deadline: Sat 22 Aug 2026