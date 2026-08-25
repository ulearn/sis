Issue 50 — Stale Booking Accommodations (count corrected: 151)

Reporter: KC | Area: Booking / Accomm | Sheet row: 52

Symptom: Weekly checkout submission reports more checkouts than entered.
Root cause: Stale active Booking Accommodations with past end dates — none deactivated since issue opened.

Count correction (463rd run, Sat 22 Aug 2026 UTC — 23rd issue check)

Morning run (462nd) used end_date < 2026-08-22 — excluded 8 BAs ending exactly today.
Correct count with end_date <= 2026-08-22: 151

Run 459th (Fri 21 Aug): 143 stale (endDate < Aug 21)
Run 462nd morning (Sat 22 Aug): 149 stale (endDate < Aug 22 — undercounted by 6)
Run 463rd evening (Sat 22 Aug): 151 stale (endDate <= Aug 22 — correct)

8 BAs that expired today (22 Aug 2026, still active):

• BA 11160 (bed 174): Aug 8 to Aug 22, fee EUR 420
• BA 11161 (bed 168): Aug 8 to Aug 22, fee EUR 420
• BA 11177 (no bed): Aug 15 to Aug 22, fee EUR 200
• BA 11311 (bed 84): Jun 28 to Aug 22, fee EUR 3,850 — Pietro Caccianiga (Issue 36b)
• BA 11340 (bed 88): Jun 27 to Aug 22, fee EUR 1 — Theodore Bolt (student 14556, booking 18150) — fee=1 suspicious placeholder
• BA 11387 (bed 89): Aug 9 to Aug 22, fee null — Vincenzo Gagliano (student 2962, booking 18175)
• BA 11395 (bed 59): Aug 15 to Aug 22, fee EUR 250
• BA 11396 (bed 44): Aug 15 to Aug 22, fee null — Giampaolo Russo (Issue 41)

Oldest stale BAs:
• BA 11237: ended 31 Jan 2026, fee EUR 1,400 — 203 days stale
• BA 11254 (bed null): ended 1 Feb 2026
• BA 11236 (bed null): ended 7 Feb 2026

Fix recipe (NOT YET RUN):

Run from sis/ with: node --env-file=.env -e [script below]

  const {PrismaClient} = require("./dist/generated/prisma/client");
  const {PrismaPg} = require("@prisma/adapter-pg");
  const p = new PrismaClient({adapter: new PrismaPg({connectionString: process.env.DATABASE_URL})});
  (async () => {
    const boundary = new Date("2026-08-23T00:00:00.000Z");
    const yr2026 = new Date("2026-01-01T00:00:00.000Z");
    const stale = await p.bookingAccommodation.findMany({
      where: { active: true, endDate: { lt: boundary, gte: yr2026 } },
      select: { id: true, endDate: true, fee: true, bedId: true },
      orderBy: { endDate: "asc" }
    });
    console.log("Count:", stale.length);
    // UNCOMMENT TO RUN:
    // const r = await p.bookingAccommodation.updateMany({
    //   where: { active: true, endDate: { lt: boundary, gte: yr2026 } },
    //   data: { active: false }
    // });
    // console.log("Deactivated:", r.count);
    await p.$disconnect();
  })();

Note: Before running — verify BA 11340 (Theodore Bolt) fee of EUR 1 is correct; verify BA 11387 (Vincenzo Gagliano) fee is set.

Risk: data-hygiene | Reversible: yes (set active=true) | Blast radius: 151 rows

Status: Fix NOT RUN | Last checked: 2026-08-22 UTC (463rd global run, 23rd issue check)