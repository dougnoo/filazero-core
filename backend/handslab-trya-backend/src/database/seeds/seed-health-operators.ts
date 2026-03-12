import AppDataSource from '../../database/data-source';

async function main() {
  await AppDataSource.initialize();
  const queryRunner = AppDataSource.createQueryRunner();

  await queryRunner.startTransaction();
  try {
    // Criar operadoras de saúde brasileiras
    await queryRunner.query(
      `INSERT INTO public.health_operators (id, "name", created_at, updated_at)
       VALUES
         ('965bc7b0-7b5a-41d8-b81d-dd68042966c9'::uuid, 'Amil', now(), now()),
         ('b2c3d4e5-f6a7-48b9-c0d1-e2f3a4b5c6d7'::uuid, 'Bradesco Saúde', now(), now()),
         ('c3d4e5f6-a7b8-49c0-d1e2-f3a4b5c6d7e8'::uuid, 'SulAmérica', now(), now()),
         ('d4e5f6a7-b8c9-40d1-e2f3-a4b5c6d7e8f9'::uuid, 'Unimed', now(), now()),
         ('e5f6a7b8-c9d0-41e2-f3a4-b5c6d7e8f9a0'::uuid, 'NotreDame Intermédica', now(), now()),
         ('f6a7b8c9-d0e1-42f3-a4b5-c6d7e8f9a0b1'::uuid, 'Porto Seguro Saúde', now(), now()),
         ('a7b8c9d0-e1f2-43a4-b5c6-d7e8f9a0b1c2'::uuid, 'Hapvida', now(), now()),
         ('b8c9d0e1-f2a3-44b5-c6d7-e8f9a0b1c2d3'::uuid, 'Prevent Senior', now(), now()),
         ('c9d0e1f2-a3b4-45c6-d7e8-f9a0b1c2d3e4'::uuid, 'Care Plus', now(), now()),
         ('d0e1f2a3-b4c5-46d7-e8f9-a0b1c2d3e4f5'::uuid, 'Golden Cross', now(), now()),
         ('e1f2a3b4-c5d6-47e8-f9a0-b1c2d3e4f5a6'::uuid, 'Allianz Saúde', now(), now()),
         ('f2a3b4c5-d6e7-48f9-a0b1-c2d3e4f5a6b7'::uuid, 'São Francisco Saúde', now(), now())
       ON CONFLICT (name) DO UPDATE SET 
         updated_at = now()`,
    );

    await queryRunner.commitTransaction();

    console.log('Health Operators seed inserted successfully.');

    console.log('📋 Operadoras de saúde criadas:');

    console.log('   - Amil');

    console.log('   - Bradesco Saúde');

    console.log('   - SulAmérica');

    console.log('   - Unimed');

    console.log('   - NotreDame Intermédica');

    console.log('   - Porto Seguro Saúde');

    console.log('   - Hapvida');

    console.log('   - Prevent Senior');

    console.log('   - Care Plus');

    console.log('   - Golden Cross');

    console.log('   - Allianz Saúde');

    console.log('   - São Francisco Saúde');
  } catch (err) {
    await queryRunner.rollbackTransaction();

    console.error('❌ Erro ao inserir operadoras de saúde:', err);
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
