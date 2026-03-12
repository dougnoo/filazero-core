import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveCertificateDateAndNotes1762900200001
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "medical_certificates" DROP COLUMN "certificate_date"`,
    );
    await queryRunner.query(
      `ALTER TABLE "medical_certificates" DROP COLUMN "notes"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "medical_certificates" ADD "notes" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "medical_certificates" ADD "certificate_date" date`,
    );
  }
}
