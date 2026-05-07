import { formatDate, formatPhoneNumber, formatStatus } from './formatters';

describe('formatters', () => {
  it('formats date in fr-FR style', () => {
    const date = new Date('2026-05-07T00:00:00.000Z');
    expect(formatDate(date)).toMatch(/\d{2}\/\d{2}\/\d{4}/);
  });

  it('formats status label', () => {
    expect(formatStatus('pending')).toBe('Pending');
    expect(formatStatus(' VALIDATED ')).toBe('Validated');
    expect(formatStatus('   ')).toBe('');
  });

  it('formats french phone number from E.164', () => {
    expect(formatPhoneNumber('+33612345678')).toBe('06 12 34 56 78');
    expect(formatPhoneNumber('+12025550123')).toBe('+12025550123');
    expect(formatPhoneNumber('')).toBe('');
    expect(formatPhoneNumber('abc-def')).toBe('abc-def');
    expect(formatPhoneNumber('+331234567890')).toBe('+331234567890');
  });
});
