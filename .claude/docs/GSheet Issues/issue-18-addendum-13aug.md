Issue 18 Addendum 13 Aug 2026 (18th check) -- Visa Status Null

Reporter: Unknown  Area: Visa / Booking  Sheet row: 19

Symptom
Student says visa pending -- not showing in to-be-assigned list.

Root cause (18th check -- Thu 13 Aug UTC)
- Student 983 (Flavia Nascimento Mariano): visaStatus = null, visaId = null
- Visa dates present: visaFrom = 2026-06-01, visaUntil = 2027-02-01 -- approval status not set
- Booking 1534: CONFIRMED, confirmed = true, EUR 1,308 paid, EUR 0 open; service_end 2026-11-27
- Booking last updated 2026-08-10 (service end extension; no visa status change)
- Day 73 in course (started 1 Jun 2026) -- student likely already in class
- Payment 17035: EUR 250, 17 Feb 2026, transactionId D2026087 -- Xero unconfirmed (176 days)
- Payment 17527: EUR 1,058, 19 May 2026, transactionId null -- Xero unconfirmed (86 days)

Fix recipe (NOT YET RUN)
Step 1 -- Set visaStatus = approved for student 983 (NOT YET RUN):
  UPDATE student SET visa_status = chr(39)||approved||chr(39) WHERE id = 983;
Step 2 -- Verify student appears in to-be-assigned list (may already be assigned at day 73)
Step 3 -- Reconcile payments 17035 and 17527 in Xero (176d and 86d unconfirmed)

Risk: data-hygiene / visa. Low risk. Reversible. Blast: 1 student.

Status: open -- fix NOT RUN. 18 consecutive checks.
Last checked: Thu 13 Aug 2026 UTC (day 73 in course)