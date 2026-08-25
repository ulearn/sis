<p>Dear {firstname} {surname},</p>
<p>Herewith we confirm your insurances.<br />{start_loop_insurances}</p>
<table cellpadding="2" cellspacing="0">
<tbody>
<tr>
<td><strong>Insurance</strong></td>
<td>{insurance}</td>
</tr>
<tr>
<td><strong>Provider</strong></td>
<td>{insurance_provider}</td>
</tr>
<tr>
<td><strong>Start</strong></td>
<td>{date_insurance_start}</td>
</tr>
<tr>
<td><strong>End</strong></td>
<td>{date_insurance_end}</td>
</tr>
<tr>
<td><strong>Price</strong></td>
<td>{insurance_price}</td>
</tr>
</tbody>
</table>
<br />{end_loop_insurances}<br />
<p>Please let us know if you have any questions.<br /><br /></p>