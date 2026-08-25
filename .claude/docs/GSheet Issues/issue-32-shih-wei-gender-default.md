# Issue 32 — Shih-Wei Huang / Gender null defaults to female pronouns

**Reporter:** PG
**Area:** Documents
**Sheet row:** 40 (assign issue number)
**Last checked:** 2026-06-19 UTC hrly7

## Symptom

Exit letter generated for Shih-Wei Huang shows Ms. and she/her pronouns throughout, but staff report the student is male.

## Root cause

Student 356 (Shih-Wei Huang): gender = null — never set in personal details.

src/scripts/documents.ts line 338:
  const isMale = student.gender === 1;   // null === 1  => false
  const salutation = isMale ? "Mr." : "Ms.";   // => "Ms."

Token assignments at ~L476-491:
  student.gender:              isMale ? "Male" : "Female"   // => "Female"
  student.salutation:          salutation                   // => "Ms."
  student.pronoun_subject:     isMale ? "he" : "she"       // => "she"
  student.pronoun_object:      isMale ? "him" : "her"      // => "her"
  student.pronoun_possessive:  isMale ? "his" : "her"      // => "her"

Evidence:
- student.gender = null (confirmed from DB today)
- Document 238 (template 4, exit letter) generated 2026-06-17 at 15:19 UTC as DRAFT
- content_html of doc 238 contains "Ms. Shih-Wei Huang", "she ended it", "Her course" — all female
- 14,053 students in the database have gender = null
- Every document generated for any of them will silently use female pronouns/salutation

## Fix recipe (NOT YET RUN)

### Step 1 — Fix this student gender
Open SIS -> Students -> Shih-Wei Huang (student 356) -> Personal Details -> set Gender to Male -> Save.

Or via DB (if SIS UI unavailable):
  -- NOT YET RUN
  UPDATE students SET gender = 1 WHERE id = 356;
  -- Gender encoding: 1 = male, 2 = female, null = unknown

### Step 2 — Revoke ISSUED document 238 and regenerate
NOTE: Doc 238 is now ISSUED (status changed 2026-06-18 08:53 UTC). Must be revoked. Once gender is set:
1. Open SIS -> student 356 -> Booking 560 -> Documents
2. Revoke/void document 238 — ISSUED Jun 18 08:53 UTC with wrong pronouns (not safe to just delete, must revoke via SIS workflow)
3. Regenerate the exit letter (template 4) — will pick up corrected gender

### Step 3 — Code fix (prevents recurrence for all null-gender students)
In src/scripts/documents.ts around line 337-340, change gender handling to produce a safe placeholder:

  // Current (bug):
  const isMale = student.gender === 1;
  const salutation = isMale ? "Mr." : "Ms.";

  // Proposed fix:
  const isMale   = student.gender === 1;
  const isFemale = student.gender === 2;
  const salutation = isMale ? "Mr." : isFemale ? "Ms." : "[Title]";

Pronoun tokens (~L487-491) should similarly handle null:
  student.pronoun_subject:     isMale ? "he" : isFemale ? "she" : "they"
  student.pronoun_object:      isMale ? "him" : isFemale ? "her" : "them"
  student.pronoun_possessive:  isMale ? "his" : isFemale ? "her" : "their"
  student.pronoun_possessive_cap: isMale ? "His" : isFemale ? "Her" : "Their"
  student.pronoun_subject_cap: isMale ? "He"  : isFemale ? "She" : "They"
  student.gender:              isMale ? "Male" : isFemale ? "Female" : ""

After code change: npm run build then restart server.

### Step 4 (optional) — Audit issued documents for null-gender students
  -- READ ONLY
  SELECT dr.id, dr.status, dr.template_id, dr.booking_id, s.id as student_id,
         s.first_name, s.last_name, s.gender
  FROM document_records dr
  JOIN bookings b ON b.id = dr.booking_id
  JOIN students s ON s.id = b.student_id
  WHERE s.gender IS NULL
    AND dr.status = 'ISSUED'
    AND dr.template_id IN (4, 82, 83)
  ORDER BY dr.updated_at DESC
  LIMIT 50;

Any ISSUED letters for male students with null gender will have wrong pronouns — they need regeneration and re-issue.

## Risk / category

- Documents — issued letters with wrong salutation/pronouns
- Reversible: Yes — ISSUED doc 238 can be revoked via SIS; gender is a single-field UPDATE; issued docs can be regenerated
- Blast radius: Limited to individual student for immediate fix; code fix improves all future null-gender docs; no financial or booking impact

## Status

ESCALATED — document 238 issued at 2026-06-18 08:53 UTC with Ms./she/her. Requires revocation.

**Last checked: 2026-06-18 UTC hrly** — s356 gender=null (unchanged, fresh DB). doc238 ISSUED Jun18 08:53 UTC (was DRAFT Jun17 15:19). 14,052 students with null gender (-1 since yesterday). Recipe NOT RUN.

