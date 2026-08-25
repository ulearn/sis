# Micro-task: upload a passport into SIS (reuse the existing reader)

**Principle:** Do NOT write a passport reader or a parallel store. SIS already has the reader (`parsePassport` — GPT-4o vision, MRZ-first) wired to the student document bucket with auto-scan + human-confirm. You just put the file in the right place.

## The whole job: one call

```
POST https://sis.ulearnschool.com/sis/api/students/<studentId>/documents
  Authorization: Bearer $SIS_SERVICE_KEY
  multipart/form-data:   files=@passport.jpg   category=passport
→ 201  [ { "id": <docId>, "filename": "...", ... } ]
```

That's it. The file lands in the student's normal document bucket, so it's instantly visible in **SIS admin** and the **agency portal**. When staff open that student's documents in SIS, the passport **auto-scan fires there** (the reader runs and presents the extracted passport number / issue date / expiry date for a human to confirm and save) — natively, where staff already work. You don't read, confirm, or write anything.

**The one thing that matters:** send `category=passport` (not the default `visa`) so the auto-scan recognises it.

Auth: the service key is in SIS `.env` as `SIS_SERVICE_KEY`; it must be in your environment. The `service` role permits the `students` section. Use the SIS `<studentId>` (not a HubSpot id).

---

## Optional appendix — only if YOUR UI owns the confirm step

If you want to show the parsed fields in your own dashboard and have the human confirm there (instead of in SIS), do the upload above, then:

```
# 2. Run the reader on the uploaded doc (never writes)
POST /sis/api/students/<studentId>/documents/<docId>/read-passport
→ { success, supported, extracted:{
      passportNumber, surname, givenNames, dateOfBirth,
      dateOfIssue, dateOfExpiry, nationality, sex, needsReview[] }, parseError }

# 3. Human confirms number / issue / expiry in your UI.
#    Honour needsReview (fields the reader couldn't read; "not_a_passport" = wrong image).

# 4. Save the confirmed fields onto the student
PATCH /sis/api/students/<studentId>
  { "passportNumber":"...", "passportValidFrom":"<dateOfIssue YYYY-MM-DD>",
    "passportValidUntil":"<dateOfExpiry YYYY-MM-DD>" }
```
Mapping: `dateOfIssue → passportValidFrom`, `dateOfExpiry → passportValidUntil`. Dates `YYYY-MM-DD`. (nationality / birthday optional in the same PATCH.)

Don't use the `/sis/partners/...` passport routes — those are agency-session scoped and reject the service key.
