import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TermAcceptance } from '../../../../../database/entities/term-acceptance.entity';
import { AcceptTermDto } from './accept-term.dto';
import { AcceptTermResponseDto } from './accept-term-response.dto';

@Injectable()
export class AcceptTermUseCase {
  constructor(
    @InjectRepository(TermAcceptance)
    private readonly termAcceptanceRepository: Repository<TermAcceptance>,
  ) {}

  async execute(
    userId: string,
    dto: AcceptTermDto,
    ipAddress?: string,
  ): Promise<AcceptTermResponseDto> {
    const existing = await this.termAcceptanceRepository.findOne({
      where: {
        userId,
        termVersionId: dto.termVersionId,
      },
    });

    if (existing) {
      return {
        message: 'Termo já aceito anteriormente',
        alreadyAccepted: true,
      };
    }

    const acceptance = this.termAcceptanceRepository.create({
      userId,
      termVersionId: dto.termVersionId,
      ipAddress,
    });

    await this.termAcceptanceRepository.save(acceptance);

    return {
      message: 'Termo aceito com sucesso',
      alreadyAccepted: false,
    };
  }
}
