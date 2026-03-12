import { MigrationInterface, QueryRunner } from 'typeorm';

export class SimplifyHealthcareClaims1770500000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop old indexes if they exist
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_healthcare_claims_operator_id"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_healthcare_claims_specialty"`,
    );
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_healthcare_claims_city"`);
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_healthcare_claims_procedure_code"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_healthcare_claims_service_date"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_healthcare_claims_service_type"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_59ccf2656dc6549f1da0053d20"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_93ee75e2c434d6394a837480c1"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_3dddd80d12eeb09512ebd1ceeb"`,
    );

    // Drop old columns from previous migration
    await queryRunner.query(`
      ALTER TABLE "healthcare_claims"
        DROP COLUMN IF EXISTS "operator_id",
        DROP COLUMN IF EXISTS "provider_name_raw",
        DROP COLUMN IF EXISTS "user_code",
        DROP COLUMN IF EXISTS "user_name_hash",
        DROP COLUMN IF EXISTS "birth_date",
        DROP COLUMN IF EXISTS "gender",
        DROP COLUMN IF EXISTS "procedure_code",
        DROP COLUMN IF EXISTS "procedure_description",
        DROP COLUMN IF EXISTS "service_type",
        DROP COLUMN IF EXISTS "icd_code",
        DROP COLUMN IF EXISTS "icd_description",
        DROP COLUMN IF EXISTS "service_date",
        DROP COLUMN IF EXISTS "approval_date",
        DROP COLUMN IF EXISTS "quantity",
        DROP COLUMN IF EXISTS "city",
        DROP COLUMN IF EXISTS "state",
        DROP COLUMN IF EXISTS "payment_status",
        DROP COLUMN IF EXISTS "reimbursement_amount",
        DROP COLUMN IF EXISTS "notes"
    `);

    // Add new simplified columns
    await queryRunner.query(`
      ALTER TABLE "healthcare_claims"
        ADD COLUMN IF NOT EXISTS "operator_name" VARCHAR(200) NOT NULL DEFAULT '',
        ADD COLUMN IF NOT EXISTS "network_name" VARCHAR(200) NOT NULL DEFAULT '',
        ADD COLUMN IF NOT EXISTS "provider_name" VARCHAR(500) NOT NULL DEFAULT '',
        ADD COLUMN IF NOT EXISTS "specialty" VARCHAR(200) NOT NULL DEFAULT ''
    `);

    // Ensure other columns exist (they should from previous migration)
    await queryRunner.query(`
      ALTER TABLE "healthcare_claims"
        ADD COLUMN IF NOT EXISTS "claim_value" DECIMAL(15,4) NOT NULL DEFAULT 0,
        ADD COLUMN IF NOT EXISTS "provider_id" uuid,
        ADD COLUMN IF NOT EXISTS "matching_confidence" DECIMAL(5,2),
        ADD COLUMN IF NOT EXISTS "import_batch_id" uuid
    `);

    // Create new indexes
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_healthcare_claims_provider_id" ON "healthcare_claims" ("provider_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_healthcare_claims_operator_name" ON "healthcare_claims" ("operator_name")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_healthcare_claims_specialty" ON "healthcare_claims" ("specialty")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop new columns and indexes
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_healthcare_claims_operator_name"`,
    );

    await queryRunner.query(`
      ALTER TABLE "healthcare_claims"
        DROP COLUMN IF EXISTS "operator_name",
        DROP COLUMN IF EXISTS "network_name",
        DROP COLUMN IF EXISTS "provider_name",
        DROP COLUMN IF EXISTS "specialty"
    `);

    // Restore old columns
    await queryRunner.query(`
      ALTER TABLE "healthcare_claims"
        ADD COLUMN "operator_id" UUID,
        ADD COLUMN "provider_name_raw" VARCHAR(500) NOT NULL DEFAULT '',
        ADD COLUMN "user_code" VARCHAR(50),
        ADD COLUMN "user_name_hash" VARCHAR(64),
        ADD COLUMN "birth_date" DATE,
        ADD COLUMN "gender" VARCHAR(50),
        ADD COLUMN "procedure_code" VARCHAR(50) NOT NULL DEFAULT '',
        ADD COLUMN "procedure_description" TEXT,
        ADD COLUMN "specialty" VARCHAR(200) NOT NULL DEFAULT '',
        ADD COLUMN "service_type" VARCHAR(100) NOT NULL DEFAULT '',
        ADD COLUMN "icd_code" VARCHAR(20),
        ADD COLUMN "icd_description" TEXT,
        ADD COLUMN "quantity" INTEGER NOT NULL DEFAULT 1,
        ADD COLUMN "service_date" DATE NOT NULL DEFAULT CURRENT_DATE,
        ADD COLUMN "city" VARCHAR(100) NOT NULL DEFAULT '',
        ADD COLUMN "state" VARCHAR(2) NOT NULL DEFAULT '',
        ADD COLUMN "provider_type" VARCHAR(100)
    `);

    // Restore old indexes
    await queryRunner.query(
      `CREATE INDEX "IDX_healthcare_claims_operator_id" ON "healthcare_claims" ("operator_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_healthcare_claims_specialty" ON "healthcare_claims" ("specialty")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_healthcare_claims_city" ON "healthcare_claims" ("city")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_healthcare_claims_procedure_code" ON "healthcare_claims" ("procedure_code")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_healthcare_claims_service_date" ON "healthcare_claims" ("service_date")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_healthcare_claims_service_type" ON "healthcare_claims" ("service_type")`,
    );
  }
}
