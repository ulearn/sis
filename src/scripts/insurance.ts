/**
 * Insurance procurement — SIS side (operational source of truth).
 *
 * SIS is where the complete picture lives: course start date, ILEP code,
 * nationality, paid state, and the policy once it lands back. The student's
 * PAYMENT is what escalates a row to procurement — there is no "send" button.
 * The fins procurement dashboard (hub) consumes this list, approves + buys on
 * the Study & Protect (Arachas) portal, then writes the policy PDF + number
 * back (filed as an ISSUED DocumentRecord → shows in the student app).
 *
 * Cover window (Neil, 2026-10-27/11-10): course start + 242 days = the Friday
 * of week 35 (25 teaching weeks + 10 holiday). If the student lands before the
 * course, cover starts on arrival but the end stays tied to the course. Buy-by
 * is 7 days before cover starts (students arrive at weekends). Mirrors the hub
 * `fins/scripts/procurement/extras.js` logic so the two environments agree.
 *
 * Product coding (from BookingExtra.details, mirrored off the HubSpot SKU in
 * webhooks.ts): 'PEL;Health' = both · 'PEL' = Learner Protection only ·
 * 'Health' = Medical only. Medicover is never bought alone (PEL is a legal
 * duty). Set from the invoice lines by insuranceProductFromLines below.
 *
 * Status badge (read-only in SIS, the fins dashboard owns the middle state):
 *   SENT      — listed = it is in procurement (the default once paid)
 *   PURCHASED — the policy is on file in the SIS (the completion signal)
 * APPROVED is only known to fins and arrives via the write-back mirror (TODO).
 */
import type { PrismaClient } from '../generated/prisma/client';

const DAY = 86400000;
const addDays = (d: Date, n: number) => new Date(d.getTime() + n * DAY);
const iso = (d: Date | null | undefined) => (d ? d.toISOString().slice(0, 10) : null);

const PRODUCT_LABEL: Record<string, string> = {
  'PEL;Health': 'Both (PEL + Health)',
  'PEL': 'PEL only',
  'Health': 'Medical only',
};

/**
 * Insurance product from a HubSpot invoice's insurance lines → BookingExtra.details.
 * HubSpot has three SKUs — INSR (PEL + Health bundle, usually €150), PEL / legacy LP
 * (Learner Protection only, €29–50) and MEDI (Health) — but INSR has also been put on
 * PEL-only lines ("PEL Insurance" €30), so the line NAME decides and price breaks ties.
 * Health is never sold alone (PEL is the school's legal duty), so a lone €100+ health
 * line is the bundle. Several lines combine (PEL + MEDI = both). Null = no insurance line.
 */
export function insuranceProductFromLines(lines: { sku?: string | null; name?: string | null; amount?: number | string | null }[]): string | null {
  let pel = false, health = false;
  for (const l of lines) {
    const n = String(l.name || '').toLowerCase(), sku = String(l.sku || '').toUpperCase(), amt = Number(l.amount) || 0;
    const nP = /\bpel\b|learner protection/.test(n), nH = /health|medi/.test(n);
    if (sku === 'MEDI' || (nH && !nP)) { health = true; if (amt >= 100) pel = true; }
    else if (nP && nH) { if (amt > 0 && amt < 100) pel = true; else { pel = true; health = true; } }
    else if (nP || sku === 'PEL' || sku === 'LP') pel = true;
    else if (sku === 'INSR') { pel = true; if (amt >= 100) health = true; }
  }
  return pel && health ? 'PEL;Health' : pel ? 'PEL' : health ? 'Health' : null;
}

