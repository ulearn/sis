// Host portal — magic-link layer (Slice 1 of 5).
//
// Provides:
//   1. Token mint endpoint (admin-side) — POST /sis/api/host-portal/tokens
//      Mints a new token if the provider doesn't have one yet, else returns
//      the existing one. Idempotent.
//   2. Token lookup helper used by Slice 3+ routes — resolveHostToken(token)
//      returns the provider (with relevant relations) or null. Bumps
//      lastUsedAt as a side-effect so we can audit activity.
//   3. Middleware factory `requireHostToken(prisma)` for any future
//      /host-portal/<token>/* route — attaches `req.hostProvider` and
//      returns 404 if the token is unknown.
//
// Tokens are evergreen per project_host_portal_v1 spec — no expiry, no
// rotation by default. Admin can "rotate" by deleting + re-minting (rare;
// only if a token is suspected compromised). Per-host uniqueness is
// enforced at the DB level (`providerId @unique`).
import { Router, Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { PrismaClient } from '../generated/prisma/client';
import { hostPaymentScripts } from '../scripts/host-payments';
import { postSlackMessage, kellyMention } from '../lib/slack';

// Express request augmentation — provider attached by the middleware so
// downstream handlers (account view, matching pool, claim endpoint) can
// reference it without re-querying.
declare module 'express-serve-static-core' {
  interface Request {
    hostProvider?: { id: number; name: string; email: string | null; portalMatchingEnabled: boolean };
    hostToken?: string;
  }
}

// 10 chars from a 62-char alphabet (a-z, A-Z, 0-9) → ~59 bits of entropy.
// Online brute-force infeasible; worst-case "someone guessed a host's link"
// surfaces unplaced-student names + that host's own bills — moderate PII,
// not financial / credential exposure. We're not sealing Fort Knox; the
// shorter URL is friendlier in WhatsApp / SMS / email bodies. Per Neil's
// directive 2026-05-22.
const TOKEN_ALPHABET = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const TOKEN_LEN      = 10;

function newToken(): string {
  // crypto.randomBytes (NOT Math.random) — even at 59 bits we want a
  // predictable-attacker-can't-guess source. Modulo bias is negligible at
  // this length / alphabet.
  const buf = crypto.randomBytes(TOKEN_LEN);
  let out = '';
  for (let i = 0; i < TOKEN_LEN; i++) out += TOKEN_ALPHABET[buf[i]! % TOKEN_ALPHABET.length];
  return out;
}

// Idempotent mint — returns existing token row if any, else creates one.
// Used by the staff outreach UI (Slice 5) every time it wants a link for a
// host; safe to call on every send because the @@unique constraint on
// provider_id guarantees one row per host.
export async function mintHostPortalToken(
  prisma: PrismaClient,
  providerId: number,
): Promise<{ token: string; createdAt: Date; lastUsedAt: Date | null }> {
  const existing = await prisma.hostPortalToken.findUnique({
    where: { providerId },
    select: { token: true, createdAt: true, lastUsedAt: true },
  });
  if (existing) return existing;
  const created = await prisma.hostPortalToken.create({
    data: { token: newToken(), providerId },
    select: { token: true, createdAt: true, lastUsedAt: true },
  });
  return created;
}

// Token → provider resolver. Bumps lastUsedAt on success (best-effort —
// failure to write the timestamp doesn't fail the lookup).
export async function resolveHostToken(
  prisma: PrismaClient,
  token: string,
): Promise<{ id: number; name: string; email: string | null; portalMatchingEnabled: boolean } | null> {
  // Strict shape check before hitting the DB — rules out random short
  // strings / garbage paths cheaply.
  if (!token || token.length !== TOKEN_LEN || !/^[A-Za-z0-9]+$/.test(token)) return null;
  const row = await prisma.hostPortalToken.findUnique({
    where: { token },
    include: { provider: { select: { id: true, name: true, email: true, active: true, portalMatchingEnabled: true } } },
  });
  if (!row || !row.provider || !row.provider.active) return null;
  // Fire-and-forget activity bump
  prisma.hostPortalToken.update({
    where: { token },
    data: { lastUsedAt: new Date() },
  }).catch(() => { /* swallow — activity timestamp is best-effort */ });
  return { id: row.provider.id, name: row.provider.name, email: row.provider.email, portalMatchingEnabled: row.provider.portalMatchingEnabled };
}

// Middleware factory for any /host-portal/<token>/* route in slices 3-4.
// Reads :token from the path, attaches req.hostProvider on success, 404s
// otherwise. Routes mount under /host-portal/:token, so this middleware
// is added once at that subtree's base.
export function requireHostToken(prisma: PrismaClient) {
  return async (req: Request, res: Response, next: NextFunction) => {
    // base64url is case-sensitive — do NOT lowercase
    const token = String(req.params.token || '');
    const provider = await resolveHostToken(prisma, token);
    if (!provider) return res.status(404).send('Host portal link not recognised. Contact accommodation team.');
    req.hostProvider = provider;
    req.hostToken = token;
    next();
  };
}

// ─── Public portal router (Slice 3) ────────────────────────────────────────
//
// Mounted at /host-portal — sits BEFORE requireAuth in app.ts so hosts can
// hit their magic link without a SIS session. Auth is the token (validated
// by requireHostToken middleware on every route).
//
// Server-renders the full page on each load. Calendar interactivity (click
// a day → filter the visible cards) is client-side JS that operates on
// data already in the DOM — no second API call.
//
// Privacy posture on the "students looking for a host" list:
//   - First name + last initial only (not full surname)
//   - Nationality, gender, age, diet/allergies (decision-relevant)
//   - NO contact details (email/phone/address) — those surface only AFTER
//     a host claims a student (Slice 4)
export function publicHostPortalRoutes(prisma: PrismaClient) {
  const router = Router();
  router.use('/:token', requireHostToken(prisma));
  router.get('/:token', async (req, res) => {
    const p = req.hostProvider!;
    try {
      const html = await renderHostPortalPage(prisma, p.id, req.hostToken!);
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.send(html);
    } catch (e: any) {
      console.error('[host-portal] render failed for provider', p.id, e);
      res.status(500).send('Something went wrong loading your portal. Please contact accomm@ulearnschool.com.');
    }
  });

  // Expression of Interest ("Claim"). Provisional + first-come: registers
  // interest and pulls the student from everyone else's pool, but does NOT
  // place them — Kelly confirms (assigns a bed) or releases in Matching.
  router.post('/:token/claim', async (req: any, res) => {
    const provider = req.hostProvider!;
    // Matching switched off for this host — they can't register interest even
    // via a stale page still holding a Claim button. Mirrors the hidden pool.
    if (provider.portalMatchingEnabled === false) {
      return res.status(403).json({ error: 'This host account is not currently able to register interest in students. Please contact accomm@ulearnschool.com.' });
    }
    const baId = parseInt(String(req.body?.bookingAccommodationId ?? ''), 10);
    if (!Number.isFinite(baId)) return res.status(400).json({ error: 'bookingAccommodationId required' });
    try {
      // Atomic: only succeeds while still unclaimed AND unplaced AND active.
      // 0 rows back = another host got there first (or it was placed).
      const updated = await prisma.bookingAccommodation.updateMany({
        where: { id: baId, claimedByProviderId: null, bedId: null, active: true },
        data: { claimedByProviderId: provider.id, claimedAt: new Date(), claimStatus: 'pending', claimedVia: 'host-portal' },
      });
      if (updated.count === 0) {
        return res.status(409).json({ error: 'Another host just registered interest in this student — it\'s no longer available.' });
      }
      // Notify Kelly (best-effort — never block the claim on Slack).
      const ba = await prisma.bookingAccommodation.findUnique({
        where: { id: baId },
        select: { startDate: true, endDate: true, booking: { select: { student: { select: { firstName: true, lastName: true, nationality: true } } } } },
      });
      const s = ba?.booking?.student;
      const studentName = s ? `${s.firstName} ${lastInitial(s.lastName)}` : 'a student';
      const nights = ba ? nightsBetween(ba.startDate, ba.endDate) : 0;
      const slackChannel = process.env.SLACK_ACCOMM_CHANNEL || process.env.SLACK_DEFAULT_CHANNEL || undefined;
      postSlackMessage({
        channel: slackChannel,
        text: `🏠 *${provider.name}* expressed interest in hosting *${studentName}*${s?.nationality ? ' (' + s.nationality + ')' : ''} — arr ${ba ? fmtDate(ba.startDate) : '?'}, ${nights} nights.\nConfirm or release in *Matching*. ${kellyMention()}`,
      }).then(r => {
        if (r?.ok) console.log(`[host-portal] claim Slack ping sent to ${r.channel} for ba ${baId}`);
        else console.error(`[host-portal] claim Slack ping FAILED for ba ${baId}: ${r?.error}`);
      }).catch(e => console.error(`[host-portal] claim Slack ping threw for ba ${baId}:`, e?.message || e));
      res.json({ ok: true });
    } catch (e: any) {
      console.error('[host-portal] claim failed for ba', baId, e);
      res.status(500).json({ error: 'Could not register your interest. Please contact accomm@ulearnschool.com.' });
    }
  });

  // First Dibs — a host who missed out self-tags to be emailed FIRST next cycle.
  // Gates: matching on · GV completed (else a "finish vetting" nudge, no grant) ·
  // cap of 5 concurrent holders. Single-use + placement clearing (elsewhere) stop
  // it becoming a permanent bump.
  const FIRST_DIBS_CAP = 5;
  router.post('/:token/first-dibs', async (req: any, res) => {
    const provider = req.hostProvider!;
    try {
      if (provider.portalMatchingEnabled === false) {
        return res.json({ status: 'error', message: 'Your account isn\'t set up for student matching right now. Please contact accomm@ulearnschool.com.' });
      }
      const p = await prisma.accommodationProvider.findUnique({
        where: { id: provider.id },
        select: { firstDibsAt: true, vettingStatus: true },
      });
      if (!p) return res.status(404).json({ status: 'error', message: 'Host not found.' });
      if (p.firstDibsAt) {
        return res.json({ status: 'already', message: 'You\'re already on the First Dibs list — no need to click again.' });
      }
      // GV gate — non-completed hosts get a nudge, not a grant (turns the First
      // Dibs itch into a vetting-completion prompt), and it does NOT consume a slot.
      const subs = await prisma.hostVettingSubmission.findMany({ where: { providerId: provider.id }, select: { status: true } });
      if (!firstDibsGvComplete(p.vettingStatus, subs)) {
        return res.json({ status: 'gv-incomplete', message: 'Almost! Your Garda vetting isn\'t complete yet — finish it and you can grab First Dibs. Tap "Complete Garda Vetting" below to do the next step.' });
      }
      // Cap — count current flag-holders.
      const held = await prisma.accommodationProvider.count({ where: { firstDibsAt: { not: null } } });
      if (held >= FIRST_DIBS_CAP) {
        return res.json({ status: 'full', message: 'First Dibs is full for this round — but you\'ll still be in the running. We\'ll be in touch as students come up.' });
      }
      // Set ONLY the flag — their activity level (SuperHost/BusyBee/…) is left as-is.
      const granted = await prisma.accommodationProvider.update({
        where: { id: provider.id },
        data: { firstDibsAt: new Date(), firstDibsStrikes: { increment: 1 } },
        select: { firstDibsStrikes: true },
      });
      const slackChannel = process.env.SLACK_ACCOMM_CHANNEL || process.env.SLACK_DEFAULT_CHANNEL || undefined;
      // 3-strikes safety valve: a host who keeps raising their hand but never converts
      // (distance / suitability / accept-flags) gets escalated to Kelly instead of just
      // silently re-queuing forever.
      const slackText = granted.firstDibsStrikes >= 3
        ? `⚠️ *${provider.name}* has tapped *First Dibs* ${granted.firstDibsStrikes}× without ever being placed — worth a look (distance / suitability / accept-flags?). ${kellyMention()}`
        : `⭐ *${provider.name}* tapped *First Dibs* — front of next week's outreach.`;
      postSlackMessage({ channel: slackChannel, text: slackText }).catch(() => {});
      return res.json({ status: 'granted', message: '✓ You\'re on the First Dibs list — you\'ll be first to hear about next week\'s students.' });
    } catch (e: any) {
      console.error('[host-portal] first-dibs failed for provider', provider?.id, e);
      res.status(500).json({ status: 'error', message: 'Something went wrong. Please contact accomm@ulearnschool.com.' });
    }
  });

  return router;
}

// SSR — fetches the 3 sections (unplaced upcoming arrivals, current
// placements, account/bills) and builds the HTML. Keep self-contained:
// the portal is single-purpose and we don't want to drag the SIS admin
// CSS / JS bundle in here.
async function renderHostPortalPage(prisma: PrismaClient, providerId: number, token: string): Promise<string> {
  const provider = await prisma.accommodationProvider.findUnique({
    where: { id: providerId },
    select: { id: true, name: true, type: true, email: true, phone: true, mobile: true, portalMatchingEnabled: true, hostCategory: true, firstDibsAt: true, vettingStatus: true },
  });
  if (!provider) return `<!doctype html><body>Provider not found.</body>`;

  // Per Neil 2026-05-22 the portal is sent to Host Families only. If a
  // non-HF provider somehow lands here (bad type tag, future expansion),
  // show a friendly message rather than rendering an empty list.
  if (provider.type !== 'Host Family') {
    return wrapHtml(provider.name, `
      <div class="box muted">
        Your account isn't set up as a Host Family in our system. If you
        think this is wrong, please contact accomm@ulearnschool.com.
      </div>`);
  }

  // ── Section A: unplaced Host-Family students, any arrival date from today on.
  // NO upper horizon — must stay identical to the outreach-cron gate
  // (.claude/cron/host-outreach.js §1) so a host who's nudged always finds the
  // same students here; a shorter window would email them then show nobody.
  // Skipped entirely when this host's matching is switched off (ops decision):
  // they keep portal access to their own residents + bills, but never see — nor
  // can claim — new students. Empty list ⇒ buildPortalBody omits the section.
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const unplaced = provider.portalMatchingEnabled === false ? [] : await prisma.bookingAccommodation.findMany({
    where: {
      active: true,
      bedId: null,
      claimedByProviderId: null,   // once any host registers interest it leaves the pool (first-come)
      accommodationType: 'Host Family',
      startDate: { gte: today },
      // Hosts only ever see CONFIRMED-and-paid students. status='CONFIRMED' is
      // set by the invoice-paid webhook only once totalPaid >= totalBilled, so
      // it means confirmed AND fully paid in one check — this excludes PENDING /
      // PARTIAL / ESCROW / CANCELLED. Reason: a host shouldn't be offered (or
      // claim) a student who hasn't actually committed + paid — that's how you
      // create an unmet liability, and it's why an unconfirmed duplicate booking
      // was showing the same student twice. Visa still must be resolved.
      booking: {
        status: 'CONFIRMED',
        student: { is: { OR: [
          { visaStatus: null },
          { visaStatus: { notIn: ['Pending', 'Appeal'] } },
        ]}},
      },
    },
    include: {
      booking: {
        select: {
          amountPaid: true, amountTotal: true,
          student: { select: { id: true, firstName: true, lastName: true, gender: true, nationality: true, birthday: true, allergies: true, diet: true } },
        },
      },
    },
    orderBy: { startDate: 'asc' },
  });

  // ── Section B: this host's current placements (today's residents + upcoming)
  const placements = await prisma.bookingAccommodation.findMany({
    where: {
      active: true,
      bedId: { not: null },
      bed: { room: { property: { providerId } } },
      endDate: { gte: today },
    },
    include: {
      booking: {
        select: {
          student: { select: { id: true, firstName: true, lastName: true, gender: true, nationality: true } },
        },
      },
      bed: { include: { room: true } },
    },
    orderBy: { startDate: 'asc' },
  });

  // ── Section C: open + recently-paid Xero Bills for this host
  // Live-refresh this provider's open bills from Xero first — without this
  // the portal would show stale "OPEN" on bills the host has already been
  // paid for (Monday cron is the only other refresh path). Best-effort:
  // if Xero is down, fall back to whatever the DB has.
  try {
    const r = await hostPaymentScripts(prisma).syncXeroBillStatuses(providerId);
    if (r.checked) console.log(`[host-portal] live Xero sync for provider ${providerId}: checked=${r.checked} paid=${r.paid} voided=${r.voided}`);
  } catch (e: any) {
    console.warn(`[host-portal] live Xero sync failed for provider ${providerId}:`, e?.message || e);
  }
  const bills = await prisma.hostPaymentLineItem.findMany({
    where: { providerId },
    select: {
      id: true, periodFrom: true, periodTo: true, amount: true, studentName: true,
      weeksPaid: true, daysPaid: true,
      xeroStatus: true, xeroPaidAt: true, xeroBillId: true, reason: true, amendmentNote: true,
    },
    // Newest first. Order by id (== H-number sequence == creation order) rather
    // than the stay period, so the most recently raised/paid bill is on top —
    // otherwise an earlier-period bill paid later sinks below an older payment.
    orderBy: { id: 'desc' },
    take: 100,   // 5 shown + "View more" reveals the rest (deep enough for a full season's history)
  });

  // Total earnings = everything actually paid to this host (all-time, not just
  // the 30 shown). Open/void bills don't count as earned.
  const earnedAgg = await prisma.hostPaymentLineItem.aggregate({
    where: { providerId, xeroStatus: 'paid' },
    _sum: { amount: true },
  });
  const totalEarnings = Number(earnedAgg._sum.amount || 0);

  // Garda vetting status — drives the portal section's count line.
  const vetting = await prisma.hostVettingSubmission.findMany({
    where: { providerId },
    select: { status: true },
  });
  const vettingStats = {
    total: vetting.length,
    pending: vetting.filter(v => v.status !== 'signed').length,
  };

  // ── First Dibs — the self-serve "missed out → jump next week's queue" button.
  // Surfaces ONLY when: matching is on, the pool is empty (they missed out), they
  // don't already hold it, we're inside an active outreach cycle (a wave fired in
  // the last 3 days), and fewer than FD_CAP hosts currently hold it. GV is checked
  // on CLICK (non-GV still see it → get a "finish your vetting" nudge). Single-use
  // + placement clearing keep it from becoming a permanent bump.
  const FD_CAP = 5;
  const alreadyFirstDibs = provider.firstDibsAt != null;
  let showFirstDibs = false;
  if (provider.portalMatchingEnabled !== false && unplaced.length === 0 && !alreadyFirstDibs) {
    const fdCount = await prisma.accommodationProvider.count({ where: { firstDibsAt: { not: null } } });
    showFirstDibs = firstDibsWindowOpen() && fdCount < FD_CAP;
  }
  const firstDibs = { show: showFirstDibs, alreadyIn: alreadyFirstDibs };

  return wrapHtml(provider.name, buildPortalBody(provider, unplaced, placements, bills, totalEarnings, token, vettingStats, provider.portalMatchingEnabled !== false, firstDibs));
}

// GV "completed" = phase 3 (mirrors auto-nudge.hostPhase): manual vettingStatus
// wins; else derived from submissions (submitted→form, signed→upload, else complete).
function firstDibsGvComplete(vettingStatus: string | null | undefined, subs: { status: string }[]): boolean {
  const PHASE: Record<string, number> = { none: 0, form: 1, upload: 2, complete: 3, returned: 3 };
  if (vettingStatus != null) return (PHASE[vettingStatus] ?? 0) === 3;
  if (!subs || !subs.length) return false;
  if (subs.some(s => s.status === 'submitted')) return false;
  if (subs.some(s => s.status === 'signed')) return false;
  return true;
}

// First Dibs button window: open only within FIRST_DIBS_WINDOW_H hours of the
// cascade's LAST actual send (config.lastSentAt — auto-stop aware). This is the
// "goes away X hours after the last cohort was emailed" rule. Hour-precise.
const FIRST_DIBS_WINDOW_H = 6;
function firstDibsWindowOpen(): boolean {
  try {
    const cfgPath = path.join(__dirname, '..', '..', 'data', 'auto-nudge.json');
    if (!fs.existsSync(cfgPath)) return false;
    const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
    if (!cfg.lastSentAt) return false;
    const sentMs = new Date(cfg.lastSentAt).getTime();
    if (!isFinite(sentMs)) return false;
    return (Date.now() - sentMs) <= FIRST_DIBS_WINDOW_H * 3600 * 1000;
  } catch { return false; }
}

// ─── HTML helpers ──────────────────────────────────────────────────────────

const esc = (s: any) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));

