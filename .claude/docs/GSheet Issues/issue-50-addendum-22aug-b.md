I Issue 50 — Stale Booking Accommodations (corrected count)

Reporter: KC | Area: Booking / Accomm | Sheet row: 52

Symptom: Weekly checkout submission reports more checkouts than entered.
Root cause: stale active Booking Accommodations with past end dates.

Root cause (460th check 22 Aug 2026 UTC):
Count INCREASED since 459th run (earlier today):
- 459th run reported 143 stale BAs (endDate < 2026-08-21)
- This run finds 149 stale BAs (endDate < 2026-08-22)
The +6 is BAs whose endDate = 2026-08-21 - not stale under yesterdays boundary. No manual deactivations occurred.

Oldest entries:
- BA 11237: ended 31 Jan 2026, fee EUR 1,400 -- 203 days stale
- BA 11239 (bed 83): ended 24 May 2026, fee EUR 1,050 -- 90 days stale
- BA 11168 (bed 83): ended 20 Jun 2026, fee EUR 700 -- 63 days stale

Fix recipe (NOT YET RUN):
Run in sis/ with node --env-file=.env -e '...'

const {PrismaClient}=require("./dist/generated/prisma/client");
const {PrismaPg}=require("@prisma/adapter-pg");
const p=new PrismaClient({adapter:new PrismaPg({connectionString:process.env.DATABASE_URL})});
(async()=>{
  const today=new Date("2026-08-22T00:00:00.000Z");
  const yr2026=new Date("2026-01-01T00:00:00.000Z");
  const stale=await p.bookingAccommodation.findMany({
    where:{Active:true,endDate:{lt:today,gte:yr2026}},
    select:{id:true,endDate:true,fee:true,bedId:true,bookingId:true},
    orderBy:{endDate:"asc"}
  });
  console.log("Count to deactivate:",stale.length);
  // const result=await p.bookingAccommodation.updateMany({
  //   where:{active:true,endDate:{lt:today,gte:yr2026}},data:{active:false}});
  await p.$disconnect();
})();

Risk: data-hygiene, reversible. Blast radius: 149 rows.

Status: Fix NOT RUN | Last checked: 2026-08-22 UTC (460th global run, 22nd issue check)
