/**
 * KickStart Challenger nudge — timed reminder drip (Neil, 2026-10-09).
 *
 * Nudges IN-SCHOOL KickStart challengers every Mon/Wed/Fri until they've done the
 * THREE tasks that matter — (1) followed us on social, (2) posted their progress
 * videos, (3) left a review — then STOPS for that student. Attendance / social-event
 * are NOT part of the stop-gate. Replies are IGNORED (this is not a conversation).
 *
 * Reuses the AutoNudge-Cascade pattern (src/scripts/auto-nudge.ts): fixed waves in a
 * JSON config with editable times + a MASTER `armed` switch (default FALSE = dry-run,
 * computes what it WOULD send but sends nothing), DB email templates, EmailLog as both
 * the audit trail AND the idempotency/step source, per-student AUTO-STOP.
 *
 * Escalation: the email variant is chosen by how many nudges the student has already
 * had (EmailLog count) — 0→Kickoff, 1→Get-moving, 2+→Reminder. No step table needed.
 *
 * SUPPRESSION: config `suppress` = student IDs to exclude entirely (e.g. someone who
 * objected). Clawback/"take the money back" is NOT wired here (October: nudge only).
 */
import type { PrismaClient } from '../generated/prisma/client';
import { sendEmail } from './email';
import { emailTemplateWhere } from './email-templates';
import { studentScripts } from './student';
import fs from 'fs';
import path from 'path';

const CONFIG_PATH = path.join(__dirname, '..', '..', 'data', 'challenger-nudge.json');
const DAY_NUM: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
const FROM = 'success@ulearnschool.com';
const FROM_NAME = 'ULearn Team';
const BASE_URL = (process.env.BASE_URL || 'https://sis.ulearnschool.com').replace(/\/$/, '');
const APP_LINK = `${BASE_URL}/sis/student`;
const CHALLENGE = 'KickStart';
// Escalation ladder — index by prior-send count (clamped to the last).
const LADDER = ['challenger-nudge-1', 'challenger-nudge-2', 'challenger-nudge-3'];
// Idempotency: never send two nudges within this window (so M/W/F = one per day).
const DEDUP_HOURS = 20;

export interface NudgeWave {
  id: string;
  day: string;   // "Mon" | "Wed" | "Fri"
  time: string;  // "HH:MM"
  enabled: boolean;
  lastFired?: string;   // "YYYY-MM-DD"
}

const DEFAULT_WAVES: NudgeWave[] = [
  { id: 'mon', day: 'Mon', time: '10:00', enabled: true },
  { id: 'wed', day: 'Wed', time: '10:00', enabled: true },
  { id: 'fri', day: 'Fri', time: '10:00', enabled: true },
];

const resolveTpl = (str: string, ctx: { firstName: string; appLink: string }) =>
  (str || '')
    .replace(/\{\{\s*student\.first_name\s*\}\}/g, ctx.firstName)
    .replace(/\{\{\s*app_link\s*\}\}/g, ctx.appLink);

