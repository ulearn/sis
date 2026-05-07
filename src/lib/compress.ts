// Reusable compression utility for files about to land in SIS storage.
// Shells out to system tools that are already installed:
//   - ghostscript (`gs`) for PDFs
//   - imagemagick (`convert`) for raster images
//
// Policy: passport/visa/MRZ legibility is non-negotiable. We default to
// /printer (300 dpi) for PDFs — slightly larger files than /ebook (150 dpi)
// but no fuzziness on stamps, fine print, MRZ rows, or signature loops.
// Images default to 2200 px long edge at JPEG q=92 — still ~75% smaller
// than a typical 4000×3000 phone shot but text on a passport bio page
// stays sharp at any reasonable zoom level.
//
//   PDF default   → /printer  (300 dpi · ~40-60% reduction · zero perceptible loss)
//   Image default → 2200px / q92 / EXIF stripped  (~70-85% reduction · sharp text)
//
// Pass `{ pdfQuality: 'ebook' }` etc. to opt into smaller-but-softer for
// non-document content (e.g. activity photos where 150 dpi is plenty).
// All callers should go through `compress()` or `compressInPlace()` so the
// policy lives in one place.

import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import fs from 'node:fs/promises';
import path from 'node:path';

const exec = promisify(execFile);

export type PdfQuality = 'screen' | 'ebook' | 'printer' | 'prepress';
export interface CompressOpts {
  pdfQuality?: PdfQuality;   // default 'printer' — 300 dpi, document-safe
  imageMaxDim?: number;      // long-edge cap, default 2200
  imageQuality?: number;     // JPEG quality 1-100, default 92
}

const IMAGE_EXTS = new Set(['jpg', 'jpeg', 'png', 'webp', 'tif', 'tiff', 'bmp', 'gif', 'heic', 'heif']);

export async function compressPdf(input: string, output: string, opts: { quality?: PdfQuality } = {}): Promise<void> {
  const quality = opts.quality ?? 'printer';
  await exec('gs', [
    '-sDEVICE=pdfwrite',
    '-dCompatibilityLevel=1.4',
    `-dPDFSETTINGS=/${quality}`,
    '-dNOPAUSE', '-dQUIET', '-dBATCH',
    '-dDetectDuplicateImages=true',
    '-dCompressFonts=true',
    '-dSubsetFonts=true',
    `-sOutputFile=${output}`,
    input,
  ]);
}

export async function compressImage(input: string, output: string, opts: { maxDim?: number; quality?: number } = {}): Promise<void> {
  const maxDim = opts.maxDim ?? 2200;
  const quality = opts.quality ?? 92;
  await exec('convert', [
    input,
    '-auto-orient',                       // bake in EXIF rotation
    '-strip',                             // drop metadata
    '-interlace', 'Plane',                // progressive
    '-resize', `${maxDim}x${maxDim}>`,    // shrink if larger; never enlarge
    '-quality', String(quality),
    output,
  ]);
}

// Auto-dispatch by extension; copies through unchanged for unknown types.
export async function compress(input: string, output: string, opts: CompressOpts = {}): Promise<void> {
  const ext = path.extname(input).slice(1).toLowerCase();
  if (ext === 'pdf') {
    await compressPdf(input, output, { quality: opts.pdfQuality });
    return;
  }
  if (IMAGE_EXTS.has(ext)) {
    await compressImage(input, output, { maxDim: opts.imageMaxDim, quality: opts.imageQuality });
    return;
  }
  await fs.copyFile(input, output);
}

export interface CompressResult {
  before: number;
  after: number;
  savedBytes: number;
  savedPct: number;   // 0..1
  kept: 'compressed' | 'original';
}

// Compress in place. If the compressed copy ends up bigger than the original
// (rare — happens on already-optimised inputs), the original is kept and the
// scratch file is deleted.
export async function compressInPlace(p: string, opts: CompressOpts = {}): Promise<CompressResult> {
  const before = (await fs.stat(p)).size;
  const tmp = `${p}.compress.tmp`;
  try {
    await compress(p, tmp, opts);
  } catch (e) {
    try { await fs.unlink(tmp); } catch {}
    throw e;
  }
  const after = (await fs.stat(tmp)).size;
  if (after > 0 && after < before) {
    await fs.rename(tmp, p);
    return { before, after, savedBytes: before - after, savedPct: (before - after) / before, kept: 'compressed' };
  }
  try { await fs.unlink(tmp); } catch {}
  return { before, after: before, savedBytes: 0, savedPct: 0, kept: 'original' };
}

// Express middleware. Runs after multer; compresses every file already on
// disk and updates the multer file object's `size` so any subsequent code
// (DB inserts, response payloads) reads the post-compression byte count.
// Failures are logged but don't fail the request — the upload still
// succeeds, the file just stays at its original size.
export function compressUploads(opts: CompressOpts = {}) {
  return async function (req: any, _res: any, next: any) {
    try {
      const all: any[] = [];
      if (req.file) all.push(req.file);
      if (Array.isArray(req.files)) all.push(...req.files);
      else if (req.files && typeof req.files === 'object') {
        for (const k of Object.keys(req.files)) {
          const v = req.files[k];
          if (Array.isArray(v)) all.push(...v); else if (v) all.push(v);
        }
      }
      for (const f of all) {
        if (!f?.path) continue;
        try {
          const r = await compressInPlace(f.path, opts);
          f.size = r.after;
        } catch (e) {
          console.error(`[compressUploads] ${f.path}: ${(e as any).message}`);
        }
      }
    } catch (e) {
      console.error('[compressUploads] unexpected:', (e as any).message);
    }
    next();
  };
}
