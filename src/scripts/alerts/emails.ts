// Centralised INTERNAL alert emails — the ops/staff notifications fired from
// crons, webhooks and route handlers (e.g. "deal WON but no student to
// onboard", "1-to-1 booked — teacher needed", "new enrolment / partner
// registration", "refund request received by the team"). These are NOT
// customer-facing, so they stay in code rather than as editable DB templates —
// but they live HERE, in one place, instead of buried inline across the
// codebase. That keeps the full set of automated emails discoverable and stops
// any one going stale in a forgotten handler. (Neil 2026-09-24)
//
// Customer / partner / teacher-facing emails go the other way: editable DB
// document_templates rendered via ../render-template.ts and sent from the
// relevant handler.
import { sendEmail } from '../email';

const HS_PORTAL = 'https://app-eu1.hubspot.com/contacts/26488591/record/0-3';
// Where the enrolment/onboarding alerts land. One constant so it's trivial to
// re-route (a specific person, an ops address, or looping in partners@).
const ONBOARDING_ALERT_TO = 'success@ulearnschool.com';

// Deal WON / paid but SIS could not identify a real STUDENT to onboard (only
// partner/agency contacts on the deal, or the resolved student contact has no
// usable email). We must NOT fail silently — alert the team so they chase the
// partner to add/correct the Student-B2B contact in the Portal, or email us the
// student's address.
export async function alertMissingStudentContact(
  dealId: string,
  dealName: string | null,
  companyName: string | null,
  reason: string,
): Promise<void> {
  try {
    const name = dealName || `Deal ${dealId}`;
    await sendEmail({
      from: 'success@ulearnschool.com', fromName: 'ULearn SIS',
      to: ONBOARDING_ALERT_TO,
      subject: `⚠️ Booking WON but student not onboarded — ${name}`,
      html: `<p>A deal reached WON / paid but SIS could not onboard a <b>student</b>, so no Welcome email went out.</p>`
        + `<p><b>Deal:</b> ${name} (${dealId})<br><b>Partner:</b> ${companyName || '—'}<br><b>Reason:</b> ${reason}</p>`
        + `<p>Please have the partner add / correct the <b>Student-B2B</b> contact (with a real email) on this deal in the Portal — or email the student's address to us — so onboarding can proceed.</p>`
        + `<p><a href="${HS_PORTAL}/${dealId}">Open the deal in HubSpot</a></p>`,
    });
    console.log(`[alerts] missing-student alert sent for deal ${dealId}: ${reason}`);
  } catch (e: any) {
    console.warn(`[alerts] missing-student alert failed for deal ${dealId}: ${e?.message || e}`);
  }
}
