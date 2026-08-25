const {PrismaClient} = require('./dist/generated/prisma/client');
const {PrismaPg} = require('@prisma/adapter-pg');
const p = new PrismaClient({adapter: new PrismaPg({connectionString: process.env.DATABASE_URL})});
async function main() {
  const [bk94, bk18044, bk18152, s88, s14557, pmt17607] = await Promise.all([
    p.booking.findUnique({where:{id:94}, select:{id:true,status:true,amountPaid:true,confirmed:true,studentId:true}}),
    p.booking.findUnique({where:{id:18044}, select:{id:true,status:true,amountPaid:true,confirmed:true,studentId:true,updatedAt:true}}),
    p.booking.findUnique({where:{id:18152}, select:{id:true,status:true,amountPaid:true,confirmed:true,studentId:true}}),
    p.student.findUnique({where:{id:88}, select:{id:true,firstName:true,lastName:true,currentLevel:true}}),
    p.student.findUnique({where:{id:14557}, select:{id:true,firstName:true,lastName:true}}),
    p.payment.findUnique({where:{id:17607}, select:{id:true,bookingId:true,amount:true,xeroPaymentId:true,createdAt:true}}),
  ]);
  const c104 = await p.bookingCourse.findFirst({where:{bookingId:94}, select:{id:true,name:true,startDate:true,endDate:true}});
  const pmts94 = await p.payment.findMany({where:{bookingId:94}, select:{id:true,amount:true,xeroPaymentId:true}});
  const pmts18044 = await p.payment.findMany({where:{bookingId:18044}, select:{id:true,amount:true,xeroPaymentId:true,createdAt:true}});
  const c104scas = c104 ? await p.studentClassAssignment.count({where:{bookingCourseId:c104.id}}) : 0;
  const s14532 = await p.student.findUnique({where:{id:14532}, select:{id:true,firstName:true,lastName:true,currentLevel:true}});
  const bk18034 = await p.booking.findUnique({where:{id:18034}, select:{id:true,status:true,amountPaid:true,confirmed:true,updatedAt:true}});
  const c24826 = await p.bookingCourse.findFirst({where:{bookingId:18034}, select:{id:true,name:true,startDate:true,endDate:true,category:true}});
  const ernesto_scas = await p.studentClassAssignment.findMany({where:{studentId:14532}});
  const classes = await p.class.findMany({where:{active:true}, select:{id:true,name:true,level:true}, orderBy:{id:'asc'}});
  const s1001 = await p.student.findUnique({where:{id:1001}, select:{id:true,firstName:true,lastName:true,currentLevel:true,visaStatus:true,updatedAt:true}});
  const sca255 = await p.studentClassAssignment.findUnique({where:{id:255}, select:{id:true,classId:true,weekStart:true,weekEnd:true,bookingCourseId:true}});
  const bk18151 = await p.booking.findUnique({where:{id:18151}, select:{id:true,status:true,amountPaid:true,confirmed:true,updatedAt:true}});
  const attCount = await p.attendance.count({where:{studentId:1001}});
  const recentAtt = await p.attendance.findMany({where:{studentId:1001}, orderBy:{createdAt:'desc'}, take:3, select:{id:true,status:true,createdAt:true}});
  const pmt16988 = await p.payment.findUnique({where:{id:16988}, select:{id:true,bookingId:true,amount:true,xeroPaymentId:true}});
  const pmt16989 = await p.payment.findUnique({where:{id:16989}, select:{id:true,bookingId:true,amount:true,xeroPaymentId:true}});
  const bk17856 = await p.booking.findUnique({where:{id:17856}, select:{id:true,status:true,amountPaid:true,studentId:true,updatedAt:true}});
  const bk17857 = await p.booking.findUnique({where:{id:17857}, select:{id:true,status:true,amountPaid:true,studentId:true,updatedAt:true}});
  const ba11287 = await p.bookingAccommodation.findUnique({where:{id:11287}, select:{id:true,bedId:true,startDate:true,endDate:true,bookingId:true,updatedAt:true}});
  const bk1605 = await p.booking.findUnique({where:{id:1605}, select:{id:true,status:true,amountPaid:true,confirmed:true,updatedAt:true}});
  const pmts1605 = await p.payment.findMany({where:{bookingId:1605}});
  console.log(JSON.stringify({
    i30:{s88,bk94,bk18044,bk18152,pmt17607,c104,c104scas,pmts94,pmts18044,s14557},
    i26:{s14532,bk18034,c24826,ernesto_scas,classes},
    i29:{s1001,sca255,bk18151,attCount,recentAtt},
    i1:{pmt16988,pmt16989,bk17856,bk17857},
    i5:{ba11287},
    i20:{bk1605,pmts1605}
  },null,2));
}
main().then(()=>p.$disconnect()).catch(e=>{console.error(e.message);p.$disconnect();process.exit(1);});
