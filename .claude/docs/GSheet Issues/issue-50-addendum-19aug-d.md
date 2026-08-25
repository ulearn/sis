Issue 50 - Checkout Double-Submit / Stale BAs (10th check, Wed 19 Aug 2026 UTC)
Reporter: KC | Area: Booking/Accomm | Sheet row: 52

Symptom: Submitting current-week checkouts also queues prior-week BAs.

Root cause (updated 19 Aug 2026, 10th check):
35 stale-active Booking Accommodations (active=true, ended before today) -- expanded from 28 at 7:13 AM.
Group C (7 newly found) includes null-bed BAs excluded from morning query filter.

GROUP A - Recently ended (10, ended Aug 9-16):
  BA 11360: bed 168, booking 18188, ended 8 Aug (11d), fee EUR 210
  BA 11179: bed 83, booking 82, ended 9 Aug (10d), fee EUR 1,360
  BA 11361: bed 66, booking 18190, ended 9 Aug (10d), fee EUR 750
  BA 11394: bed 89, booking 17826, ended 9 Aug (10d), fee null
  BA 11355: bed 161, booking 18175, ended 9 Aug (10d), fee EUR 1,360
  BA 11277: bed 156, booking 17890, ended 9 Aug (10d), fee EUR 3,360
  BA 27:    bed 59, booking 17853, ended 15 Aug (4d), fee EUR 480
  BA 11357: bed 178, booking 18180 (Giampaolo Russo), ended 15 Aug (4d), fee EUR 1,250 -- also Issue 41
  BA 11371: bed 157, booking 18188, ended 16 Aug (3d), fee null
  BA 11286: bed 87, booking 17911, ended 16 Aug (3d), fee EUR 2,520

GROUP B - Older stale BAs (18, ended Jul 4 - Aug 5):
  BA 11374: bed 194, booking 18228, ended 5 Aug (14d), fee EUR 555
  BA 11338: bed 33, booking 18145, ended 2 Aug (17d), fee null
  BA 23:    bed 168, booking 17842, ended 2 Aug (17d), fee EUR 720
  BA 11358: bed 180, booking 17831, ended 2 Aug (17d), fee EUR 900
  BA 11382: bed 189, booking 18239, ended 1 Aug (18d), fee EUR 300
  BA 29:    bed 177, booking 17828, ended 26 Jul (24d), fee EUR 4,560
  BA 26:    bed 178, booking 17845, ended 25 Jul (25d), fee EUR 1,920
  BA 11312: bed 161, booking 17984, ended 25 Jul (25d), fee EUR 1,020
  BA 11366: bed 189, booking 18212, ended 25 Jul (25d), fee EUR 400
  BA 11184: bed 188, booking 78, ended 25 Jul (25d), fee EUR 900
  BA 11265: bed 157, booking 1274, ended 19 Jul (31d), fee null
  BA 11257: bed 168, booking 7, ended 18 Jul (32d), fee EUR 720
  BA 11365: bed 174, booking 18184, ended 18 Jul (32d), fee EUR 420
  BA 11352: bed 83, booking 18156, ended 11 Jul (39d), fee EUR 360
  BA 11339: bed 59, booking 17912, ended 4 Jul (46d), fee null
  BA 11247: bed 161, booking 17, ended 4 Jul (46d), fee EUR 329.41
  BA 11167: bed 168, booking 93, ended 4 Jul (46d), fee EUR 211.25
  BA 11285: bed 83, booking 17825, ended 5 Jul (45d), fee null

GROUP C - Ancient stale BAs (7 newly found, ended Jun 27 - Aug 15):
  BA 11230: no bed, booking 32, ended 15 Aug (4d), fee EUR 2,100
  BA 11278: bed 190, booking 17892, ended 27 Jun (53d), fee EUR 960
  BA 11354: bed 186, booking 94, ended 28 Jun (52d), fee null
  BA 11362: no bed, booking 18192, ended 30 Jun (50d), fee EUR 120
  BA 11276: no bed, booking 17876, ended 11 Jul (39d), fee null
  BA 11174: no bed, booking 87, ended 19 Jul (31d), fee EUR 750
  BA 11347: no bed, booking 18157, ended 23 Jul (27d), fee null

Fee = null summary (9 BAs): 11371, 11394, 11338, 11347, 11265, 11276, 11285, 11339, 11354

Fix recipe (NOT YET RUN):
Step 1: Verify Group A checkouts with KC/Paul (10 BAs, Aug 9-16).
Step 2: UPDATE booking_accommodation SET active = false WHERE id IN
        (11360,11179,11361,11394,11355,11277,27,11357,11371,11286);
        NOTE: BA 11357 overlaps Issue 41 (Giampaolo) -- coordinate.

Step 3: Verify Group B checkouts. BAs with fee=null need fee confirmed first.
Step 4: UPDATE booking_accommodation SET active = false WHERE id IN
        (11374,11338,23,11358,11382,29,26,11312,11366,11184,
         11265,11257,11365,11352,11339,11247,11167,11285);

Step 5: Investigate Group C null-bed BAs (11230,11362,11276,11174,11347) -- likely legacy entries.
Step 6: UPDATE booking_accommodation SET active = false WHERE id IN
        (11230,11278,11354,11362,11276,11174,11347) -- ONLY after Step 5 verification.

Step 7: Code fix -- restrict checkout window to current week only.
        File: src/routes/accommodation.ts. Filter: endDate >= monday_this_week AND endDate < monday_next_week.

Risk: accommodation (35 records). Reversible (SET active = true). Null-bed Group C needs extra care.
Status: OPEN -- Fix NOT RUN | Last checked: Wed 19 Aug 2026 UTC (10th check)
