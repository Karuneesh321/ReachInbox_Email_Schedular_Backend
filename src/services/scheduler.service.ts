import { prisma } from '../config/database.js';
import { enqueueEmail } from '../queue/email.queue.js';
import { logger } from '../utils/logger.js';

export async function recoverScheduledEmails() {
  const emails = await prisma.email.findMany({ where: { status: 'SCHEDULED' }, select: { id: true, scheduledAt: true } });
  await Promise.all(emails.map((email) => enqueueEmail(email.id, email.scheduledAt)));
  if (emails.length) logger.info('scheduled-jobs-recovered', { count: emails.length });
}