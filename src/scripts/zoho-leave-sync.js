// Zoho People Leave Synchronization (SIS version — no MySQL dependency)
// All teacher data comes from PostgreSQL via route handlers passing it in.
require('dotenv').config();
const ZohoPeopleAPI = require('./zoho-people-api');
const axios = require('axios');

// Module-level shared cache so concurrent requests across the process don't
// each hit Zoho. Keyed by employeeId; entries hold raw records + balance.
const _leaveCache = new Map(); // employeeId → { records, balance, ts }
const _leaveCacheTTL = 60 * 60 * 1000; // 60 min — same as employee cache

class ZohoLeaveSync {
    constructor(options = {}) {
        this.zohoAPI = new ZohoPeopleAPI();
        this.hourlyLeaveTypeId = '20211000000126019'; // Hourly Leave type ID
        this.sickLeaveTypeName = 'Sick Leave';
        this.employeeCache = null;
        this.cacheTimestamp = null;
        this.cacheTTL = 60 * 60 * 1000; // 60 minutes
        this.forceRefresh = options.forceRefresh || false;
    }

    // Pure helper: convert "01-Apr-2026" → "2026-04-01"
    _parseZohoDate(dateStr) {
        const parts = dateStr.split('-');
        const months = {
            'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04',
            'May': '05', 'Jun': '06', 'Jul': '07', 'Aug': '08',
            'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
        };
        return `${parts[2]}-${months[parts[1]]}-${parts[0]}`;
    }

    /**
     * Fetch (and cache) all approved leave records + current balance for one employee.
     * This is the single network entry point for leave data — every caller goes through here.
     * Cache TTL prevents repeated calls within a 60-min window across the whole process.
     */
    async _loadEmployeeLeave(employeeId) {
        const cached = _leaveCache.get(employeeId);
        if (!this.forceRefresh && cached && (Date.now() - cached.ts < _leaveCacheTTL)) {
            return cached;
        }

        // Use the coordinated token gate — never call loadTokens() directly.
        const ok = await this.zohoAPI.ensureValidToken();
        if (!ok) return { records: [], balance: 0, ts: Date.now() };

        const baseUrl = this.zohoAPI.baseUrl.replace('/api', '/people/api');
        const headers = { 'Authorization': `Zoho-oauthtoken ${this.zohoAPI.accessToken}` };

        let records = [];
        try {
            const response = await axios.get(`${baseUrl}/forms/leave/getRecords`, {
                params: { sEmpID: employeeId },
                headers,
            });
            const raw = response.data?.response?.result || [];
            for (const record of raw) {
                const recordId = Object.keys(record)[0];
                const leaveData = record[recordId][0];
                const empId = leaveData.Employee_ID ? leaveData.Employee_ID.split(' ').pop() : null;
                if (empId !== employeeId.toString() || leaveData.ApprovalStatus !== 'Approved') continue;
                if (!leaveData.From) continue;
                records.push({
                    fromIso: this._parseZohoDate(leaveData.From),
                    toIso: leaveData.To ? this._parseZohoDate(leaveData.To) : this._parseZohoDate(leaveData.From),
                    type: leaveData.Leavetype,
                    daysTaken: parseFloat(leaveData.Daystaken || 0),
                });
            }
        } catch (error) {
            if (error.response?.status === 401) {
                // Coordinated refresh — ensureValidToken handles in-flight dedup.
                await this.zohoAPI.ensureValidToken();
                // One retry only — don't loop.
                try {
                    const retry = await axios.get(`${baseUrl}/forms/leave/getRecords`, {
                        params: { sEmpID: employeeId },
                        headers: { 'Authorization': `Zoho-oauthtoken ${this.zohoAPI.accessToken}` },
                    });
                    const raw = retry.data?.response?.result || [];
                    for (const record of raw) {
                        const recordId = Object.keys(record)[0];
                        const leaveData = record[recordId][0];
                        const empId = leaveData.Employee_ID ? leaveData.Employee_ID.split(' ').pop() : null;
                        if (empId !== employeeId.toString() || leaveData.ApprovalStatus !== 'Approved') continue;
                        if (!leaveData.From) continue;
                        records.push({
                            fromIso: this._parseZohoDate(leaveData.From),
                            toIso: leaveData.To ? this._parseZohoDate(leaveData.To) : this._parseZohoDate(leaveData.From),
                            type: leaveData.Leavetype,
                            daysTaken: parseFloat(leaveData.Daystaken || 0),
                        });
                    }
                } catch (e) {
                    console.error(`[zoho-leave] retry failed for ${employeeId}:`, e.response?.data || e.message);
                }
            } else {
                console.error(`[zoho-leave] fetch failed for ${employeeId}:`, error.response?.data || error.message);
            }
        }

        let balance = 0;
        try {
            const balResp = await axios.get(`${baseUrl}/leave/getLeaveTypeDetails`, {
                params: { userId: employeeId },
                headers,
            });
            const leaveTypes = balResp.data?.response?.result || [];
            const hourly = leaveTypes.find(lt => lt.Name === 'Hourly Leave');
            if (hourly) balance = parseFloat(hourly.BalanceCount || 0);
        } catch (e) {
            // Balance is non-critical — log and continue.
            console.log(`[zoho-leave] balance unavailable for ${employeeId}:`, e.message);
        }

        const entry = { records, balance, ts: Date.now() };
        _leaveCache.set(employeeId, entry);
        return entry;
    }

