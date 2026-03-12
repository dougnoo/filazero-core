import AppDataSource from '../../database/data-source';

async function main() {
  await AppDataSource.initialize();
  const queryRunner = AppDataSource.createQueryRunner();

  await queryRunner.startTransaction();
  try {
    // tenants (garantir que existe um tenant padrão)
    await queryRunner.query(
      `INSERT INTO public.tenants (id, "name", active, created_at, updated_at)
       VALUES('550e8400-e29b-41d4-a716-446655440000'::uuid, 'Grupo Trigo', true, now(), now())
       ON CONFLICT (name) DO NOTHING`,
    );

    // brokers
    await queryRunner.query(
      `INSERT INTO public.brokers (id, "name", created_at, updated_at)
       VALUES('e364bcc1-1ea6-4e8f-98c0-dfed1039cbed'::uuid, 'Grupo Trigo', '2025-10-30 09:12:07.285', '2025-10-30 09:12:07.285')
       ON CONFLICT (id) DO NOTHING`,
    );

    // health_plans
    await queryRunner.query(
      `INSERT INTO public.health_plans (id, "name", operator_id, created_at, updated_at)
       VALUES('58cfea4b-a5d9-4507-9f01-263cd7243fa2'::uuid, 'Empresarial QC', '965bc7b0-7b5a-41d8-b81d-dd68042966c9'::uuid, '2025-10-30 09:20:41.958', '2025-10-30 09:20:41.958')
       ON CONFLICT (id) DO NOTHING`,
    );

    // users (com tenant_id)
    await queryRunner.query(
      `INSERT INTO public.users(id, "name", cpf, birth_date, phone, email, "type", created_at, updated_at, broker_id, allergies, onboarding_skipped, onboarded_at, cognito_id, tenant_id)
       VALUES('3017c88d-acdf-4be3-9443-36083f13836d'::uuid, 'Mário Gael Levi da Mota', '70041567617', '1946-10-10', '68991515613', 'cowexi2895@1fandoe.com', 'BENEFICIARY', '2025-10-30 09:19:45.159', '2025-11-03 13:49:20.978', 'e364bcc1-1ea6-4e8f-98c0-dfed1039cbed'::uuid, 'poeira', false, '2025-11-03 10:49:26.249', 'cognito-id-123', '550e8400-e29b-41d4-a716-446655440000'::uuid)
       ON CONFLICT (id) DO NOTHING`,
    );

    // user_plans
    await queryRunner.query(
      `INSERT INTO public.user_plans (id, user_id, plan_id, active_until, card_number, created_at, updated_at)
       VALUES('52d444ef-ba66-45fc-9bb7-86c9e4a3c9d5'::uuid, '3017c88d-acdf-4be3-9443-36083f13836d'::uuid, '58cfea4b-a5d9-4507-9f01-263cd7243fa2'::uuid, '2030-10-25', '123456789', '2025-10-30 09:22:01.085', '2025-10-30 09:22:01.085')
       ON CONFLICT (user_id, plan_id) DO NOTHING`,
    );

    await queryRunner.commitTransaction();

    console.log('Initial config seed inserted successfully.');
  } catch (err) {
    await queryRunner.rollbackTransaction();

    console.error(err);
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
