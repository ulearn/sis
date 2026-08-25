# Issue 20 — Ariunsarnai Batbayar / EUR 1,509 Open, Day 125, 68 Days Left

**Reporter:** AC | **Area:** Booking / Class | **Sheet row:** 21 | **Check:** 54th (Sun 16 Aug 2026 UTC)

## Symptom
Student not appearing in class-to-be-assigned list (says payment due).

## Root cause
Booking 1605: PENDING, EUR 0 paid, EUR 1509 open, no payments linked.
Student has been without class 125 days since course start (13 Apr 2026).
Course ends 23 Oct 2026 — 68 days remaining.

Key data:
- Student 1047 (Ariunsarnai Batbayar): visaStatus=null, hubspotContactId=780356561119
- Booking 1605: PENDING, confirmed=false, amountPaid=0, amountOpen=1509, updatedAt=2026-06-23
- BC 1791 (Academic Year Renewal Morning, 13 Apr–23 Oct 2026): active=true, 0 SCAs
- No payments linked to Booking 1605
- Likely Fidelo migration gap — payment made in Fidelo before SIS cutover

## Fix recipe (NOT YET RUN)

Step 1 — Verify payment in HubSpot (contact 780356561119) / Xero:
Search for EUR 1509 payment ~Apr 2026 for Ariunsarnai Batbayar.

Step 2 — If confirmed paid:
INSERT INTO payments (booking_id,amount,method,xero_payment_id,created_at) VALUES (1605,1509.00,'Bank Transfer','<xero_id>',NOW());
UPDATE bookings SET status='CONFIRMED',confirmed=true,amount_paid=1509,amount_open=0 WHERE id=1605;

Step 3 — Assign to class from 2026-08-17 via SIS admin (do not back-date):
Navigate to Booking 1605 → BC 1791 → assign AM class.

## Risk
money / bookings — URGENT (68d left) — reversible — 1 student

## Status
Open — Fix NOT RUN. HubSpot/Xero lookup needed. TIME SENSITIVE: 68 days left in course.

**Last checked:** Sun 16 Aug 2026 UTC (54th check, day 125)