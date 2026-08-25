Issue 20 — Ariunsarnai Batbayar — EUR 1,509 unpaid, 0 SCAs, day 121 (addendum 12 Aug 2026)
Sheet row: 21 | Reporter: AC | Area: Booking / Class

Symptom
Student not appearing in to-be-assigned list — system shows payment due. Course started 13 Apr 2026.

Root cause (live data — Wed 12 Aug 2026 UTC, 49th check)
- Booking 1605 (Ariunsarnai Batbayar, student 1047): status = PENDING, confirmed = false
- Amount paid = EUR 0, amount open = EUR 1,509, last updated 2026-06-23 (50 days ago)
- NO payment records on booking 1605 — the booking has zero payments
- Booking Course 1791 (Academic Year Renewal Morning, 13 Apr to 23 Oct 2026): active = true, 0 class assignments
- Student has been in course for 121 calendar days with no class assignment — attendance entirely unrecorded

Likely Fidelo migration artefact: Ariunsarnai is an ILEP student (also in Issue 48).
Her payment was probably made in Fidelo before SIS migration and was not carried over.
Similar confirmed gap exists for Telmuun Enkhsaikhan (Issue 48, EUR 1,306 Fidelo gap).

Fix recipe (NOT YET RUN)
Step 1 — Verify payment in Fidelo / Xero:
  Search Xero or old Fidelo records for Ariunsarnai Batbayar / student 1047 / booking 1605.
  Expected: ~EUR 1,509 paid around or before Apr 2026.

Step 2 — If payment confirmed outside SIS (Fidelo gap):
  UPDATE booking SET confirmed = true WHERE id = 1605;
  Optionally insert missing payment: INSERT INTO payment (booking_id, amount, comment, created_at)
    VALUES (1605, 1509.00, 'Fidelo migration gap backfilled', now());

Step 3 — Assign BC 1791 to AM class in SIS admin:
  Locate appropriate Academic Year Morning class, assign student 1047 (Ariunsarnai)
  with weekStart=2026-04-13 and weekEnd=2026-10-23.
  Note: 121 days of historical attendance cannot be recovered.

Step 4 — If payment genuinely not made: chase student / agency for EUR 1,509.
  Do not assign to class until payment is confirmed.

Risk / category
Money (EUR 1,509 unresolved) + attendance (121 days lost). Requires human Fidelo/Xero verification before DB update.

Status: open — fix NOT RUN
Last checked: Wed 12 Aug 2026 UTC