/**
 * AutoNudge "Cascade" — timed, tiered host outreach.
 *
 * Release the host nudge in WAVES that cascade down the quality tiers until
 * unplaced students are claimed. Each wave is gated by (a) GV phase, (b) host
 * Level (hostCategory), (c) optional PreMatch on Attributes (age/gender vs the
 * live unplaced pool). Batch 4 = catch-all sweep of no-attribute-data hosts.
 *
 * AUTO-STOP (the whole point): every wave re-checks the live unplaced pool
 * before it runs AND before every individual send — the instant a student is
 * placed, the rest is cancelled. Email is passive, so blasting everyone lets
 * the always-on hosts monopolise claims; the cascade spreads it around.
 *
 * MASTER SWITCH: `armed` (config-level, default FALSE). While disarmed the cron
 * computes what it WOULD send (dry-run) but sends nothing. Flip it on in the UI.
 *
 * Owns the wave CONFIG (data/auto-nudge.json — editable times/enabled/armed) and
 * the SENDER (reuses the host-outreach send + per-template 6-day idempotency).
 */
import type { PrismaClient } from '../generated/prisma/client';
import { sendEmail } from './email';
import { emailTemplateWhere } from './email-templates';
import { ageAt, gvPhase, isJuniorAt } from '../lib/junior-gate';
import fs from 'fs';
import path from 'path';

const CONFIG_PATH = path.join(__dirname, '..', '..', 'data', 'auto-nudge.json');
const GV_KEY = ['none', 'form', 'upload', 'complete'] as const;   // phase 0..3
const DAY_NUM: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
const FROM = 'accomm@ulearnschool.com';
const FROM_NAME = 'ULearn Accommodation';
const BASE_URL = (process.env.BASE_URL || 'https://sis.ulearnschool.com').replace(/\/$/, '');
const TPL_SLUG = { standard: 'host-cascade-standard', 'gv-reminder': 'host-cascade-gv-reminder' } as const;

export interface Wave {
  id: string;
  batch: number;
  batchName: string;
  wave: number;
  gv: string[];
  level: string[];
  firstDibs?: boolean;     // select by the First Dibs flag (firstDibsAt), not by activity level
  preMatch: boolean;
  includeUnset: boolean;
  onlyUnset: boolean;
  template: 'standard' | 'gv-reminder';
  day: string;             // "Mon" | "Tue" | "Wed" …
  time: string;            // "HH:MM"
  enabled: boolean;
  note?: string;
  lastFired?: string;      // "YYYY-MM-DD" — set by the cron to avoid re-firing same day
}

const DEFAULT_WAVES: Wave[] = [
  // Batch 1 — GV Complete, ascending activity Level. Standard template.
  { id: 'b1w1', batch: 1, batchName: 'GV Completed', wave: 1, gv: ['complete'], level: [], firstDibs: true, preMatch: true, includeUnset: false, onlyUnset: false, template: 'standard', day: 'Mon', time: '08:00', enabled: true, note: 'First Dibs — flagged hosts (missed out last cycle, self-serve/manual), front of the queue' },
  { id: 'b1w2', batch: 1, batchName: 'GV Completed', wave: 2, gv: ['complete'], level: ['Sleeper'], preMatch: true, includeUnset: false, onlyUnset: false, template: 'standard', day: 'Mon', time: '12:00', enabled: true, note: 'Dormant — re-engage' },
  { id: 'b1w3', batch: 1, batchName: 'GV Completed', wave: 3, gv: ['complete'], level: ['Regular'], preMatch: true, includeUnset: false, onlyUnset: false, template: 'standard', day: 'Mon', time: '15:00', enabled: true, note: '' },
  { id: 'b1w4', batch: 1, batchName: 'GV Completed', wave: 4, gv: ['complete'], level: ['BusyBee', 'SuperHost'], preMatch: true, includeUnset: false, onlyUnset: false, template: 'standard', day: 'Mon', time: '18:00', enabled: true, note: 'Most active — reliable' },
  // Batch 2 — GV In-Progress, any Level, split by STAGE.
  { id: 'b2w1', batch: 2, batchName: 'GV In-Progress', wave: 1, gv: ['form'], level: [], preMatch: true, includeUnset: false, onlyUnset: false, template: 'gv-reminder', day: 'Tue', time: '08:00', enabled: true, note: 'Form done, not uploaded — nudge to upload signed form' },
  { id: 'b2w2', batch: 2, batchName: 'GV In-Progress', wave: 2, gv: ['upload'], level: [], preMatch: true, includeUnset: false, onlyUnset: false, template: 'standard', day: 'Tue', time: '12:00', enabled: true, note: 'Uploaded w/ signature — ball in our court, no GV nag' },
  // Batch 3 — No GV.
  { id: 'b3w1', batch: 3, batchName: 'No GV', wave: 1, gv: ['none'], level: [], preMatch: true, includeUnset: false, onlyUnset: false, template: 'gv-reminder', day: 'Tue', time: '15:00', enabled: true, note: 'Not vetted' },
  // Batch 4 — CATCH-ALL: hosts with NO attribute data.
  { id: 'b4w1', batch: 4, batchName: 'Catch-all (no attribute data)', wave: 1, gv: ['complete', 'upload'], level: [], preMatch: false, includeUnset: false, onlyUnset: true, template: 'standard', day: 'Wed', time: '08:00', enabled: true, note: 'Vetting done on their end — attributes unknown' },
  { id: 'b4w2', batch: 4, batchName: 'Catch-all (no attribute data)', wave: 2, gv: ['none', 'form'], level: [], preMatch: false, includeUnset: false, onlyUnset: true, template: 'gv-reminder', day: 'Wed', time: '12:00', enabled: true, note: 'Vetting not done — attributes unknown' },
];

