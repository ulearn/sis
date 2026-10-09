/**
 * Seat Clearance Sale — backend logic.
 *
 * A curated, countdown marketplace of a SMALL number of genuinely-empty seats at a
 * crazy-low price, shown to clearance-eligible partners (Agency.clearanceEligible).
 * Purpose: A/B-test whether Model-B "package" partners bite on price alone.
 *
 * Reserve flow: partner selects seats → we create PENDING reservation rows (this is
 * the A/B signal, captured no matter what) → we raise ONE HubSpot invoice for the
 * whole deposit total and hand back its payment URL (best-effort; on failure the
 * reservation still stands and staff follow up). The invoice-paid webhook later
 * flips those rows to RESERVED. Seats are then assignable to ANY student until the
 * sale's assignBy date.
 */
import { PrismaClient } from '../generated/prisma/client';
import Stripe from 'stripe';

const HS = 'https://api.hubapi.com';
const TOKEN = () => process.env.ACCESS_TOKEN || '';

export function clearanceScripts(prisma: PrismaClient) {

  // The single live/most-recent sale (there's normally one at a time).
  async function currentSale() {
    return prisma.clearanceSale.findFirst({
      where: { active: true },
      orderBy: { endsAt: 'desc' },
      include: { offers: { orderBy: { sortOrder: 'asc' } } },
    });
  }

  function saleState(sale: { startsAt: Date; endsAt: Date } | null): 'none' | 'upcoming' | 'live' | 'ended' {
    if (!sale) return 'none';
    const now = Date.now();
    if (now < sale.startsAt.getTime()) return 'upcoming';
    if (now > sale.endsAt.getTime()) return 'ended';
    return 'live';
  }

  // Seats already taken per offer (any non-cancelled reservation holds a seat).
  async function takenByOffer(saleId: number): Promise<Record<number, number>> {
    // A seat is held by a paid reservation (RESERVED/ASSIGNED) OR a PENDING one still
    // inside its 20-min checkout window — so abandoned checkouts free the seat again.
    const holdSince = new Date(Date.now() - 20 * 60 * 1000);
    const rows = await prisma.clearanceReservation.groupBy({
      by: ['offerId'],
      where: { saleId, OR: [{ status: { in: ['RESERVED', 'ASSIGNED'] } }, { status: 'PENDING', createdAt: { gte: holdSince } }] },
      _count: { _all: true },
    });
    const m: Record<number, number> = {};
    for (const r of rows) m[r.offerId] = r._count._all;
    return m;
  }

  // Full clearance payload for a partner portal / iframe.
  async function forAgency(agencyId: number | null) {
    const agency = agencyId ? await prisma.agency.findUnique({ where: { id: agencyId }, select: { clearanceEligible: true } }) : null;
    const eligible = !!agency?.clearanceEligible;
    const sale = await currentSale();
    const state = saleState(sale);
    if (!sale) return { eligible, state, sale: null, offers: [], myReservations: [] };
    const taken = await takenByOffer(sale.id);
    const offers = sale.offers.map(o => {
      const used = taken[o.id] || 0;
      return {
        id: o.id, title: o.title, subtitle: o.subtitle, category: o.category, session: o.session,
        model: (o as any).model || 'RESERVE',
        retailPrice: Number(o.retailPrice), clearancePrice: Number(o.clearancePrice), priceUnit: o.priceUnit,
        depositPerSeat: Number(o.depositPerSeat), seatsTotal: o.seatsTotal,
        seatsTaken: Math.min(used, o.seatsTotal),
        seatsLeft: Math.max(0, o.seatsTotal - used),
        // ALLOCATION: soft global cap (how many claimed across ALL agencies) — drives the
        // vague "limited availability" scarcity line, never a per-agency number.
        cap: (o as any).cap ?? null,
        claimedGlobal: used,
      };
    });
    const myReservations = agencyId ? await prisma.clearanceReservation.findMany({
      where: { saleId: sale.id, agencyId, status: { not: 'CANCELLED' } },
      orderBy: { id: 'asc' },
    }) : [];
    return {
      eligible, state,
      sale: { id: sale.id, name: sale.name, startsAt: sale.startsAt, endsAt: sale.endsAt, assignBy: sale.assignBy },
      offers,
      myReservations: myReservations.map(r => ({
        id: r.id, offerId: r.offerId, status: r.status, depositAmount: Number(r.depositAmount),
        seatLabel: r.seatLabel, assignedStudentId: r.assignedStudentId, paidAt: r.paidAt,
      })),
    };
  }

  // Best-effort HubSpot invoice for the deposit total. Returns { invoiceId, url } or null.
  // Non-fatal: reservations stand regardless (the A/B signal is the reservation itself).
  async function raiseDepositInvoice(opts: { agencyName: string; hubspotContactId?: string | null; amount: number; label: string }): Promise<{ invoiceId: string; url: string | null } | null> {
    try {
      if (!TOKEN()) return null;
      // Create a draft invoice, then set it live so it exposes a payment link.
      const create = await fetch(`${HS}/crm/v3/objects/invoices`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${TOKEN()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ properties: { hs_title: opts.label, hs_currency: 'EUR' } }),
      });
      if (!create.ok) return null;
      const inv: any = await create.json();
      const invoiceId = inv.id as string;
      // Associate to the partner's contact if we have one (best-effort).
      if (opts.hubspotContactId) {
        await fetch(`${HS}/crm/v4/objects/invoices/${invoiceId}/associations/default/contacts/${opts.hubspotContactId}`, {
          method: 'PUT', headers: { Authorization: `Bearer ${TOKEN()}`, 'Content-Type': 'application/json' }, body: '{}',
        }).catch(() => {});
      }
      // A DRAFT invoice's hs_invoice_link is a preview that 404s externally — never
      // hand it to the partner. We keep the id (staff publish + send from HubSpot,
      // and the invoice-paid webhook reconciles) and return NO url, so the UI shows
      // the "we'll send your secure payment link" path rather than a dead link.
      return { invoiceId, url: null };
    } catch { return null; }
  }

  // Reserve seats. items: [{offerId, qty}]. Creates PENDING reservations + a deposit
  // invoice. Guards: eligible, sale live, seats left. Idempotency is loose by design —
  // a partner can reserve more later while seats remain.
  async function reserve(agencyId: number, sisUser: string | null, agencyName: string, hubspotContactId: string | null, items: { offerId: number; qty: number }[]) {
    const agency = await prisma.agency.findUnique({ where: { id: agencyId }, select: { clearanceEligible: true } });
    if (!agency?.clearanceEligible) throw new Error('Not eligible for the seat clearance sale.');
    const sale = await currentSale();
    if (!sale) throw new Error('No active sale.');
    if (saleState(sale) !== 'live') throw new Error('The sale is not currently live.');
    const taken = await takenByOffer(sale.id);
    const offerMap = new Map(sale.offers.map(o => [o.id, o]));

    // Validate every line + build Stripe line items (one per offer, qty seats).
    const toCreate: { offerId: number; deposit: number }[] = [];
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
    let total = 0;
    for (const it of items) {
      const o = offerMap.get(it.offerId);
      const qty = Math.max(0, Math.floor(Number(it.qty) || 0));
      if (!o || qty <= 0) continue;
      const left = o.seatsTotal - (taken[o.id] || 0);
      if (qty > left) throw new Error(`Only ${left} seat(s) left for "${o.title}".`);
      const dep = Number(o.depositPerSeat);
      lineItems.push({
        quantity: qty,
        price_data: { currency: 'eur', unit_amount: Math.round(dep * 100), product_data: { name: `${o.title} — seat deposit` } },
      });
      for (let i = 0; i < qty; i++) { toCreate.push({ offerId: o.id, deposit: dep }); total += dep; }
    }
    if (toCreate.length === 0) throw new Error('No seats selected.');

    const created = await prisma.$transaction(
      toCreate.map(c => prisma.clearanceReservation.create({
        data: { saleId: sale.id, offerId: c.offerId, agencyId, sisUserId: null, depositAmount: c.deposit, status: 'PENDING' },
      }))
    );
    const reservationIds = created.map(r => r.id);

    // Embedded Stripe Checkout for the EXACT deposit total — pays in-portal, in the
    // moment. reservationIds ride in metadata; confirmCheckout flips them on 'paid'.
    const secret = process.env.SECRET_KEY || '';
    if (!secret) return { ok: true, reservationIds, total, clientSecret: null, publishableKey: null, sessionId: null };
    // Pin an API version where embedded Checkout uses ui_mode:'embedded' (pairs with
    // the frontend initEmbeddedCheckout). SDK 22's default renamed it to embedded_page.
    const stripe = new Stripe(secret, { apiVersion: '2024-06-20' as any });
    const session = await stripe.checkout.sessions.create({
      ui_mode: 'embedded',
      mode: 'payment',
      line_items: lineItems,
      // Embedded Checkout does a TOP-level redirect here on success — so land back
      // on the portal's clearance tab; the portal confirms via ?clr_paid on load.
      return_url: 'https://sis.ulearnschool.com/sis/partners?tab=clearance&clr_paid={CHECKOUT_SESSION_ID}',
      metadata: { kind: 'seat_clearance', agencyId: String(agencyId), reservationIds: reservationIds.join(',') },
    });
    return { ok: true, reservationIds, total, clientSecret: session.client_secret, publishableKey: process.env.PUBLISH_KEY || null, sessionId: session.id };
  }

  // Webhook hook — flip a sale's PENDING reservations to RESERVED once their deposit
  // invoice is paid. Called from the invoice-paid webhook when it sees a clearance invoice.
  async function markPaidByInvoice(invoiceId: string) {
    const res = await prisma.clearanceReservation.updateMany({
      where: { hubspotInvoiceId: invoiceId, status: 'PENDING' },
      data: { status: 'RESERVED', paidAt: new Date() },
    });
    return res.count;
  }

  // Confirm a Stripe embedded checkout — flip its reservations PENDING → RESERVED
  // once Stripe reports the session paid. Idempotent; the portal polls this.
  // AY clearance course window — fixed for the sale: start the nearest Monday before the
  // 31/03/2027 assign-by cutoff; 25-week Academic Year. (GE is parked — deposit only.)
  const AY_START = '2027-03-29';
  const AY_END = '2027-09-17';
  const AY_WEEKS = 25;

  // Map an offer → HubSpot course_type (deal dropdown value) + the COURSE_SKU_MAP label
  // autoQuote prices from. AY defaults to Morning; a PM-only offer → Afternoon. The flexible
  // AM/PM offer (session=ANY) defaults to Morning — the partner picks PM at redemption.
  function offerCourseType(offer: { category: string; session: string }) {
    if (offer.category !== 'AY') return null; // GE parked — no auto-deal
    const pm = String(offer.session || '').toUpperCase() === 'PM';
    return pm
      ? { value: 'ay_year_aft', label: 'General English Academic Year PM' }
      : { value: 'ay_year_morn', label: 'General English Academic Year AM' };
  }

  // Fulfil ONE paid reservation: call the hub to stand up the deal → quote → OPEN invoice +
  // mirror the deposit. Idempotent (atomic fulfilledAt claim) + non-fatal (resets the claim
  // on failure so staff/retry can re-run). The standard invoice-created/invoice-paid webhooks
  // then build the SIS student/booking — we don't create anything in SIS directly here.
  async function fulfilReservation(reservationId: number) {
    const key = process.env.AUTOINV_KEY;
    const hub = process.env.HUB_BASE || 'https://hub.ulearnschool.com';
    if (!key) { console.warn('[clearance-fulfil] AUTOINV_KEY not set — skip'); return; }
    const r = await prisma.clearanceReservation.findUnique({ where: { id: reservationId }, include: { offer: true } });
    if (!r || r.fulfilledAt || r.status === 'CANCELLED') return;
    const ct = offerCourseType(r.offer as any);
    if (!ct) { console.log(`[clearance-fulfil] res ${reservationId} — offer not AY, no auto-deal (deposit only)`); return; }
    const agency = r.agencyId ? await prisma.agency.findUnique({ where: { id: r.agencyId } }) : null;
    // Resolve the partner's HubSpot contact — the reserving user, else any partner user on the agency.
    let partnerContactId: string | null = null;
    if (r.sisUserId) {
      const u = await prisma.sisUser.findUnique({ where: { id: r.sisUserId }, select: { hubspotContactId: true } });
      partnerContactId = u?.hubspotContactId || null;
    }
    if (!partnerContactId && r.agencyId) {
      const u = await prisma.sisUser.findFirst({ where: { agencyId: r.agencyId, hubspotContactId: { not: null } }, select: { hubspotContactId: true } });
      partnerContactId = u?.hubspotContactId || null;
    }
    if (!partnerContactId) { console.warn(`[clearance-fulfil] res ${reservationId} — no partner HubSpot contact; skip (staff follow-up)`); return; }
    // Atomic claim so concurrent portal polls can't double-fulfil.
    const claim = await prisma.clearanceReservation.updateMany({ where: { id: reservationId, fulfilledAt: null }, data: { fulfilledAt: new Date() } });
    if (claim.count !== 1) return;
    const payload = {
      key,
      agencyName: agency?.name || 'Partner',
      partnerCompanyId: agency?.hubspotCompanyId || null,
      partnerContactId,
      courseTypeLabel: ct.label,
      courseTypeValue: ct.value,
      clearanceNet: Number(r.offer.clearancePrice),
      depositAmount: Number(r.depositAmount),
      courseStart: AY_START, courseEnd: AY_END, courseWeeks: AY_WEEKS,
      seatLabel: r.seatLabel || `res-${reservationId}`,
    };
    try {
      const resp = await fetch(`${hub}/hubapp/clearance-fulfil`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data: any = await resp.json().catch(() => ({}));
      if (!resp.ok || !data.success) throw new Error(`hub ${resp.status}: ${JSON.stringify(data).slice(0, 300)}`);
      await prisma.clearanceReservation.update({
        where: { id: reservationId },
        data: { hubspotDealId: String(data.dealId), hubspotInvoiceId: String(data.invoiceId), placeholderContactId: String(data.studentId) },
      });
      console.log(`[clearance-fulfil] res ${reservationId} → deal ${data.dealId} inv ${data.invoiceId} (net €${payload.clearanceNet})`);
    } catch (e: any) {
      // Release the claim so it can be retried.
      await prisma.clearanceReservation.update({ where: { id: reservationId }, data: { fulfilledAt: null } }).catch(() => {});
      console.error(`[clearance-fulfil] res ${reservationId} FAILED (non-fatal): ${e.message}`);
    }
  }

  async function confirmCheckout(sessionId: string) {
    const secret = process.env.SECRET_KEY || '';
    if (!secret || !sessionId) return { paid: false, count: 0 };
    // Pin an API version where embedded Checkout uses ui_mode:'embedded' (pairs with
    // the frontend initEmbeddedCheckout). SDK 22's default renamed it to embedded_page.
    const stripe = new Stripe(secret, { apiVersion: '2024-06-20' as any });
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== 'paid') return { paid: false, count: 0 };
    const ids = String(session.metadata?.reservationIds || '').split(',').map(s => parseInt(s, 10)).filter(Boolean);
    if (!ids.length) return { paid: true, count: 0 };
    const r = await prisma.clearanceReservation.updateMany({
      where: { id: { in: ids }, status: 'PENDING' },
      data: { status: 'RESERVED', paidAt: new Date(), stripeSessionId: sessionId },
    });
    // Fulfil each paid AY seat in the background (deal → quote → OPEN invoice → deposit mirror
    // → SIS cascade). Non-blocking so the portal's paid-poll returns immediately; idempotent
    // and non-fatal per seat. autoQuote's own indexing waits make each take ~40s.
    void (async () => { for (const id of ids) { await fulfilReservation(id); } })();
    return { paid: true, count: r.count };
  }

  // V2 ALLOCATION opt-in — the €0, qty-less "Claim This Rate". Records that the
  // agency has taken up the time-limited clearance rate for the live sale window;
  // NO deposit, NO per-agency seat number (they sell as many as they like at the
  // rate before the window closes). Idempotent: one live CLAIMED reservation per
  // (agency, offer). Fulfilment happens later when they enrol a real student.
  async function claim(agencyId: number, sisUserId: number | null, offerId: number) {
    const agency = await prisma.agency.findUnique({ where: { id: agencyId }, select: { clearanceEligible: true } });
    if (!agency?.clearanceEligible) throw new Error('Not eligible for the seat clearance sale.');
    const sale = await currentSale();
    if (!sale) throw new Error('No active sale.');
    if (saleState(sale) !== 'live') throw new Error('The sale is not currently live.');
    const offer = sale.offers.find(o => o.id === offerId);
    if (!offer) throw new Error('Offer not found.');
    if ((offer as any).model !== 'ALLOCATION') throw new Error('This offer is not an allocation offer.');
    const existing = await prisma.clearanceReservation.findFirst({
      where: { saleId: sale.id, offerId, agencyId, status: { in: ['CLAIMED', 'RESERVED', 'ASSIGNED'] } },
      orderBy: { id: 'asc' },
    });
    // The Claim IS the confirmation — the partner has opted into clearance pricing.
    // Flip the SIS-authoritative flag + mirror it OUTBOUND to HubSpot (autoQuote
    // reads clearance_confirmed off the Company to price the AY course down).
    if (existing) { await setClearanceConfirmed(agencyId, true); return { ok: true, alreadyClaimed: true, reservationId: existing.id, claimedUntil: sale.endsAt }; }
    const r = await prisma.clearanceReservation.create({
      data: { saleId: sale.id, offerId, agencyId, sisUserId, depositAmount: 0, status: 'CLAIMED' },
    });
    await setClearanceConfirmed(agencyId, true);
    return { ok: true, alreadyClaimed: false, reservationId: r.id, claimedUntil: sale.endsAt };
  }

  // ── Confirmation flag: SIS is authoritative; mirror EVERY set/unset to the
  // HubSpot Company `clearance_confirmed` so the CRM (and autoQuote) stay in
  // lockstep. Symmetric to `clearance_eligible`, which flows the other way
  // (HubSpot → SIS via the /clearance-eligible webhook). ──────────────────────
  async function syncClearanceConfirmedToHubSpot(agencyId: number) {
    const a = await prisma.agency.findUnique({ where: { id: agencyId }, select: { hubspotCompanyId: true, clearanceConfirmed: true } });
    if (!a?.hubspotCompanyId || !TOKEN()) return;
    try {
      await fetch(`${HS}/crm/v3/objects/companies/${a.hubspotCompanyId}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${TOKEN()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ properties: { clearance_confirmed: a.clearanceConfirmed ? 'true' : 'false' } }),
      });
    } catch (e: any) { console.error(`[clearance] confirmed-mirror failed for agency ${agencyId}: ${e?.message || e}`); }
  }

  async function setClearanceConfirmed(agencyId: number, value: boolean) {
    const cur = await prisma.agency.findUnique({ where: { id: agencyId }, select: { clearanceConfirmed: true } });
    if (cur?.clearanceConfirmed === value) { await syncClearanceConfirmedToHubSpot(agencyId); return; } // self-heal HS even if unchanged
    await prisma.agency.update({ where: { id: agencyId }, data: { clearanceConfirmed: value } });
    await syncClearanceConfirmedToHubSpot(agencyId);
  }

  // Reset confirmations when there's no live sale (the sale ended or was pulled).
  // Idempotent + self-healing; safe to run daily. Mirrors each reset to HubSpot.
  async function reconcileClearanceConfirmations() {
    const sale = await currentSale();
    if (saleState(sale as any) === 'live') return { live: true, reset: 0 };
    const confirmed = await prisma.agency.findMany({ where: { clearanceConfirmed: true }, select: { id: true } });
    for (const a of confirmed) await setClearanceConfirmed(a.id, false);
    return { live: false, reset: confirmed.length };
  }

  // Live clearance rates — SINGLE SOURCE OF TRUTH for the hub autoQuote. Global
  // (not per-agency); confirmation is read separately off the Company flag. AM/PM
  // keyed off the offer TITLE (session col is unreliable — PM offer is 'ANY').
  async function clearanceRates() {
    const sale = await currentSale();
    const live = saleState(sale as any) === 'live';
    if (!sale) return { live: false, am: null as number | null, pm: null as number | null, endsAt: null as Date | null };
    const am = sale.offers.find(o => /morning/i.test(o.title));
    const pm = sale.offers.find(o => /afternoon/i.test(o.title));
    return { live, am: am ? Number(am.clearancePrice) : null, pm: pm ? Number(pm.clearancePrice) : null, endsAt: sale.endsAt };
  }

  return { currentSale, saleState, forAgency, reserve, claim, markPaidByInvoice, confirmCheckout, fulfilReservation, setClearanceConfirmed, reconcileClearanceConfirmations, clearanceRates };
}
