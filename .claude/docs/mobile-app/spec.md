# ULearn Mobile App — Phase 3 Spec

**Status:** Drafting · 2026-05-09
**Owner:** Neil
**Goal:** Ship the existing student web app as a real installable mobile app (Play Store + App Store) before students arrive needing it for visa-check-in essentials.

---

## 1. Locked decisions

| Decision | Choice | Rationale |
|---|---|---|
| **Approach** | **Capacitor wrap** of existing `sis/public/student.html` | Web app is feature-complete for Phase 3. Native rebuild = weeks for zero perceptual gain on tab/list/form-heavy screens. |
| **Frameworks ruled out** | React Native, Flutter, PWA-only | RN/Flutter = full rewrite (incompatible with existing HTML). Flutter also = Dart, which Neil refuses. PWA = no app stores, weak iOS push. |
| **App display name** | `ULearn` | Single brand name across stores. |
| **Package identifier** | `com.ulearnschool.app` | Locked forever once published. Generic enough to host student/teacher/future variants. |
| **Project location** | `/home/sis/dev/sis-mobile/` | Outside any web vhost — no Phusion/nginx interference. |
| **Repo strategy** | One repo (separate from SIS backend) | Single-developer setup; no monorepo complexity needed. |
| **Audience** | Multi-role from day 1 (students primary, teachers secondary) | Same login model as SIS desktop. Teacher screens come second; both share login. |
| **Bundle vs remote webview** | **Bundle** (HTML/CSS/JS shipped with app, APIs hit live) | Airport-WiFi resilience. Apple guideline 4.2 rejects pure webview apps. |
| **Auth** | **Reuse existing express-session cookies via Capacitor WebView** | The wrapped WebView has its own persistent cookie jar — `req.session.studentId` works natively, no JWT migration needed for V1. |

---

## 2. Existing student web app — what's already built

`sis/public/student.html` (1638 lines, single-file HTML+CSS+JS) is mobile-first and production-ready. Already has:

### Layout & framework primitives
- `viewport-fit=cover` + `env(safe-area-inset-*)` for iOS notch/home-indicator
- `theme-color` for Android status-bar tint
- `-webkit-tap-highlight-color: transparent`
- Sticky topbar with greeting + avatar + logout
- Bottom 3-tab navigation (Profile / Challenges / Learning)
- Card/collapse pattern used throughout
- KV (key-value) row pattern for data display
- Status pills (grey/blue/amber/green)
- Camera modal using `getUserMedia` + canvas + file fallback
- Toast notifications + emoji confetti
- Progress bars + animated badge strip
- In-app push via `Notification.requestPermission()`

### Tab 1 — Profile (collapsible cards)
| Card | Source endpoint | Notes |
|---|---|---|
| Personal Details | `/sis/student/api/me` | Name, nationality (ISO→full name), DOB, email, phone, IG handle |
| Course Details | `/sis/student/api/me` | Course name, level, dates, weeks, hrs/wk, timetable (days/time/room), Google Maps link to Harcourt St |
| Attendance | `/sis/student/api/me` + `/absences` + `/planned-absences` | Week% / Overall% stats, absence list with reason picker, sick-cert upload (camera or file), planned-absence form |
| Accommodation | `/sis/student/api/me` | Type, room, board, provider, location, dates |
| Documents | `/sis/student/api/me` | Issued letters/invoices, with 👁 preview + 📄 PDF download |
| Social | `/sis/student/api/activities` | Upcoming activities feed + RSVP toggle + monthly calendar modal |
| Support | hard-coded | success@ulearnschool.com, +353 1 475 1222, emergency line |

### Tab 2 — Challenges (gamification layer)
6-badge progression with live polling (45s) and unlock toasts:
- 📱 **Social** — Instagram handle + follow verification
- 🎬 **Content** — submit 3 verified posts/videos
- 🎯 **Course Attended** — 100% attendance week or month
- 🎉 **Activity Attended** — RSVP'd activities you turned up to
- ⭐ **Review** — Google review confirmation
- 🏆 **Ambassador** — overall completion

Endpoints: `/sis/student/api/challenges`, `/social`, `/social/confirm-follow`, `/content`, `/content/:id`, `/activities/:id/rsvp`. localStorage persists "seen" state for the unread-badge pip.

### Tab 3 — Learning
Iframe to `/prototype/lms/today.html?level=…&session=…&embedded=1` — the canonical lesson view with day-pills + per-session ratings. Lazy-loaded on first tab visit. Level/session params come from login handler resolving from `StudentClassAssignment`.

