# Issue 49 -- Elena Saduchina / July Challenge 14-day window
Reporter: TB | Area: SIS July Challenge | Sheet row: 51

## Symptom
Elena linked her Instagram Reels in SIS on Jul 31. App showed "wait 14 days to upload screenshot" -- pushing her deadline to Aug 14 and blocking her from the July Challenge leaderboard.

## Root Cause (original)
src/scripts/student.ts: 14-day window anchored on createdAt (link-submission time), not actual Instagram post date.

## Fix -- SHIPPED 31 Jul 2026
Code confirmed live in src/scripts/student.ts:
  1. Upload gate removed -- screenshots can be uploaded at any time (no "wait 14 days" block)
  2. Window anchor uses postedAt (captured at URL-submit time), falls back to createdAt (line 657)
  3. Eligibility computed at screenshot upload: eligible = shotDate <= anchor + 14 days (lines 1008-1026)
  4. Anti-cheat: future-dated postedAt clamped to now (line 973)

## Elena DB State (2nd check, Fri 31 Jul 2026 UTC)
Student 14547, all 3 content records:
  ID 18: createdAt=2026-07-16, postedAt=null, shotDate=null, eligible=null
  ID 19: createdAt=2026-07-16, postedAt=null, shotDate=null, eligible=null
  ID 20: createdAt=2026-07-16, postedAt=null, shotDate=null, eligible=null

Implications:
  - postedAt=null (records predate "Date posted?" prompt -- no backfill was done)
  - Anchor = createdAt = 2026-07-16; 14-day window ended 2026-07-30 (expired yesterday)
  - Elena CAN now upload screenshots (gate removed) -- blocking complaint RESOLVED
  - Screenshots taken today (Jul 31+) will be eligible=false (window expired)

## Optional Data Fix (NOT YET RUN -- Neil to decide)
To make Elena leaderboard-eligible, backfill postedAt to actual Instagram post dates:

  UPDATE student_challenge_content SET posted_at = '2026-07-14 22:51:00+00' WHERE id = 18 AND student_id = 14547;
  UPDATE student_challenge_content SET posted_at = '2026-07-17 19:28:00+00' WHERE id = 19 AND student_id = 14547;
  UPDATE student_challenge_content SET posted_at = '2026-07-21 19:38:00+00' WHERE id = 20 AND student_id = 14547;

After backfill, windows become:
  ID 18: Jul 14 + 14 = Jul 28 -- expired (screenshot must predate Jul 28)
  ID 19: Jul 17 + 14 = Jul 31 -- expires TODAY (upload screenshot immediately if available)
  ID 20: Jul 21 + 14 = Aug 4 -- 4 days left (upload screenshot dated on or before Aug 4)

## Risk
Category: data-hygiene / challenge logic. Reversible. Blast radius: student 14547 only.

## Status
PRIMARY FIX (upload gate): SHIPPED -- code confirmed in student.ts.
DATA BACKFILL (postedAt / leaderboard): NOT YET RUN -- optional, Neil to decide.
Last checked: Fri 31 Jul 2026 UTC (2nd check).