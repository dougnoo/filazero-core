import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableIndex,
} from 'typeorm';

export class AddCognitoIdAndTenantIdToUsers1730739000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Adicionar coluna cognito_id
    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'cognito_id',
        type: 'varchar',
        isNullable: true,
        isUnique: true,
      }),
    );

    // Adicionar coluna tenant_id
    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'tenant_id',
        type: 'varchar',
        isNullable: true,
      }),
    );

    // Criar índice único para cognito_id
    await queryRunner.createIndex(
      'users',
      new TableIndex({
        name: 'IDX_USERS_COGNITO_ID',
        columnNames: ['cognito_id'],
        isUnique: true,
      }),
    );

    // Criar índice para tenant_id para facilitar buscas
    await queryRunner.createIndex(
      'users',
      new TableIndex({
        name: 'IDX_USERS_TENANT_ID',
        columnNames: ['tenant_id'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remover índices
    await queryRunner.dropIndex('users', 'IDX_USERS_TENANT_ID');
    await queryRunner.dropIndex('users', 'IDX_USERS_COGNITO_ID');

    // Remover colunas
    await queryRunner.dropColumn('users', 'tenant_id');
    await queryRunner.dropColumn('users', 'cognito_id');
  }
}
