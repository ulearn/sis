// Slack notify helper. Reuses the bot token already provisioned for the
// hub.ulearnschool.com financials app (see hub/fins/.env). Best-effort —
// errors are logged to stderr and swallowed so caller code (e.g. a student
// challenge confirmation) never fails because Slack is down or misconfigured.

const SLACK_API = 'https://slack.com/api/chat.postMessage';

interface SlackMessageOptions {
  channel?: string;
  text: string;
  /**
   * If supplied, the message is posted as a reply in that thread instead of
   * starting a new top-level message. Pass the `ts` returned by an earlier
   * `postSlackMessage` call.
   */
  thread_ts?: string;
}

export interface SlackMessageResult {
  ok: boolean;
  /** Message timestamp — use as `thread_ts` for replies. Only set when ok===true. */
  ts?: string;
  /** Channel id Slack resolved (may differ from the human-readable name we sent). */
  channel?: string;
  error?: string;
}

/**
 * Post a message to Slack via chat.postMessage.
 *
 * - `SLACK_BOT_TOKEN` must be set; if missing the call is a no-op (logged).
 * - Default channel is `#student-success` (overridable via
 *   `SLACK_CHALLENGES_CHANNEL` env or per-call).
 * - Pass `thread_ts` to post as a reply.
 *
 * Returns `{ ok, ts, channel }`. Caller may persist `ts`+`channel` to thread
 * future messages, but the result is otherwise non-load-bearing — Slack is
 * best-effort.
 */
export async function postSlackMessage(opts: SlackMessageOptions): Promise<SlackMessageResult> {
  const token = process.env.SLACK_BOT_TOKEN;
  if (!token) {
    console.error('[slack] SLACK_BOT_TOKEN not set — skipping notify');
    return { ok: false, error: 'no_token' };
  }
  const channel = opts.channel || process.env.SLACK_CHALLENGES_CHANNEL || '#student-success';
  try {
    const payload: any = { channel, text: opts.text };
    if (opts.thread_ts) payload.thread_ts = opts.thread_ts;
    const r = await fetch(SLACK_API, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify(payload),
    });
    const body: any = await r.json().catch(() => ({}));
    if (!body || body.ok !== true) {
      console.error('[slack] postMessage failed:', body?.error || r.status);
      return { ok: false, error: body?.error || `http_${r.status}` };
    }
    return { ok: true, ts: body.ts, channel: body.channel };
  } catch (e) {
    console.error('[slack] postMessage threw:', (e as Error).message);
    return { ok: false, error: 'exception' };
  }
}

/**
 * Returns the @-mention markup for Kelly. Set `SLACK_KELLY_USER_ID` to her
 * Slack user id (e.g. `U01ABCXYZ`) for a real ping; falls back to plain
 * "@Kelly" text if unset (Slack will best-effort match by display name but it
 * isn't reliable for triggering notifications).
 */
export function kellyMention(): string {
  const id = process.env.SLACK_KELLY_USER_ID;
  return id ? `<@${id}>` : '@Kelly';
}

// ─────────────────────────────────────────────────────────────────────────────
// READ side — pull channel history / threads so an operator (or Claude) can
// review discussions without copy-pasting out of Slack. Read-only by design:
// nothing here writes back. Needs the bot to have `channels:history` /
// `groups:history` (+ `channels:read`/`groups:read`) scopes and to be a MEMBER
// of the channel it's reading (Slack returns `not_in_channel` otherwise).
// ─────────────────────────────────────────────────────────────────────────────

const SLACK_BASE = 'https://slack.com/api/';

async function slackGet(method: string, params: Record<string, string | number | undefined> = {}): Promise<any> {
  // Reads prefer the USER token (xoxp) — it sees everything the authorising user
  // sees (their channels, DMs, group DMs), which a bot token can't. Falls back to
  // the bot token for workspaces where only that is provisioned. Writes
  // (postSlackMessage) deliberately stay on the bot token so posts come from the
  // bot, not the user.
  const token = process.env.SLACK_USER_TOKEN || process.env.SLACK_BOT_TOKEN;
  if (!token) { console.error('[slack] no SLACK_USER_TOKEN / SLACK_BOT_TOKEN set'); return { ok: false, error: 'no_token' }; }
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== '') qs.set(k, String(v));
  try {
    const r = await fetch(`${SLACK_BASE}${method}?${qs.toString()}`, { headers: { Authorization: `Bearer ${token}` } });
    return await r.json().catch(() => ({ ok: false, error: 'parse' }));
  } catch (e) {
    console.error(`[slack] ${method} threw:`, (e as Error).message);
    return { ok: false, error: 'exception' };
  }
}

export interface SlackChannel { id: string; name: string; is_private?: boolean; is_member?: boolean; num_members?: number; }

/** All non-archived channels the bot can see (public + private it's in). */
export async function listSlackChannels(): Promise<SlackChannel[]> {
  let out: SlackChannel[] = [], cursor: string | undefined;
  do {
    const r = await slackGet('conversations.list', { types: 'public_channel,private_channel', limit: 200, exclude_archived: 'true', cursor });
    if (!r.ok) { console.error('[slack] conversations.list:', r.error); break; }
    out = out.concat(r.channels || []);
    cursor = r.response_metadata?.next_cursor || undefined;
  } while (cursor);
  return out;
}

