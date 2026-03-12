import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { IPlanValidationService } from '../../domain/services/plan-validation.service.interface';

interface NetworkProviderPlan {
  plan: string;
}

interface NetworkProviderPlansResponse {
  data: NetworkProviderPlan[];
}

@Injectable()
export class PlatformPlanValidationService implements IPlanValidationService {
  private readonly logger = new Logger(PlatformPlanValidationService.name);
  private readonly platformApiUrl: string;
  private readonly platformApiKey: string;
  
  // Cache de planos por operadora: { 'AMIL': ['AMIL - Plano 1', 'AMIL - Plano 2'], ... }
  private readonly plansCache = new Map<string, string[]>();

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.platformApiUrl = this.configService.get<string>(
      'app.tryaPlatform.apiUrl',
      '',
    );
    this.platformApiKey = this.configService.get<string>(
      'app.tryaPlatform.apiKey',
      '',
    );

    if (!this.platformApiUrl) {
      this.logger.warn('TRYA_PLATFORM_API_URL não configurada');
    }
    if (!this.platformApiKey) {
      this.logger.warn('TRYA_PLATFORM_API_KEY não configurada');
    }
  }

  async validatePlanExists(planName: string): Promise<boolean> {
    // Se a API não estiver configurada, permite a importação (comportamento legado)
    if (!this.platformApiUrl || !this.platformApiKey) {
      this.logger.warn(
        'Platform API não configurada, permitindo importação sem validação',
      );
      return true;
    }

    try {
      // Extrai a operadora do nome do plano (ex: "AMIL - Plano Saúde" -> "AMIL")
      const operatorName = this.extractOperatorName(planName);
      if (!operatorName) {
        this.logger.warn(
          `Não foi possível extrair a operadora do plano: ${planName}`,
        );
        return false;
      }

      // Verifica se já temos os planos desta operadora em cache
      let operatorPlans = this.plansCache.get(operatorName);
      
      if (!operatorPlans) {
        // Busca os planos da API apenas se não estiverem em cache
        this.logger.debug(
          `Buscando planos da operadora "${operatorName}" na API (cache miss)`,
        );
        
        operatorPlans = await this.fetchOperatorPlans(operatorName);
        
        // Armazena no cache para futuras validações
        this.plansCache.set(operatorName, operatorPlans);
        
        this.logger.debug(
          `Cache atualizado: ${operatorPlans.length} planos da operadora "${operatorName}"`,
        );
      } else {
        this.logger.debug(
          `Usando planos em cache para operadora "${operatorName}" (cache hit)`,
        );
      }

      // Verifica se existe algum plano com nome similar
      const planExists = operatorPlans.some((cachedPlan) =>
        this.isPlanNameMatch(cachedPlan, planName),
      );

      if (!planExists) {
        this.logger.warn(
          `Plano "${planName}" não encontrado na API da plataforma. Planos disponíveis: ${operatorPlans.join(', ')}`,
        );
      } else {
        this.logger.debug(`Plano "${planName}" validado com sucesso`);
      }

      return planExists;
    } catch (error: any) {
      this.logger.error(
        `Erro ao validar plano "${planName}": ${error.message}`,
        error.stack,
      );
      return false;
    }
  }

  /**
   * Busca os planos de uma operadora na API da plataforma
   */
  private async fetchOperatorPlans(operatorName: string): Promise<string[]> {
    try {
      const url = `${this.platformApiUrl}/api/network-providers/plans`;
      
      const response = await firstValueFrom(
        this.httpService.get<NetworkProviderPlansResponse>(url, {
          params: { providerName: operatorName },
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': this.platformApiKey,
          },
        }),
      );

      // Retorna apenas os nomes dos planos do array 'data'
      return response.data.data.map((item) => item.plan);
    } catch (error: any) {
      this.logger.error(
        `Erro ao buscar planos da operadora ${operatorName}: ${error.message}`,
      );
      return [];
    }
  }

  /**
   * Extrai o nome da operadora do nome completo do plano
   * Ex: "58417 - AMIL 200 QC GR. MUNIC. RM RJ S/OBST COPART R PJCE" -> "AMIL"
   */
  private extractOperatorName(planName: string): string | null {
    const parts = planName.split(' - ');
    if (parts.length < 2) {
      return null;
    }
    // Pega a parte depois do código (parts[1]) e extrai a primeira palavra (operadora)
    const planNameWithoutCode = parts[1].trim();
    const operatorName = planNameWithoutCode.split(' ')[0];
    return operatorName.toUpperCase();
  }

  /**
   * Verifica se o nome do plano corresponde ao nome esperado
   * Faz uma comparação flexível, ignorando espaços extras e case
   */
  private isPlanNameMatch(apiPlanName: string, importPlanName: string): boolean {
    const normalize = (str: string) =>
      str.toLowerCase().trim().replace(/\s+/g, ' ');
    
    // Remove o código do plano importado se existir (ex: "58417 - AMIL ..." -> "AMIL ...")
    const importPlanWithoutCode = this.removePlanCode(importPlanName);
    
    return normalize(apiPlanName) === normalize(importPlanWithoutCode);
  }

  /**
   * Remove o código do plano se existir
   * Ex: "58417 - AMIL 200 QC GR. MUNIC." -> "AMIL 200 QC GR. MUNIC."
   */
  private removePlanCode(planName: string): string {
    const parts = planName.split(' - ');
    if (parts.length < 2) {
      return planName;
    }
    // Retorna tudo exceto o código (primeira parte)
    return parts.slice(1).join(' - ');
  }
}
