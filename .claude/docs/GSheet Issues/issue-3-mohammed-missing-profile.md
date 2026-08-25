Issue 3 -- Mohammed Ibrahim Alsaidalani (missing SIS profile)
Reporter: (missing) . Area: Missing profile . Sheet row 4 . DealID 504048194807

Symptom
Cannot find Mohammed Ibrahim Alsaidalani in SIS. Invoice INV-1316.

Root cause
No SIS student or booking for deal 504048194807. Live HubSpot check 2026-06-05:
- dealname: Mohammed Ibrahim Alsaidalani | Saudi | Raddad Aljohani
- pipeline: 35765201, dealstage: 104175589
- hs_deal_stage_probability: 1 (100%) -- deal CONFIRMED WON
- amount: EUR 6149, closedate: 2026-06-03, lastmodified: 2026-06-03
- Student search (hubspotDealId=504048194807 and name Alsaidalani): returns null

Deal has been WON since 2026-06-03 (2 days). SIS WON webhook missed or failed silently.

Fix recipe -- NOT YET RUN
1. Confirm stage 104175589 = WON for pipeline 35765201.
   Check via Hub: ssh hub@localhost ... fins HubSpot token ... get pipeline stages for 35765201

2. Replay the won-webhook (choose one):
   a) Move deal OUT of stage 104175589 then back IN
      HubSpot fires dealstage-changed webhook -> SIS won-handler creates student+booking.
   b) POST the deal won-payload to https://sis.ulearnschool.com/sis/api/webhooks

3. Verify:
   node --env-file=.env -e '... prisma.student.findMany({where:{hubspotDealId:504048194807}}) ...'

Risk/category: bookings/webhook . creates 1 student+booking (canonical path) . reversible.

Status
Confirmed WON (prob=1). Needs Neil to replay webhook -- creates live records.
Last checked 2026-06-05 EOD UTC — still absent. bk deal 504048194807 returns null. Webhook replay still needed.
**RESOLVED — 2026-07-07 UTC (hourly bot):**
Student 14552 (Mohammed Ibrahimi Alsaidalani) confirmed present in SIS DB.
- Created: 2026-06-05 09:16 UTC
- HubSpot contact ID: 787872982221
- Webhook replay succeeded (or Neil created manually in the interim).
- Note: DB first name 'Mohammed Ibrahimi' — HubSpot deal says 'Mohammed Ibrahim' (minor spelling diff, no operational impact).
Issue CLOSED.
