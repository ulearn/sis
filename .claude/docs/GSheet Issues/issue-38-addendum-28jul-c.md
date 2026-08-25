# Issue 38 — August Bank Holiday 2026 — DEADLINE Fri 31 Jul

Reporter: PG | Area: Holidays / Bookings | Sheet row: 40 | Last checked: 2026-07-28 UTC

## Symptom
Staff request course start dates be restricted around bank holidays.
Immediate sub-item: August Bank Holiday (Mon 3 Aug 2026) must be added to school_closures
so the booking system shunts affected course starts to Tue 4 Aug.

## Root cause (fresh data Tue 28 Jul 2026)
- school_closures table has 9 entries: Good Fridays 2026-2030 and Christmas breaks 2026-2029
- August Bank Holiday Mon 3 Aug 2026 is ABSENT from school_closures
- 17 booking courses have startDate = 2026-08-03 (they will start on a bank holiday):
  bc88, bc97, bc1755, bc1766, bc24627, bc24908, bc24956, bc24958, bc24959,
  bc24964, bc24970, bc24984, bc24999, bc25002, bc25003, bc25010, bc25016
- If closure is added, shunt logic must move these 17 BCs to start Tue 4 Aug 2026
- DEADLINE: Fri 31 Jul 2026 (3 days) — must be in DB before the bank holiday itself

## Fix recipe — NOT YET RUN

### Step 1 — Add August Bank Holiday to school_closures

  node --env-file=.env -e "
    const {PrismaClient}=require('./dist/generated/prisma/client');
    const {PrismaPg}=require('@prisma/adapter-pg');
    const p=new PrismaClient({adapter:new PrismaPg({connectionString:process.env.DATABASE_URL})});
    p.schoolClosure.create({data:{
      name:'August Bank Holiday 2026',
      startDate:new Date('2026-08-03'),
      endDate:new Date('2026-08-03'),
      isPaidHoliday:true
    }}).then(r=>{console.log('Created closure id:',r.id);p.'$'disconnect();});
  "

### Step 2 — Shunt 17 affected booking course start dates to Tue 4 Aug

Check whether the booking system has an automatic shunt on closure insert. If not, manually:

  SQL (NOT YET RUN):
  UPDATE booking_courses
  SET start_date = '2026-08-04'
  WHERE id IN (88, 97, 1755, 1766, 24627, 24908, 24956, 24958, 24959, 24964, 24970, 24984, 24999, 25002, 25003, 25010, 25016)
    AND start_date = '2026-08-03';

### Step 3 — Verify

  node --env-file=.env -e "
    const {PrismaClient}=require('./dist/generated/prisma/client');
    const {PrismaPg}=require('@prisma/adapter-pg');
    const p=new PrismaClient({adapter:new PrismaPg({connectionString:process.env.DATABASE_URL})});
    async function main(){
      const cl=await p.schoolClosure.findMany({orderBy:{startDate:'asc'}});
      console.log('Closures:',cl.length,'(should be 10 after add)');
      const aug3=await p.bookingCourse.findMany({where:{startDate:new Date('2026-08-03')}});
      console.log('BCs starting Aug 3:',aug3.length,'(should be 0 after shunt)');
    }
    main().then(()=>p.'$'disconnect());
  "

## Note — BC 24956 (Giampaolo Russo — Issue 41)
BC 24956 is one of the 17 affected BCs. Fix Issue 38 before assigning class on Issue 41.

## Risk / category
- Category: bookings / data-hygiene
- Reversible: Yes — closure can be deleted; BC start dates can be reverted
- Blast radius: 17 booking courses
- Urgency: DEADLINE Fri 31 Jul 2026 — must be done before Mon 3 Aug

## Status
Open — Aug BH absent confirmed fresh Tue 28 Jul 2026 UTC. 17 BCs start Aug 3. Fix NOT RUN.