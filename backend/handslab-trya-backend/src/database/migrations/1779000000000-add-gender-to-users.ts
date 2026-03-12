import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddGenderToUsers1779000000000 implements MigrationInterface {
  name = 'AddGenderToUsers1779000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" ADD "gender" varchar(255) NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "gender"`);
  }
}
