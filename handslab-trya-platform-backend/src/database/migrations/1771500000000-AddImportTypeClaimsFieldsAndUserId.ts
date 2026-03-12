import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddImportTypeClaimsFieldsAndUserId1771500000000
  implements MigrationInterface
{
  name = 'AddImportTypeClaimsFieldsAndUserId1771500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const schema = process.env.DB_SCHEMA || 'public';

    // Add import_type column to distinguish between provider and claim imports
    await queryRunner.query(`
      ALTER TABLE "${schema}"."imports"
      ADD COLUMN "import_type" VARCHAR(50) NOT NULL DEFAULT 'provider'
    `);

    // Add index for import_type
    await queryRunner.query(`
      CREATE INDEX "idx_imports_type" ON "${schema}"."imports" ("import_type")
    `);

    // Add claims-specific columns
    await queryRunner.query(`
      ALTER TABLE "${schema}"."imports"
      ADD COLUMN "imported_claims" INT DEFAULT 0,
      ADD COLUMN "matched_claims" INT DEFAULT 0,
      ADD COLUMN "unmatched_claims" INT DEFAULT 0,
      ADD COLUMN "avg_match_confidence" DECIMAL(5,2) DEFAULT 0
    `);

    // Add user_id column to track who performed the import
    await queryRunner.query(`
      ALTER TABLE "${schema}"."imports"
      ADD COLUMN "user_id" UUID
    `);

    // Add foreign key constraint to users table
    await queryRunner.query(`
      ALTER TABLE "${schema}"."imports"
      ADD CONSTRAINT "fk_imports_user"
      FOREIGN KEY ("user_id")
      REFERENCES "${schema}"."users"("id")
      ON DELETE SET NULL
    `);

    // Add index for user_id
    await queryRunner.query(`
      CREATE INDEX "idx_imports_user_id" ON "${schema}"."imports" ("user_id")
    `);

    // Update existing records to have import_type = 'provider'
    await queryRunner.query(`
      UPDATE "${schema}"."imports"
      SET "import_type" = 'provider'
      WHERE "import_type" IS NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const schema = process.env.DB_SCHEMA || 'public';

    // Remove user_id index
    await queryRunner.query(`
      DROP INDEX IF EXISTS "${schema}"."idx_imports_user_id"
    `);

    // Remove foreign key
    await queryRunner.query(`
      ALTER TABLE "${schema}"."imports"
      DROP CONSTRAINT IF EXISTS "fk_imports_user"
    `);

    // Remove user_id column
    await queryRunner.query(`
      ALTER TABLE "${schema}"."imports"
      DROP COLUMN IF EXISTS "user_id"
    `);

    // Remove claims-specific columns
    await queryRunner.query(`
      ALTER TABLE "${schema}"."imports"
      DROP COLUMN IF EXISTS "avg_match_confidence",
      DROP COLUMN IF EXISTS "unmatched_claims",
      DROP COLUMN IF EXISTS "matched_claims",
      DROP COLUMN IF EXISTS "imported_claims"
    `);

    // Remove index
    await queryRunner.query(`
      DROP INDEX IF EXISTS "${schema}"."idx_imports_type"
    `);

    // Remove import_type column
    await queryRunner.query(`
      ALTER TABLE "${schema}"."imports"
      DROP COLUMN IF EXISTS "import_type"
    `);
  }
}
