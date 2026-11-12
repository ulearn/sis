/**
 * STUDENT AMBASSADORS (Neil 2026-11-11: "if they give us a 5-star review, they get an ambassador code … and I want to invite them
 * into the portal as well so that they have a row record in the portal"). Same model as Amici di Dublino (AMICI): a referral
 * partner whose friends get 10% off course fees and who earns 10% on every booking made with the code.
 *
 *   promote(studentId, { by, notify }) — idempotent (notify: true = email on the FIRST promotion only, 'always' = resend); run when the 5★ Google review is verified (adminSetVerify) or the student
 *   submits the review link in the app (trust-based, like the Instagram follow):
 *     1. code = FIRSTNAME + SIS id, upper-case, no punctuation (KRYSTOF110) — unique because the id is
 *     2. Agency "<First Last> (Ambassador)", number AMB-<studentId>, category AMBASSADOR, primary entity = their HubSpot contact
 *     3. ReferralProgram via referralScripts.upsertProgram (10% / AMBASSADOR_FLAT 10% / PAYOUT) — also writes referral_* on the
 *        HubSpot contact, so the code works in autoQuote AND on the booking form (/sis/referral/validate)
 *     4. a partner-portal login (username = code in lower case) with a set-password link (resetToken, 14 days)
 *     5. ambassador terms accepted automatically: Agency.contractSignedAt stamped (no partner-agreement gate)
 *     6. email from success@ (first promotion only): the code, what it does, the portal + set-password link.
 *   The app's Challenges tab already shows the code on the Ambassador card. WhatsApp is sent from the hub side
 *   (hubapp scripts/challenges/ambassadorWa.js), which reads ambassadorApprovedAt.
 *   demote(studentId) — review unverified: the code stops working (program inactive), the agency + login stay.
 */
import type { PrismaClient } from '../generated/prisma/client';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { referralScripts } from './referral';
import { sendEmail } from './email';

const BASE = (process.env.SIS_BASE_URL || 'https://sis.ulearnschool.com').replace(/\/$/, '');
const FROM = 'success@ulearnschool.com';
const TERMS = { studentDiscountPct: 10, rewardModel: 'AMBASSADOR_FLAT', rewardFlatPct: 10, settlementMode: 'PAYOUT' };
const RESET_DAYS = 14;

export const ambassadorCodeFor = (firstName: string | null | undefined, studentId: number) =>
  String(firstName || 'STUDENT').normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12) + studentId;

