import { describe, expect, it } from 'vitest';
import { emailJobId } from '../src/queue/queue.types.js';
describe('scheduler job identity', () => { it('uses a deterministic BullMQ-safe id per database email', () => { expect(emailJobId('email-123')).toBe('email-email-123'); expect(emailJobId('email-123')).toBe(emailJobId('email-123')); }); });