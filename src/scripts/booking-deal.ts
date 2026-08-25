// Shared HubSpot deal-property builder for booking enrollments.
//
// Extracted from partners.ts so the three booking surfaces stay byte-for-byte
// aligned on how a form payload maps to HubSpot deal properties:
//   1. Drupal front-end booking form (ulearnschool.com/booking)
//   2. Partner portal "+ Add Student"  (partners.html → partners.ts enroll)
//   3. Student app "+ Book"            (student.html → student.ts studentBook)
//
// This module owns ONLY the course/accommodation/extras/territory mapping —
// the bits that must never drift between surfaces. Surface-specific concerns
// (dealname, pipeline, dealstage, contact handling, challenge, continuation,
// createquote, associations, tasks) stay with each caller.

// Map form course type + sub-options to the HubSpot course_type enum value.
// Exact alignment with Drupal BookingEnrichmentWorker.php resolveCourseType().
export function mapCourseType(data: any): string {
  const { courseType, courseSlot, aySlot, lpSlot, courseHours, examType, ieltsSlot } = data;

  switch (courseType) {
    case 'group': {
      const slot = courseSlot || '';
      if (courseHours === '30') return 'Intensive General English';
      if (courseHours === '20') return slot === 'morning' ? 'General English AM Plus' : 'General English PM Plus';
      return slot === 'afternoon' ? 'General English PM' : 'General English';
    }
    case 'exam': {
      const eslot = ieltsSlot || '';
      if (examType === 'ielts') return eslot === 'afternoon' ? 'IELTS PM' : 'IELTS AM';
      if (examType === 'fce') return 'Cambridge First FCE AM';
      if (examType === 'cae') return 'Cambridge Advanced CAE AM';
      return 'Exam Preparation';
    }
    case 'private': return 'Private Lessons';
    case 'lifepass': return (lpSlot || '') === 'afternoon' ? 'LifePass PM' : 'LifePass AM';
    case 'academic_year': return (aySlot || '') === 'afternoon' ? 'ay_year_aft' : 'ay_year_morn';
    case 'junior': return 'Junior';
    default: return courseType || '';
  }
}

// Resolve week band for the course_duration property.
export function resolveWeekBand(weeks: number): string {
  if (weeks <= 5) return '1 to 5 Weeks';
  if (weeks <= 7) return '6 to 7 Weeks';
  if (weeks <= 11) return '8 to 11 Weeks';
  if (weeks <= 24) return '12 to 24 Weeks';
  return '25 Weeks';
}

// Resolve territory — exact HubSpot enum values.
export function resolveTerritory(territory: string): string | null {
  if (territory === 'EU') return 'EU';
  if (territory === 'Non-EU (VBD)') return 'Non-EU (VBD)';
  if (territory === 'Non-EU (No Visa)') return 'Non-EU (NO VISA)';
  return null; // Unsupported Territory — don't send
}

export const TERRITORY_MAP: Record<string, string> = {"Afghanistan":"Unsupported Territory","Albania":"Non-EU (VBD)","Algeria":"Non-EU (VBD)","Andorra":"EU","Argentina":"Non-EU (No Visa)","Armenia":"Non-EU (VBD)","Australia":"Non-EU (VBD)","Austria":"EU","Azerbaijan":"Non-EU (VBD)","Belarus":"Non-EU (VBD)","Belgium":"EU","Bolivia":"Non-EU (No Visa)","Bosnia and Herzegovina":"Non-EU (VBD)","Brazil":"Non-EU (No Visa)","Brunei":"Non-EU (VBD)","Bulgaria":"EU","Cameroon":"Non-EU (VBD)","Canada":"Non-EU (VBD)","Chile":"Non-EU (No Visa)","China":"Non-EU (VBD)","Colombia":"Non-EU (VBD)","Costa Rica":"Non-EU (No Visa)","Croatia":"EU","Cyprus":"EU","Czech Republic":"EU","Denmark":"EU","Ecuador":"Non-EU (VBD)","Egypt":"Non-EU (VBD)","El Salvador":"Non-EU (No Visa)","Estonia":"EU","Fiji":"Non-EU (VBD)","Finland":"EU","France":"EU","Georgia":"Non-EU (VBD)","Germany":"EU","Gibraltar":"EU","Greece":"EU","Guatemala":"Non-EU (No Visa)","Honduras":"Non-EU (No Visa)","Hong Kong":"Non-EU (No Visa)","Hungary":"EU","Iceland":"EU","Indonesia":"Non-EU (VBD)","Ireland":"EU","Israel":"EU","Italy":"EU","Japan":"Non-EU (No Visa)","Jordan":"Non-EU (VBD)","Kazakhstan":"Non-EU (VBD)","Kuwait":"Non-EU (VBD)","Latvia":"EU","Liechtenstein":"EU","Lithuania":"EU","Luxembourg":"EU","Malaysia":"Non-EU (No Visa)","Malta":"EU","Mexico":"Non-EU (No Visa)","Moldova":"Non-EU (VBD)","Monaco":"EU","Mongolia":"Non-EU (VBD)","Montenegro":"Non-EU (VBD)","Morocco":"Non-EU (VBD)","Netherlands":"EU","New Zealand":"Non-EU (VBD)","Nicaragua":"Non-EU (No Visa)","Norway":"EU","Oman":"Non-EU (VBD)","Panama":"Non-EU (No Visa)","Paraguay":"Non-EU (No Visa)","Peru":"Non-EU (VBD)","Poland":"EU","Portugal":"EU","Qatar":"Non-EU (No Visa)","Romania":"EU","Russia":"Non-EU (VBD)","San Marino":"EU","Saudi Arabia":"Non-EU (VBD)","Serbia":"Non-EU (VBD)","Singapore":"Non-EU (VBD)","Slovakia":"EU","Slovenia":"EU","South Korea":"Non-EU (No Visa)","Spain":"EU","Sweden":"EU","Switzerland":"EU","Taiwan":"Non-EU (No Visa)","Turkey":"Non-EU (VBD)","Ukraine":"Non-EU (VBD)","United Arab Emirates":"Non-EU (VBD)","United Kingdom":"EU","United States":"Non-EU (VBD)","Uruguay":"Non-EU (No Visa)","Uzbekistan":"Non-EU (VBD)","Vatican City":"EU"};

