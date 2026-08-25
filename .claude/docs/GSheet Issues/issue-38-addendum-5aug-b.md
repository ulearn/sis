# Issue 38 - Booking Course Class Assignments (Missing SCAs)
Reporter: PG | Area: Holidays, Bookings etc. | Sheet row 40

Symptom: Staff must set course end dates manually; system allows missing class assignments.

Root cause (17th hourly check - Wed 5 Aug 2026 UTC)

BCs ending Fri 7 Aug 2026 (2 days) - 0 SCAs - UNCHANGED
AC88		Africa Mera Bachir	Morning General  	Ends 2026-08-07	0 SCAs
BC 24967	Gustavo Da Silva	General English AM	Ends 2026-08-07	0 SCAs
BC 25038	Eduardo Roche Diaz	General English PM	Ends 2026-08-07	0 SCAs

BCs ending Fri 7 Aug - SCAs present (OK):
BC 1673 (Tungalag Davaasuren): 2 | BC 1672 (Undralbat Ganbaatar): 1 | BC 1740 (Suvd-Erdene Baldorj): 1
BC 1675 (Zerigt Bayarsaikhan): 2 | BC 1742 (Beatriz Venancio Freitas): 2 | BC 24966 (Filippo Corazzini): 3
BC 24983 (Erin Pastorelli): 3 | BC 24955 (Gustavo Da Silva): 2 | BC 24991 (Edith Nunes): 1 | BC 24990 (Samuele Stenico): 2

BCs ending Fri 14 Aug - 0 SCAs (assign by Thu 13 Aug):
BC 24		Amine Ibrani		Academic Year Afternoon
BC 1305	Nomin Nergui		Academic Year Morning
BC 1344	Bat-Orgil Baljinnyam	Academic Year Morning
BC 1591	Turbold Altanhuyag	Academic Year Morning
BC 1572	Ganchimeg Ganbaatar	Academic Year Afternoon
BC 1144	Anar-Erdene Batbayar	Academic Year Morning
BC 25004	Vincenzo Contu		General English AM Plus
BC 25005	Claudia Mereu		General English AM

8 BCs ending Aug 14 still 0 SCAs - unchanged.

Fix recipe (NOT YET RUN)

Step 1 - TODAY (Wed 5 Aug): assign SCAs for Aug 7-ending BCs
SIS Classes -> Assign. Assign final week (we 2026-08-07) for:
 1 - BC 88 - Africa Mera Bachir - Morning General
 2 - BC 24967 - Gustavo Da Silva - General English AM
 3 - BC 25038 - Eduardo Roche Diaz - General English PM

Step 2 - By Thu 13 Aug: assign SCAs for Aug 14-ending BCs
SIS Classes -> Assign. Assign final week (we 2026-08-14) for:
BC 24, 1305, 1344, 1591, 1572, 1144, 25004, 25005.

Risk: bookings / class-assignment | Reversible: yes | Blast radius: low

Status: Open - 3 CRITICAL (Aug 7), 8 pending (Aug 14). NOT RVN.
Last checked: Wed 5 Aug 2026 UTC (17th hourly check)
