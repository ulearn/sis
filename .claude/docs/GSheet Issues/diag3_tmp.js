const {PrismaClient} = require('/home/sis/web/sis.ulearnschool.com/public_html/sis/dist/generated/prisma/client');
const {PrismaPg} = require('/home/sis/web/sis.ulearnschool.com/public_html/sis/node_modules/@prisma/adapter-pg');
const p = new PrismaClient({adapter: new PrismaPg({connectionString: process.env.DATABASE_URL})});

async function main() {
  const out = {};

  // Issue 25: Uyanga Tungalag - student 917, booking 1467
  const s917 = await p.student.findFirst({
    where: {id: 917},
    select: {id:true, firstName:true, lastName:true, visaStatus:true, hubspotContactId:true, updatedAt:true}
  });
  out.uyanga_student = s917;

  const bk1467 = await p.booking.findFirst({
    where: {id: 1467},
    include: {
      courses: {
        select: {id:true, name:true, startDate:true, endDate:true, active:true,
          classAssignments: {select: {id:true, classId:true, weekStart:true, weekEnd:true}}}
      }
    }
  });
  out.uyanga_booking = {
    id: bk1467 && bk1467.id,
    status: bk1467 && bk1467.status,
    confirmed: bk1467 && bk1467.confirmed,
    amountPaid: bk1467 && bk1467.amountPaid,
    amountTotal: bk1467 && bk1467.amountTotal,
    courses: bk1467 && bk1467.courses
  };

  // Issue 23: Enshi Lu - bookingCourse 828
  const bc828 = await p.bookingCourse.findFirst({
    where: {id: 828},
    select: {id:true, name:true, startDate:true, endDate:true, active:true, bookingId:true, updatedAt:true}
  });
  out.enshi_bc828 = bc828;

  // Melie Villard (issue 16): bookingAccommodation 11282 (schema has no bedAssignment model)
  const ba11282 = await p.bookingAccommodation.findFirst({
    where: {id: 11282},
    select: {id:true, active:true, startDate:true, endDate:true, bedId:true, updatedAt:true}
  });
  out.melie_ba11282 = ba11282;

  // Mai Lan Chu (issue 19): bookings 83 and 2606
  const bk83 = await p.booking.findFirst({
    where: {id: 83},
    select: {id:true, status:true, confirmed:true, amountPaid:true, amountTotal:true, updatedAt:true}
  });
  const bk2606 = await p.booking.findFirst({
    where: {id: 2606},
    select: {id:true, status:true, confirmed:true, amountPaid:true, amountTotal:true, updatedAt:true}
  });
  out.mailan_bk83 = bk83;
  out.mailan_bk2606 = bk2606;

  console.log(JSON.stringify(out, null, 2));
  await p.$disconnect();
}

main().catch(function(e) { console.error('ERR:' + e.message); process.exit(1); });
