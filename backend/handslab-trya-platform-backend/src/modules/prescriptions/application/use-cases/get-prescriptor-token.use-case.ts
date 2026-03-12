import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../../../users/infrastructure/entities/user.entity';
import { MemedPrescriptorEntity } from '../../infrastructure/entities/MemedPrescriptor.entity';
import { MemedPrescriptorService } from '../../infrastructure/services/memed-prescriptor.service';
import { ConfigService } from '@nestjs/config';
import { BoardCode } from '../../../../shared/domain/enums/board-code.enum';
import { MemedStatus } from '../../../../shared/domain/enums/memed-status.enum';

export interface GetPrescriptorTokenResult {
  doctorId: string;
  doctorName: string;
  memedToken: string;
  memedStatus: MemedStatus;
  boardCode: BoardCode;
  boardNumber: string;
  boardState: string;
}

@Injectable()
export class GetPrescriptorTokenUseCase {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(MemedPrescriptorEntity)
    private readonly prescriptorRepository: Repository<MemedPrescriptorEntity>,
    private readonly memedPrescriptorService: MemedPrescriptorService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Get Memed credentials from env (TODO: make it tenant-based)
   */
  private getMemedCredentials() {
    const apiKey = this.configService.get<string>('MEMED_API_KEY');
    const secretKey = this.configService.get<string>('MEMED_SECRET_KEY');

    if (!apiKey || !secretKey) {
      throw new BadRequestException('Memed credentials not configured');
    }

    return { apiKey, secretKey };
  }

  /**
   * Get doctor's Memed token for frontend authentication
   * Will fetch fresh token from Memed if needed
   */
  async execute(doctorId: string): Promise<GetPrescriptorTokenResult> {
    const doctor = await this.userRepository.findOne({
      where: { id: doctorId },
      relations: ['doctor'],
    });

    if (!doctor) {
      throw new NotFoundException(`Doctor with ID ${doctorId} not found`);
    }

    if (!doctor.doctor) {
      throw new NotFoundException(
        `Doctor information not found for user ${doctorId}`,
      );
    }

    const prescriptor = await this.prescriptorRepository.findOne({
      where: { userId: doctorId },
    });

    if (!prescriptor) {
      throw new BadRequestException(
        'Doctor not synced with Memed. Please sync the prescriptor first.',
      );
    }

    // Validate board information
    if (
      !doctor.doctor.boardCode ||
      !doctor.doctor.boardNumber ||
      !doctor.doctor.boardState
    ) {
      throw new BadRequestException(
        'Doctor board information is incomplete. Please update doctor information.',
      );
    }

    // Fetch fresh token from Memed
    const credentials = this.getMemedCredentials();

    try {
      const token = await this.memedPrescriptorService.getMemedToken(
        doctor.id,
        credentials,
      );

      if (!token) {
        throw new BadRequestException('Failed to get token from Memed');
      }

      return {
        doctorId: doctor.id,
        doctorName: doctor.name,
        memedToken: token,
        memedStatus: prescriptor.memedStatus,
        boardCode: doctor.doctor.boardCode,
        boardNumber: doctor.doctor.boardNumber,
        boardState: doctor.doctor.boardState,
      };
    } catch (error) {
      throw new BadRequestException(
        `Failed to get token from Memed: ${error.message}`,
      );
    }
  }
}
