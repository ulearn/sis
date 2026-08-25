/**
 * Grandfather backfill for the Student Agreement gate.
 *
 * Neil's rule: anyone who ALREADY created their ULearn account before the gate
 * launched shouldn't be forced to sign after the fact ("the horse has bolted").
 * This stamps Student.contractSignedAt for every such student so the gate never
 * surfaces for them, and records a StudentSignature (mode='grandfathered') for
 * an honest audit trail (they didn't actually sign).
 *
 * "Has an account" mirrors the has_account flag exactly: an ACTIVE SisUser with
 * userType='student' whose email matches the student's email (lowercased).
 *
 * SAFE BY DEFAULT: prints a preview and writes nothing. Pass --commit to write.
 *   node dist/scripts/backfill-student-contract-grandfather.js          (dry)
 *   node dist/scripts/backfill-student-contract-grandfather.js --commit
 */
import dotenv from 'dotenv';
import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';

dotenv.config();

const GRANDFATHER_VERSION = 'grandfathered-2026-07';

async function main() {
  const commit = process.argv.includes('--commit');
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool as any) });

  try {
    // Active student accounts → set of emails.
    const accts = await prisma.sisUser.findMany({
      where: { userType: 'student', active: true, email: { not: null } },
      select: { email: true },
    });
    const acctEmails = new Set(accts.map(a => (a.email || '').toLowerCase()).filter(Boolean));
    console.log(`Active student accounts: ${acctEmails.size} distinct emails`);

    // Students not yet stamped whose email matches an account.
    const students = await prisma.student.findMany({
      where: { contractSignedAt: null, email: { not: '' } },
      select: { id: true, firstName: true, lastName: true, email: true },
    });
    const targets = students.filter(s => s.email && acctEmails.has(s.email.toLowerCase()));

    console.log(`Students with an account but no contract stamp: ${targets.length}${commit ? '' : ' (DRY RUN — nothing written)'}`);
    targets.slice(0, 20).forEach(s => console.log(`  · ${s.id} ${s.firstName ?? ''} ${s.lastName ?? ''} <${s.email}>`));
    if (targets.length > 20) console.log(`  … and ${targets.length - 20} more`);

    if (!commit) {
      console.log('\nRe-run with --commit to grandfather these students.');
      return;
    }

    const stampedAt = new Date();
    let done = 0;
    for (const s of targets) {
      await prisma.$transaction([
        prisma.student.update({ where: { id: s.id }, data: { contractSignedAt: stampedAt } }),
        prisma.studentSignature.create({
          data: {
            studentId: s.id,
            signerName: [s.firstName, s.lastName].filter(Boolean).join(' ') || 'Grandfathered',
            signerEmail: s.email,
            mode: 'grandfathered',
            contractVersion: GRANDFATHER_VERSION,
          },
        }),
      ]);
      done++;
    }
    console.log(`\nGrandfathered ${done} student(s) at ${stampedAt.toISOString()}.`);
  } catch (e) {
    console.error('backfill error:', e);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
