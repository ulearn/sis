import express from 'express';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import dotenv from 'dotenv';
import pg from 'pg';
import session from 'express-session';
// @ts-ignore — connect-pg-simple ships no type declarations
import connectPgSimple from 'connect-pg-simple';
import bcrypt from 'bcryptjs';
import rateLimit from 'express-rate-limit';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from './generated/prisma/client';
import { setupLogger } from './scripts/logger';
import { withBookingAudit } from './lib/prisma-audit';
import { runWithAuditContext } from './lib/audit-context';
import { isContractExempt } from './lib/contract-exempt';

dotenv.config();
setupLogger();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool as any);
// Wrap the shared client with the booking-audit extension so every
// HTTP/webhook write through this prisma instance leaves a trail in
// public.audit_log. The Express middleware below labels each row with
// the calling route name via AsyncLocalStorage.
const prisma = withBookingAudit(new PrismaClient({ adapter }));

import { studentRoutes } from './routes/students';
import { bookingRoutes } from './routes/bookings';
import { classRoutes } from './routes/classes';
import { groupRoutes } from './routes/groups';
import { accommodationRoutes } from './routes/accommodation';
import { webhookRoutes } from './routes/webhooks';
import { attendanceRoutes } from './routes/attendance';
import { transportRoutes } from './routes/transport';
import { refundRoutes } from './routes/refunds';
import { documentRoutes } from './routes/documents';
import { emailRoutes } from './routes/email';
import { searchRoutes } from './routes/search';
import { hostPaymentRoutes } from './routes/host-payments';
import { hostPortalRoutes } from './routes/host-portal';
import { payrollRoutes } from './routes/payroll';
import { partnerRoutes } from './routes/partners';
import { studentRoutesPortal } from './routes/student';
import { zohoAuthRoutes } from './routes/zoho-auth';
import { activitiesRoutes } from './routes/activities';
import { validateIBAN } from './scripts/iban-validator';
import { documentScripts } from './scripts/documents';
import { clearanceScripts } from './scripts/clearance';
import { testRoutesStaff, testRoutesPublic } from './routes/tests';
import { seedClassrooms } from './scripts/seed';
import { seedDocumentTemplates } from './scripts/seed-templates';

const app = express();
app.set('trust proxy', 1); // behind reverse proxy — needed for rate limiting by real IP

// Audit-context middleware — wraps every request in an AsyncLocalStorage
// scope so that prisma-audit can record WHICH route/webhook triggered each
// tracked Booking write (see lib/prisma-audit.ts). Must come before any
// handler that touches Prisma. Uses originalUrl without query string for a
// stable, query-agnostic label.
app.use((req, _res, next) => {
  const label = `${req.method} ${(req.originalUrl || req.url || '').split('?')[0]}`;
  runWithAuditContext(label, () => next());
});

// 5MB ceiling — the practical limit is the profile-picture upload, which
// base64-encodes a ≤500KB image into ~670KB of JSON. Default express limit
// is 100KB which silently 413s the upload (server returns Apache's HTML
// error page; client tries to JSON.parse it → "Unexpected token '<'"). 5MB
// gives plenty of headroom without exposing a DoS vector.
app.use(express.json({ limit: '5mb' }));

// ── Session setup ─────────────────────────────
declare module 'express-session' {
  interface SessionData {
    user?: string;
    role?: string;
    readOnly?: boolean;      // per-user hard read-only — blocks ALL writes regardless of role
    displayName?: string;
    userType?: string;       // 'staff' | 'partner' | 'student' | 'teacher'
    agencyId?: number;
    agencyName?: string;
    partnerHubspotContactId?: string;  // HubSpot contact ID of the logged-in partner (Agent Employee)
    portalPermissions?: Record<string, boolean>;
    studentId?: number;      // resolved at login time for userType='student'
    impersonatedByAdmin?: string;  // admin username while an admin is viewing a partner portal (read-only)
    adminReturn?: { userType?: string; displayName?: string };  // saved admin identity, restored on Exit
  }
}

// Permission definitions per role.
//
// Note on documents vs document-templates: staff (DOS / sales / accomm) CAN
// create + edit document drafts (per-student LOAs, exit letters, etc.) but
// CANNOT touch the underlying templates. Template editing is admin-only,
// guarded separately below — keeps the template library clean (the previous
// SIS ended up with ~450 unmanaged "templates" that were really saved emails).
const ROLE_PERMISSIONS: Record<string, { deny: string[]; viewOnly: string[] }> = {
  admin: { deny: [], viewOnly: [] },
  // Finance role — currently mirrors admin so refund/payment screens work for
  // accounts staff. Tighten later (e.g. lock out student PII edits) once the
  // finance-only views are mapped out.
  accounts: { deny: [], viewOnly: [] },
  // Machine/service identity — authenticated by the SIS_SERVICE_KEY bearer, not a
  // login. Access-all-areas EXCEPT user management (no requirement to ever
  // create/edit users or change passwords). 'users'/'sis-users' are denied as a
  // forward guard (no such /sis/api route exists today). Template HTML writes
  // stay admin/accounts-only via the hard-coded check below — a service key
  // can read templates but never edit them.
  service: { deny: ['users', 'sis-users', 'refunds'], viewOnly: [] },
  // Refunds are admin/accounts-only by directive (money-out flow). Add the
  // 'refunds' section to every non-finance role's deny list.
  // Bookings are NOT blanket view-only for ops roles. The financial component
  // (amounts, payments, and the durations/quantities they're priced on —
  // weeks / nights / hours) stays locked to admin+accounts, but operational
  // DATE/TIME edits (course start/end, accommodation start/end + check-in/out,
  // airport pickup/dropoff time) are allowed. That split is enforced at FIELD
  // level inside the bookings router's write guard — so 'bookings' is
  // deliberately absent from these viewOnly lists.
  dos: { deny: ['refunds'], viewOnly: ['document-templates'] },
  sales: { deny: ['payroll', 'refunds'], viewOnly: ['classes', 'document-templates'] },
  accomm: { deny: ['payroll', 'refunds'], viewOnly: ['classes', 'document-templates'] },
  // External Agent Partners (Saraa / Tu Doan agency staff). Handle their OWN
  // students' documents + correspondence; must not touch ULearn internal
  // staff workflows (host payments, matching, transport, attendance,
  // payroll, refunds). Bookings stay editable subject to the field-level
  // guard in the bookings router (course-date edits OK, money fields locked).
  // Previously this role fell through to `sales` defaults silently — now
  // declared explicitly so it's intentional, not accidental.
  partner: { deny: ['payroll', 'refunds', 'host-payments', 'matching', 'transport', 'attendance'], viewOnly: ['classes', 'document-templates'] },
  // Unified-app roles — ZERO SIS API access by default (GDPR / payroll / student PII).
  // Student-self routes (own profile, own bookings) will be added later;
  // teachers must never see SIS data. See TODO inside /sis/auth/login.
  teacher: { deny: ['accommodation','apartments','attendance','bookings','classes','documents','email','healthcheck','host-payments','matching','partners','payroll','students','student','teachers','tests','transport','webhooks'], viewOnly: [] },
  student: { deny: ['accommodation','apartments','attendance','bookings','classes','documents','email','healthcheck','host-payments','matching','partners','payroll','students','student','teachers','tests','transport','webhooks'], viewOnly: [] },
};

// Friendly display labels for permission tiers — UI shows these so staff
// see "Standard" or "Limited" instead of cryptic role IDs. Role IDs in the
// DB stay unchanged so every existing gate keeps working; only the label
// surfaced via /sis/auth/me is human-readable.
const ROLE_LABELS: Record<string, string> = {
  admin: 'Super Admin',
  accounts: 'Admin',
  dos: 'Admin',
  sales: 'Admin',
  accomm: 'Standard',
  partner: 'Limited',
  teacher: 'Teacher',
  student: 'Student',
};

