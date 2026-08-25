# HANDOVER — KickStart "Challenge" line on the ulearnschool.com booking form

## Goal
Add ONE opt-in line to the public B2C booking form, **just below DOB + Nationality**. On the website
keep it **space-conscious: entire text on a single line, checkbox on the RIGHT**:

```
Enter KickStart Challenge? June KickStarters Get -22% Off!            [ ☑ ]
```

(The SIS partner portal used a two-line title+sub card with the box on the right — here flatten it to
one line.) When ticked it flags the HubSpot Deal so the hub `autoQuote` applies this month's discount.
The **month + % are DYNAMIC** (June / 22 today).

## The one rule that makes this trivial
You do **NOT** compute any discount and do **NOT** hardcode the month/%. The checkbox does ONE thing:
stamp the HubSpot Deal property **`challenge`** with the active challenge NAME (e.g. `KickStart`). The
hub autoQuote reads that and applies the % itself. Everything else here is just a dynamic label.

## Shared single source of truth (built for exactly this)
`GET https://hub.ulearnschool.com/hubapp/challenges/current`
```json
{"success":true,"challenge":{"type":"KickStart","month":"2026-06","percent":22,
 "starts":"2026-06-01","ends":"2026-06-30","appliesTo":"Course Fees"}}
```
- `{"success":true,"challenge":null}` -> no live challenge this month -> **hide the field**.
- Backed by hub `hubapp/scripts/challenges/challenges.json` — the ONLY place the monthly schedule is
  edited (live-read, no restart; carries start+end dates). **Do not duplicate the schedule in Drupal.**
- Full map also at `GET /hubapp/challenges`.

## CORS
The endpoint sends **no `Access-Control-Allow-Origin`** header, so a browser fetch from
ulearnschool.com is blocked. **Fetch it server-side in PHP** (`\Drupal::httpClient()`) — no CORS,
cacheable. (Alt: SIS can add a CORS header to the hub route on request, but PHP-side is cleaner.)

## 3 changes

### 1. Deal stamp — modules/custom/booking_enrichment/src/Plugin/QueueWorker/BookingEnrichmentWorker.php
In `buildDealProperties(array $data)` add (mirrors SIS enroll()):
```php
// Challenge opt-in -> stamp the active challenge NAME; hub autoQuote applies the %.
if (!empty($data["challenge"])) {            // the new checkbox value
  $type = self::activeChallengeType();        // from hub endpoint (cached)
  if ($type) $props["challenge"] = $type;     // HubSpot enum: KickStart | CashBack (already exists)
}
```
Helper:
```php
private static function activeChallengeType(): ?string {
  try {
    $res = \Drupal::httpClient()->get("https://hub.ulearnschool.com/hubapp/challenges/current", ["timeout" => 4]);
    $j = json_decode((string) $res->getBody(), TRUE);
    return $j["challenge"]["type"] ?? NULL;
  } catch (\Throwable $e) { return NULL; }
}
```
`challenge` is a Deal enumeration property (KickStart | CashBack) — already exists in HubSpot, so the
PATCH will not 400.

### 2. Form field — the booking Webform
Add a checkbox element key `challenge` immediately after the nationality field. Ensure its submitted
value reaches the queue `$data` array the worker reads. TRACE how `nationality` / `date_of_birth`
currently flow from the webform submission into the QueueWorker `$data` and match that path.

### 3. Dynamic label + single-line layout
Set the checkbox `#title` from the live endpoint (PHP `hook_form_alter` /
`hook_webform_submission_form_alter`, cached). Template:
`"Enter {type} Challenge? {month} {type}ers Get -{percent}% Off!"`
-> "Enter KickStart Challenge? June KickStarters Get -22% Off!"
- Render the **whole title on one line with the checkbox to its right** (flex row;
  `white-space:nowrap` / `text-overflow:ellipsis` if it ever overflows on narrow mobile).
- If `challenge === null` -> `#access = FALSE` (hide).
- NOTE: "KickStarters" is specific to the KickStart challenge; adjust phrasing if/when a CashBack
  month runs (the only non-token bit of copy).

## Do NOT
- compute discounts or store %/dates in Drupal (single source = hub registry).
- add the partner-portal "apply to all enrolments" blanket toggle — that was for repeat agents; the
  public form is one student at a time, so just the per-booking checkbox.

## Reference — SIS side (same feature, Node)
- sis: `src/scripts/partners.ts` -> getActiveChallenge() (hub fetch+cache+fallback), enroll() stamps
  dealProps.challenge, currentChallenge() for the label. `public/partners.html` -> loadChallenge()
  + the green-checkbox card (text rows + box pushed right via margin-left:auto).
- hub: `scripts/challenges/challenges.json` (data, live-read) via `scripts/challenges/registry.js`
  + `index.js` route `/hubapp/challenges/current`.
