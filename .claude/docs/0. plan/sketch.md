## Opening GPT Braindump summary 

Here’s a clean, **actionable Markdown spec** you can drop straight into Claude Code (or similar) as a working brief.

---

# 🧠 SIS Replacement Project — V1 Architecture & Plan

## 🎯 Objective

Replace **Fidelo SIS (€750/month)** with a custom-built internal system that:

* Covers core operations (students, bookings, classes, attendance, accommodation)
* Integrates tightly with **HubSpot (CRM)**
* Supports compliance (attendance, documents, audit trail)
* Is modular, scalable, and API-first
* Enables future extensions (student portal, LMS, AI tutor)

---

# 🧩 System Architecture Overview

## Systems Separation

### 1. HubSpot (KEEP)

* Leads
* Deals
* Partners (CRM)
* Sales pipeline
* Communication

👉 Source of truth **before Deal = WON**

---

### 2. SIS (BUILD THIS)

* Students (post-sale)
* Bookings
* Classes & scheduling
* Attendance (compliance-critical)
* Accommodation
* Documents (PDF + QR)
* Payroll inputs (teaching segments)

👉 Source of truth **after Deal = WON**

---

### 3. Content / LMS (LATER MODULE)

* Curriculum (levels, weeks, themes)
* Lesson materials (text, video, audio)
* Quizzes/tests
* Teacher resources
* AI tutor (future)

👉 Separate from SIS core

---

# 🧱 Core Modules (V1 Scope)

## 1. Students

* Created when HubSpot Deal = WON
* Linked to:

  * HubSpot Contact ID
  * HubSpot Deal ID

---

## 2. Bookings (CORE ENGINE)

* One student → multiple bookings
* Fields:

  * start_date
  * end_date
  * course_type (morning/afternoon)
  * accommodation_required
  * price
  * status

---

## 3. Class Scheduling

### Entities:

* classrooms
* time_slots
* classes (A1, A2, B1, B2)
* class_sessions (dated occurrences)

### Key concept:

👉 **Sessions are date-based, not just weekly blocks**

---

## 4. Teaching Segments (Payroll-critical)

Each class session can have multiple segments:

```
- teacher_id
- class_session_id
- start_datetime
- end_datetime
```

👉 Enables:

* minute-level payroll
* substitutions
* accurate reporting

---

## 5. Attendance (COMPLIANCE-CRITICAL)

### Model:

Per student, per class session:

* present
* late
* absent_certified
* absent_uncertified
* excused

### Requirements:

* audit trail (who/when changed)
* % calculation (85% threshold)
* link to booking + class session
* export/reporting
* student view (later)

👉 Replace:
❌ paper + Slack photos
👉 with:
✅ structured database records

---

## 6. Accommodation

### Structure:

* providers (host families)
* properties
* rooms
* beds
* placements (date range)

👉 Each bed = time-based resource

---

## 7. Documents

* PDF generation
* Visa letters
* QR verification endpoint
* Email attachment system

---

## 8. HubSpot Integration (FIRST-CLASS)

### Trigger:

**Deal → WON**

### Flow:

1. HubSpot webhook
2. Create:

   * student
   * booking
3. Return:

   * sis_student_id
   * sis_booking_id
4. Store in HubSpot

---

## Sync Back to HubSpot:

* booking_created
* visa_letter_issued
* attendance_risk
* course_completed

---

# 🧠 Data Design Principles

## Separate clearly:

### 1. Student

Person

### 2. Booking

Commercial agreement

### 3. Assignment

Operational placement:

* class
* teacher
* accommodation

👉 This separation avoids legacy system chaos

---

# 🛠️ Technical Stack

## Database

* PostgreSQL

---

## Backend

* Node.js
* TypeScript

---

## ORM

* Prisma (recommended)

### Usage:

* ORM for CRUD
* raw SQL for:

  * reporting
  * payroll
  * complex queries

---

## Frontend (Admin)

* Next.js (or similar)

---

## Architecture Style

* API-first
* modular services

---

# 🧠 TypeScript Decision

## Use TypeScript ✅

Even if AI-generated code:

* enforces structure
* prevents drift between modules
* catches errors early
* improves long-term maintainability

👉 Especially important for:

* SIS complexity
* integrations
* evolving schema

---

# 📦 Project Structure

## Keep services separate (current approach OK)

* /hubspot-sync
* /bird-integration
* /xero-finance
* /sis (NEW CORE SYSTEM)

👉 No need for monorepo unless shared logic grows

---

# 📚 Curriculum / LMS (V1.1+)

## Structure:

```
Level (A1–B2)
  → Theme (monthly)
    → Week
      → Day (Mon–Fri)
```

### Friday:

* test
* review
* speaking task

---

## Content Types:

* text (markdown)
* audio
* video
* worksheet
* quiz
* speaking prompt

---

## SIS stores:

* level
* progress
* completion
* scores

## Content system stores:

* actual materials

---

# ⚠️ Key Constraints

## DO NOT:

* clone HubSpot
* build full LMS in V1
* overbuild UI early
* mix content into SIS DB
* rely on weekly-only scheduling
* store attendance as summaries only

---

## DO:

* build schema-first
* use migrations
* track everything with audit logs
* design for real workflows (not theory)
* keep modules cleanly separated

---

# 🚀 V1 Timeline (Realistic)

## Phase 1 (6–10 weeks)

* core schema
* bookings
* class sessions
* attendance
* basic accommodation
* HubSpot sync
* documents

---

## Phase 2 (3–6 weeks)

* UI improvements
* reporting
* payroll calculations
* edge cases

---

## Phase 3 (later)

* student portal
* LMS/content
* AI tutor
* automation

---

# 🧭 Strategic Framing

This is NOT:

> “rebuild Fidelo”

This IS:

> “build a clean, modern operational core system with HubSpot as the commercial front end”

---

# ✅ Next Step

Define:

* database schema (tables + relations)
* API module structure
* HubSpot sync payloads
* V1 screen list (admin UI)

---

If you want next:
👉 I can generate the **actual Postgres schema + Prisma models (V1)** based on this.
