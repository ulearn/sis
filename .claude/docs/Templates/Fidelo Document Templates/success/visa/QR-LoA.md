https://chatgpt.com/share/69cc0f52-3ba0-8388-8ba4-05ffd4e86fbc
We have a QR code system on current SIS Fidelo. It applies a QR code on the output of student docs like official Letters of Acceptance which are presented to immigration in arrival. When scanned this sends the user to a webpage at our domain which confirms the student details and their official status as an accepted ULearn student. This must be unique to the student ID and probably to the Booking ID (where multiple Bookings are possible). How would we recreate this system? This is one component of a PDF document creation system we need to reproduce. The current SIS literally stores the pdf files which I think is probably unnecessary storage overhead. Instead we could just use some sort of HTML or Markdown editor to review/edit the templated information before outputting the PDF one time prior to sending to the Student. We really only need to store the content as a record rather than the whole PDF on the server. We could lock that version of the content sent with a timestamp / unique version code. If the Student requires a reprint we can send it again but no edits should be allowed on the version - keep audit trail intact. That way we would only create & store the PDF for attachment to the email but after that all that would be stored would be content itself which could sorted as lightweight html or Markdown. Not sure which format would be most efficient - you should advise. robably html as it will need the QR on it and we are rooting with the idea of a photo of the student also.


## ############################################

Yes — this is very doable, and you probably should not store the PDF as the primary record.

Recommended model

Treat the document content + metadata as the legal/business record.

Treat the PDF as a generated delivery format.

That means:

store the locked document content
store the version / timestamp / who generated it
store the QR target URL and verification token
optionally store a hash of the final rendered PDF
generate the PDF on demand, or generate once for email and discard it afterward

That gives you:

less storage overhead
cleaner audit trail
easy reprint
no confusion over “which version was sent”
1. Core concept

You need 3 separate things:

A. Booking / student data

Your normal SIS entities:

students
bookings
courses
agents if relevant
B. Document record

A table representing the official letter instance.

Example:

document_records

id
student_id
booking_id
document_type
e.g. letter_of_acceptance
version_no
status
e.g. draft, issued, superseded, cancelled
content_html
content_markdown optional
content_json optional structured source data
issued_at
issued_by_user_id
verification_token
verification_url
pdf_sha256 optional
email_message_id optional
locked_at
created_at
updated_at
C. Verification record / public verification page

This is what the QR code points to.

Could be same table or separate one:

document_verifications

id
document_record_id
student_id
booking_id
verification_token
public_status
revoked_at nullable
last_checked_at optional
2. What the QR should identify

You said:

unique to the student ID and probably to the Booking ID

Correct.
It should really resolve to the document instance, not just student or booking.

Best approach:

one QR per issued document version
tied internally to:
student_id
booking_id
document_record_id
public URL uses a non-guessable token

Example public URL:

https://yourdomain.com/verify/loa/7J4xK9mQe2P8aB1fN6zR

Do not expose raw numeric IDs publicly if you can avoid it.

Internally the token maps to:

Student: Sophia Rossi
Booking: BK-2026-004812
Document: Letter of Acceptance v1
Issued: 2026-03-29 14:12 UTC
Status: Valid

That is much safer than:

/verify?student_id=123&booking_id=456
3. What happens when QR is scanned

The QR should open a public verification page on your domain.

That page should show something like:

Verification result

Document type: Letter of Acceptance
Institution: ULearn
Student: John Smith
Date of birth: 12 May 2004
Nationality: Brazilian
Course: General English / Academic Year
Booking reference: BK-2026-004812
Start date: 07 April 2026
End date: 27 March 2027
Status: Valid and issued by ULearn
Issued on: 29 March 2026
Document version: 1.0

And optionally:

student photo
passport number partially masked
branch / campus
hours per week
visa-related wording

Also include a clear invalid state:

revoked
superseded
not found
expired if your rules require expiry
4. Important security point

The public verification page should show only the minimum necessary data.

Immigration verification needs enough detail to confirm authenticity, but not everything.

Good public fields:

name
DOB
nationality
course
booking/course dates
status
document issue date
institution name

Be careful with:

full passport number
home address
phone
email
internal notes

For sensitive identifiers, either omit or mask:

Passport: P****1234
5. Best format to store: HTML or Markdown?

For this use case: store HTML as the canonical renderable version.

Why HTML wins

Because your document likely needs:

exact layout
tables
headers/footers
logo
QR image
student photo
styled signature blocks
predictable PDF rendering

Markdown is great for simple text, but once you need:

positioned QR code
institutional branding
richer layout
conditional sections
print styling

you end up converting to HTML anyway.

Best approach

Store both layers if you want a nice editor workflow:

Option A — simplest and strongest

Store:

content_html as canonical locked record

That is enough.

Option B — best for editing pipeline

Store:

content_source_json = structured data used to build the letter
content_html = final locked rendered content
optional editor_notes or template_snapshot

This is better than Markdown for institutional documents.

My advice:

Use structured data + HTML

Not Markdown as the main record.

