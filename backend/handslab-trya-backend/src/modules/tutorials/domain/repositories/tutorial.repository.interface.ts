import { Tutorial } from '../entities/tutorial.entity';
import { UserTutorialProgress } from '../entities/user-tutorial-progress.entity';
import { UserRole } from '../../../../shared/domain/enums/user-role.enum';

export interface ITutorialRepository {
  findPendingByUser(
    email: string,
    tenantId: string,
    role: UserRole,
  ): Promise<Tutorial[]>;
  findById(id: string, tenantId: string): Promise<Tutorial | null>;
  findByCode(code: string, tenantId: string): Promise<Tutorial | null>;
  create(tutorial: Tutorial): Promise<Tutorial>;
  saveProgress(data: {
    email: string;
    tutorialId: string;
    tenantId: string;
    completedAt: Date;
    skipped: boolean;
  }): Promise<UserTutorialProgress>;
}

export const TUTORIAL_REPOSITORY_TOKEN = 'TUTORIAL_REPOSITORY_TOKEN';
