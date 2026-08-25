import { Router } from 'express';
import { PrismaClient } from '../generated/prisma/client';
import { accommodationScripts } from '../scripts/accommodation';
import { syncCleaningSheet } from '../scripts/cleaning-sheet-sync';
import { pushCleaningToXero } from '../scripts/cleaning-xero-push';
import { runHostOutreach } from '../scripts/host-outreach';
import { recomputeOneHostCategory } from '../scripts/host-category';
import { autoNudgeScripts } from '../scripts/auto-nudge';

export function accommodationRoutes(prisma: PrismaClient) {
  const router = Router();
  const scripts = accommodationScripts(prisma);
  const autoNudge = autoNudgeScripts(prisma);

  // AutoNudge "Cascade" — wave config + live host counts (defined before /:id so
  // the multi-segment paths never collide with the provider-by-id route).
  router.get('/auto-nudge/waves', async (_req, res) => {
    try { res.json(await autoNudge.getWaves()); }
    catch (e: any) { res.status(500).json({ error: String(e?.message || e) }); }
  });
  router.patch('/auto-nudge/wave/:id', async (req, res) => {
    try { res.json(autoNudge.updateWave(req.params.id, req.body || {})); }
    catch (e: any) { res.status(400).json({ error: String(e?.message || e) }); }
  });
  // Master arm switch (armed = the cron actually sends; disarmed = dry-run).
  router.patch('/auto-nudge/config', async (req, res) => {
    try { res.json({ armed: autoNudge.setArmed(!!req.body?.armed) }); }
    catch (e: any) { res.status(400).json({ error: String(e?.message || e) }); }
  });
  // Manual send of ONE wave NOW (real send, bypasses 6-day idempotency) — for a
  // last-minute midweek booking. The cron sends these on schedule anyway.
  router.post('/auto-nudge/wave/:id/send', async (req, res) => {
    try {
      const cfg = autoNudge.loadConfig();
      const wave = cfg.waves.find((w: any) => w.id === req.params.id);
      if (!wave) return res.status(404).json({ error: 'wave not found' });
      res.json(await autoNudge.sendWave(wave, true, { ignoreIdem: true }));
    } catch (e: any) { res.status(500).json({ error: String(e?.message || e) }); }
  });

  // Providers
  router.get('/', async (req, res) => {
    try { res.json(await scripts.listProviders(req.query)); }
    catch (e) { res.status(500).json({ error: String(e) }); }
  });

  router.get('/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID' });
    try {
      const p = await scripts.getProviderById(id);
      if (!p) return res.status(404).json({ error: 'Provider not found' });
      res.json(p);
    } catch (e) { res.status(500).json({ error: String(e) }); }
  });

  // Placements for a provider — feeds the "About which student?" picker in
  // the host-page comms block. Returns every booking_accommodation that has
  // ever or will ever live at any of this provider's beds, with the student
  // + booking IDs and date range. The frontend sorts/filters from this set
  // (current vs upcoming vs past) so the picker can preselect the obvious
  // case (single active placement) and surface the menu for multi-student
  // hosts where the staff has to make an explicit choice.
  router.get('/:id/placements', async (req, res) => {
    const providerId = parseInt(req.params.id);
    if (isNaN(providerId)) return res.status(400).json({ error: 'Invalid ID' });
    try {
      const rows: any[] = await prisma.$queryRawUnsafe(
        `SELECT ba.id              AS ba_id,
                ba.booking_id,
                ba.start_date,
                ba.end_date,
                ba.weeks,
                ba.accommodation_type,
                ba.room_type,
                ba.board,
                ba.active,
                b.student_id,
                s.first_name,
                s.last_name,
                s.email
           FROM booking_accommodations ba
           JOIN bookings b   ON b.id = ba.booking_id
           JOIN students s   ON s.id = b.student_id
           JOIN accommodation_beds bd       ON bd.id = ba.bed_id
           JOIN accommodation_rooms r       ON r.id  = bd.room_id
           JOIN accommodation_properties pr ON pr.id = r.property_id
          WHERE pr.provider_id = $1
            AND ba.active = true
       ORDER BY (ba.end_date < CURRENT_DATE),       -- past goes last
                (ba.start_date > CURRENT_DATE),     -- upcoming after current
                ba.start_date ASC`,
        providerId
      );
      const today = new Date(); today.setHours(0,0,0,0);
      const items = rows.map(r => {
        const start = r.start_date ? new Date(r.start_date) : null;
        const end = r.end_date ? new Date(r.end_date) : null;
        let phase: 'current' | 'upcoming' | 'past' = 'past';
        if (start && end && start <= today && end >= today) phase = 'current';
        else if (start && start > today) phase = 'upcoming';
        return {
          bookingAccommodationId: r.ba_id,
          bookingId: r.booking_id,
          studentId: r.student_id,
          studentName: `${r.first_name || ''} ${r.last_name || ''}`.trim(),
          studentEmail: r.email,
          startDate: r.start_date,
          endDate: r.end_date,
          weeks: r.weeks,
          accommodationType: r.accommodation_type,
          roomType: r.room_type,
          board: r.board,
          phase,
        };
      });
      res.json({ placements: items });
    } catch (e) { res.status(500).json({ error: String(e) }); }
  });

  // Aggregated student feedback for a provider (rolled up across all stays at
  // any of its properties/rooms/beds). Returns avg + count + recent comments.
  router.get('/:id/feedback', async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID' });
    try {
      const rows: any[] = await prisma.$queryRawUnsafe(
        `SELECT f.id, f.stars, f.comment, f.status,
                to_char(f.week_start, 'YYYY-MM-DD') AS week_start,
                f.created_at,
                s.id AS student_id, s.first_name, s.last_name
           FROM accommodation_feedback f
           JOIN booking_accommodations ba ON ba.id = f.booking_accommodation_id
           JOIN accommodation_beds bed ON bed.id = ba.bed_id
           JOIN accommodation_rooms ar ON ar.id = bed.room_id
           JOIN accommodation_properties prop ON prop.id = ar.property_id
           JOIN students s ON s.id = f.student_id
          WHERE prop.provider_id = $1
            AND f.status = 'active'
            AND f.stars IS NOT NULL
          ORDER BY f.created_at DESC`,
        id,
      );
      const active = rows.filter(r => r.status === 'active');
      const avg = active.length ? active.reduce((a, r) => a + r.stars, 0) / active.length : null;
      res.json({
        count: rows.length,
        avg: avg != null ? Math.round(avg * 10) / 10 : null,
        items: rows,
      });
    } catch (e: any) { res.status(500).json({ error: String(e?.message || e) }); }
  });

  router.post('/', async (req, res) => {
    try { res.status(201).json(await scripts.createProvider(req.body)); }
    catch (e) { res.status(400).json({ error: String(e) }); }
  });

  router.patch('/:id', async (req, res) => {
    try { res.json(await scripts.updateProvider(parseInt(req.params.id), req.body)); }
    catch (e) { res.status(400).json({ error: String(e) }); }
  });

  router.delete('/:id', async (req, res) => {
    try { await scripts.deleteProvider(parseInt(req.params.id)); res.json({ deleted: true }); }
    catch (e) { res.status(400).json({ error: String(e) }); }
  });

  // Properties
  router.post('/:providerId/properties', async (req, res) => {
    try { res.status(201).json(await scripts.addProperty(parseInt(req.params.providerId), req.body)); }
    catch (e) { res.status(400).json({ error: String(e) }); }
  });

  router.patch('/properties/:id', async (req, res) => {
    try { res.json(await scripts.updateProperty(parseInt(req.params.id), req.body)); }
    catch (e) { res.status(400).json({ error: String(e) }); }
  });

  router.delete('/properties/:id', async (req, res) => {
    try { await scripts.deleteProperty(parseInt(req.params.id)); res.json({ deleted: true }); }
    catch (e) { res.status(400).json({ error: String(e) }); }
  });

  // Rooms
  router.post('/properties/:propertyId/rooms', async (req, res) => {
    try { res.status(201).json(await scripts.addRoom(parseInt(req.params.propertyId), req.body)); }
    catch (e) { res.status(400).json({ error: String(e) }); }
  });

  router.patch('/rooms/:id', async (req, res) => {
    try { res.json(await scripts.updateRoom(parseInt(req.params.id), req.body)); }
    catch (e) { res.status(400).json({ error: String(e) }); }
  });

  router.delete('/rooms/:id', async (req, res) => {
    try { await scripts.deleteRoom(parseInt(req.params.id)); res.json({ deleted: true }); }
    catch (e) { res.status(400).json({ error: String(e) }); }
  });

  // Beds
  router.post('/rooms/:roomId/beds', async (req, res) => {
    try { res.status(201).json(await scripts.addBed(parseInt(req.params.roomId), req.body)); }
    catch (e) { res.status(400).json({ error: String(e) }); }
  });

  router.delete('/beds/:id', async (req, res) => {
    try { await scripts.deleteBed(parseInt(req.params.id)); res.json({ deleted: true }); }
    catch (e) { res.status(400).json({ error: String(e) }); }
  });

  // ── Matching Engine ────────────────────────────

  // Get unplaced students (optionally filtered by accommodation type).
  // ?holds=12,17 re-includes those zero-paid bookingAccommodation rows for
  // the 48h hold path; the client maintains a session-only set and replays
  // it on every refresh so a held student stays in the pool until placed.
  router.get('/matching/unplaced', async (_req, res) => {
    try {
      const accommType = _req.query.type as string | undefined;
      const holdsRaw = (_req.query.holds as string | undefined) || '';
      const holds = holdsRaw
        ? holdsRaw.split(',').map(s => parseInt(s, 10)).filter(Number.isFinite)
        : [];
      res.json(await scripts.getUnplacedStudents(accommType, holds));
    } catch (e) { res.status(500).json({ error: String(e) }); }
  });

  // Search zero-paid bookings to surface in the pool under a 48h hold.
  // Sales/admin/accomm only — the placement endpoint enforces the same.
  router.get('/matching/holds-search', async (req, res) => {
    try {
      const role = (req as any).session?.role;
      if (!(role === 'sales' || role === 'admin' || role === 'accomm')) {
        return res.status(403).json({ error: 'Hold search is restricted to sales/admin/accomm.' });
      }
      const q = (req.query.q as string) || '';
      res.json(await scripts.searchHoldCandidates(q));
    } catch (e) { res.status(500).json({ error: String(e) }); }
  });

  // Manual "Nudge Hosts" — sends Nudge #2 (host-outreach-nudge-2) to ALL matching-
  // enabled hosts on demand (a re-nudge for new last-minute bookings; it intentionally
  // DOES re-hit hosts who already got Monday's Nudge #1). Shares the cron's send
  // engine; per-template idempotency only blocks an accidental double-click.
  router.post('/matching/nudge-hosts', async (req, res) => {
    try {
      const role = (req as any).session?.role;
      if (!(role === 'sales' || role === 'admin' || role === 'accomm')) {
        return res.status(403).json({ error: 'Nudge is restricted to sales/admin/accomm.' });
      }
      const sentBy = 'manual:' + ((req as any).session?.user || 'admin');
      const result = await runHostOutreach(prisma, { templateSlug: 'host-outreach-nudge-2', apply: true, sentBy });
      res.json({ success: true, ...result });
    } catch (e: any) { res.status(500).json({ error: String(e?.message || e) }); }
  });

  // Recompute ONE host's category from activity + clear its manual lock — the
  // dropdown's "Auto" choice. Returns the freshly-computed category.
  router.post('/:id/recompute-category', async (req, res) => {
    try {
      const role = (req as any).session?.role;
      if (!(role === 'sales' || role === 'admin' || role === 'accomm')) {
        return res.status(403).json({ error: 'Not authorized.' });
      }
      const result = await recomputeOneHostCategory(prisma, parseInt(req.params.id));
      res.json({ success: true, ...result });
    } catch (e: any) { res.status(500).json({ error: String(e?.message || e) }); }
  });

  // Get host timeline
  router.get('/matching/timeline', async (req, res) => {
    try {
      const from = req.query.from as string || new Date().toISOString().split('T')[0];
      const weeks = parseInt(req.query.weeks as string) || 6;
      const toDate = new Date(from);
      toDate.setDate(toDate.getDate() + weeks * 7);
      const to = toDate.toISOString().split('T')[0];
      const providerType = req.query.type as string | undefined;
      res.json(await scripts.getHostTimeline(from, to, providerType));
    } catch (e) { res.status(500).json({ error: String(e) }); }
  });

  // Place student. asHold=true is the 48-hour hold path for zero-paid bookings —
  // the sales/admin/accomm user surfaces them via /matching/holds-search and
  // we stamp hold_placed_at + hold_placed_by for the audit tooltip.
  router.post('/matching/place', async (req, res) => {
    try {
      const { bookingAccommodationId, bedId, asHold } = req.body;
      if (!bookingAccommodationId || !bedId) return res.status(400).json({ error: 'bookingAccommodationId and bedId required' });
      const role = (req as any).session?.role;
      const user = (req as any).session?.user || null;
      res.json(await scripts.placeStudent(bookingAccommodationId, bedId, role, asHold === true, user));
    } catch (e) { res.status(400).json({ error: String(e) }); }
  });

  // Split placement
  router.post('/matching/split', async (req, res) => {
    try {
      const { bookingAccommodationId, splitDate } = req.body;
      if (!bookingAccommodationId || !splitDate) return res.status(400).json({ error: 'bookingAccommodationId and splitDate required' });
      res.json(await scripts.splitPlacement(bookingAccommodationId, splitDate));
    } catch (e) { res.status(400).json({ error: String(e) }); }
  });

  // Rejoin placement (merge with adjacent sibling on same booking)
  router.post('/matching/rejoin', async (req, res) => {
    try {
      const { bookingAccommodationId } = req.body;
      if (!bookingAccommodationId) return res.status(400).json({ error: 'bookingAccommodationId required' });
      res.json(await scripts.rejoinPlacement(bookingAccommodationId));
    } catch (e) { res.status(400).json({ error: String(e) }); }
  });

  // Unplace student
  router.post('/matching/unplace', async (req, res) => {
    try {
      const { bookingAccommodationId } = req.body;
      if (!bookingAccommodationId) return res.status(400).json({ error: 'bookingAccommodationId required' });
      res.json(await scripts.unplaceStudent(bookingAccommodationId));
    } catch (e) { res.status(400).json({ error: String(e) }); }
  });

  // Host-portal Expression of Interest: pending list (notifications count) +
  // release (clears a claim → student back in the pool).
  router.get('/claims/pending', async (_req, res) => {
    try { res.json(await scripts.pendingClaims()); }
    catch (e) { res.status(400).json({ error: String(e) }); }
  });
  router.post('/matching/release-claim', async (req, res) => {
    try {
      const { bookingAccommodationId } = req.body;
      if (!bookingAccommodationId) return res.status(400).json({ error: 'bookingAccommodationId required' });
      res.json(await scripts.releaseClaim(bookingAccommodationId));
    } catch (e) { res.status(400).json({ error: String(e) }); }
  });

  // ── Cleaning ───────────────────────────────────
  router.get('/:id/cleaning-queue', async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID' });
    try { res.json(await scripts.getCleaningQueue(id)); }
    catch (e) { res.status(400).json({ error: String(e) }); }
  });

  router.get('/cleaning/placement/:placementId', async (req, res) => {
    try {
      const placementId = parseInt(req.params.placementId);
      res.json(await scripts.getCleaningDetail(placementId));
    } catch (e) { res.status(400).json({ error: String(e) }); }
  });

  router.patch('/cleaning/:placementId/checkout-at', async (req, res) => {
    try {
      const placementId = parseInt(req.params.placementId);
      const iso = req.body?.checkoutAt ?? null;
      res.json(await scripts.setCleanCheckoutAt(placementId, iso));
    } catch (e) { res.status(400).json({ error: String(e) }); }
  });

  router.post('/cleaning/:placementId/mark-done', async (req, res) => {
    try {
      const placementId = parseInt(req.params.placementId);
      const by = (req as any).user?.username || req.body?.by || null;
      res.json(await scripts.markCleaned(placementId, by));
    } catch (e) { res.status(400).json({ error: String(e) }); }
  });

  router.post('/cleaning/:placementId/unmark-done', async (req, res) => {
    try {
      const placementId = parseInt(req.params.placementId);
      res.json(await scripts.unmarkCleaned(placementId));
    } catch (e) { res.status(400).json({ error: String(e) }); }
  });

  router.post('/cleaning/:placementId/cancel', async (req, res) => {
    try {
      const placementId = parseInt(req.params.placementId);
      const by = (req as any).user?.username || req.body?.by || null;
      res.json(await scripts.cancelClean(placementId, by));
    } catch (e) { res.status(400).json({ error: String(e) }); }
  });

  router.post('/:id/cleaning-sync', async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID' });
    try { res.json(await syncCleaningSheet(prisma, id)); }
    catch (e: any) { res.status(400).json({ error: e?.message || String(e) }); }
  });

  router.post('/:id/cleaning-push-to-xero', async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID' });
    try { res.json(await pushCleaningToXero(prisma, id)); }
    catch (e: any) { res.status(400).json({ error: e?.message || String(e) }); }
  });

  return router;
}
