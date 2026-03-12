import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios, { AxiosInstance } from 'axios';
import { UserEntity } from '../../../users/infrastructure/entities/user.entity';
import { DoctorEntity } from '../../../users/infrastructure/entities/doctor.entity';
import { MemedPrescriptorEntity } from '../entities/MemedPrescriptor.entity';
import { BoardCode } from '../../../../shared/domain/enums/board-code.enum';
import { MemedStatus } from '../../../../shared/domain/enums/memed-status.enum';
import { Gender } from '../../../../shared/domain/enums/gender.enum';

export interface MemedCredentials {
  apiKey: string;
  secretKey: string;
}

interface CreateMemedUserDto {
  externalId: string;
  nome: string;
  sobrenome: string;
  cpf?: string;
  boardCode: BoardCode;
  boardNumber: string;
  boardState: string;
  email?: string;
  telefone?: string;
  sexo?: 'M' | 'F';
  dataNascimento?: string; // dd/mm/YYYY
}

interface MemedUserResponse {
  id: number;
  token: string;
  externalId: string;
  status: MemedStatus;
}

export interface SyncPrescriptorResult {
  doctorId: string;
  memedId: number;
  memedToken: string;
  memedStatus: MemedStatus;
  message: string;
}

@Injectable()
export class MemedPrescriptorService {
  private readonly logger = new Logger(MemedPrescriptorService.name);
  private readonly baseUrl = 'https://integrations.api.memed.com.br/v1';
  private axiosInstance: AxiosInstance;

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(DoctorEntity)
    private readonly doctorRepository: Repository<DoctorEntity>,
    @InjectRepository(MemedPrescriptorEntity)
    private readonly prescriptorRepository: Repository<MemedPrescriptorEntity>,
  ) {
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
   * Build query params with credentials
   */
  private buildAuthParams(credentials: MemedCredentials): string {
    const params = new URLSearchParams();
    params.append('api-key', credentials.apiKey);
    params.append('secret-key', credentials.secretKey);
    return params.toString();
  }

  /**
   * Maps our User and Doctor entities to Memed's CreateUserDto format
   */
  private mapToMemedUserDto(
    user: UserEntity,
    doctor: DoctorEntity,
  ): CreateMemedUserDto {
    // Validate required fields
    if (!doctor.boardCode || !doctor.boardNumber || !doctor.boardState) {
      throw new Error(
        `Doctor ${user.id} missing required board information (boardCode, boardNumber, boardState)`,
      );
    }

    // Split user name into first and last name
    const nameParts = user.name.trim().split(' ');
    const nome = nameParts[0];
    const sobrenome = nameParts.slice(1).join(' ') || nome;

    return {
      externalId: user.id,
      nome,
      sobrenome,
      cpf: user.cpf,
      boardCode: doctor.boardCode,
      boardNumber: doctor.boardNumber,
      boardState: doctor.boardState,
      email: user.email,
      telefone: user.phone,
      sexo: this.mapGenderToMemed(user.gender),
      dataNascimento: this.formatDateForMemed(new Date(user.birthDate)),
    };
  }

  /**
   * Maps our Gender enum to Memed's format
   */
  private mapGenderToMemed(gender: Gender): 'M' | 'F' | undefined {
    switch (gender) {
      case Gender.MALE:
        return 'M';
      case Gender.FEMALE:
        return 'F';
      default:
        return undefined;
    }
  }

  /**
   * Formats date for Memed API (dd/mm/yyyy)
   */
  private formatDateForMemed(date: Date): string | undefined {
    if (!date) return undefined;

    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  }

  /**
   * Create user (prescritor) in Memed
   */
  private async createMemedUser(
    userData: CreateMemedUserDto,
    credentials: MemedCredentials,
  ): Promise<MemedUserResponse> {
    try {
      const authParams = this.buildAuthParams(credentials);

      const payload = {
        data: {
          type: 'usuarios',
          attributes: {
            external_id: userData.externalId,
            nome: userData.nome,
            sobrenome: userData.sobrenome,
            cpf: userData.cpf,
            board: {
              board_code: userData.boardCode,
              board_number: userData.boardNumber,
              board_state: userData.boardState,
            },
            email: userData.email,
            telefone: userData.telefone,
            sexo: userData.sexo,
            data_nascimento: userData.dataNascimento,
          },
        },
      };

      this.logger.debug(
        `Creating Memed user with payload: ${JSON.stringify(payload, null, 2)}`,
      );

      const response = await this.axiosInstance.post(
        `/sinapse-prescricao/usuarios?${authParams}`,
        payload,
      );

      const data = response.data.data;
      return {
        id: data.id,
        token: data.attributes.token,
        externalId: data.attributes.external_id,
        status: data.attributes.status as MemedStatus,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorDetails = {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          headers: error.response?.headers,
        };

        this.logger.error(
          `Failed to create user in Memed API. Status: ${errorDetails.status}, Details: ${JSON.stringify(errorDetails.data, null, 2)}`,
        );

        // Extract user-friendly error message from Memed API response
        let userMessage = 'Failed to create user in Memed';
        if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
          const memedErrors = error.response.data.errors
            .map((err: any) => err.detail || err.title)
            .filter(Boolean)
            .join('; ');
          if (memedErrors) {
            userMessage = memedErrors;
          }
        }

        throw new HttpException(
          {
            message: userMessage,
            details: error.response?.data,
            status: error.response?.status,
          },
          error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      this.logger.error(
        `Unexpected error while creating user in Memed: ${error.message}`,
        error.stack,
      );
      throw new HttpException(
        'Unexpected error while creating user in Memed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get user by identifier (external_id in Memed)
   */
  private async getMemedUserByIdentifier(
    identifier: string,
    credentials: MemedCredentials,
  ): Promise<MemedUserResponse> {
    try {
      const authParams = this.buildAuthParams(credentials);

      const response = await this.axiosInstance.get(
        `/sinapse-prescricao/usuarios/${identifier}?${authParams}`,
      );

      const data = response.data.data;
      return {
        id: data.id,
        token: data.attributes.token,
        externalId: data.attributes.external_id,
        status: data.attributes.status as MemedStatus,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        this.logger.error(
          `Failed to get user from Memed API. Status: ${error.response?.status}, Details: ${JSON.stringify(error.response?.data, null, 2)}`,
        );

        // Extract user-friendly error message from Memed API response
        let userMessage = 'Failed to get user from Memed';
        if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
          const memedErrors = error.response.data.errors
            .map((err: any) => err.detail || err.title)
            .filter(Boolean)
            .join('; ');
          if (memedErrors) {
            userMessage = memedErrors;
          }
        }

        throw new HttpException(
          {
            message: userMessage,
            details: error.response?.data,
            status: error.response?.status,
          },
          error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      this.logger.error(
        `Unexpected error while getting user from Memed: ${error.message}`,
        error.stack,
      );
      throw new HttpException(
        'Unexpected error while getting user from Memed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get user token by doctor ID (external_id in Memed)
   */
  private async getMemedUserToken(
    doctorId: string,
    credentials: MemedCredentials,
  ): Promise<string> {
    try {
      const authParams = this.buildAuthParams(credentials);

      const response = await this.axiosInstance.get(
        `/sinapse-prescricao/usuarios/${doctorId}?${authParams}`,
      );

      return response.data.data.attributes.token;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        this.logger.error(
          `Failed to get user token from Memed API. Status: ${error.response?.status}, Details: ${JSON.stringify(error.response?.data, null, 2)}`,
        );

        // Extract user-friendly error message from Memed API response
        let userMessage = 'Failed to get user token from Memed';
        if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
          const memedErrors = error.response.data.errors
            .map((err: any) => err.detail || err.title)
            .filter(Boolean)
            .join('; ');
          if (memedErrors) {
            userMessage = memedErrors;
          }
        }

        throw new HttpException(
          {
            message: userMessage,
            details: error.response?.data,
            status: error.response?.status,
          },
          error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      this.logger.error(
        `Unexpected error while getting user token from Memed: ${error.message}`,
        error.stack,
      );
      throw new HttpException(
        'Unexpected error while getting user token from Memed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Syncs a doctor with Memed platform (manual sync from frontend)
   */
  async syncPrescriptor(
    doctorId: string,
    boardCode: BoardCode,
    boardNumber: string,
    boardState: string,
    credentials: MemedCredentials,
    cityId?: number,
    specialtyId?: number,
  ): Promise<SyncPrescriptorResult> {
    // Find user and doctor
    const user = await this.userRepository.findOne({
      where: { id: doctorId },
      relations: ['doctor'],
    });

    if (!user) {
      throw new Error(`User with ID ${doctorId} not found`);
    }

    if (!user.doctor) {
      throw new Error(`Doctor information not found for user ${doctorId}`);
    }

    // Update doctor with board information
    user.doctor.boardCode = boardCode;
    user.doctor.boardNumber = boardNumber;
    user.doctor.boardState = boardState;
    await this.doctorRepository.save(user.doctor);

    // Check if already synced
    const existingPrescriptor = await this.prescriptorRepository.findOne({
      where: { userId: doctorId },
    });

    if (existingPrescriptor) {
      // Try to refresh data from Memed
      try {
        const memedUser = await this.getMemedUserByIdentifier(
          user.id,
          credentials,
        );

        // Update local data
        existingPrescriptor.memedId = memedUser.id;
        existingPrescriptor.memedToken = memedUser.token;
        existingPrescriptor.memedStatus = memedUser.status;
        if (cityId !== undefined) {
          existingPrescriptor.cityId = cityId;
        }
        if (specialtyId !== undefined) {
          existingPrescriptor.specialtyId = specialtyId;
        }

        await this.prescriptorRepository.save(existingPrescriptor);

        return {
          doctorId: user.id,
          memedId: memedUser.id,
          memedToken: memedUser.token,
          memedStatus: memedUser.status,
          message: 'Prescriptor already synced, data refreshed from Memed',
        };
      } catch (error) {
        // If not found in Memed, proceed with creation
        this.logger.warn(
          `Prescriptor ${user.id} was marked as synced but not found in Memed, creating new user`,
        );
      }
    }

    // Create new user in Memed
    const memedUserDto = this.mapToMemedUserDto(user, user.doctor);

    const memedUser = await this.createMemedUser(memedUserDto, credentials);

    // Create or update prescriptor record
    const prescriptor = existingPrescriptor || new MemedPrescriptorEntity();
    prescriptor.userId = user.id;
    prescriptor.memedId = memedUser.id;
    prescriptor.memedToken = memedUser.token;
    prescriptor.memedExternalId = memedUser.externalId;
    prescriptor.memedStatus = memedUser.status;
    if (cityId !== undefined) {
      prescriptor.cityId = cityId;
    }
    if (specialtyId !== undefined) {
      prescriptor.specialtyId = specialtyId;
    }

    await this.prescriptorRepository.save(prescriptor);

    return {
      doctorId: user.id,
      memedId: memedUser.id,
      memedToken: memedUser.token,
      memedStatus: memedUser.status,
      message: existingPrescriptor
        ? 'Prescriptor updated in Memed successfully'
        : 'Prescriptor created in Memed and synced successfully',
    };
  }

  /**
   * Gets Memed token for a doctor
   */
  async getMemedToken(
    doctorId: string,
    credentials: MemedCredentials,
  ): Promise<string | null> {
    try {
      const prescriptor = await this.prescriptorRepository.findOne({
        where: { userId: doctorId },
      });

      if (prescriptor) {
        return prescriptor.memedToken;
      }

      // Fallback to API call if not in database
      return await this.getMemedUserToken(doctorId, credentials);
    } catch (error) {
      this.logger.error(
        `Failed to get Memed token for doctor ${doctorId}: ${error.message}`,
      );
      return null;
    }
  }
}
