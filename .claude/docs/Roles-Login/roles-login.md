GPT Chat
Role | Login 

1. Staff - SIS
a) But we need a link to LMS from the SIS (probably warrants a nav item on left side really but also from within Classes top bar button)
b) We could link from particular student to that students LMS view: show us the classes/materials/ratings/assessments etc 
c) Also fold in Challenges to SIS - Separate section

2. Students - SIS 
Via mobile app in 90% cases but they can login on desktop and when they do they see a similar web version 3 screen dashboard: 
- SIS
- Challenges
- LMS

3. Teachers - LMS 
But really we want teachers to have the app on their phone too... Om login they see a Teachers display screen which is LMS focused

GPT Answer:
Makes sense. I’d structure it like this:

## Role → Entry Point → Default Dashboard

| Role         | Login Area | Default View          | Sections Available                                  |
| ------------ | ---------- | --------------------- | --------------------------------------------------- |
| **Staff**    | SIS        | SIS admin dashboard   | SIS, LMS links, Challenges                          |
| **Students** | SIS / App  | Student dashboard     | SIS, Challenges, LMS                                |
| **Teachers** | LMS / App  | Teacher LMS dashboard | Classes, Materials, Attendance/ratings, Assessments |

## 1. Staff — SIS-first

Staff live mainly in the **SIS**.

Add LMS access in two places:

### Left nav

```text
SIS
Classes
Students
Documents
Payments
Challenges
LMS
Settings
```

### Contextual links

From **Classes**:

```text
Class Profile
[Attendance] [Students] [Materials] [Assessments] [Open in LMS]
```

From **Student Profile**:

```text
Student Profile
[Overview] [Attendance] [Documents] [Payments] [LMS View] [Challenges]
```

The **Student → LMS View** should show:

```text
Student LMS View
- Current class
- Weekly materials
- Submitted work
- Teacher ratings / notes
- Assessment results
- Challenge progress
```

## 2. Students — app-first, web fallback

Students should log into the same overall system, but see a simplified dashboard:

```text
Student Dashboard

[ SIS ]
Timetable, attendance, documents, payments, visa/admin info

[ Challenges ]
Weekly challenges, badges, streaks, submissions

[ LMS ]
Lessons, materials, self-study, assessments, tutor AI if added later
```

On mobile this can be three bottom tabs:

```text
SIS | Challenges | LMS
```

On desktop it can be three cards or panels.

## 3. Teachers — LMS-first

Teachers should mostly enter through the **LMS**, not the admin SIS.

Teacher app/dashboard:

```text
Teacher Dashboard

Today’s Classes
Materials
Attendance
Assessments
Student Notes
Challenges
```

But they still need limited SIS data:

```text
Class list
Student names/photos
Attendance history
Level
Start date / end date
Notes relevant to teaching
```

They should **not** see finance, visa, documents, invoices, internal admin, etc.

## Clean mental model

```text
SIS = administrative truth
LMS = learning delivery truth
Challenges = engagement layer
App = mobile surface over all three
```

So the system is not really three separate products.

It is one platform with three modules:

```text
ULearn Platform
├── SIS
├── LMS
└── Challenges
```

And the user role decides the default landing screen.

