import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompanyEntity } from './infrastructure/entities/company.entity';
import { COMPANY_REPOSITORY_TOKEN } from './domain/repositories/company.repository.token';
import { TypeORMCompanyRepository } from './infrastructure/repositories/typeorm-company.repository';

@Module({
  imports: [TypeOrmModule.forFeature([CompanyEntity])],
  providers: [
    {
      provide: COMPANY_REPOSITORY_TOKEN,
      useClass: TypeORMCompanyRepository,
    },
  ],
  exports: [COMPANY_REPOSITORY_TOKEN],
})
export class CompaniesModule {}
