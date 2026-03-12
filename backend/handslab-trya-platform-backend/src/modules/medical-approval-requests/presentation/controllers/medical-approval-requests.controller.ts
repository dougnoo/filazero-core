import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards,
  ConflictException,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiHeader,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CreateMedicalApprovalRequestUseCase } from '../../application/use-cases/create-medical-approval-request/create-medical-approval-request.use-case';
import { CreateMedicalApprovalRequestDto } from '../../application/use-cases/create-medical-approval-request/create-medical-approval-request.dto';
import { CreateMedicalApprovalRequestResponseDto } from '../../application/use-cases/create-medical-approval-request/create-medical-approval-request-response.dto';
import { ListMedicalApprovalRequestsUseCase } from '../../application/use-cases/list-medical-approval-requests/list-medical-approval-requests.use-case';
import { ListMedicalApprovalRequestsDto } from '../../application/use-cases/list-medical-approval-requests/list-medical-approval-requests.dto';
import { ListMedicalApprovalRequestsResponseDto } from '../../application/use-cases/list-medical-approval-requests/list-medical-approval-requests-response.dto';
import { AssignMedicalApprovalRequestUseCase } from '../../application/use-cases/assign-medical-approval-request/assign-medical-approval-request.use-case';
import { AssignMedicalApprovalRequestResponseDto } from '../../application/use-cases/assign-medical-approval-request/assign-medical-approval-request-response.dto';
import { GetMedicalApprovalRequestUseCase } from '../../application/use-cases/get-medical-approval-request/get-medical-approval-request.use-case';
import { GetMedicalApprovalRequestResponseDto } from '../../application/use-cases/get-medical-approval-request/get-medical-approval-request-response.dto';
import { GetBeneficiaryDetailsUseCase } from '../../application/use-cases/get-beneficiary-details/get-beneficiary-details.use-case';
import { GetBeneficiaryDetailsResponseDto } from '../../application/use-cases/get-beneficiary-details/get-beneficiary-details-response.dto';
import { GetFileUrlUseCase } from '../../application/use-cases/get-file-url/get-file-url.use-case';
import { GetFileUrlResponseDto } from '../../application/use-cases/get-file-url/get-file-url-response.dto';
import { ApproveMedicalApprovalRequestUseCase } from '../../application/use-cases/approve-medical-approval-request/approve-medical-approval-request.use-case';
import { ApproveMedicalApprovalRequestDto } from '../../application/use-cases/approve-medical-approval-request/approve-medical-approval-request.dto';
import { ApproveMedicalApprovalRequestResponseDto } from '../../application/use-cases/approve-medical-approval-request/approve-medical-approval-request-response.dto';
import { GetPatientHistoryUseCase } from '../../application/use-cases/get-patient-history/get-patient-history.use-case';
import { GetPatientHistoryResponseDto } from '../../application/use-cases/get-patient-history/get-patient-history-response.dto';
import { SessionAlreadyExistsError } from '../../domain/errors/session-already-exists.error';
import { MedicalApprovalRequestNotFoundError } from '../../domain/errors/medical-approval-request-not-found.error';
import { InvalidStatusTransitionError } from '../../domain/errors/invalid-status-transition.error';
import { UnauthorizedApprovalError } from '../../domain/errors/unauthorized-approval.error';
import { DoctorNotFoundError } from '../../../users/domain/errors/doctor-not-found.error';
import { ApiKeyGuard } from '../../../../shared/presentation/guards/api-key.guard';
import { Public } from '../../../auth/presentation/decorators/public.decorator';
import { JwtAuthGuard } from '../../../auth/presentation/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/presentation/guards/roles.guard';
import { Roles } from '../../../auth/presentation/decorators/roles.decorator';
import { CurrentUser } from '../../../auth/presentation/decorators/current-user.decorator';
import { UserRole } from '../../../../shared/domain/enums/user-role.enum';
@ApiTags('Medical Approval Requests')
@Controller('medical-approval-requests')
export class MedicalApprovalRequestsController {
  constructor(
    private readonly createMedicalApprovalRequestUseCase: CreateMedicalApprovalRequestUseCase,
    private readonly listMedicalApprovalRequestsUseCase: ListMedicalApprovalRequestsUseCase,
    private readonly assignMedicalApprovalRequestUseCase: AssignMedicalApprovalRequestUseCase,
    private readonly getMedicalApprovalRequestUseCase: GetMedicalApprovalRequestUseCase,
    private readonly getBeneficiaryDetailsUseCase: GetBeneficiaryDetailsUseCase,
    private readonly getFileUrlUseCase: GetFileUrlUseCase,
    private readonly approveMedicalApprovalRequestUseCase: ApproveMedicalApprovalRequestUseCase,
    private readonly getPatientHistoryUseCase: GetPatientHistoryUseCase,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.DOCTOR, UserRole.ADMIN)
  @ApiOperation({
    summary: 'List medical approval requests with pagination',
    description:
      'Returns a paginated list of medical approval requests with patient name, chief complaint, date, and status. ' +
      'Supports filtering by status, urgency level, patient name, and date. Requires JWT authentication.',
  })
  @ApiResponse({
    status: 200,
    description: 'List retrieved successfully',
    type: ListMedicalApprovalRequestsResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async list(
    @Query() query: ListMedicalApprovalRequestsDto,
  ): Promise<ListMedicalApprovalRequestsResponseDto> {
    return await this.listMedicalApprovalRequestsUseCase.execute(query);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.DOCTOR, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Get medical approval request by ID',
    description:
      'Returns detailed information about a medical approval request including care instructions, image analyses, suggested exams, and symptoms.',
  })
  @ApiResponse({
    status: 200,
    description: 'Medical approval request retrieved successfully',
    type: GetMedicalApprovalRequestResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 404,
    description: 'Medical approval request not found',
  })
  async getById(
    @Param('id') id: string,
  ): Promise<GetMedicalApprovalRequestResponseDto> {
    try {
      return await this.getMedicalApprovalRequestUseCase.execute(id);
    } catch (error) {
      if (error instanceof MedicalApprovalRequestNotFoundError) {
        throw new NotFoundException(error.message);
      }
      throw error;
    }
  }

  @Post()
  @Public()
  @UseGuards(ApiKeyGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiHeader({
    name: 'x-api-key',
    description: 'API key for authentication',
    required: true,
  })
  @ApiOperation({
    summary: 'Create a new medical approval request',
    description:
      'Receives medical consultation data from trya-backend system and stores it for doctor review. ' +
      'Requires API key authentication via x-api-key header. ' +
      'The session_id must be unique across all requests.',
  })
  @ApiResponse({
    status: 201,
    description: 'Medical approval request created successfully',
    type: CreateMedicalApprovalRequestResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid payload or validation errors',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: {
          type: 'array',
          example: [
            'patient_name must be longer than or equal to 2 characters',
            'symptoms must contain at least 1 elements',
          ],
        },
        error: { type: 'string', example: 'Bad Request' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Missing or invalid API key',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 401 },
        message: { type: 'string', example: 'Invalid API Key' },
        error: { type: 'string', example: 'Unauthorized' },
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: 'Session ID already exists',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 409 },
        message: {
          type: 'string',
          example:
            "Medical approval request with session_id 'session_123' already exists",
        },
        error: { type: 'string', example: 'Conflict' },
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async create(
    @Body() dto: CreateMedicalApprovalRequestDto,
  ): Promise<CreateMedicalApprovalRequestResponseDto> {
    try {
      return await this.createMedicalApprovalRequestUseCase.execute(dto);
    } catch (error) {
      if (error instanceof SessionAlreadyExistsError) {
        throw new ConflictException(error.message);
      }
      throw error;
    }
  }

  @Post(':id/assign')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.DOCTOR)
  @ApiOperation({
    summary: 'Assign a medical approval request to the authenticated doctor',
    description:
      'Assigns a pending medical approval request to the authenticated doctor. ' +
      'The request status will change from PENDING to IN_REVIEW. ' +
      'Only requests with PENDING status can be assigned. ' +
      'Requires JWT authentication with DOCTOR role.',
  })
  @ApiResponse({
    status: 200,
    description: 'Medical approval request assigned successfully',
    type: AssignMedicalApprovalRequestResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid status transition - request is not in PENDING status',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: {
          type: 'string',
          example:
            'Cannot transition from IN_REVIEW to IN_REVIEW. Invalid status transition.',
        },
        error: { type: 'string', example: 'Bad Request' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - User does not have DOCTOR role',
  })
  @ApiResponse({
    status: 404,
    description: 'Medical approval request not found',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 404 },
        message: {
          type: 'string',
          example: "Medical approval request 'uuid' not found",
        },
        error: { type: 'string', example: 'Not Found' },
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async assign(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ): Promise<AssignMedicalApprovalRequestResponseDto> {
    try {
      return await this.assignMedicalApprovalRequestUseCase.execute(
        id,
        user.cognitoId,
      );
    } catch (error) {
      if (error instanceof MedicalApprovalRequestNotFoundError) {
        throw new NotFoundException(error.message);
      }
      if (error instanceof DoctorNotFoundError) {
        throw new NotFoundException(error.message);
      }
      if (error instanceof InvalidStatusTransitionError) {
        throw new BadRequestException(error.message);
      }
      throw new InternalServerErrorException('Failed to assign request');
    }
  }

  @Get(':id/beneficiary-details')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.DOCTOR, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Get beneficiary details for a medical approval request',
    description:
      'Retrieves detailed beneficiary information from the external API using the tenant configuration.',
  })
  @ApiResponse({
    status: 200,
    description: 'Beneficiary details retrieved successfully',
    type: GetBeneficiaryDetailsResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 404,
    description: 'Medical approval request not found',
  })
  @ApiResponse({
    status: 502,
    description: 'External API error',
  })
  async getBeneficiaryDetails(
    @Param('id') id: string,
  ): Promise<GetBeneficiaryDetailsResponseDto> {
    return await this.getBeneficiaryDetailsUseCase.execute(id);
  }

  @Get('patient/:patientId/history')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.DOCTOR, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Get patient medical history',
    description:
      'Retrieves all previous medical approval requests and prescriptions for a patient.',
  })
  @ApiResponse({
    status: 200,
    description: 'Patient history retrieved successfully',
    type: GetPatientHistoryResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async getPatientHistory(
    @Param('patientId') patientId: string,
  ): Promise<GetPatientHistoryResponseDto> {
    return await this.getPatientHistoryUseCase.execute(patientId);
  }

  @Get(':id/attachments/:attachmentId')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.DOCTOR, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Get file download URL for a medical approval request attachment',
    description:
      'Retrieves a pre-signed URL to download a specific attachment from the external API.',
  })
  @ApiResponse({
    status: 200,
    description: 'File URL retrieved successfully',
    type: GetFileUrlResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 404,
    description: 'Medical approval request or attachment not found',
  })
  @ApiResponse({
    status: 502,
    description: 'External API error',
  })
  async getFileUrl(
    @Param('id') id: string,
    @Param('attachmentId') attachmentId: string,
  ): Promise<GetFileUrlResponseDto> {
    return await this.getFileUrlUseCase.execute(id, attachmentId);
  }

  @Post(':id/approve')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.DOCTOR)
  @ApiOperation({
    summary: 'Approve or adjust a medical approval request',
    description:
      'Approves or adjusts a medical approval request. Only the assigned doctor can approve the request. ' +
      'The request must be in IN_REVIEW status to be approved or adjusted. ' +
      'Requires JWT authentication with DOCTOR role.',
  })
  @ApiResponse({
    status: 200,
    description: 'Medical approval request approved/adjusted successfully',
    type: ApproveMedicalApprovalRequestResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid status transition',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: {
          type: 'string',
          example:
            'Cannot transition from PENDING to APPROVED. Invalid status transition.',
        },
        error: { type: 'string', example: 'Bad Request' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Doctor not authorized to approve this request',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 403 },
        message: {
          type: 'string',
          example:
            'Doctor doctor-id is not authorized to approve this request. Request is assigned to doctor assigned-doctor-id.',
        },
        error: { type: 'string', example: 'Forbidden' },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Medical approval request not found',
  })
  async approve(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() dto: ApproveMedicalApprovalRequestDto,
  ): Promise<ApproveMedicalApprovalRequestResponseDto> {
    try {
      return await this.approveMedicalApprovalRequestUseCase.execute(
        id,
        user.cognitoId,
        dto,
      );
    } catch (error) {
      if (error instanceof MedicalApprovalRequestNotFoundError) {
        throw new NotFoundException(error.message);
      }
      if (error instanceof DoctorNotFoundError) {
        throw new NotFoundException(error.message);
      }
      if (error instanceof UnauthorizedApprovalError) {
        throw new BadRequestException(error.message);
      }
      if (error instanceof InvalidStatusTransitionError) {
        throw new BadRequestException(error.message);
      }
      throw new InternalServerErrorException('Failed to approve request');
    }
  }
}
