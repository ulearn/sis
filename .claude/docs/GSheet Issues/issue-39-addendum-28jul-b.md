# Issue 39 — Xuezhen Huang — ABSOLUTE LAST CHANCE

Reporter: KC | Area: Booking / Accommodation | Sheet row: 41 | Last checked: 2026-07-28 UTC

## Symptom
Student paid for 3 weeks Host Family accommodation but did not appear in matching section.
Accommodation now present; class assignment still missing.

## Root cause (fresh data Tue 28 Jul 2026)
- Student 14443 (Xuezhen Huang): booking 17831 CONFIRMED, EUR 1,396.90/1,396.90 fully paid
- Booking course 24609 (Morning General, 13 Jul-31 Jul 2026): 0 class assignments
- Course ends Friday 31 Jul 2026 — today Tue 28 Jul — 3 school days remain
- 18 school days elapsed with zero class assignments — attendance lost 13-25 Jul permanently
- Accommodation 11358 (bed 180, 12 Jul-2 Aug 2026): active=true, EUR 900 — OK, no action needed

## Fix recipe — NOT YET RUN

### Step 1 — Assign student to Morning General class
In SIS admin: open student 14443 -> Booking 17831 -> Booking Course 24609.
Assign to an appropriate Morning General class effective today Tue 28 Jul (or Wed 29 at latest).

### Step 2 — Verify after assignment
  node --env-file=.env -e "
    const {PrismaClient}=require('./dist/generated/prisma/client');
    const {PrismaPg}=require('@prisma/adapter-pg');
    const p=new PrismaClient({adapter:new PrismaPg({connectionString:process.env.DATABASE_URL})});
    p.studentClassAssignment.findMany({where:{bookingCourseId:24609}})
      .then(r=>{console.log('SCAs:',r.length);p.'$'disconnect();});
  "

## Risk / category
- Category: bookings / class assignment
- Reversible: Yes
- Blast radius: Single student (Xuezhen Huang)
- Urgency: CRITICAL — course ends Fri 31 Jul 2026; absolute last chance

## Status
Open — 0 class assignments confirmed fresh Tue 28 Jul 2026 UTC. Fix NOT RUN.