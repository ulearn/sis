/**
 * Annual bank-holiday refresh — runs on 31 December each year and pulls the
 * FOLLOWING year's Irish statutory public holidays into data/bank-holidays.json.
 *
 * "Pull" = compute from the statutory rules (fixed dates + nth/last-Monday +
 * Easter computus + cascading weekend substitutes), not a web scrape: the dates
 * are fully rule-determined by law, and computation is deterministic and can't
 * silently 403 / mis-parse a changed webpage the way scraping could. The result
 * is verified to match the officially published dates. The JSON stays
 * hand-editable for the rare ad-hoc one-off holiday, which no rule predicts.
 *
 * Overwrites the target year if already present (e.g. the seeded 2027) — safe,
 * because the computed dates are factually identical to the published ones.
 *
 * Crontab (05:00, 31 Dec, every year):
 *   0 5 31 12 * cd .../sis && /usr/bin/node dist/scripts/cron-bank-holidays.js >> .../bank-holidays.log 2>&1
 *
 * Flags: --dry (preview, no write), --year=YYYY (override the target year).
 */
import { computeHolidayList, saveComputedYear } from './irish-holidays';

function main() {
  const args = process.argv.slice(2);
  const dry = args.includes('--dry');
  const yearArg = args.find(a => a.startsWith('--year='));
  const target = yearArg ? Number(yearArg.split('=')[1]) : new Date().getUTCFullYear() + 1;

  console.log(`[${new Date().toISOString()}] bank-holidays: ${dry ? 'DRY-RUN ' : ''}refresh → ${target}`);

  const list = dry ? computeHolidayList(target) : saveComputedYear(target);
  for (const h of list) console.log(`  ${h.date}  ${h.name}`);
  console.log(`  ${dry ? 'would write' : 'wrote'} ${list.length} holidays for ${target}`);
}

try { main(); }
catch (e) { console.error('bank-holidays cron failed:', e); process.exit(1); }
