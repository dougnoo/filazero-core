/**
 * Seed script para criar usuários de desenvolvimento
 * Cria um usuário de cada tipo para cada tenant
 * Beneficiários recebem plano de saúde e alguns têm onboarded_at para simular fluxo completo
 *
 * Execute com: npm run seed:dev-users
 */
import AppDataSource from '../../database/data-source';

// IDs fixos (criados em seeds anteriores)
const TENANTS = {
  GRUPO_TRIGO: '550e8400-e29b-41d4-a716-446655440000',
  CLINICA_SAUDE: '550e8400-e29b-41d4-a716-446655440001',
  LABORATORIO_VIDA: '550e8400-e29b-41d4-a716-446655440002',
};

const BROKER_GRUPO_TRIGO = 'e364bcc1-1ea6-4e8f-98c0-dfed1039cbed';

// Plano Empresarial QC (criado em seed-initial-config / seed-health-plans)
const PLAN_EMPRESARIAL_QC = '58cfea4b-a5d9-4507-9f01-263cd7243fa2';

// Usuários de desenvolvimento para cada tenant
const DEV_USERS = [
  // ==================== GRUPO TRIGO ====================
  // SUPER_ADMIN (sem tenant - acesso global)
  {
    name: 'Super Admin Dev',
    cpf: '00000000001',
    birthDate: '1980-01-01',
    email: 'superadmin.dev@trya.com',
    phone: '+5511900000001',
    type: 'SUPER_ADMIN',
    tenantId: null,
    brokerId: null,
    cognitoId: null,
    onboardedAt: null,
  },
  // ADMIN - Grupo Trigo
  {
    name: 'Admin Grupo Trigo',
    cpf: '00000000002',
    birthDate: '1985-02-15',
    email: 'admin.trigo@trya.com',
    phone: '+5511900000002',
    type: 'ADMIN',
    tenantId: TENANTS.GRUPO_TRIGO,
    brokerId: null,
    cognitoId: null,
    onboardedAt: null,
  },
  // DOCTOR - Grupo Trigo
  {
    name: 'Dr. João Silva (Trigo)',
    cpf: '00000000003',
    birthDate: '1975-03-20',
    email: 'medico.trigo@trya.com',
    phone: '+5511900000003',
    type: 'DOCTOR',
    tenantId: TENANTS.GRUPO_TRIGO,
    brokerId: null,
    cognitoId: null,
    onboardedAt: null,
  },
  // HR - Grupo Trigo
  {
    name: 'Maria RH Grupo Trigo',
    cpf: '00000000004',
    birthDate: '1990-04-10',
    email: 'rh.trigo@trya.com',
    phone: '+5511900000004',
    type: 'HR',
    tenantId: TENANTS.GRUPO_TRIGO,
    brokerId: null,
    cognitoId: null,
    onboardedAt: null,
  },
  // BENEFICIARY - Grupo Trigo (com onboarding completo para testar fluxo pós-onboarding)
  {
    name: 'Ana Beneficiária Trigo',
    cpf: '00000000005',
    birthDate: '1995-05-25',
    email: 'beneficiario.trigo@trya.com',
    phone: '+5511900000005',
    type: 'BENEFICIARY',
    tenantId: TENANTS.GRUPO_TRIGO,
    brokerId: BROKER_GRUPO_TRIGO,
    cognitoId: null,
    onboardedAt: new Date().toISOString(),
  },

  // ==================== CLÍNICA SAÚDE ====================
  // ADMIN - Clínica Saúde
  {
    name: 'Admin Clínica Saúde',
    cpf: '00000000006',
    birthDate: '1982-06-12',
    email: 'admin.clinica@trya.com',
    phone: '+5511900000006',
    type: 'ADMIN',
    tenantId: TENANTS.CLINICA_SAUDE,
    brokerId: null,
    cognitoId: null,
    onboardedAt: null,
  },
  // DOCTOR - Clínica Saúde
  {
    name: 'Dra. Paula Santos (Clínica)',
    cpf: '00000000007',
    birthDate: '1978-07-18',
    email: 'medico.clinica@trya.com',
    phone: '+5511900000007',
    type: 'DOCTOR',
    tenantId: TENANTS.CLINICA_SAUDE,
    brokerId: null,
    cognitoId: null,
    onboardedAt: null,
  },
  // HR - Clínica Saúde
  {
    name: 'Carlos RH Clínica',
    cpf: '00000000008',
    birthDate: '1988-08-22',
    email: 'rh.clinica@trya.com',
    phone: '+5511900000008',
    type: 'HR',
    tenantId: TENANTS.CLINICA_SAUDE,
    brokerId: null,
    cognitoId: null,
    onboardedAt: null,
  },
  // BENEFICIARY - Clínica Saúde (sem onboarded_at para testar fluxo de onboarding)
  {
    name: 'Pedro Beneficiário Clínica',
    cpf: '00000000009',
    birthDate: '1992-09-30',
    email: 'beneficiario.clinica@trya.com',
    phone: '+5511900000009',
    type: 'BENEFICIARY',
    tenantId: TENANTS.CLINICA_SAUDE,
    brokerId: null,
    cognitoId: null,
    onboardedAt: null,
  },

  // ==================== LABORATÓRIO VIDA ====================
  // ADMIN - Laboratório Vida
  {
    name: 'Admin Laboratório Vida',
    cpf: '00000000010',
    birthDate: '1984-10-05',
    email: 'admin.lab@trya.com',
    phone: '+5511900000010',
    type: 'ADMIN',
    tenantId: TENANTS.LABORATORIO_VIDA,
    brokerId: null,
    cognitoId: null,
    onboardedAt: null,
  },
  // DOCTOR - Laboratório Vida
  {
    name: 'Dr. Roberto Lima (Lab)',
    cpf: '00000000011',
    birthDate: '1970-11-15',
    email: 'medico.lab@trya.com',
    phone: '+5511900000011',
    type: 'DOCTOR',
    tenantId: TENANTS.LABORATORIO_VIDA,
    brokerId: null,
    cognitoId: null,
    onboardedAt: null,
  },
  // HR - Laboratório Vida
  {
    name: 'Fernanda RH Lab',
    cpf: '00000000012',
    birthDate: '1991-12-20',
    email: 'rh.lab@trya.com',
    phone: '+5511900000012',
    type: 'HR',
    tenantId: TENANTS.LABORATORIO_VIDA,
    brokerId: null,
    cognitoId: null,
    onboardedAt: null,
  },
  // BENEFICIARY - Laboratório Vida
  {
    name: 'Lucas Beneficiário Lab',
    cpf: '00000000013',
    birthDate: '1998-01-08',
    email: 'beneficiario.lab@trya.com',
    phone: '+5511900000013',
    type: 'BENEFICIARY',
    tenantId: TENANTS.LABORATORIO_VIDA,
    brokerId: null,
    cognitoId: null,
    onboardedAt: null,
  },
];

