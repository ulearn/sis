/**
 * One-off PDF surgery: white out + reprint corrected text for known
 * typos in the zero-commission template. Source PDF can't be re-exported
 * cleanly from text — easier to overprint than to rebuild.
 *
 * Run:  node dist/scripts/fix-template-typos.js
 */
import fs from 'fs';
import path from 'path';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

const TEMPLATE_DIR = path.join(__dirname, '..', '..', 'data', 'contracts', 'template');
const TEMPLATE_PATH = path.join(TEMPLATE_DIR, 'partner-agreement-2026-05-v1-zero.pdf');

interface Fix {
  page: number;          // 0-indexed
  // pdftotext top-down bbox of the typo word
  xMin: number; yMin: number; xMax: number; yMax: number;
  replacement: string;
  fontSize: number;
}

const PAGE_HEIGHT = 792;

const FIXES: Fix[] = [
  // "docuemnt" → "document" on page 1 of the zero-commission template
  { page: 0, xMin: 155.85, yMin: 557.55, xMax: 199.24, yMax: 572.37, replacement: 'document', fontSize: 12 },
];

async function main() {
  const bytes = fs.readFileSync(TEMPLATE_PATH);
  const doc = await PDFDocument.load(bytes);
  const times = await doc.embedFont(StandardFonts.TimesRoman);

  for (const fix of FIXES) {
    const page = doc.getPages()[fix.page];
    // Convert top-down → bottom-up
    const rectBottom = PAGE_HEIGHT - fix.yMax;
    const rectHeight = fix.yMax - fix.yMin;
    const rectWidth  = fix.xMax - fix.xMin;
    // White-out rectangle (slightly padded so we don't leave anti-aliased crumbs)
    page.drawRectangle({
      x: fix.xMin - 1,
      y: rectBottom - 1,
      width: rectWidth + 2,
      height: rectHeight + 2,
      color: rgb(1, 1, 1),
      borderWidth: 0,
    });
    // Reprint corrected text at the same baseline. The baseline in pdf-lib
    // sits at the lower edge of cap-height letters; we lift a touch from
    // rectBottom to land it visually on the original baseline.
    page.drawText(fix.replacement, {
      x: fix.xMin,
      y: rectBottom + 2,
      size: fix.fontSize,
      font: times,
      color: rgb(0, 0, 0),
    });
    console.log(`[fix] page=${fix.page + 1} "${fix.replacement}" written at x=${fix.xMin} y=${rectBottom + 2}`);
  }

  const outBytes = await doc.save();
  // Back up the original once
  const backup = TEMPLATE_PATH + '.pre-typo-fix.bak';
  if (!fs.existsSync(backup)) fs.copyFileSync(TEMPLATE_PATH, backup);
  fs.writeFileSync(TEMPLATE_PATH, outBytes);
  console.log(`[fix] Saved corrected template to ${TEMPLATE_PATH} (backup at ${backup})`);
}

main().catch(e => { console.error(e); process.exit(1); });
