/**
 * One-off: create a partner-portal account for Yin Zheng so Neil can
 * email him credentials before he self-registers. Links to:
 *   - SIS Agency #608 (Henan Zhengyuan Consulting Agency Service Co., Ltd)
 *   - HubSpot Contact 764378660062
 *   - HubSpot Company 429779128506 (already on agency)
 *
 * Also patches Agency.primaryContactId so the partner-contract render
 * can look up Yin's HubSpot Contact for name/title/email.
 */
import dotenv from 'dotenv';
dotenv.config();
import crypto from 'crypto';

const AGENCY_ID = 608;
const HUBSPOT_CONTACT_ID = '764378660062';
const USERNAME = 'yin.zheng';
const EMAIL = 'ynkmww3@126.com';
const DISPLAY_NAME = 'Yin Zheng';

function genPassword(len = 14): string {
  // Alphanum, mixed case, no ambiguous chars (0/O, l/1).
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let s = '';
  while (s.length < len) {
    const b = crypto.randomBytes(1)[0];
    if (b < alphabet.length * Math.floor(256 / alphabet.length)) s += alphabet[b % alphabet.length];
  }
  return s;
}

async function main() {
  const { Pool } = await import('pg');
  const { PrismaPg } = await import('@prisma/adapter-pg');
  const { PrismaClient } = await import('../generated/prisma/client');
  const bcrypt = (await import('bcryptjs')).default;
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool as any);
  const prisma = new PrismaClient({ adapter } as any);
  try {
    // Safety: refuse if username or email already exists.
    const u1 = await prisma.sisUser.findUnique({ where: { username: USERNAME } });
    if (u1) { console.error(`[create] username "${USERNAME}" already in use as user #${u1.id} — aborting`); process.exit(2); }
    const u2 = await prisma.sisUser.findFirst({ where: { email: EMAIL } });
    if (u2) { console.error(`[create] email "${EMAIL}" already in use as user #${u2.id} — aborting`); process.exit(2); }

    // 1) Patch agency.primaryContactId so the contract renderer can fetch
    //    Yin's HubSpot Contact (name/title/email/etc).
    await prisma.agency.update({
      where: { id: AGENCY_ID },
      data: { primaryContactId: HUBSPOT_CONTACT_ID, primaryEntityType: 'company' },
    });
    console.log(`[create] Patched Agency #${AGENCY_ID}.primaryContactId = ${HUBSPOT_CONTACT_ID}`);

    // 2) Create the SisUser
    const password = genPassword(14);
    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = await prisma.sisUser.create({
      data: {
        username: USERNAME,
        email: EMAIL,
        passwordHash,
        displayName: DISPLAY_NAME,
        role: 'partner',
        userType: 'partner',
        agencyId: AGENCY_ID,
        hubspotContactId: HUBSPOT_CONTACT_ID,
        portalPermissions: JSON.stringify({ canSeeFinance: true, canSeeClasses: true, canSeeDocuments: true }),
        active: true,
      },
    });

    console.log('\n========== CREDENTIALS — copy these to Yin ==========');
    console.log(`Portal:    https://sis.ulearnschool.com/sis/partners/login`);
    console.log(`Username:  ${USERNAME}`);
    console.log(`Email:     ${EMAIL}`);
    console.log(`Password:  ${password}`);
    console.log(`SisUser #: ${newUser.id}`);
    console.log('=====================================================');
    console.log('Notes:');
    console.log(' - On first login he will see the partner agreement signing modal');
    console.log(' - With commissionRate=null on his agency, the zero-commission template is served');
    console.log(' - Once signed, the modal is gone permanently');
    console.log(' - He can change his password via Forgot Password if he wants');
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}
main().catch(e => { console.error('Fatal:', e); process.exit(1); });
