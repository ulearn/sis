import * as fs from 'fs';
import * as path from 'path';

// Manual cohort exceptions — see data/cohort-exceptions.json for the rationale.
// Read at CALL time (not module load) so edits to the JSON take effect on the next
// webhook/cron fire without needing a rebuild or restart. Low call volume, so the
// per-call file read is negligible.
const EXCEPTIONS_PATH = path.join(__dirname, '../../data/cohort-exceptions.json');

export function isCohortException(dealId?: string | null, invoiceNumber?: string | null): boolean {
  try {
    const raw = JSON.parse(fs.readFileSync(EXCEPTIONS_PATH, 'utf8'));
    const dealSet = new Set((raw.dealIds || []).map((s: any) => String(s)));
    const invSet = new Set((raw.invoiceNumbers || []).map((s: any) => String(s).toUpperCase()));
    if (dealId && dealSet.has(String(dealId))) return true;
    if (invoiceNumber && invSet.has(String(invoiceNumber).toUpperCase())) return true;
    return false;
  } catch {
    // File missing / malformed → no exceptions (fail closed: standard invoices stay DataSync's).
    return false;
  }
}
