import { describe, expect, it } from 'vitest';
import { nextHourWindow } from '../src/services/rate-limit-window.js';
describe('rate limit windows', () => { it('reschedules at the next UTC hour', () => { expect(nextHourWindow(new Date('2026-08-19T14:45:12.000Z')).toISOString()).toBe('2026-08-19T15:00:00.000Z'); }); });