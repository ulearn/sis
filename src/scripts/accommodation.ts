import { PrismaClient } from '../generated/prisma/client';

// effectiveActive is now simply the `active` flag. The old activeFrom/activeTo
// "holiday window" was removed 2026-07-02 — we don't track host holidays; a host
// is either operational (on the nudge mailing list) or fully deactivated. Kept
// as a named alias so existing consumers (listProviders filter, admin badges)
// need no changes.
function withEffectiveActive<T extends { active: boolean } | null>(p: T): T extends null ? null : T & { effectiveActive: boolean } {
  if (!p) return p as any;
  return { ...p, effectiveActive: p.active === true } as any;
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
        { contactFirstName: { contains: query.search, mode: 'insensitive' } },
        { contactLastName: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
      ];
    }
    const rows = await prisma.accommodationProvider.findMany({
      where,
      include: {
        properties: {
          orderBy: { id: 'asc' },
          include: {
            rooms: {
              orderBy: { id: 'asc' },
              include: { beds: { orderBy: { id: 'asc' } } },
            },
          },
        },
        // Garda-vetting rollup for the Hosts-list status badge. status='signed'
        // = signed NVB form on file; 'submitted' = form entered, awaiting the
        // signed upload. (Full per-member list stays on the host detail view.)
        vettingSubmissions: { select: { status: true } },
      },
      orderBy: { name: 'asc' },
    });
    const PHASE_NUM: Record<string, number> = { none: 0, form: 1, upload: 2, complete: 3, returned: 3 };
    const enriched = rows.map(r => {
      const p: any = withEffectiveActive(r);
      const subs: any[] = (r as any).vettingSubmissions || [];
      const c = (st: string) => subs.filter(s => s.status === st).length;
      const submitted = c('submitted'), signed = c('signed'), returned = c('returned');
      const total = subs.length;
      // Auto phase = weakest link across members (compliance needs ALL done):
      // 0 None → 1 Form (entered) → 2 Upload (signed on file) → 3 Complete (vetting back).
      const autoPhase = total === 0 ? 0 : submitted > 0 ? 1 : signed > 0 ? 2 : 3;
      // Manual override (vettingStatus) wins — chiefly to mark pre-system hosts Complete.
      const manual = (r as any).vettingStatus || null;
      const phase = manual != null ? (PHASE_NUM[manual] ?? autoPhase) : autoPhase;
      p.vetting = { total, submitted, signed, returned, phase, autoPhase, manual };
      delete p.vettingSubmissions;
      return p;
    });
    if (activeFilter === undefined) return enriched;
    return enriched.filter(p => p.effectiveActive === activeFilter);
  }

  async function getProviderById(id: number) {
    const row = await prisma.accommodationProvider.findUnique({
      where: { id },
      include: {
        properties: {
          orderBy: { id: 'asc' },
          include: {
            rooms: {
              orderBy: { id: 'asc' },
              include: {
                beds: {
                  orderBy: { id: 'asc' },
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
    const result: any = withEffectiveActive(row);
    if (result) {
      // Attach the host-portal token (if one's been minted) so the provider
      // detail can show a clickable Portal link.
      const tok = await prisma.hostPortalToken.findUnique({ where: { providerId: id }, select: { token: true } });
      result.portalToken = tok?.token || null;

      // Account: the same bills + total earnings shown on the host's magic-link
      // portal, so staff see the host's payment history without leaving the SIS.
      // Newest first (id == H-number == creation order). Statuses come from the
      // last Xero sync (crons + portal loads) — not re-synced live here.
      result.bills = await prisma.hostPaymentLineItem.findMany({
        where: { providerId: id },
        select: {
          id: true, periodFrom: true, periodTo: true, amount: true, studentName: true,
          weeksPaid: true, daysPaid: true, xeroStatus: true, reason: true, amendmentNote: true,
        },
        orderBy: { id: 'desc' },
        take: 100,   // 5 shown + "View more" reveals the rest
      });
      const earned = await prisma.hostPaymentLineItem.aggregate({
        where: { providerId: id, xeroStatus: 'paid' },
        _sum: { amount: true },
      });
      result.totalEarnings = Number(earned._sum.amount || 0);
    }
    return result;
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
  // Coerce "YYYY-MM-DD" availability inputs to UTC-midnight Dates. @db.Date +
  // Dublin server TZ means a naive parse would drift a day in summer (BST), so
  // pin to UTC midnight. Empty → null (permanent / unset).
  function coerceRoomDates(data: Record<string, any>) {
    for (const k of ['availableFrom', 'availableTo']) {
      if (typeof data[k] === 'string' && data[k].trim()) data[k] = new Date(data[k] + 'T00:00:00Z');
    }
  }

  async function addRoom(propertyId: number, data: Record<string, any>) {
    if (data.capacity) data.capacity = parseInt(data.capacity);
    for (const k of Object.keys(data)) { if (data[k] === '') data[k] = null; }
    coerceRoomDates(data);
    const room = await prisma.accommodationRoom.create({ data: { propertyId, ...data } as any });
    // A room without a bed is unusable (invisible to matching — nothing to place
    // into), so every new room ships with its first bed. Names are auto-numbered
    // "Bed-N" — beds are just slots, never hand-named.
    await prisma.accommodationBed.create({ data: { roomId: room.id, name: 'Bed-1' } });
    return room;
  }

  async function updateRoom(id: number, data: Record<string, any>) {
    if (data.capacity) data.capacity = parseInt(data.capacity);
    for (const k of Object.keys(data)) { if (data[k] === '') data[k] = null; }
    coerceRoomDates(data);
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
  // Beds are just slots — never hand-named. Auto-number "Bed-N" off the highest
  // existing suffix in the room (max+1, so it survives mid-sequence deletions
  // without colliding). Any name passed in is ignored.
  async function addBed(roomId: number, _data?: Record<string, any>) {
    const beds = await prisma.accommodationBed.findMany({ where: { roomId }, select: { name: true } });
    let max = 0;
    for (const b of beds) {
      const m = /(\d+)\s*$/.exec(b.name || '');
      if (m) max = Math.max(max, parseInt(m[1], 10));
    }
    return prisma.accommodationBed.create({ data: { roomId, name: `Bed-${max + 1}` } });
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

  // Get all unplaced students (have accomm booking but no bed assigned).
  //
  // includeHoldIds: bookingAccommodation IDs the caller has explicitly opted
  // into the pool via the "Hold" search (zero-paid bookings). Those rows are
  // re-included on top of the normal filter and tagged paymentStatus:'hold'
  // so the chip renders red. Anything else with paid<=0 stays excluded.
  async function getUnplacedStudents(providerType?: string, includeHoldIds: number[] = []) {
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
      // Drop visa-pending students from the matching pool entirely — not
      // even visible. They reappear automatically once staff flips visa
      // status to Approved (which also triggers the +4-week shunt). This
      // is stricter than the payment-status filter below (which still lets
      // partial-paid surface in orange/locked) because the visa is a
      // hard yes/no, not a degree of payment.
      //
      // CANCELLED bookings excluded too: when a student cancels (or
      // no-shows logged as CANCELLED), they must not surface in matching
      // — otherwise staff might book a host family for a guest who's
      // never coming. Staff are expected to also flip bookingAccommodation.active
      // to false on cancel, but this query-level filter is the safety net.
      booking: {
        status: { not: 'CANCELLED' },
        student: { is: { OR: [
          { visaStatus: null },
          { visaStatus: { notIn: ['Pending', 'Appeal'] } },
        ]}},
      },
    };
    if (providerType === 'Host Family') {
      where.accommodationType = 'Host Family';
    } else if (providerType === 'Apartment') {
      where.accommodationType = { not: 'Host Family' }; // City Centre Apartment, Apartment, etc.
    }
    const rows = await prisma.bookingAccommodation.findMany({
      where,
      include: {
        // Host-portal Expression of Interest — surfaced (gold chip) on the
        // student panel so Kelly sees who wants them. Claimed students STAY in
        // the matching pool (unlike the portal, which hides them) so Kelly can
        // confirm/release.
        claimedByProvider: { select: { id: true, name: true } },
        booking: {
          include: {
            student: {
              select: {
                id: true, firstName: true, lastName: true,
                gender: true, nationality: true, birthday: true,
                allergies: true, diet: true,
                studentType: true, profilePicture: true,
                visaStatus: true,
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
    const holdSet = new Set(includeHoldIds || []);
    return rows
      .map(r => {
        const paid  = Number((r as any).booking?.amountPaid  || 0);
        const total = Number((r as any).booking?.amountTotal || 0);
        const bookingStatus = (r as any).booking?.status;
        const studentVisa = (r as any).booking?.student?.visaStatus;
        const visaPending = studentVisa === 'Pending' || studentVisa === 'Appeal';
        let paymentStatus: 'paid' | 'partial' | 'unpaid' | 'hold' = 'unpaid';
        let paymentBalance = 0;
        // ESCROW or visa-pending overrides everything — money's in TM (not
        // BoI) and/or the visa hasn't cleared, so the student is functionally
        // unpaid regardless of what Fidelo claims. Treat as hold so the
        // matching engine doesn't auto-place them.
        if (bookingStatus === 'ESCROW' || visaPending) {
          paymentStatus = 'hold';
          paymentBalance = total > 0 ? total : 0;
        } else if (paid > 0) {
          if (total > 0 && (total - paid) > EPS) {
            paymentStatus = 'partial';
            paymentBalance = total - paid;
          } else {
            paymentStatus = 'paid';
          }
        } else if (holdSet.has(r.id)) {
          // Caller has explicitly surfaced this zero-paid booking via the
          // Hold search. Tag for red rendering; placement endpoint will
          // stamp the audit columns when actually placed.
          paymentStatus = 'hold';
          paymentBalance = total > 0 ? total : 0;
        }
        return { ...r, paymentStatus, paymentBalance };
      })
      .filter(r => (r as any).paymentStatus !== 'unpaid');
  }

  // Search zero-paid bookings (active, unplaced, end-date in future) so a
  // sales/admin user can drag a not-yet-paid student into the matching pool
  // for a 48-hour pre-payment hold. Returns up to 20 rows ranked by
  // first-name match. Wraps both sides in Postgres unaccent() so accent
  // variants match (e.g. "Jose" → "José").
  async function searchHoldCandidates(q: string) {
    const trimmed = (q || '').trim();
    if (trimmed.length < 2) return [];
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const rows = await prisma.bookingAccommodation.findMany({
      where: {
        active: true,
        bedId: null,
        endDate: { gte: today },
        booking: {
          // Treat ESCROW the same as "no payment yet" — visa-pending students
          // technically haven't paid us (money's in TM escrow, not BoI), so
          // their accommodation should be in the 48h hold queue, not auto-assigned.
          // Also include any booking whose student's visa is still in process,
          // even if the booking status hasn't been flipped to ESCROW.
          OR: [
            { amountPaid: null },
            { amountPaid: { lte: 0 } },
            { status: 'ESCROW' },
            { student: { is: { visaStatus: { in: ['Pending', 'Appeal'] } } } },
          ],
          student: {
            OR: [
              { firstName: { contains: trimmed, mode: 'insensitive' } },
              { lastName:  { contains: trimmed, mode: 'insensitive' } },
            ],
          },
        },
      },
      include: {
        booking: {
          include: {
            student: {
              select: {
                id: true, firstName: true, lastName: true,
                gender: true, nationality: true,
              }
            }
          }
        }
      },
      orderBy: { startDate: 'asc' },
      take: 20,
    });
    return rows.map(r => ({
      id: r.id,
      bookingId: r.bookingId,
      accommodationType: r.accommodationType,
      startDate: r.startDate,
      endDate: r.endDate,
      student: (r as any).booking?.student || null,
    }));
  }

  // Get host timeline data: hosts with rooms, beds, and current placements in a date range
  async function getHostTimeline(from: string, to: string, providerType?: string) {
    const fromDate = new Date(from);
    const toDate = new Date(to);
    // UTC midnight "today" for comparing against @db.Date availability windows.
    const now = new Date();
    const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

    const typeFilter = providerType || 'Host Family';
    const hosts = await prisma.accommodationProvider.findMany({
      where: { active: true, type: typeFilter },
      include: {
        properties: {
          orderBy: { id: 'asc' },
          include: {
            rooms: {
              // Short-term-let rooms vanish from matching once their window has
              // fully elapsed (availableTo before today). Permanent rooms (both
              // dates null, e.g. Capel) and rooms still within/ahead of their
              // window stay. availableFrom is NOT filtered — a future-dated room
              // must stay visible so staff can pre-place its incoming guest.
              where: { OR: [{ availableTo: null }, { availableTo: { gte: today } }] },
              // Insertion order = creation order = natural "Room 1, Room 2, Room 3"
              // sequence (numeric, no double-digit-sort surprises). Without this
              // Postgres returns rows in heap order which on Capel St rendered
              // rooms reversed inside each apartment.
              orderBy: { id: 'asc' },
              include: {
                beds: {
                  orderBy: { id: 'asc' },
                  include: {
                    placements: {
                      where: {
                        active: true,
                        startDate: { lte: toDate },
                        endDate: { gte: fromDate },
                        // Hide CANCELLED-booking placements from the
                        // forward-looking host calendar — staff must not
                        // see a no-show / cancelled student displayed as
                        // an upcoming guest on a host's bed. Safety net
                        // for cases where staff cancelled the booking but
                        // forgot to also deactivate the placement row.
                        booking: { status: { not: 'CANCELLED' } },
                      },
                      include: {
                        booking: {
                          select: {
                            id: true,
                            // amountPaid + amountTotal let the timeline render
                            // an orange frame around placed bars whose balance
                            // is still outstanding (gender colour stays visible
                            // inside the frame).
                            amountPaid: true,
                            amountTotal: true,
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

  // Place a student: assign a bed to a booking accommodation. Zero-payment
  // bookings stay blocked (those don't even surface in the matching pool);
  // partial-payment bookings are allowed in — they keep an orange frame around
  // the placed bar so accommodation/finance can spot them, and the Wed-6am
  // T-3 cron will Slack-notify + auto-bounce any still-unpaid the week of
  // arrival (see scripts/cron-accomm-balance-warn.ts).
  async function placeStudent(
    bookingAccommodationId: number,
    bedId: number,
    callerRole?: string,
    asHold?: boolean,
    callerUser?: string | null,
  ) {
    const ba = await prisma.bookingAccommodation.findUnique({
      where: { id: bookingAccommodationId },
      include: { booking: { select: { amountPaid: true } } },
    });
    if (!ba) throw new Error('Booking accommodation not found');

    // Short-let availability guard. We rent these rooms only for the exact dates
    // of the booking they were taken for (we're the middleman — the room isn't
    // ours before/after). So a stay must fall ENTIRELY within the room's window;
    // no one can be placed into the greyed post-checkout dates. Null window =
    // permanent room (Capel) → no constraint.
    const bedRow = await prisma.accommodationBed.findUnique({
      where: { id: bedId },
      select: { room: { select: { name: true, availableFrom: true, availableTo: true } } },
    });
    const room = bedRow?.room;
    if (room && (room.availableFrom || room.availableTo)) {
      const ds = (d: any) => (d ? new Date(d).toISOString().slice(0, 10) : null);
      const from = ds(room.availableFrom), to = ds(room.availableTo);
      const s = ds((ba as any).startDate), e = ds((ba as any).endDate);
      if ((from && s && s < from) || (to && e && e > to)) {
        throw new Error(
          `Cannot place: room "${room.name}" is only available ${from || '…'} → ${to || '…'}, but this stay runs ${s || '?'} → ${e || '?'}. Extend the room's availability or choose another room.`
        );
      }
    }

    // One bed = one occupant at a time. A bed can host many guests SEQUENTIALLY
    // (Marina out on the 5th, next guest in on/after the 5th), but never two whose
    // stays overlap. Boundaries are exclusive so a same-day turnover (checkout ==
    // next check-in) is allowed. Twin/shared rooms hold multiple guests via
    // multiple *beds*, not by stacking two on one bed.
    {
      const ds = (d: any) => (d ? new Date(d).toISOString().slice(0, 10) : null);
      const inS = ds((ba as any).startDate), inE = ds((ba as any).endDate);
      if (inS && inE) {
        const others = await prisma.bookingAccommodation.findMany({
          where: { bedId, active: true, id: { not: bookingAccommodationId }, booking: { status: { not: 'CANCELLED' } } },
          select: { startDate: true, endDate: true, booking: { select: { student: { select: { firstName: true, lastName: true } } } } },
        });
        for (const o of others) {
          const oS = ds(o.startDate), oE = ds(o.endDate);
          if (oS && oE && oS < inE && oE > inS) {
            const nm = o.booking?.student ? `${o.booking.student.firstName} ${o.booking.student.lastName}`.trim() : 'another student';
            throw new Error(
              `Cannot place: this bed is already occupied by ${nm} (${oS} → ${oE}), which overlaps this stay (${inS} → ${inE}). One bed can't hold two guests at once — use another bed in the room, or adjust the dates.`
            );
          }
        }
      }
    }

    const paid = Number(ba.booking?.amountPaid || 0);

    // Default rule: must have paid > 0. Override is the 48-hour hold path:
    // sales/admin/accomm can place a zero-paid student, in which case we
    // stamp the audit columns. Outside that override the existing block
    // stays — no other role/path lets a zero-paid student into a bed.
    if (paid <= 0) {
      const allowed = asHold === true && (callerRole === 'sales' || callerRole === 'admin' || callerRole === 'accomm');
      if (!allowed) {
        throw new Error('Cannot place: no payment has been received on this booking.');
      }
    }

    const data: any = { bedId };
    if (asHold === true && paid <= 0) {
      data.holdPlacedAt = new Date();
      data.holdPlacedBy = callerUser || callerRole || 'unknown';
    }
    // Placing resolves a pending host-portal EOI — assigning a bed IS the
    // confirmation. (The placement stands whether or not the bed belongs to
    // the host who expressed interest; the claim is simply resolved.)
    if ((ba as any).claimStatus === 'pending') data.claimStatus = 'confirmed';
    const result = await prisma.bookingAccommodation.update({
      where: { id: bookingAccommodationId },
      data,
    });
    // First Dibs is satisfied the instant a student is placed with this host — their
    // demand is met, so clear it (revert to auto category) and they drop back into the
    // normal queue. Prevents a served host holding the front of the queue.
    const bedProv = await prisma.accommodationBed.findUnique({
      where: { id: bedId },
      select: { room: { select: { property: { select: { providerId: true } } } } },
    });
    const provId = bedProv?.room?.property?.providerId;
    if (provId) {
      // Clear ONLY the First Dibs flag + strikes — activity level (SuperHost/…) untouched.
      await prisma.accommodationProvider.updateMany({
        where: { id: provId, firstDibsAt: { not: null } },
        data: { firstDibsAt: null, firstDibsStrikes: 0 },
      });
    }
    return result;
  }

  // Release a host-portal Expression of Interest — clears the provisional claim
  // so the student returns to the matching pool (and every host's portal).
  async function releaseClaim(bookingAccommodationId: number) {
    return prisma.bookingAccommodation.update({
      where: { id: bookingAccommodationId },
      data: { claimedByProviderId: null, claimedAt: null, claimStatus: 'released', claimedVia: null },
    });
  }

  // Pending host-portal claims awaiting Kelly (for the notifications count).
  async function pendingClaims() {
    return prisma.bookingAccommodation.findMany({
      where: { claimStatus: 'pending', bedId: null, active: true },
      select: {
        id: true, claimedAt: true, startDate: true, endDate: true,
        claimedByProvider: { select: { id: true, name: true } },
        booking: { select: { student: { select: { id: true, firstName: true, lastName: true } } } },
      },
      orderBy: { claimedAt: 'desc' },
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

    // Half-open hotel convention (matches host-payments.ts:189 + matching-grid
    // turnover-day rendering): the split date is the SHARED checkout/checkin
    // day. Original placement ends on splitDate (student leaves that morning),
    // new placement starts on splitDate (student checks in that afternoon).
    // Nights stayed = endDate - startDate (no +1, no -1).
    //
    // Previously this subtracted a day from splitDate for the original's
    // endDate, causing the checkout to render one day early on the matching
    // grid — reported by accomm 2026-05-22.
    const origDays = Math.round((split.getTime() - origStart.getTime()) / 86400000);
    const origWeeks = Math.ceil(origDays / 7);

    await prisma.bookingAccommodation.update({
      where: { id: bookingAccommodationId },
      data: {
        endDate: split,
        weeks: origWeeks,
      },
    });

    // Create new placement: starts on split date, ends on original end, same bed
    const newDays = Math.round((origEnd.getTime() - split.getTime()) / 86400000);
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

  // ── Cleaning ──────────────────────────────────
  // Apartment-only workflow. Each upcoming checkout on a cleaning-enabled
  // provider becomes a row Kelly (or eventually the cleaner via sheet) marks
  // done. Default checkout = endDate at 12:00 server time; default next
  // check-in = startDate at 14:00 (matches the matching grid's half-day
  // assumption). cleanCheckoutAt overrides per-placement when set.
  function noonOf(d: Date) { const x = new Date(d); x.setHours(12, 0, 0, 0); return x; }
  function twoOf(d: Date)  { const x = new Date(d); x.setHours(14, 0, 0, 0); return x; }

  // Some legacy rows have room.name pre-fixed with the property name, e.g.
  // property "A2" + room "A2 / Room 4". Strip that so the joined label
  // doesn't double-print "A2 / A2 / Room 4".
  function joinPropRoomBed(propName: string, roomName: string, bedName: string) {
    let r = roomName || '';
    if (propName && r.toLowerCase().startsWith(propName.toLowerCase() + ' / ')) {
      r = r.slice(propName.length + 3);
    }
    return [propName, r, bedName].filter(Boolean).join(' / ');
  }

  async function getCleaningQueue(providerId: number) {
    const provider = await prisma.accommodationProvider.findUnique({
      where: { id: providerId },
      select: { id: true, name: true, cleaningEnabled: true },
    });
    if (!provider) throw new Error('Provider not found');
    if (!provider.cleaningEnabled) return { provider, items: [] };

    // Window: previous week's Monday → +4 weeks from today.
    //
    // Last weekend's checkouts (Sat/Sun before this Monday) must stay
    // visible so Kelly can verify those cleans got done on a fresh
    // Monday-morning glance. Rolling the start back to LAST week's
    // Monday keeps the previous Mon–Sun band on screen until the
    // following Monday rolls over again.
    //
    // Forward horizon stays at 4 weeks so we naturally cover ~4 turnovers
    // per bed without the list growing unbounded.
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const thisMonday = new Date(today);
    thisMonday.setDate(thisMonday.getDate() + (thisMonday.getDay() === 0 ? -6 : 1 - thisMonday.getDay()));
    thisMonday.setHours(0, 0, 0, 0);
    const monday = new Date(thisMonday); monday.setDate(monday.getDate() - 7);
    const horizon = new Date(today.getTime() + 28 * 86400000);

    const placements = await prisma.bookingAccommodation.findMany({
      where: {
        bedId: { not: null },
        endDate: { gte: monday, lte: horizon },
        cleanCancelledAt: null,
        bed: { is: { room: { is: { property: { is: { providerId } } } } } },
      },
      include: {
        booking: { include: { student: { select: { firstName: true, lastName: true } } } },
        bed: { include: { room: { include: { property: true } } } },
      },
      orderBy: { endDate: 'asc' },
    });

    const items = [] as any[];
    for (const p of placements) {
      const checkoutAt = p.cleanCheckoutAt ?? noonOf(p.endDate);
      const next = await prisma.bookingAccommodation.findFirst({
        where: { bedId: p.bedId, startDate: { gte: p.endDate }, id: { not: p.id } },
        orderBy: { startDate: 'asc' },
        include: { booking: { include: { student: { select: { firstName: true, lastName: true } } } } },
      });
      const nextCheckinAt = next ? twoOf(next.startDate) : null;
      const urgencyHours = nextCheckinAt
        ? Math.round((nextCheckinAt.getTime() - checkoutAt.getTime()) / 36e5)
        : null;
      const propName = p.bed?.room.property.name || '';
      const roomName = p.bed?.room.name || '';
      const bedName = p.bed?.name || '';
      const apartmentRoom = joinPropRoomBed(propName, roomName, bedName);
      const student = p.booking?.student ? `${p.booking.student.firstName} ${p.booking.student.lastName}` : null;
      const nextStudent = next?.booking?.student ? `${next.booking.student.firstName} ${next.booking.student.lastName}` : null;
      items.push({
        id: p.id,
        apartmentRoom,
        student,
        checkoutAt: checkoutAt.toISOString(),
        checkoutOverride: !!p.cleanCheckoutAt,
        nextCheckinAt: nextCheckinAt?.toISOString() ?? null,
        nextStudent,
        urgencyHours,
        cleanedAt: p.cleanedAt?.toISOString() ?? null,
        cleanedBy: p.cleanedBy ?? null,
      });
    }

    return { provider, items };
  }

  // Single-placement cleaning detail — used by the matching-grid overlay
  // when Kelly clicks a yellow checkout pill.
  async function getCleaningDetail(placementId: number) {
    const p = await prisma.bookingAccommodation.findUnique({
      where: { id: placementId },
      include: {
        booking: { include: { student: { select: { id: true, firstName: true, lastName: true } } } },
        bed: { include: { room: { include: { property: { include: { provider: { select: { id: true, name: true, cleaningEnabled: true } } } } } } } },
      },
    });
    if (!p) throw new Error('Placement not found');

    const checkoutAt = p.cleanCheckoutAt ?? noonOf(p.endDate);
    const next = await prisma.bookingAccommodation.findFirst({
      where: { bedId: p.bedId, startDate: { gte: p.endDate }, id: { not: p.id } },
      orderBy: { startDate: 'asc' },
      include: { booking: { include: { student: { select: { id: true, firstName: true, lastName: true } } } } },
    });
    const nextCheckinAt = next ? twoOf(next.startDate) : null;
    const urgencyHours = nextCheckinAt
      ? Math.round((nextCheckinAt.getTime() - checkoutAt.getTime()) / 36e5)
      : null;

    return {
      id: p.id,
      bookingId: p.bookingId,
      provider: p.bed?.room.property.provider ?? null,
      apartmentRoom: joinPropRoomBed(p.bed?.room.property.name || '', p.bed?.room.name || '', p.bed?.name || ''),
      student: p.booking?.student
        ? { id: p.booking.student.id, name: `${p.booking.student.firstName} ${p.booking.student.lastName}` }
        : null,
      startDate: p.startDate.toISOString(),
      endDate: p.endDate.toISOString(),
      checkoutAt: checkoutAt.toISOString(),
      checkoutOverride: !!p.cleanCheckoutAt,
      nextCheckinAt: nextCheckinAt?.toISOString() ?? null,
      nextStudent: next?.booking?.student
        ? { id: next.booking.student.id, name: `${next.booking.student.firstName} ${next.booking.student.lastName}` }
        : null,
      urgencyHours,
      cleanedAt: p.cleanedAt?.toISOString() ?? null,
      cleanedBy: p.cleanedBy ?? null,
    };
  }

  async function setCleanCheckoutAt(placementId: number, iso: string | null) {
    return prisma.bookingAccommodation.update({
      where: { id: placementId },
      data: { cleanCheckoutAt: iso ? new Date(iso) : null },
    });
  }

  async function markCleaned(placementId: number, by: string | null) {
    return prisma.bookingAccommodation.update({
      where: { id: placementId },
      data: { cleanedAt: new Date(), cleanedBy: by || null },
    });
  }

  async function unmarkCleaned(placementId: number) {
    return prisma.bookingAccommodation.update({
      where: { id: placementId },
      data: { cleanedAt: null, cleanedBy: null },
    });
  }

  // Cancel the cleaning JOB — the placement still exists, the room may
  // still need cleaning by someone else, but this row is removed from
  // Kelly's queue. Caller must surface a confirm dialog upstream because
  // this is functionally a soft-delete of the queue row.
  async function cancelClean(placementId: number, by: string | null) {
    return prisma.bookingAccommodation.update({
      where: { id: placementId },
      data: { cleanCancelledAt: new Date(), cleanCancelledBy: by || null },
    });
  }

  return {
    listProviders, getProviderById, createProvider, updateProvider, deleteProvider,
    addProperty, updateProperty, deleteProperty,
    addRoom, updateRoom, deleteRoom,
    addBed, deleteBed,
    getUnplacedStudents, searchHoldCandidates, getHostTimeline,
    placeStudent, unplaceStudent, splitPlacement, rejoinPlacement, releaseClaim, pendingClaims,
    getCleaningQueue, getCleaningDetail, setCleanCheckoutAt, markCleaned, unmarkCleaned, cancelClean,
  };
}
