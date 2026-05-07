// Wed-6am cron: for placed accommodation bookings starting in the next 3 days
// that still carry an outstanding balance, post to the Slack #financial
// channel and (when the balance is > €25) auto-bounce the student out of
// their bed once. The bounce is intentionally a one-shot per booking — if
// Kelly re-assigns them, the cron will not eject them again (the
// t3_bounced_at column on booking_accommodations records the prior bounce).
//
// Cron line:
//   0 6 * * 3 cd /home/sis/web/sis.ulearnschool.com/public_html/sis && /usr/bin/node dist/scripts/cron-accomm-balance-warn.js >> /home/sis/web/sis.ulearnschool.com/private/db/accomm-balance-warn.log 2>&1

import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';
import { postSlackMessage } from '../lib/slack';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma  = new PrismaClient({ adapter });

const BOUNCE_THRESHOLD = 25;       // ≤ €25 → notify only, do not unplace
const HORIZON_DAYS     = 3;        // T-3 window: today through today+3 (inclusive)
const CHANNEL          = process.env.SLACK_DEFAULT_CHANNEL || '#financial';

function mention(envVarId: string, fallbackName: string): string {
  const id = process.env[envVarId];
  return id ? `<@${id}>` : `@${fallbackName}`;
}

function fmt(d: Date | string): string {
  const dt = typeof d === 'string' ? new Date(d) : d;
  return dt.toISOString().slice(0, 10);
}

async function main() {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const horizon = new Date(today.getTime() + HORIZON_DAYS * 86400000);
  horizon.setHours(23, 59, 59, 999);

  const rows = await prisma.bookingAccommodation.findMany({
    where: {
      active: true,
      bedId: { not: null },
      startDate: { gte: today, lte: horizon },
    },
    include: {
      booking: {
        select: {
          id: true, amountPaid: true, amountTotal: true,
          student: { select: { id: true, firstName: true, lastName: true } },
        },
      },
      bed: {
        include: {
          room: { include: { property: { include: { provider: true } } } },
        },
      },
    },
  });

  const kelly     = mention('SLACK_KELLY_USER_ID',     'Kelly');
  const diego     = mention('SLACK_DIEGO_USER_ID',     'Diego');
  const esperanza = mention('SLACK_ESPERANZA_USER_ID', 'Esperanza');

  let notified = 0, bounced = 0, skipped = 0;

  for (const r of rows) {
    const paid    = Number(r.booking?.amountPaid  || 0);
    const total   = Number(r.booking?.amountTotal || 0);
    const balance = total - paid;
    if (!(total > 0 && balance > 0.01)) { skipped++; continue; }

    const st       = r.booking?.student;
    const name     = `${st?.firstName ?? ''} ${st?.lastName ?? ''}`.trim() || `Student #${st?.id}`;
    const provider = r.bed?.room?.property?.provider?.name ?? '—';
    const property = r.bed?.room?.property?.name ?? '—';
    const room     = r.bed?.room?.name ?? '—';
    const dates    = `${fmt(r.startDate)} → ${fmt(r.endDate)}`;
    const type     = r.accommodationType ?? '—';

    const willBounce = balance > BOUNCE_THRESHOLD && r.t3BouncedAt == null;

    const lines = [
      `⚠ *T-3 balance warning · ${name}*`,
      `Booking: ${dates} · ${type}`,
      `Placed at: ${provider} · ${property} · ${room}`,
      `Balance: *€${balance.toFixed(2)}*`,
      '',
    ];
    if (willBounce) {
      lines.push(`Student has been *removed from the assigned room* (auto-bounce, one-time only).`);
      lines.push(`Sales: please contact ${name} urgently to clear the balance and reinstate the room.`);
    } else if (r.t3BouncedAt != null) {
      lines.push(`Already auto-bounced once on ${fmt(r.t3BouncedAt)} — left in place. Please follow up.`);
    } else {
      lines.push(`Small balance (≤ €${BOUNCE_THRESHOLD}) — student left in the room. Please follow up to collect.`);
    }
    lines.push('');
    lines.push(`cc: ${kelly} ${diego} ${esperanza}`);

    const result = await postSlackMessage({ channel: CHANNEL, text: lines.join('\n') });
    if (!result.ok) {
      console.error(`[t3-warn] Slack post failed for booking_accommodation #${r.id}: ${result.error}`);
      // Don't bounce if we couldn't notify — the human handoff is the point.
      continue;
    }
    notified++;

    if (willBounce) {
      await prisma.bookingAccommodation.update({
        where: { id: r.id },
        data:  { bedId: null, t3BouncedAt: new Date() },
      });
      bounced++;
      console.log(`[t3-warn] Bounced booking_accommodation #${r.id} (${name}, balance €${balance.toFixed(2)})`);
    } else {
      console.log(`[t3-warn] Notified only for #${r.id} (${name}, balance €${balance.toFixed(2)})`);
    }
  }

  console.log(`[t3-warn] Done. notified=${notified} bounced=${bounced} skipped=${skipped} (of ${rows.length} placed-in-window)`);
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error('[t3-warn] FATAL:', e);
  await prisma.$disconnect();
  process.exit(1);
});
