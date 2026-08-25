interface TmEmailInput {
  student: { firstName: string; lastName: string; id: number | null };
  tmTransactionId: string;
  originalAmount: string;
  feeDeductionEur: string;
  feeBreakdown: string;
  refundAmount: string;
}

export function buildTmEmail(d: TmEmailInput) {
  const fullName = `${d.student.firstName} ${d.student.lastName}`.trim();
  const studentIdLine = d.student.id ? `ULearn Student ID:   ${d.student.id}` : 'ULearn Student ID:   (not yet linked)';

  const text = [
    'Hi TransferMate,',
    '',
    'Please process a refund for the student below. The visa refusal letter is attached.',
    '',
    `Student Name:        ${fullName}`,
    studentIdLine,
    `TM Transaction ID:   ${d.tmTransactionId}`,
    `Original Amount:     €${d.originalAmount}`,
    `Fee Deduction:       €${d.feeDeductionEur} (${d.feeBreakdown})`,
    `Refund Amount:       €${d.refundAmount}`,
    '',
    'Refund destination: the original sending account (per KYC / AML).',
    '',
    'Thanks,',
    'ULearn Accounts',
    'accounts@ulearnschool.com',
  ].join('\n');

  const html = `<p>Hi TransferMate,</p>
<p>Please process a refund for the student below. The visa refusal letter is attached.</p>
<table cellpadding="6" style="border-collapse:collapse;font-family:Arial,sans-serif;">
  <tr><td><strong>Student Name</strong></td><td>${escape(fullName)}</td></tr>
  <tr><td><strong>ULearn Student ID</strong></td><td>${d.student.id ?? '(not yet linked)'}</td></tr>
  <tr><td><strong>TM Transaction ID</strong></td><td>${escape(d.tmTransactionId)}</td></tr>
  <tr><td><strong>Original Amount</strong></td><td>€${escape(d.originalAmount)}</td></tr>
  <tr><td><strong>Fee Deduction</strong></td><td>€${escape(d.feeDeductionEur)} <em>(${escape(d.feeBreakdown)})</em></td></tr>
  <tr><td><strong>Refund Amount</strong></td><td><strong>€${escape(d.refundAmount)}</strong></td></tr>
</table>
<p>Refund destination: the original sending account (per KYC / AML).</p>
<p>Thanks,<br>ULearn Accounts<br>accounts@ulearnschool.com</p>`;

  return { text, html };
}

function escape(s: string): string {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
