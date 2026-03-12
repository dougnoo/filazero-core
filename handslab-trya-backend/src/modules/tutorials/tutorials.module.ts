import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tutorial } from './domain/entities/tutorial.entity';
import { UserTutorialProgress } from './domain/entities/user-tutorial-progress.entity';
import { TUTORIAL_REPOSITORY_TOKEN } from './domain/repositories/tutorial.repository.interface';
import { TypeOrmTutorialRepository } from './infrastructure/repositories/typeorm-tutorial.repository';
import { GetPendingTutorialsUseCase } from './application/use-cases/get-pending-tutorials.use-case';
import { CompleteTutorialUseCase } from './application/use-cases/complete-tutorial.use-case';
import { CreateTutorialUseCase } from './application/use-cases/create-tutorial.use-case';
import { TutorialController } from './presentation/controllers/tutorial.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Tutorial, UserTutorialProgress])],
  controllers: [TutorialController],
  providers: [
    {
      provide: TUTORIAL_REPOSITORY_TOKEN,
      useClass: TypeOrmTutorialRepository,
    },
    GetPendingTutorialsUseCase,
    CompleteTutorialUseCase,
    CreateTutorialUseCase,
  ],
  exports: [TUTORIAL_REPOSITORY_TOKEN],
})
export class TutorialsModule {}
