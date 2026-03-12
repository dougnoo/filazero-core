import { Injectable, Inject } from '@nestjs/common';
import type { IBeneficiaryDbRepository } from '../../../../user-management/domain/repositories/beneficiary-db.repository.interface';
import { BENEFICIARY_DB_REPOSITORY_TOKEN } from '../../../../user-management/domain/repositories/beneficiary-db.repository.token';
import {
  VerifyBirthdateDto,
  VerifyBirthdateResponseDto,
} from './verify-birthdate.dto';
import { OnboardingTokenService } from '../../../infrastructure/services/onboarding-token.service';
import { InvalidTokenStepError } from '../../../domain/errors/invalid-token-step.error';
import { UserNotFoundError } from '../../../../../shared/domain/errors/user-not-found.error';
import { BirthdateMismatchError } from '../../../domain/errors/birthdate-mismatch.error';

@Injectable()
export class VerifyBirthdateUseCase {
  constructor(
    @Inject(BENEFICIARY_DB_REPOSITORY_TOKEN)
    private readonly beneficiaryRepository: IBeneficiaryDbRepository,
    private readonly onboardingTokenService: OnboardingTokenService,
  ) {}

  async execute(dto: VerifyBirthdateDto): Promise<VerifyBirthdateResponseDto> {
    const tokenData = this.onboardingTokenService.verifyToken(
      dto.registrationHash,
    );

    if (tokenData.step !== 'cpf_verified') {
      throw new InvalidTokenStepError();
    }

    const user = await this.beneficiaryRepository.findById(tokenData.userId);

    if (!user) {
      throw new UserNotFoundError();
    }

    const inputDate = new Date(dto.birthDate);
    const userDate = new Date(user.birthDate);

    const isValid =
      inputDate.getFullYear() === userDate.getFullYear() &&
      inputDate.getMonth() === userDate.getMonth() &&
      inputDate.getDate() === userDate.getDate();

    if (!isValid) {
      throw new BirthdateMismatchError();
    }

    const newHash = this.onboardingTokenService.generateToken({
      cpf: tokenData.cpf,
      userId: tokenData.userId,
      step: 'birthdate_verified',
    });

    return {
      isValid: true,
      registrationHash: newHash,
    };
  }
}