    /**
     * In-memory summary of cached leave records for an arbitrary date range.
     * Used by the various dashboard views — no network calls.
     */
    _summarizeForRange(records, balance, dateFrom, dateTo) {
        // Pro-rate a multi-day Zoho leave block to the days that fall inside the period.
        //
        // The naive uniform split (daysTaken × overlap/total) breaks when the daily
        // distribution isn't even — typical Zoho 'Hourly Leave' is full days at the
        // start and a partial day at the end, e.g. 6+6+6+6+3 = 27. Uniform pro-rate
        // over-allocates the partial day's shortness across all overlapping days.
        // Instead, front-load full TYPICAL_DAY_HOURS days from the start of the leave,
        // letting any leftover land on the trailing day.
        // For genuinely uniform partial leave (rare here), fall back to uniform when
        // the average per day is well below a full day.
        const TYPICAL_DAY_HOURS = 6;
        const allocate = (r, periodStart, periodEnd) => {
            const leaveStart = new Date(r.fromIso);
            const leaveEnd = new Date(r.toIso);
            const totalDays = Math.floor((leaveEnd - leaveStart) / 86400000) + 1;
            const avgPerDay = r.daysTaken / totalDays;
            // Heuristic: if avg is close to a full day, assume full-day-then-partial
            // pattern; otherwise treat as uniformly partial.
            if (avgPerDay >= TYPICAL_DAY_HOURS * 0.5) {
                let remaining = r.daysTaken;
                let allocated = 0;
                for (let i = 0; i < totalDays && remaining > 0; i++) {
                    const d = new Date(leaveStart);
                    d.setDate(d.getDate() + i);
                    const dayHours = Math.min(TYPICAL_DAY_HOURS, remaining);
                    if (d >= periodStart && d <= periodEnd) allocated += dayHours;
                    remaining -= dayHours;
                }
                return allocated;
            }
            // Uniform fallback (each day was a small slice of the same size).
            const overlapStart = leaveStart > periodStart ? leaveStart : periodStart;
            const overlapEnd = leaveEnd < periodEnd ? leaveEnd : periodEnd;
            const daysInOverlap = Math.floor((overlapEnd - overlapStart) / 86400000) + 1;
            return avgPerDay * daysInOverlap;
        };

        let totalHourlyLeave = 0;
        let totalSickLeave = 0;
        const periodStart = new Date(dateFrom);
        const periodEnd = new Date(dateTo);
        for (const r of records) {
            if (r.fromIso > dateTo || r.toIso < dateFrom) continue;
            const allocated = allocate(r, periodStart, periodEnd);
            if (r.type === 'Hourly Leave') totalHourlyLeave += allocated;
            else if (r.type === this.sickLeaveTypeName) totalSickLeave += allocated;
        }
        return { leaveTaken: totalHourlyLeave, sickLeaveTaken: totalSickLeave, leaveBalance: balance };
    }

