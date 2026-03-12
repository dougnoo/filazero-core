import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import {
  IMemedRepository,
  MemedCredentials,
  MemedSendPrescriptionVia,
  MemedPrescriptionDetail,
  MemedDigitalPrescriptionLink,
  MemedListPrescriptionsOptions,
  MemedPrescriptionsList,
} from '../../domain/repositories/memed.repository.interface';

/**
 * Implementação HTTP do repository Memed
 * Faz chamadas diretas para a API da Memed
 */
@Injectable()
export class HttpMemedRepository implements IMemedRepository {
  private readonly baseUrl = 'https://integrations.api.memed.com.br/v1';
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: this.baseUrl,
      timeout: 30000,
      headers: {
        Accept: 'application/vnd.api+json',
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Build auth headers with Bearer token
   */
  private buildAuthHeaders(
    credentials: MemedCredentials,
  ): Record<string, string> {
    const headers: Record<string, string> = {
      Accept: 'application/vnd.api+json',
      'Content-Type': 'application/json',
    };

    if (credentials.userToken) {
      headers['Authorization'] = `Bearer ${credentials.userToken}`;
    }

    return headers;
  }

  /**
   * Build query params with credentials (always include api-key and secret-key)
   */
  private buildAuthParams(credentials: MemedCredentials): string {
    const params = new URLSearchParams();
    params.append('api-key', credentials.apiKey);
    params.append('secret-key', credentials.secretKey);
    if (credentials.userToken) {
      params.append('token', credentials.userToken);
    }
    return params.toString();
  }

  /**
   * Get prescription details from Memed
   * A criação da prescrição é feita via frontend (widget Memed)
   */
  async getPrescriptionDetails(
    prescriptionId: string,
    credentials: MemedCredentials,
    structuredDocuments: boolean = true,
  ): Promise<MemedPrescriptionDetail> {
    try {
      const headers = this.buildAuthHeaders(credentials);
      const authParams = this.buildAuthParams(credentials);
      const structuredParam = structuredDocuments
        ? 'structuredDocuments=true'
        : '';

      // Build query string
      const queryParams = [authParams, structuredParam]
        .filter(Boolean)
        .join('&');
      const url = `/prescricoes/${prescriptionId}${queryParams ? `?${queryParams}` : ''}`;

      const response = await this.axiosInstance.get(url, { headers });

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new HttpException(
          {
            message: 'Failed to get prescription details from Memed',
            details: error.response?.data,
            status: error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
          },
          error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      throw new HttpException(
        'Unexpected error while getting prescription details',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get prescription PDF URL
   */
  async getPrescriptionPDF(
    prescriptionId: string,
    credentials: MemedCredentials,
  ): Promise<string> {
    try {
      const authParams = this.buildAuthParams(credentials);

      const response = await this.axiosInstance.get(
        `/prescricoes/${prescriptionId}/url-document/full?${authParams}`,
      );

      // Handle array response format
      if (
        response.data.data &&
        Array.isArray(response.data.data) &&
        response.data.data.length > 0
      ) {
        const firstPrescription = response.data.data[0];
        return firstPrescription.attributes?.link;
      }

      // Fallback for other response formats
      return response.data.data?.attributes?.url || response.data.links?.self;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new HttpException(
          {
            message: 'Failed to get prescription PDF from Memed',
            details: error.response?.data,
            status: error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
          },
          error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      throw new HttpException(
        'Unexpected error while getting prescription PDF',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get digital prescription link (link + unlock code)
   */
  async getDigitalPrescriptionLink(
    prescriptionId: string,
    credentials: MemedCredentials,
  ): Promise<MemedDigitalPrescriptionLink> {
    try {
      const authParams = this.buildAuthParams(credentials);

      const response = await this.axiosInstance.get(
        `/prescricoes/${prescriptionId}/get-digital-prescription-link?${authParams}`,
      );

      return {
        link: response.data.data?.attributes?.link || response.data.link,
        unlockCode:
          response.data.data?.attributes?.unlock_code ||
          response.data.unlockCode,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new HttpException(
          {
            message: 'Failed to get digital prescription link from Memed',
            details: error.response?.data,
            status: error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
          },
          error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      throw new HttpException(
        'Unexpected error while getting digital prescription link',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Send prescription via email, SMS, or WhatsApp
   * Nota: Esta funcionalidade precisa ser validada com a documentação real da Memed
   */
  async sendPrescription(
    prescriptionId: string,
    sendData: MemedSendPrescriptionVia,
    credentials: MemedCredentials,
  ): Promise<void> {
    try {
      const authParams = this.buildAuthParams(credentials);

      await this.axiosInstance.post(
        `/prescricoes/${prescriptionId}/enviar?${authParams}`,
        sendData,
      );
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new HttpException(
          {
            message: 'Failed to send prescription via Memed',
            details: error.response?.data,
            status: error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
          },
          error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      throw new HttpException(
        'Unexpected error while sending prescription',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * List prescriptions (with pagination)
   */
  async listPrescriptions(
    credentials: MemedCredentials,
    options?: MemedListPrescriptionsOptions,
  ): Promise<MemedPrescriptionsList> {
    try {
      const authParams = this.buildAuthParams(credentials);
      const queryParams = new URLSearchParams();

      if (options?.limit) {
        queryParams.append('page[limit]', options.limit.toString());
      }
      if (options?.offset) {
        queryParams.append('page[offset]', options.offset.toString());
      }
      if (options?.initialDate) {
        queryParams.append('initialDate', options.initialDate);
      }
      if (options?.finalDate) {
        queryParams.append('finalDate', options.finalDate);
      }

      const fullParams = `${authParams}&${queryParams.toString()}`;
      const response = await this.axiosInstance.get(
        `/prescricoes?${fullParams}`,
      );

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new HttpException(
          {
            message: 'Failed to list prescriptions from Memed',
            details: error.response?.data,
            status: error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
          },
          error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      throw new HttpException(
        'Unexpected error while listing prescriptions',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Delete prescription
   */
  async deletePrescription(
    prescriptionId: string,
    credentials: MemedCredentials,
  ): Promise<void> {
    try {
      const authParams = this.buildAuthParams(credentials);

      await this.axiosInstance.delete(
        `/prescricoes/${prescriptionId}?${authParams}`,
      );
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new HttpException(
          {
            message: 'Failed to delete prescription from Memed',
            details: error.response?.data,
            status: error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
          },
          error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      throw new HttpException(
        'Unexpected error while deleting prescription',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Validate prescription token
   */
  async validateToken(
    prescriptionId: string,
    credentials: MemedCredentials,
  ): Promise<boolean> {
    try {
      const authParams = this.buildAuthParams(credentials);

      const response = await this.axiosInstance.get(
        `/prescricoes/${prescriptionId}?${authParams}`,
      );

      return response.status === 200;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return false;
      }
      throw new HttpException(
        'Error validating prescription token',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
