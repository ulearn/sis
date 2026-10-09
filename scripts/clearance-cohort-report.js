/**
 * clearance-cohort-report.js — READ-ONLY snapshot of the Seat Clearance cohort in SIS.
 *
 * After Hub fires the /clearance-eligible webhook across the outreach cohort, run this to
 * see the real state in SIS: how many agencies are ELIGIBLE (can see the tab + claim) and
 * how many have CONFIRMED (claimed → priced). Confirms nothing was accidentally priced —
 * eligible is just access; only confirmed drives the clearance rate.
 *
 *   node scripts/clearance-cohort-report.js            # summary + confirmed list
 *   node scripts/clearance-cohort-report.js --list     # also list every eligible agency
 *
 * Writes nothing. Safe to run any time.
 */
const { PrismaClient } = require('../dist/generated/prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
require('dotenv').config();

(async () => {
  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
  const showList = process.argv.includes('--list');
  try {
    const eligible = await prisma.agency.findMany({
      where: { clearanceEligible: true },
      select: { id: true, name: true, hubspotCompanyId: true, clearanceConfirmed: true },
      orderBy: { name: 'asc' },
    });
    const confirmed = eligible.filter(a => a.clearanceConfirmed);

    console.log('\n=== Seat Clearance cohort — SIS state ===');
    console.log(`ELIGIBLE (see tab + can claim): ${eligible.length}`);
    console.log(`CONFIRMED (claimed → priced):   ${confirmed.length}`);
    console.log(`— eligible but not yet claimed:  ${eligible.length - confirmed.length}`);

    if (confirmed.length) {
      console.log('\nCONFIRMED agencies (these price at clearance on AY deals):');
      confirmed.forEach(a => console.log(`  • ${a.name}  [agency ${a.id}, company ${a.hubspotCompanyId || '—'}]`));
    } else {
      console.log('\nNo agencies confirmed yet — nothing is being priced at clearance. (Expected pre-launch.)');
    }

    if (showList) {
      console.log('\nALL ELIGIBLE agencies:');
      eligible.forEach(a => console.log(`  ${a.clearanceConfirmed ? '✓' : ' '} ${a.name}  [agency ${a.id}, company ${a.hubspotCompanyId || '—'}]`));
    } else if (eligible.length) {
      console.log('\n(run with --list to see every eligible agency)');
    }
    console.log('');
  } catch (e) {
    console.error('ERROR:', e.message);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
})();
