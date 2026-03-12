import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { IAmilRepository } from '../../domain/repositories/amil-repository.interface';
import { AmilPlan } from '../../domain/entities/amil-plan.entity';
import { AmilState } from '../../domain/entities/amil-state.entity';
import { AmilMunicipality } from '../../domain/entities/amil-municipality.entity';
import { AmilNeighborhood } from '../../domain/entities/amil-neighborhood.entity';
import { AmilServiceType } from '../../domain/entities/amil-service-type.entity';
import { AmilSpecialty } from '../../domain/entities/amil-specialty.entity';
import { AmilResult } from '../../domain/entities/amil-provider.entity';
import { HtmlParserService } from '../services/html-parser.service';

@Injectable()
export class HttpAmilRepository implements IAmilRepository {
  private readonly logger = new Logger(HttpAmilRepository.name);
  private readonly baseUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly htmlParser: HtmlParserService,
  ) {
    this.baseUrl =
      this.configService.get<string>('AMIL_API_BASE_URL') ||
      'https://www.amil.com.br/institucional/api/InstitucionalMiddleware';
  }

  async getPlans(operadora: string = 'SAUDE'): Promise<AmilPlan[]> {
    const url = `${this.baseUrl}/RedeCredenciadaPlanos?operadora=${operadora}`;
    try {
      this.logger.log(`[getPlans] Calling Amil API: ${url}`);
      const response = await firstValueFrom(
        this.httpService.get<any[]>(url, {
          headers: this.getHeaders(),
        }),
      );

      this.logger.log(
        `[getPlans] Response received - Status: ${response.status}, Plans count: ${response.data?.length || 0}`,
      );

      if (!Array.isArray(response.data)) {
        return [];
      }

      return response.data.map(
        (item) =>
          new AmilPlan({
            planCode: item.codigoPlano || '',
            networkCode: item.codigoRede?.toString() || '',
            name: item.nomeDoPlano || '',
            cardName: item.nomePlanoCartao,
            operatorName: item.operadora,
            line: item.contexto,
          }),
      );
    } catch (error) {
      this.logger.error(
        `[getPlans] Error calling ${url}:`,
        error.response?.data || error.message,
      );
      this.handleError(error, 'Failed to get plans');
      return [];
    }
  }

  async searchByCpf(cpf: string): Promise<AmilPlan[]> {
    const url = `${this.baseUrl}/amil/planos/identificacao/${cpf}`;
    try {
      this.logger.log(`[searchByCpf] Calling Amil API: ${url}`);
      const response = await firstValueFrom(
        this.httpService.get<any>(url, {
          headers: this.getHeaders(),
        }),
      );

      this.logger.log(
        `[searchByCpf] Response received - Status: ${response.status}, Plans count: ${response.data?.planos?.length || 0}`,
      );
      this.logger.debug(
        `[searchByCpf] Response data: ${JSON.stringify(response.data)}`,
      );

      return this.mapPlans(response.data);
    } catch (error) {
      this.logger.error(
        `[searchByCpf] Error calling ${url}:`,
        error.response?.data || error.message,
      );
      this.handleError(error, 'Failed to search plans by CPF');
      return [];
    }
  }

  async getStates(
    networkCode: string,
    operadora: string = 'SAUDE',
  ): Promise<{ UF: string }[]> {
    const url = `${this.baseUrl}/RedeCredenciadaEstado/${networkCode}/${operadora}`;
    try {
      this.logger.log(`[getStates] Calling Amil API: ${url}`);
      const response = await firstValueFrom(
        this.httpService.get<any[]>(url, {
          headers: this.getHeaders(),
        }),
      );

      this.logger.log(
        `[getStates] Response received - Status: ${response.status}, States count: ${response.data?.length || 0}`,
      );

      if (!Array.isArray(response.data)) {
        return [];
      }

      return response.data
        .map((item) => ({ UF: item.Uf }))
        .filter((item) => item.UF);
    } catch (error) {
      this.logger.error(
        `[getStates] Error calling ${url}:`,
        error.response?.data || error.message,
      );
      this.handleError(error, 'Failed to get states');
      return [];
    }
  }

  async getMunicipalities(
    networkCode: string,
    state: string,
    operadora: string = 'SAUDE',
  ): Promise<{ Municipality: string }[]> {
    const url = `${this.baseUrl}/RedeCredenciadaMunicipio/${networkCode}/${operadora}/${state}`;
    try {
      this.logger.log(`[getMunicipalities] Calling Amil API: ${url}`);
      const response = await firstValueFrom(
        this.httpService.get<any[]>(url, {
          headers: this.getHeaders(),
        }),
      );

      this.logger.log(
        `[getMunicipalities] Response received - Status: ${response.status}, Municipalities count: ${response.data?.length || 0}`,
      );

      if (!Array.isArray(response.data)) {
        return [];
      }

      return response.data
        .map((item) => ({ Municipality: item.Municipio }))
        .filter((item) => item.Municipality);
    } catch (error) {
      this.logger.error(
        `[getMunicipalities] Error calling ${url}:`,
        error.response?.data || error.message,
      );
      this.handleError(error, 'Failed to get municipalities');
      return [];
    }
  }

  async getNeighborhoods(
    networkCode: string,
    state: string,
    municipality: string,
    operadora: string = 'SAUDE',
  ): Promise<{ Neighborhood: string }[]> {
    const url = `${this.baseUrl}/RedeCredenciadaBairro/${networkCode}/${operadora}/${state}/${municipality}`;
    try {
      this.logger.log(`[getNeighborhoods] Calling Amil API: ${url}`);
      const response = await firstValueFrom(
        this.httpService.get<any[]>(url, {
          headers: this.getHeaders(),
        }),
      );

      this.logger.log(
        `[getNeighborhoods] Response received - Status: ${response.status}, Neighborhoods count: ${response.data?.length || 0}`,
      );

      if (!Array.isArray(response.data)) {
        return [];
      }

      return response.data
        .map((item) => ({ Neighborhood: item.nomeBairro }))
        .filter((item) => item.Neighborhood);
    } catch (error) {
      this.logger.error(
        `[getNeighborhoods] Error calling ${url}:`,
        error.response?.data || error.message,
      );
      this.handleError(error, 'Failed to get neighborhoods');
      return [];
    }
  }

  async getServiceTypes(
    networkCode: string,
    state: string,
    municipality: string,
    neighborhood: string,
    operadora: string = 'SAUDE',
  ): Promise<{ ServiceType: string }[]> {
    const url = `${this.baseUrl}/RedeCredenciadaTipoServico/${networkCode}/${operadora}/${state}/${municipality}/${neighborhood}`;
    try {
      this.logger.log(`[getServiceTypes] Calling Amil API: ${url}`);
      const response = await firstValueFrom(
        this.httpService.get<any[]>(url, {
          headers: this.getHeaders(),
        }),
      );

      this.logger.log(
        `[getServiceTypes] Response received - Status: ${response.status}, Service types count: ${response.data?.length || 0}`,
      );

      if (!Array.isArray(response.data)) {
        return [];
      }

      return response.data
        .map((item) => ({ ServiceType: item.NIVEL1_CAPITULO }))
        .filter((item) => item.ServiceType);
    } catch (error) {
      this.logger.error(
        `[getServiceTypes] Error calling ${url}:`,
        error.response?.data || error.message,
      );
      this.handleError(error, 'Failed to get service types');
      return [];
    }
  }

  async getSpecialties(
    networkCode: string,
    state: string,
    municipality: string,
    neighborhood: string,
    serviceType: string,
    operadora: string = 'SAUDE',
  ): Promise<{ Specialty: string }[]> {
    const url = `${this.baseUrl}/RedeCredenciadaEspecialidade/${networkCode}/${operadora}/${state}/${municipality}/${neighborhood}/${serviceType}`;
    try {
      this.logger.log(`[getSpecialties] Calling Amil API: ${url}`);
      const response = await firstValueFrom(
        this.httpService.get<any[]>(url, {
          headers: this.getHeaders(),
        }),
      );

      this.logger.log(
        `[getSpecialties] Response received - Status: ${response.status}, Specialties count: ${response.data?.length || 0}`,
      );

      if (!Array.isArray(response.data)) {
        return [];
      }

      return response.data
        .map((item) => ({ Specialty: item.NIVEL2_ELEMENTODIVULGACAO }))
        .filter((item) => item.Specialty);
    } catch (error) {
      this.logger.error(
        `[getSpecialties] Error calling ${url}:`,
        error.response?.data || error.message,
      );
      this.handleError(error, 'Failed to get specialties');
      return [];
    }
  }

  async searchProvidersInstitucional(params: {
    networkCode: string;
    state: string;
    municipality: string;
    neighborhood: string;
    specialty: string;
    serviceType: string;
    operator?: string;
    modality?: string;
    context?: string;
  }): Promise<any[]> {
    const url = `${this.baseUrl}/RedeCredenciadaCredenciado`;
    const body = {
      codigoRede: parseInt(params.networkCode),
      uf: params.state,
      municipio: params.municipality,
      bairro: params.neighborhood,
      especialidade: params.specialty,
      tipoServico: params.serviceType,
      operadora: params.operator || 'AMIL',
      modalidade: params.modality || 'SAUDE',
      contexto: params.context || 'AMIL',
    };

    try {
      this.logger.log(
        `[searchProvidersInstitucional] Calling Amil API: ${url}`,
      );
      this.logger.debug(
        `[searchProvidersInstitucional] Body: ${JSON.stringify(body)}`,
      );

      const response = await firstValueFrom(
        this.httpService.post<any[]>(url, body, {
          headers: {
            ...this.getHeaders(),
            'Content-Type': 'application/json',
          },
        }),
      );

      this.logger.log(
        `[searchProvidersInstitucional] Response received - Status: ${response.status}, Providers count: ${response.data?.length || 0}`,
      );

      if (!Array.isArray(response.data)) {
        return [];
      }

      return response.data;
    } catch (error) {
      this.logger.error(
        `[searchProvidersInstitucional] Error calling ${url}:`,
        error.response?.data || error.message,
      );
      this.handleError(error, 'Failed to search providers');
      return [];
    }
  }

  async searchProviders(params: {
    networkCode: string;
    planCode: string;
    state: string;
    municipality: string;
    serviceType: string;
    specialty: string;
    neighborhood?: string;
  }): Promise<AmilResult> {
    const normalizedState = this.normalizePathParam(params.state);
    const normalizedMunicipality = this.normalizePathParam(params.municipality);
    const normalizedServiceType = this.normalizePathParam(params.serviceType);
    const normalizedSpecialty = this.normalizePathParam(params.specialty);
    const normalizedNeighborhood = params.neighborhood
      ? this.normalizePathParam(params.neighborhood)
      : undefined;

    // Build query string manually preserving +, (, ), -, _ characters
    const queryParts = [
      `plano.codigo=${params.planCode}`,
      `filtro.codigoPlano=${params.planCode}`,
      `filtro.operadora=AMIL`,
      `filtro.contexto=amil`,
      `filtro.linha=AMIL`,
      `identificacao=`,
      `filtro.codigoRede=${params.networkCode}`,
      `filtro.uf=${this.encodeQueryValue(normalizedState)}`,
      `filtro.municipio=${this.encodeQueryValue(normalizedMunicipality)}`,
      `filtro.tipoServico=${this.encodeQueryValue(normalizedServiceType)}`,
      `filtro.especialidade=${this.encodeQueryValue(normalizedSpecialty)}`,
    ];

    if (normalizedNeighborhood) {
      queryParts.push(
        `filtro.bairro=${this.encodeQueryValue(normalizedNeighborhood)}`,
      );
    }

    const url = `${this.baseUrl}/resultado-partial?${queryParts.join('&')}`;
    try {
      this.logger.log(`[searchProviders] Calling Amil API: ${url}`);
      this.logger.debug(`[searchProviders] Params: ${JSON.stringify(params)}`);

      const response = await firstValueFrom(
        this.httpService.get<any>(url, {
          headers: {
            ...this.getHeaders(),
            Accept: '*/*',
            'X-Requested-With': 'XMLHttpRequest',
            Referer:
              'https://www.amil.com.br/portal/web/servicos/saude/rede-credenciada/amil/busca-avancada',
          },
        }),
      );

      const result = this.htmlParser.parseResultadoHtml(response.data);
      this.logger.log(
        `[searchProviders] Response received - Status: ${response.status}, Providers count: ${result.quantity}`,
      );
      this.logger.debug(
        `[searchProviders] HTML response length: ${response.data?.length || 0} characters`,
      );

      return result;
    } catch (error) {
      this.logger.error(
        `[searchProviders] Error calling ${url}:`,
        error.response?.data || error.message,
      );
      this.handleError(error, 'Failed to search providers');
      return new AmilResult({ quantity: 0, specialty: '', providers: [] });
    }
  }

  private normalizePathParam(value: string): string {
    // Normalize to uppercase, remove accents, replace spaces with +
    // Keep special chars like (, ), -, _ without encoding
    return value
      .toUpperCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '+');
  }

  private encodeQueryValue(value: string): string {
    // Encode the value but preserve +, (, ), -, _ characters
    return encodeURIComponent(value)
      .replace(/%2B/g, '+')
      .replace(/%28/g, '(')
      .replace(/%29/g, ')')
      .replace(/%2D/g, '-')
      .replace(/%5F/g, '_');
  }

  private getHeaders(): Record<string, string> {
    return {
      Accept: 'application/json, text/plain, */*',
      'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
      'Accept-Encoding': 'gzip, deflate, br',
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      Origin: 'https://www.amil.com.br',
      Referer: 'https://www.amil.com.br/institucional/',
      'sec-ch-ua':
        '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-origin',
    };
  }

  private mapPlans(data: any): AmilPlan[] {
    const plans = data?.planos;
    if (!Array.isArray(plans)) {
      return [];
    }

    return plans.map((item) => {
      const plano = item.plano || item;
      return new AmilPlan({
        planCode: plano.codigo || '',
        networkCode: plano.codigoRede || '',
        name: plano.nome || '',
        cardName: plano.nomeCartao,
        ansRegistration: plano.registroAns,
        operatorName: plano.nomeOperadora,
        line: plano.linha,
      });
    });
  }

  private mapStates(data: any): AmilState[] {
    const states = data?.estados;
    if (!Array.isArray(states)) {
      return [];
    }

    return states.map(
      (item) =>
        new AmilState({
          abbreviation: item.value || '',
          name: item.nome || item.value || '',
        }),
    );
  }

  private mapMunicipalities(data: any, state: string): AmilMunicipality[] {
    const municipalities = data?.municipios;
    if (!Array.isArray(municipalities)) {
      return [];
    }

    return municipalities.map(
      (item) =>
        new AmilMunicipality({
          code: item.codigo || item.value || '',
          name: item.value || item.nome || '',
          state: state,
        }),
    );
  }

  private mapNeighborhoods(
    data: any,
    municipality: string,
  ): AmilNeighborhood[] {
    const neighborhoods = data?.bairros;
    if (!Array.isArray(neighborhoods)) {
      return [];
    }

    return neighborhoods.map(
      (item) =>
        new AmilNeighborhood({
          code: item.codigo || item.value || '',
          name: item.value || item.nome || '',
          municipality: municipality,
        }),
    );
  }

  private mapServiceTypes(data: any): AmilServiceType[] {
    const serviceTypes =
      data?.tiposServicos || data?.tiposServico || data?.tipos_servico;
    if (!Array.isArray(serviceTypes)) {
      return [];
    }

    return serviceTypes.map((item) => {
      // Handle both string and object formats
      if (typeof item === 'string') {
        return new AmilServiceType({
          code: item,
          name: item,
          specialtiesUrl: undefined,
        });
      }
      return new AmilServiceType({
        code: item.value || item.codigo || '',
        name: item.value || item.nome || '',
        specialtiesUrl: item.buscar_especialidades,
      });
    });
  }

  private mapSpecialties(data: any, serviceType: string): AmilSpecialty[] {
    const specialties = data?.especialidades;
    if (!Array.isArray(specialties)) {
      return [];
    }

    return specialties.map((item) => {
      // Handle both string and object formats
      if (typeof item === 'string') {
        return new AmilSpecialty({
          code: item,
          name: item,
          serviceType: serviceType,
        });
      }
      return new AmilSpecialty({
        code: item.value || item.codigo || '',
        name: item.value || item.nome || '',
        serviceType: serviceType,
      });
    });
  }

  private handleError(error: any, message: string): never {
    const errorMessage =
      error?.response?.data?.message || error?.message || message;
    throw new Error(`Amil API Error: ${errorMessage}`);
  }
}
