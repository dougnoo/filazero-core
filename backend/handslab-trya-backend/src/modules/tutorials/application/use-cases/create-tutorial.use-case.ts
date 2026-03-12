import { Injectable, Inject, ConflictException } from '@nestjs/common';
import type { ITutorialRepository } from '../../domain/repositories/tutorial.repository.interface';
import { TUTORIAL_REPOSITORY_TOKEN } from '../../domain/repositories/tutorial.repository.interface';
import { Tutorial } from '../../domain/entities/tutorial.entity';
import { UserRole } from '../../../../shared/domain/enums/user-role.enum';

@Injectable()
export class CreateTutorialUseCase {
  constructor(
    @Inject(TUTORIAL_REPOSITORY_TOKEN)
    private readonly tutorialRepository: ITutorialRepository,
  ) {}

  async execute(data: {
    code: string;
    title: string;
    description: string;
    version: string;
    targetRole: UserRole;
    isActive?: boolean;
    order?: number;
    tenantId: string;
  }) {
    const existing = await this.tutorialRepository.findByCode(
      data.code,
      data.tenantId,
    );

    if (existing) {
      throw new ConflictException(
        'Tutorial with this code already exists for this tenant',
      );
    }

    const tutorial = new Tutorial();
    tutorial.code = data.code;
    tutorial.title = data.title;
    tutorial.description = data.description;
    tutorial.version = data.version;
    tutorial.targetRole = data.targetRole;
    tutorial.isActive = data.isActive ?? true;
    tutorial.order = data.order ?? 0;
    tutorial.tenantId = data.tenantId;

    const created = await this.tutorialRepository.create(tutorial);

    console.log('[CreateTutorialUseCase] Tutorial created:', {
      code: created.code,
      title: created.title,
      targetRole: created.targetRole,
    });

    return created;
  }
}
