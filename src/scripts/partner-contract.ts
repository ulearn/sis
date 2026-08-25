/**
 * Partner (ETO) Agreement — signing engine.
 *
 * Rebuilt 2026-07 around the HTML→PDF document (partner-agreement.ts, same
 * renderer as the student agreement / LoA) — the old pdf-lib overlay on a
 * static template PDF is retired, along with the `-zero` commission variant
 * (zero-commission is now just 0% in Schedule 1 of the one template).
 *
 * Data model (agreed with Neil 2026-07-16):
 *   - ETO Name / Registered Address / Wholesale Discount  → HubSpot COMPANY
 *   - Primary Contact / Email / Telephone / Job title      → HubSpot CONTACT
 *   - Wholesale Discount = `commission` property, READ-ONLY to the ETO. Null
 *     rate = "terms not finalised" → the contract is NOT signable (gate).
 *   - The ETO can correct name/contact/email/phone/address at the confirm
 *     step; those corrections are written BACK to HubSpot (canonical).
 *   - Effective Date = today at sign time.
 *   - Neil's countersignature is baked into every render.
 */
import { PrismaClient } from '../generated/prisma/client';
import fs from 'fs';
import path from 'path';
import { PDFDocument } from 'pdf-lib';
import { documentScripts } from './documents';
import {
  buildAgreementHtml,
  buildPreviewHtmlDoc,
  AgreementFields,
  CONTRACT_VERSION as DOC_VERSION,
} from './partner-agreement';

export const CONTRACT_VERSION = DOC_VERSION; // '2026-07-eto-v1'

const SIGNED_DIR = path.join(__dirname, '..', '..', 'data', 'contracts', 'signed');
// Standing compliance annex appended to every partner contract (preview + signed).
const ANNEX_PATH = path.join(__dirname, '..', '..', 'data', 'contracts', 'template', 'D15_London-Statement-Compliance-Annex.pdf');

/**
 * Append the standing compliance annex (D15) as trailing pages of a generated
 * contract PDF, so both the in-portal preview AND the signed copy carry it.
 * No-op if the annex file is absent (contract still renders).
 */
async function appendAnnex(pdf: Buffer): Promise<Buffer> {
  if (!fs.existsSync(ANNEX_PATH)) return pdf;
  const main = await PDFDocument.load(pdf);
  const annex = await PDFDocument.load(fs.readFileSync(ANNEX_PATH));
  const pages = await main.copyPages(annex, annex.getPageIndices());
  pages.forEach((pg) => main.addPage(pg));
  return Buffer.from(await main.save());
}
const HS = 'https://api.hubapi.com';
const HUBSPOT_PAT = process.env.ACCESS_TOKEN || '';
const HS_COMMISSION_PROP = process.env.HUBSPOT_COMMISSION_PROPERTY || 'commission';
// Optional: a HubSpot company property to store the ETO tax/registration no.
// Unset by default (the field is captured on the signed PDF regardless).
const HS_TAXNO_PROP = process.env.HUBSPOT_TAXNO_PROPERTY || '';

// Commission normaliser — mirrors sync-commissions.ts so the contract shows the
// same rate as the portal. Decimal storage (0.25 → 25), legacy int (25 → 25),
// clamps an obvious ×100 typo.
function normaliseCommission(raw: any): number | null {
  if (raw === null || raw === undefined || raw === '') return null;
  const n = parseFloat(raw);
  if (isNaN(n) || n <= 0) return null;
  if (n < 1) return Math.round(n * 10000) / 100;
  if (n >= 50) return Math.round(n) / 100;
  return Math.round(n * 100) / 100;
}

async function hsGet(p: string): Promise<any | null> {
  if (!HUBSPOT_PAT) return null;
  try {
    const res = await fetch(HS + p, { headers: { Authorization: `Bearer ${HUBSPOT_PAT}` } });
    if (!res.ok) return null;
    return await res.json();
  } catch { return null; }
}

