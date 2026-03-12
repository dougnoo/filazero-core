import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableIndex,
} from 'typeorm';

export class AddUserPersonalFields1766327803132 implements MigrationInterface {
  name = 'AddUserPersonalFields1766327803132';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add personal fields to users table using TypeORM's schema-aware methods
    await queryRunner.addColumns('users', [
      new TableColumn({
        name: 'cpf',
        type: 'varchar',
        length: '11',
        isNullable: true,
      }),
      new TableColumn({
        name: 'birth_date',
        type: 'date',
        isNullable: true,
      }),
    ]);

    // Create index for CPF field using TypeORM's schema-aware method
    await queryRunner.createIndex(
      'users',
      new TableIndex({
        name: 'idx_users_cpf',
        columnNames: ['cpf'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop index for CPF field using TypeORM's schema-aware method
    await queryRunner.dropIndex('users', 'idx_users_cpf');

    // Drop personal fields from users table using TypeORM's schema-aware method
    await queryRunner.dropColumns('users', ['birth_date', 'cpf']);
  }
}
