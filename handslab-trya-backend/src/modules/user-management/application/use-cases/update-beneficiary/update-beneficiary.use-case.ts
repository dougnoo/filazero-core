import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import type { IBeneficiaryRepository } from '../../../domain/repositories/beneficiary.repository.interface';
import { BENEFICIARY_REPOSITORY_TOKEN } from '../../../domain/repositories/beneficiary.repository.token';
import type { IBeneficiaryDbRepository } from '../../../domain/repositories/beneficiary-db.repository.interface';
import { BENEFICIARY_DB_REPOSITORY_TOKEN } from '../../../domain/repositories/beneficiary-db.repository.token';
import type { ICognitoSyncService } from '../../../domain/services/cognito-sync.service.interface';
import { COGNITO_SYNC_SERVICE_TOKEN } from '../../../domain/services/cognito-sync.service.token';
import { UpdateBeneficiaryDto } from './update-beneficiary.dto';
import { UpdateBeneficiaryResponseDto } from './update-beneficiary-response.dto';
import { DependentType } from '../../../../../shared/domain/enums/dependent-type.enum';

/**
 * Use Case para atualizar beneficiários (Application Layer)
 *
 * Implementa a lógica de negócio para atualização de beneficiários.
 * Depende apenas de abstrações (interfaces) da camada Domain.
 * Sincroniza mudanças com o Cognito quando necessário.
 */
@Injectable()
export class UpdateBeneficiaryUseCase {
  constructor(
    @Inject(BENEFICIARY_REPOSITORY_TOKEN)
    private readonly beneficiaryRepository: IBeneficiaryRepository,
    @Inject(BENEFICIARY_DB_REPOSITORY_TOKEN)
    private readonly beneficiaryDbRepository: IBeneficiaryDbRepository,
    @Inject(COGNITO_SYNC_SERVICE_TOKEN)
    private readonly cognitoSyncService: ICognitoSyncService,
  ) {}

  async execute(id: string, updateDto: UpdateBeneficiaryDto): Promise<void> {
    // Verificar se o beneficiário existe
    const existing = await this.beneficiaryRepository.findBeneficiaryById(id);

    if (!existing) {
      throw new NotFoundException('Beneficiário não encontrado');
    }

    // Validação de negócio: Não pode remover campos obrigatórios
    if (updateDto.name === '') {
      throw new BadRequestException('Nome não pode ser vazio');
    }

    // Validação: Se o beneficiário é titular originalmente, não permitir alteração do tipo
    if (
      updateDto.dependentType !== undefined &&
      existing.dependentType === DependentType.SELF
    ) {
      throw new BadRequestException(
        'Não é permitido alterar o tipo de um beneficiário titular',
      );
    }

    // Validação: Se o beneficiário é dependente, não permitir ser titular
    if (
      updateDto.dependentType === DependentType.SELF &&
      existing.dependentType !== DependentType.SELF
    ) {
      throw new BadRequestException(
        'Um dependente não pode ser alterado para titular',
      );
    }

    // Validação: Matrícula só pode ser alterada se o beneficiário for titular
    if (
      updateDto.memberId !== undefined &&
      updateDto.memberId !== existing.memberId
    ) {
      // Verifica se o beneficiário é titular
      if (
        !existing.dependentType ||
        existing.dependentType !== DependentType.SELF
      ) {
        throw new BadRequestException(
          'Apenas beneficiários titulares podem ter a matrícula alterada',
        );
      }

      // Verifica se a nova matrícula já existe para outro titular no mesmo tenant
      if (updateDto.memberId && existing.tenantId) {
        const existingMember = await this.beneficiaryDbRepository.findByMemberId(
          updateDto.memberId,
          existing.tenantId,
        );

        if (existingMember && existingMember.id !== id) {
          throw new ConflictException(
            `Matrícula ${updateDto.memberId} já está cadastrada para outro titular`,
          );
        }
      }
    }

    // Preparar dados para atualização
    const updateData: any = {};

    if (updateDto.name !== undefined) updateData.name = updateDto.name;
    if (updateDto.cpf !== undefined) updateData.cpf = updateDto.cpf;
    if (updateDto.email !== undefined) updateData.email = updateDto.email;
    if (updateDto.phone !== undefined) updateData.phone = updateDto.phone;
    if (updateDto.tenantId !== undefined)
      updateData.tenantId = updateDto.tenantId;
    if (updateDto.planId !== undefined) updateData.planId = updateDto.planId;
    if (updateDto.birthDate !== undefined)
      updateData.birthDate = new Date(updateDto.birthDate);
    if (updateDto.gender !== undefined) updateData.gender = updateDto.gender;
    if (updateDto.memberId !== undefined)
      updateData.memberId = updateDto.memberId;
    if (updateDto.dependentType !== undefined)
      updateData.dependentType = updateDto.dependentType;

    // Atualizar no banco PostgreSQL
    const updated = await this.beneficiaryRepository.updateBeneficiary(
      id,
      updateData,
    );

    // Sincronizar com Cognito se campos específicos foram alterados
    const needsCognitoSync =
      updateDto.name !== undefined ||
      updateDto.email !== undefined ||
      updateDto.phone !== undefined ||
      updateDto.tenantId !== undefined;

    if (needsCognitoSync && existing.email) {
      // Usa o email do beneficiário (antes da atualização) como username no Cognito
      await this.cognitoSyncService.syncBeneficiaryAttributes(existing.email, {
        name: updateDto.name,
        email: updateDto.email,
        phone: updateDto.phone,
        tenantId: updateDto.tenantId,
      });
    }

    // Sucesso - sem retorno (204 No Content)
  }
}