let _userCache: Record<string, string> | null = null;
/** Map of Slack user id → display name (cached per process). */
export async function slackUserMap(): Promise<Record<string, string>> {
  if (_userCache) return _userCache;
  const map: Record<string, string> = {};
  let cursor: string | undefined;
  do {
    const r = await slackGet('users.list', { limit: 200, cursor });
    if (!r.ok) { console.error('[slack] users.list:', r.error); break; }
    for (const u of (r.members || [])) map[u.id] = u.profile?.real_name || u.real_name || u.name || u.id;
    cursor = r.response_metadata?.next_cursor || undefined;
  } while (cursor);
  _userCache = map;
  return map;
}

/** Resolve a #name (or bare name) to a channel id. Passes through real ids. */
export async function resolveSlackChannel(nameOrId: string): Promise<string | null> {
  if (/^[CGD][A-Z0-9]{6,}$/.test(nameOrId)) return nameOrId;
  const clean = nameOrId.replace(/^#/, '').toLowerCase();
  const hit = (await listSlackChannels()).find(c => (c.name || '').toLowerCase() === clean);
  return hit?.id || null;
}

export interface SlackMsg { ts: string; user?: string; userName?: string; text: string; thread_ts?: string; reply_count?: number; }

async function decorate(messages: any[]): Promise<SlackMsg[]> {
  const users = await slackUserMap();
  return (messages || []).map(m => ({
    ts: m.ts,
    user: m.user || m.bot_id,
    userName: users[m.user] || m.username || m.bot_id || 'unknown',
    text: m.text || '',
    thread_ts: m.thread_ts,
    reply_count: m.reply_count,
  }));
}

/** Recent messages from a channel (name or id), newest-first, up to `limit`. */
export async function readSlackHistory(nameOrId: string, opts: { limit?: number; oldest?: string; latest?: string } = {}): Promise<SlackMsg[]> {
  const id = await resolveSlackChannel(nameOrId);
  if (!id) { console.error('[slack] channel not found:', nameOrId); return []; }
  const target = opts.limit || 100;
  let out: any[] = [], cursor: string | undefined;
  do {
    const r = await slackGet('conversations.history', { channel: id, limit: Math.min(200, target), oldest: opts.oldest, latest: opts.latest, cursor });
    if (!r.ok) { console.error(`[slack] conversations.history (${nameOrId}):`, r.error); break; }
    out = out.concat(r.messages || []);
    cursor = r.response_metadata?.next_cursor || undefined;
  } while (cursor && out.length < target);
  return decorate(out.slice(0, target));
}

/**
 * Post AS the authorising user (xoxp) via chat.postMessage — a NATIVE message
 * with NO app attribution footer (unlike the Slack MCP connector, which stamps
 * "Sent using @Claude"). Requires `chat:write` on the USER token. Pass thread_ts
 * to reply in-thread. This is the clean send path Neil wants.
 */
export async function postAsUser(channel: string, text: string, thread_ts?: string): Promise<any> {
  const token = process.env.SLACK_USER_TOKEN;
  if (!token) { console.error('[slack] no SLACK_USER_TOKEN'); return { ok: false, error: 'no_user_token' }; }
  const payload: any = { channel, text };
  if (thread_ts) payload.thread_ts = thread_ts;
  const r = await fetch('https://slack.com/api/chat.postMessage', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify(payload),
  });
  return r.json().catch(() => ({ ok: false, error: 'parse' }));
}

/** Delete a message the user token authored (e.g. to remove a footer'd MCP post). Needs `chat:write`. */
export async function deleteAsUser(channel: string, ts: string): Promise<any> {
  const token = process.env.SLACK_USER_TOKEN;
  if (!token) return { ok: false, error: 'no_user_token' };
  const r = await fetch('https://slack.com/api/chat.delete', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ channel, ts }),
  });
  return r.json().catch(() => ({ ok: false, error: 'parse' }));
}

// ─────────────────────────────────────────────────────────────────────────────
// SWEEP support — enumerate the user's conversations (channels + DMs + group
// DMs), detect unread via `last_read`, and mark threads with a reaction. Used by
// slack-sweep.ts. All on the USER token so coverage matches what the user sees.
// ─────────────────────────────────────────────────────────────────────────────

export interface MemberConvo { id: string; label: string; type: 'public' | 'private' | 'mpim' | 'im'; }

