# Xero ↔ HubSpot invoice misalignment — since Dec 2025 (run 2026-06-17)

341 Xero ACCREC invoices matched by INV- number.

- **In sync (paid amounts agree):** 255
- **COHORT stranded (Xero paid > HubSpot — OURS to sync):** 12
- **Other paid-gap (Xero ahead, standard/DataSync or HubSpot-ahead):** 28
- **Total/billed mismatch:** 10
- **In Xero, missing in HubSpot:** 46

## COHORT stranded (our payment-sync must mirror Xero→HubSpot)

| INV | Xero paid | HubSpot paid | gap | HS status |
|---|--:|--:|--:|---|
| INV-1209 | 1428 | 0 | 1428 | open |
| INV-1218 | 1428 | 0 | 1428 | open |
| INV-1177 | 544.32 | 0 | 544.32 | open |
| INV-1091 | 972 | 722 | 250 | open |
| INV-1119 | 250 | 0 | 250 | open |
| INV-1121 | 250 | 0 | 250 | open |
| INV-1122 | 250 | 0 | 250 | open |
| INV-1109 | 250 | 0 | 250 | open |
| INV-1123 | 250 | 0 | 250 | open |
| INV-1171 | 201.6 | 0 | 201.6 | open |
| INV-1185 | 1387.4 | 1322.4 | 65 | paid |
| INV-1258 | 56.5 | 0 | 56.5 | open |

## Other paid-gap (review — standard=DataSync lane, or HubSpot-ahead)

| INV | cohort? | Xero paid | HubSpot paid | gap | HS status |
|---|:-:|--:|--:|--:|---|
| INV-1094 | N | 0 | 130956 | -130956 | voided |
| INV-1233 | N | 6431.04 | 1731.04 | 4700 | paid |
| INV-1340 | N | 250 | 4643 | -4393 | paid |
| INV-1046 | N | 3815 | 0 | 3815 | open |
| INV-1015 | N | 0 | 3004.5 | -3004.5 | paid |
| INV-1032 | N | 0 | 2591 | -2591 | voided |
| INV-1110 | Y | 0 | 2041.88 | -2041.88 | voided |
| INV-1014 | N | 0 | 1574.78 | -1574.78 | paid |
| INV-1047 | Y | 0 | 1428 | -1428 | voided |
| INV-1351 | N | 0 | 627.2 | -627.2 | paid |
| INV-1004 | N | 0 | 500 | -500 | open |
| INV-1200 | N | 490 | 0 | 490 | open |
| INV-1202 | N | 438.6 | 0 | 438.6 | open |
| INV-1236 | N | 912 | 492 | 420 | paid |
| INV-1028 | N | 0 | 297 | -297 | voided |
| INV-1350 | N | 0 | 297 | -297 | paid |
| INV-1203 | N | 291.2 | 0 | 291.2 | open |
| INV-1299 | N | 0 | 250 | -250 | voided |
| INV-1176 | N | 500 | 250 | 250 | open |
| INV-1089 | Y | 0 | 243 | -243 | paid |
| INV-1201 | N | 237.6 | 0 | 237.6 | open |
| INV-1356 | N | 0 | 190.63 | -190.63 | paid |
| INV-1057 | N | 1938 | 1778 | 160 | open |
| INV-1011 | N | 0 | 95 | -95 | open |
| INV-1024 | N | 2002 | 2082 | -80 | open |
| INV-1241 | N | 1151.5 | 1106.5 | 45 | paid |
| INV-1223 | N | 386.8 | 361.8 | 25 | paid |
| INV-1205 | N | 1290.04 | 1303.44 | -13.4 | paid |

## In Xero, missing in HubSpot

- INV-0397 (Xero paid €1180/€1180)
- INV-1084 (Xero paid €0/€3570)
- INV-1106 (Xero paid €0/€5670)
- INV-0398 (Xero paid €195/€195)
- INV-1139 (Xero paid €0/€3550)
- INV-1009 (Xero paid €0/€1623)
- INV-1043 (Xero paid €297/€297)
- INV-1039 (Xero paid €0/€1290.63)
- INV-1038 (Xero paid €0/€1560)
- INV-0399 (Xero paid €0/€10)
- INV-1049 (Xero paid €0/€297)
- INV-1052 (Xero paid €0/€297)
- INV-1055 (Xero paid €0/€1516.87)
- INV-1080-Sub (Xero paid €0/€7425)
- INV-1070 (Xero paid €0/€7425)
- INV-1076-Sub (Xero paid €0/€7425)
- INV-1067 (Xero paid €0/€7425)
- INV-1069 (Xero paid €0/€7425)
- INV-1068 (Xero paid €0/€7425)
- INV-1077-Sub (Xero paid €0/€7425)
- INV-1075-Sub (Xero paid €0/€7425)
- INV-1072 (Xero paid €0/€7425)
- INV-1065-Sub (Xero paid €0/€7425)
- INV-1074 (Xero paid €0/€7425)
- INV-1071 (Xero paid €0/€7425)
- INV-1059 (Xero paid €0/€297)
- INV-1073 (Xero paid €0/€7425)
- INV-1066 (Xero paid €0/€7425)
- INV-1081-Sub (Xero paid €0/€7425)
- INV-1079-Sub (Xero paid €0/€7425)
- INV-1078-Sub (Xero paid €0/€7425)
- INV-1087-Sub (Xero paid €0/€7425)
- INV-1085 (Xero paid €0/€997)
- INV-1115 (Xero paid €0/€1982.87)
- INV-1150 (Xero paid €0/€1561)
- INV-1102 (Xero paid €0/€2280)
- INV-1160 (Xero paid €0/€1719.06)
- INV-1159 (Xero paid €0/€1407.5)
- INV-1342 (Xero paid €0/€645)
- INV-1349 (Xero paid €0/€297)
- INV-1347 (Xero paid €0/€6534)
- INV-1346 (Xero paid €0/€250)
- INV-1348 (Xero paid €0/€297)
- INV-1354 (Xero paid €0/€4007)
- INV-1360 (Xero paid €0/€2510.5)
- INV-1362 (Xero paid €0/€5670)

## Total/billed mismatch

- INV-1143: Xero €1845 vs HubSpot €2095
- INV-1236: Xero €912 vs HubSpot €492
- INV-1094: Xero €109116 vs HubSpot €130956
- INV-1185: Xero €1387.4 vs HubSpot €1322.4
- INV-1200: Xero €490 vs HubSpot €50
- INV-1241: Xero €1151.5 vs HubSpot €1106.5
- INV-1233: Xero €6431.04 vs HubSpot €1731.04
- INV-1223: Xero €386.8 vs HubSpot €361.8
- INV-1351: Xero €652.29 vs HubSpot €627.2
- INV-1356: Xero €183.3 vs HubSpot €190.63
