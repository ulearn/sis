const fs = require('fs');
const f = '/home/hub/web/hub.ulearnschool.com/public_html/hubapp/index.js';
let s = fs.readFileSync(f, 'utf8');
if (s.includes("app.post('/hubapp/challenges'")) { console.log('POST route already present — no change'); process.exit(0); }
const anchor =
"app.get('/hubapp/challenges', (req, res) => {\n" +
"  try { res.json({ success: true, months: challenges.MONTHLY_CHALLENGES }); }\n" +
"  catch (e) { res.status(500).json({ success: false, error: String(e) }); }\n" +
"});";
if (!s.includes(anchor)) { console.error('ANCHOR NOT FOUND — aborting'); process.exit(1); }
const post = anchor + "\n" +
"// Challenge schedule WRITE — used by the Challenges dashboard. Validates + atomic-writes challenges.json.\n" +
"// NOTE: currently UNAUTHENTICATED like the rest of the hub tooling — see .claude/challenges-handover/ for the lockdown plan.\n" +
"app.post('/hubapp/challenges', (req, res) => {\n" +
"  try {\n" +
"    const body = (req.body && req.body.months) ? req.body.months : req.body;\n" +
"    const saved = challenges.saveChallenges(body);\n" +
"    res.json({ success: true, months: saved });\n" +
"  } catch (e) { res.status(400).json({ success: false, error: String((e && e.message) || e) }); }\n" +
"});";
s = s.replace(anchor, post);
fs.writeFileSync(f, s);
console.log('POST /hubapp/challenges route added');