    /**
     * Per-day leave breakdown for a single employee in [dateFrom, dateTo].
     * Returns { 'YYYY-MM-DD': { hours, type } }. Front-loads typical full days
     * for multi-day blocks (matches _summarizeForRange semantics).
     */
    async getDailyLeaveBreakdown(employeeId, dateFrom, dateTo) {
        const { records } = await this._loadEmployeeLeave(employeeId);
        const TYPICAL_DAY_HOURS = 6;
        const result = {};
        const periodStart = new Date(dateFrom);
        const periodEnd = new Date(dateTo);
        for (const r of records) {
            if (r.fromIso > dateTo || r.toIso < dateFrom) continue;
            const leaveStart = new Date(r.fromIso);
            const leaveEnd = new Date(r.toIso);
            const totalDays = Math.floor((leaveEnd - leaveStart) / 86400000) + 1;
            const avgPerDay = r.daysTaken / totalDays;
            if (avgPerDay >= TYPICAL_DAY_HOURS * 0.5) {
                let remaining = r.daysTaken;
                for (let i = 0; i < totalDays && remaining > 0; i++) {
                    const d = new Date(leaveStart);
                    d.setDate(d.getDate() + i);
                    const dayHours = Math.min(TYPICAL_DAY_HOURS, remaining);
                    if (d >= periodStart && d <= periodEnd) {
                        const key = d.toISOString().slice(0,10);
                        if (!result[key]) result[key] = { hours: 0, type: r.type };
                        result[key].hours += dayHours;
                    }
                    remaining -= dayHours;
                }
            } else {
                for (let i = 0; i < totalDays; i++) {
                    const d = new Date(leaveStart);
                    d.setDate(d.getDate() + i);
                    if (d >= periodStart && d <= periodEnd) {
                        const key = d.toISOString().slice(0,10);
                        if (!result[key]) result[key] = { hours: 0, type: r.type };
                        result[key].hours += avgPerDay;
                    }
                }
            }
        }
        return result;
    }

    /**
     * Used by the payroll engine: returns a Set of YYYY-MM-DD strings on which the
     * employee has APPROVED Hourly Leave (or Sick Leave) overlapping [dateFrom, dateTo].
     * Empty set on missing employee or no leave.
     */
    async getLeaveDates(email, dateFrom, dateTo) {
        const result = new Set();
        const employee = await this.getEmployeeByEmail(email);
        if (!employee) return result;
        const { records } = await this._loadEmployeeLeave(employee.employeeId);
        for (const r of records) {
            // Iterate every day in the leave window that intersects the range.
            const start = r.fromIso > dateFrom ? r.fromIso : dateFrom;
            const end = r.toIso < dateTo ? r.toIso : dateTo;
            if (start > end) continue;
            for (let d = new Date(start); d <= new Date(end); d.setDate(d.getDate() + 1)) {
                result.add(d.toISOString().split('T')[0]);
            }
        }
        return result;
    }

    /**
     * Get all employees from Zoho (with caching)
     */
    async getAllEmployees() {
        if (!this.forceRefresh && this.employeeCache && this.cacheTimestamp &&
            (Date.now() - this.cacheTimestamp < this.cacheTTL)) {
            return this.employeeCache;
        }

        try {
            await this.zohoAPI.loadTokens();
            const response = await axios.get(`${this.zohoAPI.baseUrl}/forms/P_EmployeeView/records`, {
                headers: { 'Authorization': `Zoho-oauthtoken ${this.zohoAPI.accessToken}` }
            });

            if (response.data && Array.isArray(response.data)) {
                this.employeeCache = response.data;
                this.cacheTimestamp = Date.now();
                return response.data;
            }
            return [];
        } catch (error) {
            if (error.response?.status === 401) {
                await this.zohoAPI.refreshAccessToken();
                return await this.getAllEmployees();
            }
            console.error('Error getting employees:', error.response?.data || error.message);
            if (this.employeeCache) return this.employeeCache;
            return [];
        }
    }

    /**
     * Get employee by email (from cache)
     */
    async getEmployeeByEmail(email) {
        try {
            const allEmployees = await this.getAllEmployees();
            const employee = allEmployees.find(emp =>
                emp['Email ID']?.toLowerCase() === email.toLowerCase()
            );
            if (employee) {
                return {
                    employeeId: employee.EmployeeID || employee.recordId,
                    fullRecordId: employee.recordId,
                    firstName: employee['First Name'],
                    lastName: employee['Last Name'],
                    email: employee['Email ID']
                };
            }
            return null;
        } catch (error) {
            console.error('Error getting employee:', error.message);
            return null;
        }
    }

