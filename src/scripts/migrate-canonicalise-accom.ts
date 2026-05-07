// One-shot migration: collapse legacy accommodation_type / room_type / board
// values into the canonical set defined in school_config.
//
// Mapping was agreed with the user (2026-05-08):
//   accommodation_type:
//     Homestay  → Host Family
//     Apartment → City Centre Apartment
//     Hostel    → City Centre Apartment   (collapse — user said two types only)
//   room_type:
//     Individual room      → Individual
//     Shared Room          → Twin/Shared
//     Apt Premium Single   → Premium
//     Twin Room            → Twin/Shared
//     Apt Single Standard  → Standard
//     Apt Superior Single  → Superior
//     Double room          → Double
//     Single               → Individual
//   board:
//     Full-board                       → Full Board
//     Half-board                       → Half Board
//     Self catering                    → Self Catering
//     Half-board Christmas & New Year  → Half Board
//
// Run with --apply to actually write. Default is dry-run.
import dotenv from 'dotenv';
dotenv.config();
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';

const TYPE_MAP: Record<string, string> = {
  'Homestay': 'Host Family',
  'Apartment': 'City Centre Apartment',
  'Hostel': 'City Centre Apartment',
};

const ROOM_MAP: Record<string, string> = {
  'Individual room': 'Individual',
  'Shared Room': 'Twin/Shared',
  'Apt Premium Single': 'Premium',
  'Twin Room': 'Twin/Shared',
  'Apt Single Standard': 'Standard',
  'Apt Superior Single': 'Superior',
  'Double room': 'Double',
  'Single': 'Individual',
};

const BOARD_MAP: Record<string, string> = {
  'Full-board': 'Full Board',
  'Half-board': 'Half Board',
  'Self catering': 'Self Catering',
  'Half-board Christmas & New Year': 'Half Board',
};

async function main() {
  const apply = process.argv.includes('--apply');
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter } as any);

  const totals = { type: 0, room: 0, board: 0 };

  for (const [from, to] of Object.entries(TYPE_MAP)) {
    const before = await (prisma as any).$queryRaw`SELECT COUNT(*)::int AS c FROM booking_accommodations WHERE accommodation_type = ${from}`;
    const n = before[0]?.c || 0;
    if (!n) continue;
    totals.type += n;
    console.log(`  type   ${JSON.stringify(from).padEnd(20)} → ${JSON.stringify(to)}  · ${n} rows`);
    if (apply) await (prisma as any).$executeRaw`UPDATE booking_accommodations SET accommodation_type = ${to} WHERE accommodation_type = ${from}`;
  }

  for (const [from, to] of Object.entries(ROOM_MAP)) {
    const before = await (prisma as any).$queryRaw`SELECT COUNT(*)::int AS c FROM booking_accommodations WHERE room_type = ${from}`;
    const n = before[0]?.c || 0;
    if (!n) continue;
    totals.room += n;
    console.log(`  room   ${JSON.stringify(from).padEnd(20)} → ${JSON.stringify(to)}  · ${n} rows`);
    if (apply) await (prisma as any).$executeRaw`UPDATE booking_accommodations SET room_type = ${to} WHERE room_type = ${from}`;
  }

  for (const [from, to] of Object.entries(BOARD_MAP)) {
    const before = await (prisma as any).$queryRaw`SELECT COUNT(*)::int AS c FROM booking_accommodations WHERE board = ${from}`;
    const n = before[0]?.c || 0;
    if (!n) continue;
    totals.board += n;
    console.log(`  board  ${JSON.stringify(from).padEnd(20)} → ${JSON.stringify(to)}  · ${n} rows`);
    if (apply) await (prisma as any).$executeRaw`UPDATE booking_accommodations SET board = ${to} WHERE board = ${from}`;
  }

  console.log(`\nTotals: ${totals.type} type · ${totals.room} room · ${totals.board} board`);
  console.log(apply ? 'Applied.' : 'Dry-run only — pass --apply to write.');
  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
