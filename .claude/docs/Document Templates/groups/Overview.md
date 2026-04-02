General group information


Group name	{group_name}
Address	{group_address}{if group_address_addon} {group_address_addon}{/if}
{group_zip} {group_city}
{if group_country}{group_country}{/if}
Members (total)	{group_count_member}
Members (Leader)	{group_count_leader}
Members (Without leaders)	{group_count_exkl_leader}
Main contact	{group_contact_firstname} {group_contact_surname}


Booking information

ID	Name	G.	Courses	Accommodation	Transfer (Y/N)
{start_loop_group_members}
{customernumber}	{firstname} {surname}	{gender}	{start_loop_courses}{course} - {course_weeks} weeks
{end_loop_courses}	{start_loop_accommodations} {accommodation_category} ({accommodation_room}/{accommodation_meal}) - {accommodation_weeks} weeks
{end_loop_accommodations}	{if transfer_booked}Yes{else}No{/if}
{end_loop_group_members}


Plase make sure that the details are correct and feel free to contact us if you have any questions. 

