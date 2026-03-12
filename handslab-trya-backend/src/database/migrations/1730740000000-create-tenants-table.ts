import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableIndex,
  TableForeignKey,
} from 'typeorm';

export class CreateTenantsTable1730740000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Criar tabela de tenants
    await queryRunner.createTable(
      new Table({
        name: 'tenants',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'name',
            type: 'varchar',
            isUnique: true,
          },
          {
            name: 'active',
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
      'tenants',
      new TableIndex({
        name: 'IDX_TENANTS_NAME',
        columnNames: ['name'],
        isUnique: true,
      }),
    );

    // Atualizar coluna tenant_id na tabela users para ser UUID
    // Primeiro verificar se a coluna existe e se já não é UUID
    const hasColumn = await queryRunner.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'tenant_id'
    `);

    if (
      hasColumn &&
      hasColumn.length > 0 &&
      hasColumn[0].data_type !== 'uuid'
    ) {
      // Converter apenas se não for UUID
      await queryRunner.query(
        `ALTER TABLE users ALTER COLUMN tenant_id TYPE uuid USING tenant_id::uuid`,
      );
    }

    // Criar foreign key entre users e tenants
    await queryRunner.createForeignKey(
      'users',
      new TableForeignKey({
        name: 'FK_USERS_TENANT',
        columnNames: ['tenant_id'],
        referencedTableName: 'tenants',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remover foreign key
    await queryRunner.dropForeignKey('users', 'FK_USERS_TENANT');

    // Reverter tipo da coluna tenant_id
    await queryRunner.query(
      `ALTER TABLE users ALTER COLUMN tenant_id TYPE varchar`,
    );

    // Remover índice
    await queryRunner.dropIndex('tenants', 'IDX_TENANTS_NAME');

    // Remover tabela
    await queryRunner.dropTable('tenants');
  }
}
