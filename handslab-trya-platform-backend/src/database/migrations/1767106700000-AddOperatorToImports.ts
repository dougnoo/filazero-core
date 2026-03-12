import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOperatorToImports1767106700000 implements MigrationInterface {
  name = 'AddOperatorToImports1767106700000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const schema = process.env.DB_SCHEMA || 'public';

    // Add operator_id column
    await queryRunner.query(`
      ALTER TABLE "${schema}"."imports" 
      ADD COLUMN "operator_id" UUID
    `);

    // Add operator_name column
    await queryRunner.query(`
      ALTER TABLE "${schema}"."imports" 
      ADD COLUMN "operator_name" VARCHAR(255)
    `);

    // Create index on operator_id for faster queries
    await queryRunner.query(`
      CREATE INDEX "idx_imports_operator_id" ON "${schema}"."imports" ("operator_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const schema = process.env.DB_SCHEMA || 'public';

    await queryRunner.query(`
      DROP INDEX IF EXISTS "${schema}"."idx_imports_operator_id"
    `);

    await queryRunner.query(`
      ALTER TABLE "${schema}"."imports" 
      DROP COLUMN IF EXISTS "operator_name"
    `);

    await queryRunner.query(`
      ALTER TABLE "${schema}"."imports" 
      DROP COLUMN IF EXISTS "operator_id"
    `);
  }
}
