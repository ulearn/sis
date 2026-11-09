// First Dibs — the ONE grant, shared by the host portal button (routes/host-portal.ts) and the hubapp accomm desk
// (a host emailing accomm@ to ask; hubapp scripts/accomm/processors.js runs this over SSH from dist/lib/first-dibs).
// Gates: matching on · GV completed (else a "finish vetting" nudge, no grant, no slot used) · cap of 5 concurrent
// holders. Single-use (auto-nudge clears it once the First Dibs wave emails them) + placement clearing
// (scripts/accommodation.ts) stop it becoming a permanent bump.
import { PrismaClient } from '../generated/prisma/client';
import { postSlackMessage, kellyMention } from './slack';

export const FIRST_DIBS_CAP = 5;

export type FirstDibsStatus = 'granted' | 'already' | 'gv-incomplete' | 'full' | 'matching-off' | 'not-found';
export interface FirstDibsResult { status: FirstDibsStatus; message: string; strikes?: number; }

// GV "completed" = phase 3 (mirrors auto-nudge.hostPhase): manual vettingStatus
// wins; else derived from submissions (submitted→form, signed→upload, else complete).
export function firstDibsGvComplete(vettingStatus: string | null | undefined, subs: { status: string }[]): boolean {
  const PHASE: Record<string, number> = { none: 0, form: 1, upload: 2, complete: 3, returned: 3 };
  if (vettingStatus != null) return (PHASE[vettingStatus] ?? 0) === 3;
  if (!subs || !subs.length) return false;
  if (subs.some(s => s.status === 'submitted')) return false;
  if (subs.some(s => s.status === 'signed')) return false;
  return true;
}

/** Try to give a host First Dibs. `source` only changes the Slack wording ('portal' = they tapped the button). */
export async function grantFirstDibs(prisma: PrismaClient, providerId: number, source: 'portal' | 'accomm-desk' = 'portal'): Promise<FirstDibsResult> {
  const p = await prisma.accommodationProvider.findUnique({
    where: { id: providerId },
    select: { name: true, firstDibsAt: true, vettingStatus: true, portalMatchingEnabled: true },
  });
  if (!p) return { status: 'not-found', message: 'Host not found.' };
  if (p.portalMatchingEnabled === false) {
    return { status: 'matching-off', message: 'Your account isn\'t set up for student matching right now. Please contact accomm@ulearnschool.com.' };
  }
  if (p.firstDibsAt) {
    return { status: 'already', message: 'You\'re already top of the queue — First Dibs on the next students we get. No need to click again.' };
  }
  // GV gate — non-completed hosts get a nudge, not a grant (turns the First
  // Dibs itch into a vetting-completion prompt), and it does NOT consume a slot.
  const subs = await prisma.hostVettingSubmission.findMany({ where: { providerId }, select: { status: true } });
  if (!firstDibsGvComplete(p.vettingStatus, subs)) {
    return { status: 'gv-incomplete', message: 'Almost! Your Garda vetting isn\'t complete yet — finish it and you can grab First Dibs. Tap "Complete Garda Vetting" below to do the next step.' };
  }
  // Cap — count current flag-holders.
  const held = await prisma.accommodationProvider.count({ where: { firstDibsAt: { not: null } } });
  if (held >= FIRST_DIBS_CAP) {
    return { status: 'full', message: 'First Dibs is full for this round — but you\'ll still be in the running. We\'ll be in touch as students come up.' };
  }
  // Set ONLY the flag — their activity level (SuperHost/BusyBee/…) is left as-is.
  const granted = await prisma.accommodationProvider.update({
    where: { id: providerId },
    data: { firstDibsAt: new Date(), firstDibsStrikes: { increment: 1 } },
    select: { firstDibsStrikes: true },
  });
  const slackChannel = process.env.SLACK_ACCOMM_CHANNEL || process.env.SLACK_DEFAULT_CHANNEL || undefined;
  const how = source === 'portal' ? 'tapped *First Dibs*' : 'was given *First Dibs* by email (accomm desk)';
  // 3-strikes safety valve: a host who keeps raising their hand but never converts
  // (distance / suitability / accept-flags) gets escalated to Kelly instead of just
  // silently re-queuing forever.
  const slackText = granted.firstDibsStrikes >= 3
    ? `⚠️ *${p.name}* ${how} ${granted.firstDibsStrikes}× without ever being placed — worth a look (distance / suitability / accept-flags?). ${kellyMention()}`
    : `⭐ *${p.name}* ${how} — front of next week's outreach.`;
  await postSlackMessage({ channel: slackChannel, text: slackText }).catch(() => {});
  return { status: 'granted', message: '✓ You\'re top of the queue! The next time we have students you\'ll be first to hear — if we have any, your email goes out at 8am Monday.', strikes: granted.firstDibsStrikes };
}
