/**
 * Social-post screenshot → {views, likes, comments, shares} via OpenAI vision.
 *
 * Clones the passport-parser pattern (same OPENAI_API_KEY, json_object mode,
 * temperature 0) but reads an Instagram/Facebook post screenshot the student
 * uploads on day 14 of their Progress-Post countdown. The numbers are the
 * counts shown on the post (likes, comments, and — on Reels — views; shares
 * only when the student's own insights screen is captured).
 *
 * ALWAYS returns for a human to confirm — the student edits in the app before
 * save, and the leading entry is hand-checked against the live link at month
 * end, so there's no incentive to inflate.
 *
 * Numbers on social screenshots are abbreviated ("1.2K", "3.4M", "12,345") —
 * the model is told to expand them to plain integers.
 *
 * No new npm deps: fs + global fetch.
 */
import fs from 'fs';

// Reading 5 near-identical little icons + abbreviated numbers is fiddly, and
// it gates a cash prize, so this reader uses the stronger gpt-4o (the student
// still confirms). Override with OPENAI_METRICS_MODEL if needed.
const OPENAI_MODEL = process.env.OPENAI_METRICS_MODEL || 'gpt-4o';
const VISION_MIME = new Set(['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif']);

export interface ParsedPostMetrics {
  views: number | null;
  likes: number | null;
  comments: number | null;
  reposts: number | null;
  shares: number | null;
  saves: number | null;
  date: string | null;     // ISO YYYY-MM-DD of any explicit calendar date shown (for the 14-day window check)
  needsReview: string[];
}

const SYSTEM_PROMPT = `You read a screenshot of a social media post (Instagram or Facebook — feed post, Reel, or insights screen) and extract its engagement counts into a FIXED JSON object.

The engagement icons sit in a row of buttons, each with a count: stacked VERTICALLY down the right of a full-screen Reel, or HORIZONTALLY along the bottom of a Post/profile view. Read them in order (top→bottom for vertical, left→right for horizontal).

STEP 1 — DECIDE THE PLATFORM from the FIRST (like) icon:
  • a ❤️ HEART  → INSTAGRAM
  • a 👍 THUMBS-UP → FACEBOOK

STEP 2 — map the counts in order using THAT platform's fixed scheme:
  • INSTAGRAM = FIVE icons: 1 ❤️=likes, 2 💬=comments, 3 ↻loop=reposts, 4 ➤plane=shares, 5 🔖bookmark=saves.
  • FACEBOOK = FOUR icons (there is NO repost icon on Facebook): 1 👍=likes, 2 💬=comments, 3 ↪arrow=shares, 4 🔖bookmark=saves. For Facebook, reposts MUST be null — never put a number in reposts.

So on FACEBOOK the 3rd icon is SHARES (not reposts). Cross-check: count the icons between comments and the final bookmark — TWO ⇒ Instagram (reposts then shares); ONE ⇒ Facebook (shares only, reposts=null).
Assign BY POSITION, not by guessing the tiny shapes. The bookmark count is SAVES and may have no number → saves=null. ('--' next to a metric means null; '0' means 0.)

VIEWS — read a number labelled "views" or "plays" WHEREVER it appears (it is NEVER one of the five engagement icons):
  • On the OWNER's own reel, a "N views" count sits at the BOTTOM (near a "Boost" button) — e.g. "1K views" → 1000.
  • On a REEL INSIGHTS / analytics screen (header "Reel insights", sections "Overview"/"Views"/"Accounts reached"), read the number labelled "Views" (the big total, e.g. "Views 825" → 825 — NOT the per-platform "Instagram 677 / Facebook 148" sub-rows).
If no "views/plays" number is shown, views = null.

INSIGHTS SCREEN: when the image is a Reel-insights/analytics page, prefer the LABELLED rows — "Views" → views. Engagement counts come from the small icon row near the top of that screen (heart=likes, speech=comments, then share/repost, bookmark=saves); they often read "--" (null) or "0".

Rules:
- Output ONLY the JSON object. No prose, no markdown fences.
- Expand abbreviated numbers to plain integers: "16.9K" -> 16900, "3.4M" -> 3400000, "12,345" -> 12345, "1.234" (European thousands) -> 1234.
- A count literally shown as 0 is 0; a metric whose icon/number is NOT present is null.
- NEVER invent or guess which number goes with which metric. If you can't confidently map a visible number to its icon, set that field null AND add its name to "needsReview".
- If the image is clearly not a social post, set all numbers null and put "not_a_post" in needsReview.

DATE — also read any explicit CALENDAR date visible anywhere in the image (used to confirm the screenshot is inside the post's 14-day window):
  • A real date on the post/insights ("15 July 2026", "July 15", "15 Jul", a status-bar date) → output ISO "YYYY-MM-DD" (assume the CURRENT year if the year is omitted).
  • Only a RELATIVE age shown ("2w", "3 days ago", "yesterday") → date=null (can't anchor it reliably).
  • No calendar date visible → date=null.

Schema (every key REQUIRED; null when absent):
{"views":int|null,"likes":int|null,"comments":int|null,"reposts":int|null,"shares":int|null,"saves":int|null,"date":"YYYY-MM-DD"|null,"needsReview":[str]}`;

