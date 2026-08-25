import { Router } from 'express';
import multer from 'multer';
import { PrismaClient } from '../generated/prisma/client';
import { groupScripts } from '../scripts/groups';
import { parseGroupList } from '../scripts/group-list-parser';
import { extractUploadText } from '../scripts/extract-upload-text';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 15 * 1024 * 1024 } });

// Pull the raw student-list text from a HubSpot deal's INCOMING email
// engagements (the partner's messages) — the list usually lives there, not in
// Gmail. Newest first, deduped, length-capped. Non-student noise is fine; the
// parser ignores greetings/signatures.
async function dealThreadText(dealId: string): Promise<string> {
  const tok = process.env.ACCESS_TOKEN;
  if (!tok) throw new Error('ACCESS_TOKEN not set');
  const H = { Authorization: `Bearer ${tok}`, 'Content-Type': 'application/json' };
  const assoc: any = await (await fetch(`https://api.hubapi.com/crm/v3/objects/deals/${dealId}/associations/emails`, { headers: H })).json();
  const ids: string[] = (assoc.results || []).map((r: any) => String(r.id));
  if (!ids.length) return '';
  const batch: any = await (await fetch('https://api.hubapi.com/crm/v3/objects/emails/batch/read', {
    method: 'POST', headers: H,
    body: JSON.stringify({ inputs: ids.map(id => ({ id })), properties: ['hs_email_text', 'hs_email_direction', 'hs_timestamp'] }),
  })).json();
  const incoming = (batch.results || [])
    .filter((e: any) => (e.properties?.hs_email_direction || '').includes('INCOMING') && e.properties?.hs_email_text)
    .sort((a: any, b: any) => String(b.properties.hs_timestamp).localeCompare(String(a.properties.hs_timestamp)));
  let out = '', budget = 16000;
  for (const e of incoming) {
    const t = String(e.properties.hs_email_text).slice(0, budget);
    out += (out ? '\n\n----\n\n' : '') + t;
    budget -= t.length;
    if (budget <= 0) break;
  }
  return out;
}

// Create a matching HubSpot contact for every group member that doesn't have one
// yet (Student-B2B, stamped with the SIS student_id), associate it to the group's
// deal, and store the contact id back on the SIS student. Idempotent (skips
// already-pushed) and non-fatal per student (failures collected, not thrown).
async function pushGroupToHubspot(prisma: PrismaClient, groupId: number) {
  const tok = process.env.ACCESS_TOKEN;
  if (!tok) throw new Error('ACCESS_TOKEN not set');
  const H = { Authorization: `Bearer ${tok}`, 'Content-Type': 'application/json' };
  const g = await prisma.studentGroup.findUnique({ where: { id: groupId } });
  if (!g) throw new Error('Group not found');
  const bookings = await prisma.booking.findMany({
    where: { groupId },
    select: { student: { select: { id: true, firstName: true, lastName: true, email: true, birthday: true, nationality: true, hubspotContactId: true } } },
    orderBy: { id: 'asc' },
  });
  const results = { created: 0, skipped: 0, failed: [] as Array<{ studentId: number; name: string; error: string }> };
  for (const b of bookings) {
    const s = b.student;
    if (!s) continue;
    if (s.hubspotContactId) { results.skipped++; continue; }
    const name = `${s.firstName} ${s.lastName || ''}`.trim();
    try {
      // nationality deliberately omitted — it's a HubSpot enumeration and a
      // free-text mismatch (e.g. "Brazil") would fail the whole create. SIS keeps it.
      const props: any = { email: s.email, firstname: s.firstName, lastname: s.lastName || '', student_id: String(s.id), type: 'Student-B2B' };
      if (s.birthday) props.date_of_birth = new Date(s.birthday).toISOString().slice(0, 10);
      const cRes = await fetch('https://api.hubapi.com/crm/v3/objects/contacts', { method: 'POST', headers: H, body: JSON.stringify({ properties: props }) });
      const c: any = await cRes.json();
      if (!cRes.ok) throw new Error(c.message || JSON.stringify(c).slice(0, 140));
      const contactId = String(c.id);
      if (g.hubspotDealId) {
        await fetch(`https://api.hubapi.com/crm/v4/objects/contacts/${contactId}/associations/default/deals/${g.hubspotDealId}`, { method: 'PUT', headers: H, body: '{}' })
          .catch(() => {/* association is best-effort; contact still created + linked in SIS */});
      }
      await prisma.student.update({ where: { id: s.id }, data: { hubspotContactId: contactId } });
      results.created++;
    } catch (e: any) {
      results.failed.push({ studentId: s.id, name, error: String(e?.message || e) });
    }
  }
  return results;
}

