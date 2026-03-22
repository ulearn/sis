import { XeroClient } from 'xero-node';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const TOKEN_FILE = path.join(__dirname, '../../xero-tokens.json');

const XERO_CONFIG = {
  clientId: process.env.XERO_CLIENT_ID || '',
  clientSecret: process.env.XERO_CLIENT_SECRET || '',
  redirectUris: [process.env.XERO_REDIRECT_URI || 'https://sis.ulearnschool.com/sis/xero/callback'],
  scopes: 'openid profile email accounting.settings accounting.transactions accounting.contacts accounting.attachments accounting.reports.read offline_access'.split(' '),
};

export function createXeroClient(): XeroClient {
  return new XeroClient(XERO_CONFIG);
}

export async function getAuthUrl(): Promise<string> {
  const xero = createXeroClient();
  const consentUrl = await xero.buildConsentUrl();
  return consentUrl;
}

export async function handleCallback(url: string): Promise<any> {
  const xero = createXeroClient();
  const tokenSet = await xero.apiCallback(url);
  await xero.updateTenants();
  const tenants = xero.tenants;

  const tokenData = {
    ...tokenSet,
    tenantId: tenants[0]?.tenantId,
    tenantName: tenants[0]?.tenantName,
    savedAt: new Date().toISOString(),
  };

  fs.writeFileSync(TOKEN_FILE, JSON.stringify(tokenData, null, 2));
  return tokenData;
}

export async function getAuthedXero(): Promise<{ xero: XeroClient; tenantId: string }> {
  if (!fs.existsSync(TOKEN_FILE)) {
    throw new Error('No Xero tokens found. Visit /sis/xero/auth to authorize.');
  }

  const tokens = JSON.parse(fs.readFileSync(TOKEN_FILE, 'utf-8'));
  const xero = createXeroClient();

  // Always set tokens first
  const tokenSet = await xero.setTokenSet(tokens);

  // Refresh if expired or about to expire
  const now = Date.now() / 1000;
  if (tokens.expires_at && now > tokens.expires_at - 60) {
    try {
      const newTokenSet = await xero.refreshWithRefreshToken(
        process.env.XERO_CLIENT_ID!,
        process.env.XERO_CLIENT_SECRET!,
        tokens.refresh_token
      );
      const tokenData = {
        ...newTokenSet,
        tenantId: tokens.tenantId,
        tenantName: tokens.tenantName,
        savedAt: new Date().toISOString(),
      };
      fs.writeFileSync(TOKEN_FILE, JSON.stringify(tokenData, null, 2));
      await xero.setTokenSet(tokenData);
    } catch (e: any) {
      throw new Error('Xero token refresh failed. Re-authorize at /sis/xero/auth. Error: ' + e.message);
    }
  }

  return { xero, tenantId: tokens.tenantId };
}
