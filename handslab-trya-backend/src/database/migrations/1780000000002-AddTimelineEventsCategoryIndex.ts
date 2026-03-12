import { MigrationInterface, QueryRunner, TableIndex } from 'typeorm';

export class AddTimelineEventsCategoryIndex1780000000002
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add index on category for faster filtering of ALERT events
    await queryRunner.createIndex(
      'timeline_events',
      new TableIndex({
        name: 'IDX_timeline_events_tenant_member_category',
        columnNames: ['tenant_id', 'member_user_id', 'category'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex(
      'timeline_events',
      'IDX_timeline_events_tenant_member_category',
    );
  }
}
