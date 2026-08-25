# Issue 22 — Edith Nunes — No Class Assignment, 10 Days Left

Reporter: PG | Area: Booking / Class | Sheet row: 23 | Last checked: 2026-07-28 UTC

## Symptom
Edith Nunes not appearing in TBA for wb 18.05.26; two payments with same invoice number.

## Root cause (fresh data Tue 28 Jul 2026)
- Student 1015 (Edith Nunes): BC 24991 (General English AM, 13 Jul-7 Aug 2026): 0 class assignments
- Course ends 7 Aug 2026 — 10 days remaining; 15 school days already lost
- Duplicate booking courses on booking 18158:
  - BC 24933 (General English AM, start 15 Jun 2026): active=true
  - BC 24934 (General English AM, start 15 Jun 2026): active=true
  - Both same start date — may be blocking assignment or confusing TBA view

## Fix recipe — NOT YET RUN

### Step 1 — Inspect duplicate BCs 24933 / 24934 on booking 18158

  node --env-file=.env -e "
    const {PrismaClient}=require('./dist/generated/prisma/client');
    const {PrismaPg}=require('@prisma/adapter-pg');
    const p=new PrismaClient({adapter:new PrismaPg({connectionString:process.env.DATABASE_URL})});
    p.bookingCourse.findMany({where:{bookingId:18158},include:{classAssignments:true}}).then(r=>{
      r.forEach(bc=>console.log('BC'+bc.id,bc.name,bc.startDate,bc.endDate,'fee='+bc.fee,'scas='+bc.classAssignments.length,'active='+bc.active));
      p.'$'disconnect();
    });
  "

### Step 2 — Soft-delete the duplicate BC (after identifying which is correct)

  node --env-file=.env -e "
    const {PrismaClient}=require('./dist/generated/prisma/client');
    const {PrismaPg}=require('@prisma/adapter-pg');
    const p=new PrismaClient({adapter:new PrismaPg({connectionString:process.env.DATABASE_URL})});
    p.bookingCourse.update({where:{id:DUPLICATE_BC_ID},data:{deletedAt:new Date()}})
      .then(r=>{console.log('Soft-deleted BC:',r.id);p.'$'disconnect();});
  "

### Step 3 — Assign Edith Nunes to AM class on BC 24991
In SIS admin: student 1015 -> booking 18158 -> BC 24991.
Assign to General English AM class effective as early as possible.

### Step 4 — Verify

  node --env-file=.env -e "
    const {PrismaClient}=require('./dist/generated/prisma/client');
    const {PrismaPg}=require('@prisma/adapter-pg');
    const p=new PrismaClient({adapter:new PrismaPg({connectionString:process.env.DATABASE_URL})});
    p.bookingCourse.findUnique({where:{id:24991},include:{classAssignments:true}}).then(r=>{
      console.log('BC24991 SCAs:',r.classAssignments.length);
      p.'$'disconnect();
    });
  "

## Risk / category
- Category: bookings / class assignment
- Reversible: Yes
- Blast radius: Single student (Edith Nunes)
- Urgency: CRITICAL — course ends 7 Aug 2026 (10 days); 15 school days already lost

## Status
Open — BC 24991 0 SCAs, dup BCs 24933/24934 confirmed fresh Tue 28 Jul 2026 UTC. Fix NOT RUN.