6. Recommended workflow
Draft stage

Admin opens “Generate Letter of Acceptance”.

System pulls live data from:

student
booking
course
pricing
visa category if relevant

Then applies a template and creates a draft preview.

Review / edit stage

Admin reviews the letter in an editor.

Important: editing should be controlled.

You do not want a freeform Word-style free-for-all on official immigration docs.

Better:

editable approved sections only
templated variables locked where needed
optional free text areas such as:
special notes
accommodation statement
fee/payment note
Issue stage

When admin clicks Issue Document:

freeze content
generate document_record
assign version number
generate verification token
generate QR code from verification URL
embed QR into final HTML
generate PDF
email PDF to student
mark record as immutable

After this:

no editing
only “reissue same version”
or “create amended version 1.1 / 2.0”

That preserves audit trail.

7. Versioning model

You mentioned:

no edits should be allowed on the version

Exactly right.

Use this logic:

Draft

Editable, not official.

Issued

Locked forever.

Amended / Reissued

If something must change, do not edit the old one.

Create a new version:

v1.0 — issued 29 Mar 2026
v1.1 — corrected passport expiry typo
v2.0 — booking materially changed

Public verification can show either:

only latest valid version
or exact scanned version status

Better is exact version status.

Example:

scanned v1.0 → “Superseded by v1.1”
scanned v1.1 → “Valid”

That is very strong operationally.

8. Should you store the PDF at all?
My recommendation

Do not rely on PDF storage as the primary record.

But I would still consider one of these two approaches:

Approach 1 — no stored PDF

Store:

locked HTML
version metadata
verification token
PDF hash

Generate PDF again when needed.

This is leanest.

Approach 2 — optional archived PDF for high-value docs

Store:

locked HTML
PDF hash
optional archived PDF path/object storage key

This is safer if you ever need to prove the exact byte-for-byte file sent.

For immigration/official docs, there is an argument for keeping the exact binary artifact, but in cheap object storage, not cluttering your DB/app server.

So the best compromise is:

Store HTML in DB, store PDF only optionally in object storage

For example:

database = official content record
object storage = optional immutable attachment archive

That gives you legal defensibility without bloating the app.

9. How QR generation should work technically

At issue time:

create document record
generate token
build verification URL
generate QR image
inject QR into HTML
render PDF

The QR itself can be:

PNG
SVG

I would favour SVG inside HTML/PDF if your renderer handles it well, because it stays sharp in print.

10. Suggested database structure

A practical simplified schema:

students
id
first_name
last_name
dob
nationality
photo_url
bookings
id
student_id
course_id
start_date
end_date
status
document_templates
id
document_type
name
html_template
is_active
version
document_records
id
student_id
booking_id
document_type
template_id
version_no
content_html
source_json
verification_token
issued_by_user_id
issued_at
locked_at
status
pdf_hash
supersedes_document_id
document_dispatches
id
document_record_id
sent_to_email
sent_at
delivery_method

That is enough to start.

11. Suggested URL design

Use clean public routes:

/verify/document/{token}

or by doc type:

/verify/loa/{token}

The token should be long random text, not sequential.

Example generation:

128-bit random token
base62 or hex encoded
12. What the editor should be

For this kind of system, I would not start with raw Markdown editing.

I would use one of these:

Option 1 — controlled HTML editor

Admin sees rendered document preview and can edit approved text blocks.

Good if:

you want fidelity
you want a branded print layout
Option 2 — structured form + preview

Better in many cases.

Instead of “editing the document”, admin edits fields like:

fee confirmation paragraph
accommodation paragraph
notes to immigration
signatory name/title

Then the system rebuilds preview instantly.

This is often much safer than letting staff freely edit HTML.

My recommendation

For official student letters:

Use structured fields + HTML template preview

That is better than full freeform editing.

13. Rendering stack idea

Pipeline:

Template

HTML with placeholders:

<h1>Letter of Acceptance</h1>
<p>This is to confirm that {{student_name}} ...</p>
<img src="{{qr_code_data_uri}}" />
Source data

JSON object:

{
  "student_name": "John Smith",
  "booking_reference": "BK-2026-004812",
  "course_name": "Academic Year Programme",
  "start_date": "2026-04-07",
  "end_date": "2027-03-27"
}
Final locked artifact

Rendered HTML stored in DB.

PDF

HTML → PDF renderer.

That is clean and reproducible.

14. Audit trail rules

For official docs, keep these events:

draft created
edited by
issued by
issued at
emailed to
verification page viewed optional
superseded
revoked

This is far more valuable than merely storing random PDFs.

15. Reprint logic

When a student wants the same doc again:

Reprint
regenerate PDF from locked HTML
same version
same QR
same verification page
log reprint timestamp

When a detail has changed:

Amend
create new document version
old version becomes superseded or revoked
new version gets new QR/token

That keeps things clean.

16. Student photo

Yes, photo can be included.

Best approach:

store photo separately as media asset
reference it in the rendered HTML
optionally embed it in final PDF

Avoid bloating the document record itself with big binary blobs.

