## ME
Should we explore using HubSpot Courses Object instead of using Products?
https://arisegtm.com/blog/how-to-set-up-hubspots-course-object-for-maximum-results#:~:text=HubSpot's%20Course%20object%20changes%20this,teams%20getting%20the%20most%20value:

## GPT
Should we explore using HubSpot Courses Object instead of using Products?


https://arisegtm.com/blog/how-to-set-up-hubspots-course-object-for-maximum-results#:~:text=HubSpot's%20Course%20object%20changes%20this,teams%20getting%20the%20most%20value: 

## ME
The issue with Products is they were originally designed for physical things

We still time

There is non time component in hubcaps invoicing

You can register Quantity X Price but you cannot do 

Quantity X Weeks X Price 

So(for groups this is especially problematic and the workaround is to create (Product+Week) combinations and multiply by number of students

That's a shit workaround & well known limitations of the software

Secondly even if just live with that as we have always done we are also going to lose the dates that Fidelo does actually provide - it's invoicing is calendarized - we can see the booking arrival & end date and that feeds into the Arrivals list & class placement logic 

Although we do have a Start date & number of weeks in the Deal, in a HubSpot invoice no such functional calendarized dating exists to beat of my knowledge

So that would require special data allotment once the invoice is synced to Xero and onto the new SIS 

I thought perhaps the Courses Object might offer calendar rating in the invoice which is why I raised it now

## gt
You’ve hit the exact limitation correctly — and you’re not missing anything.

## HubSpot Products problem (your case)

HubSpot Products are fundamentally:

```
Quantity × Unit Price = Total
```

They are **not time-aware**.

So:

* ❌ No native “weeks”
* ❌ No start/end date logic
* ❌ No calendarisation
* ❌ No duration-based billing model

Which is why you’ve ended up with:

> Product + Week × Students

…and yeah — that’s a hack, not a model.

---

# Key clarification on Courses Object

## ❗Important:

**Courses Object does NOT fix invoicing**

It:

* does **not integrate into HubSpot invoicing logic**
* does **not introduce time-based pricing**
* does **not change line item math**
* does **not solve calendarised billing**

So if your hope was:

> “Courses Object might give us Quantity × Weeks × Price”

👉 **It won’t.**

---

# The real issue (framed properly)

You don’t have a “Products problem”.

You have a:

## 👉 **Time-based commercial model vs unit-based CRM**

You are selling:

```
Duration × Rate × People
```

HubSpot supports:

```
Units × Price
```

Those are fundamentally different models.

---

# What Fidelo does (correctly)

Fidelo is closer to reality because it stores:

* start date
* end date
* duration
* booking window
* calendar alignment

That’s why:

* arrivals list works
* class assignment works
* accommodation works
* payroll works

That is **time-first modelling**

---

# HubSpot is not designed for that

HubSpot is:

* deal-centric
* revenue-centric
* transactional
* not scheduling-aware

So trying to force:

* class dates
* attendance windows
* accommodation timelines

into:

* Products / Line Items

is always going to feel wrong.

---

# The correct architecture (this is the fix)

## HubSpot handles:

👉 **commercial intent**

## SIS handles:

👉 **time reality**

---

# So how do you fix your current problem?

## You do NOT try to fix it inside HubSpot

Instead:

## You store time logic OUTSIDE invoicing

---

# Recommended model (clean)

## In HubSpot Deal

Store:

* Start Date ✅
* Duration (weeks) ✅
* Students count (if group) ✅
* Price per week ✅
* Accommodation required ✅

These are **deal properties**, not product logic.

---

## Then compute:

```
Total = Weeks × Price × Students
```

And push that as:

👉 a **single line item total**

You are not using HubSpot to calculate — you are using it to **store the result**

---

# Where calendar lives

## In SIS (or interim layer)

That system should store:

* booking_start_date
* booking_end_date
* calculated duration
* gaps / holidays
* real attendance windows

That becomes the **source of truth**

---

# Invoice problem (Xero)

You already hinted at the correct solution.

## You will need:

### Custom data mapping layer

Between:

* HubSpot
* SIS
* Xero

---

## Example flow

### 1. Deal won (HubSpot)

Contains:

* start date
* weeks
* price
* student count

---

### 2. SIS creates booking

Calculates:

* end date
* calendar structure
* class assignment windows

---

### 3. Invoice generation

You have 2 options:

---

## Option A (simplest)

Generate invoice like:

```
General English Course (12 weeks)
€3,600
```

Dates stored separately in SIS

---

## Option B (better)

Push to Xero as:

```
General English Course
From: 10 Mar 2026
To: 05 Jun 2026
12 weeks @ €300/week
```

👉 But this is done via **your integration logic**, not HubSpot natively

---

# Why Courses Object still has value

Even though it doesn’t fix invoicing, it *can* help with:

* linking students to course instances
* storing:

  * level
  * start date
  * end date
* reporting enrolments
* bridging HubSpot → SIS

So:

## Courses Object = optional organisational layer

## NOT a billing solution

---

# The real fix (long term)

You already said it:

## 👉 Replace Fidelo

Because what you actually need is:

### A system that understands:

* time
* scheduling
* duration
* overlapping bookings
* attendance
* compliance

That is your SIS.

---

# Short-term pragmatic fix

Until SIS is ready:

## Do this:

### 1. Stop overloading Products

Use them only for:

* pricing reference
* not duration logic

---

### 2. Move time logic into Deal properties

* start_date
* weeks
* end_date (calculated)
* students
* price_per_week

---

### 3. Use automation or API to:

* calculate totals
* generate invoice payload

---

### 4. Push clean data to Xero

With:

* description including dates
* correct total

---

# Blunt summary

## Your current pain is real and expected

HubSpot:
❌ cannot model time-based billing properly
❌ cannot calendarise invoices
❌ cannot replace a booking engine

---

## Courses Object:

❌ does NOT fix this
✅ helps organise academic relationships

---

## The actual solution:

👉 Time logic lives in SIS
👉 HubSpot remains sales layer
👉 Invoicing is calculated externally

---

# Final one-liner

## You don’t need a better Product model

## You need to stop using Products to model time

---

If you want, next step I can give you:

👉 a **clean data contract between HubSpot → SIS → Xero**

That’s the missing piece that fixes all of this properly.


## ME
Yeah so the invoice layer will remain as it's - we will need to sync existing date & duration fields stopped in the HubSpot Deal to the newly created Student in the SIS 

No Biggie 

I will still explore courses some more anyway


## GPT
Yeah — that’s the right call. Keep invoicing as-is for now and **treat HubSpot → SIS as the handoff of time data**, not the place where time logic lives.

## Minimal, clean handoff (Deal → SIS)

On **Deal = Won**, send:

* `hubspot_contact_id`
* `hubspot_deal_id`
* `start_date`
* `weeks`
* `price_per_week`
* `students_count` (if group)
* `course_slot` (morning/afternoon)
* `accommodation_type` (if any)
* `partner_id` (if any)

### In SIS, derive:

* `end_date = start_date + weeks`
* booking window (with gaps/holidays if needed)
* class assignment window
* accommodation placement window

👉 SIS becomes the **source of truth for dates** immediately.

---

## Practical pattern

* **HubSpot**: captures intent (start date + duration)
* **SIS**: calculates reality (calendarised booking)
* **Xero**: receives formatted invoice (you control description)

You already have the right instinct.

---

## About exploring Courses Object

Worth exploring, but with a **clear boundary**:

### Good uses for you

* link **Contact ↔ Course**
* store:

  * level (A2, B1…)
  * start/end (light reference)
  * partner association
* quick reporting like:

  * “students in B1 this month”
  * “partner X enrolments”

### Not worth doing

* trying to:

  * drive invoicing
  * handle duration logic
  * replace SIS scheduling
  * manage attendance

Keep it **lightweight or you’ll recreate Fidelo inside HubSpot** (which you definitely don’t want).

---

## One smart move while you’re here

If you’re syncing Deal → SIS anyway, add:

### Store back into HubSpot:

* `sis_student_id`
* `sis_booking_id`

That gives you:

* traceability
* debugging clarity
* ability to re-sync or fix things cleanly

---

## Optional small upgrade (nice win)

Add a computed Deal property:

* `calculated_total = weeks × price_per_week × students`

So:

* sales sees real value immediately
* invoices are consistent
* no mental math

---

## Bottom line

* ✔ Keep invoices as they are
* ✔ Push **time logic into SIS**
* ✔ Use HubSpot as **commercial capture layer**
* ✔ Explore Courses Object, but **don’t overcommit**

You’re lining this up properly now — this is exactly the clean break Fidelo never had.


## ME: Right so the SIS needs the calendar system