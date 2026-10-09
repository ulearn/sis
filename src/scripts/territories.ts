// THE territory map for the SIS — country → EU | Non-EU (No Visa) | Non-EU (VBD) | Unsupported Territory.
//
// ONE source for the whole estate: hubapp's .knowledge/facts/territories.json, published read-only at
// https://hub.ulearnschool.com/hubapp/territories.json. The SIS cannot read the hub's files, so it loads that
// link at start-up and once a day, and keeps the last good copy in data/territories.json (used when the link
// is down). Do NOT add a country list here — change a market in the hub's facts/territories.json only.
// (2026-10-07: replaced the hard-coded TERRITORY_MAP in booking-deal.ts and .claude/docs/TerritoryMap*.json.)
import fs from 'fs';
import path from 'path';

const URL = process.env.TERRITORY_URL || 'https://hub.ulearnschool.com/hubapp/territories.json';
const CACHE = path.resolve(__dirname, '../../data/territories.json');
const LABELS = new Set(['EU', 'Non-EU (No Visa)', 'Non-EU (VBD)', 'Unsupported Territory']);

// Mutated IN PLACE on refresh, so every module that imported it sees the update.
export const TERRITORY_MAP: Record<string, string> = {};

function valid(m: unknown): m is Record<string, string> {
  if (!m || typeof m !== 'object') return false;
  const entries = Object.entries(m as Record<string, unknown>);
  return entries.length >= 200 && entries.every(([, v]) => typeof v === 'string' && LABELS.has(v));
}
function replace(m: Record<string, string>) {
  for (const k of Object.keys(TERRITORY_MAP)) delete TERRITORY_MAP[k];
  Object.assign(TERRITORY_MAP, m);
}

try {
  const cached = JSON.parse(fs.readFileSync(CACHE, 'utf-8'));
  if (valid(cached)) replace(cached);
  else console.warn('[territories] cached copy invalid — waiting for the hub');
} catch (e) {
  console.warn('[territories] no cached copy yet — waiting for the hub');
}

export async function refreshTerritories(): Promise<boolean> {
  try {
    const r = await fetch(URL, { signal: AbortSignal.timeout(15000) });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    const m = await r.json();
    if (!valid(m)) throw new Error('unexpected content');
    replace(m);
    fs.writeFileSync(CACHE, JSON.stringify(m, null, 2) + '\n');
    return true;
  } catch (e: any) {
    console.warn('[territories] refresh failed, keeping last good copy:', e?.message || e);
    return false;
  }
}

refreshTerritories();
setInterval(refreshTerritories, 24 * 3600e3).unref();
