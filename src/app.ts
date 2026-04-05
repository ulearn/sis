import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from './generated/prisma/client';
import { setupLogger } from './scripts/logger';

dotenv.config();
setupLogger();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool as any);
const prisma = new PrismaClient({ adapter });

import { studentRoutes } from './routes/students';
import { bookingRoutes } from './routes/bookings';
import { classRoutes } from './routes/classes';
import { accommodationRoutes } from './routes/accommodation';
import { webhookRoutes } from './routes/webhooks';
import { attendanceRoutes } from './routes/attendance';
import { documentRoutes } from './routes/documents';
import { emailRoutes } from './routes/email';
import { hostPaymentRoutes } from './routes/host-payments';
import { documentScripts } from './scripts/documents';
import { seedClassrooms } from './scripts/seed';
import { seedDocumentTemplates } from './scripts/seed-templates';

const app = express();
app.use(express.json());

// Serve admin UI
app.get('/sis/admin', (_req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'admin.html'));
});

// API routes
app.use('/sis/api/students', studentRoutes(prisma));
app.use('/sis/api/bookings', bookingRoutes(prisma));
app.use('/sis/api/classes', classRoutes(prisma));
app.use('/sis/api/accommodation', accommodationRoutes(prisma));
app.use('/sis/api/webhooks', webhookRoutes(prisma));
app.use('/sis/api/attendance', attendanceRoutes(prisma));
app.use('/sis/api/documents', documentRoutes(prisma));
app.use('/sis/api/email', emailRoutes(prisma));
app.use('/sis/api/host-payments', hostPaymentRoutes(prisma));

