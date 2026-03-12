import { DataSource } from 'typeorm';
import { AppDataSource } from '../data-source';
import { CompanyEntity } from '../../modules/companies/infrastructure/entities/company.entity';

async function seedCompanies() {
  let dataSource: DataSource | undefined;

  try {
    dataSource = await AppDataSource.initialize();
    console.log('✅ Database connection established');

    const companyRepository = dataSource.getRepository(CompanyEntity);

    // Check if companies already exist
    const existingCompanies = await companyRepository.count();
    if (existingCompanies > 0) {
      console.log('⚠️  Companies already exist. Skipping seed.');
      await dataSource.destroy();
      return;
    }

    // Create sample companies
    const companies = [
      {
        name: 'Empresa Exemplo Ltda',
        cnpj: '12345678000190',
        email: 'contato@empresaexemplo.com.br',
        tenantId: 'tenant-123',
        baseUrl: 'https://empresaexemplo.com.br',
        active: true,
      },
      {
        name: 'Tech Solutions SA',
        cnpj: '98765432000111',
        email: 'contato@techsolutions.com.br',
        tenantId: 'tenant-456',
        baseUrl: 'https://techsolutions.com.br',
        active: true,
      },
      {
        name: 'Saúde Corporativa Brasil',
        cnpj: '11223344000155',
        email: 'contato@saudecorp.com.br',
        tenantId: 'tenant-789',
        baseUrl: 'https://saudecorp.com.br',
        active: true,
      },
    ];

    for (const companyData of companies) {
      const company = companyRepository.create(companyData);
      await companyRepository.save(company);
      console.log(`✅ Created company: ${company.name} (${company.cnpj})`);
    }

    console.log('✅ Companies seed completed successfully');
    await dataSource.destroy();
  } catch (error) {
    console.error('❌ Error seeding companies:', error);
    if (dataSource?.isInitialized) {
      await dataSource.destroy();
    }
    process.exit(1);
  }
}

seedCompanies();
