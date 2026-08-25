### STUDENT APP 
  Stuff you flagged that I didn't touch yet — concrete plan for each, pick what matters                                                                             
                                                                                                                                                                    
  ┌──────────────────────────────────────────┬──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐   
  │                   Item                   │                                                       Plan                                                       │ 
  ├──────────────────────────────────────────┼──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤   
  │ Social Platform "Awaiting verification"  │ Mark followVerified=true server-side the moment a handle is saved (drop the manual-verify gate). Or kill the     │ 
  │ should be instant                        │ "Followed ULearn?" KV row entirely until we wire IG follower API.                                                │
  ├──────────────────────────────────────────┼──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤   
  │ Course Attendance challenge says "no     │ Likely the challenge endpoint is querying a different time window or class scope. Need to look at                │
  │ attendance data" but Profile shows it    │ /sis/student/api/challenges script and align with how the Profile attendance card pulls.                         │   
  ├──────────────────────────────────────────┼──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤ 
  │ Activity Attended: empty even though you │ loadActivitiesFeed() filters with new Date(a.date) >= today.setHours(0,0,0,0) — should include today. Something  │   
  │  uploaded one for today                  │ else (date timezone?) is dropping today's row. Need to inspect the /sis/student/api/activities payload.          │   
  ├──────────────────────────────────────────┼──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
  │ Trustpilot still appearing               │ Task #45 was marked done but it may have been LMS-side only. The SIS student.html reviewBody likely still has    │   
  │                                          │ it. Quick grep + remove.                                                                                         │   
  ├──────────────────────────────────────────┼──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
  │ IG-followers / "Follow ULearn" API badge │ Genuinely interesting (Instagram Embed/Graph), but out of scope for now — leaving as a thought.                  │   
  ├──────────────────────────────────────────┼──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤   
  │ Adriana: no nationality / accommodation  │ Pure data — needs DB inspection of her Booking/Student rows. Want me to check, or is this expected for the test  │
  │ / documents                              │ record?                                                                                                          │   
  ├──────────────────────────────────────────┼──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤ 
  │ Timetable card vs Course Details         │ Cosmetic — drop the timetable card if you want; one-liner.                                                       │   
  │ redundancy                               │                                                                                                                  │   
  └──────────────────────────────────────────┴──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
 