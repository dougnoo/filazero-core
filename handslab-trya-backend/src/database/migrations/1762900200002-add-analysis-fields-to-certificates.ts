import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAnalysisFieldsToCertificates1762900200002
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "analysis_status_enum" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED')
    `);

    await queryRunner.query(`
      CREATE TYPE "validation_result_enum" AS ENUM ('VALID', 'WARNING', 'INVALID')
    `);

    await queryRunner.query(`
      ALTER TABLE "medical_certificates" 
      ADD COLUMN "analysis_status" "analysis_status_enum" NOT NULL DEFAULT 'PENDING',
      ADD COLUMN "confidence_score" integer,
      ADD COLUMN "ai_conclusion" text,
      ADD COLUMN "crm_validation" "validation_result_enum",
      ADD COLUMN "crm_observation" text,
      ADD COLUMN "authenticity_validation" "validation_result_enum",
      ADD COLUMN "authenticity_observation" text,
      ADD COLUMN "signature_validation" "validation_result_enum",
      ADD COLUMN "signature_observation" text,
      ADD COLUMN "date_validation" "validation_result_enum",
      ADD COLUMN "date_observation" text,
      ADD COLUMN "legibility_validation" "validation_result_enum",
      ADD COLUMN "legibility_observation" text,
      ADD COLUMN "clinic_validation" "validation_result_enum",
      ADD COLUMN "clinic_observation" text,
      ADD COLUMN "fraud_validation" "validation_result_enum",
      ADD COLUMN "fraud_observation" text,
      ADD COLUMN "analyzed_at" timestamp
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "medical_certificates" 
      DROP COLUMN "analyzed_at",
      DROP COLUMN "fraud_observation",
      DROP COLUMN "fraud_validation",
      DROP COLUMN "clinic_observation",
      DROP COLUMN "clinic_validation",
      DROP COLUMN "legibility_observation",
      DROP COLUMN "legibility_validation",
      DROP COLUMN "date_observation",
      DROP COLUMN "date_validation",
      DROP COLUMN "signature_observation",
      DROP COLUMN "signature_validation",
      DROP COLUMN "authenticity_observation",
      DROP COLUMN "authenticity_validation",
      DROP COLUMN "crm_observation",
      DROP COLUMN "crm_validation",
      DROP COLUMN "ai_conclusion",
      DROP COLUMN "confidence_score",
      DROP COLUMN "analysis_status"
    `);

    await queryRunner.query(`DROP TYPE "validation_result_enum"`);
    await queryRunner.query(`DROP TYPE "analysis_status_enum"`);
  }
}