const resolveTpl = (str: string, ctx: { contactName: string; hostName: string; link: string }) =>
  (str || '')
    .replace(/\{\{accommodation\.contact_name\}\}/g, ctx.contactName)
    .replace(/\{\{accommodation\.host_name\}\}/g, ctx.hostName)
    .replace(/\{\{accommodation\.portal_link\}\}/g, ctx.link);

export function autoNudgeScripts(prisma: PrismaClient) {

  function loadConfig(): { waves: Wave[]; armed: boolean; lastSentAt: string | null } {
    let saved: any = {};
    try { saved = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8')) || {}; } catch { /* seed */ }
    const savedWaves = new Map<string, any>((saved.waves || []).map((w: any) => [w.id, w]));
    // Fixed design from DEFAULT_WAVES; overlay only editable/state fields.
    const waves = DEFAULT_WAVES.map(d => ({ ...d, ...pick(savedWaves.get(d.id), ['time', 'enabled', 'lastFired']) }));
    return { waves, armed: !!saved.armed, lastSentAt: saved.lastSentAt || null };
  }

  function saveConfig(cfg: { waves: Wave[]; armed: boolean; lastSentAt?: string | null }) {
    fs.mkdirSync(path.dirname(CONFIG_PATH), { recursive: true });
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(cfg, null, 2));
  }

  function updateWave(id: string, patch: { time?: string; enabled?: boolean }) {
    const cfg = loadConfig();
    const w = cfg.waves.find(x => x.id === id);
    if (!w) throw new Error(`wave ${id} not found`);
    if (patch.time !== undefined && /^\d{2}:\d{2}$/.test(patch.time)) w.time = patch.time;
    if (patch.enabled !== undefined) w.enabled = !!patch.enabled;
    saveConfig(cfg);
    return w;
  }

  function setArmed(armed: boolean) {
    const cfg = loadConfig();
    cfg.armed = !!armed;
    saveConfig(cfg);
    return cfg.armed;
  }

  // ── Host / pool helpers ────────────────────────────────────────────────
  const hostPhase = (p: any): number => gvPhase(p.vettingStatus, p.vettingSubmissions);
  const hostHasNoAttrs = (p: any) => !p.acceptsJuniors && !p.acceptsAdults && !p.acceptsMature && !p.acceptsMale && !p.acceptsFemale;
  function hostMatchesPool(p: any, pool: any) {
    const ageOk = (p.acceptsJuniors && pool.juniors) || (p.acceptsAdults && pool.adults) || (p.acceptsMature && pool.mature);
    const genderOk = (p.acceptsMale && pool.male) || (p.acceptsFemale && pool.female);
    return ageOk && genderOk;
  }

  // Same gate as host-outreach §A: unmatched Host-Family, active, CONFIRMED,
  // visa-clear, arriving today onwards.
  const poolWhere = () => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    return {
      active: true, bedId: null, claimedByProviderId: null, accommodationType: 'Host Family',
      startDate: { gte: today },
      booking: { status: { in: ['CONFIRMED', 'PARTIAL'] }, student: { is: { OR: [{ visaStatus: null }, { visaStatus: { notIn: ['Pending', 'Appeal'] } }] } } },   // + part-paid (Neil 2026-10-30)
    } as any;
  };
  const poolCount = () => prisma.bookingAccommodation.count({ where: poolWhere() });

  // Pool profile (age bands are AT ARRIVAL). `adult` = the same profile over only the
  // students who are 18+ on arrival — the junior gate matches non-vetted hosts
  // against it, so they are never nudged for a junior-only pool.
  async function unplacedProfiles() {
    const rows = await prisma.bookingAccommodation.findMany({
      where: poolWhere(),
      select: { startDate: true, booking: { select: { student: { select: { birthday: true, gender: true } } } } },
    });
    const blank = () => ({ count: 0, juniors: false, adults: false, mature: false, male: false, female: false });
    const all = blank(), adult = blank();
    for (const r of rows) {
      const st = r.booking?.student; if (!st) continue;
      const junior = isJuniorAt(st.birthday, r.startDate);
      const mature = !junior && (ageAt(st.birthday, r.startDate) ?? 0) >= 30;
      for (const prof of junior ? [all] : [all, adult]) {
        prof.count++;
        if (junior) prof.juniors = true; else if (mature) prof.mature = true; else prof.adults = true;
        if (st.gender === 1) prof.male = true; else if (st.gender === 2) prof.female = true; else { prof.male = true; prof.female = true; }
      }
    }
    return { ...all, adult };
  }
  // Junior gate: only GV-complete hosts are matched against juniors.
  const poolFor = (h: any, pool: any) => hostPhase(h) === 3 ? pool : pool.adult;

  function fetchSendableHosts() {
    return prisma.accommodationProvider.findMany({
      where: { type: 'Host Family', active: true, portalMatchingEnabled: true, email: { not: null } },
      select: {
        id: true, name: true, email: true, contactFirstName: true, contactLastName: true,
        hostCategory: true, firstDibsAt: true, vettingStatus: true,
        acceptsJuniors: true, acceptsAdults: true, acceptsMature: true, acceptsMale: true, acceptsFemale: true,
        vettingSubmissions: { select: { status: true } },
        portalToken: { select: { token: true } },
      },
    });
  }

  const inTier = (w: Wave, hosts: any[]) => {
    const phases = new Set(w.gv.map(k => GV_KEY.indexOf(k as any)));
    return hosts.filter(h => {
      if (!phases.has(hostPhase(h))) return false;
      // First Dibs is now a standalone flag (firstDibsAt), independent of activity level.
      if (w.firstDibs) return h.firstDibsAt != null;
      return w.level.length === 0 || w.level.includes(h.hostCategory || 'Sleeper');
    });
  };
  const applyMatch = (w: Wave, tier: any[], pool: any) => {
    const live = tier.filter(h => poolFor(h, pool).count > 0);   // nothing they may host → no nudge
    if (w.onlyUnset) return live.filter(hostHasNoAttrs);
    if (!w.preMatch) return live;
    return live.filter(h => hostMatchesPool(h, poolFor(h, pool)) || (w.includeUnset && hostHasNoAttrs(h)));
  };

  /** Live wave list with host counts — for the UI. */
  async function getWaves() {
    const cfg = loadConfig();
    const hosts = (await fetchSendableHosts()).filter(h => h.portalToken?.token);
    const pool = await unplacedProfiles();
    const waves = cfg.waves.map(w => {
      const tier = inTier(w, hosts);
      return { ...w, rawCount: tier.length, matchedCount: applyMatch(w, tier, pool).length };
    });
    return { waves, pool, sendableHosts: hosts.length, armed: cfg.armed };
  }

  /** Fire ONE wave. apply=false → dry-run (counts, no email). Auto-stops if pool
   *  empties. opts.ignoreIdem (manual "desperation" send) bypasses the 6-day
   *  per-template idempotency so it actually re-sends. */
  async function sendWave(wave: Wave, apply: boolean, opts: { ignoreIdem?: boolean } = {}) {
    const pool = await unplacedProfiles();
    if (pool.count === 0) return { pool: 0, matched: 0, sent: 0, skippedWeek: 0, skippedNoLink: 0, failed: 0, stopped: false, dryRun: !apply, reason: 'pool empty' };
    const hosts = (await fetchSendableHosts()).filter(h => h.portalToken?.token);
    const matched = applyMatch(wave, inTier(wave, hosts), pool);
    const slug = TPL_SLUG[wave.template];
    const tpl = await prisma.documentTemplate.findFirst({ where: emailTemplateWhere(slug) });
    if (!tpl || tpl.templateType !== 'email') throw new Error(`template "${slug}" (email) not found`);
    const since = new Date(); since.setDate(since.getDate() - 6);

    let sent = 0, skippedWeek = 0, skippedNoLink = 0, failed = 0, stopped = false;
    const emailedIds: number[] = [];
    for (const h of matched) {
      // Per-send auto-stop: the instant every student is placed, cancel the rest.
      if (apply && await poolCount() === 0) { stopped = true; break; }
      if (!h.portalToken?.token) { skippedNoLink++; continue; }
      if (!opts.ignoreIdem) {
        const already = await prisma.emailLog.count({ where: { providerId: h.id, templateId: tpl.id, createdAt: { gte: since } } });
        if (already) { skippedWeek++; continue; }
      }
      const ctx = {
        contactName: [h.contactFirstName, h.contactLastName].filter(Boolean).join(' ') || h.name || 'there',
        hostName: h.name || '',
        link: `${BASE_URL}/host-portal/${h.portalToken.token}`,
      };
      const html = resolveTpl(tpl.htmlTemplate, ctx);
      const subject = resolveTpl(tpl.subject || 'A ULearn student is looking for a host 🏠', ctx);
      if (!apply) { sent++; continue; }
      try {
        const res = await sendEmail({ from: FROM, fromName: FROM_NAME, to: h.email!, subject, html });
        await prisma.emailLog.create({
          data: {
            providerId: h.id, fromEmail: FROM, toEmail: h.email!, subject, bodyHtml: html,
            templateId: tpl.id, gmailMessageId: res.messageId, gmailThreadId: res.threadId,
            sentBy: `auto-nudge:${wave.id}`,
          },
        });
        sent++;
        emailedIds.push(h.id);
      } catch { failed++; }
    }
    // First Dibs is SINGLE-USE: once the First-Dibs wave has actually EMAILED them this
    // cycle, consume it so no host holds the front of the queue indefinitely. They
    // re-earn it by tapping the button again if they miss out next time. Hosts not
    // emailed (6-day cap, auto-stop, failed send) keep it until they are reached.
    if (apply && wave.firstDibs) {
      const ids = emailedIds;
      if (ids.length) {
        // Clear ONLY the flag — their activity level (SuperHost/BusyBee/…) is untouched.
        await prisma.accommodationProvider.updateMany({
          where: { id: { in: ids }, firstDibsAt: { not: null } },
          data: { firstDibsAt: null },
        });
      }
    }
    // Record the last REAL send time so the First Dibs button window is hour-precise
    // (button lives ≤6h after the last cohort was actually emailed — auto-stop aware).
    if (apply && sent > 0) {
      const c = loadConfig();
      saveConfig({ ...c, lastSentAt: new Date().toISOString() });
    }
    return { pool: pool.count, matched: matched.length, sent, skippedWeek, skippedNoLink, failed, stopped, dryRun: !apply, template: slug };
  }

  /** Cron entry: fire every enabled wave whose day+time is due and hasn't fired today. */
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
      fired.push({ id: w.id, batch: w.batch, wave: w.wave, ...res });
    }
    // Re-read lastSentAt: sendWave stamps it mid-loop, and saving the stale cfg
    // loaded above would wipe it (that kept the First Dibs button hidden).
    if (fired.length) saveConfig({ ...cfg, lastSentAt: loadConfig().lastSentAt });
    return { armed: cfg.armed, checkedAt: `${dateStr} ${hhmm}`, fired };
  }

  return { getWaves, updateWave, setArmed, loadConfig, sendWave, runDueWaves };
}

function pick(obj: any, keys: string[]) {
  const o: any = {};
  if (obj) for (const k of keys) if (obj[k] !== undefined) o[k] = obj[k];
  return o;
}
