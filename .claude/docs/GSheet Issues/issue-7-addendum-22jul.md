# Issue 7 Addendum 22 Jul 2026 (7th check)
Reporter: AC | Row: 8 | 7th check Wed 22 Jul UTC (41st hourly)

## Root Cause (fresh DB)
BK17909 (Sofiia Korkishchenko, student 768) - UNCHANGED:
- CANCELLED, confirmed=true (anomaly)
- amountOpen=EUR 727.50, amountPaid=EUR 0
- Last updated 17 Jun 2026 (35 days ago)

BC24693 (Renewal AY PM ends Nov13 2026): active=true on cancelled booking, ilepCode=null

Doc94 (LOA, ISSUED v2, May25 2026): still live on cancelled booking - should be revoked

Escrow BK1310 - 5 old AY Morning BCs - UNCHANGED:
- BC1352: ended Dec19 2025, active=true - 215d stale
- BC1353: ended Feb13 2026, active=true - 159d stale
- BC1354: ended Feb27 2026, active=true - 145d stale
- BC1355: ended Mar27 2026, active=true - 117d stale
- BC1356: ended Apr24 2026, active=true - 89d stale

## Fix Recipe (NOT YET RUN)
1. UPDATE booking SET confirmed=false WHERE id=17909;
2. UPDATE booking SET amount_open=0 WHERE id=17909;
3. SIS Admin -> Student 768 -> Documents -> Revoke doc 94
4. UPDATE booking_course SET active=false WHERE id=24693;
5. UPDATE booking_course SET active=false WHERE id IN (1352,1353,1354,1355,1356);

## Risk
category: bookings/data-hygiene/documents | reversible: yes | blast radius: student 768 + escrow BK1310

## Status
OPEN - fix NOT YET RUN. Last checked: Wed 22 Jul 2026 UTC (7th check / 41st hourly)
