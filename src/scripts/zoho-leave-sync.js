// Zoho People Leave Synchronization (SIS version — no MySQL dependency)
// All teacher data comes from PostgreSQL via route handlers passing it in.
require('dotenv').config();
const ZohoPeopleAPI = require('./zoho-people-api');
const axios = require('axios');

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
     * Get leave records for employee within a date range
     */
    async getEmployeeLeaveDataForPeriod(employeeId, dateFrom = null, dateTo = null) {
        try {
            await this.zohoAPI.loadTokens();

            const response = await axios.get(`${this.zohoAPI.baseUrl.replace('/api', '/people/api')}/forms/leave/getRecords`, {
                params: { sEmpID: employeeId },
                headers: { 'Authorization': `Zoho-oauthtoken ${this.zohoAPI.accessToken}` }
            });

            const leaveRecords = response.data.response.result || [];
            let totalHourlyLeaveTaken = 0;
            let totalSickLeaveTaken = 0;

            const parseZohoDate = (dateStr) => {
                const parts = dateStr.split('-');
                const months = {
                    'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04',
                    'May': '05', 'Jun': '06', 'Jul': '07', 'Aug': '08',
                    'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
                };
                return `${parts[2]}-${months[parts[1]]}-${parts[0]}`;
            };

            for (const record of leaveRecords) {
                const recordId = Object.keys(record)[0];
                const leaveData = record[recordId][0];
                const employeeIdFromRecord = leaveData.Employee_ID ?
                    leaveData.Employee_ID.split(' ').pop() : null;

                if (employeeIdFromRecord === employeeId.toString() &&
                    leaveData.ApprovalStatus === 'Approved') {
                    const fromDate = leaveData.From;
                    const toDate = leaveData.To;
                    const leaveType = leaveData.Leavetype;

                    if (fromDate) {
                        const leaveStartISO = parseZohoDate(fromDate);
                        const leaveEndISO = toDate ? parseZohoDate(toDate) : leaveStartISO;

                        let hasOverlap = true;
                        if (dateFrom && dateTo) {
                            hasOverlap = leaveStartISO <= dateTo && leaveEndISO >= dateFrom;
                        }

                        if (hasOverlap) {
                            const daysTaken = parseFloat(leaveData.Daystaken || 0);
                            const periodStart = new Date(dateFrom);
                            const periodEnd = new Date(dateTo);
                            const leaveStart = new Date(leaveStartISO);
                            const leaveEnd = new Date(leaveEndISO);

                            const overlapStart = leaveStart > periodStart ? leaveStart : periodStart;
                            const overlapEnd = leaveEnd < periodEnd ? leaveEnd : periodEnd;
                            const daysInOverlap = Math.floor((overlapEnd - overlapStart) / (1000 * 60 * 60 * 24)) + 1;
                            const totalDaysInLeave = Math.floor((leaveEnd - leaveStart) / (1000 * 60 * 60 * 24)) + 1;
                            const proratedAmount = (daysInOverlap / totalDaysInLeave) * daysTaken;

                            if (leaveType === 'Hourly Leave') {
                                totalHourlyLeaveTaken += proratedAmount;
                            } else if (leaveType === this.sickLeaveTypeName) {
                                totalSickLeaveTaken += proratedAmount;
                            }
                        }
                    }
                }
            }

            // Get current leave balance
            let leaveBalance = 0;
            try {
                const balanceResponse = await axios.get(`${this.zohoAPI.baseUrl.replace('/api', '/people/api')}/leave/getLeaveTypeDetails`, {
                    params: { userId: employeeId },
                    headers: { 'Authorization': `Zoho-oauthtoken ${this.zohoAPI.accessToken}` }
                });
                if (balanceResponse.data && balanceResponse.data.response) {
                    const leaveTypes = balanceResponse.data.response.result || [];
                    const hourlyLeaveType = leaveTypes.find(lt => lt.Name === 'Hourly Leave');
                    if (hourlyLeaveType) {
                        leaveBalance = parseFloat(hourlyLeaveType.BalanceCount || 0);
                    }
                }
            } catch (balanceError) {
                console.log(`Could not fetch balance for employee ${employeeId}:`, balanceError.message);
            }

            return { leaveTaken: totalHourlyLeaveTaken, sickLeaveTaken: totalSickLeaveTaken, leaveBalance };
        } catch (error) {
            if (error.response?.status === 401) {
                await this.zohoAPI.refreshAccessToken();
                return await this.getEmployeeLeaveDataForPeriod(employeeId, dateFrom, dateTo);
            }
            console.error('Error getting leave data:', error.response?.data || error.message);
            return { leaveTaken: 0, sickLeaveTaken: 0, leaveBalance: 0 };
        }
    }

    /**
     * Get year-to-date leave data for an employee
     */
    async getEmployeeLeaveData(employeeId) {
        try {
            await this.zohoAPI.loadTokens();

            const response = await axios.get(`${this.zohoAPI.baseUrl.replace('/api', '/people/api')}/forms/leave/getRecords`, {
                params: { sEmpID: employeeId },
                headers: { 'Authorization': `Zoho-oauthtoken ${this.zohoAPI.accessToken}` }
            });

            const leaveRecords = response.data.response.result || [];
            let totalHourlyLeaveTaken = 0;
            let totalSickDaysTaken = 0;
            const currentYear = new Date().getFullYear().toString();

            const parseZohoDate = (dateStr) => {
                const parts = dateStr.split('-');
                const months = {
                    'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04',
                    'May': '05', 'Jun': '06', 'Jul': '07', 'Aug': '08',
                    'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
                };
                return `${parts[2]}-${months[parts[1]]}-${parts[0]}`;
            };

            for (const record of leaveRecords) {
                const recordId = Object.keys(record)[0];
                const leaveData = record[recordId][0];
                const employeeIdFromRecord = leaveData.Employee_ID ?
                    leaveData.Employee_ID.split(' ').pop() : null;

                if (employeeIdFromRecord === employeeId.toString() &&
                    leaveData.ApprovalStatus === 'Approved') {
                    const fromDate = leaveData.From;
                    const leaveType = leaveData.Leavetype;

                    if (fromDate && fromDate.includes(currentYear)) {
                        const amountTaken = parseFloat(leaveData.Daystaken || 0);
                        if (leaveType === 'Hourly Leave') {
                            totalHourlyLeaveTaken += amountTaken;
                        } else if (leaveType === this.sickLeaveTypeName) {
                            totalSickDaysTaken += amountTaken;
                        }
                    }
                }
            }

            let leaveBalance = 0;
            let leaveTakenFromZoho = 0;
            try {
                const balanceResponse = await axios.get(`${this.zohoAPI.baseUrl.replace('/api', '/people/api')}/leave/getLeaveTypeDetails`, {
                    params: { userId: employeeId },
                    headers: { 'Authorization': `Zoho-oauthtoken ${this.zohoAPI.accessToken}` }
                });
                if (balanceResponse.data && balanceResponse.data.response) {
                    const leaveTypes = balanceResponse.data.response.result || [];
                    const hourlyLeaveType = leaveTypes.find(lt => lt.Name === 'Hourly Leave');
                    if (hourlyLeaveType) {
                        leaveBalance = parseFloat(hourlyLeaveType.BalanceCount || 0);
                        leaveTakenFromZoho = parseFloat(hourlyLeaveType.AvailedCount || 0);
                    }
                }
            } catch (balanceError) {
                console.log(`Could not fetch balance for employee ${employeeId}:`, balanceError.message);
            }

            const finalLeaveTaken = leaveTakenFromZoho > 0 ? leaveTakenFromZoho : totalHourlyLeaveTaken;
            return { leaveTaken: finalLeaveTaken, sickDaysTaken: totalSickDaysTaken, leaveBalance };
        } catch (error) {
            if (error.response?.status === 401) {
                await this.zohoAPI.refreshAccessToken();
                return await this.getEmployeeLeaveData(employeeId);
            }
            console.error('Error getting leave data:', error.response?.data || error.message);
            return { leaveTaken: 0, sickDaysTaken: 0, leaveBalance: 0 };
        }
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

        // Get overall date range from week labels
        let overallFrom = null;
        let overallTo = null;
        for (const label of weekLabels) {
            const parsed = this.parseWeekLabel(label);
            if (parsed) {
                if (!overallFrom || parsed.from < overallFrom) overallFrom = parsed.from;
                if (!overallTo || parsed.to > overallTo) overallTo = parsed.to;
            }
        }
        if (!overallFrom || !overallTo) return result;

        // Get unique emails
        const uniqueEmails = [...new Set(teachers.map(t => t.email).filter(Boolean))];

        for (const email of uniqueEmails) {
            try {
                const employee = await this.getEmployeeByEmail(email);
                if (!employee) continue;

                // Get leave for the overall date range
                const leaveData = await this.getEmployeeLeaveDataForPeriod(
                    employee.employeeId, overallFrom, overallTo
                );

                // For now, distribute evenly across weeks (Zoho doesn't give per-week granularity easily)
                // The dashboard just shows the total for the period in each week's column
                result[email] = {};
                for (const label of weekLabels) {
                    const parsed = this.parseWeekLabel(label);
                    if (parsed) {
                        // Get leave specifically for this week
                        const weekLeave = await this.getEmployeeLeaveDataForPeriod(
                            employee.employeeId, parsed.from, parsed.to
                        );
                        result[email][label] = {
                            leave: weekLeave.leaveTaken || 0,
                            sick: weekLeave.sickLeaveTaken || 0
                        };
                    }
                }

                // Rate limiting
                await new Promise(resolve => setTimeout(resolve, 300));
            } catch (err) {
                console.error(`Error getting leave for ${email}:`, err.message);
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
