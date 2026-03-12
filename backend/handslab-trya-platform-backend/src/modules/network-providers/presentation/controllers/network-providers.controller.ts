import {
  Controller,
  Post,
  Get,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  HttpCode,
  HttpStatus,
  Query,
  Param,
  NotFoundException,
  Body,
  UseGuards,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ImportProvidersService } from '../../application/services/import-providers.service';
import { QueryProvidersService } from '../../application/services/query-providers.service';
import { GeocodingService } from '../../application/services/geocoding.service';
import { PlacesUpdateService } from '../../application/services/places-update.service';
import { ClaimsImportService } from '../../application/services/claims-import.service';
import { ClaimsAnalyticsService } from '../../application/services/claims-analytics.service';
import { QueryProvidersDto } from '../../application/dto/query-providers.dto';
import { QueryPlansDto } from '../../application/dto/query-plans.dto';
import { SearchNearbyProvidersDto } from '../../application/dto/search-nearby-providers.dto';
import { ClaimImportResponseDto } from '../dtos/claims.dto';
import { ListClaimsImportsDto } from '../../application/dto/list-claims-imports.dto';
import { Public } from '../../../auth/presentation/decorators/public.decorator';
import { CurrentUser } from '../../../auth/presentation/decorators/current-user.decorator';
import type { JwtUser } from '../../../auth/domain/interfaces/jwt-user.interface';
import { ApiKeyGuard } from 'src/shared/presentation/guards/api-key.guard';
import { JwtAuthGuard } from 'src/modules/auth/presentation/guards/jwt-auth.guard';
import { RolesGuard } from 'src/modules/auth/presentation/guards/roles.guard';
import { UserRole } from 'src/shared/domain/enums';
import { Roles } from 'src/modules/auth/presentation/decorators/roles.decorator';

@ApiTags('Network Providers')
@Controller('network-providers')
export class NetworkProvidersController {
  constructor(
    private readonly importProvidersService: ImportProvidersService,
    private readonly queryProvidersService: QueryProvidersService,
    private readonly geocodingService: GeocodingService,
    private readonly placesUpdateService: PlacesUpdateService,
    private readonly claimsImportService: ClaimsImportService,
    private readonly claimsAnalyticsService: ClaimsAnalyticsService,
  ) {}

