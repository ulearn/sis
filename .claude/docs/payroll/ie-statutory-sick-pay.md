# Ireland — Statutory Sick Pay (SSP) — Knowledge Base

> **Source:** Citizens Information — *Sick leave and sick pay*
> <https://www.citizensinformation.ie/en/employment/employment-rights-and-conditions/leave-and-holidays/sick-leave-and-sick-pay/>
> **Source page last edited:** 14 February 2025
> **Captured into this KB:** 2026-07-30
> **Governing law:** Sick Leave Act 2022 (as amended); Commencement Order for the Sick Leave Act 2022; Sick Leave Act 2022 (Prescribed daily rate of payment) Regulations 2022.
>
> ⚠️ **This is a point-in-time capture of a government page that changes.** The day-count and the €110 cap have both moved before and are expected to move again. **Re-verify against the source before relying on these figures in a new payroll period** (suggest an annual check each January, and whenever a Budget touches SSP). Update the "Captured" date when you re-pull.

---

## TL;DR — the numbers our payroll code depends on

| Parameter | Value (as of source edit 2025-02-14) | Notes |
|---|---|---|
| Statutory sick days / year | **5 days** (was 3 in 2023, 5 from 1 Jan 2024) | Per **calendar year** (1 Jan–31 Dec). No carry-forward. |
| Rate | **70%** of normal pay | Legal minimum. |
| Daily cap | **€110 / day** | Payment is the **lower** of 70%-of-normal-day **or €110**. |
| Service requirement | **13 continuous weeks** with the employer before the sick day | Return within 26 weeks ⇒ service treated as continuous. |
| Medical cert | **Required from day 1** | Must be certified by a medical practitioner as unable to work. |
| Waiting days | **None** | Entitlement from the first day off; employer cannot impose waiting days. |
| Reference period (variable pay) | **13 weeks** before the sick leave | Average pay over the prior 13 weeks. |
| After SSP is used up | **Illness Benefit** (DSP), from **day 6** | Requires sufficient PRSI. |

**Effective per-day cap in practice:** a teacher's SSP day = `min(€110, 0.70 × normal_daily_earnings)`.

---

## How this maps to our payroll engine (compliance checkpoints)

Our sick pay is computed on the **Hub Monthly screen** (`fins/scripts/pay/hourly/month.js`), as
`average_rate × sick_leave_hours × 0.70`, where `sick_leave_hours = sickDays × avgHoursPerDay`.

