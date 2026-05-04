/**
 * Extract per-course / per-accommodation fees from Fidelo invoice line items.
 *
 * The Fidelo Bookings API exposes structured pricing at:
 *   GET /api/1.1/ts/booking/{id}?include_inactive_services=1
 *   → data.invoices[].items[]   (description, service_from, service_until, amount, tax, active)
 *
 * Matching strategy:
 *   1. Pick the "best" invoice (most recently dated active one, falling back to the
 *      first if dates are missing — legacy 2007 records often have null dates).
 *   2. Classify each line item by description keyword:
 *        registration | accommodation | transfer | insurance | placement_fee | course
 *   3. For each course, sum course-classified items whose date window matches the
 *      course's date window. If no match (legacy lump-sum invoices), split the
 *      total course-classified amount proportionally by (weeks × hoursPerWeek).
 *   4. Same logic for accommodation.
 *
 * Used by both:
 *   - import-fidelo.ts (during the nightly cron, on new bookings)
 *   - backfill-fidelo-fees.ts (one-shot, for existing rows)
 */

export interface InvoiceItem {
  description: string;
  service_from: string | null;
  service_until: string | null;
  amount: number | string;
  tax?: number;
  active?: boolean;
}

export interface InvoiceShape {
  number?: string;
  type?: string;
  date?: string | null;
  created?: string;
  is_last_document?: boolean;
  items?: InvoiceItem[];
}

export interface CourseInput {
  name: string;
  from: string | null;     // ISO YYYY-MM-DD
  until: string | null;
  weeks: number | null;
  hoursPerWeek: number | null;
}

export interface AccommodationInput {
  from: string | null;
  until: string | null;
  weeks: number | null;
}

export interface FeeAssignment {
  courseFees: number[];          // parallel to courses input
  accommodationFees: number[];   // parallel to accommodations input
  registrationFee: number;       // total (info only — not stored on schema yet)
  totalAssigned: number;         // sum of all classified items
  invoiceUsed: string | null;    // invoice number used for trace/debug
}

type ItemKind = 'course' | 'accommodation' | 'transfer' | 'insurance' | 'registration' | 'placement_fee' | 'other';

function classifyItem(desc: string): ItemKind {
  const d = (desc || '').toLowerCase();
  if (/\bregistration\b/.test(d)) return 'registration';
  if (/\b(placement\s*fee|admission)\b/.test(d)) return 'placement_fee';
  if (/\b(insurance)\b/.test(d)) return 'insurance';
  if (/\b(transfer|airport|pickup|drop[\s-]?off)\b/.test(d)) return 'transfer';
  // Accommodation must come before "Course" because "Course" is the legacy default —
  // some invoice rows say e.g. "Hotel" or "Host Family" without "accomm" in them.
  if (/\b(accomm|host\s*family|hotel|residence|apartment|homestay|room|lodging|board)\b/.test(d)) {
    return 'accommodation';
  }
  if (/\b(course|class|lessons|tuition|tuit|study|english|general)\b/.test(d)) return 'course';
  // Default to course — better to over-assign than miss real revenue.
  return 'course';
}

function pickBestInvoice(invoices: InvoiceShape[]): InvoiceShape | null {
  if (!invoices?.length) return null;
  // Filter out credit-note types and clearly-inactive invoices
  const usable = invoices.filter(i => {
    const type = (i.type || '').toLowerCase();
    if (/credit/.test(type)) return false;
    return true;
  });
  if (!usable.length) return null;

  // Prefer is_last_document, then most recent date
  const sorted = [...usable].sort((a, b) => {
    const aLast = a.is_last_document ? 1 : 0;
    const bLast = b.is_last_document ? 1 : 0;
    if (aLast !== bLast) return bLast - aLast;
    const aDate = (a.date || a.created || '').toString();
    const bDate = (b.date || b.created || '').toString();
    return bDate.localeCompare(aDate);
  });
  return sorted[0];
}

