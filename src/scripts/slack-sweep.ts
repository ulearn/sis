/**
 * slack-sweep — the office issue queue. Slack IS the queue (high churn, 3-month free-plan
 * retention); this sweep surfaces what needs attention and remembers what's already solved.
 *
 * Two sources:
 *   (a) UNREAD messages/threads across every conversation the user is in (channels + DMs),
 *       detected via `last_read` — pure FYI/triage.
 *   (b) 🔍 (:mag:)-TAGGED threads — the user's "Claude, investigate this" trigger, found via
 *       search (any age), which I actually investigate + solve.
 *
 * Resolution memory: data/slack-issues.json, keyed by "<channelId>:<ts>", each entry
 * { summary, solution, found, permalink, label }. A 🔍 item already in the log is shown as
 * SOLVED (its stored solution) and NOT re-queued — so re-sweeps never re-work the same issue.
 * On real-world resolution the entry is DELETED (`resolve` command); if it re-emerges unsolved
 * it's simply re-added. Self-pruning; stays well under ~50.
 *
 * I NEVER post to Slack from here — sweep only reads + reports. Posting is a separate,
 * explicitly-authorised act.
 *
 *   node dist/scripts/slack-sweep.js               # sweep: 🔍 to-do + unread FYI + solved
 *   node dist/scripts/slack-sweep.js --json        # machine-readable (for Claude)
 *   node dist/scripts/slack-sweep.js list          # print the resolution queue
 *   node dist/scripts/slack-sweep.js resolve <key> # delete a solved entry (key = channelId:ts)
 */
import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';
import {
  listMemberConversations, conversationLastRead, historyById,
  getPermalink, slackUserMap, authedUserId, searchMessages,
} from '../lib/slack';

const STORE = path.join(__dirname, '..', '..', 'data', 'slack-issues.json');
const MAG_QUERY = 'has::mag:';   // the "Claude investigate" trigger reaction
const SKIP_SUBTYPES = new Set(['channel_join', 'channel_leave', 'channel_topic', 'channel_purpose', 'channel_name']);

type Issue = { summary?: string; solution: string; found: string; permalink?: string; label?: string };
type Store = Record<string, Issue>;

function loadStore(): Store { try { return JSON.parse(fs.readFileSync(STORE, 'utf8')); } catch { return {}; } }
function saveStore(s: Store) { fs.writeFileSync(STORE, JSON.stringify(s, null, 2) + '\n'); }
const keyOf = (channelId: string, ts: string) => `${channelId}:${ts}`;

