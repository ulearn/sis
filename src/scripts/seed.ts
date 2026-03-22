import { PrismaClient } from '../generated/prisma/client';

export async function seedClassrooms(prisma: PrismaClient) {
  const classrooms = [];
  for (let i = 1; i <= 8; i++) {
    classrooms.push(
      prisma.classroom.upsert({
        where: { name: `Harcourt #${i}` },
        update: {},
        create: { name: `Harcourt #${i}`, capacity: null, active: true },
      })
    );
  }
  return Promise.all(classrooms);
}
