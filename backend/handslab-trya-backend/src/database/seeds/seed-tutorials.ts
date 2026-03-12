import AppDataSource from '../../database/data-source';
import { uuidv7 } from 'uuidv7';

const TENANT_IDS = [
  '550e8400-e29b-41d4-a716-446655440000', // Grupo Trigo
  '550e8400-e29b-41d4-a716-446655440001', // Clínica Saúde
  '550e8400-e29b-41d4-a716-446655440002', // Laboratório Vida
];

const TUTORIALS = [
  {
    code: 'onboarding-welcome',
    title: 'Bem-vindo ao Trya',
    description: 'Conheça as principais funcionalidades da plataforma',
    targetRole: 'BENEFICIARY',
    order: 1,
  },
  {
    code: 'complete-profile',
    title: 'Complete seu Perfil',
    description: 'Adicione suas informações de saúde para personalizar sua experiência',
    targetRole: 'BENEFICIARY',
    order: 2,
  },
  {
    code: 'schedule-consultations',
    title: 'Agende Consultas',
    description: 'Aprenda a agendar consultas e acompanhar sua triagem',
    targetRole: 'BENEFICIARY',
    order: 3,
  },
];

async function main() {
  await AppDataSource.initialize();
  const queryRunner = AppDataSource.createQueryRunner();

  await queryRunner.startTransaction();
  try {
    let insertedCount = 0;

    for (const tenantId of TENANT_IDS) {
      for (const tut of TUTORIALS) {
        const existing = await queryRunner.query(
          `SELECT id FROM tutorials WHERE code = $1 AND "tenantId" = $2`,
          [tut.code, tenantId],
        );

        if (existing.length > 0) {
          continue;
        }

        await queryRunner.query(
          `INSERT INTO tutorials (id, code, title, description, version, "targetRole", "isActive", "order", "tenantId", "createdAt", "updatedAt")
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, now(), now())`,
          [
            uuidv7(),
            tut.code,
            tut.title,
            tut.description,
            '1.0.0',
            tut.targetRole,
            true,
            tut.order,
            tenantId,
          ],
        );
        insertedCount++;
      }
    }

    await queryRunner.commitTransaction();

    console.log('✅ Tutorials seed executed successfully.');
    console.log(`📋 ${insertedCount} tutorial(s) inserido(s) ou já existentes.`);
    console.log('   - Bem-vindo ao Trya');
    console.log('   - Complete seu Perfil');
    console.log('   - Agende Consultas');
  } catch (err) {
    await queryRunner.rollbackTransaction();
    console.error('❌ Erro ao inserir tutorials:', err);
    process.exitCode = 1;
  } finally {
    await queryRunner.release();
    await AppDataSource.destroy();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
