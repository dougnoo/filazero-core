import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAlertTypesToTimelineEventTypeEnum1741150800000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add new enum values for alert types
    // Note: In PostgreSQL, we can't directly modify existing ENUMs, so we need to:
    // 1. Create a new enum type with all values (old + new)
    // 2. Cast all columns to the new type
    // 3. Drop the old enum

    // Create the new enum with all values
    await queryRunner.query(`
      CREATE TYPE "timeline_event_type_enum_new" AS ENUM (
        'DOCUMENT_UPLOADED',
        'DOCUMENT_DELETED',
        'DOCUMENT_EXPIRING',
        'DOCUMENT_EXPIRED',
        'VACCINATION',
        'LAB_EXAM',
        'IMAGING_EXAM',
        'MEDICAL_REPORT',
        'PRESCRIPTION',
        'MEDICAL_APPOINTMENT',
        'MISSING_VACCINATION',
        'MISSING_EXAM'
      );
    `);

    // Alter the column to use the new enum type
    await queryRunner.query(`
      ALTER TABLE "timeline_events"
      ALTER COLUMN "event_type" TYPE "timeline_event_type_enum_new"
      USING "event_type"::text::"timeline_event_type_enum_new";
    `);

    // Drop the old enum
    await queryRunner.query(`DROP TYPE "timeline_event_type_enum";`);

    // Rename the new enum to the original name
    await queryRunner.query(`
      ALTER TYPE "timeline_event_type_enum_new"
      RENAME TO "timeline_event_type_enum";
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert the changes: create the old enum
    await queryRunner.query(`
      CREATE TYPE "timeline_event_type_enum_new" AS ENUM (
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

    // Alter the column back to the old enum type (only keep values that exist in old enum)
    await queryRunner.query(`
      ALTER TABLE "timeline_events"
      ALTER COLUMN "event_type" TYPE "timeline_event_type_enum_new"
      USING CASE
        WHEN "event_type" IN ('DOCUMENT_EXPIRING', 'DOCUMENT_EXPIRED', 'MISSING_VACCINATION', 'MISSING_EXAM')
        THEN 'DOCUMENT_UPLOADED'::text
        ELSE "event_type"::text
      END::"timeline_event_type_enum_new";
    `);

    // Drop the new enum
    await queryRunner.query(`DROP TYPE "timeline_event_type_enum";`);

    // Rename back to original
    await queryRunner.query(`
      ALTER TYPE "timeline_event_type_enum_new"
      RENAME TO "timeline_event_type_enum";
    `);
  }
}
