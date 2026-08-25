# Parked work plans (linked specs)

- **[Migration Cleanup — Dupe & Course naming](MigrationCleanup/)** — post-Fidelo backfill cleanup, specs in `MigrationCleanup/`. (1) **Dupe** [`dupes.md`](MigrationCleanup/dupes.md): booking/payment reconnect (83 done, ~11 payment-differs left), unassigned-pool escrow/shadow flips, literal duplicate students. (2) **Course naming** [`course-canon.md`](MigrationCleanup/course-canon.md): Fidelo course names → canonical "General English…"; recipe + mapping locked, parked ready (lockstep: ILEP deriver Sets + `isRenewal=true` on renewals + webhook source). 93.7% of affected rows are historical → low current-ops impact.
- **[Fidelo gross-vs-net booking-fee cleanup (Jan 2025+)](ToDo/fidelo-gross-net-cleanup.md)** — 474 Fidelo bookings, ~€388k drift between gross course rack-rate (in `booking_course.fee`) and net amount banked (in `booking.amount_total`). Two algorithm candidates documented, decision pending. **2025 year-end accounts depend on this.**
- **[Centralise the WYSIWYG editors](MigrationCleanup/editor-centralisation.md)** — 5 duplicated rich-text editors in `admin.html` (divergence + maintenance risk; doc editor already differs). Font/colour controls already centralised (`rtControls()`); finish the job with a single `richEditor(id, opts)` helper emitting toolbar + contenteditable. CRITICAL: keep each editor's existing id or sends break. Low-risk, own focused task.
- **[Student-app translation — go app-wide (Phase 2)](mobile-app/translate.md)** — Phase 1 DONE & live (KickStart €500 challenge + leaderboard translated into PT/ES/IT/FR/DE/TR/JA/KO/ZH/RU+EN via static dictionary `public/challenge-i18n.js`, auto-resolved from `Student.language`→nationality via the hub lang-map, flag toggle). Phase 2 = translate the app **chrome only** (tab/nav names, section/card headers, key buttons — ~40–60 stable strings) for "feels native" at low cost; hoist the toggle to a global spot; skip long-form + dynamic/staff-written content (needs live machine-translate, not the static model). Full mechanism + cookbook in the linked doc.

---

# 18.05.2026
in the assessment. day. You know obviously most of them are gonna be just class wide assessment. They've all gone through the same experience. So they should roughly speaking at the same assessment as informed by the goals set out in the can do statements and the vocabulary in the Pearson GSE things, etcetera. The usual canonical context having said that, it would be good if there is a umm, if there were a specific section specifically tailored to any errors that that Individual Student showed either during the class as recorded by the teacher, or in their homework submissions that probably that could be corrected either by the teacher or by AII would imagine, just three questions would be fine just at the end like Personal assessment section so PAS - 3 qstns

# 18.04.2026
● Here's the regroup.                                                                                        
                                                                 
  Built last night (scaffold only, not wired to data):
  - Overview / Challenges / Learning tabs on the student profile in admin.html                               
  - Mobile student portal prototype at /sis/student (Carlos)                                                 
                                                                                                             
  Pending from the existing task list:                                                                       
  - #10 — B2B quote template in HubSpot with "Commission" label (cosmetic, HubSpot-side)                     
                                                                                                             
  Not yet on the task list but logically next (from bd5.md plan, in dependency order):                       
                                                                                                             
  1. Student auth + permissions — real student login, record-level access control. Prerequisite for          
  everything else.                                                                                           
  2. Challenge engine data model — challenge_campaign, challenge_task, challenge_task_submission,            
  challenge_task_review. Turns the scaffolded Challenges tab into a real campaign runner.                    
  3. Events module — powers the "activity attended" checkbox. Needed before challenge v1 is complete.
  4. Learning onboarding automation — auto-assign delta vs full placement on student creation based on quiz  
  score.                                                                                                     
                                                                                                             
  Which do you want to tackle? My suggestion is (1) student auth first — without it nothing else matters —   
  but if you want a visible win in the admin UI (i.e. staff-facing, no student login needed yet), we could do
   (2) the challenge engine data model + wire the Challenges tab so Kelly can start logging real             
  approvals/rejections.

