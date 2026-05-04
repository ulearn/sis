## backfill
  - The 4,490 booking_courses still with NULL fee from the FIDELO backfill — those are bookings whose Fidelo invoice had no course-classified line items. Most are  
  likely legitimate (free placements, agency-net deals). Could spot-check 5-10 to confirm or just leave.                                                          

## HOLIDAYS
  - Holiday integration on the cover dashboard / class detail attendance tab — I made the roster and % holiday-aware, but I haven't checked whether the             
  cover/scheduling views also account for holidays.                                                                                                    


## Challenges 
You can see that we have a sort of placeholder for Challenges at https://sis.ulearnschool.com/sis/student
There is no "home" for that inside the SIS we have to now build one 
We give price reductions based on Challenges so if a Students wins their challenges they get lower price. It should be fairly straightforward with some of the challenges
1) Social Media 
- Have they entered their @handle? The app surfaces the social media handle field - they fill it in = Unlocked!
- Have they followed us on Instagram? Dunno how to check that by API - is it possible? Options: 
a) API - check followers and scan for this students handle in followers (daily cron) -ideal
b) Human check by Kelly 
c) Trust - the Student just indicates yes they have followed ULearn

2) Content Tasks - Challenge: Create 3 short videos during the week (or month if applied to 25 week booking) and post to social/s 
- We have no fields or home for this in the SIS - required to create now - will be displayed under new "Challenges" Section 
- They updload links to the video content they uploaded to Instagram or Facebook 
- I would say this requires human review (by Kelly / Antonella)

3) Course Attended - Challenge: Attend 100% of Course Time during the week/month of the challenge 
- Starightforward - Wire into the attendance - if no absence they have unlocked that acheivement in their Challenge 
NOTE: This isn't on the the prototype - please put it in now "Course Attended"

4) Activity Attended - Kelly will mark Students as present whoever went on the Activity via the App 
- NOTE: We have no activities module in the SIS & I am reluctant to create one... Feature creeep is setting in. But I suppose it would make sense to create this
a) We can then properly calendarize the activities and ove away from google-sheets-pergatory
b) We can leverage the structured data for use on our website and social medias 
c) we can wire it into the SOW which would allow for integration between class & out-of-class activities (provided all levels are indexed to the same SOW theme per week - if not we need to reset all SOW indexes to the same theme - that may not be possible/feasible...)

4) Google Reviews - add a field to SIS to house it - you can only create 1 Google Review per student so pretty straightforward & permanent output - they need to give us 5Stars to complete the challenge. We should also add a TrustPilot Review field - we harvest those during the booking process as opposed to the operations/service provision stage of the customer lifecycle

5) Badges - this section should be exposed permanently at the top of th Card stack so the User sees progression. 

Ambassador Status 
- We also need to add "Ambassador" as a Badge and unlock reward 
- They get their Ambassador code by giving us the 5-Star Review so once that is verified by staff they click OK in the SIS so we need a boolean Yes/No approval there beside the above Review Link 
- Once it is approved they receive their code which is basically their {[name]+[studentId]}
- That will be surfaced in the Challenges Section and sent by email automatically once the staff member approves the Google Review as legit and 5 Stars
- They are advised that they can add that #code to any content they create in respect of ULearn. 
- If anyone books using that the custoer receives a 10% discount while the Ambassador gets a 10% reward - winwin


## auto-emailer
The ambassador requires this automated action to happen - we don't yet have the email template here on file but we do have one. 

- For now we need to create an admin area which handles auotmated cron tasks especially in respect of Attendance Failures - they get little nudges after missing a day, a couple days, a whole week etc - there's an existing escalation path in Fidelo 
- We can create these here as cron jobs on the backend to start with - I'll get the exact cadence from DOS



