# Dup-booking triage — post-resync (2026-06-04)

Last night's Xero→HubSpot→SIS payment resync pushed payments onto the duplicate (new HUBSPOT) shells. So the old "delete empty shell" no longer holds for most. **29 pairs remain.** Classified by risk:

- **A — empty shell** (new has 0 payment rows): safe — reparent docs/extras, delete new.
- **B — single payment on new** (sum ≤ total): keep the TRUE payment, drop the duplicate side, then merge.
- **C — DOUBLE COUNT** (new payment-rows sum EXCEEDS its total): money booked twice — must reconcile in Xero/HubSpot first, do NOT auto-delete.
- **MULTI** — student has >1 new dup (e.g. Meredith Nunes): hand-review.

## C_DOUBLE_COUNT (9)

| new→old | student | new status | new total | new payRows/sum | old total/paid/rows | docs/cls on new |
|---|---|---|---|---|---|---|
| #18064→#78 | Pietro Colombo | CONFIRMED | €1880 | 2/€3440 | €1720/€1720/1 | 0d/0c |
| #18063→#77 | Paula Akemi Egashira | CONFIRMED | €1875 | 2/€3590 | €1795/€1795/1 | 0d/0c |
| #18062→#79 | Léandre Le Coz-Brühmüller | CONFIRMED | €4561 | 2/€8462 | €4231/€4231/1 | 0d/0c |
| #18043→#90 🔶MULTI | Federico Baldi | CONFIRMED | €1529.3 | 2/€2402 | €2705.3/€2705.3/2 | 0d/0c |
| #18039→#98 | Lucia Borroni | CONFIRMED | €492 | 1/€912 | €912/€912/1 | 0d/0c |
| #18036→#17828 | Martina Tartaro | CONFIRMED | €1731.04 | 1/€6431.04 | €6431.04/€6431.04/1 | 0d/0c |
| #18029→#92 | Diego Da Silva Saldanha | CONFIRMED | €331.2 | 1/€1031.2 | €1031.2/€1031.2/1 | 0d/0c |
| #18026→#17822 | Mélanie Faivre | CONFIRMED | €361.8 | 1/€386.8 | €386.8/€386.8/1 | 0d/0c |
| #18022→#1607 | Carlos Andrés Retana González | CONFIRMED | €2008 | 1/€2510.5 | €2510.5/€2510.5/1 | 0d/0c |

## A_EMPTY_SHELL (1)

| new→old | student | new status | new total | new payRows/sum | old total/paid/rows | docs/cls on new |
|---|---|---|---|---|---|---|
| #17920→#1595 🔶MULTI | Pedro Santiago Villegas Garmendia | PENDING | €997 | 0/€0 | €972/€972/2 | 0d/0c |

## B_SINGLE_PAYMENT (19)

| new→old | student | new status | new total | new payRows/sum | old total/paid/rows | docs/cls on new |
|---|---|---|---|---|---|---|
| #18137→#1278 🔶MULTI | Federico Baldi | CONFIRMED | €1504.3 | 1/€1504.3 | €2420.08/€0/0 | 0d/0c |
| #18136→#1566 🔶MULTI | Meredith Nunes | CONFIRMED | €482.4 | 1/€482.4 | €2315.4/€2315.4/3 | 0d/0c |
| #18135→#1566 🔶MULTI | Meredith Nunes | CONFIRMED | €648 | 1/€648 | €2315.4/€2315.4/3 | 0d/0c |
| #18132→#1566 🔶MULTI | Meredith Nunes | CONFIRMED | €1185 | 1/€1185 | €2315.4/€2315.4/3 | 0d/0c |
| #18109→#76 | Carlotta Butti | CONFIRMED | €250 | 1/€250 | €5670/€250/1 | 0d/0c |
| #18094→#1601 | Tuguldurtugs Enkhtugs | PARTIAL | €1606.5 | 1/€100 | €1606.5/€1606.5/2 | 0d/0c |
| #18089→#1540 | Bayanzul Bayanmunkh | PARTIAL | €2049.02 | 1/€1550 | €2049.02/€2033.8/3 | 0d/0c |
| #18088→#1721 | Zorigt Bayarsaikhan | PARTIAL | €1750 | 2/€1250 | €1750/€1750/3 | 0d/0c |
| #18087→#1722 | Suvd-Erdene Baldorj | PARTIAL | €1750 | 2/€1400.65 | €1750/€1750/3 | 0d/0c |
| #18080→#1510 | Yeongjae Jang | CONFIRMED | €420 | 1/€420 | €2619/€2619/2 | 0d/0c |
| #18068→#22 | Ivan Rodriguez Solares | PARTIAL | €1948 | 1/€1698 | €1948/€1948/2 | 0d/0c |
| #18045→#1299 | Temuulen Undrakh | PARTIAL | €2310 | 2/€1606.5 | €2310/€2310/1 | 0d/0c |
| #18042→#1517 | Luca Feola | CONFIRMED | €1652.4 | 1/€1652.4 | €2779/€2779/2 | 0d/0c |
| #18008→#1276 | Johana Fournier | PARTIAL | €1397.4 | 1/€1290.04 | €1303.44/€1303.44/4 | 0d/0c |
| #17998→#1449 | Augusto Almeida Poliani | CONFIRMED | €1721.55 | 2/€1721.55 | €1721.55/€1721.55/2 | 0d/0c |
| #17929→#1595 🔶MULTI | Pedro Santiago Villegas Garmendia | PARTIAL | €997 | 2/€997 | €972/€972/2 | 0d/0c |
| #17914→#23 | Amine Ibrani | CONFIRMED | €300 | 1/€300 | €3105/€3105/2 | 0d/0c |
| #17899→#1595 🔶MULTI | Pedro Santiago Villegas Garmendia | CONFIRMED | €297 | 1/€297 | €972/€972/2 | 1d/0c |
| #17898→#1386 | Diego Alves da Silva Molina | CONFIRMED | €120 | 1/€120 | €1590/€1590/1 | 0d/0c |

## Students with MULTIPLE new dups (hand-review)

- **Federico Baldi** (#84): new bookings #18137(€1504.3), #18043(€1529.3) → old #1278
- **Meredith Nunes** (#1014): new bookings #18132(€1185), #18135(€648), #18136(€482.4) → old #1566
- **Pedro Santiago Villegas Garmendia** (#1040): new bookings #17899(€297), #17920(€997), #17929(€997) → old #1595
