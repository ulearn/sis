import { PrismaClient } from '../generated/prisma/client';

export function accommodationScripts(prisma: PrismaClient) {

  // ── Providers ─────────────────────────────────
  async function listProviders(query: Record<string, any>) {
    const where: any = {};
    if (query.active !== undefined) where.active = query.active === 'true';
    if (query.type) where.type = query.type;
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { contactPerson: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
      ];
    }
    return prisma.accommodationProvider.findMany({
      where,
      include: {
        properties: {
          include: {
            rooms: { include: { beds: true } }
          }
        }
      },
      orderBy: { name: 'asc' },
    });
  }

  async function getProviderById(id: number) {
    return prisma.accommodationProvider.findUnique({
      where: { id },
      include: {
        properties: {
          include: {
            rooms: {
              include: {
                beds: {
                  include: {
                    placements: {
                      include: {
                        booking: {
                          include: {
                            student: { select: { id: true, firstName: true, lastName: true } }
                          }
                        }
                      },
                      orderBy: { startDate: 'desc' },
                      take: 10,
                    }
                  }
                }
              }
            }
          }
        }
      },
    });
  }

  async function createProvider(data: Record<string, any>) {
    for (const k of Object.keys(data)) { if (data[k] === '') data[k] = null; }
    return prisma.accommodationProvider.create({ data: data as any });
  }

  async function updateProvider(id: number, data: Record<string, any>) {
    for (const k of Object.keys(data)) { if (data[k] === '') data[k] = null; }
    return prisma.accommodationProvider.update({ where: { id }, data: data as any });
  }

  async function deleteProvider(id: number) {
    return prisma.accommodationProvider.delete({ where: { id } });
  }

  // ── Properties ────────────────────────────────
  async function addProperty(providerId: number, data: Record<string, any>) {
    for (const k of Object.keys(data)) { if (data[k] === '') data[k] = null; }
    return prisma.accommodationProperty.create({ data: { providerId, ...data } as any });
  }

  async function updateProperty(id: number, data: Record<string, any>) {
    for (const k of Object.keys(data)) { if (data[k] === '') data[k] = null; }
    return prisma.accommodationProperty.update({ where: { id }, data: data as any });
  }

  async function deleteProperty(id: number) {
    // Cascade: unlink placements, delete beds, rooms, then property
    const rooms = await prisma.accommodationRoom.findMany({ where: { propertyId: id }, select: { id: true } });
    for (const room of rooms) {
      const beds = await prisma.accommodationBed.findMany({ where: { roomId: room.id }, select: { id: true } });
      if (beds.length) {
        await prisma.bookingAccommodation.updateMany({
          where: { bedId: { in: beds.map(b => b.id) } },
          data: { bedId: null },
        });
        await prisma.accommodationBed.deleteMany({ where: { roomId: room.id } });
      }
    }
    if (rooms.length) {
      await prisma.accommodationRoom.deleteMany({ where: { propertyId: id } });
    }
    return prisma.accommodationProperty.delete({ where: { id } });
  }

  // ── Rooms ─────────────────────────────────────
  async function addRoom(propertyId: number, data: Record<string, any>) {
    if (data.capacity) data.capacity = parseInt(data.capacity);
    for (const k of Object.keys(data)) { if (data[k] === '') data[k] = null; }
    return prisma.accommodationRoom.create({ data: { propertyId, ...data } as any });
  }

  async function updateRoom(id: number, data: Record<string, any>) {
    if (data.capacity) data.capacity = parseInt(data.capacity);
    for (const k of Object.keys(data)) { if (data[k] === '') data[k] = null; }
    return prisma.accommodationRoom.update({ where: { id }, data: data as any });
  }

  async function deleteRoom(id: number) {
    // Cascade: unlink placements from beds, delete beds, then room
    const beds = await prisma.accommodationBed.findMany({ where: { roomId: id }, select: { id: true } });
    if (beds.length) {
      await prisma.bookingAccommodation.updateMany({
        where: { bedId: { in: beds.map(b => b.id) } },
        data: { bedId: null },
      });
      await prisma.accommodationBed.deleteMany({ where: { roomId: id } });
    }
    return prisma.accommodationRoom.delete({ where: { id } });
  }

  // ── Beds ──────────────────────────────────────
  async function addBed(roomId: number, data: Record<string, any>) {
    for (const k of Object.keys(data)) { if (data[k] === '') data[k] = null; }
    return prisma.accommodationBed.create({ data: { roomId, ...data } as any });
  }

  async function deleteBed(id: number) {
    // Unlink any placements first
    await prisma.bookingAccommodation.updateMany({
      where: { bedId: id },
      data: { bedId: null },
    });
    return prisma.accommodationBed.delete({ where: { id } });
  }

  // ── Matching Engine ────────────────────────────

  // Get all unplaced students (have accomm booking but no bed assigned)
  async function getUnplacedStudents(providerType?: string) {
    const where: any = { active: true, bedId: null };
    if (providerType === 'Host Family') {
      where.accommodationType = 'Host Family';
    } else if (providerType === 'Apartment') {
      where.accommodationType = { not: 'Host Family' }; // City Centre Apartment, Apartment, etc.
    }
    return prisma.bookingAccommodation.findMany({
      where,
      include: {
        booking: {
          include: {
            student: {
              select: {
                id: true, firstName: true, lastName: true,
                gender: true, nationality: true, birthday: true,
                allergies: true, diet: true,
                studentType: true, profilePicture: true,
              }
            }
          }
        }
      },
      orderBy: { startDate: 'asc' },
    });
  }

  // Get host timeline data: hosts with rooms, beds, and current placements in a date range
  async function getHostTimeline(from: string, to: string, providerType?: string) {
    const fromDate = new Date(from);
    const toDate = new Date(to);

    const typeFilter = providerType || 'Host Family';
    const hosts = await prisma.accommodationProvider.findMany({
      where: { active: true, type: typeFilter },
      include: {
        properties: {
          include: {
            rooms: {
              include: {
                beds: {
                  include: {
                    placements: {
                      where: {
                        active: true,
                        startDate: { lte: toDate },
                        endDate: { gte: fromDate },
                      },
                      include: {
                        booking: {
                          include: {
                            student: {
                              select: {
                                id: true, firstName: true, lastName: true,
                                gender: true, nationality: true, birthday: true,
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      orderBy: { name: 'asc' },
    });

    // Sort by most recently booked (has any placement with latest start date)
    hosts.sort((a, b) => {
      let latestA = 0, latestB = 0;
      for (const prop of a.properties) {
        for (const room of prop.rooms) {
          for (const bed of room.beds) {
            for (const p of bed.placements) {
              const t = new Date(p.startDate).getTime();
              if (t > latestA) latestA = t;
            }
          }
        }
      }
      for (const prop of b.properties) {
        for (const room of prop.rooms) {
          for (const bed of room.beds) {
            for (const p of bed.placements) {
              const t = new Date(p.startDate).getTime();
              if (t > latestB) latestB = t;
            }
          }
        }
      }
      // Hosts with placements first, then by most recent
      if (latestA && !latestB) return -1;
      if (!latestA && latestB) return 1;
      return latestB - latestA;
    });

    return hosts;
  }

  // Place a student: assign a bed to a booking accommodation
  async function placeStudent(bookingAccommodationId: number, bedId: number) {
    return prisma.bookingAccommodation.update({
      where: { id: bookingAccommodationId },
      data: { bedId },
    });
  }

  // Unplace a student
  async function unplaceStudent(bookingAccommodationId: number) {
    return prisma.bookingAccommodation.update({
      where: { id: bookingAccommodationId },
      data: { bedId: null },
    });
  }

  return {
    listProviders, getProviderById, createProvider, updateProvider, deleteProvider,
    addProperty, updateProperty, deleteProperty,
    addRoom, updateRoom, deleteRoom,
    addBed, deleteBed,
    getUnplacedStudents, getHostTimeline, placeStudent, unplaceStudent,
  };
}
