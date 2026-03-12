import { Injectable, Logger } from '@nestjs/common';
import { CreateBeneficiaryDto } from './create-beneficiary.dto';
import { CreateBeneficiaryResponseDto } from './create-beneficiary-response.dto';
import { UserRole } from '../../../../../shared/domain/enums/user-role.enum';
import { Inject } from '@nestjs/common';
import { CpfAlreadyExistsError } from '../../../domain/errors/cpf-already-exists.error';
import { DatabaseSaveFailedError } from '../../../domain/errors/database-save-failed.error';
import type { IBeneficiaryDbRepository } from '../../../domain/repositories/beneficiary-db.repository.interface';
import { BENEFICIARY_DB_REPOSITORY_TOKEN } from '../../../domain/repositories/beneficiary-db.repository.token';
import { User } from 'src/database/entities/user.entity';
import type { User as AuthUser } from '../../../../auth/domain/entities/user.entity';
import { DependentType } from '../../../../../shared/domain/enums/dependent-type.enum';
import { DependentMissingTitularError } from '../../../domain/errors/dependent-missing-titular.error';
import { DuplicateTitularMemberIdError } from '../../../domain/errors/duplicate-titular-member-id.error';
import { Gender } from '../../../../../shared/domain/enums/gender.enum';

@Injectable()
export class CreateBeneficiaryUseCase {
  private readonly logger = new Logger(CreateBeneficiaryUseCase.name);
  constructor(
    @Inject(BENEFICIARY_DB_REPOSITORY_TOKEN)
    private readonly beneficiaryDbRepository: IBeneficiaryDbRepository,
  ) {}

  async execute(
    createBeneficiaryDto: CreateBeneficiaryDto,
    currentUser: AuthUser,
  ): Promise<CreateBeneficiaryResponseDto> {
    const {
      name,
      tenantId,
      cpf,
      birthDate,
      planId,
      memberId,
      beneficiaryType,
      gender,
      
    } = createBeneficiaryDto;

    const dependentType = beneficiaryType || DependentType.SELF;
    const normalizedMemberId = memberId?.trim() || null;

    // Verificar se o CPF já existe no banco de dados
    const existingUserByCpf = await this.beneficiaryDbRepository.findByCpf(cpf);
    if (existingUserByCpf) {
      throw new CpfAlreadyExistsError();
    }

    if (dependentType === DependentType.SELF && normalizedMemberId) {
      const existingByMemberId =
        await this.beneficiaryDbRepository.findByMemberId(
          normalizedMemberId,
          tenantId,
        );
      if (
        existingByMemberId &&
        (!existingByMemberId.dependentType ||
          existingByMemberId.dependentType === DependentType.SELF)
      ) {
        throw new DuplicateTitularMemberIdError(0, normalizedMemberId);
      }
    }

    let subscriberId: string | null = null;
    if (dependentType !== DependentType.SELF) {
      if (!normalizedMemberId) {
        throw new DependentMissingTitularError(0, null);
      }

      const titular = await this.beneficiaryDbRepository.findByMemberId(
        normalizedMemberId,
        tenantId,
      );

      if (!titular) {
        throw new DependentMissingTitularError(0, normalizedMemberId);
      }

      subscriberId = titular.id;
    }

    // Determinar role baseado no tipo de dependente
    const userRole =
      dependentType === DependentType.SELF
        ? UserRole.BENEFICIARY
        : UserRole.DEPENDENT;

    // Salvar beneficiário no PostgreSQL
    let userCreated: User;
    try {
      this.logger.log(
        `Criando beneficiário - currentUser.dbId: ${currentUser.dbId}`,
      );
      userCreated = await this.beneficiaryDbRepository.create({
        cognitoId: null, // Será atualizado posteriormente
        email: null, // Será atualizado posteriormente
        name,
        cpf,
        tenantId,
        phone: null,// Será atualizado posteriormente
        birthDate: new Date(birthDate),
        planId,
        type: userRole,
        gender,
        memberId: normalizedMemberId,
        dependentType,
        subscriberId,
        createdBy: currentUser.dbId ?? null,
      });

      this.logger.log(
        `Beneficiário criado - ID: ${userCreated.id}, createdBy: ${userCreated.createdBy}`,
      );
    } catch (dbError) {
      this.logger.error(
        `Erro ao salvar beneficiário no PostgreSQL: ${dbError}`,
      );

      // Re-lançar o erro como DatabaseSaveFailedError
      const errorMessage =
        dbError instanceof Error ? dbError.message : 'Erro desconhecido';
      throw new DatabaseSaveFailedError(
        `Falha ao criar beneficiário no banco de dados: ${errorMessage}`,
      );
    }

    // Não envia email de boas-vindas para usuários criados via cadastro manual
    // Email será enviado quando o beneficiário ativar a conta

    return {
      id: userCreated.id,
      email: userCreated.email || undefined,
      name: userCreated.name,
      createdBy: userCreated.createdBy || undefined,
    };
  }

  private mapGender(value: Gender): string {
    return value === Gender.M ? 'Masculino' : 'Feminino';
  }
}
