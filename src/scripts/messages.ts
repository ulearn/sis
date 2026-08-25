/**
 * Student in-app messages (the student-portal inbox).
 *
 * A StudentMessage row is created only when staff tick the "Student app"
 * channel in the comms composer — it is NOT a mirror of every email. The
 * staff send path (routes/email.ts) calls postToApp(); the student portal
 * (routes/student.ts) reads via listForStudent/unreadCount and clears the
 * bell badge via markRead/markAllRead.
 */
import type { PrismaClient } from '../generated/prisma/client';
import { pushScripts, stripHtml } from './push';

export function messageScripts(prisma: PrismaClient) {
  return {
    /** Drop a message into a student's in-app inbox (+ fire a native push). */
    async postToApp(opts: {
      studentId: number;
      subject: string;
      bodyHtml: string;
      sentBy?: string | null;
      emailLogId?: number | null;
    }) {
      const m = await prisma.studentMessage.create({
        data: {
          studentId:  opts.studentId,
          subject:    opts.subject,
          bodyHtml:   opts.bodyHtml,
          sentBy:     opts.sentBy ?? null,
          emailLogId: opts.emailLogId ?? null,
        },
      });
      // Native push mirrors the in-app bell — folded here so EVERY in-app message
      // buzzes the phone, tap opens the inbox. Best-effort: sendToStudent never
      // throws, and is a silent no-op until the Firebase key is present.
      await pushScripts(prisma).sendToStudent(opts.studentId, {
        title: opts.subject,
        body:  stripHtml(opts.bodyHtml),
        data:  { type: 'inapp', messageId: String(m.id) },
      });
      return m;
    },

    /** Newest-first list for the inbox drawer. */
    async listForStudent(studentId: number, take = 50) {
      return prisma.studentMessage.findMany({
        where: { studentId },
        orderBy: { createdAt: 'desc' },
        take,
        select: { id: true, subject: true, bodyHtml: true, sentBy: true, createdAt: true, readAt: true },
      });
    },

    /** Unread count drives the bell badge. */
    async unreadCount(studentId: number) {
      return prisma.studentMessage.count({ where: { studentId, readAt: null } });
    },

    /** Mark one message read (scoped to the student so they can't read others'). */
    async markRead(studentId: number, id: number) {
      const r = await prisma.studentMessage.updateMany({
        where: { id, studentId, readAt: null },
        data: { readAt: new Date() },
      });
      return r.count > 0;
    },

    /** Clear the whole badge in one go. */
    async markAllRead(studentId: number) {
      const r = await prisma.studentMessage.updateMany({
        where: { studentId, readAt: null },
        data: { readAt: new Date() },
      });
      return r.count;
    },
  };
}