#   Student App: Book Next Course flow                                                                         
                                                                                                             
  - Student app currently has no financial section & no re-enrollment path — add one                         
  - Especially relevant for rolling attendance (book next week / next month / next course without leaving the
   app)                                                                                                      
                                                                                                             
  Reuse the partner portal enrollment flow for students                                                      
                  
  - Lift existing "+ New Enrollment" UX from partner portal into student app                                 
  - Adapt for B2C: deal goes to B2C pipeline in HubSpot (not B2B), no agent attached, arrives in Contract
  stage                                                                                                      
                  
  V1 flow (sales-rep-gated, deliberately manual)                                                             
                  
  - Student submits → deal created in B2C pipeline                                                           
  - Sales Rep reviews → clicks Auto Quote → quote created in HubSpot
  - Quote surfaces back in the app for the student to Accept                                                 
  - Invoice generated → student pays in-app
  - Same mechanism works for both partner portal and student app                                             
                  
  Why manual in v1 (don't automate yet)                                                                      
                  
  - The B2C pipeline is new and un-road-tested                                                               
  - Auto-generated quotes without a human gate would be costly if miscalculated
  - Road-test the manual cycle end-to-end first; automate later                                              
                                                                                                             
  V2 idea: client-side draft-quote (for later)                                                               
                                                                                                             
  - We already have the pricing JSON catalogue (aligned to HubSpot) in the codebase                          
  - Could pre-render a draft quote inside the app/portal before ever touching HubSpot
  - Student adjusts, hits send, THEN it goes through the manual gate                                         
  - Reduces latency + staff friction                                                                         
  - Only explore this once v1 is stable                                                                      
                                                                                                             
  Partner portal note                                                                                        
                                                                                                             
  - Extension bookings for partners are rare (~5%) — most agents aren't physically in Dublin with the student
  - So full B2B quote/invoice rigmarole stays appropriate for partner portal
  - The shared mechanism works cleanly for both audiences regardless                                         
                                                                                                             
# Create User Account invitations 
For all Active Partners create 
User:
Password:
Assign to an email:

Add temporarily to HubSpot - then create email with personalizationTokens for the login info.



## ######################################################################## ##



# SIS — To Do / Future Items
## Font
- Get rid of that horrible font which is outputting zero that looks like an 8 - super confusing 
- Back to the Matching Screen for a second - we need to be able to "split" the Reservation between 2 or more Hosts - i forgot this but it is pretty common




## ACCOMM

SEE: /home/sis/web/sis.ulearnschool.com/public_html/sis/.claude/docs/accomm/HostTasks.md

- Repalce the Google Sheet for Accomm 
- - Or integrate it? bring flexibility into the system?
- - Or we can do better - just clone an accomm / AirBnB system like Lodge etc 

NOTE: so we will be replacing that Google Sheet setup here in the SIS along with an approximate Host Family 
Placement clone - essentially they are both gonna be part of the same vacancy/occupancy/matching engine                
i. Rename "Providers" to "Hosts" and then create a second Icon called "Apartments" where we will store our own and 3rd party rentals

- XERO/SIS
- - I think there are far more Hosts in Xero that are not here - because they are old for example - I am not sure if I really want to start bringing them in    
  here... Perhaps we could bring them in but then i would need some kinda active/quiet/inactive field that populates based on their last booking with us. If  
  they are Quiet or Inactive for example we might just remove them from the Matching screen - let's just add that to ToDo's instead of exectuting it now      

## Invoicing Integration

### Option A: HubSpot → SIS Direct
- HubSpot Quote (Deal Line Items) is converted to an Invoice in HubSpot
- A boolean field triggers a HubSpot Workflow Webhook
- Webhook creates the exact same invoice entry in SIS
- Keeps both systems in sync without manual entry

### Option B: HubSpot → Xero → SIS (Full Accounting Loop)
- HubSpot Quote converted to Invoice, sent by Webhook to Xero
- Xero tracks unpaid invoices properly (assets on balance sheet)
- Unpaid invoice is mirrored in SIS
- When payment arrives and is reconciled in Xero, API surfaces the reconciliation in SIS — marked as paid
- Eliminates the manual "Incoming Payments" email currently sent to the sales team
- Payment notifications can be surfaced automatically in SIS, in HubSpot, and/or by auto-email

### Recommendation: Option B
- Xero is the legal books — invoices must live there for auditing, compliance
- SIS mirrors Xero state, doesn't try to be accounting software
- One source of truth for money (Xero), SIS reflects payment status only
- Flow: Deal won (HubSpot) → Student+Booking (SIS) → Invoice (Xero) → SIS stores Xero invoice ref → periodic sync or Xero webhook updates payment status → auto-notification on payment
- Surface full Xero invoice read-only in SIS so staff can view without Xero access and management can spot errors
- Long term: auto-generate invoice from HubSpot deal line items (already approved) rather than manual staff creation — removes incentive/error risk from commission-based sales staff

### Gross / Net Invoicing (B2B)
- 99% of agent bookings: agent sends net payment (after their commission deduction) — straightforward
- Edge case: Gross invoice sent to student, Net invoice sent to agent — need to support both invoice types per booking
- Fidelo handled this with "brutto"/"netto" invoice types per booking
- Must account for this in invoice generation and payment reconciliation
- Commission tracking at line-item level (already in schema: `invoice_line_items.commission`)
- KEY RISK: sending the wrong invoice to the wrong recipient (student gets net / agent gets gross) — must enforce recipient validation before send
- KEY RISK: Xero must always receive the NET invoice (actual revenue) not the gross — auto-select based on B2B flag, never manual

### Current Xero Reality
- No direct reconciliation API exists in Xero — bank feed transactions can only be reconciled via UI
- Currently NOT doing proper invoice-level reconciliation in Xero for most payments
- Workaround: all B2C payments go to a single contact "ULearn Student" and are reconciled as bank-to-bank
- Exception: large group payments (€15k+) get proper invoices and reconciliation in Xero
- Goal: start doing proper invoice-level reconciliation for all payments, remove invoicing from Fidelo entirely
- Once reconciled in Xero, status syncs to SIS (24-hour delay from BOI bank feed is acceptable)
- Hub server already has: Xero OAuth flow, headless browser for bank feed refresh (4x daily cron), transaction pull scripts

### Xero API Capabilities
- CAN: create invoices, check invoice status (amountPaid/amountDue/isReconciled), manage contacts
- CANNOT: auto-reconcile bank feed transactions (Xero limitation, not ours)
- Practical flow: SIS creates invoice in Xero → staff reconcile payment in Xero UI as normal → SIS polls for status change

### Payment Identification Challenge
- Need to improve mechanisms for putting reference IDs on student bank transfers
- Currently hard to match incoming payments to specific students/bookings
- Better reference codes on invoices would help (booking ID, student ID in transfer reference)

### Payroll (Fidelo Limitation — Reason to Migrate)
07.04.2026 - add Cron (sunday - pull weekly data) once its fully tested and operational

- Fidelo does bi-weekly payroll, but teachers are paid by the hour
- Pay on Thursday, payroll cuts off on Wednesday before
- Next month must include Thu/Fri from the cutoff — Fidelo can't output this
- Hub server has headless browser workaround to extract payroll data from Fidelo GUI2
- New SIS will handle this natively with the class_teachers + teacher_covers model

### Outgoing Payments (Future)
- Make.com + Airtable setup exists for host family payment assignment
- Can be repurposed for teacher payments as well
- Will need Airtable API access to review and integrate

### The Handover Workflow: Quote → Invoice (IMPLEMENT NOW)

**Trigger:** HubSpot Quote is converted to an Invoice

**Step 1: Create SIS Student + Booking**
- Pull contact data from HubSpot (name, email, phone, nationality, DOB, etc.)
- Pull deal data (line items → courses, accommodation, agency, amounts)
- Create Student record in SIS (with `hubspotContactId`)
- Create Booking record in SIS (with `dataSource: HUBSPOT`)
- Store `hubspotDealId` on the student/booking

**Step 2: Create Xero Contact + Invoice**
- Create Contact in Xero with student name + email
- Store `hubspotContactId` AND SIS `studentId` on the Xero contact (custom fields or tracking)
- Create Invoice in Xero from HubSpot deal line items (product codes from catalogue)
- Gross invoice for B2C / Net invoice for B2B (auto-select based on agency presence)

**Step 3: Link everything back to SIS**
- Store `xeroInvoiceId` on the SIS Invoice record
- Store Xero contact reference on the SIS Student
- Booking now has: HubSpot deal link + Xero invoice link + full student/course data

**Step 4: Ongoing sync (Xero → SIS)**
- Periodic check: has the Xero invoice been paid?
- Update SIS: `amountPaid`, `amountOpen`
- If fully paid → notify salesperson + move HubSpot deal to WON
- If partial → notify with amount received, deal stays in CONTRACT

---

### The Handover Moment: Quote → Invoice (context/background)
This is the clearly defined protocol for when a student enters SIS and Xero:

1. **Sales phase** (HubSpot only): lead → deal → quotation. Can go on for a long time.
2. **Trigger**: Quotation is accepted and converted to an Invoice in HubSpot.
3. **At that moment, simultaneously:**
   - Invoice is created in Xero (with actual student name + CRM data, NOT "ULearn Student")
   - Student + Booking is created in SIS (even though not yet paid — DOS needs visibility)
4. **Payment may come later** — terms say 2 weeks before arrival minimum, but students often pay on day one or even on arrival

**This is the bifurcation point**: Sales → Operations
)
- To SIS: Student record (basic CRM data from HubSpot contact) + Booking (from deal line items / product codes)

