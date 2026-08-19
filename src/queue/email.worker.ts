import { Worker } from 'bullmq';
import { createRedisConnection } from '../config/redis.js';
import { env } from '../config/env.js';
import { processEmail } from '../services/email.service.js';
import { logger } from '../utils/logger.js';
export const emailWorker = new Worker('email-scheduler', async (job) => { logger.info('job-received', { emailId: job.data.emailId }); await processEmail(job.data.emailId); }, { connection: createRedisConnection(), concurrency: env.WORKER_CONCURRENCY });
emailWorker.on('failed', (job, error) => logger.error('job-failed', { emailId: job?.data.emailId, error: error.message }));