// Persistent session store (Postgres) — survives app restarts/deploys so
// partners (and staff) aren't logged out every time we touch tmp/restart.txt.
// Reuses the existing pg pool; auto-creates the user_sessions table on boot.
const PgSession = connectPgSimple(session);
app.use(session({
  store: new PgSession({ pool, tableName: 'user_sessions', createTableIfMissing: true, pruneSessionInterval: 3600 }),
  secret: process.env.SESSION_SECRET || 'sis-ulearn-2026-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,       // set true if behind HTTPS-only proxy
    httpOnly: true,
    maxAge: 4 * 60 * 60 * 1000,   // 4 hours — partners re-auth ensures live data refresh
    sameSite: 'lax',
    domain: '.ulearnschool.com',  // share session across lms/sis/hub subdomains (unified app)
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

    // Partner users should use the partner login, not the SIS login
    if (user.userType === 'partner') return res.json({ success: false, error: 'Please use the partner portal to log in' });

    req.session.user = username;
    req.session.role = user.role;
    req.session.readOnly = !!(user as any).readOnly;
    req.session.userType = user.userType || 'staff';
    req.session.displayName = user.displayName || username;

    // Student auth: resolve the SisUser → Student row by email at login time.
    // Email uniqueness isn't enforced (intentional — see CLAUDE.md), so on
    // collision we tiebreak by `id desc` (most recently created wins).
    let redirectTo = '/sis/admin';
    if (user.userType === 'student') {
      const matches = user.email
        ? await prisma.student.findMany({
            where: { email: { equals: user.email, mode: 'insensitive' } },
            orderBy: { id: 'desc' },
            select: { id: true, beta: true },
            take: 1,
          })
        : [];
      if (!matches.length) return res.json({ success: false, error: 'No student record found for this account' });
      req.session.studentId = matches[0].id;
      const studentIsBeta = !!(matches[0] as any).beta;

      // Resolve the student's current class so the unified app lands on THEIR
      // (level, session). StudentClassAssignment is week-scoped; the joined
      // Class carries the canonical level + ClassSession enum. We REQUIRE a
      // current assignment with a fully-defined class — otherwise the student
      // would land on a default (A1 / MORNING) and start consuming class data
      // they aren't enrolled in. Bounce them to the block screen instead.
      const today = new Date();
      const assignment = await prisma.studentClassAssignment.findFirst({
        where: {
          studentId: matches[0].id,
          weekStart: { lte: today },
          OR: [{ weekEnd: null }, { weekEnd: { gte: today } }],
        },
        orderBy: { weekStart: 'desc' },
        include: { class_: { select: { level: true, session: true, active: true } } },
      });
      const cls = assignment?.class_;
      const hasClass = !!(cls && cls.active && cls.level && cls.session);
      if (!hasClass && studentIsBeta) {
        // Beta (Learning) student with no current class → block screen, so they
        // don't land on default A1/MORNING class data on the Learning tab.
        redirectTo = '/sis/student/no-class';
      } else if (!hasClass) {
        // Non-beta student with no current class (e.g. pre-arrival / not yet
        // assigned): let them INTO the app. Profile + Challenges work, and the
        // Learning tab shows the "coming soon" beta gate — no class data is ever
        // consumed, so there's nothing to protect against. (Was wrongly bouncing
        // every classless student to "No class available".)
        redirectTo = '/sis/student';
      } else {
        // Unified student app — 3 tabs: Profile (SIS) / Challenges / Learning.
        // Same screen on desktop and (eventually) the mobile app shell. The
        // ?level= and ?session= are picked up by the Learning tab when it
        // deep-links into today.html for the per-session rating UI.
        redirectTo = `/sis/student?level=${encodeURIComponent(cls.level)}&session=${encodeURIComponent(cls.session)}`;
      }
    } else if (user.userType === 'teacher') {
      // Teachers land on the LMS weekly plan — SIS UI exposes payroll / finance /
      // PII so they have no business there. The session is set only so LMS
      // callbacks to /sis/auth/me succeed.
      redirectTo = '/prototype/lms/plan.html';
    }

    res.json({ success: true, redirectTo });
  } catch (e) { res.json({ success: false, error: 'Login error' }); }
});

// CORS for cross-subdomain SSO probes. The LMS / hub apps fetch this endpoint
// with `credentials: 'include'` to detect an existing SIS session and skip
// their own login form. Same registrable domain → cookie ships automatically;
// the headers below let the LMS read the JSON response.
const SSO_ORIGINS = new Set([
  'https://lms.ulearnschool.com',
  'https://hub.ulearnschool.com',
]);

