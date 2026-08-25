# Issue 36b — Pietro Caccianiga / Stale Booking Accommodations
Reporter: KC | Sheet row 38 | Check: 42nd hourly 25th per-row (Wed 22 Jul 2026 UTC)

## Root Cause
**Original issue RESOLVED:** BA11311 (bed 84, 28 Jun - 13 Sep 2026, EUR 3850) = correct 11-week stay. Pietro EUR 5331/5331 paid.
B column change: "ID: 14521" annotation added.

**Ongoing — stale BAs:**
System-wide: 11,175 active BAs with end_date before 22 Jul 2026. 16 tracked still active:
BA9917 (Kanna Hasegawa +67d), BA11246 (Felix Lopez +46d), BA30 (Fabrizio Mauro +38d),
BA11180 (Daniela Perozo Gil +32d), BA11168 (Diego Da Silva +32d),
BA11278 (Leila Agbodjan +25d), BA11280 (Valeriya Salauyova +25d), BA11165 (Giulia Avallone +25d),
BA11354 (Giulia Avallone +24d), BA11339 (Valeriya Salauyova +18d),
BA11247 (Felix Lopez +18d), BA11167 (Abdulaziz AlRuwayti +18d),
BA11345 (Fabrizio Mauro +10d), BA11365 (Hugo Lopez Tamayo +4d),
BA11257 (Aitana Lopez +4d), BA11265 (Kanna Hasegawa +3d)

## Fix Recipe (NOT YET RUN)
Step 1 - Deactivate 16 tracked:
UPDATE booking_accommodation SET active = false
WHERE id IN (9917,11246,30,11165,11278,11280,11354,11167,11247,11339,11345,11257,11365,11265,11180,11168) AND end_date < '2026-07-22';

Step 2 - System-wide sweep:
UPDATE booking_accommodation SET active = false WHERE active = true AND end_date < CURRENT_DATE;

## Risk: data-hygiene | Reversible: yes | Blast radius: low
## Status: Open. Last checked: Wed 22 Jul 2026 UTC