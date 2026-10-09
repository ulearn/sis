import { Router } from 'express';
import { PrismaClient } from '../generated/prisma/client';
import { bookingScripts } from '../scripts/bookings';

export function bookingRoutes(prisma: PrismaClient) {
  const router = Router();
  const scripts = bookingScripts(prisma);

  // ── Field-level write guard ───────────────────────────────────────────
  // HubSpot/Xero are the source of truth for the FINANCIAL component of a
  // booking (amounts, payments, and the durations/quantities they're priced
  // on — weeks, nights, hours). Those stay locked to admin/accounts. But the
  // operational DATE/TIME of things legitimately moves downstream (a student
  // arrives a day late, a pickup time changes), so ops roles may edit those.
  //
  // Ops roles (dos/sales/accomm) may change COURSE dates. Course-date drift
  // doesn't procure an external cost (the group runs regardless — worst case a
  // student gets a "free week"). ACCOMMODATION dates stay EXCLUDED: the
  // host-payment engine bills off the placement dates, so moving an accom end
  // date creates a real, irreversible external liability (host nights).
  //
  // EXTRAS: only `scheduledAt` is ops-editable (Neil 2026-07-20). The extra
  // itself is already purchased, so re-timing a transfer procures nothing new —
  // and success/sales are precisely the people arranging the arrival, working
  // off the student's flight. Blocking them meant a wrong pickup time could
  // only be fixed by Accounts (see Bernardo Hughes Pimentel, Jul 2026). The
  // chargeable surface — fee, extraType, active, create/delete — stays with
  // Accounts, so no unmet liability can be created.
  // Anything else under /bookings (amounts, status, payments, creates,
  // deletes) is blocked for ops too.
  const FINANCE_ROLES = new Set(['admin', 'accounts']);
  // Ops-editable fields per sub-entity. Course start/end are operational dates;
  // ilepCode + level are ACADEMIC/visa data (not financial) that the DOS legitimately
  // maintains for visa letters and certificates — so they're allowed for ops roles
  // alongside the dates. Money/duration fields stay locked to Accounts.
  const DATE_WHITELIST: Record<string, string[]> = {
    courses: ['startDate', 'endDate', 'ilepCode', 'level'],
    extras: ['scheduledAt'],
  };
  router.use((req: any, res, next) => {
    const role = req.session?.role || '';

    // ── Holidays: students self-serve, staff get VETO only ──────────────────
    // Holiday CREATE is now booked by the student in their app (the student
    // route calls addHoliday in-process, bypassing this router). Staff no longer
    // hand-enter holidays — that was redundant data-entry — but ANY staff role
    // can VETO (delete) a holiday, and admin keeps create as an override.
    const isHolidayCreate = req.method === 'POST' && /^\/\d+\/holidays$/.test(req.path);
    const isHolidayDelete = req.method === 'DELETE' && /^\/holidays\/\d+$/.test(req.path);
    if (isHolidayDelete) return next();                       // veto — any staff
    if (isHolidayCreate) {
      if (role === 'admin') return next();                   // admin override
      return res.status(403).json({ success: false, error: 'Holidays are booked by the student in their app. Staff can veto (remove) a holiday but no longer create one.' });
    }

    if (FINANCE_ROLES.has(role)) return next();   // full access to other sub-entities
    if (req.method === 'GET') return next();        // reads always allowed

    const m = req.path.match(/^\/(courses|accommodations|extras)\/\d+$/);
    if (req.method === 'PATCH' && m) {
      // `|| []` — a sub-entity absent from the whitelist (e.g. accommodations)
      // must fall through to the 403 below, not throw on undefined.includes().
      const allowed = DATE_WHITELIST[m[1]] || [];
      const keys = Object.keys(req.body || {});
      if (keys.length > 0 && keys.every(k => allowed.includes(k))) return next();
    }
    return res.status(403).json({
      success: false,
      error: 'Date changes only. Amounts, durations (weeks/nights/hours) and payments are locked to Accounts — HubSpot/Xero is the source of truth.',
    });
  });

  router.get('/', async (req, res) => {
    try {
      const result = await scripts.list(req.query);
      res.json(result);
    } catch (e) { res.status(500).json({ error: String(e) }); }
  });

  // CSV export for Antonella's weekly arrivals list (and ad-hoc operational
  // exports — Friday Review test class tables etc). Same filter contract as
  // GET /, so the user just sets the filter in the UI and clicks Export.
  // Columns chosen to match the Fidelo "First Course Start Date" export
  // Antonella shares with Paul weekly: ID, Name, Age, Course, Weeks,
  // Accommodation, Level. CSV is opened directly by Excel — no xlsx
  // dependency needed.
  router.get('/export.csv', async (req, res) => {
    try {
      // Run the same query as the list endpoint, but pull everything (no pagination).
      const query = { ...req.query, page: '1', limit: '10000' };
      const { data } = await scripts.list(query);

      const csvCell = (v: any): string => {
        if (v == null) return '';
        const s = String(v);
        // Quote if contains comma, quote, newline. Escape inner quotes by doubling.
        if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
        return s;
      };
      const fmtDate = (d: any): string => {
        if (!d) return '';
        try { return new Date(d).toISOString().slice(0, 10); } catch { return ''; }
      };
      const ageFromDob = (dob: any): string => {
        if (!dob) return '';
        const ms = Date.now() - new Date(dob).getTime();
        const yrs = Math.floor(ms / (365.25 * 24 * 60 * 60 * 1000));
        return Number.isFinite(yrs) && yrs > 0 ? String(yrs) : '';
      };

      const header = [
        'Student ID', 'First Name', 'Last Name', 'Email', 'Age', 'Nationality',
        'First Course', 'First Course Start', 'First Course End',
        'Total Weeks', 'Accommodation',
        'Level (internal)', 'Placement Score',
        'Booking ID', 'Status', 'Agency', 'Amount Total', 'Amount Paid',
      ];
      const rows: string[] = [header.map(csvCell).join(',')];

      for (const b of data as any[]) {
        const s = b.student || {};
        // Sort courses by start date so "First Course" really is the first.
        const courses = Array.isArray(b.courses) ? [...b.courses].sort((a: any, c: any) => {
          const da = a.startDate ? new Date(a.startDate).getTime() : 0;
          const dc = c.startDate ? new Date(c.startDate).getTime() : 0;
          return da - dc;
        }) : [];
        const firstCourse = courses[0] || null;
        // "Absolute Weeks" in Fidelo = total programme length on the booking.
        // Sum the per-course weeks; falls back to '' if all rows are null.
        const totalWeeks = courses.reduce((sum: number, c: any) => sum + (Number(c.weeks) || 0), 0);
        const accom = (b.accommodations && b.accommodations[0]) || null;
        const accomLabel = accom
          ? [accom.accommodationType, accom.roomType, accom.boardType].filter(Boolean).join(' / ')
          : '';

        rows.push([
          s.id ?? '',
          s.firstName ?? '',
          s.lastName ?? '',
          s.email ?? '',
          ageFromDob(s.birthday),
          s.nationality ?? '',
          firstCourse?.name ?? '',
          fmtDate(firstCourse?.startDate),
          fmtDate(firstCourse?.endDate),
          totalWeeks || '',
          accomLabel,
          s.currentLevel ?? '',
          s.placementTestScore ?? '',
          b.id,
          b.status ?? '',
          b.agency?.name ?? '',
          b.amountTotal ?? '',
          b.amountPaid ?? '',
        ].map(csvCell).join(','));
      }

      const today = new Date().toISOString().slice(0, 10);
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="bookings-${today}.csv"`);
      // UTF-8 BOM so Excel auto-detects encoding for accented names.
      res.send('﻿' + rows.join('\r\n'));
    } catch (e) { res.status(500).json({ error: String(e) }); }
  });

  // LifePass report — MUST precede '/:id' so "lifepass" isn't matched as an id.
  router.get('/lifepass', async (_req, res) => {
    try {
      res.json({ students: await scripts.lifePassReport() });
    } catch (e) { res.status(500).json({ error: String(e) }); }
  });

  router.get('/:id', async (req, res) => {
    try {
      const booking = await scripts.getById(parseInt(req.params.id));
      if (!booking) return res.status(404).json({ error: 'Booking not found' });
      res.json(booking);
    } catch (e) { res.status(500).json({ error: String(e) }); }
  });

  // ── Staff notes (polymorphic, one per booking entity) ──────────────────
  // All notes for a booking in one shot — the detail view maps them to icons.
  router.get('/:id/notes', async (req, res) => {
    try {
      const bookingId = parseInt(req.params.id as string, 10);
      const notes = await (prisma as any).entityNote.findMany({
        where: { bookingId },
        select: { id: true, entityType: true, entityId: true, body: true, createdBy: true, updatedAt: true },
      });
      res.json(notes);
    } catch (e) { res.status(500).json({ error: String(e) }); }
  });

  // Upsert one entity's note; an empty body deletes it. Body:
  // { entityType, entityId, body }.
  router.put('/:id/notes', async (req, res) => {
    try {
      const bookingId = parseInt(req.params.id as string, 10);
      const entityType = String(req.body?.entityType || '').trim();
      const entityId = parseInt(String(req.body?.entityId), 10);
      const body = String(req.body?.body ?? '').trim();
      if (!entityType || !Number.isFinite(entityId)) return res.status(400).json({ error: 'entityType and entityId required' });
      const by = (req as any).session?.user || null;
      if (!body) {
        await (prisma as any).entityNote.deleteMany({ where: { entityType, entityId } });
        return res.json({ ok: true, deleted: true });
      }
      const saved = await (prisma as any).entityNote.upsert({
        where: { entityType_entityId: { entityType, entityId } },
        update: { body, updatedAt: new Date() },
        create: { bookingId, entityType, entityId, body, createdBy: by },
        select: { id: true, entityType: true, entityId: true, body: true, createdBy: true, updatedAt: true },
      });
      res.json({ ok: true, note: saved });
    } catch (e: any) { res.status(400).json({ error: String(e?.message || e) }); }
  });

  // Reconcile a LifePass booking's instalment drawdowns against its Xero -Sub
  // master invoice (FIFO waterline). Finance-only via the guard above. Idempotent:
  // advances the paid line, rolls back on a refund. Reads from Xero (source of truth).
  router.post('/:id/reconcile-instalments', async (req, res) => {
    try {
      const { reconcileLifePassInstalments } = await import('../scripts/lifepass-reconcile');
      const result = await reconcileLifePassInstalments(prisma, parseInt(req.params.id as string, 10));
      res.json({ success: true, ...result });
    } catch (e: any) { res.status(500).json({ success: false, error: String(e?.message || e) }); }
  });

  router.post('/', async (req, res) => {
    try {
      const booking = await scripts.create(req.body);
      res.status(201).json(booking);
    } catch (e) { res.status(400).json({ error: String(e) }); }
  });

  router.patch('/:id', async (req, res) => {
    try {
      const booking = await scripts.update(parseInt(req.params.id), req.body);
      if (!booking) return res.status(404).json({ error: 'Booking not found' });
      res.json(booking);
    } catch (e) { res.status(400).json({ error: String(e) }); }
  });

  router.delete('/:id', async (req, res) => {
    try {
      await scripts.remove(parseInt(req.params.id));
      res.json({ deleted: true });
    } catch (e) { res.status(400).json({ error: String(e) }); }
  });

  // Booking courses
  router.post('/:bookingId/courses', async (req, res) => {
    try { res.status(201).json(await scripts.addCourse(parseInt(req.params.bookingId), req.body)); }
    catch (e) { res.status(400).json({ error: String(e) }); }
  });

  router.patch('/courses/:id', async (req, res) => {
    try { res.json(await scripts.updateCourse(parseInt(req.params.id), req.body)); }
    catch (e) { res.status(400).json({ error: String(e) }); }
  });

  router.delete('/courses/:id', async (req, res) => {
    try { await scripts.removeCourse(parseInt(req.params.id)); res.json({ deleted: true }); }
    catch (e) { res.status(400).json({ error: String(e) }); }
  });

  // Booking accommodation
  router.post('/:bookingId/accommodations', async (req, res) => {
    try { res.status(201).json(await scripts.addAccommodation(parseInt(req.params.bookingId), req.body)); }
    catch (e) { res.status(400).json({ error: String(e) }); }
  });

  router.patch('/accommodations/:id', async (req, res) => {
    try { res.json(await scripts.updateAccommodation(parseInt(req.params.id), req.body)); }
    catch (e) { res.status(400).json({ error: String(e) }); }
  });

  router.delete('/accommodations/:id', async (req, res) => {
    try { await scripts.removeAccommodation(parseInt(req.params.id)); res.json({ deleted: true }); }
    catch (e) { res.status(400).json({ error: String(e) }); }
  });

  // Booking extras
  router.post('/:bookingId/extras', async (req, res) => {
    try { res.status(201).json(await scripts.addExtra(parseInt(req.params.bookingId), req.body)); }
    catch (e) { res.status(400).json({ error: String(e) }); }
  });

  router.patch('/extras/:id', async (req, res) => {
    try { res.json(await scripts.updateExtra(parseInt(req.params.id), req.body)); }
    catch (e) { res.status(400).json({ error: String(e) }); }
  });

  router.delete('/extras/:id', async (req, res) => {
    try { await scripts.removeExtra(parseInt(req.params.id)); res.json({ deleted: true }); }
    catch (e) { res.status(400).json({ error: String(e) }); }
  });

  // Booking holidays — inserting/removing pushes course end-dates by weekdays
  router.get('/:bookingId/holidays', async (req, res) => {
    try { res.json(await scripts.listHolidays(parseInt(req.params.bookingId))); }
    catch (e) { res.status(400).json({ error: String(e) }); }
  });

  router.post('/:bookingId/holidays', async (req, res) => {
    try { res.status(201).json(await scripts.addHoliday(parseInt(req.params.bookingId), req.body)); }
    catch (e) { res.status(400).json({ error: String(e) }); }
  });

  router.delete('/holidays/:id', async (req, res) => {
    try { res.json(await scripts.removeHoliday(parseInt(req.params.id))); }
    catch (e) { res.status(400).json({ error: String(e) }); }
  });

  // Manual payment entry — admin-only (accounts@ has role='admin'). Surfaced
  // as the "+ Add" button on the Payments card in booking detail. Use the
  // existing booking script-create-payment helper which sets dataSource=MANUAL
  // and stamps paidBy with the staff member who recorded the entry.
  router.post('/:bookingId/payments', async (req, res) => {
    const role = (req.session as any).role || 'staff';
    if (role !== 'admin') {
      return res.status(403).json({ error: 'Only admin can manually add payments' });
    }
    try {
      const created = await scripts.addPayment(
        parseInt(req.params.bookingId),
        req.body,
        (req.session as any).user || null,
      );
      res.status(201).json(created);
    } catch (e) { res.status(400).json({ error: String(e) }); }
  });

  // Edit a single payment — Super-Admin OR Accounts (FINANCE_ROLES). Fixes a
  // mis-keyed amount/date/method (e.g. correcting a TransferMate Escrow figure)
  // without deleting and re-adding. Re-rolls amountPaid/amountOpen. Guarded
  // server-side so the field-lock / role can't be bypassed via a direct call.
  router.patch('/:bookingId/payments/:paymentId', async (req, res) => {
    const role = (req.session as any).role || 'staff';
    if (!FINANCE_ROLES.has(role)) {
      return res.status(403).json({ error: 'Only Super Admin or Accounts can edit payments' });
    }
    try {
      const result = await scripts.updatePayment(
        parseInt(req.params.bookingId), parseInt(req.params.paymentId), req.body,
      );
      res.json(result);
    } catch (e: any) { res.status(400).json({ error: e?.message || String(e) }); }
  });

  // Delete a single payment — Super-Admin (role='admin') ONLY. For duplicate
  // payment clearing. Re-rolls amountPaid/amountOpen. Guarded server-side so
  // the field-lock / role can't be bypassed via a direct call.
  router.delete('/:bookingId/payments/:paymentId', async (req, res) => {
    const role = (req.session as any).role || 'staff';
    if (role !== 'admin') {
      return res.status(403).json({ error: 'Only Super Admin can delete payments' });
    }
    try {
      const result = await scripts.deletePayment(parseInt(req.params.bookingId), parseInt(req.params.paymentId));
      res.json(result);
    } catch (e: any) { res.status(400).json({ error: e?.message || String(e) }); }
  });

  return router;
}
