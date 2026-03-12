import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableIndex,
  TableColumn,
  TableForeignKey,
} from 'typeorm';

export class AddNetworkImportTables1769500000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Adicionar coluna status em health_operators
    await queryRunner.addColumn(
      'health_operators',
      new TableColumn({
        name: 'status',
        type: 'varchar',
        length: '50',
        default: "'CADASTRADA'",
      }),
    );

    await queryRunner.createIndex(
      'health_operators',
      new TableIndex({
        name: 'idx_health_operators_status',
        columnNames: ['status'],
      }),
    );

    // 2. Adicionar coluna operator_id em tenants
    await queryRunner.addColumn(
      'tenants',
      new TableColumn({
        name: 'operator_id',
        type: 'uuid',
        isNullable: true,
      }),
    );

    await queryRunner.createIndex(
      'tenants',
      new TableIndex({
        name: 'IDX_tenants_operator_id',
        columnNames: ['operator_id'],
      }),
    );

    await queryRunner.createForeignKey(
      'tenants',
      new TableForeignKey({
        name: 'FK_tenants_operator',
        columnNames: ['operator_id'],
        referencedTableName: 'health_operators',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );

    // 3. Criar tabela audit_events
    await queryRunner.createTable(
      new Table({
        name: 'audit_events',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'event_type',
            type: 'varchar',
            length: '50',
          },
          {
            name: 'entity_type',
            type: 'varchar',
            length: '50',
          },
          {
            name: 'entity_id',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'user_id',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'payload',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'audit_events',
      new TableIndex({
        name: 'idx_audit_events_type',
        columnNames: ['event_type'],
      }),
    );

    await queryRunner.createIndex(
      'audit_events',
      new TableIndex({
        name: 'idx_audit_events_entity',
        columnNames: ['entity_type', 'entity_id'],
      }),
    );

    await queryRunner.createIndex(
      'audit_events',
      new TableIndex({
        name: 'idx_audit_events_user',
        columnNames: ['user_id'],
      }),
    );

    await queryRunner.createIndex(
      'audit_events',
      new TableIndex({
        name: 'idx_audit_events_created_at',
        columnNames: ['created_at'],
      }),
    );

    // 4. Criar tabela network_provider_locations
    await queryRunner.createTable(
      new Table({
        name: 'network_provider_locations',
        columns: [
          {
            name: 'hash',
            type: 'varchar',
            length: '32',
            isPrimary: true,
          },
          {
            name: 'operator_id',
            type: 'uuid',
          },
          {
            name: 'postal_code',
            type: 'varchar',
            length: '8',
          },
          {
            name: 'street_type',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'street_name',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'street_number',
            type: 'varchar',
            length: '20',
            isNullable: true,
          },
          {
            name: 'complement',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'neighborhood',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'city',
            type: 'varchar',
            length: '100',
          },
          {
            name: 'state',
            type: 'varchar',
            length: '2',
          },
          {
            name: 'full_address',
            type: 'text',
          },
          {
            name: 'latitude',
            type: 'decimal',
            precision: 10,
            scale: 8,
            isNullable: true,
          },
          {
            name: 'longitude',
            type: 'decimal',
            precision: 11,
            scale: 8,
            isNullable: true,
          },
          {
            name: 'geocoded_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'geocoding_status',
            type: 'varchar',
            length: '20',
            default: "'pending'",
          },
          {
            name: 'geocoding_attempts',
            type: 'int',
            default: 0,
          },
          {
            name: 'geocoding_error',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'network_provider_locations',
      new TableIndex({
        name: 'idx_np_locations_operator_id',
        columnNames: ['operator_id'],
      }),
    );

    await queryRunner.createIndex(
      'network_provider_locations',
      new TableIndex({
        name: 'idx_np_locations_city',
        columnNames: ['city'],
      }),
    );

    await queryRunner.createIndex(
      'network_provider_locations',
      new TableIndex({
        name: 'idx_np_locations_state',
        columnNames: ['state'],
      }),
    );

    await queryRunner.createIndex(
      'network_provider_locations',
      new TableIndex({
        name: 'idx_np_locations_postal_code',
        columnNames: ['postal_code'],
      }),
    );

    await queryRunner.createIndex(
      'network_provider_locations',
      new TableIndex({
        name: 'idx_np_locations_geocoding_status',
        columnNames: ['geocoding_status'],
      }),
    );

    await queryRunner.createForeignKey(
      'network_provider_locations',
      new TableForeignKey({
        name: 'FK_np_locations_operator',
        columnNames: ['operator_id'],
        referencedTableName: 'health_operators',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    // 5. Criar tabela network_providers
    await queryRunner.createTable(
      new Table({
        name: 'network_providers',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'operator_id',
            type: 'uuid',
          },
          {
            name: 'location_hash',
            type: 'varchar',
            length: '32',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'cnpj',
            type: 'varchar',
            length: '20',
            isNullable: true,
          },
          {
            name: 'phone1_area_code',
            type: 'varchar',
            length: '2',
            isNullable: true,
          },
          {
            name: 'phone1',
            type: 'varchar',
            length: '15',
            isNullable: true,
          },
          {
            name: 'phone2_area_code',
            type: 'varchar',
            length: '2',
            isNullable: true,
          },
          {
            name: 'phone2',
            type: 'varchar',
            length: '15',
            isNullable: true,
          },
          {
            name: 'whatsapp_area_code',
            type: 'varchar',
            length: '2',
            isNullable: true,
          },
          {
            name: 'whatsapp',
            type: 'varchar',
            length: '15',
            isNullable: true,
          },
          {
            name: 'branch_name',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'network_name',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'plan_type',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'network_providers',
      new TableIndex({
        name: 'idx_network_providers_operator_id',
        columnNames: ['operator_id'],
      }),
    );

    await queryRunner.createIndex(
      'network_providers',
      new TableIndex({
        name: 'idx_network_providers_location_hash',
        columnNames: ['location_hash'],
      }),
    );

    await queryRunner.createIndex(
      'network_providers',
      new TableIndex({
        name: 'idx_network_providers_name',
        columnNames: ['name'],
      }),
    );

    await queryRunner.createIndex(
      'network_providers',
      new TableIndex({
        name: 'idx_network_providers_is_active',
        columnNames: ['is_active'],
      }),
    );

    await queryRunner.createIndex(
      'network_providers',
      new TableIndex({
        name: 'uq_network_providers_operator_location_name',
        columnNames: ['operator_id', 'location_hash', 'name'],
        isUnique: true,
      }),
    );

    await queryRunner.createForeignKey(
      'network_providers',
      new TableForeignKey({
        name: 'FK_network_providers_operator',
        columnNames: ['operator_id'],
        referencedTableName: 'health_operators',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'network_providers',
      new TableForeignKey({
        name: 'FK_network_providers_location',
        columnNames: ['location_hash'],
        referencedTableName: 'network_provider_locations',
        referencedColumnNames: ['hash'],
        onDelete: 'RESTRICT',
      }),
    );

    // 6. Criar tabela network_provider_services
    await queryRunner.createTable(
      new Table({
        name: 'network_provider_services',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'provider_id',
            type: 'uuid',
          },
          {
            name: 'category',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'specialty',
            type: 'text',
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'network_provider_services',
      new TableIndex({
        name: 'idx_np_services_provider_id',
        columnNames: ['provider_id'],
      }),
    );

    await queryRunner.createIndex(
      'network_provider_services',
      new TableIndex({
        name: 'idx_np_services_category',
        columnNames: ['category'],
      }),
    );

    await queryRunner.createForeignKey(
      'network_provider_services',
      new TableForeignKey({
        name: 'FK_np_services_provider',
        columnNames: ['provider_id'],
        referencedTableName: 'network_providers',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    // 7. Criar tabela network_provider_imports
    await queryRunner.createTable(
      new Table({
        name: 'network_provider_imports',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'operator_id',
            type: 'uuid',
          },
          {
            name: 'filename',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'file_size',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'file_hash',
            type: 'varchar',
            length: '64',
            isNullable: true,
          },
          {
            name: 'user_id',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'total_rows',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'processed_rows',
            type: 'int',
            default: 0,
          },
          {
            name: 'success_rows',
            type: 'int',
            default: 0,
          },
          {
            name: 'error_rows',
            type: 'int',
            default: 0,
          },
          {
            name: 'new_locations',
            type: 'int',
            default: 0,
          },
          {
            name: 'new_providers',
            type: 'int',
            default: 0,
          },
          {
            name: 'updated_providers',
            type: 'int',
            default: 0,
          },
          {
            name: 'new_services',
            type: 'int',
            default: 0,
          },
          {
            name: 'status',
            type: 'varchar',
            length: '20',
            default: "'processing'",
          },
          {
            name: 'error_message',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'started_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'completed_at',
            type: 'timestamp',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'network_provider_imports',
      new TableIndex({
        name: 'idx_np_imports_operator_id',
        columnNames: ['operator_id'],
      }),
    );

    await queryRunner.createIndex(
      'network_provider_imports',
      new TableIndex({
        name: 'idx_np_imports_status',
        columnNames: ['status'],
      }),
    );

    await queryRunner.createIndex(
      'network_provider_imports',
      new TableIndex({
        name: 'idx_np_imports_started_at',
        columnNames: ['started_at'],
      }),
    );

    await queryRunner.createForeignKey(
      'network_provider_imports',
      new TableForeignKey({
        name: 'FK_np_imports_operator',
        columnNames: ['operator_id'],
        referencedTableName: 'health_operators',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    // 8. Criar tabela network_provider_import_errors
    await queryRunner.createTable(
      new Table({
        name: 'network_provider_import_errors',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'import_id',
            type: 'uuid',
          },
          {
            name: 'row_number',
            type: 'int',
          },
          {
            name: 'column_name',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'reason',
            type: 'text',
          },
          {
            name: 'suggestion',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'row_data',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'network_provider_import_errors',
      new TableIndex({
        name: 'idx_np_import_errors_import_id',
        columnNames: ['import_id'],
      }),
    );

    await queryRunner.createForeignKey(
      'network_provider_import_errors',
      new TableForeignKey({
        name: 'FK_np_import_errors_import',
        columnNames: ['import_id'],
        referencedTableName: 'network_provider_imports',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remover tabelas em ordem reversa (respeitar foreign keys)

    // 8. network_provider_import_errors
    await queryRunner.dropForeignKey(
      'network_provider_import_errors',
      'FK_np_import_errors_import',
    );
    await queryRunner.dropIndex(
      'network_provider_import_errors',
      'idx_np_import_errors_import_id',
    );
    await queryRunner.dropTable('network_provider_import_errors');

    // 7. network_provider_imports
    await queryRunner.dropForeignKey(
      'network_provider_imports',
      'FK_np_imports_operator',
    );
    await queryRunner.dropIndex(
      'network_provider_imports',
      'idx_np_imports_started_at',
    );
    await queryRunner.dropIndex(
      'network_provider_imports',
      'idx_np_imports_status',
    );
    await queryRunner.dropIndex(
      'network_provider_imports',
      'idx_np_imports_operator_id',
    );
    await queryRunner.dropTable('network_provider_imports');

    // 6. network_provider_services
    await queryRunner.dropForeignKey(
      'network_provider_services',
      'FK_np_services_provider',
    );
    await queryRunner.dropIndex(
      'network_provider_services',
      'idx_np_services_category',
    );
    await queryRunner.dropIndex(
      'network_provider_services',
      'idx_np_services_provider_id',
    );
    await queryRunner.dropTable('network_provider_services');

    // 5. network_providers
    await queryRunner.dropForeignKey(
      'network_providers',
      'FK_network_providers_location',
    );
    await queryRunner.dropForeignKey(
      'network_providers',
      'FK_network_providers_operator',
    );
    await queryRunner.dropIndex(
      'network_providers',
      'uq_network_providers_operator_location_name',
    );
    await queryRunner.dropIndex(
      'network_providers',
      'idx_network_providers_is_active',
    );
    await queryRunner.dropIndex(
      'network_providers',
      'idx_network_providers_name',
    );
    await queryRunner.dropIndex(
      'network_providers',
      'idx_network_providers_location_hash',
    );
    await queryRunner.dropIndex(
      'network_providers',
      'idx_network_providers_operator_id',
    );
    await queryRunner.dropTable('network_providers');

    // 4. network_provider_locations
    await queryRunner.dropForeignKey(
      'network_provider_locations',
      'FK_np_locations_operator',
    );
    await queryRunner.dropIndex(
      'network_provider_locations',
      'idx_np_locations_geocoding_status',
    );
    await queryRunner.dropIndex(
      'network_provider_locations',
      'idx_np_locations_postal_code',
    );
    await queryRunner.dropIndex(
      'network_provider_locations',
      'idx_np_locations_state',
    );
    await queryRunner.dropIndex(
      'network_provider_locations',
      'idx_np_locations_city',
    );
    await queryRunner.dropIndex(
      'network_provider_locations',
      'idx_np_locations_operator_id',
    );
    await queryRunner.dropTable('network_provider_locations');

    // 3. audit_events
    await queryRunner.dropIndex('audit_events', 'idx_audit_events_created_at');
    await queryRunner.dropIndex('audit_events', 'idx_audit_events_user');
    await queryRunner.dropIndex('audit_events', 'idx_audit_events_entity');
    await queryRunner.dropIndex('audit_events', 'idx_audit_events_type');
    await queryRunner.dropTable('audit_events');

    // 2. Remover operator_id de tenants
    await queryRunner.dropForeignKey('tenants', 'FK_tenants_operator');
    await queryRunner.dropIndex('tenants', 'IDX_tenants_operator_id');
    await queryRunner.dropColumn('tenants', 'operator_id');

    // 1. Remover status de health_operators
    await queryRunner.dropIndex(
      'health_operators',
      'idx_health_operators_status',
    );
    await queryRunner.dropColumn('health_operators', 'status');
  }
}
