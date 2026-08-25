# Escrow decision sheet — money HELD in TransferMate

_Read-only audit. 23 held students. Rule: in-escrow ⇒ type `TransferMate Escrow` + status PENDING/ESCROW._

| Action | # | € (TM held) | Meaning |
|---|---|---|---|
| 🔴 CHASE | 5 | €14700 | Arrived ⇒ approved ⇒ get TM to release the funds |
| 🟠 RETAG | 13 | €34782 | Escrow money booked as plain TransferMate ⇒ retag + status |
| 🟡 DEDUPE | 0 | €0 | Duplicate escrow + plain rows ⇒ delete the plain |
| ✅ KEEP | 1 | €2952 | Already correctly escrow-tagged |
| ⚪ UNMATCHED | 4 | — | No clean SIS name match ⇒ resolve identity |

---
## 🔴 CHASE — get the funds released

Arrived/attending ⇒ the visa was approved ⇒ the held money should already have been released to us. Chase TransferMate by **TM ref**.

| Name | Email | SIS# | Fidelo# | HubContact | TM ref | € held | Evidence |
|---|---|---|---|---|---|---|---|
| Sofiia Korkishchenko | sofiia.korki@gmail.com | 768 | 30001 | 765074576630 | ULEARNP2025264 | €3550 | att 4 / cls 1 |
| Fangjia Liang | fangjia.liang16@gmail.com | 850 | 30522 | — | ULEARNP2025724 | €2350 | att 4 / cls 1 |
| Dashmaa Munkhbayar | dakunannn1008@gmail.com | 758 | 29809 | — | ULEARN29809 | €2940 | att 0 / cls 1 |
| Temuulen Undrakh | u.temuulen0409@gmail.com | 757 | 29808 | — | ULEARN29808 | €2940 | att 0 / cls 1 |
| Tungalag Davaasuren | davaasuren.tungaa@gmail.com | 954 | 29073 | — | ULEARNP2025168 | €2920 | att 4 / cls 1 |

### CHASE — booking detail

