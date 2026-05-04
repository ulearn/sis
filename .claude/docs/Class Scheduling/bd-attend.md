Long one on our attendance needs.

TLDR - can SIS attendance be developed to do the following?


replace irrelevant "attendance this week" and "overall attendance" metrics with "expected attendance at the end of 6 weeks" and "expected final attendance"
document excused absences in the student app and automate a list of them in the student's exit letter when final attendance < 85%
automate notification to students (and DOS) of risky attendance patterns that put students at risk of not meeting the ISD benchmarks of 75% after 6 weeks and 85% at the end of their courses


re the attendance part  of SIS, there's a lot of confusion around excused absences. Students think that when their absence is excused, they should be recorded as present, which is not the case.
In Fidelo we were able to add a drop-down to the register to categorise excused absences (see screenshot). Where students didn't achieve 85% attendance, Antonella would manually document their excused absences on their exit letters.

Can SIS be developed to automate this excused absence documentation on exit letters?

Also, Fidelo had irrelevant attendance percentages that I queried with them regularly. They built the "expected final attendance" feature in at our request because telling a student that they'd attended 90% of the first 10 weeks of their course was completely irrelevant. Still, in the app, until the end of last year the only visual the students could see was the irrelevant overall attendance graphic. Harassed by me, they finallly added a graphic for expected final attendance but you couldn't customise your view in the app so that that was the one that appeared and students continued to get the irrelevant overall attendance as their main visual. I asked about building in a graphic for expected attendance after 6 weeks and they said they could cost it and let us know what we'd need to pay for the labour :man-shrugging::skin-tone-2:

IRP students need to be able to see the following two stats:

Expected attendance at the end of the 6-week mark (ISD requires them to have 75%)
Expected attendance at the end of the 25-week mark (ISD requires them to have 85%)

 "attendance this week" and "overall attendance" are not relevant in our context.

On top of that, what would be amazing is if SIS can predict  future failure to meet these benchmarks based on current attendance patterns.

At the moment, I have a crude way of doing this. In induction, I show students 2 problematic attendance patterns over the period of 1 week and 2 problematic attendance patterns over the periof of a fortnight.

If a student's  attendance matches any of them, I send them an email and ask them to report to me. My thinking is if they repeat this pattern, they can't finish with their required attendance.

Still, this is quite time consuming. Ideally, SIS would output a list of students every week whose attendance patterns to date are such that they risk not achieving 75% at the end of 6 weeks and 85% at the end of their course and it would automatically email them informing them o fthis and schedule them for an office visit.
2 files Neil  [6:17 PM]

Replace irrelevant "attendance this week" and "overall attendance" metrics with "expected attendance at the end of 6 weeks" and "expected final attendance"
Ok - probably already gone 

Document excused absences in the student app and automate a list of them in the student's exit letter when final attendance < 85%
Start with the "excused absence" is quite misleading - I too would think that could mean that I have been "let off" for the absence. Suggestion? "Reason" is clearer


1. What is the process for an "excused absence"?
Student must email? Or otherwise provide written contact? Do you accept oral messaging following day for example? Or must be written? 
Is avail thu app now? Probably not




Process:

Student is absent
Antonella marks & selects reason
Surface in Student App
 Run loop at courseEnd Date => IF Attend < 85%, THEN Do XYZ
Here XYZ = pull "Reasons" into list format & output in Template/Exit Letter (if called) 
Or if Attend >85% section will be blank in Letter



Student Editing
Why not expose the dropdown directly to the student in the App? Let them select it directly (save Antonella hassle)

Assign Reason to Student ID/Absence/DateTime
Rest of Process remains
 (edited) 
Neil  [6:36 PM]

automate notification to students (and DOS) of risky attendance patterns that put students at risk of not meeting the ISD benchmarks of 75% after 6 weeks and 85% at the end of their courses
Yes - 100% 
email templates should all exist in SIS (cloned)
No cron / automate module currently fire on Attendance Events 




But full server ownership now - straightforward to do all these things
Paul Gill  [11:30 AM]
TrustED/ILEP will not accept us allowing students to set their absences. Anyway,  Antonella would still have to verify and a lot of time would be lost by her changing the absence back from excused to not excused.

the process at the moment:

teachers input attendance either daily or weekly on the fidelo teacher portal

where documentation is needed
students wanting their absence to be excused/certified contact Antonella:
IRP appt - Antonella usually already aware as she helps them to ready all their docs for this
PPS appt - student forwards confirmation email to success@
Sickness - student forwards sick note to A or brings original to reception

Where documentation is already in the system:

IRP appt - Antonella usually already aware as she helps them to ready all their docs for this
End-of-course exam - Antonella already knows

Where documentation is not required:

disruptions to the public transport system
weather warnings

Antonella selects relevant absence excuse for students in attendance register drop downs. (edited) 
Neil  [3:57 PM]
"TrustED/ILEP will not accept us allowing students to set their absences"

1. The Students need a way to inform us of the reason no?
So present the standard reasons - If "Other" is chosen a Textbox is revealed & they enter the reason

2. This is presented to Admins in SIS as Accept/Reject
As the reason provided is voluntary and no impact on attendance itself not really sensitive data point 



So no functional difference here except for comms chain
That's why I ask about process - what are required comms rules for absented Students?

Accepted format/s?
Verification? Any? None? Depends? (eg: docs note if at doc but otherwise nothing?)
Accepted Timeframe? 
Same day? 24hrs? 48? 2 Weeks?





Questions:

Does ILEP stipulate comms / formatting for reasons for absence?
What actual difference do reasons make? 
My understanding is they make no difference to attendance 
But may be used by authorities if applicant renews with <85% 



=> Does the reason given ever permit the absence to be omitted and marked as present?

Again - if not this is just an annotation - no functional impact on % 
(edited)
Paul Gill  [4:46 PM]
1, What ILEP says about attendance and absence:

Attendance: "The design and operation of the system for recording attendance must be in line with ILEP requirements, whether manual, electronic or a mix. Attendance must be recorded in each class and class teachers must also record the overall number of students in attendance. Manual attendance sheets must be retained by the provider for a minimum of 12 months for inspection and will be checked against any computer records. ISD also reserves the rights to request data on monitoring of students’ attendance."

Absenteeism: "There must be a clear system in place for the recording of student absences, for which any procedures should describe the steps which are taken and by whom in the case of an absent student. This system should identify the person(s) responsible for recording absences, their contact information, and any associated procedure as to how a student can have an absence recorded as a medical appointment or some other qualification of the circumstances pertaining to the absence, i.e. in the context of disciplinary action arising"

student sick leave: "There must be a procedure for contacting the designated person(s) responsible in the provider on the first day of sickness and each day subsequently, together with the instructions relating to submission of a doctor’s certificate(s). The procedure regarding absenteeism and expulsion must be communicated to, and understood by, students including reference to requirements in relation to uncertified sick leave beyond the statutory entitlement"

2. Why reasons make a difference:

Computer records and paper records need to align. Listing what counts as an excused absence for students is important. It's transparent and clear. Without it, you have students going for job interviews and training sessions during class and then expecting them to be excused because their boss told them it couldn't be scheduled at any other time ...

=> Does the reason given ever permit the absence to be omitted and marked as present?

No
Neil  [5:20 PM]
Audio 2:131xPaul Gill  [3:55 PM]
@Neil It's good that we're thinking about this. I actually wanted to bring a suggestion to you on this.
We're currently using the attendance record in Fidelo to "monitor" attendance. When students don't comply with ILEP attendance regulations, we keep an electronic and paper record and admonish them.
But what if we used the attendance record to motivate students and to gather data?
For example, in Fidelo teachers input 3 variables to accurately reflect attendance in line with ILEP requirements: 0 mins = absent; 90 mins = arrived more than 15 minutes late/exited early; 180 minutes = fully attended. These three time periods allow us to extract attendance percentages for ILEP: 0%, 50% and 100%, and help us get the end-of-course overall attendance percentage.
With SIS, can teachers input the students' actual arrival time (students arriving between 09:00 and 09:15 and who stay till the end get 100%, students who arrive between 09:16 and 10:50 and stay till the end get 50%, and students who don't come or who arrive after 10:50 or who leave before class ends at 12;20 all get 0%. This gives us the metrics we need for our ILEP reports, but at the same time for our own school use, we could rate classes based on best overall attendance on a day and over a week of lessons. This would put class groups in competition with each other and motivate better student attendance. Groups on a 3-day streak would be motivated to all arrive on time in order to keep their streak going and groups in second place would be motivated to arrive on time to try to take over top position.
More broadly, SIS could allow teachers to record homework completion and participation levels to include these in the school league tables both for groups and individuals.
Lastly, the LMS could allow immediate feedback on activities and lessons (Was this lesson/activity useful?; Was this lesson/activity fun?) so that we can adapt content, filtering out what gets low ratings and replacing it with hopefully more engaging stuff (obviously with the academic committee overseeing decision making here to ensure it doesn't end up as just one interminable Kahoot coz that's what the students think is fun)Neil  [11:17 AM]
Ok - adding these to

