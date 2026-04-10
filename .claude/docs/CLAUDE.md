# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.


## Basics 
You are operating in a Node.Js environment in Phusion Passenger 
You do not have root/sudo access in this shared linux VPS server 
You can run nvm and install standard packages that way

Server URL: https://sis.ulearnschool.com/sis/
Main Index: /home/sis/public_html/sis/index.js

On creation, we ran this cPanel instruction for "sis" nodeJS environment: we are in a shared VPS linux Phusion Passenger environment - the node_modules are synlinked to start 

  cPanel instructions "sis" nodeJs environment: Enter to the virtual environment.To enter to virtual environment, run the command: source 
  /home/sis/nodevenv/public_html/sis/20/bin/activate && cd /home/sis/public_html/sis

INDEX & FILE / FOLDER ARCHITECTURE RULES
The index is located at: /home/sis/public_html/sis/index.js 
- CARDINAL RULE: The index should never contain any business logic!! it is for routing/endpoints/authoirzation ONLY!!!
    All business logic goes to the files in /home/sis/public_html/sis/scripts/.../
- Avoid naming redundancies: If a file is in a folder called foo/ then just name the script bar.js - don't call it foobar.js 
    Additionally always aim for the minimum possible naming convention to identify a script by its function - don't use 3 words (so-foo-bar.js) when 2 (or better yet 1) will suffice (bar.js)

Basic Instructions
Restart Server: From the sis/ directory the command is: touch tmp/restart.txt
Logs: When I say "read log" or "read the log files" or similar, I mean review the last 50-75lines of /home/sis/public_html/sis/sis.log

COMMANDS
Search commands like "grep" can be run without asking me (non-editing & non-destructive procedure)


HUBSPOT
- Subscription: Sales Pro + Marketing Hub Starter (NO Operations Hub)
- No custom code blocks in workflows — calculations must happen externally (SIS or Make.com)
- Portal ID: 26488591

GIT
Repo: https://github.com/ulearn/sis
- We are only operating on the claude branch
- Never do anything destructive with git without asking permission

=========================================================================================================

PROJECT SPECIFIC CONTEXT

Read Related Files:

//==================================================================//
//============ SERVER & ENVIRONMENTS ===============================//
//==================================================================//

ENVIRONMENT: Shared VPS (no root & no sudo) | NodeJS environments on Phusion Passenger | Local Postgre database | TypeScript compiler to JS

READ ONLY!!! DO NOT WRITE TO THE GitHub REPO!!
Read Only GitHub Repo: https://github.com/ulearn/sis
- You will only review the branch "claude"
- During testing & patching you will output all code updates only to the Artifacts
- You can view the Repo as required - DO NOT COMMIT OR EDIT THE GitHub REPOSITORY unless explicitly instructed to do so
- Never access the master branch - only the claude branch 
- AND TO BE EXPLICIT - NEVER OVERWRITE OR PUSH CHANGE TO MASTER (again unless there's some VERY UNUSUAL SITUATION and I explicitly tell you to do so)


INDEX & .ENV VARIABLES
Index: /home/sis/public_html/sis/index.js
- Stores routes/endpoints/authorization
- No business logic in the index!! 
- All business logic is stored in the script files stored in: /home/sis/public_html/sis/scripts/

.env FILE: /home/sis/public_html/sis/.env

MySql Database
 - 

Business Logic 
 - Project is assembled by platform and function in /home/sis/public_html/sis/scripts subfolders (see architecture). I'll outline some of the key files here.


## Protocol: How to Approach Any Task

### Core Principle: APIs Don't Have Bugs

**Bird.com, HubSpot, Facebook, and other established APIs never have "bugs" in their core functionality.** If you encounter failures or errors from the API, it is due to:
- Your approach being wrong
- Invalid request structure
- A valid reason for failure (e.g., attempting to add headlines when maximum has been reached)
- Missing required fields
- Incorrect field naming (snake_case vs camelCase)

**Always report failures as:** "My code has encountered errors from the API - we must rethink our approach."

Never jump to the conclusion that the API is broken. Read the error message carefully, check the documentation, and adjust your implementation.



## Project Overview

SIS (Student Information System) — a custom replacement for Fidelo SIS (€750/month). Manages students, bookings, classes, attendance, accommodation, and documents for a language school. HubSpot remains the CRM; this system takes over after a deal is won.

## Hosting & Runtime

- Hosted on CloudLinux with Phusion Passenger (configured via `.htaccess`)
- Node.js 20 runtime at `/home/sis/nodevenv/public_html/sis/20/bin/node`
- Entry point: `index.js`
- Base URI: `/sis`
- To restart the app, touch `tmp/restart.txt`

## Planned Tech Stack (from `.claude/docs/0. plan/sketch.md`)

- **Database:** PostgreSQL
- **Backend:** Node.js + TypeScript
- **ORM:** Prisma (raw SQL for reporting/payroll/complex queries)
- **Frontend:** Next.js (admin UI)
- **Architecture:** API-first, modular services

## Core Domain Modules (V1)

1. **Students** — created when HubSpot Deal = WON, linked via HubSpot Contact/Deal IDs
2. **Bookings** — one student → many bookings (dates, course type, price, status)
3. **Class Scheduling** — classrooms, time slots, classes (A1–B2), date-based sessions (not weekly blocks)
4. **Teaching Segments** — per-session teacher assignments with start/end datetimes (minute-level payroll)
5. **Attendance** — per student per session; compliance-critical (85% threshold); full audit trail
6. **Accommodation** — providers → properties → rooms → beds → time-based placements
7. **Documents** — PDF generation, visa letters, QR verification
8. **HubSpot Integration** — webhook on Deal WON; sync booking/attendance/visa events back

## Key Design Principles

- **Student vs Booking vs Assignment** are separate concepts (person / commercial agreement / operational placement)
- Schema-first; use migrations; audit-log everything
- Do not clone HubSpot functionality; do not mix content/LMS into SIS DB
- Sessions are date-based, not weekly-only
- Attendance stored as individual records, not summaries
- **Agencies: HubSpot is authoritative.** The `agencies` table in Postgres is a Fidelo-era holdover kept only so `Booking.agencyId` joins work. Treat `id`, `name`, `hubspotCompanyId` as the only valid fields. **Never read `commissionRate`, contact details, or other agency fields from Postgres** — always fetch from the HubSpot API. Flag any existing code that violates this.