**Current state being replaced:**
- Xero has a single contact "ULearn Student" for all B2C payments — no individual tracking
- New system will create proper named contacts in Xero per student
- Fidelo invoicing is eliminated entirely

### Junior / Adult Classification & Accommodation Rates
- Students need a **studentType** field: `adult` or `junior` — set manually, not derived from DOB alone
- DOB is informative but not reliable (not always provided, grey areas like 17-year-old in a junior group)
- **Rate logic for accommodation:**
  - Adult in any room → provider's standard weekly rate (default €220)
  - Junior in single room → same adult rate
  - Junior in shared room (twin/triple/dorm) → reduced rate (currently ~€188)
- All juniors are Closed Groups — the group definition can set the default accommodation rate for all hosts in that group
- Individual host rate can be manually overridden if negotiated differently

### Groups / Closed Groups
- Need a **Group** entity: name, type (Closed Group / Agency Group / etc), tag
- Students tagged with a group → searchable, filterable, bulk-viewable
- No complex CSV upload system — just tag students to a group
- Group can define defaults: accommodation rate, course type, dates
- **Fidelo pain point:** rigid CSV upload format, high rejection rate, providers never conform to it

### Known Issue: HubSpot → Xero Native Sync — Line Item Order
- The native data sync does NOT preserve line item order from HubSpot to Xero
- Invoices in Xero may show items in a different sequence than the HubSpot quote/invoice
- Cosmetic issue mostly — doesn't affect totals or accounting
- If order matters for client-facing invoices, may need to manually reorder in Xero or build a custom sync that respects order
- Low priority for now but worth monitoring