SIS => Deploy 
LMS=> Prototyping 


NOTES
Homework & Feedback - yes we can & will do that. 

And this is (almost) completely absent in current system (though teachers/dos más be handling personally or in physical folders)

Most areas of dos/teacher/student prep & interactions have *some existing space or doc  referencing them

Major area that I found with nothing or nearly nothing was the collation of class output (which may include homework)

Analogy might be the "wake of a ship"

Ship Shape / Set Sail
Every class has inputs (prep & in-class interactions) and this is where we're strong:

Highly detailed SOW
Weekly structures & templates
Detailed lesson Templates and
Some coverage of actual prep examples


Wake
We have no structured architecture or docs for the output a class creates eg:

Archival storage of 
Lesson Plans
Assessments




The exception found was "LESSON NOTES" folders & files. But
No hierarchy of filling (flat folder architecture & no chronological archive - so problematic / impossible to connect the material to 
a particular CEFR level (this was sometimes possible)
a dateTime session (eg: Tues 21/04/26 - A2-AM - Session2)
A particular student or group of stds 
Obviously if no CEFR/dateTime exists we cannot surface the material to the students who were present in that class/timeslot


(edited)
Neil  [11:24 AM]
So what was/is lacking is a chronological storage system that accounts for all material & notes & homework & assessments that are created AS A RESULT OF the class talking place

Basically...

Each class needs a system with a BEFORE and an AFTER
My search didn't find an AFTER

Paul Gill  [12:03 PM]
there's a bit of a conflict at the heart of the learning system (it's the same really with any school anchoring its syllabuses to textbooks). The textbook design is completely at odds with rolling enrolment.
All the quality in the schemes of work and in the lesson folders comes from  me collecting CEFR-indexed wordlists and grammar can-do's and creating skills (writing, speaking etc.) and systems (vocab, grammar etc.) lessons for the teachers to use.
All the weakness in the current system comes from teachers not following the can-do's in the schemes of work and effectively treating each course week as a sequential journey from the first page of the unit to the last.
What needs to happen to raise the overall quality of the lessons to award-winning quality level:

textbooks need to be phased out 
systems lessons based on the already-there word lists and grammar can-do's need to be generated to supplement what's already been produced and have a complete set of lessons for each week across the levels
skills lesson more closely aligned to CEFR-can-do's need to be generated
the end-of-week assessment tests need to be based on the newly generated systems lessons
in line with TrustED requirements and best practice, we need to allow the students to self-assess throughout the week and throughout their course (this is the integrated learning and assessment - ILA - the TrustED doc refers to - generally very easy to integrate
homework content needs to be generated with references for self-study that the more dedicated students can use - these references are already largely there in the "supplementary" materials section of the SOW


if h/w tasks and end-of-week assessment are completed on SIS, then we get automation of scoring and data on weak areas, what groups consistently find challenging etc. etc. that allows us to modify syllabus

Eventual "after" will be lesson notes from teacher annotating on Word/Google Docs for each 90-minute session + data on h/w completion, h/w accuracy alongside performance in end-of-week review tests, along with ss' self-assessments throughout the week, linked to progress up the levels and performance in external end-of-course exam
Neil  [12:07 PM]
"All the weakness in the current system comes from teachers not following the can-do's in the schemes of work and effectively treating each course week as a sequential journey from the first page of the unit to the last."

Yes - I was imagining very significant divergence from the SOW and real life output
[12:09 PM]"What needs to happen to raise the overall quality of the lessons to award-winning quality level:"

Good - all those points are already in direction of travel