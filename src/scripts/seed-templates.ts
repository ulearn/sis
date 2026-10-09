import { PrismaClient } from '../generated/prisma/client';

/**
 * Seed document templates converted from Fidelo.
 * Fidelo uses {single_braces}, we use {{double.braces}}.
 * Fidelo conditionals {if x}...{/if} are converted to editable blocks.
 * Gender-conditional pronouns are replaced with {{student.pronoun_*}} tokens.
 */

// A4 page wrapper with branded header & footer.
// Header + footer images bleed edge-to-edge (210mm wide, no side margin).
// The puppeteer PDF render now uses margin:0 — the wrapper itself controls
// all spacing so the banner images can hit the paper edge. Content area
// gets internal padding for readability (~15mm sides, 8mm top/bottom of
// breathing room either side of the bands).
// Earlier: the wrapper had min-height:297mm + absolute-positioned footer,
// which combined with puppeteer's old 20mm margins pushed everything to
// page 2 (the "footer = page 2 with just the banner" bug Paul flagged on
// Attendance-Letter-121-v1).
const HEADER = `<div style="width:210mm;margin:0 auto;font-family:Verdana,sans-serif;font-size:13px;line-height:1.4;color:#1a1d23;box-sizing:border-box">
  <img src="/sis/public/doc-header.jpg" style="width:100%;display:block" alt="ULearn Header">
  <div style="padding:8px 18mm 8px 18mm;line-height:1.35">`;

const FOOTER = `  </div>
  <img src="/sis/public/doc-footer.png" style="width:100%;display:block" alt="ULearn Footer">
</div>`;

const DOC_META = `<div style="margin-top:30px;font-size:10px;color:#9b9ea6">
    <p style="margin:0">Document: {{document.number}} | Version: {{document.version}} | Issued: {{document.issue_date}}</p>
  </div>`;

const DOC_META_SHORT = `<div style="margin-top:30px;font-size:10px;color:#9b9ea6">
    <p style="margin:0">Document: {{document.number}} | Issued: {{document.issue_date}}</p>
  </div>`;

const SIGNOFF = `<p style="margin:10px 0 0">Yours faithfully,</p>
  <div style="margin-top:4px">
    <img src="/sis/public/doc-signature.jpg" style="height:58px;display:block" alt="Signature">
    <p style="margin:2px 0 0"><strong>Authorised Signatory</strong></p>
    <p style="margin:0;color:#6b7280;font-size:12px">ULearn English School Dublin</p>
  </div>`;

