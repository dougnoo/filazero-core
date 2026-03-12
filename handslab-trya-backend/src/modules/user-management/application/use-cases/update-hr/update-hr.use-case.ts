import { Injectable, Inject, Logger, NotFoundException } from '@nestjs/common';
import { UpdateHrDto } from './update-hr.dto';
import {
  IHrRepository,
  HR_REPOSITORY_TOKEN,
} from '../../../domain/repositories/hr.repository.interface';
import { ICognitoSyncService } from '../../../domain/services/cognito-sync.service.interface';
import { COGNITO_SYNC_SERVICE_TOKEN } from '../../../domain/services/cognito-sync.service.token';
import { UserNotFoundError } from 'src/shared/presentation';

@Injectable()
export class UpdateHrUseCase {
  private readonly logger = new Logger(UpdateHrUseCase.name);

  constructor(
    @Inject(HR_REPOSITORY_TOKEN)
    private readonly hrRepository: IHrRepository,
    @Inject(COGNITO_SYNC_SERVICE_TOKEN)
    private readonly cognitoSyncService: ICognitoSyncService,
  ) {}

  async execute(id: string, dto: UpdateHrDto): Promise<void> {
    this.logger.log(`Atualizando usuário RH: ${id}`);

    const existing = await this.hrRepository.findHrById(id);
    if (!existing) {
      throw new UserNotFoundError();
    }

    await this.hrRepository.updateHr(id, {
      name: dto.name,
      cpf: dto.cpf,
      birthDate: dto.birthDate ? new Date(dto.birthDate) : undefined,
      email: dto.email,
      phone: dto.phone,
    });

    const needsCognitoSync =
      dto.name !== undefined ||
      dto.email !== undefined ||
      dto.phone !== undefined;

    if (needsCognitoSync && existing.email) {
      await this.cognitoSyncService.syncBeneficiaryAttributes(existing.email, {
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
      });
    }

    this.logger.log(`Usuário RH ${id} atualizado com sucesso`);
  }
}