    /**
     * Get leave records for employee within a date range — cache-backed.
     * Falls through to _loadEmployeeLeave (one network call per employee per 60min)
     * and re-summarizes in-memory for any number of distinct ranges.
     */
    async getEmployeeLeaveDataForPeriod(employeeId, dateFrom = null, dateTo = null) {
        const { records, balance } = await this._loadEmployeeLeave(employeeId);
        if (!dateFrom || !dateTo) {
            // Caller wants all-time totals — sum without date filtering.
            return this._summarizeForRange(records, balance, '0000-01-01', '9999-12-31');
        }
        return this._summarizeForRange(records, balance, dateFrom, dateTo);
    }

    /**
     * Get year-to-date leave data for an employee — cache-backed.
     */
    async getEmployeeLeaveData(employeeId) {
        const { records, balance } = await this._loadEmployeeLeave(employeeId);
        const yearStart = `${new Date().getFullYear()}-01-01`;
        const yearEnd = `${new Date().getFullYear()}-12-31`;
        let totalHourlyLeaveTaken = 0;
        let totalSickDaysTaken = 0;
        for (const r of records) {
            if (r.fromIso < yearStart || r.fromIso > yearEnd) continue;
            if (r.type === 'Hourly Leave') totalHourlyLeaveTaken += r.daysTaken;
            else if (r.type === this.sickLeaveTypeName) totalSickDaysTaken += r.daysTaken;
        }
        return { leaveTaken: totalHourlyLeaveTaken, sickDaysTaken: totalSickDaysTaken, leaveBalance: balance };
    }

    // ── Dashboard methods (called by routes) ─────────────────────────────

    /**
     * Parse a week label like "Week 08, 16/02/2026 – 22/02/2026" into date range
     */
    parseWeekLabel(weekLabel) {
        const match = weekLabel.match(/Week \d+, (\d{2})\/(\d{2})\/(\d{4})\s*[–-]\s*(\d{2})\/(\d{2})\/(\d{4})/);
        if (!match) return null;
        return {
            from: `${match[3]}-${match[2]}-${match[1]}`,
            to: `${match[6]}-${match[5]}-${match[4]}`
        };
    }

    /**
     * Get leave data organized by email → week label → { leave, sick }
     * Called by the weekly detail view in the dashboard.
     * @param {string[]} weekLabels - Array of week label strings
     * @param {Array<{email: string}>} teachers - Teacher records with emails
     */
    async getLeaveByWeeks(weekLabels, teachers) {
        const result = {};
        if (!weekLabels || weekLabels.length === 0 || !teachers || teachers.length === 0) return result;

        const uniqueEmails = [...new Set(teachers.map(t => t.email).filter(Boolean))];

        // ONE network call per teacher (cache-backed). All week summaries below are in-memory.
        for (const email of uniqueEmails) {
            try {
                const employee = await this.getEmployeeByEmail(email);
                if (!employee) continue;
                const { records, balance } = await this._loadEmployeeLeave(employee.employeeId);
                result[email] = {};
                for (const label of weekLabels) {
                    const parsed = this.parseWeekLabel(label);
                    if (!parsed) continue;
                    const weekLeave = this._summarizeForRange(records, balance, parsed.from, parsed.to);
                    result[email][label] = {
                        leave: weekLeave.leaveTaken || 0,
                        sick:  weekLeave.sickLeaveTaken || 0,
                    };
                }
            } catch (err) {
                console.error(`[zoho-leave] week-summary failed for ${email}:`, err.message);
            }
        }

        return result;
    }

    /**
     * Get leave data for a payroll period.
     * Called by the monthly summary view.
     * @param {string} dateFrom - Period start (YYYY-MM-DD)
     * @param {string} dateTo - Period end (YYYY-MM-DD)
     * @param {Array<{email: string, teacherName: string}>} teachers - Teacher records
     */
    async getLeaveForPeriod(dateFrom, dateTo, teachers) {
        const result = {};
        if (!teachers || teachers.length === 0) return result;

        const uniqueEmails = [...new Set(teachers.map(t => t.email).filter(Boolean))];

        for (const email of uniqueEmails) {
            try {
                const employee = await this.getEmployeeByEmail(email);
                if (!employee) continue;

                const leaveData = await this.getEmployeeLeaveDataForPeriod(
                    employee.employeeId, dateFrom, dateTo
                );

                result[email] = {
                    leave_taken: leaveData.leaveTaken || 0,
                    sick_days: leaveData.sickLeaveTaken || 0,
                    leave_balance: leaveData.leaveBalance || 0
                };

                await new Promise(resolve => setTimeout(resolve, 300));
            } catch (err) {
                console.error(`Error getting leave for ${email}:`, err.message);
            }
        }

        return result;
    }

