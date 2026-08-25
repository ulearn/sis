// AutoNudge Cascade cron — fires each enabled wave at its day + time.
// Runs every 15 min; each run fires any wave whose day+time is due and hasn't
// fired today, gated on the live unplaced pool + the master `armed` switch
// (disarmed = dry-run: computes what it WOULD send but sends nothing). The
// per-send pool re-check inside sendWave auto-stops the instant students are placed.
//
// Cron line (every 15 min):
//   */15 * * * * cd /home/sis/web/sis.ulearnschool.com/public_html/sis && /usr/bin/node dist/scripts/cron-auto-nudge.js >> /home/sis/web/sis.ulearnschool.com/private/db/auto-nudge.log 2>&1

import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';
import { autoNudgeScripts } from './auto-nudge';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

(async () => {
  try {
    const res = await autoNudgeScripts(prisma).runDueWaves();
    if (res.fired.length) {
      console.log(`[auto-nudge ${res.checkedAt}] armed=${res.armed} — fired ${res.fired.length} wave(s):`);
      for (const f of res.fired) {
        console.log(`  ${f.id} B${f.batch}W${f.wave} → sent ${f.sent}${f.dryRun ? ' (DRY-RUN)' : ''}` +
          `${f.stopped ? ' [auto-stopped: pool emptied]' : ''} · skipped ${f.skippedWeek || 0} · failed ${f.failed || 0}` +
          `${f.reason ? ' · ' + f.reason : ''}`);
      }
    }
    // Silent when nothing is due (runs every 15 min).
  } catch (e) {
    console.error('[auto-nudge] error:', e);
  } finally {
    await prisma.$disconnect();
  }
})();
