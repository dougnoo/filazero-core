import AppDataSource from '../data-source';

/**
 * Script para corrigir usuários sem tenant_id
 * Atribui o tenant padrão "Grupo Trigo" para todos os usuários sem tenant
 */
async function main() {
  console.log('🔧 Iniciando correção de tenant_id...');

  await AppDataSource.initialize();
  const queryRunner = AppDataSource.createQueryRunner();

  await queryRunner.startTransaction();
  try {
    // Buscar o tenant padrão "Grupo Trigo"
    const tenantResult = await queryRunner.query(
      `SELECT id FROM public.tenants WHERE name = 'Grupo Trigo' LIMIT 1`,
    );

    if (!tenantResult || tenantResult.length === 0) {
      console.error('❌ Tenant "Grupo Trigo" não encontrado!');
      console.log('Execute o seed de tenants primeiro: npm run seed:tenants');
      process.exit(1);
    }

    const defaultTenantId = tenantResult[0].id;
    console.log(`Tenant padrão encontrado: ${defaultTenantId}`);

    // Atualizar todos os usuários que não têm tenant_id
    const updateResult = await queryRunner.query(
      `UPDATE public.users 
       SET tenant_id = $1, updated_at = now()
       WHERE tenant_id IS NULL`,
      [defaultTenantId],
    );

    console.log(`${updateResult[1]} usuário(s) atualizado(s) com tenant_id`);

    // Listar os usuários atualizados
    const updatedUsers = await queryRunner.query(
      `SELECT id, name, email, type, tenant_id 
       FROM public.users 
       WHERE tenant_id = $1 
       ORDER BY created_at DESC 
       LIMIT 10`,
      [defaultTenantId],
    );

    console.log('\n📋 Usuários com tenant_id atualizado (últimos 10):');
    updatedUsers.forEach((user: any) => {
      console.log(`  - ${user.name} (${user.email}) [${user.type}]`);
    });

    await queryRunner.commitTransaction();
    console.log('\nCorreção concluída com sucesso!');
  } catch (error) {
    await queryRunner.rollbackTransaction();
    console.error('❌ Erro ao corrigir tenant_id:', error);
    process.exit(1);
  } finally {
    await queryRunner.release();
    await AppDataSource.destroy();
  }
}

main();
