import dotenv from 'dotenv';
dotenv.config();
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';

async function main() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter } as any);
  const target = process.argv[2] || 'GF838632';
  const rows = await prisma.student.findMany({
    where: { passportNumber: { equals: target, mode: 'insensitive' } },
    select: {
      id: true, firstName: true, lastName: true, email: true,
      nationality: true, passportNumber: true,
      visaRequired: true, visaFrom: true, visaUntil: true,
    },
  });
  console.log('Matches for', target, ':', rows.length);
  for (const r of rows) console.log(' ', r);
  await prisma.$disconnect();
}
main().catch(e => { console.error(e); process.exit(1); });
