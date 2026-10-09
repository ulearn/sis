import fs from 'fs';
import path from 'path';
import { PrismaClient } from '../../generated/prisma/client';
import { sendEmail, EmailAttachment } from '../email';
import { renderEmailTemplate } from '../render-template';
import { buildTmEmail } from './tm-template';
import { getAuthedXero } from '../xero';
import { TERRITORY_MAP } from '../booking-deal';

const STORAGE_ROOT =
  process.env.SIS_UPLOADS_ROOT ||
  path.join(__dirname, '..', '..', '..', 'uploads');

// Note-line formatters: UK date (DD/MM/YYYY) + € amounts (drop .00 on whole euros).
const _pad2 = (n: number) => String(n).padStart(2, '0');
const ukDate = (d: Date) => `${_pad2(d.getDate())}/${_pad2(d.getMonth() + 1)}/${d.getFullYear()}`;
const eur = (n: any) => '€' + (Number(n) % 1 === 0 ? Number(n).toFixed(0) : Number(n).toFixed(2));

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
  // Staff can add a letter to a legacy/manual request as well as receiving one
  // from the Drupal webhook. Keep it in the same private student/visa store so
  // the review UI, the preview endpoint and the TM attachment all use one link.
  // Attach ONE OR MORE files to a refund. Each is stored in the student's visa
  // folder as a StudentDocument linked to the refund (refundId) — ALL of them are
  // attached to the TransferMate notify email. The first file also becomes the
  // primary visa-refusal letter (drives the visa-refusal approval gate) if none set.
  async function attachRefusalLetter(id: number, files: Express.Multer.File[] | Express.Multer.File | undefined, uploadedBy?: string | null) {
    const list = (Array.isArray(files) ? files : files ? [files] : []).filter(Boolean) as Express.Multer.File[];
    if (!list.length) throw new Error('Choose at least one file to upload');
    const row = await prisma.refundRequest.findUnique({
      where: { id }, select: { studentId: true, refundReason: true, visaRefusalDocId: true },
    });
    if (!row) throw new Error('Refund request not found');
    if (!row.studentId) throw new Error('Link this refund to an SIS student before uploading files');

    const studentDir = path.join(STORAGE_ROOT, 'students', String(row.studentId), 'visa');
    fs.mkdirSync(studentDir, { recursive: true });
    const created: any[] = [];
    for (const file of list) {
      const ext = path.extname(file.originalname) || '';
      const filename = `refund-${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
      fs.writeFileSync(path.join(studentDir, filename), file.buffer);
      const doc = await prisma.studentDocument.create({
        data: {
          studentId: row.studentId, filename, originalName: file.originalname,
          mimeType: file.mimetype, size: file.size, category: 'visa',
          uploadedBy: uploadedBy || 'refund_review_upload', refundId: id,
        } as any,
      });
      created.push(doc);
    }
    if (!row.visaRefusalDocId && created.length) {
      await prisma.refundRequest.update({ where: { id }, data: { visaRefusalDocId: created[0].id } });
    }
    return created;
  }

  // List a refund's attached files (StudentDocuments linked via refundId, plus the
  // primary visaRefusalDocId if it predates the refundId link).
  async function listRefundFiles(id: number) {
    const row = await prisma.refundRequest.findUnique({ where: { id }, select: { visaRefusalDocId: true } });
    const docs = await prisma.studentDocument.findMany({
      where: { OR: [{ refundId: id }, { id: row?.visaRefusalDocId ?? -1 }] },
      orderBy: { id: 'asc' },
      select: { id: true, originalName: true, mimeType: true, size: true, createdAt: true },
    });
    return docs;
  }

  // Delete one attached file. If it was the primary refusal letter, repoint that to
  // another attached file (or clear it).
  async function deleteRefundFile(id: number, docId: number) {
    const row = await prisma.refundRequest.findUnique({ where: { id }, select: { studentId: true, visaRefusalDocId: true } });
    if (!row) throw new Error('Refund request not found');
    const doc = await prisma.studentDocument.findUnique({ where: { id: docId } });
    if (doc && row.studentId) {
      try { fs.unlinkSync(path.join(STORAGE_ROOT, 'students', String(row.studentId), 'visa', doc.filename)); } catch { /* already gone */ }
      await prisma.studentDocument.delete({ where: { id: docId } });
    }
    if (row.visaRefusalDocId === docId) {
      const next = await prisma.studentDocument.findFirst({ where: { refundId: id }, orderBy: { id: 'asc' }, select: { id: true } });
      await prisma.refundRequest.update({ where: { id }, data: { visaRefusalDocId: next?.id ?? null } });
    }
    return { ok: true };
  }

  // Stream a specific attached file by document id (for the in-app viewer/download).
  async function getRefundFileStream(docId: number) {
    const doc = await prisma.studentDocument.findUnique({ where: { id: docId } });
    if (!doc) return null;
    const filePath = path.join(STORAGE_ROOT, 'students', String(doc.studentId), 'visa', doc.filename);
    if (!fs.existsSync(filePath)) return null;
    return { path: filePath, mimeType: doc.mimeType, originalName: doc.originalName };
  }

  async function removeRefusalLetter(id: number) {
    const row = await prisma.refundRequest.findUnique({
      where: { id }, select: { studentId: true, visaRefusalDocId: true },
    });
    if (!row) throw new Error('Refund request not found');
    if (!row.visaRefusalDocId || !row.studentId) return;
    const doc = await prisma.studentDocument.findUnique({ where: { id: row.visaRefusalDocId } });

    // First unlink the request so a partially missing old file can never leave
    // the refund incorrectly appearing to have evidence on file.
    await prisma.refundRequest.update({ where: { id }, data: { visaRefusalDocId: null } });
    if (!doc) return;
    const filePath = path.join(STORAGE_ROOT, 'students', String(row.studentId), 'visa', doc.filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    await prisma.studentDocument.delete({ where: { id: doc.id } });
  }

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
        drupalSubmissionId: payload.drupal_submission_id != null && String(payload.drupal_submission_id).trim() !== ''
          ? parseInt(String(payload.drupal_submission_id), 10)
          : null,
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
    bookingId?: string | number;
  }) {
    const where: any = {};
    // status accepts one OR several (comma-separated) values from the combinable pills.
    const statuses = (filters.status || '').split(',').map(s => s.trim()).filter(Boolean).filter(s => s !== 'all');
    if (statuses.length) where.status = { in: statuses };
    if (filters.bookingId != null && String(filters.bookingId).trim() !== '') where.bookingId = parseInt(String(filters.bookingId), 10);
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
        booking: { include: { courses: { select: { name: true, category: true, startDate: true, endDate: true } } } },
        approvedBy: { select: { id: true, displayName: true, username: true } },
      },
    });
    if (!row) return null;

    const visaRefusalDoc = row.visaRefusalDocId
      ? await prisma.studentDocument.findUnique({
          where: { id: row.visaRefusalDocId },
          select: { id: true, filename: true, originalName: true, mimeType: true, size: true, category: true },
        })
      : null;

    // Resolve the TM transaction(s) for context.
    let payments: any[] = [];
    if (row.bookingId) {
      payments = await prisma.payment.findMany({
        where: { bookingId: row.bookingId },
        orderBy: { paymentDate: 'desc' },
      });
    }
    const refundFiles = await listRefundFiles(id);
    return { ...row, payments, visaRefusalDoc, refundFiles };
  }

  async function update(id: number, data: any) {
    // Linking a booking: backfill studentId from the booking when the refund has
    // none and the caller didn't set one explicitly — so a manually-linked case
    // also gains its student record (and the student's refund list picks it up).
    if ('bookingId' in data && data.bookingId != null && !('studentId' in data)) {
      const cur = await prisma.refundRequest.findUnique({ where: { id }, select: { studentId: true } });
      if (cur && cur.studentId == null) {
        const b = await prisma.booking.findUnique({ where: { id: data.bookingId }, select: { studentId: true } });
        if (b?.studentId != null) data.studentId = b.studentId;
      }
    }
    return prisma.refundRequest.update({ where: { id }, data });
  }

  // ── Manual create ──────────────────────────────────────
  // Staff-created refund (no webform). Prefills identity from the linked booking
  // (student/agency/nationality) so the common path — "this Cancelled booking
  // needs a refund" — is one click from the booking. All fields stay editable on
  // the detail page. Territory is derived from nationality; the money fields start
  // sensible (full paid amount, zero retained fee) and are corrected on approval.
  async function create(input: any) {
    const bookingId = input.bookingId != null && String(input.bookingId).trim() !== '' ? parseInt(String(input.bookingId), 10) : null;
    let studentId = input.studentId != null && String(input.studentId).trim() !== '' ? parseInt(String(input.studentId), 10) : null;
    const pf: any = {};
    if (bookingId) {
      const b = await prisma.booking.findUnique({ where: { id: bookingId }, include: { student: true, agency: true } });
      if (b) {
        studentId = studentId ?? b.studentId ?? null;
        const s = b.student;
        pf.studentName = s ? `${s.firstName || ''} ${s.lastName || ''}`.trim() : '';
        pf.studentEmail = s?.email || '';
        pf.nationality = s?.nationality || '';
        pf.agentName = b.agency?.name || null;
        pf.invoiceNumber = (b as any).hubspotInvoiceId || '';
        pf.amountRequested = b.amountPaid != null ? String(b.amountPaid) : undefined;
      }
    }
    const pick = (v: any, fallback: any) => (v != null && String(v).trim() !== '' ? v : fallback);
    const nationality = pick(input.nationality, pf.nationality) || '';
    const territory = pick(input.territory, TERRITORY_MAP[nationality]) || 'Unsupported Territory';
    const amt = pick(input.amountRequested, pf.amountRequested);

    return prisma.refundRequest.create({
      data: {
        studentId,
        bookingId,
        studentName: pick(input.studentName, pf.studentName) || 'Unknown',
        studentEmail: pick(input.studentEmail, pf.studentEmail) || '',
        nationality,
        territory,
        invoiceNumber: pick(input.invoiceNumber, pf.invoiceNumber) || '',
        agentName: pick(input.agentName, pf.agentName) || null,
        refundReason: input.refundReason || 'visa_refusal',
        refundReasonOther: input.refundReasonOther ?? null,
        amountRequested: amt != null ? String(amt) : undefined,
        paymentProcessor: input.paymentProcessor || 'Manual (staff-created)',
        paymentMethod: input.paymentMethod || 'Manual',
        feeDeductionEur: pick(input.feeDeductionEur, '0'),
        escrowHeld: typeof input.escrowHeld === 'string' ? /^(true|yes|1)$/i.test(input.escrowHeld) : !!input.escrowHeld,
        status: input.status || 'Pending',
        notes: input.notes ?? null,
      },
    });
  }

  // Reasons where the refund ENDS the enrolment → cancel the SIS booking. Visa
  // refusal + cancellation reverse the sale; a Service Issue does NOT (the school
  // failed but the student continues), and Other is left to staff. Called from
  // both approve lanes after the money instruction is dispatched. Idempotent.
  const REFUND_CANCELS_BOOKING = ['visa_refusal', 'cancellation'];
  async function cancelBookingForRefund(row: { id: number; bookingId: number | null; refundReason: string }) {
    if (!row.bookingId || !REFUND_CANCELS_BOOKING.includes(row.refundReason)) return;
    const b = await prisma.booking.findUnique({ where: { id: row.bookingId }, select: { status: true } });
    if (!b || b.status === 'CANCELLED') return;
    await prisma.$transaction(async (tx) => {
      if (b.status) {
        await tx.bookingStatusHistory.create({
          data: { bookingId: row.bookingId!, fromStatus: b.status as any, toStatus: 'CANCELLED' as any, changedBy: `refund #${row.id} (${row.refundReason})` },
        });
      }
      await tx.booking.update({ where: { id: row.bookingId! }, data: { status: 'CANCELLED' as any } });
    });
  }

  // HubSpot deal treatment for a sale-reversing refund. Visa/cancellation move the
  // deal → Recycle (closedlost) and stamp closed_lost_reason; visa also flips
  // escrow "Yes" → "No" (released, refused outcome). Service Issue / Other are NOT
  // here — the deal stays WON. Best-effort: HubSpot failure never blocks the refund.
  const REFUND_LOST_REASON: Record<string, string> = { visa_refusal: 'Visa Refusal', cancellation: 'cancellation' };
  async function moveHubspotDealToLostForRefund(row: { refundReason: string; bookingId: number | null }) {
    const reason = REFUND_LOST_REASON[row.refundReason];
    if (!reason || !row.bookingId) return;
    const tok = process.env.ACCESS_TOKEN;
    if (!tok) return;
    const booking = await prisma.booking.findUnique({ where: { id: row.bookingId }, select: { hubspotDealId: true } });
    const dealId = booking?.hubspotDealId;
    if (!dealId) return;
    const H = { Authorization: `Bearer ${tok}`, 'Content-Type': 'application/json' };
    try {
      // Resolve the pipeline-specific closed-lost stage.
      const dRes = await fetch(`https://api.hubapi.com/crm/v3/objects/deals/${dealId}?properties=pipeline`, { headers: H });
      const deal: any = await dRes.json();
      const pipelineId = deal?.properties?.pipeline;
      let lostStage = 'closedlost';
      if (pipelineId) {
        const pRes = await fetch(`https://api.hubapi.com/crm/v3/pipelines/deals/${pipelineId}`, { headers: H });
        const pipe: any = await pRes.json();
        const lost = (pipe.stages || []).find((s: any) => s.metadata && String(s.metadata.isClosed) === 'true' && Number(s.metadata.probability) === 0);
        if (lost) lostStage = lost.id;
      }
      const props: any = { dealstage: lostStage, closed_lost_reason: reason };
      if (row.refundReason === 'visa_refusal') props.escrow = 'No';
      await fetch(`https://api.hubapi.com/crm/v3/objects/deals/${dealId}`, { method: 'PATCH', headers: H, body: JSON.stringify({ properties: props }) });
    } catch (e: any) {
      console.warn('[refunds] HubSpot deal→lost failed for deal', dealId, ':', e?.message || e);
    }
  }

  // ── Approve / reject ───────────────────────────────────
  async function approve(id: number, userId: number, amountOverride?: any, overrides?: { subject?: string; bodyText?: string }) {
    const row = await prisma.refundRequest.findUnique({
      where: { id },
      include: { student: true, booking: true },
    });
    if (!row) throw new Error('Refund request not found');
    // Partial-aware, mirroring approveToXero: each call notifies TransferMate for
    // the tranche amount and RECORDS it (Refunded total + Notes + status). No
    // sent_to_tm early-return — the over-refund cap below stops once fully
    // refunded. This is the escrow lane: the "connection" is the notify email;
    // SIS just tracks it. (Neil, 2026-09-21)

    // A refusal is the evidence for this refund route. Do this on the server,
    // rather than merely hiding the button in the UI, so neither approval lane
    // can release money without a readable official letter.
    if (row.refundReason === 'visa_refusal') {
      const doc = row.visaRefusalDocId
        ? await prisma.studentDocument.findUnique({ where: { id: row.visaRefusalDocId } })
        : null;
      const filePath = doc && row.studentId
        ? path.join(STORAGE_ROOT, 'students', String(row.studentId), 'visa', doc.filename)
        : null;
      if (!doc || !filePath || !fs.existsSync(filePath)) {
        throw new Error('An official visa refusal letter is required before this refund can be approved');
      }
    }

    // Tranche amount + over-refund cap (remaining = requested − fee − already-refunded).
    const requestedEur = row.amountRequested != null ? Number(row.amountRequested) : NaN;
    const feeEur = Number(row.feeDeductionEur || 0);
    const alreadyRefunded = Number(row.amountRefunded || 0);
    const remainingEur = !isNaN(requestedEur) ? Math.round((requestedEur - feeEur - alreadyRefunded) * 100) / 100 : NaN;
    const amount = amountOverride != null && String(amountOverride).trim() !== ''
      ? parseFloat(String(amountOverride))
      : (!isNaN(remainingEur) ? remainingEur : NaN);
    if (!(amount > 0)) throw new Error('Enter a valid refund amount (> 0) before notifying TransferMate');
    if (!isNaN(requestedEur) && amount > remainingEur + 0.01) {
      throw new Error(`That's €${amount.toFixed(2)} but only €${remainingEur.toFixed(2)} remains to refund (requested €${requestedEur.toFixed(2)} − fees €${feeEur.toFixed(2)} − already refunded €${alreadyRefunded.toFixed(2)}).`);
    }

    // We do NOT output a TM reference: the stored transactionId is our Fidelo/
    // internal ref, NOT TransferMate's, so it's left BLANK — TM locates the escrow
    // by student name + email + amount. We DO surface the original (escrow) amount
    // from the TransferMate/escrow payment. Future: source the real TM ref from the
    // hub fins/ TransferMate API once legacy Fidelo txns flush out (Neil 2026-10-09).
    let originalAmount: string | null = null;
    if (row.bookingId) {
      const payment = await prisma.payment.findFirst({
        where: { bookingId: row.bookingId, OR: [{ method: { contains: 'TransferMate', mode: 'insensitive' } }, { type: 'Escrow' }] },
        orderBy: { paymentDate: 'desc' },
      });
      if (payment) originalAmount = payment.amount.toString();
    }

    // Build the email — tell TM the tranche amount to refund now.
    const refundAmount = amount.toFixed(2);

    const emailBody = buildTmEmail({
      student: {
        firstName: row.student?.firstName ?? row.studentName.split(' ')[0],
        lastName: row.student?.lastName ?? row.studentName.split(' ').slice(1).join(' '),
        id: row.studentId,
        email: row.student?.email ?? row.studentEmail ?? null,
      },
      tmTransactionId: null,
      originalAmount: originalAmount ?? '(see attached invoice)',
      feeDeductionEur: row.feeDeductionEur.toString(),
      feeBreakdown: row.feeBreakdown,
      refundAmount,
    });

    // Attach ALL files linked to this refund (refundId) + the primary refusal
    // letter — TM requests the supporting documents.
    const attachments: EmailAttachment[] = [];
    if (row.studentId) {
      const docs = await prisma.studentDocument.findMany({ where: { OR: [{ refundId: id }, { id: row.visaRefusalDocId ?? -1 }] }, orderBy: { id: 'asc' } });
      const seen = new Set<number>();
      for (const doc of docs) {
        if (seen.has(doc.id)) continue; seen.add(doc.id);
        const filePath = path.join(STORAGE_ROOT, 'students', String(row.studentId), 'visa', doc.filename);
        if (fs.existsSync(filePath)) {
          attachments.push({ filename: doc.originalName, content: fs.readFileSync(filePath), contentType: doc.mimeType });
        }
      }
    }

    // Live-edit + send: if the admin edited the email in the preview overlay, send
    // THAT text verbatim (no save step); otherwise send the generated email.
    const escHtml = (s: string) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const subjectToSend = (overrides?.subject && overrides.subject.trim())
      ? overrides.subject.trim()
      : `Refund Request — ${row.studentName}${alreadyRefunded > 0 ? ' (further tranche)' : ''}`;
    const htmlToSend = (overrides?.bodyText && overrides.bodyText.trim())
      ? `<div style="font-family:Arial,sans-serif;font-size:14px;white-space:pre-wrap">${escHtml(overrides.bodyText)}</div>`
      : emailBody.html;
    await sendEmail({
      from: 'accounts@ulearnschool.com',
      to: 'refunds@transfermate.com',
      cc: 'accounts@ulearnschool.com',
      subject: subjectToSend,
      html: htmlToSend,
      attachments,
    });

    // Notifying TM is NOT payment. Record the request in Notes but DON'T touch
    // Refunded/status — the money isn't out until TM actually processes the escrow
    // refund (no TM API to confirm it), so Accounts marks it paid by editing the
    // "Already Refunded" field when TM confirms. Keeps the owed amount honest. (Neil, 2026-09-22)
    const now = new Date();
    const isFirstTranche = alreadyRefunded === 0;
    const tmNote = `${ukDate(now)} - Notified TransferMate | ${eur(feeEur)} retained fees & Balance to Student ${eur(amount)}`;
    const newNotes = (row.notes && row.notes.trim() ? row.notes.replace(/\s+$/, '') + '\n' : '') + tmNote;
    const updated = await prisma.refundRequest.update({
      where: { id },
      data: {
        approvedById: userId,
        approvedAt: row.approvedAt ?? now,
        sentToTmAt: now,
        notes: newNotes,
        // amountRefunded + status intentionally UNCHANGED: money hasn't gone out.
      },
    });

    if (isFirstTranche) {
      await cancelBookingForRefund(row);
      await moveHubspotDealToLostForRefund(row);
    }
    return { ok: true, notified: true, amount, refund: updated, emailPreview: emailBody };
  }

  // Read-only PRE-FLIGHT for the Notify-TM email: builds the EXACT email `approve`
  // would send (same resolve + buildTmEmail), lists the attachments, and returns
  // warnings (missing letter / unresolved TM Tx / unresolved original amount /
  // bad amount) WITHOUT sending or recording anything. Drives the admin preview
  // overlay so staff see precisely what goes out before clicking Send. (Neil 2026-10-09)
  async function tmPreview(id: number, amountOverride?: any) {
    const row = await prisma.refundRequest.findUnique({ where: { id }, include: { student: true, booking: true } });
    if (!row) throw new Error('Refund request not found');
    const warnings: string[] = [];

    // Letter gate (reported, not thrown — the overlay disables Send instead).
    let letterOk = true;
    if (row.refundReason === 'visa_refusal') {
      const doc = row.visaRefusalDocId ? await prisma.studentDocument.findUnique({ where: { id: row.visaRefusalDocId } }) : null;
      const filePath = doc && row.studentId ? path.join(STORAGE_ROOT, 'students', String(row.studentId), 'visa', doc.filename) : null;
      letterOk = !!(doc && filePath && fs.existsSync(filePath));
      if (!letterOk) warnings.push('No official visa-refusal letter on file — Notify TM is blocked until the letter is attached.');
    }

    const requestedEur = row.amountRequested != null ? Number(row.amountRequested) : NaN;
    const feeEur = Number(row.feeDeductionEur || 0);
    const alreadyRefunded = Number(row.amountRefunded || 0);
    const remainingEur = !isNaN(requestedEur) ? Math.round((requestedEur - feeEur - alreadyRefunded) * 100) / 100 : NaN;
    const amount = amountOverride != null && String(amountOverride).trim() !== '' ? parseFloat(String(amountOverride)) : (!isNaN(remainingEur) ? remainingEur : NaN);
    let amountOk = amount > 0;
    if (!amountOk) warnings.push('Enter a valid refund amount (greater than 0).');
    if (!isNaN(requestedEur) && amount > remainingEur + 0.01) { amountOk = false; warnings.push(`Amount €${amount.toFixed(2)} exceeds the €${remainingEur.toFixed(2)} remaining (requested €${requestedEur.toFixed(2)} − fees €${feeEur.toFixed(2)} − already refunded €${alreadyRefunded.toFixed(2)}).`); }

    let originalAmount: string | null = null;
    if (row.bookingId) {
      const payment = await prisma.payment.findFirst({
        where: { bookingId: row.bookingId, OR: [{ method: { contains: 'TransferMate', mode: 'insensitive' } }, { type: 'Escrow' }] },
        orderBy: { paymentDate: 'desc' },
      });
      if (payment) originalAmount = payment.amount.toString();
    }
    // TM reference deliberately blank (we don't hold TM's ref); TM matches on name +
    // email + amount. Only warn if we couldn't source the amount either.
    if (!originalAmount) warnings.push('Amount not found on the booking — add it to the email body so TM can match by name + email + amount.');

    const emailBody = buildTmEmail({
      student: { firstName: row.student?.firstName ?? row.studentName.split(' ')[0], lastName: row.student?.lastName ?? row.studentName.split(' ').slice(1).join(' '), id: row.studentId, email: row.student?.email ?? row.studentEmail ?? null },
      tmTransactionId: null,
      originalAmount: originalAmount ?? '(see attached invoice)',
      feeDeductionEur: row.feeDeductionEur.toString(),
      feeBreakdown: row.feeBreakdown,
      refundAmount: (isNaN(amount) ? 0 : amount).toFixed(2),
    });

    const attachments: { originalName: string; mimeType: string; size: number }[] = [];
    if (row.studentId) {
      const docs = await prisma.studentDocument.findMany({ where: { OR: [{ refundId: id }, { id: row.visaRefusalDocId ?? -1 }] }, orderBy: { id: 'asc' }, select: { id: true, originalName: true, mimeType: true, size: true, filename: true } });
      const seen = new Set<number>();
      for (const doc of docs) {
        if (seen.has(doc.id)) continue; seen.add(doc.id);
        const fp = path.join(STORAGE_ROOT, 'students', String(row.studentId), 'visa', doc.filename);
        if (fs.existsSync(fp)) attachments.push({ originalName: doc.originalName, mimeType: doc.mimeType, size: doc.size });
      }
    }

    const subject = `Refund Request — ${row.studentName}${alreadyRefunded > 0 ? ' (further tranche)' : ''}`;
    return {
      ok: true,
      amount: isNaN(amount) ? null : amount,
      remaining: isNaN(remainingEur) ? null : remainingEur,
      feeEur,
      alreadyRefunded,
      to: 'refunds@transfermate.com',
      cc: 'accounts@ulearnschool.com',
      subject,
      emailHtml: emailBody.html,
      emailText: emailBody.text,
      attachments,
      warnings,
      canSend: letterOk && amountOk,
    };
  }

  // Xero (bank-transfer) refund lane. Creates a DRAFT ACCPAY Bill for the
  // approved amount, booked to 100 – General Course Sales, payable to the bank
  // details on file — mirrors the host-payments Bill flow. Accounts reviews the
  // draft in Xero and pays it. Used for non-escrow refunds (cancellation /
  // service issue / other). Amount is the admin-approved figure, never the
  // student's raw request unless the admin left it unchanged.
  async function approveToXero(id: number, userId: number, amountOverride?: any) {
    const row = await prisma.refundRequest.findUnique({ where: { id }, include: { student: true } });
    if (!row) throw new Error('Refund request not found');
    // Sending a Bill is NOT payment. Each call raises ONE Xero Bill, recorded as
    // SUBMITTED (unpaid). It does NOT count toward Refunded or reduce the booking
    // until PAID in Xero (syncRefundXeroBill flips it). So only ONE unpaid Bill at
    // a time — pay/void the current one before raising the next tranche. (Neil, 2026-09-22)
    if (row.xeroBillStatus === 'submitted' && row.xeroBillId) {
      throw new Error(`A Xero Bill (${row.xeroBillNumber || 'unpaid'}) is already awaiting payment — Refresh it once paid, or Delete it, before sending another.`);
    }

    // NOTE: unlike the TM/escrow lane, the Xero (bank) lane does NOT hard-require a
    // visa-refusal letter — sending to Xero is at Accounts' discretion (Neil,
    // 2026-09-21). The letter requirement stays on the TM lane (TM needs it attached).

    const amount = amountOverride != null && String(amountOverride).trim() !== ''
      ? parseFloat(String(amountOverride))
      : (row.approvedAmountEur != null ? Number(row.approvedAmountEur)
         : row.amountRequested != null ? Number(row.amountRequested) : NaN);
    if (!(amount > 0)) throw new Error('Enter a valid refund amount (> 0) before sending to Xero');

    // Cap a tranche at what's left to refund = requested − fees − already-refunded.
    const requestedEur = row.amountRequested != null ? Number(row.amountRequested) : amount;
    const feeEur = Number(row.feeDeductionEur || 0);
    const alreadyRefunded = Number(row.amountRefunded || 0);
    const remainingEur = Math.round((requestedEur - feeEur - alreadyRefunded) * 100) / 100;
    if (row.amountRequested != null && amount > remainingEur + 0.01) {
      throw new Error(`That's €${amount.toFixed(2)} but only €${remainingEur.toFixed(2)} remains to refund (requested €${requestedEur.toFixed(2)} − fees €${feeEur.toFixed(2)} − already refunded €${alreadyRefunded.toFixed(2)}).`);
    }

    const payeeName = (row.payeeName || row.studentName || '').trim();
    if (!payeeName) throw new Error('No payee name on the request');
    const acctNumber = row.accountNumber || null;

    const { xero, tenantId } = await getAuthedXero();

    // Resolve / create the Xero contact for the payee, carrying their bank details.
    let contactId: string | null = null;
    try {
      const safe = payeeName.replace(/"/g, '\\"');
      const byName = await xero.accountingApi.getContacts(tenantId, undefined, `Name=="${safe}"`);
      const m = byName.body.contacts || [];
      if (m.length === 1) contactId = m[0].contactID || null;
    } catch { /* fall through */ }
    if (!contactId && row.studentEmail) {
      try {
        const byEmail = await xero.accountingApi.getContacts(tenantId, undefined, `EmailAddress=="${row.studentEmail}"`);
        contactId = byEmail.body.contacts?.[0]?.contactID || null;
      } catch { /* fall through */ }
    }
    if (!contactId) {
      const created = await xero.accountingApi.createContacts(tenantId, { contacts: [{
        name: payeeName,
        emailAddress: row.studentEmail || undefined,
        bankAccountDetails: acctNumber || undefined,
      }] });
      contactId = created.body.contacts?.[0]?.contactID || null;
      if (!contactId) throw new Error('Could not create Xero contact for payee');
    } else if (acctNumber) {
      try { await xero.accountingApi.updateContact(tenantId, contactId, { contacts: [{ contactID: contactId, bankAccountDetails: acctNumber }] }); } catch { /* best-effort */ }
    }

    const today = new Date();
    const due = new Date(today); due.setDate(due.getDate() + 7);
    const reasonLabel = ({ visa_refusal: 'Visa refusal', cancellation: 'Cancellation', service_issue: 'Service issue', other: 'Other' } as Record<string, string>)[row.refundReason] || row.refundReason;
    const reference = `Refund ${row.invoiceNumber || ('#' + row.id)}`;
    // Unique Bill code per tranche: RFV- (visa refusal) / RFC- (course refund).
    // Own sequence per prefix, started at 1000 (see DDL) so we never collide with
    // legacy Bill numbers. RFA- (accommodation) is reserved — no refund reason maps
    // to it yet. (Neil, 2026-09-21)
    const billPrefix = row.refundReason === 'visa_refusal' ? 'RFV' : 'RFC';
    const seqName = billPrefix === 'RFV' ? 'refund_seq_rfv' : 'refund_seq_rfc';
    const seqRow: any = await prisma.$queryRawUnsafe(`SELECT nextval('${seqName}')::int AS n`);
    const billCode = `${billPrefix}-${String(seqRow?.[0]?.n ?? 1000).padStart(4, '0')}`;

    let xeroBillId: string | undefined;
    try {
      const bill = await xero.accountingApi.createInvoices(tenantId, { invoices: [{
        type: 'ACCPAY' as any,
        invoiceNumber: billCode,
        contact: { contactID: contactId },
        date: today.toISOString().slice(0, 10),
        dueDate: due.toISOString().slice(0, 10),
        reference,
        // SUBMITTED = "Awaiting Approval" in Xero: created + visible in the pay
        // queue, but NOT yet authorised/paid — you/Diana approve + process the
        // real payment there. Mirrors the host-payments Bill flow.
        status: 'SUBMITTED' as any,
        lineItems: [{
          description: `Refund — ${reasonLabel} — ${row.studentName} (${row.invoiceNumber})`,
          quantity: 1,
          unitAmount: Math.round(amount * 100) / 100,
          accountCode: '100',
        }],
        lineAmountTypes: 'NoTax' as any,
      }] });
      xeroBillId = bill.body.invoices?.[0]?.invoiceID || undefined;
    } catch (e: any) {
      const detail = e.response?.body?.Message || e.body?.Message || e.message;
      throw new Error('Xero bill creation failed: ' + detail);
    }

    const now = new Date();
    // SUBMITTED = sent, UNPAID. Does NOT touch Refunded / status / booking balance
    // until the Bill is paid in Xero (syncRefundXeroBill does that). The owed amount
    // keeps showing until then. Notes records the sent Bill.
    const xeroNote = `${ukDate(now)} - Sent Xero Bill ${billCode} | ${eur(feeEur)} retained fees & Balance to Student ${eur(amount)} (awaiting payment)`;
    const newNotes = (row.notes && row.notes.trim() ? row.notes.replace(/\s+$/, '') + '\n' : '') + xeroNote;

    const updated = await prisma.refundRequest.update({ where: { id }, data: {
      approvedById: userId,
      approvedAt: row.approvedAt ?? now,
      sentToXeroAt: now,
      xeroBillId: xeroBillId ?? null,
      xeroBillNumber: billCode,
      xeroBillAmount: amount,
      xeroBillStatus: 'submitted',        // sent, UNPAID — not counted as refunded yet
      notes: newNotes,
      // amountRefunded + status intentionally UNCHANGED: money hasn't gone out.
    } });

    // The refund decision is made once the Bill is raised → cancel the booking +
    // move the HubSpot deal to Lost (both idempotent). The booking's refund PAYMENT
    // is created later, when the Bill is paid (syncRefundXeroBill).
    await cancelBookingForRefund(row);
    await moveHubspotDealToLostForRefund(row);
    return { ok: true, xeroBillId, billCode, amount, billStatus: 'submitted', refund: updated };
  }

  // Sync a refund's Xero Bill status FROM Xero. When the Bill is PAID, THAT is when
  // the refund actually counts: += amountRefunded, write the negative booking
  // refund Payment, recompute status. When VOIDED/DELETED in Xero, clear the pending
  // Bill here. Mirrors host-payments syncXeroBillStatuses. (Neil, 2026-09-22)
  async function syncRefundXeroBill(id: number) {
    const row = await prisma.refundRequest.findUnique({ where: { id } });
    if (!row) throw new Error('Refund request not found');
    if (!row.xeroBillId) throw new Error('No Xero Bill linked');
    if (row.xeroBillStatus === 'paid') return { ok: true, billStatus: 'paid', already: true };

    const { xero, tenantId } = await getAuthedXero();
    let inv: any;
    try {
      const r = await xero.accountingApi.getInvoice(tenantId, row.xeroBillId);
      inv = r.body.invoices?.[0];
    } catch (e: any) {
      const detail = e.response?.body?.Message || e.body?.Message || e.message || '';
      if (/not (found|exist)|cannot be found|does not exist/i.test(detail)) {
        // Gone in Xero → treat as voided; clear the pending Bill (nothing was counted).
        await prisma.refundRequest.update({ where: { id }, data: { xeroBillStatus: 'voided' } });
        return { ok: true, billStatus: 'voided', note: 'Bill no longer exists in Xero' };
      }
      throw new Error('Xero read failed: ' + detail);
    }
    const status = String(inv?.status || '').toUpperCase();
    const now = new Date();

    if (status === 'PAID') {
      const amt = row.xeroBillAmount != null ? Number(row.xeroBillAmount) : Number(inv.total || 0);
      const newRefunded = Math.round((Number(row.amountRefunded || 0) + amt) * 100) / 100;
      const requestedEur = row.amountRequested != null ? Number(row.amountRequested) : NaN;
      const feeEur = Number(row.feeDeductionEur || 0);
      const newBalance = !isNaN(requestedEur) ? Math.round((requestedEur - feeEur - newRefunded) * 100) / 100 : null;
      const newStatus = !isNaN(requestedEur) ? (newBalance! <= 0.01 ? 'Paid' : (newRefunded > 0 ? 'Partial' : 'Pending')) : row.status;
      const paidAt = inv.fullyPaidOnDate ? new Date(inv.fullyPaidOnDate) : now;
      const note = `${ukDate(paidAt)} - Xero Bill ${row.xeroBillNumber || ''} PAID | ${eur(amt)} to Student`;
      const newNotes = (row.notes && row.notes.trim() ? row.notes.replace(/\s+$/, '') + '\n' : '') + note;
      await prisma.refundRequest.update({ where: { id }, data: {
        xeroBillStatus: 'paid', xeroBillPaidAt: paidAt,
        amountRefunded: newRefunded, status: newStatus, notes: newNotes,
      } });
      // NOW the money is out → record it against the booking.
      if (row.bookingId && row.xeroBillNumber) {
        try {
          await prisma.payment.create({ data: {
            bookingId: row.bookingId, amount: -Math.abs(amt), method: 'Xero Refund', type: 'refund',
            paymentDate: paidAt, comment: `Refund #${id} · ${row.xeroBillNumber} · paid via Xero`,
            paidBy: 'refund-module', dataSource: 'MANUAL',
          } as any });
          await rerollBooking(row.bookingId);
        } catch (e: any) { console.error('[refund paid→booking]', e?.message || e); }
      }
      return { ok: true, billStatus: 'paid', refundedTotal: newRefunded, balance: newBalance, status: newStatus };
    }

    if (status === 'VOIDED' || status === 'DELETED') {
      await prisma.refundRequest.update({ where: { id }, data: { xeroBillStatus: 'voided' } });
      return { ok: true, billStatus: 'voided' };
    }
    // SUBMITTED / AUTHORISED / DRAFT — still awaiting payment.
    return { ok: true, billStatus: 'submitted', xeroStatus: status };
  }

  // Re-roll a booking's amountPaid/amountOpen from its non-escrow Payment rows.
  async function rerollBooking(bookingId: number) {
    const pays = await prisma.payment.findMany({ where: { bookingId }, select: { amount: true, method: true, type: true } });
    const realPaid = pays.reduce((s, p) => { const m = (p.method || '').toLowerCase(); const t = (p.type || '').toLowerCase(); return (t === 'escrow' || m === 'transfermate escrow') ? s : s + Number(p.amount); }, 0);
    const bk = await prisma.booking.findUnique({ where: { id: bookingId }, select: { amountTotal: true } });
    const total = bk?.amountTotal != null ? Number(bk.amountTotal) : null;
    await prisma.booking.update({ where: { id: bookingId }, data: { amountPaid: realPaid, amountOpen: total != null ? Math.round((total - realPaid) * 100) / 100 : null } as any });
  }

  // Update the existing Xero refund Bill in place — re-push contact + line from the
  // CURRENT refund state (fixes a Bill after editing payee/bank details). Mirrors
  // host-payments updateBillInXero. (Neil, 2026-09-21)
  async function updateRefundXeroBill(id: number) {
    const row = await prisma.refundRequest.findUnique({ where: { id } });
    if (!row) throw new Error('Refund request not found');
    if (!row.xeroBillId) throw new Error('No Xero Bill linked — send to Xero first');
    const amount = row.xeroBillAmount != null ? Number(row.xeroBillAmount)
      : (row.approvedAmountEur != null ? Number(row.approvedAmountEur) : NaN);
    if (!(amount > 0)) throw new Error('No Bill amount on file to update');

    const { xero, tenantId } = await getAuthedXero();
    const payeeName = (row.payeeName || row.studentName || '').trim();
    const acctNumber = row.accountNumber || null;
    let contactId: string | null = null;
    try {
      const safe = payeeName.replace(/"/g, '\\"');
      const byName = await xero.accountingApi.getContacts(tenantId, undefined, `Name=="${safe}"`);
      if ((byName.body.contacts || []).length === 1) contactId = byName.body.contacts![0].contactID || null;
    } catch { /* fall through */ }
    if (!contactId && row.studentEmail) {
      try { const byEmail = await xero.accountingApi.getContacts(tenantId, undefined, `EmailAddress=="${row.studentEmail}"`); contactId = byEmail.body.contacts?.[0]?.contactID || null; } catch { /* */ }
    }
    if (!contactId) {
      const created = await xero.accountingApi.createContacts(tenantId, { contacts: [{ name: payeeName, emailAddress: row.studentEmail || undefined, bankAccountDetails: acctNumber || undefined }] });
      contactId = created.body.contacts?.[0]?.contactID || null;
    } else if (acctNumber) {
      try { await xero.accountingApi.updateContact(tenantId, contactId, { contacts: [{ contactID: contactId, bankAccountDetails: acctNumber }] }); } catch { /* */ }
    }
    if (!contactId) throw new Error('Could not resolve a Xero contact for the payee');

    const reasonLabel = ({ visa_refusal: 'Visa refusal', cancellation: 'Cancellation', service_issue: 'Service issue', other: 'Other' } as Record<string, string>)[row.refundReason] || row.refundReason;
    try {
      await xero.accountingApi.updateInvoice(tenantId, row.xeroBillId, { invoices: [{
        invoiceID: row.xeroBillId,
        invoiceNumber: row.xeroBillNumber || undefined,
        contact: { contactID: contactId } as any,
        reference: `Refund ${row.invoiceNumber || ('#' + row.id)}`,
        lineItems: [{ description: `Refund — ${reasonLabel} — ${row.studentName} (${row.invoiceNumber})`, quantity: 1, unitAmount: Math.round(amount * 100) / 100, accountCode: '100' }],
        lineAmountTypes: 'NoTax' as any,
      }] });
    } catch (e: any) {
      const detail = e.response?.body?.Message || e.body?.Message || e.message;
      throw new Error('Xero update failed: ' + detail);
    }
    return { ok: true, xeroBillId: row.xeroBillId, billCode: row.xeroBillNumber, message: `Bill ${row.xeroBillNumber} updated in Xero` };
  }

  // Void the latest Xero refund Bill AND reverse its tranche locally: unlink the
  // Bill, decrement the Refunded total, delete the booking's refund Payment, roll
  // the booking balance back, recompute status. Mirrors host-payments
  // deleteBillFromXero (graceful if the Bill is already gone in Xero). (Neil, 2026-09-21)
  async function deleteRefundXeroBill(id: number) {
    const row = await prisma.refundRequest.findUnique({ where: { id } });
    if (!row) throw new Error('Refund request not found');
    if (!row.xeroBillId) throw new Error('No Xero Bill linked');

    let remoteResult = 'deleted'; let remoteError: string | null = null;
    try {
      const { xero, tenantId } = await getAuthedXero();
      await xero.accountingApi.updateInvoice(tenantId, row.xeroBillId, { invoices: [{ invoiceID: row.xeroBillId, status: 'DELETED' as any }] });
    } catch (e: any) {
      remoteError = e.response?.body?.Message || e.body?.Message || e.message || 'Unknown Xero error';
      const isOrphan = /not (found|exist)|invalid|cannot be found|does not exist|deleted/i.test(remoteError || '');
      remoteResult = isOrphan ? 'already_gone' : 'failed';
    }
    if (remoteResult === 'failed') throw new Error('Xero void failed: ' + remoteError);

    // Only REVERSE the accounting if the Bill had actually been PAID (counted).
    // A submitted (unpaid) Bill never touched Refunded / the booking, so voiding it
    // just clears the pending link.
    const wasPaid = row.xeroBillStatus === 'paid';
    const requestedEur = row.amountRequested != null ? Number(row.amountRequested) : NaN;
    const feeEur = Number(row.feeDeductionEur || 0);
    let newRefunded = Number(row.amountRefunded || 0);
    if (wasPaid) newRefunded = Math.max(0, Math.round((newRefunded - (row.xeroBillAmount != null ? Number(row.xeroBillAmount) : 0)) * 100) / 100);
    const newBalance = !isNaN(requestedEur) ? Math.round((requestedEur - feeEur - newRefunded) * 100) / 100 : null;
    const newStatus = !isNaN(requestedEur) ? (newRefunded <= 0.001 ? 'Pending' : (newBalance! <= 0.01 ? 'Paid' : 'Partial')) : row.status;
    const now = new Date();
    const voidNote = `${ukDate(now)} - Xero Bill ${row.xeroBillNumber || ''} VOIDED${remoteResult === 'already_gone' ? ' (was already gone in Xero)' : ''}`;
    const newNotes = (row.notes && row.notes.trim() ? row.notes.replace(/\s+$/, '') + '\n' : '') + voidNote;
    await prisma.refundRequest.update({ where: { id }, data: {
      xeroBillId: null, xeroBillNumber: null, xeroBillAmount: null, xeroBillStatus: null, xeroBillPaidAt: null,
      amountRefunded: newRefunded, status: newStatus, notes: newNotes,
    } });

    // If it was paid, remove the booking's refund Payment for this bill + re-roll.
    if (wasPaid && row.bookingId && row.xeroBillNumber) {
      try {
        await prisma.payment.deleteMany({ where: { bookingId: row.bookingId, type: 'refund', comment: { contains: row.xeroBillNumber } } });
        await rerollBooking(row.bookingId);
      } catch (e: any) { console.error('[refund void→booking]', e?.message || e); }
    }
    return { ok: true, voided: remoteResult, wasPaid, refundedTotal: newRefunded, balance: newBalance, status: newStatus };
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
      const rejectedInline = `<p>Hi ${escapeHtml(row.studentName)},</p>
<p>Thanks for your refund request. Unfortunately we cannot proceed at this time. Reason:</p>
<blockquote>${escapeHtml(reason)}</blockquote>
<p>If you'd like to discuss, please reply to this email.</p>
<p>Best,<br>ULearn Accounts</p>`;
      const rejectedTpl = await renderEmailTemplate(prisma, 'Refund-Rejected', {
        student_name: escapeHtml(row.studentName || ''),
        reject_reason: escapeHtml(reason || ''),
      });
      await sendEmail({
        from: 'accounts@ulearnschool.com',
        to: row.studentEmail,
        subject: rejectedTpl?.subject || 'About your ULearn refund request',
        html: rejectedTpl?.html || rejectedInline,
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

  // Hard-delete a refund created in error. Guarded: refuse once the refund has
  // moved money or been dispatched (a Xero Bill exists, an amount was refunded,
  // or TransferMate was notified) — those must be unwound first (Delete Xero /
  // manual), so we never orphan a Bill or lose an audit trail. A plain
  // pending/rejected refund never cancelled the booking, so there's nothing to
  // re-roll. Removes any uploaded refusal-letter docs attached to it. (Neil 2026-09-24)
  async function deleteRefund(id: number) {
    const row = await prisma.refundRequest.findUnique({ where: { id } });
    if (!row) return { success: false, error: 'Refund not found' };
    if (row.xeroBillId) return { success: false, error: 'This refund has a Xero Bill — void it first (Delete Xero), then delete the refund.' };
    if (Number(row.amountRefunded || 0) > 0) return { success: false, error: 'This refund has a recorded refunded amount — it cannot be deleted.' };
    if (row.sentToTmAt) return { success: false, error: 'This refund was already notified to TransferMate — it cannot be deleted (keep the audit trail).' };
    await prisma.studentDocument.deleteMany({ where: { refundId: id } }).catch(() => {});
    await prisma.refundRequest.delete({ where: { id } });
    return { success: true };
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
    const inline = `<p>Hi ${escapeHtml(payload.student_name)},</p>
<p>Thanks — we've received your refund request and our accounts team will review it shortly. You'll hear back from us by email.</p>
<p>If anything is urgent, just reply to this message.</p>
<p>Best,<br>ULearn Accounts</p>`;
    const tpl = await renderEmailTemplate(prisma, 'Refund-Received', {
      student_name: escapeHtml(payload.student_name || ''),
    });
    await sendEmail({
      from: 'accounts@ulearnschool.com',
      to: payload.student_email,
      subject: tpl?.subject || 'We received your ULearn refund request',
      html: tpl?.html || inline,
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
    create,
    attachRefusalLetter,
    listRefundFiles,
    deleteRefundFile,
    getRefundFileStream,
    removeRefusalLetter,
    list,
    get,
    update,
    approve,
    tmPreview,
    approveToXero,
    syncRefundXeroBill,
    updateRefundXeroBill,
    deleteRefundXeroBill,
    reject,
    deleteRefund,
    batchApprove,
    getRefusalLetterStream,
  };
}
