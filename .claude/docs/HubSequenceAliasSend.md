# HubSpot Sequence Enrollment with Alias Sender

How to enrol a contact in a HubSpot Sequence via the public API and have the email land showing a **different From address** than the connected personal inbox doing the actual send (e.g. display `partners@ulearnschool.com` while the SMTP relay is Saraa's connected Gmail inbox `saraa@ulearnschool.com`).

## Why this matters

HubSpot's UI lets you choose any Gmail Send-As alias as the visible sender when enrolling a contact in a sequence. That's the dropdown showing entries like `partners@ulearnschool.com (Alias of saraa@ulearnschool.com)`. The question is how to do the same thing via the public API, since field names aren't immediately obvious and most common guesses (`fromAlias`, `fromAddress`, `fromEmail`, `aliasEmail`, `senderAlias`) are silently ignored.

The correct field is **`senderAliasAddress`** — we only found this by reading the OpenAPI spec directly.

## The endpoint

```
POST https://api.hubapi.com/automation/v4/sequences/enrollments?userId={userId}
```

Only **one** enrollment endpoint exists. All UI entry points (contact list checkbox, contact detail page, compose-email → Sequences tab) funnel to this same endpoint.

## Correct payload shape

From the public OpenAPI spec (`PublicSequenceEnrollmentRequest`):

```jsonc
{
  "contactId":          "string — required, target contact ID",
  "sequenceId":         "string — required, sequence ID",
  "senderEmail":        "string — required, must be a HubSpot-connected personal inbox",
  "senderAliasAddress": "string — optional, the alias to display as"
}
```

Query param `?userId=` is required and names the acting HubSpot user (not owner ID — it's the user ID from `/settings/v3/users`).

## Working example

Sending as Saraa's Gmail inbox but displaying `From: partners@ulearnschool.com`:

```js
await fetch('https://api.hubapi.com/automation/v4/sequences/enrollments?userId=10141652', {
  method: 'POST',
  headers: { Authorization: `Bearer ${ACCESS_TOKEN}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({
    contactId:          '188014368972',
    sequenceId:         '803516647',
    senderEmail:        'saraa@ulearnschool.com',      // real connected inbox
    senderAliasAddress: 'partners@ulearnschool.com',   // visible From on the email
  }),
});
```

Returns 200 with an enrollment record. Recipient sees `From: partners@ulearnschool.com`. Replies route wherever the alias is configured to (in our Gmail setup: partners@ forwards into the partners@ team inbox, not Saraa's personal mailbox).

## Required setup on the HubSpot side

For `senderEmail` to be accepted:

- The user pointed to by `userId=` must have `senderEmail` connected as a **Personal Email** in HubSpot (Settings → General → Email → Connect personal email). This is the actual OAuth-connected Gmail/O365 mailbox that will SMTP-relay the message.
- The user needs a paid **Sales Hub seat** (Pro or Enterprise). Sequences are a paid feature.

For `senderAliasAddress` to be accepted:

- It must be a Send-As alias on the connected Gmail account (configured in Gmail Settings → Accounts → "Send mail as"). HubSpot imports the alias list when you connect the inbox.
- You don't need to register aliases separately in HubSpot — they come along with the inbox connection.

If you omit `senderAliasAddress`, the email displays `From: {senderEmail}`.

## Common failure modes

| HTTP | Message | What it means |
|---|---|---|
| 400 | `User X has no connected inboxes for specified user email` | `senderEmail` doesn't match any mailbox connected to the user pointed to by `userId`. Either connect the inbox, or point `userId` at a user who has the mailbox connected. |
| 400 | `Contact already enrolled in a sequence` | Contact is currently enrolled in *any* sequence. HubSpot allows only one active enrollment per contact at a time. Unenrol first (UI only — no public unenroll endpoint). |
| 403 | `Permission Denied — you do not have permission to access this content` | The user pointed to by `userId` lacks sequence-edit permission or Sales Hub seat. Verify their role. |
| 404 | (HTML 404) | You've hit the wrong URL. Common wrong paths: `/automation/v4/engagements/sequences/...`, `/automation/v3/sequences/enroll`. The correct path is `/automation/v4/sequences/enrollments`. |

## No public unenroll endpoint

HubSpot does not expose unenrol via the public API. You must unenrol from the HubSpot UI:

1. Automation → Sequences → open the sequence
2. Find the contact in the enrolled list → row menu (⋮) → Unenroll

After unenrolling, `hs_sequences_is_enrolled` on the contact flips back to `false` (can take a few seconds to propagate).

## Scopes required on the Private App

- `automation.sequences.enrollments.write` — enrol
- `sales-email-read` / `crm.objects.emails.read` — read engagement history (optional, for pre-flight reply checks)
- `crm.objects.contacts.read` — find contacts by email

## Why the obvious field-name guesses don't work

Before finding the spec I spent considerable time guessing field names. Some guesses (like `fromAlias`) were accepted by the API (returned HTTP 200) but **silently ignored** — the email still shipped with `From: {senderEmail}`. Silent acceptance of unknown fields is a general HubSpot pattern.

**Don't probe field names — read the spec first.**

## Where the spec lives

HubSpot publishes full OpenAPI 3.0 specs for all public APIs here:

```
git clone --depth 1 https://github.com/HubSpot/HubSpot-public-api-spec-collection /tmp/hs-specs
```

The sequences spec: `PublicApiSpecs/Automation/Sequences/Rollouts/177891/v4/sequences.json`

Local copy stored at: `.claude/docs/API/sequences-v4.json`
