/**
 * cron-exam-reminders — follow-up reminders / escalations for exam booking
 * requests awaiting CES confirmation. Ships DARK (data/exam-config.json
 * reminders.armed = false): the cron runs and reports, but sends nothing until
 * armed from admin → Examinations → Settings.
 *
 * Cadence (working days, Irish bank-holiday aware), configurable:
 *   · ackDays (default 3):   flag a REQUESTED booking CES hasn't acknowledged.
 *   · escalateDays (def 7):  email success@ to chase an unresolved request.
 * (Pre/post-exam student reminders are scaffolded in exam-config but off here
 * until the exam-day reminder copy is signed off — kept minimal per spec "keep
 * v1 small and reliable".)
 *
 * Run:  node dist/scripts/cron-exam-reminders.js [--dry]
 * Suggested crontab: 0 9 * * *  (daily 09:00, after the other morning crons)
 */
import dotenv from 'dotenv';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';
import { examScripts } from './exams';

async function main() {
  dotenv.config();
  const dry = process.argv.includes('--dry');
  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) });
  const now = new Date();
  console.log(`[${now.toISOString()}] exam-reminders${dry ? ' (DRY RUN)' : ''} — ticking…`);
  try {
    const summary = await examScripts(prisma).reminderTick({ dry });
    console.log('  ', JSON.stringify(summary));
    if (!summary.armed && !dry) console.log('  reminders are DARK (reminders.armed=false) — nothing sent. Arm in admin → Examinations → Settings.');
  } catch (e: any) {
    console.error('  exam-reminders failed:', e?.message || e);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main();
