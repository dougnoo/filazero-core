import { DefaultAlertDeduplicationPolicy } from './alert-deduplication.policy';

describe('DefaultAlertDeduplicationPolicy', () => {
  it('should return a date 24 hours before the reference date', () => {
    const policy = new DefaultAlertDeduplicationPolicy();
    const referenceDate = new Date('2026-03-04T12:00:00.000Z');

    const since = policy.getSinceDate(referenceDate);

    expect(since.toISOString()).toBe('2026-03-03T12:00:00.000Z');
  });

  it('should return a valid date when no reference date is provided', () => {
    const policy = new DefaultAlertDeduplicationPolicy();

    const since = policy.getSinceDate();

    expect(since).toBeInstanceOf(Date);
    expect(Number.isNaN(since.getTime())).toBe(false);
  });
});