Store:

student.photo_asset_id
or student.photo_url
17. Recommendation summary
Best overall design
Canonical record

Store:

structured source data
final locked HTML
metadata
versioning
verification token
PDF

Generate for delivery and reprints.

QR

One QR per issued document version, pointing to a public verification URL with a secure token.

Editing

Use structured fields + HTML preview, not Markdown as the primary system.

Storage

Do not store PDFs in DB as your main record.
If you want archival certainty, store PDF files in object storage only for issued docs.

18. My direct answer on format

You said:

Not sure which format would be most efficient - you should advise. robably html

Yes.

Use HTML, not Markdown, as the final stored document format.

Even better:

structured JSON data + final locked HTML

That gives you:

flexible generation
predictable PDF rendering
proper QR embedding
possible photo inclusion
easier legal/audit trace

Markdown is too limited for this as the primary official document format.

19. Simple implementation logic

In plain English:

Staff selects student + booking
System loads template
Template fills from booking/student data
Staff reviews and edits permitted fields
Staff clicks Issue
System locks content
System creates token + QR
System embeds QR in final HTML
System renders PDF
System emails PDF
System stores locked HTML + metadata + audit trail
Later reprints regenerate PDF from locked HTML

That is the right direction.

20. My practical recommendation for your SIS rebuild

For ULearn SIS, I would build this as a separate module:

documents

with:

templates
drafts
issued records
verification
PDF rendering
email dispatch
audit log

And define initial supported document types:

Letter of Acceptance
Visa support letter
Payment confirmation
Attendance confirmation
Enrollment letter

Same engine, different templates.

If you want, I can map this into a concrete PostgreSQL schema + Node.js flow + route structure next.

## #################################################
ME:
13 - template content editor: will need to look into this. The current system outputs a mix of dynamic fields and text. The excess would be invoice done but we will not be creating invoices in the new sis. In that sense I imagine it will be closer to a standard CRM mix like what HubSpot or MailChimp does with {{Personalization Tokens}} - pretty straightforward stuff I think

14/15 - ok yes those events need to be logged & immutable but it must be clear and obvious that the lock version cannot be updated or amended once sent. The only option available to standard users is to re-send or create a new version.
16 - photo already exists in Student Record - pulled from there but not duplicated or stored a second time (only reported at six create time)
17 - yes 
18 -agree HTML
19 - Implementation - agreed 👍🏻 
20. - yes - that is basically the whole thing


## #################################################
GPT:
Good. That gives a pretty clean target architecture.

1. Template editor

Yes — this should be much closer to HubSpot/Mailchimp token insertion than to a full document editor.

So the model becomes:

fixed HTML template
dynamic placeholders/tokens
limited editable text blocks
live preview

Example:

<p>This is to confirm that {{student.full_name}}, born {{student.dob}}, has been accepted onto the course {{booking.course_name}} beginning on {{booking.start_date}}.</p>

<p>{{custom.intro_paragraph}}</p>

<p>{{custom.visa_note}}</p>

That is the right level.

Recommended split

Use 3 content layers:

A. System tokens

Pulled automatically from SIS and not manually typed each time.

Examples:

{{student.full_name}}
{{student.nationality}}
{{student.passport_number_masked}}
{{booking.reference}}
{{booking.start_date}}
{{booking.end_date}}
{{course.title}}
B. Controlled editable blocks

Editable by staff before issue.

Examples:

{{custom.additional_note}}
{{custom.accommodation_text}}
{{custom.payment_status_text}}
{{custom.special_remarks}}
C. System-only rendering elements

Never hand-edited.

Examples:

QR
institution logo
signatory block
student photo
issue timestamp
version code

So yes — tokenised HTML template editor with preview is the correct approach.

2. Locking / immutability

Agreed. This needs both:

real backend immutability
very obvious UI restrictions

Not just “we told users not to edit it.”

Standard user actions after send

Once status = issued, standard users should see only:

View
Download PDF
Re-send
Create new version

They should not see:

Edit
Replace
Update
Overwrite

That needs to be visually blunt.

Example UI status badge:

Issued — Locked
Immutable record
“This version has been sent and cannot be changed.”
3. Backend rule

This is important:

Even if somebody hacks the frontend or sends a rogue request, backend must reject edits.

So once issued:

content_html cannot be updated
source_json cannot be updated
verification_token cannot be changed
issued_at cannot be changed

Only allowed operations:

log resend
generate PDF again
create successor version
revoke/supersede if role permits

That is the real lock.

4. New version logic

Exactly as you said:

original sent version remains untouched
amended document is a new record
linked back to prior one

Example:

LOA-2026-000412 v1.0 — issued
LOA-2026-000412 v1.1 — issued, supersedes v1.0

Or cleaner:

each issue is its own immutable record
supersedes_document_id links the chain

I prefer that.

5. Photo handling

Yes — perfect.

Use:

photo already stored in student record
referenced at render time
embedded into final HTML/PDF at issue time
not duplicated as a separate student-photo copy in storage

