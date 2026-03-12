import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateTimelineEventsTable1780000000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "timeline_event_type_enum" AS ENUM (
        'DOCUMENT_UPLOADED',
        'DOCUMENT_DELETED',
        'VACCINATION',
        'LAB_EXAM',
        'IMAGING_EXAM',
        'MEDICAL_REPORT',
        'PRESCRIPTION',
        'MEDICAL_APPOINTMENT'
      );
    `);

    await queryRunner.query(`
      CREATE TYPE "timeline_event_category_enum" AS ENUM (
        'DOCUMENT',
        'HEALTH',
        'ALERT'
      );
    `);

    await queryRunner.createTable(
      new Table({
        name: 'timeline_events',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'tenant_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'member_user_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'event_type',
            type: 'timeline_event_type_enum',
            isNullable: false,
          },
          {
            name: 'category',
            type: 'timeline_event_category_enum',
            isNullable: false,
          },
          {
            name: 'title',
            type: 'varchar',
            length: '200',
            isNullable: false,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'event_date',
            type: 'date',
            isNullable: false,
          },
          {
            name: 'entity_type',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'entity_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'metadata',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp with time zone',
            default: 'now()',
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'timeline_events',
      new TableIndex({
        name: 'IDX_timeline_events_tenant_member_date',
        columnNames: ['tenant_id', 'member_user_id', 'event_date'],
      }),
    );

    await queryRunner.createIndex(
      'timeline_events',
      new TableIndex({
        name: 'IDX_timeline_events_tenant_member_type',
        columnNames: ['tenant_id', 'member_user_id', 'event_type'],
      }),
    );

    await queryRunner.createIndex(
      'timeline_events',
      new TableIndex({
        name: 'IDX_timeline_events_entity',
        columnNames: ['entity_type', 'entity_id'],
      }),
    );

    await queryRunner.createIndex(
      'timeline_events',
      new TableIndex({
        name: 'IDX_timeline_events_member_user_id',
        columnNames: ['member_user_id'],
      }),
    );

    await queryRunner.createForeignKey(
      'timeline_events',
      new TableForeignKey({
        name: 'FK_timeline_events_tenant',
        columnNames: ['tenant_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'tenants',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'timeline_events',
      new TableForeignKey({
        name: 'FK_timeline_events_member',
        columnNames: ['member_user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('timeline_events', 'FK_timeline_events_member');
    await queryRunner.dropForeignKey('timeline_events', 'FK_timeline_events_tenant');

    await queryRunner.dropIndex('timeline_events', 'IDX_timeline_events_member_user_id');
    await queryRunner.dropIndex('timeline_events', 'IDX_timeline_events_entity');
    await queryRunner.dropIndex('timeline_events', 'IDX_timeline_events_tenant_member_type');
    await queryRunner.dropIndex('timeline_events', 'IDX_timeline_events_tenant_member_date');

    await queryRunner.dropTable('timeline_events');
    await queryRunner.query('DROP TYPE "timeline_event_category_enum";');
    await queryRunner.query('DROP TYPE "timeline_event_type_enum";');
  }
}
