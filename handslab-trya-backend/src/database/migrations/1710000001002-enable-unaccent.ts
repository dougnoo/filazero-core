import { MigrationInterface, QueryRunner } from 'typeorm';

export class EnableUnaccent1710000001002 implements MigrationInterface {
  name = 'EnableUnaccent1710000001002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS unaccent`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Não removemos a extensão para evitar impactos em outros objetos que possam depender dela
  }
}
