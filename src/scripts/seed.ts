import { PrismaClient } from '../generated/prisma/client';

export async function seedClassrooms(prisma: PrismaClient) {
  const rooms = ['Room 1', 'Room 2', 'Room 3', 'Room 4', 'Room 5', 'Room 6', 'Room 7', 'Basement'];
  for (const name of rooms) {
    const existing = await prisma.classroom.findFirst({ where: { name } });
    if (!existing) {
      await prisma.classroom.create({ data: { name, capacity: null, active: true } });
      console.log(`[Seed] Created classroom: ${name}`);
    }
  }
}