### Invoice Line Item Descriptions — Date Range
- HubSpot line items have a `description` field accessible via API
- Should auto-populate with date range from deal properties: e.g. "Morning slot, 25 March – 14 April"
- This is a retraining moment for staff: dates/durations now come from the sales context (HubSpot), not Fidelo
- Can be automated: deal start_date + weeks → computed end_date → injected into line item description via workflow or API
- Important for: invoice clarity, visa letter references, compliance
- Staff will likely be happy (less work) but need to understand the new source of truth

### Student Insurance
- Sold as 1 product: "Learner Protect (PEL+) Health Insurance" — €150
- Supplied as 2 separate things: Health Insurance + Learner Protection (PEL+)
- Mandatory for non-EU visa students, optional for others
- Bundled into Academic Year packages (included in the €3,500 etc.)
- Also sold standalone for EU/short-course students
- Need to track: policy issued (yes/no), provider, policy number, start/end dates
- May need to generate proof-of-insurance documents for visa applications

### AI-Powered Data Import (V2)
- Expose OpenAI API chat within the system
- Receives external data in any format (Excel, PDF, email text, Google Sheets)
- AI strips noise, extracts relevant student/booking data, aligns to SIS schema
- Dramatically reduces manual data entry for group bookings from partner agencies
- Could also assist with bulk student onboarding from any source format

