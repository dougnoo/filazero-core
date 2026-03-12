import { GetBeneficiaryDetailsResponseDto } from '../../application/use-cases/get-beneficiary-details/get-beneficiary-details-response.dto';

export interface IBeneficiaryIntegrationRepository {
  getBeneficiaryDetails(
    baseUrl: string,
    userId: string,
  ): Promise<GetBeneficiaryDetailsResponseDto>;
  getFileUrl(
    baseUrl: string,
    userId: string,
    fileName: string,
  ): Promise<{ url: string; fileName: string }>;
  sendTriageFinishedNotification(
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
  ): Promise<void>;
}
