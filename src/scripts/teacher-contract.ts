/**
 * Teacher Employment Contract — internal rendering + signing.
 *
 * Replaces Zoho Sign for teacher contracts. Loads the static ULE002 contract
 * (pages 1–7 = verbatim legal boilerplate, left untouched), white-outs the
 * Zoho merge tokens («Employee.X», «Image», «Hiring Manager…», the baked
 * dates) on the signature + Appendix pages, and stamps the real values pulled
 * from the Teacher row (which the "+ Zoho Teacher" import filled from Zoho
 * People). The ULearn side is Paul Gill (Director of Studies) — his signature
 * image is stamped in, not baked into the template. The teacher's own
 * signature (typed/drawn PNG) is embedded at sign time.
 *
 * Field positions derived from `pdftotext -bbox` of the template; US Letter
 * (612×792 pts). pdf-lib origin is bottom-left, so y = 792 − (top-down yMax).
 */
import { PrismaClient } from '../generated/prisma/client';
import { PDFDocument, PDFFont, PDFName, PDFPage, StandardFonts, rgb } from 'pdf-lib';
import fs from 'fs';
import path from 'path';

export const CONTRACT_VERSION = '2026-07-v1';
const TEMPLATE_DIR  = path.join(__dirname, '..', '..', 'data', 'contracts', 'template');
const TEMPLATE_PATH = path.join(TEMPLATE_DIR, `teacher-contract-${CONTRACT_VERSION}.pdf`);
const PAUL_SIG_PATH = path.join(TEMPLATE_DIR, 'paul-gill-signature.jpg');
const SIGNED_DIR    = path.join(__dirname, '..', '..', 'data', 'contracts', 'signed');

const H = 792;

// A stamped text field: `page` index, `yMax` = pdftotext baseline (top-down),
// `x` = where the value starts, `woX`/`woW` = white-out rectangle (covers the
// merge token underneath). `size`/`maxWidth` control the drawn text.
interface TextField { page: number; yMax: number; x: number; woX: number; woW: number; size: number; maxWidth: number; }
const T = (page: number, yMax: number, x: number, woX: number, woW: number, size = 10, maxWidth = 300): TextField =>
  ({ page, yMax, x, woX, woW, size, maxWidth });

const FIELDS: Record<string, TextField> = {
  // Appendix (page index 8)
  employeeName:     T(8, 155, 232, 226, 284),
  employeeAddress:  T(8, 180, 216, 213, 297),
  commencementDate: T(8, 234, 266, 262, 248),
  title:            T(8, 289, 266, 262, 248),
  manager:          T(8, 312, 269, 264, 246),
  status:           T(8, 538, 266, 262, 248),
  standardHours:    T(8, 596, 266, 262, 248),
  salary:           T(8, 666, 266, 262, 248),
  // Issue date (page index 9)
  issueDate:        T(9, 604, 205, 201, 64),
  // ULearn signatory side (page index 7) — fixed to Paul Gill
  uPrintName:       T(7, 543, 150, 188, 140),
  uTitle:           T(7, 565, 127, 123, 224),
  uDate:            T(7, 601, 127, 124, 138),
  // Employee acknowledgement side (page index 7)
  empName:          T(7, 715, 131, 128, 185),
  empDate:          T(7, 742, 366, 364, 110),
};

// Signature images (page index 7). x/y are pdf-lib bottom-left; width/height in pt.
const PAUL_SIG = { page: 7, x: 145, y: 275, width: 150, height: 56, woX: 138, woY: 268, woW: 190, woH: 66 };
const EMP_SIG  = { page: 7, x: 200, y: 51,  width: 108, height: 20 };

function drawFitted(page: PDFPage, font: PDFFont, text: string, x: number, y: number, maxWidth: number, size: number) {
  let s = size;
  while (s > 6 && font.widthOfTextAtSize(text, s) > maxWidth) s -= 1;
  let display = text;
  if (font.widthOfTextAtSize(display, s) > maxWidth) {
    while (display.length > 1 && font.widthOfTextAtSize(display + '…', s) > maxWidth) display = display.slice(0, -1);
    display += '…';
  }
  page.drawText(display, { x, y, size: s, font, color: rgb(0, 0, 0) });
}

// White-out the merge token, then stamp the value on its baseline.
function put(pages: PDFPage[], font: PDFFont, f: TextField, value: string | null | undefined) {
  const page = pages[f.page];
  const ty = H - f.yMax + 1;
  page.drawRectangle({ x: f.woX, y: ty - 3, width: f.woW, height: 15, color: rgb(1, 1, 1) });
  if (value) drawFitted(page, font, value, f.x, ty, f.maxWidth, f.size);
}

