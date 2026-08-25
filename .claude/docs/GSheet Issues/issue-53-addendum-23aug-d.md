# Issue 53 — Fanny Scelles — Multi-Host Accommodation Template Gap

Reporter: KC | Area: Booking / Accomm | Sheet row 55

Root cause (478th run, 23 Aug 2026 UTC — no change since 474th run)

Confirmed from fresh DB:
- Student Fanny Scelles (14451), booking 17843 — CONFIRMED, fully paid EUR 5,595.16
- BA 11267: bed 23, 29 Aug - 4 Oct 2026, fee = EUR 3,840 — Host 1, fee OK
- BA 11399: bed 54, 4 Oct - 19 Dec 2026, fee = null — Host 2, fee missing
- Arrival at bed 23 is 29 Aug — 6 days from now — URGENT: host confirmation email needed
- BA 11399 (bed 54) does not start until 4 Oct — 42 days away

No SIS template covers students with 2+ accommodation providers. Manual handling required.

Note: booking amountTotal = EUR 5,595.16, amountPaid = EUR 5,595.16. Once fee is set on
BA 11399, the booking total may need reconciliation if amountOpen changes.

Fix recipe (NOT YET RUN)

Immediate (before 29 Aug):
1. Set fee on Booking Accommodation 11399:
   UPDATE BookingAccommodation SET fee = <fee_amount> WHERE id = 11399;
   Neil to confirm rate with accommodation team before running.
2. Send host confirmation email for BA 11267 (bed 23, Host 1) manually using
   single-host template — arrival is 29 Aug (6 days).
3. Send host confirmation email for BA 11399 (bed 54, Host 2) when 4 Oct is closer.

Longer term:
- Neil to spec multi-host booking template before implementation.
- Template would loop over all BookingAccommodation records and render one
  combined email with sections per host.

Risk / Category
- Category: bookings / fee missing + feature gap (code)
- Immediate risk: host for bed 23 may not have received a confirmation email
- Arrival at bed 23 is 29 Aug 2026 (6 days) — manual action needed urgently
- Blast radius: any student with 2+ hosts; edge case

Status: AWAITING SPEC for template; fee fix on BA 11399 NOT RUN; host email for 29 Aug PENDING
Last checked: 2026-08-23 UTC (478th run)
