/**
 * One-off partner portal launch email blast.
 *
 * Sends the portal launch announcement to all external Employee-typed HubSpot
 * contacts via Gmail API (service-account + domain-wide delegation, sender:
 * partners@ulearnschool.com).
 *
 * Resumable: maintains a log of sent emails so reruns skip anything already done.
 * Throttled: 1 send per second to stay polite with Gmail.
 *
 * Flags:
 *   --dry-run          Do not actually send — print the plan and exit.
 *   --test <email>     Send ONLY to <email> (for preview/QA).
 *   --limit <n>        Send at most <n> emails (useful for staged rollout).
 *   --exclude <file>   Path to a plaintext file of emails (one per line) to skip.
 *
 * Run:
 *   node dist/scripts/launch-email.js --test neil@ulearnschool.com
 *   node dist/scripts/launch-email.js --dry-run
 *   node dist/scripts/launch-email.js --exclude /tmp/already-sent.txt
 *   node dist/scripts/launch-email.js
 */
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { sendEmail } from './email';

dotenv.config();

const HUBSPOT_PAT = process.env.ACCESS_TOKEN!;
const FROM = 'partners@ulearnschool.com';
const FROM_NAME = 'ULearn Partners Team';
const SUBJECT = 'ULearn Partner Portal — Your Account Is Ready';
const SENT_LOG = path.join(__dirname, '..', '..', 'data', 'launch-email.sent.log');
const FAIL_LOG = path.join(__dirname, '..', '..', 'data', 'launch-email.failed.log');
const TEMPLATE_PATH = '/home/sis/web/sis.ulearnschool.com/public_html/Docs/portal/welcome/email.htm';

const INTERNAL_DOMAINS = new Set(['ulearnschool.com', 'ulearn.ie']);

// Replace HubSpot personalization tokens + fix the broken image URLs with
// our publicly-served copies on sis.ulearnschool.com.
function renderTemplate(rawHtml: string, firstName: string): string {
  let html = rawHtml;

  // 1. Personalization — strip HubSpot's <personalization> tag (and the text
  //    "(...Fallback=Partner)" placeholder next to it) and substitute.
  html = html.replace(/\(\{\{First Name\}\}\/Fallback=Partner\)<personalization[^>]*>\s*<\/personalization>/g, firstName);
  html = html.replace(/<personalization[^>]*><\/personalization>/g, firstName);

  // 2. Fix the small typo ("exited" -> "excited")
  html = html.replace(/We are exited to deploy/, 'We are excited to deploy');

  return html;
}

