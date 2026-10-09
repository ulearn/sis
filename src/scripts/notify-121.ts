/**
 * DOS alert for 1-to-1 (PRIVATE) courses. A private lesson needs a teacher
 * hired/rostered specially, and these were invisible — buried inside a mixed
 * booking, never surfaced in Arrivals (Neil/Paul Gill, 2026-08-31). Fires ONE
 * transactional email to dos@ the moment a PRIVATE BookingCourse lands (webhook
 * OR manual create), idempotent via BookingCourse.dosNotifiedAt so re-syncs
 * never re-fire. Deliberately plain (no marketing wrap) so Gmail files it in
 * Primary, not Promotions.
 */
import { sendEmail } from './email';

const DOS_EMAIL = 'dos@ulearnschool.com';

function esc(s: any): string {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function ddmmyyyy(d: any): string {
  if (!d) return 'TBC';
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return 'TBC';
  const p = (n: number) => String(n).padStart(2, '0');
  return `${p(dt.getUTCDate())}/${p(dt.getUTCMonth() + 1)}/${dt.getUTCFullYear()}`;
}

/**
 * Alert the DOS about a 1-to-1 course. Returns true if an email was sent.
 * No-op (returns false) when the course isn't PRIVATE or was already notified
 * (unless opts.force).
 */
export async function notifyDosOf121(prisma: any, bookingCourseId: number, opts: { force?: boolean } = {}): Promise<boolean> {
  const c = await prisma.bookingCourse.findUnique({
    where: { id: bookingCourseId },
    select: {
      id: true, name: true, category: true, startDate: true, endDate: true,
      weeks: true, hoursPerWeek: true, level: true, dosNotifiedAt: true,
      booking: {
        select: {
          id: true,
          student: { select: { id: true, firstName: true, lastName: true, nationality: true } },
          agency: { select: { name: true } },
        },
      },
    },
  });
  if (!c || c.category !== 'PRIVATE') return false;
  if (c.dosNotifiedAt && !opts.force) return false;

  const s = c.booking?.student;
  const studentName = s ? `${s.firstName ?? ''} ${s.lastName ?? ''}`.trim() : `Student on booking #${c.booking?.id}`;
  const hpw = c.hoursPerWeek != null ? `${c.hoursPerWeek} hrs/week` : 'hours TBC';
  const agency = c.booking?.agency?.name || 'Direct booking';
  const sisLink = s?.id ? `https://sis.ulearnschool.com/sis/admin#student-detail/${s.id}` : 'https://sis.ulearnschool.com/sis/admin';

  const html = `
  <p style="margin:0 0 14px">A <strong>1-to-1 (private) lesson</strong> has been booked. It needs a teacher <strong>hired/rostered</strong> specially — please arrange cover.</p>
  <table cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-size:14px">
    <tr><td style="padding:3px 16px 3px 0;color:#555">Student</td><td><strong>${esc(studentName)}</strong>${s?.nationality ? ' &middot; ' + esc(s.nationality) : ''}</td></tr>
    <tr><td style="padding:3px 16px 3px 0;color:#555">Course</td><td>${esc(c.name || '1-to-1')}${c.level ? ' &middot; ' + esc(c.level) : ''}</td></tr>
    <tr><td style="padding:3px 16px 3px 0;color:#555">Starts</td><td><strong>${ddmmyyyy(c.startDate)}</strong></td></tr>
    <tr><td style="padding:3px 16px 3px 0;color:#555">Ends</td><td>${ddmmyyyy(c.endDate)}</td></tr>
    <tr><td style="padding:3px 16px 3px 0;color:#555">Duration</td><td>${c.weeks || '?'} week(s) &middot; ${esc(hpw)}</td></tr>
    <tr><td style="padding:3px 16px 3px 0;color:#555">Agent</td><td>${esc(agency)}</td></tr>
  </table>
  <p style="margin:16px 0 0"><a href="${sisLink}" style="color:#0091ae">Open the student in SIS &rarr;</a></p>`;

  await sendEmail({
    from: 'success@ulearnschool.com',
    fromName: 'ULearn SIS',
    to: DOS_EMAIL,
    subject: `1-to-1 lesson booked — teacher needed: ${studentName}`,
    html,
    houseStyle: false, // plain transactional → Gmail Primary, not Promotions
  });
  await prisma.bookingCourse.update({ where: { id: c.id }, data: { dosNotifiedAt: new Date() } });
  return true;
}
