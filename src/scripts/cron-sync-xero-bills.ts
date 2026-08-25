// Standalone cron: refresh Xero bill statuses for every open host
// payment line item. Whole-DB sweep (no providerId filter).
//
// Why: Accounts Payable typically settles Wednesday/Thursday at ULearn.
// Without this cron the SIS-side xeroStatus on those just-paid bills stays
// 'submitted' until the Monday host-payment cron runs (it embeds the same
// sync at the top of calculatePaymentRun). This refresh closes that gap so
// the host portal + admin UIs show "PAID" within a day of actual payment,
// not 4-5 days later.
//
// Idempotent + cheap. Only hits Xero for bills still 'submitted' / null —
// query shrinks naturally as bills get paid.
//
// Schedule: Wednesday 15:40 — AP runs Wednesday and the bank closes 15:30, so
// an on-time settlement has cleared by 15:40. Late runs (Thu morning) are
// caught by the Monday host-payment cron's embedded sync before the next cycle.
//   40 15 * * 3 cd /home/sis/web/sis.ulearnschool.com/public_html/sis \
//             && /usr/bin/node dist/scripts/cron-sync-xero-bills.js \
//             >> /home/sis/web/sis.ulearnschool.com/private/db/host-payments.log 2>&1
import dotenv from 'dotenv'; dotenv.config();
import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';
import { hostPaymentScripts } from './host-payments';

(async () => {
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool as any);
  const prisma = new PrismaClient({ adapter });
  try {
    const t0 = Date.now();
    const result = await hostPaymentScripts(prisma).syncXeroBillStatuses();
    const ms = Date.now() - t0;
    console.log(`[${new Date().toISOString()}] cron-sync-xero-bills: checked=${result.checked} paid=${result.paid} voided=${result.voided} (${ms}ms)`);
  } catch (e: any) {
    console.error(`[${new Date().toISOString()}] cron-sync-xero-bills FAILED:`, e?.message || e);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
})();
