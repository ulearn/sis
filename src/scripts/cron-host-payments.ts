/**
 * Standalone cron script: Host Payment Run
 * Runs Monday 03:00 GMT
 * Calculates fortnightly + checkout payments, creates a payment run.
 *
 * Usage: node dist/scripts/cron-host-payments.js
 */

import dotenv from 'dotenv';
import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';
import { hostPaymentScripts } from './host-payments';

dotenv.config();

async function main() {
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool as any);
  const prisma = new PrismaClient({ adapter });
  const scripts = hostPaymentScripts(prisma);

  try {
    const now = new Date();
    console.log(`[${now.toISOString()}] Running host payment calculation...`);

    const result = await scripts.calculatePaymentRun(now);
    console.log(`[${now.toISOString()}] ${result.message}`);

    if (result.run && result.created) {
      console.log(`  Run ID: ${result.run.id}`);
      console.log(`  Total: €${result.run.totalAmount}`);
      console.log(`  Line items: ${(result.run as any).lineItems?.length || 0}`);
    }
  } catch (e) {
    console.error('Host payment cron error:', e);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
