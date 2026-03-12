import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MedicalDocument } from '../../database/entities/medical-document.entity';
import { User } from '../../database/entities/user.entity';
import { AuthModule } from '../auth/auth.module';
import { InsightsController } from './presentation/controllers/insights.controller';
import { GetHealthInsightsUseCase } from './application/use-cases/get-health-insights.use-case';

@Module({
  imports: [
    TypeOrmModule.forFeature([MedicalDocument, User]),
    forwardRef(() => AuthModule),
  ],
  controllers: [InsightsController],
  providers: [GetHealthInsightsUseCase],
  exports: [GetHealthInsightsUseCase],
})
export class InsightsModule {}
