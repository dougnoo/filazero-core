import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveMemedTokenColumn1766600000000 implements MigrationInterface {
  name = 'RemoveMemedTokenColumn1766600000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const schema = process.env.DB_SCHEMA || 'public';
    // Drop index on memed_token first
    await queryRunner.query(`
      DROP INDEX IF EXISTS "${schema}"."idx_prescriptions_memed_token"
    `);

    // Remove unique constraint on memed_token if it exists
    await queryRunner.query(`
      ALTER TABLE "${schema}"."prescriptions" 
      DROP CONSTRAINT IF EXISTS "UQ_prescriptions_memed_token"
    `);

    // Drop the memed_token column
    await queryRunner.query(`
      ALTER TABLE "${schema}"."prescriptions" 
      DROP COLUMN IF EXISTS "memed_token"
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const schema = process.env.DB_SCHEMA || 'public';
    // Add back the memed_token column
    await queryRunner.query(`
      ALTER TABLE "${schema}"."prescriptions" 
      ADD COLUMN "memed_token" varchar NOT NULL DEFAULT ''
    `);

    // Recreate the index
    await queryRunner.query(`
      CREATE INDEX "idx_prescriptions_memed_token" ON "${schema}"."prescriptions" ("memed_token")
    `);

    // Restore unique constraint on memed_token
    await queryRunner.query(`
      ALTER TABLE "${schema}"."prescriptions" 
      ADD CONSTRAINT "UQ_prescriptions_memed_token" UNIQUE ("memed_token")
    `);
  }
}