export function groupRoutes(prisma: PrismaClient) {
  const router = Router();
  const scripts = groupScripts(prisma);

  // Overview list (upcoming by default). ?all=true to include past groups.
  router.get('/', async (req, res) => {
    try {
      const upcomingOnly = req.query.all !== 'true';
      res.json(await scripts.listGroups({ upcomingOnly }));
    } catch (e: any) { res.status(500).json({ error: String(e?.message || e) }); }
  });

  // Group detail + roster.
  router.get('/:id', async (req, res) => {
    try {
      const g = await scripts.getGroup(parseInt(req.params.id, 10));
      if (!g) return res.status(404).json({ error: 'Group not found' });
      res.json(g);
    } catch (e: any) { res.status(500).json({ error: String(e?.message || e) }); }
  });

  // Pull the raw student-list text off the group's HubSpot deal thread (to
  // pre-fill the import box). Returns the concatenated incoming-email text.
  router.get('/:id/deal-thread', async (req, res) => {
    try {
      const g = await scripts.getGroup(parseInt(req.params.id, 10));
      if (!g) return res.status(404).json({ error: 'Group not found' });
      if (!g.group.hubspotDealId) return res.json({ rawText: '', note: 'No HubSpot deal linked' });
      res.json({ rawText: await dealThreadText(g.group.hubspotDealId) });
    } catch (e: any) { res.status(500).json({ error: String(e?.message || e) }); }
  });

  // THE READER: unstructured student list → structured rows (for human review;
  // writes nothing). Accepts pasted text OR pulls the deal thread when asked.
  router.post('/:id/parse', async (req, res) => {
    try {
      let rawText = String(req.body?.rawText || '');
      if (!rawText.trim() && req.body?.fromDeal) {
        const g = await scripts.getGroup(parseInt(req.params.id, 10));
        if (g?.group.hubspotDealId) rawText = await dealThreadText(g.group.hubspotDealId);
      }
      res.json(await parseGroupList(rawText));
    } catch (e: any) { res.status(500).json({ error: String(e?.message || e) }); }
  });

  // UPLOAD: a file (CSV / PDF / Word / Excel) → extract text → parse. Returns the
  // extracted rawText (so staff can see/tweak it) plus the parsed rows.
  router.post('/:id/upload', upload.single('file'), async (req, res) => {
    try {
      const f = (req as any).file;
      if (!f) return res.status(400).json({ error: 'No file' });
      const rawText = await extractUploadText(f.buffer, f.originalname || 'upload');
      const parsed = await parseGroupList(rawText);
      res.json({ rawText, filename: f.originalname, ...parsed });
    } catch (e: any) { res.status(400).json({ error: String(e?.message || e) }); }
  });

  // COMMIT: reviewed rows → real SIS students + bookings (€0, group-linked,
  // provisional level). HubSpot contact push is a separate explicit step.
  router.post('/:id/commit', async (req, res) => {
    try {
      const students = Array.isArray(req.body?.students) ? req.body.students : [];
      const result = await scripts.commitGroupStudents(parseInt(req.params.id, 10), students, {
        createdBy: (req.session as any)?.user || null,
      });
      res.status(201).json({ created: result.created });
    } catch (e: any) { res.status(400).json({ error: String(e?.message || e) }); }
  });

  // PUSH TO HUBSPOT: create a Student-B2B contact per member (that lacks one),
  // associate to the deal, stamp student_id + store contact id. Idempotent.
  router.post('/:id/push-hubspot', async (req, res) => {
    try { res.json(await pushGroupToHubspot(prisma, parseInt(req.params.id, 10))); }
    catch (e: any) { res.status(400).json({ error: String(e?.message || e) }); }
  });

  return router;
}
