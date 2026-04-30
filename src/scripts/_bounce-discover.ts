import dotenv from 'dotenv';
dotenv.config();
const PAT = process.env.ACCESS_TOKEN!;
const HS = 'https://api.hubapi.com';
async function hs(p: string): Promise<any> {
  const r = await fetch(HS + p, { headers: { Authorization: `Bearer ${PAT}` } });
  if (!r.ok) throw new Error(`GET ${p} → ${r.status} ${await r.text()}`);
  return r.json();
}
(async () => {
  console.log('── Inboxes ─────');
  const inboxes: any = await hs('/conversations/v3/conversations/inboxes');
  for (const i of inboxes.results || []) console.log(`  id=${i.id}  name="${i.name}"  type=${i.type || ''}`);

  console.log('\n── Channel accounts ─────');
  const channels: any = await hs('/conversations/v3/conversations/channel-accounts?limit=100');
  for (const c of channels.results || []) {
    console.log(`  id=${c.id}  inbox=${c.inboxId}  type=${c.deliveryIdentifier?.type || '—'}  value=${c.deliveryIdentifier?.value || '—'}  name="${c.name || ''}"`);
  }
})().catch(e => { console.error(e); process.exit(1); });
