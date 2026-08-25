// One-off: normalise paragraph spacing across email templates so every <p>
// carries a guaranteed bottom margin (house convention 16px) → a clear blank
// line between paragraphs in ALL email clients (bare <p> collapses in Gmail).
// Idempotent: skips <p> that already declare a margin. DRY-RUN unless --apply.
require('dotenv').config();
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('../../dist/generated/prisma/client');
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const GAP = 'margin:0 0 16px';
const APPLY = process.argv.includes('--apply');

// Add a bottom margin to every <p> opening tag that lacks one. Preserves any
// existing attributes/styles; only touches paragraphs with no margin declared.
function normalise(html) {
  let touched = 0;
  const out = html.replace(/<p(\s[^>]*)?>/gi, (full, attrs) => {
    attrs = attrs || '';
    const styleM = attrs.match(/style\s*=\s*"([^"]*)"/i);
    if (styleM) {
      if (/margin/i.test(styleM[1])) return full;            // already spaced — leave
      const newStyle = styleM[1].trim().replace(/;?\s*$/, '') + ';' + GAP;
      touched++;
      return `<p${attrs.replace(styleM[0], `style="${newStyle}"`)}>`;
    }
    touched++;
    return `<p${attrs} style="${GAP}">`;
  });
  return { out, touched };
}

(async () => {
  const rows = await prisma.documentTemplate.findMany({
    where: { templateType: 'email' },
    select: { id: true, name: true, htmlTemplate: true },
    orderBy: { id: 'asc' },
  });
  let changed = 0, brOnly = [];
  for (const r of rows) {
    const h = r.htmlTemplate || '';
    const pCount = (h.match(/<p[\s>]/gi) || []).length;
    if (pCount === 0) { brOnly.push(`#${r.id} ${r.name}`); continue; }
    const { out, touched } = normalise(h);
    if (touched > 0 && out !== h) {
      changed++;
      console.log(`#${r.id}  +${touched} para-gaps  ${r.name}`);
      if (APPLY) await prisma.documentTemplate.update({ where: { id: r.id }, data: { htmlTemplate: out } });
    }
  }
  console.log(`\n${APPLY ? 'APPLIED' : 'DRY-RUN'} — ${changed} p-based templates ${APPLY ? 'updated' : 'would change'}.`);
  console.log(`\nNon-<p> (br-based / other) needing manual eyeball:\n  ${brOnly.join('\n  ')}`);
  process.exit(0);
})().catch(e => { console.error(e.message); process.exit(1); });
