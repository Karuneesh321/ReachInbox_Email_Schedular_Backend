import { describe, expect, it } from 'vitest';
import { normalizeRecipients } from '../src/utils/email-validator.js';
describe('recipient validation helpers', () => { it('normalizes case and removes duplicates', () => { expect(normalizeRecipients([' A@Example.com ', 'a@example.com'])).toEqual(['a@example.com']); }); });