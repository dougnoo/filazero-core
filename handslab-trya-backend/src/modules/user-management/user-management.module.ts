import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { MulterModule } from '@nestjs/platform-express';
import { HealthPlansModule } from '../health-plans/health-plans.module';
import { HealthOperatorsModule } from '../health-operators/health-operators.module';
import { TenantModule } from '../tenant/tenant.module';
import { ExcelFileParserService } from './infrastructure/services/excel-file-parser.service';
import { ExcelDateParserService } from './infrastructure/services/excel-date-parser.service';
import { PlanManagementService } from './application/services/plan-management.service';
import { PlatformPlanValidationService } from './infrastructure/services/platform-plan-validation.service';
import {
  FILE_PARSER_SERVICE_TOKEN,
  DATE_PARSER_SERVICE_TOKEN,
  PLAN_MANAGEMENT_SERVICE_TOKEN,
  PLAN_VALIDATION_SERVICE_TOKEN,
} from './domain/services/service.tokens';
import { UserManagementController } from './presentation/controllers/user-management.controller';
import { CreateAdminUseCase } from './application/use-cases/create-admin/create-admin.use-case';
import { CreateHrUseCase } from './application/use-cases/create-hr/create-hr.use-case';
import { CreateBeneficiaryUseCase } from './application/use-cases/create-beneficiary/create-beneficiary.use-case';
import { ImportBeneficiariesUseCase } from './application/use-cases/import-beneficiaries/import-beneficiaries.use-case';
import { CreateDoctorUseCase } from './application/use-cases/create-doctor/create-doctor.use-case';
import { ListUsersUseCase } from './application/use-cases/list-users/list-users.use-case';
import { ListBeneficiariesUseCase } from './application/use-cases/list-beneficiaries/list-beneficiaries.use-case';
import { UpdateBeneficiaryUseCase } from './application/use-cases/update-beneficiary/update-beneficiary.use-case';
import { UpdateUserUseCase } from './application/use-cases/update-user/update-user.use-case';
import { DeleteUserUseCase } from './application/use-cases/delete-user/delete-user.use-case';
import { DeactivateBeneficiaryUseCase } from './application/use-cases/deactivate-beneficiary/deactivate-beneficiary.use-case';
import { DeactivateHrUseCase } from './application/use-cases/deactivate-hr/deactivate-hr.use-case';
import { ListEmployeesUseCase } from './application/use-cases/list-employees/list-employees.use-case';
import { UpdateHrUseCase } from './application/use-cases/update-hr/update-hr.use-case';
import { GetBeneficiaryUseCase } from './application/use-cases/get-beneficiary/get-beneficiary.use-case';
import { UserMapper } from './infrastructure/mappers/user.mapper';
import { CognitoUserRepository } from './infrastructure/repositories/cognito-user.repository';
import { TypeOrmUserRepository } from './infrastructure/repositories/typeorm-user.repository';
import { TypeOrmUserDetailRepository } from './infrastructure/repositories/typeorm-user-detail.repository';
import { USER_DETAIL_REPOSITORY_TOKEN } from './domain/repositories/user-detail.repository.interface';
import { CognitoSyncService } from './infrastructure/services/cognito-sync.service';
import { USER_REPOSITORY_TOKEN } from './domain/repositories/user.repository.token';
import { BENEFICIARY_DB_REPOSITORY_TOKEN } from './domain/repositories/beneficiary-db.repository.token';
import { BENEFICIARY_REPOSITORY_TOKEN } from './domain/repositories/beneficiary.repository.token';
import { EMPLOYEE_LIST_REPOSITORY_TOKEN } from './domain/repositories/employee-list.repository.interface';
import { HR_REPOSITORY_TOKEN } from './domain/repositories/hr.repository.interface';
import { COGNITO_SYNC_SERVICE_TOKEN } from './domain/services/cognito-sync.service.token';
import { AuthModule } from '../auth/auth.module';
import { User } from '../../database/entities/user.entity';
import { UserPlan } from '../../database/entities/user-plan.entity';
import { UserMedication } from '../../database/entities/user-medication.entity';
import { UserChronicCondition } from '../../database/entities/user-chronic-condition.entity';

@Module({
  imports: [
    ConfigModule,
    HttpModule,
    TypeOrmModule.forFeature([
      User,
      UserPlan,
      UserMedication,
      UserChronicCondition,
    ]),
    MulterModule.register({
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
    forwardRef(() => AuthModule),
    HealthPlansModule,
    HealthOperatorsModule,
    TenantModule,
  ],
  controllers: [UserManagementController],
  providers: [
    // Use Cases
    CreateAdminUseCase,
    CreateHrUseCase,
    CreateBeneficiaryUseCase,
    ImportBeneficiariesUseCase,
    CreateDoctorUseCase,
    ListUsersUseCase,
    ListBeneficiariesUseCase,
    GetBeneficiaryUseCase,
    UpdateBeneficiaryUseCase,
    UpdateUserUseCase,
    DeleteUserUseCase,
    DeactivateBeneficiaryUseCase,
    DeactivateHrUseCase,
    ListEmployeesUseCase,
    UpdateHrUseCase,

    // Mappers
    UserMapper,

    // Services
    {
      provide: COGNITO_SYNC_SERVICE_TOKEN,
      useClass: CognitoSyncService,
    },
    {
      provide: FILE_PARSER_SERVICE_TOKEN,
      useClass: ExcelFileParserService,
    },
    {
      provide: DATE_PARSER_SERVICE_TOKEN,
      useClass: ExcelDateParserService,
    },
    {
      provide: PLAN_MANAGEMENT_SERVICE_TOKEN,
      useClass: PlanManagementService,
    },
    {
      provide: PLAN_VALIDATION_SERVICE_TOKEN,
      useClass: PlatformPlanValidationService,
    },

    // Repositories
    {
      provide: USER_REPOSITORY_TOKEN,
      useClass: CognitoUserRepository,
    },
    {
      provide: BENEFICIARY_DB_REPOSITORY_TOKEN,
      useClass: TypeOrmUserRepository,
    },
    {
      provide: BENEFICIARY_REPOSITORY_TOKEN,
      useClass: TypeOrmUserRepository,
    },
    {
      provide: EMPLOYEE_LIST_REPOSITORY_TOKEN,
      useClass: TypeOrmUserRepository,
    },
    {
      provide: USER_DETAIL_REPOSITORY_TOKEN,
      useClass: TypeOrmUserDetailRepository,
    },
    {
      provide: HR_REPOSITORY_TOKEN,
      useClass: TypeOrmUserRepository,
    },
  ],
  exports: [
    USER_DETAIL_REPOSITORY_TOKEN,
    CreateAdminUseCase,
    CreateHrUseCase,
    CreateBeneficiaryUseCase,
    CreateDoctorUseCase,
    ListUsersUseCase,
    ListBeneficiariesUseCase,
    UpdateBeneficiaryUseCase,
    UpdateUserUseCase,
    DeleteUserUseCase,
    DeactivateBeneficiaryUseCase,
    DeactivateHrUseCase,
    ListEmployeesUseCase,
    UpdateHrUseCase,
    UserMapper,
    USER_REPOSITORY_TOKEN,
    BENEFICIARY_DB_REPOSITORY_TOKEN,
  ],
})
export class UserManagementModule {}