1. **70% rate — ✅ implemented** (`× 0.70`).
2. **"Normal daily earnings" basis — ⚠️ we simplified.** The Act uses the **13-week lookback** for variable pay; we deliberately use **current-period-only** to avoid overhead. Acceptable as a pragmatic proxy *provided* the current-period average reflects a *normal working day* — i.e. the denominator must be **days actually worked**, excluding the sick days themselves. (Bug found 2026-07: sick days were left in the denominator, diluting the daily rate to an effective ~56%. Fix = divide by `workingDaysInPeriod − sickDays`.)
3. **€110/day cap — ❓ verify.** The statutory payment is the **lower of** 70%-of-normal-day **and €110**. Confirm the Hub calc applies `min(dailySSP, €110)`. (For David Clarke €105/day it doesn't bite, but a higher earner — e.g. >€157/day normal — would exceed €110 and must be capped.)
4. **5 days / calendar year cap — ❓ verify.** Zoho feeds raw sick days. Statutory pay covers a **max of 5 days per calendar year**; days 6+ move to Illness Benefit, not employer SSP. Confirm we cap paid statutory sick days at 5/year (unless ULearn runs a more generous company scheme — see below).
5. **13-week service gate — ❓ verify.** A teacher with <13 continuous weeks' service is **not** entitled to SSP (may still get Illness Benefit). Confirm new starters aren't auto-paid SSP.
6. **Calendar-year reset — ❓ verify.** Entitlement resets 1 Jan; no carry-forward.

> **Company-scheme note:** if ULearn's arrangement is ever deemed a "more favourable" company sick-pay scheme, SSP statutory mechanics don't apply on top (no double payment) and the scheme rules govern instead. Today we effectively run the statutory scheme (70%), so the statutory rules above are the reference.

---

## Full reference (from source)

### Introduction
Since **1 January 2024**, an employee has a right to **5 days' sick pay a year** (increased from 3 days in 2023). This is **Statutory Sick Pay (SSP)** — the legal minimum. Sick pay is paid by the employer at **70% of normal pay, up to a maximum of €110 a day**. You must be an employee and have worked at least **13 weeks** with the employer before you can get SSP. An employer can have a more generous scheme but cannot give less than the statutory amount.

### What is the Statutory Sick Pay scheme (SSP)?
- SSP is the legal minimum sick pay.
- Sick days can be **consecutive or non-consecutive**.
- The sick-pay year is the **calendar year** (1 Jan–31 Dec).
- 70% of normal weekly pay, up to a **max €110/day**.
- Rules set out in the **Sick Leave Act 2022**; entitlement started **1 January 2023**.

### Am I entitled to sick pay?
To qualify you must:
- Be an employee.
- Have worked for the employer for at least **13 continuous weeks** before being sick.
- Be **certified by a medical practitioner** as unable to work.

You can get sick pay if you are: on probation; undergoing training (interns); an apprentice; an agency worker; over State Pension age.

- **Part-time workers:** yes — both full-time and part-time employees can take 5 days paid sick leave.
- **More than one job:** 5 days from **each** employer, once you have 13 weeks' service with that employer.
- **Length of service:** must be continuous 13 weeks. Leaving and returning to the **same employer within 26 weeks** — the gap does not break continuity (treated as if you never left).

### Do I need a medical cert?
Yes — certified by a medical practitioner as unable to work, **from day 1**. There is a **right to SSP from the first day** off sick; **no "waiting days"** may be applied.

### How is my sick pay calculated?
Paid at your **normal daily rate**: **70% of normal pay, max €110/day**.

**Normal daily pay** includes any regular bonus/allowance that doesn't change week to week, but **excludes overtime or commission**. If pay **changes week to week**, sick pay = the **average of pay over the 13 weeks before the sick leave**. Capped at **€110/day**.

**Part-time / variable — normal daily pay by work pattern:**
- **(a) Set hours at a fixed rate** (e.g. 4 hours every workday): you get the **lower of €110 or 70% of normal daily pay**.
- **(b) Variable hours at a fixed rate:** the **lower of €110 or 70% of what you would have earned on the day you were sick**.
- **(c) Neither (a) nor (b):** the **lower of €110 or your average hourly rate**, where average hourly rate = (total pay over the past 13 weeks ÷ hours worked) × hours scheduled on the sick day.

### If the employer already has a sick pay scheme
A more generous company scheme governs instead (must be more favourable viewed as a whole). You **cannot** get SSP **on top of** company-scheme benefits. SSP is for employees without a company scheme, or who don't qualify for it.

### Sectoral sick pay schemes
Some sectors are covered by a Sectoral Employment Order with different rates (e.g. construction workers under the Construction Workers Sick Pay Trust), which can be more favourable than SSP.

### If off sick for less than 5 days
Unused days can be used for any other sick period, up to a **max of 5 days per calendar year**.

### How sick leave affects Illness Benefit
- Off sick **more than 5 days** with enough PRSI ⇒ apply to the DSP for **Illness Benefit**, which starts **from day 6**.
- **If sick again** after using all 5 statutory days in the same year ⇒ Illness Benefit from **day 4** (after the normal 3 waiting days).
- **Within first 13 weeks of employment:** not entitled to SSP; may still get Illness Benefit. If already on Illness Benefit when the 13-week mark passes, you can't switch to statutory sick days during that period of leave.

### Carry-forward
**No.** Statutory sick leave is only usable in the calendar year it's due; unused days are lost. A period of leave **cannot continue** from one calendar year into the next — if still unfit, move to Illness Benefit; returning to work in the new year gives full access to that year's entitlement.

### Protection of employment rights
You are treated as being in employment while on sick leave.

**Public holidays during sick leave:**
- **Full-time:** get sick pay or Illness Benefit for the public holiday missed; or the employer treats you as not on sick leave that day and pays as normal (not counting it as a sick day).
- **Part-time:** entitled to time off for the public holiday if you worked at least **40 hours over the previous 5 weeks**.
- **Exceptions** (no pay/time off) if on sick leave immediately before the public holiday and you've been off **more than 26 weeks** due to ordinary illness/accident (or a longer period for an occupational accident/disease).

### Having problems getting sick pay
Try to resolve informally with the employer first; otherwise a formal complaint to the **Workplace Relations Commission (WRC)** via the online form, **within 6 months** of the dispute (extendable a further 6 months for reasonable cause).

### Penalisation
Employees are protected from victimisation/penalisation (dismissal, unfair treatment, unfavourable change to conditions) for claiming sick-leave rights. Complaints go to the WRC.

### Employer exemption
An employer in **severe financial difficulty** can apply to the **Labour Court** for an exemption from paying SSP, granted for **3 to 12 months**.

### More information
Law: Sick Leave Act 2022 (as amended), its Commencement Order, and the Sick Leave Act 2022 (Prescribed daily rate of payment) Regulations 2022. See also the WRC's sick-leave information.

---

## Change log for this file
- **2026-07-30** — Initial capture from Citizens Information (source edited 2025-02-14). Created to inform the Hub payroll sick-pay calc (`fins/scripts/pay/hourly/month.js`).
