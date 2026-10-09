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
    select: { student: { select: { id: true, firstName: true, lastName: true, email: true, phone: true, birthday: true, nationality: true, currentLevel: true, hubspotContactId: true } } },
    orderBy: { id: 'asc' },
  });

  // SIS student → HubSpot contact props. Only POPULATED fields are included; an
  // empty SIS field is left unset in HubSpot (blank is the expected result).
  // nationality is sent as-is: the SIS nationality list is a mirror of HubSpot's
  // `nationality` select (aligned 2025/26, HubSpot = source of truth), so the
  // value always matches an option — no free-text mismatch risk.
  const buildProps = (s: any) => {
    const p: any = { firstname: s.firstName, lastname: s.lastName || '', student_id: String(s.id), type: 'Student-B2B' };
    if (s.email) p.email = s.email;
    if (s.phone) p.phone = s.phone;
    if (s.birthday) p.date_of_birth = new Date(s.birthday).toISOString().slice(0, 10);
    // level intentionally NOT sent: HubSpot's `level` is fed by the quiz/placement
    // pipeline (its source of truth) — pushing SIS's (often provisional) level here
    // would risk clobbering a real quiz/placement result. Leave it to that flow.
    if (s.nationality) p.nationality = s.nationality;
    return p;
  };

  const results = { created: 0, updated: 0, failed: [] as Array<{ studentId: number; name: string; error: string }> };
  for (const b of bookings) {
    const s = b.student;
    if (!s) continue;
    const name = `${s.firstName} ${s.lastName || ''}`.trim();
    const props = buildProps(s);
    try {
      if (s.hubspotContactId) {
        // Already linked → backfill/refresh the mapped fields (idempotent), so a
        // re-run fills in email/phone/nationality/level added since the create.
        const uRes = await fetch(`https://api.hubapi.com/crm/v3/objects/contacts/${s.hubspotContactId}`, { method: 'PATCH', headers: H, body: JSON.stringify({ properties: props }) });
        if (!uRes.ok) { const u: any = await uRes.json().catch(() => ({})); throw new Error(u.message || JSON.stringify(u).slice(0, 140)); }
        results.updated++;
        continue;
      }
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

// PULL FROM HUBSPOT: refresh the group's HubSpot-owned identity fields from its
// deal — the associated Company (name + id) and the Leaders (deal-associated
// contacts flagged `leader = true`, so a setup agent who doesn't travel stays
// unset and whoever actually travels is a leader). Programme details
// (course/accom/activities/transport) aren't structured in the deal, so they
// stay SIS-managed. Reusable for a future "create group from deal" intake.
async function pullGroupFromHubspot(prisma: PrismaClient, groupId: number) {
  const tok = process.env.ACCESS_TOKEN;
  if (!tok) throw new Error('ACCESS_TOKEN not set');
  const H = { Authorization: `Bearer ${tok}`, 'Content-Type': 'application/json' };
  const g = await prisma.studentGroup.findUnique({ where: { id: groupId } });
  if (!g) throw new Error('Group not found');
  if (!g.hubspotDealId) throw new Error('Group has no linked HubSpot deal');
  const deal = g.hubspotDealId;
  const jget = async (u: string) => (await fetch(u, { headers: H })).json();

  const data: any = {};
  // Company — first associated company (name + id).
  const compAssoc: any = await jget(`https://api.hubapi.com/crm/v3/objects/deals/${deal}/associations/companies`);
  const compId = (compAssoc.results || [])[0]?.id;
  if (compId) {
    const c: any = await jget(`https://api.hubapi.com/crm/v3/objects/companies/${compId}?properties=name`);
    data.hubspotCompanyId = String(compId);
    if (c.properties?.name) data.company = c.properties.name;
    // Resolve the SIS Agency from the company so the group is agency-linked —
    // required for the partner portal to surface it (everything there is scoped
    // by agencyId). Without this a group stays orphaned and invisible to its partner.
    const agency = await prisma.agency.findFirst({ where: { hubspotCompanyId: String(compId) }, select: { id: true } });
    if (agency) data.agencyId = agency.id;
  }
  // Leaders — deal-associated contacts flagged leader=true (the HubSpot contact
  // checkbox). These are the group's chaperones/leaders (often young staff who
  // travel with the kids) — DISTINCT from the group's commercial Lead Contact
  // (contactName/contactEmail/contactUserId), which is retained untouched. We
  // capture each leader's name + email + phone into `leaderContacts` (JSON) for
  // display + one-click comms; `leaders` keeps the names string for compatibility.
  const cAssoc: any = await jget(`https://api.hubapi.com/crm/v3/objects/deals/${deal}/associations/contacts`);
  const contactIds = [...new Set((cAssoc.results || []).map((r: any) => String(r.id)))] as string[];
  const leaderRows: { name: string; email: string; phone: string }[] = [];
  for (const id of contactIds) {
    const c: any = await jget(`https://api.hubapi.com/crm/v3/objects/contacts/${id}?properties=firstname,lastname,leader,email,phone,mobilephone`);
    if (String(c.properties?.leader).toLowerCase() === 'true') {
      const name = `${c.properties.firstname || ''} ${c.properties.lastname || ''}`.trim();
      const email = (c.properties.email || '').trim();
      const phone = (c.properties.mobilephone || c.properties.phone || '').trim();
      if (name || email) leaderRows.push({ name, email, phone });
    }
  }
  data.leaders = leaderRows.map(l => l.name).filter(Boolean).join(', ') || null;
  data.leaderContacts = leaderRows.length ? JSON.stringify(leaderRows) : null;
  // NOTE: contactName / contactEmail / contactPhone / contactUserId (the Lead
  // Contact) are deliberately NOT touched here.

  // Deal → quote + invoice customer share links. The group is the APEX entity for
  // the deal→quote→invoice hierarchy; members carry no financials. Non-fatal.
  try {
    const qA: any = await jget(`https://api.hubapi.com/crm/v3/objects/deals/${deal}/associations/quotes`);
    const qId = (qA.results || [])[0]?.id;
    if (qId) { const q: any = await jget(`https://api.hubapi.com/crm/v3/objects/quotes/${qId}?properties=hs_quote_link`); data.hubspotQuoteUrl = q.properties?.hs_quote_link || null; }
    const iA: any = await jget(`https://api.hubapi.com/crm/v3/objects/deals/${deal}/associations/invoices`);
    const iId = (iA.results || [])[0]?.id;
    if (iId) { const inv: any = await jget(`https://api.hubapi.com/crm/v3/objects/invoices/${iId}?properties=hs_invoice_link,hs_number`); data.hubspotInvoiceUrl = inv.properties?.hs_invoice_link || null; data.hubspotInvoiceNumber = inv.properties?.hs_number || null; }
  } catch (e: any) { console.warn('[groups.pull] quote/invoice fetch failed:', e?.message || e); }

  const updated = await prisma.studentGroup.update({ where: { id: groupId }, data });
  return {
    company: updated.company, hubspotCompanyId: updated.hubspotCompanyId,
    leaders: updated.leaders, leaderCount: leaderRows.length,
    hubspotQuoteUrl: updated.hubspotQuoteUrl, hubspotInvoiceUrl: updated.hubspotInvoiceUrl, hubspotInvoiceNumber: updated.hubspotInvoiceNumber,
  };
}

// CREATE GROUP FROM DEAL: the intake. Given a HubSpot group deal, create the
// StudentGroup shell (name + pax from the deal) then pull Company + Leaders from
// its associations. Programme details (course/accom/activities/transport) aren't
// structured in the deal, so they're entered in SIS afterwards; members come via
// the Import Students flow. Refuses a duplicate on the same deal.
async function createGroupFromDeal(prisma: PrismaClient, dealIdRaw: string) {
  const tok = process.env.ACCESS_TOKEN;
  if (!tok) throw new Error('ACCESS_TOKEN not set');
  const dealId = String(dealIdRaw || '').replace(/\D/g, '');   // tolerate a pasted deal URL
  if (!dealId) throw new Error('A HubSpot deal id is required');
  const dupe = await prisma.studentGroup.findFirst({ where: { hubspotDealId: dealId }, select: { id: true, name: true } });
  if (dupe) throw new Error(`A group already exists for that deal — #${dupe.id} (${dupe.name})`);
  const H = { Authorization: `Bearer ${tok}`, 'Content-Type': 'application/json' };
  const deal: any = await (await fetch(`https://api.hubapi.com/crm/v3/objects/deals/${dealId}?properties=dealname,pax`, { headers: H })).json();
  if (!deal?.id) throw new Error(`HubSpot deal ${dealId} not found`);
  const name = deal.properties?.dealname || `Group (deal ${dealId})`;
  const pax = deal.properties?.pax ? parseInt(String(deal.properties.pax), 10) : null;
  const g = await prisma.studentGroup.create({ data: { hubspotDealId: dealId, name, pax } });
  // Best-effort pull of Company + Leaders; group is created regardless.
  try { await pullGroupFromHubspot(prisma, g.id); } catch (e: any) { console.warn('[groups.create] pull failed:', e?.message || e); }
  return { id: g.id, name };
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

  // Create a group from a HubSpot deal (the intake). Body: { dealId } (id or URL).
  router.post('/', async (req, res) => {
    try {
      const r = await createGroupFromDeal(prisma, req.body?.dealId);
      res.status(201).json(r);
    } catch (e: any) { res.status(400).json({ error: String(e?.message || e) }); }
  });

  // Group detail + roster.
  router.get('/:id', async (req, res) => {
    try {
      const g = await scripts.getGroup(parseInt(req.params.id, 10));
      if (!g) return res.status(404).json({ error: 'Group not found' });
      res.json(g);
    } catch (e: any) { res.status(500).json({ error: String(e?.message || e) }); }
  });

  // Edit a whitelist of SIS-managed group fields (no group-edit endpoint existed
  // before). Currently just the external accommodation address — a hotel/etc the
  // group self-arranged that we never booked, stored group-level (one source of
  // truth, no student singled out). Extend the whitelist as more inline edits land.
  router.patch('/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const ALLOWED = ['accomAddress'];
      const data: any = {};
      for (const k of ALLOWED) if (k in (req.body || {})) data[k] = req.body[k] === '' ? null : req.body[k];
      if (!Object.keys(data).length) return res.status(400).json({ error: 'No editable fields provided' });
      const g = await prisma.studentGroup.update({ where: { id }, data, select: { id: true, accomAddress: true } });
      res.json({ success: true, group: g });
    } catch (e: any) { res.status(400).json({ error: String(e?.message || e) }); }
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

  // PULL FROM HUBSPOT: refresh Company + Leaders from the deal's associations.
  router.post('/:id/pull-hubspot', async (req, res) => {
    try { res.json(await pullGroupFromHubspot(prisma, parseInt(req.params.id, 10))); }
    catch (e: any) { res.status(500).json({ error: String(e?.message || e) }); }
  });

  return router;
}
