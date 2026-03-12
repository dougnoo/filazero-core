import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../database/entities/user.entity';
import { MedicalDocument } from '../../database/entities/medical-document.entity';
import { TimelineEvent } from '../../database/entities/timeline-event.entity';
import { FamilyManagementController } from './presentation/controllers/family-management.controller';
import { GetFamilySidebarUseCase } from './application/use-cases/get-family-sidebar.use-case';
import { GetFamilyDashboardUseCase } from './application/use-cases/get-family-dashboard.use-case';
import { GetFamilyMemberDashboardUseCase } from './application/use-cases/get-family-member-dashboard.use-case';

@Module({
  imports: [TypeOrmModule.forFeature([User, MedicalDocument, TimelineEvent])],
  controllers: [FamilyManagementController],
  providers: [GetFamilySidebarUseCase, GetFamilyDashboardUseCase, GetFamilyMemberDashboardUseCase],
})
export class FamilyManagementModule {}
