<h2 style="text-align: center;"></h2>
<table border="1" cellpadding="0" cellspacing="0">
<tbody>
<tr>
<td width="232">
<p>Student ID: {customernumber}</p>
</td>
<td width="210">
<p>Program: {course}</p>
</td>
</tr>
<tr>
<td width="232">
<p>Name:<strong>{firstname} {surname}</strong></p>
</td>
<td width="210">
<p>Current Level:&nbsp;<span>{highest_level}</span></p>
</td>
</tr>
<tr>
<td width="232">
<p>Dates of Study: &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;&nbsp;<span>{date_course_start}</span></p>
</td>
<td width="210">
<p><span><span>{date_last_course_end}</span></span></p>
</td>
</tr>
</tbody>
</table>
<p></p>
<p>The following is a report based on evaluation given by teachers of the student's study period this week.<br /><br /></p>
<p><b>Current Level and Grades:</b></p>
<table cellpadding="2" cellspacing="0" style="width: 100%;">
<tbody>
<tr>
<td style="width: 30%;">
<p style="text-align: left;"><b>Behaviour</b></p>
</td>
</tr>
<tr>
<td style="width: 60%;">
<p>{transcript_behavior}</p>
</td>
</tr>
<tr>
<td>
<p style="text-align: left;"><b>Homework</b></p>
</td>
</tr>
<tr>
<td>
<p>{transcript_homework}</p>
</td>
</tr>
<tr>
<td>
<p style="text-align: left;"><b>Participation</b></p>
</td>
</tr>
<tr>
<td>
<p>{transcript_class_participation}</p>
</td>
</tr>
</tbody>
</table>
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
<p>Attendance Percentage (overall)<br />Lessons attended: {lessons_attended}</p>
</td>
<td width="221">
<p>Score: {start_loop_courses}{start_loop_course_weeks}{if attendance_filter_week == 1}{start_loop_tuition_blocks}{score} {end_loop_tuition_blocks} {/if}{end_loop_course_weeks}{end_loop_courses}</p>
</td>
</tr>
</tbody>
</table>
<p>Yours sincerely,<br /><br /><img src="https://ulearn.fidelo.com/media/ts/uploads/57_pg_sig_stamp_no_line.jpg" width="298" height="91" alt="" /><br />____________________<br />Paul Gill<br /><em>Director of Studies</em></p>