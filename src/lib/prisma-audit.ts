// Prisma Client extension that audits writes to selected Booking fields.
//
// The Booking row is mutated by many paths (Fidelo importer, HubSpot sync,
// invoice-paid webhook, Xero alignment, manual admin edits, classes script).
// When one of those leaves the row in an inconsistent state — e.g. the
// €5.50 amountTotal vs amountPaid drift on booking 17915 where amountOpen
// already read 0 — there's currently no trail to pin down which path was
// responsible. This extension fills that gap going forward by writing one
// AuditLog row per tracked-field change for every update / updateMany /
// upsert on Booking.
//
// Scope notes:
//   - Only tracks the fields most prone to drift right now. Easy to extend.
//   - Reads (findUnique/findMany) are NOT intercepted, so the before/after
//     snapshots are free of recursion risk.
//   - Only catches writes through the Prisma client this extension is
//     attached to. The shared client in app.ts covers all HTTP routes +
//     webhooks; cron scripts that instantiate their own PrismaClient need
//     to apply the extension themselves to get coverage. See
//     audit-context.ts for the matching wrapper they should use.
import { getAuditUser } from './audit-context';

const TRACKED_FIELDS = ['amountTotal', 'amountPaid', 'amountOpen', 'status'] as const;
type TrackedField = typeof TRACKED_FIELDS[number];
type Snapshot = { id: number } & Record<TrackedField, any>;

const SELECT = { id: true, amountTotal: true, amountPaid: true, amountOpen: true, status: true };

async function snapshotOne(client: any, where: any): Promise<Snapshot | null> {
  if (!where) return null;
  return client.booking.findUnique({ where, select: SELECT });
}

async function snapshotMany(client: any, where: any): Promise<Snapshot[]> {
  return client.booking.findMany({ where: where || {}, select: SELECT });
}

async function recordDiff(
  client: any,
  before: Snapshot,
  after: Snapshot,
  user: string,
): Promise<void> {
  const rows: any[] = [];
  for (const f of TRACKED_FIELDS) {
    const oldStr = before[f] != null ? String(before[f]) : null;
    const newStr = after[f]  != null ? String(after[f])  : null;
    if (oldStr !== newStr) {
      rows.push({
        entityType: 'booking',
        entityId:   before.id,
        action:     'update',
        field:      f,
        oldValue:   oldStr,
        newValue:   newStr,
        userId:     user,
      });
    }
  }
  if (rows.length === 0) return;
  // createMany on auditLog — not audited itself, no recursion possible.
  await client.auditLog.createMany({ data: rows });
}

export function withBookingAudit<T>(baseClient: T): T {
  const client: any = baseClient;
  return client.$extends({
    name: 'booking-audit',
    query: {
      booking: {
        async update({ args, query }: any) {
          const before = await snapshotOne(client, args.where);
          const result = await query(args);
          if (before) {
            const after = await snapshotOne(client, { id: before.id });
            if (after) await recordDiff(client, before, after, getAuditUser());
          }
          return result;
        },
        async upsert({ args, query }: any) {
          // If the row pre-existed it's an update; if not, it's a create
          // (no "before" to diff against, so we skip — create-time values
          // are reconstructible from the row itself).
          const before = await snapshotOne(client, args.where);
          const result = await query(args);
          if (before && result?.id) {
            const after = await snapshotOne(client, { id: result.id });
            if (after) await recordDiff(client, before, after, getAuditUser());
          }
          return result;
        },
        async updateMany({ args, query }: any) {
          const beforeRows = await snapshotMany(client, args.where);
          const result = await query(args);
          if (beforeRows.length > 0) {
            const ids = beforeRows.map(r => r.id);
            const afterRows = await snapshotMany(client, { id: { in: ids } });
            const afterById = new Map(afterRows.map(r => [r.id, r]));
            for (const b of beforeRows) {
              const a = afterById.get(b.id);
              if (a) await recordDiff(client, b, a, getAuditUser());
            }
          }
          return result;
        },
      },
    },
  }) as T;
}
