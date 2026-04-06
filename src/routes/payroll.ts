import { Router } from 'express';
import { PrismaClient } from '../generated/prisma/client';
import { payrollScripts } from '../scripts/payroll';

export function payrollRoutes(prisma: PrismaClient) {
  const router = Router();
  const scripts = payrollScripts(prisma);

  // ── Periods ─────────────────────────────────
  router.get('/periods', async (req, res) => {
    try {
      const year = req.query.year ? parseInt(req.query.year as string) : undefined;
      const periods = await scripts.listPeriods(year);
      const current = await scripts.getCurrentPeriod();
      res.json({ success: true, data: { periods, current, availableYears: [...new Set(periods.map((p: any) => p.year))] } });
    } catch (e) { res.status(500).json({ success: false, error: String(e) }); }
  });

  // ── Data (main weekly view — matches Hub dashboard /data endpoint) ──
  router.get('/data', async (req, res) => {
    try {
      const { dateFrom, dateTo, year } = req.query;

      let from: string, to: string;
      if (dateFrom && dateTo) {
        from = dateFrom as string;
        to = dateTo as string;
      } else if (year) {
        const periods = await scripts.listPeriods(parseInt(year as string));
        if (periods.length === 0) return res.json({ success: true, data: {} });
        from = (periods[0] as any).dateFrom.toISOString().split('T')[0];
        to = (periods[periods.length - 1] as any).dateTo.toISOString().split('T')[0];
      } else {
        // Default to current year
        const currentYear = new Date().getFullYear();
        const periods = await scripts.listPeriods(currentYear);
        if (periods.length === 0) return res.json({ success: true, data: {} });
        from = (periods[0] as any).dateFrom.toISOString().split('T')[0];
        to = (periods[periods.length - 1] as any).dateTo.toISOString().split('T')[0];
      }

      const entries = await prisma.teacherPayrollEntry.findMany({
        where: { weekFrom: { gte: new Date(from) }, weekTo: { lte: new Date(to) } },
        orderBy: [{ teacherName: 'asc' }, { weekFrom: 'asc' }, { className: 'asc' }],
      });

      // Group by teacher → weeks (matches Hub dashboard format)
      const teacherData: Record<string, any> = {};
      for (const e of entries) {
        const teacher = e.teacherName;
        if (!teacherData[teacher]) {
          teacherData[teacher] = {
            name: teacher,
            email: e.email || '',
            pps_number: e.ppsNumber || '',
            weeks: {},
            total_hours: 0,
            total_pay: 0,
          };
        }

        const week = e.weekLabel;
        if (!teacherData[teacher].weeks[week]) {
          teacherData[teacher].weeks[week] = {
            week_label: week,
            classes: [],
            total_hours: 0,
            total_pay: 0,
            can_auto_populate: true,
            auto_populate_reason: '',
            hours_included_this_month: e.hoursIncludedThisMonth ? Number(e.hoursIncludedThisMonth) : null,
            weekly_pay: e.weeklyPay ? Number(e.weeklyPay) : null,
            manager_checked: e.managerChecked,
          };
        }

        const hours = Number(e.hours);
        const amount = Number(e.amount);
        const rate = Number(e.hourlyRate);

        teacherData[teacher].weeks[week].classes.push({
          class_name: e.className,
          course_list: e.courseList || '',
          student_count: e.studentCount || 0,
          hours: hours,
          rate_per_lesson: rate,
          salary_amount: amount,
          days: '',
          cost_category: '',
        });

        teacherData[teacher].weeks[week].total_hours += hours;
        teacherData[teacher].weeks[week].total_pay += amount;

        if (!e.canAutoPopulate) {
          teacherData[teacher].weeks[week].can_auto_populate = false;
          teacherData[teacher].weeks[week].auto_populate_reason = e.autoPopulateReason || '';
        }

        teacherData[teacher].total_hours += hours;
        teacherData[teacher].total_pay += amount;
      }

      res.json({ success: true, data: teacherData });
    } catch (e) { res.status(500).json({ success: false, error: String(e) }); }
  });

  // ── Summary ─────────────────────────────────
  router.get('/summary', async (req, res) => {
    try {
      const year = req.query.year ? parseInt(req.query.year as string) : new Date().getFullYear();
      const periods = await scripts.listPeriods(year);

      const entries = await prisma.teacherPayrollEntry.findMany({
        where: {
          weekFrom: { gte: new Date(year + '-01-01') },
          weekTo: { lte: new Date(year + '-12-31') },
        },
      });

      // Aggregate by teacher (field names match Hub dashboard expectations)
      const byTeacher: Record<string, { teacher_name: string; email: string; pps_number: string; total_hours: number; total_pay: number; average_rate: number; leave_accrued: number; leave_taken: number; leave_balance: number; sick_days: number }> = {};
      for (const e of entries) {
        if (!byTeacher[e.teacherName]) {
          byTeacher[e.teacherName] = {
            teacher_name: e.teacherName, email: e.email || '', pps_number: e.ppsNumber || '',
            total_hours: 0, total_pay: 0, average_rate: 0,
            leave_accrued: 0, leave_taken: Number(e.leaveTaken || 0), leave_balance: Number(e.leaveBalance || 0),
            sick_days: Number(e.sickDays || 0),
          };
        }
        byTeacher[e.teacherName].total_hours += Number(e.hours);
        byTeacher[e.teacherName].total_pay += Number(e.amount);
      }
      for (const t of Object.values(byTeacher)) {
        t.average_rate = t.total_hours > 0 ? Math.round(t.total_pay / t.total_hours * 100) / 100 : 0;
        t.leave_accrued = Math.round(t.total_hours * 0.08 * 100) / 100;
      }

      res.json({ success: true, data: Object.values(byTeacher).sort((a, b) => a.teacher_name.localeCompare(b.teacher_name)) });
    } catch (e) { res.status(500).json({ success: false, error: String(e) }); }
  });

  // ── Refresh ─────────────────────────────────
  router.post('/refresh', async (req, res) => {
    try {
      const { dateFrom, dateTo, from, to } = req.body;
      const f = dateFrom || from;
      const t = dateTo || to;
      if (!f || !t) return res.status(400).json({ success: false, error: 'dateFrom and dateTo required' });
      const result = await scripts.refreshPayroll(f, t);
      res.json({ success: true, ...result });
    } catch (e) { res.status(500).json({ success: false, error: String(e) }); }
  });

  // ── Update hours (edit a week's hours) ──────
  router.post('/update-hours', async (req, res) => {
    try {
      const { compositeKey, composite_key, teacher_name, week, hours, hours_included, weeklyPay, weekly_pay, hoursIncludedThisMonth, leave_hours, sick_days } = req.body;
      const key = compositeKey || composite_key;

      // Find entries by compositeKey OR by teacher_name + week label
      let entries: any[] = [];
      if (key) {
        const entry = await prisma.teacherPayrollEntry.findUnique({ where: { compositeKey: key } });
        if (entry) entries = [entry];
      } else if (teacher_name && week) {
        entries = await prisma.teacherPayrollEntry.findMany({
          where: { teacherName: teacher_name, weekLabel: week },
        });
      }

      if (entries.length === 0) return res.status(404).json({ success: false, error: 'Entry not found' });

      const newHoursIncluded = hours_included !== undefined ? parseFloat(hours_included) : (hoursIncludedThisMonth !== undefined ? parseFloat(hoursIncludedThisMonth) : undefined);
      const newWeeklyPay = weekly_pay !== undefined ? parseFloat(weekly_pay) : (weeklyPay !== undefined ? parseFloat(weeklyPay) : undefined);

      for (const entry of entries) {
        const newHours = hours !== undefined ? parseFloat(hours) : Number(entry.hours);
        const amount = Math.round(newHours * Number(entry.hourlyRate) * 100) / 100;

        await prisma.teacherPayrollEntry.update({
          where: { compositeKey: entry.compositeKey },
          data: {
            hours: newHours,
            amount,
            ...(newWeeklyPay !== undefined ? { weeklyPay: newWeeklyPay } : {}),
            ...(newHoursIncluded !== undefined ? { hoursIncludedThisMonth: newHoursIncluded } : {}),
          },
        });
      }

      res.json({ success: true, message: 'Hours updated' });
    } catch (e) { res.status(400).json({ success: false, error: String(e) }); }
  });

  // ── Update email ────────────────────────────
  router.post('/update-email', async (req, res) => {
    try {
      const { teacherName, teacher_name, email } = req.body;
      const name = teacherName || teacher_name;
      await prisma.teacherPayrollEntry.updateMany({
        where: { teacherName: name },
        data: { email },
      });
      res.json({ success: true });
    } catch (e) { res.status(400).json({ success: false, error: String(e) }); }
  });

  // ── Reset week ──────────────────────────────
  router.post('/reset-week', async (req, res) => {
    try {
      const { compositeKey, composite_key, teacher_name, week } = req.body;
      const key = compositeKey || composite_key;

      if (key) {
        await prisma.teacherPayrollEntry.update({
          where: { compositeKey: key },
          data: { hoursIncludedThisMonth: null, weeklyPay: null },
        });
      } else if (teacher_name && week) {
        await prisma.teacherPayrollEntry.updateMany({
          where: { teacherName: teacher_name, weekLabel: week },
          data: { hoursIncludedThisMonth: null, weeklyPay: null },
        });
      } else {
        return res.status(400).json({ success: false, error: 'compositeKey or teacher_name+week required' });
      }
      res.json({ success: true });
    } catch (e) { res.status(400).json({ success: false, error: String(e) }); }
  });

  // ── Leave by weeks (for weekly detail view) ──
  router.get('/leave-by-weeks', async (req, res) => {
    try {
      const ZohoLeaveSync = require('../scripts/zoho-leave-sync');
      const sync = new ZohoLeaveSync({ forceRefresh: req.query.forceRefresh === 'true' });

      // Dashboard sends weeks as "Week 01, ...|||Week 02, ..."
      const weeksParam = req.query.weeks as string;
      const { dateFrom, dateTo } = req.query;

      let weekLabels: string[] = [];
      if (weeksParam) {
        weekLabels = decodeURIComponent(weeksParam).split('|||').filter(Boolean);
      } else if (dateFrom && dateTo) {
        // Fallback: get week labels from DB entries in the date range
        const entries = await prisma.teacherPayrollEntry.findMany({
          where: { weekFrom: { gte: new Date(dateFrom as string) }, weekTo: { lte: new Date(dateTo as string) } },
          select: { weekLabel: true },
          distinct: ['weekLabel'],
        });
        weekLabels = entries.map(e => e.weekLabel);
      }

      if (weekLabels.length === 0) return res.json({ success: true, data: {} });

      // Get teachers with emails from DB
      const teachers = await prisma.teacherPayrollEntry.findMany({
        where: { email: { not: '' } },
        select: { email: true },
        distinct: ['email'],
      });

      const data = await sync.getLeaveByWeeks(weekLabels, teachers);
      res.json({ success: true, data: data || {} });
    } catch (e: any) {
      console.error('leave-by-weeks error:', e.message);
      res.json({ success: true, data: {} }); // graceful fallback
    }
  });

  // ── Leave for period ──
  router.get('/leave-for-period', async (req, res) => {
    try {
      const ZohoLeaveSync = require('../scripts/zoho-leave-sync');
      const sync = new ZohoLeaveSync({ forceRefresh: req.query.forceRefresh === 'true' });
      const { dateFrom, dateTo } = req.query;
      if (!dateFrom || !dateTo) return res.json({ success: true, data: {} });

      // Get teachers with emails from DB
      const teachers = await prisma.teacherPayrollEntry.findMany({
        where: {
          email: { not: '' },
          weekFrom: { gte: new Date(dateFrom as string) },
          weekTo: { lte: new Date(dateTo as string) },
        },
        select: { email: true, teacherName: true },
        distinct: ['email'],
      });

      const data = await sync.getLeaveForPeriod(dateFrom, dateTo, teachers);
      res.json({ success: true, data: data || {} });
    } catch (e: any) {
      console.error('leave-for-period error:', e.message);
      res.json({ success: true, data: {} });
    }
  });

  // ── PPS for teachers ────────────────────────
  router.get('/pps-for-teachers', async (req, res) => {
    try {
      const entries = await prisma.teacherPayrollEntry.findMany({
        where: { ppsNumber: { not: null } },
        select: { teacherName: true, ppsNumber: true },
        distinct: ['teacherName'],
      });
      const data: Record<string, string> = {};
      for (const e of entries) {
        if (e.ppsNumber) data[e.teacherName] = e.ppsNumber;
      }
      res.json({ success: true, data, count: Object.keys(data).length });
    } catch (e) { res.status(500).json({ success: false, error: String(e) }); }
  });

  // ── Update PPS ──────────────────────────────
  router.post('/update-pps', async (req, res) => {
    try {
      const { teacher_name, pps_number } = req.body;
      await prisma.teacherPayrollEntry.updateMany({
        where: { teacherName: teacher_name },
        data: { ppsNumber: pps_number },
      });
      res.json({ success: true });
    } catch (e) { res.status(400).json({ success: false, error: String(e) }); }
  });

  // ── Monthly adjustments ─────────────────────
  router.get('/monthly-adjustments', async (req, res) => {
    try {
      const { month, year } = req.query;
      if (!month || !year) return res.json({ success: true, data: {} });
      const adjs = await prisma.teacherMonthlyAdjustment.findMany({
        where: { month: month as string, year: parseInt(year as string) },
      });
      const data: Record<string, any> = {};
      for (const a of adjs) {
        data[a.teacherName] = { other: Number(a.other || 0), impact_bonus: Number(a.impactBonus || 0) };
      }
      res.json({ success: true, data });
    } catch (e) { res.status(500).json({ success: false, error: String(e) }); }
  });

  // ── Update monthly adjustment ───────────────
  router.post('/update-monthly-adjustment', async (req, res) => {
    try {
      const { teacher_name, month, year, field, value } = req.body;
      const data: any = {};
      if (field === 'other') data.other = parseFloat(value) || 0;
      if (field === 'impact_bonus') data.impactBonus = parseFloat(value) || 0;

      await prisma.teacherMonthlyAdjustment.upsert({
        where: { teacherName_month_year: { teacherName: teacher_name, month, year: parseInt(year) } },
        update: data,
        create: { teacherName: teacher_name, month, year: parseInt(year), ...data },
      });
      res.json({ success: true });
    } catch (e) { res.status(400).json({ success: false, error: String(e) }); }
  });

  // ── Update leave balances (Zoho) ─────
  router.post('/update-leave-balances', async (req, res) => {
    try {
      const ZohoLeaveSync = require('../scripts/zoho-leave-sync');
      const sync = new ZohoLeaveSync({});
      const { dateFrom, dateTo, updateDate } = req.body;
      if (!dateFrom || !dateTo) return res.status(400).json({ success: false, error: 'dateFrom and dateTo required' });

      // Get teacher data from payroll entries
      const entries = await prisma.teacherPayrollEntry.findMany({
        where: { weekFrom: { gte: new Date(dateFrom) }, weekTo: { lte: new Date(dateTo) } },
        select: { teacherName: true, email: true, hours: true },
      });

      // Aggregate hours by teacher
      const byTeacher: Record<string, { email: string; totalHours: number }> = {};
      for (const e of entries) {
        if (!byTeacher[e.teacherName]) byTeacher[e.teacherName] = { email: e.email || '', totalHours: 0 };
        byTeacher[e.teacherName].totalHours += Number(e.hours);
      }

      const result = await sync.updateLeaveBalances(byTeacher, updateDate || dateTo);
      res.json({ success: true, ...result });
    } catch (e: any) { res.status(500).json({ success: false, error: e.message }); }
  });

  // ── Sync all teachers leave (YTD from Zoho) ──
  router.post('/sync-leave', async (req, res) => {
    try {
      const ZohoLeaveSync = require('../scripts/zoho-leave-sync');
      const sync = new ZohoLeaveSync({});

      // Get all teachers with emails
      const teachers = await prisma.teacherPayrollEntry.findMany({
        where: { email: { not: '' } },
        select: { teacherName: true, email: true },
        distinct: ['teacherName'],
      });

      const result = await sync.syncAllTeachersLeave(teachers);

      // Update leave data in our DB for each successful result
      for (const r of result.results) {
        if (r.success && r.email) {
          await prisma.teacherPayrollEntry.updateMany({
            where: { email: r.email },
            data: {
              leaveTaken: r.leaveTaken || 0,
              sickDays: r.sickDaysTaken || 0,
              leaveBalance: r.leaveBalance || 0,
            },
          });
        }
      }

      res.json({ success: true, ...result });
    } catch (e: any) { res.status(500).json({ success: false, error: e.message }); }
  });

  // ── Zoho employee search by name ─────────────
  router.get('/zoho-search', async (req, res) => {
    try {
      const ZohoPeopleAPI = require('../scripts/zoho-people-api');
      const zoho = new ZohoPeopleAPI();
      const { firstName, lastName } = req.query;
      if (!firstName || !lastName) return res.status(400).json({ success: false, error: 'firstName and lastName required' });

      const employee = await zoho.searchEmployeeByName(firstName as string, lastName as string);
      if (employee) {
        res.json({ success: true, employee });
      } else {
        res.json({ success: false, error: 'Employee not found' });
      }
    } catch (e: any) { res.status(500).json({ success: false, error: e.message }); }
  });

  // ── Authorize ───────────────────────────────
  router.post('/authorize', async (req, res) => {
    try {
      const { period, year, authorizedBy } = req.body;
      res.json(await scripts.authorizePayroll(period, year, authorizedBy || 'admin'));
    } catch (e) { res.status(400).json({ success: false, error: String(e) }); }
  });

  return router;
}
