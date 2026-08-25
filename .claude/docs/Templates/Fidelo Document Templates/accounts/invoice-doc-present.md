Okay, the final thing here, as we try and push this ahead, is going to be what? It's going to be, well, kind of the invoicing at the sharp end of operations in terms of like its presentation to the agencies. Film agents, like generally they'll operate on just, you know, standard invoices, right? In the industry, they're called gross invoices. But sometimes the partner wants to have a net invoice so that it makes clear his commission. But generally, for obvious reasons, they don't want that presented to the student, right? They don't want the student to know that they're getting 25% of the cut or whatever. So it's really important that that invoice is only ever really delivered to the partner. I don't think there's any, I don't think there is ever a condition where the partner wants a net invoice to be presented to his lead, our student, the same person. I don't think that ever arises. So like arguably to avoid issues in the future, that attachment or that presentation should only ever be presentable to the agency. Like it should be forbidden by permissions or whatever that you just can't send it to the student because it's never going to arise. So I have a bit of a kind of a query about that, it's like how are we going to create, like obviously it's not that complicated. You just literally, you know, you can just add the 25% as a line item or whatever. You know, it reduces the total by that amount, or you just, sorry, maybe you say, hey, look, 25% commission, you take 25% from the course fee, which say, whatever it is, right? If it's 3,000 euros, they're getting 750 euros, more or less, right? So then you reduce the course fee by that amount, right? So you'd end up with 2,250 and the 750 for the commission, and that's the end. And you'd still have the total the same, right, 3000. But in Xero, if you're producing that invoice, obviously that's not really possible, generally speaking, because you're, you can't produce the same invoice twice, you know, not without skewing all of your accounting. So there's no, what would you call it, there is no presentation there, at least not that I'm aware of. There is no presentation there in Fidelio that permits you to kind of rewrite the invoice based upon, you know, your contact rules or, you know, just whatever your selection at the time, like, hey, I want this one to just show the gross, full stop. And I want this one to show the net plus the commission, you know, full stop. I don't think that you can really do that in Xero. The only way to do it would be to generate a separate invoice, I think, which again, you can't actually do there. So one way to do it, I suppose, would be to sync the Xero invoice back. Whenever it's requested, you just pull in the Xero invoice into a framework, which could actually, I think we could probably present this as a document, you know? It could just be a document under the financial. We could create, well, maybe just put it under agencies, you know, because it already exists. There is no financial section per se in the SIS anymore. Why? Because the invoicing is all done via the Quotations invoice and later Xero's invoice and payment assignment, right, through the reconciliation. So none of that takes place anymore in the SIS. It's now gone. So this kind of snag is really the last kind of tricky bit, you know what I mean? Now, all of this may be moot in the end because it may not be required because what we may end up doing here is producing, like producing net presentation invoices in the B2B pipeline. And, you know, we will do that on a per agency basis. We'll just say like, what kind of invoice do you want? You want net? Okay, cool. There's your net invoice count. And that could solve a lot of the issues, but it won't solve all of them. Why not? Because there are some instances where the agency insists on, demands upon having that net invoice presentation for themselves, for their own records, and sending the gross to the student. Why do they do that? Because they want to let the student know with full transparency across the three parties, right, the school, the agency, and the student, that they're not charging any more than the school is. That they're literally charging the same price as the school. That's kind of important from a trust standpoint. So a lot of students will receive that and the partners insist on us sending it plus the counter copy that's slightly altered in its line item presentation to show their cut. So that's kind of the thing that's on my mind about how best to do that. I do not, repeat, do not want to get back into producing invoices inside the SIS. We've just spent a huge amount of time getting it out of the SIS and getting it out of their means. Well, that's what it means, you know, getting it into the accounting area and getting the sales staff and other staff away from invoicing because it's a mess. And getting them to do their quotes in HubSpot, and that's it, right? They don't need to do it in one place. They don't need to worry about that anymore. The second thing I'm kind of on my mind a little bit is about, it's a minor issue, but just in terms of recurring payments, we are going to have recurring payments now coming in on some invoices. So we want them to be clearly indicated. That can be done via HubSpot. They have recurring payments, and you can manually collect them. How that will appear then in Xero, I don't really know, like, will it just create a huge big kind of liability that gets paid, or sorry, an asset, it would be a current asset that's getting paid off over 24 months. So in the latter kind of 12 months would go as a long-term asset, as a, on the balance sheet, it would be an asset, right? And it's getting, sorry, the current liability, rather, that's getting paid off by payments over the 24-month period. And I'm not exactly sure how that data sync will take care of that. There is a pretty robust data sync that we did not create, Xero or HubSpot created it. How do they manage recurring payments? I'm not really sure, but I'm pretty, pretty confident that there would be a way to manage it because HubSpot, you know, its invoicing setup is not that complicated, and I'm going to think that all the stuff that they have, it's going to be synced to Xero, I would imagine. But it's on my mind that that has to be resolved along with the direct debits that we have to sign off on in the OIS.

