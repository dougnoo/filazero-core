import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { CreatePrescriptionDto } from '../../application/dtos/create-prescription.dto';
import { SendPrescriptionDto } from '../../application/dtos/send-prescription.dto';
import { CreatePrescriptionUseCase } from '../../application/use-cases/create-prescription.use-case';
import { SendPrescriptionUseCase } from '../../application/use-cases/send-prescription.use-case';
import { ListPrescriptionsUseCase } from '../../application/use-cases/list-prescriptions.use-case';
import { GetPrescriptionUseCase } from '../../application/use-cases/get-prescription.use-case';
import { JwtAuthGuard } from '../../../auth/presentation/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/presentation/guards/roles.guard';
import { Roles } from '../../../auth/presentation/decorators/roles.decorator';
import { UserRole } from '../../../../shared/domain/enums/user-role.enum';
import type { MemedCredentials } from '../../domain/repositories/memed.repository.interface';

@Controller('prescriptions')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.DOCTOR, UserRole.ADMIN, UserRole.SUPER_ADMIN)
export class PrescriptionsController {
  constructor(
    private readonly createPrescriptionUseCase: CreatePrescriptionUseCase,
    private readonly sendPrescriptionUseCase: SendPrescriptionUseCase,
    private readonly listPrescriptionsUseCase: ListPrescriptionsUseCase,
    private readonly getPrescriptionUseCase: GetPrescriptionUseCase,
  ) {}

  /**
   * Create a new prescription
   * POST /prescriptions
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createDto: CreatePrescriptionDto) {
    // TODO: Get credentials from tenant configuration
    // For now, using environment variables as fallback
    const credentials: MemedCredentials = {
      apiKey: process.env.MEMED_API_KEY || '',
      secretKey: process.env.MEMED_SECRET_KEY || '',
    };

    const prescription = await this.createPrescriptionUseCase.execute(
      createDto,
      credentials,
    );

    return {
      id: prescription.id,
      memedPrescriptionId: prescription.memedPrescriptionId,
      pdfUrl: prescription.pdfUrl,
      patientName: prescription.patientName,
      medications: prescription.medications,
      exams: prescription.exams,
      createdAt: prescription.createdAt,
    };
  }

  /**
   * Get prescription by medical approval request ID (sessionId) with Memed data
   * GET /prescriptions/by-session/:sessionId
   */
  @Get('by-session/:sessionId')
  async findBySession(@Param('sessionId') sessionId: string) {
    // TODO: Get credentials from tenant configuration
    const credentials: MemedCredentials = {
      apiKey: process.env.MEMED_API_KEY || '',
      secretKey: process.env.MEMED_SECRET_KEY || '',
    };

    const prescription = await this.getPrescriptionUseCase.executeBySession(
      sessionId,
      credentials,
    );

    return prescription; // Can be null if not found
  }
  /**
   * Get prescription by ID with Memed data
   * GET /prescriptions/:id
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const credentials: MemedCredentials = {
      apiKey: process.env.MEMED_API_KEY || '',
      secretKey: process.env.MEMED_SECRET_KEY || '',
    };

    const prescription = await this.getPrescriptionUseCase.executeById(
      id,
      credentials,
    );

    return prescription;
  }

  /**
   * Send prescription via email/SMS/WhatsApp
   * POST /prescriptions/:id/send
   */
  @Post(':id/send')
  @HttpCode(HttpStatus.OK)
  async send(@Param('id') id: string, @Body() sendDto: SendPrescriptionDto) {
    // TODO: Get credentials from tenant configuration
    const credentials: MemedCredentials = {
      apiKey: process.env.MEMED_API_KEY || '',
      secretKey: process.env.MEMED_SECRET_KEY || '',
    };

    const prescription = await this.sendPrescriptionUseCase.execute(
      id,
      sendDto,
      credentials,
    );

    return {
      id: prescription.id,
      sentVia: prescription.sentVia,
      sentAt: prescription.sentAt,
    };
  }

  /**
   * List prescriptions
   * GET /prescriptions?doctorId=xxx or ?patientId=xxx or ?tenantId=xxx
   */
  @Get()
  async findAll(
    @Query('doctorId') doctorId?: string,
    @Query('patientId') patientId?: string,
    @Query('tenantId') tenantId?: string,
  ) {
    let prescriptions;

    if (doctorId) {
      prescriptions = await this.listPrescriptionsUseCase.byDoctor(doctorId);
    } else if (patientId) {
      prescriptions = await this.listPrescriptionsUseCase.byPatient(patientId);
    } else if (tenantId) {
      prescriptions = await this.listPrescriptionsUseCase.byTenant(tenantId);
    } else {
      // Return empty array if no filter provided
      prescriptions = [];
    }

    return prescriptions.map((p) => ({
      id: p.id,
      memedPrescriptionId: p.memedPrescriptionId,
      doctorId: p.doctorId,
      patientId: p.patientId,
      patientName: p.patientName,
      pdfUrl: p.pdfUrl,
      sentVia: p.sentVia,
      sentAt: p.sentAt,
      createdAt: p.createdAt,
    }));
  }
}