That is the right approach.

Only thing to decide is whether the locked document record stores:

just the final rendered <img src="...">
or a snapshot reference such as photo_asset_id_used_at_issue

I would recommend storing the asset reference used at issue time in metadata as well, so the audit trail knows which photo source was used.

6. What the module really is

Yes — this is basically the whole document engine.

A clean scope would be:

Documents module

with 6 parts:

1. Templates
HTML templates
token definitions
allowed editable blocks
template versioning
2. Draft generation
merge SIS data into template
preview before issue
3. Issue / lock
freeze rendered content
assign version
create verification token
embed QR
render PDF
log send event
4. Verification
public URL from QR
valid / superseded / revoked result page
5. Re-send / reprint
same locked content
same version
same QR
6. New version creation
copy prior content as starting point
allow edit before re-issue
new immutable record on send
7. Best implementation shape

From what you’ve now confirmed, the cleanest canonical record is:

Store
source_json
rendered_html_locked
document metadata
token snapshot used
photo_asset_id_used
verification_token
status
issued_at
sent_at
version_no
audit log events
Generate
QR image/SVG at issue time
PDF for sending or download
Do not treat as primary record
PDF blob in DB

That is the right design.

8. One practical UX point

For staff, I would make the workflow explicitly:

Draft

editable

Ready to issue

review screen

Issue and send

hard confirmation action

After that, the screen changes permanently to:

Issued — Locked

with only:

View
Download
Re-send
Create new version

That will reduce operational mistakes a lot.

9. Next build step

The next useful step is to define:

token naming convention
document statuses
DB schema
route structure
issue/send/reissue logic

I’d do that next as a concrete technical spec rather than more theory.

## ################################################
ME:
Yes - and those templates can be setup by admin for use downstream by standard users (ie no need or desire for users to be editing/ breaking the templates). That way the operations team will just select "LoA" or "Enrollment Letter" and it'll output the dynamic content at once. That should retain ability to update the content in the WYSIWYG editor in case of errors or missioning CRM data for now


## ################################################
Good. That gives a pretty clean target architecture.

1. Template editor

Yes — this should be much closer to HubSpot/Mailchimp token insertion than to a full document editor.

So the model becomes:

fixed HTML template
dynamic placeholders/tokens
limited editable text blocks
live preview

Example:

<p>This is to confirm that {{student.full_name}}, born {{student.dob}}, has been accepted onto the course {{booking.course_name}} beginning on {{booking.start_date}}.</p>

<p>{{custom.intro_paragraph}}</p>

<p>{{custom.visa_note}}</p>

That is the right level.

Recommended split

Use 3 content layers:

A. System tokens

Pulled automatically from SIS and not manually typed each time.

Examples:

{{student.full_name}}
{{student.nationality}}
{{student.passport_number_masked}}
{{booking.reference}}
{{booking.start_date}}
{{booking.end_date}}
{{course.title}}
B. Controlled editable blocks

Editable by staff before issue.

Examples:

{{custom.additional_note}}
{{custom.accommodation_text}}
{{custom.payment_status_text}}
{{custom.special_remarks}}
C. System-only rendering elements

Never hand-edited.

Examples:

QR
institution logo
signatory block
student photo
issue timestamp
version code

So yes — tokenised HTML template editor with preview is the correct approach.

2. Locking / immutability

Agreed. This needs both:

real backend immutability
very obvious UI restrictions

Not just “we told users not to edit it.”

Standard user actions after send

Once status = issued, standard users should see only:

View
Download PDF
Re-send
Create new version

They should not see:

Edit
Replace
Update
Overwrite

That needs to be visually blunt.

Example UI status badge:

Issued — Locked
Immutable record
“This version has been sent and cannot be changed.”
3. Backend rule

This is important:

Even if somebody hacks the frontend or sends a rogue request, backend must reject edits.

So once issued:

content_html cannot be updated
source_json cannot be updated
verification_token cannot be changed
issued_at cannot be changed

Only allowed operations:

log resend
generate PDF again
create successor version
revoke/supersede if role permits

That is the real lock.

4. New version logic

Exactly as you said:

original sent version remains untouched
amended document is a new record
linked back to prior one

Example:

LOA-2026-000412 v1.0 — issued
LOA-2026-000412 v1.1 — issued, supersedes v1.0

Or cleaner:

each issue is its own immutable record
supersedes_document_id links the chain

I prefer that.

5. Photo handling

Yes — perfect.

Use:

photo already stored in student record
referenced at render time
embedded into final HTML/PDF at issue time
not duplicated as a separate student-photo copy in storage

That is the right approach.

Only thing to decide is whether the locked document record stores:

just the final rendered <img src="...">
or a snapshot reference such as photo_asset_id_used_at_issue

I would recommend storing the asset reference used at issue time in metadata as well, so the audit trail knows which photo source was used.

6. What the module really is

Yes — this is basically the whole document engine.

A clean scope would be:

Documents module

with 6 parts:

