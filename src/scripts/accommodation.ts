import { PrismaClient } from '../generated/prisma/client';
import { gvComplete, isJuniorAt } from '../lib/junior-gate';

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
        siteVisitPhotos: {
          orderBy: { id: 'desc' },
          select: { id: true, originalName: true, mimeType: true, size: true, createdAt: true },
        },
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
          dietType: true, dietAmount: true,
        },
        orderBy: { id: 'desc' },
        take: 100,   // 5 shown + "View more" reveals the rest
      });
      const earned = await prisma.hostPaymentLineItem.aggregate({
        where: { providerId: id, xeroStatus: 'paid' },
        _sum: { amount: true, dietAmount: true },
      });
      result.totalEarnings = Number(earned._sum.amount || 0) + Number(earned._sum.dietAmount || 0);
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
    if (data.weeklyRate != null && data.weeklyRate !== '') data.weeklyRate = parseFloat(data.weeklyRate);
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
    if (data.weeklyRate != null && data.weeklyRate !== '') data.weeklyRate = parseFloat(data.weeklyRate);
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
      include: { booking: { select: { amountPaid: true, studentId: true, student: { select: { birthday: true } } } } },
    });
    if (!ba) throw new Error('Booking accommodation not found');

    // Junior safeguarding gate (Neil 2026-10-10): a student under 18 on arrival can
    // only go to a Host Family whose Garda vetting is complete. Adult-only hosting
    // needs no vetting. Fix a wrong block by marking the host's vetting Complete.
    {
      const hostRow = await prisma.accommodationBed.findUnique({
        where: { id: bedId },
        select: { room: { select: { property: { select: { provider: { select: {
          name: true, type: true, vettingStatus: true, vettingSubmissions: { select: { status: true } },
        } } } } } } },
      });
      const prov: any = hostRow?.room?.property?.provider;
      if (prov?.type === 'Host Family' && !gvComplete(prov.vettingStatus, prov.vettingSubmissions)
          && isJuniorAt((ba as any).booking?.student?.birthday, (ba as any).startDate)) {
        throw new Error(`Cannot place: this student is under 18 on arrival and ${prov.name || 'this host'} does not have completed Garda vetting. Place with a vetted host, or mark this host's vetting Complete first.`);
      }
    }

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
      select: { room: { select: { property: { select: { providerId: true, provider: { select: { type: true } } } } } } },
    });
    const provId = bedProv?.room?.property?.providerId;
    if (provId) {
      // Clear ONLY the First Dibs flag + strikes — activity level (SuperHost/…) untouched.
      await prisma.accommodationProvider.updateMany({
        where: { id: provId, firstDibsAt: { not: null } },
        data: { firstDibsAt: null, firstDibsStrikes: 0 },
      });
    }
    // Signal the caller whether this placement is into a Host Family (→ the UI
    // surfaces the host booking-confirmation email). studentId/bookingId let it
    // render that email without a second lookup.
    const isHostFamily = bedProv?.room?.property?.provider?.type === 'Host Family';
    return Object.assign({}, result, {
      isHostFamily,
      studentId: (ba as any).booking?.studentId ?? null,
      bookingId: (result as any).bookingId ?? null,
    });
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
    const ba = await prisma.bookingAccommodation.findUnique({
      where: { id: bookingAccommodationId },
      select: { claimStatus: true, claimedByProviderId: true },
    });
    const data: any = { bedId: null };
    // Unplacing is the inverse of placing. placeStudent flips a host's pending
    // offer → 'confirmed' when the student is placed; returning the student to
    // the pool must therefore restore that offer to 'pending' (not silently drop
    // it). Only Release (releaseClaim) ever clears a host's offer. (Neil, 2026-10-10)
    if (ba?.claimStatus === 'confirmed' && ba.claimedByProviderId) data.claimStatus = 'pending';
    return prisma.bookingAccommodation.update({
      where: { id: bookingAccommodationId },
      data,
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
      // sibling ends just before/on this start, or sibling starts just after/on this end.
      // Uses <= / >= (not < / >) so segments that SHARE a boundary date — one checks
      // out the same day the next checks in (e.g. 27 Sep / 27 Sep) — count as adjacent
      // and rejoin. Strict < / > wrongly refused same-day-boundary rejoins (issue #59).
      return (sEnd + DAY >= thisStart && sEnd <= thisStart)
          || (sStart - DAY <= thisEnd && sStart >= thisEnd)
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

  // Room types that turn over PER BED rather than per room. Only genuinely
  // shared rooms (multiple unrelated guests, independent check-in/out) belong
  // here — e.g. Capel St A1/Room 4 (`Twin/Shared`). Every other type (couple
  // doubles, singles) is one clean per room. Keyed off the existing
  // room_type so no schema change is needed (Neil, Option B, 2026-08-26).
  const PER_BED_ROOM_TYPES = new Set(['Twin/Shared']);

  // Resolve a placement to every bed-placement that shares its clean job.
  // For a per-room clean that's all beds in the same room checking out the
  // same day; for a shared (per-bed) room it's just the placement itself.
  // Used so mark/unmark/cancel/checkout-at cascade to the whole room without
  // the caller ever needing to know the grouping rule.
  async function roomMateIds(placementId: number): Promise<number[]> {
    const p = await prisma.bookingAccommodation.findUnique({
      where: { id: placementId },
      include: { bed: { include: { room: { select: { id: true, roomType: true } } } } },
    });
    if (!p || !p.bed?.room) return [placementId];
    if (PER_BED_ROOM_TYPES.has(p.bed.room.roomType || '')) return [placementId];
    const mates = await prisma.bookingAccommodation.findMany({
      where: {
        endDate: p.endDate,
        cleanCancelledAt: null,
        bed: { is: { roomId: p.bed.room.id } },
      },
      select: { id: true },
    });
    const ids = mates.map((m) => m.id);
    return ids.includes(placementId) ? ids : [...ids, placementId];
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
    // endDate is @db.Date (date-only). Prisma extracts the DATE from a JS Date
    // in UTC, and Dublin runs AHEAD of UTC — so a local-midnight boundary lands
    // at 23:00 UTC the PREVIOUS day and its extracted date is a day early,
    // pulling the prior Sunday's checkouts into the window (the week-of-10th
    // rows Kelly still saw). Build the boundaries as UTC-midnight of the intended
    // local date so the @db.Date comparison is exact.
    const t = new Date();
    const dow = t.getDay(); // local day-of-week: 0=Sun..6=Sat
    // This week's Monday, then roll back 7 days, as UTC-midnight dates.
    const thisMonday = new Date(Date.UTC(t.getFullYear(), t.getMonth(), t.getDate() + (dow === 0 ? -6 : 1 - dow)));
    const monday = new Date(thisMonday); monday.setUTCDate(monday.getUTCDate() - 7);
    const horizon = new Date(Date.UTC(t.getFullYear(), t.getMonth(), t.getDate() + 28));

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

    // Enrich each bed-placement, then group.
    //
    // Option B (Neil, 2026-08-26): the queue counts one clean PER ROOM, not
    // per bed — a couple checking out of a 2-bed room on the same day is a
    // SINGLE clean, not two. The sole exception is a genuinely shared room
    // (`room_type = 'Twin/Shared'`, e.g. Capel St A1/Room 4), where each bed
    // turns over independently and must stay per-bed. See PER_BED_ROOM_TYPES.
    const recs = [] as any[];
    for (const p of placements) {
      const checkoutAt = p.cleanCheckoutAt ?? noonOf(p.endDate);
      const next = await prisma.bookingAccommodation.findFirst({
        where: { bedId: p.bedId, startDate: { gte: p.endDate }, id: { not: p.id } },
        orderBy: { startDate: 'asc' },
        include: { booking: { include: { student: { select: { firstName: true, lastName: true } } } } },
      });
      const nextCheckinAt = next ? twoOf(next.startDate) : null;
      recs.push({
        p,
        roomId: p.bed?.room.id ?? null,
        roomType: p.bed?.room.roomType || '',
        propName: p.bed?.room.property.name || '',
        roomName: p.bed?.room.name || '',
        bedName: p.bed?.name || '',
        checkoutAt,
        nextCheckinAt,
        student: p.booking?.student ? `${p.booking.student.firstName} ${p.booking.student.lastName}` : null,
        nextStudent: next?.booking?.student ? `${next.booking.student.firstName} ${next.booking.student.lastName}` : null,
      });
    }

    // Group non-shared rooms by roomId + checkout date; shared rooms stay solo.
    const groups = new Map<string, any[]>();
    for (const r of recs) {
      const dayKey = r.checkoutAt.toISOString().slice(0, 10);
      const key = (PER_BED_ROOM_TYPES.has(r.roomType) || r.roomId == null)
        ? `bed:${r.p.id}`
        : `room:${r.roomId}:${dayKey}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(r);
    }

    const items = [] as any[];
    for (const g of groups.values()) {
      const primary = g[0];
      const ids = g.map((r) => r.p.id);
      const checkoutAt = primary.checkoutAt; // same room+day → identical
      // Most-urgent next check-in across the beds in this room.
      const nextCheckins = g.map((r) => r.nextCheckinAt).filter(Boolean) as Date[];
      const nextCheckinAt = nextCheckins.length
        ? new Date(Math.min(...nextCheckins.map((d) => d.getTime())))
        : null;
      const urgencyHours = nextCheckinAt
        ? Math.round((nextCheckinAt.getTime() - checkoutAt.getTime()) / 36e5)
        : null;
      // One row per room: drop the bed suffix unless it's a per-bed shared room.
      const perBed = g.length === 1 && (PER_BED_ROOM_TYPES.has(primary.roomType) || primary.roomId == null);
      const apartmentRoom = perBed
        ? joinPropRoomBed(primary.propName, primary.roomName, primary.bedName)
        : joinPropRoomBed(primary.propName, primary.roomName, '');
      const uniq = (xs: (string | null)[]) => Array.from(new Set(xs.filter(Boolean))) as string[];
      const students = uniq(g.map((r) => r.student));
      const nextStudents = uniq(g.map((r) => r.nextStudent));
      // A REGULAR room (strangers can't share it — single or double bed, any
      // occupancy) is ONE clean per turnover: one room, one set of sheets. So it
      // reads as cleaned once ANY of its placements is marked — marking one
      // cascades to the rest via roomMateIds, and a legacy half-marked pair (one
      // bed marked before the cascade existed) still counts as the single clean
      // it was. Only Twin/Shared (A1/R4) — where strangers sleep together — is
      // per-bed (single-member groups here), so each bed turns over on its own.
      const cleanedAtVals = g.map((r) => r.p.cleanedAt).filter(Boolean) as Date[];
      const cleanedAt = cleanedAtVals.length
        ? new Date(Math.max(...cleanedAtVals.map((d) => d.getTime())))
        : null;
      const cleanedBy = g.find((r) => r.p.cleanedBy)?.p.cleanedBy ?? null;
      // Billed state for the room = the latest billed stamp across its beds (any
      // bed billed ⇒ the turnover was billed). Drives the "bill once, ever" guard.
      const billedAtVals = g.map((r) => (r.p as any).cleanBilledAt).filter(Boolean) as Date[];
      const billedAt = billedAtVals.length
        ? new Date(Math.max(...billedAtVals.map((d) => d.getTime())))
        : null;
      items.push({
        id: primary.p.id,
        ids,
        apartmentRoom,
        student: students.join(', ') || null,
        checkoutAt: checkoutAt.toISOString(),
        checkoutOverride: g.some((r) => !!r.p.cleanCheckoutAt),
        nextCheckinAt: nextCheckinAt?.toISOString() ?? null,
        nextStudent: nextStudents.join(', ') || null,
        urgencyHours,
        cleanedAt: cleanedAt?.toISOString() ?? null,
        cleanedBy,
        billedAt: billedAt?.toISOString() ?? null,
      });
    }
    // Preserve endDate-ascending order (groups built from an ordered scan).
    items.sort((a, b) => a.checkoutAt.localeCompare(b.checkoutAt));

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
    const ids = await roomMateIds(placementId);
    return prisma.bookingAccommodation.updateMany({
      where: { id: { in: ids } },
      data: { cleanCheckoutAt: iso ? new Date(iso) : null },
    });
  }

  async function markCleaned(placementId: number, by: string | null) {
    const ids = await roomMateIds(placementId);
    return prisma.bookingAccommodation.updateMany({
      where: { id: { in: ids } },
      data: { cleanedAt: new Date(), cleanedBy: by || null },
    });
  }

  async function unmarkCleaned(placementId: number) {
    const ids = await roomMateIds(placementId);
    return prisma.bookingAccommodation.updateMany({
      where: { id: { in: ids } },
      data: { cleanedAt: null, cleanedBy: null },
    });
  }

  // Cancel the cleaning JOB — the placement still exists, the room may
  // still need cleaning by someone else, but this row is removed from
  // Kelly's queue. Caller must surface a confirm dialog upstream because
  // this is functionally a soft-delete of the queue row.
  async function cancelClean(placementId: number, by: string | null) {
    const ids = await roomMateIds(placementId);
    return prisma.bookingAccommodation.updateMany({
      where: { id: { in: ids } },
      data: { cleanCancelledAt: new Date(), cleanCancelledBy: by || null },
    });
  }

  // ── Soft availability check (Capel Street) ──────────────────────────────
  // Deterministic "do we have a room of type X free for [from,to]?" used by the
  // matching-screen overlay AND by the inbox AI agents (which hit
  // GET /sis/api/accommodation/availability with the SIS_SERVICE_KEY bearer —
  // app.ts requireAuth already scopes that key to /sis/api/*). Read-only.
  //
  // SOFT cap: beyond our own stock we can source host families / other providers,
  // so a miss returns alternatives + "check external providers", never a hard no.
  //
  // A bed is FREE for the window ⟺ no active, non-cancelled placement overlaps it,
  // using STRICT overlap (start < to && end > from) so a same-day checkout/checkin
  // turnover is not a false conflict — matches placeStudent() and the grid.
  //
  // Gender: multi-bed rooms (Premium = 2 beds, Twin/Shared = 3) can only hold
  // same-gender guests. A free bed in a room that already holds an overlapping
  // guest is offered only to that guest's gender; an unknown requester gender or
  // any shared room on the table raises a "check gender" reminder.
  const SOFT_AVAILABILITY_PROVIDER_IDS = [15]; // Capel Street (#15). Extend as more owned/leased stock opts in.

  function _normRoomType(input?: string | null): string | null {
    const s = String(input || '').trim().toLowerCase();
    if (!s) return null;
    if (/prem/.test(s)) return 'Premium';
    if (/super/.test(s)) return 'Superior';
    if (/stand/.test(s)) return 'Standard';
    if (/twin|shared|share/.test(s)) return 'Twin/Shared';
    if (/indiv/.test(s)) return 'Individual';
    if (/single/.test(s)) return 'Single';
    return String(input).trim(); // unknown label → pass through verbatim
  }

  async function accommodationAvailability(opts: {
    from: string; to: string;
    roomType?: string | null; enSuite?: boolean | null;
    gender?: number | null;            // 1 = male, 2 = female, null/undefined = unknown
    providerIds?: number[];
  }) {
    const from = new Date(String(opts.from).slice(0, 10) + 'T00:00:00.000Z');
    const to   = new Date(String(opts.to).slice(0, 10) + 'T00:00:00.000Z');
    if (isNaN(+from) || isNaN(+to) || +to <= +from) {
      throw new Error('Invalid date range — need from < to (YYYY-MM-DD).');
    }
    const wantType = _normRoomType(opts.roomType);
    const wantEnsuite = opts.enSuite === true;
    const g = (opts.gender === 1 || opts.gender === 2) ? opts.gender : null;
    const providerIds = opts.providerIds?.length ? opts.providerIds : SOFT_AVAILABILITY_PROVIDER_IDS;

    const providers = await prisma.accommodationProvider.findMany({
      where: { id: { in: providerIds }, active: true },
      select: {
        id: true, name: true,
        properties: {
          orderBy: { id: 'asc' },
          select: {
            id: true, name: true,
            rooms: {
              orderBy: { id: 'asc' },
              select: {
                id: true, name: true, roomType: true, enSuite: true,
                beds: {
                  orderBy: { id: 'asc' },
                  select: {
                    id: true, name: true,
                    placements: {
                      where: {
                        active: true,
                        booking: { status: { not: 'CANCELLED' } },
                        startDate: { lt: to },   // STRICT overlap — same-day turnover is not a conflict
                        endDate: { gt: from },
                      },
                      select: {
                        booking: { select: { student: { select: { gender: true } } } },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    const propertyName = providers.map(p => p.name).join(', ') || 'Capel Street';

    // Availability is keyed off the ROOM for one individual request, not the bed.
    // A Premium room is a DOUBLE bed — modelled as 2 beds so a couple *could*
    // share — but a single student takes the whole room, so it is ONE available
    // unit, never two. Counting its two beds as two free spaces is wrong (and
    // produced "4 beds free" against only 3 rooms). Only a genuine stranger-
    // shared room (Twin/Shared) is counted per free bed. Mirrors the
    // PER_BED_ROOM_TYPES split used by the cleaning/billing logic in this file.
    // (Couples sharing a double are a separate, surcharged case — not this check.)
    const PER_BED_ROOM_TYPES = new Set(['Twin/Shared']);

    type FreeUnit = { bedId: number; roomId: number; room: string; roomType: string; enSuite: boolean; shared: boolean };
    const freeByType: Record<string, FreeUnit[]> = {};
    let sharedOffered = false;

    for (const prov of providers) {
      for (const prop of prov.properties) {
        for (const room of prop.rooms) {
          const rtype = String(room.roomType || '—');
          const perBed = PER_BED_ROOM_TYPES.has(rtype);
          // room.name usually already carries the apartment prefix ("A1 / Room 2");
          // only prepend the property when it doesn't.
          const rn = room.name || '';
          const pn = prop.name || '';
          const roomLabel = rn.includes(pn) ? rn : `${pn} / ${rn}`.replace(/^ \/ /, '');

          if (perBed) {
            // Genuine shared room — each FREE bed is one unit; same-gender only.
            const roomGenders = new Set<number>();
            for (const bed of room.beds)
              for (const pl of bed.placements) {
                const gg = pl.booking?.student?.gender;
                if (gg === 1 || gg === 2) roomGenders.add(gg);
              }
            for (const bed of room.beds) {
              if (bed.placements.length > 0) continue; // occupied over the window
              // A known-gender requester can't take a bed in a shared room that
              // already holds the other gender.
              if (roomGenders.size > 0 && g && !roomGenders.has(g)) continue;
              (freeByType[rtype] ||= []).push({
                bedId: bed.id, roomId: room.id, room: roomLabel,
                roomType: rtype, enSuite: !!room.enSuite, shared: true,
              });
              sharedOffered = true;
            }
          } else {
            // Regular room (single or double, any en-suite) — ONE unit for an
            // individual, available only if the WHOLE room is empty over the
            // window (you can't put a stranger in the other half of a double).
            const occupied = room.beds.some(b => b.placements.length > 0);
            if (occupied) continue;
            const firstBed = room.beds[0];
            if (!firstBed) continue; // room with no beds modelled — skip
            (freeByType[rtype] ||= []).push({
              bedId: firstBed.id, roomId: room.id, room: roomLabel,
              roomType: rtype, enSuite: !!room.enSuite, shared: false,
            });
          }
        }
      }
    }

    const matches = wantType
      ? (freeByType[wantType] || []).filter(b => !wantEnsuite || b.enSuite)
      : Object.values(freeByType).flat();

    const unitWord = (t: string, n: number) =>
      (PER_BED_ROOM_TYPES.has(t) ? 'bed' : 'room') + (n === 1 ? '' : 's');

    const alternatives = Object.entries(freeByType)
      .filter(([t]) => !wantType || t !== wantType)
      .map(([t, units]) => ({
        roomType: t,
        enSuite: units.some(b => b.enSuite),
        unit: PER_BED_ROOM_TYPES.has(t) ? 'bed' : 'room',
        free: units.length,
        freeBeds: units.length, // deprecated alias — callers keyed on freeBeds; = free
        rooms: [...new Set(units.map(b => b.room))],
      }))
      .sort((a, b) => b.free - a.free);

    const anyAvailable = Object.values(freeByType).some(a => a.length > 0);
    const available = wantType ? matches.length > 0 : anyAvailable;
    const genderReminder = sharedOffered;

    const fmt = (d: Date) => d.toISOString().slice(0, 10);
    const win = `${fmt(from)} → ${fmt(to)}`;
    // Name the actual rooms, type in brackets — "A1 / Room 1 (Premium), A2 / Room 3 (Standard)".
    const listRooms = (units: FreeUnit[]) =>
      [...new Set(units.map(u => `${u.room} (${u.roomType}${u.enSuite ? ', en-suite' : ''})`))].join(', ');
    const altStr = Object.entries(freeByType)
      .filter(([t]) => (!wantType || t !== wantType) && freeByType[t].length > 0)
      .sort((a, b) => b[1].length - a[1].length)
      .map(([, units]) => listRooms(units))
      .join(', ');
    let summary: string;
    if (wantType && matches.length > 0) {
      const roomsList = listRooms(matches);
      summary = `Yes — ${matches.length} ${wantType} ${unitWord(wantType, matches.length)} free at ${propertyName} for ${win}: ${roomsList}.`;
    } else if (wantType && anyAvailable) {
      summary = `No ${wantType} free at ${propertyName} for ${win}. Other free: ${altStr}.`;
    } else if (!wantType && anyAvailable) {
      summary = `Free at ${propertyName} for ${win}: ${altStr}.`;
    } else {
      summary = `No rooms free at ${propertyName} for ${win} — check alternative providers.`;
    }
    if (genderReminder && anyAvailable) {
      summary += ` Shared room involved — check the student's gender first (no mixed-gender rooms).`;
    }

    return {
      property: propertyName,
      from: fmt(from), to: fmt(to),
      requested: { roomType: wantType, enSuite: wantEnsuite || undefined, gender: g },
      available,
      anyAvailable,
      matches,
      alternatives,
      genderReminder,
      summary,
    };
  }

  // Accept a pending host-portal offer (EOI) in one click: auto-place the
  // student into a free bed at the host who offered, for the student's stay
  // dates. Placing resolves the offer (placeStudent flips claimStatus →
  // 'confirmed'). Picks the first free, gender-valid bed at that host (Kelly
  // can drag to move afterwards); errors clearly if the host has no free bed.
  async function acceptClaim(bookingAccommodationId: number, callerRole?: string, callerUser?: string | null) {
    const ba = await prisma.bookingAccommodation.findUnique({
      where: { id: bookingAccommodationId },
      select: {
        id: true, startDate: true, endDate: true, claimStatus: true, claimedByProviderId: true,
        claimedByProvider: { select: { id: true, name: true } },
        booking: { select: { id: true, student: { select: { id: true, gender: true, firstName: true } } } },
      },
    });
    if (!ba) throw new Error('Booking accommodation not found');
    if (!ba.claimedByProviderId || ba.claimStatus !== 'pending') {
      throw new Error('There is no pending offer to accept on this student.');
    }
    const from = (ba as any).startDate ? new Date((ba as any).startDate).toISOString().slice(0, 10) : null;
    const to   = (ba as any).endDate   ? new Date((ba as any).endDate).toISOString().slice(0, 10)   : null;
    if (!from || !to) throw new Error('This stay has no start/end date — place manually.');
    const hostName = ba.claimedByProvider?.name || 'the host';
    // No roomType filter → matches = every free, gender-valid bed at this host.
    const avail = await accommodationAvailability({
      from, to,
      gender: ba.booking?.student?.gender ?? null,
      providerIds: [ba.claimedByProviderId],
    });
    const free = avail.matches || [];
    if (!free.length) {
      throw new Error(`No free bed at ${hostName} for ${from} → ${to}. Free up a bed first, or release the offer.`);
    }
    const bed = free[0];
    await placeStudent(bookingAccommodationId, bed.bedId, callerRole, false, callerUser);
    return {
      placed: true, bedId: bed.bedId, room: bed.room, host: hostName,
      firstName: ba.booking?.student?.firstName || 'Student',
      moreFree: free.length - 1,
      studentId: ba.booking?.student?.id || null,
      bookingId: ba.booking?.id || null,
    };
  }

  return {
    accommodationAvailability,
    acceptClaim,
    listProviders, getProviderById, createProvider, updateProvider, deleteProvider,
    addProperty, updateProperty, deleteProperty,
    addRoom, updateRoom, deleteRoom,
    addBed, deleteBed,
    getUnplacedStudents, searchHoldCandidates, getHostTimeline,
    placeStudent, unplaceStudent, splitPlacement, rejoinPlacement, releaseClaim, pendingClaims,
    getCleaningQueue, getCleaningDetail, setCleanCheckoutAt, markCleaned, unmarkCleaned, cancelClean,
  };
}
