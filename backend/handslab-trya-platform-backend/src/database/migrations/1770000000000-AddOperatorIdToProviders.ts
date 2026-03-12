import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOperatorIdToProviders1770000000000 implements MigrationInterface {
  name = 'AddOperatorIdToProviders1770000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const schema = process.env.DB_SCHEMA || 'public';

    // Add operator_id column to providers table
    await queryRunner.query(`
      ALTER TABLE "${schema}"."providers" 
      ADD COLUMN IF NOT EXISTS "operator_id" UUID
    `);

    // Create index on operator_id for faster queries
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_providers_operator_id" ON "${schema}"."providers" ("operator_id")
    `);

    // Drop old unique constraint (name, location_hash)
    await queryRunner.query(`
      ALTER TABLE "${schema}"."providers" 
      DROP CONSTRAINT IF EXISTS "providers_name_location_hash_key"
    `);

    // Also try dropping with the index naming pattern
    await queryRunner.query(`
      DROP INDEX IF EXISTS "${schema}"."IDX_providers_name_location_hash"
    `);

    // Drop any existing unique index on name+location_hash
    await queryRunner.query(`
      DROP INDEX IF EXISTS "${schema}"."IDX_2de7e6e06c8ce8b6d3f6a4a6c8"
    `);

    // Create new unique constraint including operator_id (name, location_hash, operator_id)
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "idx_providers_name_location_operator" 
      ON "${schema}"."providers" ("name", "location_hash", "operator_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const schema = process.env.DB_SCHEMA || 'public';

    // Drop new unique index
    await queryRunner.query(`
      DROP INDEX IF EXISTS "${schema}"."idx_providers_name_location_operator"
    `);

    // Recreate old unique constraint
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "providers_name_location_hash_key" 
      ON "${schema}"."providers" ("name", "location_hash")
    `);

    // Drop operator_id index
    await queryRunner.query(`
      DROP INDEX IF EXISTS "${schema}"."idx_providers_operator_id"
    `);

    // Remove operator_id column
    await queryRunner.query(`
      ALTER TABLE "${schema}"."providers" 
      DROP COLUMN IF EXISTS "operator_id"
    `);
  }
}