1. Templates
HTML templates
token definitions
allowed editable blocks
template versioning
2. Draft generation
merge SIS data into template
preview before issue
3. Issue / lock
freeze rendered content
assign version
create verification token
embed QR
render PDF
log send event
4. Verification
public URL from QR
valid / superseded / revoked result page
5. Re-send / reprint
same locked content
same version
same QR
6. New version creation
copy prior content as starting point
allow edit before re-issue
new immutable record on send
7. Best implementation shape

From what you’ve now confirmed, the cleanest canonical record is:

Store
source_json
rendered_html_locked
document metadata
token snapshot used
photo_asset_id_used
verification_token
status
issued_at
sent_at
version_no
audit log events
Generate
QR image/SVG at issue time
PDF for sending or download
Do not treat as primary record
PDF blob in DB

That is the right design.

8. One practical UX point

For staff, I would make the workflow explicitly:

Draft

editable

Ready to issue

review screen

Issue and send

hard confirmation action

After that, the screen changes permanently to:

Issued — Locked

with only:

View
Download
Re-send
Create new version

That will reduce operational mistakes a lot.

9. Next build step

The next useful step is to define:

token naming convention
document statuses
DB schema
route structure
issue/send/reissue logic

I’d do that next as a concrete technical spec rather than more theory.

Yes - and those templates can be setup by admin for use downstream by standard users (ie no need or desire for users to be editing/ breaking the templates). That way the operations team will just select "LoA" or "Enrollment Letter" and it'll output the dynamic content at once. That should retain ability to update the content in the WYSIWYG editor in case of errors or missioning CRM data for now

Exactly. That is the right separation.

Recommended permission model
Admin

Can:

create templates
edit templates
define which tokens are available
define which text blocks are editable downstream
activate/deactivate templates
version templates
Standard users / operations

Can:

select template type like LoA or Enrollment Letter
generate draft from student + booking data
edit only the permitted content areas in WYSIWYG
preview
issue/send
re-send existing issued version
create new document version

Cannot:

alter template structure
break token syntax
edit system-only sections
modify locked issued versions

That is the correct operational model.

Best architecture for this

You really have 2 levels of document control:

1. Template layer

Owned by admin only.

This is the master blueprint, for example:

official heading
logo placement
signature block
standard LoA wording
token positions
QR placement
photo placement
print styling
2. Document instance layer

Used by ops team.

This is where they generate a real document for:

one student
one booking
one document type

and can fix practical issues before sending.

That keeps the templates safe while still giving staff enough flexibility.

On the WYSIWYG point

Yes — a limited WYSIWYG editor makes sense at the document-instance stage.

Not for rebuilding the whole template.

So the flow is:

admin designs template once
ops selects template
system injects tokens
ops sees draft
ops can correct wording / fill missing details in allowed areas
ops issues document
document locks permanently

That means the WYSIWYG is acting more like a review-and-correct layer, not a template builder.

That is a good compromise because, in the real world, CRM/SIS data is sometimes missing or messy.

Important distinction: editable regions only

I would strongly avoid making the whole rendered HTML editable by standard users.

Instead, template should define editable zones.

For example:

intro_note
payment_note
visa_note
special_remarks

while the rest stays system-controlled.

So a template might look conceptually like:

<h1>Letter of Acceptance</h1>

<p>This is to confirm that {{student.full_name}} has been accepted on {{booking.course_name}} from {{booking.start_date}} to {{booking.end_date}}.</p>

<div data-editable="visa_note">
  {{custom.visa_note}}
</div>

<div data-editable="remarks">
  {{custom.remarks}}
</div>

<div data-system="photo">{{student.photo}}</div>
<div data-system="qr">{{document.qr}}</div>

That is much safer than giving them full freehand access.

Why this matters

If you let standard users edit the whole HTML, eventually somebody will:

delete the QR block
break the layout
remove key legal text
mess up signatures
paste ugly Word formatting
accidentally alter token syntax

You do not want that.

So:

Admin controls structure
Ops controls only permitted content

That is the stable model.

Practical behaviour when CRM/SIS data is missing

You mentioned missing CRM data.

That is exactly why the draft step matters.

The system should do this:

During draft generation

If token data is missing:

highlight the missing field clearly
either leave placeholder warning
or allow ops to fill the related editable fallback field

Example:

{{student.passport_no}} missing
system flags: Missing required data
ops can either:
go back and fix student record
or populate a temporary permitted override field if policy allows

Best practice is:

required official fields should normally be fixed in source record

not manually patched forever in the document

But you can allow controlled override where necessary.

Good model for token handling

Use 3 categories:

System tokens

Always auto-filled, not editable by ops.

Examples:

student name
DOB
nationality
booking dates
course title
student ID
booking ID
Editable fallback fields

Only used if source data is absent or needs special wording.

Examples:

visa note
accommodation note
special letter note
payment wording
System-generated issue tokens

Created only on issue.

Examples:

document number
issue timestamp
version number
verification URL
QR code

That will keep the whole thing tidy.

Best UI for operations team

For a standard user, the screen should feel simple:

Step 1

Choose document type:

LoA
Enrollment Letter
Attendance Letter
Payment Confirmation
Step 2

Select student + booking

Step 3

System generates draft preview

Step 4

Warnings appear for missing required fields

Step 5

User can edit only allowed rich-text blocks

Step 6

Preview final PDF-style render

Step 7

Issue and send

Step 8

Document becomes Issued — Locked

That is probably the cleanest operational flow.

Template versioning

Since admin may later improve wording or layout:

templates themselves should be versioned too
but a document instance should store which template version it was created from

So for example:

LoA Template v2.3
Document issued on 2026-03-29 used template v2.3

That helps later if someone asks why an older letter looked slightly different.

Recommendation on “retain ability to update content”

Yes — but be precise:

Before issue

Standard user may update allowed content areas.

After issue

No update at all.

Only:

re-send same version
create new version

That line needs to be absolute.

Final model in one sentence

Admin owns the document templates; operations staff generate document instances from those templates, correct only permitted content in a controlled WYSIWYG draft stage, then issue a locked immutable version that can never be edited afterward.

That is the system.

The next logical step is to define the exact entities and fields for:
templates, template editable regions, document instances, issue events, and verification tokens.

## ################################################

ME:
Yes - and those templates can be setup by admin for use downstream by standard users (ie no need or desire for users to be editing/ breaking the templates). That way the operations team will just select "LoA" or "Enrollment Letter" and it'll output the dynamic content at once. That should retain ability to update the content in the WYSIWYG editor in case of errors or missioning CRM data for now

xactly. That is the right separation.

Recommended permission model
Admin

Can:

create templates
edit templates
define which tokens are available
define which text blocks are editable downstream
activate/deactivate templates
version templates
Standard users / operations

Can:

select template type like LoA or Enrollment Letter
generate draft from student + booking data
edit only the permitted content areas in WYSIWYG
preview
issue/send
re-send existing issued version
create new document version

Cannot:

alter template structure
break token syntax
edit system-only sections
modify locked issued versions

That is the correct operational model.

Best architecture for this

You really have 2 levels of document control:

1. Template layer

Owned by admin only.

This is the master blueprint, for example:

official heading
logo placement
signature block
standard LoA wording
token positions
QR placement
photo placement
print styling
2. Document instance layer

Used by ops team.

This is where they generate a real document for:

one student
one booking
one document type

and can fix practical issues before sending.

That keeps the templates safe while still giving staff enough flexibility.

On the WYSIWYG point

Yes — a limited WYSIWYG editor makes sense at the document-instance stage.

Not for rebuilding the whole template.

So the flow is:

admin designs template once
ops selects template
system injects tokens
ops sees draft
ops can correct wording / fill missing details in allowed areas
ops issues document
document locks permanently

That means the WYSIWYG is acting more like a review-and-correct layer, not a template builder.

That is a good compromise because, in the real world, CRM/SIS data is sometimes missing or messy.

Important distinction: editable regions only

I would strongly avoid making the whole rendered HTML editable by standard users.

Instead, template should define editable zones.

For example:

intro_note
payment_note
visa_note
special_remarks

while the rest stays system-controlled.

So a template might look conceptually like:

<h1>Letter of Acceptance</h1>

<p>This is to confirm that {{student.full_name}} has been accepted on {{booking.course_name}} from {{booking.start_date}} to {{booking.end_date}}.</p>

<div data-editable="visa_note">
  {{custom.visa_note}}
</div>

<div data-editable="remarks">
  {{custom.remarks}}
</div>

<div data-system="photo">{{student.photo}}</div>
<div data-system="qr">{{document.qr}}</div>

That is much safer than giving them full freehand access.

Why this matters

If you let standard users edit the whole HTML, eventually somebody will:

delete the QR block
break the layout
remove key legal text
mess up signatures
paste ugly Word formatting
accidentally alter token syntax

You do not want that.

So:

Admin controls structure
Ops controls only permitted content

That is the stable model.

Practical behaviour when CRM/SIS data is missing

You mentioned missing CRM data.

That is exactly why the draft step matters.

The system should do this:

During draft generation

If token data is missing:

highlight the missing field clearly
either leave placeholder warning
or allow ops to fill the related editable fallback field

Example:

{{student.passport_no}} missing
system flags: Missing required data
ops can either:
go back and fix student record
or populate a temporary permitted override field if policy allows

Best practice is:

required official fields should normally be fixed in source record

not manually patched forever in the document

But you can allow controlled override where necessary.

Good model for token handling

Use 3 categories:

System tokens

Always auto-filled, not editable by ops.

Examples:

student name
DOB
nationality
booking dates
course title
student ID
booking ID
Editable fallback fields

Only used if source data is absent or needs special wording.

Examples:

visa note
accommodation note
special letter note
payment wording
System-generated issue tokens

Created only on issue.

Examples:

document number
issue timestamp
version number
verification URL
QR code

That will keep the whole thing tidy.

Best UI for operations team

For a standard user, the screen should feel simple:

Step 1

Choose document type:

LoA
Enrollment Letter
Attendance Letter
Payment Confirmation
Step 2

Select student + booking

Step 3

System generates draft preview

Step 4

Warnings appear for missing required fields

Step 5

User can edit only allowed rich-text blocks

Step 6

Preview final PDF-style render

Step 7

Issue and send

Step 8

Document becomes Issued — Locked

That is probably the cleanest operational flow.

Template versioning

Since admin may later improve wording or layout:

templates themselves should be versioned too
but a document instance should store which template version it was created from

So for example:

LoA Template v2.3
Document issued on 2026-03-29 used template v2.3

That helps later if someone asks why an older letter looked slightly different.

Recommendation on “retain ability to update content”

Yes — but be precise:

Before issue

Standard user may update allowed content areas.

After issue

No update at all.

Only:

re-send same version
create new version

That line needs to be absolute.

Final model in one sentence

Admin owns the document templates; operations staff generate document instances from those templates, correct only permitted content in a controlled WYSIWYG draft stage, then issue a locked immutable version that can never be edited afterward.

That is the system.

The next logical step is to define the exact entities and fields for:
templates, template editable regions, document instances, issue events, and verification tokens.

Another thing is that legacy document handling, so we have an old system that really I would just, I would love to just take it offline in the next, I've already paid for another month of it, so probably we're gonna let it run through, but you know, ideally, like it's 700 quid a month, you know, so ideally, we get that thing shut down as quick as we can. That would mean that we would have issued some, I can identify them, but we would have issued letters of acceptance and so forth to a lot of students and they will have a QR code on that letter. Now ultimately, I suppose I could, let's see, it depends on where those links actually go to. I can double check where they go. I think that they go to our domain, forward slash, a booking ID, maybe forward slash, some code or other. What would you call this? Some kind of a hash salt, some kind of string comes out of the domain. If the link itself is on our domain, it's less of an issue because I could just identify the documents and put in a 301 redirect from those ones to an updated page that just says success. Even if that particular page is just a temporary holding site for all those legacy people, I would be fairly happy with that because, like, it may not, what would you call it, like, it may not resolve to a perfect. Identifiable, a user-identifiable page, like what we're describing now, but so long as, like, it probably could do that, do you know what I mean? We could create a specific page for each of the students. The numbers will not be huge anyway, but provided that if it is number one on our domain, if the QR code goes from our domain to from our domain, then I can just do a 301 redirect in Drupal and just put it onto the, you know, a success page of some sort or other, right? It's not the end of the world. Like, I'll put it this way. Their permission to reside or whatever in the country doesn't, like, it won't, it won't rise or fall on the basis of just that one letter. Do you know what I mean? Like, they are entitled to phone us from the Department of Immigration ISD. We could obviously issue a new letter to all of those people and say, look, we've updated our systems, here's your letter. That would be less, it would be lower preference to do that because obviously that's going to create a lot of stress and concern, like, why are they sending me two documents? Which document is the live document? And even though you explain these things 10 times, you know, you're talking about different languages and people are thousands of miles away, and, you know, so you're adding to people's worries by doing that. So preferably, we get a backend solution here to take care of the legacy docs.
Thought for 12s

Yes — and this is actually very salvageable, provided one thing is true:

Critical condition

If the QR resolves to a URL on your own domain, you are in good shape.

If so, you do not need Fidelo alive just to keep old QR codes functioning.

That is the key.

What this is called

What you are describing is basically:

legacy document verification continuity

or more simply:

legacy QR verification fallback

That is the right problem to solve.

And the good news is: it is not hard if the URLs are yours.

The correct strategy

Do not think of this as “migrating old PDFs”.

Think of it as:

preserving the public verification endpoint

That is all immigration / third parties really care about when scanning.

Not:

what internal system generated it
whether Fidelo still exists
whether the PDF was stored in some old blob bucket

They care that:

QR scans
page opens
page says student/document is valid enough to trust

That’s the real objective.

Best-case scenario

If your legacy QR links look something like:

https://ulearnschool.com/verify/12345/abCDefGhIj

or

https://ulearnschool.com/student-letter/booking/12345/token/XYZ

then you can simply take over those routes yourself.

That is ideal.

In that case:

You do not need a 301 redirect at all necessarily.

Even better:

recreate the same route pattern

and serve your own verification response from your new system.

That is cleaner than redirecting if possible.

Why redirect is not your best first option

A 301 is fine as a fallback, but it is not the best primary design.

Why?

Because if old QR codes already point to:

/verify/booking/123/token/abc

then ideally when someone scans that QR, they should land on a page that says:

valid
accepted student
issued by ULearn
maybe name / booking / date

not just some vague:

“success”
“system updated”
“verification complete”

That’s too weak for official verification use.

So:

Better than redirect:

capture and reproduce the old verification URLs directly

That is the proper backend solution.

What I would do
Phase 1 — immediately

Before turning Fidelo off:

1. Collect all legacy QR URL patterns

You need to inspect a few old letters and determine:

exact URL structure
whether they are all the same pattern
what variables are in them

