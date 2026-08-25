# Issue 7 — Sofiia Korkishchenko — Cancelled Booking Anomalies
Reporter: unknown · Area: Booking · Sheet row 8

## Symptom
Sofiia not on arrivals list; two bookings visible.

## Root Cause (15 Jul 2026 UTC)

Original arrivals issue RESOLVED: Sofiia enrolled booking 17849, course 24623
(Academic Year Renewal Afternoon, ILEP 0318/0005), started 8 Jun 2026, EUR 1455.5 paid.

Remaining issues:

Booking 17909 (CANCELLED):
  - confirmed = true (should be false)
  - amountOpen = EUR 727.5, amountPaid = EUR 0 — phantom balance
  - Course 24693 (Renewal AY PM, May-Nov 2026): active=true, ilepCode=null — stale
  - Document record 94 (LOA ISSUED v2, 25 May 2026): live on cancelled booking

Booking 1310 (ESCROW, EUR 3550 escrow payment):
  - 5 old AY Morning courses (IDs 1352-1356, Sep 2025 – Apr 2026) all active=true
    up to 82 days stale (last ended 24 Apr 2026)

Payment 17468 (EUR 1455.5, booking 17849): type = null — minor data hygiene

## Fix Recipe — NOT YET RUN

Step 1: Set confirmed=false on booking 17909 via SIS Admin or Prisma updateMany
Step 2: Close EUR 727.5 phantom balance on booking 17909 (verify in HubSpot first)
Step 3: Revoke LOA document record 94 — SIS Admin: Student 768 > Booking 17909 > Documents > Revoke
Step 4: Deactivate booking course 24693 (set active=false via SIS Admin)
Step 5: Deactivate BCs 1352-1356 in booking 1310 (set active=false)
Step 6: (Low priority) Classify payment 17468 type after confirming in HubSpot

## Risk
Category: bookings, data-hygiene | Reversible: yes | Blast radius: student 768 only

## Status
Open — Fix NOT RUN. Last checked: 15 July 2026 UTC