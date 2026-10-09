/**
 * cron-clearance-reconcile.ts — resets Seat Clearance confirmations when the sale ends.
 *
 * `clearance_confirmed` is the partner's opt-in (the Claim click). It is SIS-authoritative
 * and mirrored OUTBOUND to the HubSpot Company `clearance_confirmed`. When a sale ends (its
 * endsAt passes, or it's deactivated), those confirmations must clear so the next sale starts
 * fresh AND the HubSpot flag flips back — otherwise a stale confirmed=Yes could keep pricing
 * hot. This cron is the trigger: if no sale is currently live, reset every confirmed agency to
 * false and mirror each reset to HubSpot.
 *
 * Idempotent + self-healing: a no-op while a sale is live; retries next day on any failure.
 * (Pricing is doubly-guarded — the hub also reads live=false from /clearance-rates — so a
 * missed run never leaks a discount; this is the housekeeping half.)
 *
 *   node dist/scripts/cron-clearance-reconcile.js
 */
import dotenv from 'dotenv';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';
import { clearanceScripts } from './clearance';

dotenv.config();

async function main() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter });
  try {
    const out = await clearanceScripts(prisma).reconcileClearanceConfirmations();
    if (out.live) console.log(`[clearance-reconcile] sale live — no reset (${new Date().toISOString()})`);
    else console.log(`[clearance-reconcile] no live sale — reset ${out.reset} confirmation(s) + mirrored to HubSpot (${new Date().toISOString()})`);
  } catch (e: any) {
    console.error('[clearance-reconcile] error:', e?.message || e);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main();
