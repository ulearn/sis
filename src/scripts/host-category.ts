/**
 * Host category auto-assignment — segments a Host-Family provider by hosting
 * ACTIVITY, so outreach can target batches instead of blasting all 110.
 *
 * Signals (from actual placements: booking_accommodations → bed → room → property):
 *   · sw12       = student-WEEKS hosted within the last 12 weeks (84 days), summed
 *                  across placements (overlap with the window, so 2 students × 3 wks = 6).
 *   · lastHostEnd = most recent placement end date (null = never hosted).
 *
 * Cascade (first match wins):
 *   sw12 ≥ 6                         → SuperHost
 *   sw12 ≥ 3                         → BusyBee
 *   sw12 ≥ 1                         → Regular
 *   hosted ≤ 12 months ago          → Regular   ← fills Neil's 12wk–12mo gap (still engaged this year)
 *   hosted > 12 months ago          → Sleeper   ← folded old Dormant in (Neil 2026-07-31): Sleeper covers all dormancy
 *   no hosting data in SIS          → Sleeper  (never uncategorised — Neil 2026-07-31)
 *
 * First Dibs is NOT an activity category — it's a standalone flag (firstDibsAt) that sits
 * ALONGSIDE the activity level, so a SuperHost can also hold First Dibs without losing their
 * tier. Set via the portal button (single-use, GV-completed, capped) or manually; cleared on
 * the next cascade send or on placement. Lives entirely outside this activity engine.
 * Manual overrides (hostCategoryManual) here still skip the auto-assign so a human tier survives.
 */
import type { PrismaClient } from '../generated/prisma/client';

const DAY = 24 * 3600 * 1000;
const DAYS_12WK = 84;
const DAYS_12MO = 365;

export type HostCategory = 'SuperHost' | 'BusyBee' | 'Regular' | 'Sleeper';

/** Pure cascade — see file header. No hosting history → 'Sleeper' (Neil 2026-07-31:
 *  never leave a host uncategorised — most have no SIS placement data post-Fidelo;
 *  Sleeper is the last activity tier before deactivation, so it fits even for
 *  deactivated hosts). Real activity still overrides it. */
export function computeCategory(sw12: number, lastHostEnd: Date | null, now: Date): HostCategory {
  if (sw12 >= 6) return 'SuperHost';
  if (sw12 >= 3) return 'BusyBee';
  if (sw12 >= 1) return 'Regular';
  if (!lastHostEnd) return 'Sleeper';
  const ageDays = Math.floor((now.getTime() - lastHostEnd.getTime()) / DAY);
  if (ageDays <= DAYS_12MO) return 'Regular';
  return 'Sleeper';   // 12+ months dormant — folds in the old >36mo 'Dormant' tier
}

/** Per-provider hosting stats: sw12 + lastHostEnd, keyed by provider id. */
async function hostStats(prisma: PrismaClient, now: Date): Promise<Map<number, { sw12: number; lastHostEnd: Date | null }>> {
  const winStart = new Date(now.getTime() - DAYS_12WK * DAY);
  const rows: any[] = await prisma.$queryRawUnsafe(
    `SELECT p.provider_id AS provider_id,
            COALESCE(SUM(GREATEST(0, LEAST(ba.end_date, $1::date) - GREATEST(ba.start_date, $2::date))), 0) / 7.0 AS sw12,
            MAX(ba.end_date) AS last_host_end
       FROM booking_accommodations ba
       JOIN accommodation_beds b       ON b.id = ba.bed_id
       JOIN accommodation_rooms r      ON r.id = b.room_id
       JOIN accommodation_properties p ON p.id = r.property_id
      WHERE ba.bed_id IS NOT NULL AND ba.active = true AND ba.accommodation_type = 'Host Family'
      GROUP BY p.provider_id`,
    now.toISOString().slice(0, 10),
    winStart.toISOString().slice(0, 10),
  );
  const m = new Map<number, { sw12: number; lastHostEnd: Date | null }>();
  for (const r of rows) {
    m.set(Number(r.provider_id), { sw12: Number(r.sw12) || 0, lastHostEnd: r.last_host_end ? new Date(r.last_host_end) : null });
  }
  return m;
}

/** Recompute auto categories for every non-manual Host-Family provider. */
export async function recomputeHostCategories(
  prisma: PrismaClient,
  opts: { apply: boolean; now?: Date; log?: (m: string) => void } = { apply: false },
): Promise<{ scanned: number; updated: number; byCat: Record<string, number> }> {
  const now = opts.now || new Date();
  const log = opts.log || (() => {});
  const stats = await hostStats(prisma, now);
  const hosts = await prisma.accommodationProvider.findMany({
    where: { type: 'Host Family', hostCategoryManual: { not: true } },
    select: { id: true, hostCategory: true },
  });
  let updated = 0;
  const byCat: Record<string, number> = {};
  for (const h of hosts) {
    const s = stats.get(h.id) || { sw12: 0, lastHostEnd: null };
    const cat = computeCategory(s.sw12, s.lastHostEnd, now);
    byCat[cat || '(none)'] = (byCat[cat || '(none)'] || 0) + 1;
    if (cat !== h.hostCategory) {
      if (opts.apply) await prisma.accommodationProvider.update({ where: { id: h.id }, data: { hostCategory: cat } });
      updated++;
    }
  }
  log(`scanned ${hosts.length} non-manual HF hosts · ${opts.apply ? 'updated' : 'would update'} ${updated} · dist ${JSON.stringify(byCat)}`);
  return { scanned: hosts.length, updated, byCat };
}

/** Recompute ONE host and clear its manual lock (the dropdown's "Auto" choice). */
export async function recomputeOneHostCategory(
  prisma: PrismaClient,
  providerId: number,
): Promise<{ hostCategory: HostCategory | null; sw12: number; lastHostEnd: Date | null }> {
  const now = new Date();
  const stats = await hostStats(prisma, now);
  const s = stats.get(providerId) || { sw12: 0, lastHostEnd: null };
  const cat = computeCategory(s.sw12, s.lastHostEnd, now);
  await prisma.accommodationProvider.update({ where: { id: providerId }, data: { hostCategory: cat, hostCategoryManual: false } });
  return { hostCategory: cat, sw12: s.sw12, lastHostEnd: s.lastHostEnd };
}
