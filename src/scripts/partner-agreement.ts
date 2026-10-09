/**
 * ULearn ETO (Educational Tour Operator) Partner Agreement — document body.
 *
 * Rebuilt from the GPT-drafted DRAFTX PDF as an HTML→PDF template (same
 * renderer as the student agreement / LoA) so the copy stays editable and
 * field placement is CSS, not brittle pdf-lib coordinates.
 *
 * Legal text is preserved VERBATIM from the reviewed draft. The only
 * structural changes are the agreed field-model simplifications:
 *   - "ETO Legal Name" + "Trading Name" collapsed to one "ETO Name" row.
 *   - "Territory / Market" row removed (internal use only).
 *   - The GPT "Legal-review note" footer removed.
 *
 * This module is content-only (pure HTML builders). The signing engine
 * (partner-contract.ts) supplies the field values and renders/saves the PDF.
 */

import fs from 'fs';
import path from 'path';

export const CONTRACT_VERSION = '2026-09-eto-v2';

// Neil's countersignature, baked into every rendered copy when present.
// Drop a transparent PNG at data/contracts/template/neil-signature.png to
// enable it; until then the ULearn signature is a ruled line (Stage 2).
const ULEARN_SIG_DATA_URI: string | null = (() => {
  try {
    const p = path.join(__dirname, '..', '..', 'data', 'contracts', 'template', 'neil-signature.png');
    if (fs.existsSync(p)) return `data:image/png;base64,${fs.readFileSync(p).toString('base64')}`;
  } catch { /* ignore */ }
  return null;
})();

