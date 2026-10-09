/**
 * Student Agreement & Code of Conduct — document + signing engine.
 *
 * Mirrors the partner/teacher contract engines, but the document is built
 * "as a Doc" (HTML → PDF via the shared Puppeteer renderer, same as the LoA)
 * rather than a pre-made static PDF, so the copy stays editable. The signing
 * DISPLAY layer (portal gate modal) matches the Partner Portal.
 *
 * Flow: student logs into the portal → gate surfaces (Student.contractSignedAt
 * null) → they read the contract PDF + sign (typed/drawn) → signContract()
 * stamps the signature into the declaration, renders the signed PDF to
 * data/contracts/student/, writes a StudentSignature row, and sets
 * Student.contractSignedAt. Signed once = lifetime marker on the student.
 */
import fs from 'fs';
import path from 'path';
import type { PrismaClient } from '../generated/prisma/client';
import { documentScripts } from './documents';

export const CONTRACT_VERSION = '2026-09-v1';   // 2026-09: + LifePass Programme Terms appendix

const SIGNED_DIR = path.join(__dirname, '..', '..', 'data', 'contracts', 'student');

function esc(s: any): string {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function formatDDMonYYYY(d: Date): string {
  return d.toLocaleDateString('en-IE', { day: '2-digit', month: 'long', year: 'numeric' });
}

// ── Contract body (from tmp/contract.md, Neil 2026-07-14) ──────────────────
// Numbered sections + declaration. Kept as one constant so the copy is easy to
// edit in one place. The {{SIGNATURE_BLOCK}} marker is replaced per render.
const SECTIONS: Array<{ n?: number; title: string; body: string }> = [
  { title: 'Welcome', body: `
    <p>Welcome to ULearn English School Dublin.</p>
    <p>Our aim is to provide every student with a safe, welcoming and professional environment in which to learn English, make friends and enjoy their time in Ireland.</p>
    <p>By signing this Agreement, you confirm that you have read and understood the expectations outlined below and agree to comply with them throughout your studies with ULearn.</p>` },
  { n: 1, title: 'Respect for Everyone', body: `
    <p>Students must treat all teachers, staff, fellow students, accommodation providers, contractors and visitors with courtesy, dignity and respect at all times.</p>
    <p>ULearn welcomes students from many countries, cultures and backgrounds. Discrimination, harassment or bullying of any kind is unacceptable.</p>
    <p>This includes behaviour relating to, but not limited to:</p>
    <ul><li>Race or nationality</li><li>Ethnicity</li><li>Religion or belief</li><li>Gender</li><li>Sexual orientation</li><li>Disability</li><li>Age</li><li>Culture</li><li>Political opinion</li></ul>
    <p>Everyone has the right to study and work in a safe, respectful and inclusive environment.</p>` },
  { n: 2, title: 'Zero-Tolerance Behaviour', body: `
    <p>The following behaviour is considered serious misconduct and may result in disciplinary action, suspension or immediate expulsion from the school:</p>
    <ul><li>Physical violence or assault.</li><li>Threatening, abusive or intimidating behaviour towards any student, teacher, member of staff, accommodation provider, contractor or visitor.</li><li>Verbal abuse, aggressive behaviour or repeated disrespect towards teachers, school staff or fellow students.</li><li>Sexual harassment or assault.</li><li>Racist, discriminatory or hateful behaviour.</li><li>Bullying, harassment or victimisation.</li><li>Theft.</li><li>Deliberate damage to school or accommodation property.</li><li>Possession or use of illegal drugs.</li><li>Attending school under the influence of illegal drugs.</li><li>Possession of weapons.</li><li>Criminal activity that affects the safety, welfare or reputation of the school.</li></ul>
    <p>Where appropriate, serious incidents may be reported to An Garda Síochána or other relevant authorities.</p>` },
  { n: 3, title: 'Professional Conduct', body: `
    <p>Students agree to:</p>
    <ul><li>Attend classes regularly.</li><li>Arrive punctually.</li><li>Participate positively in lessons.</li><li>Complete classroom activities and assessments.</li><li>Respect teachers, staff and fellow students.</li><li>Follow reasonable instructions from ULearn staff.</li></ul>
    <p>Persistent disruption to teaching or learning may result in disciplinary action.</p>` },
  { n: 4, title: 'English Language Environment', body: `
    <p>ULearn is an English-speaking school.</p>
    <p>Students are encouraged to communicate in English during lessons and organised school activities in order to maximise learning opportunities for themselves and others.</p>` },
  { n: 5, title: 'Attendance &amp; Academic Progress', body: `
    <p>Regular attendance is essential to academic success.</p>
    <p>Students are responsible for attending scheduled classes and informing the school as soon as reasonably possible if they are unable to attend.</p>
    <p>Students studying under Irish immigration regulations must also comply with any attendance or academic progression requirements imposed by the relevant authorities.</p>` },
  { n: 6, title: 'Placement Testing', body: `
    <p>All students must complete any placement assessments required by ULearn.</p>
    <p>The school reserves the right to place students into the class most appropriate to their demonstrated level of English, regardless of previous qualifications or self-assessment.</p>` },
  { n: 7, title: 'Timetables', body: `
    <p>Students may express a preference for morning or afternoon classes.</p>
    <p>However, class schedules are allocated according to academic and operational requirements, and preferred timetables cannot be guaranteed.</p>` },
  { n: 8, title: 'Certificates', body: `
    <p>Course certificates are issued only to students who satisfy the school's attendance and academic requirements.</p>` },
  { n: 9, title: 'Student Information', body: `
    <p>Students agree to provide accurate, complete and up-to-date personal information.</p>
    <p>This includes, where applicable:</p>
    <ul><li>Passport information</li><li>Contact details</li><li>Emergency contact information</li><li>Residential address</li><li>Email address</li><li>Telephone number</li></ul>
    <p>Students are responsible for informing ULearn of any significant changes during their studies.</p>` },
  { n: 10, title: 'Understanding Your Programme', body: `
    <p>By enrolling with ULearn, students confirm that they have:</p>
    <ul><li>Reviewed their quotation and programme details.</li><li>Had the opportunity to ask questions before enrolment.</li><li>Understood the services being purchased.</li></ul>` },
  { n: 11, title: 'Immigration Responsibilities', body: `
    <p>Students remain responsible for ensuring they possess all documentation required for entry into and residence within Ireland.</p>
    <p>This includes, where applicable:</p>
    <ul><li>Passport</li><li>Visa</li><li>Immigration documentation</li><li>Financial evidence</li><li>Any other documentation required by Irish authorities</li></ul>
    <p>ULearn cannot guarantee visa approval or entry into Ireland, as these decisions rest solely with the relevant government authorities.</p>` },
  { n: 12, title: 'Medical Insurance', body: `
    <p>Where required by Irish immigration regulations or visa conditions, students are responsible for maintaining appropriate medical or travel insurance throughout their studies.</p>` },
  { n: 13, title: 'Accommodation', body: `
    <p>Students staying in accommodation arranged by ULearn agree to:</p>
    <ul><li>Respect accommodation providers and fellow residents.</li><li>Follow all house rules.</li><li>Respect neighbours.</li><li>Keep accommodation clean and in good condition.</li><li>Avoid causing unnecessary disturbance.</li></ul>
    <p>Students may be responsible for damage caused through negligence or deliberate misconduct.</p>` },
  { n: 14, title: 'School Property', body: `
    <p>Students agree to respect all school facilities and equipment, including:</p>
    <ul><li>Classrooms</li><li>Furniture</li><li>Computers</li><li>Books</li><li>Student areas</li><li>Digital equipment</li></ul>
    <p>Any deliberate or negligent damage may result in charges and disciplinary action.</p>` },
  { n: 15, title: 'Digital Services', body: `
    <p>Students agree to use ULearn's digital systems responsibly.</p>
    <p>This includes:</p>
    <ul><li>Student Portal</li><li>Mobile application</li><li>School Wi-Fi</li><li>Email systems</li><li>Online learning platforms</li></ul>
    <p>Students must not attempt to gain unauthorised access to school systems, interfere with digital services, distribute malicious software or misuse school technology.</p>` },
  { n: 16, title: 'Privacy &amp; Recording', body: `
    <p>Students must respect the privacy of others.</p>
    <p>Photography, video recording or audio recording of staff, students or classroom activities should not take place without the consent of those involved and, where appropriate, the school.</p>` },
  { n: 17, title: 'Health &amp; Safety', body: `
    <p>Students agree to follow all health and safety instructions issued by ULearn staff.</p>
    <p>In the event of an emergency, students must cooperate fully with school personnel and emergency services.</p>` },
  { n: 18, title: 'Complaints Procedure', body: `
    <p>ULearn is committed to resolving complaints fairly, promptly and professionally.</p>
    <p>Students agree to raise any concerns through the school's official complaints procedure in the first instance, allowing ULearn a reasonable opportunity to investigate and respond before escalating the matter elsewhere.</p>
    <p>If a complaint is deliberately pursued simultaneously through public-facing platforms before the internal complaints procedure has concluded, ULearn may suspend or discontinue its internal investigation until the public matter has been resolved or withdrawn, where it is reasonable to do so.</p>
    <p>Nothing in this Agreement limits or affects any statutory or legal rights available to the student.</p>
    <p>Public-facing platforms include, but are not limited to:</p>
    <ul><li>Social media platforms (such as Facebook, Instagram, TikTok, LinkedIn, X and YouTube)</li><li>Online review platforms (including Google Reviews, Trustpilot and similar services)</li><li>Educational directories and comparison websites</li><li>Agency websites and partner platforms</li><li>Public discussion forums and community websites</li><li>Any other publicly accessible website or online service</li></ul>` },
  { n: 19, title: 'Compliance with Irish Law', body: `
    <p>Students agree to comply with all applicable Irish laws throughout their studies and to follow all reasonable school policies and instructions.</p>` },
  { n: 20, title: 'Disciplinary Process', body: `
    <p>Where appropriate, ULearn will normally follow a progressive disciplinary process:</p>
    <ol><li>Informal discussion</li><li>Formal warning</li><li>Final warning</li><li>Suspension</li><li>Expulsion</li></ol>
    <p>However, serious misconduct may result in immediate suspension or expulsion without prior warning.</p>
    <p>Abusive, threatening or aggressive behaviour towards ULearn staff will not be tolerated, whether it occurs in person, by telephone, by email, through messaging platforms, online meetings or on social media.</p>` },
  { n: 21, title: "ULearn's Commitment", body: `
    <p>ULearn is committed to providing:</p>
    <ul><li>A safe learning environment</li><li>Qualified teachers</li><li>Professional student support</li><li>Fair and respectful treatment</li><li>Equal opportunities for all students</li><li>Transparent complaints procedures</li><li>Respect for student privacy</li></ul>
    <p>We ask every student to contribute positively to our school community and help maintain a welcoming environment for everyone.</p>` },
  { title: 'Appendix — LifePass Programme Terms', body: `
    <p>If you are enrolled on the ULearn <strong>LifePass Programme</strong>, you additionally agree to be bound by the specific Terms &amp; Conditions of that Programme, which form part of this Agreement.</p>
    <p>The full LifePass Programme Terms &amp; Conditions are available for viewing at any time in your ULearn Student App. By signing this Agreement, LifePass students confirm they have had the opportunity to review those terms and agree to comply with them, including the Programme's payment, subscription and continuation conditions.</p>
    <p>If you are not enrolled on the LifePass Programme, this Appendix does not apply to you.</p>` },
];

// The signed declaration block. When signaturePngB64 is present we stamp the
// image + name + date; otherwise blank ruled lines for the on-screen preview.
function declarationBlock(opts: { signerName?: string | null; signaturePngB64?: string | null; signedDate?: Date | null }): string {
  const signed = !!opts.signaturePngB64;
  const nameCell = signed
    ? `<div style="font-weight:700">${esc(opts.signerName)}</div>`
    : `<div style="border-bottom:1px solid #1a1d23;height:22px"></div>`;
  const sigCell = signed
    ? `<img src="${opts.signaturePngB64}" alt="Signature" style="height:60px;display:block">`
    : `<div style="border-bottom:1px solid #1a1d23;height:44px"></div>`;
  const dateCell = signed
    ? `<div style="font-weight:700">${esc(formatDDMonYYYY(opts.signedDate || new Date()))}</div>`
    : `<div style="border-bottom:1px solid #1a1d23;height:22px"></div>`;
  return `
  <div style="margin-top:26px;page-break-inside:avoid">
    <h2 style="font-size:15px;margin:0 0 8px">Student Declaration</h2>
    <p style="margin:0 0 8px">By signing below, I confirm that:</p>
    <ul style="margin:0 0 14px">
      <li>I have read and understood this Student Agreement and Code of Conduct.</li>
      <li>I agree to comply with the policies and expectations outlined above.</li>
      <li>I understand that serious or repeated breaches may result in disciplinary action, including suspension or expulsion.</li>
      <li>I acknowledge that this Agreement operates alongside ULearn's published Terms &amp; Conditions, Refund Policy and any applicable Irish legal or immigration requirements.</li>
      <li>If I am enrolled on the LifePass Programme, I also agree to be bound by the LifePass Programme Terms &amp; Conditions, available for viewing in my ULearn Student App (see Appendix).</li>
    </ul>
    <table style="width:100%;border-collapse:collapse;margin-top:10px">
      <tr>
        <td style="width:55%;padding:0 24px 0 0;vertical-align:bottom">${sigCell}<div style="font-size:11px;color:#6b7280;margin-top:4px">Signature</div></td>
        <td style="vertical-align:bottom">${dateCell}<div style="font-size:11px;color:#6b7280;margin-top:4px">Date</div></td>
      </tr>
      <tr><td colspan="2" style="padding-top:16px">${nameCell}<div style="font-size:11px;color:#6b7280;margin-top:4px">Student Name</div></td></tr>
    </table>
  </div>`;
}

/** Build the full contract HTML. Pass signature data for the signed copy. */
export function buildContractHtml(opts: { signerName?: string | null; signaturePngB64?: string | null; signedDate?: Date | null } = {}): string {
  const sectionsHtml = SECTIONS.map(s => `
    <div style="page-break-inside:avoid;margin:0 0 4px">
      <h2 style="font-size:15px;margin:18px 0 6px">${s.n ? esc(s.n) + '. ' : ''}${s.title}</h2>
      ${s.body}
    </div>`).join('');

  return `<div style="width:210mm;margin:0 auto;font-family:Verdana,sans-serif;font-size:12.5px;line-height:1.55;color:#1a1d23;box-sizing:border-box">
  <img src="/sis/public/doc-header.jpg" style="width:100%;display:block" alt="ULearn Header">
  <div style="padding:16px 18mm 18px 18mm">
    <h1 style="font-size:19px;margin:0 0 2px;text-align:center">Student Agreement &amp; Code of Conduct</h1>
    <p style="text-align:center;margin:0 0 14px;color:#6b7280;font-size:12px">ULearn English School Dublin</p>
    ${sectionsHtml}
    ${declarationBlock(opts)}
  </div>
  <img src="/sis/public/doc-footer.png" style="width:100%;display:block" alt="ULearn Footer">
</div>`;
}

/** Unsigned preview PDF bytes (for the read pane). */
export async function renderPreviewBytes(prisma: PrismaClient): Promise<Buffer> {
  return documentScripts(prisma).generatePdf(buildContractHtml());
}

/**
 * Unsigned preview as a full, RESPONSIVE HTML document for the in-frame read
 * pane. We serve HTML (not the PDF) in the signing iframe because native PDF
 * rendering in an <iframe> is unreliable on mobile (blank / no pinch-zoom — the
 * same problem the LoA popup has). HTML reflows to the frame width and pinch-
 * zooms natively. The `!important` overrides collapse the doc's fixed 210mm/18mm
 * print geometry down to the viewport; the PDF (with QR/print layout) stays the
 * download-as-PDF path.
 */
export function buildPreviewHtmlDoc(opts: { signerName?: string | null; signaturePngB64?: string | null; signedDate?: Date | null } = {}): string {
  return `<!doctype html><html><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes">
<style>
  html,body{margin:0;padding:0;background:#fff;-webkit-text-size-adjust:100%}
  body>div{width:100%!important;max-width:800px!important;margin:0 auto!important}
  body>div>div{padding:16px 16px 18px!important}
  @media(max-width:640px){body>div>div{padding:12px 12px 16px!important}}
  img{max-width:100%;height:auto}
</style></head><body>${buildContractHtml(opts)}</body></html>`;
}

export interface SignInput {
  studentId: number;
  signedByUserId?: number | null;
  mode: 'typed' | 'drawn';
  signerName: string;
  signerEmail?: string | null;
  font?: string | null;
  signatureSvg?: string | null;
  signaturePngB64: string;    // data URI
  ipAddress?: string | null;
  userAgent?: string | null;
}

/**
 * End-to-end signing: render the signed PDF, save it, write the StudentSignature
 * row, and set Student.contractSignedAt. Idempotent — if already signed, returns
 * the existing signature (never re-stamps or moves the lifetime marker).
 */
export async function signContract(prisma: PrismaClient, input: SignInput): Promise<{ signatureId: number; pdfPath: string; alreadySigned: boolean }> {
  const student = await prisma.student.findUnique({ where: { id: input.studentId }, select: { id: true, contractSignedAt: true } });
  if (!student) throw new Error('Student not found');
  if (student.contractSignedAt) {
    const latest = await prisma.studentSignature.findFirst({ where: { studentId: input.studentId }, orderBy: { id: 'desc' } });
    return { signatureId: latest?.id ?? 0, pdfPath: latest?.pdfPath || '', alreadySigned: true };
  }

  const signedAt = new Date();
  const html = buildContractHtml({ signerName: input.signerName, signaturePngB64: input.signaturePngB64, signedDate: signedAt });
  const pdf = await documentScripts(prisma).generatePdf(html);

  fs.mkdirSync(SIGNED_DIR, { recursive: true });
  const pdfPath = path.join(SIGNED_DIR, `student-agreement-${input.studentId}-${CONTRACT_VERSION}.pdf`);
  fs.writeFileSync(pdfPath, pdf);

  const sig = await prisma.studentSignature.create({
    data: {
      studentId: input.studentId,
      signedByUserId: input.signedByUserId ?? null,
      signerName: input.signerName,
      signerEmail: input.signerEmail ?? null,
      mode: input.mode,
      signatureFont: input.font ?? null,
      signatureSvg: input.signatureSvg ?? null,
      signaturePngB64: input.signaturePngB64,
      contractVersion: CONTRACT_VERSION,
      ipAddress: input.ipAddress ?? null,
      userAgent: input.userAgent ?? null,
      pdfPath,
    },
  });

  await prisma.student.update({ where: { id: input.studentId }, data: { contractSignedAt: signedAt } });
  return { signatureId: sig.id, pdfPath, alreadySigned: false };
}
