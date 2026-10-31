/**
 * Host outreach nudge — shared send logic, used by BOTH:
 *   · the weekly cron (.claude/cron/host-outreach.js, slug 'host-outreach-weekly')
 *   · the manual "Nudge Hosts" button on the Matching screen (slug 'host-outreach-nudge-2')
 *
 * Gate = the exact unmatched Host-Family pool the host portal renders (§A). Emails
 * every matching-enabled HF provider that has an email + a portal magic-link, from
 * accomm@. Per-template idempotent: a host already sent THIS template in the last
 * 6 days is skipped (guards against an accidental double-click). Nudge #1 and #2
 * are SEPARATE templates, so the manual Nudge #2 deliberately re-nudges everyone —
 * including hosts who got Monday's Nudge #1 — because there are new last-minute
 * bookings for them to see.
 */
import type { PrismaClient } from '../generated/prisma/client';
import { sendEmail } from './email';
import { emailTemplateWhere } from './email-templates';

const FROM = 'accomm@ulearnschool.com';
const FROM_NAME = 'ULearn Accommodation';
const BASE_URL = (process.env.BASE_URL || 'https://sis.ulearnschool.com').replace(/\/$/, '');

const resolve = (str: string, ctx: { contactName: string; hostName: string; link: string }) =>
  (str || '')
    .replace(/\{\{accommodation\.contact_name\}\}/g, ctx.contactName)
    .replace(/\{\{accommodation\.host_name\}\}/g, ctx.hostName)
    .replace(/\{\{accommodation\.portal_link\}\}/g, ctx.link);

export interface HostOutreachResult {
  pool: number;
  sent: number;
  skippedWeek: number;
  skippedNoLink: number;
  failed: number;
  templateName: string;
  dryRun: boolean;
}

export async function runHostOutreach(
  prisma: PrismaClient,
  opts: { templateSlug: string; apply: boolean; sentBy?: string; log?: (m: string) => void },
): Promise<HostOutreachResult> {
  const log = opts.log || (() => {});
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 1) Pool gate — identical to the host portal §A. Host Family only, unmatched,
  //    active, CONFIRMED or PARTIAL (deposit paid), visa-clear, arriving today onwards (no upper horizon).
  const poolWhere: any = {
    active: true, bedId: null, claimedByProviderId: null, accommodationType: 'Host Family',
    startDate: { gte: today },
    booking: {
      status: { in: ['CONFIRMED', 'PARTIAL'] },   // + part-paid, same as the host portal (Neil 2026-10-30)
      student: { is: { OR: [{ visaStatus: null }, { visaStatus: { notIn: ['Pending', 'Appeal'] } }] } },
    },
  };
  const pool = await prisma.bookingAccommodation.count({ where: poolWhere });
  log(`${pool} unmatched Host-Family student(s) in the pool.`);

  const tpl = await prisma.documentTemplate.findFirst({ where: emailTemplateWhere(opts.templateSlug) });
  if (!tpl || tpl.templateType !== 'email') {
    throw new Error(`template "${opts.templateSlug}" (email) not found`);
  }

  // Live gate: an empty pool sends nothing (a dry run still surveys recipients).
  if (pool === 0 && opts.apply) {
    return { pool, sent: 0, skippedWeek: 0, skippedNoLink: 0, failed: 0, templateName: tpl.name, dryRun: false };
  }

  const hosts = await prisma.accommodationProvider.findMany({
    where: { active: true, type: 'Host Family', portalMatchingEnabled: true, email: { not: null } },
    include: { portalToken: true },
    orderBy: { name: 'asc' },
  });

  const since = new Date(today);
  since.setDate(since.getDate() - 6);

  let sent = 0, skippedWeek = 0, skippedNoLink = 0, failed = 0;
  for (const h of hosts) {
    if (!h.portalToken?.token) { skippedNoLink++; continue; }
    // Per-template 6-day idempotency — guards only against re-sending THIS same
    // template (e.g. an accidental double-click). It deliberately does NOT skip
    // hosts who got the OTHER nudge: the manual Nudge #2 re-nudges everyone (new
    // last-minute bookings), even hosts who already got Monday's Nudge #1.
    const already = await prisma.emailLog.count({ where: { providerId: h.id, templateId: tpl.id, createdAt: { gte: since } } });
    if (already) { skippedWeek++; continue; }

    const ctx = {
      contactName: [h.contactFirstName, h.contactLastName].filter(Boolean).join(' ') || h.name || 'there',
      hostName: h.name || '',
      link: `${BASE_URL}/host-portal/${h.portalToken.token}`,
    };
    const html = resolve(tpl.htmlTemplate, ctx);
    const subject = resolve(tpl.subject || 'We have students looking for a host', ctx);

    if (!opts.apply) { sent++; continue; }

    try {
      const res = await sendEmail({ from: FROM, fromName: FROM_NAME, to: h.email!, subject, html });
      await prisma.emailLog.create({
        data: {
          providerId: h.id, fromEmail: FROM, toEmail: h.email!, subject, bodyHtml: html,
          templateId: tpl.id, gmailMessageId: res.messageId, gmailThreadId: res.threadId,
          sentBy: opts.sentBy || 'host-outreach',
        },
      });
      sent++;
      log(`✓ ${h.email} (${h.name})`);
    } catch (e: any) {
      failed++;
      log(`✗ ${h.email} (${h.name}): ${e?.message || e}`);
    }
  }

  return { pool, sent, skippedWeek, skippedNoLink, failed, templateName: tpl.name, dryRun: !opts.apply };
}
