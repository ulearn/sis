##   Directus - cut it ??

Three data layers in flight: Directus (REST + admin UI), PostgREST (/api/lms/*), and lms-api (/lms-api/*). PostgREST and Directus's REST overlap heavily — Directus is the more cuttable one if you want to consolidate later (move admin editing into the lms-api / SIS UI, swap prototype REST calls to PostgREST or lms-api). Not a small refactor, but not enormous either. Park it.















● All 5 phases are live. Status:

  Phase 1 — /prototype/        200    ✓
  Phase 1 — /LESSONS/          200    ✓
  Phase 2 — /api/lms/          200    ✓ (matches lms-side)
  Phase 3 — /api/lms/hubspot/  200    ✓ (matches lms-side)
  Phase 4 — /lms-api/health    200    ✓ ({"ok":true,...})
  Phase 5 — /api/lms/email/    400    ✓ (route reachable; 400
  = empty body, expected)
  @reboot cron installed       ✓
  lms-api PID 1213438 running  ✓

  Both hosts are now serving in parallel:
  - lms.ulearnschool.com/... — original (untouched, still
  authoritative)
  - sis.ulearnschool.com/... — mirrored (verified equivalent
  at the proxy level)

  Things you should follow up on

  1. Google OAuth redirect URIs — add any
  sis.ulearnschool.com/... URIs the LMS UI redirects through,
  in Cloud Console for client
  1093979884584-mfdl76lg23fumkmqb740v05lpf2ohn3n. Only matters
   when someone triggers a Drive auth flow on the new host.
  2. DB-touching smoke test — /health doesn't hit Postgres.
  Try a real route (/lms-api/auth/me after logging in, or any
  feedback/quiz route) to confirm DATABASE_URL resolves from
  sis-side. Likely fine since Postgres roles are
  user-agnostic, but worth one click-test.
  3. Browser-load both surfaces — visit
  sis.ulearnschool.com/prototype/ and click around to make
  sure no asset paths are absolute-coded for
  lms.ulearnschool.com.
  4. Prototype's LMS API base URL — if the prototype JS
  hardcodes https://lms.ulearnschool.com/api/lms/..., browsers
   loaded from sis.ulearnschool.com will hit the lms host
  (works, but defeats the purpose). Worth a grep on the
  prototype side after testing.

  What's still on the staging path

  - _nginx-staging/ files are now duplicates of what's
  installed — safe to leave for reference or remove.
  - INSTALL.md documents rollback (rm the conf file + reload)
  per phase.
  - Decommission steps for the eventual lms-user retirement
  are in INSTALL.md.

  Phase 5 (the email proxy) is technically working but
  currently a self-loop (sis nginx → sis Apache); it can be
  simplified to a direct local route once you decide whether
  to keep the X-Quiz-Secret indirection or wire it
  server-side.

  Migration done.

✻ Baked for 2m 32s

❯   - X-Quiz-Secret is mirrored verbatim from lms-side nginx; 
   rotate later if you want.                                  
                                                Good point -  
  the quiz is actually loaded into the website as an iframe - 
   it'll still work as we have code in both places but        
  ultimately should be replaced. Similarly we have "Send      
  Test" function here in the SIS which runs a bit of code     
  before sending out a "magic link" assessment test           
  1. Has the Student already completed the 20 qustion Quiz?   
  a) If no then send the Full Assessment Test (40 questions)  
  b) If yes then send the "delta" test (ie: the other 20      
  questions)                                                  
                                                              
  Finally then these result outcomes are properly complied    
  and (where the delta was necessary) merged into a final     
  assessment socre in the SIS.... Again that should all keep  
  working as the code remains for now on the LMS also but     
  ultimately we're gonna wanna update the references to this  
  new code lcation etc                                        

● Right — iframe pattern means the quiz UI loads cross-origin
  transparently. The cutover is at the SIS↔LMS API edge: as
  long as SIS keeps calling lms.ulearnschool.com/api/lms/...
  for the assessment dispatch + result merge, it doesn't
  matter where the iframe sources from.

  Let me locate the Send Test code in SIS so we have a
  concrete pointer for the future cleanup.

  Searched for 2 patterns (ctrl+o to expand)

● Found the SIS↔LMS coupling points. Inventory for the future
  cleanup:

  ┌─────────────────┬──────┬─────────────────────────────┐
  │      File       │ Line │            What             │
  │                 │  s   │                             │
  ├─────────────────┼──────┼─────────────────────────────┤
  │                 │      │ LMS_BASE = 'https://lms.ule │
  │ src/scripts/tes │ 22,  │ arnschool.com/prototype' —  │
  │ ts.ts           │ 90   │ magic-link URL builder for  │
  │                 │      │ Send Test                   │
  ├─────────────────┼──────┼─────────────────────────────┤
  │                 │ 8,   │ CORS allow-origin =         │
  │ src/routes/test │ 42,  │ lms.ulearnschool.com (the   │
  │ s.ts            │ 44   │ assessment-dispatch +       │
  │                 │      │ result-merge endpoints)     │
  ├─────────────────┼──────┼─────────────────────────────┤
  │ src/routes/emai │ 13,  │ QUIZ_TEMPLATE_URL hardcoded │
  │ l.ts            │ 113, │  to lms host; X-Quiz-Secret │
  │                 │  114 │  check                      │
  ├─────────────────┼──────┼─────────────────────────────┤
  │                 │ 136, │ Staff-login redirect →      │
  │ src/app.ts      │      │ lms-hosted                  │
  ├────────────────────────┼────────────┼──────────────────────────────────────────────────────────────────────────┤
  │ src/routes/email.ts    │ 13, 113,   │ QUIZ_TEMPLATE_URL hardcoded to lms host; X-Quiz-Secret check             │
  │                        │ 114        │                                                                          │
  ├────────────────────────┼────────────┼──────────────────────────────────────────────────────────────────────────┤
  │ src/app.ts             │ 136, 148,  │ Staff-login redirect → lms-hosted /prototype/login/staff                 │
  │                        │ 427        │                                                                          │
  ├────────────────────────┼────────────┼──────────────────────────────────────────────────────────────────────────┤
  │ src/scripts/student.ts │ 584–585    │ lmsUrl stub points at lms host                                           │
  └────────────────────────┴────────────┴──────────────────────────────────────────────────────────────────────────┘

  Send Test logic specifically: src/scripts/tests.ts (Has-completed-quiz check + delta vs full picker + magic-link
  send) → src/routes/tests.ts (HTTP) → email template via routes/email.ts. All string-swappable to
  sis.ulearnschool.com/prototype/... whenever you're ready.

  Tracking it as a task so it doesn't get lost.

● Tracked as #51. Migration done — both hosts running in parallel, all 5 phases verified, cleanup work captured for
  when you're ready to retire lms.ulearnschool.com.

✻ Brewed for 52s