function rangeOverlaps(itemFrom: string | null, itemTo: string | null, courseFrom: string | null, courseTo: string | null): boolean {
  if (!itemFrom || !itemTo || !courseFrom || !courseTo) return false;
  // Overlap = item starts before course ends AND item ends after course starts.
  return itemFrom <= courseTo && itemTo >= courseFrom;
}

export function extractFees(input: {
  courses: CourseInput[];
  accommodations: AccommodationInput[];
  invoices: InvoiceShape[];
}): FeeAssignment {
  const result: FeeAssignment = {
    courseFees: input.courses.map(() => 0),
    accommodationFees: input.accommodations.map(() => 0),
    registrationFee: 0,
    totalAssigned: 0,
    invoiceUsed: null,
  };

  const inv = pickBestInvoice(input.invoices);
  if (!inv) return result;
  result.invoiceUsed = inv.number || null;

  const items = (inv.items || []).filter(it => it.active !== false);

  // Bucket items by classification
  const courseItems: InvoiceItem[] = [];
  const accomItems: InvoiceItem[] = [];
  for (const it of items) {
    const kind = classifyItem(it.description || '');
    const amt = Number(it.amount || 0);
    result.totalAssigned += amt;
    if (kind === 'registration') result.registrationFee += amt;
    else if (kind === 'course') courseItems.push(it);
    else if (kind === 'accommodation') accomItems.push(it);
    // transfer / insurance / placement_fee / other are tracked in totalAssigned but not assigned per-course
  }

  // Helper: assign items to slots by date overlap, fall back to proportional split
  const assignByDateOrProportion = <T extends { from: string | null; until: string | null }>(
    slots: T[],
    weights: number[],          // for proportional fallback (weeks*hoursPerWeek for courses; weeks for accom)
    bucket: InvoiceItem[],
  ): number[] => {
    const out = slots.map(() => 0);
    if (slots.length === 0 || bucket.length === 0) return out;

    // Pass 1: per-item date matching. If exactly one slot overlaps, assign full amount.
    const unmatched: InvoiceItem[] = [];
    for (const it of bucket) {
      const matches = slots
        .map((s, i) => ({ i, overlap: rangeOverlaps(it.service_from, it.service_until, s.from, s.until) }))
        .filter(m => m.overlap);
      if (matches.length === 1) {
        out[matches[0].i] += Number(it.amount || 0);
      } else if (matches.length > 1) {
        // Item overlaps multiple slots — split among them proportionally by weight
        const totalW = matches.reduce((s, m) => s + (weights[m.i] || 1), 0) || matches.length;
        for (const m of matches) {
          out[m.i] += Number(it.amount || 0) * ((weights[m.i] || 1) / totalW);
        }
      } else {
        unmatched.push(it);
      }
    }

    // Pass 2: anything that didn't match by date — split proportionally across all slots.
    if (unmatched.length) {
      const totalLeftover = unmatched.reduce((s, it) => s + Number(it.amount || 0), 0);
      const totalW = weights.reduce((s, w) => s + (w || 1), 0) || slots.length;
      slots.forEach((_, i) => {
        out[i] += totalLeftover * ((weights[i] || 1) / totalW);
      });
    }

    return out;
  };

  const courseWeights = input.courses.map(c => Math.max(1, (c.weeks || 1) * (c.hoursPerWeek || 1)));
  const accomWeights = input.accommodations.map(a => Math.max(1, a.weeks || 1));

  result.courseFees = assignByDateOrProportion(input.courses, courseWeights, courseItems);
  result.accommodationFees = assignByDateOrProportion(input.accommodations, accomWeights, accomItems);

  // Round to 2 decimals
  result.courseFees = result.courseFees.map(n => Math.round(n * 100) / 100);
  result.accommodationFees = result.accommodationFees.map(n => Math.round(n * 100) / 100);
  result.registrationFee = Math.round(result.registrationFee * 100) / 100;
  result.totalAssigned = Math.round(result.totalAssigned * 100) / 100;

  return result;
}