async function hsPatch(objectType: 'companies' | 'contacts', id: string, properties: Record<string, string>): Promise<boolean> {
  if (!HUBSPOT_PAT || !Object.keys(properties).length) return false;
  try {
    const res = await fetch(`${HS}/crm/v3/objects/${objectType}/${id}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${HUBSPOT_PAT}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ properties }),
    });
    return res.ok;
  } catch { return false; }
}

// The editable address components (kept structured so write-back is lossless).
export interface AddressParts {
  street: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  country: string | null;
}

function joinAddress(a: AddressParts): string | null {
  const parts = [a.street, a.city, a.state, a.zip, a.country].filter(Boolean);
  return parts.length ? parts.join(', ') : null;
}

export interface ContractData {
  agencyId: number;
  hasCompany: boolean;
  hubspotCompanyId: string | null;
  hubspotContactId: string | null;
  // Rendering fields for the agreement document
  fields: AgreementFields;
  // Structured address (for the editable confirm form)
  address: AddressParts;
  // Commercial gate — false when `commission` is unset in HubSpot
  commissionSet: boolean;
  // Signer pre-fill
  suggestedSignerName: string | null;
  suggestedSignerTitle: string | null;
}

/** Pull everything the contract needs from HubSpot (company + contact). */
export async function gatherContractData(prisma: PrismaClient, agencyId: number): Promise<ContractData> {
  const agency = await prisma.agency.findUnique({
    where: { id: agencyId },
    select: {
      id: true, name: true,
      hubspotCompanyId: true,
      primaryContactId: true,
      primaryEntityType: true,
      primaryEntityId: true,
    },
  });
  if (!agency) throw new Error(`Agency ${agencyId} not found`);

  const hasCompany = !!agency.hubspotCompanyId && agency.primaryEntityType === 'company';
  const contactId = agency.primaryContactId || (agency.primaryEntityType === 'contact' ? agency.primaryEntityId : null);

  // Contact — name, title, email, phone (+ address AND commission for sole traders,
  // whose wholesale discount lives on the CONTACT, not a company). Omitting the
  // commission prop here made every sole-trader read null → "terms not finalised"
  // → they could never sign, no matter what was set in HubSpot.
  let cp: any = {};
  if (contactId) {
    const props = ['firstname', 'lastname', 'jobtitle', 'email', 'phone', 'mobilephone', 'address', 'city', 'state', 'zip', 'country', HS_COMMISSION_PROP].join(',');
    const data = await hsGet(`/crm/v3/objects/contacts/${contactId}?properties=${props}`);
    cp = data?.properties || {};
  }

  // Company — name, address, phone, commission (+ optional tax no).
  let comp: any = {};
  if (hasCompany && agency.hubspotCompanyId) {
    const propList = ['name', 'address', 'address2', 'city', 'state', 'zip', 'country', 'phone', HS_COMMISSION_PROP];
    if (HS_TAXNO_PROP) propList.push(HS_TAXNO_PROP);
    const data = await hsGet(`/crm/v3/objects/companies/${agency.hubspotCompanyId}?properties=${propList.join(',')}`);
    comp = data?.properties || {};
  }

  // Commission: company first, else sole-trader contact.
  const rawCommission = hasCompany ? comp[HS_COMMISSION_PROP] : cp[HS_COMMISSION_PROP];
  const commission = normaliseCommission(rawCommission);

  const primaryContact = [cp.firstname, cp.lastname].filter(Boolean).join(' ').trim() || null;
  const etoName = hasCompany ? (comp.name || agency.name || null) : (primaryContact || agency.name || null);

  const address: AddressParts = hasCompany
    ? { street: comp.address || null, city: comp.city || null, state: comp.state || null, zip: comp.zip || null, country: comp.country || null }
    : { street: cp.address || null, city: cp.city || null, state: cp.state || null, zip: cp.zip || null, country: cp.country || null };

  const fields: AgreementFields = {
    etoName,
    registeredAddress: joinAddress(address),
    companyTaxNo: HS_TAXNO_PROP ? (comp[HS_TAXNO_PROP] || null) : null,
    primaryContact,
    email: cp.email || null,
    telephone: cp.phone || cp.mobilephone || null,
    wholesaleDiscount: commission != null ? String(commission) : null,
    specialConditions: null,
  };

  return {
    agencyId,
    hasCompany,
    hubspotCompanyId: agency.hubspotCompanyId || null,
    hubspotContactId: contactId || null,
    fields,
    address,
    commissionSet: commission != null,
    suggestedSignerName: primaryContact,
    suggestedSignerTitle: cp.jobtitle || null,
  };
}

export interface DetailEdits {
  etoName?: string | null;
  primaryContact?: string | null;
  email?: string | null;
  telephone?: string | null;
  companyTaxNo?: string | null;
  street?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
  country?: string | null;
}

/**
 * Write ETO-corrected details back to HubSpot so the CRM stays canonical.
 * Company fields → company; person fields → contact. Address goes to whichever
 * object holds the agency's address (company for B2B, contact for sole trader).
 * Only non-empty, actually-changed values are sent.
 */
export async function writeBackDetails(prisma: PrismaClient, agencyId: number, edits: DetailEdits): Promise<{ company: boolean; contact: boolean }> {
  const d = await gatherContractData(prisma, agencyId);
  const companyProps: Record<string, string> = {};
  const contactProps: Record<string, string> = {};

  const changed = (a: string | null | undefined, b: string | null | undefined) =>
    (a ?? '').trim() !== '' && (a ?? '').trim() !== (b ?? '').trim();

  // ETO name → company `name` (B2B) or contact first/last (sole trader).
  if (changed(edits.etoName, d.fields.etoName)) {
    if (d.hasCompany) companyProps.name = edits.etoName!.trim();
  }
  // Primary contact → contact first/last (split on last space).
  if (changed(edits.primaryContact, d.fields.primaryContact)) {
    const nm = edits.primaryContact!.trim();
    const sp = nm.lastIndexOf(' ');
    contactProps.firstname = sp > 0 ? nm.slice(0, sp) : nm;
    contactProps.lastname = sp > 0 ? nm.slice(sp + 1) : '';
  }
  if (changed(edits.email, d.fields.email)) contactProps.email = edits.email!.trim();
  if (changed(edits.telephone, d.fields.telephone)) contactProps.phone = edits.telephone!.trim();

  // Address → company (B2B) or contact (sole trader).
  const addrTarget = d.hasCompany ? companyProps : contactProps;
  if (changed(edits.street, d.address.street)) addrTarget.address = edits.street!.trim();
  if (changed(edits.city, d.address.city)) addrTarget.city = edits.city!.trim();
  if (changed(edits.state, d.address.state)) addrTarget.state = edits.state!.trim();
  if (changed(edits.zip, d.address.zip)) addrTarget.zip = edits.zip!.trim();
  if (changed(edits.country, d.address.country)) addrTarget.country = edits.country!.trim();

  // Optional tax no → configured company property.
  if (HS_TAXNO_PROP && changed(edits.companyTaxNo, d.fields.companyTaxNo) && d.hubspotCompanyId) {
    companyProps[HS_TAXNO_PROP] = edits.companyTaxNo!.trim();
  }

  let company = false, contact = false;
  if (Object.keys(companyProps).length && d.hubspotCompanyId) company = await hsPatch('companies', d.hubspotCompanyId, companyProps);
  if (Object.keys(contactProps).length && d.hubspotContactId) contact = await hsPatch('contacts', d.hubspotContactId, contactProps);
  return { company, contact };
}

/** Preview PDF bytes (pre-fill from HubSpot, no signature, dated today). */
export async function renderPreviewBytes(prisma: PrismaClient, agencyId: number): Promise<Buffer> {
  const d = await gatherContractData(prisma, agencyId);
  const html = buildAgreementHtml({ ...d.fields, effectiveDate: new Date() });
  return appendAnnex(await documentScripts(prisma).generatePdf(html));
}

/**
 * Render a viewable agreement PDF for a GRANDFATHERED (established, pre-portal)
 * partner: the same document as a signed copy, but the signer block carries a
 * grandfathered acknowledgment in place of a wet signature (no signature image,
 * no signed date). Used to backfill a PDF for pre-portal partners who have an
 * AgencySignature row but never went through the portal signing flow.
 */
export async function renderGrandfatheredBytes(
  prisma: PrismaClient,
  agencyId: number,
  signerLabel: string,
): Promise<Buffer> {
  const d = await gatherContractData(prisma, agencyId);
  const html = buildAgreementHtml({
    ...d.fields,
    signerName: signerLabel,     // e.g. "Established partner (grandfathered — pre-portal)"
    signaturePngB64: null,       // ruled line — no wet signature
    signedDate: null,
  });
  return appendAnnex(await documentScripts(prisma).generatePdf(html));
}

/** Responsive HTML preview (for the in-portal read pane — mobile-safe). */
export async function renderPreviewHtml(prisma: PrismaClient, agencyId: number): Promise<string> {
  const d = await gatherContractData(prisma, agencyId);
  return buildPreviewHtmlDoc({ ...d.fields, effectiveDate: new Date() });
}

export interface SignInput {
  agencyId: number;
  signedByUserId: number;
  mode: 'typed' | 'drawn';
  signerName: string;
  signerTitle: string | null;
  signerEmail: string | null;
  font: string | null;
  signatureSvg: string | null;
  signaturePngB64: string;
  companyTaxNo?: string | null;   // captured at sign, rendered onto the PDF
  ipAddress: string | null;
  userAgent: string | null;
}

/**
 * End-to-end signing: gate on commission, render the signed HTML→PDF, save it,
 * write the AgencySignature row, and flip Agency.contractSignedAt. Idempotent —
 * if already signed, returns the existing latest signature without re-stamping.
 */
export async function signContract(prisma: PrismaClient, input: SignInput): Promise<{ signatureId: number; pdfPath: string; alreadySigned: boolean }> {
  const existing = await prisma.agency.findUnique({
    where: { id: input.agencyId },
    select: { contractSignedAt: true },
  });
  if (!existing) throw new Error(`Agency ${input.agencyId} not found`);

  if (existing.contractSignedAt) {
    const latest = await prisma.agencySignature.findFirst({
      where: { agencyId: input.agencyId },
      orderBy: { signedAt: 'desc' },
    });
    return { signatureId: latest!.id, pdfPath: latest!.pdfPath || '', alreadySigned: true };
  }

  const d = await gatherContractData(prisma, input.agencyId);
  if (!d.commissionSet) {
    throw new Error('Commercial terms not finalised — the wholesale discount is not set in HubSpot. Contact partners@ulearnschool.com.');
  }

  const signedAt = new Date();
  const html = buildAgreementHtml({
    ...d.fields,
    companyTaxNo: input.companyTaxNo ?? d.fields.companyTaxNo,
    effectiveDate: signedAt,
    signerName: input.signerName,
    signerPosition: input.signerTitle,
    signaturePngB64: input.signaturePngB64,
    signedDate: signedAt,
  });
  const pdf = await appendAnnex(await documentScripts(prisma).generatePdf(html));

  if (!fs.existsSync(SIGNED_DIR)) fs.mkdirSync(SIGNED_DIR, { recursive: true });
  const ts = signedAt.toISOString().replace(/[:.]/g, '-');
  const pdfPath = path.join(SIGNED_DIR, `agency-${input.agencyId}-${ts}.pdf`);
  fs.writeFileSync(pdfPath, pdf);

  const sig = await prisma.agencySignature.create({
    data: {
      agencyId: input.agencyId,
      signedByUserId: input.signedByUserId,
      signerName: input.signerName,
      signerTitle: input.signerTitle,
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

  await prisma.agency.update({
    where: { id: input.agencyId },
    data: { contractSignedAt: signedAt, contractSignedById: input.signedByUserId },
  });

  return { signatureId: sig.id, pdfPath, alreadySigned: false };
}
