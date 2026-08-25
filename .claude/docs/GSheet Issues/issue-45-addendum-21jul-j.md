# Issue 45 addendum -- 33rd hourly Tue 21 Jul 2026 UTC (62nd check)

Reporter: AC / various | Area: Renewal students / class assignments | Sheet row: 47
Status: CONFIRMED UNCHANGED from 32nd hourly -- live DB re-query
CRITICAL -- 3 days to end (Fri 24 Jul 2026)

BC24828 | Martina Tartaro (student 14441) | Booking 18036
Name: 12 weeks Morning General Plus & IELTS 05/05/2026 - 24/07/2026 Easter Promo
Start: 5 May 2026 | End: Fri 24 Jul 2026 | Fee: EUR 1,616.04 | Class assignments: 0 | ~57 school days missed

BC25011 | Eduardo Roche Diaz (student 14602) | Booking 18233
Name: General English PM | 20-24 Jul 2026 | Fee: EUR 120 | Class assignments: 0 | 2 school days missed
Booking 18233: CONFIRMED | EUR 178.50 / 178.50 (fully paid)

Also urgent (0 class assignments confirmed by fresh DB query this run):
BC24609 Xuezhen Huang (s14443, bk17831): Morning General ends 31 Jul -- 7 missed, 8 remaining. Also Issue 39.
BC24991 Edite Nunes (s1015, bk18214): General English AM ends 7 Aug -- 7 missed, 13 remaining. Also Issue 22.

Fix recipe (NOT YET RUN)

P1 TODAY (3 days to end):
1. SIS > Student 14441 (Martina Tartaro) > Booking 18036 > Booking Course 24828 > Assign Class
2. SIS > Student 14602 (Eduardo Roche Diaz) > Booking 18233 > Booking Course 25011 > Assign Class (General English PM)

P2 This week:
3. SIS > Student 14443 (Xuezhen Huang) > Booking 17831 > Booking Course 24609 (ends 31 Jul)
4. SIS > Student 1015 (Edite Nunes) > Booking 18214 > Booking Course 24991 (ends 7 Aug)

Risk: bookings / class assignments. Reversible. Blast radius: missing attendance records, ILEP compliance.
Status: OPEN -- critical action needed TODAY for BC24828 + BC25011
Last checked: Tue 21 Jul 2026 UTC (62nd check, 33rd hourly) -- live DB confirmed