// Build the shared deal properties (course / territory / dates / accommodation
// / extras / notes) from a booking form payload. Returns a plain object the
// caller spreads into its deal — the caller adds dealname/pipeline/dealstage
// and any surface-specific flags (challenge, continuation, createquote).
//
// Behaviour is identical to the original inline block in partners.ts enroll().
export function buildBaseDealProps(data: any): Record<string, any> {
  const props: Record<string, any> = {
    course_type: mapCourseType(data),
  };

  // Territory — only send if supported.
  const rawTerritory = TERRITORY_MAP[data.nationality] || 'Unsupported Territory';
  const hsTerritory = resolveTerritory(rawTerritory);
  if (hsTerritory) props.territory = hsTerritory;

  // Course dates and weeks.
  if (data.courseStart) props.course_start = data.courseStart;
  if (data.courseEnd) props.course_end = data.courseEnd;
  if (data.courseType !== 'private' && data.courseWeeks) {
    const weeks = parseInt(data.courseWeeks);
    props.course_weeks = weeks;
    props.course_duration = resolveWeekBand(weeks);
  }

  // Private hours (only for private lessons).
  if (data.courseType === 'private' && data.privateHours) {
    props.private_hours = parseInt(data.privateHours);
  }

  // Junior pack.
  if (data.courseType === 'junior' && data.juniorPack) {
    props.junior_pack = data.juniorPack;
  }

  // Accommodation — exact mapping per resolveAccommType() / resolveRoomType().
  const accommMap: Record<string, string> = { host: 'Host Family', apartment: 'City Centre Apartment', hostel_hotel: 'Hostel' };
  if (data.accommType && data.accommType !== 'none') {
    props.accomm_type = accommMap[data.accommType] || data.accommType;

    // Room type — form values are lowercase form tokens, HubSpot expects the
    // option-value string. Apartment + hostel use Title-Case labels historically;
    // host family uses 'Individual' (existing) and the 'host-shared' internal
    // value (added 2026-05 for junior groups).
    if (data.accommRoom) {
      const hostelRoomMap: Record<string, string> = { individual: 'Standard', dorm: 'Dorm' };
      const aptRoomMap: Record<string, string> = { premium: 'Premium', superior: 'Superior', standard: 'Standard', twin_shared: 'Twin/Shared' };
      const hostRoomMap: Record<string, string> = { 'host-individual': 'Individual', 'host-shared': 'host-shared' };
      if (data.accommType === 'hostel_hotel') {
        props.room_type = hostelRoomMap[data.accommRoom] || data.accommRoom;
      } else if (data.accommType === 'host') {
        props.room_type = hostRoomMap[data.accommRoom] || data.accommRoom;
      } else {
        props.room_type = aptRoomMap[data.accommRoom] || data.accommRoom;
      }
    }

    if (data.accommStart) props.accomm_start = data.accommStart;
    if (data.accommEnd) props.accomm_end = data.accommEnd;
    if (data.accommWeeks) props.accomm_weeks = parseInt(data.accommWeeks);
  }

  // Extras — booleans as strings, matching Drupal enrichment behaviour.
  const extras: string[] = Array.isArray(data.extras) ? data.extras : data.extras ? [data.extras] : [];
  props.airport_pickup = extras.includes('airport_pickup') ? 'true' : 'false';
  props.airport_dropoff = extras.includes('airport_dropoff') ? 'true' : 'false';

  // AY + LifePass auto-bundle: Exam Fee + PEL/Health Insurance are always included.
  // Server-side enforced so a frontend that "forgets" to send them still produces a
  // valid deal. exam_type is intentionally left null — filled once the student sits
  // the level test.
  const isBundled = data.courseType === 'lifepass' || data.courseType === 'academic_year';
  if (isBundled) {
    props.exam_fee = 'true';
    props.insurance = 'PEL;Health';
  } else {
    props.exam_fee = extras.includes('exam_fee') ? 'true' : 'false';
    const insuranceParts: string[] = [];
    if (extras.includes('insurance_pel')) insuranceParts.push('PEL');
    if (extras.includes('insurance_health')) insuranceParts.push('Health');
    if (insuranceParts.length) props.insurance = insuranceParts.join(';');
  }

  // Extras sub-fields — timestamps as Unix ms at midnight UTC.
  if (extras.includes('airport_pickup') && data.pickupTime) {
    const d = new Date(data.pickupTime); d.setUTCHours(0, 0, 0, 0);
    props.airport_pickup_time = d.getTime();
  }
  if (extras.includes('airport_dropoff') && data.dropoffTime) {
    const d = new Date(data.dropoffTime); d.setUTCHours(0, 0, 0, 0);
    props.airport_dropoff_time = d.getTime();
  }
  if (!isBundled && extras.includes('exam_fee') && data.examTypeExtra) {
    const examMap: Record<string, string> = { ielts: 'IELTS', fce: 'FCE', cae: 'CAE' };
    props.exam_type = examMap[data.examTypeExtra] || data.examTypeExtra;
  }

  if (data.notes) props.description = data.notes;

  return props;
}
