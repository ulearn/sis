import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import pg from 'pg';
import session from 'express-session';
import bcrypt from 'bcryptjs';
import rateLimit from 'express-rate-limit';
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
import { payrollRoutes } from './routes/payroll';
import { validateIBAN } from './scripts/iban-validator';
import { documentScripts } from './scripts/documents';
import { seedClassrooms } from './scripts/seed';
import { seedDocumentTemplates } from './scripts/seed-templates';

const app = express();
app.set('trust proxy', 1); // behind reverse proxy — needed for rate limiting by real IP
app.use(express.json());

// ── Session setup ─────────────────────────────
declare module 'express-session' {
  interface SessionData { user?: string; role?: string; displayName?: string; }
}

// Permission definitions per role
const ROLE_PERMISSIONS: Record<string, { deny: string[]; viewOnly: string[] }> = {
  admin: { deny: [], viewOnly: [] },
  dos: { deny: [], viewOnly: ['documents'] },
  sales: { deny: ['payroll'], viewOnly: ['classes', 'documents'] },
  accomm: { deny: ['payroll'], viewOnly: ['classes', 'documents'] },
};

app.use(session({
  secret: process.env.SESSION_SECRET || 'sis-ulearn-2026-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,       // set true if behind HTTPS-only proxy
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,  // 24 hours
    sameSite: 'lax',
  },
}));

// ── Auth routes (public) ──────────────────────
app.get('/sis/login', (_req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'login.html'));
});

app.post('/sis/auth/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.json({ success: false, error: 'Username and password required' });

  try {
    const user = await prisma.sisUser.findUnique({ where: { username } });
    if (!user || !user.active) return res.json({ success: false, error: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.json({ success: false, error: 'Invalid credentials' });

    req.session.user = username;
    req.session.role = user.role;
    req.session.displayName = user.displayName || username;
    res.json({ success: true });
  } catch (e) { res.json({ success: false, error: 'Login error' }); }
});

app.get('/sis/auth/me', (req, res) => {
  if (!req.session.user) return res.status(401).json({ success: false });
  const role = req.session.role || 'staff';
  const perms = ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.sales;
  res.json({
    success: true,
    user: req.session.user,
    displayName: req.session.displayName,
    role,
    permissions: perms,
  });
});

app.get('/sis/auth/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/sis/login');
  });
});

// ── Password reset ────────────────────────────
app.get('/sis/forgot', (_req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'forgot.html'));
});

app.get('/sis/reset', (_req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'reset.html'));
});

// Per-IP rate limit: 5 requests / 15 min
const forgotIpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  // Always return generic success to avoid info leak
  handler: (_req, res) => res.json({ success: true }),
});

// Per-email rate limit: 3 emails / hour (in-memory)
const emailSendCounts = new Map<string, { count: number; resetAt: number }>();
function emailRateLimited(email: string): boolean {
  const now = Date.now();
  const entry = emailSendCounts.get(email);
  if (!entry || entry.resetAt < now) {
    emailSendCounts.set(email, { count: 1, resetAt: now + 60 * 60 * 1000 });
    return false;
  }
  if (entry.count >= 3) return true;
  entry.count++;
  return false;
}

app.post('/sis/auth/forgot', forgotIpLimiter, async (req, res) => {
  const { email, website } = req.body;
  // Always respond success — don't leak which emails exist
  const respond = () => res.json({ success: true });

  // Honeypot: real users won't fill the hidden "website" field; bots will
  if (website) return respond();
  if (!email) return respond();

  const normEmail = String(email).toLowerCase().trim();
  // Per-email rate limit
  if (emailRateLimited(normEmail)) return respond();

  try {
    const user = await prisma.sisUser.findFirst({ where: { email: normEmail, active: true } });
    if (!user) return respond();

    const crypto = await import('crypto');
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.sisUser.update({
      where: { id: user.id },
      data: { resetToken: token, resetTokenExpires: expires },
    });

    const baseUrl = process.env.SIS_BASE_URL || 'https://sis.ulearnschool.com';
    const link = `${baseUrl}/sis/reset?token=${token}`;

    const { sendEmail } = await import('./scripts/email');
    await sendEmail({
      from: 'info@ulearnschool.com',
      fromName: 'ULearn SIS',
      to: user.email!,
      subject: 'ULearn SIS — Password Reset',
      html: `
        <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#1a1d23;">
          <h2 style="margin:0 0 16px;font-size:20px;">Password reset request</h2>
          <p>Hi ${user.displayName || user.username},</p>
          <p>We received a request to reset your ULearn SIS password. Click the button below to set a new one. This link expires in 1 hour.</p>
          <p style="margin:24px 0;">
            <a href="${link}" style="display:inline-block;padding:12px 24px;background:#4f46e5;color:#fff;text-decoration:none;border-radius:6px;font-weight:600;">Reset Password</a>
          </p>
          <p style="font-size:13px;color:#6b7280;">If you didn't request this, you can safely ignore this email.</p>
          <p style="font-size:12px;color:#9ca3af;word-break:break-all;">Or paste this link into your browser:<br>${link}</p>
        </div>
      `,
    });
  } catch (e) {
    console.error('Forgot password error:', e);
  }
  return respond();
});

const resetIpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => res.json({ success: false, error: 'Too many attempts. Try again later.' }),
});

app.post('/sis/auth/reset', resetIpLimiter, async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) return res.json({ success: false, error: 'Token and password required' });
  if (password.length < 8) return res.json({ success: false, error: 'Password must be at least 8 characters' });

  try {
    const user = await prisma.sisUser.findFirst({
      where: { resetToken: String(token), resetTokenExpires: { gt: new Date() }, active: true },
    });
    if (!user) return res.json({ success: false, error: 'Invalid or expired reset link' });

    const hash = await bcrypt.hash(password, 10);
    await prisma.sisUser.update({
      where: { id: user.id },
      data: { passwordHash: hash, resetToken: null, resetTokenExpires: null },
    });
    res.json({ success: true });
  } catch (e) {
    console.error('Reset error:', e);
    res.json({ success: false, error: 'Reset failed' });
  }
});

// ── Auth middleware ────────────────────────────
// Public routes that skip auth:
const publicPaths = ['/sis/login', '/sis/forgot', '/sis/reset', '/sis/auth/', '/sis/health', '/sis/verify/', '/sis/api/webhooks', '/sis/public/favicon.ico'];

function requireAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  // Skip auth for public paths
  if (publicPaths.some(p => req.path.startsWith(p))) return next();

  if (req.session.user) return next();

  // API calls get 401, page requests get redirected
  if (req.path.startsWith('/sis/api/')) {
    return res.status(401).json({ success: false, error: 'Not authenticated' });
  }
  return res.redirect('/sis/login');
}

app.use(requireAuth);

// ── Role-based API restrictions ───────────────
app.use('/sis/api', (req, res, next) => {
  const role = req.session.role || 'staff';
  const perms = ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.sales;

  // Check denied sections
  for (const section of perms.deny) {
    if (req.path.startsWith(`/${section}`)) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }
  }

  // Check view-only sections (block POST/PUT/DELETE)
  if (req.method !== 'GET') {
    for (const section of perms.viewOnly) {
      if (req.path.startsWith(`/${section}`)) {
        return res.status(403).json({ success: false, error: 'View-only access' });
      }
    }
  }

  next();
});

// ── Static files (auth required) ──────────────
app.use('/sis/public', express.static(path.join(__dirname, '..', 'public')));

// Serve admin UI
app.get('/sis/admin', (_req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'admin.html'));
});

// Payroll dashboard (standalone — cloned from Hub)
app.get('/sis/payroll', (_req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'payroll.html'));
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
app.use('/sis/api/payroll', payrollRoutes(prisma));

// Scheduling (closures CRUD) + startup occurrence top-up
import { schedulingScripts } from './scripts/scheduling';
const scheduling = schedulingScripts(prisma);

app.get('/sis/api/scheduling/closures', async (_req, res) => {
  try { res.json(await scheduling.listClosures()); }
  catch (e) { res.status(500).json({ error: String(e) }); }
});
app.post('/sis/api/scheduling/closures', async (req, res) => {
  try { res.status(201).json(await scheduling.createClosure(req.body)); }
  catch (e) { res.status(400).json({ error: String(e) }); }
});
app.patch('/sis/api/scheduling/closures/:id', async (req, res) => {
  try { res.json(await scheduling.updateClosure(parseInt(req.params.id), req.body)); }
  catch (e) { res.status(400).json({ error: String(e) }); }
});
app.delete('/sis/api/scheduling/closures/:id', async (req, res) => {
  try { res.json(await scheduling.deleteClosure(parseInt(req.params.id))); }
  catch (e) { res.status(400).json({ error: String(e) }); }
});

// Fire-and-forget boot-time top-up: ensure occurrences exist for current week + 8 ahead
(async () => {
  try {
    const result = await scheduling.ensureUpcomingOccurrences();
    console.log('[scheduling] boot top-up:', result);
  } catch (e) { console.error('[scheduling] boot top-up failed:', e); }
})();

// IBAN validator
app.get('/sis/api/validate-iban/:iban', (req, res) => {
  res.json(validateIBAN(req.params.iban as string));
});

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
