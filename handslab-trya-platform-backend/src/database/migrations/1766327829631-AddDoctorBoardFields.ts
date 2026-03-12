import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableIndex,
} from 'typeorm';

export class AddDoctorBoardFields1766327829631 implements MigrationInterface {
  name = 'AddDoctorBoardFields1766327829631';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enum type for board codes (check if exists first since PostgreSQL doesn't support IF NOT EXISTS for types)
    const typeExists = await queryRunner.query(`
      SELECT 1 FROM pg_type WHERE typname = 'board_code_enum'
    `);

    if (!typeExists || typeExists.length === 0) {
      await queryRunner.query(`
        CREATE TYPE "board_code_enum" AS ENUM ('CRM', 'CRO', 'COREN', 'CRMV', 'CRF', 'CRN', 'CREFITO', 'CRP', 'CRFa', 'CREF')
      `);
    }

    // Add board fields to doctors table using TypeORM's schema-aware methods
    await queryRunner.addColumns('doctors', [
      new TableColumn({
        name: 'board_code',
        type: 'enum',
        enum: [
          'CRM',
          'CRO',
          'COREN',
          'CRMV',
          'CRF',
          'CRN',
          'CREFITO',
          'CRP',
          'CRFa',
          'CREF',
        ],
        isNullable: true,
      }),
      new TableColumn({
        name: 'board_number',
        type: 'varchar',
        length: '50',
        isNullable: true,
      }),
      new TableColumn({
        name: 'board_state',
        type: 'varchar',
        length: '2',
        isNullable: true,
      }),
    ]);

    // Create composite index for board information using TypeORM's schema-aware method
    await queryRunner.createIndex(
      'doctors',
      new TableIndex({
        name: 'idx_doctors_board_info',
        columnNames: ['board_code', 'board_number', 'board_state'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop index for board fields using TypeORM's schema-aware method
    await queryRunner.dropIndex('doctors', 'idx_doctors_board_info');

    // Drop board fields from doctors table using TypeORM's schema-aware method
    await queryRunner.dropColumns('doctors', [
      'board_state',
      'board_number',
      'board_code',
    ]);

    // Drop enum type
    await queryRunner.query(`DROP TYPE IF EXISTS "board_code_enum"`);
  }
}
