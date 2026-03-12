import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

export interface OnboardingTokenPayload {
  cpf: string;
  userId: string;
  step: 'cpf_verified' | 'birthdate_verified';
  iat?: number;
  exp?: number;
}

@Injectable()
export class OnboardingTokenService {
  constructor(private readonly jwtService: JwtService) {}

  generateToken(payload: Omit<OnboardingTokenPayload, 'iat' | 'exp'>): string {
    return this.jwtService.sign(payload, { expiresIn: '10m' });
  }

  verifyToken(token: string): OnboardingTokenPayload {
    return this.jwtService.verify<OnboardingTokenPayload>(token);
  }
}