export function challengerNudgeScripts(prisma: PrismaClient) {
  const students = studentScripts(prisma);

  function loadConfig(): { waves: NudgeWave[]; armed: boolean; suppress: number[] } {
    let saved: any = {};
    try { saved = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8')) || {}; } catch { /* seed */ }
    const savedWaves = new Map<string, any>((saved.waves || []).map((w: any) => [w.id, w]));
    const waves = DEFAULT_WAVES.map(d => ({ ...d, ...pick(savedWaves.get(d.id), ['time', 'enabled', 'lastFired']) }));
    const suppress = Array.isArray(saved.suppress) ? saved.suppress.map((n: any) => Number(n)).filter(Number.isInteger) : [];
    return { waves, armed: !!saved.armed, suppress };
  }

  function saveConfig(cfg: { waves: NudgeWave[]; armed: boolean; suppress: number[] }) {
    fs.mkdirSync(path.dirname(CONFIG_PATH), { recursive: true });
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(cfg, null, 2));
  }

  function setArmed(armed: boolean) { const c = loadConfig(); c.armed = !!armed; saveConfig(c); return c.armed; }
  function updateWave(id: string, patch: { time?: string; enabled?: boolean }) {
    const c = loadConfig(); const w = c.waves.find(x => x.id === id);
    if (!w) throw new Error(`wave ${id} not found`);
    if (patch.time !== undefined && /^\d{2}:\d{2}$/.test(patch.time)) w.time = patch.time;
    if (patch.enabled !== undefined) w.enabled = !!patch.enabled;
    saveConfig(c); return w;
  }
  function setSuppress(ids: number[]) {
    const c = loadConfig(); c.suppress = (ids || []).map(Number).filter(Number.isInteger); saveConfig(c); return c.suppress;
  }

  // In-school KickStart cohort — one row per student (most-recent committed booking).
  async function cohort() {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const bookings = await prisma.booking.findMany({
      where: {
        hubspotChallenge: CHALLENGE,
        serviceStart: { lte: today },
        serviceEnd: { gte: today },
        OR: [{ status: null }, { status: { notIn: ['CANCELLED', 'PENDING'] } }],
      },
      select: { studentId: true },
      orderBy: { id: 'desc' },
    });
    const ids = [...new Set(bookings.map(b => b.studentId).filter((x): x is number => x != null))];
    return ids;
  }

  // The three-task stop-gate, read from the SAME challenges() the admin report uses.
  // Returns { eligible } = at least one of social/content/review NOT yet done.
  async function needsNudge(studentId: number): Promise<boolean> {
    const ch: any = await students.challenges(studentId);
    const items: any[] = ch?.items || [];
    if (!items.length) return false;   // no active challenge period → don't nudge
    const done = (key: string) => !!(items.find(i => i.key === key) || {}).done;
    const social = done('social'), content = done('content'), review = done('review');
    return !(social && content && review);
  }

  async function sentCount(studentId: number, sinceHours?: number) {
    const where: any = { studentId, templateId: { in: LADDER.map(s => TPL_ID(s)) } };
    if (sinceHours) { const since = new Date(Date.now() - sinceHours * 3600_000); where.createdAt = { gte: since }; }
    return prisma.emailLog.count({ where });
  }
  const TPL_ID = (slug: string) => {
    // emailTemplateWhere gives the id; but we need the literal id for the count filter.
    // The registry is the source — fall back to a slug lookup at send time.
    const m: Record<string, number> = { 'challenger-nudge-1': 113, 'challenger-nudge-2': 114, 'challenger-nudge-3': 115 };
    return m[slug];
  };

  /** Fire ONE nudge run. apply=false → dry-run (counts, no send). Auto-stops per
   *  student (skips anyone who has finished the 3 tasks or was nudged <20h ago). */
  async function sendWave(wave: NudgeWave, apply: boolean) {
    const cfg = loadConfig();
    const suppress = new Set(cfg.suppress);
    const ids = (await cohort()).filter(id => !suppress.has(id));
    // Resolve the 3 ladder templates up-front.
    const tpls: Record<string, any> = {};
    for (const slug of LADDER) {
      const t = await prisma.documentTemplate.findFirst({ where: emailTemplateWhere(slug, { templateType: 'email' }) });
      if (!t) throw new Error(`template "${slug}" (email) not found`);
      tpls[slug] = t;
    }

    let eligible = 0, sent = 0, done = 0, dedup = 0, noEmail = 0, failed = 0;
    for (const studentId of ids) {
      if (!(await needsNudge(studentId))) { done++; continue; }
      eligible++;
      if (await sentCount(studentId, DEDUP_HOURS) > 0) { dedup++; continue; }
      const s = await prisma.student.findUnique({ where: { id: studentId }, select: { firstName: true, email: true } });
      if (!s?.email) { noEmail++; continue; }
      const step = Math.min(await sentCount(studentId), LADDER.length - 1);
      const slug = LADDER[step];
      const tpl = tpls[slug];
      const ctx = { firstName: s.firstName || 'there', appLink: APP_LINK };
      const html = resolveTpl(tpl.htmlTemplate, ctx);
      const subject = resolveTpl(tpl.subject || 'Your KickStart Challenge', ctx);
      if (!apply) { sent++; continue; }
      try {
        const res = await sendEmail({ from: FROM, fromName: FROM_NAME, to: s.email, subject, html });
        await prisma.emailLog.create({
          data: {
            studentId, fromEmail: FROM, toEmail: s.email, subject, bodyHtml: html,
            templateId: tpl.id, gmailMessageId: res.messageId, gmailThreadId: res.threadId,
            sentBy: `challenger-nudge:${wave.id}`,
          },
        });
        sent++;
      } catch { failed++; }
    }
    return { cohort: ids.length, eligible, done, sent, dedup, noEmail, failed, dryRun: !apply };
  }

  /** Live status for a UI / dry-run preview. */
  async function getStatus() {
    const cfg = loadConfig();
    const ids = await cohort();
    const suppress = new Set(cfg.suppress);
    let eligible = 0;
    for (const id of ids) if (!suppress.has(id) && await needsNudge(id)) eligible++;
    return { armed: cfg.armed, waves: cfg.waves, suppress: cfg.suppress, cohort: ids.length, eligibleNow: eligible };
  }

  /** Cron entry: fire each enabled wave whose day+time is due and hasn't fired today. */
  async function runDueWaves(now = new Date()) {
    const cfg = loadConfig();
    const dow = now.getDay();
    const hhmm = now.toTimeString().slice(0, 5);
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const fired: any[] = [];
    for (const w of cfg.waves) {
      if (!w.enabled || DAY_NUM[w.day] !== dow || hhmm < w.time || w.lastFired === dateStr) continue;
      const res = await sendWave(w, cfg.armed);
      w.lastFired = dateStr;
      fired.push({ id: w.id, ...res });
    }
    if (fired.length) saveConfig(cfg);
    return { armed: cfg.armed, checkedAt: `${dateStr} ${hhmm}`, fired };
  }

  return { getStatus, loadConfig, setArmed, updateWave, setSuppress, cohort, sendWave, runDueWaves };
}

function pick(obj: any, keys: string[]) {
  const o: any = {};
  if (obj) for (const k of keys) if (obj[k] !== undefined) o[k] = obj[k];
  return o;
}
