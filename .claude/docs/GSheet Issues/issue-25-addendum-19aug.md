Issue 25 Uyanga Tungalag (166th check, 19 Aug 2026)
Sheet row: 26  Reporter: ST  Area: Visa/Class

Symptom: visaStatus null, student not appearing in class-to-be-assigned.

Status: No change since 165th check (Tue 18 Aug).

Evidence (live DB, 19 Aug 2026)
- Student 917: visaStatus = null, hubspotContactId = null, updatedAt 28 Jul 2026
- Booking 1467: CONFIRMED, confirmed = true, amountPaid = EUR 2,405, amountOpen = EUR 0
- Student class assignments: 0 -- student still unassigned
- Day 114 in course

Fix Recipe -- NOT YET RUN
1. Set visaStatus = approved on student 917:
   UPDATE students SET visa_status = approved WHERE id = 917;
2. Assign student 917 to appropriate class via SIS admin

Risk: Low. Reversible.
Status: Fix NOT RUN. Last checked: Wed 19 Aug 2026 UTC (166th check).