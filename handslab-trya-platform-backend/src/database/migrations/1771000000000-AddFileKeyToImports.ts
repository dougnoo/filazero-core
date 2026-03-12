import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFileKeyToImports1771000000000 implements MigrationInterface {
  name = 'AddFileKeyToImports1771000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const schema = process.env.DB_SCHEMA || 'public';

    await queryRunner.query(`
      ALTER TABLE "${schema}"."imports" 
      ADD COLUMN IF NOT EXISTS "file_key" VARCHAR(500) NULL
    `);

    await queryRunner.query(`
      COMMENT ON COLUMN "${schema}"."imports"."file_key" IS 'S3 key/path where the import file is stored'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const schema = process.env.DB_SCHEMA || 'public';

    await queryRunner.query(`
      ALTER TABLE "${schema}"."imports" 
      DROP COLUMN IF EXISTS "file_key"
    `);
  }
}
