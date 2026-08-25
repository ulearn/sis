Issue 45 - Stale Booking Courses - Mass Deactivation Required (72nd check 12 Aug 2026)

Reporter: AC  Area: Renewal students  Sheet row: 47

Symptom: Renewal students not appearing on arrivals list. Root cause: 24,479 stale active Booking Courses from Fidelo migration.

Root Cause (72nd check confirmed):
- Active Booking Courses with end_date < 2026-08-12 (stale): 24,479 - unchanged from 71st check
- Active Booking Courses with end_date >= 2026-08-12 (genuinely live): 283 - was 284, 1 more expired
- Stale BCs are Fidelo migration artefacts never deactivated on import (98.9% of all active BCs)
- Effect: arrivals filter, class-to-be-assigned, and UI counts include thousands of ghost courses

Fix Recipe - NOT YET RUN:
  Pre-check (run first, verify count):
    SELECT COUNT(*) FROM booking_courses WHERE active = true AND end_date < NOW();
    Expected: approx 24,479

  Mass deactivation (single statement):
    UPDATE booking_courses SET active = false WHERE end_date < NOW();

  Post-check (confirm only approx 283 remain):
    SELECT COUNT(*) FROM booking_courses WHERE active = true;

Risk: data-hygiene. Blast radius: reporting/UI queries only. Reversible in extremis but should NOT be reversed.
URGENCY: Low-urgency operationally; high-impact fix for renewal student visibility.

Status: Fix NOT RUN. 72 consecutive checks. Count stable at 24,479 stale BCs.
Last checked: Wed 12 Aug 2026 UTC (72nd check)