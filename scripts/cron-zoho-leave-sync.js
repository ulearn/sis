#!/usr/bin/env node
/**
 * Daily Zoho leave sync — pulls approved-leave from Zoho People into OccurrenceAbsence
 * rows for the next 8 weeks. Run from system cron at 08:00 daily.
 *
 * Crontab line:
 *   0 8 * * * cd /home/sis/web/sis.ulearnschool.com/public_html/sis && /usr/bin/env node scripts/cron-zoho-leave-sync.js >> tmp/zoho-sync.log 2>&1
 *
 * Idempotent — safe to run on demand too.
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

(async () => {
  const t0 = Date.now();
  const ts = new Date().toISOString();
  try {
    const pg = require('pg');
    const { PrismaPg } = require('@prisma/adapter-pg');
    const { PrismaClient } = require('../dist/generated/prisma/client');
    const { schedulingScripts } = require('../dist/scripts/scheduling');

    const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
    const adapter = new PrismaPg(pool);
    const prisma = new PrismaClient({ adapter });
    const sched = schedulingScripts(prisma);

    const from = new Date(); from.setHours(0, 0, 0, 0);
    const to = new Date(from); to.setDate(to.getDate() + 7 * 8);

    const result = await sched.syncZohoLeaveToAbsences(from, to);
    const ms = Date.now() - t0;
    console.log(`[${ts}] zoho-leave-sync: ${ms}ms · ${JSON.stringify(result)}`);

    await prisma.$disconnect();
    process.exit(0);
  } catch (e) {
    console.error(`[${ts}] zoho-leave-sync FAILED:`, e.message);
    process.exit(1);
  }
})();
