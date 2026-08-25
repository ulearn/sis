# SIS spec — write SIS student id back into the HubSpot contact

**For:** the SIS-side Claude.
**Why:** The TM checkout (`hub`) prefills the payer form, including a **Student
number** field. It reads the HubSpot **contact** property `student_id`. That
property exists but is **empty on every contact** — so the student number never
prefills. SIS already stores each student's HubSpot contact id, so SIS can push
the SIS student id back into HubSpot directly.

## What to do
For each SIS Student that has a stored **HubSpot contact id** (HubID):
- PATCH that HubSpot **contact**, setting property **`student_id`** = the SIS
  student id (string).

HubSpot call:
```
PATCH https://api.hubapi.com/crm/v3/objects/contacts/{hubContactId}
Authorization: Bearer <HubSpot private-app token>
{ "properties": { "student_id": "<SIS student id>" } }
```

## Two passes
1. **One-time backfill** — loop all existing SIS students with a HubID and write
   `student_id`. (Plenty are already populated with HubIDs, so this is straightforward.)
2. **Ongoing — inside the `/invoice-created` webhook handler** (`src/routes/webhooks.ts`,
   `router.post('/invoice-created')`). That handler is the workflow→webhook that
   **creates the SIS Student** when an invoice is created in HubSpot
   (`https://sis.ulearnschool.com/sis/api/webhooks/invoice-created`). Right after the
   Student is created (so the SIS student id exists) and you already have the
   originating HubSpot **contact id** in scope, fire the same PATCH to set
   `student_id` on that contact. One extra call at the end of the existing flow —
   no new endpoint. The handler already has HubSpot helpers (`hsGet`/`hsPost`); add a
   PATCH (or raw `apiRequest`) to `/crm/v3/objects/contacts/{id}`.

## Notes
- Target property is **`student_id`** (HubSpot label "Student ID") — this is what
  the checkout prefill reads first. (There's also a `fidelo_id` property, label
  "SIS ID", left over from the Fidelo era — ignore it unless Neil wants the SIS id
  mirrored there too.)
- No hub-side change needed: the checkout already reads `student_id` (see
  `scripts/tm/pay.js prefillFromRef`), so the moment SIS populates it, the Student
  number field fills itself.
- Idempotent: safe to re-run; it just overwrites `student_id` with the same value.
