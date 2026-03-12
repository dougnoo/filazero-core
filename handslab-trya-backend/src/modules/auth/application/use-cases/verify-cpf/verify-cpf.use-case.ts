import { Injectable, Inject } from '@nestjs/common';
import type { IBeneficiaryDbRepository } from '../../../../user-management/domain/repositories/beneficiary-db.repository.interface';
import { BENEFICIARY_DB_REPOSITORY_TOKEN } from '../../../../user-management/domain/repositories/beneficiary-db.repository.token';
import { VerifyCpfDto, VerifyCpfResponseDto } from './verify-cpf.dto';
import { CpfNotFoundError } from '../../../domain/errors/cpf-not-found.error';
import { UserAlreadyExistsError } from '../../../../../shared/domain/errors/user-already-exists.error';
import { OnboardingTokenService } from '../../../infrastructure/services/onboarding-token.service';
import { UnderageBeneficiaryError } from '../../../domain/errors/underage-beneficiary.error';

@Injectable()
export class VerifyCpfUseCase {
  constructor(
    @Inject(BENEFICIARY_DB_REPOSITORY_TOKEN)
    private readonly beneficiaryRepository: IBeneficiaryDbRepository,
    private readonly onboardingTokenService: OnboardingTokenService,
  ) {}

  async execute(dto: VerifyCpfDto): Promise<VerifyCpfResponseDto> {
    const cleanCpf = dto.cpf.replace(/\D/g, '');

    const user = await this.beneficiaryRepository.findByCpf(cleanCpf);

    if (!user) {
      throw new CpfNotFoundError();
    }

    if (user.cognitoId || user.email || user.phone) {
      throw new UserAlreadyExistsError();
    }

    if (user.birthDate) {
      const age = this.calculateAge(user.birthDate);
      if (age < 18) {
        throw new UnderageBeneficiaryError();
      }
    }

    const registrationHash = this.onboardingTokenService.generateToken({
      cpf: cleanCpf,
      userId: user.id,
      step: 'cpf_verified',
    });

    return {
      canProceed: true,
      registrationHash,
    };
  }

  private calculateAge(birthDate: Date): number {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }

    return age;
  }
}
