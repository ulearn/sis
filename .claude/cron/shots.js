// Capture Play Store phone screenshots (1080x1920, exact 9:16) of the student app
// as the demo reviewer. Fresh load per shot for clean, single-section framing.
const puppeteer = require('puppeteer');
const path = require('path');

const OUT = '/home/sis/web/sis.ulearnschool.com/public_html/sis/public/launch';
const BASE = 'https://sis.ulearnschool.com';
const USER = 'app-review@ulearnschool.com';
const PASS = 'ULearnReview2026!';
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function expand(page, label) {
  // click the .card-header whose title contains `label`, then bring it just
  // under the fixed top bar
  await page.evaluate((label) => {
    const hdr = [...document.querySelectorAll('.card-header')]
      .find(h => h.innerText.trim().toLowerCase().includes(label.toLowerCase()));
    if (hdr) { hdr.click(); hdr.scrollIntoView(true); window.scrollBy(0, -150); }
  }, label);
}

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 360, height: 640, deviceScaleFactor: 3 });

  await page.goto(`${BASE}/sis/login`, { waitUntil: 'networkidle2' });
  await page.type('#username', USER);
  await page.type('#password', PASS);
  await Promise.all([ page.click('button[type="submit"]'), page.waitForNavigation({ waitUntil: 'networkidle2' }).catch(()=>{}) ]);
  await sleep(1200);

  const load = async () => { await page.goto(`${BASE}/sis/student`, { waitUntil: 'networkidle2' }); await sleep(2200); };
  const shoot = async (n) => { await page.screenshot({ path: path.join(OUT, n) }); console.log('shot', n); };

  // 1) Home hub — all collapsed
  await load();
  await shoot('shot-1-home.png');

  // 2) Personal expanded
  await load(); await expand(page, 'Personal'); await sleep(900);
  await shoot('shot-2-personal.png');

  // 3) Documents expanded
  await load(); await expand(page, 'Documents'); await sleep(1200);
  await shoot('shot-3-documents.png');

  // 4) Social expanded (real activity data loads lazily)
  await load(); await expand(page, 'Social'); await sleep(3000);
  await shoot('shot-4-social.png');

  await browser.close();
  console.log('done');
})().catch(e => { console.error(e); process.exit(1); });
