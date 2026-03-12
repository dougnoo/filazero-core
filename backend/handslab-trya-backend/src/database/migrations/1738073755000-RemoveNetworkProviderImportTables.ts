import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveNetworkProviderImportTables1738073755000
  implements MigrationInterface
{
  name = 'RemoveNetworkProviderImportTables1738073755000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop tables related to network-provider-import module
    // This functionality was moved to platform-backend
    
    await queryRunner.query(
      `DROP TABLE IF EXISTS "network_provider_import_errors" CASCADE`,
    );
    
    await queryRunner.query(
      `DROP TABLE IF EXISTS "network_provider_imports" CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Recreate tables if needed (rollback)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "network_provider_imports" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "operator_id" uuid NOT NULL,
        "filename" varchar(255) NOT NULL,
        "file_size" int,
        "file_hash" varchar(64),
        "user_id" varchar(255),
        "total_rows" int,
        "processed_rows" int DEFAULT 0,
        "success_rows" int DEFAULT 0,
        "error_rows" int DEFAULT 0,
        "new_locations" int DEFAULT 0,
        "new_providers" int DEFAULT 0,
        "updated_providers" int DEFAULT 0,
        "new_services" int DEFAULT 0,
        "status" varchar(20) DEFAULT 'processing',
        "error_message" text,
        "started_at" timestamp DEFAULT now(),
        "completed_at" timestamp
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "network_provider_import_errors" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "import_id" uuid NOT NULL,
        "row_number" int NOT NULL,
        "error_type" varchar(50) NOT NULL,
        "error_message" text NOT NULL,
        "row_data" jsonb,
        "created_at" timestamp DEFAULT now(),
        CONSTRAINT "fk_import" FOREIGN KEY ("import_id") 
          REFERENCES "network_provider_imports"("id") ON DELETE CASCADE
      )
    `);
  }
}
