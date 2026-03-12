import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateMedicalDocumentsTable1780000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "medical_document_type_enum" AS ENUM (
        'LAB_EXAM',
        'IMAGING_EXAM',
        'REPORT',
        'VACCINATION',
        'CLINICAL_FILE',
        'PRESCRIPTION'
      );
    `);

    await queryRunner.createTable(
      new Table({
        name: 'medical_documents',
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
            name: 'owner_user_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'member_user_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'document_type',
            type: 'medical_document_type_enum',
            isNullable: false,
          },
          {
            name: 'category',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'title',
            type: 'varchar',
            length: '200',
            isNullable: false,
          },
          {
            name: 'issue_date',
            type: 'date',
            isNullable: false,
          },
          {
            name: 'valid_until',
            type: 'date',
            isNullable: true,
          },
          {
            name: 'notes',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'file_name',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'mime_type',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'file_size',
            type: 'bigint',
            isNullable: false,
          },
          {
            name: 's3_key',
            type: 'varchar',
            length: '500',
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamp with time zone',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp with time zone',
            default: 'now()',
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'medical_documents',
      new TableIndex({
        name: 'IDX_medical_documents_tenant_member_issue',
        columnNames: ['tenant_id', 'member_user_id', 'issue_date'],
      }),
    );

    await queryRunner.createIndex(
      'medical_documents',
      new TableIndex({
        name: 'IDX_medical_documents_tenant_member_type',
        columnNames: ['tenant_id', 'member_user_id', 'document_type'],
      }),
    );

    await queryRunner.createIndex(
      'medical_documents',
      new TableIndex({
        name: 'IDX_medical_documents_tenant_member_valid',
        columnNames: ['tenant_id', 'member_user_id', 'valid_until'],
      }),
    );

    await queryRunner.createIndex(
      'medical_documents',
      new TableIndex({
        name: 'IDX_medical_documents_tenant_owner',
        columnNames: ['tenant_id', 'owner_user_id'],
      }),
    );

    await queryRunner.createIndex(
      'medical_documents',
      new TableIndex({
        name: 'IDX_medical_documents_owner_user_id',
        columnNames: ['owner_user_id'],
      }),
    );

    await queryRunner.createIndex(
      'medical_documents',
      new TableIndex({
        name: 'IDX_medical_documents_member_user_id',
        columnNames: ['member_user_id'],
      }),
    );

    await queryRunner.createForeignKey(
      'medical_documents',
      new TableForeignKey({
        name: 'FK_medical_documents_tenant',
        columnNames: ['tenant_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'tenants',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'medical_documents',
      new TableForeignKey({
        name: 'FK_medical_documents_owner',
        columnNames: ['owner_user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'medical_documents',
      new TableForeignKey({
        name: 'FK_medical_documents_member',
        columnNames: ['member_user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('medical_documents', 'FK_medical_documents_member');
    await queryRunner.dropForeignKey('medical_documents', 'FK_medical_documents_owner');
    await queryRunner.dropForeignKey('medical_documents', 'FK_medical_documents_tenant');

    await queryRunner.dropIndex('medical_documents', 'IDX_medical_documents_member_user_id');
    await queryRunner.dropIndex('medical_documents', 'IDX_medical_documents_owner_user_id');
    await queryRunner.dropIndex('medical_documents', 'IDX_medical_documents_tenant_owner');
    await queryRunner.dropIndex('medical_documents', 'IDX_medical_documents_tenant_member_valid');
    await queryRunner.dropIndex('medical_documents', 'IDX_medical_documents_tenant_member_type');
    await queryRunner.dropIndex('medical_documents', 'IDX_medical_documents_tenant_member_issue');

    await queryRunner.dropTable('medical_documents');
    await queryRunner.query('DROP TYPE "medical_document_type_enum";');
  }
}
