● Tracing each field across who can edit + what writes to it automatically:

  Field: #17927 (id)
  UI edit: nobody 
  Automated writes: DB auto-assigned on create. Never changes.
  ────────────────────────────────────────                 
  Field: Student name (link)
  UI edit: not from booking screen — edit on student profile 
  Automated writes: invoice-created webhook copies from HubSpot contact at create time                                                      
  ────────────────────────────────────────
  Field: Agency (link)
  UI edit: not editable here — assigned via the agency picker
  Automated writes: invoice-created webhook resolves from HubSpot company association; stays linked thereafter
  ────────────────────────────────────────
  Field: Net Statement (button)
  UI edit: (it's an action, not data) — anyone with booking access
  Automated writes: n/a
  ────────────────────────────────────────
  Field: Payment Status dropdown
  UI edit: admin / accounts / dos / sales / accomm (per role permissions; saveBooking() writes it)
  Automated writes: invoice-paid webhook flips PENDING → PARTIAL → CONFIRMED based on totals; also rolls back to PENDING if payments removed.
    Writes a BookingStatusHistory row with changedBy: 'payment-webhook'
  ────────────────────────────────────────
  Field: Payment Method dropdown (Bank/Stripe/TM/Cash/Credit/Cheque)
  UI edit: same — admin/accounts/dos/sales/accomm
  Automated writes: No automation writes it. HubSpot doesn't supply it. Staff must set manually. That's why your view shows "—"
  ────────────────────────────────────────
  Field: Salesperson text
  UI edit: same — admin/accounts/dos/sales/accomm
  Automated writes: No automation writes it. Manual field. (What you're seeing as "HubSpot" under it is actually the separate HubSpot deep-link
    button, not the salesperson value — the value is blank)
  ────────────────────────────────────────
  Field: HubSpot link
  UI edit: not editable — derived from student.hubspotDealId
  Automated writes: invoice-created webhook sets it at booking creation
  ────────────────────────────────────────
  Field: Total (amountTotal)
  UI edit: admin/accounts/dos/sales/accomm (form input, with calcBalance)
  Automated writes: invoice-created webhook copies hs_amount_billed from HubSpot. Then untouched by automation. AuditLog captures every change
    (wired today)
  ────────────────────────────────────────
  Field: Paid (amountPaid)
  UI edit: same — admin/accounts/dos/sales/accomm
  Automated writes: invoice-paid webhook sums HubSpot payments and writes the total. Also writes individual Payment rows on the booking. AuditLog
   
    captures every change
  ────────────────────────────────────────
  Field: Balance (amountOpen)
  UI edit: same — admin/accounts/dos/sales/accomm
  Automated writes: invoice-paid webhook computes max(0, total - paid). AuditLog captures every change

  Permission roles (from app.ts:91-107):

  admin     : full access, no deny list
  accounts  : full access (mirrors admin)
  dos       : full except 'refunds'
  sales     : full except 'payroll' + 'refunds'; classes view-only
  accomm    : full except 'payroll' + 'refunds'; classes view-only
  teacher   : DENIED (no SIS access at all)
  student   : DENIED
  partner   : DENIED (uses separate partner portal)

  So bookings are editable by 5 staff roles. The 3 financial fields (Total / Paid / Balance) and Status all have automation paths, which is why
  the AuditLog work earlier today matters — when totals drift between systems we now have the trail.

  Things automation does NOT touch on this strip:
  - Payment Method (always manual)
  - Salesperson (always manual)
  Automated writes: invoice-created webhook resolves from HubSpot company association; stays linked thereafter
  ────────────────────────────────────────
  Field: Net Statement (button)
  UI edit: (it's an action, not data) — anyone with booking access
  Automated writes: n/a
  ────────────────────────────────────────
  Field: Payment Status dropdown
  UI edit: admin / accounts / dos / sales / accomm (per role permissions; saveBooking() writes it)
  Automated writes: invoice-paid webhook flips PENDING → PARTIAL → CONFIRMED based on totals; also rolls back to PENDING
  if
     payments removed. Writes a BookingStatusHistory row with changedBy: 'payment-webhook'
  ────────────────────────────────────────
  Field: Payment Method dropdown (Bank/Stripe/TM/Cash/Credit/Cheque)
  UI edit: same — admin/accounts/dos/sales/accomm
  Automated writes: No automation writes it. HubSpot doesn't supply it. Staff must set manually. That's why your view
  shows
     "—"
  ────────────────────────────────────────
  Field: Salesperson text
  UI edit: same — admin/accounts/dos/sales/accomm
  Automated writes: No automation writes it. Manual field. (What you're seeing as "HubSpot" under it is actually the
    separate HubSpot deep-link button, not the salesperson value — the value is blank)
  ────────────────────────────────────────
  Field: HubSpot link
  UI edit: not editable — derived from student.hubspotDealId
  Automated writes: invoice-created webhook sets it at booking creation
  ────────────────────────────────────────
  Field: Total (amountTotal)
  UI edit: admin/accounts/dos/sales/accomm (form input, with calcBalance)
  Automated writes: invoice-created webhook copies hs_amount_billed from HubSpot. Then untouched by automation. AuditLog
    captures every change (wired today)
  ────────────────────────────────────────
  Field: Paid (amountPaid)
  UI edit: same — admin/accounts/dos/sales/accomm
  Automated writes: invoice-paid webhook sums HubSpot payments and writes the total. Also writes individual Payment rows
  on
     the booking. AuditLog captures every change
  ────────────────────────────────────────
  Field: Balance (amountOpen)
  UI edit: same — admin/accounts/dos/sales/accomm
  Automated writes: invoice-paid webhook computes max(0, total - paid). AuditLog captures every change

  Permission roles (from app.ts:91-107):

  admin     : full access, no deny list
  accounts  : full access (mirrors admin)
  dos       : full except 'refunds'
  sales     : full except 'payroll' + 'refunds'; classes view-only
  accomm    : full except 'payroll' + 'refunds'; classes view-only
  teacher   : DENIED (no SIS access at all)
  student   : DENIED
  partner   : DENIED (uses separate partner portal)

  So bookings are editable by 5 staff roles. The 3 financial fields (Total / Paid / Balance) and Status all have
  automation paths, which is why the AuditLog work earlier today matters — when totals drift between systems we now have
  the trail.

  Things automation does NOT touch on this strip:
  - Payment Method (always manual)
  - Salesperson (always manual)
  - Agency once initially linked (manual reassignment only)

  Want me to do anything with this — tighten edit permissions on any of these, surface "last changed by X at Y" timestamps, anything
  else?