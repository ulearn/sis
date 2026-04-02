<p>To Whom It May Concern,</p>
<p>&nbsp;</p>
<p>This letter is a secure document. To confirm the recipient &amp; holder is a genuine ULearn Student please scan the QR code below with the camera on your phone. &nbsp;</p>
<ul>
    <li>Please pay close attention to the <strong>exact URL</strong> you see</li>
    <li>The final string in the URL is the students Unique Key: {unique_key}&nbsp;</li>
    <li>The URL must <strong><u>exactly match</u> </strong>the following: <a target="_blank" rel="noopener noreferrer" href="https://visa.fidelo.com/ulearn/{unique_key}">https://visa.fidelo.com/ulearn/{unique_key}</a>&nbsp;</li>
    <li>You will also see the students name &amp; details mirrored on that page<br>&nbsp;</li>
</ul>
<p style="text-align:center;"><span><strong>PLEASE NOW SCAN THIS QR CODE WITH YOUR PHONE TO CHECK THE AUTHENTICITY OF THIS DOCUMENT</strong></span><br>{visa_qr_code}&nbsp;</p>
<p><br><span>{salutation}&nbsp;</span>{firstname} {surname} has paid ULearn English School {<span>amount_gross_all</span>} to reserve the following:</p>
<figure class="table" style="height:150px;width:549px;">
    <table width="403">
        <tbody>
            <tr style="height:13px;">
                <td style="height:13px;width:164.469px;"><strong>Student Name</strong></td>
                <td style="height:13px;width:188.094px;"><span>{firstname} {surname}</span></td>
                <td>&nbsp;</td>
            </tr>
            <tr style="height:18px;">
                <td style="height:18px;width:164.469px;"><strong>Student Number</strong></td>
                <td style="height:18px;width:188.094px;"><span>{customernumber}</span></td>
                <td style="width:174.438px;">&nbsp;</td>
            </tr>
            <tr style="height:13px;">
                <td style="height:13px;width:164.469px;"><strong>Nationality</strong></td>
                <td style="height:13px;width:188.094px;"><span>{nationality}</span></td>
                <td style="width:174.438px;">&nbsp;</td>
            </tr>
            <tr style="height:13px;">
                <td style="height:10px;width:164.469px;"><strong>Date of Birth</strong></td>
                <td style="height:10px;width:188.094px;"><span>{birthdate}</span></td>
                <td style="width:174.438px;">&nbsp;</td>
            </tr>
            <tr style="height:13px;">
                <td style="height:13px;width:164.469px;"><strong>Passport Number</strong></td>
                <td style="height:13px;width:188.094px;"><span>{passnummer}</span></td>
                <td style="width:174.438px;">&nbsp;</td>
            </tr>
            <tr style="height:13px;">
                <td style="height:13px;width:164.469px;"><strong>Course Title &amp; Level</strong></td>
                <td style="height:13px;width:188.094px;"><span>{course}&nbsp;{normal_level}</span></td>
                <td style="width:174.438px;">&nbsp;</td>
            </tr>
            <tr style="height:18px;">
                <td style="height:18px;width:164.469px;"><strong>ILEP COURSE CODE</strong></td>
                <td style="height:18px;width:188.094px;"><span>{ilep_course_code}</span></td>
                <td style="width:174.438px;">&nbsp;</td>
            </tr>
            <tr style="height:13px;">
                <td style="height:13px;width:164.469px;"><strong>Duration</strong></td>
                <td style="height:13px;width:188.094px;"><span>8 months</span></td>
                <td style="width:174.438px;">&nbsp;</td>
            </tr>
            <tr style="height:13px;">
                <td style="height:13px;width:164.469px;"><strong>No of Hours per Week</strong></td>
                <td style="height:13px;width:188.094px;">{lessons_per_week}</td>
                <td style="width:174.438px;">&nbsp;</td>
            </tr>
            <tr style="height:13px;">
                <td style="height:13px;width:164.469px;"><strong>Start Date</strong></td>
                <td style="height:13px;width:188.094px;">{date_course_start}</td>
                <td style="width:174.438px;">&nbsp;</td>
            </tr>
            <tr style="height:13px;">
                <td style="height:13px;width:164.469px;"><strong>Finish Date</strong></td>
                <td style="height:13px;width:188.094px;"><span>{visa_valid_until}</span></td>
                <td style="width:174.438px;">&nbsp;</td>
            </tr>
        </tbody>
    </table>
</figure>
<p>{if accommodation_category}<strong>Accommodation details</strong><br>{start_loop_accommodations}<span>{accommodation_provider_name}, {accommodation_address}, {accommodation_address_addon}, {accommodation_zip}.</span><br>{accommodation_weeks} weeks ({date_accommodation_start} to {date_accommodation_end})<br>{end_loop_accommodations}<br>{/if}{if booked_transfer =="Yes"}<strong>Transfer details:</strong><br>{start_loop_individual_transfer}<br>From "{individual_transfer_pick_up_location}" to "{individual_transfer_drop_off_location}"<br>{individual_transfer_date} - {individual_transfer_time}<br>{end_loop_individual_transfer}{/if}<strong>Insurance details:</strong><br><span>ULearn has organised health insurance for&nbsp;{salutation} {surname} in Ireland through Arachas Insurance. The school policy number is IAS 84420.</span><br><br><strong>Learner Protection:</strong><br><span>ULearn has partnered with Arachas Insurance to provide protection for its enrolled learners in line with the change in regulations that came into force on July 4, 2022. Our policy number is ECOAG15683.&nbsp;</span><br><br>I wish to confirm that ULearn has the capacity to accommodate <span>{salutation} {surname} on a full-time basis in in-person lessons at our city-centre premises.&nbsp;</span><br><br>I may be contacted at 01-4751222 or 0851574801 for any confirmation of the details in this document that may be necessary.</p>