**Sofiia Korkishchenko** (SIS #768, Russia)
| Booking | Status | Paid/Total | HubDeal · FideloBk | Payment rows |
|---|---|---|---|---|
| bk1310 | CONFIRMED | €3550/€3550 | deal — · fid 40825 | €3550 Prior to arrival/Bank Transfer (Student, 2025-08-29) ⚠️ |
| bk17839 | CONFIRMED | €1456/€1456 | deal 500881652951 · fid — | €728 ∅/Credit Card (customer, 2026-04-28) ⚠️<br>€1456 ∅/Bank (∅, 2026-04-21) ⚠️ |
| bk17849 | CONFIRMED | €728/€1456 | deal — · fid 41910 | _none_ |
| bk17909 | CONFIRMED | €1456/€728 | deal 500883363036 · fid — | €728 ∅/Bank (∅, 2026-04-28) ⚠️<br>€728 ∅/Bank (∅, 2026-05-15) ⚠️ |

**Fangjia Liang** (SIS #850, China)
| Booking | Status | Paid/Total | HubDeal · FideloBk | Payment rows |
|---|---|---|---|---|
| bk1396 | CONFIRMED | €2350/€2350 | deal — · fid 41361 | €2350 Prior to arrival/TransferMate (Student, 2025-08-04) ⚠️ |

**Dashmaa Munkhbayar** (SIS #758, Mongolia)
| Booking | Status | Paid/Total | HubDeal · FideloBk | Payment rows |
|---|---|---|---|---|
| bk1300 | CONFIRMED | €2310/€2310 | deal — · fid 40633 | €2940 Prior to arrival/TransferMate (Student, 2025-05-13) ⚠️<br>€2940 ∅/TransferMate Escrow (agency, 2025-05-13) |
| bk1597 | CONFIRMED | €1607/€1607 | deal — · fid 41832 | €1607 ∅/Bank Transfer (customer, 2026-03-12) ⚠️ |

**Temuulen Undrakh** (SIS #757, Mongolia)
| Booking | Status | Paid/Total | HubDeal · FideloBk | Payment rows |
|---|---|---|---|---|
| bk1299 | CONFIRMED | €2310/€2310 | deal — · fid 40632 | €2940 Prior to arrival/TransferMate (Student, 2025-05-13) ⚠️ |
| bk1598 | CONFIRMED | €1607/€1607 | deal — · fid 41833 | €900 ∅/Bank Transfer (agency, 2026-03-12) ⚠️<br>€707 ∅/Bank Transfer (agency, 2026-03-12) ⚠️ |

**Tungalag Davaasuren** (SIS #954, Mongolia)
| Booking | Status | Paid/Total | HubDeal · FideloBk | Payment rows |
|---|---|---|---|---|
| bk1505 | CONFIRMED | €1997/€1997 | deal — · fid 41658 | _none_ |
| bk1659 | CONFIRMED | €2290/€2290 | deal — · fid 39881 | €2290 Prior to arrival/TransferMate (Student, 2025-05-06) ⚠️<br>€2920 ∅/TransferMate (agency, 2025-05-06) ⚠️ |

---
## 🟠 RETAG — escrow money mistagged as plain TransferMate
Not arrived ⇒ still genuinely in escrow; the plain `TransferMate` / `Prior to arrival` rows should be `Escrow`/`TransferMate Escrow` and status PENDING/ESCROW.

**Wanying Song** (SIS #872, China) — TM held €2625 — ref ULEARNP2025801
| Booking | Status | Paid/Total | HubDeal · FideloBk | Payment rows |
|---|---|---|---|---|
| bk1420 | CONFIRMED | €2074/€2074 | deal — · fid 41416 | €2625 ∅/TransferMate (agency, 2025-12-16) ⚠️ |

**Enkhjin Enkhtuvshin** (SIS #1190, Mongolia) — TM held €748 — ref ULEARNP2025494
| Booking | Status | Paid/Total | HubDeal · FideloBk | Payment rows |
|---|---|---|---|---|
| bk1769 | CONFIRMED | €748/€748 | deal — · fid 41111 | €748 Prior to arrival/TransferMate (Student, 2025-09-02) ⚠️ |

**Temuujin Sanchinsuren** (SIS #1191, Mongolia) — TM held €608 — ref ULEARNP2025495
| Booking | Status | Paid/Total | HubDeal · FideloBk | Payment rows |
|---|---|---|---|---|
| bk1770 | CONFIRMED | €608/€608 | deal — · fid 41112 | €608 Prior to arrival/TransferMate (Student, 2025-08-01) ⚠️ |

**Otgontsengel Luvsantseren** (SIS #774, Mongolia) — TM held €2950 — ref ULEARNP2025322
| Booking | Status | Paid/Total | HubDeal · FideloBk | Payment rows |
|---|---|---|---|---|
| bk1316 | CONFIRMED | €2312/€2312 | deal — · fid 40870 | €2950 Prior to arrival/TransferMate (Student, 2025-07-27) ⚠️ |

**Tuguldur Lkhagvasuren** (SIS #775, Mongolia) — TM held €2950 — ref ULEARNP2025323
| Booking | Status | Paid/Total | HubDeal · FideloBk | Payment rows |
|---|---|---|---|---|
| bk1317 | CONFIRMED | €2312/€2312 | deal — · fid 40871 | €2950 Prior to arrival/TransferMate (Student, 2025-07-27) ⚠️ |

**Settiyanee Duangjai** (SIS #400, Thailand) — TM held €4848 — ref ULEARND2025339, ULEARNP2025332, ULEARNP2025332
| Booking | Status | Paid/Total | HubDeal · FideloBk | Payment rows |
|---|---|---|---|---|
| bk790 | CONFIRMED | €4848/€4848 | deal — · fid 40644 | €1065 Prior to arrival/TransferMate (Student, 2025-06-05) ⚠️<br>€2783 Prior to arrival/TransferMate (Student, 2025-06-05) ⚠️<br>€1000 Prior to arrival/TransferMate (Student, 2025-07-16) ⚠️ |

**Moaath Bahaydan** (SIS #1178, Saudi Arabia) — TM held €960 — ref ULEARNP2025366
| Booking | Status | Paid/Total | HubDeal · FideloBk | Payment rows |
|---|---|---|---|---|
| bk1755 | CONFIRMED | €960/€960 | deal — · fid 41047 | €960 Prior to arrival/TransferMate (Student, 2025-05-23) ⚠️ |

**Dariimaa Bayandalai** (SIS #1162, Mongolia) — TM held €2920 — ref ULEARNP2025165
| Booking | Status | Paid/Total | HubDeal · FideloBk | Payment rows |
|---|---|---|---|---|
| bk1738 | CONFIRMED | €2290/€2290 | deal — · fid 40574 | €2290 Prior to arrival/TransferMate (Student, 2025-05-01) ⚠️ |

**Ketmanee Suwannayam** (SIS #401, Thailand) — TM held €3628 — ref ULEARNP2025221
| Booking | Status | Paid/Total | HubDeal · FideloBk | Payment rows |
|---|---|---|---|---|
| bk791 | CONFIRMED | €3096/€3096 | deal — · fid 40645 | €3628 Prior to arrival/TransferMate (Student, 2025-05-02) ⚠️ |

**Oyun-erdene Enkhbat** (SIS #753, Mongolia) — TM held €2920 — ref ULEARNP2025154
| Booking | Status | Paid/Total | HubDeal · FideloBk | Payment rows |
|---|---|---|---|---|
| bk1295 | CONFIRMED | €2290/€2290 | deal — · fid 40493 | €2920 Prior to arrival/TransferMate (Student, 2025-05-01) ⚠️ |

**Ganbat Altanshagai** (SIS #1156, Mongolia) — TM held €2920 — ref ULEARN29620
| Booking | Status | Paid/Total | HubDeal · FideloBk | Payment rows |
|---|---|---|---|---|
| bk1732 | CONFIRMED | €2546/€2546 | deal — · fid 40444 | €2920 Prior to arrival/TransferMate (Student, 2025-05-01) ⚠️ |

**Bolorgerel Bat-erdene** (SIS #355, Mongolia) — TM held €4665 — ref ULEARN29418
| Booking | Status | Paid/Total | HubDeal · FideloBk | Payment rows |
|---|---|---|---|---|
| bk559 | CONFIRMED | €3878/€3878 | deal — · fid 40236 | €4665 Prior to arrival/TransferMate (Student, 2025-05-01) ⚠️ |

**Mulian He** (SIS #1137, China) — TM held €2040 — ref ULEARNP20241201
| Booking | Status | Paid/Total | HubDeal · FideloBk | Payment rows |
|---|---|---|---|---|
| bk1708 | CONFIRMED | €2290/€2290 | deal — · fid 40261 | €250 Prior to arrival/Stripe (Student, 2024-12-30) ⚠️<br>€2290 Prior to arrival/TransferMate (Student, 2025-04-02) ⚠️ |

---
## 🟡 DEDUPE — duplicate escrow + plain rows

---
## ✅ KEEP — already correctly escrow-tagged
- Bilguunbayar Jargalsaikhan (SIS #14478) — €2952

---
## ⚪ UNMATCHED — resolve identity by hand
- Fiorella Molina Padilla — TM held €2000 — refs ULEARN1031 — SIS candidates: 0
- Yan Wang — TM held €2625 — refs ULEARNP2025771 — SIS candidates: 3
- Ochgerel Basan Baga Tugtan — TM held €2920 — refs ULEARNP2025152 — SIS candidates: 0
- Lu Zhang — TM held €2783 — refs ULEARNP2025125 — SIS candidates: 2

---
## Appendix — AWAITING bucket (funds NOT received by TM)
Kept separate: TM flagged escrow but the money never arrived (mostly agency-committed). These are phantom/verify, not chase or retag yet. 17 students.

| Name | € (awaiting) | TM ref |
|---|---|---|
| Maksim Khorev | €6151 | ULEARNP2026124 |
| Xuezhen Huang | €432 | ULEARNP2026163 |
| Usukhbadrakh Otgonbayar | €2763 | ULEARNP2026106 |
| Burte-ujin Ulziibat | €2560 | ULEARNP2026076 |
| Namuunaa Dorjsuren | €2599 | ULEARNP20251056, ULEARNP20251056 |
| Baasanjargal Munkhsaikhan | €2884 | ULEARNP20251060, ULEARNP20251060 |
| Burenjargal Dorjsuren | €2599 | ULEARNP20251057 |
| Enkhtuya Enkhbold | €2864 | ULEARNP20251034 |
| Uranzaya Chuluun-erdene | €2600 | ULEARNP20251014 |
| Saranzaya Khishigbayar | €1970 | ULEARNP2025929 |
| Uyanga Tungalag | €3066 | ULEARNP2025900 |
| Anand Narantuya | €3046 | ULEARNP2025863 |
| Azzaya Enebish | €3069 | ULEARNP2025906 |
| Yesuimaral Otognbaatar | €2220 | ULEARNP2025833 |
| Panying Pan | €2783 | ULEARNP2025422 |
| Munkhzaya Dashzeveg | €2231 | ULEARNUSH90110513 |
| Dulguun Battur | €2920 | ULEARN29448 |