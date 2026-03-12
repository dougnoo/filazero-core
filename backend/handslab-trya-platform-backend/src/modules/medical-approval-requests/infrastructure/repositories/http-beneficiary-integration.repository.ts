import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import type { IBeneficiaryIntegrationRepository } from '../../domain/repositories/beneficiary-integration.repository.interface';
import { GetBeneficiaryDetailsResponseDto } from '../../application/use-cases/get-beneficiary-details/get-beneficiary-details-response.dto';

@Injectable()
export class HttpBeneficiaryIntegrationRepository implements IBeneficiaryIntegrationRepository {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async getBeneficiaryDetails(
    baseUrl: string,
    userId: string,
  ): Promise<GetBeneficiaryDetailsResponseDto> {
    const apiKey = this.configService.get<string>('TRYA_PLATFORM_API_KEY');
    const url = `${baseUrl}/api/platform/beneficiaries/${userId}`;

    const response = await this.httpService.axiosRef.get(url, {
      headers: {
        'x-api-key': apiKey,
      },
    });

    return response.data;
  }

  async getFileUrl(
    baseUrl: string,
    userId: string,
    fileName: string,
  ): Promise<{ url: string; fileName: string }> {
    const apiKey = this.configService.get<string>('TRYA_PLATFORM_API_KEY');
    const url = `${baseUrl}/api/platform/beneficiaries/${userId}/files/${fileName}`;

    const response = await this.httpService.axiosRef.get(url, {
      headers: {
        'x-api-key': apiKey,
      },
    });

    return response.data;
  }

  async sendTriageFinishedNotification(
    baseUrl: string,
    data: {
      category: string;
      data: {
        sessionId: string;
        doctorName: string;
        attachments?: Array<{
          name: string;
          filename: string;
          link: string;
          size: string;
          extension: string;
        }>;
      };
    },
  ): Promise<void> {
    const apiKey = this.configService.get<string>('TRYA_PLATFORM_API_KEY');
    const url = `${baseUrl}/api/notifications`;

    await this.httpService.axiosRef.post(url, data, {
      headers: {
        'x-api-key': apiKey,
      },
    });
  }
}
