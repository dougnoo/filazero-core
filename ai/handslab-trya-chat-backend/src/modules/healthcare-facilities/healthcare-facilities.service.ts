import { Injectable, Logger } from '@nestjs/common';
import { Coordinates } from '../location/location.service';
import { GeocodingService } from '../location/geocoding.service';

export interface HealthcareFacility {
  id: string;
  nome: string;
  tipo: 'Hospital' | 'UBS' | 'Pronto Socorro' | 'Clínica' | 'UPA' | 'Centro Médico';
  endereco: string;
  coordinates?: Coordinates; // Agora é opcional - será preenchido via geocoding
  telefone?: string;
  especialidades?: string[];
  funcionamento?: string;
  aceitaEmergencia?: boolean;
  temProntoSocorro?: boolean;
}

export interface HealthcareFacilityFromIA {
  nome: string;
  tipo?: string;
  endereco: string;
  telefone?: string;
  especialidades?: string[];
  funcionamento?: string;
}

/**
 * Serviço para gerenciar locais de atendimento de saúde
 * ADAPTADO: Recebe endereços da IA e converte em coordenadas via geocoding
 */
@Injectable()
export class HealthcareFacilitiesService {
  private readonly logger = new Logger(HealthcareFacilitiesService.name);
  
  constructor(private geocodingService: GeocodingService) {}
  
  // Base de dados simulada - Em produção, substituir por consulta ao banco de dados
  private facilities: HealthcareFacility[] = [
    {
      id: 'hosp-001',
      nome: 'Hospital São José',
      tipo: 'Hospital',
      endereco: 'Rua das Flores, 123 - Centro, São Paulo - SP',
      coordinates: { latitude: -23.5505, longitude: -46.6333 },
      telefone: '(11) 3456-7890',
      especialidades: ['Clínica Geral', 'Emergência', 'Cardiologia', 'Ortopedia', 'Pediatria'],
      funcionamento: '24 horas',
      aceitaEmergencia: true,
      temProntoSocorro: true,
    },
    {
      id: 'ubs-001',
      nome: 'UBS Vila Nova',
      tipo: 'UBS',
      endereco: 'Av. Principal, 456 - Vila Nova, São Paulo - SP',
      coordinates: { latitude: -23.5489, longitude: -46.6388 },
      telefone: '(11) 3333-4444',
      especialidades: ['Clínica Geral', 'Pediatria', 'Ginecologia', 'Vacinação'],
      funcionamento: '07:00 às 17:00',
      aceitaEmergencia: false,
      temProntoSocorro: false,
    },
    {
      id: 'ps-001',
      nome: 'Pronto Socorro Municipal',
      tipo: 'Pronto Socorro',
      endereco: 'Rua da Saúde, 789 - Jardim Esperança, São Paulo - SP',
      coordinates: { latitude: -23.5558, longitude: -46.6396 },
      telefone: '(11) 192',
      especialidades: ['Emergência', 'Trauma', 'Urgência', 'Clínica Geral'],
      funcionamento: '24 horas',
      aceitaEmergencia: true,
      temProntoSocorro: true,
    },
    {
      id: 'hosp-002',
      nome: 'Hospital Santa Maria',
      tipo: 'Hospital',
      endereco: 'Av. Paulista, 1000 - Bela Vista, São Paulo - SP',
      coordinates: { latitude: -23.5631, longitude: -46.6544 },
      telefone: '(11) 2222-3333',
      especialidades: ['Clínica Geral', 'Cardiologia', 'Neurologia', 'Oncologia', 'UTI'],
      funcionamento: '24 horas',
      aceitaEmergencia: true,
      temProntoSocorro: true,
    },
    {
      id: 'upa-001',
      nome: 'UPA Jardim América',
      tipo: 'UPA',
      endereco: 'Rua América, 234 - Jardim América, São Paulo - SP',
      coordinates: { latitude: -23.5425, longitude: -46.6274 },
      telefone: '(11) 4444-5555',
      especialidades: ['Urgência', 'Emergência', 'Clínica Geral', 'Pequenas Cirurgias'],
      funcionamento: '24 horas',
      aceitaEmergencia: true,
      temProntoSocorro: true,
    },
    {
      id: 'clinic-001',
      nome: 'Clínica Saúde Total',
      tipo: 'Clínica',
      endereco: 'Rua Augusta, 567 - Consolação, São Paulo - SP',
      coordinates: { latitude: -23.5587, longitude: -46.6563 },
      telefone: '(11) 5555-6666',
      especialidades: ['Clínica Geral', 'Dermatologia', 'Oftalmologia', 'Check-up'],
      funcionamento: '08:00 às 20:00',
      aceitaEmergencia: false,
      temProntoSocorro: false,
    },
    {
      id: 'hosp-003',
      nome: 'Hospital das Clínicas',
      tipo: 'Hospital',
      endereco: 'Av. Dr. Enéas de Carvalho Aguiar, 255 - Cerqueira César, São Paulo - SP',
      coordinates: { latitude: -23.5558, longitude: -46.6705 },
      telefone: '(11) 2661-0000',
      especialidades: ['Todas as Especialidades', 'Emergência', 'UTI', 'Centro de Trauma'],
      funcionamento: '24 horas',
      aceitaEmergencia: true,
      temProntoSocorro: true,
    },
    {
      id: 'ubs-002',
      nome: 'UBS Mooca',
      tipo: 'UBS',
      endereco: 'Rua da Mooca, 1234 - Mooca, São Paulo - SP',
      coordinates: { latitude: -23.5501, longitude: -46.5961 },
      telefone: '(11) 7777-8888',
      especialidades: ['Clínica Geral', 'Pediatria', 'Enfermagem', 'Farmácia'],
      funcionamento: '07:00 às 19:00',
      aceitaEmergencia: false,
      temProntoSocorro: false,
    },
    {
      id: 'ps-002',
      nome: 'Pronto Socorro Zona Norte',
      tipo: 'Pronto Socorro',
      endereco: 'Av. Inajar de Souza, 1500 - Freguesia do Ó, São Paulo - SP',
      coordinates: { latitude: -23.4814, longitude: -46.6919 },
      telefone: '(11) 3932-1111',
      especialidades: ['Emergência', 'Trauma', 'Clínica Geral', 'Pediatria de Urgência'],
      funcionamento: '24 horas',
      aceitaEmergencia: true,
      temProntoSocorro: true,
    },
    {
      id: 'hosp-004',
      nome: 'Hospital Samaritano',
      tipo: 'Hospital',
      endereco: 'Rua Conselheiro Brotero, 1486 - Higienópolis, São Paulo - SP',
      coordinates: { latitude: -23.5447, longitude: -46.6568 },
      telefone: '(11) 3821-5300',
      especialidades: ['Cardiologia', 'Ortopedia', 'Oncologia', 'Neurologia', 'Emergência'],
      funcionamento: '24 horas',
      aceitaEmergencia: true,
      temProntoSocorro: true,
    },
  ];

