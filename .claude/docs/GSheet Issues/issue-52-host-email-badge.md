# Issue 52 - Host email not auto-populated in email To field

Reporter: KC | Area: Booking / Accomm | Sheet row: 54

## Symptom

Using Host Booking / Host Availability / Host Cancel templates: the To field defaults
to the student email. Staff must delete it and type the host email manually.
A Host recipient badge (like Student and Partner badges) is missing.

## Root cause

admin.html ~line 4442-4446 builds To: recipient badges:
  Student badge: s.email
  Partner badge: first agency email on student bookings
  NO Host badge exists

documents.ts line 863 resolves accommodation.email correctly in body tokens
but is never surfaced in the To: shortcut.

Evidence - Fanny Scelles (student 14451, booking 17843): 2 accommodation periods:
  BA 11267 (Aug 29 - Oct 4 2026): Bob & Ann OSullivan - bobosullivan5016@gmail.com
  BA 11399 (Oct 4 - Dec 19 2026): Linda Land - lindaland027@gmail.com

## Fix recipe (NOT YET RUN)

Step 1: Add Host badge to student comms To: area (admin.html approx line 4435-4447)

After the Partner badge, derive unique provider emails:

  const hostEmails = [];
  const seen = new Set();
  for (const b of (s.bookings || [])) {
    for (const a of (b.accommodations || [])) {
      const email = a.providerEmail || (a.provider && a.provider.email) || "";
      const name  = a.providerName  || (a.provider && a.provider.name)  || "Host";
      if (email && !seen.has(email.toLowerCase())) {
        seen.add(email.toLowerCase());
        hostEmails.push({ email, name });
      }
    }
  }
  // In the HTML template string:
  // hostEmails.map(h => badge(h.name, h.email, "#b45309")).join("")

PREREQUISITE: Verify s.bookings[].accommodations[] carries providerEmail or provider.email.
If not, update the student detail API endpoint to include it via
JOIN bed -> room -> property -> provider.

Step 2 (optional): Auto-switch To: when a Host template is selected.
In loadEmailTemplate() (~line 5424), if template name matches /host/i and
To: still holds the student email, swap to first host email and call syncCommsToBadges().

Step 3: commsBlock on the host page is already correct (defaultTo = p.email).
No change needed there.

## Risk / category

Category: UI feature - no data changes, no server changes
Risk: Low - admin.html client-side JS only
Reversible: Yes

## Status

Open - code change not applied. First diagnosed 2026-08-18.