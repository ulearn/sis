// Teacher contract signing — magic-link layer (replaces Zoho Sign).
//
// Public (no session, token-authed):
//   GET  /teacher-contract/:token             → sign page (or used/expired notice)
//   GET  /teacher-contract/:token/preview.pdf → the contract PDF to read
//   POST /teacher-contract/:token/sign        → stamp + record signature
//
// Admin (staff session, mounted under /sis/api/teacher-contract):
//   GET  /:id/status         → { sent, sentAt, signed, signedAt, url }
//   POST /:id/token          → mint (or reuse) a link, return the URL
//   POST /:id/send           → mint + email the link from dos@
//   GET  /:id/preview.pdf     → staff preview
//   GET  /:id/signed.pdf      → the signed copy
import { Router } from 'express';
import crypto from 'crypto';
import fs from 'fs';
import { PrismaClient } from '../generated/prisma/client';
import { renderPreviewBytes, signContract } from '../scripts/teacher-contract';
import { sendEmail } from '../scripts/email';

const EXPIRY_DAYS = 14;
const BASE_URL = process.env.SIS_BASE_URL || 'https://sis.ulearnschool.com';

function newToken() { return crypto.randomBytes(24).toString('hex'); } // 48 hex chars

// Reuse an unused, unexpired token if the teacher already has one (so
// re-sending doesn't invalidate a link already in their inbox); else mint.
async function mintTeacherToken(prisma: PrismaClient, teacherId: number) {
  const existing = await prisma.teacherContractToken.findFirst({
    where: { teacherId, usedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: 'desc' },
  });
  if (existing) return existing;
  return prisma.teacherContractToken.create({
    data: { token: newToken(), teacherId, expiresAt: new Date(Date.now() + EXPIRY_DAYS * 86400000) },
  });
}

type Resolved = { row: any; state: 'valid' | 'used' | 'expired' } | null;
async function resolveTeacherToken(prisma: PrismaClient, token: string): Promise<Resolved> {
  if (!token || !/^[a-f0-9]{48}$/.test(token)) return null;
  const row = await prisma.teacherContractToken.findUnique({ where: { token }, include: { teacher: true } });
  if (!row) return null;
  if (row.usedAt) return { row, state: 'used' };
  if (row.expiresAt < new Date()) return { row, state: 'expired' };
  return { row, state: 'valid' };
}

function esc(s: any): string {
  return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));
}

// ── PUBLIC ROUTES ─────────────────────────────────────────────────────────
export function publicTeacherContractRoutes(prisma: PrismaClient): Router {
  const router = Router();

  router.get('/:token', async (req, res) => {
    const r = await resolveTeacherToken(prisma, req.params.token);
    if (!r) return res.status(404).send(messagePage('Link not found', 'This signing link isn’t valid. Please contact ULearn.'));
    if (r.state === 'used') return res.send(messagePage('Already signed', 'This contract has already been signed — thank you. Nothing more to do.'));
    if (r.state === 'expired') return res.send(messagePage('Link expired', 'This signing link has expired. Please contact ULearn for a new one.'));
    res.send(signPage(r.row.teacher, req.params.token));
  });

  router.get('/:token/preview.pdf', async (req, res) => {
    const r = await resolveTeacherToken(prisma, req.params.token);
    if (!r || r.state === 'expired') return res.status(404).end();
    try {
      const bytes = await renderPreviewBytes(prisma, r.row.teacherId);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline; filename="ULearn-Employment-Contract.pdf"');
      res.send(Buffer.from(bytes));
    } catch (e: any) { res.status(500).end(); }
  });

  router.post('/:token/sign', async (req, res) => {
    try {
      const r = await resolveTeacherToken(prisma, req.params.token);
      if (!r) return res.status(404).json({ error: 'Link not found' });
      if (r.state === 'used') return res.status(400).json({ error: 'This contract has already been signed.' });
      if (r.state === 'expired') return res.status(400).json({ error: 'This signing link has expired.' });

      const { mode, signerName, agreed, font, signatureSvg, signaturePngB64 } = req.body || {};
      if (!agreed) return res.status(400).json({ error: 'Please tick the box to confirm you agree.' });
      if (!signaturePngB64) return res.status(400).json({ error: 'A signature is required.' });

      const t = r.row.teacher;
      await signContract(prisma, {
        teacherId: t.id,
        mode: mode === 'drawn' ? 'drawn' : 'typed',
        signerName: (signerName || `${t.firstName} ${t.lastName}`).trim(),
        signerEmail: t.email || null,
        font: font || null,
        signatureSvg: signatureSvg || null,
        signaturePngB64,
        ipAddress: String(req.headers['x-forwarded-for'] || req.socket.remoteAddress || '') || null,
        userAgent: req.headers['user-agent'] || null,
      });
      await prisma.teacherContractToken.update({ where: { id: r.row.id }, data: { usedAt: new Date() } });
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e?.message || 'Signing failed' });
    }
  });

  return router;
}

