/* ─────────────────────────────────────────────────────────────────────────────
   Seat Clearance UI — SHARED, single source of truth.
   Used by BOTH the partner portal (partners.html) and the public tease iframe
   (seat-clearance-embed.html) so the two can NEVER drift. Extract-not-duplicate.

   Mode: window.CLEARANCE_MODE = 'portal' (default) | 'public'
     - portal: data from /sis/partners/api/clearance; Reserve Now → in-portal Stripe checkout.
     - public: data from /sis/api/clearance-public; Reserve Now → open the portal to log in.
   Container: an element with id="clearanceBody".
   ───────────────────────────────────────────────────────────────────────────── */
(function () {
  var MODE = window.CLEARANCE_MODE || 'portal';
  var IS_PORTAL = MODE === 'portal';
  var API_URL = IS_PORTAL ? '/sis/partners/api/clearance' : '/sis/api/clearance-public';
  var PORTAL_URL = 'https://sis.ulearnschool.com/sis/partners?tab=clearance';

  let _clrData = null, _clrSel = {}, _clrTimer = null;
  const _clrEsc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const _clrEur = (n) => '€' + Number(n).toLocaleString('en-IE', { maximumFractionDigits: 0 });

  async function loadClearance() {
    const body = document.getElementById('clearanceBody');
    body.innerHTML = '<div style="padding:48px;text-align:center;color:#6b7280">Loading…</div>';
    try { _clrData = await fetch(API_URL).then(r => r.json()); }
    catch (e) { body.innerHTML = '<div style="padding:48px;text-align:center;color:#991b1b">Could not load the sale.</div>'; return; }
    _clrSel = {};
    renderClearance();
  }

  function _clrSelCount() { return Object.values(_clrSel).reduce((s, set) => s + set.size, 0); }
  function _clrOffer(id) { return (_clrData.offers || []).find(o => o.id === id); }

  function _clrToggleSeat(offerId, idx, el) {
    const o = _clrOffer(offerId); if (!o) return;
    if (!_clrSel[offerId]) _clrSel[offerId] = new Set();
    const set = _clrSel[offerId];
    if (set.has(idx)) set.delete(idx); else set.add(idx);
    el.classList.toggle('clr-seat-on', set.has(idx));
    _clrUpdateCart();
  }

  function _clrUpdateCart() {
    const panel = document.getElementById('clrCartItems');
    const totalEl = document.getElementById('clrTotal');
    const subEl = document.getElementById('clrSub');
    const cntEl = document.getElementById('clrCount');
    const btn = document.getElementById('clrReserveBtn');
    if (!panel) return;
    let total = 0, n = 0, rows = '';
    (_clrData.offers || []).forEach(o => {
      const set = _clrSel[o.id]; if (!set) return;
      [...set].sort((a, b) => a - b).forEach(idx => {
        n++; total += o.depositPerSeat;
        rows += `<div style="display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid #eef0f2">
          <div style="flex:1;min-width:0">
            <div style="font-weight:700;font-size:13px">Seat ${String(idx + 1).padStart(2, '0')}</div>
            <div style="font-size:11px;color:#6b7280;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${_clrEsc(o.title)}</div>
          </div>
          <div style="font-weight:700;font-size:13px">${_clrEur(o.depositPerSeat)}</div>
          <button onclick="_clrToggleSeatById(${o.id},${idx})" title="Remove" style="background:none;border:0;color:#9ca3af;cursor:pointer;font-size:16px;line-height:1">&times;</button>
        </div>`;
      });
    });
    panel.innerHTML = rows || '<div style="padding:18px 0;color:#9ca3af;font-size:13px;text-align:center">No seats selected yet.</div>';
    if (cntEl) cntEl.textContent = `${n} seat${n === 1 ? '' : 's'} selected`;
    if (subEl) subEl.textContent = _clrEur(total);
    if (totalEl) totalEl.textContent = _clrEur(total);
    if (btn) btn.disabled = n === 0;
  }
  // Re-toggle from the cart's × button (find the tile and flip it)
  function _clrToggleSeatById(offerId, idx) {
    const tile = document.querySelector(`.clr-seat[data-o="${offerId}"][data-i="${idx}"]`);
    if (tile) _clrToggleSeat(offerId, idx, tile);
    else { _clrSel[offerId] && _clrSel[offerId].delete(idx); _clrUpdateCart(); }
  }
  function _clrClearAll() {
    _clrSel = {};
    document.querySelectorAll('.clr-seat-on').forEach(t => t.classList.remove('clr-seat-on'));
    _clrUpdateCart();
  }

  async function _clrReserve() {
    // PUBLIC mode — the tease lets them choose; the reserve "business end" needs login.
    // Break out of the iframe to the portal (deep-linked to the clearance tab).
    if (!IS_PORTAL) {
      // Carry the selection into the portal (offerId:qty) so it survives the login handoff.
      // The portal pre-fills the cart (hydrateFromPick), re-validated against live availability.
      const picks = (_clrData.offers || []).map(o => [o.id, (_clrSel[o.id] || new Set()).size])
        .filter(x => x[1] > 0).map(x => x[0] + ':' + x[1]).join(',');
      const url = PORTAL_URL + (picks ? '&clrpick=' + encodeURIComponent(picks) : '');
      try { window.open(url, '_blank', 'noopener'); } catch (e) { top.location = url; }
      return;
    }
    const items = (_clrData.offers || []).map(o => ({ offerId: o.id, qty: (_clrSel[o.id] || new Set()).size })).filter(i => i.qty > 0);
    if (!items.length) return;
    const btn = document.getElementById('clrReserveBtn');
    if (btn) { btn.disabled = true; btn.textContent = 'Reserving…'; }
    try {
      const r = await fetch('/sis/partners/api/clearance/reserve', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ items }),
      }).then(x => x.json());
      if (!r.ok) throw new Error(r.error || 'Reservation failed');
      const n = items.reduce((s, i) => s + i.qty, 0);
      if (r.clientSecret && r.publishableKey) { await _clrOpenStripe(r, n); }
      else { alert('Seats held, but card checkout isn\'t configured yet. Please contact partners@ulearnschool.com.'); loadClearance(); }
    } catch (e) {
      alert('Could not reserve: ' + e.message);
      if (btn) { btn.disabled = false; btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>Reserve Now'; }
      loadClearance();
    }
  }

  // ── Embedded Stripe Checkout — the exact deposit total, paid IN-PORTAL (portal mode only) ──
  let _clrStripe = null, _clrCheckoutObj = null, _clrPollTimer = null, _clrSessionId = null;
  function _clrLoadStripeJs() {
    return new Promise((resolve, reject) => {
      if (window.Stripe) return resolve();
      const s = document.createElement('script'); s.src = 'https://js.stripe.com/v3/';
      s.onload = () => resolve(); s.onerror = () => reject(new Error('Stripe.js failed to load'));
      document.head.appendChild(s);
    });
  }
  async function _clrOpenStripe(r, n) {
    _clrSessionId = r.sessionId;
    const old = document.getElementById('clrCheckout'); if (old) old.remove();
    const o = document.createElement('div');
    o.id = 'clrCheckout';
    o.style.cssText = 'position:fixed;inset:0;z-index:100000;background:rgba(13,21,38,.62);display:flex;align-items:flex-start;justify-content:center;padding:16px;overflow:auto';
    o.innerHTML = `
      <div style="width:100%;max-width:480px;background:#fff;border-radius:14px;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 24px 70px rgba(0,0,0,.45)">
        <div style="flex:0 0 auto;display:flex;align-items:center;justify-content:space-between;padding:12px 16px;border-bottom:1px solid #eef0f2">
          <div><div style="font-weight:800;font-size:15px;color:#10151f">Secure your ${n} seat${n > 1 ? 's' : ''}</div><div style="font-size:12px;color:#6b7280">Deposit ${_clrEur(r.total)} · card payment</div></div>
          <button onclick="_clrCloseCheckout()" style="background:none;border:0;font-size:13px;font-weight:700;color:#6b7280;cursor:pointer">Close</button>
        </div>
        <div id="clrStripeMount" style="padding:8px"></div>
      </div>`;
    document.body.appendChild(o);
    try {
      await _clrLoadStripeJs();
      _clrStripe = window.Stripe(r.publishableKey);
      _clrCheckoutObj = await _clrStripe.initEmbeddedCheckout({ clientSecret: r.clientSecret });
      _clrCheckoutObj.mount('#clrStripeMount');
    } catch (e) {
      const m = document.getElementById('clrStripeMount'); if (m) m.innerHTML = '<div style="padding:28px;text-align:center;color:#991b1b;font-size:13px">Could not load checkout: ' + _clrEsc(e.message) + '</div>';
    }
    if (_clrPollTimer) clearInterval(_clrPollTimer);
    _clrPollTimer = setInterval(() => _clrCheckPaid(), 2500);
  }
  async function _clrCheckPaid() {
    if (!_clrSessionId) return;
    try {
      const s = await fetch('/sis/partners/api/clearance/checkout-status?sessionId=' + encodeURIComponent(_clrSessionId)).then(x => x.json());
      if (s.paid) {
        if (_clrPollTimer) { clearInterval(_clrPollTimer); _clrPollTimer = null; }
        try { _clrCheckoutObj && _clrCheckoutObj.destroy(); } catch (_) {}
        const o = document.getElementById('clrCheckout'); if (o) o.remove();
        _clrSessionId = null;
        alert('Payment received — your seats are reserved. 🎉');
        loadClearance();
      }
    } catch (_) {}
  }
  function _clrCloseCheckout() {
    if (_clrPollTimer) { clearInterval(_clrPollTimer); _clrPollTimer = null; }
    try { _clrCheckoutObj && _clrCheckoutObj.destroy(); } catch (_) {}
    _clrCheckoutObj = null; _clrSessionId = null;
    const o = document.getElementById('clrCheckout'); if (o) o.remove();
    loadClearance();
  }

  // ── V2 ALLOCATION model — €0 time-limited "Claim This Rate" (no seats, no cart) ──
  function _clrClaimedSet() {
    const s = new Set();
    (_clrData.myReservations || []).forEach(r => {
      if (['CLAIMED', 'RESERVED', 'ASSIGNED'].indexOf(r.status) >= 0) s.add(r.offerId);
    });
    return s;
  }
  async function _clrClaim(offerId, btn) {
    // Public tease → the claim "business end" needs login; carry the offer through.
    if (!IS_PORTAL) {
      const next = encodeURIComponent('/sis/partners?tab=clearance&clrclaim=' + offerId);
      window.open('/sis/partners?next=' + next, '_blank');
      return;
    }
    if (btn) { btn.disabled = true; btn.textContent = 'Claiming…'; }
    try {
      const r = await fetch('/sis/partners/api/clearance/claim', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ offerId }),
      }).then(x => x.json());
      if (!r.ok) throw new Error(r.error || 'Could not claim');
      loadClearance();   // re-render → shows the claimed state
    } catch (e) {
      alert('Could not claim: ' + e.message);
      if (btn) { btn.disabled = false; btn.textContent = 'Claim This Rate'; }
    }
  }

  function _clrStartCountdown(endsAtIso) {
    if (_clrTimer) { clearInterval(_clrTimer); _clrTimer = null; }
    const end = new Date(endsAtIso).getTime();
    const tick = () => {
      const el = document.getElementById('clrCountdown'); if (!el) { clearInterval(_clrTimer); return; }
      let diff = Math.max(0, end - Date.now());
      const d = Math.floor(diff / 86400000); diff -= d * 86400000;
      const h = Math.floor(diff / 3600000); diff -= h * 3600000;
      const m = Math.floor(diff / 60000); diff -= m * 60000;
      const s = Math.floor(diff / 1000);
      const box = (v, l) => `<div style="text-align:center"><div style="background:#0f1830;color:#8ee34f;font-weight:800;font-size:17px;border-radius:6px;padding:3px 7px;min-width:38px;font-variant-numeric:tabular-nums">${String(v).padStart(2, '0')}</div><div style="font-size:9px;color:#6b7280;letter-spacing:.06em;margin-top:2px">${l}</div></div>`;
      el.innerHTML = box(d, 'DAYS') + box(h, 'HRS') + box(m, 'MINS') + box(s, 'SECS');
      if (end - Date.now() <= 0) { clearInterval(_clrTimer); setTimeout(loadClearance, 1000); }
    };
    tick(); _clrTimer = setInterval(tick, 1000);
  }

  function renderClearance() {
    const body = document.getElementById('clearanceBody');
    const d = _clrData;
    if (IS_PORTAL && (!d || !d.eligible)) { body.innerHTML = '<div style="padding:48px;text-align:center;color:#6b7280">This offer isn’t available on your account.</div>'; return; }
    if (!d || !d.sale || d.state === 'none') { body.innerHTML = '<div style="padding:48px;text-align:center;color:#6b7280">No clearance sale is scheduled right now — we’ll be in touch when the next one opens.</div>'; return; }
    if (d.state === 'upcoming') { body.innerHTML = `<div style="padding:48px;text-align:center;color:#1a1a2e"><div style="font-size:22px;font-weight:800;margin-bottom:8px">${_clrEsc(d.sale.name)}</div><div style="color:#6b7280">Opens ${new Date(d.sale.startsAt).toLocaleString('en-IE')}</div></div>`; return; }
    if (d.state === 'ended') { body.innerHTML = `<div style="padding:48px;text-align:center;color:#1a1a2e"><div style="font-size:22px;font-weight:800;margin-bottom:8px">This clearance sale has ended</div><div style="color:#6b7280">Watch this space — the next release lands in the last week of next month.</div></div>`; return; }

    // ── V2 ALLOCATION layout — a pure time-limited-rate sale: no seat tiles, no
    // cart, no per-agency number. One "Claim This Rate" per offer; sell as many as
    // you like at the rate before the window closes. Scarcity is soft/global. ──
    const _offers = d.offers || [];
    if (_offers.length && _offers.every(o => o.model === 'ALLOCATION')) {
      const claimed = _clrClaimedSet();
      const deadline = new Date(d.sale.endsAt).toLocaleDateString('en-IE', { timeZone: 'UTC' });
      const startBy = '30/06/2027';
      const allocCard = (o) => {
        const pu = o.priceUnit === 'week' ? '/wk' : '';
        const isClaimed = claimed.has(o.id);
        const cta = isClaimed
          ? `<div style="width:100%;background:#eef7e3;border:1.5px solid #2e9e00;border-radius:10px;padding:10px 13px;display:flex;align-items:center;gap:9px">
               <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2e9e00" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="flex:0 0 auto"><polyline points="20 6 9 17 4 12"/></svg>
               <div style="font-size:12.5px;font-weight:800;color:#1a6600;line-height:1.25">Rate Claimed — enrol students at ${_clrEur(o.clearancePrice)}${pu} until ${deadline}</div>
             </div>`
          : `<button onclick="_clrClaim(${o.id},this)" style="width:100%;background:#1a6600;color:#fff;border:0;border-radius:10px;padding:12px;font-weight:800;font-size:15px;cursor:pointer">${IS_PORTAL ? 'Claim This Rate' : 'Log In to Claim'}</button>`;
        return `
          <div style="border:1px solid #e5e7eb;border-radius:10px;padding:11px 13px;margin-bottom:8px;background:#fff">
            <div style="display:flex;align-items:flex-start;gap:12px;flex-wrap:wrap;margin-bottom:9px">
              <div style="flex:1;min-width:180px">
                <div style="font-size:15px;font-weight:800;color:#1a1a2e;line-height:1.2">${_clrEsc(o.title)}</div>
                ${o.subtitle ? `<div style="font-size:11.5px;color:#6b7280">${_clrEsc(o.subtitle)}</div>` : ''}
              </div>
              <div style="text-align:right;white-space:nowrap;flex:0 0 auto">
                <span class="clr-num" style="text-decoration:line-through;color:#9aa2ac;font-size:13px">${_clrEur(o.retailPrice)}${pu}</span>
                <span class="clr-num" style="font-size:22px;font-weight:800;color:#2e9e00;letter-spacing:-.02em;margin-left:4px">${_clrEur(o.clearancePrice)}${pu}</span>
                <div style="font-size:10px;color:#6b7280;font-weight:600">Clearance Net Rate</div>
              </div>
            </div>
            ${cta}
          </div>`;
      };
      const v2feat = (t, s, p) => `<div style="flex:1;min-width:160px;display:flex;gap:9px;align-items:center"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="1.7" style="flex:0 0 auto"><path d="${p}"/></svg><div><div style="font-size:12.5px;font-weight:800;color:#10151f">${t}</div><div style="font-size:11.5px;color:#374151">${_clrEsc(s)}</div></div></div>`;
      body.innerHTML = `
        <style>
          #clearanceBody .clr-eyebrow{font-size:10px;font-weight:800;letter-spacing:.15em;text-transform:uppercase;color:#2e9e00}
          #clearanceBody .clr-num{font-variant-numeric:tabular-nums}
        </style>
        <div style="max-width:640px;margin:0 auto">
          <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap">
            <div>
              <div class="clr-eyebrow" style="margin-bottom:2px">Partners-Only Clearance</div>
              <div style="font-size:25px;font-weight:800;color:#10151f;letter-spacing:-.035em;line-height:1.0">Seat Clearance</div>
            </div>
            <div style="text-align:center">
              <div class="clr-eyebrow" style="color:#6b7280;margin-bottom:4px">Rate Ends ${deadline}</div>
              <div id="clrCountdown" style="display:flex;gap:5px"></div>
            </div>
          </div>
          <div style="margin:8px 0 10px;background:#f1f5ee;border:1.5px solid #d4af37;box-shadow:0 1px 4px rgba(0,0,0,.07);border-radius:8px;padding:8px 12px">
            <div style="font-size:12.5px;font-weight:800;color:#10151f;margin-bottom:4px">How It Works</div>
            <div style="display:flex;flex-direction:column;gap:3px;font-size:12.5px;color:#1f2937;font-weight:600">
              <div style="display:flex;gap:7px;align-items:center"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#2e9e00" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="flex:0 0 auto"><polyline points="20 6 9 17 4 12"/></svg>Click Claim Rate to enter Seat Clearance</div>
              <div style="display:flex;gap:7px;align-items:center"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#2e9e00" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="flex:0 0 auto"><polyline points="20 6 9 17 4 12"/></svg>Seats are limited — first come, first served</div>
              <div style="display:flex;gap:7px;align-items:center"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#2e9e00" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="flex:0 0 auto"><polyline points="20 6 9 17 4 12"/></svg>Students start any time up to ${startBy}</div>
              <div style="display:flex;gap:7px;align-items:center"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#2e9e00" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="flex:0 0 auto"><polyline points="20 6 9 17 4 12"/></svg>Offer ends ${deadline}</div>
            </div>
          </div>
          ${_offers.map(allocCard).join('')}
          <div style="margin-top:6px;font-size:11px;color:#9ca3af;text-align:center;line-height:1.4">Seats at this price are limited. If oversubscribed we will notify all partners. Subject to course availability &amp; our terms.</div>
          <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:12px;border-top:1px solid #eef0f2;padding-top:10px">
            ${v2feat('Deposit Accepted', 'Secure the enrolment with a €250 partial payment', 'M2 7a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2zM2 10h20')}
            ${v2feat('Flexible Start', `Students begin any time to ${startBy}`, 'M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z')}
            ${v2feat('Need Help?', 'partners@ulearnschool.com', 'M4 4h16v12H5.2L4 17.2z')}
          </div>
        </div>`;
      _clrStartCountdown(d.sale.endsAt);
      // Handoff from the public tease: ?clrclaim=<offerId> → auto-claim once logged in.
      try {
        const cid = parseInt(new URLSearchParams(location.search).get('clrclaim'), 10);
        if (IS_PORTAL && cid && !claimed.has(cid)) _clrClaim(cid, null);
        const u = new URL(location.href); if (u.searchParams.has('clrclaim')) { u.searchParams.delete('clrclaim'); history.replaceState(null, '', u.toString()); }
      } catch (e) {}
      return;
    }

    const assignBy = d.sale.assignBy ? new Date(d.sale.assignBy).toLocaleDateString('en-IE', { timeZone: 'UTC' }) : '';
    // A student, not furniture — a person figure (each tile is the "seat").
    const chair = (sz, col) => `<svg width="${sz}" height="${sz}" viewBox="0 0 24 24" fill="${col}"><path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"/><path d="M12 13.2c-3.9 0-7 2.4-7 5.4V20h14v-1.4c0-3-3.1-5.4-7-5.4z"/></svg>`;
    const offerCard = (o) => {
      const pu = o.priceUnit === 'week' ? '/wk' : '';
      const urgent = o.seatsLeft > 0 && o.seatsLeft <= 3;
      const badgeBg = !o.seatsLeft ? '#fee2e2' : urgent ? '#fff3e0' : '#eef7e3';
      const badgeFg = !o.seatsLeft ? '#991b1b' : urgent ? '#c2410c' : '#4d8a1e';
      const badgeTxt = !o.seatsLeft ? 'SOLD OUT' : urgent ? `ONLY ${o.seatsLeft} LEFT` : `${o.seatsLeft} LEFT`;
      const taken = o.seatsTaken || 0;
      const seats = Array.from({ length: o.seatsTotal }, (_, i) => {
        const num = String(i + 1).padStart(2, '0');
        if (i < taken) {
          // Already claimed by another partner — social proof for scarcity.
          return `<div title="Reserved by another partner" style="border:1px solid #eef0f2;border-radius:8px;padding:4px 2px;background:#f5f6f7;text-align:center;line-height:1.1;min-width:46px">
            <span style="display:block;margin:0 auto">${chair(15, '#c3c8d0')}</span>
            <div style="font-weight:700;font-size:9px;color:#9aa2ac;margin-top:1px">Reserved</div>
          </div>`;
        }
        return `<button class="clr-seat" data-o="${o.id}" data-i="${i}" onclick="_clrToggleSeat(${o.id},${i},this)"
          style="border:1px solid #e5e7eb;border-radius:8px;padding:4px 2px;background:#fff;cursor:pointer;text-align:center;min-width:46px;line-height:1.1">
          <span style="display:block;margin:0 auto">${chair(15, '#2e9e00')}</span>
          <div style="font-weight:700;font-size:10px;margin-top:1px">${num}</div>
        </button>`;
      }).join('');
      return `
      <div style="border:1px solid #e5e7eb;border-radius:10px;padding:8px 11px;margin-bottom:7px;background:#fff">
        <div style="display:flex;align-items:flex-start;gap:10px;flex-wrap:wrap">
          <div style="flex:1;min-width:170px">
            <div style="font-size:14px;font-weight:800;color:#1a1a2e;line-height:1.2">${_clrEsc(o.title)}</div>
            ${o.subtitle ? `<div style="font-size:11px;color:#6b7280">${_clrEsc(o.subtitle)}</div>` : ''}
            ${o.seatsLeft ? `<div style="display:flex;gap:5px;flex-wrap:wrap;margin-top:7px">${seats}</div>` : '<div style="margin-top:5px;color:#991b1b;font-size:12px;font-weight:600">Sold out.</div>'}
          </div>
          <div style="text-align:right;white-space:nowrap;flex:0 0 auto">
            <span class="${urgent ? 'clr-urgent' : ''}" style="display:inline-block;background:${badgeBg};color:${badgeFg};font-size:10px;font-weight:800;letter-spacing:.03em;padding:2px 9px;border-radius:20px">${badgeTxt}</span>
            <div style="margin-top:2px"><span class="clr-num" style="text-decoration:line-through;color:#9aa2ac;font-size:12px">${_clrEur(o.retailPrice)}${pu}</span> <span class="clr-num" style="font-size:19px;font-weight:800;color:#2e9e00;letter-spacing:-.02em">${_clrEur(o.clearancePrice)}${pu}</span></div>
            <div style="font-size:10px;color:#6b7280;font-weight:500">Clearance Net Rate</div>
            <div class="clr-num" style="font-size:11px;color:#4d8a1e;font-weight:800;margin-top:1px">Reserve ${_clrEur(o.depositPerSeat)}</div>
          </div>
        </div>
      </div>`;
    };
    const feat = (t, s, p) => `<div style="flex:1;min-width:170px;display:flex;gap:10px;align-items:center"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="1.7" style="flex:0 0 auto"><path d="${p}"/></svg><div><div style="font-size:12.5px;font-weight:800;color:#10151f">${t}</div><div style="font-size:11.5px;color:#374151">${s}</div></div></div>`;

    body.innerHTML = `
      <style>
        #clearanceBody .clr-seat{transition:transform .12s ease,border-color .12s,box-shadow .12s}
        #clearanceBody .clr-seat:hover{border-color:#9cc971;transform:translateY(-1px)}
        #clearanceBody .clr-seat:focus-visible{outline:2px solid #2e9e00;outline-offset:2px}
        #clearanceBody .clr-seat-on{border-color:#2e9e00!important;box-shadow:0 0 0 2px #2e9e00 inset;background:#f2f9e6!important;transform:translateY(-1px)}
        #clearanceBody .clr-eyebrow{font-size:10px;font-weight:800;letter-spacing:.15em;text-transform:uppercase;color:#2e9e00}
        #clearanceBody .clr-sess{font-size:9px;font-weight:800;letter-spacing:.09em;text-transform:uppercase;color:#5b6b52;background:#eef2ea;border-radius:5px;padding:2px 7px}
        #clearanceBody .clr-num{font-variant-numeric:tabular-nums}
        @keyframes clrPulse{0%,100%{opacity:1}50%{opacity:.5}}
        #clearanceBody .clr-urgent{animation:clrPulse 1.5s ease-in-out infinite}
        #clrReserveBtn:not(:disabled):hover{background:#267f00}
        @media (prefers-reduced-motion:reduce){#clearanceBody .clr-seat,#clearanceBody .clr-urgent,.clr-seat-on{transition:none;animation:none;transform:none}}
      </style>
      <div style="display:flex;gap:16px;align-items:flex-start;flex-wrap:wrap">
        <div style="flex:1;min-width:300px">
          <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap">
            <div>
              <div class="clr-eyebrow" style="margin-bottom:2px">Partners-only clearance</div>
              <div style="font-size:25px;font-weight:800;color:#10151f;letter-spacing:-.035em;line-height:1.0">Seat Clearance</div>
            </div>
            <div style="text-align:center">
              <div class="clr-eyebrow" style="color:#6b7280;margin-bottom:4px">Sale Ends ${new Date(d.sale.endsAt).toLocaleDateString('en-IE', { timeZone: 'UTC' })}</div>
              <div id="clrCountdown" style="display:flex;gap:5px"></div>
            </div>
          </div>
          <div style="margin:8px 0 10px;background:#f1f5ee;border:1.5px solid #d4af37;box-shadow:0 1px 4px rgba(0,0,0,.07);border-radius:8px;padding:8px 12px">
            <div style="font-size:12.5px;font-weight:800;color:#10151f;margin-bottom:4px">How it works</div>
            <div style="display:flex;flex-direction:column;gap:3px;font-size:12.5px;color:#1f2937;font-weight:600">
              <div style="display:flex;gap:7px;align-items:center"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#2e9e00" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="flex:0 0 auto"><polyline points="20 6 9 17 4 12"/></svg>First Partner to reserve retains the seat</div>
              <div style="display:flex;gap:7px;align-items:center"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#2e9e00" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="flex:0 0 auto"><polyline points="20 6 9 17 4 12"/></svg>Assign seat to any Student - Start before 31/03/2027</div>
              <div style="display:flex;gap:7px;align-items:center"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#2e9e00" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="flex:0 0 auto"><polyline points="20 6 9 17 4 12"/></svg>When all seats are reserved Clearance is over</div>
            </div>
          </div>
          ${(d.offers || []).map(offerCard).join('')}
          <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:10px;border-top:1px solid #eef0f2;padding-top:10px">
            ${feat('Flexible Assignment', 'Assign to any Student - Start before 31/03/27', 'M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z')}
            ${feat('Unbeatable Rates', 'Clearance prices, partners only', 'M12 2l2.4 7.4H22l-6 4.6 2.3 7.4L12 17l-6.3 4.4L8 14 2 9.4h7.6z')}
            ${feat('Quality Education', 'Top-rated courses in Dublin', 'M22 10L12 5 2 10l10 5 10-5zM6 12v5c0 1 2.7 3 6 3s6-2 6-3v-5')}
          </div>
        </div>

        <div style="width:300px;flex:0 0 auto">
          <div style="background:#0f1830;color:#fff;border-radius:10px 10px 0 0;padding:10px 14px;display:flex;align-items:center;justify-content:space-between">
            <div><div style="font-weight:800;font-size:14px">Your Selection</div><div id="clrCount" style="font-size:11px;color:#9fb0c9">0 seats selected</div></div>
            <button onclick="_clrClearAll()" style="background:none;border:0;color:#8ee34f;font-size:11px;font-weight:700;cursor:pointer">Clear All</button>
          </div>
          <div style="border:1px solid #e5e7eb;border-top:0;border-radius:0 0 10px 10px;padding:10px 14px;background:#fff">
            <div id="clrCartItems"></div>
            <div style="font-size:11px;margin-top:8px;color:#6b7280;text-align:center">Reserve AY €250 &nbsp;|&nbsp; Reserve GE €50</div>
            <div style="display:flex;justify-content:space-between;font-size:18px;font-weight:900;color:#1a1a2e;margin:6px 0 10px;padding-top:8px;border-top:2px solid #eef0f2"><span>Total</span><span id="clrTotal">${_clrEur(0)}</span></div>
            <button id="clrReserveBtn" disabled onclick="_clrReserve()" style="width:100%;background:#1a6600;color:#fff;border:0;border-radius:10px;padding:11px;font-weight:800;font-size:14px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>${IS_PORTAL ? 'Reserve Now' : 'Log in to Reserve'}
            </button>
            <div style="text-align:center;font-size:10px;color:#9ca3af;margin-top:6px">${IS_PORTAL ? '🔒 Secure checkout. Instant confirmation.' : '🔒 Log in to complete — your selected seats carry over.'}</div>
          </div>
          <div style="margin-top:10px;display:flex;flex-direction:column;gap:8px">
            <div style="display:flex;gap:10px;align-items:flex-start;border:1px solid #e5e7eb;border-radius:10px;padding:10px 12px;background:#f7f8fa">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#10151f" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex:0 0 auto;margin-top:1px"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>
              <div style="font-size:11.5px;color:#4b5563;line-height:1.4"><strong style="color:#10151f;display:block;font-size:12.5px;margin-bottom:1px">Reserved for Partners Only</strong>These seats are non-transferable and subject to our terms.</div>
            </div>
            <div style="display:flex;gap:10px;align-items:flex-start;border:1px solid #e5e7eb;border-radius:10px;padding:10px 12px;background:#f7f8fa">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#10151f" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex:0 0 auto;margin-top:1px"><path d="M3 14v-3a9 9 0 0 1 18 0v3"/><path d="M18 19a3 3 0 0 1-3 3h-2"/><rect x="1.5" y="13" width="4" height="6" rx="1.5"/><rect x="18.5" y="13" width="4" height="6" rx="1.5"/></svg>
              <div style="font-size:11.5px;color:#4b5563;line-height:1.4"><strong style="color:#10151f;display:block;font-size:12.5px;margin-bottom:1px">Need help?</strong>Contact Partner Support<br><a href="tel:+447480569252" style="color:#1a6600;text-decoration:none;font-weight:600">+44 748 056 9252</a><br><a href="mailto:partners@ulearnschool.com" style="color:#1a6600;text-decoration:none;font-weight:600">partners@ulearnschool.com</a></div>
            </div>
          </div>
        </div>
      </div>`;
    _clrUpdateCart();
    _clrStartCountdown(d.sale.endsAt);
    _hydrateFromPick();
  }

  // Pre-fill the cart from a ?clrpick=offerId:qty,… handoff (public tease → portal after login).
  // Selects the first N AVAILABLE seat tiles per offer — re-validated against the live render, so
  // it degrades gracefully if seats were taken since the tease. Strips the param after so a
  // re-render doesn't re-add. No-op when there's no clrpick (the public embed never has one).
  function _hydrateFromPick() {
    let raw;
    try { raw = new URLSearchParams(location.search).get('clrpick'); } catch (e) { return; }
    if (!raw) return;
    raw.split(',').forEach(part => {
      const bits = part.split(':');
      const offerId = parseInt(bits[0], 10), qty = parseInt(bits[1], 10);
      if (!offerId || !(qty > 0)) return;
      const tiles = Array.prototype.slice.call(document.querySelectorAll('.clr-seat[data-o="' + offerId + '"]'), 0, qty);
      tiles.forEach(t => _clrToggleSeat(offerId, parseInt(t.getAttribute('data-i'), 10), t));
    });
    try { const u = new URL(location.href); u.searchParams.delete('clrpick'); history.replaceState(null, '', u.toString()); } catch (e) {}
  }

  // Expose the onclick handlers + entry point to the global scope (inline onclick in the
  // generated markup needs them global; partners.html's tab code calls loadClearance()).
  window.loadClearance = loadClearance;
  window._clrToggleSeat = _clrToggleSeat;
  window._clrToggleSeatById = _clrToggleSeatById;
  window._clrClearAll = _clrClearAll;
  window._clrReserve = _clrReserve;
  window._clrClaim = _clrClaim;
  window._clrCloseCheckout = _clrCloseCheckout;
  // Let the portal's tab nav stop the countdown interval when leaving the clearance tab.
  window._clrStopCountdown = function () { if (_clrTimer) { clearInterval(_clrTimer); _clrTimer = null; } };
  // Stripe's embedded checkout posts this on success (portal) — confirm immediately.
  window.addEventListener('message', (e) => { if (e && e.data && e.data.type === 'clearance-paid') _clrCheckPaid(); });
})();
