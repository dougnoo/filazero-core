import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableIndex,
  TableForeignKey,
} from 'typeorm';

export class CreateNotificationsTable1767909429128
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    const tableExists = await queryRunner.hasTable('notifications');
    
    if (!tableExists) {
      await queryRunner.createTable(
        new Table({
          name: 'notifications',
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
              name: 'category',
              type: 'varchar',
              isNullable: false,
            },
            {
              name: 'session_id',
              type: 'varchar',
              isNullable: true,
            },
            {
              name: 'read',
              type: 'boolean',
              default: false,
            },
            {
              name: 'read_at',
              type: 'timestamp',
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

      await queryRunner.createForeignKey(
        'notifications',
        new TableForeignKey({
          columnNames: ['user_id'],
          referencedColumnNames: ['id'],
          referencedTableName: 'users',
          onDelete: 'CASCADE',
        }),
      );

      await queryRunner.createIndex(
        'notifications',
        new TableIndex({
          name: 'IDX_notifications_user_id',
          columnNames: ['user_id'],
        }),
      );

      await queryRunner.createIndex(
        'notifications',
        new TableIndex({
          name: 'IDX_notifications_session_id',
          columnNames: ['session_id'],
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('notifications');
  }
}
