import type { Response } from 'express';
import { z } from 'zod';
import { prisma } from '../config/database.js';
import { env } from '../config/env.js';
import { scheduleCampaign } from '../services/email.service.js';
import { requestUserId, type AuthenticatedRequest } from '../types/index.js';
const requestSchema = z.object({ subject: z.string().trim().min(1).max(200), body: z.string().trim().min(1).max(100_000), recipients: z.array(z.string()).min(1).max(10_000), startTime: z.coerce.date(), delaySeconds: z.coerce.number().int().min(Math.ceil(env.MIN_EMAIL_DELAY_MS / 1000)), hourlyLimit: z.coerce.number().int().positive().max(env.MAX_EMAILS_PER_HOUR) });
export async function schedule(req: AuthenticatedRequest, res: Response) { const input = requestSchema.parse(req.body); const campaign = await scheduleCampaign(requestUserId(req), input); res.status(201).json({ success: true, campaignId: campaign.id, count: campaign.emails.length }); }
async function list(req: AuthenticatedRequest, res: Response, status: 'upcoming' | 'sent') { const emails = await prisma.email.findMany({ where: { status: status === 'sent' ? { in: ['SENT', 'FAILED'] } : { in: ['SCHEDULED', 'PROCESSING'] }, campaign: { userId: requestUserId(req) } }, orderBy: { scheduledAt: 'asc' }, select: { id: true, recipient: true, subject: true, scheduledAt: true, sentAt: true, status: true, previewUrl: true, lastError: true } }); res.json({ success: true, emails }); }
export const scheduled = (req: AuthenticatedRequest, res: Response) => list(req, res, 'upcoming');
export const sent = (req: AuthenticatedRequest, res: Response) => list(req, res, 'sent');
export async function detail(req: AuthenticatedRequest, res: Response) { const email = await prisma.email.findFirst({ where: { id: String(req.params.id), campaign: { userId: requestUserId(req) } } }); if (!email) return res.status(404).json({ success: false, message: 'Email not found' }); res.json({ success: true, email }); }