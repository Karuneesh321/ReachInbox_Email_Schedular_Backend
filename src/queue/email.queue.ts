import { Queue } from 'bullmq';
import { createRedisConnection } from '../config/redis.js';
import { emailJobId, type EmailJob } from './queue.types.js';
export { emailJobId } from './queue.types.js';
export const emailQueue = new Queue<EmailJob>('email-scheduler', { connection: createRedisConnection(), defaultJobOptions: { attempts: 3, backoff: { type: 'exponential', delay: 5000 }, removeOnComplete: 1000, removeOnFail: 1000 } });
export const enqueueEmail = (emailId: string, scheduledAt: Date) => emailQueue.add('send-email', { emailId }, { jobId: emailJobId(emailId), delay: Math.max(0, scheduledAt.getTime() - Date.now()) });