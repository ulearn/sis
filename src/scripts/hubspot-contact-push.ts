// Push SIS test results back to the HubSpot Contact. Direction is SIS →
// HubSpot (contact properties); the inverse direction (invoice → booking)
// lives in hubspot-sync.ts.
//
// Two contact properties owned here:
//   level       ← students.current_level mapped through HUBSPOT_LEVEL_LABEL.
//                 HubSpot's `level` is a dropdown select whose internal
//                 option values are the full labels (e.g. "B2-UprInt", not
//                 just "B2"). Pushing the bare CEFR code silently fails to
//                 match the option, so we expand it here.
//   quiz_score  ← whichever score is freshest:
//                   PLACEMENT / DELTA → students.placement_test_score (40-Q %)
//                   QUIZ              → students.quiz_score (20-Q %)
//                 HubSpot stores quiz_score as single-line text, so we send
//                 a plain stringified number.

// CEFR code → HubSpot dropdown option value. Internal name == label.
const HUBSPOT_LEVEL_LABEL: Record<string, string> = {
  A1: 'A1-Beginner',
  A2: 'A2-PreInt',
  B1: 'B1-Int',
  B2: 'B2-UprInt',
  C1: 'C1-Adv',
  C2: 'C2-Prof',
};
//
// Contact lookup order, per Paul's directive (99.9% of SIS students arrived
// via HubSpot first, so the ID is almost always set):
//   1. students.hubspot_contact_id  — direct lookup
//   2. fallback to HubSpot Contact search by email
// If neither finds a contact, this is a no-op.
//
// Fire-and-forget: errors are logged but never bubble. Submitting a test
// must never fail because HubSpot is slow or down.
import https from 'https';
import type { PrismaClient } from '../generated/prisma/client';

function hsRequest(method: 'GET' | 'PATCH' | 'POST', path: string, body: any, token: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : '';
    const headers: Record<string, string | number> = { Authorization: `Bearer ${token}` };
    if (payload) {
      headers['Content-Type'] = 'application/json';
      headers['Content-Length'] = Buffer.byteLength(payload);
    }
    const req = https.request({ hostname: 'api.hubapi.com', path, method, headers }, (res) => {
      let data = '';
      res.on('data', (c: string) => data += c);
      res.on('end', () => {
        if ((res.statusCode ?? 0) >= 400) {
          return reject(new Error(`HubSpot ${method} ${path} → ${res.statusCode}: ${data.slice(0, 200)}`));
        }
        try { resolve(JSON.parse(data || '{}')); } catch { resolve(null); }
      });
    });
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

async function findContactIdByEmail(email: string, token: string): Promise<string | null> {
  if (!email) return null;
  const body = {
    filterGroups: [{ filters: [{ propertyName: 'email', operator: 'EQ', value: email }] }],
    properties: ['email'],
    limit: 1,
  };
  const r = await hsRequest('POST', '/crm/v3/objects/contacts/search', body, token);
  return r?.results?.[0]?.id || null;
}

// Write the SIS student id back into the HubSpot contact's `student_id`
// property (HubSpot label "Student ID"). The TM checkout prefill reads this
// first (see hub `scripts/tm/pay.js prefillFromRef`), so populating it makes
// the "Student number" field fill itself. Idempotent — re-running overwrites
// with the same value. Fire-and-forget: never bubble (the webhook that calls
// this must not fail just because HubSpot is slow). `fidelo_id` (label "SIS
// ID") is a Fidelo-era leftover and deliberately untouched.
// Returns true on a successful PATCH, false otherwise. Never throws, so the
// webhook can call it un-awaited (fire-and-forget); the backfill awaits the
// boolean to tally successes/failures.
export async function pushSisStudentIdToHubspot(
  contactId: string | null | undefined,
  sisStudentId: number,
  token: string | undefined = process.env.ACCESS_TOKEN,
): Promise<boolean> {
  if (!token || !contactId) return false;
  try {
    // student_id = raw id (TM checkout prefill); sis_id = clickable deep-link into the
    // SIS admin student record (Neil, 2026-08-23) — a HubSpot→SIS jump for the team.
    const sisUrl = `https://sis.ulearnschool.com/sis/admin#/student-detail/${sisStudentId}`;
    await hsRequest('PATCH', `/crm/v3/objects/contacts/${encodeURIComponent(contactId)}`,
      { properties: { student_id: String(sisStudentId), sis_id: sisUrl } }, token);
    console.log(`[hubspot-push] sis id ${sisStudentId} → contact ${contactId}: student_id + sis_id set`);
    return true;
  } catch (e: any) {
    console.error(`[hubspot-push] sis id ${sisStudentId} → contact ${contactId} FAILED:`, e?.message || e);
    return false;
  }
}

export async function pushStudentTestResultToHubspot(prisma: PrismaClient, studentId: number): Promise<void> {
  const token = process.env.ACCESS_TOKEN;
  if (!token) return;
  try {
    const s = await prisma.student.findUnique({
      where: { id: studentId },
      select: { email: true, hubspotContactId: true, currentLevel: true, quizScore: true, placementTestScore: true },
    });
    if (!s) return;

    // Resolve contact: prefer the stored ID, fall back to email search.
    let contactId = s.hubspotContactId || null;
    if (!contactId && s.email) {
      contactId = await findContactIdByEmail(s.email, token);
      if (contactId) {
        // Backfill the SIS row so the next push skips the search.
        await prisma.student.update({ where: { id: studentId }, data: { hubspotContactId: contactId } as any });
      }
    }
    if (!contactId) {
      console.log(`[hubspot-push] student ${studentId}: no HubSpot contact found by id or email — skip`);
      return;
    }

    // Placement (40-Q) is more authoritative than quiz (20-Q); use it when present.
    const scoreToPush = s.placementTestScore != null ? s.placementTestScore : s.quizScore;
    const properties: Record<string, string> = {};
    if (s.currentLevel) {
      const cefr = String(s.currentLevel).toUpperCase();
      const mapped = HUBSPOT_LEVEL_LABEL[cefr];
      if (mapped) properties.level = mapped;
      else console.warn(`[hubspot-push] student ${studentId}: unknown CEFR "${cefr}" — level not pushed`);
    }
    if (scoreToPush != null) properties.quiz_score = String(scoreToPush);
    if (Object.keys(properties).length === 0) return;

    await hsRequest('PATCH', `/crm/v3/objects/contacts/${encodeURIComponent(contactId)}`, { properties }, token);
    console.log(`[hubspot-push] student ${studentId} → contact ${contactId}: ${JSON.stringify(properties)}`);
  } catch (e: any) {
    console.error(`[hubspot-push] student ${studentId} FAILED:`, e?.message || e);
  }
}
