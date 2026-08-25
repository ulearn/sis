// Weekly Host Outreach nudge — Nudge #1 (Auto).
//
// Emails every matching-enabled Host-Family provider (with an email + portal
// magic-link) when ≥1 unmatched HF student sits in the pool the host portal
// renders (§A). Sent from accomm@. Idempotent per week: a host already sent this
// template in the last 6 days is skipped, so a double-fire can't double-nudge.
//
// The send logic lives in dist/scripts/host-outreach (runHostOutreach) and is
// SHARED with the manual "Nudge Hosts" button on the Matching screen (which fires
// Nudge #2). This file is just the weekly-cron entrypoint for Nudge #1.
//
// The email body is the editable DB template `host-outreach-weekly` ("Host
// Outreach — Nudge #1 (Auto)" in the Email Template Manager).
//
// Run:
//   node .claude/cron/host-outreach.js            # dry run
//   node .claude/cron/host-outreach.js --apply    # live send
// Cron:
//   0 16 * * 1  cd /home/sis/web/sis.ulearnschool.com/public_html/sis && node .claude/cron/host-outreach.js --apply >> .claude/cron/logs/host-outreach.log 2>&1

require('dotenv').config({ quiet: true });
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('../../dist/generated/prisma/client');
const { runHostOutreach } = require('../../dist/scripts/host-outreach');

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const APPLY = process.argv.includes('--apply');

(async () => {
  const r = await runHostOutreach(prisma, {
    templateSlug: 'host-outreach-weekly',   // Nudge #1 (Auto)
    apply: APPLY,
    sentBy: 'cron:host-outreach',
    log: (m) => console.log('[host-outreach]', m),
  });
  console.log(`[host-outreach] ${new Date().toISOString()} — ${APPLY ? 'SENT' : 'DRY-RUN (would send)'}: ${r.sent} | skipped already-this-week: ${r.skippedWeek} | skipped no-portal-link: ${r.skippedNoLink} | failed: ${r.failed} | pool: ${r.pool}`);
  await prisma.$disconnect();
})().catch(e => { console.error(e); process.exit(1); });
