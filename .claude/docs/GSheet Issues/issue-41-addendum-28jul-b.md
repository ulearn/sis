# Issue 41 — Giampaolo Russo — Capel Apartment Missing, Check-In 5 Days

Reporter: KC | Area: Booking / Accommodation | Sheet row: 43 | Last checked: 2026-07-28 UTC

## Symptom
Student booked Host Family (Aug 2-Sep 6) and Capel Street apartment (Sep 6-14).
Neither Diego nor KC can add the second accommodation; host family not in matching section.

## Root cause (fresh data Tue 28 Jul 2026)
- Booking 18180 (Giampaolo Russo, student 14571): CONFIRMED, EUR 2,584.96/2,584.96 fully paid
- BA 11357: Host Family, bed 178, 2 Aug-6 Sep 2026, active=true, EUR 1,250 — present and correct
- Capel apartment (6 Sep-14 Sep 2026): ABSENT from booking_accommodations — never added to DB
- BC 24956 (General English AM, 3 Aug-11 Sep 2026): 0 class assignments, starts Mon 3 Aug
- BC 24956 start date is Aug 3 (August Bank Holiday) — dependent on Issue 38 fix first
- HOST FAMILY CHECK-IN: Sun 2 Aug 2026 — 5 days from now

## Fix recipe — NOT YET RUN

### Step 1 — Fix Issue 38 first (Aug Bank Holiday)
BC 24956 starts 3 Aug (a bank holiday). Add school_closure for Aug 3 (see issue-38-addendum-28jul-c.md),
then shunt BC 24956 start to Aug 4. Do this before assigning the student to a class.

### Step 2 — Add missing Capel apartment booking accommodation
First identify the correct bed ID for the Capel apartment room in SIS bed/room inventory.
Then add via SIS admin accommodation UI on booking 18180, or via Prisma:

  node --env-file=.env -e "
    const {PrismaClient}=require('./dist/generated/prisma/client');
    const {PrismaPg}=require('@prisma/adapter-pg');
    const p=new PrismaClient({adapter:new PrismaPg({connectionString:process.env.DATABASE_URL})});
    p.bookingAccommodation.create({data:{
      bookingId:18180,
      bedId:CAPEL_BED_ID,  // Replace with actual bed ID
      startDate:new Date('2026-09-06'),
      endDate:new Date('2026-09-14'),
      active:true,
      fee:null  // Set correct fee
    }}).then(r=>{console.log('Created BA:',r.id);p.'$'disconnect();});
  "

### Step 3 — Assign BC 24956 to General English AM class (after Step 1)
In SIS admin: student 14571 -> Booking 18180 -> Booking Course 24956.
Assign to General English AM class starting 4 Aug (after Issue 38 shunt).

### Step 4 — Verify
  node --env-file=.env -e "
    const {PrismaClient}=require('./dist/generated/prisma/client');
    const {PrismaPg}=require('@prisma/adapter-pg');
    const p=new PrismaClient({adapter:new PrismaPg({connectionString:process.env.DATABASE_URL})});
    p.booking.findUnique({where:{id:18180},include:{accommodations:true,courses:{include:{classAssignments:true}}}}).then(r=>{
      console.log('BAs:',r.accommodations.length);
      r.accommodations.forEach(ba=>console.log(' BA'+ba.id,'bed'+ba.bedId,ba.startDate,'-',ba.endDate,'active='+ba.active));
      console.log('BCs:',r.courses.length);
      r.courses.forEach(bc=>console.log(' BC'+bc.id,bc.name,bc.startDate,'SCAs='+bc.classAssignments.length));
      p.'$'disconnect();
    });
  "

## Risk / category
- Category: bookings / accommodations
- Reversible: Yes
- Blast radius: Single student (Giampaolo Russo)
- Urgency: Check-in Sun 2 Aug (5 days); Capel BA not urgent until Sep 6 but class assign needed before Aug 4

## Status
Open — Capel BA absent, BC 24956 0 SCAs confirmed fresh Tue 28 Jul 2026 UTC. Check-in 5 days. Fix NOT RUN.