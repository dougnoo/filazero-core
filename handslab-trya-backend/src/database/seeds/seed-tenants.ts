import AppDataSource from '../../database/data-source';

async function main() {
  await AppDataSource.initialize();
  const queryRunner = AppDataSource.createQueryRunner();

  await queryRunner.startTransaction();
  try {
    // Criar tenants de exemplo
    await queryRunner.query(
      `INSERT INTO public.tenants (id, "name", active, created_at, updated_at)
       VALUES
         ('550e8400-e29b-41d4-a716-446655440000'::uuid, 'Grupo Trigo', true, now(), now()),
         ('550e8400-e29b-41d4-a716-446655440001'::uuid, 'Clínica Saúde', true, now(), now()),
         ('550e8400-e29b-41d4-a716-446655440002'::uuid, 'Laboratório Vida', true, now(), now())
       ON CONFLICT (name) DO UPDATE SET 
         id = EXCLUDED.id,
         active = EXCLUDED.active,
         updated_at = now()`,
    );

    await queryRunner.commitTransaction();

    console.log('Tenants seed inserted successfully.');

    console.log('📋 Tenants criados:');

    console.log('   - Grupo Trigo: 550e8400-e29b-41d4-a716-446655440000');

    console.log('   - Clínica Saúde: 550e8400-e29b-41d4-a716-446655440001');

    console.log('   - Laboratório Vida: 550e8400-e29b-41d4-a716-446655440002');
  } catch (err) {
    await queryRunner.rollbackTransaction();

    console.error('❌ Erro ao inserir tenants:', err);
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
