/**
 * Challenge Registry — single source of truth for per-month Challenge values.
 *
 * DATA lives in ./challenges.json (edit THAT, nothing else). This module just
 * reads it live: an mtime check means edits to challenges.json take effect
 * immediately — NO hub restart, NO code change. Consumers:
 *   - scripts/quote/autoQuote.js + creator.js   (Course discount on Deals)
 *   - SIS partner portal + website              (via GET /hubapp/challenges/current)
 *
 * Editing rules (in challenges.json):
 *   - Key each month "YYYY-MM"; value { <ChallengeType>: { percent, starts, ends, appliesTo } }.
 *   - <ChallengeType> MUST match the HubSpot Deal `challenge` dropdown internal value (KickStart | CashBack).
 *   - Never edit a past month — issued quotes snapshot the % at quote time.
 */

const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, 'challenges.json');

// mtime-cached read: only re-parse the file when it actually changes on disk.
let _cache = { mtimeMs: -1, data: {} };
function load() {
  try {
    const st = fs.statSync(DATA_FILE);
    if (st.mtimeMs !== _cache.mtimeMs) {
      _cache = { mtimeMs: st.mtimeMs, data: JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')) };
    }
  } catch (err) {
    // Mid-edit / unreadable / bad JSON → keep the last good copy, never crash a quote.
    console.log(`[challenges] load fallback: ${err.message}`);
  }
  return _cache.data || {};
}

function monthKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

/**
 * Discount % for a Challenge type in the current (or supplied) month.
 * 0 = no match (caller treats 0 as "no Challenge applied").
 */
function getChallengeDiscount(challengeType, date = new Date()) {
  if (!challengeType) return 0;
  const monthEntry = load()[monthKey(date)];
  if (!monthEntry) return 0;
  const wanted = String(challengeType).toLowerCase();
  for (const [type, info] of Object.entries(monthEntry)) {
    if (type.toLowerCase() === wanted) return info.percent || 0;
  }
  return 0;
}

/** Full entry (percent + starts + ends + appliesTo) for a type/month, or null. */
function getChallengeEntry(challengeType, date = new Date()) {
  if (!challengeType) return null;
  const monthEntry = load()[monthKey(date)];
  if (!monthEntry) return null;
  const wanted = String(challengeType).toLowerCase();
  for (const [type, info] of Object.entries(monthEntry)) {
    if (type.toLowerCase() === wanted) return info;
  }
  return null;
}

/**
 * The active Challenge for a given month (today only ever one type per month).
 * Flat shape for the JSON utility / portal label. null if no live challenge.
 */
function currentChallenge(date = new Date()) {
  const monthEntry = load()[monthKey(date)];
  if (!monthEntry) return null;
  const [type, info] = Object.entries(monthEntry)[0];
  return {
    type,
    month: monthKey(date),
    percent: info.percent,
    starts: info.starts || null,
    ends: info.ends || null,
    appliesTo: info.appliesTo || null
  };
}

/**
 * Validate + atomically write the whole schedule to challenges.json.
 * Used by the Challenges dashboard (POST /hubapp/challenges). Throws on bad input.
 */
function saveChallenges(months) {
  if (!months || typeof months !== 'object' || Array.isArray(months)) {
    throw new Error('months must be an object keyed by "YYYY-MM"');
  }
  const clean = {};
  for (const mk of Object.keys(months).sort()) {
    if (!/^\d{4}-\d{2}$/.test(mk)) throw new Error(`Bad month key "${mk}" — use YYYY-MM`);
    const entry = months[mk];
    if (!entry || typeof entry !== 'object') throw new Error(`Bad entry for ${mk}`);
    clean[mk] = {};
    for (const [type, info] of Object.entries(entry)) {
      if (!type || !String(type).trim()) throw new Error(`Empty challenge type in ${mk}`);
      const pct = Number(info && info.percent);
      if (!Number.isFinite(pct) || pct < 0 || pct > 100) throw new Error(`Bad percent in ${mk}/${type} (0–100)`);
      for (const d of ['starts', 'ends']) {
        if (info[d] && !/^\d{4}-\d{2}-\d{2}$/.test(info[d])) throw new Error(`Bad ${d} in ${mk}/${type} — use YYYY-MM-DD`);
      }
      clean[mk][String(type).trim()] = {
        percent: pct,
        starts: info.starts || `${mk}-01`,
        ends: info.ends || null,
        appliesTo: String(info.appliesTo || 'Course Fees'),
      };
    }
  }
  const tmp = DATA_FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(clean, null, 2) + '\n');
  fs.renameSync(tmp, DATA_FILE); // atomic swap — readers never see a half-written file
  _cache = { mtimeMs: -1, data: {} }; // force re-read on next access
  return load();
}

module.exports = {
  // Getter so callers reading MONTHLY_CHALLENGES always see the current file.
  get MONTHLY_CHALLENGES() { return load(); },
  getChallengeDiscount,
  getChallengeEntry,
  currentChallenge,
  saveChallenges,
  monthKey
};