    /**
     * Update leave balances in Zoho for all teachers in a period.
     * Called by the monthly view "Update Leave Balances" button.
     * @param {Record<string, {email: string, totalHours: number}>} byTeacher - Teacher data from PostgreSQL
     * @param {string} updateDate - Date to record the balance update (YYYY-MM-DD)
     */
    async updateLeaveBalances(byTeacher, updateDate) {
        const results = [];
        let successCount = 0;
        let failCount = 0;

        for (const [teacherName, data] of Object.entries(byTeacher)) {
            const { email, totalHours } = data;
            if (!email) {
                results.push({ success: false, teacherName, error: 'No email' });
                failCount++;
                continue;
            }

            try {
                const employee = await this.getEmployeeByEmail(email);
                if (!employee) {
                    results.push({ success: false, teacherName, email, error: 'Not found in Zoho' });
                    failCount++;
                    continue;
                }

                // Get current balance from Zoho
                const startBalance = await this.zohoAPI.getLeaveBalanceAsOfDate(
                    employee.fullRecordId, this.hourlyLeaveTypeId, updateDate
                );

                // Calculate accrual (8% of hours worked)
                const leaveAccrued = totalHours * 0.08;

                // Get leave taken in period (we use the balance API rather than re-querying records)
                // The new balance = current Zoho balance + accrued
                // (leave taken is already subtracted in the Zoho balance)
                const newBalance = startBalance + leaveAccrued;

                // Format date for Zoho
                const dateObj = new Date(updateDate);
                const formattedDate = dateObj.toLocaleDateString('en-GB', {
                    day: '2-digit', month: 'short', year: 'numeric'
                });

                const updateSuccess = await this.zohoAPI.updateEmployeeLeaveBalance(
                    employee.fullRecordId || employee.employeeId,
                    this.hourlyLeaveTypeId,
                    newBalance,
                    formattedDate,
                    `Payroll accrual: ${totalHours.toFixed(2)}h worked × 8% = ${leaveAccrued.toFixed(2)}h`
                );

                if (updateSuccess) {
                    results.push({
                        success: true, teacherName, email,
                        startBalance, leaveAccrued, newBalance
                    });
                    successCount++;
                } else {
                    results.push({ success: false, teacherName, email, error: 'Zoho update failed' });
                    failCount++;
                }

                await new Promise(resolve => setTimeout(resolve, 500));
            } catch (err) {
                results.push({ success: false, teacherName, email, error: err.message });
                failCount++;
            }
        }

        return {
            success: true,
            totalProcessed: Object.keys(byTeacher).length,
            successCount, failCount, results
        };
    }

    /**
     * Sync leave data for all teachers (YTD).
     * Called by the "Get Zoho Leave" button in summary view.
     * @param {Array<{teacherName: string, email: string}>} teachers - Teachers from PostgreSQL
     */
    async syncAllTeachersLeave(teachers) {
        const results = [];
        let successCount = 0;
        let failCount = 0;

        for (const teacher of teachers) {
            if (!teacher.email) {
                results.push({ success: false, email: '', error: 'No email' });
                failCount++;
                continue;
            }

            try {
                const employee = await this.getEmployeeByEmail(teacher.email);
                if (!employee) {
                    results.push({ success: false, email: teacher.email, error: 'Not found in Zoho' });
                    failCount++;
                    continue;
                }

                const leaveData = await this.getEmployeeLeaveData(employee.employeeId);
                results.push({
                    success: true,
                    email: teacher.email,
                    teacherName: teacher.teacherName,
                    leaveTaken: leaveData.leaveTaken,
                    sickDaysTaken: leaveData.sickDaysTaken,
                    leaveBalance: leaveData.leaveBalance
                });
                successCount++;

                await new Promise(resolve => setTimeout(resolve, 500));
            } catch (err) {
                results.push({ success: false, email: teacher.email, error: err.message });
                failCount++;
            }
        }

        return {
            success: true,
            totalProcessed: teachers.length,
            successCount, failCount, results
        };
    }
}

module.exports = ZohoLeaveSync;