  /**
   * Busca todos os locais de atendimento
   * Em produção, isso deve consultar um banco de dados com filtros adequados
   */
  async findAll(): Promise<HealthcareFacility[]> {
    return this.facilities;
  }

  /**
   * Busca locais por tipo
   */
  async findByType(tipo: string): Promise<HealthcareFacility[]> {
    const tipoUpper = tipo.toUpperCase();
    return this.facilities.filter(f => f.tipo.toUpperCase() === tipoUpper);
  }

  /**
   * Busca locais que aceitam emergência
   */
  async findEmergencyFacilities(): Promise<HealthcareFacility[]> {
    return this.facilities.filter(f => f.aceitaEmergencia);
  }

  /**
   * Busca locais por especialidade
   */
  async findBySpecialty(especialidade: string): Promise<HealthcareFacility[]> {
    const especialidadeLower = especialidade.toLowerCase();
    return this.facilities.filter(f => 
      f.especialidades.some(e => e.toLowerCase().includes(especialidadeLower))
    );
  }

  /**
   * Filtra locais baseado em critérios
   */
  async filterFacilities(criteria: {
    tipo?: string;
    emergencia?: boolean;
    especialidade?: string;
  }): Promise<HealthcareFacility[]> {
    let filtered = [...this.facilities];

    if (criteria.tipo) {
      filtered = filtered.filter(f => 
        f.tipo.toLowerCase().includes(criteria.tipo.toLowerCase())
      );
    }

    if (criteria.emergencia !== undefined) {
      filtered = filtered.filter(f => f.aceitaEmergencia === criteria.emergencia);
    }

    if (criteria.especialidade) {
      filtered = filtered.filter(f =>
        f.especialidades.some(e => 
          e.toLowerCase().includes(criteria.especialidade.toLowerCase())
        )
      );
    }

    this.logger.debug(`Filtrado ${filtered.length} locais com critérios:`, criteria);
    return filtered;
  }

  /**
   * Adiciona um novo local (para uso administrativo)
   * Em produção, isso deve persistir no banco de dados
   */
  async addFacility(facility: HealthcareFacility): Promise<HealthcareFacility> {
    this.facilities.push(facility);
    this.logger.log(`✅ Local adicionado: ${facility.nome}`);
    return facility;
  }

  /**
   * Busca local por ID
   */
  async findById(id: string): Promise<HealthcareFacility | undefined> {
    return this.facilities.find(f => f.id === id);
  }

