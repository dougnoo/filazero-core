import { MigrationInterface, QueryRunner } from 'typeorm';

export class Normalize1764881870132 implements MigrationInterface {
  name = 'Normalize1764881870132';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_TUTORIALS_TENANT"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_USER_TUTORIAL_PROGRESS_TENANT"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_USER_TUTORIAL_PROGRESS_USER"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_tutorial" DROP CONSTRAINT "PK_1150562052fed5b8aa251f0fd0e"`,
    );
    await queryRunner.query(`ALTER TABLE "user_tutorial" DROP COLUMN "id"`);
    await queryRunner.query(
      `ALTER TABLE "user_tutorial" DROP COLUMN "completedAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_tutorial" DROP COLUMN "skipped"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_tutorial" DROP COLUMN "tenantId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_tutorial" DROP COLUMN "createdAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_tutorial" DROP COLUMN "updatedAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_tutorial" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_tutorial" ADD CONSTRAINT "PK_1150562052fed5b8aa251f0fd0e" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_tutorial" ADD "completedAt" TIMESTAMP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_tutorial" ADD "skipped" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_tutorial" ADD "tenantId" uuid NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_tutorial" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_tutorial" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_tutorial" DROP CONSTRAINT "PK_1150562052fed5b8aa251f0fd0e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_tutorial" ADD CONSTRAINT "PK_6df3f21452f96795c6b750aaf95" PRIMARY KEY ("userId", "tutorialId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "tutorials" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4()`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."analysis_status_enum" RENAME TO "analysis_status_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."medical_certificates_analysis_status_enum" AS ENUM('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED')`,
    );
    await queryRunner.query(
      `ALTER TABLE "medical_certificates" ALTER COLUMN "analysis_status" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "medical_certificates" ALTER COLUMN "analysis_status" TYPE "public"."medical_certificates_analysis_status_enum" USING "analysis_status"::"text"::"public"."medical_certificates_analysis_status_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "medical_certificates" ALTER COLUMN "analysis_status" SET DEFAULT 'PENDING'`,
    );
    await queryRunner.query(`DROP TYPE "public"."analysis_status_enum_old"`);
    await queryRunner.query(
      `ALTER TYPE "public"."validation_result_enum" RENAME TO "validation_result_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."medical_certificates_crm_validation_enum" AS ENUM('VALID', 'WARNING', 'INVALID')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."medical_certificates_authenticity_validation_enum" AS ENUM('VALID', 'WARNING', 'INVALID')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."medical_certificates_signature_validation_enum" AS ENUM('VALID', 'WARNING', 'INVALID')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."medical_certificates_date_validation_enum" AS ENUM('VALID', 'WARNING', 'INVALID')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."medical_certificates_legibility_validation_enum" AS ENUM('VALID', 'WARNING', 'INVALID')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."medical_certificates_clinic_validation_enum" AS ENUM('VALID', 'WARNING', 'INVALID')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."medical_certificates_fraud_validation_enum" AS ENUM('VALID', 'WARNING', 'INVALID')`,
    );
    await queryRunner.query(
      `ALTER TABLE "medical_certificates" ALTER COLUMN "crm_validation" TYPE "public"."medical_certificates_crm_validation_enum" USING "crm_validation"::"text"::"public"."medical_certificates_crm_validation_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "medical_certificates" ALTER COLUMN "authenticity_validation" TYPE "public"."medical_certificates_authenticity_validation_enum" USING "authenticity_validation"::"text"::"public"."medical_certificates_authenticity_validation_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "medical_certificates" ALTER COLUMN "signature_validation" TYPE "public"."medical_certificates_signature_validation_enum" USING "signature_validation"::"text"::"public"."medical_certificates_signature_validation_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "medical_certificates" ALTER COLUMN "date_validation" TYPE "public"."medical_certificates_date_validation_enum" USING "date_validation"::"text"::"public"."medical_certificates_date_validation_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "medical_certificates" ALTER COLUMN "legibility_validation" TYPE "public"."medical_certificates_legibility_validation_enum" USING "legibility_validation"::"text"::"public"."medical_certificates_legibility_validation_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "medical_certificates" ALTER COLUMN "clinic_validation" TYPE "public"."medical_certificates_clinic_validation_enum" USING "clinic_validation"::"text"::"public"."medical_certificates_clinic_validation_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "medical_certificates" ALTER COLUMN "fraud_validation" TYPE "public"."medical_certificates_fraud_validation_enum" USING "fraud_validation"::"text"::"public"."medical_certificates_fraud_validation_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."validation_result_enum_old"`);
    await queryRunner.query(
      `ALTER TABLE "medical_certificates" ALTER COLUMN "created_at" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "medical_certificates" ALTER COLUMN "updated_at" SET DEFAULT now()`,
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_3790d09df7b1cd1a96a5129a08" ON "tutorials" ("tenantId", "targetRole", "isActive") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_35e04df1721c91c3cb4c9d06bc" ON "user_tutorial" ("tenantId") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_4e48e229c1f88cf548a4a1e840" ON "user_tutorial" ("userId", "tutorialId", "tenantId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_38fea5613c33fc5dcc5f7099ea" ON "user_tutorial" ("userId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_bf2eb154f46e0498dfe2b487eb" ON "user_tutorial" ("tutorialId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "user_tutorial" ADD CONSTRAINT "FK_38fea5613c33fc5dcc5f7099eae" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_tutorial" ADD CONSTRAINT "FK_bf2eb154f46e0498dfe2b487eb5" FOREIGN KEY ("tutorialId") REFERENCES "tutorials"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_tutorial" DROP CONSTRAINT "FK_bf2eb154f46e0498dfe2b487eb5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_tutorial" DROP CONSTRAINT "FK_38fea5613c33fc5dcc5f7099eae"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_bf2eb154f46e0498dfe2b487eb"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_38fea5613c33fc5dcc5f7099ea"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_4e48e229c1f88cf548a4a1e840"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_35e04df1721c91c3cb4c9d06bc"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_3790d09df7b1cd1a96a5129a08"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_tutorial" DROP CONSTRAINT "PK_6df3f21452f96795c6b750aaf95"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_tutorial" ADD CONSTRAINT "PK_1150562052fed5b8aa251f0fd0e" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "medical_certificates" ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "medical_certificates" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."validation_result_enum" AS ENUM('VALID', 'WARNING', 'INVALID')`,
    );
    await queryRunner.query(
      `ALTER TABLE "medical_certificates" ALTER COLUMN "fraud_validation" TYPE "public"."validation_result_enum" USING "fraud_validation"::"text"::"public"."validation_result_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "medical_certificates" ALTER COLUMN "clinic_validation" TYPE "public"."validation_result_enum" USING "clinic_validation"::"text"::"public"."validation_result_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "medical_certificates" ALTER COLUMN "legibility_validation" TYPE "public"."validation_result_enum" USING "legibility_validation"::"text"::"public"."validation_result_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "medical_certificates" ALTER COLUMN "date_validation" TYPE "public"."validation_result_enum" USING "date_validation"::"text"::"public"."validation_result_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "medical_certificates" ALTER COLUMN "signature_validation" TYPE "public"."validation_result_enum" USING "signature_validation"::"text"::"public"."validation_result_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "medical_certificates" ALTER COLUMN "authenticity_validation" TYPE "public"."validation_result_enum" USING "authenticity_validation"::"text"::"public"."validation_result_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "medical_certificates" ALTER COLUMN "crm_validation" TYPE "public"."validation_result_enum" USING "crm_validation"::"text"::"public"."validation_result_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."medical_certificates_fraud_validation_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."medical_certificates_clinic_validation_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."medical_certificates_legibility_validation_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."medical_certificates_date_validation_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."medical_certificates_signature_validation_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."medical_certificates_authenticity_validation_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."medical_certificates_crm_validation_enum"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."analysis_status_enum_old" AS ENUM('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED')`,
    );
    await queryRunner.query(
      `ALTER TABLE "medical_certificates" ALTER COLUMN "analysis_status" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "medical_certificates" ALTER COLUMN "analysis_status" TYPE "public"."analysis_status_enum_old" USING "analysis_status"::"text"::"public"."analysis_status_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "medical_certificates" ALTER COLUMN "analysis_status" SET DEFAULT 'PENDING'`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."medical_certificates_analysis_status_enum"`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."analysis_status_enum_old" RENAME TO "analysis_status_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tutorials" ALTER COLUMN "id" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_tutorial" DROP CONSTRAINT "PK_1150562052fed5b8aa251f0fd0e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_tutorial" ADD CONSTRAINT "PK_6df3f21452f96795c6b750aaf95" PRIMARY KEY ("userId", "tutorialId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_tutorial" DROP CONSTRAINT "PK_6df3f21452f96795c6b750aaf95"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_tutorial" ADD CONSTRAINT "PK_1150562052fed5b8aa251f0fd0e" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_tutorial" DROP COLUMN "updatedAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_tutorial" DROP COLUMN "createdAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_tutorial" DROP COLUMN "tenantId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_tutorial" DROP COLUMN "skipped"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_tutorial" DROP COLUMN "completedAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_tutorial" DROP CONSTRAINT "PK_1150562052fed5b8aa251f0fd0e"`,
    );
    await queryRunner.query(`ALTER TABLE "user_tutorial" DROP COLUMN "id"`);
    await queryRunner.query(
      `ALTER TABLE "user_tutorial" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_tutorial" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_tutorial" ADD "tenantId" uuid NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_tutorial" ADD "skipped" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_tutorial" ADD "completedAt" TIMESTAMP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_tutorial" ADD "id" uuid NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_tutorial" ADD CONSTRAINT "PK_1150562052fed5b8aa251f0fd0e" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_USER_TUTORIAL_PROGRESS_USER" ON "user_tutorial" ("userId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_USER_TUTORIAL_PROGRESS_TENANT" ON "user_tutorial" ("tenantId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_TUTORIALS_TENANT" ON "tutorials" ("tenantId") `,
    );
  }
}
