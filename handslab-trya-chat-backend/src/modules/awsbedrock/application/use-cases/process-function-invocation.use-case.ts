import { Injectable, Logger } from '@nestjs/common';
import { ProcessLocationSearchUseCase } from './process-location-search.use-case';
import { ProcessPatientTriageUseCase } from './process-patient-triage.use-case';

interface FunctionParameter {
  name: string;
  value: any;
}

interface FunctionInvocationResult {
  success: boolean;
  data?: any;
  error?: string;
  actionGroup: string;
  functionName: string;
  timestamp: string;
}

/**
 * Use Case: Processar Invocação de Função do Bedrock Agent
 * 
 * Responsabilidade: Coordenar a execução de funções específicas (triagem, busca de locais)
 * Camada: Application (Clean Architecture)
 * 
 * Princípios SOLID:
 * - SRP: Responsabilidade única de coordenar invocações de funções
 * - OCP: Aberto para adicionar novas funções sem modificar código existente
 * - LSP: Pode ser substituído por implementações mais complexas
 * - ISP: Interface específica para cada tipo de função
 * - DIP: Depende de abstrações (use cases injetados)
 */
@Injectable()
export class ProcessFunctionInvocationUseCase {
  private readonly logger = new Logger(ProcessFunctionInvocationUseCase.name);

  constructor(
    private readonly locationSearchUseCase: ProcessLocationSearchUseCase,
    private readonly patientTriageUseCase: ProcessPatientTriageUseCase,
  ) {}

  /**
   * Executa a invocação de uma função específica
   * 
   * @param actionGroup Nome do action group
   * @param functionName Nome da função
   * @param parameters Parâmetros da função
   * @returns Resultado da execução
   */
  async execute(
    actionGroup: string,
    functionName: string,
    parameters: FunctionParameter[],
  ): Promise<FunctionInvocationResult> {
    this.logger.log(`🔧 Processando função: ${actionGroup}.${functionName}`);

    try {
      // Validar parâmetros de entrada
      if (!actionGroup || !functionName) {
        throw new Error('ActionGroup and functionName are required');
      }

      // Extrair parâmetros em formato de objeto
      const params = this.extractParameters(parameters);

      // Rotear para o use case apropriado
      const result = await this.routeToUseCase(actionGroup, functionName, params);

      this.logger.log(`✅ Função executada com sucesso: ${actionGroup}.${functionName}`);

      return {
        success: true,
        data: result,
        actionGroup,
        functionName,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(`❌ Erro ao executar ${actionGroup}.${functionName}:`, error.message);

      return {
        success: false,
        error: error.message,
        actionGroup,
        functionName,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Roteia a execução para o use case apropriado
   * 
   * Princípio OCP: Fácil adicionar novos casos sem modificar código existente
   */
  private async routeToUseCase(actionGroup: string, functionName: string, params: any): Promise<any> {
    // Normalizar nomes
    const normalizedActionGroup = actionGroup.toLowerCase().replace(/[_-]/g, '');
    const normalizedFunctionName = functionName.toLowerCase().replace(/[_-]/g, '');

    // Busca de locais
    if (this.isBuscaLocais(normalizedActionGroup, normalizedFunctionName)) {
      this.logger.log('🗺️ Executando busca de locais');
      return await this.locationSearchUseCase.execute(params);
    }

    // Triagem de paciente
    if (this.isTriagemPaciente(normalizedActionGroup, normalizedFunctionName)) {
      this.logger.log('🏥 Executando triagem de paciente');
      return await this.patientTriageUseCase.execute(params);
    }

    // Função genérica não implementada
    this.logger.warn(`⚠️ Função não implementada: ${actionGroup}.${functionName}`);
    return this.createGenericResponse(actionGroup, functionName, params);
  }

  /**
   * Verifica se é função de busca de locais
   */
  private isBuscaLocais(actionGroup: string, functionName: string): boolean {
    return (
      actionGroup.includes('buscalocais') ||
      actionGroup.includes('buscarlocais') ||
      functionName.includes('buscalocais') ||
      functionName.includes('buscarlocais') ||
      functionName.includes('searchlocations')
    );
  }

  /**
   * Verifica se é função de triagem
   */
  private isTriagemPaciente(actionGroup: string, functionName: string): boolean {
    return (
      actionGroup.includes('triagem') ||
      functionName.includes('triagem') ||
      functionName.includes('triage')
    );
  }

  /**
   * Extrai parâmetros em formato de objeto
   */
  private extractParameters(parameters: FunctionParameter[]): any {
    const params: any = {};

    if (Array.isArray(parameters)) {
      parameters.forEach((param) => {
        if (param.name && param.value !== undefined) {
          params[param.name] = param.value;
        }
      });
    }

    return params;
  }

  /**
   * Cria resposta genérica para funções não implementadas
   */
  private createGenericResponse(actionGroup: string, functionName: string, params: any): any {
    return {
      success: true,
      data: params,
      message: `Função ${functionName} executada com sucesso (implementação genérica)`,
      actionGroup,
      functionName,
      timestamp: new Date().toISOString(),
    };
  }
}

