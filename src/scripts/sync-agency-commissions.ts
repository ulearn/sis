/**
 * One-off: bulk-sync agency commission rates from the Fidelo CSV export into HubSpot.
 *
 * Strategy:
 *  1. Parse CSV, extract { name, email, commission_pct, group }
 *  2. Filter to "active" priorities (skip Gone Quiet / Inactive — too noisy for first pass)
 *  3. For each row: try to find a matching HubSpot Company
 *     a) email-first: search Contacts by email → walk to associated Company
 *     b) name-fallback: search Companies by exact name
 *  4. If match found AND HubSpot company has no commission set → write the commission
 *  5. Report everything
 *
 * HubSpot stores commission as a decimal (0.30 = 30%) — we convert from percentage.
 * Run with --apply to actually write; default is dry-run.
 *
 * Usage:
 *   node dist/scripts/sync-agency-commissions.js          # dry run
 *   node dist/scripts/sync-agency-commissions.js --apply  # actually write
 *   node dist/scripts/sync-agency-commissions.js --apply --include-cold  # include priority 3 too
 */

import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import * as dotenv from 'dotenv';

dotenv.config();

const APPLY = process.argv.includes('--apply');
const INCLUDE_COLD = process.argv.includes('--include-cold');
const HUBSPOT_TOKEN = process.env.ACCESS_TOKEN;
const COMMISSION_PROP = process.env.HUBSPOT_COMMISSION_PROPERTY || 'commission';
const CSV_PATH = path.resolve(__dirname, '../../.claude/docs/agencies/agencies.csv');

if (!HUBSPOT_TOKEN) {
  console.error('ACCESS_TOKEN not set in .env');
  process.exit(1);
}

