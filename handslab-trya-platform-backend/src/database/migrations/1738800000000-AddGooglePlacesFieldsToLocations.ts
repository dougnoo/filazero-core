import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddGooglePlacesFieldsToLocations1738800000000
  implements MigrationInterface
{
  name = 'AddGooglePlacesFieldsToLocations1738800000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const schema = process.env.DB_SCHEMA || 'public';

    // Add Google Places fields to locations table
    await queryRunner.query(`
      ALTER TABLE "${schema}"."locations"
      ADD COLUMN "google_place_id" VARCHAR(255),
      ADD COLUMN "google_rating" DECIMAL(3, 2),
      ADD COLUMN "google_user_ratings_total" INT,
      ADD COLUMN "google_weekday_text" JSONB,
      ADD COLUMN "google_place_url" VARCHAR(512),
      ADD COLUMN "google_last_fetched_at" TIMESTAMP
    `);

    // Create indexes for Google Places fields
    await queryRunner.query(`
      CREATE INDEX "idx_locations_google_place_id" ON "${schema}"."locations" ("google_place_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_locations_google_rating" ON "${schema}"."locations" ("google_rating")
    `);

    // Add comment to explain the fields
    await queryRunner.query(`
      COMMENT ON COLUMN "${schema}"."locations"."google_place_id" IS 'Google Places unique identifier'
    `);

    await queryRunner.query(`
      COMMENT ON COLUMN "${schema}"."locations"."google_rating" IS 'Google Places rating (0-5)'
    `);

    await queryRunner.query(`
      COMMENT ON COLUMN "${schema}"."locations"."google_user_ratings_total" IS 'Total number of user ratings on Google'
    `);

    await queryRunner.query(`
      COMMENT ON COLUMN "${schema}"."locations"."google_weekday_text" IS 'Opening hours in text format for each day of the week (JSON array)'
    `);

    await queryRunner.query(`
      COMMENT ON COLUMN "${schema}"."locations"."google_place_url" IS 'Google Maps URL for this place'
    `);

    await queryRunner.query(`
      COMMENT ON COLUMN "${schema}"."locations"."google_last_fetched_at" IS 'Timestamp of the last Google Places data fetch'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const schema = process.env.DB_SCHEMA || 'public';

    // Drop indexes
    await queryRunner.query(`
      DROP INDEX IF EXISTS "${schema}"."idx_locations_google_rating"
    `);

    await queryRunner.query(`
      DROP INDEX IF EXISTS "${schema}"."idx_locations_google_place_id"
    `);

    // Drop columns
    await queryRunner.query(`
      ALTER TABLE "${schema}"."locations"
      DROP COLUMN IF EXISTS "google_last_fetched_at",
      DROP COLUMN IF EXISTS "google_place_url",
      DROP COLUMN IF EXISTS "google_weekday_text",
      DROP COLUMN IF EXISTS "google_user_ratings_total",
      DROP COLUMN IF EXISTS "google_rating",
      DROP COLUMN IF EXISTS "google_place_id"
    `);
  }
}
