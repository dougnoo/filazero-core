import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration idempotente que cria o tutorial "onboarding-welcome"
 * para todos os tenants ativos que ainda não possuem este tutorial.
 *
 * Isso garante que beneficiários de qualquer tenant visualizem o
 * tour de boas-vindas no primeiro acesso.
 *
 * IMPORTANTE: Esta migration requer que a constraint UNIQUE do campo 'code'
 * tenha sido alterada para uma constraint composta (code + tenantId).
 * Certifique-se de executar a migration 1765599900000 antes desta.
 */
export class SeedOnboardingTutorialAllTenants1765600000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Gera UUIDs v4 usando gen_random_uuid() do PostgreSQL (requer extensão pgcrypto ou versão >= 13)
    // O INSERT ... SELECT insere um tutorial para cada tenant ativo que ainda não possui 'onboarding-welcome'
    await queryRunner.query(`
      INSERT INTO tutorials (id, code, title, description, version, "targetRole", "isActive", "order", "tenantId", "createdAt", "updatedAt")
      SELECT
        gen_random_uuid(),
        'onboarding-welcome',
        'Bem-vindo ao Trya',
        'Conheça as principais funcionalidades da plataforma',
        '1.0.0',
        'BENEFICIARY',
        true,
        1,
        t.id,
        now(),
        now()
      FROM tenants t
      WHERE t.active = true
        AND NOT EXISTS (
          SELECT 1 FROM tutorials tut
          WHERE tut."tenantId" = t.id
            AND tut.code = 'onboarding-welcome'
        )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove apenas os tutoriais criados por esta migration (onboarding-welcome)
    // Mantém outros tutoriais intactos
    await queryRunner.query(`
      DELETE FROM tutorials
      WHERE code = 'onboarding-welcome'
    `);
  }
}