async function main() {
  await AppDataSource.initialize();
  const queryRunner = AppDataSource.createQueryRunner();

  await queryRunner.startTransaction();
  try {
    console.log('🌱 Criando usuários de desenvolvimento...\n');

    // Garantir que o broker Grupo Trigo existe (necessário para beneficiários)
    await queryRunner.query(
      `INSERT INTO public.brokers (id, "name", created_at, updated_at)
       VALUES ($1::uuid, $2, now(), now())
       ON CONFLICT (id) DO NOTHING`,
      [BROKER_GRUPO_TRIGO, 'Grupo Trigo'],
    );

    // Garantir que o plano Empresarial QC existe (para vincular beneficiários)
    const planExistsCheck = await queryRunner.query(
      `SELECT id FROM public.health_plans WHERE id = $1::uuid`,
      [PLAN_EMPRESARIAL_QC],
    );
    if (planExistsCheck.length === 0) {
      const amilOp = await queryRunner.query(
        `SELECT id FROM public.health_operators WHERE name = 'Amil' LIMIT 1`,
      );
      if (amilOp.length > 0) {
        await queryRunner.query(
          `INSERT INTO public.health_plans (id, "name", operator_id, created_at, updated_at)
           VALUES ($1::uuid, 'Empresarial QC', $2, now(), now())`,
          [PLAN_EMPRESARIAL_QC, amilOp[0].id],
        );
      }
    }

    const createdUserIds: { email: string; id: string }[] = [];

    for (const user of DEV_USERS) {
      const existing = await queryRunner.query(
        `SELECT id FROM public.users WHERE cpf = $1`,
        [user.cpf],
      );

      if (existing.length > 0) {
        console.log(`⏭️  Usuário já existe: ${user.email} (${user.type})`);
        continue;
      }

      const result = await queryRunner.query(
        `INSERT INTO public.users 
         (id, name, cpf, birth_date, email, phone, type, tenant_id, broker_id, cognito_id, onboarded_at, created_at, updated_at)
         VALUES 
         (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, now(), now())
         RETURNING id`,
        [
          user.name,
          user.cpf,
          user.birthDate,
          user.email,
          user.phone,
          user.type,
          user.tenantId,
          user.brokerId ?? null,
          user.cognitoId,
          user.onboardedAt ?? null,
        ],
      );

      const userId = result[0]?.id;
      if (userId) {
        createdUserIds.push({ email: user.email, id: userId });
      }

      console.log(
        `✅ Criado: ${user.email} (${user.type}) - Tenant: ${user.tenantId || 'GLOBAL'}`,
      );
    }

    // Vincular beneficiários ao plano de saúde (user_plans)
    const planExists = await queryRunner.query(
      `SELECT id FROM public.health_plans WHERE id = $1`,
      [PLAN_EMPRESARIAL_QC],
    );

    if (planExists.length > 0) {
      const beneficiaryEmails = [
        'beneficiario.trigo@trya.com',
        'beneficiario.clinica@trya.com',
        'beneficiario.lab@trya.com',
      ];

      for (const { email, id } of createdUserIds) {
        if (!beneficiaryEmails.includes(email)) continue;

        const hasPlan = await queryRunner.query(
          `SELECT 1 FROM public.user_plans WHERE user_id = $1`,
          [id],
        );
        if (hasPlan.length > 0) continue;

        await queryRunner.query(
          `INSERT INTO public.user_plans (id, user_id, plan_id, active_until, card_number, created_at, updated_at)
           VALUES (gen_random_uuid(), $1, $2, '2030-12-31', $3, now(), now())
           ON CONFLICT (user_id, plan_id) DO NOTHING`,
          [id, PLAN_EMPRESARIAL_QC, `SEED-${id.substring(0, 8)}`],
        );
        console.log(`   📋 Plano vinculado: ${email}`);
      }
    }

    await queryRunner.commitTransaction();

    console.log('\n' + '='.repeat(60));
    console.log('📋 RESUMO DOS USUÁRIOS DE DESENVOLVIMENTO');
    console.log('='.repeat(60));
    console.log('\n🔐 Para fazer login, você precisa:');
    console.log('   1. Criar usuários no AWS Cognito com os emails acima');
    console.log(
      '   2. Adicionar aos grupos correspondentes (SUPER_ADMIN, ADMIN, DOCTOR, HR, BENEFICIARY)',
    );
    console.log('   3. Atualizar o cognito_id no banco com o Sub do Cognito');
    console.log('\n📧 Emails por Tipo:');
    console.log('\n   SUPER_ADMIN (acesso global):');
    console.log('   - superadmin.dev@trya.com');
    console.log('\n   GRUPO TRIGO:');
    console.log('   - admin.trigo@trya.com (ADMIN)');
    console.log('   - medico.trigo@trya.com (DOCTOR)');
    console.log('   - rh.trigo@trya.com (HR)');
    console.log('   - beneficiario.trigo@trya.com (BENEFICIARY)');
    console.log('\n   CLÍNICA SAÚDE:');
    console.log('   - admin.clinica@trya.com (ADMIN)');
    console.log('   - medico.clinica@trya.com (DOCTOR)');
    console.log('   - rh.clinica@trya.com (HR)');
    console.log('   - beneficiario.clinica@trya.com (BENEFICIARY)');
    console.log('\n   LABORATÓRIO VIDA:');
    console.log('   - admin.lab@trya.com (ADMIN)');
    console.log('   - medico.lab@trya.com (DOCTOR)');
    console.log('   - rh.lab@trya.com (HR)');
    console.log('   - beneficiario.lab@trya.com (BENEFICIARY)');
    console.log('\n🔑 Senha sugerida para desenvolvimento: Trya@2024!');
    console.log('='.repeat(60) + '\n');
  } catch (err) {
    await queryRunner.rollbackTransaction();
    console.error('❌ Erro ao criar usuários:', err);
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
