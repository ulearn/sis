// One Slack thread per student per challenge cycle.
//
// Callers ask `notifyChallenge(prisma, studentId, text)` and we:
//   1. Resolve the cycle (Mon-of-this-week by default).
//   2. Look up StudentChallengeThread for (studentId, cycleStart). If found,
//      post the message as a `thread_ts` reply.
//   3. If no row, post a top-level "*New Challenge run – Firstname Lastname*"
//      parent message, capture the `ts`, persist the thread row, then post
//      the caller's text as the first reply on that thread.
//
// This keeps the channel tidy: one parent per student-week, every event
// (handle confirmed, video uploaded, course 100 %, review URL, attended)
// nests beneath it. If the user wants to switch to a monthly cycle later,
// `cycleKind` on the row supports that without a schema change.

import type { PrismaClient } from '../generated/prisma/client';
import { postSlackMessage, kellyMention } from './slack';

export interface NotifyOptions {
  /** What this notification is about — short, used in the header line. */
  title: string;
  /** Body text (Slack markdown) for the reply / first message. */
  body: string;
  /** Override the default WEEK cycle for this student. */
  cycleKind?: 'WEEK' | 'MONTH';
  /** Optional milestone flag to set on the thread row after a successful post
   *  (used to dedupe one-shot events such as the course-100 % notify). If the
   *  flag is already true the call is a no-op.  */
  setOnceFlag?: 'notifiedCourse100';
}

function cycleStartFor(kind: 'WEEK' | 'MONTH', now = new Date()): Date {
  const d = new Date(now); d.setHours(0, 0, 0, 0);
  if (kind === 'WEEK') {
    const dow = (d.getDay() + 6) % 7; // Mon = 0
    d.setDate(d.getDate() - dow);
  } else {
    d.setDate(1);
  }
  return d;
}

/**
 * Fire-and-forget — never throws. Returns true when Slack accepted the post.
 */
export async function notifyChallenge(
  prisma: PrismaClient,
  studentId: number,
  opts: NotifyOptions,
): Promise<boolean> {
  try {
    const kind = opts.cycleKind || 'WEEK';
    const cycleStart = cycleStartFor(kind);

    let row: any = await (prisma as any).studentChallengeThread.findUnique({
      where: { studentId_cycleStart: { studentId, cycleStart } },
    });

    // One-shot guard
    if (opts.setOnceFlag && row?.[opts.setOnceFlag]) return false;

    // Header line common to parent + replies — keeps the title visible even
    // when the channel collapses threads.
    const header = `*${opts.title}*`;
    const text = `${header}\n${opts.body}`;

    // Existing thread → reply.
    if (row?.threadTs) {
      const r = await postSlackMessage({
        channel: row.channel,
        text,
        thread_ts: row.threadTs,
      });
      if (r.ok && opts.setOnceFlag) {
        await (prisma as any).studentChallengeThread.update({
          where: { id: row.id },
          data: { [opts.setOnceFlag]: true } as any,
        });
      }
      return r.ok;
    }

    // No thread yet → post the parent ("New challenge run – name") and then
    // the caller's event as the first reply, so the parent reads as a header.
    const stu: any = await prisma.student.findUnique({
      where: { id: studentId },
      select: { firstName: true, lastName: true } as any,
    });
    const fullName = [stu?.firstName, stu?.lastName].filter(Boolean).join(' ').trim() || `Student #${studentId}`;
    const cycleLabel = cycleStart.toISOString().slice(0, 10);
    const parent = await postSlackMessage({
      text: [
        `${kellyMention()} 🎯 *New challenge run* – *${fullName}*`,
        `Cycle: ${kind} starting ${cycleLabel}`,
        `Replies below as each badge progresses.`,
      ].join('\n'),
    });
    if (!parent.ok || !parent.ts || !parent.channel) return false;

    row = await (prisma as any).studentChallengeThread.create({
      data: {
        studentId,
        cycleStart,
        cycleKind: kind,
        channel: parent.channel,
        threadTs: parent.ts,
      } as any,
    });

    const reply = await postSlackMessage({
      channel: parent.channel,
      text,
      thread_ts: parent.ts,
    });
    if (reply.ok && opts.setOnceFlag) {
      await (prisma as any).studentChallengeThread.update({
        where: { id: row.id },
        data: { [opts.setOnceFlag]: true } as any,
      });
    }
    return reply.ok;
  } catch (e) {
    console.error('[challenge-notify] failed:', (e as Error).message);
    return false;
  }
}
