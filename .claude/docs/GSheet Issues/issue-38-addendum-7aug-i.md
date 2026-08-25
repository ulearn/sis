Issue 38 - Aug 10 Class Roster (61st check, 7 Aug 2026)
Reporter: Staff / System | Sheet row: 40

Symptom: 17 Booking Courses starting Mon 10 Aug 2026 still 0 class assignments. EOD TODAY (Fri 7 Aug) is deadline.

Root Cause (DB re-verified at 61st check — unchanged):
- 0 student_class_assignments for all 13 ready BCs (confirmed fresh query)
- 4 blocked BCs remain unresolved (payment issues, see below)
- Manual assignment required in SIS Admin

READY TO ASSIGN - 13 students (Fix Recipe NOT YET RUN):
SIS Admin: open each booking, assign class matching course type.
  BC 108:   Lucia Borroni (student 92) Intensive General 30 -- booking 98, amountOpen 0
  BC 109:   Maicol Moretti (student 93) Morning General -- booking 99, amountOpen 0
  BC 1313:  Ana Luiza De Sousa (student 744) AY Afternoon -- booking 1286, amountOpen EUR 120, confirmed=true OK
  BC 1818:  Natanael Reis Lourenco de Sales (student 1071) AY Morning -- booking 1631, amountOpen 0
  BC 24915: Toshimi Hanakawa (student 877) AY Morning -- booking 18140, amountOpen 0
  BC 24970: Tsengelbayar Mendsaikhan (student 948) AY Afternoon -- booking 18194, amountOpen null (verify)
  BC 25004: Vincenzo Contu (student 14597) General English AM Plus -- booking 18226, amountOpen 0
  BC 25005: Claudia Mereu (student 14598) General English AM -- booking 18227, amountOpen 0
  BC 25024: Josimar Roberto (student 14612) General English PM -- booking 18246, amountOpen 0
  BC 25027: Jacqueline Olga Burgos (student 14614) AY Morning -- booking 18248, amountOpen 0
  BC 25031: Brisia Garcia Roman (student 14617) AY Morning -- booking 18252, amountOpen 0
  BC 25036: Jorge Perez Aldana (student 14619) General English AM -- booking 18256, amountOpen 0
  BC 25039: Cristian Ravai (student 17) General English PM Plus -- booking 18259, amountOpen null (verify)

BLOCKED - resolve first (4 students):
  BC 96:    Alessandro Signorotti (student 82) -- booking 88, CONFIRMED confirmed=false, EUR 250 open
             payments: 17780 (EUR 1,845 Bank) + 17111 (EUR 1,845 TransferMate) - duplicate entries, total 1845 paid of 2095
  BC 833:   Settiyanee Duangjai (student 400) -- booking 790, Escrow pending (EUR 4,847.50 in escrow, full amount)
  BC 25007: Nominjin Amartsogt (student 759) -- booking 18229, PARTIAL EUR 370 open (EUR 980 paid of EUR 1,350)
  BC 25042: Edith Nunes (student 1015) -- booking 18262, PENDING EUR 456 fully unpaid
             Note: separate from booking 18214 (CONFIRMED, resolved in issue 22)

Risk: Bookings | Reversible | 13 students ready
URGENCY: CRITICAL - Mon 10 Aug start in 3 days (today is Fri 7 Aug, last working day).
Status: OPEN 0/17 assigned | Last checked: Fri 7 Aug 2026 UTC (61st check)
