# Issue 38 — Aug 10 Starters: Class Assignments (addendum Thu 6 Aug 2026 15:02 UTC)

Reporter: PG | Area: Holidays/Bookings | Sheet row 40 | Check 42

## Symptom
Staff must set course/holiday end dates manually; course start date validation needed.

## Current state (confirmed 15:02 UTC)
17 booking courses starting Mon 10 Aug 2026 have 0 class assignments. Deadline: Fri 7 Aug EOD.

## 13 confirmed ready to assign (CONFIRMED + confirmed=true, 0 SCAs)

| BC ID | Name | Student |
|-------|------|---------|
| 108   | Intensive General 30 | Lucia Borroni |
| 109   | Morning General | Maicol Moretti |
| 1313  | Academic Year Afternoon | Ana Luiza De Sousa |
| 1818  | Academic Year Morning | Natanael Reis Lourenco de Sales |
| 24915 | Academic Year Morning | Toshimi Hanakawa |
| 24970 | Academic Year Afternoon | Tsengelbayar Mendsaikhan |
| 25004 | General English AM Plus | Vincenzo Contu |
| 25005 | General English AM | Claudia Mereu |
| 25024 | General English PM | Josimar Roberto |
| 25027 | Academic Year Morning | Jacqueline Olga Burgos |
| 25031 | Academic Year Morning | Brisia Garcia Roman |
| 25036 | General English AM | Jorge Perez Aldana |
| 25039 | General English PM Plus | Cristian Ravai |

## 4 blocked (payment/confirmation incomplete)

| BC ID | Name | Student | Booking Status | Reason |
|-------|------|---------|----------------|--------|
| 96    | Intensive General 30 | Alessandro Signorotti | CONFIRMED confirmed=false | Needs confirmation |
| 833   | Academic Year Morning | Settiyanee Duangjai | ESCROW confirmed=false | Payment in escrow |
| 25007 | Academic Year Morning | Nominjin Amartsogt | PARTIAL confirmed=false | Partial payment |
| 25042 | General English AM | Edith Nunes | PENDING confirmed=false | Not paid |

## Fix recipe (NOT YET RUN -- run before Fri 7 Aug EOD)

In SIS admin: Bookings -> Class Assignments -> assign the 13 confirmed BCs above to appropriate classes.

For the 4 blocked BCs: check HubSpot/Xero for payment status first; only assign once booking is confirmed.

## Risk / category
- Category: bookings / class assignments | Reversible: yes | Blast radius: 13-17 students
- Students start Monday 10 Aug; unassigned students cannot attend class

## Status
OPEN -- fix NOT applied | Last checked: 2026-08-06 15:02 UTC