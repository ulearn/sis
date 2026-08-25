// Host portal — Garda vetting forms (3-step pipeline).
//
// Rule (per Kelly / MEI): everyone aged 16+ living on a host-family property
// must be Garda-vetted.
//   • 18+    → Form NVB 1 (Vetting Invitation)
//   • 16–17  → Form NVB 3 (Parent/Guardian Consent)
//
// Pipeline, per household member:
//   1. Web form  — clean inputs mirroring every field on the paper form,
//      prefilled from the host record where we already hold the data.
//   2. Print     — the typed values are rendered back into the original
//      box-per-letter layout (a faithful printable replica) so the host can
//      print a fully-completed form and wet-sign it.
//   3. Upload    — the host photographs / scans the signed form and uploads
//      it; both the digital entry and the signed file stay attached to the
//      host (provider) via host_vetting_submissions.
//
// Mounted at /host-portal (BEFORE requireAuth) — auth is the magic-link token,
// validated by requireHostToken on every route (same as the rest of the
// portal). Self-contained HTML/CSS/JS, like routes/host-portal.ts — we don't
// drag the admin bundle into a public page.
import express, { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { PrismaClient } from '../generated/prisma/client';
import { requireHostToken } from './host-portal';

// Signed-form uploads → uploads/host-vetting/<providerId>/. Same disk-storage
// pattern as the partner passport upload (routes/partners.ts).
const vettingUploadBase = path.join(__dirname, '..', '..', 'uploads', 'host-vetting');
if (!fs.existsSync(vettingUploadBase)) fs.mkdirSync(vettingUploadBase, { recursive: true });

const vettingUpload = multer({
  storage: multer.diskStorage({
    destination: (req: any, _file, cb) => {
      const pid = req.hostProvider?.id || 'unknown';
      const dir = path.join(vettingUploadBase, String(pid));
      fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename: (_req, file, cb) =>
      cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`),
  }),
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ok = ['application/pdf', 'image/jpeg', 'image/png', 'image/heic', 'image/heif', 'image/webp'].includes(file.mimetype);
    if (ok) cb(null, true); else cb(new Error('Only PDF / JPG / PNG / HEIC files are accepted'));
  },
});

const esc = (s: any) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));

// Boxes per row on the printed forms. Text fields are capped to this on the
// web form (maxlength) so a value can't overflow the grid it gets parsed into.
const BOX = 28;

// ─── Char-grid renderers (the box-per-letter look of the paper forms) ────────

// One box per character; spaces become an empty cell (matching the original).
// Pads to `minBoxes` trailing empties so short answers still look like a form.
// flex-wrap means any length fits — long emails just wrap to a second row.
function charGrid(value: string, minBoxes: number, opts: { upper?: boolean } = {}): string {
  const upper = opts.upper !== false;
  const raw = String(value ?? '');
  const v = upper ? raw.toUpperCase() : raw;
  const chars = Array.from(v);
  const boxes: string[] = [];
  for (const ch of chars) {
    if (ch === ' ') boxes.push('<span class="cbox cspace"></span>');
    else boxes.push(`<span class="cbox">${esc(ch)}</span>`);
  }
  for (let i = chars.length; i < minBoxes; i++) boxes.push('<span class="cbox"></span>');
  return `<span class="cgrid">${boxes.join('')}</span>`;
}

// DD / MM / YYYY digit boxes from an ISO yyyy-mm-dd (blank → empty boxes).
function dateGrid(iso: string): string {
  let d = '', m = '', y = '';
  if (iso && /^\d{4}-\d{2}-\d{2}/.test(iso)) { const [yy, mm, dd] = iso.split('-'); y = yy; m = mm; d = dd; }
  const dig = (s: string, n: number) => {
    const a = (s || '').split('');
    let o = '';
    for (let i = 0; i < n; i++) o += `<span class="cbox">${a[i] ? esc(a[i]) : ''}</span>`;
    return o;
  };
  return `<span class="cgrid">${dig(d, 2)}<span class="cslash">/</span>${dig(m, 2)}<span class="cslash">/</span>${dig(y, 4)}</span>`;
}

// Labelled char-grid row used throughout the printable forms.
function gridRow(label: string, value: string, minBoxes: number, opts?: { upper?: boolean }): string {
  return `<div class="frow"><div class="flabel">${esc(label)}</div><div class="fval">${charGrid(value, minBoxes, opts)}</div></div>`;
}
function dateRow(label: string, iso: string): string {
  return `<div class="frow"><div class="flabel">${esc(label)}</div><div class="fval">${dateGrid(iso)}</div></div>`;
}

// ─── Page shell ──────────────────────────────────────────────────────────────

function vettingPage(title: string, body: string): string {
  return `<!doctype html><html><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<style>
  *{box-sizing:border-box}
  body{font-family:Verdana,Arial,sans-serif;max-width:820px;margin:0 auto;color:#2B2B2B;padding:20px 16px;background:#fafafa;line-height:1.5}
  a{color:#3a6c00}
  h1{font-size:21px;margin:0 0 4px}
  .muted{color:#777;font-size:13px}
  .topbar{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;padding-bottom:14px;border-bottom:1px solid #e0e0e0;margin-bottom:16px}
  .box{background:#fff;border:1px solid #e0e0e0;border-radius:8px;padding:16px 20px;margin:12px 0}
  .box.tips{background:#f4fbe8;border-color:#bcdd92}
  .btn{display:inline-block;background:#6FB42C;color:#fff;border:0;border-radius:6px;padding:10px 18px;font-weight:700;font-size:14px;cursor:pointer;text-decoration:none;font-family:inherit}
  .btn:disabled{background:#c0c0c0;cursor:not-allowed}
  .btn-secondary{background:#fff;color:#2B2B2B;border:1px solid #c0c0c0}
  .btn-block{display:block;width:100%;text-align:center;margin:8px 0}
  /* Web form (step 1) */
  .field{margin:0 0 14px}
  .field label{display:block;font-size:13px;font-weight:700;margin-bottom:4px}
  .field .hint{font-weight:400;color:#888;font-size:12px}
  .field input[type=text],.field input[type=email],.field input[type=tel],.field input[type=date]{
    width:100%;padding:9px 11px;border:1px solid #c4c4c4;border-radius:6px;font-size:15px;font-family:inherit;text-transform:uppercase}
  .field input[type=email]{text-transform:none}
  .field.locked input{background:#f3f4f6;color:#555}
  .grid2{display:grid;grid-template-columns:1fr 1fr;gap:0 14px}
  .sec{font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#fff;background:#2B2B2B;padding:6px 10px;border-radius:4px;margin:18px 0 12px}
  .consent{display:flex;gap:10px;align-items:flex-start;font-size:13px;margin:14px 0}
  .consent input{margin-top:3px;transform:scale(1.3)}
  .radios{display:flex;gap:18px;flex-wrap:wrap;font-size:14px}
  .radios label{font-weight:400}
  /* Submission list */
  .sub{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid #f0f0f0}
  .sub:last-child{border-bottom:0}
  .badge{display:inline-block;font-size:11px;font-weight:700;padding:2px 8px;border-radius:10px}
  .b-nvb1{background:#eef5d3;color:#3a6c00}
  .b-nvb3{background:#e0ecff;color:#1d4ed8}
  .st-need{color:#92400e;font-weight:700;font-size:12px}
  .st-done{color:#166534;font-weight:700;font-size:12px}
  /* Printable form replica */
  .printable{background:#fff;border:1px solid #ddd;border-radius:8px;padding:26px 30px;margin:14px 0}
  .doc-head{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;margin-bottom:6px}
  .doc-head .org{font-size:11px;line-height:1.35}
  .doc-head .org b{color:#6FB42C}
  .ref-box{border:1px solid #000;min-width:150px;min-height:44px;padding:3px 6px;font-size:11px}
  .doc-title{text-align:center;margin:8px 0 14px}
  .doc-title .small{font-size:12px;font-weight:700}
  .doc-title .big{font-size:22px;font-weight:800;text-decoration:underline;letter-spacing:.5px}
  .secbar{background:#000;color:#fff;font-weight:700;font-size:13px;padding:5px 10px;margin:16px 0 12px}
  .offence{font-size:11px;font-weight:700;margin:8px 0 14px}
  .frow{display:flex;align-items:flex-start;gap:10px;margin:6px 0}
  .flabel{flex:0 0 150px;font-size:12px;font-weight:700;padding-top:4px;text-align:right}
  .fval{flex:1;min-width:0}
  .cgrid{display:flex;flex-wrap:wrap}
  .cbox{width:22px;height:26px;border:1px solid #333;display:inline-flex;align-items:center;justify-content:center;font-family:'Courier New',monospace;font-size:14px;font-weight:700;margin:-1px 0 0 -1px;background:#fff}
  .cspace{background:#fff}
  .cslash{display:inline-flex;align-items:center;font-weight:800;padding:0 5px;font-size:16px}
  .tickbox{display:inline-flex;width:18px;height:18px;border:1.5px solid #000;align-items:center;justify-content:center;font-weight:800;font-size:13px;vertical-align:middle}
  .sigline{border:1px solid #000;height:54px;flex:1}
  .sigrow{display:flex;align-items:flex-end;gap:14px;margin-top:16px}
  .note{font-size:11px;font-weight:700;margin-top:14px}
  /* Sticky action toolbar (screen only) */
  .toolbar{position:sticky;top:0;background:#fafafa;padding:10px 0;z-index:5;display:flex;gap:10px;flex-wrap:wrap;align-items:center;border-bottom:1px solid #e0e0e0;margin-bottom:6px}
  .uploadzone{border:2px dashed #bcdd92;border-radius:10px;background:#f4fbe8;padding:20px;text-align:center}
  .uploadzone.drag{background:#e9f6cf;border-color:#6FB42C}
  #upStatus{font-size:13px;margin-top:10px}
  @media (max-width:560px){.grid2{grid-template-columns:1fr}.flabel{flex-basis:96px;text-align:left}.cbox{width:19px;height:23px}}
  @media print{
    body{background:#fff;padding:0;max-width:none}
    .toolbar,.noprint{display:none !important}
    .printable{border:0;margin:0;padding:0}
  }
</style>
</head><body>${body}</body></html>`;
}

// ─── Prefill helpers ─────────────────────────────────────────────────────────

function splitName(full: string | null | undefined): { fore: string; sur: string } {
  const parts = String(full || '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { fore: '', sur: '' };
  if (parts.length === 1) return { fore: parts[0], sur: '' };
  return { fore: parts.slice(0, -1).join(' '), sur: parts[parts.length - 1] };
}

// ─── Step 1 — web forms ──────────────────────────────────────────────────────

function inputField(name: string, label: string, value: string, type = 'text', opts: { hint?: string; locked?: boolean; required?: boolean; maxlength?: number } = {}): string {
  return `<div class="field${opts.locked ? ' locked' : ''}">
    <label>${esc(label)}${opts.required ? ' <span style="color:#c0392b">*</span>' : ''}${opts.hint ? ` <span class="hint">${esc(opts.hint)}</span>` : ''}</label>
    <input type="${type}" name="${name}" value="${esc(value)}"${opts.locked ? ' readonly' : ''}${opts.required ? ' required' : ''}${opts.maxlength ? ` maxlength="${opts.maxlength}"` : ''}>
  </div>`;
}

function renderNvb1Form(token: string, p: any): string {
  const fore = p.contactFirstName || splitName(p.name).fore;
  const sur = p.contactLastName || splitName(p.name).sur;
  const body = `
    <div class="topbar"><h1>Garda Vetting — Form NVB 1</h1>
      <a class="muted" href="/host-portal/${esc(token)}/vetting">← back</a></div>
    <div class="box tips">
      <strong>Before you start</strong>
      <ul style="margin:8px 0 0;padding-left:18px;font-size:13px">
        <li>Complete every field in <strong>BLOCK CAPITALS</strong>, clearly and legibly.</li>
        <li>You'll need to print and sign the form, then upload a photo/scan of it here.</li>
        <li>Have ready to send separately: a copy of your <strong>passport or driving licence</strong> and a <strong>recent bill</strong> showing your name &amp; address.</li>
        <li>Make sure your <strong>email address is correct</strong> — the Garda vetting invitation is sent there.</li>
      </ul>
    </div>
    <form method="POST" action="/host-portal/${esc(token)}/vetting/nvb1">
      <div class="sec">Section 1 — Personal Information</div>
      <div class="grid2">
        ${inputField('forenames', 'Forename(s)', fore, 'text', { required: true, maxlength: BOX })}
        ${inputField('middleName', 'Middle Name', '', 'text', { maxlength: BOX })}
        ${inputField('surname', 'Surname', sur, 'text', { required: true, maxlength: BOX })}
        ${inputField('dob', 'Date of Birth', '', 'date', { required: true })}
        ${inputField('email', 'Email Address', p.email || '', 'email', { required: true, maxlength: 50, hint: '(vetting invitation sent here)' })}
        ${inputField('contactNumber', 'Contact Number', p.mobile || p.phone || '', 'tel', { required: true, maxlength: 20 })}
      </div>
      ${inputField('role', 'Role Being Vetted For', 'HOST FAMILY', 'text', { locked: true })}
      <div class="sec">Current Address</div>
      <p class="muted" style="margin:-4px 0 12px">Each line must fit the boxes on the printed form — keep it short (max ${BOX} characters per line).</p>
      ${inputField('addr1', 'Street Address', p.address || '', 'text', { required: true, maxlength: BOX })}
      ${inputField('addr2', 'Neighbourhood', p.addressAddon || '', 'text', { maxlength: BOX })}
      ${inputField('addr3', 'City', p.city || '', 'text', { maxlength: BOX })}
      ${inputField('addr4', 'Additional 1', '', 'text', { maxlength: BOX })}
      ${inputField('addr5', 'Additional 2', '', 'text', { maxlength: BOX })}
      ${inputField('eircode', 'Eircode / Postcode', p.zip || '', 'text', { required: true, maxlength: 12 })}
      <div class="sec">Section 2 — Declaration</div>
      <div class="field locked"><label>Name of Organisation</label><input type="text" value="Marketing English In Ireland" readonly></div>
      <label class="consent">
        <input type="checkbox" name="consent" value="yes" required>
        <span>I have provided documentation to validate my identity as required <em>and</em> I consent to the making of this application and to the disclosure of information by the National Vetting Bureau to the Liaison Person pursuant to Section 13(4)(e) National Vetting Bureau (Children and Vulnerable Persons) Acts 2012 to 2016.</span>
      </label>
      <p class="muted">You'll wet-sign and date the printed form in the next step.</p>
      <button class="btn btn-block" type="submit">Continue to print &amp; sign →</button>
    </form>
  `;
  return vettingPage('Garda Vetting — NVB 1', body);
}

function renderNvb3Form(token: string, p: any): string {
  const fore = p.contactFirstName || splitName(p.name).fore;
  const sur = p.contactLastName || splitName(p.name).sur;
  const body = `
    <div class="topbar"><h1>Garda Vetting — Form NVB 3</h1>
      <a class="muted" href="/host-portal/${esc(token)}/vetting">← back</a></div>
    <div class="box tips">
      <strong>For a household member aged 16–17</strong>
      <p style="margin:8px 0 0;font-size:13px">A parent or guardian must consent to the vetting of a 16–17 year old. Enter the young person's details, then the parent/guardian's details. You'll print, sign and upload it in the next steps.</p>
    </div>
    <form method="POST" action="/host-portal/${esc(token)}/vetting/nvb3">
      <div class="sec">Applicant Details (the 16–17 year old)</div>
      <div class="grid2">
        ${inputField('a_forenames', 'Forename(s)', '', 'text', { required: true, maxlength: BOX })}
        ${inputField('a_surname', 'Surname', '', 'text', { required: true, maxlength: BOX })}
      </div>
      ${inputField('a_dob', 'Date of Birth', '', 'date', { required: true })}
      <div class="sec">Parent / Guardian Details</div>
      <div class="grid2">
        ${inputField('pg_forenames', 'Forename(s)', fore, 'text', { required: true, maxlength: BOX })}
        ${inputField('pg_surname', 'Surname', sur, 'text', { required: true, maxlength: BOX })}
      </div>
      <div class="field"><label>Relationship to Applicant <span style="color:#c0392b">*</span></label>
        <div class="radios">
          <label><input type="radio" name="relationship" value="Father" required> Father</label>
          <label><input type="radio" name="relationship" value="Mother"> Mother</label>
          <label><input type="radio" name="relationship" value="Guardian"> Guardian</label>
        </div>
      </div>
      <div class="sec">Address</div>
      <p class="muted" style="margin:-4px 0 12px">Each line must fit the boxes on the printed form — keep it short (max ${BOX} characters per line).</p>
      ${inputField('addr1', 'Street Address', p.address || '', 'text', { required: true, maxlength: BOX })}
      ${inputField('addr2', 'Neighbourhood', p.addressAddon || '', 'text', { maxlength: BOX })}
      ${inputField('addr3', 'City', p.city || '', 'text', { maxlength: BOX })}
      ${inputField('addr4', 'Additional 1', '', 'text', { maxlength: BOX })}
      ${inputField('addr5', 'Additional 2', '', 'text', { maxlength: BOX })}
      ${inputField('eircode', 'Eircode / Postcode', p.zip || '', 'text', { required: true, maxlength: 12 })}
      <p class="muted">The parent/guardian will wet-sign and date the printed form in the next step.</p>
      <button class="btn btn-block" type="submit">Continue to print &amp; sign →</button>
    </form>
  `;
  return vettingPage('Garda Vetting — NVB 3', body);
}

// ─── Step 2/3 — printable filled form + upload ───────────────────────────────

function renderNvb1Filled(d: any): string {
  return `
    <div class="printable">
      <div class="doc-head">
        <div class="org"><b>Vetting Organisation:</b><br>MEI<br>4, Manor Street Business Park,<br>Manor St, Arran Quay<br>D07 HCN1</div>
        <div style="text-align:center;font-weight:800;color:#6FB42C;font-size:20px;padding-top:6px">ULearn<br><span style="font-size:11px;color:#444">English School Dublin</span></div>
        <div><div style="font-size:11px;font-weight:700">Your Ref:</div><div class="ref-box"></div></div>
      </div>
      <div class="doc-title"><div class="small">Form NVB 1</div><div class="big">Vetting Invitation</div></div>
      <div class="secbar">Section 1 &nbsp; Personal Information</div>
      <div class="offence">Under Sec 26(b) of the National Vetting Bureau (Children and Vulnerable Persons) Acts 2012 to 2016, it is an offence to make a false statement for the purpose of obtaining a vetting disclosure.</div>
      ${gridRow('Forename(s):', d.forenames || '', 28)}
      ${gridRow('Middle Name:', d.middleName || '', 28)}
      ${gridRow('Surname:', d.surname || '', 28)}
      ${dateRow('Date Of Birth:', d.dob || '')}
      ${gridRow('Email Address:', d.email || '', 28, { upper: false })}
      ${gridRow('Contact Number:', d.contactNumber || '', 28)}
      ${gridRow('Role Being Vetted For:', d.role || 'HOST FAMILY', 28)}
      <div class="frow"><div class="flabel">Current Address:</div><div class="fval"></div></div>
      ${gridRow('Line 1:', d.addr1 || '', 28)}
      ${gridRow('Line 2:', d.addr2 || '', 28)}
      ${gridRow('Line 3:', d.addr3 || '', 28)}
      ${gridRow('Line 4:', d.addr4 || '', 28)}
      ${gridRow('Line 5:', d.addr5 || '', 28)}
      ${gridRow('Eircode/Postcode:', d.eircode || '', 28)}
      <div class="secbar">Section 2 &nbsp; Additional Information</div>
      ${gridRow('Name Of Organisation:', 'Marketing English In Ireland', 28, { upper: false })}
      <p style="font-size:11px;font-weight:700;margin:14px 0 6px">I have provided documentation to validate my identity as required <em>and</em> I consent to the making of this application and to the disclosure of information by the National Vetting Bureau to the Liaison Person pursuant to Section 13(4)(e) National Vetting Bureau (Children and Vulnerable Persons) Acts 2012 to 2016.
        &nbsp; Please tick box <span class="tickbox">${d.consent ? '✓' : ''}</span></p>
      <div class="sigrow">
        <div style="flex:0 0 130px;font-size:12px;font-weight:700">Applicant's Signature:</div>
        <div class="sigline"></div>
        <div style="font-size:12px;font-weight:700">Date:</div>
        <div>${dateGrid('')}</div>
      </div>
      <div class="note">Note: Please return this form to ULearn English School either by post or email alongside your other documents proving your identity (passport / driving license) and address (recent bill).</div>
    </div>`;
}

function renderNvb3Filled(d: any): string {
  const tick = (r: string) => `<span class="tickbox">${(d.relationship === r) ? '✓' : ''}</span>`;
  return `
    <div class="printable">
      <div class="doc-head">
        <div style="font-weight:800;font-size:12px">AN GARDA<br>SÍOCHÁNA</div>
        <div style="text-align:center;font-weight:800;font-size:13px;padding-top:4px">NATIONAL VETTING<br>BUREAU</div>
        <div style="width:80px"></div>
      </div>
      <div class="doc-title"><div class="big" style="font-size:18px">Parent/Guardian Consent Form (NVB 3)</div></div>
      <div class="secbar">Applicant Details</div>
      ${gridRow('Forename(s):', d.a_forenames || '', 28)}
      ${gridRow('Surname:', d.a_surname || '', 28)}
      ${dateRow('Date Of Birth:', d.a_dob || '')}
      <div class="secbar">Parent/Guardian Details</div>
      <div class="offence">Under Sec 26(b) of the National Vetting Bureau (Children and Vulnerable Persons) Acts 2012 to 2016, it is an offence to make a false statement for the purpose of obtaining a vetting disclosure.</div>
      ${gridRow('Forename(s):', d.pg_forenames || '', 28)}
      ${gridRow('Surname:', d.pg_surname || '', 28)}
      <div class="frow"><div class="flabel">Relationship to applicant:</div><div class="fval" style="padding-top:2px;font-size:12px;font-weight:700">Father: ${tick('Father')} &nbsp; Mother: ${tick('Mother')} &nbsp; Guardian: ${tick('Guardian')}</div></div>
      <div class="frow"><div class="flabel">Address:</div><div class="fval"></div></div>
      ${gridRow('Line 1:', d.addr1 || '', 28)}
      ${gridRow('Line 2:', d.addr2 || '', 28)}
      ${gridRow('Line 3:', d.addr3 || '', 28)}
      ${gridRow('Line 4:', d.addr4 || '', 28)}
      ${gridRow('Line 5:', d.addr5 || '', 28)}
      ${gridRow('Eircode/Postcode:', d.eircode || '', 28)}
      <div class="secbar">Parent/Guardian Consent</div>
      <p style="font-size:11px;font-weight:700;margin:10px 0">I, being the Parent/Guardian of the above named applicant, consent for the National Vetting Bureau to conduct vetting in respect of the above named applicant in accordance with the National Vetting Bureau (Children and Vulnerable Persons) Acts 2012 to 2016.</p>
      <div class="sigrow">
        <div style="flex:0 0 130px;font-size:12px;font-weight:700">Parent/Guardian Signature:</div>
        <div class="sigline"></div>
        <div style="font-size:12px;font-weight:700">Date:</div>
        <div>${dateGrid('')}</div>
      </div>
    </div>`;
}

function renderSignPage(token: string, sub: any): string {
  const filled = sub.formType === 'NVB3' ? renderNvb3Filled(sub.data || {}) : renderNvb1Filled(sub.data || {});
  const formLabel = sub.formType === 'NVB3' ? 'NVB 3 (Parent/Guardian Consent)' : 'NVB 1 (Vetting Invitation)';
  const already = sub.status === 'signed' && sub.signedFilePath;
  const body = `
    <div class="toolbar noprint">
      <a class="muted" href="/host-portal/${esc(token)}/vetting">← back</a>
      <strong style="flex:1">Step 2 — Print &amp; sign &nbsp;·&nbsp; ${esc(formLabel)}</strong>
      <button class="btn" onclick="window.print()">🖨 Print form</button>
    </div>
    <p class="muted noprint">Check the form below, print it, then <strong>sign and date it by hand</strong> (and tick the consent box if not already ticked). When done, upload a photo or scan of the signed form below.</p>
    ${filled}
    <div class="box noprint" style="margin-top:24px">
      <strong>Step 3 — Upload your signed form</strong>
      <p class="muted" style="margin:6px 0 12px">Take a clear photo of every page, or upload a scan/PDF. ${already ? '<span class="st-done">✓ A signed form is already on file — upload again to replace it.</span>' : ''}</p>
      <div class="uploadzone" id="uz">
        <p style="margin:0 0 12px">Drag a file here, or</p>
        <input type="file" id="upFile" accept="image/*,application/pdf" style="display:none">
        <button class="btn" type="button" onclick="document.getElementById('upFile').click()">📷 Upload / Take Photo</button>
        <div id="upName" class="muted" style="margin-top:10px"></div>
        <div id="upStatus"></div>
      </div>
    </div>
    <script>
      (function(){
        var input=document.getElementById('upFile'), uz=document.getElementById('uz'),
            nameEl=document.getElementById('upName'), statusEl=document.getElementById('upStatus');
        var url='/host-portal/${esc(token)}/vetting/${sub.id}/upload';
        function send(file){
          if(!file) return;
          nameEl.textContent=file.name;
          statusEl.innerHTML='Uploading…';
          var fd=new FormData(); fd.append('file', file);
          fetch(url,{method:'POST',body:fd}).then(function(r){return r.json().then(function(j){return {ok:r.ok,j:j};});})
            .then(function(res){
              if(res.ok){ statusEl.innerHTML='<span class="st-done">✓ Uploaded — your signed form has been received. Thank you.</span>'
                + ' &nbsp; <a href="/host-portal/${esc(token)}/vetting">Done</a>'; }
              else { statusEl.innerHTML='<span style="color:#b91c1c">'+((res.j&&res.j.error)||'Upload failed')+'</span>'; }
            }).catch(function(){ statusEl.innerHTML='<span style="color:#b91c1c">Network error — please try again.</span>'; });
        }
        input.addEventListener('change',function(){ send(input.files[0]); });
        ['dragover','dragenter'].forEach(function(e){uz.addEventListener(e,function(ev){ev.preventDefault();uz.classList.add('drag');});});
        ['dragleave','drop'].forEach(function(e){uz.addEventListener(e,function(ev){ev.preventDefault();uz.classList.remove('drag');});});
        uz.addEventListener('drop',function(ev){ if(ev.dataTransfer.files&&ev.dataTransfer.files[0]) send(ev.dataTransfer.files[0]); });
      })();
    </script>
  `;
  return vettingPage('Print & sign — ' + formLabel, body);
}

// ─── Public router ───────────────────────────────────────────────────────────

export function publicHostVettingRoutes(prisma: PrismaClient) {
  const router = Router();
  const urlencoded = express.urlencoded({ extended: true });
  router.use('/:token', requireHostToken(prisma));

  // Hub — list this host's submissions + the two "add person" entry points.
  router.get('/:token/vetting', async (req: any, res) => {
    const token = req.hostToken!;
    const subs = await prisma.hostVettingSubmission.findMany({
      where: { providerId: req.hostProvider!.id },
      orderBy: { id: 'desc' },
      select: { id: true, formType: true, personName: true, status: true, signedFileName: true, createdAt: true },
    });
    const list = subs.length === 0
      ? `<p class="muted">No one added yet.</p>`
      : subs.map(s => {
          const badge = s.formType === 'NVB3' ? '<span class="badge b-nvb3">NVB 3 · 16–17</span>' : '<span class="badge b-nvb1">NVB 1 · 18+</span>';
          const status = s.status === 'signed'
            ? `<span class="st-done">✓ Signed form uploaded</span>`
            : `<span class="st-need">Needs print &amp; signed upload</span>`;
          return `<div class="sub">
            <div><strong>${esc(s.personName || 'Household member')}</strong> ${badge}<br><span class="muted">${status}</span></div>
            <a class="btn btn-secondary" href="/host-portal/${esc(token)}/vetting/${s.id}/sign">${s.status === 'signed' ? 'View / re-upload' : 'Print &amp; sign →'}</a>
          </div>`;
        }).join('');
    const body = `
      <div class="topbar"><h1>Garda Vetting</h1>
        <a class="muted" href="/host-portal/${esc(token)}">← portal home</a></div>
      <div class="box tips">
        Everyone aged <strong>16 or over</strong> living in your home must complete Garda vetting.
        <ul style="margin:8px 0 0;padding-left:18px;font-size:13px">
          <li><strong>18 and over</strong> → complete <strong>Form NVB 1</strong>.</li>
          <li><strong>16–17 years old</strong> → a parent/guardian completes <strong>Form NVB 3</strong>.</li>
        </ul>
      </div>
      <a class="btn btn-block" href="/host-portal/${esc(token)}/vetting/nvb1">+ Add adult (18+) — NVB 1</a>
      <a class="btn btn-block btn-secondary" href="/host-portal/${esc(token)}/vetting/nvb3">+ Add 16–17 year old — NVB 3</a>
      <div class="box"><strong>People added</strong><div style="margin-top:6px">${list}</div></div>
    `;
    res.send(vettingPage('Garda Vetting', body));
  });

  // Step 1 forms
  router.get('/:token/vetting/nvb1', async (req: any, res) => {
    const p = await prisma.accommodationProvider.findUnique({ where: { id: req.hostProvider!.id } });
    res.send(renderNvb1Form(req.hostToken!, p || {}));
  });
  router.get('/:token/vetting/nvb3', async (req: any, res) => {
    const p = await prisma.accommodationProvider.findUnique({ where: { id: req.hostProvider!.id } });
    res.send(renderNvb3Form(req.hostToken!, p || {}));
  });

  // Step 1 submit → create submission → go to print/sign page
  router.post('/:token/vetting/nvb1', urlencoded, async (req: any, res) => {
    const b = req.body || {};
    const data = {
      forenames: b.forenames || '', middleName: b.middleName || '', surname: b.surname || '',
      dob: b.dob || '', email: b.email || '', contactNumber: b.contactNumber || '',
      role: 'HOST FAMILY',
      addr1: b.addr1 || '', addr2: b.addr2 || '', addr3: b.addr3 || '', addr4: b.addr4 || '', addr5: b.addr5 || '',
      eircode: b.eircode || '', consent: b.consent === 'yes',
    };
    const personName = `${b.forenames || ''} ${b.surname || ''}`.trim() || null;
    const sub = await prisma.hostVettingSubmission.create({
      data: { providerId: req.hostProvider!.id, formType: 'NVB1', personName, data, status: 'submitted' },
      select: { id: true },
    });
    res.redirect(303, `/host-portal/${req.hostToken}/vetting/${sub.id}/sign`);
  });
  router.post('/:token/vetting/nvb3', urlencoded, async (req: any, res) => {
    const b = req.body || {};
    const data = {
      a_forenames: b.a_forenames || '', a_surname: b.a_surname || '', a_dob: b.a_dob || '',
      pg_forenames: b.pg_forenames || '', pg_surname: b.pg_surname || '', relationship: b.relationship || '',
      addr1: b.addr1 || '', addr2: b.addr2 || '', addr3: b.addr3 || '', addr4: b.addr4 || '', addr5: b.addr5 || '',
      eircode: b.eircode || '',
    };
    const personName = `${b.a_forenames || ''} ${b.a_surname || ''}`.trim() || null;
    const sub = await prisma.hostVettingSubmission.create({
      data: { providerId: req.hostProvider!.id, formType: 'NVB3', personName, data, status: 'submitted' },
      select: { id: true },
    });
    res.redirect(303, `/host-portal/${req.hostToken}/vetting/${sub.id}/sign`);
  });

  // Step 2/3 — print & sign + upload
  router.get('/:token/vetting/:id/sign', async (req: any, res) => {
    const id = parseInt(String(req.params.id), 10);
    if (!Number.isFinite(id)) return res.status(404).send('Not found');
    const sub = await prisma.hostVettingSubmission.findFirst({ where: { id, providerId: req.hostProvider!.id } });
    if (!sub) return res.status(404).send('Vetting form not found.');
    res.send(renderSignPage(req.hostToken!, sub));
  });

  router.post('/:token/vetting/:id/upload', (req: any, res) => {
    vettingUpload.single('file')(req, res, async (err: any) => {
      if (err) return res.status(400).json({ error: err.message || 'Upload failed' });
      if (!req.file) return res.status(400).json({ error: 'No file received' });
      const id = parseInt(String(req.params.id), 10);
      const sub = await prisma.hostVettingSubmission.findFirst({ where: { id, providerId: req.hostProvider!.id }, select: { id: true } });
      if (!sub) return res.status(404).json({ error: 'Vetting form not found' });
      const relPath = path.join('host-vetting', String(req.hostProvider!.id), req.file.filename);
      await prisma.hostVettingSubmission.update({
        where: { id },
        data: { signedFilePath: relPath, signedFileName: req.file.originalname, signedUploadedAt: new Date(), status: 'signed' },
      });
      res.json({ ok: true });
    });
  });

  return router;
}

// ─── Admin router — list + download a host's signed forms ───────────────────
// Mounted under /sis/api/host-vetting (behind requireAuth). The provider
// detail view in admin.html lists submissions and links to the file.
export function hostVettingAdminRoutes(prisma: PrismaClient) {
  const router = Router();

  router.get('/', async (req, res) => {
    const providerId = parseInt(String(req.query?.providerId ?? ''), 10);
    if (!Number.isFinite(providerId)) return res.status(400).json({ error: 'providerId required' });
    const subs = await prisma.hostVettingSubmission.findMany({
      where: { providerId },
      orderBy: { id: 'desc' },
    });
    res.json(subs);
  });

  // Stream the signed file for a submission (inline so it previews in-browser).
  router.get('/:id/file', async (req, res) => {
    const id = parseInt(String(req.params.id), 10);
    if (!Number.isFinite(id)) return res.status(404).send('Not found');
    const sub = await prisma.hostVettingSubmission.findUnique({ where: { id }, select: { signedFilePath: true, signedFileName: true } });
    if (!sub?.signedFilePath) return res.status(404).send('No signed file on file');
    const abs = path.join(__dirname, '..', '..', 'uploads', sub.signedFilePath);
    if (!fs.existsSync(abs)) return res.status(404).send('File missing on disk');
    res.setHeader('Content-Disposition', `inline; filename="${(sub.signedFileName || 'signed-form').replace(/"/g, '')}"`);
    res.sendFile(abs);
  });

  return router;
}
