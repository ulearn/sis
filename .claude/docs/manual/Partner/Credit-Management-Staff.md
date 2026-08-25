# Partner Credit — Staff Guide

**Audience:** ULearn admin / accounts staff. Plain-English guide to giving a partner (agent)
credit and applying it to a future student. (Engineers: see `Credit-Management-Technical.md`.)

---

## What "partner credit" is

Sometimes we owe an agent money to be used **later** — e.g. they overpaid, or we agreed a
goodwill amount, or paid them in kind for work. Instead of refunding cash, we hold it as
**credit on their account**, which they can put towards a future student's invoice.

That credit has to stay consistent in **three** places:
1. **SIS** — the Partner Portal (the agent can see their balance).
2. **Xero** — our accounting system (a credit note, so the books are correct).
3. **HubSpot** — where we actually invoice students (a credit memo).

Good news: **you only ever do the work in two of them by hand. The system keeps them aligned.**

---

## The golden rule

> **The only manual action that matters is applying (or removing) the credit memo in HubSpot.**
> Everything else — the SIS balance dropping, the Xero credit note being applied — happens
> **automatically** a few seconds later.

---

## A. Giving a partner new credit

1. Go to **`/sis/partners/impersonate?agency=<their agency id>`** (view their portal as admin).
2. **Finance** tab → click the green **Credit** pill.
3. Click **+ Add Credit** → enter the **Amount**, a clear **Reason** (e.g. "Duplicate payment —
   dad paid twice"), optionally a **Source** (the invoice it came from), and the date.
4. Save.

**What happens automatically:** SIS immediately
- creates the credit in the portal (the agent now sees it),
- creates a matching **credit note in Xero** (on the agent's contact), and
- drops a **task in HubSpot** on the agent's company: *"Create Credit Memo | €X | reason"*.

The row shows **"→ Xero CN-xxxx · HubSpot task ✓"** once it's pushed. (If it ever shows an amber
"Push to Xero/HubSpot →" link instead, the push hiccuped — click it to retry.)

5. **Do the task:** in HubSpot, create the actual **credit memo** on the agent's company for that
   amount. (This is the one thing the system can't do for you — HubSpot won't let software create
   credit memos.)

Now the credit exists and agrees across all three. It just sits there until it's used.

---

## B. Using the credit on a student (the important bit)

When that agent sends a new student and you're invoicing them:

1. Create the student's **quote → invoice** in HubSpot as normal.
2. Open the agent's **credit memo** in HubSpot. **This is the fiddly step:**
   - **Remove the agent/company contact** from the credit memo and **add the STUDENT** instead.
   - It must have **only the student** on it — leaving both the agent *and* the student on the memo
     **breaks** the application. Replace, don't add.
3. **Apply the credit memo to the student's invoice.**

**What happens automatically (within seconds):**
- **SIS** — the agent's credit balance **drops** by the applied amount, and a **"ULearn Credit"**
  line appears on the student's booking payments (so it's clearly a credit, not a cash payment).
- **Xero** — the agent's credit note is **automatically applied** to that same student invoice
  (you do NOT need to touch Xero, and you do NOT need to change the contact in Xero — Xero is happy
  to apply the agent's credit note to the student's invoice as-is).

You applied it in **one place (HubSpot)** and all three lined up.

---

## C. Partial use

Totally fine. If an agent has €100 and you only apply €40 to a student, the remaining **€60 stays
on their account** — visible in the portal and still available in Xero. Apply the rest to the next
student whenever. Nothing special to do.

---

## D. Undoing an accidental credit

1. In the portal Finance → Credit, click the red **`×`** next to the credit. Confirm.
   - This removes it from SIS, **voids the Xero credit note**, and **deletes the HubSpot task** — all three.
2. If the credit had already been **applied** to a student, also **remove the credit memo from that
   student's invoice in HubSpot** (see the box below). That triggers the system to clean up the "used"
   amount and the ULearn Credit line automatically.

Rule of thumb: **delete in SIS + remove the memo in HubSpot** = fully gone everywhere.

> **Why the Xero credit note shows "Voided", not deleted:** Xero **cannot delete** an authorised
> credit note — only **void** it (accounting audit rule). Voided = gone: zero financial effect, can't
> be applied to anything, just kept as a struck-through audit line. (It may still show a `remaining`
> amount — ignore that; the VOIDED status makes it inert.) There is no "delete entirely" for these.

> ### How to remove an applied credit from a HubSpot invoice
> 1. Open the **invoice** in HubSpot.
> 2. Click **Actions → Apply or manage credit**.
> 3. Click the **🗑 bin icon** next to the applied credit to remove it.
>
> The invoice balance goes back up, and within seconds SIS un-does the credit on the booking
> (the "used" −€ line and the "ULearn Credit" payment line disappear). Do this **before** voiding
> the Xero credit note / clicking the SIS `×`.

---

## E. Reading the ledger

The **Credit** pill lists, newest first: **ID | Issue Date | Reason | Amount**, with a
**"Credit on Account €X"** total at the top (the agent's available balance).
- **Green +€** = credit granted (money we owe them).
- **Red −€** = credit used (applied to a student — shows which booking/invoice).
- Balance = green minus red. €0 means it's all been used.

---

## What to remember if you remember nothing else

- **You add credit in the portal; you apply it via the HubSpot credit memo.** SIS + Xero follow on
  their own.
- **When applying a memo, the credit memo must have ONLY the student on it** (swap out the agent).
- **You never touch Xero by hand** for any of this — it self-applies.
- It's a **rare** event; if in doubt, check the three match (portal balance, Xero credit note remaining,
  HubSpot memo) — they should always agree a few seconds after you act in HubSpot.
