import { MigrationInterface, QueryRunner } from 'typeorm';

export class OnboardingHealth1710000001000 implements MigrationInterface {
  name = 'OnboardingHealth1710000001000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Master table for chronic conditions
    await queryRunner.query(`CREATE TABLE "chronic_conditions" (
			"id" uuid NOT NULL DEFAULT uuid_generate_v4(),
			"name" character varying NOT NULL,
			"created_at" TIMESTAMP NOT NULL DEFAULT now(),
			"updated_at" TIMESTAMP NOT NULL DEFAULT now(),
			CONSTRAINT "UQ_chronic_conditions_name" UNIQUE ("name"),
			CONSTRAINT "PK_chronic_conditions_id" PRIMARY KEY ("id")
		)`);

    // Link table: user x chronic conditions (many-to-many)
    await queryRunner.query(`CREATE TABLE "user_chronic_conditions" (
			"id" uuid NOT NULL DEFAULT uuid_generate_v4(),
			"user_id" uuid NOT NULL,
			"condition_id" uuid NOT NULL,
			"created_at" TIMESTAMP NOT NULL DEFAULT now(),
			"updated_at" TIMESTAMP NOT NULL DEFAULT now(),
			CONSTRAINT "UQ_user_chronic_condition_unique" UNIQUE ("user_id", "condition_id"),
			CONSTRAINT "PK_user_chronic_conditions_id" PRIMARY KEY ("id")
		)`);

    // Master table for continuous-use medications
    await queryRunner.query(`CREATE TABLE "medications" (
			"id" uuid NOT NULL DEFAULT uuid_generate_v4(),
			"name" character varying NOT NULL,
			"created_at" TIMESTAMP NOT NULL DEFAULT now(),
			"updated_at" TIMESTAMP NOT NULL DEFAULT now(),
			CONSTRAINT "UQ_medications_name" UNIQUE ("name"),
			CONSTRAINT "PK_medications_id" PRIMARY KEY ("id")
		)`);

    // Link table: user x medications (many-to-many)
    await queryRunner.query(`CREATE TABLE "user_medications" (
			"id" uuid NOT NULL DEFAULT uuid_generate_v4(),
			"user_id" uuid NOT NULL,
			"medication_id" uuid NOT NULL,
			"created_at" TIMESTAMP NOT NULL DEFAULT now(),
			"updated_at" TIMESTAMP NOT NULL DEFAULT now(),
			CONSTRAINT "UQ_user_medication_unique" UNIQUE ("user_id", "medication_id"),
			CONSTRAINT "PK_user_medications_id" PRIMARY KEY ("id")
		)`);

    // Add free-text allergies and onboarding skip flag to users
    await queryRunner.query(`ALTER TABLE "users" ADD COLUMN "allergies" text`);
    await queryRunner.query(
      `ALTER TABLE "users" ADD COLUMN "onboarding_skipped" boolean NOT NULL DEFAULT false`,
    );

    // Foreign keys
    await queryRunner.query(
      `ALTER TABLE "user_chronic_conditions" ADD CONSTRAINT "FK_ucc_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_chronic_conditions" ADD CONSTRAINT "FK_ucc_condition" FOREIGN KEY ("condition_id") REFERENCES "chronic_conditions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `ALTER TABLE "user_medications" ADD CONSTRAINT "FK_um_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_medications" ADD CONSTRAINT "FK_um_medication" FOREIGN KEY ("medication_id") REFERENCES "medications"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    // Helpful indexes
    await queryRunner.query(
      `CREATE INDEX "IDX_ucc_user" ON "user_chronic_conditions" ("user_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ucc_condition" ON "user_chronic_conditions" ("condition_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_um_user" ON "user_medications" ("user_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_um_medication" ON "user_medications" ("medication_id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_um_medication"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_um_user"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_ucc_condition"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_ucc_user"`);

    await queryRunner.query(
      `ALTER TABLE "user_medications" DROP CONSTRAINT "FK_um_medication"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_medications" DROP CONSTRAINT "FK_um_user"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_chronic_conditions" DROP CONSTRAINT "FK_ucc_condition"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_chronic_conditions" DROP CONSTRAINT "FK_ucc_user"`,
    );

    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN "onboarding_skipped"`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "allergies"`);

    await queryRunner.query(`DROP TABLE "user_medications"`);
    await queryRunner.query(`DROP TABLE "medications"`);
    await queryRunner.query(`DROP TABLE "user_chronic_conditions"`);
    await queryRunner.query(`DROP TABLE "chronic_conditions"`);
  }
}