  @Post('import')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Import providers from CSV or XLSX file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        operatorId: {
          type: 'string',
          format: 'uuid',
          description: 'ID da operadora selecionada (obrigatório)',
        },
        operatorName: {
          type: 'string',
          description: 'Nome da operadora (opcional, usado para fallback)',
        },
      },
      required: ['file', 'operatorId'],
    },
  })
  async importProviders(
    @UploadedFile() file: Express.Multer.File,
    @Body('operatorId') operatorId?: string,
    @Body('operatorName') operatorName?: string,
    @CurrentUser() currentUser?: JwtUser,
  ) {
    if (!file) {
      throw new BadRequestException(
        'Arquivo é obrigatório. Selecione um arquivo CSV ou Excel (.xlsx) para importar.',
      );
    }

    // Validação de tamanho (max 10MB)
    const maxSizeMB = 10;
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      throw new BadRequestException(
        `Arquivo muito grande (${(file.size / 1024 / 1024).toFixed(2)}MB). O tamanho máximo permitido é ${maxSizeMB}MB.`,
      );
    }

    // Validação de tipo MIME
    const allowedMimeTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `Tipo de arquivo inválido: "${file.mimetype}". Apenas arquivos CSV (.csv) e Excel (.xlsx, .xls) são aceitos.`,
      );
    }

    // O serviço faz validação adicional de colunas e estrutura
    return this.importProvidersService.importFile(
      file,
      operatorId,
      operatorName,
      currentUser?.cognitoId,
    );
  }

  @Get('imports/latest')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Get latest import information, optionally filtered by operator',
  })
  async getLatestImport(@Query('operatorId') operatorId?: string) {
    const latestImport =
      await this.importProvidersService.getLatestImport(operatorId);

    if (!latestImport) {
      return {
        success: true,
        import: null,
        message: 'No imports found',
      };
    }

    return {
      success: true,
      import: latestImport,
    };
  }

  @Get('imports')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({
    summary: 'List all imports, optionally filtered by operator',
  })
  async listImports(@Query('operatorId') operatorId?: string) {
    if (operatorId) {
      const imports =
        await this.importProvidersService.getImportsByOperator(operatorId);
      return {
        success: true,
        imports,
      };
    }

    const imports = await this.importProvidersService.getAllImports();
    return {
      success: true,
      imports,
    };
  }

  @Get('providers')
  @Public()
  @UseGuards(ApiKeyGuard)
  @ApiOperation({ summary: 'List all providers with filters' })
  async listProviders(@Query() query: QueryProvidersDto) {
    return this.queryProvidersService.findAll(query);
  }

  @Get('providers/search/nearby')
  @Public()
  @UseGuards(ApiKeyGuard)
  @ApiOperation({
    summary: 'Search providers by proximity with optional filters',
  })
  async searchNearby(@Query() query: SearchNearbyProvidersDto) {
    return this.queryProvidersService.searchNearbyProviders(
      query.latitude,
      query.longitude,
      query.providerName,
      query.searchText,
      query.planName,
      query.distanceKm,
      query.limit,
      query.page,
    );
  }

  @Get('providers/:id')
  @Public()
  @UseGuards(ApiKeyGuard)
  @ApiOperation({ summary: 'Get provider by ID' })
  async getProvider(@Param('id') id: string) {
    const provider = await this.queryProvidersService.findById(id);
    if (!provider) {
      throw new NotFoundException('Provider not found');
    }
    return provider;
  }

  @Get('states')
  @Public()
  @UseGuards(ApiKeyGuard)
  @ApiOperation({ summary: 'List all states with optional filters' })
  async getStates(
    @Query('providerName') providerName?: string,
    @Query('planName') planName?: string,
  ) {
    const states = await this.queryProvidersService.getStates(
      providerName,
      planName,
    );
    return { data: states };
  }

  @Get('states/:state/cities')
  @Public()
  @UseGuards(ApiKeyGuard)
  @ApiOperation({ summary: 'List cities by state with optional filters' })
  async getCitiesByState(
    @Param('state') state: string,
    @Query('providerName') providerName?: string,
    @Query('planName') planName?: string,
  ) {
    const cities = await this.queryProvidersService.getCitiesByState(
      state,
      providerName,
      planName,
    );
    return { data: cities };
  }

  @Get('states/:state/cities/:city/neighborhoods')
  @Public()
  @UseGuards(ApiKeyGuard)
  @ApiOperation({
    summary: 'List neighborhoods by state and city with optional filters',
  })
  async getNeighborhoodsByCity(
    @Param('state') state: string,
    @Param('city') city: string,
    @Query('providerName') providerName?: string,
    @Query('planName') planName?: string,
  ) {
    const neighborhoods =
      await this.queryProvidersService.getNeighborhoodsByCity(
        state,
        city,
        providerName,
        planName,
      );
    return { data: neighborhoods };
  }

  @Get('categories')
  @Public()
  @UseGuards(ApiKeyGuard)
  @ApiOperation({ summary: 'List all categories with optional filters' })
  async getCategories(
    @Query('state') state?: string,
    @Query('city') city?: string,
    @Query('neighborhood') neighborhood?: string,
    @Query('providerName') providerName?: string,
    @Query('planName') planName?: string,
  ) {
    const categories = await this.queryProvidersService.getCategories(
      state,
      city,
      neighborhood,
      providerName,
      planName,
    );
    return { data: categories };
  }

  @Get('specialties')
  @UseGuards(ApiKeyGuard)
  @ApiOperation({ summary: 'List all specialties with optional filters' })
  async getSpecialties(
    @Query('state') state?: string,
    @Query('city') city?: string,
    @Query('neighborhood') neighborhood?: string,
    @Query('providerName') providerName?: string,
    @Query('planName') planName?: string,
    @Query('category') category?: string,
  ) {
    const specialties = await this.queryProvidersService.getSpecialties(
      state,
      city,
      neighborhood,
      providerName,
      planName,
      category,
    );
    return { data: specialties };
  }

  @Get('plans')
  @Public()
  @UseGuards(ApiKeyGuard)
  @ApiOperation({
    summary: 'List all plans with optional filter by insurance company name',
  })
  async getPlans(@Query() query: QueryPlansDto) {
    const plans = await this.queryProvidersService.getPlans(query);
    return { data: plans };
  }

  @Post('claims/import')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({
    summary: 'Import healthcare claims from CSV or Excel file (AMIL format)',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'CSV or Excel file with claims data (AMIL format)',
        },
        operatorId: {
          type: 'string',
          format: 'uuid',
          description: 'ID da operadora (opcional)',
        },
      },
      required: ['file'],
    },
  })
  async importClaims(
    @UploadedFile() file: Express.Multer.File,
    @Body('operatorId') operatorId?: string,
    @CurrentUser() currentUser?: JwtUser,
  ): Promise<ClaimImportResponseDto> {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    return this.claimsImportService.importClaimsFile(
      file,
      operatorId,
      currentUser?.cognitoId,
    );
  }

  @Get('claims')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'List all claims imports with filters and pagination' })
  async getClaimsBatches(@Query() dto: ListClaimsImportsDto) {
    return this.claimsImportService.getAllImports(dto);
  }

  @Post('claims/imports/:importId/reprocess')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Reprocess a failed claims import using the file saved in S3',
  })
  async reprocessClaimsImport(
    @Param('importId') importId: string,
    @CurrentUser() currentUser?: JwtUser,
  ) {
    return this.claimsImportService.reprocessImport(
      importId,
      currentUser?.cognitoId,
    );
  }

  @Get('claims/summary')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({
    summary:
      'Get overall claims summary with totals, averages, and top providers',
  })
  async getClaimsSummary() {
    return this.claimsAnalyticsService.getClaimsSummary();
  }

  @Get('claims/providers/:providerId/metrics')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get detailed metrics for a specific provider' })
  async getProviderMetrics(@Param('providerId') providerId: string) {
    const metrics =
      await this.claimsAnalyticsService.getProviderMetrics(providerId);
    if (!metrics) {
      throw new NotFoundException('No metrics found for this provider');
    }
    return metrics;
  }

  @Post('claims/metrics/update')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Force update of all provider metrics' })
  @HttpCode(HttpStatus.OK)
  async forceMetricsUpdate() {
    await this.claimsAnalyticsService.forceMetricsUpdate();
    return { message: 'Metrics update initiated' };
  }

  @Get('stats')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get statistics' })
  async getStats() {
    return this.queryProvidersService.getStats();
  }

  @Post('imports/:importId/reprocess')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Reprocess a failed import using the file saved in S3',
  })
  async reprocessImport(@Param('importId') importId: string) {
    return this.importProvidersService.reprocessImport(importId);
  }

  @Get('imports/:importId/download')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Download the file used in an import',
  })
  async downloadImportFile(
    @Param('importId') importId: string,
    @Res() res: Response,
  ): Promise<void> {
    const { fileBuffer, filename } =
      await this.importProvidersService.downloadImportFile(importId);

    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${filename}"`,
    );
    res.send(fileBuffer);
  }

  @Post('geocoding/process')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Manually trigger geocoding for all pending locations',
  })
  async processGeocodingManually() {
    const result = await this.geocodingService.processGeocodingQueue();
    return {
      success: true,
      message: 'Geocoding process completed',
      result,
    };
  }

  @Post('geocoding/retry-failed')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retry geocoding for failed locations' })
  async retryFailedGeocoding() {
    const result = await this.geocodingService.retryFailedLocations();
    return {
      success: true,
      message: 'Retry process completed',
      result,
    };
  }

  @Get('geocoding/failed-list')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'List failed geocoding locations with details' })
  async getFailedLocations() {
    const failed = await this.geocodingService.getFailedLocations();
    return {
      count: failed.length,
      locations: failed,
    };
  }

  @Post('geocoding/reset-state')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Reset locations from state DF to pending for re-geocoding',
  })
  async resetStateGeocoding(@Body('state') state: string) {
    const result = await this.geocodingService.resetLocationsToRetry(state);
    return {
      success: true,
      message: `Reset ${result} locations from ${state} to pending`,
      count: result,
    };
  }

  @Get('geocoding/stats')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get geocoding and Google Places statistics' })
  async getGeocodingStats() {
    const geocodingStats = await this.geocodingService.getGeocodingStats();
    const placesStats = await this.placesUpdateService.getUpdateStats();

    return {
      geocoding: geocodingStats,
      googlePlaces: placesStats,
    };
  }

  @Post('geocoding/refresh-places')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Manually refresh Google Places data (rating, hours) for locations with place_id',
  })
  async refreshGooglePlaces() {
    const result = await this.placesUpdateService.updateAllPending();
    return {
      success: true,
      message: 'Google Places refresh completed',
      result,
    };
  }
}
