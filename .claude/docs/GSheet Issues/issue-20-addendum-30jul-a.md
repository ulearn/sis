Issue 20 - Ariunsarnai Batbayar
Reporter: PG | Sheet row: 21
Last checked: 2026-07-30 UTC (65th check) - Day 116

Root cause (NOT YET RUN):
- Student 1047 (Ariunsarnai Batbayar), HubSpot deal 502951083215
- Booking 1605: status=PENDING, confirmed=false, amountOpen=EUR 1509, amountPaid=EUR 0
- Data source: FIDELO; last updated 2026-06-23 (37 days ago)
- Booking course 1791 (Academic Year Renewal Morning, Apr 13 to Oct 23 2026): active=true (in-session)
- Payments in SIS on booking 1605: zero
- Student appears to be attending (course active, in-session) but payment entirely unrecorded in SIS

Fix recipe (NOT YET RUN):
Step 1 - Check HubSpot deal 502951083215 for payment records / line items
Step 2 - Check Hub/Xero for any payment linked to this deal:
  ssh hub@localhost
  grep -r 502951083215 /home/hub/web/hub.ulearnschool.com/public_html/fins/ 2>/dev/null | head -20
Step 3 - If payment found: add to SIS and confirm booking:
  INSERT INTO payments (booking_id,amount,method,payment_date,data_source,created_at)
  VALUES (1605,AMOUNT,METHOD,PAYMENT_DATE,HUBSPOT,NOW());
  UPDATE bookings SET status=CONFIRMED,confirmed=true,amount_paid=AMOUNT,amount_open=0,updated_at=NOW()
  WHERE id=1605;
Step 4 - If no payment found: contact agent or family. Flag for follow-up.

Risk: money, bookings. Reversible. Blast radius: 1 student, EUR 1509 outstanding.
Status: NOT YET RUN - awaiting Neil approval. Last checked: 2026-07-30 UTC.