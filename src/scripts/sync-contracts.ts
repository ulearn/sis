/**
 * Zoho Sign → SIS partner_documents sync.
 *
 * Pulls all signing requests, matches each signer's email to:
 *   1. A SisUser with that email → agency
 *   2. A HubSpot Contact with that email → Company → SIS agency
 * Stores metadata in partner_documents, caches the signed PDF locally.
 *
 * Initial run: full sync. Subsequent runs: idempotent (upserts by zoho_request_id).
 *
 * Cron (daily):
 *   45 6 * * * cd /home/sis/web/sis.ulearnschool.com/public_html/sis && \
 *     /usr/bin/node dist/scripts/sync-contracts.js \
 *     >> /home/sis/web/sis.ulearnschool.com/private/db/contracts-sync.log 2>&1
 */
import dotenv from 'dotenv';
import path from 'path';
import type { PrismaClient } from '../generated/prisma/client';
import { listAllRequests, downloadPdf } from './zoho';

dotenv.config();

const HUBSPOT_PAT = process.env.ACCESS_TOKEN!;
const PDF_DIR = path.join(__dirname, '..', '..', 'data', 'contracts');

// Module-scoped prisma is used inside findAgencyByEmail; set by syncContracts().
let prisma: PrismaClient = (null as any);

async function findAgencyByEmail(email: string): Promise<number | null> {
  if (!email) return null;
  const e = email.toLowerCase().trim();

  // 1. Direct match on sis_users.email
  const user = await prisma.sisUser.findFirst({
    where: { email: e, userType: 'partner' },
    select: { agencyId: true },
  });
  if (user?.agencyId) return user.agencyId;

  // 2. HubSpot contact → company → agency
  if (!HUBSPOT_PAT) return null;
  try {
    const searchRes = await fetch('https://api.hubapi.com/crm/v3/objects/contacts/search', {
      method: 'POST',
      headers: { Authorization: `Bearer ${HUBSPOT_PAT}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        filterGroups: [{ filters: [{ propertyName: 'email', operator: 'EQ', value: e }] }],
        properties: ['email'],
        limit: 1,
      }),
    });
    const searchData: any = await searchRes.json();
    const contactId = searchData.results?.[0]?.id;
    if (!contactId) return null;

    // Contact's companies
    const compRes = await fetch(`https://api.hubapi.com/crm/v4/objects/contacts/${contactId}/associations/companies`, {
      headers: { Authorization: `Bearer ${HUBSPOT_PAT}` },
    });
    const compData: any = await compRes.json();
    const companyIds: string[] = (compData.results || []).map((r: any) => String(r.toObjectId));
    for (const cid of companyIds) {
      const ag = await prisma.agency.findFirst({ where: { hubspotCompanyId: cid }, select: { id: true } });
      if (ag) return ag.id;
    }

    // Sole-trader fallback
    const ag = await prisma.agency.findFirst({
      where: { primaryEntityId: contactId, primaryEntityType: 'contact' },
      select: { id: true },
    });
    if (ag) return ag.id;
  } catch (e) {
    console.warn(`[sync-contracts] HubSpot lookup failed for ${email}: ${e}`);
  }

  // 3. Domain-based fallback — match signer's email domain to a HubSpot company domain.
  //    This catches cases where the signer used a work email that isn't the one on the
  //    HubSpot Contact record (e.g. saraa@ulearnschool.com vs saraa.tpb@gmail.com).
  const domain = e.split('@')[1];
  if (domain && !GENERIC_DOMAINS.has(domain) && HUBSPOT_PAT) {
    try {
      const searchRes = await fetch('https://api.hubapi.com/crm/v3/objects/companies/search', {
        method: 'POST',
        headers: { Authorization: `Bearer ${HUBSPOT_PAT}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filterGroups: [{ filters: [{ propertyName: 'domain', operator: 'EQ', value: domain }] }],
          properties: ['domain'],
          limit: 1,
        }),
      });
      const searchData: any = await searchRes.json();
      const companyId = searchData.results?.[0]?.id;
      if (companyId) {
        const ag = await prisma.agency.findFirst({ where: { hubspotCompanyId: companyId }, select: { id: true } });
        if (ag) return ag.id;
      }
    } catch (e) {
      // non-fatal
    }
  }

  return null;
}

// Generic email providers — never use these for domain-based matching
const GENERIC_DOMAINS = new Set([
  'gmail.com', 'googlemail.com', 'hotmail.com', 'hotmail.co.uk', 'outlook.com', 'outlook.es',
  'yahoo.com', 'yahoo.es', 'yahoo.co.uk', 'live.com', 'icloud.com', 'me.com',
  'aol.com', 'msn.com', 'protonmail.com', 'mail.ru', 'yandex.com', 'qq.com',
  '163.com', '126.com', 'naver.com', 'hanmail.net', 'daum.net',
]);

// Exported so the main SIS app can run the sync in-process (e.g. fire-and-forget
// after a new partner registers). Also used by the standalone runner at the bottom.
export async function syncContracts(client: PrismaClient): Promise<{ created: number; updated: number; mapped: number; unmapped: number; downloaded: number; total: number }> {
  prisma = client;
  const started = new Date();
  console.log(`[sync-contracts] Started at ${started.toISOString()}`);

  const requests = await listAllRequests();
  console.log(`[sync-contracts] Fetched ${requests.length} requests from Zoho`);

  let created = 0, updated = 0, mapped = 0, unmapped = 0, downloaded = 0;

  for (const r of requests) {
    const requestId: string = r.request_id;
    const requestName: string = r.request_name || '';
    const folderName: string | null = r.folder_name || null;
    const status: string = r.request_status || 'unknown';
    const actionTime = r.action_time ? new Date(r.action_time) : null; // signed timestamp
    const createdTime = r.created_time ? new Date(r.created_time) : null;

    // The external signer (first SIGN action NOT from a ULearn staff email — those
    // are us countersigning and aren't the partner we want to attribute the doc to).
    const allSigners = (r.actions || []).filter((a: any) => a.action_type === 'SIGN');
    const externalSigners = allSigners.filter((a: any) => {
      const e = (a.recipient_email || '').toLowerCase();
      return !e.endsWith('@ulearn.ie') && !e.endsWith('@ulearnschool.com');
    });
    const signer = (externalSigners[0] || allSigners[0]) || {};
    const signerEmail = (signer.recipient_email || '').toLowerCase().trim() || null;
    const signerName = signer.recipient_name || null;
    const docId = r.document_ids?.[0]?.document_id || null;

    // Map to agency. Never overwrite a manually-set agency_id with null —
    // manual corrections (for edge cases like staff-signed-as-agent) are preserved.
    const looked = signerEmail ? await findAgencyByEmail(signerEmail) : null;
    const existingForMap = await prisma.partnerDocument.findUnique({ where: { zohoRequestId: requestId }, select: { agencyId: true } });
    const agencyId = looked ?? existingForMap?.agencyId ?? null;
    if (agencyId) mapped++; else unmapped++;

    // Download PDF on first sight of a completed contract (once only)
    let pdfPath: string | null = null;
    const existing = await prisma.partnerDocument.findUnique({ where: { zohoRequestId: requestId } });
    if (status === 'completed' && !existing?.pdfCachedPath) {
      try {
        pdfPath = await downloadPdf(requestId, PDF_DIR);
        downloaded++;
      } catch (e) {
        console.warn(`[sync-contracts] PDF download failed for ${requestId}: ${e}`);
      }
    }

    const payload = {
      zohoRequestId: requestId,
      zohoDocumentId: docId,
      requestName,
      folderName,
      requestStatus: status,
      signedAt: actionTime,
      createdAtZoho: createdTime,
      signerEmail,
      signerName,
      agencyId,
      pdfCachedPath: pdfPath || existing?.pdfCachedPath || null,
      rawJson: r,
    };

    if (existing) {
      await prisma.partnerDocument.update({ where: { zohoRequestId: requestId }, data: payload });
      updated++;
    } else {
      await prisma.partnerDocument.create({ data: payload });
      created++;
    }
  }

  const elapsed = Math.round((Date.now() - started.getTime()) / 1000);
  console.log(`[sync-contracts] Done in ${elapsed}s — created: ${created}, updated: ${updated}, mapped: ${mapped}, unmapped: ${unmapped}, pdfs downloaded: ${downloaded}`);

  return { created, updated, mapped, unmapped, downloaded, total: requests.length };
}

// Standalone CLI runner (nightly cron). When imported by other modules (e.g.
// partners.ts fire-and-forget after registration), this block is skipped.
if (require.main === module) {
  (async () => {
    const { Pool } = await import('pg');
    const { PrismaPg } = await import('@prisma/adapter-pg');
    const { PrismaClient } = await import('../generated/prisma/client');
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const adapter = new PrismaPg(pool as any);
    const client = new PrismaClient({ adapter } as any);
    try {
      await syncContracts(client);
    } catch (e) {
      console.error('[sync-contracts] Fatal:', e);
      process.exitCode = 1;
    } finally {
      await client.$disconnect();
      await pool.end();
    }
  })();
}
