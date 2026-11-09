/**
 * Send a host's vetting request to EEI (English Education Ireland, ex-MEI) — Neil 2026-11-08.
 *
 * EEI's request form (https://englisheducationireland.ie/vetting/) is a public Elementor form: no login, no captcha, no
 * attachments — just the person's details + role + "documentation furnished" + consent. This posts the same fields the browser
 * would, from the SIS NVB 1 data, once all three uploads have passed (form + ID + proof of address). The paper form and ID
 * copies stay with us (MEI's own rule). EEI then registers the person on Garda e-vetting and the host gets the Garda link.
 *
 *   buildEeiRequest(sub)          → { fields, problems[] }     (what would be sent — the dry run)
 *   sendToEei(sub, { dry })       → { ok, status, body, fields, problems }
 *
 * The page is re-read on every send so its hidden ids are fresh; if EEI change the form (a field we fill is gone, a captcha
 * appears) nothing is sent and the problem is returned. NVB 3 (16–17) is NOT sent automatically — EEI's form has no
 * parent/guardian fields — the desk does it by hand.
 */
const PAGE = 'https://englisheducationireland.ie/vetting/';
const AJAX = 'https://englisheducationireland.ie/wp-admin/admin-ajax.php';
const SCHOOL = process.env.EEI_SCHOOL_NAME || 'ULearn English School';

// EEI field name → how we fill it. Names read off the live form on 8 Nov 2026.
const F = {
  forename: 'form_fields[name]', middle: 'form_fields[middle_name]', surname: 'form_fields[surname]',
  dob: 'form_fields[date_of_birth]', phone: 'form_fields[number]', email: 'form_fields[email]', email2: 'form_fields[c_email]',
  school: 'form_fields[field_baf176a]', role: 'form_fields[field_b6f0396]', roleOther: 'form_fields[field_082c1e0]',
  addr1: 'form_fields[field_78d9bfc]', addr2: 'form_fields[field_924e345]', addr3: 'form_fields[field_2f46ae2]',
  city: 'form_fields[field_d07d8e5]', region: 'form_fields[field_c841c2a]', eircode: 'form_fields[field_2c77c09]', country: 'form_fields[field_d60aaca]',
  docs: 'form_fields[field_12a5f9e]', consent: 'form_fields[field_67e36bf]', consentDate: 'form_fields[field_33f2b9d]',
};

