
const fs = require('fs');
const path = '.claude/docs/GSheet Issues/payload-24jul-hrly-c.json';

// Load previous payload and modify
const prev = JSON.parse(fs.readFileSync('.claude/docs/GSheet Issues/payload-24jul-hrly-b.json', 'utf8'));

// Row 2: Issue 1 - update check count 55th/149th -> 56th/150th
// Also clarify BA count: 43 with beds (vs 11,176 total stated previously)
prev[0].values[0][0] = prev[0].values[0][0]
  .replace('55th hourly check', '56th hourly check')
  .replace('(149th total)', '(150th total)')
  .replace('Stale booking accommodations: 11,176 — unchanged', 'Stale booking accommodations with beds: 43 — unchanged');
prev[0].values[0][1] = prev[0].values[0][1].replace('24jul-b.md', '24jul-c.md');
prev[0].values[0][2] = prev[0].values[0][2]
  .replace('55th hrly 149th check', '56th hrly 150th check')
  .replace('Stale BAs: 11,176', 'Stale BAs with beds: 43');

// Row 23: Issue 22 - update 69th/149th -> 70th/150th
prev[1].values[0][0] = prev[1].values[0][0]
  .replace('69th hourly check', '70th hourly check')
  .replace('(149th total)', '(150th total)')
  .replace('Mon 27 Jul – Fri 7 Aug 2026 (~8 school days)', 'Mon 27 Jul – Fri 7 Aug (~9 school days from system view)')
  .replace('(10 school days today)', '= 10 school days');
prev[1].values[0][1] = prev[1].values[0][1].replace('24jul-b.md', '24jul-c.md');
prev[1].values[0][2] = prev[1].values[0][2].replace('69th hrly 149th check', '70th hrly 150th check').replace('8 remaining', '9 remaining (system view)');

// Row 25: Issue 24 - update 54th/149th -> 55th/150th (keep as is, just increment)
prev[2].values[0][0] = prev[2].values[0][0]
  .replace('54th hourly check', '55th hourly check')
  .replace('(149th total)', '(150th total)')
  .replace('(5 school days — first week complete)', '= 5 school days');
prev[2].values[0][2] = prev[2].values[0][2].replace('54th hrly 149th check', '55th hrly 150th check');

// Row 40: Issue 38 - update 76th/149th -> 77th/150th
prev[3].values[0][0] = prev[3].values[0][0]
  .replace('76th hourly check', '77th hourly check')
  .replace('(149th total)', '(150th total)')
  .replace('(corrected date: 26 Oct, not 27 Oct)', '')
  ;
prev[3].values[0][1] = prev[3].values[0][1].replace('24jul-b.md', '24jul-c.md');
prev[3].values[0][2] = prev[3].values[0][2].replace('76th hrly 149th check', '77th hrly 150th check').replace('Oct BH date corrected to 26 Oct. ', 'Oct BH 26 Oct. ');

// Row 41: Issue 39 - update 71st/149th -> 72nd/150th, update K to CRITICAL
prev[4].values[0][0] = prev[4].values[0][0]
  .replace('71st hourly check', '72nd hourly check')
  .replace('(149th total)', '(150th total)')
  .replace('(10 school days today)', '= 10 school days')
  .replace('Course ends Fri 31 Jul 2026 — WINDOW CLOSING', 'Today (Fri 24 Jul) is the last business day before the weekend — WINDOW CLOSING');
prev[4].values[0][1] = prev[4].values[0][1].replace('immediately', '— 5 school days left, course ends Fri 31 Jul').replace('24jul-b.md', '24jul-c.md');
prev[4].values[0][2] = prev[4].values[0][2].replace('71st hrly 149th check', '72nd hrly 150th check');
prev[4].values[0][3] = 'CRITICAL; 5 school days left';

// Row 43: Issue 41 - update 71st/149th -> 72nd/150th
prev[5].values[0][0] = prev[5].values[0][0]
  .replace('71st hourly check', '72nd hourly check')
  .replace('(149th total)', '(150th total)');
prev[5].values[0][1] = prev[5].values[0][1].replace('24jul-b.md', '24jul-c.md');
prev[5].values[0][2] = prev[5].values[0][2].replace('71st hrly 149th check', '72nd hrly 150th check');

// Replace row 25 with row 38 (Issue 36b — stale BAs)
prev[2] = {
  range: 'H38:K38',
  values: [[
    '• 45th hourly check Fri 24 Jul 2026 UTC (150th total)\n• Pietro original issue resolved — booking accommodation 11311 (bed 84, 28 Jun – 13 Sep 2026) correct\n• Stale booking accommodations with beds: 43 — UNCHANGED from 44th check Thu 23 Jul\n• Most recently expired: BA 11265 (bed 157, booking 1274, ended 19 Jul), BA 11365 (bed 174, booking 18184, ended 18 Jul), BA 11257 (bed 168, booking 7, ended 18 Jul)\n• Total stale booking accommodations (all, including unassigned beds): ~11,176 — unchanged\n• Fix NOT RUN',
    'Deactivate 43 stale booking accommodations with beds; schedule nightly cleanup for 11k+ total. See recipe: issue-36b-addendum-24jul.md',
    '45th hrly 150th check Fri 24 Jul UTC. Stale BAs WITH beds: 43 — UNCHANGED since 44th Thu 23 Jul. Fix NOT RUN.',
    '43 stale BAs with beds'
  ]]
};

fs.writeFileSync(path, JSON.stringify(prev, null, 2));
console.log('Payload written to', path);
console.log('Rows:', prev.map(p => p.range).join(', '));