GPT:
([Past chat][1])([Past chat][1])([Past chat][2])([Past chat][2])

You’re right to **keep invoicing out of the SIS**. If you reintroduce “real invoices” there, you’ll recreate the exact accounting/control mess you just spent time removing.

The clean answer is:

# **Do not generate a second invoice**

Generate **one accounting invoice only** in Xero, and then generate **one or more controlled presentation documents** outside the accounting ledger.

That is the correct architecture.

---

# 1) Core principle: **Accounting document ≠ Presentation document**

You have **two different needs**:

## A. **Accounting truth**

This is the legal / bookkeeping / receivables reality.

That should live in:

* HubSpot (quote / sales workflow)
* Xero (invoice / reconciliation / payment assignment)

This is the **single source of financial truth**.

## B. **Audience-specific presentation**

This is what different parties are allowed to *see*.

Examples:

* Student sees **gross invoice**
* Agency sees **net statement**
* Agency sometimes also receives **gross copy**
* Internal staff may see **commission breakdown**
* Student must **never** see commission breakdown unless deliberately intended

These are **not accounting records**.
They are **rendered financial documents**.

That distinction solves nearly everything.

---

# 2) Best structure for SIS: **Financial Documents**, not “Invoices”

You said there’s no real financial section anymore in SIS.

That’s fine — but you **do need a document layer**.

Call it something like:

## **Financial Documents**

or

## **Billing Documents**

or

## **Commercial Documents**

Inside that, you can generate:

* **Student Invoice Copy**
* **Agency Gross Copy**
* **Agency Net Statement**
* **Commission Statement**
* **Installment Schedule**
* **Payment Plan Summary**
* **Direct Debit Schedule / Mandate Summary**

That way the SIS is **not doing accounting**.
It is only doing **controlled document rendering** from trusted synced data.

That is exactly the right boundary.

---

# 3) The right workflow

## Recommended architecture

### Step 1 — Sales creates quote in HubSpot

From the deal / booking logic.

### Step 2 — Invoice created in Xero

This becomes the **real receivable**.

### Step 3 — SIS pulls synced invoice data

Not to recreate it — only to **read** it.

You store:

* Xero Invoice ID
* Invoice number
* Contact billed
* Currency
* Line items
* Total
* Tax/VAT if applicable
* Balance due
* Due date
* Payment status
* Payment schedule / installments (if applicable)

### Step 4 — SIS renders audience-specific documents

From templates + rules.

That’s the important bit.

---

# 4) You need **document types**, not invoice variants

Do **not** think of this as “rewriting invoices”.

Think of it as:

## **Document Profiles**

Each document profile decides:

* who it is for
* what fields are visible
* how line items are shown
* whether commission appears
* whether totals are gross or net
* whether payment plan appears
* whether internal notes are hidden

That gives you clean control.

---

# 5) The exact document profiles you need

You probably only need **4**.

---

## **Profile A — Student Gross Invoice**

**Audience:** student
**Purpose:** what the student pays

### Shows:

* Course
* Accommodation
* Registration fee
* Exam fee
* Insurance
* Any standard line items
* Total due
* Payment instructions / payment link

### Hides:

* Commission
* Agency cut
* Internal margin
* Partner-specific notes

### Permission:

* Can be sent to student
* Can be sent to agency if needed
* Safe

---

## **Profile B — Agency Net Statement**

**Audience:** agency only
**Purpose:** show what they owe after commission

### Shows:

* Gross course fee
* Commission rate / amount
* Net payable
* Optional breakdown by product
* Optional “student charged standard school price” wording

### Hides:

* Internal notes
* unrelated student billing items if desired

### Permission:

* **Agency only**
* **Hard-block sending to student**
* This should be a permissions rule, not a warning

This is the one you’re worried about, and yes — it should be **forbidden by system design** from student delivery.

---

## **Profile C — Agency Gross Copy**

**Audience:** agency
**Purpose:** give them the same “student-visible” version for transparency

This is just the **same as Profile A**, but delivered to agency.

Why needed?
Because some agencies want:

* the student’s gross version
* **and**
* their own net statement

That’s normal.

---

## **Profile D — Payment Plan / Installment Schedule**

**Audience:** student and/or agency
**Purpose:** explain how payment will occur over time

