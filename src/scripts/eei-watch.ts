/**
 * Watcher on EEI's vetting form page (Neil 2026-11-08). Our "Send to EEI" posts their public form from the server; if EEI ever
 * change that form (a field, the submit button, a hidden id's name, a captcha or honeypot added) a send could fail SILENTLY
 * and we'd only find out 4–6 weeks later when no Garda link or disclosure turns up. So:
 *   - fingerprint(html) = the form's structure only: every field (name, type, required), hidden field NAMES, the button, the
 *     form tag, and any anti-bot marker (captcha, honeypot, akismet) anywhere on the page. Values that change on every load
 *     (nonces) are left out, so the print only moves when the form really changes.
 *   - The BASELINE is the print at the last send EEI accepted (data/eei-form-baseline.json). Before every send the live print
 *     must equal it, or nothing is sent: the SIS shows "EEI form change detected — submit by hand" and Neil is pinged in
 *     #sis (eei-submit.ts). Runs only at send time (Neil 2026-11-08) — no cron.
 *
 *   node dist/scripts/eei-watch.js          → check now by hand; Slack #accomm on change
 *   node dist/scripts/eei-watch.js --show   → print the current fingerprint summary
 */
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export const EEI_PAGE = 'https://englisheducationireland.ie/vetting/';
const BASE = path.join(__dirname, '..', '..', 'data', 'eei-form-baseline.json');

export function fingerprint(html: string): { hash: string; summary: string[] } | null {
  const a = html.indexOf('id="garda_vetting_form"');
  if (a < 0) return null;
  const start = html.lastIndexOf('<form', a), end = html.indexOf('</form>', a);
  const form = html.slice(start, end);
  const out: string[] = [];
  const formTag = (form.match(/<form[^>]*>/) || [''])[0].replace(/\s(class|style)="[^"]*"/g, '');
  out.push('FORM ' + formTag);
  for (const m of form.matchAll(/<(input|select|textarea|button)\b[^>]*>/g)) {
    const t = m[0];
    const at = (n: string) => (t.match(new RegExp(`\\s${n}="([^"]*)"`)) || [])[1] || '';
    const tag = m[1], type = at('type') || tag;
    if (type === 'hidden') { out.push(`HIDDEN ${at('name')}`); continue; }
    if (tag === 'button') { out.push(`BUTTON type=${at('type')}`); continue; }
    if (/^cmplz-/.test(at('id'))) continue;   // the cookie banner's checkboxes sit on the page too
    out.push(`FIELD ${tag} ${type} ${at('name')}${/\srequired/.test(t) ? ' required' : ''}${type === 'radio' ? ' =' + at('value') : ''}`);
  }
  for (const m of form.matchAll(/<option[^>]*>([^<]*)/g)) out.push(`OPTION ${m[1].trim()}`);
  for (const m of form.matchAll(/class="[^"]*elementor-field-type-([a-z_-]+)/g)) out.push(`FIELDTYPE ${m[1]}`);
  const btn = (form.match(/<button[^>]*type="submit"[^>]*>([\s\S]*?)<\/button>/) || [, ''])[1].replace(/<[^>]+>/g, '').trim();
  out.push(`SUBMIT "${btn}"`);
  for (const w of ['recaptcha', 'hcaptcha', 'turnstile', 'honeypot', 'akismet', 'cleantalk', 'antispam']) if (new RegExp(w, 'i').test(html)) out.push(`ANTIBOT ${w}`);
  const uniq = [...new Set(out)];
  return { hash: crypto.createHash('sha256').update(uniq.join('\n')).digest('hex').slice(0, 16), summary: uniq };
}

export async function livePrint(): Promise<{ hash: string; summary: string[] } | null> {
  const html = await fetch(EEI_PAGE, { headers: { 'User-Agent': 'Mozilla/5.0 (ULearn SIS)' } }).then(r => r.text()).catch(() => '');
  return html ? fingerprint(html) : null;
}
export function baseline(): { hash: string; summary: string[]; at: string; from: string } | null {
  try { return JSON.parse(fs.readFileSync(BASE, 'utf8')); } catch { return null; }
}
export function setBaseline(p: { hash: string; summary: string[] }, from: string) {
  fs.mkdirSync(path.dirname(BASE), { recursive: true });
  fs.writeFileSync(BASE, JSON.stringify({ ...p, at: new Date().toISOString(), from }, null, 1));
}
// What moved, in a few lines a person can read.
export function delta(a: string[], b: string[]): string[] {
  const A = new Set(a), B = new Set(b);
  return [...b.filter(x => !A.has(x)).map(x => '+ ' + x), ...a.filter(x => !B.has(x)).map(x => '− ' + x)].slice(0, 12);
}

async function main() {
  const p = await livePrint();
  if (process.argv.includes('--show')) { console.log(JSON.stringify(p, null, 1), '\nbaseline:', baseline()?.hash || 'none'); return; }
  const b = baseline();
  const { postSlackMessage } = await import('../lib/slack');
  const ch = process.env.SLACK_ACCOMM_CHANNEL || '#accomm', neil = '<@U4CUW7S2X>';
  if (!p) { await postSlackMessage({ channel: ch, text: `⚠️ *EEI vetting form watcher:* couldn't read ${EEI_PAGE} today. Sends to EEI are paused until it reads again. ${neil}` }); console.log('unreadable'); return; }
  if (!b) { console.log('no baseline yet (set by the first send EEI accepts) — current', p.hash); return; }
  if (b.hash === p.hash) { console.log('unchanged', p.hash); return; }
  await postSlackMessage({ channel: ch, text: `⚠️ *EEI changed their vetting form* (${EEI_PAGE}). "Send to EEI" is blocked until we check it.\n${delta(b.summary, p.summary).map(x => '`' + x + '`').join('\n')}\n${neil}` });
  console.log('CHANGED', b.hash, '→', p.hash);
}
if (require.main === module) { require('dotenv').config({ quiet: true }); main().catch(e => { console.error(e); process.exit(1); }); }
