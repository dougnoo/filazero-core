import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddObservationToMedicalCertificateTable1767377179065
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('medical_certificates');
    const column = table?.findColumnByName('observations');
    
    if (!column) {
      await queryRunner.addColumn(
        'medical_certificates',
        new TableColumn({
          name: 'observations',
          type: 'text',
          isNullable: true,
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('medical_certificates', 'observations');
  }
}
