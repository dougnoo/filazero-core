import { Injectable } from '@nestjs/common';

export interface IAlertDeduplicationPolicy {
  getSinceDate(referenceDate?: Date): Date;
}

export const ALERT_DEDUPLICATION_POLICY_TOKEN = Symbol(
  'IAlertDeduplicationPolicy',
);

@Injectable()
export class DefaultAlertDeduplicationPolicy
  implements IAlertDeduplicationPolicy
{
  private static readonly DEDUPLICATION_WINDOW_HOURS = 24;

  getSinceDate(referenceDate: Date = new Date()): Date {
    const since = new Date(referenceDate);
    since.setHours(
      since.getHours() - DefaultAlertDeduplicationPolicy.DEDUPLICATION_WINDOW_HOURS,
    );
    return since;
  }
}
