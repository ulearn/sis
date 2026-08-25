# Issue 20 Addendum 22 Jul 2026
Reporter: (various) | Row: 21 | 40th hourly (53rd total) Wed 22 Jul UTC

## Root Cause (fresh DB)
BK1605 (Ariunsarnai Batbayar, student 1047) - UNCHANGED:
- Status: PENDING, confirmed=false
- amountTotal=EUR 1509, amountPaid=EUR 0, amountOpen=EUR 1509
- serviceStart: 13 Apr 2026 - Day 100 today
- Last updated: 23 Jun 2026 (29 days ago)
- HubSpot Deal: 502951083215, Invoice: 1233428327663

## Fix Recipe (NOT YET RUN)
Option A - Chase payment:
1. Check HS Deal 502951083215 and Invoice 1233428327663 for payment status
2. If paid in HS but not synced: link payment manually in SIS
Option B - Cancel if student not attending:
1. Confirm with staff if student is attending
2. If no: cancel BK1605 in SIS Admin; update HS deal

## Risk
category: bookings/money | reversible: yes | blast radius: student 1047 only

## Status
OPEN - Day 100 pending, EUR 1509 unpaid. Fix NOT YET RUN. Last checked: Wed 22 Jul 2026 UTC
