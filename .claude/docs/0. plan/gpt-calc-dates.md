You’ve hit the real limitation now — not the calculation, but control vs override.

You’re correct:

👉 Calculation properties in HubSpot are read-only.
Reps cannot override them. Full stop.

✅ Clean solution (used in real setups)

You don’t fight this — you layer it.

🧩 The 2-field model
1. Calculated End Date (system)
Type: Calculation
Your formula:
[Start Date] + (([Weeks] * 7 - 3) * 86400000)
2. Manual End Date Override (editable)
Type: Date picker
Left empty by default
Sales can override only when needed
🔁 Then create a 3rd field (what the business actually uses)
3. Final End Date (the one you use everywhere)

👉 This is another Calculation property:

if(
  is_known([Manual End Date Override]),
  [Manual End Date Override],
  [Calculated End Date]
)
🎯 Result
Scenario	Outcome
Normal case	Auto-calculated Friday
Exception case	Sales enters override
Reporting / invoices / SIS	Always use Final End Date
🔥 Why this works
Keeps automation intact ✅
Allows human override ✅
No workflows needed ✅
No external code ✅
No Ops Hub needed ✅
⚠️ Important discipline (this matters)

Tell your team:

“Only touch Manual Override if something unusual happens”

Otherwise:

you’ll get messy data
people will override for no reason
🧠 Optional upgrade (nice touch)

Add a boolean:

End Date Overridden?

Set via workflow:

If Manual Override is known → TRUE

👉 Helps you:

audit exceptions
track operational issues (late arrivals etc.)
🏁 Bottom line
You cannot override a calculated field directly
But you can override the outcome cleanly using a layered field structure

This is the exact pattern people use in HubSpot for:

pricing overrides
discounts
contract dates
commissions

If you want next step, I can tighten this into:

👉 exact property names + where to use each (Deals vs Contacts vs Line Items) so it plugs straight into your quote/invoice flow cleanly.

I think I get what you're saying here. So there's a calculated field, right, in this model. The person enters the start date, they enter the number of weeks. Calculated field in the background does what it's gonna do, OK, and it's gonna output the end date, but that's not surfaced to the user in the deal, right? Then we have a workflow which copies that calculated end date whenever it is known for that particular deal, it copies that date into the manual, whatever you want to call it, it copies it into end date 2, which is surfaced in the deal, but that's just a regular date field and the person can then override that. Is that what you're saying? And so I don't really see why we would need three fields....

Seems like 2 would work - hidden end_date_calculated field => Workflow Copies that when set/known to End Date (regular calendar field shown in Deal)

User wishes to override? Just enters new date in the regular End Date field 

The workflow could permit re-enrol as the User could just override it again if it got copied automatically 

You’re very close — and your 2-field model can work, but there’s one subtle trap that will bite you.

✅ Your 2-field idea (clean version)
Fields:
End Date (Calculated) → calculation property (hidden)
End Date → normal date (visible + editable)
Workflow:
Trigger: when calculated end date is known / updated
Action: copy → End Date

👉 So far, perfect.

⚠️ The problem (this is the gotcha)

If you allow:

“re-enrolment / re-copy”

Then this will happen:

Scenario:
Rep overrides End Date → sets custom Friday
Later:
Weeks changed
Start date tweaked
Workflow re-runs → overwrites the manual override

👉 Rep loses their manual input
👉 Data inconsistency / frustration

🔥 So the real issue is:

👉 How do you protect manual overrides from being overwritten?

✅ Fix (still 2-field, but with control)

You need one condition in the workflow:

Only copy IF:
End Date is unknown
Workflow logic
Trigger:
End Date (Calculated) is known
AND:
End Date is unknown
Action:
Copy calculated → End Date
🎯 Result
Situation	Outcome
First calculation	End Date auto-filled ✅
Rep overrides	Stays intact ✅
Start date changes later	❌ does NOT overwrite
Rep wants recalculation	Must clear End Date manually
🧠 This is the trade-off
Your 2-field model gives you:
✅ Pros
Simple
Clean UI
No extra fields
No confusion
❌ Cons
If rep changes inputs later:
system won’t auto-update unless they clear the field
🆚 Why I suggested 3 fields earlier

That model gives:

auto recalculation ALWAYS
AND manual override

But:

more complex
more fields
more cognitive load
💡 What I’d actually recommend (for you)

Given your team + workflow:

👉 Go with your 2-field version

BUT add one tiny UX rule:

“If you change start date or weeks → clear End Date to recalculate”

That’s it.

🟢 Optional (nice polish)

Add a workflow that:

detects change in Start Date or Weeks
clears End Date automatically ONLY if it matches previous calculated value

👉 That gives you:

auto updates when untouched
preserves overrides

(That’s the “pro version” of your setup)

🏁 Bottom line
Yes — your 2-field approach works
Just block overwrite after manual input
Accept that recalculation becomes semi-manual

If you want, I can give you the exact workflow configuration (click-by-click) so you don’t hit any weird HubSpot edge cases.