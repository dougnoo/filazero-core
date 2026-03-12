import { MigrationInterface, QueryRunner } from 'typeorm';

export class MakeCpfNullable1762900300000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "cpf" DROP NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "cpf" SET NOT NULL`,
    );
  }
}
