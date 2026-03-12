import { Injectable, Inject } from '@nestjs/common';
import { ZELO_REPOSITORY_TOKEN } from '../../domain/repositories/zelo.repository.token';
import type {
  IZeloRepository,
  ZeloMagicLink,
} from '../../domain/repositories/zelo.repository.interface';
import { LoginPatientDto } from '../dto';

@Injectable()
export class GeneratePatientMagicLinkUseCase {
  constructor(
    @Inject(ZELO_REPOSITORY_TOKEN)
    private readonly zeloRepository: IZeloRepository,
  ) {}

  async execute(dto: LoginPatientDto): Promise<ZeloMagicLink> {
    // Validar CPF
    if (!dto.cpf || dto.cpf.trim() === '') {
      throw new Error('CPF is required');
    }

    // Limpar CPF e validar formato
    const cleanCpf = dto.cpf.replace(/\D/g, '');
    if (cleanCpf.length !== 11) {
      throw new Error('Invalid CPF format');
    }

    // Gerar magic link via repository
    return await this.zeloRepository.generateMagicLink(dto.cpf);
  }
}
