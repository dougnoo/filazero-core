import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
  HttpException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MemedPrescriptorService } from '../../../infrastructure/services/memed-prescriptor.service';
import { SyncPrescriptorDto } from './sync-prescriptor.dto';
import { SyncPrescriptorResponseDto } from './sync-prescriptor-response.dto';

@Injectable()
export class SyncPrescriptorUseCase {
  private readonly logger = new Logger(SyncPrescriptorUseCase.name);

  constructor(
    private readonly memedPrescriptorService: MemedPrescriptorService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Get Memed credentials from env
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
   * Sync doctor with Memed platform
   */
  async execute(dto: SyncPrescriptorDto): Promise<SyncPrescriptorResponseDto> {
    try {
      this.logger.log(
        `Starting sync for prescriptor ${dto.doctorId} with board ${dto.boardCode}-${dto.boardNumber}/${dto.boardState}`,
      );

      const credentials = this.getMemedCredentials();

      const result = await this.memedPrescriptorService.syncPrescriptor(
        dto.doctorId,
        dto.boardCode,
        dto.boardNumber,
        dto.boardState,
        credentials,
        dto.cityId,
        dto.specialtyId,
      );

      this.logger.log(
        `Successfully synced prescriptor ${dto.doctorId} with Memed ID ${result.memedId}`,
      );

      return {
        doctorId: result.doctorId,
        memedId: result.memedId,
        memedToken: result.memedToken,
        memedStatus: result.memedStatus,
        message: result.message,
      };
    } catch (error) {
      this.logger.error(
        `Failed to sync prescriptor ${dto.doctorId}: ${error.message}`,
        error.stack,
      );

      // Log additional details if available
      if (error.response) {
        this.logger.error(
          `Error response details: ${JSON.stringify(error.response, null, 2)}`,
        );
      }

      if (error.message.includes('not found')) {
        throw new NotFoundException(error.message);
      }

      // If it's already an HttpException with details, extract the message
      if (error instanceof HttpException) {
        const response = error.getResponse();
        const message = typeof response === 'object' && 'message' in response
          ? response.message
          : error.message;
        
        throw new BadRequestException(message);
      }

      throw new BadRequestException(
        `Failed to sync prescriptor: ${error.message}`,
      );
    }
  }
}
