/**
 * Zoho Sign client — refresh-token OAuth + basic API wrapper.
 *
 * Data centre: EU (api-console.zoho.eu). Do not switch to .com URLs.
 */
import fs from 'fs';

const ACCOUNTS = process.env.ZOHO_ACCOUNTS_DOMAIN || 'https://accounts.zoho.eu';
const API = 'https://sign.zoho.eu/api/v1';

// Short-lived access token cache (Zoho refresh gives 1h tokens)
let cachedAccessToken: string | null = null;
let cachedExpiresAt = 0;

async function accessToken(): Promise<string> {
  if (cachedAccessToken && Date.now() < cachedExpiresAt - 60000) return cachedAccessToken;

  const body = new URLSearchParams({
    refresh_token: process.env.ZOHO_SIGN_REFRESH_TOKEN || '',
    client_id: process.env.ZOHO_SIGN_CLIENT_ID || '',
    client_secret: process.env.ZOHO_SIGN_CLIENT_SECRET || '',
    grant_type: 'refresh_token',
  });

  const res = await fetch(`${ACCOUNTS}/oauth/v2/token`, { method: 'POST', body });
  const data: any = await res.json();
  if (!data.access_token) throw new Error('Zoho token refresh failed: ' + JSON.stringify(data));
  cachedAccessToken = data.access_token;
  cachedExpiresAt = Date.now() + (data.expires_in || 3600) * 1000;
  return cachedAccessToken!;
}

async function signGet(path: string): Promise<any> {
  const tok = await accessToken();
  const res = await fetch(`${API}${path}`, { headers: { Authorization: `Zoho-oauthtoken ${tok}` } });
  return res.json();
}

async function signGetBinary(path: string): Promise<ArrayBuffer> {
  const tok = await accessToken();
  const res = await fetch(`${API}${path}`, { headers: { Authorization: `Zoho-oauthtoken ${tok}` } });
  if (!res.ok) throw new Error(`Zoho binary fetch ${path} failed: ${res.status}`);
  return res.arrayBuffer();
}

// Pull all signing requests (paginated). Zoho's default page size is 100.
export async function listAllRequests(): Promise<any[]> {
  const results: any[] = [];
  let start = 1;
  const pageSize = 100;
  while (true) {
    const q = encodeURIComponent(JSON.stringify({ page_context: { row_count: pageSize, start_index: start } }));
    const data = await signGet(`/requests?data=${q}`);
    const batch = data.requests || [];
    results.push(...batch);
    if (batch.length < pageSize) break;
    start += pageSize;
    if (start > 10000) break; // safety
  }
  return results;
}

// Download the signed PDF for a request and save to disk. Returns the file path.
export async function downloadPdf(requestId: string, destDir: string): Promise<string> {
  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
  const buf = await signGetBinary(`/requests/${requestId}/pdf`);
  const path = `${destDir}/${requestId}.pdf`;
  fs.writeFileSync(path, Buffer.from(buf));
  return path;
}
