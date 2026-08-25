# Issue 27 Addendum 22 Jul 2026 (29th check)
Reporter: (various) | Row: 28 | 29th check Wed 22 Jul UTC

## Root Cause (fresh DB)
BK17909 (Sofiia, student 768) - UNCHANGED from 28th check:
- CANCELLED, confirmed=true, amountOpen=EUR 727.50, amountPaid=EUR 0
- Last updated 17 Jun 2026 (35 days ago)

HubSpot Commerce payment 1230788330738:
- EUR 727.50 - NOT voided
- Void deadline: 25 Oct 2026 (95 days from today)

BC24693 (Renewal AY PM ends Nov13): active=true on cancelled booking
Doc94 (LOA, ISSUED v2): still live - should be revoked

## Fix Recipe (NOT YET RUN)
1. VOID HS payment 1230788330738 BEFORE 25 Oct 2026:
   HubSpot -> Commerce -> Payments -> find 1230788330738 -> Void -- NOT YET RUN
2. UPDATE booking SET confirmed=false WHERE id=17909;
3. UPDATE booking SET amount_open=0 WHERE id=17909;
4. SIS Admin -> Student 768 -> Documents -> Revoke doc 94
5. UPDATE booking_course SET active=false WHERE id=24693;
Note: Steps 2-5 overlap with Issue 7 (row 8) - same BK17909.

## Risk
category: bookings/money | reversible: yes (HS void has Oct25 deadline) | blast radius: student 768 only

## Status
OPEN - void deadline Oct25 2026 (95 days). Fix NOT YET RUN. Last checked: Wed 22 Jul 2026 UTC
