import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { HealthcareClaimEntity } from '../../infrastructure/entities/healthcare-claim.entity';
import { ProviderMetricsEntity } from '../../infrastructure/entities/provider-metrics.entity';
import { ClaimsSummaryDto } from '../../presentation/dtos/claims.dto';

/**
 * Service para agregação e análise de dados de sinistros
 * Calcula métricas por prestador e mantém cache atualizado
 */
@Injectable()
export class ClaimsAnalyticsService {
  private readonly logger = new Logger(ClaimsAnalyticsService.name);

  constructor(
    @InjectRepository(HealthcareClaimEntity)
    private readonly claimsRepository: Repository<HealthcareClaimEntity>,
    @InjectRepository(ProviderMetricsEntity)
    private readonly metricsRepository: Repository<ProviderMetricsEntity>,
  ) {}

  /**
   * Atualiza métricas de todos os providers com claims
   * Executado diariamente às 2h da manhã
   */
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async updateAllMetrics(): Promise<void> {
    this.logger.log('Starting daily metrics update...');
    const startTime = Date.now();

    try {
      // Busca todos os providers com claims
      const providersWithClaims = await this.claimsRepository
        .createQueryBuilder('claim')
        .select('DISTINCT claim.provider_id', 'providerId')
        .where('claim.provider_id IS NOT NULL')
        .getRawMany();

      this.logger.log(
        `Found ${providersWithClaims.length} providers with claims`,
      );

      // Atualiza métricas de cada provider
      let updated = 0;
      for (const { providerId } of providersWithClaims) {
        await this.updateProviderMetrics(providerId);
        updated++;

        if (updated % 100 === 0) {
          this.logger.log(`Progress: ${updated}/${providersWithClaims.length}`);
        }
      }

      const endTime = Date.now();
      const duration = Math.round((endTime - startTime) / 1000);

      this.logger.log(
        `Metrics update completed - ${updated} providers in ${duration}s`,
      );
    } catch (error) {
      this.logger.error(`Metrics update failed: ${error.message}`, error.stack);
    }
  }

  /**
   * Remove outliers de um array de valores usando IQR (Interquartile Range)
   */
  private removeOutliers(values: number[]): number[] {
    if (values.length < 4) {
      return values; // Não há dados suficientes para calcular quartis
    }

    const sorted = [...values].sort((a, b) => a - b);
    const q1Index = Math.floor(sorted.length * 0.25);
    const q3Index = Math.floor(sorted.length * 0.75);
    
    const q1 = sorted[q1Index];
    const q3 = sorted[q3Index];
    const iqr = q3 - q1;
    
    const lowerBound = q1 - 1.5 * iqr;
    const upperBound = q3 + 1.5 * iqr;
    
    return values.filter(v => v >= lowerBound && v <= upperBound);
  }

  /**
   * Atualiza métricas de um provider específico
   */
  async updateProviderMetrics(providerId: string): Promise<ProviderMetricsEntity | null> {
    // Busca claims do provider
    const claims = await this.claimsRepository.find({
      where: { providerId },
      select: ['claimValue', 'createdAt'],
    });

    if (claims.length === 0) {
      return null;
    }

    // Extrai valores e remove outliers
    const claimValues = claims.map(c => Number(c.claimValue));
    const filteredValues = this.removeOutliers(claimValues);

    // Calcula agregações sem outliers
    const totalClaims = claims.length;
    const totalClaimValue = filteredValues.reduce((sum, v) => sum + v, 0);
    const avgClaimValue = filteredValues.length > 0 
      ? totalClaimValue / filteredValues.length 
      : 0;

    // Date range (usando createdAt como proxy para data do serviço)
    const claimDates = claims
      .map((c) => c.createdAt)
      .sort((a, b) => a.getTime() - b.getTime());
    const firstClaimDate = claimDates[0];
    const lastClaimDate = claimDates[claimDates.length - 1];

    // Upsert metrics
    let metrics = await this.metricsRepository.findOne({
      where: { providerId },
    });

    if (!metrics) {
      metrics = new ProviderMetricsEntity();
      metrics.providerId = providerId;
    }

    metrics.totalClaims = totalClaims;
    metrics.totalClaimValue = Math.round(totalClaimValue * 100) / 100;
    metrics.avgClaimValue = Math.round(avgClaimValue * 100) / 100;
    metrics.specialtyCounts = {};
    metrics.topProcedures = [];
    metrics.serviceTypeDistribution = {};
    metrics.firstClaimDate = firstClaimDate;
    metrics.lastClaimDate = lastClaimDate;

    await this.metricsRepository.save(metrics);

    return metrics;
  }

  /**
   * Busca métricas de um provider
   */
  async getProviderMetrics(providerId: string): Promise<ProviderMetricsEntity | null> {
    return this.metricsRepository.findOne({ where: { providerId } });
  }

  /**
   * Busca summary geral de claims
   */
  async getClaimsSummary(): Promise<ClaimsSummaryDto> {
    // Total claims
    const totalClaims = await this.claimsRepository.count();

    // Total claim value (removendo outliers)
    const allClaims = await this.claimsRepository.find({
      select: ['claimValue'],
    });
    const claimValues = allClaims.map(c => Number(c.claimValue));
    const filteredValues = this.removeOutliers(claimValues);
    const totalClaimValue = filteredValues.reduce((sum, v) => sum + v, 0);

    // Providers with claims
    const providersResult = await this.claimsRepository
      .createQueryBuilder('claim')
      .select('COUNT(DISTINCT claim.provider_id)', 'count')
      .where('claim.provider_id IS NOT NULL')
      .getRawOne();
    const providersWithClaims = parseInt(providersResult.count) || 0;

    // Last claim date (usando created_at)
    const lastClaimResult = await this.claimsRepository
      .createQueryBuilder('claim')
      .select('MAX(claim.created_at)', 'lastDate')
      .getRawOne();
    const lastClaimDate = lastClaimResult.lastDate
      ? new Date(lastClaimResult.lastDate)
      : new Date();

    // Top operators (operadoras)
    const operatorsResult = await this.claimsRepository
      .createQueryBuilder('claim')
      .select('claim.operator_name', 'operatorName')
      .addSelect('COUNT(*)', 'count')
      .groupBy('claim.operator_name')
      .orderBy('count', 'DESC')
      .limit(10)
      .getRawMany();

    const topSpecialties = operatorsResult.map((r) => ({
      specialty: r.operatorName,
      count: parseInt(r.count),
    }));

    // Top providers
    const providersTopResult = await this.claimsRepository
      .createQueryBuilder('claim')
      .innerJoin('claim.provider', 'provider')
      .select('claim.provider_id', 'providerId')
      .addSelect('provider.name', 'providerName')
      .addSelect('COUNT(*)', 'claimCount')
      .where('claim.provider_id IS NOT NULL')
      .groupBy('claim.provider_id')
      .addGroupBy('provider.name')
      .orderBy('"claimCount"', 'DESC')
      .limit(10)
      .getRawMany();

    const topProviders = providersTopResult.map((r) => ({
      providerId: r.providerId,
      providerName: r.providerName,
      claimCount: parseInt(r.claimCount),
    }));

    return {
      totalClaims,
      totalClaimValue: Math.round(totalClaimValue * 100) / 100,
      providersWithClaims,
      lastClaimDate,
      topSpecialties,
      topProviders,
    };
  }

  /**
   * Força atualização imediata de métricas (para uso após importação)
   */
  async forceMetricsUpdate(): Promise<void> {
    this.logger.log('Forcing immediate metrics update...');
    await this.updateAllMetrics();
  }

}