### Payment Reconciliation → Notification → HubSpot Stage Update

**The trigger:** Accounts (Esperanza) reconciles an incoming payment to a student's invoice in Xero.

**If invoice is 100% paid:**
1. SIS detects via Xero sync that invoice is fully paid
2. SIS sends API call to HubSpot: move Deal stage → WON
3. Notification sent to salesperson: "Congratulations, your deal is WON"
4. Student becomes fully active in SIS
5. Salesperson does NOT need to manually move the deal — removes trust issue where sales staff prematurely mark deals as WON based on "the student said they paid"

**If invoice is partially paid:**
1. SIS detects partial payment via Xero sync
2. Notification sent: "Partial payment received: €X of €Y"
3. Deal stays in CONTRACT stage — cannot move to WON until fully paid
4. Current HubSpot workaround for partials: split deal into two (paid portion → WON, remainder stays in CONTRACT). Not ideal but functional.

**Key rule:** Only a reconciled bank payment in Xero can trigger WON. Not a student's email, not a sales rep's word. If it hasn't hit the bank and been reconciled, it's not paid.

**Why this matters:**
- Removes "comfort trust" where sales staff move deals to WON prematurely
- Monthly banking cross-check becomes automated instead of manual
- Eliminates the "Incoming Payments" email entirely
- Single source of truth: bank → Xero → SIS → HubSpot

### Current Pain Point
- All of the above is done manually today
- Staff send an email called "Incoming Payments" to notify the sales team
- That email becomes redundant once payment reconciliation is automated

---

## User Permissions & Roles

### Why
- Fidelo allowed all staff to create document templates — resulted in 200+ templates, 90% noise
- One staff member created per-variation "templates" instead of using tokens (e.g. separate templates for "apartment to agent", "apartment to student", "apartment to student sharing")
- Template list became unsearchable and unworkable
- Same risk exists for email templates (208 in Fidelo)
- Must prevent this in new SIS

### Permission Model
- **Admin:** Full access — create/edit/delete templates, manage users, system config
- **Staff (Operations):** Use templates to generate documents, edit permitted fields in drafts, issue/send, view all records. Cannot create/edit/delete templates.
- **Read-only:** View only (reporting, management dashboards)

### Implementation Notes
- Lock template creation/editing to Admin role only
- Staff can only select from active templates and generate document instances
- Consider: role-based sidebar (hide admin-only sections from staff)
- Consider: audit log for who created/edited templates
- Session/auth system needed (currently no auth on SIS admin panel)

---

## 2022 Host Match System (via Airtable / Make / ManyChat)

### Context
- A self-service host matching system was built in 2022 using Airtable + Make.com + ManyChat/Bird WhatsApp
- Each host had a unique private URL (slug = their email or ID) — no login required
- URL showed pseudonymised upcoming students needing placement (name, nationality, age, dates — no email/photo/contact info)
- Host selects a student → provisional match created in Airtable → student removed from available pool
- First-come-first-serve: send to top 10 preferred hosts first, expand if needed
- Dramatically reduced phone calls for placement — only fallback if no one responds
- WhatsApp outreach: "Are you available?" → link to their personal selection page

### Goal for SIS
- Recreate this as a native SIS feature
- Host gets a unique URL → sees available students → selects → match created in SIS
- Integrates with the accommodation matching engine already built
- Staff controls: choose which hosts to notify, how many at a time, stagger outreach
- Consider: Bird.com WABA integration for the WhatsApp notification (already in use on Hub server)
- Schematics from the original system to be reviewed and adapted

---

## Unified Matching Screen (All Accommodation Types) - DONE

### Context
- Currently: Hosts have their own matching screen, Apartments will have theirs — same engine, different filter
- Staff (Noelle) doesn't always care whether a student needs a host or apartment — she just needs to find them a room
- Scale: apartments are ~10-11 rooms (maybe 30 in summer), hosts are ~80 families. Not a massive dataset.