  /**
   * NOVO: Converte lista de endereços da IA em locais com coordenadas
   * Esta é a função principal para o seu caso de uso!
   */
  async convertAddressesToFacilities(
    facilitiesFromIA: HealthcareFacilityFromIA[]
  ): Promise<HealthcareFacility[]> {
    this.logger.log(`🔄 Convertendo ${facilitiesFromIA.length} endereços da IA em coordenadas...`);
    
    const facilities: HealthcareFacility[] = [];
    
    for (const facilityFromIA of facilitiesFromIA) {
      try {
        // Geocodificar o endereço (converter para lat/lng)
        const geocodingResult = await this.geocodingService.geocodeAddress(facilityFromIA.endereco);
        
        if (geocodingResult) {
          facilities.push({
            id: this.generateId(facilityFromIA.nome),
            nome: facilityFromIA.nome,
            tipo: this.normalizeTipo(facilityFromIA.tipo),
            endereco: facilityFromIA.endereco,
            coordinates: {
              latitude: geocodingResult.latitude,
              longitude: geocodingResult.longitude,
            },
            telefone: facilityFromIA.telefone,
            especialidades: facilityFromIA.especialidades || [],
            funcionamento: facilityFromIA.funcionamento,
            aceitaEmergencia: this.checkIfAcceptsEmergency(facilityFromIA.tipo),
            temProntoSocorro: this.checkIfHasEmergencyRoom(facilityFromIA.tipo),
          });
          
          this.logger.debug(`✅ ${facilityFromIA.nome}: ${geocodingResult.latitude}, ${geocodingResult.longitude}`);
        } else {
          this.logger.warn(`⚠️ Não foi possível geocodificar: ${facilityFromIA.endereco}`);
          
          // Adicionar mesmo sem coordenadas (será filtrado depois)
          facilities.push({
            id: this.generateId(facilityFromIA.nome),
            nome: facilityFromIA.nome,
            tipo: this.normalizeTipo(facilityFromIA.tipo),
            endereco: facilityFromIA.endereco,
            telefone: facilityFromIA.telefone,
            especialidades: facilityFromIA.especialidades || [],
            funcionamento: facilityFromIA.funcionamento,
          });
        }
      } catch (error) {
        this.logger.error(`❌ Erro ao processar ${facilityFromIA.nome}:`, error.message);
      }
    }
    
    const withCoordinates = facilities.filter(f => f.coordinates).length;
    this.logger.log(`✅ Conversão concluída: ${withCoordinates}/${facilities.length} com coordenadas`);
    
    return facilities;
  }

  /**
   * NOVO: Processa endereços retornados pela IA do Bedrock
   * Exemplo de uso direto com resposta da IA
   */
  async processFacilitiesFromBedrockResponse(
    bedrockResponse: any
  ): Promise<HealthcareFacility[]> {
    this.logger.log('🤖 Processando resposta do Bedrock...');
    
    // Se a resposta já vem estruturada
    if (bedrockResponse.locais && Array.isArray(bedrockResponse.locais)) {
      return this.convertAddressesToFacilities(bedrockResponse.locais);
    }
    
    // Se a resposta vem como texto, você pode fazer parsing aqui
    // (implementar conforme o formato que a IA retorna)
    
    this.logger.warn('⚠️ Formato de resposta do Bedrock não reconhecido');
    return [];
  }

  /**
   * Helpers
   */
  private generateId(name: string): string {
    return `facility-${name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
  }

  private normalizeTipo(tipo?: string): any {
    if (!tipo) return 'Centro Médico';
    
    const tipoLower = tipo.toLowerCase();
    
    if (tipoLower.includes('hospital')) return 'Hospital';
    if (tipoLower.includes('ubs') || tipoLower.includes('unidade básica')) return 'UBS';
    if (tipoLower.includes('pronto socorro') || tipoLower.includes('ps')) return 'Pronto Socorro';
    if (tipoLower.includes('upa') || tipoLower.includes('pronto atendimento')) return 'UPA';
    if (tipoLower.includes('clínica') || tipoLower.includes('clinica')) return 'Clínica';
    
    return 'Centro Médico';
  }

  private checkIfAcceptsEmergency(tipo?: string): boolean {
    if (!tipo) return false;
    const tipoLower = tipo.toLowerCase();
    return tipoLower.includes('hospital') || 
           tipoLower.includes('pronto socorro') || 
           tipoLower.includes('upa') ||
           tipoLower.includes('emergência');
  }

  private checkIfHasEmergencyRoom(tipo?: string): boolean {
    if (!tipo) return false;
    const tipoLower = tipo.toLowerCase();
    return tipoLower.includes('hospital') || 
           tipoLower.includes('pronto socorro');
  }
}

