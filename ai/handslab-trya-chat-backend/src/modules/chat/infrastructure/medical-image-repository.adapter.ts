import { Injectable } from '@nestjs/common';
import { IMedicalImageRepository } from '../domain/interfaces/medical-image-repository.interface';
import { MedicalImageService } from '../../medical-image';

@Injectable()
export class MedicalImageRepositoryAdapter implements IMedicalImageRepository {
  constructor(private readonly medicalImageService: MedicalImageService) {}

  async analyzeImage(
    imageBuffer: Buffer,
    imageMimeType: string,
    tenantConfig: any,
  ): Promise<any> {
    return this.medicalImageService.analyzeImage(
      imageBuffer,
      imageMimeType,
      tenantConfig,
    );
  }

  isValidMedicalImageFormat(mimeType: string): boolean {
    return this.medicalImageService.isValidMedicalImageFormat(mimeType);
  }

  isValidImageSize(imageBuffer: Buffer): boolean {
    return this.medicalImageService.isValidImageSize(imageBuffer);
  }

  getRateLimitStatus(): any {
    return this.medicalImageService.getRateLimitStatus();
  }
}