// ── ADMIN ROUTES (staff session) ────────────────────────────────────────────
export function teacherContractAdminRoutes(prisma: PrismaClient): Router {
  const router = Router();

  router.get('/:id/status', async (req, res) => {
    try {
      const id = Number(req.params.id);
      const t = await prisma.teacher.findUnique({ where: { id }, select: { contractSignedAt: true } });
      if (!t) return res.status(404).json({ error: 'Teacher not found' });
      const tok = await prisma.teacherContractToken.findFirst({ where: { teacherId: id }, orderBy: { createdAt: 'desc' } });
      res.json({
        signed: !!t.contractSignedAt,
        signedAt: t.contractSignedAt,
        sent: !!tok,
        sentAt: tok?.createdAt || null,
        linkActive: !!tok && !tok.usedAt && tok.expiresAt > new Date(),
        url: tok && !tok.usedAt && tok.expiresAt > new Date() ? `${BASE_URL}/teacher-contract/${tok.token}` : null,
      });
    } catch (e: any) { res.status(500).json({ error: e?.message || String(e) }); }
  });

  router.post('/:id/token', async (req, res) => {
    try {
      const id = Number(req.params.id);
      const t = await prisma.teacher.findUnique({ where: { id }, select: { id: true } });
      if (!t) return res.status(404).json({ error: 'Teacher not found' });
      const tok = await mintTeacherToken(prisma, id);
      res.json({ url: `${BASE_URL}/teacher-contract/${tok.token}`, expiresAt: tok.expiresAt });
    } catch (e: any) { res.status(500).json({ error: e?.message || String(e) }); }
  });

  router.post('/:id/send', async (req, res) => {
    try {
      const id = Number(req.params.id);
      const t = await prisma.teacher.findUnique({ where: { id }, select: { id: true, firstName: true, lastName: true, email: true } });
      if (!t) return res.status(404).json({ error: 'Teacher not found' });
      if (!t.email) return res.status(400).json({ error: 'This teacher has no email address.' });
      const tok = await mintTeacherToken(prisma, id);
      const url = `${BASE_URL}/teacher-contract/${tok.token}`;
      const html = `
        <p>Hi ${esc(t.firstName)},</p>
        <p>Welcome to the ULearn team. Your employment contract is ready to review and sign online — no printing or scanning needed.</p>
        <p style="margin:24px 0;"><a href="${esc(url)}" style="background:#2f6b4f;color:#fff;padding:12px 22px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block;">Review &amp; sign your contract →</a></p>
        <p>The link is personal to you and stays active for ${EXPIRY_DAYS} days. If you have any questions, just reply to this email.</p>
        <p>Best regards,<br>Paul Gill<br>Director of Studies, ULearn School Dublin</p>`;
      await sendEmail({
        from: 'dos@ulearnschool.com',
        fromName: 'Paul Gill — ULearn',
        to: t.email,
        subject: 'Your ULearn employment contract — ready to sign',
        html,
      });
      res.json({ success: true, sentTo: t.email });
    } catch (e: any) { res.status(500).json({ error: e?.message || String(e) }); }
  });

  router.get('/:id/preview.pdf', async (req, res) => {
    try {
      const bytes = await renderPreviewBytes(prisma, Number(req.params.id));
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline; filename="contract-preview.pdf"');
      res.send(Buffer.from(bytes));
    } catch (e: any) { res.status(500).json({ error: e?.message || String(e) }); }
  });

  router.get('/:id/signed.pdf', async (req, res) => {
    try {
      const sig = await prisma.teacherSignature.findFirst({ where: { teacherId: Number(req.params.id) }, orderBy: { signedAt: 'desc' } });
      if (!sig?.pdfPath || !fs.existsSync(sig.pdfPath)) return res.status(404).json({ error: 'No signed contract on file' });
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline; filename="signed-contract.pdf"');
      res.send(fs.readFileSync(sig.pdfPath));
    } catch (e: any) { res.status(500).json({ error: e?.message || String(e) }); }
  });

  return router;
}

