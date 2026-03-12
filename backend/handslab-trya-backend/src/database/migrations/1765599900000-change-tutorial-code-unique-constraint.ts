import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration que altera a constraint UNIQUE do campo 'code' na tabela 'tutorials'
 * de uma constraint simples para uma constraint composta (code + tenantId).
 *
 * Isso permite que múltiplos tenants tenham tutoriais com o mesmo código,
 * mas garante que dentro de um mesmo tenant não haja códigos duplicados.
 */
export class ChangeTutorialCodeUniqueConstraint1765599900000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Remove a constraint UNIQUE antiga do campo 'code'
    await queryRunner.query(`
      ALTER TABLE tutorials
      DROP CONSTRAINT IF EXISTS "UQ_2f3373afb78b20b73cb9f7f73e2"
    `);

    // Verifica se a constraint já existe antes de criar
    const constraintExists = await queryRunner.query(`
      SELECT 1 FROM pg_constraint 
      WHERE conname = 'UQ_tutorials_code_tenantId'
    `);

    // Cria a constraint apenas se não existir
    if (!constraintExists || constraintExists.length === 0) {
      await queryRunner.query(`
        ALTER TABLE tutorials
        ADD CONSTRAINT "UQ_tutorials_code_tenantId"
        UNIQUE (code, "tenantId")
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove a constraint composta
    await queryRunner.query(`
      ALTER TABLE tutorials
      DROP CONSTRAINT IF EXISTS "UQ_tutorials_code_tenantId"
    `);

    // Restaura a constraint UNIQUE simples no campo 'code'
    // ATENÇÃO: Isso só funcionará se não houver códigos duplicados na tabela
    await queryRunner.query(`
      ALTER TABLE tutorials
      ADD CONSTRAINT "UQ_2f3373afb78b20b73cb9f7f73e2"
      UNIQUE (code)
    `);
  }
}