function fmtTs(ts: string): string {
  return new Date(Math.round(parseFloat(ts) * 1000)).toISOString().replace('T', ' ').slice(0, 16);
}
function clean(t: string, users: Record<string, string>): string {
  return (t || '')
    .replace(/<@([A-Z0-9]+)>/g, (_m, id) => '@' + (users[id] || id))
    .replace(/<#[A-Z0-9]+\|([^>]+)>/g, (_m, name) => '#' + name)
    .replace(/<(https?:[^|>]+)\|([^>]+)>/g, (_m, _u, l) => l)
    .replace(/<(https?:[^>]+)>/g, (_m, u) => u)
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ').trim();
}

async function collectUnread(users: Record<string, string>, self: string | null) {
  const convos = await listMemberConversations();
  const out: any[] = [];
  for (const c of convos) {
    const lastRead = parseFloat((await conversationLastRead(c.id)) || '0');
    const msgs = await historyById(c.id, 30);
    for (const m of msgs) {
      if (m.subtype && SKIP_SUBTYPES.has(m.subtype)) continue;
      const newTop = parseFloat(m.ts) > lastRead;
      const newReply = m.reply_count && m.latest_reply && parseFloat(m.latest_reply) > lastRead;
      if (!newTop && !newReply) continue;
      // Skip the user's own top-level message unless someone has replied since.
      if (self && m.user === self && newTop && !newReply) continue;
      out.push({ channelId: c.id, label: c.label, type: c.type, ts: m.ts, author: users[m.user] || m.username || m.bot_id || 'unknown', text: clean(m.text, users), replyCount: m.reply_count || 0 });
    }
  }
  return out;
}

async function main() {
  const [cmd, arg] = process.argv.slice(2).filter(a => !a.startsWith('--'));
  const asJson = process.argv.includes('--json');
  const store = loadStore();

  if (cmd === 'list') {
    const keys = Object.keys(store);
    console.log(`RESOLUTION QUEUE — ${keys.length} logged issue(s)\n`);
    for (const k of keys) { const i = store[k]; console.log(`• ${i.label || ''} — ${i.summary || k}\n  key=${k}${i.permalink ? '  ' + i.permalink : ''}\n  solution: ${i.solution}\n`); }
    return;
  }
  if (cmd === 'resolve') {
    if (!arg) { console.error('usage: resolve <channelId:ts>'); process.exit(1); }
    if (store[arg]) { delete store[arg]; saveStore(store); console.log(`resolved + removed ${arg}`); }
    else console.log(`no entry for ${arg}`);
    return;
  }

  // ── SWEEP ──
  const users = await slackUserMap();
  const self = await authedUserId();

  // (b) 🔍-tagged threads (any age)
  const magged = await searchMessages(MAG_QUERY, 50);
  const flaggedNew: any[] = [], flaggedSolved: any[] = [];
  for (const h of magged) {
    const key = keyOf(h.channelId, h.ts);
    const rec = { channelId: h.channelId, label: '#' + h.channelName, ts: h.ts, author: h.userName, text: clean(h.text, users), permalink: h.permalink, key };
    if (store[key]) flaggedSolved.push({ ...rec, solution: store[key].solution });
    else flaggedNew.push(rec);
  }

  // (a) unread (FYI) — annotate any already in the log
  const unread = await collectUnread(users, self);
  for (const u of unread) u.logged = !!store[keyOf(u.channelId, u.ts)];

  if (asJson) {
    // enrich flaggedNew with permalinks already present from search; unread gets none (cheap)
    console.log(JSON.stringify({ flaggedNew, flaggedSolved, unread, storeCount: Object.keys(store).length }, null, 2));
    return;
  }

  console.log(`SLACK SWEEP — 🔍 ${flaggedNew.length} to investigate · ${flaggedSolved.length} already solved · 📥 ${unread.length} unread · ${Object.keys(store).length} in queue\n`);

  console.log('## 🔍 FLAGGED — INVESTIGATE (find + fix, do NOT post)');
  if (!flaggedNew.length) console.log('  (none new)');
  for (const f of flaggedNew) {
    console.log(`\n• ${f.label} [${fmtTs(f.ts)}] ${f.author}: ${f.text.slice(0, 320)}`);
    console.log(`  key=${f.key}${f.permalink ? '  ' + f.permalink : ''}`);
  }

  if (flaggedSolved.length) {
    console.log('\n## ✅ 🔍 ALREADY SOLVED (in queue — resolve to clear)');
    for (const f of flaggedSolved) console.log(`  • ${f.label} — ${store[f.key].summary || f.text.slice(0, 80)}\n    key=${f.key}  solution: ${f.solution}`);
  }

  console.log('\n## 📥 UNREAD (FYI — tag 🔍 to queue for investigation)');
  if (!unread.length) console.log('  (none)');
  const byChan: Record<string, any[]> = {};
  for (const u of unread) (byChan[u.label] ||= []).push(u);
  for (const [label, items] of Object.entries(byChan)) {
    console.log(`  ${label}`);
    for (const u of items) console.log(`    • [${fmtTs(u.ts)}] ${u.author}: ${u.text.slice(0, 140)}${u.replyCount ? ` [🧵${u.replyCount}]` : ''}${u.logged ? '  (logged)' : ''}`);
  }
}

main().catch(e => { console.error('ERR', e?.message || e); process.exit(1); });