app.get('/sis/auth/me', (req, res) => {
  const origin = req.headers.origin as string | undefined;
  if (origin && SSO_ORIGINS.has(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Vary', 'Origin');
  }
  if (!req.session.user) return res.status(401).json({ success: false });
  const role = req.session.role || 'staff';
  const perms = ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.sales;
  const baseLabel = ROLE_LABELS[role] || 'Limited';
  // Read-only flag overlays any tier — append "(Read Only)" so it's obvious
  // in the UI when a user is locked out of writes regardless of their tier.
  const roleLabel = req.session.readOnly ? `${baseLabel} (Read Only)` : baseLabel;
  res.json({
    success: true,
    user: req.session.user,
    displayName: req.session.displayName,
    role,
    roleLabel,
    readOnly: !!req.session.readOnly,
    permissions: perms,
  });
});

// Preflight for /sis/auth/me — browsers send OPTIONS before a credentialed GET
// when the request includes non-simple headers (e.g. custom Accept).
app.options('/sis/auth/me', (req, res) => {
  const origin = req.headers.origin as string | undefined;
  if (origin && SSO_ORIGINS.has(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');
    res.setHeader('Access-Control-Max-Age', '600');
    res.setHeader('Vary', 'Origin');
  }
  res.sendStatus(204);
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
    const isPartner = user.userType === 'partner';
    const link = `${baseUrl}/sis/reset?token=${token}${isPartner ? '&portal=partners' : ''}`;
    const productLabel = isPartner ? 'ULearn Partner Portal' : 'ULearn SIS';
    const buttonColor = isPartner ? '#339900' : '#4f46e5';

    const { sendEmail } = await import('./scripts/email');
    await sendEmail({
      from: 'info@ulearnschool.com',
      fromName: productLabel,
      to: user.email!,
      subject: `${productLabel} — Password Reset`,
      html: `
        <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#1a1d23;">
          <h2 style="margin:0 0 16px;font-size:20px;">Password reset request</h2>
          <p>Hi ${user.displayName || user.username},</p>
          <p>We received a request to reset your ${productLabel} password. Click the button below to set a new one. This link expires in 1 hour.</p>
          <p style="margin:24px 0;">
            <a href="${link}" style="display:inline-block;padding:12px 24px;background:${buttonColor};color:#fff;text-decoration:none;border-radius:6px;font-weight:600;">Reset Password</a>
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

// ── Student account self-registration + email verification ────────
//
// Flow:
//   1. Student visits /sis/register, enters email + password (×2)
//   2. POST /sis/auth/register
//      - Verifies a Student row exists with that email (gate: no Student
//        record → no account possible. This is the "if not in SIS they
//        cannot create" rule)
//      - Refuses if an active SisUser already exists for the email
//      - Creates SisUser (active=false, verificationToken set, ~24h expiry)
//      - Emails verify link from success@
//   3. Student clicks link → GET /sis/verify/:token
//      - Marks the SisUser active=true, clears the token, redirects to /sis/login
//
// On every step we respond generically when we'd otherwise leak account
// existence (mirrors the forgot-password pattern).
const registerIpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => res.json({ success: false, error: 'Too many attempts. Try again later.' }),
});

// Public host-family application form (iframed on ulearnschool.com). Modest IP cap —
// a genuine applicant submits once; the honeypot + cap keep the bot floor low.
const hostApplyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 8,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => res.json({ success: false, error: 'Too many attempts. Try again later.' }),
});

app.post('/sis/auth/register', registerIpLimiter, async (req, res) => {
  const { email, password, confirmPassword, website } = req.body;
  // Honeypot — same trick as /sis/auth/forgot
  if (website) return res.json({ success: true });
  if (!email || !password || !confirmPassword) {
    return res.json({ success: false, error: 'Email and both password fields are required' });
  }
  if (password !== confirmPassword) return res.json({ success: false, error: 'Passwords do not match' });
  if (password.length < 8) return res.json({ success: false, error: 'Password must be at least 8 characters' });

  const normEmail = String(email).toLowerCase().trim();

  try {
    // Per-email rate limit (re-uses the forgot-password counter table —
    // intent is to prevent spam to the same inbox, regardless of vector).
    if (emailRateLimited(normEmail)) {
      return res.json({ success: true, message: 'If your email is on file, a verification link is on its way.' });
    }

    // Gate 1 — must already exist as a Student in SIS. We surface a
    // generic message rather than confirming/denying so a casual visitor
    // can't probe whether someone is enrolled with us.
    const student = await prisma.student.findFirst({
      where: { email: { equals: normEmail, mode: 'insensitive' } },
      select: { id: true, firstName: true },
    });
    if (!student) {
      return res.json({ success: true, message: 'If your email is on file, a verification link is on its way.' });
    }

    // Gate 2 — refuse if an ACTIVE account already exists. (An inactive
    // pending account is fine — we'll re-issue a verify token below.)
    const existing = await prisma.sisUser.findFirst({
      where: { OR: [{ username: normEmail }, { email: normEmail }] },
    });
    if (existing && existing.active) {
      return res.json({ success: false, error: 'An account already exists for this email. Try Forgot Password.' });
    }

    const crypto = await import('crypto');
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);   // 24h
    const hash = await bcrypt.hash(password, 10);

    if (existing) {
      // Pending re-registration — refresh the password + token + expiry.
      await prisma.sisUser.update({
        where: { id: existing.id },
        data: { passwordHash: hash, verificationToken: token, verificationTokenExpires: expires },
      });
    } else {
      await prisma.sisUser.create({
        data: {
          username: normEmail,
          email: normEmail,
          passwordHash: hash,
          displayName: student.firstName,
          role: 'student',
          userType: 'student',
          active: false,                          // gates login until verify
          verificationToken: token,
          verificationTokenExpires: expires,
        },
      });
    }

    const baseUrl = process.env.SIS_BASE_URL || 'https://sis.ulearnschool.com';
    const link = `${baseUrl}/sis/verify/${token}`;
    const { sendEmail } = await import('./scripts/email');
    await sendEmail({
      from: 'app@ulearnschool.com',
      fromName: 'ULearn',
      to: normEmail,
      subject: 'Confirm your ULearn account',
      html: `
        <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#1a1d23;">
          <h2 style="margin:0 0 16px;font-size:20px;">Confirm your ULearn account</h2>
          <p>Hi ${student.firstName || 'there'},</p>
          <p>Tap the button below to confirm your email and activate your account. This link expires in 24 hours.</p>
          <p style="margin:24px 0;">
            <a href="${link}" style="display:inline-block;padding:12px 24px;background:#339900;color:#fff;text-decoration:none;border-radius:6px;font-weight:600;">Confirm my account</a>
          </p>
          <p style="font-size:13px;color:#6b7280;">If you didn't request this, you can safely ignore this email.</p>
          <p style="font-size:12px;color:#9ca3af;word-break:break-all;">Or paste this link into your browser:<br>${link}</p>
        </div>
      `,
    });

    return res.json({ success: true, message: 'Check your inbox for a confirmation link.' });
  } catch (e) {
    console.error('Register error:', e);
    return res.json({ success: false, error: 'Could not complete registration. Please try again.' });
  }
});

// Verify endpoint — HTML response so the link in the email lands somewhere
// usable. Activates the account and bounces to /sis/login on success.
app.get('/sis/verify/:token', async (req, res) => {
  const token = String(req.params.token || '');
  const renderPage = (title: string, message: string, link?: { href: string; label: string }) => {
    res.set('Cache-Control', 'no-store');
    res.send(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title}</title>
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f4f3f0;display:flex;justify-content:center;align-items:center;min-height:100vh;margin:0;padding:24px}
        .card{background:#fff;border-radius:12px;box-shadow:0 4px 24px rgba(0,0,0,0.08);max-width:420px;padding:36px 32px;text-align:center}
        h2{margin:0 0 12px;font-size:20px;color:#1a1d23}
        p{margin:0 0 18px;color:#4a4d56;font-size:14px;line-height:1.5}
        a.btn{display:inline-block;padding:11px 22px;background:#339900;color:#fff;border-radius:6px;font-weight:600;font-size:14px;text-decoration:none}</style></head>
      <body><div class="card"><h2>${title}</h2><p>${message}</p>${link ? `<a class="btn" href="${link.href}">${link.label}</a>` : ''}</div></body></html>`);
  };
  if (!token) return renderPage('Invalid link', 'This verification link is missing its token.');
  try {
    // This path is shared by two token types:
    //   1. Student account email-confirmation tokens (sis_users.verificationToken)
    //   2. Document verification tokens (document_records.verificationToken) — the
    //      QR code on issued LoAs / letters resolves here.
    // We detect which by looking up the account token (ignoring expiry) first; if
    // it's NOT an account token, fall through to document verification rather than
    // dead-ending on "Link expired".
    const accountToken = await prisma.sisUser.findFirst({
      where: { verificationToken: token },
      select: { id: true, verificationTokenExpires: true },
    });

    if (accountToken) {
      if (!accountToken.verificationTokenExpires || accountToken.verificationTokenExpires <= new Date()) {
        return renderPage(
          'Link expired',
          'This confirmation link has expired or has already been used. Request a new one from the registration page.',
          { href: '/sis/register', label: 'Register again' },
        );
      }
      await prisma.sisUser.update({
        where: { id: accountToken.id },
        data: { active: true, verificationToken: null, verificationTokenExpires: null },
      });
      return renderPage(
        'Account confirmed',
        'You\'re all set. Tap below to log in with your email and password.',
        { href: '/sis/login', label: 'Log in' },
      );
    }

    // Not a LIVE account token. Two shapes reach here:
    //   • 64-hex  → a student account-confirmation token that's already been used
    //     (activation nulls it) or is otherwise gone. Land on a friendly
    //     "already confirmed → log in" page, NOT the document-not-found 404.
    //   • 22-char base64url → a document verification token (QR on issued LoAs).
    if (/^[a-f0-9]{64}$/i.test(token)) {
      return renderPage(
        'Already confirmed',
        'This confirmation link has already been used or expired. If you\'ve already confirmed your account, just log in with your email and password.',
        { href: '/sis/login', label: 'Log in' },
      );
    }
    const docResult = await docScripts.verify(token);
    res.set('Cache-Control', 'no-store');
    return res.status(docResult ? 200 : 404).send(verificationPage(docResult));
  } catch (e) {
    console.error('Verify error:', e);
    return renderPage('Something went wrong', 'We couldn\'t verify this link right now. Please try again in a moment.');
  }
});

// Serve the registration page (unauthenticated)
app.get('/sis/register', (_req, res) => {
  res.set('Cache-Control', 'no-store');
  res.sendFile(path.join(__dirname, '..', 'public', 'register.html'));
});

// ── Partner portal routes ─────────────────────
// Serve partner login page (unauthenticated)
app.get('/sis/partners/login', (_req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'partners-login.html'));
});

