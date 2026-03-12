import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateTutorialsTables1704067200000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'tutorials',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
          },
          {
            name: 'code',
            type: 'varchar',
            isUnique: true,
          },
          {
            name: 'title',
            type: 'varchar',
          },
          {
            name: 'description',
            type: 'text',
          },
          {
            name: 'version',
            type: 'varchar',
          },
          {
            name: 'targetRole',
            type: 'varchar',
          },
          {
            name: 'isActive',
            type: 'boolean',
            default: true,
          },
          {
            name: 'order',
            type: 'int',
            default: 0,
          },
          {
            name: 'tenantId',
            type: 'uuid',
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
      'tutorials',
      new TableIndex({
        name: 'IDX_TUTORIALS_TENANT',
        columnNames: ['tenantId'],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'user_tutorial',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
          },
          {
            name: 'userId',
            type: 'uuid',
          },
          {
            name: 'tutorialId',
            type: 'uuid',
          },
          {
            name: 'completedAt',
            type: 'timestamp',
          },
          {
            name: 'skipped',
            type: 'boolean',
            default: false,
          },
          {
            name: 'tenantId',
            type: 'uuid',
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
      'user_tutorial',
      new TableIndex({
        name: 'IDX_USER_TUTORIAL_PROGRESS_TENANT',
        columnNames: ['tenantId'],
      }),
    );

    await queryRunner.createIndex(
      'user_tutorial',
      new TableIndex({
        name: 'IDX_USER_TUTORIAL_PROGRESS_USER',
        columnNames: ['userId'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('user_tutorial');
    await queryRunner.dropTable('tutorials');
  }
}
