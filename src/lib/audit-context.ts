// AsyncLocalStorage-backed request context for audit logging.
//
// The Prisma audit extension (prisma-audit.ts) needs to know WHO triggered
// a tracked write. For HTTP requests, the Express middleware in app.ts
// wraps each request so the route label (e.g. "POST /sis/api/bookings/123")
// is available throughout the async call chain — including inside
// fire-and-forget IIFEs in webhook handlers, because AsyncLocalStorage
// propagates across await boundaries automatically.
//
// For cron scripts / CLI tools that don't go through Express, the script
// can wrap its main() in runWithAuditContext('script:my-name', ...) to
// label their writes. If no context is set, writes are tagged '<unknown>'.
import { AsyncLocalStorage } from 'async_hooks';

export type AuditContext = { user: string };

const als = new AsyncLocalStorage<AuditContext>();

export function runWithAuditContext<T>(user: string, fn: () => T): T {
  return als.run({ user }, fn);
}

export function getAuditUser(): string {
  return als.getStore()?.user || '<unknown>';
}
