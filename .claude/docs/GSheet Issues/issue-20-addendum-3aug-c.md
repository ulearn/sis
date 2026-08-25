Issue 20 Ariunsarnai Batbayar Payment Due 3 Aug 2026 4th check today

Root cause confirmed 4th check today:
Day 113 since course start 2026-04-13
Booking 1605 student 1047: status=PENDING confirmed=false
Amount paid EUR 0 amount open EUR 1509 - confirmed fresh
BC1791 Academic Year Renewal Morning Apr13-Oct23 2026: active=true 0 SCAs

Fix recipe NOT YET RUN:
Option A (payment received): record payment set booking CONFIRMED create SCA on BC1791
Option B (cancel): UPDATE bookings SET status=CANCELLED WHERE id=1605;
                   UPDATE booking_courses SET active=false WHERE id=1791;

Risk: money bookings attendance. Financial decision needed. Day 113.
OPEN. 18th overall 4th today Mon 3 Aug 2026 UTC. Fix NOT RUN.