**Jun18 hrly (this run):** s356 gender=null (fresh DB, unchanged). doc238 ISSUED Jun18 08:53 UTC — still not revoked (10h+ since issue). doc238 template 4 (exit letter), status=ISSUED. NEIL URGENT: set gender=1 (Male) via SIS → revoke doc238 → regenerate exit letter immediately.

**Jun19 hrly:** s356 gender=null (fresh DB — updAt=Jun03, 16d stale). doc238 STILL ISSUED Jun18 08:53 UTC (now 1+ day ago). Wrong pronouns Ms./she/her on exit letter bk560 still active. H cell updated this run (timestamp corrected, removed stale ~10h phrasing). J cell updated with Jun19 check. NOT YET RESOLVED — Neil must action steps 1-3.

**Jun19 hrly5 — UNCHANGED. s356 gender=null (updAt=Jun03, 16d). doc238 STILL ISSUED Jun18 08:53 UTC — 2 full days elapsed, wrong Ms./she/her pronouns on exit letter bk560 still active. NEIL URGENT: (1) SIS Students s356 Personal Details set Gender=Male; (2) revoke doc238; (3) regenerate exit letter bk560. NOT YET RUN.**
**Jun19 this run (interactive session):** DB direct-query blocked this run (interactive session, write-tool restriction). Status from hrly7 stands: s356 gender=null, doc238 STILL ISSUED Jun18 08:53 UTC. NOT YET RESOLVED.


**Jun20 SAT hrly — s356 gender=null (updAt=Jun03=17d stale, fresh DB). doc238 STILL ISSUED Jun18 08:53 UTC — 2 days elapsed with wrong Ms./she/her pronouns on exit letter booking 560. Only document on booking 560 is doc238. bk560 CONFIRMED 3168.75/3168.75. NEIL URGENT: (1) set gender=Male via SIS personal details for student 356; (2) revoke doc238 via SIS; (3) regenerate exit letter. Steps NOT YET RUN. Last checked: 2026-06-20 UTC hrly.**

**Jun21 hrly — s356 gender=null (updAt=Jun03=18d stale, fresh DB). doc238 STILL ISSUED Jun18T08:53 UTC — 3 days elapsed, wrong Ms./she/her pronouns on active exit letter booking 560. Only document on bk560 remains doc238 (templateId=4). NEIL: (1) SIS → student 356 → Personal Details → set Gender=Male; (2) revoke doc238; (3) regenerate exit letter. Steps NOT YET RUN. Last checked: 2026-06-21 UTC hrly.**

**Jun22 hrly — s356 gender=null (updAt=Jun03=19d stale, fresh DB). doc238 STILL ISSUED Jun18T08:53 UTC — 4 days elapsed, wrong Ms./she/her pronouns on exit letter booking 560. NEIL: (1) SIS → student 356 → Personal Details → set Gender=Male; (2) revoke doc238; (3) regenerate exit letter. Steps NOT YET RUN. Last checked: 2026-06-22 UTC hrly.**

**Jun23 hrly: CONFIRMED UNCHANGED — doc238 STILL ISSUED (Jun18=5d stale). st356 (Shih-Wei Huang) gender=null UNCHANGED (fresh DB, Jun03=20d stale). sourceJson contains salutation=Ms., gender=Female, pronoun=she/her — all wrong. No action taken. NEIL: (1) SIS student 356 Personal Details -> set Gender to Male; (2) SIS booking 560 Documents -> Revoke doc238 -> Regenerate exit letter. Code fix also pending (null-gender guard in src/scripts/documents.ts). Last checked: 2026-06-23 UTC hrly.**


**Jun24 WED hrly: CONFIRMED UNCHANGED (fresh DB). s356 gender=null (updAt=Jun03=21d stale). doc238 STILL ISSUED Jun18 08:53 UTC -- 6 days elapsed, wrong Ms./she/her pronouns on active exit letter booking 560. bk560 CONFIRMED 3168.75/3168.75. NEIL: (1) SIS student 356 Personal Details set Gender=Male; (2) revoke doc238; (3) regenerate exit letter. Steps NOT YET RUN. Last checked: 2026-06-24 UTC hrly.**
**Jun24 hrly (7th check): CONFIRMED UNCHANGED (fresh DB). s356 Shih-Wei Huang gender=null (updAt=Jun03=21d stale). doc238 STILL ISSUED Jun18 08:53 UTC — 6 days elapsed with wrong Ms./she/her pronouns on exit letter booking 560. templateId=4, versionNo=1. NEIL: (1) SIS Student 356 -> Personal Details -> set Gender=Male; (2) SIS bk560 Docs -> Revoke doc238; (3) Regenerate exit letter. Code fix (Step 3) also pending. Last checked: 2026-06-24 UTC hrly (7th run).**


**Jun25 THU hrly (12th check, fresh DB): CONFIRMED UNCHANGED. s356 Shih-Wei Huang gender=null (updAt=Jun03=22d stale). doc238 STILL ISSUED Jun18 08:53 UTC — 7 days elapsed with wrong Ms./she/her pronouns on active exit letter booking 560. templateId=4, versionNo=1. NEIL: (1) SIS Student 356 -> Personal Details -> set Gender=Male; (2) SIS bk560 Documents -> Revoke doc238; (3) Regenerate exit letter. Code fix (null-gender guard in src/scripts/documents.ts) also pending. Last checked: 2026-06-25 UTC hrly (12th check).**

