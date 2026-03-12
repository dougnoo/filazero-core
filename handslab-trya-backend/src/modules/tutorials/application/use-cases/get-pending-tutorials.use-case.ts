import { Injectable, Inject } from '@nestjs/common';
import type { ITutorialRepository } from '../../domain/repositories/tutorial.repository.interface';
import { TUTORIAL_REPOSITORY_TOKEN } from '../../domain/repositories/tutorial.repository.interface';
import { UserRole } from '../../../../shared/domain/enums/user-role.enum';

@Injectable()
export class GetPendingTutorialsUseCase {
  constructor(
    @Inject(TUTORIAL_REPOSITORY_TOKEN)
    private readonly tutorialRepository: ITutorialRepository,
  ) {}

  async execute(data: { email: string; tenantId: string; role: UserRole }) {
    const tutorials = await this.tutorialRepository.findPendingByUser(
      data.email,
      data.tenantId,
      data.role,
    );

    return tutorials.map((t) => ({
      id: t.id,
      code: t.code,
      title: t.title,
      description: t.description,
      version: t.version,
      order: t.order,
    }));
  }
}