### API endpoints used
```
/sis/student/api/me                                    GET  — profile/course/accom/docs/attendance/timetable
/sis/student/api/absences?days=60                      GET
/sis/student/api/planned-absences?days=60              GET
/sis/student/api/absence-reason                        POST
/sis/student/api/absence-reason/:date                  DELETE
/sis/student/api/absence-reason/:date/cert             POST  (multipart)
/sis/student/api/absence-reason/:date/cert/:fileId     GET / DELETE
/sis/student/api/challenges                            GET
/sis/student/api/social                                PATCH
/sis/student/api/social/confirm-follow                 POST
/sis/student/api/content                               POST
/sis/student/api/content/:id                           DELETE
/sis/student/api/activities                            GET
/sis/student/api/activities/month?year=…&month=…       GET
/sis/student/api/activities/:id/rsvp                   POST / DELETE
/sis/student/api/documents/:id/preview                 GET
/sis/student/api/documents/:id/pdf                     GET
/sis/api/activities/image/:filename                    GET
```
All gated by middleware in `app.ts` redirecting unauthenticated requests to `/sis/login`. Session has `studentId` set at login when `userType==='student'`.

---

## 3. Fidelo (the bar to clear)

Existing app: 4-tab (Home / Messages / Schedule / More), most screens "No data found" placeholders, but the menu inventory from the More tab is the canonical Fidelo feature set:

| Fidelo feature | Our equivalent | Status |
|---|---|---|
| Personal data | Profile → Personal Details | **Done** — richer than Fidelo (IG, timetable, map link) |
| Booking (Courses, Accommodation, Transfer, Insurances, Activities) | Profile → Course Details + Accommodation + Social | **Partial** — see gaps below |
| Attendance | Profile → Attendance | **Done** — better than Fidelo (per-day reasons, sick certs, planned absences) |
| Accommodation | Profile → Accommodation | **Done** |
| Documents | Profile → Documents | **Done** — preview + PDF download |
| FAQ (Student Handbook) | — | **MISSING** — Fidelo had 13 expandable topics (visa, bank, working, holidays, etc.) |
| About us | — | **MISSING** — school address + phone + email + app version |
| Change password | — | **MISSING** — exists via `/sis/auth/forgot` flow but not surfaced in app shell |
| Logout | Topbar logout link | **Done** |
| Messages | — | **MISSING** — Fidelo had messages tab (empty in screenshots; unclear if used) |
| Schedule (calendar) | Activities calendar (Social card) | **Partial** — we have activities calendar but not class-schedule calendar |
| Welcome / Announcements | — | **MISSING** — Fidelo Home tab was an announcements feed |

### Visa-check-in critical-path items (Neil's priority for ASAP ship)
1. **Insurance documents visible** — Fidelo had this under Booking → Insurances. Confirm our Documents card surfaces insurance PDFs.
2. **Airport transfer status** — Fidelo showed "Arrival: Airport → School · Mar 15, 2025 (Booked)". **MISSING from our app.** Needed before students arrive in Dublin so they don't panic about pickup.
3. **Student info / IRP-eligible identity** — present.
4. **Course dates + start info** — present.

---

## 4. Gap analysis — what to build before V1 ship

**Must-have before Play Store submission (visa-check-in critical):**
- [ ] **Airport transfer card** in Profile — "Arrival: Airport → School · {date} · Booked" (data source: SIS Booking model — confirm field exists)
- [ ] **Insurance documents** confirmed surfaced under existing Documents card (likely already there; verify with Saraa/test student)
- [ ] **About us page** — school address, phones, email, app version (trivial, mirror Fidelo screen-10)

**Should-have before V1 ship (Fidelo parity, not airport-critical):**
- [ ] **FAQ/Handbook section** — port the 13 Fidelo topics. Could be a fourth tab "Help" or a card under Profile. Content lives in the Student Handbook PDF; needs splitting into accordion HTML.
- [ ] **Change password** — link to `/sis/auth/forgot` flow from Profile or Support card
- [ ] **Class schedule calendar** — currently we only have activities calendar; Fidelo had a class-schedule one. May or may not earn its space; defer until we hear students miss it.

**Nice-to-have (not blocking):**
- [ ] **Announcements/welcome feed** — Fidelo had this on Home; we could repurpose Profile top-of-page for school-wide messages.
- [ ] **Messages** — Fidelo had it but appears unused. Skip unless there's actual demand.

---

## 5. Capacitor wrap — technical plan

### Project structure
```
/home/sis/dev/sis-mobile/
├── package.json
├── capacitor.config.ts        # appId: com.ulearnschool.app, appName: "ULearn"
├── www/                        # bundled web assets (loaded into WebView at launch)
│   ├── index.html             # entry point — bootstrap that decides where to go
│   ├── student.html           # copy of sis/public/student.html (or a thin redirect)
│   └── assets/
├── android/                    # generated by `npx cap add android`
└── ios/                        # generated by `npx cap add ios` (Phase 3.5)
```

