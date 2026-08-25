# Manage → Students

The Students view lists every Student record in the SIS. A click drills
into the Student detail page (tabs: Overview, Challenges).

This page also documents the **booking-creation lifecycle**, because new
Student rows are born together with a Booking row via the same HubSpot
webhook. Per-booking detail lives in `Bookings.md`.

---

## Lifecycle: Quote → Invoice → Student + Booking → Payment

The end-to-end flow when a HubSpot deal is converted to an invoice:

```
1. HubSpot                    Sales rep converts a quote to an invoice.
   Quote → Invoice            Sends webhook with the invoice + deal IDs.
            │
            ▼
   POST https://sis.ulearnschool.com/sis/api/webhooks/invoice-created
   {
     "contactId": "{{ fetched_objects.fetched_object_1542264015.hs_object_id }}",
     "dealId":    "{{ fetched_objects.fetched_object_1489419476.hs_object_id }}",
     "invoiceId": "{{ enrolled_object.hs_object_id }}",
     "type":      "B2B"  // or "B2C"
   }
            │
            ▼
2. SIS handler (webhooks.ts:424 router.post('/invoice-created'))
   - Resolves dealId → deal properties (course_type, course_start,
     accomm_type, etc.)
   - Resolves contactId → student email + name
   - Picks the STUDENT contact when the deal has multiple contacts
     (parents, agents, B2B partners) — filters on the HubSpot
     `type` property starting with "student"
   - Creates / finds the Student row (dedupes on hubspotContactId
     when present)
   - Creates the Booking row:
       status       = 'PENDING'
       amountTotal  = invoice gross
       amountPaid   = 0
       amountOpen   = same as amountTotal
       paymentMethod = null  (will be set in step 3)
       dataSource   = 'HUBSPOT'
   - Creates child rows: BookingCourse, BookingAccommodation,
     BookingExtra (if the deal carries those)
   - Fires createXeroInvoiceFromHubSpot — Xero invoice with the same
     `invoiceNumber` as the HubSpot invoice. Contact = the student
     (NOT the agency; see xero-invoice-commission.ts comments for the
     reconciliation rationale).
   - If course_type starts with "LifePass" → also fires the LifePass
     subscription invoice flow (separate -Sub invoice).
            │
            ▼
3. Xero (manual)              Bookkeeper assigns a payment in Xero
   Payment applied            against the invoice (bank transfer
                              landed, Stripe charge cleared, etc.).
            │
            ▼
4. HubSpot DataSync           HubSpot's Xero DataSync integration pulls
   reflects payment           the payment back into HubSpot, creating a
                              commerce_payment object associated with
                              the invoice.

   (Note: for invoices we created OURSELVES in Xero — partner-commission
   + LifePass-Sub flows — DataSync doesn't pull back, so we run our own
   sync from hub/fins/scripts/xero/payment-sync.js. See memory note
   `reference_hub_vhost_access.md`.)
            │
            ▼
5. HubSpot                    HubSpot workflow fires on
   invoice paid event         invoice payment change.
            │
            ▼
   POST https://sis.ulearnschool.com/sis/api/webhooks/invoice-paid
   {
     "contactId": "{{ fetched_objects.fetched_object_1489407164.hs_object_id }}",
     "dealId":    "{{ fetched_objects.fetched_object_1489407163.hs_object_id }}",
     "invoiceId": "{{ enrolled_object.hs_object_id }}"
   }
            │
            ▼
6. SIS handler (webhooks.ts:1255 router.post('/invoice-paid'))
   - Sums every invoice on the deal: totalBilled + totalPaid
   - Updates Booking:
       amountPaid     = totalPaid
       amountOpen     = max(0, totalBilled - totalPaid)
       status         = PENDING | PARTIAL | CONFIRMED (recomputed)
       confirmed      = true when fully paid
       paymentMethod  = method of the latest Payment row
                        (so it's no longer blank — see "Payment Method
                        recon" below)
   - Upserts a SIS Payment row per HubSpot commerce_payment
     (keyed on hubspotPaymentId; cleans up rows deleted in HubSpot)
   - Writes a BookingStatusHistory row when status changes
     (changedBy: 'payment-webhook')
   - When fully-paid AND status was not previously CONFIRMED:
     PATCHes the HubSpot deal to dealstage=closedwon
```

The same `/invoice-paid` webhook fires on EVERY subsequent payment too
(top-up payments, mid-stay add-ons, etc.). Each fire re-runs the totals
recompute + Payment-row upsert + paymentMethod refresh.

---

## Payment Method recon

As of 2026-05-22 the `/invoice-paid` handler also sets
`Booking.paymentMethod` to the method of the most recent Payment row
on the booking. Previously this field was always blank on
HubSpot-sourced bookings because nothing wrote to it.

Today the per-Payment `method` defaults to `'Bank'` on all HubSpot-sourced
payments (HubSpot's `hs_payment_method` is unreliable — Xero strips
processor info on the way back). When the hub.ulearnschool.com `/fins/tm/`
TransferMate module + Stripe / Revolut integrations land, those will
write the real processor name to the Payment row, and the Booking will
inherit the latest one automatically — no further change needed here.

Bottom line: every paid booking now shows a non-blank Payment Method.
Manual edits are still possible (staff can override).

---

## Student detail page (tabs)

### Overview tab
Sections (top to bottom):
- **Profile card** — photo, name, email, gender, age, phone, country,
  HubSpot contact link
- **Booking summary** — most recent + upcoming bookings, click-through to
  Bookings.md
- **Details** (collapsible) — full editable form: identity, address,
  visa, passport, billing, contact languages
- **Communications** — email composer + thread history (see Comms manual)
- **Documents** — per-student documents + Generate Document overlay
- **Visa & Flight** — visa metadata + Documents drop-zone for visa
  attachments

### Challenges tab
Only shown when the student's Booking has `hubspotChallenge` set
(KickStart / CashBack — see memory `project_host_portal_v1.md` for
context on the gating logic).

---

## Edit permissions

Student-row scalar fields are editable by:
**admin / accounts / dos / sales / accomm**

`saveStudent()` collects the form via `collectFormData()` and PATCHes
`/sis/api/students/:id`.

Teacher / student / partner roles cannot reach this view at all (denied
in `ROLE_PERMISSIONS` at `src/app.ts:91-107`).

---

## Related files

- `src/routes/webhooks.ts:424` — `/invoice-created` handler (lifecycle steps 1-2)
- `src/routes/webhooks.ts:1255` — `/invoice-paid` handler (lifecycle steps 5-6)
- `src/scripts/xero-invoice-commission.ts` — Xero invoice create (partner-commission flow)
- `/home/hub/web/hub.ulearnschool.com/public_html/fins/scripts/xero/payment-sync.js` — Xero → HubSpot payment mirror for invoices created by our code (where DataSync doesn't reach)
- `src/routes/students.ts` — student CRUD endpoints
- See also: `Bookings.md` for booking-detail field documentation
