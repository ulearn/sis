# ULearn Student App — Play Store Production launch pack

**Decision:** Skip the email-list tracks (Internal/Closed) — they require each tester's Google-account email, which we don't have and many students don't use Gmail. Go straight to **Production**: public listing, **login-gated** (only ULearn students can use it), any Google account installs, no tester list. The store being public is irrelevant — the app is useless without ULearn login.

Below is everything the Production forms need.

---

## 1. Content rating (questionnaire answers)
- Category: **Reference, News, or Educational**.
- Violence / sexual / profanity / drugs / gambling / user-generated-public-content: **No** to all.
- Does the app share user location: **No**.
- Is it primarily directed at children: **No** (general education tool; juniors use it under school/guardian context — see Target audience).
- Expected result: **PEGI 3 / Everyone / rated for all ages**.

## 2. Target audience & content
- Target age groups: **13–17 and 18+** (the school has some junior students; majority adults).
- Because under-18s are included, Play applies its **Families/teacher-or-school-context** checks — the app is an enrolled-school tool used under the school's care, no ads, no in-app purchases. Declare **no ads**.

## 3. Data Safety form
**Does your app collect or share user data?** Yes (collect). Encrypted in transit: **Yes**. Users can request deletion: **Yes** (via success@ulearnschool.com).

Data types collected (all: collected, not shared with third parties for ads; processed to run the school service):
| Type | Collected | Purpose | Optional? |
|---|---|---|---|
| Name | Yes | Account management, App functionality | Required |
| Email address | Yes | Account, support | Required |
| Phone number | Yes | App functionality (school contact) | Required |
| Other personal info (nationality, DOB, passport/visa details) | Yes | App functionality (enrolment, visa letters) | Required |
| Photos | Yes | App functionality (document/passport upload) | Optional |
| Files & docs | Yes | App functionality (student uploads) | Optional |
| App activity (attendance, bookings, messages) | Yes | App functionality | Required |
| Audio (microphone) | Declare only **if** speaking practice ships | App functionality | Optional |

- **Camera** is used to capture documents (function only — not collected/transmitted beyond the uploaded file). Mic permission is declared for future speaking practice; if it's not live at submission, you can omit the Audio data type and just note the permission.
- **Sharing:** student-uploaded documents are visible to the student's **booking agent/partner** (their representative) — this is "sharing with the user's own agent," not third-party. If Play insists, declare data shared with "Other" = the student's appointed education agent, for app functionality.
- **Data deletion:** provide the URL/method — students email success@ulearnschool.com (or a deletion form) to have their data removed.

## 4. Privacy policy
Host the page below at a public URL (e.g. **https://ulearnschool.com/privacy** or **https://sis.ulearnschool.com/privacy**) and paste that URL into the Console. Draft content:

> **ULearn School — Student App Privacy Policy**
> Last updated: [DATE]
>
> ULearn English School ("ULearn", "we"), [registered address], Dublin, Ireland, is the data controller for the ULearn student app. We are committed to protecting your personal data and complying with the EU GDPR and the Irish Data Protection Act 2018.
>
> **What we collect.** Information you provide on enrolment and in the app: name, email, phone, nationality, date of birth, passport and visa details, and documents you upload (e.g. passport, IRP). App-generated data: your bookings, attendance, class assignment, in-app messages, and support requests. With your permission, the app uses your device **camera/photos** to let you upload documents, and (where available) the **microphone** for speaking practice. We send **notifications** about your course and school.
>
> **Why we use it.** To provide your English course and accommodation, manage your enrolment and attendance, produce official documents (e.g. visa/enrolment letters), respond to support requests, and meet our legal/immigration-compliance obligations as a registered language school.
>
> **Who we share it with.** Your information may be shared with the education **agent/partner who arranged your booking** (your representative), and with service providers who help us run the school (e.g. accommodation providers, our email and hosting providers) under data-processing agreements. We do **not** sell your data or use it for third-party advertising.
>
> **Storage & security.** Data is stored on secured servers in the EU and transmitted over encrypted connections. We retain your data for as long as you are a student and as required by Irish education/immigration law thereafter.
>
> **Your rights.** Under GDPR you may access, correct, or request deletion of your data, object to or restrict processing, and request data portability. To exercise any right, or to delete your account/data, contact **success@ulearnschool.com**. You may also complain to the Irish Data Protection Commission (dataprotection.ie).
>
> **Children.** Students under 18 are enrolled with parental/guardian consent as part of the school's standard enrolment; the app is used under the school's duty of care.
>
> **Contact.** ULearn English School — success@ulearnschool.com · +353 1 475 1222.

## 5. Store listing (minimal)
- **App name:** ULearn School
- **Short description (≤80):** "The student app for ULearn English School Dublin — your course, attendance and documents."
- **Full description:** "The official app for students of ULearn English School, Dublin. Log in to see your course and class timetable, track your attendance, book additional courses, upload and manage your documents (passport, IRP), message the school, and browse social activities. For enrolled ULearn students only — sign in with the details provided by the school."
- **Assets needed:** app icon (have it), **feature graphic** (1024×500), and **2+ phone screenshots** (grab from the app: Profile, Documents, Learning/Calendar).
- **App access:** the app requires login → in "App access" provide **test credentials** (a demo student account) so Google's reviewer can get past the login screen, or the review fails.

## 6. Order of operations
1. Build/upload the **Release AAB** (Codemagic) to **Production → Create release**.
2. Complete: Content rating, Target audience, Data Safety, Privacy policy URL, Store listing, **App access (test login!)**.
3. Submit → review (~a few days first time).
4. Live → students search "ULearn School" → install with any account → log in.

**Note:** the **App access / test-login** step is the one teams forget — without a working demo login the reviewer can't see past the sign-in and rejects it. Set up a throwaway demo student and put those credentials in.