### Auth flow (cookie-based, no JWT)
1. App launches → loads `www/index.html` → immediately navigates WebView to `https://sis.ulearnschool.com/sis/student`
2. If unauthenticated, server redirects to `/sis/login` (existing flow)
3. User logs in via existing form → server sets `sis_session` cookie in the WebView's cookie jar
4. WebView cookie jar persists across app launches (Android: WebView cookie store; iOS: WKWebView with `WKHTTPCookieStore`)
5. All subsequent API calls from `student.html` carry the cookie automatically — same as a browser

**Why no JWT:** Capacitor WebView IS a real browser cookie jar. The express-session middleware works as-is. JWT is the right answer if/when we have a non-WebView native client (Phase 4/5 React Native rebuild).

### CORS / cookie SameSite considerations
- Need to verify `sis_session` cookie's `SameSite` and `Secure` settings work inside the WebView. If issues, set `SameSite=Lax; Secure` and ensure the WebView is hitting `https://` not `http://`.
- For local dev where the WebView loads from `capacitor://localhost` (Android: `http://localhost`), CORS preflight needs `Access-Control-Allow-Origin` to whitelist those schemes. Setting `server.androidScheme = 'https'` in `capacitor.config.ts` simplifies this.

### Native features to enable in Phase 3
| Plugin | Why | Replaces |
|---|---|---|
| `@capacitor/camera` | Sick-cert capture | Currently uses `getUserMedia` — Capacitor camera is more reliable on Android WebView |
| `@capacitor/filesystem` | Saving downloaded PDFs (visa letters, invoices) to device | Currently downloads to browser-default location |
| `@capacitor/push-notifications` | Real OS push for challenge unlocks + announcements | Currently uses browser `Notification` API which is weak on iOS |
| `@capacitor/app` | Handle Android back-button (collapse cards / navigate tabs vs exit app) | Browser back-button doesn't exist |
| `@capacitor/status-bar` | Match status bar to brand green | Already partly handled via `theme-color` |
| `@capacitor/splash-screen` | Native splash with ULearn logo | Replaces blank-WebView startup flash |

### Build / deploy pipeline
- **Local dev:** `cd /home/sis/dev/sis-mobile && npm run build && npx cap sync && npx cap run android` (requires Android Studio on Neil's laptop)
- **Production builds:** Either Android Studio locally OR a cloud service (Codemagic, Ionic Appflow, EAS Build supports Capacitor too) for signed `.aab` ready for Play Store
- **OTA updates:** Capacitor Live Updates (Capgo, free OSS) lets us push HTML/CSS/JS changes without store re-submission. Worth adding once V1 is in stores.

---

## 6. Phase 4/5 caveat

When the **self-study Duolingo-clone** marketing layer arrives (animation/gesture-heavy, public-facing, freemium funnel into school enrolment), **re-open the framework decision**:
- Capacitor's WebView ceiling will be tested by intensive animations, swipe gestures, and sustained interactivity
- A React Native rebuild at that point is on the table, sharing the SIS backend API
- Flutter remains ruled out (Dart)

The Phase 3 Capacitor app and the Phase 4 native app could coexist (different `appId`s) — internal-school app stays Capacitor, public marketing app becomes RN. Decision deferred to needs analysis at Phase 4 start.

---

## 7. Open questions / pending decisions

1. **Airport transfer data source** — does the SIS Booking model already store arrival flight/transfer info? If not, where does it come from? (Fidelo had it; check whether we have parity in `Booking` table.)
2. **Insurance document presence** — confirm with Saraa whether insurance PDFs are issued through the existing Documents pipeline.
3. **Teacher-side screens** — Phase 3 ships the student app primarily. Does the teacher screen-set ship in the same V1 or a V1.1? Likely V1.1 since student ASAP is the priority.
4. **Push notification backend** — adding `@capacitor/push-notifications` requires a server-side push sender (FCM for Android, APNs for iOS). What goes through it: challenge unlocks, attendance alerts, schedule changes, school-wide announcements? Defer scoping until stores accept the V1.
5. **Apple Developer account** — €99/year; needed before iOS submission. Get this in motion early so it's not blocking when Android is live.
6. **Google Play Console account** — €25 one-time; needed for Android submission.

---

## 8. Files in this folder

- `mobile-dev.md` — original GPT recommendation (React Native + Expo). Superseded by this spec; kept for reference.
- `kinds.md` — unrelated, lesson-taxonomy notes (probably belongs elsewhere).
- `fidelo/screen-{1..10}.jpeg` — reference screenshots of the existing Fidelo app
- `spec.md` — this document
