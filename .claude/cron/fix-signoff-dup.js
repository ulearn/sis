// One-off: remove manual team sign-offs that duplicate the auto-appended
// signature ("____ ULearn Team + address"). Keeps the salutation + personal
// names. Literal (non-regex) replacements for safety. DRY-RUN unless --apply.
require('dotenv').config();
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('../../dist/generated/prisma/client');
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const APPLY = process.argv.includes('--apply');

// id → { from (exact substring), to }
const EDITS = {
  29: { from: 'Kind regards,<br>The ULearn Team</p>', to: 'Kind regards,</p>' },
  34: { from: '<br /><br /><span>ULearn Accomm&nbsp;Team</span>', to: '' },
  36: { from: 'Best regards<br /><br />The ULearn Team</div>', to: 'Best regards</div>' },
  37: { from: 'Best regards<br /><br />The ULearn Team</div>', to: 'Best regards</div>' },
  41: { from: '<div>Kind regards,</div>\n<div><br></div>\n<div>______________________</div>\n<div>ULearn Accomm Team</div>', to: '<div>Kind regards,</div>' },
  46: { from: 'Best regards, <br />{{institution.name}}</p>', to: 'Best regards,</p>' },
  48: { from: '<p style="margin:0 0 16px">Best wishes from everyone!</p>\n<p style="margin:0 0 16px">The {{institution.name}} Team</p>', to: '<p style="margin:0 0 16px">Best wishes from everyone!</p>' },
  51: { from: '<p style="margin:0 0 16px">Best regards,</p>\n<p style="margin:0 0 16px"><br />_____________</p>\n<p style="margin:0 0 16px">ULearn Team</p>', to: '<p style="margin:0 0 16px">Best regards,</p>' },
  59: { from: 'Best regards<br /><br />The ULearn Team', to: 'Best regards' },
  60: { from: 'Best regards<br /><br />The ULearn Team</span>', to: 'Best regards</span>' },
  62: { from: 'Best regards<br /><br />The ULearn Team</span>', to: 'Best regards</span>' },
  63: { from: 'Best regards<br /><br />The ULearn Team</span>', to: 'Best regards</span>' },
  64: { from: 'Best regards,<br /><br />The ULearn Team', to: 'Best regards,' },
  65: { from: 'Best<br /><br />The ULearn Team,', to: 'Best' },
  66: { from: 'Best<br /><br />The ULearn Team,', to: 'Best' },
  67: { from: 'Regards<br /><br />The ULearn Team</p>', to: 'Regards</p>' },
  68: { from: 'Thank You,<br /><br />___________<br /><br />ULearn Team', to: 'Thank You,' },
  80: { from: '<div>Kind regards,</div>\n<div><br></div>\n<div><br></div>\n<div><br></div>\n<div>______________________</div>\n<div>ULearn Accomm Team</div>', to: '<div>Kind regards,</div>' },
  81: { from: '<div class="gmail_default">Best</div>\n<div class="gmail_default"></div>\n<div class="gmail_default">The ULearn Team&nbsp; &nbsp;</div>', to: '<div class="gmail_default">Best</div>' },
};

(async () => {
  let ok = 0, miss = 0;
  for (const [id, e] of Object.entries(EDITS)) {
    const t = await prisma.documentTemplate.findUnique({ where: { id: Number(id) } });
    if (!t) { console.log(`#${id}  NOT FOUND`); miss++; continue; }
    if (!t.htmlTemplate.includes(e.from)) { console.log(`#${id} ${t.name}  ✗ from-string NOT FOUND (skipped)`); miss++; continue; }
    const out = t.htmlTemplate.replace(e.from, e.to);
    ok++;
    console.log(`#${id} ${t.name}  ✓`);
    console.log(`   tail now: …${JSON.stringify(out.slice(-90))}`);
    if (APPLY) await prisma.documentTemplate.update({ where: { id: Number(id) }, data: { htmlTemplate: out } });
  }
  console.log(`\n${APPLY ? 'APPLIED' : 'DRY-RUN'} — ${ok} matched, ${miss} missed.`);
  process.exit(0);
})().catch(e => { console.error(e.message); process.exit(1); });
