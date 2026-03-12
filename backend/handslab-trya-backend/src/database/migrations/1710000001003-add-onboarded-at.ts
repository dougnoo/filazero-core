import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOnboardedAt1710000001003 implements MigrationInterface {
  name = 'AddOnboardedAt1710000001003';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD COLUMN "onboarded_at" TIMESTAMP`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "onboarded_at"`);
  }
}
