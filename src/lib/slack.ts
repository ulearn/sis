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