// School config (select options etc)
app.get('/sis/api/config', async (_req, res) => {
  try {
    const rows = await prisma.schoolConfig.findMany();
    const config: Record<string, any> = {};
    for (const r of rows) {
      try { config[r.key] = JSON.parse(r.value); } catch { config[r.key] = r.value; }
    }
    res.json(config);
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

// Public verification page (no auth)
const docScripts = documentScripts(prisma);

app.get('/sis/verify/:token', async (req, res) => {
  try {
    const result = await docScripts.verify(req.params.token as string);
    if (!result) {
      return res.status(404).send(verificationPage(null));
    }
    res.send(verificationPage(result));
  } catch (e) { res.status(500).send('Verification error'); }
});

function verificationPage(data: any) {
  const statusColor = !data ? '#dc2626'
    : data.status === 'ISSUED' ? '#059669'
    : data.status === 'SUPERSEDED' ? '#d97706'
    : data.status === 'REVOKED' ? '#dc2626'
    : '#6b7280';
  const statusText = !data ? 'NOT FOUND'
    : data.status === 'ISSUED' ? 'VALID'
    : data.status === 'SUPERSEDED' ? 'SUPERSEDED'
    : data.status === 'REVOKED' ? 'REVOKED'
    : data.status;

  if (!data) {
    return `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
    <title>ULearn - Document Verification</title>
    <style>body{font-family:-apple-system,sans-serif;background:#f4f3f0;display:flex;justify-content:center;padding:40px 16px}
    .card{background:#fff;border-radius:12px;box-shadow:0 4px 24px rgba(0,0,0,0.1);max-width:500px;width:100%;padding:40px;text-align:center}
    .logo{font-weight:700;font-size:22px;color:#1a1d23;margin-bottom:24px}
    .badge{display:inline-block;padding:6px 18px;border-radius:20px;font-weight:600;font-size:14px;color:#fff;background:${statusColor}}</style></head>
    <body><div class="card"><div class="logo">ULearn English Language School</div>
    <div class="badge">${statusText}</div>
    <p style="margin-top:20px;color:#6b7280;font-size:14px">This verification code was not found in our system.<br>If you believe this is an error, please contact us.</p>
    <p style="margin-top:16px;font-size:13px;color:#9b9ea6">admissions@ulearnschool.com</p>
    </div></body></html>`;
  }

  const fmtDate = (d: any) => d ? new Date(d).toLocaleDateString('en-IE', { day: '2-digit', month: 'long', year: 'numeric' }) : '—';
  const docTypeLabel = data.documentType?.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()) || 'Document';

  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
  <title>ULearn - Document Verification</title>
  <style>body{font-family:-apple-system,sans-serif;background:#f4f3f0;display:flex;justify-content:center;padding:40px 16px}
  .card{background:#fff;border-radius:12px;box-shadow:0 4px 24px rgba(0,0,0,0.1);max-width:520px;width:100%;padding:40px}
  .logo{font-weight:700;font-size:22px;color:#1a1d23;margin-bottom:6px;text-align:center}
  .sub{text-align:center;color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:1px;margin-bottom:24px}
  .badge{display:inline-block;padding:6px 18px;border-radius:20px;font-weight:600;font-size:14px;color:#fff;background:${statusColor}}
  .status-row{text-align:center;margin-bottom:24px}
  .row{display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #f0efec;font-size:14px}
  .row .label{color:#6b7280;font-weight:500}.row .value{color:#1a1d23;font-weight:600;text-align:right}
  .footer{margin-top:24px;text-align:center;font-size:12px;color:#9b9ea6}</style></head>
  <body><div class="card">
  <div class="logo">ULearn English Language School</div>
  <div class="sub">Document Verification</div>
  <div class="status-row"><div class="badge">${statusText}</div></div>
  <div class="row"><span class="label">Document Type</span><span class="value">${docTypeLabel}</span></div>
  ${data.student ? `<div class="row"><span class="label">Student</span><span class="value">${data.student.fullName}</span></div>
  <div class="row"><span class="label">Date of Birth</span><span class="value">${fmtDate(data.student.dob)}</span></div>
  <div class="row"><span class="label">Nationality</span><span class="value">${data.student.nationality || '—'}</span></div>` : ''}
  ${data.booking ? `<div class="row"><span class="label">Booking Reference</span><span class="value">${data.booking.reference}</span></div>
  <div class="row"><span class="label">Course</span><span class="value">${data.booking.courseName || '—'}</span></div>
  <div class="row"><span class="label">Start Date</span><span class="value">${fmtDate(data.booking.startDate)}</span></div>
  <div class="row"><span class="label">End Date</span><span class="value">${fmtDate(data.booking.endDate)}</span></div>` : ''}
  <div class="row"><span class="label">Version</span><span class="value">v${data.versionNo}.0</span></div>
  <div class="row"><span class="label">Issued</span><span class="value">${fmtDate(data.issuedAt)}</span></div>
  ${data.status === 'SUPERSEDED' ? '<p style="margin-top:16px;color:#d97706;font-size:13px;text-align:center">This document has been superseded by a newer version. Please contact ULearn for the current document.</p>' : ''}
  ${data.status === 'REVOKED' ? '<p style="margin-top:16px;color:#dc2626;font-size:13px;text-align:center">This document has been revoked and is no longer valid.</p>' : ''}
  <div class="footer">Verified by ULearn Student Information System<br>admissions@ulearnschool.com</div>
  </div></body></html>`;
}

// Seed classrooms on startup
seedClassrooms(prisma).catch(console.error);
seedDocumentTemplates(prisma).catch(console.error);

// Xero OAuth
import { getAuthUrl, handleCallback, getAuthedXero } from './scripts/xero';

app.get('/sis/xero/auth', async (_req, res) => {
  try {
    const url = await getAuthUrl();
    res.redirect(url);
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

app.get('/sis/xero/callback', async (req, res) => {
  try {
    const fullUrl = `https://sis.ulearnschool.com${req.originalUrl}`;
    const tokens = await handleCallback(fullUrl);
    res.json({ status: 'ok', tenant: tokens.tenantName, message: 'Xero connected successfully' });
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

app.get('/sis/xero/test', async (_req, res) => {
  try {
    const { xero, tenantId } = await getAuthedXero();
    const orgs = await xero.accountingApi.getOrganisations(tenantId);
    const orgName = orgs.body.organisations?.[0]?.name;
    res.json({ status: 'ok', organisation: orgName });
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

// Health check
app.get('/sis/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// DB connection check
app.get('/sis/health/db', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    res.status(500).json({ status: 'error', database: 'disconnected', message: String(error) });
  }
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  await pool.end();
  process.exit(0);
});

export { app, prisma };
