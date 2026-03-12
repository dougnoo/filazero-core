import AppDataSource from '../../database/data-source';

async function main() {
  await AppDataSource.initialize();
  const queryRunner = AppDataSource.createQueryRunner();

  await queryRunner.startTransaction();
  try {
    // Primeiro, obter IDs das operadoras existentes
    const operators = await queryRunner.query(
      `SELECT id, name FROM public.health_operators ORDER BY name`,
    );

    if (operators.length === 0) {
      console.log(
        '⚠️  Nenhuma operadora encontrada. Execute seed:health-operators primeiro.',
      );
      await queryRunner.commitTransaction();
      return;
    }

    // Criar planos de saúde para cada operadora
    const plans = [
      // Amil
      {
        operator: 'Amil',
        plans: [
          'Empresarial Executivo',
          'Individual S750',
          'PME Flex 450',
          'Fácil 200',
        ],
      },
      // Bradesco Saúde
      {
        operator: 'Bradesco Saúde',
        plans: ['Top Nacional', 'Nacional Flex', 'Efetivo', 'Essencial Plus'],
      },
      // SulAmérica
      {
        operator: 'SulAmérica',
        plans: ['Exato', 'Clássico Nacional', 'Especial 100', 'Direto'],
      },
      // Unimed
      {
        operator: 'Unimed',
        plans: [
          'Federal Premium',
          'Federal Básico',
          'Federal Ambulatorial',
          'Federal Hospitalar',
        ],
      },
      // NotreDame Intermédica
      {
        operator: 'NotreDame Intermédica',
        plans: ['Premium', 'Executivo', 'Básico', 'Smart'],
      },
      // Porto Seguro Saúde
      {
        operator: 'Porto Seguro Saúde',
        plans: ['Plus', 'Premium', 'Top', 'Básico'],
      },
      // Hapvida
      {
        operator: 'Hapvida',
        plans: [
          'Total',
          'Mais Saúde',
          'Ambulatorial',
          'Hospitalar com Obstetrícia',
        ],
      },
      // Prevent Senior
      {
        operator: 'Prevent Senior',
        plans: ['Prata', 'Ouro', 'Diamante', 'Básico'],
      },
      // Care Plus
      { operator: 'Care Plus', plans: ['Master', 'Gold', 'Silver', 'Bronze'] },
      // Golden Cross
      {
        operator: 'Golden Cross',
        plans: ['Executivo A', 'Executivo B', 'Luxo', 'Super Luxo'],
      },
      // Allianz Saúde
      {
        operator: 'Allianz Saúde',
        plans: [
          'Nacional Premium',
          'Regional Premium',
          'Nacional Básico',
          'Regional Básico',
        ],
      },
      // São Francisco Saúde
      {
        operator: 'São Francisco Saúde',
        plans: ['Premium Nacional', 'Executivo', 'Master', 'Smart'],
      },
    ];

    let insertedCount = 0;

    for (const planGroup of plans) {
      const operator = operators.find(
        (op: any) => op.name === planGroup.operator,
      );

      if (!operator) {
        console.log(
          `⚠️  Operadora ${planGroup.operator} não encontrada, pulando...`,
        );
        continue;
      }

      for (const planName of planGroup.plans) {
        // Verificar se o plano já existe
        const existing = await queryRunner.query(
          `SELECT id FROM public.health_plans WHERE name = $1 AND operator_id = $2`,
          [planName, operator.id],
        );

        if (existing.length === 0) {
          await queryRunner.query(
            `INSERT INTO public.health_plans (id, "name", operator_id, created_at, updated_at)
             VALUES(gen_random_uuid(), $1, $2, now(), now())`,
            [planName, operator.id],
          );
          insertedCount++;
        }
      }
    }

    await queryRunner.commitTransaction();

    // Verificar total de planos no banco
    const totalPlans = await queryRunner.query(
      `SELECT COUNT(*) as total FROM public.health_plans`,
    );

    console.log(`Health Plans seed executed successfully.`);

    console.log(`📋 ${insertedCount} novo(s) plano(s) inserido(s)`);

    console.log(`🏥 Total de planos no banco: ${totalPlans[0].count}`);

    console.log(`🏢 Distribuídos entre ${operators.length} operadoras`);
  } catch (err) {
    await queryRunner.rollbackTransaction();

    console.error('❌ Erro ao inserir planos de saúde:', err);
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
