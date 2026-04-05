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

    // Get most recent booking start date per provider (across ALL time, not just visible range)
    const latestBookings = await prisma.$queryRaw<{provider_id: number, latest: Date}[]>`
      SELECT ap.provider_id, MAX(ba.start_date) as latest
      FROM booking_accommodations ba
      JOIN accommodation_beds ab ON ba.bed_id = ab.id
      JOIN accommodation_rooms ar ON ab.room_id = ar.id
      JOIN accommodation_properties ap ON ar.property_id = ap.id
      WHERE ba.active = true
      GROUP BY ap.provider_id
    `;
    const latestMap: Record<number, number> = {};
    for (const r of latestBookings) {
      latestMap[r.provider_id] = new Date(r.latest).getTime();
    }

    // Sort: hosts with most recent bookings first, fallback to alphabetical
    hosts.sort((a, b) => {
      const la = latestMap[a.id] || 0;
      const lb = latestMap[b.id] || 0;
      if (la && !lb) return -1;
      if (!la && lb) return 1;
      if (la !== lb) return lb - la;
      return a.name.localeCompare(b.name);
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

  async function splitPlacement(bookingAccommodationId: number, splitDate: string) {
    const placement = await prisma.bookingAccommodation.findUnique({
      where: { id: bookingAccommodationId },
    });
    if (!placement) throw new Error('Placement not found');
    if (!placement.bedId) throw new Error('Student is not placed');

    const split = new Date(splitDate);
    const origStart = new Date(placement.startDate);
    const origEnd = new Date(placement.endDate);

    if (split <= origStart || split >= origEnd) throw new Error('Split date must be between start and end');

    // Shorten original: ends day before split
    const newOrigEnd = new Date(split);
    newOrigEnd.setDate(newOrigEnd.getDate() - 1);
    const origDays = Math.ceil((newOrigEnd.getTime() - origStart.getTime()) / 86400000) + 1;
    const origWeeks = Math.ceil(origDays / 7);

    await prisma.bookingAccommodation.update({
      where: { id: bookingAccommodationId },
      data: {
        endDate: newOrigEnd,
        weeks: origWeeks,
      },
    });

    // Create new placement: starts on split date, ends on original end, unplaced
    const newDays = Math.ceil((origEnd.getTime() - split.getTime()) / 86400000) + 1;
    const newWeeks = Math.ceil(newDays / 7);

    const newPlacement = await prisma.bookingAccommodation.create({
      data: {
        bookingId: placement.bookingId,
        accommodationType: placement.accommodationType,
        roomType: placement.roomType,
        board: placement.board,
        startDate: split,
        endDate: origEnd,
        weeks: newWeeks,
        active: true,
        bedId: placement.bedId, // stays with same host — user can drag to move
      },
    });

    return { original: bookingAccommodationId, newPlacement: newPlacement.id };
  }

  return {
    listProviders, getProviderById, createProvider, updateProvider, deleteProvider,
    addProperty, updateProperty, deleteProperty,
    addRoom, updateRoom, deleteRoom,
    addBed, deleteBed,
    getUnplacedStudents, getHostTimeline, placeStudent, unplaceStudent, splitPlacement,
  };
}
