
const fs = require('fs');
const crypto = require('crypto');
const exec = require('child_process').execSync;
const out = exec('node .claude/cron/sheet.js read').toString();
const sheet = JSON.parse(out);
const sdata = fs.readFileSync('.claude/cron/state/seen.json');
const seen = JSON.parse(sdata);
const sep = '_r';
const e = '';
sheet.rows.forEach(r => {
  const cells = r.cells;
  const bval = cells.B || e;
  const fval = cells.F || e;
  const gval = cells.G || e;
  const alg = 'sha1';
  const enc = 'hex';
  const hash = crypto.createHash(alg).update(bval + fval + gval).digest(enc);
  const key = r.issue + sep + r.row;
  seen[key] = hash;
});
const outpath = '.claude/cron/state/seen.json';
fs.writeFileSync(outpath, JSON.stringify(seen, null, 2));
console.log('updated:', Object.keys(seen).length);