/** Every conversation the authorising user is a MEMBER of — channels, DMs, group DMs. */
export async function listMemberConversations(): Promise<MemberConvo[]> {
  const users = await slackUserMap();
  let out: MemberConvo[] = [], cursor: string | undefined;
  do {
    const r = await slackGet('users.conversations', { types: 'public_channel,private_channel,mpim,im', exclude_archived: 'true', limit: 200, cursor });
    if (!r.ok) { console.error('[slack] users.conversations:', r.error); break; }
    for (const c of (r.channels || [])) {
      let type: MemberConvo['type'] = 'public';
      let label = c.name ? '#' + c.name : c.id;
      if (c.is_im) { type = 'im'; label = 'DM · ' + (users[c.user] || c.user); }
      else if (c.is_mpim) { type = 'mpim'; label = 'Group DM · ' + String(c.name || '').replace(/^mpdm-/, '').replace(/-1$/, '').replace(/--/g, ', '); }
      else if (c.is_private) { type = 'private'; label = '🔒 #' + (c.name || c.id); }
      out.push({ id: c.id, label, type });
    }
    cursor = r.response_metadata?.next_cursor || undefined;
  } while (cursor);
  return out;
}

/** conversations.info → the caller's `last_read` ts for this conversation (or null). */
export async function conversationLastRead(id: string): Promise<string | null> {
  const r = await slackGet('conversations.info', { channel: id });
  return r.ok ? (r.channel?.last_read || null) : null;
}

/** Recent raw messages by channel ID (no #name resolution — works for DMs too). */
export async function historyById(id: string, limit = 30): Promise<any[]> {
  const r = await slackGet('conversations.history', { channel: id, limit });
  if (!r.ok) { if (r.error !== 'not_in_channel') console.error(`[slack] history ${id}:`, r.error); return []; }
  return r.messages || [];
}

/** Add a reaction AS the user. 'already_reacted' counts as success (idempotent sweeps). */
export async function reactAsUser(channel: string, ts: string, name = 'computer'): Promise<{ ok: boolean; already?: boolean; error?: string }> {
  const token = process.env.SLACK_USER_TOKEN;
  if (!token) return { ok: false, error: 'no_user_token' };
  const r = await fetch('https://slack.com/api/reactions.add', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ channel, timestamp: ts, name }),
  });
  const b: any = await r.json().catch(() => ({ ok: false, error: 'parse' }));
  if (b.ok) return { ok: true };
  if (b.error === 'already_reacted') return { ok: true, already: true };
  return { ok: false, error: b.error };
}

/** Remove a reaction AS the user (e.g. swap 🖥️→ done). */
export async function unreactAsUser(channel: string, ts: string, name = 'computer'): Promise<boolean> {
  const token = process.env.SLACK_USER_TOKEN;
  if (!token) return false;
  const r = await fetch('https://slack.com/api/reactions.remove', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ channel, timestamp: ts, name }),
  });
  const b: any = await r.json().catch(() => ({ ok: false }));
  return !!(b.ok || b.error === 'no_reaction');
}

/** Public permalink for a message. */
export async function getPermalink(channel: string, ts: string): Promise<string | null> {
  const r = await slackGet('chat.getPermalink', { channel, message_ts: ts });
  return r.ok ? (r.permalink || null) : null;
}

export interface SearchHit { channelId: string; channelName: string; ts: string; user?: string; userName: string; text: string; permalink?: string; }

/** search.messages (user token). Supports Slack modifiers incl. `has::emoji:` reaction search. */
export async function searchMessages(query: string, count = 50): Promise<SearchHit[]> {
  const token = process.env.SLACK_USER_TOKEN;
  if (!token) { console.error('[slack] no SLACK_USER_TOKEN for search'); return []; }
  const users = await slackUserMap();
  const qs = new URLSearchParams({ query, count: String(count), sort: 'timestamp', sort_dir: 'desc' });
  const r = await fetch(`${SLACK_BASE}search.messages?${qs.toString()}`, { headers: { Authorization: `Bearer ${token}` } });
  const b: any = await r.json().catch(() => ({ ok: false }));
  if (!b.ok) { console.error('[slack] search.messages:', b.error); return []; }
  return (b.messages?.matches || []).map((m: any) => ({
    channelId: m.channel?.id, channelName: m.channel?.name || m.channel?.id,
    ts: m.ts, user: m.user, userName: users[m.user] || m.username || 'unknown',
    text: m.text || '', permalink: m.permalink,
  }));
}

/** The authorising user's own Slack id (to skip the user's own messages in a sweep). */
export async function authedUserId(): Promise<string | null> {
  const token = process.env.SLACK_USER_TOKEN || process.env.SLACK_BOT_TOKEN;
  if (!token) return null;
  const r = await fetch('https://slack.com/api/auth.test', { headers: { Authorization: `Bearer ${token}` } });
  const b: any = await r.json().catch(() => ({}));
  return b.ok ? b.user_id : null;
}

/** All replies in a thread, given the channel and the root message `ts`. */
export async function readSlackThread(nameOrId: string, ts: string): Promise<SlackMsg[]> {
  const id = await resolveSlackChannel(nameOrId);
  if (!id) { console.error('[slack] channel not found:', nameOrId); return []; }
  const r = await slackGet('conversations.replies', { channel: id, ts, limit: 200 });
  if (!r.ok) { console.error(`[slack] conversations.replies (${nameOrId}):`, r.error); return []; }
  return decorate(r.messages || []);
}