### Shows:

* Total contract value
* Deposit paid
* Number of installments
* Amount per installment
* Start date
* Collection frequency
* Outstanding balance
* direct debit / subscription reference if relevant

This is **not the Xero invoice**.
It’s a **commercial payment schedule document**.

And this becomes important for Life Pass / subscriptions / recurring collection.

---

# 6) Permission model — this is non-negotiable

This is the key safeguard.

You need **document-level send permissions**, not just visibility.

## Rule set:

### Student contact can receive:

* Student Gross Invoice
* Payment Plan Summary
* Standard payment reminders
* Receipt / payment confirmation

### Agency contact can receive:

* Student Gross Invoice
* Agency Net Statement
* Agency Gross Copy
* Commission Statement
* Payment reminders (if partner is payer)

### Staff permissions:

* Sales can generate docs
* Finance can approve / release sensitive docs
* Sensitive docs may require finance permission

---

## Critical hard rule:

# **Agency Net Statement cannot be sent to Student contact type**

Not “warn the user”.
Not “are you sure?”
Not “be careful”.

Just:

# **Blocked**

Because you already know there is no valid use case.

That’s good system design.

---

# 7) Data model you need

This is not heavy.

You likely just need something like:

## `financial_documents`

* `id`
* `student_id`
* `booking_id`
* `deal_id`
* `xero_invoice_id`
* `document_type`
* `document_profile`
* `recipient_type` (`student`, `agency`, `internal`)
* `rendered_json`
* `pdf_path`
* `version`
* `created_by`
* `created_at`
* `sent_at`
* `sent_to_contact_id`

## `agency_terms`

* `agency_id`
* `default_invoice_mode` (`gross_only`, `net_only`, `both`)
* `commission_type`
* `commission_rate`
* `can_receive_commission_docs`
* `student_price_transparency_required` (true/false)

That one flag is useful.

Because then the system can do this automatically:

---

# 8) Best automation: per-agency defaults

You already spotted this.

Each agency should have a setting:

## **Invoice Presentation Preference**

Values:

* **Gross only**
* **Net only**
* **Both**
* **Case-by-case**

That means at the booking / quote / enrollment stage, the system already knows what to generate.

So staff aren’t reinventing the wheel every time.

---

# 9) How to build the “net invoice” presentation properly

This should **not** be a second invoice in accounting.

It should be a **statement-style document**.

That’s important.

Because if you call it “Invoice” too literally, you start getting into messy accounting semantics.

Better naming:

## Better names:

* **Agency Net Statement**
* **Agency Settlement Statement**
* **Commission Deduction Statement**
* **Partner Billing Statement**

That avoids the “double invoice” problem.

---

## Example rendering

### Student Gross Invoice

| Item           |     Amount |
| -------------- | ---------: |
| English Course |     €3,000 |
| **Total Due**  | **€3,000** |

---

### Agency Net Statement

| Item                         |     Amount |
| ---------------------------- | ---------: |
| Gross Course Fee             |     €3,000 |
| Less Agency Commission (25%) |      -€750 |
| **Net Payable**              | **€2,250** |

That is clean, intuitive, and does not require duplicate accounting entries.

---

# 10) What to sync from Xero vs what to calculate in SIS

This is important.

## Pull from Xero:

* invoice number
* issue date
* due date
* contact
* official line items
* total
* balance due
* payment status
* amount paid
* amount outstanding

## Calculate / enrich in SIS:

* agency commission
* net payable
* recipient-specific visibility
* installment narrative
* direct debit schedule
* payment plan display
* audience-specific wording

That keeps Xero clean and the SIS useful.

---

# 11) Recurring payments — do **not** rely on “invoice appearance” to explain them

This is the second issue you raised, and it’s a real one.

A recurring payment arrangement is **not the same thing as an invoice**.

You need to model **three layers** separately:

---

## Layer 1 — Commercial obligation

What the student agreed to pay overall.

Example:

* Total package = €7,050
* Deposit = €1,000
* Remaining = €6,050
* Paid over 24 months

This is your **contract / plan**.

---

## Layer 2 — Accounting treatment

How it is recognized in Xero.

This is where the real accounting decision happens.

And this is where I need to be blunt:

# **Do not assume HubSpot/Xero sync will handle this correctly by itself**

It might sync “payments”, “subscriptions”, or invoice objects — but that does **not** mean the accounting treatment is correct.

Those are not the same thing.

---

## Layer 3 — Collection mechanism

How money is actually collected.

Examples:

* card installments
* direct debit
* recurring payment link
* subscription charge

This is just **cash collection plumbing**.

---

