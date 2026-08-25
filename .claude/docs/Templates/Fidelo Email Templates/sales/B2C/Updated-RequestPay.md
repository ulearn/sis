### IBAN ###
<p>Dear {firstname},</p>
<p>Thank you very much for your registration! Please see below <strong>the updated </strong>details of your booking and how to proceed with payment for the difference.</p>
<p>{start_loop_individual_transfer}<strong>Transfer:</strong> {booked_transfer} <br /><strong>Arrival date:</strong> {arrival_date} <br /><strong>Departure date:</strong> {departure_date}{end_loop_individual_transfer}</p>
<p>{start_loop_courses} <strong>Course:</strong> {course} <br /><strong>Course start:</strong> {date_course_start}<br /><strong>Course end:</strong> {date_course_end} <br />{if course_category== "Morning Classes"}<strong>Course time:</strong>&nbsp;Monday to Friday, from&nbsp;09:00 to 12:20.<br />{/if}{if course_category== "Morning Classes Plus"}<strong>Course time:</strong>&nbsp;Monday to Friday, from&nbsp;09:00 to 13:30.<br />{/if}{if course_category== "Afternoon Classes"}<strong>Course time:</strong>&nbsp;Monday to Friday, from&nbsp;13:45 to 17:00.<br />{/if}{if course_category== "Afternoon Classes Plus"}<strong>Course time:</strong>&nbsp;Monday to Friday, from&nbsp;12:30 to 17:00.<br />{/if}{if course_category== "Intensive Classes"}<strong>Course time:</strong>&nbsp;Monday to Friday, from&nbsp;09:00 to 17:00.<br />{/if}{if course_category== "Evening Classes"}<strong>Course time:</strong> Tuesdays and Thursdays from 18:30 to 20:30. Classes are held at ULearn's school building, 11 Harcourt street (dark green door next to Donnelly's Leathers shop).<br />{/if}{if course_category== "Private lessons"}<strong>Please note:</strong> Each lesson consists of a class hour&nbsp;of 60 minutes.{/if}{end_loop_courses}</p>
<p>{start_loop_accommodations} <strong>Accommodation:</strong> {accommodation_category} <br /><strong>Room type:</strong> {roomtype_full} <br /><strong>Acc. start:</strong> {date_accommodation_start} <br /><strong>Acc. end:</strong> {date_accommodation_end} {end_loop_accommodations}</p>
<p>In order to confirm this registration please proceed with payment using the bank details in the invoice.</p>
<table border="0" cellpadding="1" cellspacing="1" style="width: 985px;">
<tbody>
<tr>
<td colspan="3" style="width: 977px;"><strong>TOTAL PAYMENT AMOUNT DUE</strong>:&nbsp;<br />-- {amount} --</td>
</tr>
</tbody>
</table>
<br />
<p>If you have any other questions, or if you need more information, please do not hesitate to contact us at any time.</p>