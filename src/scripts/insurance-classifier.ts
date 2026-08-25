// Insurance policy classifier.
//
// Arachas / Study & Protect issue two student insurance products, both as
// fixed-layout TEXT PDFs (so a plain pdftotext + signature match is near-100%,
// no AI vision needed — unlike passports which are photos):
//   • medical             — MEI MediCover, underwritten by Chubb, policy no. …IEBOTA…
//   • learner_protection  — Enrolled Learner Protection, underwritten by Aviva, …PEL…
//
// Used at upload time to auto-file an uploaded PDF as the right ULearn document.
import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileP = promisify(execFile);

export type InsuranceType = 'medical' | 'learner_protection';

export async function extractPdfText(filePath: string): Promise<string> {
  try {
    const { stdout } = await execFileP('pdftotext', ['-layout', filePath, '-'], { maxBuffer: 16 * 1024 * 1024 });
    return stdout || '';
  } catch {
    return '';
  }
}

// Pure classifier over already-extracted text. Returns the sub-type or null.
export function classifyInsurance(text: string): InsuranceType | null {
  const raw = text || '';
  const t = raw.toLowerCase();

  // Gate: must look like an Arachas / Study & Protect policy at all.
  const isArachas = t.includes('arachas') || t.includes('study & protect') || t.includes('studyandprotect');
  if (!isArachas) return null;

  const medical = t.includes('medicover') || t.includes('chubb') || /iebota\s*\d/i.test(raw) || t.includes('medical expenses insurance');
  const lp      = t.includes('learner protection') || t.includes('aviva') || /pel\s*\d/i.test(raw) || t.includes('unexpired portion of tuition');

  if (medical && !lp) return 'medical';
  if (lp && !medical) return 'learner_protection';
  // Both/neither matched — fall back to the strongest unique signal.
  if (/iebota\s*\d/i.test(raw)) return 'medical';
  if (/pel\s*\d/i.test(raw) || t.includes('learner protection')) return 'learner_protection';
  return medical ? 'medical' : (lp ? 'learner_protection' : null);
}

// Extract + classify a file on disk in one call.
export async function classifyInsurancePdf(filePath: string): Promise<InsuranceType | null> {
  return classifyInsurance(await extractPdfText(filePath));
}

// DD/MM/YYYY → UTC Date (server is Dublin/DST — use UTC so @db.Date doesn't
// shift a day). Returns null on a bad/empty match.
function ddmmyyyy(s?: string | null): Date | null {
  const m = /(\d{2})\/(\d{2})\/(\d{4})/.exec(s || '');
  if (!m) return null;
  return new Date(Date.UTC(parseInt(m[3]), parseInt(m[2]) - 1, parseInt(m[1])));
}

export interface InsuranceFields { policyNumber: string | null; from: Date | null; until: Date | null; premium: string | null; }

// Pull the structured policy details out of the extracted text (fixed layouts).
export function extractInsuranceFields(text: string, type: InsuranceType): InsuranceFields {
  const t = text || '';
  if (type === 'medical') {
    const policy = /Policy\s*number:\s*([A-Z0-9]+)/i.exec(t)?.[1] || /Certificate\s*number:\s*([A-Z0-9]*IEBOTA\d+)/i.exec(t)?.[1] || null;
    const from = ddmmyyyy(/Cover\s*Start\s*Date\s*:?\s*(\d{2}\/\d{2}\/\d{4})/i.exec(t)?.[1]);
    const until = ddmmyyyy(/Cover\s*Finish\s*Date\s*:?\s*(\d{2}\/\d{2}\/\d{4})/i.exec(t)?.[1]);
    const premium = /Total\s*Premium:\s*€\s*([\d.,]+)/i.exec(t)?.[1] || null;
    return { policyNumber: policy, from, until, premium };
  }
  // learner_protection — "Period of Insurance: From: dd/mm/yyyy  …  dd/mm/yyyy"
  const policy = /Policy\s*Number\s*:?\s*([A-Z0-9]*PEL\d*)/i.exec(t)?.[1] || /Policy\s*Number\s*:?\s*([A-Z0-9]{6,})/i.exec(t)?.[1] || null;
  const periodLine = /Period of Insurance[\s\S]{0,120}/i.exec(t)?.[0] || '';
  const dates = periodLine.match(/\d{2}\/\d{2}\/\d{4}/g) || [];
  const premium = /Gross\s*Premium[^€]*€\s*([\d.,]+)/i.exec(t)?.[1] || null;
  return { policyNumber: policy, from: ddmmyyyy(dates[0]), until: ddmmyyyy(dates[1]), premium };
}

export const INSURANCE_META: Record<InsuranceType, { slug: string; name: string; documentType: string }> = {
  medical:            { slug: 'Insurance-Medical', name: 'Medical Insurance',   documentType: 'insurance/medical' },
  learner_protection: { slug: 'Insurance-LP',      name: 'Learner Protection',  documentType: 'insurance/lp' },
};
