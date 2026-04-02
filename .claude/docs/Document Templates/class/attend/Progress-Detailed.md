<table border="1" cellpadding="2" cellspacing="0" width="100%">
<tbody>
<tr>
<td style="width: 50%;">
<p>Student ID: {customernumber}</p>
</td>
<td style="width: 50%;">
<p>Program: {course}</p>
</td>
</tr>
<tr>
<td style="width: 50%;">
<p>Name:<strong>{firstname} {surname}</strong></p>
</td>
<td style="width: 50%;">
<p>Current Level: {highest_level}</p>
</td>
</tr>
<tr>
<td style="width: 50%;">
<p>Start date: {date_course_start}</p>
</td>
<td style="width: 50%;">
<p>End date: {date_last_course_end}</p>
</td>
</tr>
<tr>
<td style="width: 50%;">
<p>Total lessons booked: {lessons_amount_total}</p>
</td>
<td style="width: 50%;"></td>
</tr>
</tbody>
</table>
<p></p>
<p>The following is a report based on evaluation given by teachers of the student's study period.</p>
<p><b>Level and Grades:</b></p>
{start_loop_courses}{start_loop_course_weeks} {start_loop_tuition_blocks}
<p></p>
<b>Date: {week_date_from} - {class_name} - Teacher: {teacher_firstname} - Course: {course}</b> <br />
<table cellpadding="2" cellspacing="0" width="100%">
<tbody>
<tr>
<td style="width: 30%;">
<p style="text-align: left;"><b>Lessons:</b></p>
</td>
<td style="width: 60%;">
<p>{lessons_amount}</p>
</td>
</tr>
<tr>
<td style="width: 30%;">
<p style="text-align: left;"><b>Lessons attended:</b></p>
</td>
<td style="width: 60%;">
<p>{lessons_attended}</p>
</td>
</tr>
<tr>
<td style="width: 30%;">
<p style="text-align: left;"><b>Lessons missed:</b></p>
</td>
<td style="width: 60%;">
<p>{lessons_missed}</p>
</td>
</tr>
</tbody>
</table>
{end_loop_tuition_blocks} {end_loop_course_weeks}{end_loop_courses}<br /><br />
<table cellpadding="2" cellspacing="0">
<tbody>
<tr>
<td width="221">
<p></p>
</td>
<td width="221">
<p></p>
</td>
</tr>
<tr>
<td width="221">
<p style="text-align: center;"></p>
</td>
<td width="221">
<p><strong>&nbsp;</strong></p>
</td>
</tr>
<tr>
<td width="221">
<p style="text-align: right;"><strong>Met Attendance Policy:</strong></p>
</td>
<td width="221">
<p><strong>YES or NO</strong></p>
</td>
</tr>
<tr>
<td width="221">
<p>Attendance Percentage (overall)<br />Lessons attended: {lessons_attended}<br />Lessons missed: {lessons_missed}</p>
</td>
<td width="221">
<p>Score: {start_loop_courses}{start_loop_course_weeks}{if attendance_filter_week == 1}{start_loop_tuition_blocks}{score} {end_loop_tuition_blocks} {/if}{end_loop_course_weeks}{end_loop_courses}</p>
</td>
</tr>
</tbody>
</table>