function lastInitial(lastName: string | null): string {
  const t = (lastName || '').trim();
  return t ? t.charAt(0).toUpperCase() + '.' : '';
}

function ageFrom(birthday: Date | null): string {
  if (!birthday) return '';
  const y = Math.floor((Date.now() - new Date(birthday).getTime()) / (365.25 * 24 * 3600 * 1000));
  return y > 0 && y < 120 ? String(y) : '';
}

function genderSymbol(g: number | null): string {
  if (g === 1) return '♂ Male';
  if (g === 2) return '♀ Female';
  return '';
}

function fmtDate(d: Date | string): string {
  const dt = new Date(d);
  return dt.toLocaleDateString('en-IE', { weekday: 'short', day: 'numeric', month: 'short' });
}

function fmtMoney(n: any): string {
  // Thousands separators + 2dp, e.g. €2,153.57
  return '€' + Number(n || 0).toLocaleString('en-IE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function nightsBetween(a: Date | string, b: Date | string): number {
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / (24 * 3600 * 1000));
}

function wrapHtml(providerName: string, body: string): string {
  return `<!doctype html><html><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>ULearn Host Portal — ${esc(providerName)}</title>
<style>
  *{box-sizing:border-box}
  body{font-family:Verdana,sans-serif;max-width:780px;margin:0 auto;color:#2B2B2B;padding:20px 16px;background:#fafafa;line-height:1.5}
  h1{font-size:22px;margin:0 0 6px}
  h2{font-size:15px;margin:28px 0 10px;color:#444;text-transform:uppercase;letter-spacing:.04em}
  details.section{margin:28px 0 10px}
  details.section > summary{list-style:none;cursor:pointer;user-select:none}
  details.section > summary::-webkit-details-marker{display:none}
  details.section > summary .sec-title{font-size:15px;color:#444;text-transform:uppercase;letter-spacing:.04em;font-weight:700}
  details.section > summary::before{content:'\\25B8 ';color:#6FB42C;font-weight:700}
  details.section[open] > summary::before{content:'\\25BE '}
  .topbar{padding-bottom:14px;border-bottom:1px solid #e0e0e0;margin-bottom:8px}
  .muted{color:#777;font-size:13px}
  .box{background:#fff;border:1px solid #e0e0e0;border-radius:8px;padding:14px 18px;margin:10px 0}
  .box.box-green{background:#6FB42C2E;border-color:#bcdd92}
  .box.box-account{background:#0012ff29;border-color:#b9c0ff}
  .card{background:#fff;border:1px solid #e0e0e0;border-radius:8px;padding:14px 18px;margin:8px 0;display:flex;justify-content:space-between;align-items:flex-start;gap:12px;transition:opacity 120ms}
  .card.hidden{display:none}
  .card-body{flex:1;min-width:0}
  .card-name{font-weight:700;font-size:15px;margin-bottom:4px}
  .card-meta{font-size:12px;color:#666}
  .card-dates{font-size:13px;margin-top:6px}
  .pill{display:inline-block;background:#eef5d3;color:#3a6c00;font-size:11px;font-weight:700;padding:2px 8px;border-radius:10px;margin-left:6px}
  .btn{display:inline-block;background:#6FB42C;color:#fff;border:0;border-radius:6px;padding:8px 16px;font-weight:700;font-size:13px;cursor:pointer;text-decoration:none;font-family:inherit}
  .btn:disabled{background:#c0c0c0;cursor:not-allowed}
  .btn-secondary{background:#fff;color:#2B2B2B;border:1px solid #c0c0c0}
  .cal{background:#fff;border:1px solid #e0e0e0;border-radius:8px;padding:14px;margin:10px 0;font-size:13px}
  .cal-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:2px;margin-top:6px}
  .cal-grid > div{padding:8px 4px;text-align:center;border-radius:4px;cursor:default;position:relative;font-size:12px}
  .cal-grid > .head{font-weight:700;color:#888;font-size:10px;text-transform:uppercase}
  .cal-grid > .has{background:#eef5d3;cursor:pointer;font-weight:700}
  .cal-grid > .has:hover{background:#dfeec0}
  .cal-grid > .active{background:#6FB42C;color:#fff}
  .cal-grid > .empty{color:#ccc}
  .cal-grid .d{display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;line-height:1;border-radius:50%}
  .cal-grid > .today .d{box-shadow:inset 0 0 0 3px #E8843C;font-weight:700}
  .mtag{position:absolute;top:1px;left:3px;font-size:8px;font-weight:700;color:#6FB42C;text-transform:uppercase;letter-spacing:.3px}
  .badge{position:absolute;top:1px;right:3px;font-size:9px;background:#6FB42C;color:#fff;padding:0 4px;border-radius:7px;min-width:14px;font-weight:700}
  .bill{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #f0f0f0;font-size:13px}
  .bill:last-child{border-bottom:0}
  .bill-status{font-size:11px;font-weight:700;padding:1px 8px;border-radius:10px}
  .paid{background:#dcfce7;color:#166534}
  .open{background:#fef3c7;color:#92400e}
  .void{background:#f3f4f6;color:#6b7280}
  @media (max-width:480px){body{padding:14px 10px}.card{flex-direction:column;align-items:stretch}.btn{width:100%}}
</style>
</head><body>${body}</body></html>`;
}

