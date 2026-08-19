import { z } from 'zod';
export const emailSchema = z.string().trim().email();
export const normalizeRecipients = (recipients: string[]) => [...new Set(recipients.map((value) => value.trim().toLowerCase()))];