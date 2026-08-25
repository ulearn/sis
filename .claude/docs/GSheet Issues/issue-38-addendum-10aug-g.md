Issue 38 Addendum 10 Aug 2026 (g) — 0-SCA Booking Courses: Fri Deadline + Aug-10 Starters
Reporter: ST (staff) | Sheet row: 40 | Check: 108th hourly, Mon 10 Aug 2026 UTC

PROGRESS SINCE 107th CHECK (approx 1 hour ago)
- BC 25004 (Vincenzo Contu, GE AM Plus) FIXED - class assigned
- BC 25005 (Claudia Mereu, GE AM) FIXED - class assigned

CURRENT STATE (live, 10 Aug 2026 UTC)

URGENT - Ending Friday 14 Aug 2026, 5 BCs with 0 class assignments:
BC 25043 | Eduardo Roche Diaz | General English PM | Aug 10-14 | 0 SCAs | MOST URGENT (started today)
BC 1305  | Nomin Nergui | AY Morning | Apr 27-Aug 14 | 0 SCAs | Fidelo artefact
BC 1344  | Bat-Orgil Baljinnyam | AY Morning | Feb 23-Aug 14 | 0 SCAs | Fidelo artefact
BC 1591  | Turbold Altankhuyag | AY Morning | Feb 23-Aug 14 | 0 SCAs | Fidelo artefact
BC 1144  | Anar-Erdene Batbayar | AY Morning | Feb 23-Aug 14 | 0 SCAs | Fidelo artefact

New Aug-10 starters with 0 class assignments (6 BCs, started today):
BC 25043 | Eduardo Roche Diaz | GE PM | end Aug 14 (most urgent, see above)
BC 1313  | Ana Luiza De Sousa | AY Afternoon | end Aug 28
BC 25039 | Cristian Ravai | GE PM Plus | end Aug 28
BC 25024 | Josimar Roberto | GE PM | end Aug 21
BC 25036 | Jorge Perez Aldana | GE AM | end Sep 4
BC 24970 | Tsengelbayar Mendsaikhan | AY Afternoon | end Jan 29 2027

Aug-3 stragglers still 0 SCAs (6 BCs, unchanged):
BC 1766, 25035 (Rakan/Issue 12, day 8), 25003, 25010, 25029, 25016

FIX RECIPE - NOT YET RUN

Step 1 - IMMEDIATE: Assign Eduardo BC 25043 to GE PM class, Mon 10 - Fri 14 Aug
Step 2 - TODAY: Assign 5 other Aug-10 starters (BC 1313, 25039, 25024, 25036, 24970)
Step 3 - INVESTIGATE: Fidelo ghost BCs ending Fri (1144, 1305, 1344, 1591)
  Verify not attending, then: UPDATE booking_course SET active = false WHERE id IN (1144, 1305, 1344, 1591);
Step 4 - THIS WEEK: Assign Aug-3 stragglers (6 BCs incl Rakan, coordinate with Issue 12)

RISK: HIGH for live starters (no attendance recording); MEDIUM for Fidelo ghost deactivation
Status: PARTIALLY RESOLVED (Vincenzo+Claudia fixed). 10 BCs still open.
Last checked: 10 Aug 2026 UTC (108th hourly run)
