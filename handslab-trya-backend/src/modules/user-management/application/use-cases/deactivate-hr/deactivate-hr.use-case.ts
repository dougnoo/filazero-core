import { Injectable, Inject, Logger, NotFoundException } from '@nestjs/common';
import { DeactivateHrDto } from './deactivate-hr.dto';
import { DeactivateHrResponseDto } from './deactivate-hr-response.dto';
import type { IUserRepository } from '../../../domain/repositories/user.repository.interface';
import { USER_REPOSITORY_TOKEN } from '../../../domain/repositories/user.repository.token';
import type { IBeneficiaryDbRepository } from '../../../domain/repositories/beneficiary-db.repository.interface';
import { BENEFICIARY_DB_REPOSITORY_TOKEN } from '../../../domain/repositories/beneficiary-db.repository.token';
import type { User as AuthUser } from '../../../../auth/domain/entities/user.entity';
import { CannotDeactivateSelfError } from '../../../domain/errors/cannot-deactivate-self.error';

@Injectable()
export class DeactivateHrUseCase {
  private readonly logger = new Logger(DeactivateHrUseCase.name);

  constructor(
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly userRepository: IUserRepository,
    @Inject(BENEFICIARY_DB_REPOSITORY_TOKEN)
    private readonly beneficiaryDbRepository: IBeneficiaryDbRepository,
  ) {}

  async execute(
    dto: DeactivateHrDto,
    currentUser: AuthUser,
  ): Promise<DeactivateHrResponseDto> {
    this.logger.log(`Desativando usuário RH: ${dto.id}`);

    const user = await this.beneficiaryDbRepository.findById(dto.id);
    if (!user) {
      throw new NotFoundException('Usuário RH não encontrado');
    }

    if (user.cognitoId === currentUser.id) {
      throw new CannotDeactivateSelfError();
    }

    if (!user.email) {
      throw new Error('Usuário RH sem email cadastrado');
    }

    await this.userRepository.disableUser(user.email);
    this.logger.log(`Usuário RH desativado no Cognito: ${user.email}`);

    await this.beneficiaryDbRepository.deactivate(dto.id);
    this.logger.log(`Usuário RH desativado no banco: ${dto.id}`);

    return {
      message: 'Usuário RH desativado com sucesso',
      id: dto.id,
    };
  }
}
