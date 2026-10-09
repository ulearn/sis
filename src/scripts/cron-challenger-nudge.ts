// KickStart Challenger nudge cron — fires each enabled wave (Mon/Wed/Fri) at its
// day + time, gated on the master `armed` switch (disarmed = dry-run: computes what
// it WOULD send but sends nothing). Per-student auto-stop lives in sendWave (skips
// anyone who finished the 3 tasks, or was nudged <20h ago). Replies are ignored.
//
// Cron line (every 15 min):
//   */15 * * * * cd /home/sis/web/sis.ulearnschool.com/public_html/sis && /usr/bin/node dist/scripts/cron-challenger-nudge.js >> /home/sis/web/sis.ulearnschool.com/private/db/challenger-nudge.log 2>&1

import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';
import { challengerNudgeScripts } from './challenger-nudge';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

(async () => {
  try {
    const res = await challengerNudgeScripts(prisma).runDueWaves();
    if (res.fired.length) {
      console.log(`[challenger-nudge ${res.checkedAt}] armed=${res.armed} — fired ${res.fired.length} wave(s):`);
      for (const f of res.fired) {
        console.log(`  ${f.id} → cohort ${f.cohort} · eligible ${f.eligible} · sent ${f.sent}${f.dryRun ? ' (DRY-RUN)' : ''}` +
          ` · done ${f.done} · dedup ${f.dedup} · noEmail ${f.noEmail} · failed ${f.failed}`);
      }
    }
  } catch (e) {
    console.error('[challenger-nudge] error:', e);
  } finally {
    await prisma.$disconnect();
  }
})();
