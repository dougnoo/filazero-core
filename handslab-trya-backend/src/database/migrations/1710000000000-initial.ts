import { MigrationInterface, QueryRunner } from 'typeorm';

export class Initial1710000000000 implements MigrationInterface {
  name = 'Initial1710000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "brokers" (
			"id" uuid NOT NULL DEFAULT uuid_generate_v4(),
			"name" character varying NOT NULL,
			"created_at" TIMESTAMP NOT NULL DEFAULT now(),
			"updated_at" TIMESTAMP NOT NULL DEFAULT now(),
			CONSTRAINT "PK_b86b1a0c8c30f0e593d2b6e2c7f" PRIMARY KEY ("id")
		)`);

    await queryRunner.query(`CREATE TABLE "users" (
			"id" uuid NOT NULL DEFAULT uuid_generate_v4(),
			"name" character varying NOT NULL,
			"cpf" character varying NOT NULL,
			"birth_date" date NOT NULL,
			"phone" character varying,
			"email" character varying,
			"type" character varying NOT NULL,
			"created_at" TIMESTAMP NOT NULL DEFAULT now(),
			"updated_at" TIMESTAMP NOT NULL DEFAULT now(),
			"broker_id" uuid,
			CONSTRAINT "UQ_users_cpf" UNIQUE ("cpf"),
			CONSTRAINT "UQ_users_email" UNIQUE ("email"),
			CONSTRAINT "PK_users_id" PRIMARY KEY ("id")
		)`);
    await queryRunner.query(`CREATE INDEX "IDX_users_cpf" ON "users" ("cpf")`);

    await queryRunner.query(`CREATE TABLE "health_operators" (
			"id" uuid NOT NULL DEFAULT uuid_generate_v4(),
			"name" character varying NOT NULL,
			"created_at" TIMESTAMP NOT NULL DEFAULT now(),
			"updated_at" TIMESTAMP NOT NULL DEFAULT now(),
			CONSTRAINT "UQ_health_operators_name" UNIQUE ("name"),
			CONSTRAINT "PK_health_operators_id" PRIMARY KEY ("id")
		)`);

    await queryRunner.query(`CREATE TABLE "health_plans" (
			"id" uuid NOT NULL DEFAULT uuid_generate_v4(),
			"name" character varying NOT NULL,
			"operator_id" uuid NOT NULL,
			"created_at" TIMESTAMP NOT NULL DEFAULT now(),
			"updated_at" TIMESTAMP NOT NULL DEFAULT now(),
			CONSTRAINT "PK_health_plans_id" PRIMARY KEY ("id")
		)`);

    await queryRunner.query(`CREATE TABLE "user_plans" (
			"id" uuid NOT NULL DEFAULT uuid_generate_v4(),
			"user_id" uuid NOT NULL,
			"plan_id" uuid NOT NULL,
			"active_until" date,
			"card_number" character varying NOT NULL,
			"created_at" TIMESTAMP NOT NULL DEFAULT now(),
			"updated_at" TIMESTAMP NOT NULL DEFAULT now(),
			CONSTRAINT "UQ_user_plan_unique" UNIQUE ("user_id", "plan_id"),
			CONSTRAINT "PK_user_plans_id" PRIMARY KEY ("id")
		)`);

    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "FK_users_broker" FOREIGN KEY ("broker_id") REFERENCES "brokers"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "health_plans" ADD CONSTRAINT "FK_plans_operator" FOREIGN KEY ("operator_id") REFERENCES "health_operators"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_plans" ADD CONSTRAINT "FK_user_plans_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_plans" ADD CONSTRAINT "FK_user_plans_plan" FOREIGN KEY ("plan_id") REFERENCES "health_plans"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_plans" DROP CONSTRAINT "FK_user_plans_plan"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_plans" DROP CONSTRAINT "FK_user_plans_user"`,
    );
    await queryRunner.query(
      `ALTER TABLE "health_plans" DROP CONSTRAINT "FK_plans_operator"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "FK_users_broker"`,
    );
    await queryRunner.query(`DROP TABLE "user_plans"`);
    await queryRunner.query(`DROP TABLE "health_plans"`);
    await queryRunner.query(`DROP TABLE "health_operators"`);
    await queryRunner.query(`DROP INDEX "IDX_users_cpf"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TABLE "brokers"`);
  }
}
