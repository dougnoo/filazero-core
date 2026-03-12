import { MigrationInterface, QueryRunner } from 'typeorm';

export class Initial1762434720472 implements MigrationInterface {
  name = 'Initial1762434720472';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "FK_USERS_TENANT"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_plans" DROP CONSTRAINT "FK_user_plans_user"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_TENANTS_NAME"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_users_cpf"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_USERS_COGNITO_ID"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_USERS_TENANT_ID"`);
    await queryRunner.query(
      `ALTER TABLE "user_plans" DROP CONSTRAINT "UQ_user_plan_unique"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_medications" DROP CONSTRAINT "UQ_user_medication_unique"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_chronic_conditions" DROP CONSTRAINT "UQ_user_chronic_condition_unique"`,
    );
    await queryRunner.query(`ALTER TABLE "users" ADD "deleted_at" TIMESTAMP`);
    await queryRunner.query(`ALTER TABLE "users" ADD "planId" uuid`);
    await queryRunner.query(
      `ALTER TABLE "medications" DROP CONSTRAINT "UQ_medications_name"`,
    );
    await queryRunner.query(
      `ALTER TABLE "chronic_conditions" DROP CONSTRAINT "UQ_chronic_conditions_name"`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_tenants_name" ON "tenants" ("name") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_users_cpf" ON "users" ("cpf") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_users_cognito_id" ON "users" ("cognito_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_users_tenant_id" ON "users" ("tenant_id") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_medications_name" ON "medications" ("name") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_user_medications_unique" ON "user_medications" ("user_id", "medication_id") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_chronic_conditions_name" ON "chronic_conditions" ("name") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_user_chronic_conditions_unique" ON "user_chronic_conditions" ("user_id", "condition_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "user_plans" ADD CONSTRAINT "UQ_user_plans_user_plan" UNIQUE ("user_id", "plan_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "FK_users_tenant" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "FK_56f2aa669ddbe83eab8a25898b2" FOREIGN KEY ("planId") REFERENCES "user_plans"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_plans" ADD CONSTRAINT "FK_user_plans_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_plans" DROP CONSTRAINT "FK_user_plans_user"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "FK_56f2aa669ddbe83eab8a25898b2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "FK_users_tenant"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_plans" DROP CONSTRAINT "UQ_user_plans_user_plan"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."UQ_user_chronic_conditions_unique"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_chronic_conditions_name"`,
    );
    await queryRunner.query(`DROP INDEX "public"."UQ_user_medications_unique"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_medications_name"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_users_tenant_id"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_users_cognito_id"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_users_cpf"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_tenants_name"`);
    await queryRunner.query(
      `ALTER TABLE "chronic_conditions" ADD CONSTRAINT "UQ_chronic_conditions_name" UNIQUE ("name")`,
    );
    await queryRunner.query(
      `ALTER TABLE "medications" ADD CONSTRAINT "UQ_medications_name" UNIQUE ("name")`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "planId"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "deleted_at"`);
    await queryRunner.query(
      `ALTER TABLE "user_chronic_conditions" ADD CONSTRAINT "UQ_user_chronic_condition_unique" UNIQUE ("user_id", "condition_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_medications" ADD CONSTRAINT "UQ_user_medication_unique" UNIQUE ("user_id", "medication_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_plans" ADD CONSTRAINT "UQ_user_plan_unique" UNIQUE ("user_id", "plan_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_USERS_TENANT_ID" ON "users" ("tenant_id") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_USERS_COGNITO_ID" ON "users" ("cognito_id") `,
    );
    await queryRunner.query(`CREATE INDEX "IDX_users_cpf" ON "users" ("cpf") `);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_TENANTS_NAME" ON "tenants" ("name") `,
    );
    await queryRunner.query(
      `ALTER TABLE "user_plans" ADD CONSTRAINT "FK_user_plans_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "FK_USERS_TENANT" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }
}