// Zoho stores employment status as terse codes ("PT - Temp", "FT - Perm").
// Expand to the readable phrasing the contract's "Status" line expects. Any
// value already in long form (or a custom one) passes straight through.
export function expandContractType(v: string | null | undefined): string {
  if (!v) return '';
  const m = String(v).trim().match(/^(FT|PT)\s*-\s*(Temp|Perm)/i);
  if (!m) return String(v).trim();
  const t = m[1].toUpperCase() === 'FT' ? 'Full Time' : 'Part Time';
  const d = m[2].toLowerCase().startsWith('perm') ? 'Permanent' : 'Temporary';
  return `${t} – ${d}`;
}

export function formatDDMonYYYY(d: Date): string {
  const dd = String(d.getUTCDate()).padStart(2, '0');
  const mon = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][d.getUTCMonth()];
  return `${dd} ${mon} ${d.getUTCFullYear()}`;
}

export interface TeacherContractData {
  teacherId: number;
  employeeName: string;
  address: string;
  commencementDate: string;
  title: string;
  manager: string;
  status: string;
  standardHours: string;
  salary: string;
  email: string | null;
}

export async function gatherTeacherContractData(prisma: PrismaClient, teacherId: number): Promise<TeacherContractData> {
  const t = await prisma.teacher.findUnique({ where: { id: teacherId } });
  if (!t) throw new Error(`Teacher ${teacherId} not found`);
  return {
    teacherId,
    employeeName: `${t.firstName} ${t.lastName}`.trim(),
    address: t.address || '',
    commencementDate: t.startDate ? formatDDMonYYYY(new Date(t.startDate)) : '',
    title: t.title || 'Teacher',
    manager: t.reportingTo || '',
    status: expandContractType(t.contractType),
    standardHours: t.standardHours || '',
    salary: t.hourlyRate != null ? `EUR ${Number(t.hourlyRate).toFixed(2)}` : '',
    email: t.email || null,
  };
}

/**
 * Render the contract with all auto-fill fields + Paul's countersignature
 * stamped (no employee signature yet). Used for the preview and as the base
 * for the signed copy.
 */
export async function renderTemplateFilled(data: TeacherContractData, issueDate: Date): Promise<{ pdfDoc: PDFDocument; pages: PDFPage[]; font: PDFFont }> {
  const pdfDoc = await PDFDocument.load(fs.readFileSync(TEMPLATE_PATH));
  const pages = pdfDoc.getPages();
  // Strip the vestigial Zoho Sign field widgets (Fullname/Signature/Signdate
  // on the sig page) — they render on top of the page content and mask our
  // stamps. Also drop the doc-level AcroForm that referenced them.
  for (const pg of pages) pg.node.delete(PDFName.of('Annots'));
  pdfDoc.catalog.delete(PDFName.of('AcroForm'));
  // White-out a stray "sick" text-box artifact baked into the template's
  // top-left corner (left of the logo).
  pages[0].drawRectangle({ x: 83, y: 709, width: 24, height: 15, color: rgb(1, 1, 1) });
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const today = formatDDMonYYYY(issueDate);

  // Appendix values
  put(pages, font, FIELDS.employeeName,     data.employeeName);
  put(pages, font, FIELDS.employeeAddress,  data.address);
  put(pages, font, FIELDS.commencementDate, data.commencementDate);
  put(pages, font, FIELDS.title,            data.title);
  put(pages, font, FIELDS.manager,          data.manager);
  put(pages, font, FIELDS.status,           data.status);
  // Relabel Appendix Part 5 "Status (Full time, Part Time, Fixed etc):" →
  // "Contract Type:". The original label wraps two lines (yMax 538 + 556); the
  // value now sits on the first line (FIELDS.status → yMax 538). Clear both
  // original label lines + the leftover token, then stamp the new label in the
  // template's muted-green label colour.
  {
    const p9 = pages[8];
    const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const green = rgb(0x5e / 255, 0x80 / 255, 0x6e / 255);
    p9.drawRectangle({ x: 84, y: H - 538 - 2, width: 178, height: 15, color: rgb(1, 1, 1) }); // "Status (Full lime, Part Time"
    p9.drawRectangle({ x: 84, y: H - 556 - 2, width: 306, height: 15, color: rgb(1, 1, 1) }); // "Fixed etc):" + «Contract Type» token (wraps to x386)
    p9.drawText('Contract Type:', { x: 86, y: H - 538 + 1, size: 10, font: bold, color: green });
  }
  put(pages, font, FIELDS.standardHours,    data.standardHours);
  put(pages, font, FIELDS.salary,           data.salary);
  put(pages, font, FIELDS.issueDate,        today);

  // ULearn side — Paul Gill, Director of Studies, today. White-out the merge
  // Hiring-Manager tokens then stamp the fixed values + Paul's signature image.
  put(pages, font, FIELDS.uPrintName, 'Paul Gill');
  put(pages, font, FIELDS.uTitle,     'Director of Studies');
  put(pages, font, FIELDS.uDate,      today);
  const paulSig = await pdfDoc.embedJpg(fs.readFileSync(PAUL_SIG_PATH));
  const pg = pages[PAUL_SIG.page];
  pg.drawRectangle({ x: PAUL_SIG.woX, y: PAUL_SIG.woY, width: PAUL_SIG.woW, height: PAUL_SIG.woH, color: rgb(1, 1, 1) });
  pg.drawImage(paulSig, { x: PAUL_SIG.x, y: PAUL_SIG.y, width: PAUL_SIG.width, height: PAUL_SIG.height });

  // Employee side — printed name now; signature + date at sign time.
  put(pages, font, FIELDS.empName, data.employeeName);

  return { pdfDoc, pages, font };
}