// Serve partner registration page (unauthenticated)
app.get('/sis/partners/register', (_req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'partners-register.html'));
});

// Serve partner forgot-password page (unauthenticated)
app.get('/sis/partners/forgot', (_req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'partners-forgot.html'));
});

// Partner registration — validates email against HubSpot + creates SisUser
import { partnerScripts as _partnerScriptsForReg } from './scripts/partners';
const _regScripts = _partnerScriptsForReg(prisma);
const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => res.json({ success: false, error: 'Too many attempts. Try again later.' }),
});
app.post('/sis/partners/auth/register', registerLimiter, async (req, res) => {
  try {
    const result = await _regScripts.registerPartner(req.body);
    res.json(result);
  } catch (e) { res.json({ success: false, error: String(e) }); }
});

// Partner login
app.post('/sis/partners/auth/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.json({ success: false, error: 'Username and password required' });

  try {
    const user = await prisma.sisUser.findUnique({
      where: { username },
      include: { agency: true },
    });
    if (!user || !user.active) return res.json({ success: false, error: 'Invalid credentials' });
    if (user.userType !== 'partner') return res.json({ success: false, error: 'Invalid credentials' });
    if (!user.agencyId) return res.json({ success: false, error: 'Account not linked to an agency' });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.json({ success: false, error: 'Invalid credentials' });

    // Parse portal permissions
    let perms: Record<string, boolean> = { canSeeFinance: true, canSeeClasses: true, canSeeDocuments: true };
    if (user.portalPermissions) {
      try { perms = JSON.parse(user.portalPermissions); } catch {}
    }

    req.session.user = username;
    req.session.role = 'partner';
    req.session.displayName = user.displayName || username;
    req.session.userType = 'partner';
    req.session.agencyId = user.agencyId;
    req.session.agencyName = user.agency?.name || '';
    req.session.partnerHubspotContactId = user.hubspotContactId || undefined;
    req.session.portalPermissions = perms;

    // Update last login
    await prisma.sisUser.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

    res.json({ success: true });
  } catch (e) { res.json({ success: false, error: 'Login error' }); }
});

app.get('/sis/partners/auth/logout', (req, res) => {
  req.session.destroy(() => { res.redirect('/sis/partners/login'); });
});

// ── Admin impersonation of a partner portal ────────────────────────────────
// Lets a SIS admin open ANY partner's portal for spot-checks / troubleshooting,
// straight from a HubSpot link on the Agent-Employee Contact (or the Company):
//   /sis/partners/impersonate?contact=<hsContactId>   (canonical — partners log
//                                                       in via a contact/email)
//   /sis/partners/impersonate?company=<hsCompanyId>    (resolves to the agency)
// Uses the admin's own SIS session (no new account). VIEW-ONLY — every write is
// blocked while impersonating (see blockImpersonatedWrites).
// Staff roles allowed to view partner portals (read-only impersonation):
// admin, sales, DOS. Real partners (role 'partner') still can never reach this.
const IMPERSONATE_ROLES = ['admin', 'sales', 'dos'];
app.get('/sis/partners/impersonate', async (req, res) => {
  if (!req.session.user || !IMPERSONATE_ROLES.includes(req.session.role || '')) {
    return res.status(403).send('Staff access required (admin / sales / DOS). <a href="/sis/login">Sign in to the SIS</a>, then click the link again.');
  }
  try {
    const contactId = req.query.contact ? String(req.query.contact) : null;
    const companyId = req.query.company ? String(req.query.company) : null;
    // ?agency=<SIS agency id> — used by the in-SIS links (student Overview pill,
    // booking agency name) where we already know the agency. ?contact / ?company
    // are used by HubSpot links (contact is canonical; companies have no login).
    const agencyParam = req.query.agency ? parseInt(String(req.query.agency), 10) : null;
    let agencyId: number | null = null;
    let partnerContactId: string | undefined;
    // ?partner=<SIS SisUser id> — embedded in the full impersonate URL we stamp
    // onto the HubSpot contact's `sis_portal` field, so that link is one-click.
    const partnerParam = req.query.partner ? parseInt(String(req.query.partner), 10) : null;
    if (agencyParam && Number.isFinite(agencyParam)) {
      const ag = await prisma.agency.findUnique({ where: { id: agencyParam }, select: { id: true } });
      agencyId = ag?.id ?? null;
    }
    if (!agencyId && partnerParam && Number.isFinite(partnerParam)) {
      const su = await prisma.sisUser.findFirst({
        where: { id: partnerParam, userType: 'partner' },
        select: { agencyId: true, hubspotContactId: true },
      });
      agencyId = su?.agencyId ?? null;
      partnerContactId = su?.hubspotContactId ?? undefined;
    }
    if (!agencyId && contactId) {
      const su = await prisma.sisUser.findFirst({
        where: { hubspotContactId: contactId, userType: 'partner' },
        select: { agencyId: true, hubspotContactId: true },
      });
      agencyId = su?.agencyId ?? null;
      partnerContactId = su?.hubspotContactId ?? contactId;
    }
    if (!agencyId && companyId) {
      const ag = await prisma.agency.findFirst({ where: { hubspotCompanyId: companyId }, select: { id: true } });
      agencyId = ag?.id ?? null;
    }
    if (!agencyId) {
      return res.status(404).send('No partner portal found for this agency — they may not have registered for the portal yet.');
    }
    const agency = await prisma.agency.findUnique({ where: { id: agencyId }, select: { name: true } });
    // Stash the admin identity so Exit can restore it, then assume the partner context.
    // role stays 'admin' (so the admin can re-impersonate without exiting, and real
    // partners — role 'partner' — can never reach this endpoint).
    req.session.adminReturn = { userType: req.session.userType, displayName: req.session.displayName };
    req.session.userType = 'partner';
    req.session.agencyId = agencyId;
    req.session.agencyName = agency?.name || '';
    req.session.partnerHubspotContactId = partnerContactId;
    req.session.portalPermissions = { canSeeFinance: true, canSeeClasses: true, canSeeDocuments: true };
    req.session.impersonatedByAdmin = req.session.user;
    res.redirect('/sis/partners');
  } catch (e) {
    res.status(500).send('Impersonation error: ' + String(e));
  }
});

// Exit impersonation — restore the admin session and return to the SIS.
app.get('/sis/partners/impersonate/exit', (req, res) => {
  if (req.session.impersonatedByAdmin) {
    const back = req.session.adminReturn || {};
    req.session.userType = back.userType || 'staff';
    req.session.displayName = back.displayName || req.session.user;
    delete req.session.agencyId;
    delete req.session.agencyName;
    delete req.session.partnerHubspotContactId;
    delete req.session.portalPermissions;
    delete req.session.impersonatedByAdmin;
    delete req.session.adminReturn;
  }
  res.redirect('/sis/admin');
});

// Partner portal page — redirect to login if not authenticated
app.get('/sis/partners', (req, res) => {
  if (!req.session.user || req.session.userType !== 'partner') {
    // Preserve the requested deep-link (e.g. ?tab=clearance&clrpick=…) through login.
    const orig = req.originalUrl || '';
    const next = (orig.startsWith('/sis/partners') && orig !== '/sis/partners') ? '?next=' + encodeURIComponent(orig) : '';
    return res.redirect('/sis/partners/login' + next);
  }
  // No-store so partners always get the latest portal shell (the app is iterated
  // on frequently; a cached partners.html silently hides new features).
  res.set('Cache-Control', 'no-store');
  res.sendFile(path.join(__dirname, '..', 'public', 'partners.html'));
});

