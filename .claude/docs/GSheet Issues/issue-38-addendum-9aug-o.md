Issue 38 addendum 9aug-o

Reporter: Various staff
Area: Holidays, Bookings, Classes
Sheet row: 40
Last checked: 2026-08-09 UTC (99th hourly check)

SYMPTOM
Staff flagged date UX. Critical: Aug-10 and Aug-3 starters have zero class assignments.

ROOT CAUSE confirmed 9 Aug 2026

CRITICAL: Classes start Mon 10 Aug 09:00 (hours away). All 17 Aug-10 BCs still 0 SCAs. Six confirmed Aug-3 starters unassigned (7 days overdue).

13 READY (confirmed=true, Aug-10):
- BC 108: Lucia Borroni (Intensive General 30)
- BC 109: Maicol Moretti (Morning General)
- BC 1313: Ana Luiza De Sousa (Academic Year Afternoon)
- BC 1818: Natanael Reis Lourenco de Sales (Academic Year Morning)
- BC 24915: Toshimi Hanakawa (Academic Year Morning)
- BC 24970: Tsengelbayar Mendsaikhan (Academic Year Afternoon)
- BC 25004: Vincenzo Contu (General English AM Plus)
- BC 25005: Claudia Mereu (General English AM)
- BC 25024: Josimar Roberto (General English PM)
- BC 25027: Jacqueline Burgos (Academic Year Morning)
- BC 25031: Brisia Garcia Roman (Academic Year Morning)
- BC 25036: Jorge Perez Aldana (General English AM)
- BC 25039: Cristian Ravai (General English PM Plus)

4 ON HOLD (confirmed=false, do not assign):
- BC 96: Alessandro Signorotti (EUR 250 owed)
- BC 833: Settiyanee Duangjai (Escrow pending)
- BC 25007: Nominjin Amartsogt (EUR 370 owed)
- BC 25042: Edith Nunes (EUR 456 owed)

Aug-3 starters still 0 SCAs (7 days overdue, confirmed=true):
- BC 1766: Maria Eduarda Alves Paiva
- BC 25003: Aleix Cervera Gonzalez
- BC 25010: Alin Merticariu
- BC 25016: Anderson da Silva Martins
- BC 25029: Monica Breier Fiametti
- BC 25035: Rakan Alghamdi (see Issue 12, SCA 288 relink first)

Note: BC 97 (Gustavo Ferreira) and BC 24999 (Soumaya Bourguiba) confirmed=false, do not assign.

FIX RECIPE - NOT YET RUN

CRITICAL: Complete before Mon 10 Aug 09:00.

Step 1: Assign 13 confirmed Aug-10 starters via SIS Admin class assignment UI. Do NOT assign the 4 on-hold BCs.

Step 2: Assign 5 confirmed Aug-3 starters (BCs 1766, 25003, 25010, 25016, 25029) with week_start=2026-08-03. For BC 25035 (Rakan), run Issue 12 fix first (deactivate BC 24697, relink SCA 288).

Step 3: Verify student_class_assignments rows exist per BC with correct class_id.

RISK
- Category: bookings / class assignments
- Reversible: yes
- Blast radius: 13+ students untrackable for attendance

STATUS
CRITICAL - fix NOT RUN. Last checked: 2026-08-09 UTC (99th hourly check)