function buildPortalBody(
  provider: { name: string; email: string | null },
  unplaced: any[],
  placements: any[],
  bills: any[],
  totalEarnings: number,
  token: string,
  vettingStats: { total: number; pending: number },
  showMatching: boolean = true,
  firstDibs: { show: boolean; alreadyIn: boolean } = { show: false, alreadyIn: false },
): string {
  // ── Section A: collapsible (closed on load). Titled "Students Looking For
  // Hosts" — NOT "Arrivals", which older hosts misread as people arriving at
  // THEIR house. It's a matching pool, so it's tucked away by default; they
  // open it when they want to browse who needs a host.
  // Omitted entirely when matching is switched off for this host (ops decision):
  // the section simply isn't there, rather than showing an empty "no students" box.
  const sectionA = !showMatching ? '' : `
    <details class="section">
      <summary><span class="sec-title">Students Looking For Hosts</span><span class="muted" style="font-weight:400;margin-left:8px">— tap to view${unplaced.length ? ' (' + unplaced.length + ')' : ''}</span></summary>
      <div style="margin-top:10px">
      ${unplaced.length === 0
        ? `<div class="box muted">No students need a host right now. We'll be in touch when new students need placement.</div>
           ${firstDibs.alreadyIn
             ? `<div class="box box-green" style="margin-top:10px">✓ You're on the <strong>First Dibs</strong> list — you'll be first to hear about next week's students.</div>`
             : firstDibs.show
               ? `<div class="box" style="margin-top:10px;text-align:center">
                    <div style="font-weight:700;margin-bottom:4px">Missed out this week?</div>
                    <div class="muted" style="font-size:13px;margin-bottom:10px">Tap below and we'll email you <strong>first</strong> next time students need a host.</div>
                    <button id="firstDibsBtn" class="btn" onclick="firstDibs(this)" style="background:#2563eb;color:#fff;border:0">⭐ GET FIRST DIBS NEXT WEEK</button>
                    <div id="firstDibsMsg" class="muted" style="font-size:12px;margin-top:8px"></div>
                  </div>`
               : ''}`
        : `${renderCalendar(unplaced)}
           <div id="cardList">${unplaced.map((p, i) => renderStudentCard(p, i >= 5)).join('')}</div>
           ${unplaced.length > 5
             ? `<div class="muted" style="text-align:center;margin:8px 0">
                  Showing <span id="visibleCount">5</span> of ${unplaced.length}
                  <a href="#" id="showMore" style="margin-left:8px;color:#3a6c00;font-weight:700">show more ▾</a>
                </div>`
             : ''}`
      }
      </div>
    </details>
  `;

  // ── Section B: current placements
  const sectionB = `
    <h2>Current Students</h2>
    ${placements.length === 0
      ? `<div class="box muted">No students currently placed with you.</div>`
      : placements.map(pl => {
          const s = pl.booking?.student;
          const dates = `${fmtDate(pl.startDate)} → ${fmtDate(pl.endDate)} (${nightsBetween(pl.startDate, pl.endDate)} nights)`;
          const room = pl.bed?.room?.name ? ` · ${esc(pl.bed.room.name)}` : '';
          return `<div class="box box-green">
            <div class="card-name">${esc(s?.firstName || '')} ${esc(s?.lastName || '')}</div>
            <div class="card-meta">${genderSymbol(s?.gender)} · ${esc(s?.nationality || '')}${room}</div>
            <div class="card-dates">${dates}</div>
          </div>`;
        }).join('')
    }
  `;

  // ── Garda vetting — a rare (every-3-years) action, so just a single button
  // tucked below Account; no section title/break. Links into the
  // fill → print → upload pipeline (routes/host-vetting.ts). A tiny nudge
  // shows only when a started form still needs its signed upload.
  const sectionVetting = `
    <div style="margin:18px 0 4px">
      <a class="btn btn-secondary" href="/host-portal/${esc(token)}/vetting">Complete Garda Vetting →</a>
      ${vettingStats.pending ? `<span class="muted" style="margin-left:10px;color:#92400e;font-weight:700">${vettingStats.pending} awaiting signed upload</span>` : ''}
    </div>
  `;

  // ── Section C: account / bills
  const totalOpen = bills.filter(b => b.xeroStatus !== 'paid').reduce((s, b) => s + Number(b.amount || 0), 0);
  const sectionC = `
    <h2 style="display:flex;align-items:baseline;justify-content:space-between;gap:12px;flex-wrap:wrap">
      <span>Account</span>
      <span style="font-size:14px;font-weight:700;color:#000000">Earnings ${fmtMoney(totalEarnings)}</span>
    </h2>
    <div class="box box-account">
      ${bills.length === 0
        ? `<div class="muted">No bills on file yet.</div>`
        : `<div style="font-size:13px;color:#666;margin-bottom:6px">
             ${bills.filter(b => b.xeroStatus !== 'paid').length} open bill(s) · total open ${fmtMoney(totalOpen)}
           </div>
           ${bills.map((b, i) => {
             // Dates | nights | bill ref (H-XXXX) — so the host can tie a line
             // here to the remittance Xero emails them. First 5 shown; the rest
             // hidden behind "View more" (reveals 5 at a time) — keeps a long
             // history from becoming a wall by December.
             const nights = (Number(b.weeksPaid || 0) * 7) + Number(b.daysPaid || 0);
             const ref = `H-${3500 + b.id}`;
             const period = `${fmtDate(b.periodFrom)} → ${fmtDate(b.periodTo)} | ${nights} night${nights === 1 ? '' : 's'} | ${ref}`;
             const statusCls = b.xeroStatus === 'paid' ? 'paid' : (b.xeroStatus === 'voided' ? 'void' : 'open');
             const statusLabel = b.xeroStatus === 'paid' ? 'PAID' : (b.xeroStatus === 'voided' ? 'VOID' : 'OPEN');
             return `<div class="bill bill-row${i >= 5 ? ' bill-hidden' : ''}"${i >= 5 ? ' style="display:none"' : ''}>
               <div>
                 <div><strong>${esc(b.studentName || (b.reason === 'amendment' ? (b.amendmentNote || 'Amendment') : 'Stay'))}</strong></div>
                 <div class="muted" style="font-size:11px">${period}</div>
               </div>
               <div style="text-align:right">
                 <div><strong>${fmtMoney(b.amount)}</strong></div>
                 <span class="bill-status ${statusCls}">${statusLabel}</span>
               </div>
             </div>`;
           }).join('')}
           ${bills.length > 5
             ? `<div style="text-align:center;margin-top:8px"><a href="#" id="billsMore" style="color:#3a6c00;font-weight:700;font-size:12px">View more (${bills.length - 5}) ▾</a></div>`
             : ''}`
      }
    </div>
  `;

  // First name only (privacy on a public page).
  const firstName = esc((provider.name || '').trim().split(/\s+/)[0] || 'there');
  return `
    <div class="topbar" style="display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap">
      <h1 style="margin:0">Welcome ${firstName}!</h1>
      <img src="https://ulearnschool.com/sites/default/files/images/logos/logo.png" alt="ULearn" style="height:44px;width:auto">
    </div>
    ${sectionA}
    ${sectionB}
    ${sectionC}
    ${sectionVetting}
    <p class="muted" style="margin-top:30px;text-align:center;font-size:11px">
      Bookmark this page — your link doesn't expire.<br>
      Questions: <a href="mailto:accomm@ulearnschool.com" style="color:#6FB42C">accomm@ulearnschool.com</a>
    </p>
    <script>${clientSideScript()}</script>
  `;
}

