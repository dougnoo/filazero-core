import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class RemoveCrmFromDoctors1766331105559 implements MigrationInterface {
  name = 'RemoveCrmFromDoctors1766331105559';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Remove the old CRM field from doctors table using TypeORM's schema-aware method
    await queryRunner.dropColumn('doctors', 'crm');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Add back the CRM field to doctors table using TypeORM's schema-aware method
    await queryRunner.addColumn(
      'doctors',
      new TableColumn({
        name: 'crm',
        type: 'varchar',
        isNullable: true,
      }),
    );
  }
}
