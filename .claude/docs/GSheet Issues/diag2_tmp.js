const {PrismaClient} = require('/home/sis/web/sis.ulearnschool.com/public_html/sis/dist/generated/prisma/client');
const {PrismaPg} = require('/home/sis/web/sis.ulearnschool.com/public_html/sis/node_modules/@prisma/adapter-pg');
const p = new PrismaClient({adapter: new PrismaPg({connectionString: process.env.DATABASE_URL})});

async function main() {
  const out = {};

  // Find Ivan Rodriguez (intensive student, course ~Jun 8-19)
  const ivanStudents = await p.student.findMany({
    where: {
      OR: [
        {firstName: {contains: 'Ivan', mode: 'insensitive'}},
        {lastName: {contains: 'Rodriguez', mode: 'insensitive'}}
      ]
    },
    select: {id:true, firstName:true, lastName:true, email:true}
  });
  out.ivan_students = ivanStudents;

  // For each Ivan Rodriguez, get their bookings and SCAs
  for (const s of ivanStudents) {
    const bks = await p.booking.findMany({
      where: {studentId: s.id},
      include: {
        courses: {
          include: {classAssignments: {select: {id:true, classId:true, weekStart:true, weekEnd:true}}}
        }
      }
    });
    out['ivan_bks_' + s.id] = bks.map(function(b) {
      return {id: b.id, status: b.status, confirmed: b.confirmed, amountPaid: b.amountPaid, amountTotal: b.amountTotal, courses: b.courses};
    });
  }

  // Find Saikhantes Shagdasuren
  const saikh = await p.student.findMany({
    where: {
      OR: [
        {firstName: {contains: 'Saikhantes', mode: 'insensitive'}},
        {lastName: {contains: 'Shagdasuren', mode: 'insensitive'}}
      ]
    },
    select: {id:true, firstName:true, lastName:true, email:true}
  });
  out.saikhantes_students = saikh;

  // For each Saikhantes, get bookings and SCAs
  for (const s of saikh) {
    const bks = await p.booking.findMany({
      where: {studentId: s.id},
      include: {
        courses: {
          include: {classAssignments: {select: {id:true, classId:true, weekStart:true, weekEnd:true}}}
        }
      }
    });
    out['saikh_bks_' + s.id] = bks.map(function(b) {
      return {id: b.id, status: b.status, confirmed: b.confirmed, amountPaid: b.amountPaid, amountTotal: b.amountTotal, courses: b.courses};
    });
    // Also check SCA directly
    const scas = await p.studentClassAssignment.findMany({
      where: {studentId: s.id},
      include: {class_: {select: {id:true, level:true, session:true}}}
    });
    out['saikh_scas_' + s.id] = scas.map(function(sca) {
      return {id: sca.id, classId: sca.classId, bookingCourseId: sca.bookingCourseId, level: sca.class_ && sca.class_.level, session: sca.class_ && sca.class_.session, weekStart: sca.weekStart, weekEnd: sca.weekEnd};
    });
    // Booking course 24925 specifically
    const bc24925 = await p.bookingCourse.findFirst({
      where: {id: 24925},
      select: {id:true, name:true, startDate:true, endDate:true, active:true, bookingId:true}
    });
    out.bc24925 = bc24925;
  }

  // Issue 27: Check if payments 17477/17478 exist and which booking they belong to
  const pmts27 = await p.payment.findMany({
    where: {id: {in: [17477, 17478]}},
    select: {id:true, bookingId:true, amount:true, xeroPaymentId:true, hubspotPaymentId:true}
  });
  out.i27_pmts_17477_17478 = pmts27;
  // Also check all payments for Sofiia's confirmed booking 17849
  const pmts17849 = await p.payment.findMany({
    where: {bookingId: 17849},
    select: {id:true, amount:true, xeroPaymentId:true, hubspotPaymentId:true, bookingId:true}
  });
  out.i27_pmts_bk17849 = pmts17849;

  // Issue 30: Giulia/Milena - check approach Jun26 deadline
  const giulia = await p.student.findMany({
    where: {firstName: {contains: 'Giulia', mode: 'insensitive'}},
    select: {id:true, firstName:true, lastName:true}
  });
  out.giulia_students = giulia;
  for (const s of giulia) {
    if (s.lastName && s.lastName.toLowerCase().includes('avallone')) {
      const bks = await p.booking.findMany({
        where: {studentId: s.id},
        include: {
          courses: {
            include: {classAssignments: {select: {id:true, classId:true, weekStart:true, weekEnd:true}}}
          }
        }
      });
      out['giulia_bks_' + s.id] = bks.map(function(b) {
        return {id: b.id, status: b.status, confirmed: b.confirmed, amountPaid: b.amountPaid, amountTotal: b.amountTotal, courses: b.courses};
      });
    }
  }

  // Issue 31: attendance route - just check if the issue is about src/routes/attendance.ts
  // No DB query needed - this is a code issue

  console.log(JSON.stringify(out, null, 2));
  await p.$disconnect();
}

main().catch(function(e) { console.error('ERR:' + e.message); process.exit(1); });
