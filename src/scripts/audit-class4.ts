// Inspect class 4: its days array + meta. If `days` includes 0 (Sun) that
// alone explains the phantom Sunday occurrences for Adriana.
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';

async function main() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter } as any);

  const cls: any = await prisma.class.findUnique({ where: { id: 4 } });
  console.log('class 4:', cls);

  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
