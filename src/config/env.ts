import 'dotenv/config';
import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(5000), DATABASE_URL: z.string().default('postgresql://postgres:postgres@localhost:5432/reachinbox'),
  REDIS_HOST: z.string().default('localhost'), REDIS_PORT: z.coerce.number().default(6379),
  GOOGLE_CLIENT_ID: z.string().default(''), GOOGLE_CLIENT_SECRET: z.string().default(''), GOOGLE_CALLBACK_URL: z.string().default('http://localhost:5000/api/auth/google/callback'),
  SESSION_SECRET: z.string().default('development-only-secret'), FRONTEND_URL: z.string().default('http://localhost:5173'),
  ETHEREAL_HOST: z.string().default('smtp.ethereal.email'), ETHEREAL_PORT: z.coerce.number().default(587), ETHEREAL_USERNAME: z.string().default(''), ETHEREAL_PASSWORD: z.string().default(''),
  WORKER_CONCURRENCY: z.coerce.number().int().positive().default(5), MIN_EMAIL_DELAY_MS: z.coerce.number().int().nonnegative().default(2000), MAX_EMAILS_PER_HOUR: z.coerce.number().int().positive().default(200)
});
export const env = schema.parse(process.env);