// Calendar-date key in LOCAL time. The placement dates are @db.Date (UTC
// midnight); toISOString() on a locally-built grid day shifts back a day in
// BST, which was landing a Mon-29 arrival on the Tue-30 cell. Keying both the
// arrivals and the grid cells with local Y-M-D fixes the offset.
function localIso(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function renderStudentCard(pl: any, hidden: boolean): string {
  const s = pl.booking?.student;
  const arrivalIso = localIso(new Date(pl.startDate));
  const nights = nightsBetween(pl.startDate, pl.endDate);
  const dietBits = [s?.diet, s?.allergies].filter(Boolean).join(' · ');
  return `<div class="card${hidden ? ' hidden extra' : ''}" data-arrival="${arrivalIso}">
    <div class="card-body">
      <div class="card-name">${esc(s?.firstName || '')} ${esc(lastInitial(s?.lastName || null))}</div>
      <div class="card-meta">
        ${esc(s?.nationality || '')}${s?.gender ? ' · ' + genderSymbol(s.gender) : ''}${ageFrom(s?.birthday) ? ' · age ' + ageFrom(s?.birthday) : ''}
        ${dietBits ? ' · <span class="pill">' + esc(dietBits) + '</span>' : ''}
      </div>
      <div class="card-dates"><strong>Arr ${fmtDate(pl.startDate)}</strong> · ${nights} nights (${esc(pl.board || 'board TBC')})</div>
    </div>
    <div>
      <button class="btn claim-btn" data-ba="${pl.id}" onclick="claimStudent(this)" title="Register your interest in hosting this student">Claim</button>
    </div>
  </div>`;
}

function renderCalendar(unplaced: any[]): string {
  // Build a 6-week grid starting from this week's Monday so arrivals always
  // land in a familiar Mon-Sun layout. Highlight days with arrivals; show a
  // small badge with the count.
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const dow = (today.getDay() + 6) % 7; // Mon=0
  const start = new Date(today); start.setDate(start.getDate() - dow);

  const arrivalsByDay = new Map<string, number>();
  for (const p of unplaced) {
    const k = localIso(new Date(p.startDate));
    arrivalsByDay.set(k, (arrivalsByDay.get(k) || 0) + 1);
  }

  const MON = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const todayIso = localIso(today);
  const end = new Date(start); end.setDate(start.getDate() + 41); // last cell (6w-1)
  // Month-year span of the visible window, e.g. "Jun – Aug 2026" (drop the year
  // on the first when both ends share it).
  const sameYear = start.getFullYear() === end.getFullYear();
  const rangeLabel = `${MON[start.getMonth()]}${sameYear ? '' : ' ' + start.getFullYear()} – ${MON[end.getMonth()]} ${end.getFullYear()}`;
  const cells: string[] = [];
  ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].forEach(d => cells.push(`<div class="head">${d}</div>`));
  for (let w = 0; w < 6; w++) {
    for (let d = 0; d < 7; d++) {
      const day = new Date(start); day.setDate(start.getDate() + (w * 7 + d));
      const iso = localIso(day);
      const count = arrivalsByDay.get(iso) || 0;
      const past = day < today;
      const cls = `${past ? 'empty' : (count > 0 ? 'has' : '')}${iso === todayIso ? ' today' : ''}`.trim();
      const badge = count > 0 ? `<span class="badge">${count}</span>` : '';
      // On the 1st of a month, show a small month tag so a window spanning two
      // months isn't ambiguous (the grid otherwise shows bare day numbers).
      const mtag = day.getDate() === 1 ? `<span class="mtag">${MON[day.getMonth()]}</span>` : '';
      cells.push(`<div class="${cls}" data-day="${iso}">${mtag}<span class="d">${day.getDate()}</span>${badge}</div>`);
    }
  }
  return `
    <div class="cal">
      <strong style="font-size:12px;color:#666">Browse Arrivals</strong>
      <span class="muted" style="margin-left:8px;font-size:11px;font-weight:700;color:#6FB42C">${rangeLabel}</span>
      <span class="muted" id="calNote" style="margin-left:8px;font-size:11px"></span>
      <div class="cal-grid">${cells.join('')}</div>
    </div>
  `;
}

