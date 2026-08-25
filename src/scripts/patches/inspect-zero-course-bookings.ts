import 'dotenv/config';
import https from 'https';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../generated/prisma/client';

const HS_TOKEN = process.env.ACCESS_TOKEN!;
function hsGet(p: string): Promise<any> {
  return new Promise((res, rej) => {
    https.get({ hostname: 'api.hubapi.com', path: p, headers: { Authorization: `Bearer ${HS_TOKEN}` } }, (r) => {
      let d = ''; r.on('data', (c: string) => d += c); r.on('end', () => { try { res(JSON.parse(d)); } catch (e) { rej(e); } });
    }).on('error', rej);
  });
}
function hsPost(p: string, b: any): Promise<any> {
  return new Promise((res, rej) => {
    const s = JSON.stringify(b);
    const req = https.request({ hostname: 'api.hubapi.com', path: p, method: 'POST', headers: { Authorization: `Bearer ${HS_TOKEN}`, 'Content-Type': 'application/json' } }, (r) => {
      let d = ''; r.on('data', (c: string) => d += c); r.on('end', () => { try { res(JSON.parse(d)); } catch (e) { res(d); } });
    });
    req.on('error', rej); req.write(s); req.end();
  });
}

(async () => {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const p = new PrismaClient({ adapter } as any);
  const ids = [102, 17836, 17860, 17891, 17893];
  for (const id of ids) {
    const b: any = await p.booking.findUnique({ where: { id }, include: { student: true } });
    if (!b) { console.log(`Booking ${id} not found`); continue; }
    console.log(`\n=== Booking ${id} — ${b.student?.firstName} ${b.student?.lastName} (deal ${b.hubspotDealId}) ===`);
    if (!b.hubspotDealId) continue;
    const la = await hsGet(`/crm/v3/objects/deals/${b.hubspotDealId}/associations/line_items`);
    const liIds = (la.results || []).map((x: any) => x.id);
    if (liIds.length === 0) { console.log('  no line items'); continue; }
    const ld = await hsPost('/crm/v3/objects/line_items/batch/read', { inputs: liIds.map((x: string) => ({ id: x })), properties: ['name', 'hs_sku', 'quantity', 'price', 'amount', 'description'] });
    for (const li of (ld.results || [])) {
      const pp = li.properties || {};
      console.log(`  SKU=${(pp.hs_sku || '—').padEnd(12)} qty=${pp.quantity}  €${pp.amount}  name="${pp.name || ''}"  desc="${(pp.description || '').slice(0, 60)}"`);
    }
  }
  await p.$disconnect();
})().catch(e => { console.error(e); process.exit(1); });