// Partner API middleware — enforce partner auth + agencyId on every API call
function requirePartnerAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  if (!req.session.user || req.session.userType !== 'partner' || !req.session.agencyId) {
    return res.status(401).json({ success: false, error: 'Not authenticated' });
  }
  next();
}

// Partner contract gate — until the agency's partner agreement is signed,
// only `/me`, `/contract*` and `/logout` work. Other endpoints return 403
// with reason='contract_required' so the frontend can surface the modal.
const CONTRACT_GATE_ALLOWLIST = ['/me', '/contract', '/contract/preview.pdf', '/contract/preview.html', '/contract/signed.pdf', '/contract/sign'];
async function requireSignedContract(req: express.Request, res: express.Response, next: express.NextFunction) {
  if (CONTRACT_GATE_ALLOWLIST.some(p => req.path === p)) return next();
  if (isContractExempt(req.session.agencyId)) return next();   // non-commercial schools
  try {
    const agency = await prisma.agency.findUnique({
      where: { id: req.session.agencyId! },
      select: { contractSignedAt: true },
    });
    if (!agency?.contractSignedAt) {
      return res.status(403).json({ success: false, reason: 'contract_required', error: 'Partner agreement must be signed before accessing this resource' });
    }
    next();
  } catch (e) { res.status(500).json({ success: false, error: String(e) }); }
}

// Write policy while impersonating a partner portal:
//  • role 'admin'  → may write (troubleshooting / fixes act AS the partner).
//  • sales / DOS   → read-only (they can view portals but not act as the partner).
//  • optional IMPERSONATE_WRITE_AGENCY_ID env → additionally allow ONE agency
//    for non-admins (scoped temp grant); unset = no exception.
function blockImpersonatedWrites(req: express.Request, res: express.Response, next: express.NextFunction) {
  if (req.session.impersonatedByAdmin && req.method !== 'GET') {
    if (req.session.role === 'admin') return next();
    const writeAgency = parseInt(process.env.IMPERSONATE_WRITE_AGENCY_ID || '', 10);
    if (Number.isFinite(writeAgency) && req.session.agencyId === writeAgency) return next();
    return res.status(403).json({ success: false, error: 'Read-only: you are viewing this portal as staff.' });
  }
  next();
}

app.use('/sis/partners/api', requirePartnerAuth, requireSignedContract, blockImpersonatedWrites, partnerRoutes(prisma));

// Serve static assets for partner portal (favicon etc)
app.use('/sis/partners/public', express.static(path.join(__dirname, '..', 'public')));

// ── Student Portal ─────────────────────────────
// Mobile-first portal at /sis/student with 3 tabs: SIS / Challenges / LMS.
// Auth: SisUser with userType='student' resolves to a Student row at login
// (see /sis/auth/login). The page itself requires a session; static assets
// under /sis/student/public/* stay public for the launch screen.
app.use('/sis/student/public', express.static(path.join(__dirname, '..', 'public')));
app.get('/sis/student', async (req, res) => {
  if (!req.session.user) return res.redirect('/sis/login');
  if (req.session.userType && req.session.userType !== 'student' && req.session.userType !== 'staff') {
    return res.redirect('/sis/login');
  }
  // Staff users (admin/dos/sales/accomm/staff) have no session.studentId, so
  // student API endpoints would 401 and the page would bounce to /sis/login.
  // Auto-pin them to the test.student record so /sis/student renders as a
  // live sample without any URL gymnastics. Real students keep their own
  // studentId from login; this branch is a no-op for them.
  if (!req.session.studentId) {
    const testUser = await prisma.sisUser.findUnique({ where: { username: 'test.student' } });
    if (testUser?.email) {
      const sample = await prisma.student.findFirst({
        where: { email: { equals: testUser.email, mode: 'insensitive' } },
        orderBy: { id: 'desc' },
        select: { id: true },
      });
      if (sample) req.session.studentId = sample.id;
    }
  }
  res.sendFile(path.join(__dirname, '..', 'public', 'student.html'));
});
// "No class" block screen — students who lack a booking / level / class
// assignment land here instead of /sis/student so they can't browse class
// data they're not enrolled in. Login handler routes them here.
app.get('/sis/student/no-class', (req, res) => {
  if (!req.session.user) return res.redirect('/sis/login');
  res.sendFile(path.join(__dirname, '..', 'public', 'student-no-class.html'));
});
app.use('/sis/student/api', studentRoutesPortal(prisma));

// ── Teacher / LMS-bound login (mirrors partner pattern but redirects to LMS, not SIS UI) ──
// /sis/teachers/login was a separate teacher-only login form before the
// 2026-05-04 consolidation. Now everyone goes through /sis/login (single
// unified entry point that role-routes after sign-in). Redirect any old
// bookmarks to the canonical URL.
app.get('/sis/teachers/login', (_req, res) => res.redirect(302, '/sis/login'));
app.get('/sis/teachers/auth/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/sis/login'));
});

// ── Public Social Calendar embed ───────────────
// Iframe-friendly month grid for marketing pages on ulearnschool.com.
// Returns publish-safe Activity fields only (no attendees, no IG/FB).
// Static page served from /sis/embed/social-calendar; data from
// /sis/api/social-calendar/month. Both deliberately bypass requireAuth
// (added to publicPaths below). 5-minute in-memory cache keeps load down
// when the page is hit by site crawlers / shared widely.
app.get('/sis/embed/social-calendar', (_req, res) => {
  res.setHeader('Content-Security-Policy', "frame-ancestors *");
  res.removeHeader('X-Frame-Options');
  res.sendFile(path.join(__dirname, '..', 'public', 'social-calendar-embed.html'));
});