export function insuranceScripts(prisma: PrismaClient) {
  /** All bookings carrying an active INSURANCE extra, as procurement rows. */
  async function list() {
    const insExtras = await prisma.bookingExtra.findMany({
      where: { extraType: 'INSURANCE', active: true, bookingId: { not: null } },
      select: { bookingId: true, details: true, fee: true },
    });
    // Product per booking. A booking can carry the INSURANCE extra more than
    // once — a LifePass booking has one Academic-Year course per year, each
    // needing its own cover, and webhook races can add fee-less copies too — but
    // the PRODUCT is the same, so keep the fee-bearing/first as the booking's
    // product. Rows are driven by the COURSES below (one AY year = one cover
    // set), NOT by the extra count — so LifePass shows one row per year and
    // true duplicates never inflate the list.
    const prodByBooking = new Map<number, { product: string | null; fee: number | null }>();
    for (const e of insExtras) {
      const cur = prodByBooking.get(e.bookingId!);
      if (!cur || (e.fee != null && cur.fee == null)) {
        prodByBooking.set(e.bookingId!, { product: e.details || null, fee: e.fee != null ? Number(e.fee) : null });
      }
    }
    const bookingIds = [...prodByBooking.keys()];
    if (!bookingIds.length) return { rows: [] };

    const bookings = await prisma.booking.findMany({
      where: { id: { in: bookingIds } },
      select: {
        id: true, status: true, amountTotal: true, amountPaid: true, serviceStart: true, serviceEnd: true,
        student: {
          select: {
            id: true, firstName: true, lastName: true, nickname: true, email: true, fideloCustomerNum: true, nationality: true, flightDate: true,
            learnerProtectionPolicy: true, medicalPolicy: true,
            insuranceFrom: true, insuranceUntil: true, medicalFrom: true, medicalUntil: true,
          },
        },
        courses: {
          where: { active: true },
          select: { startDate: true, endDate: true, name: true, level: true, ilepCode: true },
          orderBy: { startDate: 'asc' },
        },
      },
    });

    const studentIds = [...new Set(bookings.map((b) => b.student?.id).filter(Boolean))] as number[];
    const docs = studentIds.length
      ? await prisma.documentRecord.findMany({
          where: { studentId: { in: studentIds }, status: 'ISSUED', documentType: { startsWith: 'insurance/' } },
          select: { id: true, studentId: true, documentType: true },
        })
      : [];
    const docsByStudent = new Map<number, { id: number; type: string }[]>();
    for (const d of docs) {
      const a = docsByStudent.get(d.studentId) || [];
      a.push({ id: d.id, type: d.documentType });
      docsByStudent.set(d.studentId, a);
    }

    const todayIso = iso(new Date())!;
    const rows: any[] = [];

    for (const b of bookings) {
      if (!b.student) continue;
      const s = b.student;
      const product = prodByBooking.get(b.id)?.product || null;
      const total = Number(b.amountTotal || 0);
      const paid = Number(b.amountPaid || 0);
      const paidState = total > 0 && paid >= total ? 'paid' : paid > 0 ? 'partial' : 'unpaid';
      const haveLP = !!s.learnerProtectionPolicy;
      const haveMed = !!s.medicalPolicy;
      const sdocs = docsByStudent.get(s.id) || [];
      // PURCHASED = SIS holds policy evidence (a policy number or a filed
      // insurance PDF). Learner Protection is a blanket Aviva letter rarely filed
      // per-student, so we don't demand both halves.
      const purchased = haveLP || haveMed || sdocs.length > 0;

      // One cover row per NESTED COURSE: a LifePass booking carries one AY course
      // per year, each needing its own policies → one row per year with its own
      // start/buy-by date. A normal booking has a single course → a single row.
      const courses = b.courses.length ? b.courses : [null as any];
      const multiYear = b.courses.length > 1;
      courses.forEach((course: any, idx: number) => {
        const courseStart = course?.startDate || b.serviceStart || null;
        const arrival = s.flightDate || null;
        const coverStart = idx === 0 && arrival && courseStart && arrival < courseStart ? arrival : courseStart;
        const coverEnd = courseStart ? addDays(courseStart, 242) : b.serviceEnd || null;
        const buyBy = coverStart ? addDays(coverStart, -7) : null;
        const courseStartIso = iso(courseStart);
        rows.push({
          rowKey: `${b.id}-${idx}`,
          bookingId: b.id,
          studentId: s.id,
          studentName: `${s.firstName || ''} ${s.lastName || ''}`.trim() || '(no name)',
          nationality: s.nationality || null,
          email: s.email || null,
          nickname: s.nickname || null,
          fideloCustomerNum: s.fideloCustomerNum || null,
          product,
          productLabel: product ? PRODUCT_LABEL[product] || product : null,
          yearLabel: multiYear ? `Yr ${idx + 1}` : null,
          courseName: course?.name || null,
          ilepCode: course?.ilepCode || null,
          level: course?.level || null,
          courseStart: courseStartIso,
          coverStart: iso(coverStart),
          coverEnd: iso(coverEnd),
          buyBy: iso(buyBy),
          paidState,
          amountTotal: total,
          amountPaid: paid,
          bookingStatus: b.status || null,
          status: purchased ? 'PURCHASED' : 'SENT',
          lpPolicy: s.learnerProtectionPolicy || null,
          medPolicy: s.medicalPolicy || null,
          policyDocs: sdocs,
          past: courseStartIso ? courseStartIso < todayIso : false,
        });
      });
    }

    rows.sort((a, b) => (a.courseStart || '9999').localeCompare(b.courseStart || '9999'));
    return { rows };
  }

  return { list };
}