export function ambassadorScripts(prisma: PrismaClient) {
  const ref = referralScripts(prisma);
  const esc = (s: any) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  async function promote(studentId: number, { by = 'system', notify = true }: { by?: string; notify?: boolean | 'always' } = {}) {
    const s: any = await prisma.student.findUnique({ where: { id: studentId },
      select: { id: true, firstName: true, lastName: true, email: true, hubspotContactId: true, ambassadorCode: true, ambassadorApprovedAt: true } as any });
    if (!s) throw new Error(`student ${studentId} not found`);
    const out: any = { studentId, errors: [] as string[] };
    const name = [s.firstName, s.lastName].filter(Boolean).join(' ').trim() || `Student ${studentId}`;
    const code = ambassadorCodeFor(s.firstName, studentId);
    out.code = code;

    // 1. the code on the student (the app's Ambassador card reads it)
    await prisma.student.update({ where: { id: studentId }, data: { googleReviewVerified: true, ambassadorCode: code, ambassadorApprovedAt: s.ambassadorApprovedAt || new Date() } as any });

    // 2. the agency row
    const number = `AMB-${studentId}`;
    let agency: any = await prisma.agency.findFirst({ where: { number } });
    if (!agency) {
      agency = await prisma.agency.create({ data: { name: `${name} (Ambassador)`, number, category: 'AMBASSADOR', email: s.email || null,
        contactPerson: name, primaryEntityType: 'contact', primaryEntityId: s.hubspotContactId || null, primaryContactId: s.hubspotContactId || null,
        note: `Student ambassador — SIS student ${studentId}. Created ${new Date().toISOString().slice(0, 10)} by ${by}.` } as any });
      out.agencyCreated = true;
    } else if (s.hubspotContactId && agency.primaryContactId !== s.hubspotContactId) {
      agency = await prisma.agency.update({ where: { id: agency.id }, data: { primaryEntityType: 'contact', primaryEntityId: s.hubspotContactId, primaryContactId: s.hubspotContactId } as any });
    }
    out.agencyId = agency.id;

    // 3. the referral programme (+ HubSpot referral_* on the contact)
    if (!s.hubspotContactId) out.errors.push('no HubSpot contact on the student — code not pushed to HubSpot / programme not created');
    else {
      try { const r = await ref.upsertProgram(agency.id, { code, label: `${name} (Ambassador)`, ...TERMS, active: true, ownStudentId: studentId } as any);
        out.program = r.program && r.program.code; if (r.errors && r.errors.length) out.errors.push(...r.errors.map((e: any) => `HubSpot ${e.target.kind}: ${e.error}`)); }
      catch (e: any) { out.errors.push('programme: ' + e.message); }
    }

    // 4. the portal login + set-password link
    let user: any = await prisma.sisUser.findFirst({ where: { agencyId: agency.id, userType: 'partner' } });
    const username = code.toLowerCase();
    if (!user) {
      if (await prisma.sisUser.findUnique({ where: { username } })) out.errors.push(`username ${username} already taken`);
      else {
        user = await prisma.sisUser.create({ data: { username, email: s.email ? String(s.email).toLowerCase() : null, passwordHash: await bcrypt.hash(crypto.randomBytes(24).toString('hex'), 10),
          displayName: name, role: 'partner', userType: 'partner', agencyId: agency.id, hubspotContactId: s.hubspotContactId || null,
          portalPermissions: JSON.stringify({ canSeeFinance: true, canSeeClasses: true, canSeeDocuments: true }), active: true } as any });
        out.userCreated = true;
      }
    }
    let setLink: string | null = null;
    if (user && (out.userCreated || notify === 'always')) {
      const token = crypto.randomBytes(32).toString('hex');
      await prisma.sisUser.update({ where: { id: user.id }, data: { resetToken: token, resetTokenExpires: new Date(Date.now() + RESET_DAYS * 864e5) } });
      setLink = `${BASE}/sis/reset?token=${token}&portal=partners`;
    }
    out.username = user && user.username;

    // 5. ambassador terms: accepted automatically (Neil 2026-11-11) — no partner-agreement gate
    if (!agency.contractSignedAt && user) {
      await prisma.agency.update({ where: { id: agency.id }, data: { contractSignedAt: new Date(), contractSignedById: user.id,
        note: `${agency.note || ''}\nAmbassador terms accepted automatically ${new Date().toISOString().slice(0, 10)} (no partner agreement needed).`.trim() } as any });
      out.termsAccepted = true;
    }

    // 6. the email — first promotion (new login) or when asked
    if (notify && s.email && setLink && (out.userCreated || notify === 'always')) {
      const first = esc(String(s.firstName || '').trim().split(/\s+/)[0] || 'there');
      const html = `<p>Hi ${first},</p>
<p>Thank you so much for your 5★ review! 🙏 As promised, you are now a <b><u>ULearn Ambassador</u></b>.</p>
<p style="margin:18px 0;padding:14px 18px;background:#f3f9ee;border-left:4px solid #318817;font-size:15px">Your Ambassador code: <b style="font-size:18px;letter-spacing:1px">${esc(code)}</b></p>
<p><b><u>How it works</u></b></p>
<ul>
<li>Your friends get <b>10% off</b> their course fees when they book with your code.</li>
<li>You earn <b>10%</b> on every booking made with it. Win-win!</li>
</ul>
<p><b><u>Your Ambassador portal</u></b></p>
<p>You have your own page in our partner portal, where you can see everyone who books with your code. Set your password here (the link works for ${RESET_DAYS} days):</p>
<p><a href="${setLink}" style="display:inline-block;padding:11px 22px;background:#318817;color:#fff;text-decoration:none;border-radius:6px;font-weight:bold">Set my password</a></p>
<p>Then log in at <a href="${BASE}/sis/partners/login">${BASE}/sis/partners/login</a> with the username <b>${esc(user.username)}</b>.</p>
<p>Share your code with friends who dream of studying English in Dublin!</p>
<p>Kind regards,</p>`;
      try {
        const subject = `You're a ULearn Ambassador 🎉 Your code: ${code}`;
        const r = await sendEmail({ from: FROM, fromName: 'ULearn Team', to: s.email, subject, html });
        await (prisma as any).emailLog.create({ data: { studentId, fromEmail: FROM, toEmail: s.email, subject, bodyHtml: html, gmailMessageId: r.messageId, gmailThreadId: r.threadId, sentBy: `ambassador:${by}` } });
        out.emailed = s.email;
      } catch (e: any) { out.errors.push('email: ' + e.message); }
    }
    console.log(`[ambassador] student ${studentId} → ${code} agency ${agency.id}${out.errors.length ? ' errors: ' + out.errors.join(' | ') : ''}`);
    return out;
  }

  async function demote(studentId: number) {
    const agency: any = await prisma.agency.findFirst({ where: { number: `AMB-${studentId}` } });
    if (!agency) return { ok: true, noop: true };
    const prog: any = await prisma.referralProgram.findUnique({ where: { agencyId: agency.id } });
    if (prog && prog.active) await ref.upsertProgram(agency.id, { code: prog.code, label: prog.label, ...TERMS, active: false, ownStudentId: studentId } as any).catch((e: any) => console.error('[ambassador] demote', e.message));
    return { ok: true };
  }

  return { promote, demote };
}
