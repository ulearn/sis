# Issue 38 — Aug Bank Holiday Shunt (90th check, 19th today — Mon 3 Aug 2026 UTC)
Reporter: PG | Area: Holidays, Bookings | Sheet row: 40

Symptom: Staff must manually set course end dates. Bank Holiday start-date restriction not enforced.

Root cause:
- No schoolClosure record for 2026-08-03. DB has 9 closures: Good Fridays 2026-2030, Christmas 2026-2029 only.
- 21 active BCs have startDate=2026-08-03: IDs 88,97,1755,1766,24627,24908,24956,24958,24959,24964,24984,24999,25002,25003,25010,25016,25028,25029,25030,25033,25035
- BC 25006 (General English AM Plus, bk18225): endDate=2026-08-03, active=true — needs deactivating
- BC 24956 (Giampaolo Russo, bk18180): starts Aug3, 0 SCAs — first class Tue Aug4 at risk
- Window closes ~07:30 UTC Tue 4 Aug (~12h remaining)

Fix recipe (NOT YET RUN):
Step 1 - Insert closure: p.schoolClosure.create({data:{name:'August Bank Holiday',startDate:new Date('2026-08-03'),endDate:new Date('2026-08-03')}})
Step 2 - Shunt 21 BCs: p.bookingCourse.updateMany({where:{startDate:new Date('2026-08-03'),active:true},data:{startDate:new Date('2026-08-04')}}) — expect 21 rows
Step 3 - Deactivate BC25006: p.bookingCourse.update({where:{id:25006},data:{active:false}})

Risk: bookings, medium blast radius (21 BCs). Reversible. URGENT: window closes ~07:30 UTC Tue.
Status: OPEN — NOT RUN. Last checked: 2026-08-03 UTC (19th check today)