const ymd = (v: any) => { const d = v ? new Date(v) : null; return d && !isNaN(d.getTime()) ? d.toISOString().slice(0, 10) : ''; };
const title = (s: string) => String(s || '').trim().toLowerCase().replace(/(^|[\s'-])\p{L}/gu, m => m.toUpperCase());

export function buildEeiRequest(sub: any): { fields: Record<string, string>; problems: string[] } {
  const d = sub.data || {}, problems: string[] = [];
  if (sub.formType !== 'NVB1') problems.push('Only NVB 1 (18+) is sent automatically; a 16–17 year old (NVB 3) is done by hand.');
  // The printed form has 5 free address lines; EEI wants 3 lines + a city. The last filled line after line 1 is the city.
  const lines = [d.addr1, d.addr2, d.addr3, d.addr4, d.addr5].map((x: any) => String(x || '').trim()).filter(Boolean);
  const city = lines.length > 1 ? lines.pop()! : (/^D\d/i.test(String(d.eircode || '')) ? 'Dublin' : '');
  const consentDate = ymd(sub.signedUploadedAt) || ymd(new Date());
  const fields: Record<string, string> = {
    [F.forename]: title(d.forenames), [F.middle]: title(d.middleName), [F.surname]: title(d.surname),
    [F.dob]: ymd(d.dob), [F.phone]: String(d.contactNumber || '').trim(), [F.email]: String(d.email || '').trim(), [F.email2]: String(d.email || '').trim(),
    [F.school]: SCHOOL, [F.role]: 'Host Family', [F.roleOther]: '',
    [F.addr1]: title(lines[0] || ''), [F.addr2]: title(lines[1] || ''), [F.addr3]: title(lines.slice(2).join(', ')),
    [F.city]: title(city), [F.region]: '', [F.eircode]: String(d.eircode || '').trim().toUpperCase(), [F.country]: 'Ireland',
    [F.docs]: 'Yes', [F.consent]: d.consent === false ? 'No' : 'Yes', [F.consentDate]: consentDate,
  };
  for (const [k, label] of [[F.forename, 'forename'], [F.surname, 'surname'], [F.dob, 'date of birth'], [F.phone, 'contact number'], [F.email, 'email'], [F.addr1, 'address'], [F.city, 'city'], [F.eircode, 'Eircode']] as const)
    if (!fields[k]) problems.push(`Missing ${label}.`);
  if (fields[F.email] && !/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(fields[F.email])) problems.push(`Email looks wrong: ${fields[F.email]}`);
  if (fields[F.consent] !== 'Yes') problems.push('Consent was not ticked on the form.');
  return { fields, problems };
}

export async function sendToEei(sub: any, opts: { dry?: boolean } = {}): Promise<{ ok: boolean; status?: number; body?: string; fields: Record<string, string>; problems: string[]; formChanged?: boolean }> {
  const { fields, problems } = buildEeiRequest(sub);
  if (problems.length) return { ok: false, fields, problems };
  // Fresh page: hidden ids + a check that every field we fill still exists and no captcha has been added.
  const page = await fetch(PAGE, { headers: { 'User-Agent': 'Mozilla/5.0 (ULearn SIS)' } }).then(r => r.text()).catch(() => '');
  const a = page.indexOf('id="garda_vetting_form"'), form = a >= 0 ? page.slice(a, page.indexOf('</form>', a)) : '';
  if (!form) { await alertFormChanged(['The EEI form page could not be read (down, moved or blocked).']); return { ok: false, fields, problems: ['Could not read the EEI form page.'], formChanged: true }; }
  const hidden = (n: string) => (form.match(new RegExp(`name="${n}" value="([^"]*)"`)) || [])[1] || '';
  const gone = Object.keys(fields).filter(k => !form.includes(`name="${k}"`));
  if (gone.length) problems.push(`EEI changed their form — these fields are gone: ${gone.join(', ')}`);
  if (/recaptcha|hcaptcha|turnstile/i.test(form)) problems.push('EEI added a captcha — this one has to be done in a browser.');
  if (!hidden('post_id') || !hidden('form_id')) problems.push('Could not read the form ids.');
  // The watcher (eei-watch.ts): the form must look exactly as it did at the last send EEI accepted.
  const W = await import('./eei-watch');
  const print = W.fingerprint(page), base = W.baseline();
  if (!print) problems.push('Could not fingerprint the EEI form.');
  else if (base && base.hash !== print.hash) problems.push(`EEI changed their form since the last accepted send (${base.at.slice(0, 10)}): ${W.delta(base.summary, print.summary).join('; ')}`);
  if (problems.length) { await alertFormChanged(problems); return { ok: false, fields, problems, formChanged: true }; }
  const body = new URLSearchParams({ action: 'elementor_pro_forms_send_form', post_id: hidden('post_id'), form_id: hidden('form_id'), referer_title: hidden('referer_title') || 'Garda vetting - EEI', queried_id: hidden('queried_id') || hidden('post_id'), ...fields });
  if (opts.dry) return { ok: true, fields, problems: [] };
  const res = await fetch(AJAX, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded', Referer: PAGE, Origin: 'https://englisheducationireland.ie', 'X-Requested-With': 'XMLHttpRequest', 'User-Agent': 'Mozilla/5.0 (ULearn SIS)' }, body });
  const text = await res.text();
  let ok = false; try { ok = JSON.parse(text).success === true; } catch {}
  if (ok && print) W.setBaseline(print, `send ${new Date().toISOString().slice(0, 10)} sub ${sub.id}`);
  return { ok, status: res.status, body: text.slice(0, 500), fields, problems: ok ? [] : ['EEI did not confirm the submission.'] };
}

// Form changed / unreadable → ping Neil in #sis (the watcher only runs at send time, Neil 2026-11-08). Once per problem per day.
const ALERTED: Record<string, string> = {};
async function alertFormChanged(problems: string[]) {
  const key = problems.join('|'), day = new Date().toISOString().slice(0, 10);
  if (ALERTED[key] === day) return;
  ALERTED[key] = day;
  try {
    const { postSlackMessage } = await import('../lib/slack');
    await postSlackMessage({ channel: process.env.SLACK_SIS_CHANNEL || '#sis',
      text: `⚠️ *EEI GV (Garda vetting) form has changed — no submission possible.* Rescrape the page via Claude: ${PAGE}\n${problems.map(x => '• ' + x).join('\n')}\nUntil then the desk submits by hand (the SIS shows the details to type in). <@U4CUW7S2X>` });
  } catch (e) {}
}