async function fetchPartnerEmployees(): Promise<Array<{ id: string; email: string; firstName: string; lastName: string }>> {
  const out: any[] = [];
  let after: string | undefined = undefined;
  while (true) {
    const body: any = {
      filterGroups: [{ filters: [{ propertyName: 'type', operator: 'EQ', value: 'Employee' }] }],
      properties: ['email', 'firstname', 'lastname'],
      limit: 100,
    };
    if (after) body.after = after;
    const res = await fetch('https://api.hubapi.com/crm/v3/objects/contacts/search', {
      method: 'POST',
      headers: { Authorization: `Bearer ${HUBSPOT_PAT}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const d: any = await res.json();
    for (const c of d.results || []) {
      const email = (c.properties?.email || '').toLowerCase().trim();
      if (!email) continue;
      const domain = email.split('@')[1];
      if (INTERNAL_DOMAINS.has(domain)) continue;
      out.push({
        id: c.id,
        email,
        firstName: c.properties?.firstname || '',
        lastName: c.properties?.lastname || '',
      });
    }
    const nxt = d.paging?.next?.after;
    if (!nxt) break;
    after = nxt;
  }
  // Dedupe by email, keep first occurrence
  const seen = new Set<string>();
  return out.filter(c => { if (seen.has(c.email)) return false; seen.add(c.email); return true; });
}

function loadSentList(): Set<string> {
  if (!fs.existsSync(SENT_LOG)) return new Set();
  return new Set(fs.readFileSync(SENT_LOG, 'utf-8').split('\n').map(l => l.split('\t')[0].toLowerCase().trim()).filter(Boolean));
}

function loadExcludeFile(filePath: string): Set<string> {
  if (!fs.existsSync(filePath)) {
    console.warn(`[launch-email] Exclude file not found: ${filePath}`);
    return new Set();
  }
  return new Set(fs.readFileSync(filePath, 'utf-8').split('\n').map(l => l.toLowerCase().trim()).filter(Boolean));
}

function appendLog(p: string, line: string) {
  if (!fs.existsSync(path.dirname(p))) fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.appendFileSync(p, line + '\n');
}

async function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const testIdx = args.indexOf('--test');
  const testEmail = testIdx >= 0 ? args[testIdx + 1] : null;
  const limitIdx = args.indexOf('--limit');
  const limit = limitIdx >= 0 ? parseInt(args[limitIdx + 1]) : Infinity;
  const excludeIdx = args.indexOf('--exclude');
  const excludeFile = excludeIdx >= 0 ? args[excludeIdx + 1] : null;

  // Load template
  if (!fs.existsSync(TEMPLATE_PATH)) throw new Error('Template not found: ' + TEMPLATE_PATH);
  const template = fs.readFileSync(TEMPLATE_PATH, 'utf-8');

  // Build audience
  let audience: Array<{ id: string; email: string; firstName: string; lastName: string }>;
  if (testEmail) {
    audience = [{ id: 'test', email: testEmail.toLowerCase(), firstName: 'Partner', lastName: '' }];
    console.log(`[launch-email] TEST MODE — sending only to ${testEmail}`);
  } else {
    console.log('[launch-email] Fetching partner employees from HubSpot...');
    audience = await fetchPartnerEmployees();
    console.log(`[launch-email] Total external partner employees: ${audience.length}`);
  }

  // Exclude already-sent + any extra exclude-file emails
  const sent = loadSentList();
  const extraExclude = excludeFile ? loadExcludeFile(excludeFile) : new Set<string>();
  if (extraExclude.size) console.log(`[launch-email] Exclude file loaded: ${extraExclude.size} addresses`);

  const toSend = audience.filter(c => !sent.has(c.email) && !extraExclude.has(c.email)).slice(0, limit);
  const skipped = audience.length - toSend.length;
  console.log(`[launch-email] Already sent: ${sent.size} | Excluded (file): ${extraExclude.size}`);
  console.log(`[launch-email] Planning to send: ${toSend.length} (skipping ${skipped})`);

  if (dryRun) {
    console.log('\n[dry-run] Would send to:');
    for (const c of toSend.slice(0, 10)) console.log(`  ${c.email}  (${c.firstName || 'Partner'})`);
    if (toSend.length > 10) console.log(`  ... and ${toSend.length - 10} more`);
    return;
  }

  // Batching: send in chunks with a pause between to stay below Gmail burst limits.
  const batchIdx = args.indexOf('--batch-size');
  const BATCH_SIZE = batchIdx >= 0 ? parseInt(args[batchIdx + 1]) : 100;
  const pauseIdx = args.indexOf('--batch-pause');
  const BATCH_PAUSE_MS = (pauseIdx >= 0 ? parseInt(args[pauseIdx + 1]) : 60) * 1000;

  console.log(`[launch-email] Batch size: ${BATCH_SIZE}, pause between batches: ${BATCH_PAUSE_MS / 1000}s`);

  // Send loop
  let ok = 0, fail = 0;
  for (let i = 0; i < toSend.length; i++) {
    const c = toSend[i];
    const firstName = c.firstName.trim() || 'Partner';
    const html = renderTemplate(template, firstName);
    try {
      const result = await sendEmail({
        from: FROM,
        fromName: FROM_NAME,
        to: c.email,
        subject: SUBJECT,
        html,
      });
      ok++;
      appendLog(SENT_LOG, `${c.email}\t${c.id}\t${new Date().toISOString()}\t${(result as any).messageId || ''}`);
      console.log(`[${i + 1}/${toSend.length}] ✓ ${c.email}`);
    } catch (e) {
      fail++;
      appendLog(FAIL_LOG, `${c.email}\t${c.id}\t${new Date().toISOString()}\t${String(e)}`);
      console.error(`[${i + 1}/${toSend.length}] ✗ ${c.email} — ${String(e)}`);
    }
    const nextIdx = i + 1;
    if (nextIdx >= toSend.length) break;
    // End of a batch? Sleep the batch pause. Otherwise 1s throttle.
    if (nextIdx % BATCH_SIZE === 0) {
      console.log(`[launch-email] Batch of ${BATCH_SIZE} complete. Sleeping ${BATCH_PAUSE_MS / 1000}s before next batch...`);
      await sleep(BATCH_PAUSE_MS);
    } else {
      await sleep(1000);
    }
  }

  console.log(`\n[launch-email] Done — sent: ${ok}, failed: ${fail}`);
  console.log(`    Sent log:   ${SENT_LOG}`);
  console.log(`    Failed log: ${FAIL_LOG}`);
}

main().catch((e) => { console.error('[launch-email] Fatal:', e); process.exit(1); });
