Built. To test the CTA without actually flipping anyone's visa status, I can stamp visaApprovalShuntAppliedAt on Bilguunbayar so the amber card appears next time you open  
  his profile. Want me to do that?                                                                                                                                        
                                                                                                                                                                              
  Either way, here's the end-to-end summary of what's now in place:                                                                                                           
                                                                                                                                                                              
  Trigger flow                                                                                                                                                                
                                                                                                                                                                              
  Staff flips visaStatus: Pending → Approved
     │                                                                                                                                                                        
     ▼                                                                                                                                                                    
  applyVisaApprovalShunt(studentId)                                                    
     │                                                                                                                                                                        
     ├─ For each future booking:                                                                                                                                          
     │     If serviceStart < today + 28 days:                                          
     │       Push booking + course + accom dates by the shortfall                                                                                                             
     │       shuntCount++         
## QUESTION: 
Acccomm Booking can be forward to Weekend days only - checkin only permitted Sat/Sun. Consequently the Course Booking must also be moved forward to the Monday after that weekend as we only permit students enter class on Mondays. Does the Shunt forward apply to the Course also? It needs to.                                                                                                                                             
##
     │                                                                                                                                                                        
     ▼                                                                                                                                                                        
  If shuntCount > 0:                                                                                                                                                          
     Stamp Student.visaApprovalShuntAppliedAt = now()                                                                                                                         
     │                                                                                                                                                                        
     ▼                                                                                                                                                                    
  Next time staff opens this Student in admin:                                         
     Amber CTA card appears in Visa & Passport section                                                                                                                        
     (because shuntAppliedAt > noticeSentAt — null < anything)           

## Question: 
Ideally we surface this as the User switches the Visa status to Approve - possible? May take a few seconds to run this thing I suppose but we want the email to be sent straight away if it is required - there is no time to waste at that point... The Student needs to be notified immediately in case they are booking flights in that moment after relaying their Approval to us                                                                                                   
##

CTA   visibilityrule                                                                                                                                                                                                                           
  showCta = visaApprovalShuntAppliedAt != null                                                                                                                                
         && (visaApprovalNoticeSentAt == null                                                                                                                                 
             || visaApprovalNoticeSentAt < visaApprovalShuntAppliedAt)                                                                                                        
                                                                                                                                                                          
If they re-flip the visa later (some weird edge case where shunt fires again), the new shunt timestamp > sent timestamp → CTA reappears for the new event. Belt and braces.

## RE=ENROLS
while I cannot think of an immediate case example wher ethis might occur the re-enroll may be required as the the Student Visa Status may go into "In Appeal" - if that Status is later flipped to Approved the exacct same check needs to run - In Appeal is in effect the same as Pending with a little more detail ie: reveals that its their second or third attempt 
##

  Staff actions                                                                                                                                                               
                                                                                                                                                                              
  1. Preview email — opens a modal with the rendered email in an iframe. Exactly what gets sent.                                                                              
  2. Send 4-week notice email — confirm dialog → POST → server-side send via success@ulearnschool.com → stamps visaApprovalNoticeSentAt = now() → CTA disappears.             
                                                                                                                                                                              
  Once sent, a small green confirmation strip remains in the section: "✓ 4-week notice email sent on …".                                                                      
                                                                                                                                                                          
  Idempotency guarantees                                                                                                                                                      
                                                                                                                                                                              
  - Server-side sendVisaApprovalNotice refuses if visaApprovalNoticeSentAt is already set ("Notice already sent at YYYY-MM-DD…")                                              
  - Server-side refuses if visaApprovalShuntAppliedAt is null ("No visa-approval shunt has fired… nothing to send")                                                           
  - Stamp happens after the Gmail send returns successfully — if Gmail throws, no stamp, can retry safely                                                                     
  - Front-end has confirm dialog, button visible only when CTA is visible                                                                                                     
                                                                                                                                                                              
  The email itself                                                                                                                                                            
                                                                                                                                                                              
  - Template slug: Visa-Approval-Notice · type: email                                                                                                                         
  - Subject: "Visa Approval — your new earliest arrival date for ULearn Dublin"                                                                                               
  - Sender: success@ulearnschool.com                                                                                                                                          
  - Body uses the standard ULearn header/footer wrapper, signature block, document footer                                                                                     
  - Renders {{student.first_name}} and {{booking.start_date}} (the new shunted-forward date) prominently                                                                      
                                                                                                                                                                              
  Routes                                                                                                                                                                      
                                                                                                                                                                              
  - GET  /sis/api/students/:id/visa-approval-notice/preview → returns { html }                                                                                                
  - POST /sis/api/students/:id/visa-approval-notice/send → sends + stamps + returns { sent: true, to, messageId }                                                             
                                                                                                                                                                              
  Future on/off switch                                                                                                                                                        
                                                                                       
  Hook for global automation flag is one line in students.ts — when you eventually want to flip from manual CTA to auto-send, the change is gated by                          
  process.env.AUTO_SEND_VISA_APPROVAL_EMAIL === 'true'. Until then, manual CTA. No precedent for hidden background automation set.                                        
                                                                                       
  Want me to stamp Bilguunbayar so you can see the CTA in his profile right now? 

  "Dear Bilguunbayar,
  
  Apologies if you received a system email in relation to your Booking. This was accidental.
  
  Kind regards,
  
  ULearn Team"
  