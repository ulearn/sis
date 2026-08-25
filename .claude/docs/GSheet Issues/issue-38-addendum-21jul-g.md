# Issue 38 addendum -- 33rd hourly Tue 21 Jul 2026 UTC (106th check)

Status: UNCHANGED. August Bank Holiday Mon 3 Aug 2026 still absent from school closures. 13 days away.

Database: 9 school closure records confirmed (fresh query this run):
  Good Friday 3 Apr 2026 (id 1)
  Christmas 21 Dec 2026 - 3 Jan 2027 (id 7)
  Good Friday 26 Mar 2027 (id 11)
  Christmas 20 Dec 2027 - 4 Jan 2028 (id 8)
  Good Friday 14 Apr 2028 (id 12)
  Christmas 18 Dec 2028 - 2 Jan 2029 (id 9)
  Good Friday 30 Mar 2029 (id 13)
  Christmas 24 Dec 2029 - 6 Jan 2030 (id 10)
  Good Friday 19 Apr 2030 (id 14)

Missing:
  August Bank Holiday -- Mon 3 Aug 2026 -- 13 calendar days from now
  October Bank Holiday -- Mon 26 Oct 2026

Impact: 202 active booking courses span Aug 3 | 114 span Oct 26

Schema: SchoolClosure fields: id, name, startDate, endDate, note, isPaidHoliday, createdAt
Storage pattern: UTC midnight (e.g. 2026-04-03T00:00:00.000Z for local date 3 Apr)

Fix recipe (NOT YET RUN):
1. INSERT school closure: name="August Bank Holiday", startDate=2026-08-03T00:00:00.000Z, endDate=2026-08-03T00:00:00.000Z, note="Public Holiday", isPaidHoliday=false
2. INSERT school closure: name="October Bank Holiday", startDate=2026-10-26T00:00:00.000Z, endDate=2026-10-26T00:00:00.000Z, note="Public Holiday", isPaidHoliday=false
3. Trigger end-date shunt for 202 booking courses spanning Aug 3 and 114 for Oct 26
   Uses same mechanism as Issue 3 Christmas shunt. Confirm with Neil before running.

See base recipe: issue-38-course-date-ux.md
Risk: Insert reversible. Shunt reversible but affects 202+ booking course end dates.
Last checked: Tue 21 Jul 2026 UTC (33rd hourly, 106th check).