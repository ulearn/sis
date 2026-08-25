# Manage → Bookings

The Bookings view lists every Booking row + a search/filter strip. Click
to open the booking detail page (full course/accom/payment/extras editor).

For the lifecycle (how a Booking row gets created from a HubSpot deal +
invoice), see `Students.md`.

---

## Top-bar fields (read across the booking-detail strip)

| Field | UI edit | Automation that writes it |
|---|---|---|
| **#id** | none — DB auto-assigned | never changes |
| **Student name link** | not from booking screen — edit on Student profile | invoice-created webhook copies from HubSpot contact at create |
| **Agency link** | not directly editable here | invoice-created webhook resolves from the HubSpot deal's company association; persists thereafter |
| **Net Statement button** | available to admin / accounts / dos / sales / accomm | action — generates the partner net statement; no field write |
| **Payment Status** dropdown<br>(`status`: PENDING / PARTIAL / CONFIRMED / ESCROW / CANCELLED) | admin / accounts / dos / sales / accomm | **invoice-paid webhook** flips PENDING → PARTIAL → CONFIRMED on payment events; rolls back to PENDING when payments removed. Writes a `BookingStatusHistory` row (`changedBy: 'payment-webhook'`) on every change. |
| **Payment Method** dropdown<br>(Bank / Stripe / TransferMate / Cash / Credit Card / Cheque) | admin / accounts / dos / sales / accomm | **invoice-paid webhook** (since 2026-05-22) sets to the method of the latest Payment row. Defaults to `'Bank'` for HubSpot-sourced payments until the `/fins/tm/` TransferMate module + Stripe / Revolut integrations land and write real processor names. |
| **Salesperson** text input | admin / accounts / dos / sales / accomm | **No automation writes it.** Manual field; HubSpot doesn't supply it on the deal. |
| **HubSpot** deep-link | not editable — derived from `student.hubspotDealId` | invoice-created webhook sets `hubspotDealId` at booking creation |
| **Total** (`amountTotal`) | admin / accounts / dos / sales / accomm (with `calcBalance()` on input) | invoice-created webhook copies HubSpot `hs_amount_billed`. **Audited** (Prisma extension at `lib/prisma-audit.ts`) — every write writes a `audit_log` row with old/new value. |
| **Paid** (`amountPaid`) | same — admin / accounts / dos / sales / accomm | **invoice-paid webhook** sums all HubSpot payments on the deal. **Audited.** |
| **Balance** (`amountOpen`) | same — admin / accounts / dos / sales / accomm | **invoice-paid webhook** computes `max(0, total − paid)`. **Audited.** |

Permission definitions live at `src/app.ts:91-107`. Teacher / student / partner have ZERO SIS API access.

---

## Status flow

```
                            ┌──────────────────────────────────┐
                            │ invoice-created webhook fires    │
                            │ (HubSpot quote → invoice)        │
                            └────────────────┬─────────────────┘
                                             ▼
                                       ╔═══════════╗
                                       ║  PENDING  ║
                                       ╚═════╤═════╝
                                             │ first payment
                                             ▼
                                       ╔═══════════╗
                                       ║  PARTIAL  ║
                                       ╚═════╤═════╝
                                             │ totalPaid >= totalBilled
                                             ▼
                                       ╔═══════════╗
                                       ║ CONFIRMED ║──┐
                                       ╚═══════════╝  │ on first reach:
                                                      │ PATCH HubSpot deal
                                                      │ → dealstage=closedwon
                                                      ▼
                                                (sales workflow continues)
```

Manual transitions also possible:
- **→ ESCROW** — visa-pending state; funds in TransferMate, not BoI yet. Hides booking from LoA gating, accommodation matching, partner totals, class roster, transport.
- **→ CANCELLED** — student cancelled / no-show. Hides booking from transport / matching / host-calendar / partner totals / class roster / document gates. Does NOT auto-deactivate `BookingAccommodation` rows — that's a manual follow-up on the host-matching screen (potential footgun documented in `Accomm/Matching.md`).

---

## Booking detail page sections (below the top bar)

Two-column layout:

**Left column**
- **Courses** — per-enrolment rows (name, category, level, dates, weeks, hours/wk, fee, discount, commission, ILEP code, isRenewal flag)
- **Payments** — Payment row history (date, amount, method, type, transaction id)
- **Holidays** — student-requested holidays that push course end forward
- **Status History** — audit trail of status flips with `changedBy`

**Right column**
- **Accommodation** — per-placement rows (provider, dates, weeks, room/bed)
- **Extras** — airport transfers, exam fees, insurance, etc.
- **🎟️ LifePass Instalments** (LifePass bookings only) — 25-row drawdown schedule with status chips. See `~/.claude/projects/.../memory/project_fidelo_retired.md` for the LifePass architecture.

---

## Related files

- `src/routes/bookings.ts` — booking CRUD endpoints
- `src/routes/webhooks.ts:1255` — `/invoice-paid` (writes status, totals, paymentMethod, Payment rows, statusHistory)
- `src/lib/prisma-audit.ts` — automatic `audit_log` row for every tracked-field write
- See also: `Students.md` for the booking-creation lifecycle from HubSpot
