import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { BENEFICIARY_REPOSITORY_TOKEN } from '../../../domain/repositories/beneficiary.repository.token';
import { IBeneficiaryRepository } from '../../../domain/repositories/beneficiary.repository.interface';
import { GetBeneficiaryResponseDto } from './get-beneficiary-response.dto';
import { GetBeneficiaryDependentDto } from './get-beneficiary-dependent.dto';

@Injectable()
export class GetBeneficiaryUseCase {
  constructor(
    @Inject(BENEFICIARY_REPOSITORY_TOKEN)
    private readonly beneficiaryRepository: IBeneficiaryRepository,
  ) {}

  async execute(id: string): Promise<GetBeneficiaryResponseDto> {
    const beneficiary =
      await this.beneficiaryRepository.findBeneficiaryById(id);

    if (!beneficiary) {
      throw new NotFoundException('Beneficiário não encontrado');
    }

    // Mapea dependentes para DTOs se existirem
    const dependentsDto = beneficiary.dependents
      ? beneficiary.dependents.map(
          (dep) =>
            new GetBeneficiaryDependentDto(
              dep.id,
              dep.name,
              dep.cpf,
              dep.birthDate,
              dep.email,
              dep.phone,
              this.mapGender(dep.gender),
              !dep.deletedAt,
              dep.memberId,
              dep.dependentType,
            ),
        )
      : null;

    const isActive = !beneficiary.deletedAt;

    return new GetBeneficiaryResponseDto(
      beneficiary.id,
      beneficiary.name,
      beneficiary.cpf,
      beneficiary.birthDate,
      beneficiary.email,
      beneficiary.phone,
      beneficiary.tenantId,
      beneficiary.tenantName,
      beneficiary.planId,
      beneficiary.planName,
      beneficiary.operatorName,
      isActive,
      this.mapGender(beneficiary.gender),
      beneficiary.memberId,
      beneficiary.dependentType,
      dependentsDto,
    );
  }

  private mapGender(value: string | null): string | null {
    if (!value) return null;
    if (value === 'M') return 'Masculino';
    if (value === 'F') return 'Feminino';
    return value;
  }
}
