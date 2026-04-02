import { PrismaClient } from '../generated/prisma/client';

/**
 * Seed document templates converted from Fidelo.
 * Fidelo uses {single_braces}, we use {{double.braces}}.
 * Fidelo conditionals {if x}...{/if} are converted to editable blocks.
 * Gender-conditional pronouns are replaced with {{student.pronoun_*}} tokens.
 */

const templates = [
  // ── SUCCESS / VISA ──────────────────────────────
  {
    name: 'LOA Non-EU (QR)',
    slug: 'LOA-NonEU-QR',
    category: 'success',
    documentType: 'success',
    htmlTemplate: `<div style="max-width:700px;margin:0 auto;font-family:Verdana,sans-serif;font-size:14px;line-height:1.7;color:#1a1d23">
  <div style="text-align:center;margin-bottom:30px">
    <h1 style="font-size:20px;font-weight:700;margin:0">ULearn English Language School</h1>
    <p style="color:#6b7280;font-size:12px;margin:4px 0">Dublin, Ireland</p>
  </div>

  <p style="margin-bottom:16px">To Whom It May Concern,</p>

  <p>This letter is a secure document. To confirm the recipient &amp; holder is a genuine ULearn Student please scan the QR code below with the camera on your phone.</p>
  <ul>
    <li>Please pay close attention to the <strong>exact URL</strong> you see</li>
    <li>The URL must <strong><u>exactly match</u></strong>: {{document.verification_url}}</li>
    <li>You will also see the student's name &amp; details mirrored on that page</li>
  </ul>

  <p style="text-align:center"><strong>PLEASE NOW SCAN THIS QR CODE WITH YOUR PHONE TO CHECK THE AUTHENTICITY OF THIS DOCUMENT</strong><br>{{document.qr}}</p>

  <p>{{student.salutation}} {{student.first_name}} {{student.last_name}} has paid ULearn English School {{booking.amount_total}} to reserve the following:</p>

  <table style="width:100%;border-collapse:collapse;margin:16px 0">
    <tr><td style="padding:6px 0;border-bottom:1px solid #e5e4e0;width:180px"><strong>Student Name</strong></td><td style="padding:6px 0;border-bottom:1px solid #e5e4e0">{{student.first_name}} {{student.last_name}}</td></tr>
    <tr><td style="padding:6px 0;border-bottom:1px solid #e5e4e0"><strong>Student Number</strong></td><td style="padding:6px 0;border-bottom:1px solid #e5e4e0">{{student.id}}</td></tr>
    <tr><td style="padding:6px 0;border-bottom:1px solid #e5e4e0"><strong>Nationality</strong></td><td style="padding:6px 0;border-bottom:1px solid #e5e4e0">{{student.nationality}}</td></tr>
    <tr><td style="padding:6px 0;border-bottom:1px solid #e5e4e0"><strong>Date of Birth</strong></td><td style="padding:6px 0;border-bottom:1px solid #e5e4e0">{{student.dob}}</td></tr>
    <tr><td style="padding:6px 0;border-bottom:1px solid #e5e4e0"><strong>Passport Number</strong></td><td style="padding:6px 0;border-bottom:1px solid #e5e4e0">{{student.passport_number}}</td></tr>
    <tr><td style="padding:6px 0;border-bottom:1px solid #e5e4e0"><strong>Course Title &amp; Level</strong></td><td style="padding:6px 0;border-bottom:1px solid #e5e4e0">{{booking.course_name}} {{booking.course_level}}</td></tr>
    <tr><td style="padding:6px 0;border-bottom:1px solid #e5e4e0"><strong>Duration</strong></td><td style="padding:6px 0;border-bottom:1px solid #e5e4e0">{{booking.weeks}} weeks</td></tr>
    <tr><td style="padding:6px 0;border-bottom:1px solid #e5e4e0"><strong>Hours per Week</strong></td><td style="padding:6px 0;border-bottom:1px solid #e5e4e0">{{booking.hours_per_week}}</td></tr>
    <tr><td style="padding:6px 0;border-bottom:1px solid #e5e4e0"><strong>Start Date</strong></td><td style="padding:6px 0;border-bottom:1px solid #e5e4e0">{{booking.start_date}}</td></tr>
    <tr><td style="padding:6px 0"><strong>Finish Date</strong></td><td style="padding:6px 0">{{booking.end_date}}</td></tr>
  </table>

  <div data-editable="accommodation_details">{{custom.accommodation_details}}</div>

  <div data-editable="insurance_details">
    <p><strong>Insurance details:</strong><br>ULearn has organised health insurance for {{student.salutation}} {{student.last_name}} in Ireland through Arachas Insurance. The school policy number is IAS 84420.</p>
    <p><strong>Learner Protection:</strong><br>ULearn has partnered with Arachas Insurance to provide protection for its enrolled learners in line with the change in regulations that came into force on July 4, 2022. Our policy number is ECOAG15683.</p>
  </div>

  <p>I wish to confirm that ULearn has the capacity to accommodate {{student.salutation}} {{student.last_name}} on a full-time basis in in-person lessons at our city-centre premises.</p>

  <p>I may be contacted at 01-4751222 or 0851574801 for any confirmation of the details in this document that may be necessary.</p>

  <div style="margin-top:40px">
    <p style="margin:0"><strong>Authorised Signatory</strong></p>
    <p style="margin:0;color:#6b7280;font-size:13px">ULearn English Language School</p>
  </div>

  <div style="margin-top:30px;display:flex;justify-content:space-between;align-items:flex-end">
    <div style="font-size:11px;color:#9b9ea6">
      <p style="margin:0">Document: {{document.number}}</p>
      <p style="margin:0">Version: {{document.version}}</p>
      <p style="margin:0">Issued: {{document.issue_date}}</p>
    </div>
    <div>{{document.qr}}</div>
  </div>
</div>`,
  },

  {
    name: 'ISD Confirmation',
    slug: 'ISD-Confirm',
    category: 'success',
    documentType: 'success',
    htmlTemplate: `<div style="max-width:700px;margin:0 auto;font-family:Verdana,sans-serif;font-size:14px;line-height:1.7;color:#1a1d23">
  <div style="text-align:center;margin-bottom:30px">
    <h1 style="font-size:20px;font-weight:700;margin:0">ULearn English Language School</h1>
    <p style="color:#6b7280;font-size:12px;margin:4px 0">Dublin, Ireland</p>
  </div>

  <p>Student Number: {{student.id}}</p>

  <p style="margin-bottom:16px">To whom it may concern,</p>

  <p>This letter is to certify that {{student.salutation}} {{student.first_name}} {{student.last_name}} is a registered full time student with ULearn English Language School.</p>

  <p>{{student.salutation}} {{student.last_name}} has paid for {{student.pronoun_possessive}} course in full and is registered to study from {{booking.start_date}} until {{booking.end_date}}. {{student.pronoun_possessive_cap}} course consists of {{booking.hours_per_week}} hours per week.</p>

  <p>{{student.salutation}} {{student.last_name}} lives at the address listed above.</p>

  <p>Please contact us for any confirmation of the above which may be necessary.</p>

  <p style="margin-top:30px">Yours faithfully,</p>
  <div style="margin-top:40px">
    <p style="margin:0"><strong>Authorised Signatory</strong></p>
    <p style="margin:0;color:#6b7280;font-size:13px">ULearn English Language School</p>
  </div>

  <div style="margin-top:30px;font-size:11px;color:#9b9ea6">
    <p style="margin:0">Document: {{document.number}} | Version: {{document.version}} | Issued: {{document.issue_date}}</p>
  </div>
</div>`,
  },

  {
    name: 'Confirmation (General)',
    slug: 'Confirmation-General',
    category: 'success',
    documentType: 'success',
    htmlTemplate: `<div style="max-width:700px;margin:0 auto;font-family:Verdana,sans-serif;font-size:14px;line-height:1.7;color:#1a1d23">
  <div style="text-align:center;margin-bottom:30px">
    <h1 style="font-size:20px;font-weight:700;margin:0">ULearn English Language School</h1>
    <p style="color:#6b7280;font-size:12px;margin:4px 0">Dublin, Ireland</p>
  </div>

  <p style="margin-bottom:16px">To whom it may concern,</p>

  <p>This letter is to certify that {{student.salutation}} {{student.first_name}} {{student.last_name}} is a registered full time student with ULearn English Language School.</p>

  <p>{{student.salutation}} {{student.last_name}} has paid for {{student.pronoun_possessive}} course in full and is registered to study from {{booking.start_date}} until {{booking.end_date}}. {{student.pronoun_possessive_cap}} course consists of {{booking.hours_per_week}} hours per week and {{student.pronoun_subject}} is currently in a {{student.current_level}} class.</p>

  <div data-editable="additional_info">{{custom.additional_info}}</div>

  <p>Please contact us for any confirmation of the above which may be necessary.</p>

  <p style="margin-top:30px">Yours faithfully,</p>
  <div style="margin-top:40px">
    <p style="margin:0"><strong>Authorised Signatory</strong></p>
    <p style="margin:0;color:#6b7280;font-size:13px">ULearn English Language School</p>
  </div>

  <div style="margin-top:30px;font-size:11px;color:#9b9ea6">
    <p style="margin:0">Document: {{document.number}} | Version: {{document.version}} | Issued: {{document.issue_date}}</p>
  </div>
</div>`,
  },

  {
    name: 'Exit Letter',
    slug: 'Exit-Letter',
    category: 'academic',
    documentType: 'academic',
    htmlTemplate: `<div style="max-width:700px;margin:0 auto;font-family:Verdana,sans-serif;font-size:14px;line-height:1.7;color:#1a1d23">
  <div style="text-align:center;margin-bottom:30px">
    <h1 style="font-size:20px;font-weight:700;margin:0">ULearn English Language School</h1>
    <p style="color:#6b7280;font-size:12px;margin:4px 0">Dublin, Ireland</p>
  </div>

  <p>Programme: {{booking.course_name}}</p>

  <p style="margin-bottom:16px">To whom it may concern,</p>

  <p>This letter is to certify that {{student.salutation}} {{student.first_name}} {{student.last_name}} was a registered full time student with ULearn English Language School.</p>

  <p>{{student.salutation}} {{student.last_name}} paid for {{student.pronoun_possessive}} course in full and was registered to study from {{booking.start_date}} until {{booking.end_date}}. {{student.pronoun_possessive_cap}} course consisted of {{booking.hours_per_week}} hours per week and {{student.pronoun_subject}} ended it in a {{student.current_level}} class.</p>

  <p>{{student.salutation}} {{student.last_name}} completed {{student.pronoun_possessive}} {{booking.weeks}}-week course with an attendance rate of {{student.attendance_rate}}.</p>

  <div data-editable="exam_info">{{custom.exam_info}}</div>

  <p>{{student.salutation}} {{student.last_name}} lives at the address listed above.</p>

  <p>Please contact us for any confirmation of the above which may be necessary.</p>

  <p style="margin-top:30px">Yours faithfully,</p>
  <div style="margin-top:40px">
    <p style="margin:0"><strong>Authorised Signatory</strong></p>
    <p style="margin:0;color:#6b7280;font-size:13px">ULearn English Language School</p>
  </div>

  <div style="margin-top:30px;font-size:11px;color:#9b9ea6">
    <p style="margin:0">Document: {{document.number}} | Version: {{document.version}} | Issued: {{document.issue_date}}</p>
  </div>
</div>`,
  },

  {
    name: 'Holiday Letter',
    slug: 'Holiday-Letter',
    category: 'academic',
    documentType: 'academic',
    htmlTemplate: `<div style="max-width:700px;margin:0 auto;font-family:Verdana,sans-serif;font-size:14px;line-height:1.7;color:#1a1d23">
  <div style="text-align:center;margin-bottom:30px">
    <h1 style="font-size:20px;font-weight:700;margin:0">ULearn English Language School</h1>
    <p style="color:#6b7280;font-size:12px;margin:4px 0">Dublin, Ireland</p>
  </div>

  <p style="margin-bottom:16px">To whom it may concern,</p>

  <p>This letter is to certify that {{student.salutation}} {{student.first_name}} {{student.last_name}} is a registered full time student with ULearn English Language School.</p>

  <p>{{student.salutation}} {{student.last_name}} has paid for {{student.pronoun_possessive}} course in full and is registered to study from {{booking.start_date}} until {{booking.end_date}}. {{student.pronoun_possessive_cap}} course consists of {{booking.hours_per_week}} hours per week in a {{student.current_level}} class.</p>

  <p>If {{student.pronoun_subject}} continues to fully attend the remaining weeks of {{student.pronoun_possessive}} course, {{student.pronoun_subject}} will finish with an expected attendance rate of {{student.attendance_rate}}.</p>

  <div data-editable="holiday_dates">{{custom.holiday_dates}}</div>

  <p>{{student.salutation}} {{student.last_name}} lives at the address listed above.</p>

  <p>Please contact us for any confirmation of the above which may be necessary.</p>

  <p style="margin-top:30px">Yours faithfully,</p>
  <div style="margin-top:40px">
    <p style="margin:0"><strong>Authorised Signatory</strong></p>
    <p style="margin:0;color:#6b7280;font-size:13px">ULearn English Language School</p>
  </div>

  <div style="margin-top:30px;font-size:11px;color:#9b9ea6">
    <p style="margin:0">Document: {{document.number}} | Version: {{document.version}} | Issued: {{document.issue_date}}</p>
  </div>
</div>`,
  },

  // ── ACCOMMODATION ────────────────────────────

  {
    name: 'Confirmation to Provider',
    slug: 'Confirm-Provider',
    category: 'accomm',
    documentType: 'accomm',
    htmlTemplate: `<div style="max-width:700px;margin:0 auto;font-family:Verdana,sans-serif;font-size:14px;line-height:1.7;color:#1a1d23">
  <div style="text-align:center;margin-bottom:30px">
    <h1 style="font-size:20px;font-weight:700;margin:0">ULearn English Language School</h1>
    <p style="color:#6b7280;font-size:12px;margin:4px 0">Dublin, Ireland</p>
  </div>

  <p style="margin-bottom:16px">Dear {{accommodation.contact_name}},</p>

  <p>We confirm the following student information you have agreed to accommodate:</p>

  <h3 style="font-size:15px;margin:16px 0 8px">Personal Details</h3>
  <table style="width:100%;border-collapse:collapse">
    <tr><td style="padding:4px 0;width:160px;color:#6b7280">First name</td><td style="padding:4px 0">{{student.first_name}}</td></tr>
    <tr><td style="padding:4px 0;color:#6b7280">Last name</td><td style="padding:4px 0">{{student.last_name}}</td></tr>
    <tr><td style="padding:4px 0;color:#6b7280">Date of birth</td><td style="padding:4px 0">{{student.dob}}</td></tr>
    <tr><td style="padding:4px 0;color:#6b7280">Gender</td><td style="padding:4px 0">{{student.gender}}</td></tr>
    <tr><td style="padding:4px 0;color:#6b7280">Nationality</td><td style="padding:4px 0">{{student.nationality}}</td></tr>
  </table>

  <h3 style="font-size:15px;margin:16px 0 8px">Accommodation Dates</h3>
  <table style="width:100%;border-collapse:collapse">
    <tr><td style="padding:4px 0;width:160px;color:#6b7280">From</td><td style="padding:4px 0">{{accommodation.start_date}}</td></tr>
    <tr><td style="padding:4px 0;color:#6b7280">Until</td><td style="padding:4px 0">{{accommodation.end_date}}</td></tr>
    <tr><td style="padding:4px 0;color:#6b7280">Duration</td><td style="padding:4px 0">{{accommodation.weeks}} weeks</td></tr>
    <tr><td style="padding:4px 0;color:#6b7280">Room</td><td style="padding:4px 0">{{accommodation.room_type}}</td></tr>
    <tr><td style="padding:4px 0;color:#6b7280">Board</td><td style="padding:4px 0">{{accommodation.board}}</td></tr>
    <tr><td style="padding:4px 0;color:#6b7280">Allergies</td><td style="padding:4px 0">{{student.allergies}}</td></tr>
  </table>

  <p style="margin-top:20px">Thank you for providing accommodation to this student. If you need anything please feel free to contact us at any time.</p>

  <div style="margin-top:30px;font-size:11px;color:#9b9ea6">
    <p style="margin:0">Document: {{document.number}} | Issued: {{document.issue_date}}</p>
  </div>
</div>`,
  },

  {
    name: 'Accommodation Info to Student',
    slug: 'AccommInfo-Student',
    category: 'accomm',
    documentType: 'accomm',
    htmlTemplate: `<div style="max-width:700px;margin:0 auto;font-family:Verdana,sans-serif;font-size:14px;line-height:1.7;color:#1a1d23">
  <div style="text-align:center;margin-bottom:30px">
    <h1 style="font-size:20px;font-weight:700;margin:0">ULearn English Language School</h1>
    <p style="color:#6b7280;font-size:12px;margin:4px 0">Dublin, Ireland</p>
  </div>

  <p style="margin-bottom:16px">Dear {{student.first_name}},</p>

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

  <div style="margin-top:30px;font-size:11px;color:#9b9ea6">
    <p style="margin:0">Document: {{document.number}} | Issued: {{document.issue_date}}</p>
  </div>
</div>`,
  },
];

export async function seedDocumentTemplates(prisma: PrismaClient) {
  for (const t of templates) {
    const existing = await prisma.documentTemplate.findUnique({ where: { slug: t.slug } });
    if (!existing) {
      await prisma.documentTemplate.create({ data: t });
      console.log(`[Seed] Created template: ${t.name}`);
    }
  }
}
