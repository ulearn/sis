# SIS endpoint spec — TransferMate escrow shadow-payment

**For:** the SIS-side Claude (`/home/sis/web/sis.ulearnschool.com/public_html/sis`).
**Author:** hub-side Claude, 2026-05-29, grounded against the live SIS code below.
**Context:** see `spec.md` (escrow end-to-end) in this folder.

---

## What this is (and is NOT)

The hub server now receives TransferMate webhooks (`/fins/tm/webhook`) and splits
on TM's native `<escrow>` flag.

- **Standard payments (escrow=0): NOTHING needed on SIS.** They settle in Xero →
  flow to HubSpot → the **existing** `router.post('/invoice-paid')` in
  `src/routes/webhooks.ts` already updates the booking. Do not touch that path.
- **Escrow payments (escrow=1): need this new endpoint.** Escrow money never
  touches Xero, so the invoice-paid path never fires. SIS must record a *shadow*
  payment + flip the booking to `ESCROW`, exactly like the Fidelo importer did.

This endpoint ONLY writes SIS's own DB. The HubSpot deal move (`closedwon` +
`escrow="Yes"`) is done by the hub server — do not do it here.

---

## Build

### 1. Prisma migration — add a `DataSource` enum value
`prisma/schema.prisma`, `enum DataSource { FIDELO MANUAL HUBSPOT }` → add `TM_API`:

```prisma
enum DataSource {
  FIDELO
  MANUAL
  HUBSPOT
  TM_API
}
```
Then `npx prisma migrate dev --name add_tm_api_datasource` (or your prod migrate
flow) + `npx prisma generate`.

### 2. New route in `src/routes/webhooks.ts`
Add inside `webhookRoutes(prisma)` (mounts at `/sis/api/webhooks`, already in
`publicPaths`). Mirror the style of `/invoice-paid`. Join key is
**`Booking.hubspotDealId`** (unique) — same as `/invoice-paid` uses.

```ts
// POST /sis/api/webhooks/transfermate-escrow
// Body: { dealId, amount, currency?, tmPaymentId, reference, paymentDate?, payerName? }
// Auth: shared secret header (see §3).
router.post('/transfermate-escrow', async (req, res) => {
  try {
    const { dealId, amount, tmPaymentId, reference, paymentDate, payerName } = req.body || {};
    if (!dealId || !tmPaymentId || amount == null) {
      return res.status(400).json({ error: 'dealId, tmPaymentId, amount required' });
    }

    const booking = await prisma.booking.findFirst({
      where: { hubspotDealId: String(dealId) } as any,
      select: { id: true, status: true },
    });
    if (!booking) {
      return res.status(404).json({ error: 'No SIS booking for deal ' + dealId });
    }

    // Idempotency — the (receiptNumber, bookingId) unique index dedups retries.
    const receiptNumber = `TM-${tmPaymentId}`;
    const existing = await prisma.payment.findFirst({
      where: { bookingId: booking.id, receiptNumber } as any,
      select: { id: true },
    });
    if (existing) {
      return res.json({ status: 'exists', paymentId: existing.id, bookingId: booking.id });
    }

    // Shadow escrow payment — mirrors import-fidelo-payments-api.ts:216-224.
    // type='Escrow' keeps it OUT of the amountPaid rollup (bookings.ts:495-512)
    // and out of partner/roster/transport/LoA gates. Do NOT touch amountPaid.
    await prisma.payment.create({
      data: {
        bookingId: booking.id,
        amount: Number(amount),
        method: 'TransferMate Escrow',
        paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
        type: 'Escrow',
        paidBy: payerName || null,
        transactionId: reference || String(tmPaymentId),
        receiptNumber,
        dataSource: 'TM_API' as any,
      } as any,
    });

    // Flip to ESCROW (only if not already past it — never downgrade a CONFIRMED).
    if (booking.status !== 'ESCROW' && booking.status !== 'CONFIRMED') {
      await prisma.booking.update({
        where: { id: booking.id },
        data: { status: 'ESCROW' as any },
      });
    }

    return res.json({ status: 'created', bookingId: booking.id, receiptNumber });
  } catch (err: any) {
    console.error('[TM Escrow] error:', err?.message);
    return res.status(500).json({ error: err?.message || 'internal error' });
  }
});
```

### 3. Auth — shared secret (server-to-server)
These webhook paths are public (no session). Add a simple shared-secret check at
the top of the handler so only the hub server can post escrow rows:

```ts
if (req.headers['x-tm-internal-secret'] !== process.env.TM_INTERNAL_SECRET) {
  return res.status(401).json({ error: 'unauthorized' });
}
```
Set the same `TM_INTERNAL_SECRET` in SIS `.env` and hub `.env`.

---

## Release / refusal (E4 — later, note for when ready)

- **Release (visa approved / funds settle):** the booking leaves ESCROW. Funds
  settle to BoI → Xero payment → HubSpot → existing `/invoice-paid` fires and
  posts the REAL payment + sets PARTIAL/CONFIRMED. Open item: confirm
  `/invoice-paid` correctly transitions a booking OUT of `ESCROW` (its status
  reconciliation block, webhooks.ts ~1380+) and that the old `type='Escrow'`
  row is superseded (it stays as an audit row; the real row carries the cash).
- **Refusal:** €300 retention posts as a real payment on the deal in Xero; deal
  → `closedlost`; booking → CANCELLED (or a refusal sub-state). Hub-orchestrated.

---

## Hub side (already built / to wire)

`scripts/tm/webhook.js` escrow lane currently logs only. Once this endpoint
exists it will, on `escrow=1`:
1. Resolve the HubSpot dealId from the TM `reference` (= Xero/HubSpot InvoiceNumber).
2. Move the deal → `closedwon`, set `escrow="Yes"` (HubSpot prop confirmed:
   enumeration Yes/No).
3. POST to `/sis/api/webhooks/transfermate-escrow` with `{ dealId, amount,
   tmPaymentId, reference, paymentDate, payerName }` + the shared secret.

The dealId resolution (step 1) depends on the Magic Link reference convention
(#3) — that's why #3 lands before the escrow lane goes live.
