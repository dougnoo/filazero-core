import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableIndex,
  TableForeignKey,
} from 'typeorm';

export class CreateMemedPrescriptorsTable1765287399868 implements MigrationInterface {
  name = 'CreateMemedPrescriptorsTable1765287399868';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enum types (check if exists first since PostgreSQL doesn't support IF NOT EXISTS for types)
    const typeExists = await queryRunner.query(`
      SELECT 1 FROM pg_type WHERE typname = 'memed_status_enum'
    `);

    if (!typeExists || typeExists.length === 0) {
      await queryRunner.query(`
        CREATE TYPE "memed_status_enum" AS ENUM ('Ativo', 'Em análise', 'Inativo')
      `);
    }

    // Create simplified memed_prescriptors table using TypeORM's schema-aware method
    await queryRunner.createTable(
      new Table({
        name: 'memed_prescriptors',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'user_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'memed_id',
            type: 'integer',
            isNullable: false,
          },
          {
            name: 'memed_token',
            type: 'varchar',
            length: '500',
            isNullable: false,
          },
          {
            name: 'memed_external_id',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'memed_status',
            type: 'enum',
            enum: ['Ativo', 'Em análise', 'Inativo'],
            isNullable: false,
          },
          {
            name: 'city_id',
            type: 'integer',
            isNullable: true,
          },
          {
            name: 'specialty_id',
            type: 'integer',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
            isNullable: false,
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
            isNullable: false,
          },
        ],
        uniques: [
          {
            name: 'UQ_memed_prescriptors_user_id',
            columnNames: ['user_id'],
          },
          {
            name: 'UQ_memed_prescriptors_memed_id',
            columnNames: ['memed_id'],
          },
          {
            name: 'UQ_memed_prescriptors_memed_external_id',
            columnNames: ['memed_external_id'],
          },
        ],
      }),
      true,
    );

    // Create indexes for memed_prescriptors table using TypeORM's schema-aware methods
    await queryRunner.createIndex(
      'memed_prescriptors',
      new TableIndex({
        name: 'idx_memed_prescriptors_user_id',
        columnNames: ['user_id'],
      }),
    );
    await queryRunner.createIndex(
      'memed_prescriptors',
      new TableIndex({
        name: 'idx_memed_prescriptors_memed_id',
        columnNames: ['memed_id'],
      }),
    );
    await queryRunner.createIndex(
      'memed_prescriptors',
      new TableIndex({
        name: 'idx_memed_prescriptors_memed_external_id',
        columnNames: ['memed_external_id'],
      }),
    );

    // Create prescriptions table using TypeORM's schema-aware method
    await queryRunner.createTable(
      new Table({
        name: 'prescriptions',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'tenant_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'doctor_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'patient_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'patient_name',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'patient_cpf',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'session_id',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'medications',
            type: 'jsonb',
            default: "'[]'",
            isNullable: false,
          },
          {
            name: 'exams',
            type: 'jsonb',
            default: "'[]'",
            isNullable: false,
          },
          {
            name: 'pdf_url',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'sent_via',
            type: 'varchar',
            isArray: true,
            isNullable: true,
          },
          {
            name: 'sent_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
            isNullable: false,
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
            isNullable: false,
          },
        ],
        uniques: [],
      }),
      true,
    );

    // Create indexes for prescriptions table using TypeORM's schema-aware methods
    await queryRunner.createIndex(
      'prescriptions',
      new TableIndex({
        name: 'idx_prescriptions_tenant_id',
        columnNames: ['tenant_id'],
      }),
    );
    await queryRunner.createIndex(
      'prescriptions',
      new TableIndex({
        name: 'idx_prescriptions_doctor_id',
        columnNames: ['doctor_id'],
      }),
    );
    await queryRunner.createIndex(
      'prescriptions',
      new TableIndex({
        name: 'idx_prescriptions_patient_id',
        columnNames: ['patient_id'],
      }),
    );
    await queryRunner.createIndex(
      'prescriptions',
      new TableIndex({
        name: 'idx_prescriptions_session_id',
        columnNames: ['session_id'],
      }),
    );

    // Add foreign key constraints using TypeORM's schema-aware methods
    await queryRunner.createForeignKey(
      'memed_prescriptors',
      new TableForeignKey({
        name: 'FK_memed_prescriptors_user_id',
        columnNames: ['user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );
    await queryRunner.createForeignKey(
      'prescriptions',
      new TableForeignKey({
        name: 'FK_prescriptions_doctor_id',
        columnNames: ['doctor_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
        onUpdate: 'NO ACTION',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign key constraints using TypeORM's schema-aware methods
    await queryRunner.dropForeignKey(
      'prescriptions',
      'FK_prescriptions_doctor_id',
    );
    await queryRunner.dropForeignKey(
      'memed_prescriptors',
      'FK_memed_prescriptors_user_id',
    );

    // Drop indexes for prescriptions table using TypeORM's schema-aware methods
    await queryRunner.dropIndex(
      'prescriptions',
      'idx_prescriptions_session_id',
    );
    await queryRunner.dropIndex(
      'prescriptions',
      'idx_prescriptions_patient_id',
    );
    await queryRunner.dropIndex('prescriptions', 'idx_prescriptions_doctor_id');
    await queryRunner.dropIndex('prescriptions', 'idx_prescriptions_tenant_id');

    // Drop prescriptions table using TypeORM's schema-aware method
    await queryRunner.dropTable('prescriptions');

    // Drop indexes for memed_prescriptors table using TypeORM's schema-aware methods
    await queryRunner.dropIndex(
      'memed_prescriptors',
      'idx_memed_prescriptors_memed_external_id',
    );
    await queryRunner.dropIndex(
      'memed_prescriptors',
      'idx_memed_prescriptors_memed_id',
    );
    await queryRunner.dropIndex(
      'memed_prescriptors',
      'idx_memed_prescriptors_user_id',
    );

    // Drop memed_prescriptors table using TypeORM's schema-aware method
    await queryRunner.dropTable('memed_prescriptors');

    // Drop enum types
    await queryRunner.query(`DROP TYPE IF EXISTS "memed_status_enum"`);
  }
}
