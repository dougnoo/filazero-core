import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCreatedByToUsers1778000000000 implements MigrationInterface {
  name = 'AddCreatedByToUsers1778000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" ADD "created_by" uuid NULL`);
    await queryRunner.query(
      `CREATE INDEX "IDX_users_created_by" ON "users" ("created_by")`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "FK_users_created_by" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "FK_users_created_by"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_users_created_by"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "created_by"`);
  }
}