### Proposed: A third "Matching" screen in the sidebar
- Shows ALL unplaced students regardless of accommodation type
- Below the dots: two collapsible sections — Apartments (small, collapsed by default) and Hosts (expanded)
- Or: a filter toggle (All / Hosts / Apartments) that switches the provider list
- Same drag & drop engine, same timeline grid
- Staff can filter to just Hosts or just Apartments if needed, but default shows everything
- NOT a channel management system — keep it simple, just two types for now

---

## Refactor: break up `public/admin.html` (7,731 lines) into smaller files

**Why:** single-file admin is harder to navigate, slower to read/edit, prone to merge conflicts, and forces the whole bundle to load on every request. Splitting reduces friction without forcing a build step.

**Phased plan (low → high risk):**

1. **CSS extract** — lift the ~600 lines of `<style>` into `public/admin.css`, link via `<link rel="stylesheet" href="/sis/admin.css">`. Zero behavior risk. Big readability win.
2. **JS extract (single file first)** — move the entire `<script>` block to `public/admin.js`, link via `<script src="/sis/admin.js"></script>`. All inline `onclick="foo()"` handlers continue to work because functions stay globally scoped under classic script loading. Verify nothing breaks before going further.
3. **Per-view JS split** — once #2 is stable, peel off domain views into their own files:
   - `admin-students.js` (showStudentsList, openNewStudentModal, etc.)
   - `admin-bookings.js`
   - `admin-classes.js` (incl. closures + leave deductions)
   - `admin-teachers.js`
   - `admin-accommodation.js` (Hosts/Apartments/Matching)
   - `admin-payroll.js`
   - `admin-documents.js`
   - `admin-core.js` (api, esc, formatDate, toast, navigate, openTab, sidebar wiring)
   - Load order matters: core first, then views. Keep classic scripts (no module migration) to preserve global function exposure.

**Out of scope for now:** moving to ES modules, adding a bundler (esbuild/vite), or migrating inline handlers to `addEventListener`. Those are useful later but not the bottleneck today.

**Risk:** medium during phase 3 — view code touches shared globals, easy to miss a dependency. Start with low-traffic views (e.g. Documents) before touching Students/Classes.

---

## Transport (was: Airport Transfer)

**Renamed Transport** because the section will eventually cover several travel types — airport transfers, group bus bookings, activity/excursion shuttles, and Leap-card procurement — not just airport runs. Section lives in the SIS admin left nav, below Social.

### V1 — Airport Pickup/Dropoff (in build now)
- Data source: existing `BookingExtra` rows where `extra_type` ∈ {`AIRPORT_PICKUP`, `AIRPORT_DROPOFF`} and `scheduled_at` is within the next 4 weeks
- UI mirrors the **Cleaning queue at Capel Street** — weekly cards (Mon–Sun), compact table inside
- No data model changes needed; `scheduled_at` and `details` already on BookingExtra
- Manual Link Taxis booking — staff flips a status flag once booked
- Slack #success notification on new request (Phase 2)

### V2 — Group bus bookings (deferred until Groups functionality exists)
- Group model exists in schema but is minimal (`name`, `agency`, dates, default accom rate). No bus/transport surface yet.
- Group quotations often include line items for bus transport (large coach booking, well in advance)
- Surface group bus jobs in the Transport view regardless of 4-week cutoff — bus bookings need long lead time
- Group transport types may include: airport↔accom, activity shuttles, excursion shuttles

### V3 — Activity / Excursion transport
- City-centre or accom → activity (within Dublin) or → excursion (outside Dublin)
- Often part of a packaged trip; staff need to know who's on which bus
- May overlap with Activities module

### V4 — Leap Card procurement
- Bulk Leap Card buy for groups (~€32/week × N students)
- Not a scheduling problem — a procurement/task problem
- Sub-flow: receive group student list → check if office has spare cards → recharge or buy fresh online/in person at Dublin Bus
- When group quotes don't include a real student manifest, placeholder names ("Child 1", "Child 2", etc.) get used with age + gender only

### Group functionality gap (separate from Transport)
- Current Group model is bare bones — needs:
  - Per-group enrolment with student manifest (real names OR placeholder rows)
  - Per-group quotation/extras (Leap cards, bus, group accom rate)
  - Tie-in to Bookings so transport extras inherit group context