# 12) For recurring payment students, the SIS should hold a **Payment Plan object**

This is what you need.

## `payment_plans`

* `id`
* `student_id`
* `booking_id`
* `deal_id`
* `plan_type` (`deposit_plus_installments`, `monthly_subscription`, etc.)
* `contract_value`
* `deposit_amount`
* `installment_count`
* `installment_amount`
* `frequency`
* `first_collection_date`
* `last_collection_date`
* `payment_method`
* `mandate_reference`
* `status`
* `xero_invoice_id` / `xero_contact_id`
* `hubspot_payment_link_id` / subscription id if used

This gives you a proper operational record.

Because otherwise, six months from now, someone will ask:

> “Why is this student only partially paid but still active?”

And you’ll need a structured answer.

---

# 13) Accounting treatment: your instinct is right, but don’t let the CRM decide it

You were circling the correct issue:

If someone commits to 24 months of payment, that may create:

* a receivable
* deferred income / contract liability
* installment receivable timing issues
* current vs non-current split depending on your accounting treatment

That is **not** something I would leave to default HubSpot sync behavior.

## My recommendation:

You need a **deliberate accounting policy** for:

### Life Pass / installment students

Specifically:

* When is revenue recognized?
* When is receivable recognized?
* Is the full amount invoiced upfront?
* Or are installments invoiced progressively?
* How do cancellations/defaults get treated?
* What happens if visa is refused / student never starts / student stops paying?

That policy needs to be decided with your accountant/bookkeeper and then implemented consistently.

Because the software should follow the policy — not invent it.

---

# 14) Operationally, the cleanest way is probably this

For the SIS / workflow side, I’d separate:

## A. **Invoice**

Official accounting invoice in Xero.

## B. **Payment Plan**

Commercial schedule in SIS.

## C. **Mandate / Direct Debit Authorization**

Operational payment authority.

## D. **Collection Events**

Each successful or failed recurring charge.

That gives you a clean audit trail.

---

# 15) Direct debit / OIS sign-off

You mentioned direct debits needing sign-off in the OIS.

That should absolutely sit as a separate object too.

You’ll want status flags like:

## Direct Debit / Mandate status

* Not sent
* Sent
* Viewed
* Signed
* Active
* Failed verification
* Cancelled

And then the payment plan can depend on that.

For example:

* Payment Plan = Approved
* Direct Debit = Pending Signature
* Collection = Not Started

That’s the sort of thing staff actually need to see operationally.

---

# 16) The clean recommendation in one line

# **Xero holds the truth. SIS holds the presentation and payment-plan logic.**

That is the correct split.

---

# 17) My recommendation for your build, specifically

If I were structuring this now, I would build:

## **New SIS modules**

### 1. **Financial Documents**

Render-only docs:

* Student Gross Invoice
* Agency Net Statement
* Agency Gross Copy
* Payment Plan Summary

### 2. **Payment Plans**

Operational recurring payment object

### 3. **Mandates / Direct Debits**

Signature + activation tracking

### 4. **Invoice Sync**

Read-only mirror of Xero invoice metadata

That gives you everything you need **without rebuilding invoicing inside SIS**.

---

# 18) Best next move

The best thing to do now is to define this properly before coding:

## You need a short spec for:

* document types
* permission rules
* agency defaults
* payment plan structure
* Xero fields to sync
* direct debit statuses

If you want, I can do that next as a **proper implementation spec / schema draft** for the SIS so you can hand it straight into build.

[1]: https://chatgpt.com/c/69bc6402-be44-838e-b266-2ff135ad1039 "Replacing Student Info System"
[2]: https://chatgpt.com/c/69beb292-fc10-8393-befc-6c9fd77adf9b "Xero HubSpot Payment Sync"


ME:
Yeah, that's a good setup, and what we'll actually do there is, in terms of presentation, we can give full permission to effectively kind of reissue the Xero invoice. So when we create it, we can send it back to SIS, to the agent profile, I suppose, or give the link to it, you know? A lot of time in Xero, you can actually print these documents as PDFs. It's just one thing. And the other way you can do it is by API. In any event, you could move over the information, and then you could just surface the required information in document format. The only thing is that, like, we would have to invoke some additional, like, a little bit of calculation would have to happen. To bring in the commission amount and make it a connection at the line item, for example, pushing through. But they would have no control over that. They would have no control. It's coming from Xero, and that's it. So the growth, the invoices could be surfaced in the agent, but then that one would not be surfaced in the student record of that SIS. Actually, that raises a question here, whether or not in the new SIS, we actually have agent-student relationships in place properly. So one agent ID is connected to many student IDs. I'm not sure if that exists. I think that it does, but we better double-check it.