function esc(s: any): string {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export function formatDDMonYYYY(d: Date): string {
  return d.toLocaleDateString('en-IE', { day: '2-digit', month: 'long', year: 'numeric' });
}

// ── Clause body (verbatim from reviewed draft) ─────────────────────────────
// Each clause is a heading + an ordered set of sub-paragraphs whose "N.x"
// numbers are baked into the text so nothing can drift out of sequence.
const CLAUSES: Array<{ n: number; title: string; subs: string[] }> = [
  { n: 1, title: 'Appointment and Nature of the Relationship', subs: [
    'ULearn agrees to sell programmes to the ETO, and the ETO may purchase those programmes for onward resale to the ETO’s own clients.',
    'The ETO acts at all times as an independent principal. Nothing in this Agreement creates an agency, partnership, joint venture, franchise, fiduciary or employment relationship between the Parties.',
    'The ETO has no authority to bind ULearn, enter into a contract in ULearn’s name, incur liability for ULearn, amend ULearn’s terms, or make any representation or commitment on ULearn’s behalf.',
    'The ETO is not obliged to purchase any minimum number of programmes from ULearn, and ULearn is not obliged to reserve places unless and until a booking has been accepted in writing.',
    'The appointment is non-exclusive unless Schedule 1 expressly states otherwise.',
  ] },
  { n: 2, title: 'Sale of Programmes', subs: [
    'The ETO purchases education services from ULearn at the applicable net wholesale price and resells those services to its own clients.',
    'The contractual chain is ULearn to ETO, and ETO to client. The ETO’s client contracts with the ETO for the package or programme sold by the ETO.',
    'ULearn will deliver the programme and any other services expressly confirmed in the applicable Letter of Acceptance, booking confirmation or invoice.',
    'The ETO remains responsible for its own sales, counselling, packaging, pricing, invoicing, collection of client funds, refunds to clients and compliance obligations in its jurisdiction.',
    'Nothing in this Agreement prevents ULearn from advertising or promoting its programmes generally.',
  ] },
  { n: 3, title: 'Wholesale Prices and ETO Resale Prices', subs: [
    'ULearn will invoice the ETO at the published gross tuition price less the applicable wholesale discount determined in accordance with Schedule 1 and, where the Accelerator Programme applies, Schedule 2, or at another net price agreed in writing for a particular booking.',
    'Unless expressly agreed otherwise, the wholesale discount applies only to tuition fees and excludes registration or booking fees, accommodation, accommodation placement fees, insurance, examinations, books, transfers, banking charges and other third-party or ancillary services.',
    'The ETO is free to determine the retail price charged to its clients and may combine the programme with accommodation, insurance, flights, transfers, advisory services or other products.',
    'The ETO must not misrepresent ULearn’s published prices, create a false ULearn discount, or state that an ETO-funded discount is funded or authorised by ULearn unless ULearn has confirmed this in writing.',
    'Where the ETO separately identifies charges above ULearn’s published gross price, the ETO must make clear to its client that those additional charges are charged by the ETO and not by ULearn.',
  ] },
  { n: 4, title: 'Bookings, Student Information and Genuine Students', subs: [
    'The ETO will submit complete application information at the earliest reasonable opportunity and will promptly provide any documents or information reasonably required to assess and process a booking.',
    'The ETO will make reasonable efforts to recruit genuine students whose primary purpose in travelling to Ireland is to study.',
    'The ETO must not knowingly submit false, altered, misleading or incomplete information or documentation, and must immediately notify ULearn of any suspected fraud, material inconsistency or change affecting a booking.',
    'The ETO warrants that it has a lawful basis to collect and transfer the personal data supplied to ULearn and that the client has been informed that the data will be shared with ULearn and relevant service providers or authorities where necessary.',
    'A booking is not confirmed until ULearn issues written confirmation. ULearn may refuse or cancel a booking where admission requirements are not met, documents are unreliable, payment is not received, capacity is unavailable, or the proposed enrolment would create legal, regulatory, safeguarding or operational risk.',
  ] },
  { n: 5, title: 'Information Provided to ETO Clients', subs: [
    'The ETO will ensure that its clients are properly and accurately informed about all material aspects of the programme, including course content, duration, timetable flexibility, fees, payment deadlines, accommodation, holidays, attendance, immigration requirements, cancellation terms and refund conditions.',
    'The ETO must use current information supplied or approved by ULearn and must not make unauthorised guarantees regarding visas, entry to Ireland, employment, earnings, accommodation allocation, class timetable, academic progression, nationality mix, refunds or any matter controlled by ULearn or a third party.',
    'The ETO is responsible for ensuring that its contract and terms with its client are consistent with the buy-sell relationship recorded in this Agreement and do not state or imply that the ETO acts as ULearn’s agent.',
  ] },
  { n: 6, title: 'Payment', subs: [
    'Unless otherwise agreed in writing, full payment of ULearn’s invoice is due no later than three weeks before the programme start date.',
    'Where a booking is made within three weeks of the programme start date, full payment is due immediately.',
    'For visa-required students, ULearn may require full cleared payment before issuing visa or enrolment documents.',
    'The ETO’s obligation to pay ULearn is independent of whether the ETO has collected payment from its client. Payment by a client to the ETO does not constitute payment to ULearn.',
    'The ETO may deduct the agreed wholesale discount when paying a net invoice but may not deduct any other amount without ULearn’s prior written agreement.',
    'Bank charges, currency conversion costs, withholding taxes and similar costs imposed outside Ireland are the responsibility of the ETO unless otherwise agreed.',
    'ULearn may withhold confirmation, access to classes, accommodation, documentation or other services until cleared funds are received.',
  ] },
  { n: 7, title: 'Cancellations, Changes, Refunds and Credit Notes', subs: [
    'All cancellations, postponements, substitutions and programme changes must be requested by the ETO in writing and are subject to ULearn’s current Terms and Conditions and Refund Policy.',
    'Any refund or credit arising from a booking purchased by the ETO will be made to the ETO or to the original source of payment. The ETO is responsible for any refund, credit or other remedy owed to its client under the ETO’s own contract.',
    'ULearn is not required to refund an ETO client directly unless ULearn expressly agrees to do so.',
    'No refund is due for non-attendance, late arrival, early departure or services not used, except where ULearn’s Terms and Conditions or applicable law provide otherwise.',
    'Visa-refusal refunds, where applicable, are subject to timely submission of the official refusal decision and any other documents required by ULearn’s Refund Policy.',
  ] },
  { n: 8, title: 'Complaints and Client Communication', subs: [
    'The ETO is the primary contractual contact for its client in relation to booking, payment, pre-arrival changes, refunds and legal claims arising under the ETO-client contract.',
    'The ETO must notify ULearn promptly of any complaint or material concern relating to services delivered by ULearn and must give ULearn a reasonable opportunity to investigate and respond.',
    'The ETO must not admit liability, promise compensation or agree a refund on ULearn’s behalf.',
    'ULearn may communicate directly with an ETO client where reasonably necessary for education delivery, welfare, safeguarding, attendance, immigration compliance, emergency response, data verification or service administration. Such operational communication does not alter the principal-to-principal contractual structure.',
    'Pre-arrival commercial changes and refund requests should ordinarily be communicated through the ETO.',
  ] },
  { n: 9, title: 'Client Relationship and Non-Solicitation', subs: [
    'The ETO’s clients and client relationships remain the ETO’s own. ULearn does not acquire ownership of the ETO’s client base merely because an ETO client studies at ULearn.',
    'During the booked programme, ULearn will not actively solicit an ETO client to purchase another programme independently of the ETO, except where the ETO consents, the client independently approaches ULearn, or direct engagement is reasonably required by law, regulation, welfare or operational necessity.',
    'This clause does not restrict ULearn’s general advertising, public promotions or responses to unsolicited enquiries.',
  ] },
  { n: 10, title: 'Marketing, Brand and Intellectual Property', subs: [
    'ULearn may provide approved promotional materials for the ETO’s use in promoting ULearn programmes.',
    'During the term, ULearn grants the ETO a limited, non-exclusive, non-transferable and revocable licence to use ULearn’s name, logos and approved materials solely for the purposes of this Agreement.',
    'The ETO must use ULearn branding accurately and professionally and must obtain prior written approval for materially altered, translated or newly created materials using ULearn’s name or logos.',
    'The ETO must not register or use a domain name, social-media account, trading name, advertising account or online property that incorporates or is confusingly similar to ULearn’s name without prior written consent.',
    'The ETO must immediately stop using ULearn branding and remove ULearn materials when this Agreement ends or when ULearn reasonably requests.',
  ] },
  { n: 11, title: 'Data Protection and Confidentiality', subs: [
    'Each Party will comply with applicable data-protection laws, including the EU General Data Protection Regulation where applicable.',
    'Unless otherwise agreed for a specific processing activity, each Party acts as an independent controller of the personal data it processes.',
    'Each Party will implement appropriate technical and organisational safeguards, restrict access to authorised personnel, and use personal data only for lawful and legitimate purposes connected with the relationship.',
    'The ETO will notify ULearn without undue delay, and where practicable within 24 hours, after becoming aware of a personal-data breach affecting ULearn applicants or students.',
    'Each Party will keep confidential all non-public commercial, financial, operational and personal information received from the other Party and will disclose it only where necessary to perform this Agreement or where required by law.',
    'The confidentiality obligations survive termination.',
  ] },
  { n: 12, title: 'Compliance, Ethics and Subcontracting', subs: [
    'The ETO will comply with all laws applicable to its activities, including consumer protection, anti-bribery, anti-corruption, sanctions, anti-money-laundering, advertising and immigration-related laws.',
    'The ETO must not offer or accept any improper payment, benefit or inducement connected with ULearn bookings.',
    'The ETO may not transfer this Agreement or appoint a sub-agent, subcontractor, freelancer, aggregator or other third party to represent ULearn without prior written approval.',
    'The ETO remains responsible for all acts and omissions of its staff, branches, counsellors, contractors and approved sub-agents.',
  ] },
  { n: 13, title: 'Quality, Records and Cooperation', subs: [
    'The ETO will maintain accurate records of applications, advice, client payments and material communications for a reasonable period required by applicable law.',
    'The ETO will cooperate with reasonable compliance, quality-assurance or due-diligence enquiries made by ULearn, including enquiries connected with immigration compliance, student protection, fraud prevention or Revenue requirements.',
    'ULearn may periodically review the relationship by reference to booking quality, student outcomes, visa-refusal patterns, complaints, payment performance, brand compliance and responsiveness.',
  ] },
  { n: 14, title: 'Liability and Indemnity', subs: [
    'Each Party is responsible for its own acts, omissions, representations, contracts and legal obligations.',
    'The ETO will be responsible for losses reasonably incurred by ULearn as a direct result of the ETO’s fraud, wilful misconduct, material unauthorised representation, breach of confidentiality, infringement of ULearn’s intellectual property, or knowing submission of false documents.',
    'ULearn is not responsible for visa decisions, immigration decisions, airline disruption, third-party services, employment outcomes, or events beyond ULearn’s reasonable control.',
    'Nothing in this Agreement excludes liability that cannot lawfully be excluded, including liability for fraud or fraudulent misrepresentation.',
  ] },
  { n: 15, title: 'Force Majeure', subs: [
    'Neither Party will be liable for delay or failure caused by events beyond its reasonable control, including severe weather, natural disaster, epidemic, pandemic, war, civil disorder, government action, interruption of utilities, transport disruption, industrial dispute or similar events (see ULearn’s Terms and Conditions for more). The affected Party will take reasonable steps to minimise the effect and resume performance.',
  ] },
  { n: 16, title: 'Suspension', subs: [
    'ULearn may immediately suspend new bookings, use of ULearn branding, access to systems or other privileges while investigating suspected fraud, document irregularities, non-payment, data-protection concerns, safeguarding issues, reputational risk or another material breach.',
    'Suspension does not waive any existing payment obligation or prevent later termination.',
  ] },
  { n: 17, title: 'Term and Termination', subs: [
    'This Agreement begins on the Effective Date and continues until terminated.',
    'Either Party may terminate this Agreement by giving one month’s written notice to the other Party.',
    'Either Party may terminate immediately where the other Party commits a material breach that cannot be remedied, or fails to remedy a remediable material breach within a reasonable period after written notice.',
    'ULearn may terminate immediately for fraud, falsified documentation, serious misrepresentation, bribery, unlawful discrimination, serious data or safeguarding breach, misuse of client funds, insolvency, repeated misleading marketing, material reputational harm or refusal to cooperate with a legitimate investigation.',
    'On termination, all outstanding invoices become immediately due. The ETO must stop representing any relationship with ULearn, stop using ULearn branding, and cooperate in the orderly handling of accepted and paid bookings.',
    'Termination does not affect rights or liabilities accrued before termination. Clauses intended by their nature to survive, including confidentiality, intellectual property, liability, payment and governing law, will continue.',
  ] },
  { n: 18, title: 'General', subs: [
    'This Agreement, its schedules, and ULearn’s current Terms and Conditions and Refund Policy constitute the entire agreement between the Parties concerning its subject matter and replace prior discussions or arrangements.',
    'If there is a conflict, the signed commercial terms in Schedule 1 prevail in relation to the identity of the ETO and the agreed wholesale discount; otherwise this Agreement prevails unless expressly stated.',
    'An amendment is valid only if recorded in writing and approved by authorised representatives of both Parties.',
    'If any provision is invalid or unenforceable, the remaining provisions continue in effect.',
    'A failure or delay to enforce a right is not a waiver of that right.',
    'Notices under this Agreement must be sent by email or registered post to the contact details in Schedule 1 and are deemed received when delivery is confirmed.',
    'This Agreement may be signed electronically and in counterparts.',
  ] },
  { n: 19, title: 'Governing Law and Jurisdiction', subs: [
    'This Agreement is governed by Irish law, and the Parties submit to the exclusive jurisdiction of the courts of Ireland.',
  ] },
];

export interface AgreementFields {
  etoName?: string | null;
  registeredAddress?: string | null;
  companyTaxNo?: string | null;       // optional
  primaryContact?: string | null;     // required
  email?: string | null;              // required
  telephone?: string | null;
  wholesaleDiscount?: string | null;  // digits only, e.g. "25"
  specialConditions?: string | null;
  effectiveDate?: Date | null;
  // ETO-side signature (present only on the signed copy)
  signerName?: string | null;
  signerPosition?: string | null;
  signaturePngB64?: string | null;
  signedDate?: Date | null;
}

// A filled value, or a ruled line for the blank/preview copy.
function fill(value: string | null | undefined, minWidth = '60%'): string {
  if (value != null && String(value).trim() !== '') return esc(value);
  return `<span style="display:inline-block;min-width:${minWidth};border-bottom:1px solid #1a1d23">&nbsp;</span>`;
}

function summaryTable(f: AgreementFields): string {
  const eff = f.effectiveDate ? formatDDMonYYYY(f.effectiveDate) : null;
  const rows: Array<[string, string]> = [
    ['ULearn', 'ULearn Limited, Company Registration No. 455635'],
    ['Educational Tour Operator', fill(f.etoName, '70%')],
    ['Effective Date', fill(eff, '55%')],
    ['Agreement Term', 'Until terminated in accordance with Clause 17'],
    ['Wholesale Discount', 'As specified in Schedule 1'],
  ];
  return `<table style="width:100%;border-collapse:collapse;margin:14px 0 6px;font-size:12px">
    ${rows.map(([k, v]) => `<tr>
      <td style="width:34%;border:1px solid #cbd5e1;background:#eef2e6;padding:6px 8px;font-weight:700;vertical-align:top">${k}</td>
      <td style="border:1px solid #cbd5e1;padding:6px 8px;vertical-align:top">${v}</td>
    </tr>`).join('')}
  </table>`;
}

function scheduleTable(f: AgreementFields): string {
  const eff = f.effectiveDate ? formatDDMonYYYY(f.effectiveDate) : null;
  const disc = f.wholesaleDiscount != null && String(f.wholesaleDiscount).trim() !== ''
    ? `${esc(f.wholesaleDiscount)}% of gross tuition fees`
    : `The Accelerator Programme (see Schedule 2)`;
  const rows: Array<[string, string]> = [
    ['ETO Name', fill(f.etoName, '70%')],
    ['Registered Address', fill(f.registeredAddress, '70%')],
    ['Company / Tax Registration Number', fill(f.companyTaxNo, '70%')],
    ['Primary Contact', fill(f.primaryContact, '70%')],
    ['Email', fill(f.email, '70%')],
    ['Telephone', fill(f.telephone, '70%')],
    ['Wholesale Discount', disc],
    ['Special Conditions', fill(f.specialConditions, '70%')],
    ['Effective Date', fill(eff, '55%')],
  ];
  return `<table style="width:100%;border-collapse:collapse;margin:10px 0 6px;font-size:12px">
    ${rows.map(([k, v]) => `<tr>
      <td style="width:38%;border:1px solid #cbd5e1;background:#eef2e6;padding:6px 8px;font-weight:700;vertical-align:top">${k}</td>
      <td style="border:1px solid #cbd5e1;padding:6px 8px;vertical-align:top">${v}</td>
    </tr>`).join('')}
  </table>`;
}

// Schedule 2 — The Accelerator Programme. The tier ladder MIRRORS the hub's single
// source of truth (hubapp/scripts/accelerator/ladder.js). If that ladder is retuned,
// update this table to match so the signed agreement and the quoting engine never drift.
const ACCEL_LADDER: Array<[string, string]> = [
  ['1 – 3', '22%'],
  ['4 – 6', '23.5%'],
  ['7 – 9', '25%'],
  ['10 – 15', '27%'],
  ['16 – 22', '30%'],
  ['23 – 35', '35%'],
  ['36 – 60', '44%'],
  ['61 or more', 'By separate written agreement'],
];

function scheduleTwo(): string {
  const ladderRows = ACCEL_LADDER.map(([band, rate]) => `<tr>
      <td style="width:50%;border:1px solid #cbd5e1;padding:5px 8px;vertical-align:top">${band}</td>
      <td style="border:1px solid #cbd5e1;padding:5px 8px;vertical-align:top;font-weight:700">${rate}</td>
    </tr>`).join('');
  const sub = (n: string, t: string) => `<p style="margin:0 0 8px"><strong>${n}</strong>&nbsp; ${t}</p>`;
  return `<div style="page-break-inside:avoid;margin-top:18px">
    <h1 style="font-size:17px;margin:14px 0 8px;color:#2f5233;border-bottom:2px solid #2f5233;padding-bottom:4px">Schedule 2 &mdash; The Accelerator Programme</h1>
    ${sub('S2.1', "The Accelerator Programme is ULearn’s standard commercial basis for determining the ETO’s wholesale discount. Unless Schedule 1 expressly records a fixed wholesale discount, the Accelerator Programme applies.")}
    ${sub('S2.2', 'Under the Accelerator Programme the wholesale discount is earned progressively by reference to the number of funded student enrolments the ETO completes with ULearn during each annual cycle, as set out in the table below.')}
    <table style="width:100%;border-collapse:collapse;margin:6px 0 10px;font-size:12px">
      <tr>
        <td style="width:50%;border:1px solid #cbd5e1;background:#eef2e6;padding:6px 8px;font-weight:700">Funded enrolments in cycle</td>
        <td style="border:1px solid #cbd5e1;background:#eef2e6;padding:6px 8px;font-weight:700">Wholesale discount</td>
      </tr>
      ${ladderRows}
    </table>
    ${sub('S2.3', 'The wholesale discount applied to each enrolment is the higher of (a) the entry rate of 22% and (b) the rate for the band into which that enrolment falls, measured by the ETO’s cumulative funded enrolments in the then-current cycle.')}
    ${sub('S2.4', 'A “funded enrolment” means a booking that has been confirmed and paid in accordance with Clause 6. The cycle is a twelve-month period aligned to the calendar year unless otherwise agreed in writing, and the count resets at the start of each cycle.')}
    ${sub('S2.5', 'Enrolments beyond 60 in a cycle are handled under a separate written agreement and are not automatically rated under this Schedule.')}
    ${sub('S2.6', 'The Accelerator Programme discount applies to gross course tuition prices only, on the same basis and with the same exclusions as the Wholesale Discount Scope set out in Schedule 1.')}
  </div>`;
}

function signatureBlock(f: AgreementFields): string {
  const line = (h = '20px') => `<div style="border-bottom:1px solid #1a1d23;height:${h}"></div>`;
  const etoSig = f.signaturePngB64
    ? `<img src="${f.signaturePngB64}" alt="Signature" style="height:48px;display:block">`
    : line('40px');
  const etoName = f.signerName ? `<div style="font-weight:700">${esc(f.signerName)}</div>` : line();
  const etoPos = f.signerPosition ? `<div style="font-weight:700">${esc(f.signerPosition)}</div>` : line();
  const etoDate = f.signedDate ? `<div style="font-weight:700">${esc(formatDDMonYYYY(f.signedDate))}</div>` : line();
  const etoEmail = f.email ? `<div>${esc(f.email)}</div>` : line();

  const cell = (label: string, content: string) =>
    `<div style="margin:0 0 10px"><div style="font-size:10.5px;color:#6b7280;margin:0 0 3px">${label}</div>${content}</div>`;

  return `<table style="width:100%;border-collapse:collapse;margin-top:8px;font-size:12px;page-break-inside:avoid">
    <tr>
      <td style="width:50%;border:1px solid #cbd5e1;padding:10px 12px;vertical-align:top">
        <div style="font-weight:700;margin:0 0 8px">For the Educational Tour Operator</div>
        ${cell('Signature', etoSig)}
        ${cell('Name', etoName)}
        ${cell('Position', etoPos)}
        ${cell('Date', etoDate)}
        ${cell('Email', etoEmail)}
        <div style="font-size:10.5px;color:#6b7280;margin:0 0 3px">Company Stamp (if applicable)</div>
        <div style="height:36px"></div>
      </td>
      <td style="width:50%;border:1px solid #cbd5e1;padding:10px 12px;vertical-align:top">
        <div style="font-weight:700;margin:0 0 8px">For ULearn Limited</div>
        ${cell('Signature', ULEARN_SIG_DATA_URI ? `<img src="${ULEARN_SIG_DATA_URI}" alt="Signature" style="height:48px;display:block">` : line('40px'))}
        ${cell('Name', '<div style="font-weight:700">Neil McMahon</div>')}
        ${cell('Position', '<div style="font-weight:700">Director</div>')}
        ${cell('Date', f.effectiveDate ? `<div style="font-weight:700">${esc(formatDDMonYYYY(f.effectiveDate))}</div>` : line())}
        ${cell('Email', '<div>partners@ulearnschool.com</div>')}
        <div style="font-size:10.5px;color:#6b7280;margin:0 0 3px">&nbsp;</div>
        <div>ULearn Limited, 13 Harcourt Street, Dublin 2, D02 RK31</div>
      </td>
    </tr>
  </table>`;
}

/** Build the full agreement HTML. Pass field values for a filled/signed copy. */
export function buildAgreementHtml(f: AgreementFields = {}): string {
  const clausesHtml = CLAUSES.map(c => `
    <div style="page-break-inside:avoid;margin:0 0 6px">
      <h2 style="font-size:14px;margin:16px 0 6px;color:#2f5233">${c.n}. ${c.title}</h2>
      ${c.subs.map((s, i) => `<p style="margin:0 0 8px"><strong>${c.n}.${i + 1}</strong>&nbsp; ${s}</p>`).join('')}
    </div>`).join('');

  return `<div style="width:210mm;margin:0 auto;font-family:Verdana,sans-serif;font-size:12px;line-height:1.5;color:#1a1d23;box-sizing:border-box">
  <img src="/sis/public/doc-header.jpg" style="width:100%;display:block" alt="ULearn Header">
  <div style="padding:16px 18mm 18px 18mm">
    <h1 style="font-size:20px;margin:0 0 2px;text-align:center;color:#2f5233">ULearn Educational Tour Operator (ETO)</h1>
    <h1 style="font-size:18px;margin:0 0 6px;text-align:center;color:#2f5233">Partner Agreement</h1>
    <p style="text-align:center;margin:0 0 10px;color:#4b6b52;font-style:italic;font-size:12px">Principal-to-principal agreement for the wholesale purchase and onward resale of English language programmes</p>

    ${summaryTable(f)}

    <h2 style="font-size:14px;margin:16px 0 6px;color:#2f5233">Parties</h2>
    <p style="margin:0 0 8px">This Agreement is made between ULearn Limited, trading as ULearn English School Dublin, of 13 Harcourt Street, Dublin 2, D02 RK31, Ireland ("ULearn"), and the business identified in Schedule 1 (the "ETO").</p>
    <p style="margin:0 0 8px">ULearn and the ETO are each a "Party" and together the "Parties".</p>

    <h2 style="font-size:14px;margin:16px 0 6px;color:#2f5233">Background</h2>
    <ul style="margin:0 0 8px">
      <li>ULearn provides English language education programmes and related services in Ireland.</li>
      <li>The ETO operates an independent educational travel or international student recruitment business and wishes to purchase programmes from ULearn for onward resale to its own clients.</li>
      <li>The Parties intend this Agreement to document a wholesale buy-sell relationship. The ETO acts as principal in its dealings with its clients and does not act as ULearn's agent.</li>
    </ul>

    ${clausesHtml}

    <div style="page-break-inside:avoid;margin-top:18px">
      <h1 style="font-size:17px;margin:14px 0 8px;color:#2f5233;border-bottom:2px solid #2f5233;padding-bottom:4px">Schedule 1 &mdash; Commercial Terms</h1>
      ${scheduleTable(f)}
      <h2 style="font-size:13px;margin:14px 0 4px">Wholesale Discount Scope</h2>
      <p style="margin:0 0 8px">The discount applies to gross course tuition prices only. It excludes registration and booking fees, accommodation, accommodation placement fees, health or travel insurance, examination fees, books or materials, transfers, bank charges and other extras, unless expressly stated above.</p>
    </div>

    ${scheduleTwo()}

    <div style="page-break-inside:avoid;margin-top:18px">
      <h1 style="font-size:17px;margin:14px 0 8px;color:#2f5233;border-bottom:2px solid #2f5233;padding-bottom:4px">Signatures</h1>
      ${signatureBlock(f)}
    </div>
    <div style="margin-top:22px;border-top:2px solid #2f5233;padding-top:8px;text-align:center;font-size:10.5px;color:#4b6b52">
      ULearn Limited &middot; 13 Harcourt Street, Dublin 2, D02 RK31, Ireland &middot; partners@ulearnschool.com &middot; (+353) 1 475 1222 &middot; Company Registration No. 455635
    </div>
  </div>
</div>`;
}

/**
 * Responsive full-HTML document for the in-portal read pane (native PDF in an
 * <iframe> renders blank / no pinch-zoom on mobile — same fix as the student
 * agreement). The PDF stays the download path.
 */
export function buildPreviewHtmlDoc(f: AgreementFields = {}): string {
  return `<!doctype html><html><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes">
<style>
  html,body{margin:0;padding:0;background:#fff;-webkit-text-size-adjust:100%}
  body>div{width:100%!important;max-width:820px!important;margin:0 auto!important}
  body>div>div{padding:16px 16px 18px!important}
  @media(max-width:640px){body>div>div{padding:12px 12px 16px!important}}
  img{max-width:100%;height:auto}
  table{max-width:100%}
</style></head><body>${buildAgreementHtml(f)}</body></html>`;
}
