/**
 * Pull plain text out of an uploaded group list in whatever format the partner
 * sent — CSV/TXT, PDF, Word (.docx), Excel (.xlsx) — using only tools already on
 * the box (no new npm deps): `pdftotext` (poppler) and `unzip`. The output is
 * fed to the AI reader (parseGroupList), which is tolerant of rough text, so the
 * extraction only needs to surface the names/dates/levels — not be pixel-perfect.
 */
import { execFile } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import os from 'os';
import path from 'path';
import crypto from 'crypto';

const execFileP = promisify(execFile);

function decodeEntities(s: string): string {
  return s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_m, n) => String.fromCodePoint(Number(n)));
}

function tmpWrite(buf: Buffer, ext: string): string {
  const p = path.join(os.tmpdir(), `grp-upload-${crypto.randomBytes(6).toString('hex')}.${ext}`);
  fs.writeFileSync(p, buf);
  return p;
}

// .docx → text: word/document.xml, paragraphs (</w:p>) become newlines, tabs kept.
function docxXmlToText(xml: string): string {
  return decodeEntities(
    xml.replace(/<w:tab\b[^>]*\/?>/g, '\t')
       .replace(/<\/w:p>/g, '\n')
       .replace(/<[^>]+>/g, ''),
  ).replace(/\n{3,}/g, '\n\n').trim();
}

// .xlsx → tab-separated rows. Resolves shared strings; converts plausible Excel
// date serials (≈1968–2064) to ISO so DOBs survive. First worksheet only.
async function xlsxToText(tmp: string): Promise<string> {
  let shared: string[] = [];
  try {
    const { stdout } = await execFileP('unzip', ['-p', tmp, 'xl/sharedStrings.xml'], { maxBuffer: 16 * 1024 * 1024, encoding: 'utf8' });
    shared = [...String(stdout).matchAll(/<si>([\s\S]*?)<\/si>/g)].map(m =>
      [...m[1].matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)].map(t => decodeEntities(t[1])).join(''));
  } catch { /* no shared strings */ }

  let sheet = '';
  for (const member of ['xl/worksheets/sheet1.xml', 'xl/worksheets/sheet01.xml']) {
    try { sheet = String((await execFileP('unzip', ['-p', tmp, member], { maxBuffer: 16 * 1024 * 1024, encoding: 'utf8' })).stdout); break; } catch { /* try next */ }
  }
  const rows = [...sheet.matchAll(/<row\b[^>]*>([\s\S]*?)<\/row>/g)].map(r => {
    const cells = [...r[1].matchAll(/<c\b([^>]*)>([\s\S]*?)<\/c>/g)].map(c => {
      const attrs = c[1], inner = c[2];
      const type = (attrs.match(/\st="([^"]*)"/) || [])[1];
      const vm = inner.match(/<v>([\s\S]*?)<\/v>/);
      const isTxt = inner.match(/<t[^>]*>([\s\S]*?)<\/t>/);
      if (type === 's' && vm) return shared[parseInt(vm[1], 10)] ?? '';
      if (type === 'inlineStr' && isTxt) return decodeEntities(isTxt[1]);
      if (type === 'str' && vm) return decodeEntities(vm[1]);
      if (vm) {
        const n = Number(vm[1]);
        if (Number.isFinite(n) && n >= 25000 && n <= 60000 && Number.isInteger(n)) {
          return new Date(Date.UTC(1899, 11, 30) + n * 86400000).toISOString().slice(0, 10);
        }
        return vm[1];
      }
      return '';
    });
    return cells.join('\t').replace(/\t+$/, '');
  });
  return rows.filter(r => r.trim()).join('\n');
}

/** Extract text from an uploaded file. Falls back to a raw utf8 read. */
export async function extractUploadText(buf: Buffer, filename: string): Promise<string> {
  const ext = (filename.split('.').pop() || '').toLowerCase();
  if (ext === 'csv' || ext === 'txt' || ext === 'tsv') return buf.toString('utf8');
  const tmp = tmpWrite(buf, ext || 'bin');
  try {
    if (ext === 'pdf') {
      const { stdout } = await execFileP('pdftotext', ['-layout', tmp, '-'], { maxBuffer: 16 * 1024 * 1024, encoding: 'utf8' });
      return String(stdout);
    }
    if (ext === 'docx') {
      const { stdout } = await execFileP('unzip', ['-p', tmp, 'word/document.xml'], { maxBuffer: 16 * 1024 * 1024, encoding: 'utf8' });
      return docxXmlToText(String(stdout));
    }
    if (ext === 'xlsx') return await xlsxToText(tmp);
    return buf.toString('utf8');   // .doc / .xls / unknown — best-effort
  } finally {
    try { fs.unlinkSync(tmp); } catch { /* ignore */ }
  }
}
