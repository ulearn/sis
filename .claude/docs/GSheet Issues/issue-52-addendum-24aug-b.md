# Issue 52 — Host Email Template / BA11399 Fee Null (Addendum 24 Aug 2026-b)

**Reporter:** KC | **Area:** Booking / Accomm | **Sheet row:** 54 | **Run:** 496th (Mon 24 Aug 2026 UTC)

## Symptom
1. Host email not auto-populated in host booking templates (feature spec open).
2. Booking Accommodation 11399 has fee = null; student arrives in 5 days.

## Root Cause — Current State

Booking 17843: CONFIRMED, paid EUR 5,595.16.

| BA | Bed | Dates | Fee | Status |
|----|-----|-------|-----|--------|
| 11267 | 23 | 29 Aug – 4 Oct 2026 | EUR 3,840 | Active; student arrives 29 Aug (5 days) |
| 11399 | 54 | 4 Oct – 19 Dec 2026 | null | Active; 41 days until stay starts |

BA11399 fee is null. 11 weeks Oct–Dec. Correct fee not yet determined — Neil/KC to confirm weekly rate.

## Fix Recipe (NOT YET RUN)

Set fee on BA11399 (confirm amount with KC first):
  UPDATE BookingAccommodation SET fee = <AMOUNT> WHERE id = 11399;

Host email template feature: awaiting spec from Neil.

## Risk / Category
bookings / accounts | reversible | blast radius: single student
Deadline: BA11399 starts 4 Oct — set fee before then.

## Status
Open — fix NOT RUN. Last checked: 24 Aug 2026 UTC (496th run).