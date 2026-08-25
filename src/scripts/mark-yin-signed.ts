/**
 * One-off: mark Yin Zheng (Agency #608) as having signed the partner
 * agreement, using an externally-signed PDF (PDF emailed back from him
 * because the inline iframe didn't render in his Chinese browser).
 *
 * Usage:
 *   node dist/scripts/mark-yin-signed.js /path/to/yin-signed.pdf
 *
 * Copies the PDF into sis/data/contracts/signed/ for permanence, then
 * writes an agency_signatures row with mode='external-pdf' and flips
 * Agency.contractSignedAt. Idempotent: refuses if Agency 608 already
 * has contractSignedAt set.
 */
import dotenv from 'dotenv';
dotenv.config();
import fs from 'fs';
import path from 'path';

const AGENCY_ID = 608;
const SIGNER_NAME = 'Yin Zheng';
const SIGNER_EMAIL = 'ynkmww3@126.com';
const SIGNER_TITLE = 'Director of Overseas Business';
const CONTRACT_VERSION = '2026-05-v1-zero';

async function main() {
  const srcPath = process.argv[2];
  if (!srcPath) {
    console.error('Usage: mark-yin-signed.js <path-to-signed-pdf>');
    process.exit(2);
  }
  if (!fs.existsSync(srcPath)) {
    console.error(`Source PDF not found: ${srcPath}`);
    process.exit(2);
  }

  const { Pool } = await import('pg');
  const { PrismaPg } = await import('@prisma/adapter-pg');
  const { PrismaClient } = await import('../generated/prisma/client');
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool as any) } as any);

  try {
    const agency = await prisma.agency.findUnique({ where: { id: AGENCY_ID }, select: { contractSignedAt: true, name: true } });
    if (!agency) { console.error(`Agency #${AGENCY_ID} not found`); process.exit(2); }
    if (agency.contractSignedAt) {
      console.error(`Agency #${AGENCY_ID} (${agency.name}) already signed at ${agency.contractSignedAt.toISOString()} — refusing to overwrite`);
      process.exit(2);
    }

    // Copy the PDF into the signed dir so we own the file.
    const signedAt = new Date();
    const signedDir = path.join(__dirname, '..', '..', 'data', 'contracts', 'signed');
    if (!fs.existsSync(signedDir)) fs.mkdirSync(signedDir, { recursive: true });
    const ts = signedAt.toISOString().replace(/[:.]/g, '-');
    const destPath = path.join(signedDir, `agency-${AGENCY_ID}-${ts}-external.pdf`);
    fs.copyFileSync(srcPath, destPath);

    // Find Neil's SisUser to record as the operator who recorded the signature.
    const operator = await prisma.sisUser.findUnique({ where: { username: 'neil' }, select: { id: true } });

    const sig = await prisma.agencySignature.create({
      data: {
        agencyId: AGENCY_ID,
        signedByUserId: operator?.id ?? null,
        signerName: SIGNER_NAME,
        signerTitle: SIGNER_TITLE,
        signerEmail: SIGNER_EMAIL,
        mode: 'external-pdf',
        signatureFont: null,
        signatureSvg: null,
        signaturePngB64: null,
        contractVersion: CONTRACT_VERSION,
        ipAddress: null,
        userAgent: 'external-email-exchange',
        pdfPath: destPath,
        signedAt,
      },
    });
    await prisma.agency.update({
      where: { id: AGENCY_ID },
      data: { contractSignedAt: signedAt, contractSignedById: operator?.id ?? null },
    });

    console.log(`[mark-yin-signed] Recorded signature #${sig.id}`);
    console.log(`[mark-yin-signed] PDF stored at ${destPath}`);
    console.log(`[mark-yin-signed] Agency #${AGENCY_ID} contractSignedAt = ${signedAt.toISOString()}`);
    console.log(`[mark-yin-signed] Yin can now access the partner portal.`);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}
main().catch(e => { console.error(e); process.exit(1); });
