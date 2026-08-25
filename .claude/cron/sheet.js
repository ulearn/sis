#!/usr/bin/env node
/**
 * SIS Cleanup sheet helper (stable, for the hourly issue-bot + manual use).
 *   node sheet.js read              -> prints the sheet as JSON {header, rows:[{row, cells:{A..K}}]}
 *   node sheet.js write <file.json> -> batchUpdate; file = [{range:"Sheet1!H5:K5", values:[[...]]}, ...]
 * Auth: neil@ OAuth (full drive scope) at lms-api/.secrets/oauth.json.
 */
const fs = require('fs');
const OAUTH = '/home/sis/web/sis.ulearnschool.com/public_html/lms/lms-api/.secrets/oauth.json';
const SHEET = '1XYnr1KSVkOKF8PEf9hGSYXOUQdsteDknY7UVymiUGj0';
const TAB = 'ISSUE LOG'; // the live issue-queue tab (renamed from Sheet1 2026-06-05)
const COLS = ['A','B','C','D','E','F','G','H','I','J','K'];

async function accessToken() {
  const t = JSON.parse(fs.readFileSync(OAUTH, 'utf8'));
  const body = new URLSearchParams({ client_id: t.client_id, client_secret: t.client_secret, refresh_token: t.refresh_token, grant_type: 'refresh_token' });
  const j = await (await fetch('https://oauth2.googleapis.com/token', { method: 'POST', body })).json();
  if (!j.access_token) throw new Error('token: ' + JSON.stringify(j));
  return j.access_token;
}

async function read() {
  const AT = await accessToken();
  const v = await (await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SHEET}/values/${encodeURIComponent(TAB)}?majorDimension=ROWS`, { headers: { Authorization: 'Bearer ' + AT } })).json();
  if (v.error) throw new Error(JSON.stringify(v.error));
  const all = v.values || [];
  const header = all[0] || [];
  const rows = [];
  for (let i = 1; i < all.length; i++) {
    const r = all[i] || [];
    if (!r.some(c => String(c || '').trim())) continue;
    const cells = {};
    COLS.forEach((c, j) => { cells[c] = r[j] != null ? String(r[j]) : ''; });
    rows.push({ row: i + 1, issue: cells.A, cells });
  }
  console.log(JSON.stringify({ header, rows }, null, 1));
}

async function write(file) {
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  // Qualify bare ranges (e.g. "H3") with the tab; the spaced tab name must be quoted.
  for (const d of data) { if (d.range && !d.range.includes('!')) d.range = `'${TAB}'!${d.range}`; }
  const AT = await accessToken();
  const r = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SHEET}/values:batchUpdate`, {
    method: 'POST', headers: { Authorization: 'Bearer ' + AT, 'Content-Type': 'application/json' },
    body: JSON.stringify({ valueInputOption: 'RAW', data }),
  });
  const j = await r.json();
  if (j.error) throw new Error(JSON.stringify(j.error));
  console.log('OK cells=' + j.totalUpdatedCells + ' ranges=' + (j.responses || []).map(x => x.updatedRange).join(','));
}

(async () => {
  const [cmd, arg] = process.argv.slice(2);
  if (cmd === 'read') await read();
  else if (cmd === 'write') await write(arg);
  else { console.error('usage: sheet.js read | write <file.json>'); process.exit(2); }
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
