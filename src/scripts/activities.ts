/**
 * Activities module — Kelly schedules ~3/week of pub crawls, cliff walks,
 * museum tours, etc. Students RSVP via /sis/student. Kelly marks attended
 * after the event, which feeds the "Activity Attended" challenge.
 *
 * Publish-to-social goes through hub.foxfix.ai (the existing perfected Meta
 * publisher there — POST /social/publish-adhoc). Meta tokens & API logic
 * live on the hub, not here. Caption + image selection are SIS-side.
 */
import type { PrismaClient } from '../generated/prisma/client';

export function activitiesScripts(prisma: PrismaClient) {

  function startOfDay(d: Date): Date {
    const x = new Date(d); x.setHours(0,0,0,0); return x;
  }

  // For the admin calendar: from the first Monday of the requested month
  // through the last day of the month, padded out to the end of that
  // calendar week (so a month ending Wed shows Thu-Fri spilling into next).
  function monthGridRange(year: number, month: number /* 0-11 */): { from: Date; to: Date } {
    const firstOfMonth = new Date(year, month, 1);
    // Walk forward to the first Monday on/after the 1st
    let firstMon = new Date(firstOfMonth);
    while (firstMon.getDay() !== 1) firstMon.setDate(firstMon.getDate() + 1);
    firstMon.setHours(0,0,0,0);

    // Last day of month, then walk forward to the next Sunday
    const lastOfMonth = new Date(year, month + 1, 0);
    const lastSun = new Date(lastOfMonth);
    while (lastSun.getDay() !== 0) lastSun.setDate(lastSun.getDate() + 1);
    lastSun.setHours(23,59,59,999);

    return { from: firstMon, to: lastSun };
  }

  async function listForRange(fromIso: string, toIso: string) {
    const from = startOfDay(new Date(fromIso));
    const to = startOfDay(new Date(toIso));
    return prisma.activity.findMany({
      where: { date: { gte: from, lte: to } },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
      include: {
        attendees: {
          include: {
            student: { select: { id: true, firstName: true, lastName: true } },
          },
        },
      },
    });
  }

  async function listForMonth(year: number, month: number) {
    const { from, to } = monthGridRange(year, month);
    const items = await listForRange(from.toISOString(), to.toISOString());
    return { from, to, items };
  }

  async function getById(id: number) {
    return prisma.activity.findUnique({
      where: { id },
      include: {
        attendees: {
          include: { student: { select: { id: true, firstName: true, lastName: true } } },
        },
      },
    });
  }

  async function create(data: any, byUser: string | null) {
    const payload: any = {
      date: new Date(data.date),
      startTime: data.startTime || null,
      endTime: data.endTime || null,
      title: (data.title || '').trim(),
      description: data.description || null,
      cost: data.cost != null && data.cost !== '' ? parseFloat(data.cost) : null,
      location: data.location || null,
      imageFilename: data.imageFilename || null,
      createdBy: byUser,
    };
    if (!payload.title) throw new Error('Title required');
    if (isNaN(payload.date.getTime())) throw new Error('Invalid date');
    return prisma.activity.create({ data: payload });
  }

  async function update(id: number, data: any) {
    const patch: any = {};
    if ('date' in data) patch.date = new Date(data.date);
    if ('startTime' in data) patch.startTime = data.startTime || null;
    if ('endTime' in data) patch.endTime = data.endTime || null;
    if ('title' in data) patch.title = (data.title || '').trim();
    if ('description' in data) patch.description = data.description || null;
    if ('cost' in data) patch.cost = data.cost != null && data.cost !== '' ? parseFloat(data.cost) : null;
    if ('location' in data) patch.location = data.location || null;
    if ('imageFilename' in data) patch.imageFilename = data.imageFilename || null;
    return prisma.activity.update({ where: { id }, data: patch });
  }

  async function remove(id: number) {
    await prisma.activity.delete({ where: { id } });
    return { deleted: true };
  }

  // Publish-to-social. One HTTP call to hub.foxfix.ai/social/publish-adhoc
  // posts the activity as a DRAFT to BOTH the FB Page and the linked IG
  // Business account. Kelly approves/discards each independently in Meta
  // Business Suite. The hub-side publisher (publishPost) handles all the
  // Meta API draft semantics (FB unpublished photo + DRAFT feed post,
  // IG container without media_publish).
  async function publish(id: number, options: { draft?: boolean; igImageFilename?: string | null } = {}) {
    const a = await prisma.activity.findUnique({ where: { id } });
    if (!a) throw new Error('Activity not found');

    const hubUrl = process.env.META_HUB_URL;
    if (!hubUrl) throw new Error('META_HUB_URL not set');

    // Caption: title on its own line, then description, then date+location footer.
    const dt = new Date(a.date);
    const dateStr = dt.toLocaleDateString('en-IE', { weekday: 'long', day: 'numeric', month: 'long' });
    const timeStr = a.startTime ? ` · ${a.startTime}` : '';
    const locStr = a.location ? `\n📍 ${a.location}` : '';
    const caption = `${a.title}\n\n${a.description || ''}\n\n📅 ${dateStr}${timeStr}${locStr}`.trim();

    // Hub fetches the image via URL — point it at the public route we already
    // serve. publicBaseUrl falls back to the canonical SIS host.
    const publicBase = process.env.SIS_PUBLIC_URL || 'https://sis.ulearnschool.com';
    const imageUrl = a.imageFilename
      ? `${publicBase}/sis/api/activities/image/${encodeURIComponent(a.imageFilename)}`
      : undefined;
    // Optional IG-specific variant — when the user has applied a logo, hub has
    // already produced an IG-cropped + logod version; pass it explicitly so hub
    // skips its own crop step and uses the prepared image directly.
    const imageUrlIg = options.igImageFilename
      ? `${publicBase}/sis/api/activities/image/${encodeURIComponent(options.igImageFilename)}`
      : undefined;

    const r = await fetch(`${hubUrl}/social/publish-adhoc`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientId: 'ulearn',
        caption,
        imageUrl,
        imageUrlIg,
        draft: options.draft !== false,
      }),
    });
    const d: any = await r.json().catch(() => ({}));
    if (!r.ok || d.error) throw new Error(`Hub publish: ${d.error || r.status}`);

    // hub returns { status: 'ok', result: { facebook: {...}, instagram: {...} } }
    // Errors come back in two shapes:
    //   - thrown-and-caught on hub  → { error: 'string message' }
    //   - Meta API error in body    → { error: { message, type, code, ... } }
    // Unpack to a readable string before bubbling up to the UI.
    const errString = (e: any) => {
      if (!e) return '';
      if (typeof e === 'string') return e;
      if (e.message) return `${e.message}${e.code ? ` (code ${e.code})` : ''}`;
      try { return JSON.stringify(e); } catch { return String(e); }
    };

    const result = d.result || {};
    const update: any = { publishedAt: new Date() };
    const errors: string[] = [];
    if (result.facebook && !result.facebook.error) {
      update.publishedToFb = true;
      if (result.facebook.permalink) update.fbPostUrl = result.facebook.permalink;
    } else if (result.facebook?.error) {
      errors.push(`FB: ${errString(result.facebook.error)}`);
    }
    if (result.instagram && !result.instagram.error) {
      update.publishedToIg = true;
      if (result.instagram.permalink) update.igPostUrl = result.instagram.permalink;
    } else if (result.instagram?.error) {
      errors.push(`IG: ${errString(result.instagram.error)}`);
    }

    const updated = await prisma.activity.update({ where: { id }, data: update });
    return { ...updated, errors: errors.length ? errors : undefined };
  }

  // ── Attendees / RSVP ──
  async function rsvp(activityId: number, studentId: number) {
    return prisma.activityAttendee.upsert({
      where: { activityId_studentId: { activityId, studentId } },
      create: { activityId, studentId },
      update: {},
    });
  }

  async function cancelRsvp(activityId: number, studentId: number) {
    await prisma.activityAttendee.deleteMany({ where: { activityId, studentId } });
    return { deleted: true };
  }

  async function markAttended(attendeeId: number, attended: boolean) {
    return prisma.activityAttendee.update({
      where: { id: attendeeId },
      data: { attended, attendedAt: attended ? new Date() : null },
    });
  }

  // Student-facing list: upcoming + past 7 days, with the student's own RSVP state.
  async function studentFeed(studentId: number) {
    const today = startOfDay(new Date());
    const back7 = new Date(today); back7.setDate(back7.getDate() - 7);
    const fwd60 = new Date(today); fwd60.setDate(fwd60.getDate() + 60);

    const activities = await prisma.activity.findMany({
      where: { date: { gte: back7, lte: fwd60 } },
      orderBy: { date: 'asc' },
      include: {
        attendees: {
          where: { studentId },
          select: { id: true, attended: true },
        },
      },
    });
    return activities.map(a => ({
      id: a.id,
      date: a.date,
      startTime: a.startTime,
      endTime: a.endTime,
      title: a.title,
      description: a.description,
      cost: a.cost,
      location: a.location,
      imageFilename: a.imageFilename,
      myRsvp: a.attendees[0] ? { id: a.attendees[0].id, attended: a.attendees[0].attended } : null,
    }));
  }

  return {
    listForRange, listForMonth, getById,
    create, update, remove, publish,
    rsvp, cancelRsvp, markAttended, studentFeed,
  };
}
