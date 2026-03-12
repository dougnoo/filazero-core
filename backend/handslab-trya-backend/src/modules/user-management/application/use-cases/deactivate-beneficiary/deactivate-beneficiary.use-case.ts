import { Injectable, Inject, Logger } from '@nestjs/common';
import { DeactivateBeneficiaryDto } from './deactivate-beneficiary.dto';
import { DeactivateBeneficiaryResponseDto } from './deactivate-beneficiary-response.dto';
import type { IUserRepository } from '../../../domain/repositories/user.repository.interface';
import type { IBeneficiaryDbRepository } from '../../../domain/repositories/beneficiary-db.repository.interface';
import { USER_REPOSITORY_TOKEN } from '../../../domain/repositories/user.repository.token';
import { BENEFICIARY_DB_REPOSITORY_TOKEN } from '../../../domain/repositories/beneficiary-db.repository.token';
import { UserNotFoundError } from '../../../../../shared/domain/errors/user-not-found.error';
import { BeneficiaryAlreadyDeactivatedError } from '../../../domain/errors/beneficiary-already-deactivated.error';
import { DependentType } from '../../../../../shared/domain/enums/dependent-type.enum';

@Injectable()
export class DeactivateBeneficiaryUseCase {
  private readonly logger = new Logger(DeactivateBeneficiaryUseCase.name);

  constructor(
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly userRepository: IUserRepository,
    @Inject(BENEFICIARY_DB_REPOSITORY_TOKEN)
    private readonly beneficiaryDbRepository: IBeneficiaryDbRepository,
  ) {}

  async execute(
    dto: DeactivateBeneficiaryDto,
  ): Promise<DeactivateBeneficiaryResponseDto> {
    this.logger.log(`Iniciando desativação: ${dto.id}`);

    // Verificar se o beneficiário existe no banco
    const user = await this.beneficiaryDbRepository.findByIdWithDependents(
      dto.id,
    );
    if (!user) {
      throw new UserNotFoundError();
    }

    if (user.deletedAt) {
      throw new BeneficiaryAlreadyDeactivatedError();
    }

    // Desativar no banco de dados
    await this.beneficiaryDbRepository.deactivate(dto.id);

    if (user.email) {
      await this.userRepository.disableUser(user.email);
    }

    const isTitular =
      !user.dependentType || user.dependentType === DependentType.SELF;

    if (isTitular && user.dependents && user.dependents.length > 0) {
      this.logger.log(
        `Desativando ${user.dependents.length} dependentes do titular ${dto.id}`,
      );

      for (const dependent of user.dependents) {
        if (dependent.deletedAt) {
          this.logger.log(
            `Dependente ${dependent.id} ja desativado, pulando.`,
          );
          continue;
        }

        await this.beneficiaryDbRepository.deactivate(dependent.id);

        if (dependent.email) {
          await this.userRepository.disableUser(dependent.email);
        }
      }
    }

    this.logger.log(`Beneficiário desativado com sucesso: ${dto.id}`);

    return {
      success: true,
      message: 'Beneficiário desativado com sucesso',
    };
  }
}
