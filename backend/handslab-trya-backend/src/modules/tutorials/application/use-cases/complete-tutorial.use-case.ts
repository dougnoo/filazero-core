import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import type { ITutorialRepository } from '../../domain/repositories/tutorial.repository.interface';
import { TUTORIAL_REPOSITORY_TOKEN } from '../../domain/repositories/tutorial.repository.interface';

@Injectable()
export class CompleteTutorialUseCase {
  constructor(
    @Inject(TUTORIAL_REPOSITORY_TOKEN)
    private readonly tutorialRepository: ITutorialRepository,
  ) {}

  async execute(data: {
    email: string;
    tutorialId: string;
    tenantId: string;
    skipped: boolean;
  }) {
    const tutorial = await this.tutorialRepository.findById(
      data.tutorialId,
      data.tenantId,
    );

    if (!tutorial) {
      throw new NotFoundException('Tutorial not found');
    }
    const progress = await this.tutorialRepository.saveProgress({
      email: data.email,
      tutorialId: data.tutorialId,
      tenantId: data.tenantId,
      completedAt: new Date(),
      skipped: data.skipped,
    });

    console.log('[CompleteTutorialUseCase] Tutorial completed:', {
      userId: data.email,
      tutorialCode: tutorial.code,
      skipped: data.skipped,
    });

    return {
      success: true,
      tutorialId: progress.tutorialId,
    };
  }
}
