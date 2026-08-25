/**
 * slack-read — read-only Slack CLI so an operator (or Claude) can pull channel
 * history / a thread without copy-pasting out of Slack. Never writes back.
 *
 * Usage (run from the sis dir, after `npm run build`):
 *   node dist/scripts/slack-read.js channels
 *   node dist/scripts/slack-read.js users [filter]
 *   node dist/scripts/slack-read.js history <#channel|id> [limit] [oldestISO] [latestISO]
 *   node dist/scripts/slack-read.js thread  <#channel|id> <ts>
 *
 * Examples:
 *   node dist/scripts/slack-read.js history "#general" 50
 *   node dist/scripts/slack-read.js history "#sales" 100 2026-07-01 2026-08-01
 *   node dist/scripts/slack-read.js thread "#sales" 1723800000.123456
 */
import 'dotenv/config';
import { listSlackChannels, slackUserMap, readSlackHistory, readSlackThread, postAsUser, deleteAsUser } from '../lib/slack';

function fmtTs(ts: string): string {
  const ms = Math.round(parseFloat(ts) * 1000);
  return new Date(ms).toISOString().replace('T', ' ').slice(0, 16); // YYYY-MM-DD HH:MM (UTC)
}

// Slack encodes <@U…> mentions and <http…|label> links — make them readable.
function clean(text: string, users: Record<string, string>): string {
  return (text || '')
    .replace(/<@([A-Z0-9]+)>/g, (_m, id) => '@' + (users[id] || id))
    .replace(/<#[A-Z0-9]+\|([^>]+)>/g, (_m, name) => '#' + name)
    .replace(/<(https?:[^|>]+)\|([^>]+)>/g, (_m, _url, label) => label)
    .replace(/<(https?:[^>]+)>/g, (_m, url) => url)
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
}

async function printTranscript(msgs: { ts: string; userName?: string; text: string; reply_count?: number }[]) {
  const users = await slackUserMap();
  // history returns newest-first; show oldest-first so it reads like a transcript
  const ordered = [...msgs].sort((a, b) => parseFloat(a.ts) - parseFloat(b.ts));
  for (const m of ordered) {
    const rc = m.reply_count ? `  [🧵 ${m.reply_count} replies — ts ${m.ts}]` : '';
    console.log(`[${fmtTs(m.ts)}] ${(m.userName || 'unknown').padEnd(22)} ${clean(m.text, users)}${rc}`);
  }
  console.log(`\n(${ordered.length} messages)`);
}

async function main() {
  const [cmd, a1, a2, a3, a4] = process.argv.slice(2);
  if (!cmd) { console.log('commands: channels | users [filter] | history <#chan|id> [limit] [oldestISO] [latestISO] | thread <#chan|id> <ts>'); return; }

  if (cmd === 'auth') {
    // Diagnostic: which token are we using, is it valid, and exactly what
    // scopes does it carry? Slack returns granted scopes in the x-oauth-scopes
    // response header.
    const userTok = process.env.SLACK_USER_TOKEN, botTok = process.env.SLACK_BOT_TOKEN;
    const token = userTok || botTok;
    console.log('Using:', userTok ? 'SLACK_USER_TOKEN (xoxp)' : 'SLACK_BOT_TOKEN (xoxb)');
    const r = await fetch('https://slack.com/api/auth.test', { headers: { Authorization: `Bearer ${token}` } });
    const scopes = r.headers.get('x-oauth-scopes') || '(none reported)';
    const body: any = await r.json().catch(() => ({}));
    console.log('auth.test:', body.ok ? `OK — team=${body.team}, user=${body.user}` : `FAIL — ${body.error}`);
    console.log('granted scopes:', scopes);
    return;
  }

  if (cmd === 'channels') {
    const chans = await listSlackChannels();
    chans.sort((x, y) => (y.is_member ? 1 : 0) - (x.is_member ? 1 : 0) || x.name.localeCompare(y.name));
    console.log('MEMBER | TYPE | #channel (members)');
    for (const c of chans) console.log(`${c.is_member ? '  ✓   ' : '      '} | ${c.is_private ? '🔒priv' : ' pub  '} | #${c.name} (${c.num_members ?? '?'})`);
    console.log(`\n${chans.length} channels; ✓ = bot is a member (only those are readable).`);
    return;
  }

  if (cmd === 'users') {
    const map = await slackUserMap();
    const filter = (a1 || '').toLowerCase();
    Object.entries(map)
      .filter(([, name]) => !filter || name.toLowerCase().includes(filter))
      .sort((x, y) => x[1].localeCompare(y[1]))
      .forEach(([id, name]) => console.log(`${id}  ${name}`));
    return;
  }

  if (cmd === 'history') {
    if (!a1) { console.error('usage: history <#chan|id> [limit] [oldestISO] [latestISO]'); process.exit(1); }
    const limit = a2 ? parseInt(a2) : 100;
    const oldest = a3 ? String(new Date(a3 + 'T00:00:00Z').getTime() / 1000) : undefined;
    const latest = a4 ? String(new Date(a4 + 'T00:00:00Z').getTime() / 1000) : undefined;
    await printTranscript(await readSlackHistory(a1, { limit, oldest, latest }));
    return;
  }

  if (cmd === 'search') {
    if (!a1) { console.error('usage: search "<query>" [count]'); process.exit(1); }
    const count = a2 ? parseInt(a2) : 20;
    const token = process.env.SLACK_USER_TOKEN;   // search.messages requires a user token
    const qs = new URLSearchParams({ query: a1, count: String(count), sort: 'timestamp', sort_dir: 'desc' });
    const r = await fetch('https://slack.com/api/search.messages?' + qs.toString(), { headers: { Authorization: `Bearer ${token}` } });
    const body: any = await r.json().catch(() => ({}));
    if (!body.ok) { console.error('[slack] search.messages:', body.error); process.exit(1); }
    const users = await slackUserMap();
    const matches = body.messages?.matches || [];
    console.log(`${matches.length} match(es) for "${a1}":\n`);
    for (const m of matches) {
      console.log(`#${m.channel?.name || m.channel?.id}  [${fmtTs(m.ts)}]  ${users[m.user] || m.username || 'unknown'}`);
      console.log(`  ${clean(m.text || '', users)}`);
      console.log(`  ↳ channel=${m.channel?.id} ts=${m.ts}${m.permalink ? '  ' + m.permalink : ''}\n`);
    }
    return;
  }

  if (cmd === 'thread') {
    if (!a1 || !a2) { console.error('usage: thread <#chan|id> <ts>'); process.exit(1); }
    await printTranscript(await readSlackThread(a1, a2));
    return;
  }

  // Clean send AS the user (no "Sent using @Claude" footer). Needs chat:write on
  // the user token. Usage: send <#chan|id> "<text>" [thread_ts]
  if (cmd === 'send') {
    if (!a1 || !a2) { console.error('usage: send <#chan|id> "<text>" [thread_ts]'); process.exit(1); }
    const r = await postAsUser(a1, a2, a3);
    console.log(r.ok ? `sent → ts ${r.ts} in ${r.channel}` : `FAILED: ${r.error}`);
    return;
  }

  if (cmd === 'delete') {
    if (!a1 || !a2) { console.error('usage: delete <#chan|id> <ts>'); process.exit(1); }
    const r = await deleteAsUser(a1, a2);
    console.log(r.ok ? `deleted ${a2}` : `FAILED: ${r.error}`);
    return;
  }

  console.error('unknown command:', cmd);
  process.exit(1);
}

main().catch(e => { console.error('ERR', e?.message || e); process.exit(1); });
