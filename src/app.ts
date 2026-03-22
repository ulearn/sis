import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from './generated/prisma/client';

dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool as any);
const prisma = new PrismaClient({ adapter });

import { studentRoutes } from './routes/students';
import { bookingRoutes } from './routes/bookings';
import { classRoutes } from './routes/classes';
import { accommodationRoutes } from './routes/accommodation';
import { webhookRoutes } from './routes/webhooks';
import { attendanceRoutes } from './routes/attendance';
import { seedClassrooms } from './scripts/seed';

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

// Seed classrooms on startup
seedClassrooms(prisma).catch(console.error);

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