function clientSideScript(): string {
  // Vanilla JS. Two interactions: "show more" reveals hidden cards, and
  // clicking a calendar day filters the card list to that day onward
  // (click an already-active day to clear). All data is in the DOM —
  // no fetch needed.
  return `
    (function(){
      var showMore = document.getElementById('showMore');
      if (showMore) showMore.addEventListener('click', function(e){
        e.preventDefault();
        document.querySelectorAll('.card.extra.hidden').forEach(function(c){ c.classList.remove('hidden'); });
        showMore.style.display = 'none';
        var vc = document.getElementById('visibleCount');
        if (vc) vc.textContent = document.querySelectorAll('#cardList .card').length;
      });

      var active = null;
      document.querySelectorAll('.cal-grid .has').forEach(function(cell){
        cell.addEventListener('click', function(){
          var iso = cell.getAttribute('data-day');
          if (active === iso) {
            // Click already-active day → clear filter
            cell.classList.remove('active');
            document.querySelectorAll('#cardList .card').forEach(function(c, i){
              c.classList.toggle('hidden', i >= 5 && c.classList.contains('extra'));
            });
            if (showMore) showMore.style.display = '';
            document.getElementById('calNote').textContent = '';
            active = null;
            return;
          }
          // Activate this day
          document.querySelectorAll('.cal-grid .active').forEach(function(c){ c.classList.remove('active'); });
          cell.classList.add('active');
          active = iso;
          var shown = 0;
          document.querySelectorAll('#cardList .card').forEach(function(c){
            var arr = c.getAttribute('data-arrival');
            var match = arr >= iso;
            c.classList.toggle('hidden', !match);
            if (match) shown++;
          });
          if (showMore) showMore.style.display = 'none';
          document.getElementById('calNote').textContent = shown + ' arrival(s) from ' + iso + ' onwards';
        });
      });

      // Claim = register an Expression of Interest. POSTs to <thispath>/claim.
      // On success the button locks to a confirmation; on conflict (someone
      // else got there first) we tell them and grey the card.
      // Account bills: reveal 5 more each click; hide the link when none left.
      var billsMore = document.getElementById('billsMore');
      if (billsMore) billsMore.addEventListener('click', function(e){
        e.preventDefault();
        var hidden = document.querySelectorAll('.bill-row.bill-hidden');
        for (var i = 0; i < 5 && i < hidden.length; i++) {
          hidden[i].style.display = '';
          hidden[i].classList.remove('bill-hidden');
        }
        var left = document.querySelectorAll('.bill-row.bill-hidden').length;
        if (left === 0) billsMore.style.display = 'none';
        else billsMore.textContent = 'View more (' + left + ') ▾';
      });

      window.claimStudent = function(btn){
        if (btn.disabled) return;
        if (!confirm('Are you sure you can host this student? Please do not select unless you are certain. We will be in touch to confirm.')) return;
        var ba = btn.getAttribute('data-ba');
        var orig = btn.textContent;
        btn.disabled = true; btn.textContent = '…';
        var url = location.pathname.replace(/\\/$/, '') + '/claim';
        fetch(url, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ bookingAccommodationId: Number(ba) }) })
          .then(function(r){ return r.json().then(function(j){ return { ok:r.ok, j:j }; }); })
          .then(function(res){
            if (res.ok) {
              btn.textContent = '✓ Interest sent';
              btn.style.background = '#6FB42C'; btn.style.color = '#fff'; btn.style.borderColor = '#6FB42C';
              var card = btn.closest('.card'); if (card) card.style.opacity = '0.6';
            } else {
              btn.textContent = orig; btn.disabled = false;
              alert((res.j && res.j.error) || 'Sorry, that could not be registered.');
              if (res.j && /no longer|another host/i.test(res.j.error||'')) {
                var card = btn.closest('.card'); if (card) { card.style.opacity = '0.5'; btn.disabled = true; btn.textContent = 'Taken'; }
              }
            }
          })
          .catch(function(){ btn.textContent = orig; btn.disabled = false; alert('Network error — please try again.'); });
      };

      window.firstDibs = function(btn){
        if (btn.disabled) return;
        var orig = btn.textContent;
        btn.disabled = true; btn.textContent = '…';
        var msg = document.getElementById('firstDibsMsg');
        var url = location.pathname.replace(/\\/$/, '') + '/first-dibs';
        fetch(url, { method:'POST', headers:{'Content-Type':'application/json'} })
          .then(function(r){ return r.json(); })
          .then(function(j){
            if (msg) msg.textContent = j.message || '';
            if (j.status === 'granted' || j.status === 'already') {
              btn.textContent = '✓ You\\'re on the list';
              btn.style.background = '#6FB42C';
              if (msg) msg.style.color = '#166534';
            } else {
              // gv-incomplete / full / error — let them try again (e.g. after finishing GV)
              btn.textContent = orig; btn.disabled = false;
              if (msg) msg.style.color = j.status === 'gv-incomplete' ? '#92400e' : '#666';
            }
          })
          .catch(function(){ btn.textContent = orig; btn.disabled = false; if (msg) msg.textContent = 'Network error — please try again.'; });
      };
    })();
  `;
}

