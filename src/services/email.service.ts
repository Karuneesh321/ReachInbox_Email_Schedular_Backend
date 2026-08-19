import nodemailer from 'nodemailer';
import { prisma } from '../config/database.js';
import { env } from '../config/env.js';
import { enqueueEmail } from '../queue/email.queue.js';
import { emailSchema, normalizeRecipients } from '../utils/email-validator.js';
import { reserveSenderSlot } from './rate-limit.service.js';
import { logger } from '../utils/logger.js';

export type ScheduleInput = { subject: string; body: string; recipients: string[]; startTime: Date; delaySeconds: number; hourlyLimit: number };
export async function ensureSender() {
  const existing = await prisma.sender.findFirst();
  return existing ?? prisma.sender.create({ data: { name: 'Ethereal Sender', email: env.ETHEREAL_USERNAME || 'sender@example.com', etherealUsername: env.ETHEREAL_USERNAME, etherealPassword: env.ETHEREAL_PASSWORD } });
}
export async function scheduleCampaign(userId: string, input: ScheduleInput) {
  const recipients = normalizeRecipients(input.recipients); const invalid = recipients.filter((recipient) => !emailSchema.safeParse(recipient).success);
  if (!recipients.length || invalid.length) throw new Error('Invalid email addresses');
  const sender = await ensureSender();
  const campaign = await prisma.campaign.create({ data: { userId, subject: input.subject, body: input.body, startTime: input.startTime, delaySeconds: input.delaySeconds, hourlyLimit: input.hourlyLimit, emails: { create: recipients.map((recipient, index) => ({ senderId: sender.id, recipient, subject: input.subject, body: input.body, scheduledAt: new Date(input.startTime.getTime() + index * input.delaySeconds * 1000) })) } }, include: { emails: true } });
  await Promise.all(campaign.emails.map((email) => enqueueEmail(email.id, email.scheduledAt)));
  return campaign;
}
export async function processEmail(emailId: string) {
  const email = await prisma.email.findUnique({ where: { id: emailId }, include: { sender: true, campaign: true } });
  if (!email || email.status === 'SENT' || email.status === 'FAILED') return;
  const claimed = await prisma.email.updateMany({ where: { id: emailId, status: 'SCHEDULED' }, data: { status: 'PROCESSING', attempts: { increment: 1 } } });
  if (!claimed.count) return;
  const limit = await reserveSenderSlot(email.senderId, email.campaign.hourlyLimit);
  if (!limit.allowed) { await prisma.email.update({ where: { id: emailId }, data: { status: 'SCHEDULED' } }); await enqueueEmail(emailId, limit.retryAt!); logger.info('job-rescheduled-rate-limit', { emailId }); return; }
  try {
    const transport = nodemailer.createTransport({ host: env.ETHEREAL_HOST, port: env.ETHEREAL_PORT, secure: env.ETHEREAL_PORT === 465, auth: { user: email.sender.etherealUsername, pass: email.sender.etherealPassword } });
    const result = await transport.sendMail({ from: email.sender.email, to: email.recipient, subject: email.subject, text: email.body });
    await prisma.email.update({ where: { id: emailId }, data: { status: 'SENT', sentAt: new Date(), messageId: result.messageId, previewUrl: nodemailer.getTestMessageUrl(result) || null } });
    logger.info('email-sent', { emailId });
  } catch (error) {
    const current = await prisma.email.findUnique({ where: { id: emailId }, select: { attempts: true } });
    await prisma.email.update({ where: { id: emailId }, data: { status: current && current.attempts >= 3 ? 'FAILED' : 'SCHEDULED', lastError: error instanceof Error ? error.message : 'Email delivery failed' } });
    throw error;
  }
}