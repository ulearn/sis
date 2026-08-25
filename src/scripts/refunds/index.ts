import fs from 'fs';
import path from 'path';
import { PrismaClient } from '../../generated/prisma/client';
import { sendEmail, EmailAttachment } from '../email';
import { buildTmEmail } from './tm-template';

const STORAGE_ROOT =
  process.env.SIS_UPLOADS_ROOT ||
  path.join(__dirname, '..', '..', '..', 'uploads');

interface IntakePayload {
  drupal_submission_id?: number;
  drupal_submission_uuid?: string;
  student_name: string;
  student_email: string;
  nationality: string;
  territory: string;
  invoice_number: string;
  agent_name_if_applicable?: string;
  refund_reason: string;
  refund_reason_other?: string;
  amount_requested?: string | number;
  payment_processor: string;
  payment_processor_other?: string;
  payment_method: string;
  bank_type?: string;
  bank_country?: string;
  payee_name?: string;
  payee_address?: string;
  payee_address_2?: string;
  payee_country?: string;
  bic_swift?: string;
  nsc?: string;
  account_number?: string;
  bank_name?: string;
  bank_street_address?: string;
  bank_city?: string;
  correspondent_bank?: string;
  correspondent_swift?: string;
  other_information?: string;
}

export function refundScripts(prisma: PrismaClient) {
  // ── Intake from Drupal webhook ──────────────────────────
  async function intake(
    payload: IntakePayload,
    file: Express.Multer.File | undefined,
  ) {
    // Try to resolve student by email + invoice. Best-effort; row still
    // created if no match (status stays pending_review and accounts can
    // resolve manually on the review page).
    const student = await prisma.student.findFirst({
      where: { email: payload.student_email },
      orderBy: { createdAt: 'desc' },
      select: { id: true, bookings: { select: { id: true }, take: 1, orderBy: { createdAt: 'desc' } } },
    });
    const studentId = student?.id ?? null;
    const bookingId = student?.bookings?.[0]?.id ?? null;

    // File first — so we can store the doc id on the request row.
    let visaRefusalDocId: number | null = null;
    if (file && studentId) {
      const ext = path.extname(file.originalname) || '';
      const stamp = Date.now();
      const filename = `refund-${stamp}-${Math.random().toString(36).slice(2, 8)}${ext}`;
      const studentDir = path.join(STORAGE_ROOT, 'students', String(studentId), 'visa');
      fs.mkdirSync(studentDir, { recursive: true });
      const filePath = path.join(studentDir, filename);
      fs.writeFileSync(filePath, file.buffer);

      const doc = await prisma.studentDocument.create({
        data: {
          studentId,
          filename,
          originalName: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
          category: 'visa',
          uploadedBy: 'refund_request_webhook',
        },
      });
      visaRefusalDocId = doc.id;
    }

    const amountRequested = parseDecimal(payload.amount_requested);

    const row = await prisma.refundRequest.create({
      data: {
        studentId,
        bookingId,
        drupalSubmissionId: payload.drupal_submission_id ?? null,
        drupalSubmissionUuid: payload.drupal_submission_uuid ?? null,
        studentName: payload.student_name,
        studentEmail: payload.student_email,
        nationality: payload.nationality,
        territory: payload.territory,
        invoiceNumber: payload.invoice_number,
        agentName: payload.agent_name_if_applicable ?? null,
        refundReason: payload.refund_reason,
        refundReasonOther: payload.refund_reason_other ?? null,
        amountRequested: amountRequested ?? undefined,
        paymentProcessor: payload.payment_processor,
        paymentProcessorOther: payload.payment_processor_other ?? null,
        paymentMethod: payload.payment_method,
        bankType: payload.bank_type ?? null,
        bankCountry: payload.bank_country ?? null,
        payeeName: payload.payee_name ?? null,
        payeeAddress: payload.payee_address ?? null,
        payeeAddress2: payload.payee_address_2 ?? null,
        payeeCountry: payload.payee_country ?? null,
        bicSwift: payload.bic_swift ?? null,
        nsc: payload.nsc ?? null,
        accountNumber: payload.account_number ?? null,
        bankName: payload.bank_name ?? null,
        bankStreetAddress: payload.bank_street_address ?? null,
        bankCity: payload.bank_city ?? null,
        correspondentBank: payload.correspondent_bank ?? null,
        correspondentSwift: payload.correspondent_swift ?? null,
        otherInformation: payload.other_information ?? null,
        visaRefusalDocId,
      },
    });

    // Fire-and-forget notifications.
    notifyAccounts(row.id, payload).catch((e) =>
      console.error('[refunds.intake.notifyAccounts]', e),
    );
    sendStudentConfirmation(payload).catch((e) =>
      console.error('[refunds.intake.studentConfirmation]', e),
    );

    return row;
  }

  // ── List / get / update ────────────────────────────────
  async function list(filters: {
    status?: string;
    territory?: string;
    reason?: string;
    fromDate?: string;
    toDate?: string;
  }) {
    const where: any = {};
    if (filters.status && filters.status !== 'all') where.status = filters.status;
    if (filters.territory) where.territory = filters.territory;
    if (filters.reason) where.refundReason = filters.reason;
    if (filters.fromDate || filters.toDate) {
      where.createdAt = {};
      if (filters.fromDate) where.createdAt.gte = new Date(filters.fromDate);
      if (filters.toDate) where.createdAt.lte = new Date(filters.toDate);
    }
    return prisma.refundRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { student: { select: { id: true, firstName: true, lastName: true, email: true } } },
    });
  }

  async function get(id: number) {
    const row = await prisma.refundRequest.findUnique({
      where: { id },
      include: {
        student: true,
        booking: true,
        approvedBy: { select: { id: true, displayName: true, username: true } },
      },
    });
    if (!row) return null;

    // Resolve the TM transaction(s) for context.
    let payments: any[] = [];
    if (row.bookingId) {
      payments = await prisma.payment.findMany({
        where: { bookingId: row.bookingId },
        orderBy: { paymentDate: 'desc' },
      });
    }
    return { ...row, payments };
  }

  async function update(id: number, data: any) {
    return prisma.refundRequest.update({ where: { id }, data });
  }

  // ── Approve / reject ───────────────────────────────────
  async function approve(id: number, userId: number) {
    const row = await prisma.refundRequest.findUnique({
      where: { id },
      include: { student: true, booking: true },
    });
    if (!row) throw new Error('Refund request not found');
    if (row.status === 'sent_to_tm') {
      return { ok: true, already: true, refund: row };
    }

    // Locate the TM transaction (best-effort: most recent TransferMate
    // payment on the booking).
    let tmTransactionId: string | null = null;
    let originalAmount: string | null = null;
    if (row.bookingId) {
      const payment = await prisma.payment.findFirst({
        where: { bookingId: row.bookingId, method: 'TransferMate' },
        orderBy: { paymentDate: 'desc' },
      });
      if (payment) {
        tmTransactionId = payment.transactionId ?? null;
        originalAmount = payment.amount.toString();
      }
    }

    // Build the email.
    const refundAmount = originalAmount
      ? (parseFloat(originalAmount) - parseFloat(row.feeDeductionEur.toString())).toFixed(2)
      : null;

    const emailBody = buildTmEmail({
      student: {
        firstName: row.student?.firstName ?? row.studentName.split(' ')[0],
        lastName: row.student?.lastName ?? row.studentName.split(' ').slice(1).join(' '),
        id: row.studentId,
      },
      tmTransactionId: tmTransactionId ?? '(not resolved — please provide manually)',
      originalAmount: originalAmount ?? '(see attached invoice)',
      feeDeductionEur: row.feeDeductionEur.toString(),
      feeBreakdown: row.feeBreakdown,
      refundAmount: refundAmount ?? '(to be calculated by TM)',
    });

    const attachments: EmailAttachment[] = [];
    if (row.visaRefusalDocId) {
      const doc = await prisma.studentDocument.findUnique({ where: { id: row.visaRefusalDocId } });
      if (doc && row.studentId) {
        const filePath = path.join(STORAGE_ROOT, 'students', String(row.studentId), 'visa', doc.filename);
        if (fs.existsSync(filePath)) {
          attachments.push({
            filename: doc.originalName,
            content: fs.readFileSync(filePath),
            contentType: doc.mimeType,
          });
        }
      }
    }

    const now = new Date();
    const updated = await prisma.refundRequest.update({
      where: { id },
      data: {
        status: 'approved',
        approvedById: userId,
        approvedAt: now,
      },
    });

    await sendEmail({
      from: 'accounts@ulearnschool.com',
      to: 'refunds@transfermate.com',
      cc: 'accounts@ulearnschool.com',
      subject: `Refund Request — ${row.studentName} — TM Tx ${tmTransactionId ?? 'unresolved'}`,
      html: emailBody.html,
      attachments,
    });

    await prisma.refundRequest.update({
      where: { id },
      data: { status: 'sent_to_tm', sentToTmAt: new Date() },
    });

    return { ok: true, refund: { ...updated, status: 'sent_to_tm', sentToTmAt: new Date() }, emailPreview: emailBody };
  }

  async function reject(id: number, userId: number, reason: string) {
    const row = await prisma.refundRequest.update({
      where: { id },
      data: {
        status: 'rejected',
        approvedById: userId,
        rejectedAt: new Date(),
        rejectReason: reason,
      },
    });
    // Notify the student.
    try {
      await sendEmail({
        from: 'accounts@ulearnschool.com',
        to: row.studentEmail,
        subject: 'About your ULearn refund request',
        html: `<p>Hi ${row.studentName},</p>
<p>Thanks for your refund request. Unfortunately we cannot proceed at this time. Reason:</p>
<blockquote>${escapeHtml(reason)}</blockquote>
<p>If you'd like to discuss, please reply to this email.</p>
<p>Best,<br>ULearn Accounts</p>`,
      });
    } catch (e) {
      console.error('[refunds.reject.studentEmail]', e);
    }
    return row;
  }

  async function batchApprove(ids: number[], userId: number) {
    const results: Array<{ id: number; ok: boolean; error?: string }> = [];
    for (const id of ids) {
      try {
        await approve(id, userId);
        results.push({ id, ok: true });
      } catch (e: any) {
        results.push({ id, ok: false, error: String(e?.message ?? e) });
      }
    }
    return { results };
  }

  // ── File proxy ─────────────────────────────────────────
  async function getRefusalLetterStream(id: number) {
    const row = await prisma.refundRequest.findUnique({ where: { id } });
    if (!row?.visaRefusalDocId || !row.studentId) return null;
    const doc = await prisma.studentDocument.findUnique({ where: { id: row.visaRefusalDocId } });
    if (!doc) return null;
    const filePath = path.join(STORAGE_ROOT, 'students', String(row.studentId), 'visa', doc.filename);
    if (!fs.existsSync(filePath)) return null;
    return {
      filename: doc.originalName,
      mimeType: doc.mimeType,
      stream: fs.createReadStream(filePath),
    };
  }

  // ── Helpers ────────────────────────────────────────────
  async function notifyAccounts(refundId: number, payload: IntakePayload) {
    const html = `<p>New refund request received.</p>
<ul>
  <li><strong>Student:</strong> ${escapeHtml(payload.student_name)} &lt;${escapeHtml(payload.student_email)}&gt;</li>
  <li><strong>Nationality:</strong> ${escapeHtml(payload.nationality)} (${escapeHtml(payload.territory)})</li>
  <li><strong>Invoice:</strong> ${escapeHtml(payload.invoice_number)}</li>
  <li><strong>Reason:</strong> ${escapeHtml(payload.refund_reason)}${
    payload.refund_reason_other ? ' — ' + escapeHtml(payload.refund_reason_other) : ''
  }</li>
  <li><strong>Amount:</strong> €${payload.amount_requested ?? '(not stated)'}</li>
</ul>
<p><a href="https://sis.ulearnschool.com/sis/refunds/${refundId}">Review in SIS →</a></p>`;
    await sendEmail({
      from: 'accounts@ulearnschool.com',
      to: 'accounts@ulearnschool.com',
      subject: `Refund request #${refundId} — ${payload.student_name}`,
      html,
    });
  }

  async function sendStudentConfirmation(payload: IntakePayload) {
    const html = `<p>Hi ${escapeHtml(payload.student_name)},</p>
<p>Thanks — we've received your refund request and our accounts team will review it shortly. You'll hear back from us by email.</p>
<p>If anything is urgent, just reply to this message.</p>
<p>Best,<br>ULearn Accounts</p>`;
    await sendEmail({
      from: 'accounts@ulearnschool.com',
      to: payload.student_email,
      subject: 'We received your ULearn refund request',
      html,
    });
  }

  function parseDecimal(v: string | number | undefined): string | undefined {
    if (v === undefined || v === null || v === '') return undefined;
    const n = typeof v === 'number' ? v : parseFloat(String(v).replace(/[^0-9.\-]/g, ''));
    if (Number.isNaN(n)) return undefined;
    return n.toFixed(2);
  }

  function escapeHtml(s: string): string {
    return s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  return {
    intake,
    list,
    get,
    update,
    approve,
    reject,
    batchApprove,
    getRefusalLetterStream,
  };
}