GPT:
Yes — that’s the right direction.

# What you’re really describing

Not:

* agent edits invoice
* SIS creates invoice
* duplicate accounting record

But:

* **Xero remains source**
* SIS gets a **read-only financial artifact**
* SIS renders that artifact by audience
* commission logic is **derived**, not manually editable

That is clean.

# The important rule

## **Gross invoice**

Can be surfaced:

* in agent context
* in student context

## **Net / commission-bearing presentation**

Can be surfaced:

* in agent context only

Must not appear:

* in student context
* in student-send workflows
* in student document lists
* in student portal access if any

So yes, the gross Xero invoice can be reissued broadly, but the net presentation should live as a separate audience-restricted document.

# On the commission calculation

You’re right again: it should not be user-controlled at send time.

It should come from structured data only, such as:

* agency commission agreement
* booking/deal commission override if one exists
* product-level commissionability if needed
* invoice line items pulled from Xero

Then SIS calculates:

* gross total
* commissionable subtotal
* commission amount
* net payable

That way staff are not typing “25%” into random forms and causing inconsistencies.

# The one design caution

You mentioned “make it a connection at the line item”.

That is fine **only if** commission truly needs to follow line-level logic.

You’ve basically got 2 options:

## Option A — invoice-level commission

Simpler.

Example:

* Total commissionable tuition = €3,000
* Commission rate = 25%
* Commission = €750
* Net = €2,250

Best if commission applies only to certain categories in a predictable way.

## Option B — line-level commission mapping

More flexible.

Example:

* Tuition commissionable
* Registration fee non-commissionable
* Accommodation maybe commissionable or not depending on partner agreement
* Insurance non-commissionable

Then each synced Xero line is classified before rendering the net statement.

This is better long term if your partner terms vary.

My instinct is:

# use line-level eligibility, but keep the UI simple

Meaning:

* staff do not edit it on the fly
* rules come from agency terms + product mapping

# On the relationship question: yes, you absolutely need to verify it

This is not a minor detail. It is foundational.

You need to confirm that the SIS supports at least:

## Minimum relationship model

* **one agent/company**
* linked to **many students/bookings**

But more accurately, what you probably need is not just:

* agent → many students

You likely need:

* **agency/company**
* **agency contact**
* **student**
* **booking/enrollment**
* **deal**
* and the relationship should usually sit at **booking level**, not just student level

Why?

Because the same student could theoretically:

* come direct once
* come via an agent later
* switch agency
* have multiple bookings
* have one booking invoiced to agent and another to student

So the safest structure is:

# Better model

## Agency relation should attach to the **booking / enrollment / commercial case**

not only to the student master record.

Then you can still expose rollups like:

* Agency X has placed 143 students
* Student Y came through Agency X on Booking 2026-001

# Recommended structure

## `students`

Core identity of the learner

## `agencies`

The company / partner

## `agency_contacts`

Individual humans at that agency

## `bookings` or `enrollments`

The commercial-academic instance

And on `bookings`:

* `student_id`
* `agency_id` nullable
* `agency_contact_id` nullable
* `source_type` = direct / agency / partner / internal
* `commission_scheme_id`
* `invoice_recipient_type`
* `invoice_presentation_mode`

That is the level where this logic really belongs.

# Why this matters for your invoice presentation

Because the system needs to answer questions like:

* Was this booking direct or agency?
* Which agency?
* Which commission agreement applied at that time?
* Should gross only or both docs be generated?
* Who is allowed to receive them?
* Is the payer the agency or the student?

If the relationship only exists loosely at student level, that logic gets messy very quickly.

# So the immediate check you should make

You want to confirm whether the new SIS currently has:

## 1. Agency master record

A distinct entity for the partner company

## 2. Agency-to-student linkage

At least one-to-many

## 3. Booking-level agency linkage

This is the big one

## 4. Invoice recipient logic

Who is payer for that booking

## 5. Commission schema linkage

Which terms applied for that booking

If 3, 4, and 5 are missing, I’d treat that as a schema gap to fix now rather than later.

# Best-practice answer in one sentence

## The relationship should not just be “agent connected to many students.”

It should be:

## **agent connected to many bookings, each booking connected to one student**

because that matches the commercial reality.

# My recommendation

Before pushing further on the document layer, I would validate this exact chain:

**Agency → Booking/Deal → Student → Xero Invoice → SIS Financial Document**

If that chain exists cleanly, the rest is straightforward.

If you want, I can map this next into a compact schema draft with the exact fields for:

* agency relationships
* commission rules
* invoice presentation modes
* financial document permissions
