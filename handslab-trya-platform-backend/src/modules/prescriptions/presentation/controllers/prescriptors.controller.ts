import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/presentation/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/presentation/guards/roles.guard';
import { Roles } from '../../../auth/presentation/decorators/roles.decorator';
import { UserRole } from '../../../../shared/domain/enums/user-role.enum';
import { SyncPrescriptorUseCase } from '../../application/use-cases/sync-prescriptor/sync-prescriptor.use-case';
import {
  GetPrescriptorTokenUseCase,
  GetPrescriptorTokenResult,
} from '../../application/use-cases/get-prescriptor-token.use-case';
import { SyncPrescriptorDto } from '../../application/use-cases/sync-prescriptor/sync-prescriptor.dto';
import { SyncPrescriptorResponseDto } from '../../application/use-cases/sync-prescriptor/sync-prescriptor-response.dto';

@ApiTags('Prescriptors')
@Controller('prescriptors')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class PrescriptorsController {
  constructor(
    private readonly syncPrescriptorUseCase: SyncPrescriptorUseCase,
    private readonly getPrescriptorTokenUseCase: GetPrescriptorTokenUseCase,
  ) {}

  @Post('sync')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.DOCTOR, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Sync doctor with Memed',
    description:
      'Creates or updates a prescriptor in Memed with board information and optional city/specialty. Use this before the doctor can create prescriptions.',
  })
  @ApiResponse({
    status: 200,
    description: 'Prescriptor synced successfully.',
    type: SyncPrescriptorResponseDto,
  })
  @ApiResponse({
    status: 400,
    description:
      'Bad request - validation failed or Memed credentials not configured.',
  })
  @ApiResponse({
    status: 404,
    description: 'Doctor not found.',
  })
  async syncPrescriptor(
    @Body() dto: SyncPrescriptorDto,
  ): Promise<SyncPrescriptorResponseDto> {
    return this.syncPrescriptorUseCase.execute(dto);
  }

  @Get(':doctorId/token')
  @Roles(UserRole.DOCTOR, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Get prescriptor token',
    description:
      'Retrieves the Memed authentication token for a doctor. This token is used in the frontend widget (data-token attribute).',
  })
  @ApiParam({ name: 'doctorId', description: 'Doctor ID (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Token retrieved successfully',
    schema: {
      example: {
        doctorId: '550e8400-e29b-41d4-a716-446655440000',
        doctorName: 'Dr. João Silva',
        memedToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        memedStatus: 'Ativo',
        boardCode: 'CRM',
        boardNumber: '12345',
        boardState: 'SP',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Doctor not found' })
  @ApiResponse({ status: 400, description: 'Doctor not synced with Memed' })
  async getToken(
    @Param('doctorId') doctorId: string,
  ): Promise<GetPrescriptorTokenResult> {
    return this.getPrescriptorTokenUseCase.execute(doctorId);
  }
}
