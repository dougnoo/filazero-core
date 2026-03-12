import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDependentSupportToUsers1775000000000 implements MigrationInterface {
  name = 'AddDependentSupportToUsers1775000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add member_id column
    await queryRunner.query(
      `ALTER TABLE "users" ADD "member_id" varchar(255) NULL`,
    );

    // Add dependent_type column
    await queryRunner.query(
      `ALTER TABLE "users" ADD "dependent_type" varchar(255) NULL DEFAULT 'SELF'`,
    );

    // Add subscriber_id column (foreign key to users table)
    await queryRunner.query(
      `ALTER TABLE "users" ADD "subscriber_id" uuid NULL`,
    );

    // Create index on member_id for faster lookups
    await queryRunner.query(
      `CREATE INDEX "IDX_users_member_id" ON "users" ("member_id")`,
    );

    // Create index on subscriber_id for faster lookups
    await queryRunner.query(
      `CREATE INDEX "IDX_users_subscriber_id" ON "users" ("subscriber_id")`,
    );

    // Add foreign key constraint for subscriber_id
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "FK_users_subscriber" FOREIGN KEY ("subscriber_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign key constraint
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "FK_users_subscriber"`,
    );

    // Drop indexes
    await queryRunner.query(`DROP INDEX "public"."IDX_users_subscriber_id"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_users_member_id"`);

    // Drop columns
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "subscriber_id"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "dependent_type"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "member_id"`);
  }
}