export async function parsePostMetrics(
  filePath: string,
  mimeType: string,
  opts?: { platform?: 'instagram' | 'facebook' | null },
): Promise<{ supported: boolean; extracted: ParsedPostMetrics | null; error?: string }> {
  const mime = (mimeType || '').toLowerCase();
  if (!VISION_MIME.has(mime)) return { supported: false, extracted: null };
  // The student linked the post URL, so we usually KNOW the platform — far more
  // reliable than the model guessing heart-vs-thumbs-up. Force the right scheme.
  const platformLine = opts?.platform === 'facebook'
    ? 'This screenshot is from FACEBOOK. Use the FACEBOOK 4-icon scheme: likes, comments, shares, saves. reposts MUST be null.'
    : opts?.platform === 'instagram'
      ? 'This screenshot is from INSTAGRAM. Use the INSTAGRAM 5-icon scheme: likes, comments, reposts, shares, saves.'
      : 'Decide the platform from the like icon (heart=Instagram, thumbs-up=Facebook).';

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return { supported: false, extracted: null, error: 'OPENAI_API_KEY not set' };

  let buf: Buffer;
  try {
    buf = await fs.promises.readFile(filePath);
  } catch {
    return { supported: true, extracted: null, error: 'could not read uploaded file' };
  }
  const outMime = mime === 'image/jpg' ? 'image/jpeg' : mime;
  const dataUri = `data:${outMime};base64,${buf.toString('base64')}`;

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        temperature: 0,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          {
            role: 'user',
            content: [
              { type: 'text', text: `${platformLine}\nExtract the engagement counts from this post screenshot.` },
              { type: 'image_url', image_url: { url: dataUri, detail: 'high' } },
            ],
          },
        ],
      }),
    });
    if (!res.ok) {
      const t = await res.text();
      return { supported: true, extracted: null, error: `OpenAI ${res.status}: ${t.slice(0, 200)}` };
    }
    const data: any = await res.json();
    const content = data.choices?.[0]?.message?.content || '{}';
    let p: ParsedPostMetrics;
    try { p = JSON.parse(content); } catch { return { supported: true, extracted: null, error: 'model returned non-JSON' }; }
    if (!Array.isArray((p as any).needsReview)) (p as any).needsReview = [];
    for (const k of ['views', 'likes', 'comments', 'reposts', 'shares', 'saves'] as const) {
      const v = (p as any)[k];
      (p as any)[k] = (typeof v === 'number' && Number.isFinite(v)) ? Math.round(v) : null;
    }
    const dv = (p as any).date;
    (p as any).date = (typeof dv === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dv)) ? dv : null;
    return { supported: true, extracted: p };
  } catch (e: any) {
    return { supported: true, extracted: null, error: String(e?.message || e) };
  }
}
