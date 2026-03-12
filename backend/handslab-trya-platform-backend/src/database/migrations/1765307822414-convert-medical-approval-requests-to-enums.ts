import { MigrationInterface, QueryRunner } from 'typeorm';

export class ConvertMedicalApprovalRequestsToEnums1765307822414 implements MigrationInterface {
  name = 'ConvertMedicalApprovalRequestsToEnums1765307822414';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop existing constraints and indexes
    await queryRunner.query(
      `ALTER TABLE "platform_dev"."medical_approval_requests" DROP CONSTRAINT IF EXISTS "chk_status"`,
    );
    await queryRunner.query(
      `ALTER TABLE "platform_dev"."medical_approval_requests" DROP CONSTRAINT IF EXISTS "chk_urgency"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "platform_dev"."idx_mar_status"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "platform_dev"."idx_mar_urgency"`,
    );

    // Convert status column to enum
    await queryRunner.query(
      `ALTER TABLE "platform_dev"."medical_approval_requests" DROP COLUMN IF EXISTS "status"`,
    );
    await queryRunner.query(
      `DO $$ BEGIN CREATE TYPE "platform_dev"."medical_approval_requests_status_enum" AS ENUM('PENDING', 'IN_REVIEW', 'APPROVED', 'ADJUSTED'); EXCEPTION WHEN duplicate_object THEN null; END $$;`,
    );
    await queryRunner.query(
      `ALTER TABLE "platform_dev"."medical_approval_requests" ADD COLUMN IF NOT EXISTS "status" "platform_dev"."medical_approval_requests_status_enum" NOT NULL DEFAULT 'PENDING'`,
    );

    // Convert urgency_level column to enum
    await queryRunner.query(
      `ALTER TABLE "platform_dev"."medical_approval_requests" DROP COLUMN IF EXISTS "urgency_level"`,
    );
    await queryRunner.query(
      `DO $$ BEGIN CREATE TYPE "platform_dev"."medical_approval_requests_urgency_level_enum" AS ENUM('EMERGENCY', 'VERY_URGENT', 'URGENT', 'STANDARD', 'NON_URGENT'); EXCEPTION WHEN duplicate_object THEN null; END $$;`,
    );
    await queryRunner.query(
      `ALTER TABLE "platform_dev"."medical_approval_requests" ADD COLUMN IF NOT EXISTS "urgency_level" "platform_dev"."medical_approval_requests_urgency_level_enum" NOT NULL DEFAULT 'STANDARD'`,
    );

    // Recreate indexes
    await queryRunner.query(
      `CREATE INDEX "idx_mar_status" ON "platform_dev"."medical_approval_requests" ("status")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_mar_urgency" ON "platform_dev"."medical_approval_requests" ("urgency_level")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(
      `DROP INDEX IF EXISTS "platform_dev"."idx_mar_status"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "platform_dev"."idx_mar_urgency"`,
    );

    // Convert status back to varchar
    await queryRunner.query(
      `ALTER TABLE "platform_dev"."medical_approval_requests" DROP COLUMN "status"`,
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS "platform_dev"."medical_approval_requests_status_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "platform_dev"."medical_approval_requests" ADD "status" character varying(50) NOT NULL DEFAULT 'PENDING'`,
    );

    // Convert urgency_level back to varchar
    await queryRunner.query(
      `ALTER TABLE "platform_dev"."medical_approval_requests" DROP COLUMN "urgency_level"`,
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS "platform_dev"."medical_approval_requests_urgency_level_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "platform_dev"."medical_approval_requests" ADD "urgency_level" character varying(50) NOT NULL DEFAULT 'STANDARD'`,
    );

    // Recreate original constraints
    await queryRunner.query(
      `ALTER TABLE "platform_dev"."medical_approval_requests" ADD CONSTRAINT "chk_status" CHECK (((status)::text = ANY ((ARRAY['PENDING'::character varying, 'IN_REVIEW'::character varying, 'APPROVED'::character varying, 'ADJUSTED'::character varying])::text[])))`,
    );
    await queryRunner.query(
      `ALTER TABLE "platform_dev"."medical_approval_requests" ADD CONSTRAINT "chk_urgency" CHECK (((urgency_level)::text = ANY ((ARRAY['EMERGENCY'::character varying, 'VERY_URGENT'::character varying, 'URGENT'::character varying, 'STANDARD'::character varying, 'NON_URGENT'::character varying])::text[])))`,
    );

    // Recreate indexes
    await queryRunner.query(
      `CREATE INDEX "idx_mar_status" ON "platform_dev"."medical_approval_requests" ("status")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_mar_urgency" ON "platform_dev"."medical_approval_requests" ("urgency_level")`,
    );
  }
}
