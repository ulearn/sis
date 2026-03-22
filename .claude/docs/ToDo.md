# SIS — To Do / Future Items

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

**This is the bifurcation point**: Sales → Operations (Success + Academic)

**Implementation options:**
- **Option A: HubSpot Workflow Webhook** — triggers on quote→invoice conversion. Concern: reliance on third-party webhook service, cost, reliability.
- **Option B: Periodic poll (preferred)** — SIS checks HubSpot every hour: "any quotes converted to invoices since last check?" Scrape and process. No third-party dependency. More reliable.
- **Option C: Hybrid** — webhook for speed, hourly poll as safety net to catch anything missed.

**What gets pushed:**
- To Xero: Invoice with student name, email, line items from HubSpot deal
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