**Out of scope (anywhere on this list):** Link Taxis API integration, in-app payment, dropoff billing reconciliation.

**Connects to:** Mobile app spec (`lms/.claude/1.plan/mobile-app/spec.md`) — student-facing Transport card on Profile tab pulls from the same data.

---

## Host Outreach — multi-channel switchers (V2; email shipped)

**Shipped + LIVE (2026-07-02):** weekly email nudge — `.claude/cron/host-outreach.js`, scheduled **Mon 16:00** (crontab, `--apply`). Gate = existing matching pool, **Host Family only, any arrival date (no time horizon)** — kept identical to the portal Section-A query. Editable template `host-outreach-weekly` (Accommodation → Confirm Provider), from accomm@ with the "Accomm Team" signature. See [[project-host-portal-v1]].
- **Future — surface cron in the admin UI** (Neil: "ultimately we're going to need it in the UI"): on/off, day/time picker, A/B slots, last-run + would-send count. For now it's code-only; edit the crontab line in the terminal to retime.

**V2 — add WhatsApp / SMS channels** (Neil, 2026-07-02). Not urgent; email first, then layer these on. Expected to lift response rates.
- **SMS is the easiest to build first** — we likely already have an SMS provider in the **bird.com** setup. But it incurs standard telephony/per-message charges → avoid unless the uplift justifies it.
- **WhatsApp vs SMS are MUTUALLY EXCLUSIVE per host** — never send both formats. WhatsApp is effectively free to send, so prefer it *where available*; fall back to SMS otherwise.
- **WhatsApp blocker:** we do NOT have an accomm@ **WhatsApp Cloud API** (programmatic send). We only have **WhatsApp for Business** — the *handset app* (deployable on ~5 devices), which is a different thing and can't be driven by the cron. Standing up the Cloud API (or a bird.com WhatsApp channel) is a prerequisite before any automated WhatsApp send.
- **Open question to clarify before building:** should there be a **time delay between the email and the second channel**? e.g. send email Tue 9am, then only WhatsApp/SMS the non-responders (no portal visit / no claim) N hours/days later — vs firing all channels at once. Decide the cadence + the "did they engage?" signal that suppresses the follow-up.
- Design the sender as a **channel switcher** (per-host preferred channel + global on/off per channel) so the same gate/recipient logic drives whichever channel(s) are enabled.

### Host-portal Communications Preferences (self-serve) — future (Neil brain-dump 2026-07-02)
Give hosts control of their own comms prefs so we stop guessing and stop staff-tracking holidays. NOT scheduled — capture only; may build later.

**Entry point — profile menu (top-right):**
- Today the portal top-right is just the ULearn logo. Add a profile affordance there: an avatar showing the host's **initials** (no photos yet). Identity isn't secret anyway — they can already see their Earnings + open invoice/bill PDFs, so the name is discoverable. No login stays (click-to-view, zero friction).
- Click avatar → dropdown → **Communications**, living under a **Preferences** area.

**Preferences → Communications:**
- Default = everything ON (opted in). A series of simple yes/no switches.
- Channel switches: **Email · WhatsApp · SMS** to start. Open question: collapse WhatsApp+SMS into one **"Text"** toggle (covers both texting types) vs three separate switches — decide at build. Ties into the mutually-exclusive WhatsApp-vs-SMS note above.

**Snooze-for-holidays (the important UX):**
- Surface snooze **up front** as a first-class button beside the on/off — NOT buried behind "turn off". Rationale: people won't switch comms off if it feels permanent/forever, and a permanent off means they must *remember* to switch back on. A dated snooze removes both the fear and the remembering.
- Two paths when a host wants to stop:
  - **Snooze for holidays** → immediately flips comms off AND surfaces a calendar (**Snooze from / Snooze until**); the end date auto-returns them to the fold (comms back on) with no action from them.
  - **Permanent off** → stays off until they re-enable.
- This is the host self-serve replacement for the deleted staff-set `activeFrom`/`activeTo` — the host declares their own away-window; we don't track holidays. (A host claiming a student is itself a live "I'm available" signal.)

**Rollout:** start minimal — surface the Communications area with just **Email** toggled on; layer WhatsApp/SMS + the snooze as those channels come online.

