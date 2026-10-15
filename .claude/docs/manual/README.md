# SIS Technical Manual

File layout mirrors the SIS admin sidebar. Each markdown file documents one
sidebar view: what's on screen, who can edit what, and what automation
(webhooks / crons / sync jobs) reads or writes the same fields.

```
Manage/
  Students.md        Student lifecycle — created by HubSpot invoice-created webhook
  Bookings.md        Booking detail page — top-bar fields, status flow, claim flow

Schedule/
  Classes.md         Class rosters + scheduling
  Teachers.md        Teacher profiles + assignments
  Attendance.md      Per-occurrence attendance grid
  LMS.md             Link out to the LMS app (separate vhost)
  Social.md          Social activities
  Transport.md       Airport pickups + dropoffs
  Payroll.md         Teacher payroll runs

Accomm/
  Hosts.md           Accommodation providers (Host Families + Apartments)
  Apartments.md      Apartment property + bed management
  Matching.md        Unplaced-student → bed assignment
  Payments.md        Weekly host-bill runs + Xero sync
  Portal.md          Host magic-link portal (v1 in progress)

Docs/
  Documents.md       Per-student documents + templates

Partner/
  Credit-Management-Staff.md      Giving/applying partner credit — plain-English staff guide
  Credit-Management-Technical.md  Partner-credit subsystem — data model, code paths, 3-way sync (Claude handoff)

Finance/
  LifePass-Subscription-Accounting.md  How a LifePass sale is invoiced across HubSpot + Xero,
                                       why the €7,425 master `-Sub` invoice exists, and the
                                       manual Xero void that stops the €297 auto-invoices double-counting
  Escrow.md                            TransferMate escrow hold → release → refund (SIS side): the
                                       shadow Payment row, the release "adopt the shadow" conversion in
                                       /invoice-paid, adoption edge cases, and the not-yet-built refund mirror

Media/
  App-Guide-Multilingual-Dubbing.md  SRT-timed video dubbing recipe + toolchain (dub-guide.js, OpenAI/ElevenLabs). Content-creation — destined for the CMS, parked here for the app guide.

System/
  Health-Check.md      System health page
  Filesystem-Map.md    Where every folder/file lives on disk + proposed cleanup spec (current state, nothing moved)
```

**Note:** the `Partner/` credit docs and the `Finance/` LifePass doc cover cross-system features
(SIS ↔ Xero ↔ HubSpot), not single sidebar views. Partner credit is created in SIS, mirrored to
Xero + a HubSpot task, and kept aligned when a human applies the HubSpot credit memo. LifePass
subscription billing is generated in HubSpot, syncs to Xero, and requires a manual Xero void so the
per-payment €297 invoices don't double-count the master receivable.

## Conventions used across files

**Edit-permission column** refers to SIS role tags (admin / accounts / dos /
sales / accomm / teacher / student / partner). Permission definitions live
at `src/app.ts:91-107`. Teacher / student / partner have ZERO SIS API
access by default.

**Automation column** lists every cron, webhook, or background job that
writes to the field. Manual-only fields say so explicitly. Audit trail for
financial fields (`amountTotal`, `amountPaid`, `amountOpen`, `status`) is
in `audit_log` — wired via the Prisma `withBookingAudit` extension at
`src/lib/prisma-audit.ts`.

**Update cadence**: this manual is a living document. When you change a
field's automation or edit-permission, update the table here in the same
PR.
