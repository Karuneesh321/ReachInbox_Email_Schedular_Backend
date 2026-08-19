import { redis } from '../config/redis.js';
import { nextHourWindow } from './rate-limit-window.js';
const reserveScript = `local current = redis.call('INCR', KEYS[1]); if current == 1 then redis.call('EXPIRE', KEYS[1], 7200) end; if current > tonumber(ARGV[1]) then redis.call('DECR', KEYS[1]); return 0 end; return current`;
export async function reserveSenderSlot(senderId: string, hourlyLimit: number, now = new Date()) {
  const hour = now.toISOString().slice(0, 13);
  const key = `email-rate:${senderId}:${hour}`;
  const count = Number(await redis.eval(reserveScript, 1, key, hourlyLimit));
  if (count > 0) return { allowed: true, retryAt: undefined };
  return { allowed: false, retryAt: nextHourWindow(now) };
}