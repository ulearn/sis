# Issue 36b — Stale Accommodation Bookings + Pietro Caccianiga Xero Payment

Reporter: KC | Area: Booking / Accommodation | Sheet row: 38 | Last checked: 2026-07-28 UTC

## Symptom
Pietro Caccianiga accommodation dates error; system won't allow date change.
Sub-tracked: stale accommodation bookings (active flag not cleared on checkout) + Pietro unreconciled Xero payment.

## Root cause (fresh data Tue 28 Jul 2026)
- Stale BAs: 46 records with active=true, bedId assigned, endDate in 2025-2026 past today (was 47, one cleared)
- Oldest 5: BA 11183 (bed 89, ended 6 Mar 2026), BA 9905 (bed 47, ended 3 May 2026),
  BA 11185 (bed 182, ended 3 May 2026), BA 11216 (bed 66, ended 9 May 2026), BA 11229 (bed 89, ended 9 May 2026)
- Pietro accommodation BA 11311 (bed 84, 28 Jun-13 Sep 2026): active=true — NOT stale (current, correct)
- Pietro payment 17733: EUR 5,331, Bank, xeroPaymentId=null — 55 days old (created 3 Jun 2026, booking 17980)

## Fix recipe — NOT YET RUN

### Step 1 — Preview stale BAs before deactivating

  node --env-file=.env -e "
    const {PrismaClient}=require('./dist/generated/prisma/client');
    const {PrismaPg}=require('@prisma/adapter-pg');
    const p=new PrismaClient({adapter:new PrismaPg({connectionString:process.env.DATABASE_URL})});
    p.bookingAccommodation.findMany({
      where:{active:true,bedId:{not:null},endDate:{lt:new Date('2026-07-28'),gt:new Date('2025-01-01')}}
    }).then(r=>{
      console.log('Stale count:',r.length);
      r.forEach(ba=>console.log('BA'+ba.id,'bed'+ba.bedId,'end='+ba.endDate));
      p.'$'disconnect();
    });
  "

### Step 2 — Deactivate all 46 stale BAs

  node --env-file=.env -e "
    const {PrismaClient}=require('./dist/generated/prisma/client');
    const {PrismaPg}=require('@prisma/adapter-pg');
    const p=new PrismaClient({adapter:new PrismaPg({connectionString:process.env.DATABASE_URL})});
    p.bookingAccommodation.updateMany({
      where:{active:true,bedId:{not:null},endDate:{lt:new Date('2026-07-28'),gt:new Date('2025-01-01')}},
      data:{active:false}
    }).then(r=>{console.log('Deactivated:',r.count);p.'$'disconnect();});
  "

### Step 3 — Reconcile Pietro payment 17733 in Xero
Payment 17733 (EUR 5,331, Bank, booking 17980, created 3 Jun 2026) has xeroPaymentId=null.
Locate or create the corresponding payment in Xero, then update:

  node --env-file=.env -e "
    const {PrismaClient}=require('./dist/generated/prisma/client');
    const {PrismaPg}=require('@prisma/adapter-pg');
    const p=new PrismaClient({adapter:new PrismaPg({connectionString:process.env.DATABASE_URL})});
    p.payment.update({where:{id:17733},data:{xeroPaymentId:'XERO_PAYMENT_ID_HERE'}})
      .then(r=>{console.log('Updated:',r.id,r.xeroPaymentId);p.'$'disconnect();});
  "

## Risk / category
- Category: bookings (stale flag) + accounts (Xero reconciliation)
- Reversible: Yes
- Blast radius: 46 BAs + 1 payment record

## Status
Open — 46 stale BAs (down from 47; one cleared since yesterday). Pietro PMT17733 xeroId=null (55d). Fix NOT RUN.