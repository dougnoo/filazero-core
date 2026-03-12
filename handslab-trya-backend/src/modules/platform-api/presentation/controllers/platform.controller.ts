import { Controller, Get, Param, UseGuards, Query } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiHeader,
  ApiSecurity,
} from '@nestjs/swagger';
import { GetBeneficiaryDataUseCase } from '../../application/use-cases/get-beneficiary-data.use-case';
import { GetBeneficiaryFileUseCase } from '../../application/use-cases/get-beneficiary-file.use-case';
import { ApiKeyGuard } from '../guards/api-key.guard';
import { Public } from 'src/modules/auth/presentation/decorators/public.decorator';
import { GetHealthPlansUseCase } from '../../application/use-cases/get-health-plans.use-case';

@ApiTags('platform')
@ApiSecurity('api-key')
@Public()
@UseGuards(ApiKeyGuard)
@Controller('platform')
export class PlatformApiController {
  constructor(
    private readonly getBeneficiaryDataUseCase: GetBeneficiaryDataUseCase,
    private readonly getBeneficiaryFileUseCase: GetBeneficiaryFileUseCase,
    private readonly getHealthPlansUseCase: GetHealthPlansUseCase,
  ) {}

  @Get('beneficiaries/:beneficiaryId')
  @ApiOperation({ summary: 'Get beneficiary data for parent API' })
  @ApiParam({ name: 'beneficiaryId', description: 'Beneficiary ID' })
  @ApiHeader({ name: 'x-api-key', required: true, description: 'API Key' })
  @ApiResponse({ status: 200, description: 'Beneficiary data retrieved' })
  @ApiResponse({ status: 401, description: 'Invalid API key' })
  @ApiResponse({ status: 404, description: 'Beneficiary not found' })
  async getBeneficiaryData(@Param('beneficiaryId') beneficiaryId: string) {
    return await this.getBeneficiaryDataUseCase.execute(beneficiaryId);
  }

  @Get('beneficiaries/:beneficiaryId/files/:fileId')
  @ApiOperation({ summary: 'Get beneficiary file URL for parent API' })
  @ApiParam({ name: 'beneficiaryId', description: 'Beneficiary ID' })
  @ApiParam({ name: 'fileId', description: 'File ID' })
  @ApiHeader({ name: 'x-api-key', required: true, description: 'API Key' })
  @ApiResponse({ status: 200, description: 'File URL retrieved' })
  @ApiResponse({ status: 401, description: 'Invalid API key' })
  @ApiResponse({ status: 404, description: 'Beneficiary or file not found' })
  async getBeneficiaryFile(
    @Param('beneficiaryId') beneficiaryId: string,
    @Param('fileId') fileId: string,
  ) {
    return await this.getBeneficiaryFileUseCase.execute(fileId, beneficiaryId);
  }

  @Get(':tenantId/plans/:planName')
  @ApiOperation({ summary: 'List health plans by name and tenant' })
  @ApiParam({ name: 'planName', description: 'Plan Name' })
  @ApiHeader({ name: 'x-api-key', required: true, description: 'API Key' })
  @ApiResponse({ status: 200, description: 'List of plans with id and name' })
  @ApiResponse({ status: 401, description: 'Invalid API key' })
  async getPlansByName(
    @Param('planName') planName: string,
    @Param('tenantId') tenantId: string,
  ) {
    return await this.getHealthPlansUseCase.execute({
      planName,
      tenantId,
    });
  }
}
