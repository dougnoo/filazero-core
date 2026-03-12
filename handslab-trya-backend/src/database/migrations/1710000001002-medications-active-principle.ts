import { MigrationInterface, QueryRunner } from 'typeorm';

export class MedicationsActivePrinciple1710000001002
  implements MigrationInterface
{
  name = 'MedicationsActivePrinciple1710000001002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "medications" ADD COLUMN "active_principle" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "medications" DROP COLUMN "active_principle"`,
    );
  }
}
