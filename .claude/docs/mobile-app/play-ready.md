# Play Store readiness — ULearn (`com.ulearnschool.app`)

> Living checklist. ✅ = done, ⏳ = waiting on you, ⬜ = not yet started.

## Where the framework lives (Google docs)

1. Pre-launch checklist — `support.google.com/googleplay/android-developer/answer/9859454`
2. Developer Program Policies — `play.google.com/about/developer-content-policy/`
3. Data Safety form — `support.google.com/googleplay/android-developer/answer/10787469`
4. Target API requirements — `support.google.com/googleplay/android-developer/answer/11926878`
5. Account deletion requirement — `support.google.com/googleplay/android-developer/answer/13327111`
6. Closed-testing requirement — only for new *personal* dev accounts (12 testers / 14 days). Organisation accounts skip.

## Status

### Done

- ✅ `webContentsDebuggingEnabled` → `false`
- ✅ Release signing config added (`android/app/build.gradle`)
- ✅ Codemagic `android-release` workflow added (`codemagic.yaml`)
- ✅ Upload keystore generated, backed up to LastPass + `/home/sis/.secrets/upload-keystore.jks`, uploaded to Codemagic as ref `ulearn_upload`
- ✅ `google-services.json` committed to repo (not actually a secret — package-locked)
- ✅ `v1.0.0` tag pushed → signed AAB built by Codemagic and downloaded
- ✅ Privacy policy hosted at `https://sis.ulearnschool.com/legal/privacy.html`
- ✅ Account-deletion page hosted at `https://sis.ulearnschool.com/legal/account-deletion.html`
- ✅ Firebase project created (`ulearn-d6d48`); `google-services.json` in `android/app/`
- ✅ Prisma models added: `DeviceToken`, `AccountDeletionRequest`
- ✅ Endpoints added (in `routes/student.ts`):
    - `POST /sis/student/api/push-register` — body `{token, platform, appVersion?, deviceModel?}`
    - `POST /sis/student/api/push-unregister` — body `{token}`
    - `POST /sis/student/api/me/delete` — queues deletion, clears tokens, ends session

### Waiting on you

- ⏳ **Run prisma migration** to create the two new tables in the DB:
    ```
    cd /home/sis/web/sis.ulearnschool.com/public_html/sis
    npx prisma migrate dev --name add-device-tokens-and-deletion-requests
    # OR (if you don't want a migration file):
    npx prisma db push
    ```
    Then restart: `touch tmp/restart.txt`. **The new endpoints will 500 until the tables exist.**
- ⏳ **Generate upload keystore** (one-time):
    ```
    keytool -genkey -v -keystore upload-keystore.jks -keyalg RSA -keysize 2048 -validity 10000 -alias ulearn
    ```
    Choose a strong password and remember it (cannot be recovered). Upload `.jks` + passwords + alias to Codemagic → Teams → Personal Account → Code signing identities → Android keystores. Reference name: `ulearn_upload` (must match the value in `codemagic.yaml`).
- ⏳ **Mobile app code** — add to the student web app (or to `www/index.html` bootstrap) the calls to `/push-register` after FCM token is obtained, `/push-unregister` on sign-out, and a "Delete my account" button on the profile tab that hits `/me/delete`.
- ⏳ **Firebase service account JSON** — needed *only* for sending pushes from the SIS server. Console → Project settings → Service accounts → Generate new private key. Save outside the repo (`/home/sis/.secrets/`). Send helper to be written once the file exists.
- ⏳ **Listing assets** (for designer):
    - App icon: 512 × 512 px PNG (32-bit, with alpha)
    - Feature graphic: 1024 × 500 px JPG/PNG
    - Phone screenshots: 2–8, min 320 px, max 3840 px on the short edge, 16:9 or 9:16
    - Optional: 7-inch tablet (1024 × 600+) and 10-inch tablet (1920 × 1080+) screenshots
    - App title: max 30 chars (suggestion: `ULearn`)
    - Short description: max 80 chars (suggestion: `The official ULearn English School app for our students.`)
    - Full description: max 4000 chars (covers what the app does, who it's for, what permissions it uses and why)
- ⏳ **Play Console account** — confirm it's an *organisation* developer account, not personal (skips the 14-day / 12-tester closed-testing rule).
- ⏳ **Data Safety form** — Play Console questionnaire. Pre-filled answers for ULearn:
    - Collects: Personal info (name, email, address, phone, DOB), Photos (medical certs), App activity (course/attendance), Device IDs (FCM token).
    - Shared with third parties: HubSpot (CRM), Firebase (push only).
    - Purpose for all: App functionality + Account management + Compliance.
    - Encrypted in transit: Yes (HTTPS).
    - User can request deletion: Yes — link to `/legal/account-deletion.html`.
- ⏳ **Content rating** — IARC questionnaire in Console. App has no violence/gambling/UGC sharing → likely PEGI 3 / ESRB Everyone.
- ⏳ **Target audience** — declare "16+" (matches our visa cohort).
- ⏳ **App access** — Play reviewers need a test login. Create a test student account with realistic data and supply credentials in the Console's App access form.

### Submission order (Play Console)

1. Create app → name `ULearn`, default language `en-IE`, type `App`, free.
2. **Internal testing** track first → upload first AAB → invite a tester list (your own emails).
3. Once internal works on a real device, promote to **Closed testing** if your account requires it.
4. Production listing → fill all Store-listing forms, Data Safety, Content Rating, Target Audience, App access.
5. Submit for review (typically 2–7 days for first-time apps).

## Files touched in this pass

- `/home/sis/dev/sis-mobile/capacitor.config.json` (debug flag)
- `/home/sis/dev/sis-mobile/android/app/build.gradle` (signing config)
- `/home/sis/dev/sis-mobile/codemagic.yaml` (release workflow)
- `/home/sis/web/sis.ulearnschool.com/public_html/legal/privacy.html` (new)
- `/home/sis/web/sis.ulearnschool.com/public_html/legal/account-deletion.html` (new)
- `/home/sis/web/sis.ulearnschool.com/public_html/sis/prisma/schema.prisma` (2 new models)
- `/home/sis/web/sis.ulearnschool.com/public_html/sis/src/routes/student.ts` (3 new endpoints)
