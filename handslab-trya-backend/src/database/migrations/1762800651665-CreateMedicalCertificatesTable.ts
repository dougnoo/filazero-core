import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

export class CreateMedicalCertificatesTable1762800651665
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'medical_certificates',
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
            name: 'tenant_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'file_name',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'file_url',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 's3_key',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'mime_type',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'file_size',
            type: 'bigint',
            isNullable: false,
          },
          {
            name: 'certificate_date',
            type: 'date',
            isNullable: true,
          },
          {
            name: 'notes',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['PENDING', 'APPROVED', 'REJECTED'],
            default: "'PENDING'",
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'medical_certificates',
      new TableForeignKey({
        name: 'FK_medical_certificates_user',
        columnNames: ['user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'medical_certificates',
      new TableForeignKey({
        name: 'FK_medical_certificates_tenant',
        columnNames: ['tenant_id'],
        referencedTableName: 'tenants',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createIndex(
      'medical_certificates',
      new TableIndex({
        name: 'IDX_medical_certificates_user_id',
        columnNames: ['user_id'],
      }),
    );

    await queryRunner.createIndex(
      'medical_certificates',
      new TableIndex({
        name: 'IDX_medical_certificates_tenant_id',
        columnNames: ['tenant_id'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex(
      'medical_certificates',
      'IDX_medical_certificates_tenant_id',
    );
    await queryRunner.dropIndex(
      'medical_certificates',
      'IDX_medical_certificates_user_id',
    );
    await queryRunner.dropForeignKey(
      'medical_certificates',
      'FK_medical_certificates_tenant',
    );
    await queryRunner.dropForeignKey(
      'medical_certificates',
      'FK_medical_certificates_user',
    );
    await queryRunner.dropTable('medical_certificates');
  }
}
