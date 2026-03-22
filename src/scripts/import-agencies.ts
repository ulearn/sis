import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';

dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool as any);
const prisma = new PrismaClient({ adapter });

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
      else inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

function parseCommissionRate(str: string): number | null {
  if (!str) return null;
  const match = str.match(/(\d+)%/);
  return match ? parseInt(match[1]) : null;
}

async function main() {
  const csvPath = path.join(__dirname, '../../.claude/docs/agencies/agencies.csv');
  const raw = fs.readFileSync(csvPath, 'utf-8');

  const lines: string[] = [];
  let currentLine = '';
  let inQuotes = false;
  for (const ch of raw) {
    if (ch === '"') inQuotes = !inQuotes;
    if ((ch === '\n' || ch === '\r') && !inQuotes) {
      if (currentLine.trim()) lines.push(currentLine);
      currentLine = '';
    } else if (ch !== '\r') {
      currentLine += ch;
    }
  }
  if (currentLine.trim()) lines.push(currentLine);

  const header = parseCSVLine(lines[0]);
  console.log(`CSV: ${lines.length - 1} rows, ${header.length} columns`);
  console.log('Columns:', header.join(' | '));

  let created = 0, skipped = 0;
  for (let i = 1; i < lines.length; i++) {
    const f = parseCSVLine(lines[i]);
    const name = f[1];
    if (!name) { skipped++; continue; }

    const existing = await prisma.agency.findFirst({ where: { name } });
    if (existing) { skipped++; continue; }

    const nickname = f[2] || null;
    const address = [f[4], f[5]].filter(Boolean).join(', ') || null;
    const city = f[7] || null;
    const country = f[9] || null;
    const phone = f[10] || null;
    const category = f[11] || null;
    const paymentMethod = f[13] || null;
    const note = [
      f[14] ? `Comment: ${f[14]}` : null,
      f[17] ? `Group: ${f[17]}` : null,
      paymentMethod ? `Payment: ${paymentMethod}` : null,
      country ? `Country: ${country}` : null,
    ].filter(Boolean).join('\n') || null;

    const contactFirstName = f[19] || '';
    const contactLastName = f[20] || '';
    const contactPerson = [contactFirstName, contactLastName].filter(Boolean).join(' ') || null;
    const email = f[21] || null;
    const commissionRate = parseCommissionRate(f[22]);

    await prisma.agency.create({
      data: {
        name,
        nickname,
        email,
        phone,
        category,
        commissionRate,
        contactPerson,
        note,
      } as any,
    });
    created++;
    if (created % 50 === 0) process.stdout.write(`\r  Imported ${created}...`);
  }

  console.log(`\nDone: ${created} created, ${skipped} skipped`);
  await prisma.$disconnect();
  await pool.end();
}

main().catch(e => { console.error(e); process.exit(1); });