/** Preview PDF bytes (no employee signature). */
export async function renderPreviewBytes(prisma: PrismaClient, teacherId: number): Promise<Uint8Array> {
  const data = await gatherTeacherContractData(prisma, teacherId);
  const { pdfDoc } = await renderTemplateFilled(data, new Date());
  return await pdfDoc.save();
}

/** Render + embed the teacher's signature + sign date, save to disk, return path. */
export async function applySignatureAndSave(opts: {
  teacherId: number; data: TeacherContractData; signaturePngBytes: Buffer; signedAt: Date;
}): Promise<string> {
  const { pdfDoc, pages, font } = await renderTemplateFilled(opts.data, opts.signedAt);
  const empSig = await pdfDoc.embedPng(opts.signaturePngBytes);
  pages[EMP_SIG.page].drawImage(empSig, { x: EMP_SIG.x, y: EMP_SIG.y, width: EMP_SIG.width, height: EMP_SIG.height });
  put(pages, font, FIELDS.empDate, formatDDMonYYYY(opts.signedAt));

  if (!fs.existsSync(SIGNED_DIR)) fs.mkdirSync(SIGNED_DIR, { recursive: true });
  const ts = opts.signedAt.toISOString().replace(/[:.]/g, '-');
  const outPath = path.join(SIGNED_DIR, `teacher-${opts.teacherId}-${ts}.pdf`);
  fs.writeFileSync(outPath, await pdfDoc.save());
  return outPath;
}

export interface SignInput {
  teacherId: number;
  mode: 'typed' | 'drawn';
  signerName: string;
  signerEmail: string | null;
  font: string | null;
  signatureSvg: string | null;
  signaturePngB64: string;
  ipAddress: string | null;
  userAgent: string | null;
}

/**
 * End-to-end signing: render + stamp + write TeacherSignature row + set
 * Teacher.contractSignedAt. Idempotent — returns the existing signature if
 * already signed.
 */
export async function signContract(prisma: PrismaClient, input: SignInput): Promise<{ signatureId: number; pdfPath: string; alreadySigned: boolean }> {
  const teacher = await prisma.teacher.findUnique({ where: { id: input.teacherId }, select: { contractSignedAt: true } });
  if (!teacher) throw new Error(`Teacher ${input.teacherId} not found`);
  if (teacher.contractSignedAt) {
    const latest = await prisma.teacherSignature.findFirst({ where: { teacherId: input.teacherId }, orderBy: { signedAt: 'desc' } });
    return { signatureId: latest!.id, pdfPath: latest!.pdfPath || '', alreadySigned: true };
  }

  const signedAt = new Date();
  const data = await gatherTeacherContractData(prisma, input.teacherId);
  const sigBytes = Buffer.from(input.signaturePngB64.replace(/^data:image\/png;base64,/, ''), 'base64');
  const pdfPath = await applySignatureAndSave({ teacherId: input.teacherId, data, signaturePngBytes: sigBytes, signedAt });

  const sig = await prisma.teacherSignature.create({
    data: {
      teacherId: input.teacherId,
      signerName: input.signerName,
      signerEmail: input.signerEmail,
      mode: input.mode,
      signatureFont: input.font,
      signatureSvg: input.signatureSvg,
      signaturePngB64: input.signaturePngB64,
      contractVersion: CONTRACT_VERSION,
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
      pdfPath,
      signedAt,
    },
  });
  await prisma.teacher.update({ where: { id: input.teacherId }, data: { contractSignedAt: signedAt } });
  return { signatureId: sig.id, pdfPath, alreadySigned: false };
}