// ── Public Seat Clearance showcase (tease) — iframe-friendly for ulearnschool.com ──
// Read-only offers + countdown; the reserve "business end" requires partner login.
// Static page + public data endpoint, both bypass requireAuth via publicPaths.
app.get('/sis/embed/seat-clearance', (_req, res) => {
  res.setHeader('Content-Security-Policy', "frame-ancestors *");
  res.removeHeader('X-Frame-Options');
  res.sendFile(path.join(__dirname, '..', 'public', 'seat-clearance-embed.html'));
});
app.get('/sis/api/clearance-public', async (_req, res) => {
  try {
    const d = await clearanceScripts(prisma).forAgency(null);
    res.setHeader('Content-Security-Policy', "frame-ancestors *");
    res.json({
      state: d.state,
      sale: d.sale ? { name: d.sale.name, endsAt: d.sale.endsAt, assignBy: (d.sale as any).assignBy } : null,
      offers: (d.offers || []).map((o: any) => ({
        id: o.id, title: o.title, subtitle: o.subtitle, category: o.category, session: o.session,
        model: o.model, cap: o.cap,
        retailPrice: o.retailPrice, clearancePrice: o.clearancePrice, priceUnit: o.priceUnit,
        depositPerSeat: o.depositPerSeat, seatsTotal: o.seatsTotal, seatsTaken: o.seatsTaken, seatsLeft: o.seatsLeft,
      })),
    });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// ── Live clearance rates — single source of truth for the hub autoQuote. ──────
// autoQuote reads Company `clearance_confirmed` (per-partner) off HubSpot, then
// calls this (global, cached hub-side) for the AM/PM course-only net + whether a
// sale is live. No live sale → autoQuote quotes normal AY price. Auth-exempt
// (added to publicPaths) so the hub can read it without a session.
app.get('/sis/api/clearance-rates', async (_req, res) => {
  try { res.json(await clearanceScripts(prisma).clearanceRates()); }
  catch (e: any) { res.status(500).json({ error: e.message }); }
});

// ── Public "Become a Host Family" application form ─────────────────────────
// Iframe-friendly page for ulearnschool.com. Applications land in the dedicated
// host_applications table (status=pending) — NOT the live providers list — so
// unvetted / spam applicants never touch matching or Xero. accomm@ is notified;
// staff review and, on approval, create the AccommodationProvider. Both routes
// bypass requireAuth via publicPaths.
app.get('/sis/host-apply', (_req, res) => {
  res.setHeader('Content-Security-Policy', "frame-ancestors *");
  res.removeHeader('X-Frame-Options');
  res.sendFile(path.join(__dirname, '..', 'public', 'host-application.html'));
});

app.post('/sis/api/host-application', hostApplyLimiter, async (req, res) => {
  try {
    const b = req.body || {};
    if (b.website) return res.json({ success: true }); // honeypot — pretend success
    // Submit-time trap: a human can't complete this form in <2.5s; a bot fills & fires
    // instantly. Fake success so the bot doesn't learn why. (Interim until Turnstile.)
    if (b.elapsedMs != null && Number(b.elapsedMs) < 2500) return res.json({ success: true });

    // Cloudflare Turnstile — verify the human-check token server-side. Gated on the secret
    // being set so the form never hard-breaks if it's ever unconfigured.
    if (process.env.TURNSTILE_SECRET) {
      let ok = false;
      try {
        const params = new URLSearchParams();
        params.append('secret', process.env.TURNSTILE_SECRET);
        params.append('response', String(b.turnstileToken || ''));
        const ip = String(req.headers['cf-connecting-ip'] || req.headers['x-forwarded-for'] || (req as any).ip || '').split(',')[0].trim();
        if (ip) params.append('remoteip', ip);
        const vr = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body: params });
        const vj: any = await vr.json();
        ok = !!vj.success;
        if (!ok) console.warn('[host-application] turnstile failed:', JSON.stringify(vj['error-codes'] || vj));
      } catch (e: any) {
        console.error('[host-application] turnstile verify error:', e.message);
        ok = false;
      }
      if (!ok) return res.json({ success: false, error: 'Human verification failed — please tick the box and try again.' });
    }

    const S = (v: any) => { const s = String(v == null ? '' : v).trim(); return s || null; };
    const firstName = S(b.firstName), lastName = S(b.lastName), email = S(b.email)?.toLowerCase() || null;
    const mobile = S(b.mobile), streetAddress = S(b.streetAddress), neighbourhood = S(b.neighbourhood), eircode = S(b.eircode);

    if (!firstName || !lastName || !email || !mobile || !streetAddress || !neighbourhood || !eircode) {
      return res.json({ success: false, error: 'Please complete all required fields.' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.json({ success: false, error: 'Please enter a valid email address.' });
    }

    const rooms = Array.isArray(b.rooms)
      ? b.rooms.filter((r: any) => r && r.type).map((r: any) => ({ type: String(r.type) }))
      : [];
    if (!rooms.length) return res.json({ success: false, error: 'Please add at least one room.' });

    const children = Array.isArray(b.children)
      ? b.children
          .filter((c: any) => c && (c.dob || c.name || c.gender))
          .map((c: any) => ({ name: String(c.name || '').trim(), dob: String(c.dob || '').trim(), gender: String(c.gender || '').trim() }))
      : [];

    // Host DOB (optional). "YYYY-MM-DD" parses as UTC midnight → @db.Date stores the
    // intended day (see UTC-date-math memory: local parsing would drift a day in summer).
    let dob: Date | null = null;
    if (b.dob) { const d = new Date(String(b.dob)); if (!isNaN(d.getTime())) dob = d; }

    const st = b.studentTypes || {};
    const studentTypes = { junior: !!st.junior, adult: !!st.adult, boy: !!st.boy, girl: !!st.girl };

    // Create a DEACTIVATED Host Family provider so the application lands in the Hosts list
    // for staff to review + tick "Activated?" (Neil 2026-07-12: applications arrive with
    // Active unchecked). NO dedup — a duplicate email is acceptable for now (Neil's own
    // household already exists as a provider; that's fine). The full structured submission
    // is kept in host_applications (linked) for children / Garda-vetting detail; a readable
    // summary goes in the provider `note` so staff see everything on the existing provider
    // card without a new screen.
    const acceptsSummary = Object.entries(studentTypes).filter(([, v]) => v).map(([k]) => k).join(', ') || '—';
    const childrenSummary = children.length
      ? children.map((c: any) => `${c.name || '(no name)'} — ${c.dob || '?'} — ${c.gender || '?'}`).join('; ')
      : 'none';
    const noteLines = [
      'HOST APPLICATION via website — pending review.',
      `Title: ${S(b.salutation) || '—'}${dob ? ` · DOB: ${String(b.dob)}` : ''}${b.secondaryContact ? ` · 2nd contact: ${S(b.secondaryContact)}` : ''}`,
      `Rooms: ${rooms.map((r: any) => r.type).join(', ') || '—'}`,
      `Accepts: ${acceptsSummary}`,
      `Children (Garda vetting): ${childrenSummary}`,
      `Pets: ${S(b.pets) || '—'}`,
      (b.accountName || b.iban || b.bic) ? `Bank: ${[S(b.accountName), S(b.iban), S(b.bic)].filter(Boolean).join(' · ')}` : null,
      S(b.additionalInfo) ? `Notes: ${S(b.additionalInfo)}` : null,
    ].filter(Boolean);

    const provider = await prisma.accommodationProvider.create({
      data: {
        name: `${firstName} ${lastName}`,
        type: 'Host Family',
        contactFirstName: firstName, contactLastName: lastName,
        email, mobile,
        address: streetAddress, addressAddon: neighbourhood, city: S(b.city) || 'Dublin', zip: eircode,
        description: S(b.familyDescription),
        iban: S(b.iban), bic: S(b.bic),
        note: noteLines.join('\n'),
        active: false, // arrives DEACTIVATED — staff review then tick "Activated?"
      } as any,
    });

    const created = await prisma.hostApplication.create({
      data: {
        salutation: S(b.salutation), firstName, lastName, dob, email, mobile,
        secondaryContact: S(b.secondaryContact),
        streetAddress, neighbourhood, city: S(b.city) || 'Dublin', eircode,
        rooms, studentTypes, familyDescription: S(b.familyDescription), children,
        pets: S(b.pets), additionalInfo: S(b.additionalInfo),
        accountName: S(b.accountName), iban: S(b.iban), bic: S(b.bic),
        providerId: provider.id,
      },
    });

    res.json({ success: true });

    // Notify the accommodation team (fire-and-forget — never blocks the applicant).
    (async () => {
      try {
        const { sendEmail } = await import('./scripts/email');
        const esc = (v: any) => String(v == null ? '' : v).replace(/[<>&]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' } as any)[c]);
        const roomsHtml = rooms.map((r: any) => esc(r.type)).join(', ') || '—';
        const childrenHtml = children.length
          ? children.map((c: any) => `${esc(c.name) || '(no name)'} — ${esc(c.dob) || '?'} — ${esc(c.gender) || '?'}`).join('<br>')
          : '—';
        const accepts = Object.entries(studentTypes).filter(([, v]) => v).map(([k]) => k).join(', ') || '—';
        const row = (k: string, v: any) => `<tr><td style="padding:4px 10px 4px 0;color:#6b7280;vertical-align:top;white-space:nowrap">${k}</td><td style="padding:4px 0">${v}</td></tr>`;
        const html = `
          <p>A new Host Family application has been submitted via the website.</p>
          <table style="border-collapse:collapse;font-size:14px">
            ${row('Name', `${esc(b.salutation)} ${esc(firstName)} ${esc(lastName)}`.trim())}
            ${row('Email', esc(email))}
            ${row('Mobile', esc(mobile))}
            ${dob ? row('DOB', esc(String(b.dob))) : ''}
            ${b.secondaryContact ? row('Secondary contact', esc(b.secondaryContact)) : ''}
            ${row('Address', `${esc(streetAddress)}, ${esc(neighbourhood)}, ${esc(S(b.city) || 'Dublin')} ${esc(eircode)}`)}
            ${row('Rooms', roomsHtml)}
            ${row('Accepts', accepts)}
            ${row('Children (under 18)', childrenHtml)}
            ${row('Pets', esc(b.pets) || '—')}
            ${b.familyDescription ? row('Family', esc(b.familyDescription)) : ''}
            ${b.additionalInfo ? row('Notes', esc(b.additionalInfo)) : ''}
            ${(b.accountName || b.iban || b.bic) ? row('Bank', `${esc(b.accountName)} · ${esc(b.iban)} · ${esc(b.bic)}`) : ''}
          </table>
          <p style="color:#6b7280;font-size:13px">Application #${created.id} — pending review.</p>`;
        await sendEmail({
          from: 'accomm@ulearnschool.com', fromName: 'ULearn',
          to: process.env.HOST_APPLICATION_NOTIFY || 'accomm@ulearnschool.com',
          replyTo: email,
          subject: `New Host Family Application — ${firstName} ${lastName}`,
          html,
        });
      } catch (e: any) {
        console.error(`[host-application] notify email failed for #${created.id}: ${e.message}`);
      }
    })();
  } catch (e: any) {
    console.error('[host-application] error:', e.message);
    return res.json({ success: false, error: 'Could not submit right now. Please try again in a moment.' });
  }
});

const socialCalCache = new Map<string, { at: number; data: any }>();
const SOCIAL_CAL_TTL_MS = 5 * 60 * 1000;
app.get('/sis/api/social-calendar/month', async (req, res) => {
  try {
    const year  = parseInt(String(req.query.year  || new Date().getFullYear()), 10);
    const month = parseInt(String(req.query.month || (new Date().getMonth() + 1)), 10);
    const key = `${year}-${month}`;
    const hit = socialCalCache.get(key);
    if (hit && (Date.now() - hit.at) < SOCIAL_CAL_TTL_MS) {
      res.setHeader('Cache-Control', 'public, max-age=300');
      return res.json(hit.data);
    }
    const { activitiesScripts } = await import('./scripts/activities');
    const scripts = activitiesScripts(prisma);
    const raw = await scripts.listForMonth(year, month - 1);
    // Strip everything that isn't safe for a public marketing page.
    const items = (raw.items || []).map((a: any) => ({
      id:            a.id,
      date:          a.date,
      startTime:     a.startTime,
      endTime:       a.endTime,
      title:         a.title,
      description:   a.description,
      cost:          a.cost,
      location:      a.location,
      imageFilename: a.imageFilename,
    }));
    const data = { from: raw.from, to: raw.to, items };
    socialCalCache.set(key, { at: Date.now(), data });
    res.setHeader('Cache-Control', 'public, max-age=300');
    res.json(data);
  } catch (e: any) {
    res.status(500).json({ error: String(e?.message || e) });
  }
});

// ── Auth middleware ────────────────────────────
// Public routes that skip auth:
const publicPaths = ['/sis/login', '/sis/forgot', '/sis/reset', '/sis/auth/', '/sis/health', '/sis/verify/', '/sis/api/webhooks', '/sis/api/email/quiz-result', '/sis/api/tests/public/', '/sis/api/activities/image/', '/sis/api/social-calendar/', '/sis/api/clearance-public', '/sis/api/clearance-rates', '/sis/embed/', '/sis/host-apply', '/sis/api/host-application', '/sis/public/favicon.ico', '/sis/public/launch/', '/sis/partners/login', '/sis/partners/auth/', '/sis/partners/public/', '/sis/student/public/', '/sis/teachers/login', '/sis/teachers/auth/'];

// Service-key auth: a Bearer token (SIS_SERVICE_KEY) lets an off-server caller
// (e.g. a dashboard driving the cognitive layer) authenticate as a MACHINE,
// scoped to /sis/api/* only — never the /sis/auth/* user flows or admin pages.
// Constant-time compare. Returns true if a valid key is present.
const SIS_SERVICE_KEY = process.env.SIS_SERVICE_KEY || '';
function hasServiceKey(req: express.Request): boolean {
  if (!SIS_SERVICE_KEY) return false;
  const m = (req.get('authorization') || '').match(/^Bearer\s+(.+)$/i);
  if (!m) return false;
  const a = Buffer.from(m[1]);
  const b = Buffer.from(SIS_SERVICE_KEY);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function requireAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  // Skip auth for public paths
  if (publicPaths.some(p => req.path.startsWith(p))) return next();

  // Partner routes are handled by their own middleware — skip the SIS auth check
  if (req.path.startsWith('/sis/partners')) return next();

  // Service-key bearer → 'service' identity for API calls only. Stamp the
  // identity onto the REAL session object (so express-session's cookie/serialise
  // machinery keeps working) but no-op its save() so NOTHING is persisted — a
  // bearer client carries no cookie and shouldn't create session rows.
  if (req.path.startsWith('/sis/api/') && hasServiceKey(req)) {
    const s: any = req.session;
    s.user = 'service';
    s.role = 'service';
    s.userType = 'service';
    s.readOnly = false;
    s.save = (cb?: (e?: any) => void) => { if (cb) cb(); };
    return next();
  }

  if (req.session.user) return next();

  // API calls get 401, page requests get redirected
  if (req.path.startsWith('/sis/api/')) {
    return res.status(401).json({ success: false, error: 'Not authenticated' });
  }
  // Route unknown page requests by context:
  //   - Referer from the partner portal → partner login
  //   - Otherwise → staff login (default)
  const ref = req.get('referer') || '';
  if (ref.includes('/sis/partners')) return res.redirect('/sis/partners/login');
  return res.redirect('/sis/login');
}

// ── Host portal (public — magic-link auth, no session) ──────────────────
// Registered BEFORE requireAuth so hosts can hit /host-portal/<token> from
// an email link without a SIS login. Token resolution lives in
// routes/host-portal.ts. See .claude/docs/accomm/portal/v1-spec.md.
import { publicHostPortalRoutes } from './routes/host-portal';
app.use('/host-portal', publicHostPortalRoutes(prisma));
// Garda vetting forms (NVB1/NVB3) — fill → print → upload signed. Same
// magic-link auth (requireHostToken). Mounted at the same base; falls through
// from the portal router for /host-portal/:token/vetting/*.
import { publicHostVettingRoutes } from './routes/host-vetting';
app.use('/host-portal', publicHostVettingRoutes(prisma));

// Teacher contract signing (public — magic-link auth, no session). Replaces
// Zoho Sign. Registered BEFORE requireAuth so teachers can sign from an email
// link. Token resolution in routes/teacher-contract.ts.
import { publicTeacherContractRoutes } from './routes/teacher-contract';
app.use('/teacher-contract', publicTeacherContractRoutes(prisma));

// Public privacy policy (no auth) — required URL for the Google Play listing.
app.get('/sis/privacy', (_req, res) => res.sendFile(path.join(__dirname, '..', 'public', 'privacy.html')));

// Public account-deletion instructions (no auth) — required URL for the Google Play Data Safety form.
app.get('/sis/delete-account', (_req, res) => res.sendFile(path.join(__dirname, '..', 'public', 'delete-account.html')));

// Public launch assets (no auth) — Play Store icon / feature graphic downloads.
app.use('/sis/launch', express.static(path.join(__dirname, '..', 'public', 'launch')));

// Public template assets (no auth) — email/document template artwork (e.g. birthday
// hero) must be fetchable by email clients with no session. Organised under
// public/assets/<email-templates|doc-templates>/. Served at /sis/assets/<…>.
app.use('/sis/assets', express.static(path.join(__dirname, '..', 'public', 'assets')));

app.use(requireAuth);

// ── Role-based API restrictions ───────────────
// Map a request URL path to its logical "section" for permission checks.
// The default is the first path segment (e.g. /students → students), but
// `/documents/templates*` is treated as its own section so we can gate
// template editing separately from document-record CRUD.
function pathToSection(p: string): string {
  if (p.startsWith('/documents/templates')) return 'document-templates';
  // Holidays are a sub-resource of bookings but logically independent:
  // DOS / sales / accomm must be able to add/remove student-requested
  // holidays even though the rest of the booking is view-only for them
  // (the booking's commercial terms are admin/accounts-only, but
  // holiday adjustment is a normal operational task).
  if (p.startsWith('/bookings/holidays') || /^\/bookings\/\d+\/holidays/.test(p)) return 'booking-holidays';
  const m = p.match(/^\/([^/?#]+)/);
  return m ? m[1] : '';
}

app.use('/sis/api', (req, res, next) => {
  // Public, token-authenticated endpoints (placement-test submit/draft/writing/
  // lookup) are mounted under /sis/api but must NOT be role-gated. Now that the
  // test runs same-origin (post-LMS-migration, 2026-09), a logged-in student
  // posting their OWN placement result carries a student session cookie, so
  // role='student' hits the 'tests' deny-list below and gets 403'd — silently
  // losing every in-app result. requireAuth already bypasses these paths; mirror
  // that here. (req.path is stripped of the /sis/api mount, so it's /tests/public/…)
  if (req.path.startsWith('/tests/public/')) return next();
  const role = req.session.role || 'staff';
  const perms = ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.sales;
  const section = pathToSection(req.path);

  if (perms.deny.includes(section)) {
    return res.status(403).json({ success: false, error: 'Access denied' });
  }

  // Templates (the underlying document HTML) are SUPER-ADMIN ONLY. Writing them
  // is hard-restricted to the admin/accounts roles as an explicit allow-list —
  // no matter what any other role's deny/viewOnly config says. Everyone else is
  // excluded by default (incl. teacher/student and any future role). They may
  // still generate document OUTPUT (the separate 'documents' section); they can
  // never touch the templates. (Neil, Jun 2026: "they cannot have access — only I can".)
  if (req.method !== 'GET' && section === 'document-templates' && role !== 'admin' && role !== 'accounts') {
    return res.status(403).json({ success: false, error: 'Templates are admin-managed' });
  }

  // Per-user hard read-only — overrides the role; blocks every write. Used to
  // single out an individual we don't yet trust to follow process, without
  // changing what their shared role can do for everyone else.
  if (req.method !== 'GET' && req.session.readOnly) {
    return res.status(403).json({ success: false, error: 'Your account is read-only' });
  }

  // viewOnly: GET allowed, writes blocked.
  if (req.method !== 'GET' && perms.viewOnly.includes(section)) {
    return res.status(403).json({ success: false, error: 'View-only access' });
  }

  next();
});

// ── Static files (auth required) ──────────────
app.use('/sis/public', express.static(path.join(__dirname, '..', 'public')));

// Serve admin UI — force no-store so the single-file HTML doesn't get
// stuck in browser cache between deploys. Without this, hard refresh +
// logout cycles can still serve a stale copy on some networks.
app.get('/sis/admin', (_req, res) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  res.sendFile(path.join(__dirname, '..', 'public', 'admin.html'));
});

// Payroll dashboard (standalone — cloned from Hub)
app.get('/sis/payroll', (_req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'payroll.html'));
});

// Refund queue + review now live INSIDE the admin SPA (navigate('refunds') /
// 'refund-detail') so they carry the standard sidebar/topbar frame like every other
// page. Redirect the old standalone URLs (bookmarks / emailed links) into the SPA.
app.get('/sis/refunds', (_req, res) => res.redirect('/sis/admin?view=refunds'));
app.get('/sis/refunds/:id', (_req, res) => res.redirect('/sis/admin?view=refunds'));

// Static reference data — ILEP programme codes (read-only, served from JSON file)
app.get('/sis/api/ilep-codes', (_req, res) => {
  try {
    const p = path.join(__dirname, '..', '.claude', 'docs', 'ILEP', 'ilep-codes.json');
    res.json(JSON.parse(fs.readFileSync(p, 'utf-8')));
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

// API routes
app.use('/sis/api/students', studentRoutes(prisma));
app.use('/sis/api/bookings', bookingRoutes(prisma));
app.use('/sis/api/classes', classRoutes(prisma));
app.use('/sis/api/groups', groupRoutes(prisma));
import { teacherContractAdminRoutes } from './routes/teacher-contract';
app.use('/sis/api/teacher-contract', teacherContractAdminRoutes(prisma));
app.use('/sis/api/accommodation', accommodationRoutes(prisma));
app.use('/sis/api/webhooks', webhookRoutes(prisma));
app.use('/sis/api/tests/public', testRoutesPublic(prisma));     // LMS posts results here (CORS)
app.use('/sis/api/tests', testRoutesStaff(prisma));              // staff-auth token issuance
app.use('/sis/api/attendance', attendanceRoutes(prisma));
app.use('/sis/api/transport', transportRoutes(prisma));
// Refund requests. Two mounts:
//  • /sis/api/webhooks/refund-request — PUBLIC (in publicPaths → bypasses auth).
//    This path exists ONLY for the Drupal intake webhook (POST /webhook, guarded
//    by the X-Refund-Secret shared secret inside the handler). The guard below
//    hard-restricts this mount to exactly that one route — WITHOUT it, mounting
//    the full router here exposed the entire refund CRUD (list/detail/refusal
//    letters/bank details/create/patch) UNAUTHENTICATED, because the role gate
//    sees the section as "webhooks", not "refunds". (Security fix — Neil, 2026-09-21)
//  • /sis/api/refunds — authenticated + role-gated (admin/accounts) CRUD/approve.
app.use('/sis/api/webhooks/refund-request', (req, res, next) => {
  if (req.method === 'POST' && req.path === '/webhook') return next();
  return res.status(404).json({ success: false, error: 'Not found' });
}, refundRoutes(prisma));
app.use('/sis/api/refunds', refundRoutes(prisma));
app.use('/sis/api/documents', documentRoutes(prisma));
app.use('/sis/api/email', emailRoutes(prisma));
app.use('/sis/api/search', searchRoutes(prisma));
app.use('/sis/api/host-payments', hostPaymentRoutes(prisma));
app.use('/sis/api/host-portal', hostPortalRoutes(prisma));
import { hostVettingAdminRoutes } from './routes/host-vetting';
app.use('/sis/api/host-vetting', hostVettingAdminRoutes(prisma));
app.use('/sis/api/payroll', payrollRoutes(prisma));
app.use('/sis/api/activities', activitiesRoutes(prisma));
app.use('/sis/zoho/auth', zohoAuthRoutes());

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

// NOTE: GET /sis/verify/:token is handled by the merged route above (≈line 496),
// which dispatches student-account tokens vs document-verification tokens. Do not
// re-register the path here — Express would only ever match the first one.

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
  <div class="row"><span class="label">Stay Start</span><span class="value">${fmtDate(data.booking.startDate)}</span></div>
  <div class="row"><span class="label">Stay End</span><span class="value">${fmtDate(data.booking.endDate)}</span></div>
  ${data.booking.weeks != null ? `<div class="row"><span class="label">Stay Duration</span><span class="value">${data.booking.weeks} weeks</span></div>` : ''}` : ''}
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
