// ── Automation email-template registry ───────────────────────────────────────
// Automated / triggered emails (crons, webhooks, doc-send triggers) resolve their
// DB template by **ID first**, so a manual rename of the template's Name OR Slug
// in the Templates UI can never break the automation (this bit us once when
// "Welcome Aboard" → "Welcome Onboard" silently stopped the onboarding mail —
// Neil, 2026-09-27). The slug is kept as a self-healing fallback in case a
// re-seed ever changes the id.
//
// Keep this map in sync when a NEW automated email is added. Human-picked
// (staff-selected) templates don't need an entry — only ones fired by code.
export const TEMPLATE_ID_BY_SLUG: Record<string, number> = {
  'Welcome-Onboard': 97,          // first-payment onboarding (webhooks)
  'birthday': 93,                 // cron-birthdays
  'Attendance-Absence': 9,        // cron-absence-checkin + Monitor send-warning
  'transfer-arrival-details': 92, // cron-transfer-reminders
  'Level-Test': 103,              // level-test invite (tests.ts)
  'Visa-Approval-Notice': 79,     // visa-approval shunt notice (students.ts)
  'Day1-Orient': 66,              // Day-1 orientation
  'Teacher-Contract-Send': 104,   // teacher contract magic-link
  'Refund-Received': 105,
  'Refund-Rejected': 106,
  'Transport-Pickup': 107,
  'Transport-Dropoff': 108,
  'policy-student': 49,           // student policy doc email
  'policy-agent': 89,             // agent policy doc email
  'LoA-Attach-Agent': 75,
  'LoA-Attach-Student': 76,
  'Receipt-Notify-Student': 98,
  'Doc-Notify-Student': 102,
  'host-outreach-weekly': 91,     // host outreach / cascade crons
  'host-outreach-nudge-2': 94,
  'host-cascade-standard': 95,
  'host-cascade-gv-reminder': 96,
  'challenger-nudge-1': 113,       // KickStart challenger nudge drip (cron-challenger-nudge)
  'challenger-nudge-2': 114,
  'challenger-nudge-3': 115,
};

// Build a Prisma `where` that prefers the template ID and falls back to the slug.
// Use with findFirst (the OR clause isn't valid on findUnique). `extra` merges in
// the usual guards, e.g. { templateType: 'email', active: true }.
export function emailTemplateWhere(slug: string, extra: Record<string, any> = {}): Record<string, any> {
  const id = TEMPLATE_ID_BY_SLUG[slug];
  return id ? { ...extra, OR: [{ id }, { slug }] } : { ...extra, slug };
}
