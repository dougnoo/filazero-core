import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableIndex,
} from 'typeorm';

export class UpdatePrescriptionsTable1766500000000 implements MigrationInterface {
  name = 'UpdatePrescriptionsTable1766500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add memed_prescription_id column
    await queryRunner.addColumn(
      'prescriptions',
      new TableColumn({
        name: 'memed_prescription_id',
        type: 'varchar',
        isNullable: false,
      }),
    );

    // Add index for memed_prescription_id
    await queryRunner.createIndex(
      'prescriptions',
      new TableIndex({
        name: 'idx_prescriptions_memed_prescription_id',
        columnNames: ['memed_prescription_id'],
      }),
    );

    // Make tenant_id nullable
    await queryRunner.changeColumn(
      'prescriptions',
      'tenant_id',
      new TableColumn({
        name: 'tenant_id',
        type: 'uuid',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop index for memed_prescription_id
    await queryRunner.dropIndex(
      'prescriptions',
      'idx_prescriptions_memed_prescription_id',
    );

    // Drop memed_prescription_id column
    await queryRunner.dropColumn('prescriptions', 'memed_prescription_id');

    // Make tenant_id not nullable (assuming we want to revert this)
    await queryRunner.changeColumn(
      'prescriptions',
      'tenant_id',
      new TableColumn({
        name: 'tenant_id',
        type: 'uuid',
        isNullable: false,
      }),
    );
  }
}
