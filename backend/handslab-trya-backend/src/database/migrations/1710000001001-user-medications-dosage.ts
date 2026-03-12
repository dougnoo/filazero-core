import { MigrationInterface, QueryRunner } from 'typeorm';

export class UserMedicationsDosage1710000001001 implements MigrationInterface {
  name = 'UserMedicationsDosage1710000001001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_medications" ADD COLUMN "dosage" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_medications" DROP COLUMN "dosage"`,
    );
  }
}
