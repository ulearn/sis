# Escrow audit — currently HELD in TransferMate

_As of the latest TM feed. Awaiting bucket excluded. 23 held students._

**Rule:** in-escrow ⇒ every escrow payment should be type **`Escrow`** / method **`TransferMate Escrow`**, and booking status should be **PENDING/ESCROW**.
⚠️ = breaks the rule (plain `TransferMate`/other carrying escrow money, or wrong status).

## Summary

- ⚠️ **18** need fixing (escrow money not tagged `TransferMate Escrow`, or wrong status)
- ✅ 1 already clean
- ⚪ 4 could not be matched in SIS by name (resolve by hand)

---

### ⚪ Fiorella Molina Padilla — TM held €2000

_SIS match: none found — refs: ULEARN1031_

### ⚠️ Wanying Song — SIS #872 (China) — TM held €2625

| Booking | Status | Paid / Total | Payment rows (amount · type / method · paidBy · date) | |
|---|---|---|---|---|
| bk1420 | CONFIRMED ⚠️ | €2074 / €2074 | €2625 · ∅ / TransferMate · agency · 2025-12-16 ⚠️ | ⚠️

### ⚪ Yan Wang — TM held €2625

_SIS match: 3 candidates (ambiguous) — refs: ULEARNP2025771_

### ⚠️ Sofiia Korkishchenko — SIS #768 (Russia) — TM held €3550

| Booking | Status | Paid / Total | Payment rows (amount · type / method · paidBy · date) | |
|---|---|---|---|---|
| bk1310 | CONFIRMED ⚠️ | €3550 / €3550 | €3550 · Prior to arrival / Bank Transfer · Student · 2025-08-29 ⚠️ | ⚠️
| bk17839 | CONFIRMED ⚠️ | €1456 / €1456 | €728 · ∅ / Credit Card · customer · 2026-04-28 ⚠️<br>€1456 · ∅ / Bank · ∅ · 2026-04-21 ⚠️ | ⚠️
| bk17849 | CONFIRMED ⚠️ | €728 / €1456 | _no payments_ |
| bk17909 | CONFIRMED ⚠️ | €1456 / €728 | €728 · ∅ / Bank · ∅ · 2026-04-28 ⚠️<br>€728 · ∅ / Bank · ∅ · 2026-05-15 ⚠️ | ⚠️

### ⚠️ Enkhjin Enkhtuvshin — SIS #1190 (Mongolia) — TM held €748

| Booking | Status | Paid / Total | Payment rows (amount · type / method · paidBy · date) | |
|---|---|---|---|---|
| bk1769 | CONFIRMED ⚠️ | €748 / €748 | €748 · Prior to arrival / TransferMate · Student · 2025-09-02 ⚠️ | ⚠️

### ✅ Bilguunbayar Jargalsaikhan — SIS #14478 (?) — TM held €2952

| Booking | Status | Paid / Total | Payment rows (amount · type / method · paidBy · date) | |
|---|---|---|---|---|
| bk17876 | CANCELLED | €2314 / €2314 | €2314 · Escrow / TransferMate Escrow · customer · 2025-09-01<br>€2314 · Standard / TransferMate · admin · 2025-09-01 ⚠️ |

### ⚠️ Fangjia Liang — SIS #850 (China) — TM held €2350

| Booking | Status | Paid / Total | Payment rows (amount · type / method · paidBy · date) | |
|---|---|---|---|---|
| bk1396 | CONFIRMED ⚠️ | €2350 / €2350 | €2350 · Prior to arrival / TransferMate · Student · 2025-08-04 ⚠️ | ⚠️

### ⚠️ Temuujin Sanchinsuren — SIS #1191 (Mongolia) — TM held €608

| Booking | Status | Paid / Total | Payment rows (amount · type / method · paidBy · date) | |
|---|---|---|---|---|
| bk1770 | CONFIRMED ⚠️ | €608 / €608 | €608 · Prior to arrival / TransferMate · Student · 2025-08-01 ⚠️ | ⚠️

### ⚠️ Otgontsengel Luvsantseren — SIS #774 (Mongolia) — TM held €2950

| Booking | Status | Paid / Total | Payment rows (amount · type / method · paidBy · date) | |
|---|---|---|---|---|
| bk1316 | CONFIRMED ⚠️ | €2312 / €2312 | €2950 · Prior to arrival / TransferMate · Student · 2025-07-27 ⚠️ | ⚠️

### ⚠️ Tuguldur Lkhagvasuren — SIS #775 (Mongolia) — TM held €2950

| Booking | Status | Paid / Total | Payment rows (amount · type / method · paidBy · date) | |
|---|---|---|---|---|
| bk1317 | CONFIRMED ⚠️ | €2312 / €2312 | €2950 · Prior to arrival / TransferMate · Student · 2025-07-27 ⚠️ | ⚠️

### ⚠️ Settiyanee Duangjai — SIS #400 (Thailand) — TM held €4848

| Booking | Status | Paid / Total | Payment rows (amount · type / method · paidBy · date) | |
|---|---|---|---|---|
| bk790 | CONFIRMED ⚠️ | €4848 / €4848 | €1065 · Prior to arrival / TransferMate · Student · 2025-06-05 ⚠️<br>€2783 · Prior to arrival / TransferMate · Student · 2025-06-05 ⚠️<br>€1000 · Prior to arrival / TransferMate · Student · 2025-07-16 ⚠️ | ⚠️

