import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddTermVersionMetadata1762521467211 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'term_versions',
      new TableColumn({
        name: 'effective_date',
        type: 'date',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'term_versions',
      new TableColumn({
        name: 'change_description',
        type: 'text',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'term_versions',
      new TableColumn({
        name: 'uploaded_by',
        type: 'varchar',
        length: '100',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('term_versions', 'uploaded_by');
    await queryRunner.dropColumn('term_versions', 'change_description');
    await queryRunner.dropColumn('term_versions', 'effective_date');
  }
}
