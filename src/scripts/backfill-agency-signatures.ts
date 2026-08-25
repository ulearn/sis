/**
 * Backfill agency_signatures + Agency.contractSignedAt from existing
 * partner_documents (Zoho-imported) data.
 *
 * For each Agency:
 *   - If it has any partner_documents row with request_status='completed'
 *     → import the newest as a legacy AgencySignature
 *       (contract_version='legacy-zoho-import', pdf_path=existing cached PDF,
 *        signed_at=that signedAt, mode='legacy-zoho')
 *   - Else if the agency has at least one SisUser with userType='partner'
 *     → grandfather (contract_version='grandfathered-2026-05', mode='grandfathered',
 *        pdf_path=null, signed_at=now)
 *   - Else: skip (no portal access, no contract obligation)
 *
 * Idempotent: skips agencies that already have contractSignedAt set.
 *
 * Run:
 *   node dist/scripts/backfill-agency-signatures.js              # apply
 *   node dist/scripts/backfill-agency-signatures.js --dry-run    # report only
 */
import dotenv from 'dotenv';
dotenv.config();

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  const { Pool } = await import('pg');
  const { PrismaPg } = await import('@prisma/adapter-pg');
  const { PrismaClient } = await import('../generated/prisma/client');
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool as any);
  const prisma = new PrismaClient({ adapter } as any);

  let importedFromZoho = 0;
  let grandfathered = 0;
  let alreadySigned = 0;
  let skippedNoPortalUser = 0;

  try {
    const agencies = await prisma.agency.findMany({
      select: {
        id: true,
        name: true,
        contractSignedAt: true,
        _count: { select: { portalUsers: true } },
        documents: {
          where: { requestStatus: 'completed', signedAt: { not: null } },
          orderBy: { signedAt: 'desc' },
          take: 1,
          select: { signedAt: true, signerName: true, signerEmail: true, pdfCachedPath: true },
        },
      },
    });

    console.log(`[backfill] Considering ${agencies.length} agencies (dryRun=${dryRun})`);

    for (const a of agencies) {
      if (a.contractSignedAt) { alreadySigned++; continue; }

      const zohoDoc = a.documents[0];
      if (zohoDoc) {
        if (!dryRun) {
          await prisma.$transaction([
            prisma.agencySignature.create({
              data: {
                agencyId: a.id,
                signedByUserId: null,
                signerName: zohoDoc.signerName || '(unknown — imported from Zoho)',
                signerTitle: null,
                signerEmail: zohoDoc.signerEmail,
                mode: 'legacy-zoho',
                signatureFont: null,
                signatureSvg: null,
                signaturePngB64: null,
                contractVersion: 'legacy-zoho-import',
                ipAddress: null,
                userAgent: null,
                pdfPath: zohoDoc.pdfCachedPath,
                signedAt: zohoDoc.signedAt!,
              },
            }),
            prisma.agency.update({
              where: { id: a.id },
              data: { contractSignedAt: zohoDoc.signedAt! },
            }),
          ]);
        }
        importedFromZoho++;
        console.log(`[backfill]   #${a.id} ${a.name} → legacy-zoho (${zohoDoc.signedAt!.toISOString().slice(0,10)})`);
        continue;
      }

      if (a._count.portalUsers === 0) {
        skippedNoPortalUser++;
        continue;
      }

      // Grandfather: portal access but no Zoho contract on file.
      const now = new Date();
      if (!dryRun) {
        await prisma.$transaction([
          prisma.agencySignature.create({
            data: {
              agencyId: a.id,
              signedByUserId: null,
              signerName: '(grandfathered — existing partner at 2026-05 cutover)',
              signerTitle: null,
              signerEmail: null,
              mode: 'grandfathered',
              signatureFont: null,
              signatureSvg: null,
              signaturePngB64: null,
              contractVersion: 'grandfathered-2026-05',
              ipAddress: null,
              userAgent: null,
              pdfPath: null,
              signedAt: now,
            },
          }),
          prisma.agency.update({
            where: { id: a.id },
            data: { contractSignedAt: now },
          }),
        ]);
      }
      grandfathered++;
      console.log(`[backfill]   #${a.id} ${a.name} → grandfathered`);
    }

    console.log(`[backfill] Done. imported=${importedFromZoho} grandfathered=${grandfathered} alreadySigned=${alreadySigned} skipped=${skippedNoPortalUser}`);
    if (dryRun) console.log('[backfill] DRY RUN — no changes written.');
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch((e) => {
  console.error('[backfill] Fatal:', e);
  process.exit(1);
});