### ⚠️ Moaath Bahaydan — SIS #1178 (Saudi Arabia) — TM held €960

| Booking | Status | Paid / Total | Payment rows (amount · type / method · paidBy · date) | |
|---|---|---|---|---|
| bk1755 | CONFIRMED ⚠️ | €960 / €960 | €960 · Prior to arrival / TransferMate · Student · 2025-05-23 ⚠️ | ⚠️

### ⚠️ Dashmaa Munkhbayar — SIS #758 (Mongolia) — TM held €2940

| Booking | Status | Paid / Total | Payment rows (amount · type / method · paidBy · date) | |
|---|---|---|---|---|
| bk1300 | CONFIRMED ⚠️ | €2310 / €2310 | €2940 · Prior to arrival / TransferMate · Student · 2025-05-13 ⚠️<br>€2940 · ∅ / TransferMate Escrow · agency · 2025-05-13 | ⚠️
| bk1597 | CONFIRMED ⚠️ | €1607 / €1607 | €1607 · ∅ / Bank Transfer · customer · 2026-03-12 ⚠️ | ⚠️

### ⚠️ Temuulen Undrakh — SIS #757 (Mongolia) — TM held €2940

| Booking | Status | Paid / Total | Payment rows (amount · type / method · paidBy · date) | |
|---|---|---|---|---|
| bk1299 | CONFIRMED ⚠️ | €2310 / €2310 | €2940 · Prior to arrival / TransferMate · Student · 2025-05-13 ⚠️ | ⚠️
| bk1598 | CONFIRMED ⚠️ | €1607 / €1607 | €900 · ∅ / Bank Transfer · agency · 2026-03-12 ⚠️<br>€707 · ∅ / Bank Transfer · agency · 2026-03-12 ⚠️ | ⚠️

### ⚠️ Tungalag Davaasuren — SIS #954 (Mongolia) — TM held €2920

| Booking | Status | Paid / Total | Payment rows (amount · type / method · paidBy · date) | |
|---|---|---|---|---|
| bk1505 | CONFIRMED ⚠️ | €1997 / €1997 | _no payments_ |
| bk1659 | CONFIRMED ⚠️ | €2290 / €2290 | €2290 · Prior to arrival / TransferMate · Student · 2025-05-06 ⚠️<br>€2920 · ∅ / TransferMate · agency · 2025-05-06 ⚠️ | ⚠️

### ⚠️ Dariimaa Bayandalai — SIS #1162 (Mongolia) — TM held €2920

| Booking | Status | Paid / Total | Payment rows (amount · type / method · paidBy · date) | |
|---|---|---|---|---|
| bk1738 | CONFIRMED ⚠️ | €2290 / €2290 | €2290 · Prior to arrival / TransferMate · Student · 2025-05-01 ⚠️ | ⚠️

### ⚠️ Ketmanee Suwannayam — SIS #401 (Thailand) — TM held €3628

| Booking | Status | Paid / Total | Payment rows (amount · type / method · paidBy · date) | |
|---|---|---|---|---|
| bk791 | CONFIRMED ⚠️ | €3096 / €3096 | €3628 · Prior to arrival / TransferMate · Student · 2025-05-02 ⚠️ | ⚠️

### ⚪ Ochgerel Basan Baga Tugtan — TM held €2920

_SIS match: none found — refs: ULEARNP2025152_

### ⚠️ Oyun-erdene Enkhbat — SIS #753 (Mongolia) — TM held €2920

| Booking | Status | Paid / Total | Payment rows (amount · type / method · paidBy · date) | |
|---|---|---|---|---|
| bk1295 | CONFIRMED ⚠️ | €2290 / €2290 | €2920 · Prior to arrival / TransferMate · Student · 2025-05-01 ⚠️ | ⚠️

### ⚠️ Ganbat Altanshagai — SIS #1156 (Mongolia) — TM held €2920

| Booking | Status | Paid / Total | Payment rows (amount · type / method · paidBy · date) | |
|---|---|---|---|---|
| bk1732 | CONFIRMED ⚠️ | €2546 / €2546 | €2920 · Prior to arrival / TransferMate · Student · 2025-05-01 ⚠️ | ⚠️

### ⚠️ Bolorgerel Bat-erdene — SIS #355 (Mongolia) — TM held €4665

| Booking | Status | Paid / Total | Payment rows (amount · type / method · paidBy · date) | |
|---|---|---|---|---|
| bk559 | CONFIRMED ⚠️ | €3878 / €3878 | €4665 · Prior to arrival / TransferMate · Student · 2025-05-01 ⚠️ | ⚠️

### ⚪ Lu Zhang — TM held €2783

_SIS match: 2 candidates (ambiguous) — refs: ULEARNP2025125_

### ⚠️ Mulian He — SIS #1137 (China) — TM held €2040

| Booking | Status | Paid / Total | Payment rows (amount · type / method · paidBy · date) | |
|---|---|---|---|---|
| bk1708 | CONFIRMED ⚠️ | €2290 / €2290 | €250 · Prior to arrival / Stripe · Student · 2024-12-30 ⚠️<br>€2290 · Prior to arrival / TransferMate · Student · 2025-04-02 ⚠️ | ⚠️
