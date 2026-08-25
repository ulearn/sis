# Issue 41 Addendum — 25 Jul 2026 (j)

**Run:** 103rd hourly, Sat 25 Jul 2026 UTC
**Student:** Giampaolo Russo (14571)
**Sheet row:** 43

## Status: UNCHANGED

All facts confirmed live from DB — nothing changed since addendum -i.

## Key facts
- Booking 18180: Confirmed, fully paid EUR 2,584.96
- Accommodation 11357 (Aug 2-Sep 6, bed 178, host family, EUR 1,250): present, active = true
- Capel Street accommodation (Sep 6-Sep 14): STILL MISSING — only 1 BA on booking 18180
- EUR 529.96 unaccounted (paid 2,584.96 minus course 804.96 minus host family 1,250)
- Booking course 24956 (General English AM, Aug 3-Sep 11): starts on Aug Bank Holiday
- Payment 17954 (EUR 2,584.96, Bank, 26 Jun 2026): xeroPaymentId = null (29 days)
- visaStatus = null (14 days since Jul 11)
- Host family check-in: Aug 2 = 8 calendar days away

## Fix recipe (NOT YET RUN)

1. Confirm Capel accommodation details with Diego (dates, room, amount EUR 529.96 assumed)
2. Create missing booking accommodation: BK18180, Capel Street, Sep 6-Sep 14, EUR 529.96
3. Reconcile payment 17954 in Xero (EUR 2,584.96, Bank, 26 Jun 2026)
4. After Aug BH added to school_closure: shunt BC 24956 start to Aug 4
5. Set visaStatus on student 14571 once visa confirmed

## Risk
- Category: bookings + payments
- Blast radius: low (adding BA, reconciling payment)
- Reversible: yes

**Status:** Fix NOT RUN
**Last checked:** 2026-07-25 UTC