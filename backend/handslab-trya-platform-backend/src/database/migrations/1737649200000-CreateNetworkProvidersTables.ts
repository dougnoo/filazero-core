import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateNetworkProvidersTables1737649200000
  implements MigrationInterface
{
  name = 'CreateNetworkProvidersTables1737649200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const schema = process.env.DB_SCHEMA || 'public';

    // Create locations table
    await queryRunner.query(`
      CREATE TABLE "${schema}"."locations" (
        "hash" VARCHAR(32) PRIMARY KEY,
        "postal_code" VARCHAR(8) NOT NULL,
        "street_type" VARCHAR(50),
        "street_name" VARCHAR(255) NOT NULL,
        "street_number" VARCHAR(20),
        "complement" VARCHAR(255),
        "neighborhood" VARCHAR(100),
        "city" VARCHAR(100) NOT NULL,
        "state" VARCHAR(2) NOT NULL,
        "full_address" TEXT NOT NULL,
        "latitude" DECIMAL(10, 8),
        "longitude" DECIMAL(11, 8),
        "geocoded_at" TIMESTAMP,
        "geocoding_status" VARCHAR(20) NOT NULL DEFAULT 'pending',
        "geocoding_attempts" INT NOT NULL DEFAULT 0,
        "geocoding_error" TEXT,
        "geocoding_provider" VARCHAR(50),
        "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_locations_postal_code" ON "${schema}"."locations" ("postal_code")
    `);
    await queryRunner.query(`
      CREATE INDEX "idx_locations_city" ON "${schema}"."locations" ("city")
    `);
    await queryRunner.query(`
      CREATE INDEX "idx_locations_state" ON "${schema}"."locations" ("state")
    `);
    await queryRunner.query(`
      CREATE INDEX "idx_locations_latitude" ON "${schema}"."locations" ("latitude")
    `);
    await queryRunner.query(`
      CREATE INDEX "idx_locations_longitude" ON "${schema}"."locations" ("longitude")
    `);
    await queryRunner.query(`
      CREATE INDEX "idx_locations_geocoding_status" ON "${schema}"."locations" ("geocoding_status")
    `);
    await queryRunner.query(`
      CREATE INDEX "idx_locations_geocoding_attempts" ON "${schema}"."locations" ("geocoding_attempts")
    `);

    // Create providers table
    await queryRunner.query(`
      CREATE TABLE "${schema}"."providers" (
        "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "location_hash" VARCHAR(32) NOT NULL,
        "name" VARCHAR(255) NOT NULL,
        "phone1_area_code" VARCHAR(2),
        "phone1" VARCHAR(15),
        "phone2_area_code" VARCHAR(2),
        "phone2" VARCHAR(15),
        "whatsapp_area_code" VARCHAR(2),
        "whatsapp" VARCHAR(15),
        "insurance_company" VARCHAR(100) NOT NULL,
        "branch_name" VARCHAR(100) NOT NULL,
        "network_name" VARCHAR(255) NOT NULL,
        "is_active" BOOLEAN NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "fk_providers_location" FOREIGN KEY ("location_hash") 
          REFERENCES "${schema}"."locations"("hash") ON DELETE RESTRICT
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_providers_location_hash" ON "${schema}"."providers" ("location_hash")
    `);
    await queryRunner.query(`
      CREATE INDEX "idx_providers_name" ON "${schema}"."providers" ("name")
    `);
    await queryRunner.query(`
      CREATE INDEX "idx_providers_insurance_company" ON "${schema}"."providers" ("insurance_company")
    `);
    await queryRunner.query(`
      CREATE INDEX "idx_providers_is_active" ON "${schema}"."providers" ("is_active")
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX "idx_providers_name_location" ON "${schema}"."providers" ("name", "location_hash")
    `);

    // Create services table
    await queryRunner.query(`
      CREATE TABLE "${schema}"."services" (
        "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "provider_id" UUID NOT NULL,
        "category" VARCHAR(255) NOT NULL,
        "specialty" TEXT NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "fk_services_provider" FOREIGN KEY ("provider_id") 
          REFERENCES "${schema}"."providers"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_services_provider_id" ON "${schema}"."services" ("provider_id")
    `);
    await queryRunner.query(`
      CREATE INDEX "idx_services_category" ON "${schema}"."services" ("category")
    `);

    // Create imports table
    await queryRunner.query(`
      CREATE TABLE "${schema}"."imports" (
        "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "filename" VARCHAR(255) NOT NULL,
        "total_rows" INT,
        "processed_rows" INT NOT NULL DEFAULT 0,
        "new_locations" INT NOT NULL DEFAULT 0,
        "new_providers" INT NOT NULL DEFAULT 0,
        "new_services" INT NOT NULL DEFAULT 0,
        "status" VARCHAR(20) NOT NULL DEFAULT 'processing',
        "error_message" TEXT,
        "started_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "completed_at" TIMESTAMP
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_imports_status" ON "${schema}"."imports" ("status")
    `);
    await queryRunner.query(`
      CREATE INDEX "idx_imports_started_at" ON "${schema}"."imports" ("started_at")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const schema = process.env.DB_SCHEMA || 'public';

    await queryRunner.query(`DROP TABLE IF EXISTS "${schema}"."imports"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "${schema}"."services"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "${schema}"."providers"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "${schema}"."locations"`);
  }
}
