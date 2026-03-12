import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateIntegrationsTable1765582972544
  implements MigrationInterface
{
  name = 'CreateIntegrationsTable1765582972544';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'integration_configs',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'alias',
            type: 'varchar',
            length: '100',
          },
          {
            name: 'provider',
            type: 'varchar',
          },
          {
            name: 'type',
            type: 'varchar',
          },
          {
            name: 'apiKey',
            type: 'text',
          },
          {
            name: 'tenantId',
            type: 'uuid',
          },
          {
            name: 'isActive',
            type: 'boolean',
            default: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'integration_configs',
      new TableIndex({
        name: 'IDX_integration_configs_tenant',
        columnNames: ['tenantId'],
      }),
    );

    await queryRunner.createIndex(
      'integration_configs',
      new TableIndex({
        name: 'IDX_integration_configs_type_provider',
        columnNames: ['type', 'provider', 'isActive'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('integration_configs');
  }
}