// Admin-side router. Mounts the mint endpoint at
// /sis/api/host-portal/tokens. Staff (admin / accounts / accomm) only.
// Slice 5's outreach UI calls this to get the link before sending email.
export function hostPortalRoutes(prisma: PrismaClient) {
  const router = Router();

  // POST /sis/api/host-portal/tokens  body: { providerId: N }
  // Returns { token, url, createdAt, lastUsedAt }
  router.post('/tokens', async (req, res) => {
    try {
      const providerId = parseInt(String(req.body?.providerId ?? ''), 10);
      if (!Number.isFinite(providerId)) return res.status(400).json({ error: 'providerId required' });
      const provider = await prisma.accommodationProvider.findUnique({
        where: { id: providerId },
        select: { id: true, name: true, active: true },
      });
      if (!provider) return res.status(404).json({ error: 'Provider not found' });
      if (!provider.active) return res.status(400).json({ error: 'Provider is inactive — reactivate before issuing a portal link' });
      const t = await mintHostPortalToken(prisma, providerId);
      res.json({
        providerId,
        providerName: provider.name,
        token: t.token,
        url: `/host-portal/${t.token}`,
        createdAt: t.createdAt,
        lastUsedAt: t.lastUsedAt,
      });
    } catch (e: any) {
      res.status(500).json({ error: String(e?.message || e) });
    }
  });

  // GET /sis/api/host-portal/tokens?providerId=N
  // Read-only lookup — returns the token if one exists, else 404. Used by
  // the staff UI to display "this host has/hasn't been issued a link yet"
  // without mutating state.
  router.get('/tokens', async (req, res) => {
    try {
      const providerId = parseInt(String(req.query?.providerId ?? ''), 10);
      if (!Number.isFinite(providerId)) return res.status(400).json({ error: 'providerId query param required' });
      const t = await prisma.hostPortalToken.findUnique({
        where: { providerId },
        select: { token: true, createdAt: true, lastUsedAt: true },
      });
      if (!t) return res.status(404).json({ error: 'No token issued yet' });
      res.json({
        providerId,
        token: t.token,
        url: `/host-portal/${t.token}`,
        createdAt: t.createdAt,
        lastUsedAt: t.lastUsedAt,
      });
    } catch (e: any) {
      res.status(500).json({ error: String(e?.message || e) });
    }
  });

  // DELETE /sis/api/host-portal/tokens?providerId=N
  // Rotation — drops the existing token. Next call to /tokens will mint a
  // fresh one. Use sparingly (suspected compromise, departed host whose
  // link should stop working).
  router.delete('/tokens', async (req, res) => {
    try {
      const providerId = parseInt(String(req.query?.providerId ?? ''), 10);
      if (!Number.isFinite(providerId)) return res.status(400).json({ error: 'providerId query param required' });
      await prisma.hostPortalToken.deleteMany({ where: { providerId } });
      res.json({ providerId, revoked: true });
    } catch (e: any) {
      res.status(500).json({ error: String(e?.message || e) });
    }
  });

  return router;
}
