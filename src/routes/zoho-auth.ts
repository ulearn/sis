import { Router } from 'express';
import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';

/**
 * Zoho People OAuth re-auth flow (SIS side).
 *
 * Used when the saved refresh token has been revoked/rotated and we need a fresh one.
 * Two routes:
 *   GET /zoho/auth/start    → redirect to Zoho consent
 *   GET /zoho/auth/callback → exchange code for tokens, save to ./zoho-tokens.json
 *
 * Requires the redirect URI below to be registered in Zoho's API Console for the
 * existing People client ID. Multiple URIs can be registered simultaneously, so
 * adding the SIS URI does not break the Hub flow.
 */
export function zohoAuthRoutes() {
  const router = Router();

  const clientId = process.env.ZOHO_CLIENT_ID || '';
  const clientSecret = process.env.ZOHO_CLIENT_SECRET || '';
  const accountsUrl = process.env.ZOHO_ACCOUNTS_DOMAIN || 'https://accounts.zoho.eu';
  // SIS-specific redirect URI — must be registered in Zoho API Console.
  const redirectUri = process.env.ZOHO_PEOPLE_SIS_REDIRECT_URI
    || 'https://sis.ulearnschool.com/sis/zoho/auth/callback';
  // Token file path: same as zoho-people-api.js writes to (project root).
  const tokenFile = path.join(__dirname, '..', '..', 'zoho-tokens.json');

  router.get('/start', (_req, res) => {
    const scope = 'ZohoPeople.forms.READ,ZohoPeople.leave.READ,ZohoPeople.leave.UPDATE,ZohoPeople.leave.CREATE';
    const params = new URLSearchParams({
      client_id: clientId,
      scope,
      response_type: 'code',
      redirect_uri: redirectUri,
      access_type: 'offline',
      prompt: 'consent',
    });
    res.redirect(`${accountsUrl}/oauth/v2/auth?${params.toString()}`);
  });

  router.get('/callback', async (req, res) => {
    const code = req.query.code as string | undefined;
    const error = req.query.error as string | undefined;
    if (error) {
      return res.status(400).send(`<h2>Zoho auth failed</h2><pre>${error}</pre><p><a href="/sis/admin">Back to admin</a></p>`);
    }
    if (!code) {
      return res.status(400).send('Missing code parameter');
    }

    try {
      const response = await axios.post(`${accountsUrl}/oauth/v2/token`, null, {
        params: {
          code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          grant_type: 'authorization_code',
        },
      });
      const { access_token, refresh_token, expires_in } = response.data;
      if (!access_token || !refresh_token) {
        return res.status(500).send(`<h2>Zoho returned invalid tokens</h2><pre>${JSON.stringify(response.data, null, 2)}</pre>`);
      }
      const expiresAt = Date.now() + (Number(expires_in) || 3600) * 1000;
      await fs.writeFile(tokenFile, JSON.stringify({
        access_token,
        refresh_token,
        expires_at: expiresAt,
        updated_at: new Date().toISOString(),
      }, null, 2));
      return res.send(`
        <html><head><title>Zoho re-authorised</title>
        <style>body{font-family:system-ui;padding:40px;max-width:560px;margin:auto;color:#1f2937}</style>
        </head><body>
        <h2 style="color:#16a34a">Zoho People re-authorised ✓</h2>
        <p>New refresh token saved. The "Refresh Leave" button on the Classes page should now work.</p>
        <p><a href="/sis/admin">Back to admin</a></p>
        </body></html>
      `);
    } catch (e: any) {
      const detail = e.response?.data || e.message;
      console.error('[zoho-auth] callback failed:', detail);
      return res.status(500).send(`
        <h2>Token exchange failed</h2>
        <pre>${JSON.stringify(detail, null, 2)}</pre>
        <p><a href="/sis/zoho/auth/start">Try again</a></p>
      `);
    }
  });

  return router;
}