// ── HubSpot API helpers ──────────────────────────
function hs(method: string, url: string, body?: any): Promise<any> {
  return new Promise((resolve, reject) => {
    const opts: https.RequestOptions = {
      hostname: 'api.hubapi.com',
      path: url,
      method,
      headers: {
        'Authorization': `Bearer ${HUBSPOT_TOKEN}`,
        'Content-Type': 'application/json',
      },
    };
    const req = https.request(opts, (res) => {
      let data = '';
      res.on('data', (c) => data += c);
      res.on('end', () => {
        try {
          const parsed = data ? JSON.parse(data) : {};
          if (res.statusCode && res.statusCode >= 400) {
            return reject(new Error(`HTTP ${res.statusCode}: ${parsed?.message || data.substring(0, 200)}`));
          }
          resolve(parsed);
        } catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

// Throttle: HubSpot OAuth = 100 req / 10s = 10/s. Stay well under at 5/s.
let lastCall = 0;
async function throttle() {
  const now = Date.now();
  const elapsed = now - lastCall;
  if (elapsed < 200) await new Promise(r => setTimeout(r, 200 - elapsed));
  lastCall = Date.now();
}

async function searchCompaniesByName(name: string): Promise<any[]> {
  await throttle();
  const r = await hs('POST', '/crm/v3/objects/companies/search', {
    filterGroups: [{ filters: [{ propertyName: 'name', operator: 'EQ', value: name }] }],
    properties: ['name', COMMISSION_PROP],
    limit: 5,
  });
  return r.results || [];
}

async function searchContactByEmail(email: string): Promise<any | null> {
  await throttle();
  const r = await hs('POST', '/crm/v3/objects/contacts/search', {
    filterGroups: [{ filters: [{ propertyName: 'email', operator: 'EQ', value: email }] }],
    properties: ['email', 'firstname', 'lastname'],
    limit: 1,
  });
  return r.results?.[0] || null;
}

async function getContactCompany(contactId: string): Promise<any | null> {
  await throttle();
  const r = await hs('GET', `/crm/v4/objects/contacts/${contactId}/associations/companies`, undefined);
  const first = r.results?.[0];
  if (!first) return null;
  await throttle();
  const company = await hs('GET', `/crm/v3/objects/companies/${first.toObjectId}?properties=name,${COMMISSION_PROP}`, undefined);
  return company;
}

async function updateCompanyCommission(companyId: string, decimal: number): Promise<void> {
  await throttle();
  await hs('PATCH', `/crm/v3/objects/companies/${companyId}`, {
    properties: { [COMMISSION_PROP]: String(decimal) },
  });
}

// ── CSV parsing ──────────────────────────────────
function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cur = '';
  let inQ = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQ) {
      if (ch === '"') {
        if (text[i + 1] === '"') { cur += '"'; i++; }
        else inQ = false;
      } else cur += ch;
    } else {
      if (ch === '"') inQ = true;
      else if (ch === ',') { row.push(cur); cur = ''; }
      else if (ch === '\n') { row.push(cur); rows.push(row); row = []; cur = ''; }
      else if (ch !== '\r') cur += ch;
    }
  }
  if (cur || row.length) { row.push(cur); rows.push(row); }
  return rows;
}

interface Agency {
  name: string;
  email: string | null;
  commissionPct: number | null;
  group: string;
  priority: 1 | 2 | 3;
}

const PRIORITY_1 = new Set(['1. VIP', '2. Active Engaged', '10. Prospect - Gold', 'New agents 2020']);
const PRIORITY_2 = new Set(['4. Gone Quiet - Prospect', '5. Old VIP (Nurture)', '']);

function priorityFor(group: string): 1 | 2 | 3 {
  if (PRIORITY_1.has(group)) return 1;
  if (PRIORITY_2.has(group)) return 2;
  return 3;
}

function loadAgencies(): Agency[] {
  const csv = fs.readFileSync(CSV_PATH, 'utf-8');
  const rows = parseCSV(csv);
  const out: Agency[] = [];
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    if (!r || r.length < 24) continue;
    const name = (r[1] || '').trim();
    if (!name) continue;
    const email = (r[21] || '').trim().toLowerCase() || null;
    const commissionRaw = (r[22] || '').trim();
    const m = commissionRaw.match(/(\d+(?:\.\d+)?)\s*%/);
    const commissionPct = m ? parseFloat(m[1]) : null;
    const group = (r[17] || '').trim();
    out.push({ name, email, commissionPct, group, priority: priorityFor(group) });
  }
  return out;
}

// ── Main ────────────────────────────────────────
async function main() {
  console.log(`\n=== Agency Commission Sync ===`);
  console.log(`Mode: ${APPLY ? 'APPLY (writing to HubSpot)' : 'DRY RUN (no writes)'}`);
  console.log(`Include cold (priority 3): ${INCLUDE_COLD}`);
  console.log(`Property: ${COMMISSION_PROP}`);

  const all = loadAgencies();
  console.log(`\nLoaded ${all.length} agency rows from CSV`);
  console.log(`  Priority 1 (active):    ${all.filter(a => a.priority === 1).length}`);
  console.log(`  Priority 2 (lukewarm):  ${all.filter(a => a.priority === 2).length}`);
  console.log(`  Priority 3 (cold):      ${all.filter(a => a.priority === 3).length}`);
  console.log(`  With commission rate:   ${all.filter(a => a.commissionPct != null).length}`);
  console.log(`  With email:             ${all.filter(a => a.email).length}`);

  // Filter to in-scope rows
  const targets = all.filter(a =>
    a.commissionPct != null &&
    (INCLUDE_COLD || a.priority < 3)
  );
  console.log(`\nTargeting ${targets.length} agencies (have commission, ${INCLUDE_COLD ? 'all priorities' : 'priority 1+2 only'})`);

  // Sort: priority 1 first, then 2, then within each by name
  targets.sort((a, b) => a.priority - b.priority || a.name.localeCompare(b.name));

  const stats = {
    matchedByEmail: 0,
    matchedByName: 0,
    notFound: 0,
    alreadySet: 0,
    updated: 0,
    wouldUpdate: 0,
    errors: 0,
    multipleNameMatches: 0,
  };
  const notFoundList: string[] = [];
  const updatedList: { name: string, pct: number, hsId: string }[] = [];
  const ambiguousList: string[] = [];

  for (let i = 0; i < targets.length; i++) {
    const a = targets[i];
    const prefix = `[${(i + 1).toString().padStart(3)}/${targets.length}] P${a.priority} ${a.name.substring(0, 40).padEnd(40)}`;

    let matchedCompany: any = null;
    let matchHow = '';

    // Phase 1: email-first match (find contact by email → walk to associated company)
    if (a.email) {
      try {
        const contact = await searchContactByEmail(a.email);
        if (contact) {
          const company = await getContactCompany(contact.id);
          if (company) {
            matchedCompany = company;
            matchHow = 'email→contact→company';
            stats.matchedByEmail++;
          }
        }
      } catch (e: any) {
        // Continue to name fallback
      }
    }

    // Phase 2: name-fallback
    if (!matchedCompany) {
      try {
        const matches = await searchCompaniesByName(a.name);
        if (matches.length === 1) {
          matchedCompany = matches[0];
          matchHow = 'name (exact)';
          stats.matchedByName++;
        } else if (matches.length > 1) {
          stats.multipleNameMatches++;
          ambiguousList.push(`${a.name} → ${matches.length} matches in HubSpot`);
        }
      } catch (e: any) {
        // Fall through
      }
    }

    if (!matchedCompany) {
      stats.notFound++;
      notFoundList.push(`P${a.priority}  ${a.name}${a.email ? '  <' + a.email + '>' : ''}`);
      console.log(`${prefix}  ❌ not found`);
      continue;
    }

    const existing = matchedCompany.properties?.[COMMISSION_PROP];
    const existingNum = existing == null || existing === '' ? null : Number(existing);

    if (existingNum != null && !isNaN(existingNum) && existingNum > 0) {
      stats.alreadySet++;
      console.log(`${prefix}  ⏭  already set: ${existingNum} (${matchHow})`);
      continue;
    }

    const decimal = a.commissionPct! / 100;

    if (APPLY) {
      try {
        await updateCompanyCommission(matchedCompany.id, decimal);
        stats.updated++;
        updatedList.push({ name: a.name, pct: a.commissionPct!, hsId: matchedCompany.id });
        console.log(`${prefix}  ✅ updated to ${a.commissionPct}% (${matchHow})`);
      } catch (e: any) {
        stats.errors++;
        console.log(`${prefix}  ⚠️  update failed: ${e.message}`);
      }
    } else {
      stats.wouldUpdate++;
      console.log(`${prefix}  ✏️  would update to ${a.commissionPct}% (${matchHow})`);
    }
  }

  console.log(`\n=== Summary ===`);
  console.log(`  Matched by email→company:  ${stats.matchedByEmail}`);
  console.log(`  Matched by name (exact):   ${stats.matchedByName}`);
  console.log(`  Already set in HubSpot:    ${stats.alreadySet}`);
  console.log(`  ${APPLY ? 'Updated' : 'Would update'}:               ${APPLY ? stats.updated : stats.wouldUpdate}`);
  console.log(`  Not found in HubSpot:      ${stats.notFound}`);
  console.log(`  Ambiguous (multi-match):   ${stats.multipleNameMatches}`);
  if (APPLY) console.log(`  Errors:                    ${stats.errors}`);

  if (notFoundList.length > 0 && notFoundList.length <= 50) {
    console.log(`\n--- Not found (${notFoundList.length}) ---`);
    notFoundList.forEach(s => console.log('  ' + s));
  }
  if (ambiguousList.length > 0) {
    console.log(`\n--- Ambiguous matches (${ambiguousList.length}) ---`);
    ambiguousList.forEach(s => console.log('  ' + s));
  }
  if (APPLY && updatedList.length > 0) {
    console.log(`\n--- Updated companies (${updatedList.length}) ---`);
    updatedList.forEach(u => console.log(`  ${u.name} → ${u.pct}% (HS ${u.hsId})`));
  }

  console.log('\nDone.');
}

main().catch(e => { console.error('FATAL:', e); process.exit(1); });
