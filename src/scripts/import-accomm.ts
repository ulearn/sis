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

async function main() {
  const csvPath = path.join(__dirname, '../../.claude/docs/accomm/accommodation_resources_accommodation_provider.csv');
  const raw = fs.readFileSync(csvPath, 'utf-8');

  // Split handling multiline quoted fields
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
  console.log(`CSV has ${lines.length - 1} rows, ${header.length} columns`);

  let created = 0, skipped = 0;
  for (let i = 1; i < lines.length; i++) {
    const fields = parseCSVLine(lines[i]);
    const name = fields[1]; // Name column
    if (!name) { skipped++; continue; }

    const category = fields[3] || 'Host Family';
    const firstName = fields[4] || '';
    const surname = fields[5] || '';
    const address = fields[6] || null;
    const addressAddon = fields[7] || null;
    const zip = fields[8] || null;
    const city = fields[9] || null;
    const phone = fields[10] || null;
    const phone2 = fields[11] || null;
    const mobile = fields[12] || null;
    const email = fields[13] || null;
    const description = fields[14] || null;
    const iban = fields[28] || null;

    // Check if already exists
    const existing = await prisma.accommodationProvider.findFirst({ where: { name } });
    if (existing) { skipped++; continue; }

    const contactPerson = [firstName, surname].filter(Boolean).join(' ') || null;

    await prisma.accommodationProvider.create({
      data: {
        name,
        type: category,
        contactPerson,
        email,
        phone: phone || mobile || null,
        phone2: phone2 || null,
        mobile: mobile || null,
        address: [address, addressAddon].filter(Boolean).join(', ') || null,
        zip,
        city,
        description,
        note: iban ? `IBAN: ${iban}` : null,
        active: true,
      } as any,
    });
    created++;
    process.stdout.write(`\r  Imported ${created}...`);
  }

  console.log(`\nDone: ${created} created, ${skipped} skipped`);
  await prisma.$disconnect();
  await pool.end();
}

main().catch(e => { console.error(e); process.exit(1); });
