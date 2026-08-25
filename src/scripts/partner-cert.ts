/**
 * Partner Certificate generation.
 *
 * Stamps an agency's name + certificate date onto the dateless master
 * Certificate of Partnership template (which already has Neil's signature).
 * The result is cached to disk per agency.
 *
 * Cert date logic: max(CERT_REFRESH_DATE, latest partnership signing).
 *   - Existing partners → CERT_REFRESH_DATE wins → shows the annual refresh date
 *   - New partners who sign mid-year → their Zoho signing date wins
 *   - At next annual refresh, bump CERT_REFRESH_DATE and clear the cache
 *
 * Cache invalidates when Agency.updatedAt OR latest PartnerDocument.signedAt
 * is newer than the cached file's mtime.
 */
import { PrismaClient } from '../generated/prisma/client';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import fs from 'fs';
import path from 'path';

const TEMPLATE_PATH = path.join(
  __dirname,
  '..', '..', '.claude', 'docs', 'agencies',
  'PARTNER CERTIFICATE TEMPLATE-Dateless.pdf',
);
const CACHE_DIR = path.join(__dirname, '..', '..', 'storage', 'partner-certs');

// Annual refresh date — auto-rolls to 1 Jan of the current calendar year.
// Cache invalidates whenever this value moves past a cached file's mtime,
// so the first view in a new year regenerates the cert with the new date.
function currentRefreshDate(): Date {
  return new Date(Date.UTC(new Date().getUTCFullYear(), 0, 1));
}

// Partner name: lands on the underline between "This is to certify that" and
// "is a recognised partner of". Auto-shrinks if too wide.
const NAME_Y = 425;
const NAME_MAX_FONT_SIZE = 24;
const NAME_MIN_FONT_SIZE = 14;
const NAME_MAX_WIDTH = 480;

// Refresh date: left-aligned to the "C" of "Certificate Refresh Date" below.
const DATE_X = 320;
const DATE_Y = 215;
const DATE_FONT_SIZE = 12;

export async function generatePartnerCertificate(
  prisma: PrismaClient,
  agencyId: number,
): Promise<{ path: string; filename: string } | null> {
  const agency = await prisma.agency.findUnique({
    where: { id: agencyId },
    select: {
      id: true,
      name: true,
      updatedAt: true,
      documents: {
        where: {
          requestStatus: 'completed',
          requestName: { contains: 'Partner', mode: 'insensitive' },
          signedAt: { not: null },
        },
        orderBy: { signedAt: 'desc' },
        take: 1,
        select: { signedAt: true },
      },
    },
  });
  if (!agency || !agency.name) return null;

  const latestSigning = agency.documents[0]?.signedAt ?? null;
  const refreshDate = currentRefreshDate();
  const certDate = latestSigning && latestSigning > refreshDate
    ? latestSigning
    : refreshDate;

  if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });
  const outPath = path.join(CACHE_DIR, `agency-${agency.id}.pdf`);

  if (fs.existsSync(outPath)) {
    const mtime = fs.statSync(outPath).mtime;
    const newestSource = Math.max(
      agency.updatedAt.getTime(),
      latestSigning?.getTime() ?? 0,
      refreshDate.getTime(),
    );
    if (mtime.getTime() >= newestSource) {
      return { path: outPath, filename: filenameFor(agency.name) };
    }
  }

  const templateBytes = fs.readFileSync(TEMPLATE_PATH);
  const pdfDoc = await PDFDocument.load(templateBytes);
  const page = pdfDoc.getPages()[0];
  const { width: pageWidth } = page.getSize();

  const bold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
  const regular = await pdfDoc.embedFont(StandardFonts.TimesRoman);

  // ── Partner name (centered, auto-shrink) ──────────
  let nameSize = NAME_MAX_FONT_SIZE;
  let nameWidth = bold.widthOfTextAtSize(agency.name, nameSize);
  while (nameWidth > NAME_MAX_WIDTH && nameSize > NAME_MIN_FONT_SIZE) {
    nameSize -= 1;
    nameWidth = bold.widthOfTextAtSize(agency.name, nameSize);
  }
  page.drawText(agency.name, {
    x: (pageWidth - nameWidth) / 2,
    y: NAME_Y,
    size: nameSize,
    font: bold,
    color: rgb(0, 0, 0),
  });

  // ── Certificate Refresh Date (DD/MM/YYYY, left-aligned over right underline) ──
  page.drawText(formatDDMMYYYY(certDate), {
    x: DATE_X,
    y: DATE_Y,
    size: DATE_FONT_SIZE,
    font: regular,
    color: rgb(0, 0, 0),
  });

  const outBytes = await pdfDoc.save();
  fs.writeFileSync(outPath, outBytes);

  return { path: outPath, filename: filenameFor(agency.name) };
}

function filenameFor(name: string): string {
  const safe = name.replace(/[^a-z0-9_.-]/gi, '_').slice(0, 60);
  return `ULearn-Partnership-Certificate-${safe}.pdf`;
}

function formatDDMMYYYY(d: Date): string {
  const dd = String(d.getUTCDate()).padStart(2, '0');
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  const yyyy = d.getUTCFullYear();
  return `${dd}/${mm}/${yyyy}`;
}
