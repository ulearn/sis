// CLI for the compression utility — walks a directory and compresses every
// PDF / image in place. Used to normalise files before they land in SIS
// storage (e.g. the Fidelo upload-harvest dump on hub).
//
// Usage:
//   npx tsx src/scripts/compress-files.ts <dir>             (in-place, --apply)
//   npx tsx src/scripts/compress-files.ts <dir> --dry-run   (size-only report)
//   --pdf-quality=screen|ebook|printer|prepress  (default printer — document-safe)
//   --image-max=2200   --image-quality=92        (defaults — sharp passports)
import dotenv from 'dotenv'; dotenv.config();
import fs from 'node:fs/promises';
import path from 'node:path';
import { compress, compressInPlace, type PdfQuality } from '../lib/compress';

// argv[0]=node, argv[1]=script — slice those off before scanning user args.
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const target = args.find(a => !a.startsWith('-')) || '';
const pdfQuality = (args.find(a => a.startsWith('--pdf-quality='))?.split('=')[1] as PdfQuality) || 'printer';
const imageMaxDim = parseInt(args.find(a => a.startsWith('--image-max='))?.split('=')[1] || '2200', 10);
const imageQuality = parseInt(args.find(a => a.startsWith('--image-quality='))?.split('=')[1] || '92', 10);

if (!target) {
  console.error('Usage: tsx compress-files.ts <dir> [--dry-run] [--pdf-quality=ebook] [--image-max=1600] [--image-quality=85]');
  process.exit(1);
}

const COMPRESSIBLE = new Set(['.pdf', '.jpg', '.jpeg', '.png', '.webp', '.tif', '.tiff', '.bmp', '.gif', '.heic', '.heif']);

async function* walk(dir: string): AsyncGenerator<string> {
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else if (entry.isFile()) yield full;
  }
}

function fmt(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}K`;
  return `${(bytes / 1024 / 1024).toFixed(2)}M`;
}

async function main() {
  const stat = await fs.stat(target);
  if (!stat.isDirectory()) { console.error(`${target} is not a directory`); process.exit(1); }
  console.log(`Compress ${dryRun ? '[DRY-RUN]' : '[APPLY]'}  pdf=/${pdfQuality}  imageMax=${imageMaxDim}px  imageQuality=${imageQuality}\n`);

  let total = { count: 0, before: 0, after: 0 };
  for await (const file of walk(target)) {
    const ext = path.extname(file).toLowerCase();
    if (!COMPRESSIBLE.has(ext)) continue;
    try {
      if (dryRun) {
        const before = (await fs.stat(file)).size;
        const tmp = `${file}.dryrun.tmp`;
        await compress(file, tmp, { pdfQuality, imageMaxDim, imageQuality });
        const after = (await fs.stat(tmp)).size;
        await fs.unlink(tmp);
        total.count++; total.before += before; total.after += Math.min(after, before);
        console.log(`  ${file.replace(target, '')}  ${fmt(before)} → ${fmt(after)}  (${after < before ? '-' + ((1 - after / before) * 100).toFixed(0) + '%' : 'no change'})`);
      } else {
        const r = await compressInPlace(file, { pdfQuality, imageMaxDim, imageQuality });
        total.count++; total.before += r.before; total.after += r.after;
        console.log(`  ${file.replace(target, '')}  ${fmt(r.before)} → ${fmt(r.after)}  ${r.kept === 'compressed' ? '(-' + (r.savedPct * 100).toFixed(0) + '%)' : '(kept original)'}`);
      }
    } catch (e) {
      console.error(`  ${file.replace(target, '')}  ERROR: ${(e as any).message}`);
    }
  }

  console.log(`\n${total.count} files · ${fmt(total.before)} → ${fmt(total.after)}  (${total.after < total.before ? '-' + ((1 - total.after / total.before) * 100).toFixed(1) + '%' : 'no change'})`);
}

main().catch(e => { console.error(e); process.exit(1); });