// ── HTML ────────────────────────────────────────────────────────────────────
function shell(title: string, body: string): string {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)} · ULearn</title>
<style>
  @font-face { font-family:'Tomatoes';   src:url('/sis/partners/public/fonts/Tomatoes.ttf') format('truetype'); font-display:swap; }
  @font-face { font-family:'Autography'; src:url('/sis/partners/public/fonts/Autography.otf') format('opentype'); font-display:swap; }
  @font-face { font-family:'Bulgatti';   src:url('/sis/partners/public/fonts/Bulgatti.ttf') format('truetype'); font-display:swap; }
  :root { --green:#2f6b4f; --green-light:#e8f1ec; --ink:#1e293b; --muted:#64748b; --line:#e2e8f0; }
  * { box-sizing:border-box; }
  body { margin:0; font-family:'Plus Jakarta Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif; color:var(--ink); background:#f1f5f9; }
  header { background:var(--green); color:#fff; padding:16px 24px; font-weight:700; font-size:18px; }
  .wrap { max-width:1320px; margin:0 auto; padding:24px; display:grid; grid-template-columns:minmax(0,1fr) 360px; gap:24px; align-items:start; }
  @media (max-width:860px){ .wrap { grid-template-columns:1fr; } }
  .pdf-card, .sign-card { background:#fff; border:1px solid var(--line); border-radius:12px; overflow:hidden; }
  .pdf-card iframe { width:100%; height:88vh; border:0; display:block; }
  @media (max-width:860px){ .pdf-card iframe { height:60vh; } }
  .sign-card { padding:20px; position:sticky; top:24px; }
  .sign-card h2 { margin:0 0 4px; font-size:18px; }
  .sign-card p.sub { margin:0 0 16px; color:var(--muted); font-size:13px; }
  label { font-size:12px; font-weight:600; color:var(--muted); display:block; margin-bottom:4px; }
  input[type=text] { width:100%; padding:9px 11px; border:1px solid var(--line); border-radius:8px; font-size:14px; font-family:inherit; margin-bottom:14px; }
  input[type=text]:focus { outline:none; border-color:var(--green); }
  .sig-tabs { display:flex; gap:4px; border-bottom:1px solid var(--line); margin-bottom:12px; }
  .sig-tab { flex:1; background:none; border:0; border-bottom:2px solid transparent; padding:8px; font-size:13px; font-weight:600; color:var(--muted); cursor:pointer; font-family:inherit; }
  .sig-tab.active { color:var(--green); border-bottom-color:var(--green); }
  .sig-panel { display:none; } .sig-panel.active { display:block; }
  .font-option { border:1.5px solid var(--line); border-radius:8px; padding:8px 12px; margin-bottom:8px; cursor:pointer; display:flex; align-items:center; justify-content:space-between; }
  .font-option.selected { border-color:var(--green); background:var(--green-light); }
  .font-preview { color:var(--ink); }
  .font-preview.tomatoes { font-family:'Tomatoes',cursive; font-size:22px; }
  .font-preview.autography { font-family:'Autography',cursive; font-size:26px; }
  .font-preview.bulgatti { font-family:'Bulgatti',cursive; font-size:24px; }
  .font-label { font-size:11px; color:var(--muted); }
  #sig-canvas-wrap { border:1.5px dashed var(--line); border-radius:8px; height:130px; position:relative; background:#fff; }
  #sig-canvas { width:100%; height:100%; touch-action:none; }
  .sig-canvas-hint { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; color:#cbd5e1; font-size:13px; pointer-events:none; }
  .sig-canvas-hint.hide { display:none; }
  .sig-clear { background:none; border:0; color:var(--muted); font-size:12px; cursor:pointer; margin-top:4px; text-decoration:underline; }
  .agree { display:flex; gap:9px; align-items:flex-start; margin:16px 0; font-size:13px; color:var(--ink); }
  .agree input { margin-top:2px; }
  .submit { width:100%; background:var(--green); color:#fff; border:0; border-radius:8px; padding:12px; font-size:15px; font-weight:700; cursor:pointer; font-family:inherit; }
  .submit:disabled { opacity:.5; cursor:not-allowed; }
  .err { color:#b91c1c; font-size:13px; margin-top:10px; display:none; }
  .err.show { display:block; }
  .done { text-align:center; padding:40px 20px; }
  .done .tick { width:56px; height:56px; border-radius:50%; background:var(--green-light); color:var(--green); display:flex; align-items:center; justify-content:center; margin:0 auto 16px; font-size:30px; }
  .msg-wrap { max-width:520px; margin:10vh auto; background:#fff; border:1px solid var(--line); border-radius:12px; padding:40px; text-align:center; }
</style></head><body>
<header>ULearn School Dublin</header>
${body}
</body></html>`;
}

function messagePage(title: string, body: string): string {
  return shell(title, `<div class="msg-wrap"><h2>${esc(title)}</h2><p style="color:#64748b">${esc(body)}</p></div>`);
}

function signPage(teacher: any, token: string): string {
  const fullName = `${teacher.firstName || ''} ${teacher.lastName || ''}`.trim();
  const body = `
  <div class="wrap">
    <div class="pdf-card">
      <iframe title="Your employment contract" src="/teacher-contract/${esc(token)}/preview.pdf#toolbar=0&navpanes=0&view=FitH"></iframe>
    </div>
    <div class="sign-card" id="signCard">
      <h2>Sign your contract</h2>
      <p class="sub">Please read your contract on the left, then sign below.</p>
      <label for="signerName">Full name</label>
      <input type="text" id="signerName" autocomplete="name" value="${esc(fullName)}" />
      <div class="sig-tabs">
        <button type="button" class="sig-tab active" data-sig-mode="typed">Type</button>
        <button type="button" class="sig-tab" data-sig-mode="drawn">Draw</button>
      </div>
      <div class="sig-panel active" id="sigPanelTyped">
        <div class="font-option selected" data-font="Tomatoes"><span class="font-preview tomatoes">Your name</span><span class="font-label">Tomatoes</span></div>
        <div class="font-option" data-font="Autography"><span class="font-preview autography">Your name</span><span class="font-label">Autography</span></div>
        <div class="font-option" data-font="Bulgatti"><span class="font-preview bulgatti">Your name</span><span class="font-label">Bulgatti</span></div>
      </div>
      <div class="sig-panel" id="sigPanelDrawn">
        <div id="sig-canvas-wrap"><canvas id="sig-canvas"></canvas><div class="sig-canvas-hint" id="sigCanvasHint">Draw your signature here</div></div>
        <button type="button" class="sig-clear" id="sigClearBtn">Clear</button>
      </div>
      <div class="agree">
        <input type="checkbox" id="sigAgreed" />
        <label for="sigAgreed" style="margin:0;font-weight:500;color:#1e293b;cursor:pointer;">I have read and I accept the terms of this employment contract, and I agree that my electronic signature is legally binding.</label>
      </div>
      <button type="button" class="submit" id="submitBtn" disabled>Sign contract</button>
      <div class="err" id="errBox"></div>
    </div>
  </div>
  <script>
  (function(){
    var token = ${JSON.stringify(token)};
    var nameInput=document.getElementById('signerName'), agreed=document.getElementById('sigAgreed');
    var submitBtn=document.getElementById('submitBtn'), errBox=document.getElementById('errBox');
    var currentMode='typed', currentFont='Tomatoes', drawnStrokes=[];
    document.querySelectorAll('.sig-tab').forEach(function(t){ t.addEventListener('click',function(){
      document.querySelectorAll('.sig-tab').forEach(function(x){x.classList.toggle('active',x===t);});
      currentMode=t.dataset.sigMode;
      document.getElementById('sigPanelTyped').classList.toggle('active',currentMode==='typed');
      document.getElementById('sigPanelDrawn').classList.toggle('active',currentMode==='drawn');
      if(currentMode==='drawn') setupCanvas(); update();
    });});
    document.querySelectorAll('.font-option').forEach(function(o){ o.addEventListener('click',function(){
      document.querySelectorAll('.font-option').forEach(function(x){x.classList.toggle('selected',x===o);});
      currentFont=o.dataset.font;
    });});
    function updatePreviews(){ var d=(nameInput.value||'Your name').trim()||'Your name'; document.querySelectorAll('.font-preview').forEach(function(el){el.textContent=d;}); }
    nameInput.addEventListener('input',function(){updatePreviews();update();});
    agreed.addEventListener('change',update);
    var canvas,ctx,drawing=false,lastPt=null,dpr=window.devicePixelRatio||1;
    function setupCanvas(){ if(canvas)return; canvas=document.getElementById('sig-canvas'); var wrap=document.getElementById('sig-canvas-wrap');
      canvas.width=wrap.offsetWidth*dpr; canvas.height=wrap.offsetHeight*dpr; ctx=canvas.getContext('2d'); ctx.scale(dpr,dpr);
      ctx.lineWidth=2; ctx.lineCap='round'; ctx.lineJoin='round'; ctx.strokeStyle='#1e293b';
      var hint=document.getElementById('sigCanvasHint');
      function pt(e){ var r=canvas.getBoundingClientRect(); var p=e.touches?e.touches[0]:e; return {x:p.clientX-r.left,y:p.clientY-r.top}; }
      function start(e){ e.preventDefault(); drawing=true; lastPt=pt(e); drawnStrokes.push([lastPt]); hint.classList.add('hide'); }
      function move(e){ if(!drawing)return; e.preventDefault(); var p=pt(e); ctx.beginPath(); ctx.moveTo(lastPt.x,lastPt.y); ctx.lineTo(p.x,p.y); ctx.stroke(); drawnStrokes[drawnStrokes.length-1].push(p); lastPt=p; update(); }
      function end(e){ if(drawing){e.preventDefault(); drawing=false;} }
      canvas.addEventListener('mousedown',start); canvas.addEventListener('mousemove',move); canvas.addEventListener('mouseup',end); canvas.addEventListener('mouseleave',end);
      canvas.addEventListener('touchstart',start,{passive:false}); canvas.addEventListener('touchmove',move,{passive:false}); canvas.addEventListener('touchend',end,{passive:false});
    }
    document.getElementById('sigClearBtn').addEventListener('click',function(){ if(!ctx)return; ctx.clearRect(0,0,canvas.width,canvas.height); drawnStrokes=[]; document.getElementById('sigCanvasHint').classList.remove('hide'); update(); });
    function hasDrawing(){ return drawnStrokes.some(function(s){return s.length>1;}); }
    function update(){ var n=!!nameInput.value.trim(); var sig=currentMode==='typed'?n:hasDrawing(); submitBtn.disabled=!(n&&agreed.checked&&sig); }
    function typedPng(){ var name=nameInput.value.trim(); var c=document.createElement('canvas'); var w=720,h=130; c.width=w;c.height=h; var cx=c.getContext('2d'); cx.fillStyle='#fff'; cx.fillRect(0,0,w,h);
      var fam=currentFont==='Autography'?"'Autography',cursive":currentFont==='Bulgatti'?"'Bulgatti',cursive":"'Tomatoes',cursive";
      var size=currentFont==='Tomatoes'?48:60; cx.fillStyle='#1e293b'; cx.textBaseline='middle';
      while(size>22){ cx.font=size+'px '+fam; if(cx.measureText(name).width<=w-40)break; size-=4; }
      cx.font=size+'px '+fam; cx.fillText(name,20,h/2); return c.toDataURL('image/png'); }
    function drawnPng(){ var wrap=document.getElementById('sig-canvas-wrap'); var w=wrap.offsetWidth,h=wrap.offsetHeight; var c=document.createElement('canvas'); c.width=w;c.height=h; var cx=c.getContext('2d'); cx.fillStyle='#fff'; cx.fillRect(0,0,w,h); cx.strokeStyle='#1e293b'; cx.lineWidth=2; cx.lineCap='round'; cx.lineJoin='round';
      drawnStrokes.forEach(function(s){ if(s.length<2)return; cx.beginPath(); cx.moveTo(s[0].x,s[0].y); for(var i=1;i<s.length;i++)cx.lineTo(s[i].x,s[i].y); cx.stroke(); }); return c.toDataURL('image/png'); }
    function drawnSvg(){ var wrap=document.getElementById('sig-canvas-wrap'); var w=wrap.offsetWidth,h=wrap.offsetHeight;
      var paths=drawnStrokes.filter(function(s){return s.length>1;}).map(function(s){ return '<path d="'+s.map(function(p,i){return (i?'L':'M')+p.x.toFixed(1)+' '+p.y.toFixed(1);}).join(' ')+'" />'; }).join('');
      return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 '+w+' '+h+'" fill="none" stroke="#1e293b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'+paths+'</svg>'; }
    submitBtn.addEventListener('click',function(){
      errBox.classList.remove('show'); submitBtn.disabled=true; submitBtn.textContent='Signing…';
      var payload={ mode:currentMode, signerName:nameInput.value.trim(), agreed:agreed.checked,
        font:currentMode==='typed'?currentFont:null, signatureSvg:currentMode==='drawn'?drawnSvg():null,
        signaturePngB64:currentMode==='typed'?typedPng():drawnPng() };
      fetch('/teacher-contract/'+token+'/sign',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)})
        .then(function(r){return r.json();}).then(function(d){
          if(!d.success) throw new Error(d.error||'Sign failed');
          document.getElementById('signCard').innerHTML='<div class="done"><div class="tick">✓</div><h2>Contract signed</h2><p style="color:#64748b">Thank you, '+(nameInput.value.trim().split(' ')[0]||'')+'. A copy has been saved. You can close this page.</p></div>';
        }).catch(function(e){ errBox.textContent=String(e.message||e); errBox.classList.add('show'); submitBtn.disabled=false; submitBtn.textContent='Sign contract'; });
    });
    updatePreviews(); update();
  })();
  </script>`;
  return shell('Sign your contract', body);
}