For example:

https://ulearnschool.com/verify/booking/48392/token/f8e2a7b

or:

https://ulearnschool.com/booking/48392/f8e2a7b

or whatever it is.

This matters a lot.

2. Export the legacy verification records

From Fidelo or wherever they are stored, export at minimum:

booking ID
student name
DOB if needed
course / programme
start date
end date
status
QR token / hash / code
issue date
document type

This is your legacy verification registry.

That registry is what keeps those old letters alive after Fidelo dies.

The ideal solution

Create a dedicated table like:

legacy_document_verifications

Fields like:

id
legacy_source = fidelo
legacy_booking_id
legacy_student_id nullable
document_type
student_name
dob
nationality
course_name
start_date
end_date
status
legacy_token
legacy_url_path
notes
migrated_at

That gives you a lightweight legacy lookup layer.

Then your website simply says:

If incoming QR URL matches legacy pattern → look up in legacy table → show verification page.

That is it.

Best outcome

Then when an old student scans their old Fidelo-issued QR code:

they still get:

Valid verification page

Something like:

ULearn Student Verification

Status: Verified
Document type: Letter of Acceptance
Student: John Smith
Booking reference: BK-48392
Course: Academic Year Programme
Dates: 07 Apr 2026 – 27 Mar 2027
Issued under previous ULearn student records system
This record remains valid and verifiable

That is more than enough for continuity.

This is much better than mass reissuing letters

You are completely right to avoid mass reissuing if possible.

That would create:

confusion
duplicate document chains
“which one is valid?”
student anxiety
admin workload
multilingual explanation problems

So yes:

preserve old verification endpoints instead of reissuing everything

That is absolutely the better path.

Your fallback if the old route structure is ugly

Even if the legacy URLs are a mess, you still have options.

Suppose the QR points to:

https://ulearnschool.com/fidelo/booking.php?id=48392&key=ab73k29

You can still handle that in one of two ways:

Option A — recreate route handling

Best if feasible.

Option B — 301 or 302 redirect to a new canonical verification route

For example:

Old:

/fidelo/booking.php?id=48392&key=ab73k29

Redirect to:

/verify/legacy/ab73k29

That is acceptable if needed.

So yes — your instinct is correct, but I’d refine it:

not just “redirect to success page”

but:

redirect or route into a proper legacy verification result page

That is much better.

What if you don’t have full old data?

Then you can still create a reduced-trust fallback.

Example:

Legacy verification fallback page

If all you know is that token existed and was issued, page can say:

ULearn Legacy Document Verification

This QR code corresponds to a document previously issued by ULearn under a legacy student records system.

Verification status: Record found
Document status: Valid at time of issue

For full verification, please contact:

admissions@...
office@...
phone

That is still much better than a dead link.

So even an imperfect backend continuity layer is worthwhile.

The correct architecture overall

You now really need two verification engines:

A. New verification engine

For your new SIS documents.

This will be the proper one:

student + booking aware
version aware
QR per issued doc
full audit
B. Legacy verification engine

For Fidelo-era documents.

This can be much simpler:

read-only
token lookup only
no editing
no regeneration
just continuity

That is the correct migration pattern.

Best implementation approach
Recommended route structure
New docs
/verify/document/:token
Legacy docs

Either preserve original route or internally map to:

/verify/legacy/:token

If old URLs already exist on your domain, your router can inspect:

path
booking id
token/hash

and then resolve against the legacy table.

Your “temporary holding site” idea

Yes — valid as an emergency fallback.

If you are under time pressure and just need Fidelo gone, you could temporarily serve:

“Document verification active”
contact details
internal lookup on your side

But I would treat that as:

emergency continuity mode

not the final solution.

Because for immigration / third-party confidence, a specific student-linked result page is better.

And since the numbers won’t be huge, this is very manageable.

What I’d do in your shoes
Minimum viable shutdown plan

Before Fidelo goes dark:

1. Confirm where the QR links go

This is first and non-negotiable.

Check:

domain
path structure
token format
whether URLs are static or query-string based
2. Export legacy issued document records

At minimum for:

Letters of Acceptance
Enrollment letters
any visa-relevant docs
3. Build a tiny legacy verification table

No fancy UI needed.

4. Build route handling for old QR paths

Prefer route recreation over generic redirect.

5. Test 10–20 real historical QR codes

Before shutdown.

6. Only then kill Fidelo

That is the safe order.

My blunt recommendation
Do not shut Fidelo off until you have:
exported legacy verification data
confirmed the old QR route patterns
tested legacy QR continuity on your own server

Once that is done, you can probably kill it without much pain.

And yes — if the links are on your domain, this becomes a backend continuity problem, not a “keep paying for Fidelo forever” problem.

That is exactly what you want.

If you want, the next useful thing is I can design this as:

Legacy QR Continuity Plan v1.0

with:

exact migration steps
DB schema
route handling logic
what to export from Fidelo
fallback logic if data is incomplete

That would probably be the most practical next document.

Sadly the URL is not on our server