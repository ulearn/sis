Issue 16 Addendum 24 Aug 2026

35th check Mon 24 Aug 2026 UTC
Stale BAs with bed assigned (active=true, endDate < 2026-08-24, bedId NOT NULL): 69
(Part of 152 total stale BAs tracked under Issue 50)

Oldest 5 by endDate:
BA11183 | bk79   | Leandre Le Coz-Bruhmüller  | bed 89  | ended 2026-03-06 | 171d | EUR 2400
BA11185 | bk77   | Paula Akemi Egashira        | bed 182 | ended 2026-05-03 | 113d | EUR 960
BA9905  | bk1604 | Matheus Loppnow Guimaraes   | bed 47  | ended 2026-05-03 | 113d | EUR 220
BA11216 | bk46   | Erii Takigawa               | bed 66  | ended 2026-05-09 | 107d | EUR 1440
BA11229 | bk33   | SHIZURU SAKAYORI            | bed 89  | ended 2026-05-09 | 107d | EUR 1600

Note: Prior count of 4 was tracking BAs ending ~9 May only.
True oldest is now BA11183 (bed 89, 171d stale) -- previously excluded.

Fix (NOT RUN): UPDATE booking_accommodations SET active=false
WHERE active=true AND end_date < 2026-08-24 AND bed_id IS NOT NULL;
Risk: reversible | 69 rows
Status: Open. Last checked: 2026-08-24 UTC