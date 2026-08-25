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
(async () => {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const p = new PrismaClient({ adapter } as any);
  const b: any = await p.booking.findUnique({ where: { id: 17891 } });
  console.log('Booking 17891 serviceStart/end:', b.serviceStart, '->', b.serviceEnd, 'amountTotal:', b.amountTotal?.toString());
  const d = await hsGet(`/crm/v3/objects/deals/${b.hubspotDealId}?properties=dealname,course_start,course_end,course_weeks,createdate,closedate,amount`);
  console.log('Deal props:', JSON.stringify(d.properties, null, 2));
  await p.$disconnect();
})().catch(e => { console.error(e); process.exit(1); });
