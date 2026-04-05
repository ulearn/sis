/**
 * One-time script: Match SIS hosts to Xero contacts
 *
 * For each SIS host:
 * 1. Search Xero by email, then name, then account number
 * 2. If found: store xeroContactId
 * 3. If not found: log to NotFoundXero.md
 *
 * Also: find Xero "Accomm Hosts" contacts not in SIS → NotFoundSIS.md
 *
 * Usage: node dist/scripts/xero-host-match.js
 */

import dotenv from 'dotenv';
import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';
import { getAuthedXero } from './xero';
import fs from 'fs';
import path from 'path';

dotenv.config();

async function main() {
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool as any);
  const prisma = new PrismaClient({ adapter });

  const { xero, tenantId } = await getAuthedXero();

  // Get contacts from "Accomm Hosts" group
  console.log('Fetching Xero "Accomm Hosts" group contacts...');
  const ACCOMM_GROUP_ID = '3a6ef17b-42b3-48a3-94a6-db271f6824e8';
  const groupRes = await xero.accountingApi.getContactGroup(tenantId, ACCOMM_GROUP_ID);
  const groupContacts = groupRes.body.contactGroups?.[0]?.contacts || [];
  console.log(`Accomm Hosts group: ${groupContacts.length} contacts`);

  // Fetch full details for each contact (batched by IDs)
  console.log('Fetching full contact details...');
  const accommHosts: any[] = [];
  const batchSize = 50;
  for (let i = 0; i < groupContacts.length; i += batchSize) {
    const batch = groupContacts.slice(i, i + batchSize);
    const ids = batch.map((c: any) => c.contactID).join(',');
    const res = await xero.accountingApi.getContacts(tenantId, undefined, undefined, undefined, [ids] as any);
    accommHosts.push(...(res.body.contacts || []));
    process.stdout.write(`  ${Math.min(i + batchSize, groupContacts.length)}/${groupContacts.length}\r`);
    await new Promise(r => setTimeout(r, 300));
  }
  console.log(`\nFetched full details for ${accommHosts.length} contacts`);

  // Get all SIS hosts
  const sisHosts = await prisma.accommodationProvider.findMany({
    select: { id: true, name: true, email: true, iban: true, bic: true, xeroContactId: true },
  });
  console.log(`SIS hosts: ${sisHosts.length}`);

  const notFoundXero: string[] = [];
  const matched: { sisId: number; sisName: string; xeroId: string; xeroName: string; matchedBy: string }[] = [];
  let alreadyLinked = 0;

  for (const host of sisHosts) {
    if (host.xeroContactId) { alreadyLinked++; continue; }

    const acctNumber = (host.bic && host.iban) ? `${host.bic}/${host.iban}` : host.iban;
    let found: any = null;
    let matchedBy = '';

    // Try email match
    if (host.email) {
      found = accommHosts.find(c => c.emailAddress?.toLowerCase() === host.email!.toLowerCase());
      if (found) matchedBy = 'email';
    }

    // Try name match
    if (!found) {
      found = accommHosts.find(c => c.name?.toLowerCase() === host.name.toLowerCase());
      if (found) matchedBy = 'name';
    }

    // Try account number match
    if (!found && acctNumber) {
      found = accommHosts.find(c => c.accountNumber === acctNumber);
      if (found) matchedBy = 'account';
    }

    // Fuzzy name match (strip apostrophes, spaces)
    if (!found) {
      const normalize = (s: string) => s.toLowerCase().replace(/[''`\s\-]/g, '');
      const hostNorm = normalize(host.name);
      found = accommHosts.find(c => normalize(c.name || '') === hostNorm);
      if (found) matchedBy = 'fuzzy-name';
    }

    if (found) {
      // Check if this Xero contact was already matched (in this run or in the DB)
      const alreadyUsed = matched.find(m => m.xeroId === found.contactID);
      const existsInDb = await prisma.accommodationProvider.findFirst({ where: { xeroContactId: found.contactID } });
      if (alreadyUsed || existsInDb) {
        console.log(`  SKIP: ${host.name} — Xero contact "${found.name}" already matched to ${alreadyUsed?.sisName || existsInDb?.name || 'another host'}`);
        notFoundXero.push(`${host.name} (duplicate match with ${alreadyUsed.sisName})`);
      } else {
        await prisma.accommodationProvider.update({
          where: { id: host.id },
          data: { xeroContactId: found.contactID },
        });
        matched.push({ sisId: host.id, sisName: host.name, xeroId: found.contactID, xeroName: found.name, matchedBy });
      }
    } else {
      notFoundXero.push(host.name);
    }
  }

  // Find Xero contacts NOT in SIS
  const sisXeroIds = new Set(matched.map(m => m.xeroId));
  const sisNames = new Set(sisHosts.map(h => h.name.toLowerCase()));
  const notFoundSIS = accommHosts.filter(c => {
    if (sisXeroIds.has(c.contactID)) return false;
    if (sisNames.has((c.name || '').toLowerCase())) return false;
    return true;
  });

  // Output results
  console.log(`\n=== RESULTS ===`);
  console.log(`Already linked: ${alreadyLinked}`);
  console.log(`Matched: ${matched.length}`);
  console.log(`SIS hosts not found in Xero: ${notFoundXero.length}`);
  console.log(`Xero hosts not found in SIS: ${notFoundSIS.length}`);

  // Write reports
  const docsDir = path.join(__dirname, '..', '..', '.claude', 'docs', 'accomm');

  if (notFoundXero.length) {
    const content = `# Hosts in SIS but NOT found in Xero\n\nGenerated: ${new Date().toISOString()}\n\n${notFoundXero.map(n => '- ' + n).join('\n')}\n`;
    fs.writeFileSync(path.join(docsDir, 'NotFoundXero.md'), content);
    console.log(`\nWritten: NotFoundXero.md`);
  }

  if (notFoundSIS.length) {
    const content = `# Hosts in Xero "Accomm Hosts" but NOT found in SIS\n\nGenerated: ${new Date().toISOString()}\nTotal: ${notFoundSIS.length}\n\n${notFoundSIS.map(c => '- ' + c.name + (c.emailAddress ? ' (' + c.emailAddress + ')' : '')).join('\n')}\n`;
    fs.writeFileSync(path.join(docsDir, 'NotFoundSIS.md'), content);
    console.log(`Written: NotFoundSIS.md`);
  }

  if (matched.length) {
    console.log('\nMatched:');
    for (const m of matched) {
      console.log(`  ${m.sisName} → ${m.xeroName} [${m.matchedBy}]`);
    }
  }

  await prisma.$disconnect();
  await pool.end();
}

main().catch(e => { console.error(e); process.exit(1); });