const templates = [
  // ── SUCCESS / VISA ──────────────────────────────
  {
    name: 'LOA Non-EU (QR)',
    slug: 'LOA-NonEU-QR',
    category: 'success',
    documentType: 'success',
    requiresFullPayment: true,
    htmlTemplate: `${HEADER}
  <p style="text-align:right;margin:0 0 8px;font-size:13px">{{document.issue_date_short}}</p>
  <p style="margin:0 0 10px">To Whom It May Concern,</p>

  <p style="margin:0 0 4px">This letter is a secure document. To confirm the recipient &amp; holder is a genuine ULearn Student please scan the QR code below with the camera on your phone.</p>
  <ul style="margin:0 0 8px">
    <li>Please pay close attention to the <strong>exact URL</strong> you see</li>
    <li>The URL must <strong><u>exactly match</u></strong>: {{document.verification_url}}</li>
    <li>You will also see the student's name &amp; details mirrored on that page</li>
  </ul>

  <p style="text-align:center;margin:4px 0 0;font-size:12px"><strong>SCAN THIS QR CODE WITH YOUR PHONE TO VERIFY THE AUTHENTICITY OF THIS DOCUMENT</strong></p>
  <p style="text-align:center;margin:0">{{document.qr}}</p>

  <p style="margin:6px 0 4px">{{student.salutation}} {{student.first_name}} {{student.last_name}} has paid ULearn English School {{booking.amount_reserved}} to reserve the following:</p>

  <table style="width:100%;border-collapse:collapse;margin:6px 0">
    <tr><td style="padding:3px 0;border-bottom:1px solid #e5e4e0;width:180px"><strong>Student Name</strong></td><td style="padding:3px 0;border-bottom:1px solid #e5e4e0">{{student.first_name}} {{student.last_name}}</td></tr>
    <tr><td style="padding:3px 0;border-bottom:1px solid #e5e4e0"><strong>Student Number</strong></td><td style="padding:3px 0;border-bottom:1px solid #e5e4e0">{{student.id}}</td></tr>
    <tr><td style="padding:3px 0;border-bottom:1px solid #e5e4e0"><strong>Nationality</strong></td><td style="padding:3px 0;border-bottom:1px solid #e5e4e0">{{student.nationality}}</td></tr>
    <tr><td style="padding:3px 0;border-bottom:1px solid #e5e4e0"><strong>Date of Birth</strong></td><td style="padding:3px 0;border-bottom:1px solid #e5e4e0">{{student.dob}}</td></tr>
    <tr><td style="padding:3px 0;border-bottom:1px solid #e5e4e0"><strong>Passport Number</strong></td><td style="padding:3px 0;border-bottom:1px solid #e5e4e0">{{student.passport_number}}</td></tr>
    <tr><td style="padding:3px 0;border-bottom:1px solid #e5e4e0"><strong>Course Title &amp; Level</strong></td><td style="padding:3px 0;border-bottom:1px solid #e5e4e0">{{booking.course_name}} {{booking.course_level}}</td></tr>
    {if booking.ilep_code}<tr><td style="padding:3px 0;border-bottom:1px solid #e5e4e0"><strong>ILEP Course Code</strong></td><td style="padding:3px 0;border-bottom:1px solid #e5e4e0">{{booking.ilep_code}}</td></tr>{/if}
    <tr><td style="padding:3px 0;border-bottom:1px solid #e5e4e0"><strong>Duration</strong></td><td style="padding:3px 0;border-bottom:1px solid #e5e4e0">{{booking.visa_weeks}} weeks</td></tr>
    <tr><td style="padding:3px 0;border-bottom:1px solid #e5e4e0"><strong>Hours per Week</strong></td><td style="padding:3px 0;border-bottom:1px solid #e5e4e0">{{booking.hours_per_week}}</td></tr>
    <tr><td style="padding:3px 0;border-bottom:1px solid #e5e4e0"><strong>Start Date</strong></td><td style="padding:3px 0;border-bottom:1px solid #e5e4e0">{{booking.visa_start_date}}</td></tr>
    <tr><td style="padding:3px 0"><strong>Finish Date</strong></td><td style="padding:3px 0">{{booking.visa_end_date}}</td></tr>
  </table>

  <div data-editable="accommodation_details">{if accommodation.type}<p style="margin:8px 0 4px"><strong>Accommodation details</strong></p>
  <table style="width:100%;border-collapse:collapse;margin:0 0 8px">
    <tr><td style="padding:3px 0;border-bottom:1px solid #e5e4e0;width:180px"><strong>Type</strong></td><td style="padding:3px 0;border-bottom:1px solid #e5e4e0">{{accommodation.type}}</td></tr>
    <tr><td style="padding:3px 0;border-bottom:1px solid #e5e4e0"><strong>Start Date</strong></td><td style="padding:3px 0;border-bottom:1px solid #e5e4e0">{{accommodation.start_date}}</td></tr>
    <tr><td style="padding:3px 0;border-bottom:1px solid #e5e4e0"><strong>Finish Date</strong></td><td style="padding:3px 0;border-bottom:1px solid #e5e4e0">{{accommodation.end_date}}</td></tr>
    <tr><td style="padding:3px 0;border-bottom:1px solid #e5e4e0"><strong>Duration</strong></td><td style="padding:3px 0;border-bottom:1px solid #e5e4e0">{{accommodation.weeks}} weeks</td></tr>
    <tr><td style="padding:3px 0;border-bottom:1px solid #e5e4e0"><strong>Host Name</strong></td><td style="padding:3px 0;border-bottom:1px solid #e5e4e0">{{accommodation.host_name}}</td></tr>
    <tr><td style="padding:3px 0"><strong>Host Address</strong></td><td style="padding:3px 0">{{accommodation.host_address}}</td></tr>
  </table>{/if}</div>

  {if booking.is_academic_year}<div data-editable="insurance_details" style="margin-top:8px">
    <p style="margin:0 0 6px"><strong>Insurance details:</strong><br>ULearn has organised health insurance for {{student.salutation}} {{student.last_name}} in Ireland through Arachas Insurance. The school policy number is IAS 84420.</p>
    <p style="margin:0"><strong>Learner Protection:</strong><br>ULearn has partnered with Arachas Insurance to provide protection for its enrolled learners in line with the change in regulations that came into force on July 4, 2022. Our policy number is ECOAG15683.</p>
  </div>{/if}

  <p style="margin:10px 0 0">I wish to confirm that ULearn has the capacity to accommodate {{student.salutation}} {{student.last_name}} on a full-time basis in in-person lessons at our city-centre premises.</p>

  <p style="margin:8px 0 0">I may be contacted at 01-4751222 or 0851574801 for any confirmation of the details in this document that may be necessary.</p>

  ${SIGNOFF}

  <div style="margin-top:8px;font-size:10px;color:#9b9ea6">
    <p style="margin:0">Document: {{document.number}} &nbsp;|&nbsp; Version: {{document.version}} &nbsp;|&nbsp; Issued: {{document.issue_date}}</p>
  </div>
${FOOTER}`,
  },

  // Sent automatically when staff flips a Student's visaStatus from
  // Pending/InAppeal → Approved AND the booking's serviceStart sits within
  // the next 28 days. The +4-week shunt logic in scripts/students.ts pushes
  // the dates first; this email tells the student about the new arrival
  // date and asks for flight details.
  {
    name: 'Visa Approval — 4-Week Notice',
    slug: 'Visa-Approval-Notice',
    templateType: 'email',
    category: 'success/visa',
    documentType: 'success',
    requiresFullPayment: true,  // NB: email template — gate is doc-only today (see note)
    // Plain email body — no HEADER/SIGNOFF/FOOTER. The send pathway
    // (sendStudentEmail) appends signature.html, matching every other
    // email in the system. Inline images are not used here on purpose.
    htmlTemplate: `<div style="font-family:Verdana,sans-serif;font-size:13px;line-height:1.6;color:#1a1d23">
  <p>Dear {{student.first_name}},</p>

  <p><strong>Congratulations on your recent visa approval.</strong></p>

  <p>As you know, your provisional accommodation start date was <strong>{{booking.original_start_date}}</strong>, and ULearn requires a minimum of four weeks' notice in advance of arrival to arrange your accommodation.</p>

  <p>Visa processing times are out of our control, so we notify all students when their arrival date must be updated. Your earliest arrival date in Dublin is now:</p>

  <p style="text-align:center;font-size:18px;font-weight:700;margin:24px 0;padding:16px;background:#f3f4f6;border-radius:6px">{{booking.start_date}}</p>

  <p>If we have something available earlier we would be delighted to engage with you further — but otherwise please bear the new date of <strong>{{booking.start_date}}</strong> in mind, as it is just four weeks away.</p>

  <p>Please <strong>send us your flight plans</strong> as soon as you have them booked: flight number, arrival date and time, and whether you'd like us to arrange a collection from Dublin Airport.</p>

  <p>We are here to support you — do not hesitate to reach out with any questions.</p>
</div>`,
  },

  {
    name: 'ISD Confirmation',
    slug: 'ISD-Confirm',
    category: 'success',
    documentType: 'success',
    requiresFullPayment: true,
    htmlTemplate: `${HEADER}
  <p style="margin-bottom:8px">Student Number: {{student.id}}</p>

  <p style="margin-bottom:24px">To whom it may concern,</p>

  <p>This letter is to certify that {{student.salutation}} {{student.first_name}} {{student.last_name}} is a registered full time student with ULearn English Language School.</p>

  <p>{{student.salutation}} {{student.last_name}} has paid for {{student.pronoun_possessive}} course in full and is registered to study from {{booking.start_date}} until {{booking.end_date}}. {{student.pronoun_possessive_cap}} course consists of {{booking.hours_per_week}} hours per week.</p>

  <p>{{student.salutation}} {{student.last_name}} lives at the address listed above.</p>

  <p>Please contact us for any confirmation of the above which may be necessary.</p>

  ${SIGNOFF}
  ${DOC_META}
${FOOTER}`,
  },

  {
    name: 'Confirmation (General)',
    slug: 'Confirmation-General',
    category: 'success',
    documentType: 'success',
    requiresFullPayment: true,
    htmlTemplate: `${HEADER}
  <p style="margin-bottom:24px">To whom it may concern,</p>

  <p>This letter is to certify that {{student.salutation}} {{student.first_name}} {{student.last_name}} is a registered full time student with ULearn English Language School.</p>

  <p>{{student.salutation}} {{student.last_name}} has paid for {{student.pronoun_possessive}} course in full and is registered to study from {{booking.start_date}} until {{booking.end_date}}. {{student.pronoun_possessive_cap}} course consists of {{booking.hours_per_week}} hours per week and {{student.pronoun_subject}} is currently in a {{student.current_level}} class.</p>

  <div data-editable="additional_info">{{custom.additional_info}}</div>

  <p>Please contact us for any confirmation of the above which may be necessary.</p>

  ${SIGNOFF}
  ${DOC_META}
${FOOTER}`,
  },

  {
    name: 'Exit Letter',
    slug: 'Exit-Letter',
    category: 'class',
    documentType: 'class',
    htmlTemplate: `${HEADER}
  <p style="margin-bottom:8px">Programme: {{booking.course_name}}</p>

  <p style="margin-bottom:24px">To whom it may concern,</p>

  <p>This letter is to certify that {{student.salutation}} {{student.first_name}} {{student.last_name}} was a registered full time student with ULearn English Language School.</p>

  <p>{{student.salutation}} {{student.last_name}} paid for {{student.pronoun_possessive}} course in full and was registered to study from {{booking.start_date}} until {{booking.end_date}}. {{student.pronoun_possessive_cap}} course consisted of {{booking.hours_per_week}} hours per week and {{student.pronoun_subject}} ended it in a {{student.current_level}} class.</p>

  <p>{{student.salutation}} {{student.last_name}} completed {{student.pronoun_possessive}} {{booking.weeks}}-week course with an attendance rate of {{student.attendance_rate}}.</p>

  {if absences_list}
  <p style="margin-top:16px"><strong>Documented absences:</strong> The following absences were recorded during {{student.pronoun_possessive}} course, with reasons supplied by the student where given:</p>
  {{absences_list}}
  {/if}

  <div data-editable="exam_info">{{custom.exam_info}}</div>

  <p>{{student.salutation}} {{student.last_name}} lives at the address listed above.</p>

  <p>Please contact us for any confirmation of the above which may be necessary.</p>

  ${SIGNOFF}
  ${DOC_META}
${FOOTER}`,
  },

  {
    name: 'Holiday Letter',
    slug: 'Holiday-Letter',
    category: 'class',
    documentType: 'class',
    htmlTemplate: `${HEADER}
  <p style="margin-bottom:24px">To whom it may concern,</p>

  <p>This letter is to certify that {{student.salutation}} {{student.first_name}} {{student.last_name}} is a registered full time student with ULearn English Language School.</p>

  <p>{{student.salutation}} {{student.last_name}} has paid for {{student.pronoun_possessive}} course in full and is registered to study from {{booking.start_date}} until {{booking.end_date}}. {{student.pronoun_possessive_cap}} course consists of {{booking.hours_per_week}} hours per week in a {{student.current_level}} class.</p>

  <p>If {{student.pronoun_subject}} continues to fully attend the remaining weeks of {{student.pronoun_possessive}} course, {{student.pronoun_subject}} will finish with an expected attendance rate of {{student.attendance_rate}}.</p>

  <div data-editable="holiday_dates">{{custom.holiday_dates}}</div>

  <p>{{student.salutation}} {{student.last_name}} lives at the address listed above.</p>

  <p>Please contact us for any confirmation of the above which may be necessary.</p>

  ${SIGNOFF}
  ${DOC_META}
${FOOTER}`,
  },

  // ── ACCOMMODATION ────────────────────────────

  {
    name: 'Confirmation to Provider',
    slug: 'Confirm-Provider',
    category: 'accomm',
    documentType: 'accomm',
    htmlTemplate: `${HEADER}
  <p style="margin-bottom:24px">Dear {{accommodation.contact_name}},</p>

  <p>We confirm the following student information you have agreed to accommodate:</p>

  <h3 style="font-size:14px;margin:16px 0 8px">Personal Details</h3>
  <table style="width:100%;border-collapse:collapse">
    <tr><td style="padding:4px 0;width:160px;color:#6b7280">First name</td><td style="padding:4px 0">{{student.first_name}}</td></tr>
    <tr><td style="padding:4px 0;color:#6b7280">Last name</td><td style="padding:4px 0">{{student.last_name}}</td></tr>
    <tr><td style="padding:4px 0;color:#6b7280">Date of birth</td><td style="padding:4px 0">{{student.dob}}</td></tr>
    <tr><td style="padding:4px 0;color:#6b7280">Gender</td><td style="padding:4px 0">{{student.gender}}</td></tr>
    <tr><td style="padding:4px 0;color:#6b7280">Nationality</td><td style="padding:4px 0">{{student.nationality}}</td></tr>
  </table>

  <h3 style="font-size:14px;margin:16px 0 8px">Accommodation Dates</h3>
  <table style="width:100%;border-collapse:collapse">
    <tr><td style="padding:4px 0;width:160px;color:#6b7280">From</td><td style="padding:4px 0">{{accommodation.start_date}}</td></tr>
    <tr><td style="padding:4px 0;color:#6b7280">Until</td><td style="padding:4px 0">{{accommodation.end_date}}</td></tr>
    <tr><td style="padding:4px 0;color:#6b7280">Duration</td><td style="padding:4px 0">{{accommodation.weeks}} weeks</td></tr>
    <tr><td style="padding:4px 0;color:#6b7280">Room</td><td style="padding:4px 0">{{accommodation.room_type}}</td></tr>
    <tr><td style="padding:4px 0;color:#6b7280">Board</td><td style="padding:4px 0">{{accommodation.board}}</td></tr>
    <tr><td style="padding:4px 0;color:#6b7280">Allergies</td><td style="padding:4px 0">{{student.allergies}}</td></tr>
  </table>

  <p style="margin-top:20px">Thank you for providing accommodation to this student. If you need anything please feel free to contact us at any time.</p>

  ${DOC_META_SHORT}
${FOOTER}`,
  },

  {
    name: 'Accommodation Info to Student',
    slug: 'AccommInfo-Student',
    category: 'accomm',
    documentType: 'accomm',
    htmlTemplate: `${HEADER}
  <p style="margin-bottom:24px">Dear {{student.first_name}},</p>

  <p>Your accommodation details are as follows:</p>

  <table style="width:100%;border-collapse:collapse;margin:16px 0;border:1px solid #e5e4e0">
    <tr style="background:#2563eb"><td style="padding:8px 12px;color:#fff;width:200px">Address</td><td style="padding:8px 12px;color:#fff">{{accommodation.address}}</td></tr>
    <tr style="background:#2563eb"><td style="padding:8px 12px;color:#fff">Host name</td><td style="padding:8px 12px;color:#fff">{{accommodation.contact_name}}</td></tr>
    <tr style="background:#2563eb"><td style="padding:8px 12px;color:#fff">Host mobile</td><td style="padding:8px 12px;color:#fff">{{accommodation.phone}}</td></tr>
    <tr style="background:#2563eb"><td style="padding:8px 12px;color:#fff">Host email</td><td style="padding:8px 12px;color:#fff">{{accommodation.email}}</td></tr>
  </table>

  <table style="width:100%;border-collapse:collapse;margin:16px 0;border:1px solid #e5e4e0">
    <tr style="background:#059669"><td style="padding:8px 12px;color:#fff;width:200px">Stay begins</td><td style="padding:8px 12px;color:#fff">{{accommodation.start_date}}</td></tr>
    <tr style="background:#059669"><td style="padding:8px 12px;color:#fff">Stay ends</td><td style="padding:8px 12px;color:#fff">{{accommodation.end_date}}</td></tr>
  </table>

  <div data-editable="arrival_info">{{custom.arrival_info}}</div>

  <p>Dublin Airport has free wifi. Please connect to it when you're in the arrivals hall and call or send a text/WhatsApp message to your host so that they know you've arrived in Dublin.</p>

  <p>ULearn's emergency number over the weekend is +353851574801.</p>

  ${DOC_META_SHORT}
${FOOTER}`,
  },

  // ── FINANCIAL / AGENCY ──────────────────────
  {
    name: 'Agency Net Statement',
    slug: 'Agency-Net-Statement',
    category: 'accounts',
    documentType: 'accounts',
    htmlTemplate: `${HEADER}
  <p style="text-align:right;font-size:12px;color:#6b7280;margin-bottom:4px">Date: {{document.issue_date}}</p>

  <h2 style="font-size:16px;margin:0 0 20px;border-bottom:2px solid #1a1d23;padding-bottom:8px">Agency Net Statement</h2>

  <table style="width:100%;border-collapse:collapse;margin-bottom:20px">
    <tr><td style="padding:4px 0;width:130px;color:#6b7280;font-size:12px">Agency</td><td style="padding:4px 0;font-weight:600">{{agency.name}}</td></tr>
    <tr><td style="padding:4px 0;color:#6b7280;font-size:12px">Student</td><td style="padding:4px 0">{{student.first_name}} {{student.last_name}}</td></tr>
    <tr><td style="padding:4px 0;color:#6b7280;font-size:12px">Nationality</td><td style="padding:4px 0">{{student.nationality}}</td></tr>
    <tr><td style="padding:4px 0;color:#6b7280;font-size:12px">Course</td><td style="padding:4px 0">{{booking.course_name}}</td></tr>
    <tr><td style="padding:4px 0;color:#6b7280;font-size:12px">Dates</td><td style="padding:4px 0">{{booking.start_date}} — {{booking.end_date}}</td></tr>
    <tr><td style="padding:4px 0;color:#6b7280;font-size:12px">Duration</td><td style="padding:4px 0">{{booking.weeks}} weeks</td></tr>
  </table>

  <table style="width:100%;border-collapse:collapse;margin:20px 0">
    <thead>
      <tr style="border-bottom:2px solid #1a1d23">
        <th style="text-align:left;padding:8px 0;font-size:12px">Description</th>
        <th style="text-align:right;padding:8px 0;font-size:12px">Amount</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid #e5e4e0">Course Fee</td>
        <td style="padding:8px 0;border-bottom:1px solid #e5e4e0;text-align:right">{{booking.course_fee}}</td>
      </tr>
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid #e5e4e0;color:#059669">Less Agency Commission ({{agency.commission_rate}})</td>
        <td style="padding:8px 0;border-bottom:1px solid #e5e4e0;text-align:right;color:#059669">- {{booking.course_commission}}</td>
      </tr>
      <tr style="font-weight:700;font-size:15px">
        <td style="padding:12px 0">Net Payable</td>
        <td style="padding:12px 0;text-align:right">{{booking.course_net}}</td>
      </tr>
    </tbody>
  </table>

  <p style="font-size:11px;color:#9b9ea6;margin-top:30px">This is a presentation document only and does not constitute a tax invoice. The official invoice is issued via Xero.</p>

  ${DOC_META_SHORT}
${FOOTER}`,
  },

  {
    name: 'Receipt',
    slug: 'ULearn-Receipt',
    category: 'accounts',
    documentType: 'accounts',
    htmlTemplate: `${HEADER}
  <div style="display:flex;justify-content:space-between;align-items:flex-start;margin:4px 0 8px">
    <h2 style="font-size:20px;margin:0;letter-spacing:.02em">RECEIPT</h2>
    <div style="text-align:right;font-size:12px;color:#6b7280">
      <div>Invoice {{invoice.number}}</div>
      <div>{{invoice.date}}</div>
      <div style="margin-top:6px">{{invoice.status_badge}}</div>
    </div>
  </div>

  <table style="width:100%;border-collapse:collapse;margin:8px 0 18px">
    <tr><td style="padding:3px 0;width:120px;color:#6b7280;font-size:12px">Billed to</td><td style="padding:3px 0;font-weight:600">{{invoice.billed_to}}</td></tr>
    <tr><td style="padding:3px 0;color:#6b7280;font-size:12px">Nationality</td><td style="padding:3px 0">{{student.nationality}}</td></tr>
  </table>

  <table style="width:100%;border-collapse:collapse;margin:8px 0">
    <thead>
      <tr style="border-bottom:2px solid #1a1d23">
        <th style="text-align:left;padding:8px 0;font-size:12px">Description</th>
        <th style="text-align:right;padding:8px 0;font-size:12px">Amount</th>
      </tr>
    </thead>
    <tbody>
      {{invoice.line_items}}
      <tr style="font-weight:700;font-size:15px"><td style="padding:12px 0">Total</td><td style="padding:12px 0;text-align:right">{{invoice.gross}}</td></tr>
      {{invoice.settlement_rows}}
    </tbody>
  </table>

  ${DOC_META_SHORT}
${FOOTER}`,
  },
];

export async function seedDocumentTemplates(prisma: PrismaClient) {
  for (const t of templates) {
    const existing = await prisma.documentTemplate.findUnique({ where: { slug: t.slug } });
    if (existing) {
      // Only refresh htmlTemplate from source for templates that have NEVER been
      // hand-edited in the admin UI. updateTemplate() bumps `version` on every real
      // HTML change and the seed never touches version, so version > 1 means a human
      // owns this template — the boot re-seed must NOT clobber their edits. Without
      // this guard, every restart silently reverted LOA-NonEU-QR (and every other
      // seeded template) back to source, making UI edits look like they never saved.
      if ((existing.version ?? 1) <= 1) {
        await prisma.documentTemplate.update({ where: { slug: t.slug }, data: { htmlTemplate: t.htmlTemplate } });
        console.log(`[Seed] Refreshed from source: ${t.name}`);
      } else {
        console.log(`[Seed] Kept hand-edited template (v${existing.version}): ${t.name}`);
      }
    } else {
      await prisma.documentTemplate.create({ data: t });
      console.log(`[Seed] Created template: ${t.name}`);
    }
  }
}
