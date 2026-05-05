import { PrismaClient } from '../generated/prisma/client';

function withEffectiveActive<T extends { active: boolean; activeFrom?: Date | null; activeTo?: Date | null } | null>(p: T): T extends null ? null : T & { effectiveActive: boolean } {
  if (!p) return p as any;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const inRange = !!(p.activeFrom && p.activeTo && today >= new Date(p.activeFrom) && today <= new Date(p.activeTo));
  return { ...p, effectiveActive: p.active === true || inRange } as any;
}

export function accommodationScripts(prisma: PrismaClient) {

  // ── Providers ─────────────────────────────────
  async function listProviders(query: Record<string, any>) {
    const where: any = {};
    const activeFilter = query.active === undefined ? undefined : query.active === 'true';
    if (query.type) where.type = query.type;
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { contactPerson: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
      ];
    }
    const rows = await prisma.accommodationProvider.findMany({
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
    const enriched = rows.map(withEffectiveActive);
    if (activeFilter === undefined) return enriched;
    return enriched.filter(p => p.effectiveActive === activeFilter);
  }

  async function getProviderById(id: number) {
    const row = await prisma.accommodationProvider.findUnique({
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
    return withEffectiveActive(row);
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
    // Filtration rules (owner directive 2026-05-04):
    //  1. Hide bookings whose accommodation end-date is in the past — the
    //     student has already left, no point matching them.
    //  2. Hide bookings with zero payment received — placing students before
    //     ANY money has come in creates downstream cost (host fees, hotel)
    //     for a booking that may never confirm. Hard exclude.
    //  3. Surface partially-paid bookings (paid > 0 but balance > 0) so staff
    //     see them — but the placement endpoint blocks non-admin users from
    //     actually placing them; admins can override after escalation.
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const where: any = {
      active: true,
      bedId: null,
      endDate: { gte: today },
    };
    if (providerType === 'Host Family') {
      where.accommodationType = 'Host Family';
    } else if (providerType === 'Apartment') {
      where.accommodationType = { not: 'Host Family' }; // City Centre Apartment, Apartment, etc.
    }
    const rows = await prisma.bookingAccommodation.findMany({
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
    // Drop zero-payment bookings entirely; tag partial-payment ones so the
    // client can render them differently and lock placement for non-admins.
    //
    // Classification (paid = amountPaid, total = amountTotal):
    //   paid <= 0                  → 'unpaid'  (filtered out — never shown)
    //   paid > 0  && paid < total  → 'partial' (shown, orange, locked)
    //   paid > 0  && paid >= total → 'paid'    (shown, normal colours)
    //   paid > 0  && total <= 0    → 'paid'    (total unknown but they paid
    //                                            something — trust it)
    //
    // We deliberately don't lean on `amountOpen` because it's a derived field
    // that has been observed to lag behind paid/total in the Fidelo import,
    // which would mislabel fully-paid bookings as 'partial'.
    const EPS = 0.01; // €0.01 wiggle room for currency rounding
    return rows
      .map(r => {
        const paid  = Number((r as any).booking?.amountPaid  || 0);
        const total = Number((r as any).booking?.amountTotal || 0);
        let paymentStatus: 'paid' | 'partial' | 'unpaid' = 'unpaid';
        let paymentBalance = 0;
        if (paid > 0) {
          if (total > 0 && (total - paid) > EPS) {
            paymentStatus = 'partial';
            paymentBalance = total - paid;
          } else {
            paymentStatus = 'paid';
          }
        }
        return { ...r, paymentStatus, paymentBalance };
      })
      .filter(r => (r as any).paymentStatus !== 'unpaid');
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

  // Place a student: assign a bed to a booking accommodation. The caller's
  // role decides whether partially-paid bookings can be placed — only admins
  // can override that gate (forces escalation for the accommodation team
  // when there's an outstanding balance, instead of silently incurring host
  // fees against an unpaid booking).
  async function placeStudent(bookingAccommodationId: number, bedId: number, callerRole?: string) {
    const ba = await prisma.bookingAccommodation.findUnique({
      where: { id: bookingAccommodationId },
      include: { booking: { select: { amountPaid: true, amountTotal: true } } },
    });
    if (!ba) throw new Error('Booking accommodation not found');
    const paid  = Number(ba.booking?.amountPaid  || 0);
    const total = Number(ba.booking?.amountTotal || 0);
    if (paid <= 0) throw new Error('Cannot place: no payment has been received on this booking.');
    // Match getUnplacedStudents: only flag partial when total is positive and
    // there's a meaningful gap (€0.01+) — avoids tripping on cent-rounding
    // and on bookings with unknown totals.
    const partial = total > 0 && (total - paid) > 0.01;
    if (partial && callerRole !== 'admin') {
      throw new Error('Cannot place: outstanding balance on this booking. Escalate to admin to place.');
    }
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

  /**
   * Rejoin: given a placement id, find any sibling placement on the same booking
   * that is adjacent (end-date-of-one touches start-date-of-the-other by ≤1 day)
   * and has matching accommodationType/roomType/board. Merge them into a single row.
   * The earlier row survives and its end_date is extended; the later row is deleted.
   */
  async function rejoinPlacement(bookingAccommodationId: number) {
    const placement = await prisma.bookingAccommodation.findUnique({
      where: { id: bookingAccommodationId },
    });
    if (!placement) throw new Error('Placement not found');

    // Find all siblings on the same booking with matching type/room/board
    const siblings = await prisma.bookingAccommodation.findMany({
      where: {
        bookingId: placement.bookingId,
        id: { not: placement.id },
        accommodationType: placement.accommodationType,
        roomType: placement.roomType,
        board: placement.board,
      },
      orderBy: { startDate: 'asc' },
    });

    // Find one that is adjacent (gap ≤ 1 day on either side)
    const DAY = 86400000;
    const thisStart = new Date(placement.startDate).getTime();
    const thisEnd = new Date(placement.endDate).getTime();

    const adjacent = siblings.find(s => {
      const sStart = new Date(s.startDate).getTime();
      const sEnd = new Date(s.endDate).getTime();
      // sibling ends just before this starts, or sibling starts just after this ends
      return (sEnd + DAY >= thisStart && sEnd < thisStart)
          || (sStart - DAY <= thisEnd && sStart > thisEnd)
          || (sStart === thisStart + DAY || sEnd === thisStart - DAY)
          || (sEnd + DAY === thisStart || sStart - DAY === thisEnd);
    });

    if (!adjacent) throw new Error('No adjacent placement to rejoin');

    // Determine earlier + later
    const earlier = new Date(placement.startDate) < new Date(adjacent.startDate) ? placement : adjacent;
    const later = earlier.id === placement.id ? adjacent : placement;

    const mergedStart = new Date(earlier.startDate);
    const mergedEnd = new Date(later.endDate);
    const mergedDays = Math.ceil((mergedEnd.getTime() - mergedStart.getTime()) / DAY) + 1;
    const mergedWeeks = Math.ceil(mergedDays / 7);

    // Extend the earlier row, delete the later one
    await prisma.$transaction([
      prisma.bookingAccommodation.update({
        where: { id: earlier.id },
        data: { endDate: mergedEnd, weeks: mergedWeeks },
      }),
      prisma.bookingAccommodation.delete({ where: { id: later.id } }),
    ]);

    return { kept: earlier.id, removed: later.id };
  }

  return {
    listProviders, getProviderById, createProvider, updateProvider, deleteProvider,
    addProperty, updateProperty, deleteProperty,
    addRoom, updateRoom, deleteRoom,
    addBed, deleteBed,
    getUnplacedStudents, getHostTimeline, placeStudent, unplaceStudent, splitPlacement, rejoinPlacement,
  };
}