## ########################################################################################### ###

  What's deliberately deferred (next pass when you want)                                                               
                                  
  - Exit letter integration — when generating an exit letter for a student < 85%, pull their absence_reasons rows and  
  render a list block (alongside the ILEP code block). This is the regulatory-paper-trail payoff Paul was after.
  - Pre-absence flagging — student tags a future date before missing class. Currently the list only surfaces dates that
   already have an Attendance row in ABSENT_*. Adding pre-absence is straightforward (drop the join, expose a date     
  picker for upcoming class days), but I'd rather see the post-hoc flow work first.



  Current Exit Letter — anatomy                                                                                        
   
  Tokens being used:                                                                                                   
                                                         
  ┌────────────────────────────────────────────────┬────────────────────────────────┐                                  
  │                     Token                      │                  Purpose                  │
  ├────────────────────────────────────────────────┼───────────────────────────────────────────┤
  │ {{booking.course_name}}                                             │ Programme name (header line)             │
  ├─────────────────────────────────────────────────────────────────────┼──────────────────────────────────────────┤
  │ {{student.salutation}}                                              │ Mr. / Ms.                                │   
  ├─────────────────────────────────────────────────────────────────────┼──────────────────────────────────────────┤
  │ {{student.first_name}} / {{student.last_name}}                      │ Name                                     │   
  ├─────────────────────────────────────────────────────────────────────┼──────────────────────────────────────────┤   
  │ {{student.pronoun_*}}                                               │ His/her/he/she gender pronouns           │
  ├─────────────────────────────────────────────────────────────────────┼──────────────────────────────────────────┤   
  │ {{booking.start_date}} / {{booking.end_date}}                       │ Course dates                             │
  ├─────────────────────────────────────────────────────────────────────┼──────────────────────────────────────────┤   
  │ {{booking.hours_per_week}} / {{booking.weeks}}                      │ Course volume                            │
  ├─────────────────────────────────────────────────────────────────────┼──────────────────────────────────────────┤   
  │ {{student.current_level}}                                           │ CEFR level at exit                       │
  ├─────────────────────────────────────────────────────────────────────┼──────────────────────────────────────────┤   
  │ {{student.attendance_rate}}                                         │ Final attendance %                       │
  ├─────────────────────────────────────────────────────────────────────┼──────────────────────────────────────────┤   
  │ {{custom.exam_info}}                                                │ One editable block (for exam result      │
  │                                                                     │ text)                                    │   
  ├─────────────────────────────────────────────────────────────────────┼──────────────────────────────────────────┤
  │ {{document.number}} / {{document.version}} /                        │ Doc metadata                             │   
  │ {{document.issue_date}}                                             │                                          │
  └─────────────────────────────────────────────────────────────────────┴──────────────────────────────────────────┘   
                                                         
  Structure (paraphrased):                                                                                             
   
  ▎ Programme: [name]                                                                                                  
  ▎ To whom it may concern,                              
  ▎ [Mr/Ms X] was a registered full-time student… paid in full, studied from [start] to [end], [hours/wk] hours per 
  ▎ week, ended in a [level] class.                                                                                    
  ▎ Completed their [N]-week course with an attendance rate of {{student.attendance_rate}}.
  ▎ [editable: exam_info]                                                                                              
  ▎ [address line] · contact us for confirmation                                                                       
  ▎ Signature, footer.                                                                                                 
                                                                                                                       
  What's broken                                                                                                        
                                      
  {{student.attendance_rate}} is never actually computed. In src/scripts/documents.ts:144 the token is declared as     
  empty string with a comment "computed at render time from attendance records" — but nothing computes it. So the
  letter currently renders the sentence as "…with an attendance rate of ." (blank). The original intent was clearly to 
  compute it; it just got left as a TODO.

  What's missing (re. our absence-reason design)                                                                       
                            
  Nothing. The template has zero scaffolding for an absences-with-reasons list. There's only the one                   
  {{custom.exam_info}} editable block — no {{custom.absence_reasons}} or similar token, and no {if absence_reasons}
  conditional.                                                                                                         
                                      
  If we want to land Paul's spec from the Slack thread ("automate this excused absence documentation on exit letters   
  when final attendance < 85%"), we need to:
                                                                                                                       
  1. Fix {{student.attendance_rate}} — compute it from the Attendance table during resolveTokens() (cheap query, group 
  by status).                       
  2. Add a {{absences_list}} block — only renders when overall attendance < 85%, pulls from absence_reasons for that   
  student, formats as a bullet list with date + reason + optional note.                                                
  3. Patch the template HTML to insert an {if absences_list}…{/if} block right after the attendance-rate sentence.
  Bumps template version, no migration needed.                                                                         
                                      
  Two clean changes, both server-side. Want me to do that next, or hold while you finish testing the widget?           




  Gross margin in this, in every business context, but in this context, is quite easily defined, okay, because you have the, it's the cost of provision divided by the revenue for the service. So in our case, to be very straightforward about it, we already have these teacher rates and payroll is a part of the SIS. So we have all the data that we actually need to produce this page pretty straightforwardly. So you take the teacher rate, let's say that the teacher's getting paid 25 euros per hour. And let's say that we have students in the class that on average are paying 8 euros an hour. And in the class, there are 10 students, and therefore, 80 euros per hour. Okay? So that leaves us with 55 euros per hour is our gross profit. And so 55 euros divided by 80 euros is a gross margin of 68.75%. Now, what I wanna do is I, like, the only complexity that we have in this context is the time dimension, the x-axis, because the classes operate on rolling attendance. It could change from week to week, right? So you've people leaving the class, either because of their level assessment or because they're finished, their booking is over. And you've people coming into the class every week, right? So that creates a challenge because the atomic unit is the week. So on any given week, in any given class, this variable of gross profit or gross margin, which is really what I'm interested in is the actual percentage, on any given week, you can pretty quickly get an exact figure, right? You're gonna exactly know for that particular week what's happening. But as soon as you go to the next week, if there's any changes or shifts, obviously, we're into the area of averages. And so a meaningful unit of measurement, you can only go down to the week, that's the smaller resolution as you can go, okay? And you could scale up from there to a month, for example, which would be a meaningful unit of measurement because you may have six classes running in the morning times or four in the afternoons. You might have 10 of them running, right? And you could have, again, about 10 people per class. You might have about 100 or 120 people in the school in total, and they're all coming for four weeks, right, in a month. So that's a reasonable amount of euros that has been paid for the attendance every month, right? So that's there are the two kind of timeframes I would be keen to look at. And what I have found is that a good way to measure this is actually per class, because each teacher is on a different rate. Now, from there, clearly, obviously, you can very quickly aggregate all the classes into one figure. Do you know what I mean? And you can do that then on a gross profit, which is the actual euros that you're making, or you can do it as a gross margin, which is the percentage amount. And that's kind of the key variable output that I want to get here. So how would you do this? You would go into the student class list, right, and you'd go into the student's booking, and you would figure out how many hours are booked in that booking and how much do they pay for them. You would have to subtract and be aware of the reg fee that might be there. I'd have to actually firm up on that one for you. Registration fee does not go into the course fee because it's only paid one time. We would probably want an option to kind of either filter that in or out. Do you know what I mean? I think that the bookings here, because there's no invoicing engine inside of this SIS, it's in HubSpot. And so, therefore, I would have to really check into the, I think we do a fairly low resolution data sync between HubSpot and the SIS. As far as I know, we're just gonna stick in. the course fee, but I would have to check that for you. Anyway, it's a detail at the moment. Whatever amount of money is assigned to that course, just use that, okay? And then just get the number of hours and then you'll get the hourly rate for each student. So it's not that complicated. Do you know what I mean? The complication is going to be the time dimensions, and I think that the easiest thing to do right there is to do it, like, let me see. You can have it at the resolution of a week or a month, okay? And then you just scroll. Yeah, you can have it at a week or a month, and you, yeah, well, I suppose a date range is really what we're trying to do, isn't it? You do this month and then next month. Honestly, I think the month is probably the easiest unit. And that's what we're always looking at in sales factors anyway. So like months go into quarters. Would a week be of any use to us? Not really. Although I probably would be interested in kind of looking down at the atomic level of it and try and figure out what's going on. That kind of is an early indicator of when stuff might be going sideways, like, for example, you're giving away too many discounts like now, last year. So yeah, let's get to work on that. I'm not gonna say any more because it's fairly straightforward, I think, I hope. Each teacher's assigned to a class, students' bookings are assigned to the class, you know how many hours they've paid for based on the booking, and you have the amount of money. And the teacher rate. So I think that you have everything in the system, it's all there.