**Jun26 FRI UTC (fresh DB — this run): CONFIRMED UNCHANGED. s356 Shih-Wei Huang gender=null (updAt=Jun03=23d stale). doc238 STILL ISSUED status=ISSUED, templateId=4 (exit letter), bookingId=560, updatedAt=Jun18 08:53 UTC — 8 days elapsed with wrong Ms./she/her pronouns. Fix (NOT YET RUN): (1) SIS → Students → Shih-Wei Huang (s356) → Personal Details → set Gender=Male and Save; (2) SIS → bk560 → Documents → Revoke doc238 (must use SIS workflow, not delete); (3) Regenerate exit letter via SIS. Code fix (Step 3 in recipe) also still pending. Last checked: 2026-06-26 FRI UTC hourly bot.**
**Jun27 SAT UTC (fresh DB): document 238 STILL ISSUED (exit letter template4 bk560, updated Jun18=9d stale). Student 356 gender=STILL NULL (updated Jun03=24d stale). Neil: (1) SIS student 356 → set gender=Male; (2) revoke doc238 via SIS; (3) regenerate. Last checked: 2026-06-27 SAT UTC hourly bot.**

**Jun27 SAT UTC (4th check today, fresh DB): CONFIRMED UNCHANGED. s356 gender=STILL null (updAt=Jun03=24d stale). doc238 STILL ISSUED (exit letter tmpl4 bk560 updAt=Jun18=9d stale). Neil: (1) SIS student 356 → set Gender=Male; (2) SIS bk560 Documents → Revoke doc238; (3) Regenerate exit letter. Last checked: 2026-06-27 SAT UTC hourly bot (4th check today).**

**Jun27 SAT UTC (8th check, fresh DB): CONFIRMED UNCHANGED. s356 Shih-Wei Huang gender=STILL null (updAt=Jun03=24d stale). doc238 STILL ISSUED (exit letter templateId=4, bookingId=560, updAt=Jun18=9d stale). Exit letter live with Ms./she/her pronouns — still wrong. Neil: (1) SIS Students -> Shih-Wei Huang (s356) -> Personal Details -> set Gender=Male -> Save; (2) SIS Booking 560 -> Documents -> Revoke doc238 (must revoke via SIS workflow, not delete); (3) Regenerate exit letter. Code fix (null-gender guard in documents.ts) also pending. Last checked: 2026-06-27 SAT UTC hourly bot (8th check).**

**12 Jul SUN UTC (fresh DB): UNCHANGED. s356 gender=STILL null (updAt=Jun03=39d stale). doc238 STILL ISSUED issuedAt=Jun18 (24 days with wrong she/her pronouns). Last checked: 2026-07-12 UTC (hrly bot).**

**13 Jul MON UTC (fresh DB): UNCHANGED. s356 gender=STILL null (updatedAt=Jun03=40 days). doc238 STILL ISSUED issuedAt=Jun18 (25 days with wrong she/her pronouns). K updated to 40d. Fix NOT RUN. Last checked: 2026-07-13 UTC (hourly bot).**

**14 Jul TUE UTC (fresh DB). UNCHANGED. s356 (Shih-Wei Huang) gender=STILL null (updatedAt=Jun03=41d). doc238 STILL ISSUED issuedAt=Jun18=26d ago. Male pronoun fix not yet applied. Fix NOT RUN.**


---
**16 Jul 2026 UTC (fresh DB)**

CONFIRMED UNCHANGED. Student 356 (Shih-Wei Huang): gender=STILL null (updatedAt=Jun03=43d). Document 238: STILL ISSUED issuedAt=Jun18=28 days with wrong Ms./she/her pronouns. Code fix (null-gender guard in documents.ts) also still pending. Fix NOT RUN.
Last checked: 2026-07-16 UTC (hourly bot).

**17 Jul FRI UTC (2nd check today, fresh DB). CONFIRMED UNCHANGED. Student 356 Shih-Wei Huang: gender=STILL null (updatedAt=Jun03, 44 days old). Document 238 (exit letter, booking 560): STILL ISSUED since Jun18 — 29 days with wrong Ms. and she/her pronouns. Null-gender code fix in documents.ts also pending. Fix NOT RUN. Last checked: 2026-07-17 FRI UTC (hourly bot).**
**4th check Sat 18 Jul UTC (fresh DB). CONFIRMED UNCHANGED. Student 356 Shih-Wei Huang: gender=STILL null (updatedAt=Jun03, 45 days). Document 238 (exit letter, booking 560, template 4): STILL ISSUED since Jun18 — 30 days with wrong Ms. and she/her pronouns. Null-gender code fix in documents.ts also still pending. Fix NOT RUN. Last checked: 2026-07-18 SAT UTC (4th check today).**