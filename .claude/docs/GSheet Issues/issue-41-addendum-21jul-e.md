Issue 41 -- Giampaolo Russo dual accommodation -- Addendum 21 Jul 2026 (26th hrly)

Reporter: KC | Area: Booking / Accomm | Sheet row: 43

Root cause (78th check, Tue 21 Jul 2026 UTC):

Booking 18180 (Giampaolo Russo, student 14571): CONFIRMED, EUR 2584.96 paid.

Payment 17954 (EUR 2584.96, Bank Transfer, paid 26 Jun 2026):
  xeroPaymentId = null -- not reconciled in Xero (25 days unreconciled)
  hubspotPaymentId = 1268783973563

Fee breakdown in SIS:
  BC24956 (General English AM, 3 Aug - 11 Sep 2026): fee EUR 804.96
  BA11357 (bed 178, Patty McSweeney, 5 Claremont Close Glasnevin, 2 Aug - 6 Sep 2026):
    fee EUR 1250, Host Family, active=true
  No extras on booking.
  SIS total: EUR 804.96 + EUR 1250 = EUR 2054.96
  Paid: EUR 2584.96   Gap: EUR 530 unaccounted for

Capel Street accommodation:
  Original issue states student booked host family AND an apartment.
  Only BA11357 (host family Patty McSweeney) exists in SIS.
  EUR 530 gap matches a missing second accommodation entry.
  Prior addendum dates: Sep 6 to Sep 14 2026 (confirm with Diego/KC).

UNCHANGED from 25th hourly check. Aug 2 check-in 12 days away.

Fix recipe (NOT YET RUN):

Step 1 -- Add missing Capel accommodation to booking 18180:
  SIS > Booking 18180 > Add Accommodation
  Provider: Capel Street (confirm exact bed/room with Diego/KC)
  Dates: 6 Sep to 14 Sep 2026 (confirm with KC)
  Fee: EUR 530

Step 2 -- Reconcile payment 17954 in Xero:
  Hub > Xero > Bank Transactions > match 26 Jun 2026 transfer EUR 2584.96
  to the Giampaolo Russo invoice for booking 18180.

Step 3 -- Verify:
  SELECT xero_payment_id FROM payments WHERE id = 17954;
  (Should be non-null after reconciliation.)

Risk: bookings + money. Both reversible.
Aug 2 check-in 12 days away -- add Capel before then.
Open -- Fix NOT RUN. Last checked: Tue 21 Jul 2026 UTC (26th hourly)
