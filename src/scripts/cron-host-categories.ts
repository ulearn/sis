/**
 * cron-host-categories — nightly re-derivation of Host-Family segments from
 * hosting activity (scripts/host-category.ts). Skips manual overrides. Cheap
 * (one grouped query + updates only what changed).
 *
 *   node dist/scripts/cron-host-categories.js         # apply
 *   node dist/scripts/cron-host-categories.js --dry   # preview only
 * Cron (daily 05:10):
 *   10 5 * * * cd .../sis && /usr/bin/node dist/scripts/cron-host-categories.js >> .../private/db/host-categories.log 2>&1
 */
import dotenv from 'dotenv';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';
import { recomputeHostCategories } from './host-category';

async function main() {
  dotenv.config();
  const dry = process.argv.includes('--dry');
  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) });
  try {
    const r = await recomputeHostCategories(prisma, { apply: !dry, log: (m) => console.log(`[cron-host-categories] ${m}`) });
    console.log(`[cron-host-categories] ${new Date().toISOString()} ${dry ? 'DRY' : 'done'}: ${JSON.stringify(r)}`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => { console.error('cron-host-categories failed:', e); process.exit(1); });
